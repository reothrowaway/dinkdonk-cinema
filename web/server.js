'use strict';

// DinkDonk Cinema, hosted edition. Serves the lobby (lobby.html) and the auditorium (auditorium.html) to anyone with a
// room key, so streamers only need OBS: no Node, no relay, no bridge on their PC.
//   - one shared Destiny.gg chat connection, fanned out to every open screen (/__dgg_chat_ws?k=KEY)
//   - the emote list and dinkdonk.mov data, fetched once for everyone (/dgg/*, /dd/*)
//   - per-room control panel traffic (/ctl/*?k=KEY): each streamer drives only their own screens
//   - room keys: data/rooms.json, managed on /admin.html with ADMIN_TOKEN
// Pages get web/shim.js injected, which adds the key to those calls and runs the OBS film-screen bridge in the page.
// Runs behind Caddy (TLS); listens on 127.0.0.1 only. Env: PORT=8080, ADMIN_TOKEN (required), SITE=./site, DATA=./data

const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { WebSocket, WebSocketServer } = require('ws');
// shared/room.js: the build copies it next to this file
const { createRoom } = require(fs.existsSync(path.join(__dirname, 'room.js')) ? './room' : '../shared/room');
// shared/settings.js (the panel's scene settings): copied next to this file too
const { createSettings } = require(fs.existsSync(path.join(__dirname, 'settings.js')) ? './settings' : '../shared/settings');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 8080);
const SITE = path.resolve(process.env.SITE || path.join(__dirname, 'site'));
const DATA = path.resolve(process.env.DATA || path.join(__dirname, 'data'));
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
if (ADMIN_TOKEN.length < 24) { console.error('Set ADMIN_TOKEN (24+ characters).'); process.exit(1); }
process.env.DINKDONK_CACHE = process.env.DINKDONK_CACHE || path.join(DATA, 'dinkdonk.json');
// first start: film titles from the build's last good copy until dinkdonk.mov answers
const SEED = path.join(__dirname, 'seed', 'dinkdonk.json');
if (!fs.existsSync(process.env.DINKDONK_CACHE) && fs.existsSync(SEED)) {
  fs.mkdirSync(path.dirname(process.env.DINKDONK_CACHE), { recursive: true });
  fs.copyFileSync(SEED, process.env.DINKDONK_CACHE);
}
const dinkdonk = require(path.join(SITE, 'dinkdonk.js'));
// each room's DinkDonk poll (being built / open, sent by that streamer's own poll script, /dd/poll-script.user.js)
// and its roll-up poll screen; the same module as the local server's (poll-draft.js)
process.env.POLL_DRAFT_FILE = process.env.POLL_DRAFT_FILE || path.join(DATA, 'poll-draft.json');
const pollDraft = require(path.join(SITE, 'poll-draft.js'));
const POLL_SCRIPT = path.join(SITE, 'userscripts', 'dinkdonk-poll-draft.user.js');
// chat movie suggestions, one per room (queue 85, 17 Nov 2026): the same module as the local server's. Every room
// takes the chat command (!rqmovie) while its streamer has suggestions open; the tag trigger needs the streamer's own
// name, typed in their control panel (empty by default). The room's poll script does the lookups and adds.
const { createMovieSuggest } = require(path.join(SITE, 'movie-suggest.js'));

const CDN = 'https://cdn.destiny.gg';
const CHAT_URL = 'wss://chat.destiny.gg/ws';
const CHAT_ORIGIN = 'https://www.destiny.gg';
const CACHE_MS = 10 * 60 * 1000;
const MAX_SCREENS_PER_ROOM = 24;
const log = (...a) => console.log(new Date().toISOString().slice(0, 19), ...a);

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.webm': 'video/webm', '.mp4': 'video/mp4',
  '.shader': 'text/plain; charset=utf-8', '.ico': 'image/x-icon',
};
// pages that need a room key; the shim goes into the ones that talk to the server
const KEYED = new Set(['lobby.html', 'roxy.html', 'auditorium.html', 'control.html', 'setup.html', 'lobby-qa.html', 'auditorium-qa.html', 'control-qa.html']);
const SHIMMED = new Set(['lobby.html', 'auditorium.html', 'control.html', 'lobby-qa.html', 'auditorium-qa.html', 'control-qa.html']);
const PRIVATE = /^(dinkdonk\.js|server\.js|poll-draft\.js|movie-suggest\.js|movie-test-list\.js)$/i;

// ---------- rooms ----------
const ROOMS_FILE = path.join(DATA, 'rooms.json');
// No prototype: a key such as "propertyIsEnumerable" or "__defineGetter__" (long enough for the key pattern) used to
// find Object.prototype's members and pass as a room (security review 23 Nov 2026).
let rooms = Object.create(null);
try {
  const saved = JSON.parse(fs.readFileSync(ROOMS_FILE, 'utf8'));
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) Object.assign(rooms, saved);
} catch { /* no rooms yet */ }
function saveRooms() {
  fs.mkdirSync(DATA, { recursive: true });
  fs.writeFileSync(`${ROOMS_FILE}.tmp`, JSON.stringify(rooms, null, 2));
  fs.renameSync(`${ROOMS_FILE}.tmp`, ROOMS_FILE);
}
// An issued room: the key's own entry in rooms.json, shaped like the records /api/admin/rooms writes. Every keyed HTTP
// path and both WebSocket paths go through validKey.
function roomRecord(k) {
  if (typeof k !== 'string' || !Object.prototype.hasOwnProperty.call(rooms, k)) return null;
  const r = rooms[k];
  return r !== null && typeof r === 'object' && !Array.isArray(r) && typeof r.name === 'string' ? r : null;
}
const validKey = (k) => typeof k === 'string' && /^[A-Za-z0-9_-]{16,64}$/.test(k) && !!roomRecord(k) && !roomRecord(k).revoked;
const sameToken = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };

