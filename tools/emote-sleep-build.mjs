// Sleeping emotes (15 Nov 2026): closed eyes for every DGG emote, kept in shared/emote-sleep.json.
//   node tools/emote-sleep-build.mjs capture <dir>      still frame of every emote: <dir>/native/<name>.png (1x, see-through)
//                                                       and <dir>/zoom/<name>.png (pixel-exact, native-pixel rulers, for labelling)
//   node tools/emote-sleep-build.mjs bake <labels.json>  eye boxes (native px) -> shared/emote-sleep.json, with the lid colour
//                                                       sampled just above each eye and the line colour from around it
//   node tools/emote-sleep-build.mjs sheets <dir>        review sheets (awake | asleep) -> <dir>/sheet-NN.png
// Headless Edge against the local server (BASE, default http://127.0.0.1:18770); closed by tools/edgeguard.mjs.
import { spawn } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { guard } from './edgeguard.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const BASE = process.env.BASE || 'http://127.0.0.1:18770';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const [cmd, arg] = process.argv.slice(2);
if (!['capture', 'bake', 'sheets'].includes(cmd) || !arg) { console.error('capture <dir> | bake <labels.json> | sheets <dir>'); process.exit(1); }

const port = 9600 + Math.floor(Math.random() * 100);
const prof = join(tmpdir(), `edge-sleep-${port}`);   // (edgeguard closes every msedge with this name in its command line)
mkdirSync(prof, { recursive: true });
const done = guard(prof, 20);
spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless=new', '--hide-scrollbars',
  `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--window-size=1920,1080', 'about:blank'], { stdio: 'ignore' });

let t; for (let i = 0; i < 80 && !t; i++) { await sleep(250); try { t = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((x) => x.type === 'page'); } catch { /* not up */ } }
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pend = new Map(); const errs = [];
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errs.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300)); });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const js = async (expression) => {
  const r = (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result;
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 400));
  return r.result?.value;
};
await send('Page.enable'); await send('Runtime.enable');
const open = async (url, w = 1920, h = 1080) => {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url });
  for (let i = 0; i < 120; i++) { await sleep(250); if (await js('!!window.READY').catch(() => false)) break; }
  await sleep(500);
};
const shot = async (clip, transparent = false) => {
  await send('Emulation.setDefaultBackgroundColorOverride', transparent ? { color: { r: 0, g: 0, b: 0, a: 0 } } : {});
  const r = await send('Page.captureScreenshot', { format: 'png', clip: { ...clip, scale: 1 }, captureBeyondViewport: true });
  return Buffer.from(r.result.data, 'base64');
};

if (cmd === 'capture') {
  mkdirSync(join(arg, 'native'), { recursive: true });
  mkdirSync(join(arg, 'zoom'), { recursive: true });
  await open(`${BASE}/tools/emote-sleep.html?mode=cap`, 3000, 3000);
  await js("document.body.style.background = 'transparent'; document.documentElement.style.background = 'transparent'");
  const names = await js('NAMES');
  const index = {};
  for (const n of names) {
    const b = await js(`show(${JSON.stringify(n)}, 1, 0)`);
    await sleep(60);
    writeFileSync(join(arg, 'native', `${n}.png`), await shot({ x: b.x, y: b.y, width: b.w, height: b.h }, true));
    const s = Math.max(4, Math.min(12, Math.floor(Math.min(360 / b.h, 900 / b.w))));
    await js(`document.body.style.background = '#808080'`);
    const z = await js(`show(${JSON.stringify(n)}, ${s}, 1)`);
    await sleep(60);
    writeFileSync(join(arg, 'zoom', `${n}.png`), await shot({ x: z.x - 9 * s, y: z.y - 9 * s, width: (z.w + 18) * s, height: (z.h + 18) * s }));
    await js(`document.body.style.background = 'transparent'`);
    index[n] = { w: b.w, h: b.h, zoom: s, animated: b.animated };
  }
  writeFileSync(join(arg, 'index.json'), JSON.stringify(index, null, 1));
  console.log('captured', names.length, 'animated', Object.values(index).filter((x) => x.animated).length);
}

if (cmd === 'bake') {
  const labels = JSON.parse(readFileSync(arg, 'utf8'));
  const dir = dirname(arg);
  await open(`${BASE}/tools/emote-sleep.html?mode=cap`);
  const out = {};
  for (const [n, L] of Object.entries(labels).sort(([a], [b]) => a.localeCompare(b))) {
    if (!L.eyes?.length) { out[n] = { kind: L.kind || 'none', ...(L.bg ? { bg: L.bg } : {}) }; continue; }
    const png = join(dir, 'native', `${n}.png`);
    if (!existsSync(png)) { console.log('no frame for', n); continue; }
    const data = readFileSync(png).toString('base64');
    // in the page: canvas pixels of the still frame; lid = median of the skin just above each eye, line = darkest
    // outline pixel around it (kept clearly darker than the lid)
    const eyes = await js(`(async () => {
      const im = new Image(); im.src = 'data:image/png;base64,${data}'; await im.decode();
      const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
      const g = c.getContext('2d'); g.drawImage(im, 0, 0);
      const px = g.getImageData(0, 0, c.width, c.height).data;
      const at = (x, y) => { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= c.width || y >= c.height) return null;
        const i = (y * c.width + x) * 4; return px[i + 3] < 160 ? null : [px[i], px[i + 1], px[i + 2]]; };
      const lum = (p) => 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2];
      const hex = (p) => '#' + p.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
      const med = (arr) => { arr.sort((a, b) => lum(a) - lum(b)); return arr[Math.floor(arr.length / 2)]; };
      return ${JSON.stringify(L.eyes)}.map((e) => {
        const [x, y, rx, ry] = [e.x, e.y, e.rx, e.ry];
        let lid = null;
        if (e.lid) lid = e.lid;
        else {
          // a ring all round the eye (above counts double): the colour most of the face around it has, not the hair
          // or hood that may sit on one side; per-channel median of the light-enough pixels
          const ring = [];
          for (const d of [1.3, 2.2, 3.1]) for (let a = 0; a < 360; a += 15) {
            const t = a * Math.PI / 180, up = Math.sin(t) < -0.3;
            const p = at(x + Math.cos(t) * (rx + d), y + Math.sin(t) * (ry + d));
            if (p && lum(p) > 45) { ring.push(p); if (up) ring.push(p); }
          }
          const chan = (i) => { const v = ring.map((p) => p[i]).sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; };
          lid = ring.length >= 4 ? hex([chan(0), chan(1), chan(2)]) : '#c8a080';
        }
        let line = e.line || null;
        if (!line) {
          let best = null;
          for (let dy = -ry - 2; dy <= ry + 2; dy += 0.5) for (let dx = -rx - 2; dx <= rx + 2; dx += 0.5) {
            const p = at(x + dx, y + dy); if (p && (!best || lum(p) < lum(best))) best = p;
          }
          const L0 = lum(best || [0, 0, 0]);
          line = !best || L0 > 70 ? '#1c1414' : hex(best);
        }
        return [Math.round(x * 4) / 4, Math.round(y * 4) / 4, Math.round(rx * 4) / 4, Math.round(ry * 4) / 4, Math.round(e.rot || 0), lid, line];
      });
    })()`);
    out[n] = { eyes, ...(L.bg ? { bg: L.bg } : {}) };
    if (L.curve) out[n].curve = L.curve;   // 'down' (default, sleepy arc) | 'flat'
  }
  writeFileSync(join(ROOT, 'shared', 'emote-sleep.json'), JSON.stringify(out, null, 0).replace(/\},"/g, '},\n"'));
  console.log('baked', Object.keys(out).length, 'with eyes', Object.values(out).filter((v) => v.eyes).length);
}

if (cmd === 'sheets') {
  mkdirSync(arg, { recursive: true });
  const filt = process.env.ONLY || 'all', names = process.env.NAMES || '';
  const base = `${BASE}/tools/emote-sleep.html?mode=sheet&only=${filt}${names ? `&names=${names}` : ''}`;
  await open(`${base}&page=0`);
  const total = Number(/\((\d+)\)/.exec(await js('document.title'))?.[1] || 0);
  for (let p = 0; p * 16 < total; p++) {
    await open(`${base}&page=${p}`);
    const r = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(arg, `sheet-${String(p).padStart(2, '0')}.png`), Buffer.from(r.result.data, 'base64'));
  }
  console.log("sheets", Math.ceil(total / 16));
}
if (errs.length) console.log('PAGE ERRORS', errs.join('\n'));
ws.close(); done(); process.exit(0);
