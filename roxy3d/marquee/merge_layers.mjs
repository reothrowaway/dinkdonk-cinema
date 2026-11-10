// Marquee layer pack (out10m): fewer and much smaller blended layers, same picture (10 Nov 2026).
//
// Why: the pack's receiver light is 135 plus-lighter slices (9.5 M px of rects). Chrome draws every blended element
// that sits between other z-levels in its own pass over the backdrop, and the live lobby held frames with them (perf
// check 10 Nov, roxy3d/qa-night/tools/res/marquee_30_10nov.txt). Most of that light lies on surfaces no walker can
// stand behind: the ground and the background art. A walker's sprite only ever covers ground that is further back
// than his feet, so that light (and the shadow under it) can be drawn once, under all walkers, without changing a
// pixel.
//
// What it writes (out10m/merged/ and out10m/merged.json, 1x and @2x; nothing else in the pack is touched):
//   under_shadow.png   source-over, under the walkers: every shadow pixel that is not on a sprite
//   under_light.png    plus-lighter, right above under_shadow: every light pixel that is not on a sprite
//   pin/<slice>_sh     the rest of a shadow slice (on an occluder sprite, the marquee body or a door): one cropped
//                      piece per slice at the slice's z_index (source-over is cheap)
//   pin/<slice>_s<id>  the rest of a light slice, one cropped piece per sprite it falls on, at the slice's z_index
//   merged.json        the layer list for the page (lobby.html mergeMarquee) and the checks
// "Sprite" = the page's occluder stack (out10 manifest occluders and their depth slices), the marquee body slices and
// the door rects. Light pieces that are render noise (no pixel above NOISE of 255 at either resolution) are left out
// and listed. Check, per resolution, on the written files: under + pieces equal the original slices put together,
// except exactly the listed noise.
//
// Usage (from roxy3d/): node marquee/merge_layers.mjs [--dry]
import fs from 'node:fs';
import crypto from 'node:crypto';
import { readPng, writePng } from './png_io.mjs';

const DRY = process.argv.includes('--dry');
const NOISE = Number(process.env.MQ_NOISE ?? 2);
const BY_PARENT = process.env.MQ_KEY === 'parent';   // one light piece per (slice, occluder) instead of per (slice, sprite)
const OUT10 = 'out10/', M = 'out10m/', DEST = M + 'merged/';
const lobby = JSON.parse(fs.readFileSync(OUT10 + 'manifest.json', 'utf8'));
const marq = JSON.parse(fs.readFileSync(M + 'marquee.json', 'utf8'));
const two = (f) => f.replace(/\.png$/, '@2x.png');
const KINDS = [['marquee_shadow', 'shadow'], ['marquee_light', 'light']];