// ---------- shared room state, one per key (web/PLAN-shared-rooms.md, shared/room.js) ----------
// Every room keeps its lobby and auditorium going on the server, fed by the shared chat connection, which stays up
// while any room exists so the rooms keep filling with no screen open. Saved in DATA/room-state/<key>.json.
let emoteNameSet = new Set();
async function refreshEmoteNames() {
  try {
    const list = JSON.parse((await cdnAsset('emotes.json')).body);
    const names = new Set(list.map((e) => e?.prefix).filter((p) => typeof p === 'string'));
    if (names.size) emoteNameSet = names;
  } catch { /* keep the last list */ }
}
const roomStates = new Map();   // key -> room
const roomFile = (k) => path.join(DATA, 'room-state', `${k}.json`);
// The auditorium's seat list comes from the layout of the draft the page shows (auditorium.html DRAFT: 14 since
// 10 Nov 2026). A build ships only that draft's layout, so with the name fixed at "13" the hosted room had no seats:
// everyone waited outside and the auditorium stayed empty (found 11 Nov 2026). Newest layout that is there wins.
const LAYOUT_FILE = ['14', '13'].map((d) => path.join(SITE, 'roxy3d', 'qa11', `cinema_layout_${d}.json`)).find((f) => fs.existsSync(f)) || null;
function ensureRoom(k) {
  if (!roomStates.has(k)) {
    roomStates.set(k, createRoom({ file: roomFile(k), layoutFile: LAYOUT_FILE,
      emoteNames: () => emoteNameSet, log: (m) => log(`${rooms[k]?.name || '?'}: ${m}`),
      crowd: () => roomSettings(k).get('lobby').crowd }));   // the panel's lobby crowd setting
  }
  return roomStates.get(k);
}
// movie suggestions, one per key (DATA/movie-suggest/<key>.json); made on first use, kept while the server runs
const suggestStates = new Map();   // key -> movie suggestions
const suggestFile = (k) => path.join(DATA, 'movie-suggest', `${k}.json`);
function roomSuggest(k) {
  if (!suggestStates.has(k)) {
    suggestStates.set(k, createMovieSuggest({ file: suggestFile(k),
      historySearch: (t) => dinkdonk.search(String(t).slice(0, 60)).then((r) => r.entries || []),
      log: (m) => log(`${rooms[k]?.name || '?'}: ${m}`),
      overrides: { tag: { def: '', label: 'Your DGG name (chat: @name Title)' } },
      omit: ['testFeed', 'testEvery'] }));
  }
  return suggestStates.get(k);
}
// rooms whose suggestions file exists come back at start, so an open round keeps taking chat after a restart
function loadSuggestRooms() {
  let files = [];
  try { files = fs.readdirSync(path.join(DATA, 'movie-suggest')); } catch { return; }
  for (const f of files) { const k = f.replace(/\.json$/, ''); if (f.endsWith('.json') && validKey(k)) roomSuggest(k); }
}
// ---------- idle rooms (owner, 27 Nov 2026) ----------
// A room with no lobby or auditorium screen open for 3 hours is cleared (lobby and auditorium) and then takes nobody
// from chat until a screen opens again; that screen starts it filling. Shorter gaps (a scene switch, a break) keep the
// crowd as before. Saved in DATA/room-idle.json so a server restart neither wakes nor forgets a sleeping room.
// IDLE_RESET_MS overrides the 3 hours (tests).
const IDLE_RESET_MS = Math.max(10_000, Number(process.env.IDLE_RESET_MS) || 3 * 3600_000);
const IDLE_FILE = path.join(DATA, 'room-idle.json');
let idle = {};   // key -> { since: ms the room's last screen closed, asleep: cleared and waiting for a screen }
try {
  const saved = JSON.parse(fs.readFileSync(IDLE_FILE, 'utf8'));
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
    for (const [k, v] of Object.entries(saved)) {
      if (v && Number.isFinite(v.since)) idle[k] = { since: v.since, asleep: v.asleep === true };
    }
  }
} catch { /* none yet */ }
function saveIdle() {
  try {
    fs.mkdirSync(DATA, { recursive: true });
    fs.writeFileSync(`${IDLE_FILE}.tmp`, JSON.stringify(idle));
    fs.renameSync(`${IDLE_FILE}.tmp`, IDLE_FILE);
  } catch (e) { log(`idle rooms: ${e.message}`); }
}
const roomScreenCount = (k) => live.get(k)?.roomSubs || 0;   // lobby/auditorium screens on /ctl/room
const roomAsleep = (k) => idle[k]?.asleep === true;
function roomScreenOpened(k) {
  if (!idle[k]) return;
  if (idle[k].asleep) log(`${rooms[k]?.name || '?'}: a screen opened, filling from chat again`);
  delete idle[k];
  saveIdle();
}
function roomScreenClosed(k) {
  if (roomScreenCount(k) || idle[k]) return;
  idle[k] = { since: Date.now(), asleep: false };
  saveIdle();
}
function checkIdleRooms() {
  const now = Date.now();
  let dirty = false;
  for (const [k, r] of roomStates) {
    if (roomScreenCount(k)) { if (idle[k]) { delete idle[k]; dirty = true; } continue; }
    if (!idle[k]) { idle[k] = { since: now, asleep: false }; dirty = true; continue; }   // e.g. just after a start
    if (idle[k].asleep || now - idle[k].since < IDLE_RESET_MS) continue;
    try {
      r.command({ cmd: 'reset', page: 'lobby' });
      r.command({ cmd: 'reset', page: 'auditorium' });
    } catch (e) { log(`room: ${e.message}`); }
    idle[k].asleep = true;
    dirty = true;
    log(`${rooms[k]?.name || '?'}: no screen for ${Math.round(IDLE_RESET_MS / 60000)} min, lobby and auditorium cleared; waiting for a screen`);
  }
  for (const k of Object.keys(idle)) if (!roomStates.has(k)) { delete idle[k]; dirty = true; }
  if (dirty) saveIdle();
}
setInterval(checkIdleRooms, Math.min(60_000, Math.max(2_000, IDLE_RESET_MS / 10))).unref();

