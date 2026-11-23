'use strict';
// Offline regression tests for the 23 Nov 2026 security review of web/server.js:
//   1. a malformed OBS bridge message must not take other rooms down
//   2. the director countdown reaches the panel only as a bounded number
//   3. only issued, non-revoked room records pass (no inherited Object.prototype names)
// Run from web/: npm test  (node --test). Starts its own server.js on a free 127.0.0.1 port with a temporary DATA folder,
// a random throwaway admin token and test/offline-preload.cjs, so nothing reaches the network.
// DD_SERVER_JS=<path> runs the same tests against another copy of server.js (to see the old one fail).

const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const { test, before, after } = require('node:test');
const { WebSocket } = require('ws');

const WEB = path.resolve(__dirname, '..');
const SERVER_JS = path.resolve(process.env.DD_SERVER_JS || path.join(WEB, 'server.js'));
const SITE = path.resolve(WEB, '..');   // the repo root holds the pages and dinkdonk.js / poll-draft.js / movie-suggest.js

const key = () => crypto.randomBytes(18).toString('base64url');
const ROOM_A = key();
const ROOM_B = key();
const REVOKED = key();
const MALFORMED = key();   // an entry that is not a room record
const UNKNOWN = key();
// Object.prototype members long enough for the key pattern (16-64 of [A-Za-z0-9_-]), and shorter ones for good measure
const INHERITED = ['propertyIsEnumerable', '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__', '__proto__', 'constructor', 'hasOwnProperty'];

let child, base, wsBase, data, output = '';

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.once('error', reject);
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); });
  });
}
const alive = () => child && child.exitCode === null && child.signalCode === null;

before(async () => {
  data = fs.mkdtempSync(path.join(os.tmpdir(), 'dd-sec-test-'));
  const now = new Date().toISOString();
  fs.writeFileSync(path.join(data, 'rooms.json'), JSON.stringify({
    [ROOM_A]: { name: 'Test room A', created: now },
    [ROOM_B]: { name: 'Test room B', created: now },
    [REVOKED]: { name: 'Test revoked', created: now, revoked: now },
    [MALFORMED]: true,
  }));
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  wsBase = `ws://127.0.0.1:${port}`;
  child = spawn(process.execPath, ['--require', path.join(__dirname, 'offline-preload.cjs'), SERVER_JS], {
    cwd: WEB,
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), SITE, DATA: data,
      ADMIN_TOKEN: crypto.randomBytes(24).toString('hex'),   // throwaway, never printed
      DINKDONK_CACHE: path.join(data, 'dinkdonk.json'), POLL_DRAFT_FILE: path.join(data, 'poll-draft.json') },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (d) => { output += d; });
  child.stderr.on('data', (d) => { output += d; });
  const t0 = Date.now();
  while (!output.includes('DinkDonk Cinema on')) {
    if (!alive()) throw new Error(`server exited at start:\n${output}`);
    if (Date.now() - t0 > 15000) throw new Error(`server did not start:\n${output}`);
    await new Promise((r) => setTimeout(r, 50));
  }
});

after(() => {
  if (alive()) child.kill();
  try { fs.rmSync(data, { recursive: true, force: true }); } catch { /* temp */ }
});

