// Marquee layer pack (out10m): one shadow and one light piece per sprite the marquee's shadow and light fall on
// (11 Nov 2026). Second, lighter layer set next to out10m/merged (merge_layers.mjs, 10 Nov), which stays as it is.
//
// Why: merged/ still has 451 blended (plus-lighter) light pieces, one per (depth slice, sprite). Each blended element
// that sits between other z-levels is drawn in a pass of its own; with the life round on top the lobby page could no
// longer hold 60 fps (page frames late in 90-139 of ~420 per camera step; with 76 of the 451 shown it was clean;
// roxy3d/qa-night/tools/res/run_pins_11nov.txt). The pieces cannot share an element as they are: every depth slice
// has its own z-level.
//
// What changes: every shadow / light pixel goes to the picture it actually lies on, its "receiver": the topmost
// static picture at or below the slice's depth at that pixel (out10 occluders and their depth slices, the marquee
// body slices, a door, the source-over pieces of the poster and props packs). No receiver = the ground or the
// background art: those pixels join the layers under all walkers, as in merged/. Per receiver there is then one
// shadow piece (source-over) and one light piece (plus-lighter) directly above it, at the lowest slice depth among
// their pixels. Against every static picture this is the same stack as before (checked below by putting both stacks
// together). What differs: a walker standing between a sprite and the depth of the light that lies on it used to
// have that light (or shadow) drawn over him; now he covers it, like the sprite's own pixels he stands in front of.
//
// Writes out10m/merged2/ and out10m/merged2.json (1x and @2x; same layer format as merged.json; nothing else in the
// pack is touched). Light pieces that are render noise (no pixel above NOISE of 255 at either resolution) are left
// out and listed.
//
// Usage (from roxy3d/): node marquee/merge_light2.mjs [--dry]
import fs from 'node:fs';
import crypto from 'node:crypto';
import { readPng, writePng } from './png_io.mjs';

const DRY = process.argv.includes('--dry');
const NOISE = Number(process.env.MQ_NOISE ?? 2);
const OUT10 = 'out10/', M = 'out10m/', NAME = 'merged2', DEST = `${M}${NAME}/`;
const lobby = JSON.parse(fs.readFileSync(OUT10 + 'manifest.json', 'utf8'));
const marq = JSON.parse(fs.readFileSync(M + 'marquee.json', 'utf8'));
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const extra = [['out10l/', readJson('out10l/leader.json')], ['out10p/', readJson('out10p/props.json')]];
const two = (f) => f.replace(/\.png$/, '@2x.png');
const KINDS = [['marquee_shadow', 'shadow'], ['marquee_light', 'light']];
const MARQ_ORD = 1e6;   // DOM order: out10 occluders and the body come before the marquee layers, the other packs after

