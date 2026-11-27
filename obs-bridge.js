'use strict';

// OBS bridge for the auditorium's film screen. The auditorium page inside OBS (Browser 3) sends where the screen is
// on every camera move; this pins the VLC capture ("Film screen (src)") onto it through obs-websocket and shows it
// only while the phase is Film. The other things it does, both on the lobby's request during the fly-through: at the
// start (POST /warm-cinema) it puts the auditorium source off-canvas into the lobby scene so OBS loads it (see
// warmCinema; removed again after the cut), at the end (POST /cut-to-cinema) it cuts the program to the cinema scene
// (see cutToCinema). The look director separately manages the cinema shader on this server's browser sources.
//
// Page -> bridge (WebSocket on PORT, text frames of JSON):
//   { film: true|false, w: <viewport px>, h: <viewport px>, quad: [[x,y] TL, TR, BR, BL] }   (viewport px)
// Bridge -> page: { obs: true|false } whenever OBS becomes ready / goes away (the page keeps the screen green
//   when false, so a missing bridge never leaves a black screen with no film).
//   { glow: [r, g, b] } about twice a second while the film is up: its average colour, for the screen glow (queue 58).
// The OBS password is read from obs-websocket's own config on this PC; it never goes to the page.
// Usage: node obs-bridge.js   (env: OBS_BRIDGE_PORT=18790, OBS_WS=ws://127.0.0.1:4455, OBS_PASSWORD to override)
//
// Brief 102 (15 Nov 2026): the auditorium's screen shots T1 / T2 / T3 (shared/aud-shots.js).
//   - Keyed setup: when the auditorium's browser source in SCENE has a colour key filter, the page is told
//     { obs: true, keyed: true } and keeps its screen exact #00ff00. The bridge keeps "Film screen (src)" OVER the
//     browser source as before, and moves it UNDER it while a shot plays ({ shot: 'layer-under' | 'layer-over' }), so
//     the key shows the film through the green and the seat backs and heads in front of the screen stay in front of it.
//   - During a shot the page sends the usual { film, w, h, quad } once per video frame it shows (the rendered screen
//     corners), latest-only as always.
//   - Page -> bridge { shot: 'cut-film' | 'warm' | 'cut-cinema' | 'layer-under' | 'layer-over', rid }: cut to FILM_SCENE (the fullscreen film) at T1's
//     last frame; before T2 the warm-up (the auditorium source off-canvas in the program scene) and the cut back to
//     SCENE. Each cut uses the Cut transition and restores the usual one 1.5 s later, as /cut-to-cinema does.
//     Answer: { rid, ok, ...result | error }. Also POST /cut-to-film for a manual test.
//   env OBS_FILM_SCENE (default "Film fullscreen").

const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const zlib = require('node:zlib');
const CinemaLookDirector = require('./shared/obs-look-director.js');

const PORT = Number(process.env.OBS_BRIDGE_PORT || 18790);
const OBS_URL = process.env.OBS_WS || 'ws://127.0.0.1:4455';
const SCENE = 'DinkDonk Cinema';
const FILM = 'Film screen (src)';
const FILM_SCENE = process.env.OBS_FILM_SCENE || 'Film fullscreen';   // Brief 102: the fullscreen film scene
const FILTER = 'Corner pin (live)';
const SHADER = 'C:/Program Files/obs-studio/data/obs-plugins/obs-shaderfilter/examples/corner-pin.shader';
const OBS_CONFIG = path.join(process.env.APPDATA || '', 'obs-studio', 'plugin_config', 'obs-websocket', 'config.json');
const log = (...a) => console.log(new Date().toTimeString().slice(0, 8), ...a);

