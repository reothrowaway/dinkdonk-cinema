'use strict';

// Serves the standby screens on 127.0.0.1 and relays Destiny.gg's emote list
// and emote CSS, which cdn.destiny.gg only lets www.destiny.gg read.
// Chat itself comes from the DSA OBS overlay relay (127.0.0.1:18765).

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const dinkdonk = require('./dinkdonk');
const pollDraft = require('./poll-draft');
const { createMovieSuggest } = require('./movie-suggest');
const { createRoom } = require('./shared/room');
const { createSettings } = require('./shared/settings');

const HOST = '127.0.0.1';
const PORT = Number(process.env.STANDBY_PORT || 18770);
const ROOT = __dirname;
const CDN = 'https://cdn.destiny.gg';
const CACHE_MS = 10 * 60 * 1000;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
};

// ---------- which files the static server hands out ----------
// Never: the server's own code and data, and folders that stay on this PC (audits, backups, cloud-render state, the QA
// night's portable OBS with its settings). Checked on the file's real name on disk (case and Windows 8.3 short names:
// /STANDB~1.JS opened standby-server.js; audit 15 Nov 2026, F5/F8).
const ROOT_REAL = (() => { try { return fs.realpathSync.native(ROOT); } catch { return ROOT; } })();
const PRIVATE_FILES = new Set(['standby-server.js', 'dinkdonk.js', 'lan-proxy.js', 'poll-draft.js', 'movie-suggest.js', 'movie-test-list.js']);
const PRIVATE_DIRS = ['cache', 'audit', 'backup', 'backups', '.git', path.join('roxy3d', 'cloud'), path.join('roxy3d', 'qa-night')]
  .map((d) => path.join(ROOT_REAL, d).toLowerCase());
function servable(asked) {
  let real;
  try { real = fs.realpathSync.native(asked); } catch { return null; }   // missing: 404
  const lower = real.toLowerCase();
  if (!lower.startsWith(ROOT_REAL.toLowerCase() + path.sep)) return null;
  if (PRIVATE_FILES.has(path.basename(lower))) return null;
  if (PRIVATE_DIRS.some((d) => lower.startsWith(d + path.sep))) return null;
  if (path.relative(ROOT_REAL, real).toLowerCase().startsWith('backup-')) return null;   // backup-2026-11-05-…
  return real;
}

const cache = new Map(); // key -> { at, type, body }

async function cdnAsset(key) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit;

  const upstream = { 'emotes.json': '/emotes/emotes.json', 'emotes.css': '/emotes/emotes.css', 'flairs.json': '/flairs/flairs.json' }[key];
  try {
    const res = await fetch(CDN + upstream, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`cdn.destiny.gg answered ${res.status}`);
    let body = await res.text();
    if (key === 'emotes.css') {
      // Relative image URLs would point at this server; make them absolute.
      body = body.replace(/url\(\s*["']?(?!https?:|data:)([^"')]+)["']?\s*\)/g,
        (_, file) => `url("${CDN}/emotes/${file}")`);
    }
    const entry = { at: Date.now(), type: TYPES[path.extname(key)], body };
    cache.set(key, entry);
    return entry;
  } catch (error) {
    console.error(`Emote ${key}: ${error.message}`);
    if (hit) return hit; // stale is better than nothing
    throw error;
  }
}

// Single emote images, same-origin, so a page can read their pixels (spotting square "picture" emotes
// that don't work as a chatter's body). Only cdn.destiny.gg emote files; kept in memory once fetched.
const EMOTE_IMG = /^https:\/\/cdn\.destiny\.gg\/[0-9.]+\/emotes\/[A-Za-z0-9_-]+\.(png|gif|webp|avif)$/;
const emoteImgs = new Map(); // url -> Promise<{ type, body }>
function emoteImage(u) {
  if (!emoteImgs.has(u)) {
    const p = fetch(u, { signal: AbortSignal.timeout(15_000) }).then(async (r) => {
      if (!r.ok) throw new Error(`cdn.destiny.gg answered ${r.status}`);
      return { type: TYPES[path.extname(u)], body: Buffer.from(await r.arrayBuffer()) };
    });
    p.catch(() => emoteImgs.delete(u));
    emoteImgs.set(u, p);
  }
  return emoteImgs.get(u);
}