// the page's static source-over pictures (lobby.html setupArt), with their z-index and DOM order
function receivers(scale) {
  const list = []; let ord = 0;
  const add = (kind, name, r, file, z, o = {}) => {
    const im = file ? readPng(file) : null;
    if (im && (im.w !== r.w * scale || im.h !== r.h * scale)) throw new Error(`${file}: ${im.w}x${im.h}, expected ${r.w * scale}x${r.h * scale}`);
    list.push({ id: list.length, kind, name, x: r.x * scale, y: r.y * scale, w: r.w * scale, h: r.h * scale, z, im, ord: o.after ? MARQ_ORD + 1 + ord++ : ord++, clip: !!o.clip, r });
  };
  const pick = (dir, r) => dir + (scale === 2 ? r.file_2x || two(r.file) : r.file);
  for (const o of lobby.occluders) {
    const sl = Array.isArray(o.depth_slices) && o.depth_slices.length ? o.depth_slices : null;
    // a sliced occluder's whole picture goes underneath at its lowest slice depth (the page does the same)
    const parts = sl && typeof o.file === 'string' && [o.x, o.y, o.w, o.h].every(Number.isFinite)
      ? [{ ...o, z_index: Math.min(...sl.map((s) => s.z_index ?? o.z_index)) }, ...sl] : sl || [o];
    parts.forEach((s, i) => {
      if (!s || typeof s.file !== 'string' || ![s.x, s.y, s.w, s.h].every(Number.isFinite)) return;
      add('occluder', `${o.name}${sl ? (parts.length > sl.length ? (i ? `_${String(i - 1).padStart(2, '0')}` : '_whole') : `_${String(i).padStart(2, '0')}`) : ''}`,
        s, pick(OUT10, s), s.z_index ?? o.z_index, { clip: /occ_restroom_side_wall_01\.png$/.test(s.file) && s.w === 159 && s.h === 99 });
    });
  }
  for (const r of marq.render_layers.filter((x) => x.parent === 'marquee_body')) add('body', r.name, r, pick(M, r), r.z_index);
  for (const d of [...(lobby.door_anims || []), ...(lobby.restroom?.stalls || []).map((s) => s.door_anim), lobby.restroom?.door_anim]) {
    if (d && [d.x, d.y, d.w, d.h].every(Number.isFinite)) add('door', `door_${d.id}`, d, null, d.z_index ?? 900);
  }
  for (const [dir, f] of extra) {
    for (const l of f?.render_layers || []) {
      if (!l || l.under || l.blend !== 'source-over' || typeof l.file !== 'string' || ![l.x, l.y, l.w, l.h].every(Number.isFinite)) continue;
      add('pack', l.name, l, pick(dir, l), l.z_index, { after: true });
    }
  }
  return list;
}
// alpha of a receiver at a stage pixel (a door is its whole rect: its picture changes while it swings)
function alphaAt(e, sx, sy, scale) {
  const x = sx - e.x, y = sy - e.y;
  if (x < 0 || y < 0 || x >= e.w || y >= e.h) return 0;
  if (!e.im) return 255;
  if (e.clip && x >= 143 * scale && y >= 10 * scale) return 0;   // the page's clip-path on this restroom wall slice
  return e.im.rgba[(y * e.im.w + x) * 4 + 3];
}

function build(scale) {
  const W = 1920 * scale, H = 1080 * scale;
  const recv = receivers(scale);
  const out = { recv, kinds: {}, scale, shadowOverLight: 0 };
  const zAt = { shadow: new Map(), light: new Map() };   // stage pixel -> slice z, to compare shadow and light depth
  for (const [kind, pk] of KINDS) {
    const light = kind === 'marquee_light';
    const P = marq.parents[pk];
    const pw = P.w * scale, ph = P.h * scale, px0 = P.x * scale, py0 = P.y * scale;
    const under = Buffer.alloc(pw * ph * 4), sum = Buffer.alloc(pw * ph * 4);
    const pieces = new Map();   // receiver id -> { px: [sx, sy, r, g, b, a], zMin, max }
    let underN = 0;
    for (const r of marq.render_layers.filter((x) => x.parent === kind)) {
      const f = M + (scale === 2 ? r.file_2x || two(r.file) : r.file);
      const im = readPng(f);
      if (im.w !== r.w * scale || im.h !== r.h * scale) throw new Error(`${f}: size`);
      const x0 = r.x * scale, y0 = r.y * scale;
      // receivers that can lie under this slice: at or below its depth and touching its rect, topmost first
      const cand = recv.filter((e) => (e.z < r.z_index || (e.z === r.z_index && e.ord < MARQ_ORD)) && e.x < x0 + im.w && x0 < e.x + e.w && e.y < y0 + im.h && y0 < e.y + e.h)
        .sort((a, b) => b.z - a.z || b.ord - a.ord);
      for (let y = 0; y < im.h; y++) {
        for (let x = 0; x < im.w; x++) {
          const s = (y * im.w + x) * 4;
          const v = light ? Math.max(im.rgba[s], im.rgba[s + 1], im.rgba[s + 2]) : im.rgba[s + 3];
          if (!v) continue;
          const sx = x0 + x, sy = y0 + y;
          if (sx < px0 || sy < py0 || sx >= px0 + pw || sy >= py0 + ph) throw new Error(`${r.name}: outside its parent`);
          const d = ((sy - py0) * pw + (sx - px0)) * 4;
          if (sum[d + 3]) throw new Error(`${r.name}: slices overlap at ${sx},${sy}`);
          const a = light ? 255 : im.rgba[s + 3];
          sum[d] = im.rgba[s]; sum[d + 1] = im.rgba[s + 1]; sum[d + 2] = im.rgba[s + 2]; sum[d + 3] = a;
          if (sx < W && sy < H) zAt[light ? 'light' : 'shadow'].set(sy * W + sx, r.z_index);
          let on = null;
          if (sx < W && sy < H) for (const e of cand) if (alphaAt(e, sx, sy, scale)) { on = e; break; }
          if (!on) { sum.copy(under, d, d, d + 4); underN++; continue; }
          let g = pieces.get(on.id);
          if (!g) pieces.set(on.id, g = { on, px: [], zMin: Infinity, max: 0 });
          if (v > g.max) g.max = v;
          if (r.z_index < g.zMin) g.zMin = r.z_index;
          g.px.push(sx, sy, im.rgba[s], im.rgba[s + 1], im.rgba[s + 2], a);
        }
      }
    }
    out.kinds[kind] = { P, pw, ph, px0, py0, under, sum, pieces, underN, light };
  }
  for (const [k, zs] of zAt.shadow) { const zl = zAt.light.get(k); if (zl !== undefined && zs > zl) out.shadowOverLight++; }
  return out;
}