function dropRoom(k) {
  if (idle[k]) { delete idle[k]; saveIdle(); }
  roomStates.get(k)?.close();
  roomStates.delete(k);
  settingsStates.delete(k);
  suggestStates.get(k)?.flush();
  suggestStates.delete(k);
  try { fs.rmSync(suggestFile(k), { force: true }); } catch { /* gone */ }
  try { fs.rmSync(roomFile(k), { force: true }); } catch { /* gone */ }
  try { fs.rmSync(settingsFile(k), { force: true }); } catch { /* gone */ }
}
// the panel's scene settings, one set per key (shared/settings.js; the screens' URLs are the defaults).
// Saved in DATA/settings/<key>.json, so a reload or a server restart keeps them.
const settingsStates = new Map();   // key -> settings
const settingsFile = (k) => path.join(DATA, 'settings', `${k}.json`);
function roomSettings(k) {
  if (!settingsStates.has(k)) settingsStates.set(k, createSettings({ file: settingsFile(k), log: (m) => log(`${rooms[k]?.name || '?'}: ${m}`) }));
  return settingsStates.get(k);
}

// per-room control state (same protocol as standby-server.js, one copy per key)
const live = new Map();   // key -> { screens: Map(res -> {page,id}), states: Map(id -> {at,state}), chat: Set(ws) }
function roomLive(k) {
  if (!live.has(k)) live.set(k, { screens: new Map(), states: new Map(), chat: new Set() });
  return live.get(k);
}

// ---------- helpers ----------
function send(res, status, type, body, extra = {}) {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', ...extra });
  res.end(body);
}
const json = (res, status, obj) => send(res, status, TYPES['.json'], JSON.stringify(obj));
function readJson(req, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const parts = [];
    req.on('data', (c) => { size += c.length; if (size > limit) { reject(new Error('too large')); req.destroy(); } else parts.push(c); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(parts).toString('utf8') || '{}')); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}
// Requests that change things must come from our own pages (OBS browser sources send no Origin on same-origin GETs).
function foreignOrigin(req) {
  const o = req.headers.origin;
  if (!o) return false;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  try { return new URL(o).host !== host; } catch { return true; }
}

// ---------- Destiny.gg: emotes (same as standby-server.js) ----------
const cdnCache = new Map();
async function cdnAsset(key) {
  const hit = cdnCache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit;
  const upstream = { 'emotes.json': '/emotes/emotes.json', 'emotes.css': '/emotes/emotes.css', 'flairs.json': '/flairs/flairs.json' }[key];
  try {
    const res = await fetch(CDN + upstream, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`cdn.destiny.gg answered ${res.status}`);
    let body = await res.text();
    if (key === 'emotes.css') body = body.replace(/url\(\s*["']?(?!https?:|data:)([^"')]+)["']?\s*\)/g, (_, f) => `url("${CDN}/emotes/${f}")`);
    const entry = { at: Date.now(), type: TYPES[path.extname(key)], body };
    cdnCache.set(key, entry);
    return entry;
  } catch (error) {
    log(`emote ${key}: ${error.message}`);
    if (hit) return hit;
    throw error;
  }
}
const EMOTE_IMG = /^https:\/\/cdn\.destiny\.gg\/[0-9.]+\/emotes\/[A-Za-z0-9_-]+\.(png|gif|webp|avif)$/;
const emoteImgs = new Map();
function emoteImage(u) {
  if (!emoteImgs.has(u)) {
    if (emoteImgs.size > 4000) emoteImgs.clear();
    const p = fetch(u, { signal: AbortSignal.timeout(15_000) }).then(async (r) => {
      if (!r.ok) throw new Error(`cdn.destiny.gg answered ${r.status}`);
      return { type: TYPES[path.extname(u)], body: Buffer.from(await r.arrayBuffer()) };
    });
    p.catch(() => emoteImgs.delete(u));
    emoteImgs.set(u, p);
  }
  return emoteImgs.get(u);
}

