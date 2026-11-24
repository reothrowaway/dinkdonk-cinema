// How much light each additive prop loop ever adds (perf, 23 Nov 2026). Writes roxy3d/loop-peaks.json, which the lobby
// reads to leave out loops that add next to nothing (?loopmin=, see lobby.html): every loop is a canvas layer that
// steps 24 times a second, and the faint ones (wet-wall highlights, the bulb chase's light on far walls) cost about a
// sixth of the lobby's CPU for a few pixels at 3-8 of 255.
//
// Per loop: p1 / p2 = the largest value (colour x alpha, 0-255) over all pixels and frames of the 1x / @2x sheet (the
// page shows the wet sheets at 1x only, the others at either); px2 / px8 =
// how many 1x pixels ever add more than 2 / 8. Only plus-lighter loops are listed (a source-over loop is never left out).
// Reads the packs, writes only the JSON. Usage (from roxy3d/): node marquee/loop_peaks.mjs
import fs from 'node:fs';
import crypto from 'node:crypto';
import { readPng } from './png_io.mjs';

const PACKS = [['out10s', 'manifest.json'], ['out10r', 'manifest.json'], ['out10t', 'manifest.json'], ['out10m', 'marquee.json'], ['out10tm', 'marquee.json']];
const peaks = {}, sources = {};
for (const [dir, file] of PACKS) {
  if (!fs.existsSync(`${dir}/${file}`)) continue;
  const text = fs.readFileSync(`${dir}/${file}`);
  sources[`${dir}/${file}`] = crypto.createHash('sha256').update(text).digest('hex');
  for (const p of JSON.parse(text).prop_loops || []) {
    if (!p || typeof p.file !== 'string' || (p.blend && p.blend !== 'plus-lighter')) continue;
    const peak = { 1: 0, 2: 0 }; let px2 = 0, px8 = 0;
    for (const [sc, f] of [[1, p.file], [2, p.file_2x]]) {
      if (typeof f !== 'string' || !fs.existsSync(`${dir}/${f}`)) continue;
      const im = readPng(`${dir}/${f}`), rows = Math.ceil(p.frames / p.columns), W = Math.round(im.w / p.columns), H = Math.round(im.h / rows);
      const most = new Uint8Array(W * H);
      for (let fr = 0; fr < p.frames; fr++) { const ox = (fr % p.columns) * W, oy = Math.floor(fr / p.columns) * H;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = ((oy + y) * im.w + ox + x) * 4, a = im.rgba[i + 3] / 255;
          const v = Math.ceil(Math.max(im.rgba[i], im.rgba[i + 1], im.rgba[i + 2]) * a - 1e-9); if (v > most[y * W + x]) most[y * W + x] = v; } }
      for (const v of most) { if (v > peak[sc]) peak[sc] = v; if (sc === 1) { if (v > 2) px2++; if (v > 8) px8++; } }
    }
    peaks[`${dir}/${p.file}`] = { p1: peak[1], p2: peak[2], px2, px8 };
  }
}
const out = { schema: 'lobby-loop-peaks-1', date: new Date().toISOString().slice(0, 10), built_by: 'marquee/loop_peaks.mjs',
  note: 'p1 / p2 = most light (colour x alpha, 0-255) a plus-lighter prop loop ever adds, over all pixels and frames of its 1x / @2x sheet; px2 / px8 = 1x pixels that ever add more than 2 / 8. lobby.html leaves out loops whose peak (wet sheets: p1, they are shown at 1x only; others: the larger of p1 and p2) is under ?loopmin.',
  sources, peaks };
fs.writeFileSync('loop-peaks.json', JSON.stringify(out, null, 1) + '\n');
const pk = ([k, x]) => (/(^|\/)wet_/.test(k) ? x.p1 : Math.max(x.p1, x.p2));
const v = Object.entries(peaks).map(pk);
console.log(`loop-peaks.json: ${v.length} loops; peak <= 2: ${v.filter((x) => x <= 2).length}, <= 8: ${v.filter((x) => x <= 8).length}`);
for (const [dir] of PACKS) { const a = Object.entries(peaks).filter(([k]) => k.startsWith(dir + '/')); if (a.length) console.log(`  ${dir}: ${a.length} loops, peak <= 2: ${a.filter((e) => pk(e) <= 2).length}, <= 8: ${a.filter((e) => pk(e) <= 8).length}`); }