// ---------- OBS side (obs-websocket v5) ----------
const obs = { ws: null, ready: false, keyed: false, itemId: null, pending: new Map(), seq: 0, setupAt: 0 };
const cinemaPort = Number(process.env.STANDBY_PORT || 18770);
let lastLookError = '', lastLookErrorAt = 0;
const lookDirector = CinemaLookDirector.create({
  request,
  seed: 'local:' + cinemaPort,
  matchSource: url => CinemaLookDirector.localRoom(url, cinemaPort, ownAddresses()),
  async readSettings() {
    const response = await fetch('http://127.0.0.1:' + cinemaPort + '/ctl/settings', { signal: AbortSignal.timeout(3000) });
    if (!response.ok) throw Error('room settings HTTP ' + response.status);
    return (await response.json()).values;
  },
  readShader: () => fs.promises.readFile(path.join(__dirname, 'concepts/vaporwave/cinema-looks.shader'), 'utf8'),
  onError(error) {
    if (lastLookError !== error.message || Date.now() - lastLookErrorAt > 60000) {
      lastLookError = error.message; lastLookErrorAt = Date.now(); log('cinema looks:', error.message);
    }
  },
});

function obsPassword() {
  if (process.env.OBS_PASSWORD) return process.env.OBS_PASSWORD;
  try { return JSON.parse(fs.readFileSync(OBS_CONFIG, 'utf8')).server_password || ''; } catch { return ''; }
}
const sha256b64 = (s) => crypto.createHash('sha256').update(s).digest('base64');

function obsConnect() {
  let ws;
  try { ws = new WebSocket(OBS_URL, 'obswebsocket.json'); } catch (e) { log('OBS:', e.message); return setTimeout(obsConnect, 3000); }
  obs.ws = ws;
  ws.onmessage = (ev) => {
    let m;
    try { m = JSON.parse(ev.data); } catch { log('OBS sent a message that is not JSON: ignored'); return; }   // (audit 15 Nov 2026, F13)
    if (m.op === 0) {   // Hello
      const a = m.d.authentication;
      const identify = { rpcVersion: 1, eventSubscriptions: 2 };   // Config: scene collection switches
      if (a) identify.authentication = sha256b64(sha256b64(obsPassword() + a.salt) + a.challenge);
      ws.send(JSON.stringify({ op: 1, d: identify }));
    } else if (m.op === 2) {   // Identified
      log('OBS connected');
      setup();
      lookDirector.start();
    } else if (m.op === 5 && m.d.eventType === 'CurrentSceneCollectionChanged') {
      setReady(false);
      lookDirector.stop();
      setup();
      lookDirector.start();
    } else if (m.op === 7) {   // RequestResponse
      const p = obs.pending.get(m.d.requestId);
      if (!p) return;
      obs.pending.delete(m.d.requestId);
      if (m.d.requestStatus.result) p.resolve(m.d.responseData || {});
      else p.reject(new Error(`${m.d.requestType}: ${m.d.requestStatus.comment || m.d.requestStatus.code}`));
    }
  };
  ws.onclose = (ev) => {
    if (obs.ws !== ws) return;
    // 4009 = wrong password: say so instead of retrying silently forever
    log(ev.code === 4009 ? 'OBS refused the password (Tools > WebSocket Server Settings)' : `OBS not reachable at ${OBS_URL}, retrying`);
    obs.ws = null;
    lookDirector.stop();
    setReady(false);
    for (const p of obs.pending.values()) p.reject(new Error('OBS closed'));
    obs.pending.clear();
    setTimeout(obsConnect, 3000);
  };
  ws.onerror = () => {};
}

// (audit 15 Nov 2026, F13) a request OBS never answers fails after 10 s instead of holding its caller (and pump()) for good
const OBS_TIMEOUT_MS = 10000;
function request(requestType, requestData = {}) {
  return new Promise((resolve, reject) => {
    if (!obs.ws || obs.ws.readyState !== WebSocket.OPEN) return reject(new Error('OBS not connected'));
    const requestId = String(++obs.seq);
    const timer = setTimeout(() => {
      if (obs.pending.delete(requestId)) reject(new Error(`${requestType}: no answer from OBS in ${OBS_TIMEOUT_MS / 1000} s`));
    }, OBS_TIMEOUT_MS);
    const done = (fn) => (v) => { clearTimeout(timer); fn(v); };
    obs.pending.set(requestId, { resolve: done(resolve), reject: done(reject) });
    obs.ws.send(JSON.stringify({ op: 6, d: { requestType, requestId, requestData } }));
  });
}

