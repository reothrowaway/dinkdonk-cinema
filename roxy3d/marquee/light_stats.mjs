// How much of the marquee's receiver light / shadow (out10m slices) lies on the ground stripe of its own depth band
// (could be one merged layer under the walkers) and how much on raised surfaces (must stay depth-sorted).
// Usage (from roxy3d/): node marquee/light_stats.mjs
import fs from 'node:fs';
import { readPng } from './png_io.mjs';

const m = JSON.parse(fs.readFileSync('out10m/marquee.json', 'utf8'));
const std = (k) => [13, 38, 63, 88].includes(k % 100);   // a plain 0.25-tile depth band (others are tied to one occluder)
for (const kind of ['marquee_light', 'marquee_shadow']) {
  let n = 0, nstd = 0, elevSlices = 0, elevArea = 0, gsum = 0, esum = 0, below = 0, area = 0;
  const rows = [];
  for (const r of m.render_layers.filter((x) => x.parent === kind)) {
    n++;
    const im = readPng('out10m/' + r.file);
    if (im.w !== r.w || im.h !== r.h) console.log('size mismatch', r.name, im.w, im.h, r.w, r.h);
    const key = r.depth_sort_key;
    const isStd = std(key);
    if (isStd) nstd++;
    const band = Math.floor((key - 1000) / 25);
    const y0 = 350 + 7.5 * band, y1 = y0 + 7.5;
    let g = 0, e = 0, bl = 0, ex0 = 1e9, ey0 = 1e9, ex1 = -1, ey1 = -1;
    for (let y = 0; y < im.h; y++) {
      for (let x = 0; x < im.w; x++) {
        const d = (y * im.w + x) * 4;
        const v = kind === 'marquee_light' ? Math.max(im.rgba[d], im.rgba[d + 1], im.rgba[d + 2]) : im.rgba[d + 3];
        if (!v) continue;
        const sy = r.y + y;
        if (isStd && sy >= Math.floor(y0) - 1 && sy <= Math.ceil(y1)) g += v;
        else {
          e += v;
          if (sy > y1) bl += v;
          if (x < ex0) ex0 = x;
          if (x > ex1) ex1 = x;
          if (y < ey0) ey0 = y;
          if (y > ey1) ey1 = y;
        }
      }
    }
    gsum += g;
    esum += e;
    below += bl;
    area += r.w * r.h;
    if (e > 0) { elevSlices++; elevArea += (ex1 - ex0 + 1) * (ey1 - ey0 + 1); }
    rows.push([r.name, isStd ? 'std' : 'occ', r.w + 'x' + r.h, 'y' + r.y, 'stripe', Math.floor(y0) + '-' + Math.ceil(y1), 'g', g, 'e', e,
      e ? (ex1 - ex0 + 1) + 'x' + (ey1 - ey0 + 1) + '@y' + (r.y + ey0) : '-', (r.existing_receiver_parents || []).join(',')].join(' '));
  }
  console.log(kind, 'slices', n, 'std', nstd, 'area', area, 'groundSum', gsum, 'elevSum', esum, 'belowStripe', below,
    'slicesWithElev', elevSlices, 'elevBBoxArea', elevArea);
  if (process.argv.includes('--rows')) console.log(rows.join('\n'));
}