// ---------- Destiny.gg chat: one upstream, every screen downstream ----------
// Read-only: screens never send. A screen joining later gets a NAMES frame built from the live user list, so its
// "n in chat" count is right without a second upstream connection.
const chat = { ws: null, users: new Map(), connectioncount: 0, retry: 0, idleTimer: null, clients: new Set() };
function chatConnect() {
  if (chat.ws) return;
  const ws = new WebSocket(CHAT_URL, { origin: CHAT_ORIGIN, handshakeTimeout: 15_000, headers: { 'User-Agent': 'DinkDonkCinema/1.0 (+read-only screens)' } });
  chat.ws = ws;
  ws.on('open', () => { chat.retry = 0; log(`chat: connected (${chat.clients.size} screens)`); });
  ws.on('message', (data) => {
    const text = data.toString();
    const sp = text.indexOf(' ');
    const type = sp > 0 ? text.slice(0, sp) : text;
    if (type === 'NAMES' || type === 'JOIN' || type === 'QUIT') {
      try {
        const d = JSON.parse(text.slice(sp + 1));
        if (type === 'NAMES') { chat.users = new Map((d.users || []).map((u) => [u.nick, u])); chat.connectioncount = d.connectioncount || 0; }
        else if (type === 'JOIN' && d.nick) chat.users.set(d.nick, d);
        else if (type === 'QUIT' && d.nick) chat.users.delete(d.nick);
      } catch { /* keep relaying */ }
    }
    for (const c of chat.clients) if (c.readyState === WebSocket.OPEN && c.bufferedAmount < 1 << 20) c.send(text);
    for (const [k, r] of roomStates) {
      if (roomAsleep(k)) continue;   // cleared after 3 h without a screen: nobody walks in until one opens
      try { r.chatFrame(text); } catch (e) { log(`room: ${e.message}`); }
    }
    if (type === 'MSG') for (const s of suggestStates.values()) { try { s.chatFrame(text); } catch (e) { log(`movie suggestions: ${e.message}`); } }
  });
  const down = (why) => {
    if (chat.ws !== ws) return;
    chat.ws = null;
    chat.users.clear();
    log(`chat: closed (${why})`);
    // screens show "offline" and reconnect on their own; they come back once upstream is up again
    for (const c of chat.clients) c.close(1013, 'Destiny.gg chat reconnecting');
    if (chat.clients.size || roomStates.size) setTimeout(chatConnect, Math.min(30_000, 1000 * 2 ** chat.retry++));
  };
  ws.on('close', (code) => down(`code ${code}`));
  ws.on('error', (e) => { down(e.message); try { ws.terminate(); } catch { /* gone */ } });
}
function namesFrame() {
  return `NAMES ${JSON.stringify({ connectioncount: Math.max(chat.connectioncount, chat.users.size), users: [...chat.users.values()] })}`;
}
const wss = new WebSocketServer({ noServer: true, maxPayload: 4096 });
wss.on('connection', (client, req, key) => {
  const room = roomLive(key);
  room.chat.add(client);
  chat.clients.add(client);
  clearTimeout(chat.idleTimer);
  if (chat.ws?.readyState === WebSocket.OPEN && chat.users.size) client.send(namesFrame());
  chatConnect();
  guardSocket(client, 'chat screen', () => { /* screens are read-only */ });
  client.on('close', () => {
    room.chat.delete(client);
    chat.clients.delete(client);
    // nobody watching: drop the upstream after a minute (scene switches reconnect within seconds)
    if (!chat.clients.size) chat.idleTimer = setTimeout(() => { if (!chat.clients.size && !roomStates.size && chat.ws) { chat.ws.close(1000); } }, 60_000);
  });
});

// ---------- film-screen relay, per room (see web/shim.js) ----------
// For OBS builds whose browser may not reach 127.0.0.1 from a website: the auditorium (role=page) sends the screen
// corners here, the control panel in the streamer's own browser (role=obs) applies them in OBS and reports back
// whether OBS is linked. Same rules as obs-bridge.js: the newest page drives; when it goes, the film goes off.
const bridgeWss = new WebSocketServer({ noServer: true, maxPayload: 8192 });
function roomBridge(key) {
  const room = roomLive(key);
  if (!room.bridge) room.bridge = { host: null, ready: false, keyed: false, pages: new Set(), driver: null };
  return room.bridge;
}
const sendIfOpen = (ws, text) => { if (ws?.readyState === WebSocket.OPEN) ws.send(text); };
// A bridge message is one text frame holding a JSON object ({...}); anything else (binary, null, numbers, strings,
// arrays, broken JSON) is dropped. Returns [text, object] or null. (Security review 23 Nov 2026: a bare `null` used to
// throw inside the handler, which took the whole server and every room down.)
function bridgeMessage(data, isBinary) {
  if (isBinary || !Buffer.isBuffer(data)) return null;
  const text = data.toString('utf8');
  let m;
  try { m = JSON.parse(text); } catch { return null; }
  return m !== null && typeof m === 'object' && !Array.isArray(m) ? [text, m] : null;
}
// Every accepted socket gets its own error listener and a guarded message handler, so a bad frame (too large, invalid
// UTF-8, a handler bug) closes only that socket. Without an 'error' listener the ws library's error event throws and
// the process exits.
function guardSocket(ws, what, onMessage) {
  ws.on('error', (e) => { log(`${what}: ${e.message}`); try { ws.terminate(); } catch { /* gone */ } });
  if (!onMessage) return;
  ws.on('message', (data, isBinary) => {
    try { onMessage(data, isBinary); } catch (e) { log(`${what}: ${e.message}`); try { ws.close(1011, 'bad message'); } catch { /* gone */ } }
  });
}
bridgeWss.on('connection', (ws, req, key, role) => {
  const b = roomBridge(key);
  const tellHost = () => sendIfOpen(b.host, JSON.stringify({ pages: b.pages.size }));
  if (role === 'obs') {
    if (b.host) b.host.close(4000, 'another control panel took over');
    b.host = ws;
    b.ready = false;
    tellHost();
    guardSocket(ws, 'bridge host', (data, isBinary) => {
      const msg = bridgeMessage(data, isBinary);
      if (!msg) return;
      const m = msg[1];
      // queue 58: the film's average colour, for the screen glow (numbers only, passed on to the pages)
      if (Array.isArray(m.glow) && m.glow.length === 3 && m.glow.every((c) => Number.isInteger(c) && c >= 0 && c <= 255)) {
        const text = JSON.stringify({ glow: m.glow });
        for (const p of b.pages) sendIfOpen(p, text);
        return;
      }
      // Brief 102: the panel's answer to a page's screen-shot request (cut to the fullscreen film and back, the film's
      // layer), passed on to the pages; the waiting shot matches its rid. Known fields only (Codex audit 15 Nov 2026, C3)
      if (typeof m.rid === 'string' && /^[A-Za-z0-9]{1,16}$/.test(m.rid)) {
        const reply = { rid: m.rid, ok: m.ok === true };
        if (typeof m.error === 'string') reply.error = m.error.slice(0, 200);
        if (typeof m.skipped === 'string') reply.skipped = m.skipped.slice(0, 200);
        const text = JSON.stringify(reply);
        for (const p of b.pages) sendIfOpen(p, text);
        return;
      }
      if (typeof m.obs !== 'boolean') return;
      b.ready = m.obs;
      b.keyed = m.obs && m.keyed === true;   // (the auditorium paints its screen for the colour key only when keyed)
      for (const p of b.pages) sendIfOpen(p, JSON.stringify({ obs: b.ready, keyed: b.keyed }));
    });
    ws.on('close', () => {
      if (b.host !== ws) return;
      b.host = null;
      b.ready = false;
      b.keyed = false;
      for (const p of b.pages) sendIfOpen(p, '{"obs":false}');
    });
    return;
  }
  b.pages.add(ws);
  b.driver = ws;
  sendIfOpen(ws, JSON.stringify({ obs: b.ready, keyed: b.keyed }));
  tellHost();
  // the page's corners and shot requests go to the panel as they came, but only well-formed JSON objects
  guardSocket(ws, 'bridge page', (data, isBinary) => {
    if (ws !== b.driver) return;
    const msg = bridgeMessage(data, isBinary);
    if (msg) sendIfOpen(b.host, msg[0]);
  });
  ws.on('close', () => {
    b.pages.delete(ws);
    if (b.driver === ws) {
      b.driver = [...b.pages].pop() || null;
      // the auditorium source shut down or reloaded: no film floating over the next scene
      sendIfOpen(b.host, '{"film":false}');
    }
    tellHost();
  });
});