// Find the film item and make sure the live corner-pin filter exists (created once; the two fixed pins stay as
// a manual fallback but are switched off while the bridge drives the screen).
async function setup() {
  obs.setupAt = Date.now();
  try {
    const { sceneItemId } = await request('GetSceneItemId', { sceneName: SCENE, sourceName: FILM });
    const { filters } = await request('GetSourceFilterList', { sourceName: FILM });
    if (!filters.some((f) => f.filterName === FILTER)) {
      await request('CreateSourceFilter', { sourceName: FILM, filterName: FILTER, filterKind: 'shader_filter',
        filterSettings: { from_file: true, shader_file_name: SHADER, Antialias_Edges: true } });
      log(`created filter "${FILTER}" on "${FILM}"`);
    }
    for (const f of filters) {
      if (f.filterName !== FILTER && f.filterEnabled && /corner pin/i.test(f.filterName)) {
        await request('SetSourceFilterEnabled', { sourceName: FILM, filterName: f.filterName, filterEnabled: false });
      }
    }
    await request('SetSourceFilterEnabled', { sourceName: FILM, filterName: FILTER, filterEnabled: true });
    obs.itemId = sceneItemId;
    obs.keyed = await keyedSetup().catch(() => false);
    if (obs.keyed) await setLayer(false).catch((e) => log(`film over the auditorium failed: ${e.message}`));
    await cleanupLeftovers().catch((e) => log(`leftover check failed: ${e.message}`));
    sent.quad = null;
    sent.film = null;
    setReady(true);
    for (const c of pages) wsSend(c, { obs: true, keyed: obs.keyed });
    log(`ready: "${FILM}" is item ${sceneItemId} in "${SCENE}"${obs.keyed ? ' (keyed: the auditorium keys out #00ff00; the film goes under it for the screen shots)' : ''}`);
    pump();
  } catch (e) {
    log(`not ready (${e.message}); is the "Moobies 1440p poll" collection loaded?`);
  }
}