function send(res, status, type, body) {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

// Read-only qBittorrent Web UI, with localhost authentication bypass enabled by the owner.
// Share in-flight work across OBS sources; old seeds must not start tonight's film.
let qbCache = null;
let qbPending = null;
// when each torrent was last seen downloading: qBittorrent can keep an old completion_on (a torrent finished,
// stopped and resumed days later), so a finish we watched happen counts as recent whatever that date says
const qbSeenDownloading = new Map();
async function qbProgress() {
  if (qbCache && Date.now() - qbCache.at < 2000) return qbCache.value;
  if (qbPending) return qbPending;
  qbPending = (async () => {
    let value = { available: false };
    try {
      const base = (process.env.QB_URL || 'http://127.0.0.1:8080').replace(/\/+$/, '');
      const r = await fetch(`${base}/api/v2/torrents/info?sort=added_on&reverse=true`, {
        signal: AbortSignal.timeout(1500), redirect: 'error', headers: { Accept: 'application/json' },
      });
      if (!r.ok) throw new Error('Web UI unavailable');
      const list = await r.json();
      if (!Array.isArray(list)) throw new Error('Web UI needs login');
      const downloading = new Set(['downloading', 'forcedDL', 'stalledDL', 'metaDL', 'forcedMetaDL', 'queuedDL', 'checkingDL']);
      const finished = new Set(['uploading', 'stalledUP', 'forcedUP', 'queuedUP', 'pausedUP', 'stoppedUP']);
      const recent = Date.now() / 1000 - 15 * 60;
      for (const t of list) if (t?.hash && downloading.has(t.state)) qbSeenDownloading.set(t.hash, Date.now() / 1000);
      for (const [hash, at] of qbSeenDownloading) if (at < recent) qbSeenDownloading.delete(hash);
      const t = list.filter((t) => t && typeof t.name === 'string' && Number.isFinite(t.progress) &&
        (downloading.has(t.state) || (t.progress >= 1 && finished.has(t.state) &&
          (t.completion_on >= recent || qbSeenDownloading.has(t.hash)))))
        .sort((a, b) => (b.added_on || 0) - (a.added_on || 0))[0];
      if (t) {
        const completed = t.progress >= 1 && finished.has(t.state);
        value = { available: true, name: t.name, progress: Math.max(0, Math.min(1, t.progress)),
          eta_s: completed ? 0 : (Number.isFinite(t.eta) && t.eta >= 0 && t.eta < 8640000 ? t.eta : null),
          state: t.state, completed };
      }
    } catch { /* offline, timeout or login: the pre-show still runs */ }
    qbCache = { at: Date.now(), value };
    return value;
  })();
  try { return await qbPending; } finally { qbPending = null; }
}

// Video loops (the lobby's rain/neon light loop) need byte ranges: Chrome streams and loops media with them.
function sendVideo(req, res, file, type) {
  fs.stat(file, (error, st) => {
    if (error || !st.isFile() || st.size === 0) { send(res, 404, 'text/plain', 'Not found'); return; }
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    let start = 0;
    let end = st.size - 1;
    if (m) {
      start = m[1] ? Number(m[1]) : Math.max(0, st.size - Number(m[2]));
      end = m[1] && m[2] ? Math.min(Number(m[2]), st.size - 1) : st.size - 1;
      if (start > end || start >= st.size) {
        res.writeHead(416, { 'Content-Range': `bytes */${st.size}` });
        res.end();
        return;
      }
    }
    const head = { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, 'Cache-Control': 'no-cache' };
    if (m) head['Content-Range'] = `bytes ${start}-${end}/${st.size}`;
    res.writeHead(m ? 206 : 200, head);
    if (req.method === 'HEAD') { res.end(); return; }
    // the player cancels requests all the time (seeking, looping): close the file with the response
    const stream = fs.createReadStream(file, { start, end });
    stream.on('error', () => res.destroy());
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  });
}

// ---------- shared room (web/PLAN-shared-rooms.md, shared/room.js) ----------
// One persistent lobby and auditorium for every screen this server serves. It reads chat itself from the DSA relay,
// so the room keeps filling while no screen is open, and saves to cache/ (a test server on another port keeps its
// own file). STANDBY_ROOM=0 turns it off.
const ROOM_ON = process.env.STANDBY_ROOM !== '0';
const RELAY = process.env.DGG_RELAY || '127.0.0.1:18765';
let emoteNameSet = new Set();
async function refreshEmoteNames() {
  try {
    const list = JSON.parse((await cdnAsset('emotes.json')).body);
    const names = new Set(list.map((e) => e?.prefix).filter((p) => typeof p === 'string'));
    if (names.size) emoteNameSet = names;
  } catch { /* keep the last list */ }
}
// scene settings the panel changes live (shared/settings.js); the screens' URL options are the defaults
const settings = createSettings({
  file: path.join(ROOT, 'cache', PORT === 18770 ? 'ctl-settings.json' : `ctl-settings-${PORT}.json`),
  log: (m) => console.log(m),
});
const room = ROOM_ON ? createRoom({
  file: path.join(ROOT, 'cache', PORT === 18770 ? 'room-state.json' : `room-state-${PORT}.json`),
  // the seat list of the draft the page shows (auditorium.html DRAFT: 14 since 10 Nov 2026); the zip ships only that
  // draft's layout, so a fixed "13" left the packaged room without seats (11 Nov 2026). Newest layout there wins.
  layoutFile: ['14', '13'].map((d) => path.join(ROOT, 'roxy3d', 'qa11', `cinema_layout_${d}.json`)).find((f) => fs.existsSync(f)) || null,
  emoteNames: () => emoteNameSet,
  crowd: () => settings.get('lobby').crowd,   // the panel's lobby crowd setting (undefined: the room's own 14)
  log: (m) => console.log(m),
}) : null;
// chat movie suggestions -> the dinkdonk poll builder (movie-suggest.js, docs/movie-suggestions-plan.md); reads the
// same relay connection, only while the owner has suggestions open
const movieSuggest = createMovieSuggest({
  file: path.join(ROOT, 'cache', PORT === 18770 ? 'movie-suggest.json' : `movie-suggest-${PORT}.json`),
  historySearch: (t) => dinkdonk.search(String(t).slice(0, 60)).then((r) => r.entries || []),
  log: (m) => console.log(m),
});
function roomChat() {
  let retry = 0;
  const connect = () => {
    let ws;
    try { ws = new WebSocket(`ws://${RELAY}/__dgg_chat_ws`); } catch { setTimeout(connect, 5000); return; }
    let lastFrame = Date.now();
    const watch = setInterval(() => { if (ws.readyState === 1 && Date.now() - lastFrame > 180_000) ws.close(); }, 15_000);
    ws.onopen = () => { if (retry) console.log('Room: chat relay connected'); retry = 0; lastFrame = Date.now(); };
    ws.onmessage = (ev) => {
      lastFrame = Date.now();
      const frame = String(ev.data);
      if (room) try { room.chatFrame(frame); } catch (e) { console.error('Room:', e); }
      try { movieSuggest.chatFrame(frame); } catch (e) { console.error('Movie suggestions:', e); }
    };
    ws.onclose = () => { clearInterval(watch); setTimeout(connect, Math.min(30_000, 1000 * 2 ** retry++)); };
    ws.onerror = () => {};
  };
  connect();
}
if (room) {
  refreshEmoteNames();
  setInterval(refreshEmoteNames, CACHE_MS).unref();
}
roomChat();   // (also without the room: movie suggestions read chat from it)
// SIGHUP: the console window was closed (Windows allows a few seconds); SIGBREAK: Ctrl+Break. Before, both lost up to the
// last 3 s of room changes (audit 15 Nov 2026, F11)
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) process.on(sig, () => { room?.close(); movieSuggest.flush(); process.exit(0); });