function build(scale) {
  const W = 1920 * scale, H = 1080 * scale;
  const load = (dir, r) => {
    const f = dir + (scale === 2 ? r.file_2x || two(r.file) : r.file);
    const im = readPng(f);
    if (im.w !== r.w * scale || im.h !== r.h * scale) throw new Error(`${f}: ${im.w}x${im.h}, expected ${r.w * scale}x${r.h * scale}`);
    return im;
  };
  // which sprite covers each stage pixel (0 = none); the ids are the same at both resolutions (same order)
  const label = new Uint16Array(W * H);
  const names = [''];
  const cover = (name, r, im) => {
    names.push(name);
    const id = names.length - 1;
    for (let y = 0; y < r.h * scale; y++) {
      const sy = r.y * scale + y;
      if (sy < 0 || sy >= H) continue;
      for (let x = 0; x < r.w * scale; x++) {
        const sx = r.x * scale + x;
        if (sx < 0 || sx >= W) continue;
        if (!im || im.rgba[(y * im.w + x) * 4 + 3]) label[sy * W + sx] = id;
      }
    }
  };
  for (const o of lobby.occluders) {
    if (typeof o.file === 'string' && [o.x, o.y, o.w, o.h].every(Number.isFinite)) cover(o.name, o, load(OUT10, o));
    for (const s of o.depth_slices || []) cover(o.name, s, load(OUT10, s));
  }
  for (const r of marq.render_layers.filter((x) => x.parent === 'marquee_body')) cover('marquee_body', r, load(M, r));
  for (const d of [...(lobby.door_anims || []), ...(lobby.restroom?.stalls || []).map((s) => s.door_anim), lobby.restroom?.door_anim]) {
    if (d && [d.x, d.y, d.w, d.h].every(Number.isFinite)) cover('door', d, null);
  }

  const out = { names, kinds: {} };
  for (const [kind, pk] of KINDS) {
    const light = kind === 'marquee_light';
    const P = marq.parents[pk];
    const pw = P.w * scale, ph = P.h * scale, px0 = P.x * scale, py0 = P.y * scale;
    const under = Buffer.alloc(pw * ph * 4);   // parent-sized
    const sum = Buffer.alloc(pw * ph * 4);     // every slice put back: the reference
    const pieces = new Map();                  // name -> { ..., px: [stage x, stage y, r, g, b, a, ...] }
    let underN = 0;
    for (const r of marq.render_layers.filter((x) => x.parent === kind)) {
      const im = load(M, r);
      for (let y = 0; y < im.h; y++) {
        for (let x = 0; x < im.w; x++) {
          const s = (y * im.w + x) * 4;
          const v = light ? Math.max(im.rgba[s], im.rgba[s + 1], im.rgba[s + 2]) : im.rgba[s + 3];
          if (!v) continue;
          const sx = r.x * scale + x, sy = r.y * scale + y;
          if (sx < px0 || sy < py0 || sx >= px0 + pw || sy >= py0 + ph) throw new Error(`${r.name}: outside its parent`);
          const d = ((sy - py0) * pw + (sx - px0)) * 4;
          if (sum[d + 3]) throw new Error(`${r.name}: slices overlap at ${sx},${sy}`);
          const a = light ? 255 : im.rgba[s + 3];
          sum[d] = im.rgba[s]; sum[d + 1] = im.rgba[s + 1]; sum[d + 2] = im.rgba[s + 2]; sum[d + 3] = a;
          const id = sx < W && sy < H ? label[sy * W + sx] : 0;
          if (!id) { sum.copy(under, d, d, d + 4); underN++; continue; }
          const name = light ? (BY_PARENT ? `${r.name}_${names[id]}` : `${r.name}_s${id}`) : `${r.name}_sh`;
          let g = pieces.get(name);
          if (!g) pieces.set(name, g = { name, slice: r.name, on: light ? names[id] : 'sprites', z_index: r.z_index, blend: r.blend, max: 0, energy: 0, px: [] });
          if (v > g.max) g.max = v;
          g.energy += v;
          g.px.push(sx, sy, im.rgba[s], im.rgba[s + 1], im.rgba[s + 2], a);
        }
      }
    }
    out.kinds[kind] = { P, pw, ph, px0, py0, under, sum, pieces, underN, light };
  }
  return out;
}

const B = { 1: build(1), 2: build(2) };
const layers = [], dropped = [], jobs = [];   // jobs: { rel, w, h, buf, alpha }
for (const [kind] of KINDS) {
  const k1 = B[1].kinds[kind], k2 = B[2].kinds[kind];
  const uname = k1.light ? 'under_light' : 'under_shadow';
  jobs.push({ rel: `${uname}.png`, w: k1.pw, h: k1.ph, buf: k1.under, alpha: !k1.light }, { rel: `${uname}@2x.png`, w: k2.pw, h: k2.ph, buf: k2.under, alpha: !k2.light });
  layers.push({ name: uname, under: true, file: `merged/${uname}.png`, file_2x: `merged/${uname}@2x.png`, x: k1.P.x, y: k1.P.y, w: k1.P.w, h: k1.P.h, blend: k1.P.blend });
  for (const name of new Set([...k1.pieces.keys(), ...k2.pieces.keys()])) {
    const p1 = k1.pieces.get(name), p2 = k2.pieces.get(name), p = p1 || p2;
    if (k1.light && (p1?.max || 0) <= NOISE && (p2?.max || 0) <= NOISE) {
      dropped.push({ name, on: p.on, max_1x: p1?.max || 0, max_2x: p2?.max || 0, pixels_1x: (p1?.px.length || 0) / 6, pixels_2x: (p2?.px.length || 0) / 6 });
      for (const q of [p1, p2]) if (q) q.dropped = true;
      continue;
    }
    // one stage rect (1x pixels) that holds the piece at both resolutions
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [q, sc] of [[p1, 1], [p2, 2]]) {
      if (!q) continue;
      for (let i = 0; i < q.px.length; i += 6) {
        x0 = Math.min(x0, Math.floor(q.px[i] / sc)); x1 = Math.max(x1, Math.floor(q.px[i] / sc));
        y0 = Math.min(y0, Math.floor(q.px[i + 1] / sc)); y1 = Math.max(y1, Math.floor(q.px[i + 1] / sc));
      }
    }
    const w = x1 - x0 + 1, h = y1 - y0 + 1;
    for (const [q, sc] of [[p1, 1], [p2, 2]]) {
      const buf = Buffer.alloc(w * sc * h * sc * 4);
      if (k1.light) for (let t = 3; t < buf.length; t += 4) buf[t] = 255;
      if (q) for (let i = 0; i < q.px.length; i += 6) { const t = ((q.px[i + 1] - y0 * sc) * w * sc + (q.px[i] - x0 * sc)) * 4; buf[t] = q.px[i + 2]; buf[t + 1] = q.px[i + 3]; buf[t + 2] = q.px[i + 4]; buf[t + 3] = q.px[i + 5]; }
      jobs.push({ rel: `pin/${name}${sc === 2 ? '@2x' : ''}.png`, w: w * sc, h: h * sc, buf, alpha: !k1.light });
    }
    layers.push({ name, on: p.on, slice: p.slice, file: `merged/pin/${name}.png`, file_2x: `merged/pin/${name}@2x.png`, x: x0, y: y0, w, h, z_index: p.z_index, blend: p.blend });
  }
}
const blended = layers.filter((l) => l.blend === 'plus-lighter');
console.log(`layers ${layers.length}: blended ${blended.length} (rect area ${blended.reduce((a, l) => a + l.w * l.h, 0)} px, was 135 / 9490738), `
  + `source-over ${layers.length - blended.length}; noise pieces left out ${dropped.length}`);