// ---------- control panel, per room ----------
// Server-sent events must never be compressed: Caddy's encode (zstd/gzip) holds back everything over 512 bytes until
// its buffer fills, so browsers got the room's snapshot and walk-ins late or never (7 Nov 2026). no-transform and an
// explicit Content-Encoding both make Caddy pass the stream through as it is.
// A screen's state report as the panel may show it: a JSON object, and the director's countdown (seconds to the next
// automatic follow) only as a finite number from 0 to MAX_NEXT_IN, rounded. Anything else in that field is dropped,
// and a director that is not an object goes too (security review 23 Nov 2026: the panel printed it as HTML).
const MAX_NEXT_IN = 24 * 60 * 60;
function screenStateIn(st) {
  if (st === null || typeof st !== 'object' || Array.isArray(st)) return null;
  const d = st.director;
  if (d === undefined || d === null) return st;
  if (typeof d !== 'object' || Array.isArray(d)) { const { director, ...rest } = st; return rest; }
  const { nextIn, ...dir } = d;
  if (typeof nextIn === 'number' && Number.isFinite(nextIn) && nextIn >= 0 && nextIn <= MAX_NEXT_IN) dir.nextIn = Math.round(nextIn);
  return { ...st, director: dir };
}
const SSE_HEADERS = {'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store, no-transform', 'Content-Encoding': 'identity',
  Connection: 'keep-alive', 'X-Accel-Buffering': 'no' };
async function controlRoute(req, res, pathname, key) {
  if (foreignOrigin(req)) return send(res, 403, 'text/plain', 'Forbidden');
  if (req.method === 'POST' && !/^application\/json\b/.test(req.headers['content-type'] || '')) return send(res, 415, 'text/plain', 'JSON only');
  const room = roomLive(key);
  const url = new URL(req.url, 'http://x');
  if (pathname === '/ctl/events' && req.method === 'GET') {
    if (room.screens.size >= MAX_SCREENS_PER_ROOM) return send(res, 429, 'text/plain', 'Too many screens open');
    res.writeHead(200, SSE_HEADERS);
    res.write('retry: 3000\n\n');
    const page = url.searchParams.get('page') === 'auditorium' ? 'auditorium' : 'lobby';
    room.screens.set(res, { page, id: url.searchParams.get('id') || '' });
    res.write(`data: ${JSON.stringify(roomSettings(key).message(page))}\n\n`);   // the panel's settings at once
    const ping = setInterval(() => res.write(': ping\n\n'), 20000);
    req.on('close', () => { clearInterval(ping); room.screens.delete(res); });
    return;
  }
  // shared room: a room-mode screen's event stream, and the room's summary for the panel
  if (pathname === '/ctl/room' && req.method === 'GET') {
    const r = ensureRoom(key);
    if ((room.roomSubs || 0) >= MAX_SCREENS_PER_ROOM) return send(res, 429, 'text/plain', 'Too many screens open');
    roomScreenOpened(key);   // a sleeping room starts filling again
    const page = url.searchParams.get('page') === 'auditorium' ? 'auditorium' : 'lobby';
    const id = (url.searchParams.get('id') || '').slice(0, 16) || crypto.randomBytes(6).toString('base64url');
    res.writeHead(200, SSE_HEADERS);
    res.write('retry: 3000\n\n');
    const who = url.searchParams.has('who') ? url.searchParams.get('who').replace(/[^A-Za-z0-9_]/g, '').slice(0, 25) || null : undefined;
    const off = r.subscribe(page, id, (line) => res.write(`data: ${line}\n\n`), { obs: url.searchParams.get('obs') === '1', who, caps: String(url.searchParams.get('caps') || '').split(',').filter((c) => /^[a-z]{1,12}$/.test(c)).slice(0, 8) });
    room.roomSubs = (room.roomSubs || 0) + 1;
    const ping = setInterval(() => res.write(': ping\n\n'), 20000);
    req.on('close', () => { clearInterval(ping); off(); room.roomSubs -= 1; roomScreenClosed(key); });
    return;
  }
  if (pathname === '/ctl/room-state' && req.method === 'GET') return json(res, 200, { ...ensureRoom(key).summary(), asleep: roomAsleep(key) });
  // read-only roster (no subscription): the lobby's fly-through needs who sits where in the auditorium
  if (pathname === '/ctl/room-roster' && req.method === 'GET') {
    return json(res, 200, ensureRoom(key).snapshot(url.searchParams.get('page') === 'auditorium' ? 'auditorium' : 'lobby'));
  }
  // the fly-through's end: the lobby (inside OBS) asks for the cut to the cinema scene; this room's control panel, which
  // holds the streamer's OBS link (relay host, web/shim.js), does it. 409 when no panel is connected to OBS.
  // (and at its start, /ctl/warm-cinema: the panel loads the auditorium off-canvas in OBS during the flight, queue 55)
  if ((pathname === '/ctl/cut-to-cinema' || pathname === '/ctl/warm-cinema') && req.method === 'POST') {
    const b = roomBridge(key);
    if (!b.host || b.host.readyState !== 1) return json(res, 409, { error: 'no control panel connected to OBS' });
    sendIfOpen(b.host, pathname === '/ctl/cut-to-cinema' ? '{"cut":true}' : '{"warm":true}');
    return json(res, 200, { relayed: true });
  }
  if (pathname === '/ctl/settings' && req.method === 'GET') { const s = roomSettings(key); return json(res, 200, { schema: s.schema, values: s.all() }); }
  if (pathname === '/ctl/cmd' && req.method === 'POST') {
    const cmd = await readJson(req);
    if (!cmd || typeof cmd.cmd !== 'string') return json(res, 400, { error: 'no cmd' });
    const page = cmd.page || 'lobby';
    if (!['lobby', 'auditorium'].includes(page)) return json(res, 400, { error: 'unknown page' });
    try { ensureRoom(key).command(cmd); } catch (e) { log(`room: ${e.message}`); }
    // the room's roll-up poll screen: remembered here, so a reload or a second viewer of this room sees it the same way
    if (cmd.cmd === 'pollscreen' && page === 'lobby') pollDraft.setScreen(!!cmd.on, key);
    if (cmd.cmd === 'who' || cmd.cmd === 'kicked' || cmd.cmd === 'left') return json(res, 200, { screens: 0 });   // room only
    // a scene setting: remembered for this room, and every screen of the scene gets all of that scene's settings
    const sets = roomSettings(key);
    const out = sets.command({ ...cmd, page }) ? { ...sets.message(page), ...(cmd.id ? { id: cmd.id } : {}) } : cmd;
    const line = `data: ${JSON.stringify(out)}\n\n`;
    let count = 0;
    for (const [s, target] of room.screens) {
      if (target.page !== page || (cmd.id && cmd.id !== target.id)) continue;
      s.write(line);
      count++;
    }
    return json(res, 200, { screens: count });
  }
  if (pathname === '/ctl/state' && req.method === 'POST') {
    const st = screenStateIn(await readJson(req, 256 * 1024));
    if (st && typeof st.id === 'string' && (room.states.has(st.id.slice(0, 16)) || room.states.size < MAX_SCREENS_PER_ROOM)) {
      room.states.set(st.id.slice(0, 16), { at: Date.now(), state: st });
      try { ensureRoom(key).screenState(st); } catch (e) { log(`room: ${e.message}`); }
    }
    for (const [id, s] of room.states) if (Date.now() - s.at > 10000) room.states.delete(id);
    return send(res, 204, 'text/plain', '');
  }
  if (pathname === '/ctl/state' && req.method === 'GET') {
    for (const [id, s] of room.states) if (Date.now() - s.at > 10000) room.states.delete(id);
    return json(res, 200, { controlVersion: 2, screens: [...room.states.values()].map((s) => ({ ...s.state, page: s.state.page || 'lobby' })) });
  }
  return send(res, 404, 'text/plain', 'Not found');
}