// Control panel (control.html) <-> the screens: commands go to the selected scene as server-sent events;
// each screen posts its state (chatters, director) back so the panel can list them. 127.0.0.1 only.
const screens = new Map();          // open SSE response -> { page, id }; legacy connections are the lobby
const states = new Map();           // screen id -> { at, state }
function readJson(req, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const parts = [];
    req.on('data', (c) => { size += c.length; if (size > limit) { reject(new Error('too large')); req.destroy(); } else parts.push(c); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(parts).toString('utf8') || '{}')); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}
// Requests another website made from the owner's browser: a foreign Origin (fetch), or Sec-Fetch-Site cross-site /
// same-site, which Chromium (OBS's browser too) also sends for <img>/<script> requests that carry no Origin. Pages of
// this server send same-origin, a typed address none, other programs neither (audit 15 Nov 2026, F15/N2: an <img>
// pointing at /ctl/room?obs=1 could take the room lead, one at /dd/search made this server fetch dinkdonk.mov).
function fromOtherSite(req) {
  const origin = req.headers.origin;
  if (origin && origin !== `http://${HOST}:${PORT}` && origin !== `http://localhost:${PORT}`) return true;
  const site = req.headers['sec-fetch-site'];
  return !!site && site !== 'same-origin' && site !== 'none';
}
// SSE: a screen that stopped reading (half-open connection) would make the server buffer every event for it forever;
// over 1 MB waiting means it is gone, so it is dropped and reconnects if it is alive (audit 15 Nov 2026, F16)
function sseWrite(res, text) {
  if (res.destroyed) return false;
  if (res.writableLength > 1 << 20) { res.destroy(); return false; }
  res.write(text);
  return true;
}
async function controlRoute(req, res, pathname) {
  // only the panel and the screens themselves: other websites open in the browser must not drive the stream
  // (a JSON content type forces a CORS preflight, which this server never answers; foreign Origins are refused)
  if (fromOtherSite(req)) { send(res, 403, 'text/plain', 'Forbidden'); return true; }
  if (req.method === 'POST' && !/^application\/json\b/.test(req.headers['content-type'] || '')) { send(res, 415, 'text/plain', 'JSON only'); return true; }
  if (pathname === '/ctl/events' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store, no-transform', Connection: 'keep-alive' });
    res.write('retry: 3000\n\n');
    const params = new URL(req.url, `http://${HOST}:${PORT}`).searchParams;
    const page = params.get('page') === 'auditorium' ? 'auditorium' : 'lobby';
    screens.set(res, { page, id: params.get('id') || '' });
    res.write(`data: ${JSON.stringify(settings.message(page))}\n\n`);   // the panel's settings at once (pages ignore unknown cmds)
    const ping = setInterval(() => sseWrite(res, ': ping\n\n'), 20000);
    const gone = () => { clearInterval(ping); screens.delete(res); };
    req.on('close', gone);
    res.on('close', gone);
    return true;
  }
  if (pathname === '/ctl/cmd' && req.method === 'POST') {
    const cmd = await readJson(req);
    if (!cmd || typeof cmd.cmd !== 'string') { send(res, 400, TYPES['.json'], '{"error":"no cmd"}'); return true; }
    const page = cmd.page || 'lobby';   // old panels keep controlling every lobby screen
    if (!['lobby', 'auditorium'].includes(page)) { send(res, 400, TYPES['.json'], '{"error":"unknown page"}'); return true; }
    try { room?.command(cmd); } catch (e) { console.error('Room:', e); }
    // the lobby's roll-up poll screen: remembered here, so a reload or a second viewer sees it the same way
    if (cmd.cmd === 'pollscreen' && page === 'lobby') pollDraft.setScreen(!!cmd.on);
    if (cmd.cmd === 'who' || cmd.cmd === 'kicked' || cmd.cmd === 'left') { send(res, 200, TYPES['.json'], '{"screens":0}'); return true; }   // room only
    // a scene setting: remembered here, and every screen of the scene gets all of that scene's settings
    const out = settings.command({ ...cmd, page }) ? { ...settings.message(page), ...(cmd.id ? { id: cmd.id } : {}) } : cmd;
    const line = `data: ${JSON.stringify(out)}\n\n`;
    let count = 0;
    for (const [s, target] of screens) {
      if (target.page !== page || (cmd.id && cmd.id !== target.id)) continue;
      if (sseWrite(s, line)) count++;
    }
    send(res, 200, TYPES['.json'], JSON.stringify({ screens: count }));
    return true;
  }
  if (pathname === '/ctl/state' && req.method === 'POST') {
    const st = await readJson(req, 256 * 1024);
    if (st && typeof st.id === 'string') states.set(st.id.slice(0, 16), { at: Date.now(), state: st });
    if (st && typeof st.id === 'string') try { room?.screenState(st); } catch (e) { console.error('Room:', e); }
    // closed screens drop out here too: with the panel closed, every scene reload left an entry (up to 256 KB)
    for (const [id, s] of states) if (Date.now() - s.at > 10000) states.delete(id);
    send(res, 204, 'text/plain', '');
    return true;
  }
  // shared room: a room-mode screen's event stream, and the room's summary for the panel
  if (pathname === '/ctl/room' && req.method === 'GET' && room) {
    const params = new URL(req.url, `http://${HOST}:${PORT}`).searchParams;
    const page = params.get('page') === 'auditorium' ? 'auditorium' : 'lobby';
    const id = (params.get('id') || '').slice(0, 16) || Math.random().toString(36).slice(2, 10);
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store, no-transform', Connection: 'keep-alive' });
    res.write('retry: 3000\n\n');
    const who = params.has('who') ? params.get('who').replace(/[^A-Za-z0-9_]/g, '').slice(0, 25) || null : undefined;
    const off = room.subscribe(page, id, (line) => sseWrite(res, `data: ${line}\n\n`), { obs: params.get('obs') === '1', who, caps: String(params.get('caps') || '').split(',').filter((c) => /^[a-z]{1,12}$/.test(c)).slice(0, 8) });
    const ping = setInterval(() => sseWrite(res, ': ping\n\n'), 20000);
    let closed = false;
    const gone = () => { if (closed) return; closed = true; clearInterval(ping); off(); };
    req.on('close', gone);
    res.on('close', gone);
    return true;
  }
  // read-only roster (no subscription, no screen counted): the lobby's fly-through needs who sits where in the auditorium
  if (pathname === '/ctl/room-roster' && req.method === 'GET' && room) {
    const page = new URL(req.url, `http://${HOST}:${PORT}`).searchParams.get('page') === 'auditorium' ? 'auditorium' : 'lobby';
    send(res, 200, TYPES['.json'], JSON.stringify(room.snapshot(page)));
    return true;
  }
  if (pathname === '/ctl/settings' && req.method === 'GET') {
    send(res, 200, TYPES['.json'], JSON.stringify({ schema: settings.schema, values: settings.all() }));
    return true;
  }
  if (pathname === '/ctl/room-state' && req.method === 'GET') {
    send(res, room ? 200 : 404, TYPES['.json'], JSON.stringify(room ? room.summary() : { error: 'room off' }));
    return true;
  }
  if (pathname === '/ctl/state' && req.method === 'GET') {
    for (const [id, s] of states) if (Date.now() - s.at > 10000) states.delete(id);   // closed screens drop out
    send(res, 200, TYPES['.json'], JSON.stringify({ controlVersion: 2,
      screens: [...states.values()].map((s) => ({ ...s.state, page: s.state.page || 'lobby' })) }));
    return true;
  }
  return false;
}