function setReady(on) {
  if (obs.ready === on) return;
  obs.ready = on;
  for (const c of pages) wsSend(c, { obs: on, keyed: on && obs.keyed });
}
// Brief 102: the auditorium's browser source in SCENE has an enabled colour key, and the film item is in SCENE too
async function keyedSetup() {
  const items = (await request('GetSceneItemList', { sceneName: SCENE })).sceneItems || [];
  const film = items.find((i) => i.sourceName === FILM), aud = items.find((i) => i.inputKind === 'browser_source');
  if (!film || !aud) return false;
  const { filters } = await request('GetSourceFilterList', { sourceName: aud.sourceName });
  return filters.some((f) => f.filterEnabled && /color_key|chroma_key/.test(f.filterKind));
}
// Keyed setup: the film sits UNDER the auditorium while a screen shot plays (the page keys it in, seat backs and heads
// stay in front of it) and OVER it the rest of the time, as before. Over, the corner-pinned film covers the screen's
// rim; under, the page's own live screen left a 1 px half-green line along that rim that no small key takes (Chrome
// resamples the zoomed room; QA 15 Nov, portable OBS). The shots' canvas despills its rim, so under is clean there.
// Moving the film to the browser source's index puts it just above or just below it.
async function setLayer(under) {
  const items = (await request('GetSceneItemList', { sceneName: SCENE })).sceneItems || [];
  const film = items.find((i) => i.sourceName === FILM), aud = items.find((i) => i.inputKind === 'browser_source');
  if (!film || !aud) return { skipped: 'film or auditorium item missing' };
  const isUnder = film.sceneItemIndex < aud.sceneItemIndex;
  if (isUnder !== under) await request('SetSceneItemIndex', { sceneName: SCENE, sceneItemId: film.sceneItemId, sceneItemIndex: aud.sceneItemIndex });
  return { film: under ? 'under the auditorium' : 'over the auditorium', moved: isUnder !== under };
}
// One hard cut to a scene: the transition is a Cut for this one switch and is put back 1.5 s later. A second cut inside
// those 1.5 s (a double Fly, audit 15 Nov 2026, F1) read our own "Cut" as the current transition and put Cut back for
// good; the real one is now kept in cutBack until it has been restored. A failed switch still puts it back.
let cutBack = null, cutBackTimer = 0, cutAfter = [];
async function transitionToRestore() {
  return cutBack || (await request('GetCurrentSceneTransition')).transitionName;
}
async function hardCut(sceneName, after) {
  const back = await transitionToRestore();
  cutBack = back;
  if (after) cutAfter.push(after);
  try {
    try { await request('SetCurrentSceneTransition', { transitionName: 'Cut' }); } catch (e) { log(`no Cut transition (${e.message}): using ${back}`); }
    await request('SetCurrentProgramScene', { sceneName });
  } finally {
    clearTimeout(cutBackTimer);
    cutBackTimer = setTimeout(async () => {
      const to = cutBack, fns = cutAfter;
      cutBack = null;
      cutAfter = [];
      try { await request('SetCurrentSceneTransition', { transitionName: to }); } catch (e) { log(`restore after the cut failed: ${e.message}`); }
      for (const fn of fns) { try { await fn(); } catch (e) { log(`after the cut: ${e.message}`); } }
    }, 1500);
  }
}
// T1's end (Brief 102): one hard cut to the fullscreen film scene; T1's last frame shows the film filling the frame
async function cutToFilm(dry) {
  const plan = { scene: FILM_SCENE, transition: await transitionToRestore() };
  if (dry) return { dry: true, ...plan };
  await hardCut(FILM_SCENE);
  return plan;
}
// page -> bridge shot requests (driver page only), answered on the same socket
async function onShot(socket, m) {
  const reply = (o) => wsSend(socket, { rid: String(m.rid || ''), ...o });
  if (!obs.ready) return reply({ ok: false, error: 'OBS not ready' });
  try {
    const r = m.shot === 'cut-film' ? await cutToFilm(!!m.dry) : m.shot === 'warm' ? await warmCinema() : m.shot === 'cut-cinema' ? await cutToCinema(!!m.dry)
      : m.shot === 'layer-under' || m.shot === 'layer-over' ? (obs.keyed ? await setLayer(m.shot === 'layer-under') : { skipped: 'not keyed' }) : null;
    if (!r) return reply({ ok: false, error: `unknown shot request ${m.shot}` });
    log(`shot ${m.shot}: ${JSON.stringify(r)}`);
    reply({ ok: true, ...r });
  } catch (e) {
    log(`shot ${m.shot} failed: ${e.message}`);
    reply({ ok: false, error: e.message });
  }
}

// ---------- page side: a minimal WebSocket server (text frames only) ----------
const pages = new Set();
let driver = null;   // the page whose corners we follow: the latest one to connect
const want = { film: false, quad: null };
const sent = { film: null, quad: null };
let busy = false;

const ownAddresses = () => new Set(['127.0.0.1', '::1', ...Object.values(os.networkInterfaces()).flat().map((i) => i.address)]);

// Lobby fly-through -> cinema (lobby page, POST /cut-to-cinema, body {dry?}): one hard cut to SCENE on the flight's last
// frame, where the lobby shows the auditorium's own picture: the transition is a Cut for this one switch and is put
// back right after. The auditorium source's settings are never touched here: changing any browser-source setting makes
// OBS reload the page (seen in the 7 Nov real-OBS test: black at the cut). Its "Refresh browser when scene becomes
// active" must be off for a seamless cut; if it is on, the cut still happens and the log says so.
// {dry: true} only reads what it would do.
async function cutToCinema(dry) {
  const items = (await request('GetSceneItemList', { sceneName: SCENE })).sceneItems || [];
  const aud = items.find((i) => i.inputKind === 'browser_source');
  const transitionName = await transitionToRestore();
  const prev = aud ? (await request('GetInputSettings', { inputName: aud.sourceName })).inputSettings || {} : {};
  const refreshOn = !!prev.restart_when_active;
  const plan = { scene: SCENE, auditorium: aud?.sourceName || null, transition: transitionName, refreshOn };
  if (dry) return { dry: true, ...plan };
  if (refreshOn) log(`warning: "${aud.sourceName}" has "Refresh browser when scene becomes active" on: it reloads at the cut`);
  await hardCut(SCENE, () => unwarm('after the cut'));
  return plan;
}