// ---------- admin ----------
async function adminRoute(req, res, pathname) {
  const token = req.headers['x-admin-token'] || '';
  if (!sameToken(token, ADMIN_TOKEN)) return json(res, 403, { error: 'wrong admin token' });
  if (foreignOrigin(req)) return send(res, 403, 'text/plain', 'Forbidden');
  if (pathname === '/api/admin/rooms' && req.method === 'GET') {
    return json(res, 200, { rooms: Object.entries(rooms).map(([key, r]) => ({ key, ...r, screens: live.get(key)?.states.size || 0, chat: live.get(key)?.chat.size || 0, asleep: roomAsleep(key) })) });
  }
  if (pathname === '/api/admin/rooms' && req.method === 'POST') {
    const body = await readJson(req);
    const name = String(body.name || '').trim().slice(0, 40);
    if (!name) return json(res, 400, { error: 'name needed' });
    const key = crypto.randomBytes(18).toString('base64url');
    rooms[key] = { name, created: new Date().toISOString() };
    saveRooms();
    ensureRoom(key);
    chatConnect();
    log(`room created: ${name}`);
    return json(res, 200, { key, name });
  }
  if (pathname === '/api/admin/revoke' && req.method === 'POST') {
    const body = await readJson(req);
    if (!roomRecord(body.key)) return json(res, 404, { error: 'no such room' });
    rooms[body.key].revoked = new Date().toISOString();
    saveRooms();
    for (const c of live.get(body.key)?.chat || []) c.close(4003, 'room revoked');
    const b = live.get(body.key)?.bridge;
    if (b) { b.host?.close(4003, 'room revoked'); for (const p of b.pages) p.close(4003, 'room revoked'); }
    for (const s of live.get(body.key)?.screens.keys() || []) s.end();
    dropRoom(body.key);
    pollDraft.dropRoom(body.key);
    log(`room revoked: ${rooms[body.key].name}`);
    return json(res, 200, { ok: true });
  }
  return send(res, 404, 'text/plain', 'Not found');
}

