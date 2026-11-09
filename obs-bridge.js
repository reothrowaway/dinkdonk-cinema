'use strict';

// OBS bridge for the auditorium's film screen. The auditorium page inside OBS (Browser 3) sends where the screen is
// on every camera move; this pins the VLC capture ("Film screen (src)") onto it through obs-websocket and shows it
// only while the phase is Film. The other things it does, both on the lobby's request during the fly-through: at the
// start (POST /warm-cinema) it puts the auditorium source off-canvas into the lobby scene so OBS loads it (see
// warmCinema; removed again after the cut), at the end (POST /cut-to-cinema) it cuts the program to the cinema scene
// (see cutToCinema). Nothing else in OBS is touched.
//
// Page -> bridge (WebSocket on PORT, text frames of JSON):
//   { film: true|false, w: <viewport px>, h: <viewport px>, quad: [[x,y] TL, TR, BR, BL] }   (viewport px)
// Bridge -> page: { obs: true|false } whenever OBS becomes ready / goes away (the page keeps the screen green
//   when false, so a missing bridge never leaves a black screen with no film).
//   { glow: [r, g, b] } about twice a second while the film is up: its average colour, for the screen glow (queue 58).
// The OBS password is read from obs-websocket's own config on this PC; it never goes to the page.
// Usage: node obs-bridge.js   (env: OBS_BRIDGE_PORT=18790, OBS_WS=ws://127.0.0.1:4455, OBS_PASSWORD to override)

const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const zlib = require('node:zlib');

const PORT = Number(process.env.OBS_BRIDGE_PORT || 18790);
const OBS_URL = process.env.OBS_WS || 'ws://127.0.0.1:4455';
const SCENE = 'DinkDonk Cinema';
const FILM = 'Film screen (src)';
const FILTER = 'Corner pin (live)';
const SHADER = 'C:/Program Files/obs-studio/data/obs-plugins/obs-shaderfilter/examples/corner-pin.shader';
const OBS_CONFIG = path.join(process.env.APPDATA || '', 'obs-studio', 'plugin_config', 'obs-websocket', 'config.json');
const log = (...a) => console.log(new Date().toTimeString().slice(0, 8), ...a);

// ---------- OBS side (obs-websocket v5) ----------
const obs = { ws: null, ready: false, itemId: null, pending: new Map(), seq: 0, setupAt: 0 };

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
    const m = JSON.parse(ev.data);
    if (m.op === 0) {   // Hello
      const a = m.d.authentication;
      const identify = { rpcVersion: 1, eventSubscriptions: 2 };   // Config: scene collection switches
      if (a) identify.authentication = sha256b64(sha256b64(obsPassword() + a.salt) + a.challenge);
      ws.send(JSON.stringify({ op: 1, d: identify }));
    } else if (m.op === 2) {   // Identified
      log('OBS connected');
      setup();
    } else if (m.op === 5 && m.d.eventType === 'CurrentSceneCollectionChanged') {
      setReady(false);
      setup();
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
    setReady(false);
    for (const p of obs.pending.values()) p.reject(new Error('OBS closed'));
    obs.pending.clear();
    setTimeout(obsConnect, 3000);
  };
  ws.onerror = () => {};
}

function request(requestType, requestData = {}) {
  return new Promise((resolve, reject) => {
    if (!obs.ws || obs.ws.readyState !== WebSocket.OPEN) return reject(new Error('OBS not connected'));
    const requestId = String(++obs.seq);
    obs.pending.set(requestId, { resolve, reject });
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
    sent.quad = null;
    sent.film = null;
    setReady(true);
    log(`ready: "${FILM}" is item ${sceneItemId} in "${SCENE}"`);
    pump();
  } catch (e) {
    log(`not ready (${e.message}); is the "Moobies 1440p poll" collection loaded?`);
  }
}

function setReady(on) {
  if (obs.ready === on) return;
  obs.ready = on;
  for (const c of pages) wsSend(c, { obs: on });
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
  const { transitionName } = await request('GetCurrentSceneTransition');
  const prev = aud ? (await request('GetInputSettings', { inputName: aud.sourceName })).inputSettings || {} : {};
  const refreshOn = !!prev.restart_when_active;
  const plan = { scene: SCENE, auditorium: aud?.sourceName || null, transition: transitionName, refreshOn };
  if (dry) return { dry: true, ...plan };
  if (refreshOn) log(`warning: "${aud.sourceName}" has "Refresh browser when scene becomes active" on: it reloads at the cut`);
  try { await request('SetCurrentSceneTransition', { transitionName: 'Cut' }); } catch (e) { log(`no Cut transition (${e.message}): using ${transitionName}`); }
  await request('SetCurrentProgramScene', { sceneName: SCENE });
  setTimeout(async () => {
    try { await request('SetCurrentSceneTransition', { transitionName }); } catch (e) { log(`restore after the cut failed: ${e.message}`); }
    unwarm('after the cut');
  }, 1500);
  return plan;
}

// Queue 55: OBS only loads a browser source once its scene is shown, so the evening's first fly-through cut landed on
// an auditorium still loading (8 Nov: it connected 15 s after the cut). At the flight's start the lobby asks for this:
// the auditorium source goes into the program (lobby) scene, outside the canvas, which counts as shown, so it loads
// during the ~50 s flight. The item is removed after the cut (or after 2 min): no lasting scene change, no extra GPU.
let warm = null;
let warmTimer = 0;
async function warmCinema() {
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
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(`obs-bridge: OBS ${obs.ready ? 'ready' : 'not ready'}, ${pages.size} page(s), film ${want.film ? 'on' : 'off'}\n`);
});

server.on('upgrade', (req, socket) => {
  // only pages on this PC (OBS's own browser source): a phone on the LAN must not switch the film on and off
  const from = (socket.remoteAddress || '').replace(/^::ffff:/, '');
  const key = req.headers['sec-websocket-key'];
  if (!ownAddresses().has(from) || !key) { socket.end('HTTP/1.1 403 Forbidden\r\n\r\n'); return; }
  const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
  socket.setNoDelay(true);
  pages.add(socket);
  driver = socket;
  wsSend(socket, { obs: obs.ready });
  log(`page connected (${pages.size} open)`);
  let buf = Buffer.alloc(0);
  socket.on('data', (chunk) => {
    buf = Buffer.concat([buf, chunk]);
    for (;;) {
      const f = readFrame(buf);
      if (!f) break;
      buf = buf.subarray(f.size);
      if (f.op === 1 && socket === driver) onPage(f.data.toString('utf8'));
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

function onPage(text) {
  let m;
  try { m = JSON.parse(text); } catch { return; }
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