// Queue 55: OBS only loads a browser source once its scene is shown, so the evening's first fly-through cut landed on
// an auditorium still loading (8 Nov: it connected 15 s after the cut). At the flight's start the lobby asks for this:
// the auditorium source goes into the program (lobby) scene, outside the canvas, which counts as shown, so it loads
// during the ~50 s flight. The item is removed after the cut (or after 2 min): no lasting scene change, no extra GPU.
let warm = null;
let warmTimer = 0;
// (audit 15 Nov 2026, F1) warm is set only after a few awaited requests: a second request in that gap (a double Fly)
// added the auditorium twice, and the first copy stayed off-canvas in the lobby scene. A request during the set-up now
// shares the first one's answer.
let warming = null;
function warmCinema() {
  if (!warming) warming = warmCinemaNow().finally(() => { warming = null; });
  return warming;
}
async function warmCinemaNow() {
  if (warm) return { already: true };
  const items = (await request('GetSceneItemList', { sceneName: SCENE })).sceneItems || [];
  const aud = items.find((i) => i.inputKind === 'browser_source');
  if (!aud) return { skipped: `no browser source in "${SCENE}"` };
  const prog = await request('GetCurrentProgramScene');
  const scene = prog.currentProgramSceneName || prog.sceneName;
  if (!scene || scene === SCENE) return { skipped: 'the cinema scene is already on' };
  const active = await request('GetSourceActive', { sourceName: aud.sourceName }).catch(() => ({}));
  if (active.videoActive) return { skipped: 'the auditorium is already shown' };
  const { baseWidth = 1920 } = await request('GetVideoSettings');
  // added hidden, moved off the canvas, then shown: it never flashes over the lobby
  const { sceneItemId } = await request('CreateSceneItem', { sceneName: scene, sourceName: aud.sourceName, sceneItemEnabled: false });
  warm = { scene, sceneItemId, source: aud.sourceName };
  try {
    await request('SetSceneItemTransform', { sceneName: scene, sceneItemId, sceneItemTransform: { positionX: baseWidth + 400, positionY: 0 } });
    await request('SetSceneItemEnabled', { sceneName: scene, sceneItemId, sceneItemEnabled: true });
  } catch (e) { await unwarm('setup failed'); throw e; }
  clearTimeout(warmTimer);
  warmTimer = setTimeout(() => unwarm('no cut within 2 min'), 120000);
  return { warmed: aud.sourceName, scene };
}
// Leftover warm-ups (owner, 17 Nov 2026): if the bridge stops within the 2 minutes a warm-up lasts, its off-canvas copy
// of the auditorium stays in that scene, OBS saves it with the collection, and from then on the auditorium renders in
// the background whenever that scene is on (found in "DinkDonk Lobby" on 16 Nov). When the bridge links up it removes
// exact matches only: the cinema's own browser source, in another scene, at the warm-up's spot (canvas width + 400, 0).
async function cleanupLeftovers() {
  const aud = ((await request('GetSceneItemList', { sceneName: SCENE })).sceneItems || []).find((i) => i.inputKind === 'browser_source');
  if (!aud) return 0;
  const { baseWidth = 1920 } = await request('GetVideoSettings');
  let removed = 0;
  for (const { sceneName } of (await request('GetSceneList')).scenes || []) {
    if (sceneName === SCENE || (warm && warm.scene === sceneName)) continue;   // (a warm-up of ours in use right now)
    for (const it of (await request('GetSceneItemList', { sceneName })).sceneItems || []) {
      const t = it.sceneItemTransform || {};
      if (it.sourceName !== aud.sourceName || Math.round(t.positionX) !== baseWidth + 400 || Math.round(t.positionY) !== 0) continue;
      await request('RemoveSceneItem', { sceneName, sceneItemId: it.sceneItemId });
      log(`removed a leftover warm-up: "${it.sourceName}" off-canvas in "${sceneName}"`);
      removed++;
    }
  }
  return removed;
}
async function unwarm(why) {
  if (!warm) return;
  const w = warm;
  warm = null;
  clearTimeout(warmTimer);
  try {
    await request('RemoveSceneItem', { sceneName: w.scene, sceneItemId: w.sceneItemId });
    log(`warm-up: "${w.source}" taken out of "${w.scene}" (${why})`);
  } catch (e) { log(`warm-up: removing "${w.source}" from "${w.scene}" failed (${e.message}): it sits off-canvas there, remove it by hand`); }
}
const LOCAL_PAGE = /^http:\/\/(127\.0\.0\.1|localhost):187\d\d$/;   // the standby screens (18770 live, 18771 test)
function cutRoute(req, res, what = 'cut') {
  const from = (req.socket.remoteAddress || '').replace(/^::ffff:/, '');
  const origin = req.headers.origin || '';
  const reply = (code, obj) => {
    res.writeHead(code, { 'Content-Type': 'application/json', ...(LOCAL_PAGE.test(origin) ? { 'Access-Control-Allow-Origin': origin } : {}) });
    res.end(JSON.stringify(obj));
  };
  // only the standby pages on this PC: no phone on the LAN and no other web page may switch the stream's scene
  if (!ownAddresses().has(from) || (origin && !LOCAL_PAGE.test(origin))) return reply(403, { error: 'forbidden' });
  let body = '';
  req.on('data', (c) => { body += c; if (body.length > 1024) req.destroy(); });
  req.on('end', async () => {
    let b = {};
    try { b = body ? JSON.parse(body) : {}; } catch { /* empty */ }
    if (!obs.ready) return reply(503, { error: 'OBS not ready' });
    if (what === 'film') {
      try {
        const r = await cutToFilm(!!b.dry);
        log(`cut to film: ${JSON.stringify(r)}`);
        return reply(200, r);
      } catch (e) {
        log(`cut to film failed: ${e.message}`);
        return reply(500, { error: e.message });
      }
    }
    if (what === 'warm') {
      try {
        const r = await warmCinema();
        log(`warm-up (lobby fly-through starts): ${JSON.stringify(r)}`);
        return reply(200, r);
      } catch (e) {
        log(`warm-up failed: ${e.message}`);
        return reply(500, { error: e.message });
      }
    }
    try {
      const r = await cutToCinema(!!b.dry);
      log(r.dry ? `cut to cinema (dry): ${JSON.stringify(r)}` : `cut to "${SCENE}" (lobby fly-through)`);
      reply(200, r);
    } catch (e) {
      log(`cut to cinema failed: ${e.message}`);
      reply(500, { error: e.message });
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/cut-to-cinema') { cutRoute(req, res); return; }
  if (req.method === 'POST' && req.url === '/warm-cinema') { cutRoute(req, res, 'warm'); return; }
  if (req.method === 'POST' && req.url === '/cut-to-film') { cutRoute(req, res, 'film'); return; }
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(`obs-bridge: OBS ${obs.ready ? 'ready' : 'not ready'}, ${pages.size} page(s), film ${want.film ? 'on' : 'off'}\n`);
});

server.on('upgrade', (req, socket) => {
  // only pages on this PC (OBS's own browser source): a phone on the LAN must not switch the film on and off
  const from = (socket.remoteAddress || '').replace(/^::ffff:/, '');
  const key = req.headers['sec-websocket-key'];
  // ... and only the standby pages: any other web page open on this PC could connect, become the driver and cut the
  // stream's scene (audit 15 Nov 2026, F4). Browsers always send Origin; the same rule as the HTTP routes (cutRoute).
  const origin = req.headers.origin || '';
  if (!ownAddresses().has(from) || !key || (origin && !LOCAL_PAGE.test(origin))) { socket.end('HTTP/1.1 403 Forbidden\r\n\r\n'); return; }
  const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
  socket.setNoDelay(true);
  pages.add(socket);
  driver = socket;
  wsSend(socket, { obs: obs.ready, keyed: obs.ready && obs.keyed });
  // (Brief 102) the scene may have been rearranged since setup: look again whenever a page connects
  if (obs.ready) keyedSetup().then((k) => { obs.keyed = k; if (obs.ready) wsSend(socket, { obs: true, keyed: k }); }).catch(() => {});
  log(`page connected (${pages.size} open)`);
  let buf = Buffer.alloc(0);
  socket.on('data', (chunk) => {
    buf = Buffer.concat([buf, chunk]);
    for (;;) {
      const f = readFrame(buf);
      if (!f) break;
      buf = buf.subarray(f.size);
      if (f.op === 1 && socket === driver) onPage(f.data.toString('utf8'), socket);
      else if (f.op === 8) { socket.end(Buffer.from([0x88, 0])); break; }
      else if (f.op === 9) socket.write(frame(f.data, 0xA));
    }
  });
  const gone = () => {
    if (!pages.delete(socket)) return;
    log(`page closed (${pages.size} open)`);
    if (socket !== driver) return;
    // the auditorium source shut down (scene switched away) or reloaded: no film floating over the next page
    driver = [...pages].pop() || null;
    want.film = false;
    pump();
    if (obs.ready && obs.keyed) setLayer(false).catch(() => {});   // (a shot cut short: the film goes back on top)
  };
  socket.on('close', gone);
  socket.on('error', gone);
});

function readFrame(b) {
  if (b.length < 2) return null;
  const op = b[0] & 0x0f, masked = b[1] & 0x80;
  let len = b[1] & 0x7f, at = 2;
  if (len === 126) { if (b.length < 4) return null; len = b.readUInt16BE(2); at = 4; }
  else if (len === 127) { if (b.length < 10) return null; len = Number(b.readBigUInt64BE(2)); at = 10; }
  const mask = masked ? b.subarray(at, at + 4) : null;
  if (masked) at += 4;
  if (b.length < at + len) return null;
  const data = Buffer.from(b.subarray(at, at + len));
  if (mask) for (let i = 0; i < data.length; i++) data[i] ^= mask[i & 3];
  return { op, data, size: at + len };
}

function frame(data, op = 0x1) {
  const len = data.length;
  const head = len < 126 ? Buffer.from([0x80 | op, len])
    : len < 65536 ? Buffer.from([0x80 | op, 126, len >> 8, len & 255])
    : Buffer.concat([Buffer.from([0x80 | op, 127]), (() => { const x = Buffer.alloc(8); x.writeBigUInt64BE(BigInt(len)); return x; })()]);
  return Buffer.concat([head, data]);
}
const wsSend = (socket, obj) => { if (!socket.destroyed) socket.write(frame(Buffer.from(JSON.stringify(obj)))); };

function onPage(text, socket) {
  let m;
  try { m = JSON.parse(text); } catch { return; }
  if (typeof m.shot === 'string') { onShot(socket, m); return; }
  const ok = Array.isArray(m.quad) && m.quad.length === 4 && m.w > 0 && m.h > 0
    && m.quad.every((p) => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]));
  if (ok) {
    // viewport px -> the shader's -100..100 frame (Browser 3 fills the 2560x1440 canvas, so the viewport is the canvas)
    const [TL, TR, BR, BL] = m.quad.map(([x, y]) => [+(x / m.w * 200 - 100).toFixed(3), +(y / m.h * 200 - 100).toFixed(3)]);
    want.quad = { Top_Left_X: TL[0], Top_Left_Y: TL[1], Top_Right_X: TR[0], Top_Right_Y: TR[1],
      Bottom_Right_X: BR[0], Bottom_Right_Y: BR[1], Bottom_Left_X: BL[0], Bottom_Left_Y: BL[1] };
  }
  if (typeof m.film === 'boolean') want.film = m.film;
  pump();
}