const B = { 1: build(1), 2: build(2) };
for (const sc of [1, 2]) if (B[sc].shadowOverLight) console.log(`note: ${B[sc].shadowOverLight} pixels at ${sc}x have their shadow in front of their light`);
const layers = [], dropped = [], jobs = [];
const names = B[1].recv.map((e) => e.name);
// per receiver: the depth both its pieces go to = the lowest slice depth among their pixels at either resolution
const zOf = new Map();
for (const sc of [1, 2]) for (const [kind] of KINDS) for (const [id, g] of B[sc].kinds[kind].pieces) zOf.set(id, Math.min(zOf.get(id) ?? Infinity, g.zMin));
for (const [kind] of KINDS) {
  const k1 = B[1].kinds[kind], k2 = B[2].kinds[kind];
  const uname = k1.light ? 'under_light' : 'under_shadow';
  jobs.push({ rel: `${uname}.png`, w: k1.pw, h: k1.ph, buf: k1.under, alpha: !k1.light }, { rel: `${uname}@2x.png`, w: k2.pw, h: k2.ph, buf: k2.under, alpha: !k2.light });
  layers.push({ name: uname, under: true, file: `${NAME}/${uname}.png`, file_2x: `${NAME}/${uname}@2x.png`, x: k1.P.x, y: k1.P.y, w: k1.P.w, h: k1.P.h, blend: k1.P.blend });
}
// shadow pieces first, then light pieces: at the same z-index the page's DOM order puts the light over the shadow
for (const [kind] of KINDS) {
  const k1 = B[1].kinds[kind], k2 = B[2].kinds[kind];
  const ids = [...new Set([...k1.pieces.keys(), ...k2.pieces.keys()])].sort((a, b) => zOf.get(a) - zOf.get(b) || a - b);
  for (const id of ids) {
    const p1 = k1.pieces.get(id), p2 = k2.pieces.get(id), on = (p1 || p2).on;
    const name = `${k1.light ? 'light' : 'shadow'}_on_${names[id]}`;
    if (k1.light && (p1?.max || 0) <= NOISE && (p2?.max || 0) <= NOISE) {
      dropped.push({ name, on: names[id], max_1x: p1?.max || 0, max_2x: p2?.max || 0, pixels_1x: (p1?.px.length || 0) / 6, pixels_2x: (p2?.px.length || 0) / 6 });
      for (const q of [p1, p2]) if (q) q.dropped = true;
      continue;
    }
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
      jobs.push({ rel: `on/${name}${sc === 2 ? '@2x' : ''}.png`, w: w * sc, h: h * sc, buf, alpha: !k1.light });
    }
    layers.push({ name, on: names[id], on_kind: on.kind, on_z: on.z, file: `${NAME}/on/${name}.png`, file_2x: `${NAME}/on/${name}@2x.png`, x: x0, y: y0, w, h, z_index: zOf.get(id), blend: k1.P.blend });
  }
}
const blended = layers.filter((l) => l.blend === 'plus-lighter');
console.log(`layers ${layers.length}: blended ${blended.length} (rect area ${blended.reduce((a, l) => a + l.w * l.h, 0)} px; merged/ has 452 / 1.52 M), `
  + `source-over ${layers.length - blended.length}; noise pieces left out ${dropped.length}`);