// ---------- helpers ----------
function connect(pathname, k, extra = '') {
  return new Promise((resolve) => {
    const ws = new WebSocket(`${wsBase}${pathname}?k=${encodeURIComponent(k)}${extra}`);
    const inbox = [];
    ws.on('message', (d) => inbox.push(d.toString()));
    ws.once('open', () => resolve({ ok: true, ws, inbox }));
    ws.once('unexpected-response', (_req, res) => { resolve({ ok: false, status: res.statusCode }); ws.terminate(); });
    ws.on('error', () => resolve({ ok: false, status: 0 }));
  });
}
async function waitFor(fn, what, ms = 3000) {
  const t0 = Date.now();
  while (!fn()) {
    if (Date.now() - t0 > ms) throw new Error(`timed out waiting for ${what}`);
    await new Promise((r) => setTimeout(r, 20));
  }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const closed = (ws) => new Promise((r) => { if (ws.readyState === WebSocket.CLOSED) r(); else ws.once('close', r); });

// ---------- 1. bridge messages ----------
test('malformed bridge messages from one room leave other rooms connected and working', async () => {
  const bHost = await connect('/__bridge', ROOM_B, '&role=obs');
  const bPage = await connect('/__bridge', ROOM_B, '&role=page');
  assert.ok(bHost.ok && bPage.ok, 'room B connects');
  const aHost = await connect('/__bridge', ROOM_A, '&role=obs');
  const aPage = await connect('/__bridge', ROOM_A, '&role=page');
  assert.ok(aHost.ok && aPage.ok, 'room A connects');

  // invalid message types from room A, on both roles
  const bad = ['null', '1', '-0', 'true', '"text"', '[]', '[1,2,3]', '{broken', '', '{"glow":null}', '{"glow":"x"}',
    '{"rid":5}', '{"rid":{}}', '{"obs":"yes"}', '{"__proto__":{"obs":true}}'];
  for (const m of bad) { aHost.ws.send(m); aPage.ws.send(m); }
  aHost.ws.send(Buffer.from([0, 1, 2, 3]));                     // binary frame
  aPage.ws.send(Buffer.from('{"corners":1}'), { binary: true }); // binary JSON: not passed on
  await sleep(300);
  assert.ok(alive(), `server still running after invalid messages:\n${output}`);
  assert.ok(!aHost.inbox.some((t) => t.includes('corners')), 'binary page frame not relayed');

  // frames that make ws itself fail: invalid UTF-8 in a text frame, and one over maxPayload (8192)
  aPage.ws.send(Buffer.from([0x7b, 0xff, 0xfe, 0x7d]), { binary: false });
  aHost.ws.send('x'.repeat(9000));
  await Promise.all([closed(aHost.ws), closed(aPage.ws)]);
  await sleep(200);
  assert.ok(alive(), `server still running after protocol errors:\n${output}`);

  // room B never noticed: host -> page and page -> host both still pass
  assert.equal(bHost.ws.readyState, WebSocket.OPEN);
  assert.equal(bPage.ws.readyState, WebSocket.OPEN);
  bHost.ws.send(JSON.stringify({ obs: true, keyed: true }));
  await waitFor(() => bPage.inbox.includes('{"obs":true,"keyed":true}'), 'room B page to get {obs:true}');
  bHost.ws.send(JSON.stringify({ glow: [10, 20, 30] }));
  await waitFor(() => bPage.inbox.includes('{"glow":[10,20,30]}'), 'room B page to get the glow');
  bPage.ws.send('{"corners":[[0,0],[1,0],[1,1],[0,1]]}');
  await waitFor(() => bHost.inbox.includes('{"corners":[[0,0],[1,0],[1,1],[0,1]]}'), 'room B host to get the corners');
  bPage.ws.send('null');
  await sleep(100);
  assert.ok(!bHost.inbox.includes('null'), 'a bare null from a page is not passed on');

  // room A can come straight back
  const aAgain = await connect('/__bridge', ROOM_A, '&role=obs');
  assert.ok(aAgain.ok, 'room A reconnects');
  const health = await fetch(`${base}/healthz`);
  assert.equal(health.status, 200);
  for (const s of [bHost, bPage, aAgain]) s.ws.close();
});

test('a chat screen sending an oversized frame is closed without stopping the server', async () => {
  // (offline, the chat upstream never connects, so the server also closes chat screens with 1013 "reconnecting" now
  // and then; that is normal. What matters: the oversized frame closes only its own socket with 1009, and the server
  // keeps taking chat screens.)
  const bad = await connect('/__dgg_chat_ws', ROOM_A);
  assert.ok(bad.ok);
  const code = new Promise((r) => bad.ws.once('close', (c) => r(c)));
  bad.ws.send('x'.repeat(5000));   // chat maxPayload is 4096
  const c = await code;
  assert.ok(c === 1009 || c === 1013 || c === 1006, `closed with ${c}`);
  await sleep(200);
  assert.ok(alive(), `server still running:\n${output}`);
  const next = await connect('/__dgg_chat_ws', ROOM_B);
  assert.ok(next.ok, 'a new chat screen still connects');
  next.ws.close();
});

// ---------- 2. director countdown ----------
async function postState(state) {
  const r = await fetch(`${base}/ctl/state?k=${ROOM_A}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state) });
  assert.equal(r.status, 204);
}
async function director(id) {
  const r = await fetch(`${base}/ctl/state?k=${ROOM_A}`);
  assert.equal(r.status, 200);
  return (await r.json()).screens.find((s) => s.id === id)?.director;
}

test('director countdown: only a finite, bounded number is kept', async () => {
  const cases = [
    [42, 42], [12.4, 12], [0, 0], [86400, 86400],
    ['<img src=x onerror="globalThis.__pwned=1">', undefined], ['42', undefined], [-5, undefined], [1e9, undefined],
    [null, undefined], [{ toString: 1 }, undefined], [[5], undefined], [true, undefined],
  ];
  for (const [i, [nextIn, want]] of cases.entries()) {
    const id = `cd${i}`;
    await postState({ id, page: 'lobby', director: { on: true, following: null, every: 120, zoom: 2, nextIn } });
    const d = await director(id);
    assert.ok(d, `director kept for ${JSON.stringify(nextIn)}`);
    assert.equal(d.nextIn, want, `nextIn ${JSON.stringify(nextIn)}`);
    assert.equal(d.every, 120);
  }
  // a director that is not an object is dropped; the rest of the state stays
  await postState({ id: 'cdstr', page: 'lobby', director: '<b>x</b>', chatters: [] });
  assert.equal(await director('cdstr'), undefined);
  // a non-object body is ignored
  const r = await fetch(`${base}/ctl/state?k=${ROOM_A}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'null' });
  assert.equal(r.status, 204);
  assert.ok(alive());
});