// Latest-only: while one update is on its way to OBS, newer corners overwrite the waiting ones, so a slow OBS
// never builds a queue that plays back late.
async function pump() {
  if (busy || !obs.ready) return;
  const quadKey = want.quad && JSON.stringify(want.quad);
  const film = want.film && !!want.quad;
  if (quadKey === sent.quad && film === sent.film) return;
  busy = true;
  try {
    // corners before the item shows, so the film never flashes at the previous shot's corners
    if (quadKey && quadKey !== sent.quad) {
      await request('SetSourceFilterSettings', { sourceName: FILM, filterName: FILTER, filterSettings: want.quad, overlay: true });
      sent.quad = quadKey;
    }
    if (film !== sent.film) {
      await request('SetSceneItemEnabled', { sceneName: SCENE, sceneItemId: obs.itemId, sceneItemEnabled: film });
      sent.film = film;
      log(`film ${film ? 'on' : 'off'}`);
    }
  } catch (e) {
    log(`update failed: ${e.message}`);
    // the film item or filter went away (renamed, other collection): look again, at most every 2 s
    if (obs.ws && Date.now() - obs.setupAt > 2000) { setReady(false); setup(); }
  } finally {
    busy = false;
  }
  if (obs.ready) setImmediate(pump);
}

// ---------- film colour for the screen glow (queue 58) ----------
// While the film is up, a tiny screenshot of the film source (96x54) about every 500 ms; its average colour goes to the
// auditorium pages, which tint the glow round the screen with it. The source is corner-pinned, so most of the frame is
// transparent: the average is weighted by alpha. Pages that don't know {glow} ignore it.
const GLOW_MS = 500;
let glowSent = '';
function pngPixels(buf) {
  // 8-bit RGB or RGBA PNG (what OBS writes) -> { w, h, bpp, px } with the row filters undone
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let at = 8, w = 0, h = 0, type = 0;
  const idat = [];
  while (at + 12 <= buf.length) {
    const len = buf.readUInt32BE(at), kind = buf.toString('latin1', at + 4, at + 8), body = buf.subarray(at + 8, at + 8 + len);
    if (kind === 'IHDR') {
      w = body.readUInt32BE(0); h = body.readUInt32BE(4); type = body[9];
      if (body[8] !== 8 || (type !== 2 && type !== 6) || body[12]) throw new Error(`PNG type ${type}/${body[8]} not handled`);
    } else if (kind === 'IDAT') idat.push(body);
    else if (kind === 'IEND') break;
    at += 12 + len;
  }
  const bpp = type === 6 ? 4 : 3, stride = w * bpp, raw = zlib.inflateSync(Buffer.concat(idat)), px = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = y * (stride + 1) + 1, row = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[row + x - bpp] : 0, b = y ? px[row - stride + x] : 0, c = x >= bpp && y ? px[row - stride + x - bpp] : 0;
      let v = raw[src + x];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      px[row + x] = v & 255;
    }
  }
  return { w, h, bpp, px };
}
function averageColour({ w, h, bpp, px }) {
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < w * h * bpp; i += bpp) {
    const a = bpp === 4 ? px[i + 3] / 255 : 1;
    r += px[i] * a; g += px[i + 1] * a; b += px[i + 2] * a; n += a;
  }
  return n < 4 ? null : [r, g, b].map((c) => Math.round(c / n));   // under ~4 px of film in the frame: no reading
}
async function sampleGlow() {
  if (!obs.ready || !sent.film || !pages.size) return;
  const { imageData } = await request('GetSourceScreenshot', { sourceName: FILM, imageFormat: 'png', imageWidth: 96, imageHeight: 54 });
  const rgb = averageColour(pngPixels(Buffer.from(String(imageData).replace(/^data:[^,]*,/, ''), 'base64')));
  if (!rgb) return;
  const key = rgb.join(',');
  if (key === glowSent) return;
  glowSent = key;
  for (const c of pages) wsSend(c, { glow: rgb });
}
let glowFails = 0;
(function glowLoop() {
  sampleGlow().then(() => { glowFails = 0; }, (e) => { if (++glowFails === 1 || glowFails % 120 === 0) log(`film colour: ${e.message}`); })
    .finally(() => setTimeout(glowLoop, glowFails > 3 ? 5000 : GLOW_MS));
})();

server.listen(PORT, '0.0.0.0', () => log(`obs-bridge on :${PORT} (pages on this PC only), OBS at ${OBS_URL}`));
obsConnect();