if (DRY) process.exit(0);

fs.rmSync(DEST, { recursive: true, force: true });
fs.mkdirSync(DEST + 'pin', { recursive: true });
const files = [];
for (const j of jobs) {
  writePng(DEST + j.rel, j.w, j.h, j.buf, j.alpha);
  const b = fs.readFileSync(DEST + j.rel);
  files.push({ file: 'merged/' + j.rel, bytes: b.length, sha256: crypto.createHash('sha256').update(b).digest('hex') });
}

// ---- check on the written files: put the layers back together per resolution and compare with the slices ----
const validation = {};
for (const sc of [1, 2]) {
  for (const [kind] of KINDS) {
    const k = B[sc].kinds[kind];
    const back = Buffer.alloc(k.pw * k.ph * 4);
    for (const l of layers.filter((x) => (x.blend === 'plus-lighter') === k.light)) {
      const im = readPng(M + (sc === 2 ? l.file_2x : l.file));
      if (im.w !== l.w * sc || im.h !== l.h * sc) throw new Error(`${l.name}: written size`);
      for (let y = 0; y < im.h; y++) {
        for (let x = 0; x < im.w; x++) {
          const s = (y * im.w + x) * 4;
          const v = k.light ? Math.max(im.rgba[s], im.rgba[s + 1], im.rgba[s + 2]) : im.rgba[s + 3];
          if (!v) continue;
          const d = ((l.y * sc + y - k.py0) * k.pw + (l.x * sc + x - k.px0)) * 4;
          if (back[d + 3]) throw new Error(`${l.name}: layers overlap`);
          back[d] = im.rgba[s]; back[d + 1] = im.rgba[s + 1]; back[d + 2] = im.rgba[s + 2]; back[d + 3] = k.light ? 255 : im.rgba[s + 3];
        }
      }
    }
    const noise = Buffer.alloc(k.pw * k.ph);
    let noisePx = 0;
    for (const p of k.pieces.values()) if (p.dropped) for (let i = 0; i < p.px.length; i += 6) { noise[(p.px[i + 1] - k.py0) * k.pw + (p.px[i] - k.px0)] = 1; noisePx++; }
    let wrong = 0, missingNoise = 0;
    for (let i = 0; i < k.pw * k.ph; i++) {
      const same = back.readUInt32LE(i * 4) === k.sum.readUInt32LE(i * 4);
      if (noise[i]) { if (back[i * 4 + 3]) wrong++; else missingNoise++; } else if (!same) wrong++;
    }
    validation[`${kind}_${sc}x`] = { wrong_pixels: wrong, under_pixels: k.underN, noise_pixels_left_out: missingNoise, pass: wrong === 0 && missingNoise === noisePx };
  }
}
console.log(JSON.stringify(validation));
if (!Object.values(validation).every((v) => v.pass)) { console.error('VALIDATION FAILED'); process.exit(1); }
fs.writeFileSync(M + 'merged.json', JSON.stringify({
  schema: 'dinkdonk-marquee-merged/1', date: '2026-11-10', built_by: 'marquee/merge_layers.mjs',
  note: 'Replaces every marquee_shadow / marquee_light entry of marquee.json render_layers. "under" layers go under all walkers '
    + '(shadow first, then light, above the wet-street light); the rest keep their slice z_index. Body slices and prop loops are unchanged.',
  noise_threshold: NOISE, layers, dropped_noise: dropped, validation, files,
}, null, 1) + '\n');
console.log(`wrote ${files.length} files and merged.json`);
