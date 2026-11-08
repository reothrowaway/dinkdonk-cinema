'use strict';

const { execFile } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');
const { promisify } = require('node:util');
const { sendVideo } = require('./video-response');

const run = promisify(execFile);
const videoTypes = { '.mp4': 'video/mp4', '.webm': 'video/webm' };
const videoType = (name) => videoTypes[path.extname(name).toLowerCase()];
const html = 'text/html; charset=utf-8';
const json = 'application/json; charset=utf-8';

function reply(req, res, code, type, body) {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(req.method === 'HEAD' ? undefined : body);
}

async function files(folder) {
  try {
    return (await fs.readdir(folder, { withFileTypes: true }))
      .filter(item => item.isFile() && videoType(item.name))
      .map(item => item.name).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return [];
    throw error;
  }
}

async function probeDuration(file) {
  const { stdout } = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1', file], { timeout: 2000, windowsHide: true });
  const seconds = Number(stdout.trim());
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

async function readCommand(req) {
  if (!/^application\/json\b/i.test(req.headers['content-type'] || '')) return null;
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 4096) return null;
  }
  try { return JSON.parse(body); } catch { return null; }
}

function createPreshowMedia({ port, select, isReady, readDuration = probeDuration }) {
  const config = process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'DinkDonkCinema', 'preshow-library.txt');
  const library = (async () => process.env.CINEMA_PRESHOW_ROOT || (config && (await fs.readFile(config, 'utf8').catch(() => '')).trim()) || '')();
  const durationCache = new Map();
  let state = { mode: 'stop', revision: 0 };

  async function trailerDuration(folder, name) {
    const file = path.join(folder, name);
    const stat = await fs.stat(file).catch(() => null);
    if (!stat) return null;
    const key = [stat.size, stat.mtimeMs, stat.ctimeMs].join(':');
    const cached = durationCache.get(name);
    if (cached?.key === key) return cached.duration;
    // Cache the pending probe too so multiple panels share the same work.
    const duration = readDuration(file).catch(() => null);
    durationCache.set(name, { key, duration });
    return duration;
  }

  function set(mode, fields = {}) {
    state = { mode, revision: state.revision + 1, ...fields };
  }

  function syncSelection(selected) {
    if (selected && state.mode === 'stop') set('shuffle');
    else if (!selected && state.mode !== 'stop') set('stop');
  }

  async function route(req, res) {
    const address = (req.socket.remoteAddress || '').replace(/^::ffff:/, '');
    const host = req.headers.host;
    const local = (address === '127.0.0.1' || address === '::1') && [`127.0.0.1:${port}`, `localhost:${port}`].includes(host);
    const out = (code, body) => reply(req, res, code, json, JSON.stringify(body));
    if (!local || (req.headers.origin && req.headers.origin !== `http://${host}`)) return out(403, { error: 'Local cinema controls only.' });
    const route = new URL(req.url, `http://${host}`).pathname;
    const root = await library;
    if (req.method === 'POST' && route === '/preshow/state') {
      const command = await readCommand(req);
      if (!['shuffle', 'trailer', 'stop'].includes(command?.mode)) return out(400, { error: 'Choose commercials, a trailer, or stop.' });
      const { mode, name } = command;
      if (!root) return out(503, { error: 'Set the local pre-show library first.' });
      if (mode === 'trailer' && !(await files(path.join(root, 'trailers'))).includes(name)) return out(404, { error: 'That trailer is no longer in the folder.' });
      if (mode === 'shuffle' && !(await files(path.join(root, 'videos'))).length) return out(404, { error: 'No commercials in the videos folder.' });
      if (!select(mode !== 'stop')) return out(503, { error: 'Retro Commercials is unavailable. Check OBS and the bridge.' });
      set(mode, mode === 'trailer' ? { name } : {});
      return out(200, state);
    }
    if (req.method === 'POST' && route === '/preshow/finished') {
      const event = await readCommand(req);
      if (state.mode === 'trailer' && event?.revision === state.revision) {
        select(false);
        set('stop', { notice: event.failed ? 'Trailer could not play.' : 'Trailer finished.' });
      }
      return out(200, state);
    }
    if (!['GET', 'HEAD'].includes(req.method)) return out(405, { error: 'Method not allowed.' });
    if (route === '/preshow/control') {
      return reply(req, res, 200, html, await fs.readFile(path.join(__dirname, 'preshow-control.html')));
    }
    if (route === '/preshow/state') return out(200, state);
    if (route === '/preshow/library') {
      const [commercials, trailers] = root ? await Promise.all(['videos', 'trailers'].map(name => files(path.join(root, name)))) : [[], []];
      for (const name of durationCache.keys()) if (!trailers.includes(name)) durationCache.delete(name);
      const folder = path.join(root, 'trailers');
      const durations = await Promise.all(trailers.map(async name => [name, await trailerDuration(folder, name)]));
      const trailerDurations = Object.fromEntries(durations.filter(([, seconds]) => seconds !== null));
      return out(200, { ...state, configured: !!root, ready: isReady(), commercialCount: commercials.length, trailers, trailerDurations });
    }
    if (!root) return out(404, { error: 'No local pre-show library configured.' });
    if (route === '/preshow/player') {
      return reply(req, res, 200, html, await fs.readFile(path.join(root, 'player.html')));
    }
    if (route === '/preshow/playlist.js') {
      const clips = await files(path.join(root, 'videos'));
      return reply(req, res, 200, 'text/javascript; charset=utf-8', `window.commercialFiles = ${JSON.stringify(clips)};`);
    }
    const clip = /^\/preshow\/(videos|trailers)\/([^/]+)$/.exec(route);
    if (clip) {
      const name = decodeURIComponent(clip[2]);
      const folder = path.join(root, clip[1]);
      if (videoType(name) && (await files(folder)).includes(name)) return sendVideo(req, res, path.join(folder, name), videoType(name));
    }
    return out(404, { error: 'Not found.' });
  }

  return { route, syncSelection };
}

module.exports = { createPreshowMedia };
