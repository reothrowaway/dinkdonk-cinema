// Raised-surface part of the marquee light (everything outside each plain band's ground stripe): how bright is it,
// and how small do the slices get when the faintest values are left out?
// Usage (from roxy3d/): node marquee/light_stats2.mjs
import fs from 'node:fs';
import { readPng } from './png_io.mjs';

const m = JSON.parse(fs.readFileSync('out10m/marquee.json', 'utf8'));
const std = (k) => [13, 38, 63, 88].includes(k % 100);
const hist = new Array(256).fill(0);
const T = [1, 2, 3, 4, 6, 8, 12];
const res = T.map(() => ({ slices: 0, area: 0, energy: 0, list: [] }));
let total = 0;
for (const r of m.render_layers.filter((x) => x.parent === 'marquee_light')) {
  const im = readPng('out10m/' + r.file);
  const key = r.depth_sort_key;
  const band = Math.floor((key - 1000) / 25);
  const y0 = 350 + 7.5 * band, y1 = y0 + 7.5;
  const boxes = T.map(() => [1e9, 1e9, -1, -1, 0]);
  for (let y = 0; y < im.h; y++) {
    for (let x = 0; x < im.w; x++) {
      const d = (y * im.w + x) * 4;
      const v = Math.max(im.rgba[d], im.rgba[d + 1], im.rgba[d + 2]);
      if (!v) continue;
      const sy = r.y + y;
      if (std(key) && sy >= Math.floor(y0) - 1 && sy <= Math.ceil(y1)) continue;
      hist[v]++;
      total += v;
      T.forEach((t, i) => {
        if (v < t) return;
        const b = boxes[i];
        if (x < b[0]) b[0] = x;
        if (y < b[1]) b[1] = y;
        if (x > b[2]) b[2] = x;
        if (y > b[3]) b[3] = y;
        b[4] += v;
      });
    }
  }
  T.forEach((t, i) => {
    const b = boxes[i];
    if (b[2] < 0) return;
    res[i].slices++;
    res[i].area += (b[2] - b[0] + 1) * (b[3] - b[1] + 1);
    res[i].energy += b[4];
    res[i].list.push(`${r.name} ${(b[2] - b[0] + 1)}x${(b[3] - b[1] + 1)} sum ${b[4]}`);
  });
}
console.log('raised light: total', total, 'pixels by value 1..12:', hist.slice(1, 13).join(' '), '13+:', hist.slice(13).reduce((a, b) => a + b, 0));
T.forEach((t, i) => console.log(`keep >= ${t}: slices ${res[i].slices}, bbox area ${res[i].area}, energy ${res[i].energy} (${(100 * res[i].energy / total).toFixed(1)}%)`));
if (process.argv.includes('--list')) console.log(res[T.indexOf(Number(process.argv[process.argv.indexOf('--list') + 1]) || 3)].list.join('\n'));