// ---------- 3. room records ----------
async function httpStatus(pathname, k) {
  const r = await fetch(`${base}${pathname}${pathname.includes('?') ? '&' : '?'}k=${encodeURIComponent(k)}`);
  await r.arrayBuffer();
  return r.status;
}
const PROTECTED_HTTP = ['/api/room', '/ctl/settings', '/ctl/room-state', '/ms/state.json', '/dd/poll-script.user.js', '/control.html', '/control-qa.html', '/auditorium.html'];

test('issued room keys open the protected HTTP and WebSocket paths', async () => {
  for (const p of PROTECTED_HTTP) assert.equal(await httpStatus(p, ROOM_A), 200, `${p} with an issued key`);
  const room = await (await fetch(`${base}/api/room?k=${ROOM_A}`)).json();
  assert.equal(room.name, 'Test room A');
  for (const p of ['/__bridge', '/__dgg_chat_ws']) {
    const c = await connect(p, ROOM_A);
    assert.ok(c.ok, `${p} with an issued key`);
    c.ws.close();
  }
});

test('unknown, revoked, malformed and inherited-name keys are refused everywhere', async () => {
  const refused = { unknown: UNKNOWN, revoked: REVOKED, malformed: MALFORMED };
  for (const n of INHERITED) refused[`inherited ${n}`] = n;
  for (const [what, k] of Object.entries(refused)) {
    for (const p of PROTECTED_HTTP) assert.equal(await httpStatus(p, k), 403, `${p} with ${what}`);
    for (const p of ['/__bridge', '/__dgg_chat_ws']) {
      const c = await connect(p, k);
      assert.equal(c.ok, false, `${p} with ${what}`);
      assert.equal(c.status, 403, `${p} with ${what}`);
    }
  }
  // the room's poll endpoint answers "no room" rather than another room's poll
  const d = await (await fetch(`${base}/dd/draft.json?k=propertyIsEnumerable`)).json();
  assert.equal(d.draft, null);
  assert.ok(alive());
  // nothing was created for a refused key
  for (const dir of ['room-state', 'settings', 'movie-suggest']) {
    let files = [];
    try { files = fs.readdirSync(path.join(data, dir)); } catch { /* none */ }
    for (const n of INHERITED) assert.ok(!files.includes(`${n}.json`), `${dir}/${n}.json`);
  }
});