// ---------- static files ----------
const SHIM_TAG = '<script src="/web/shim.js"></script>';
const htmlCache = new Map();   // file -> { mtime, body }
function sendStatic(req, res, file, rel) {
  fs.stat(file, (error, st) => {
    if (error || !st.isFile()) return send(res, 404, 'text/plain', 'Not found');
    const type = TYPES[path.extname(file).toLowerCase()];
    const base = path.basename(rel).toLowerCase();
    if (type.startsWith('text/html')) {
      let hit = htmlCache.get(file);
      if (!hit || hit.mtime !== st.mtimeMs) {
        let body = fs.readFileSync(file, 'utf8');
        // first thing in <head>, so the pages' own scripts already see the wrapped fetch/EventSource/WebSocket
        if (SHIMMED.has(base)) body = body.replace(/<head>/i, `<head>\n${SHIM_TAG}`);
        hit = { mtime: st.mtimeMs, body };
        htmlCache.set(file, hit);
      }
      return send(res, 200, type, hit.body, { 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' });
    }
    const etag = `"${st.size.toString(36)}-${Math.floor(st.mtimeMs).toString(36)}"`;
    // art changes only on a redeploy: browsers revalidate daily, OBS keeps its copy between scene switches
    const cache = /^roxy3d\/|^assets\//.test(rel) ? 'public, max-age=86400' : 'no-cache';
    if (req.headers['if-none-match'] === etag) { res.writeHead(304, { ETag: etag, 'Cache-Control': cache }); return res.end(); }
    const head = { 'Content-Type': type, ETag: etag, 'Cache-Control': cache, 'Accept-Ranges': 'bytes', 'X-Content-Type-Options': 'nosniff' };
    let start = 0, end = st.size - 1;
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (m) {
      start = m[1] ? Number(m[1]) : Math.max(0, st.size - Number(m[2]));
      end = m[1] && m[2] ? Math.min(Number(m[2]), st.size - 1) : st.size - 1;
      if (start > end || start >= st.size) { res.writeHead(416, { 'Content-Range': `bytes */${st.size}` }); return res.end(); }
      head['Content-Range'] = `bytes ${start}-${end}/${st.size}`;
    }
    head['Content-Length'] = end - start + 1;
    res.writeHead(m ? 206 : 200, head);
    if (req.method === 'HEAD') return res.end();
    const stream = fs.createReadStream(file, { start, end });
    stream.on('error', () => res.destroy());
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  });
}

// Votes and the result of a room's poll once it is open: its public results page, read at most every 20 s per room
// while that room's screen asks, plus the winners once it is among dinkdonk.mov's finished polls (as
// standby-server.js does). Stops when final.
const pollResultsAt = new Map();   // room key -> last read
function checkPollResults(key) {
  const d = pollDraft.get(key);
  if (!d?.pollId || d.state === 'building' || Date.now() - (pollResultsAt.get(key) || 0) < 20000) return;
  if (d.state === 'closed' && d.results?.winners?.length) return;   // final
  pollResultsAt.set(key, Date.now());
  (async () => {
    const detail = await dinkdonk.pollResults(d.pollId).catch(() => null);
    let card = null;
    try { card = ((await dinkdonk.data()).polls || []).find((p) => p.id === d.pollId) || null; } catch { /* site unreachable */ }
    if (detail || card) pollDraft.setResults(d.pollId, detail, card ? card.winners : undefined, key);
  })().catch((e) => log(`poll results: ${e.message}`));
}
// A room's own poll script: the userscript with this server and the room key filled in (installs from the control
// panel; Tampermonkey keeps it up to date from the same address)
function pollScript(req, key) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').replace(/[^A-Za-z0-9.:-]/g, '');
  const origin = `${req.headers['x-forwarded-proto'] === 'http' || /^(127\.0\.0\.1|localhost)(:|$)/.test(host) ? 'http' : 'https'}://${host}`;
  const self = `${origin}/dd/poll-script.user.js?k=${key}`;
  const name = rooms[key].name.replace(/[^\w .'-]/g, '').slice(0, 40);
  let src = fs.readFileSync(POLL_SCRIPT, 'utf8');
  const fill = (from, to) => { if (!src.includes(from)) throw new Error(`poll script: "${from}" not found`); src = src.replace(from, to); };
  fill("const SERVER = 'http://127.0.0.1:18770';", `const SERVER = '${origin}';`);
  fill("const ROOM_KEY = '';", `const ROOM_KEY = '${key}';`);
  fill('// @connect      127.0.0.1', `// @connect      ${host.replace(/:\d+$/, '')}`);
  fill('// @namespace    dinkdonk-cinema', `// @namespace    dinkdonk-cinema/${host}/${key.slice(0, 6)}`);
  fill('// @name         DinkDonk poll → cinema lobby', `// @name         DinkDonk poll → cinema lobby (${name})\n// @downloadURL  ${self}\n// @updateURL    ${self}`);
  return src;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://x');
    const pathname = url.pathname;
    const key = url.searchParams.get('k') || '';

    if (pathname === '/healthz') return json(res, 200, { ok: true, chat: chat.ws?.readyState === WebSocket.OPEN, screens: chat.clients.size });
    if (pathname.startsWith('/api/admin/')) return await adminRoute(req, res, pathname);
    if (pathname === '/api/room') return validKey(key) ? json(res, 200, { name: rooms[key].name }) : json(res, 403, { error: 'unknown or revoked key' });
    if (pathname.startsWith('/ctl/')) return validKey(key) ? await controlRoute(req, res, pathname, key) : send(res, 403, 'text/plain', 'Room key needed');
    // a streamer's poll script: their room's poll, by room key; JSON with a custom header (pages can't send that
    // without a CORS preflight, which is never answered)
    if (pathname === '/dd/draft' && req.method === 'POST') {
      if (!validKey(key)) return json(res, 403, { error: 'unknown or revoked key' });
      if (!/^application\/json\b/.test(req.headers['content-type'] || '') || req.headers['x-dd-draft'] !== '1') return send(res, 403, 'text/plain', 'Forbidden');
      const draft = pollDraft.set(await readJson(req), key);
      if (draft?.state === 'building') roomSuggest(key).syncBuilder(draft.options);   // films the streamer took out
      return json(res, 200, { draft });
    }
    // movie suggestions: the room's poll script (same header rule as /dd/draft) ...
    if (['/ms/work', '/ms/lookup', '/ms/added', '/ms/removed'].includes(pathname)) {
      if (!validKey(key)) return json(res, 403, { error: 'unknown or revoked key' });
      if (req.headers['x-dd-draft'] !== '1' || (req.method === 'POST' && !/^application\/json\b/.test(req.headers['content-type'] || ''))) return send(res, 403, 'text/plain', 'Forbidden');
      const ms = roomSuggest(key);
      if (pathname === '/ms/work' && req.method === 'GET') return json(res, 200, ms.work());
      if (req.method !== 'POST') return send(res, 405, 'text/plain', 'Method not allowed');
      const body = await readJson(req);
      if (pathname === '/ms/lookup') return json(res, 200, await ms.lookupResult(body));
      if (pathname === '/ms/added') return json(res, 200, ms.added(body));
      return json(res, 200, ms.unadded(body));
    }
    // ... and the room's control panel (our own pages only, JSON)
    if (pathname === '/ms/cmd' && req.method === 'POST') {
      if (!validKey(key)) return json(res, 403, { error: 'unknown or revoked key' });
      if (foreignOrigin(req) || !/^application\/json\b/.test(req.headers['content-type'] || '')) return send(res, 403, 'text/plain', 'Forbidden');
      const out = roomSuggest(key).command(await readJson(req));
      return json(res, out.ok ? 200 : 400, out);
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'text/plain', 'Method not allowed');
    // the qBittorrent download bar needs the streamer's own PC; hosted, the pre-show just runs without it
    if (pathname === '/qb/progress') return json(res, 200, { available: false });
    if (pathname === '/dgg/emote-img') {
      const u = url.searchParams.get('u') || '';
      if (!EMOTE_IMG.test(u)) return send(res, 400, 'text/plain', 'Not an emote image');
      const img = await emoteImage(u);
      return send(res, 200, img.type, img.body, { 'Cache-Control': 'public, max-age=86400' });
    }
    if (['/dgg/emotes.json', '/dgg/emotes.css', '/dgg/flairs.json'].includes(pathname)) {
      const a = await cdnAsset(path.basename(pathname));
      return send(res, 200, a.type, a.body);
    }
    if (pathname === '/dd/data.json') return json(res, 200, await dinkdonk.data());
    // this room's poll and its screen up/down (?k=, added by the shim)
    if (pathname === '/dd/draft.json') {
      if (!validKey(key)) return json(res, 200, { draft: null, screen: { open: false, at: 0 } });
      checkPollResults(key);
      return json(res, 200, { draft: pollDraft.get(key), screen: pollDraft.getScreen(key) });
    }
    if (pathname === '/ms/state.json') {
      if (!validKey(key)) return json(res, 403, { error: 'unknown or revoked key' });
      const ms = roomSuggest(key);
      return json(res, 200, url.searchParams.get('lite') === '1' ? ms.lite() : ms.snapshot());
    }
    if (pathname === '/dd/poll-script.user.js') {
      if (!validKey(key)) return send(res, 403, 'text/plain', 'Room key needed');
      return send(res, 200, 'text/javascript; charset=utf-8', pollScript(req, key), { 'Cache-Control': 'no-store' });
    }
    if (pathname === '/dd/search') {
      const q = (url.searchParams.get('q') || '').trim().slice(0, 60);
      if (q.length < 2) return json(res, 400, { error: 'query too short' });
      return json(res, 200, await dinkdonk.search(q));
    }

    const rel = pathname === '/' ? 'index.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
    const file = path.resolve(SITE, rel);
    const type = TYPES[path.extname(file).toLowerCase()];
    if (!file.startsWith(SITE + path.sep) || !type || PRIVATE.test(path.basename(file)) || /(^|[\\/])\./.test(rel)) return send(res, 404, 'text/plain', 'Not found');
    if (KEYED.has(path.basename(file).toLowerCase()) && !validKey(key)) {
      return send(res, 403, TYPES['.html'], '<!doctype html><meta charset="utf-8"><title>DinkDonk Cinema</title><body style="background:#111;color:#ddd;font:16px system-ui;padding:40px">This link needs a valid room key. Ask for an invite link.</body>');
    }
    return sendStatic(req, res, file, rel.replace(/\\/g, '/'));
  } catch (error) {
    log(`error ${req.url}: ${error.message}`);
    if (!res.headersSent) send(res, 502, 'text/plain', 'Upstream unavailable');
    else res.destroy();
  }
});

server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url || '/', 'http://x');
  const key = url.searchParams.get('k') || '';
  if (!validKey(key) || foreignOrigin(req)) { socket.end('HTTP/1.1 403 Forbidden\r\n\r\n'); return; }
  if (url.pathname === '/__bridge') {
    const role = url.searchParams.get('role') === 'obs' ? 'obs' : 'page';
    if (role === 'page' && roomBridge(key).pages.size >= MAX_SCREENS_PER_ROOM) { socket.end('HTTP/1.1 429 Too Many Requests\r\n\r\n'); return; }
    bridgeWss.handleUpgrade(req, socket, head, (ws) => bridgeWss.emit('connection', ws, req, key, role));
    return;
  }
  if (url.pathname !== '/__dgg_chat_ws') { socket.end('HTTP/1.1 404 Not Found\r\n\r\n'); return; }
  if (roomLive(key).chat.size >= MAX_SCREENS_PER_ROOM) { socket.end('HTTP/1.1 429 Too Many Requests\r\n\r\n'); return; }
  wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req, key));
});

// every room keeps going from the start, so chat fills them before anyone opens a screen
refreshEmoteNames().then(() => {
  for (const k of Object.keys(rooms)) if (validKey(k)) ensureRoom(k);
  if (roomStates.size) chatConnect();
});
loadSuggestRooms();
setInterval(refreshEmoteNames, CACHE_MS).unref();
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { for (const r of roomStates.values()) r.close(); for (const s of suggestStates.values()) s.flush(); process.exit(0); });

server.listen(PORT, HOST, () => log(`DinkDonk Cinema on http://${HOST}:${PORT} (${Object.keys(rooms).length} rooms, site ${SITE})`));