const byKind = {}; for (const l of blended) if (!l.under) byKind[l.on_kind] = (byKind[l.on_kind] || 0) + 1;
console.log('light pieces by receiver kind: ' + JSON.stringify(byKind));

// ---- check 1, on the buffers: the layers put back together equal the slices put together, except the listed noise ----
const validation = {};
const readBack = DRY ? (j) => ({ w: j.w, h: j.h, rgba: j.buf }) : null;
if (!DRY) {
  fs.rmSync(DEST, { recursive: true, force: true });
  fs.mkdirSync(DEST + 'on', { recursive: true });
}
const files = [];
const byRel = new Map(jobs.map((j) => [`${NAME}/${j.rel}`, j]));
for (const j of jobs) {
  if (DRY) continue;
  writePng(DEST + j.rel, j.w, j.h, j.buf, j.alpha);
  const b = fs.readFileSync(DEST + j.rel);
  files.push({ file: `${NAME}/${j.rel}`, bytes: b.length, sha256: crypto.createHash('sha256').update(b).digest('hex') });
}
const load = (rel) => (DRY ? readBack(byRel.get(rel)) : readPng(M + rel));
for (const sc of [1, 2]) {
  for (const [kind] of KINDS) {
    const k = B[sc].kinds[kind];
    const back = Buffer.alloc(k.pw * k.ph * 4);
    for (const l of layers.filter((x) => (x.blend === 'plus-lighter') === k.light)) {
      const im = load(sc === 2 ? l.file_2x : l.file);
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

// ---- check 2: both stacks put together over two flat backgrounds (static pictures only): slices at their own depth
// against the new layers. Per colour channel, in 0..255, clamped after every additive layer like the compositor.
function stackCheck(sc) {
  const b = B[sc], S = b.kinds.marquee_shadow, L = b.kinds.marquee_light;
  const X0 = Math.min(S.px0, L.px0), Y0 = Math.min(S.py0, L.py0), X1 = Math.max(S.px0 + S.pw, L.px0 + L.pw), Y1 = Math.max(S.py0 + S.ph, L.py0 + L.ph);
  const w = X1 - X0, h = Y1 - Y0;
  const over = (dst, im, ex, ey, clipFn) => {
    for (let y = 0; y < im.h; y++) { const sy = ey + y - Y0; if (sy < 0 || sy >= h) continue;
      for (let x = 0; x < im.w; x++) { const sx = ex + x - X0; if (sx < 0 || sx >= w) continue;
        const s = (y * im.w + x) * 4; let a = im.rgba[s + 3]; if (!a || (clipFn && clipFn(x, y))) continue; a /= 255;
        const d = (sy * w + sx) * 3;
        dst[d] = im.rgba[s] * a + dst[d] * (1 - a); dst[d + 1] = im.rgba[s + 1] * a + dst[d + 1] * (1 - a); dst[d + 2] = im.rgba[s + 2] * a + dst[d + 2] * (1 - a); } }
  };
  const plus = (dst, im, ex, ey) => {
    for (let y = 0; y < im.h; y++) { const sy = ey + y - Y0; if (sy < 0 || sy >= h) continue;
      for (let x = 0; x < im.w; x++) { const sx = ex + x - X0; if (sx < 0 || sx >= w) continue;
        const s = (y * im.w + x) * 4, d = (sy * w + sx) * 3;
        dst[d] = Math.min(255, dst[d] + im.rgba[s]); dst[d + 1] = Math.min(255, dst[d + 1] + im.rgba[s + 1]); dst[d + 2] = Math.min(255, dst[d + 2] + im.rgba[s + 2]); } }
  };
  const recvEls = b.recv.filter((e) => e.im).map((e) => ({ z: e.z, ord: e.ord, draw: (dst) => over(dst, e.im, e.x, e.y, e.clip ? (x, y) => x >= 143 * sc && y >= 10 * sc : null) }));
  let mo = 0;
  const oldEls = marq.render_layers.filter((r) => r.parent === 'marquee_shadow' || r.parent === 'marquee_light').map((r) => {
    const im = readPng(M + (sc === 2 ? r.file_2x || two(r.file) : r.file));
    return { z: r.z_index, ord: MARQ_ORD + (mo++) / 1e4, draw: (dst) => (r.parent === 'marquee_light' ? plus : over)(dst, im, r.x * sc, r.y * sc) };
  });
  mo = 0;
  const newEls = layers.map((l) => {
    const im = load(sc === 2 ? l.file_2x : l.file);
    // "under" layers sit under every walker and sprite (the page: z-index 5, shadow before light)
    return { z: l.under ? 5 : l.z_index, ord: l.under ? -1 + (mo++) / 1e4 : MARQ_ORD + (mo++) / 1e4, draw: (dst) => (l.blend === 'plus-lighter' ? plus : over)(dst, im, l.x * sc, l.y * sc) };
  });
  const run = (els, bg) => { const dst = new Float32Array(w * h * 3).fill(bg); for (const e of [...els].sort((a, c) => a.z - c.z || a.ord - c.ord)) e.draw(dst); return dst; };
  let max = 0, over1 = 0, over3 = 0;
  for (const bg of [70, 200]) {
    const a = run([...recvEls, ...oldEls], bg), c = run([...recvEls, ...newEls], bg);
    for (let i = 0; i < a.length; i++) { const d = Math.abs(a[i] - c[i]); if (d > max) max = d; if (d > 1) over1++; if (d > 3) over3++; }
  }
  return { region: [X0 / sc, Y0 / sc, w / sc, h / sc], max_difference: +max.toFixed(2), channel_values_over_1: over1, channel_values_over_3: over3, pass: max <= NOISE + 0.5 };
}
for (const sc of [1, 2]) validation[`stack_${sc}x`] = stackCheck(sc);
validation.shadow_in_front_of_light_pixels = { '1x': B[1].shadowOverLight, '2x': B[2].shadowOverLight };
console.log(JSON.stringify(validation, null, 1));
if (!Object.values(validation).every((v) => v.pass !== false)) { console.error('VALIDATION FAILED'); process.exit(1); }
if (DRY) process.exit(0);
fs.writeFileSync(`${M}${NAME}.json`, JSON.stringify({
  schema: 'dinkdonk-marquee-merged/2', date: '2026-11-11', built_by: 'marquee/merge_light2.mjs',
  note: 'Replaces every marquee_shadow / marquee_light entry of marquee.json render_layers, like merged.json, with fewer pieces: '
    + '"under" layers go under all walkers (shadow first, then light); every other piece is all the shadow or light that lies on one '
    + 'picture ("on"), at z_index = the lowest slice depth among its pixels, shadow pieces listed before light pieces. '
    + 'Body slices and prop loops are unchanged.',
  noise_threshold: NOISE, layers, dropped_noise: dropped, validation, files,
}, null, 1) + '\n');
console.log(`wrote ${files.length} files and ${NAME}.json`);