// Votes and the result of our poll once it is open: its public results page, read at most every 20 s while a lobby
// screen asks (/dd/draft.json), plus the winners once it is among dinkdonk.mov's finished polls. Stops when final.
let pollResultsAt = 0;
let pollResultsBusy = null;
function checkPollResults() {
  const d = pollDraft.get();
  if (!d?.pollId || d.state === 'building' || pollResultsBusy || Date.now() - pollResultsAt < 20000) return;
  if (d.state === 'closed' && d.results?.winners?.length) return;   // final
  pollResultsAt = Date.now();
  pollResultsBusy = (async () => {
    const detail = await dinkdonk.pollResults(d.pollId).catch(() => null);
    let card = null;
    try { card = ((await dinkdonk.data()).polls || []).find((p) => p.id === d.pollId) || null; } catch { /* site unreachable */ }
    if (detail || card) pollDraft.setResults(d.pollId, detail, card ? card.winners : undefined);
  })().catch((e) => console.error('Poll results:', e.message)).finally(() => { pollResultsBusy = null; });
}

// DNS rebinding (audit 15 Nov 2026, F15): a web page whose own name was pointed at 127.0.0.1 would reach this server as its
// own origin, past every Origin check; it still sends its own name as Host, so only our own names are answered. (The LAN
// proxy rewrites Host to 127.0.0.1:PORT.)
const OWN_HOSTS = new Set([`${HOST}:${PORT}`, `localhost:${PORT}`]);
const server = http.createServer(async (req, res) => {
  try {
    if (!OWN_HOSTS.has(String(req.headers.host || '').toLowerCase())) { send(res, 421, 'text/plain', 'Unknown host name'); return; }
    const url = new URL(req.url || '/', `http://${HOST}:${PORT}`);
    if (url.pathname.startsWith('/ctl/') && await controlRoute(req, res, url.pathname)) return;
    // the DinkDonk poll being built: sent by the poll builder's userscript (userscripts/dinkdonk-poll-draft.user.js).
    // JSON + a custom header, so an ordinary web page can't post here (that needs a CORS preflight, never answered)
    if (url.pathname === '/dd/draft' && req.method === 'POST') {
      if (!/^application\/json\b/.test(req.headers['content-type'] || '') || req.headers['x-dd-draft'] !== '1') {
        send(res, 403, 'text/plain', 'Forbidden');
        return;
      }
      const draft = pollDraft.set(await readJson(req));
      if (draft?.state === 'building') movieSuggest.syncBuilder(draft.options);   // films the owner took out
      send(res, 200, TYPES['.json'], JSON.stringify({ draft }));
      return;
    }
    // movie suggestions: the dinkdonk tab's userscript (same header rule as /dd/draft) ...
    if (url.pathname === '/ms/work' || url.pathname === '/ms/lookup' || url.pathname === '/ms/added' || url.pathname === '/ms/removed') {
      if (req.headers['x-dd-draft'] !== '1' || (req.method === 'POST' && !/^application\/json\b/.test(req.headers['content-type'] || ''))) {
        send(res, 403, 'text/plain', 'Forbidden');
        return;
      }
      let out;
      if (url.pathname === '/ms/work' && req.method === 'GET') out = movieSuggest.work();
      else if (url.pathname === '/ms/lookup' && req.method === 'POST') out = await movieSuggest.lookupResult(await readJson(req));
      else if (url.pathname === '/ms/added' && req.method === 'POST') out = movieSuggest.added(await readJson(req));
      else if (url.pathname === '/ms/removed' && req.method === 'POST') out = movieSuggest.unadded(await readJson(req));
      else { send(res, 405, 'text/plain', 'Method not allowed'); return; }
      send(res, 200, TYPES['.json'], JSON.stringify(out));
      return;
    }
    // ... and the control panel (same-origin JSON only, like /ctl/cmd)
    if (url.pathname === '/ms/cmd' && req.method === 'POST') {
      const origin = req.headers.origin;
      if ((origin && origin !== `http://${HOST}:${PORT}` && origin !== `http://localhost:${PORT}`) || !/^application\/json\b/.test(req.headers['content-type'] || '')) {
        send(res, 403, 'text/plain', 'Forbidden');
        return;
      }
      const out = movieSuggest.command(await readJson(req));
      send(res, out.ok ? 200 : 400, TYPES['.json'], JSON.stringify(out));
      return;
    }
    if (url.pathname === '/ms/state.json' && (req.method === 'GET' || req.method === 'HEAD')) {
      send(res, 200, TYPES['.json'], JSON.stringify(url.searchParams.get('lite') === '1' ? movieSuggest.lite() : movieSuggest.snapshot()));
      return;
    }
    if (url.pathname === '/dd/poll-script.user.js' && req.method === 'GET') {   // the control panel's Install your poll script
      fs.readFile(path.join(ROOT, 'userscripts', 'dinkdonk-poll-draft.user.js'), (error, body) => {
        if (error) send(res, 404, 'text/plain', 'Not found'); else send(res, 200, 'text/javascript; charset=utf-8', body);
      });
      return;
    }
    if (url.pathname === '/dd/draft.json' && (req.method === 'GET' || req.method === 'HEAD')) {
      checkPollResults();
      send(res, 200, TYPES['.json'], JSON.stringify({ draft: pollDraft.get(), screen: pollDraft.getScreen() }));
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      send(res, 405, 'text/plain', 'Method not allowed');
      return;
    }

    if (url.pathname === '/qb/progress') {
      send(res, 200, TYPES['.json'], JSON.stringify(await qbProgress()));
      return;
    }

    if (url.pathname === '/dgg/emote-img') {
      const u = url.searchParams.get('u') || '';
      if (!EMOTE_IMG.test(u)) { send(res, 400, 'text/plain', 'Not an emote image'); return; }
      const img = await emoteImage(u);
      send(res, 200, img.type, img.body);
      return;
    }
    if (url.pathname === '/dgg/emotes.json' || url.pathname === '/dgg/emotes.css' || url.pathname === '/dgg/flairs.json') {
      const asset = await cdnAsset(path.basename(url.pathname));
      send(res, 200, asset.type, asset.body);
      return;
    }

    if (url.pathname === '/dd/data.json') {
      send(res, 200, TYPES['.json'], JSON.stringify(await dinkdonk.data()));
      return;
    }
    if (url.pathname === '/dd/search') {
      if (fromOtherSite(req)) { send(res, 403, 'text/plain', 'Forbidden'); return; }   // (N2)
      const q = (url.searchParams.get('q') || '').trim().slice(0, 60);
      if (q.length < 2) { send(res, 400, TYPES['.json'], '{"error":"query too short"}'); return; }
      send(res, 200, TYPES['.json'], JSON.stringify(await dinkdonk.search(q)));
      return;
    }

    const rel = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const asked = path.resolve(ROOT, rel);
    const file = asked.startsWith(ROOT + path.sep) ? servable(asked) : null;
    const type = file && TYPES[path.extname(file).toLowerCase()];
    if (!file || !type) {
      send(res, 404, 'text/plain', 'Not found');
      return;
    }
    if (type.startsWith('video/')) { sendVideo(req, res, file, type); return; }
    fs.readFile(file, (error, body) => {
      if (error) send(res, 404, 'text/plain', 'Not found');
      else send(res, 200, type, body);
    });
  } catch (error) {
    send(res, 502, 'text/plain', error.message);
  }
});

server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE'
    ? `Port ${PORT} is already in use. Close the other standby server or set STANDBY_PORT.`
    : error);
  process.exitCode = 1;
});

server.listen(PORT, HOST, () => {
  console.log('Standby screens are running.');
  console.log(`Gallery:        http://${HOST}:${PORT}/`);
  console.log(`Browser Source: http://${HOST}:${PORT}/dinkdonk.html  (drafts: 01..05)`);
  console.log('Chat comes from the DSA overlay relay - keep that window open too.');
});
