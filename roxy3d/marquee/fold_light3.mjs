// Marquee layer pack (out10m): the marquee's shadow and light folded into the plain wall pictures they lie on
// (perf, 23 Nov 2026). Third, lighter layer set next to out10m/merged2 (merge_light2.mjs, 11 Nov), which stays as it is.
//
// Why: merged2 puts one shadow piece (an <img>) and one light piece (a canvas layer) right above every picture the
// marquee's shadow and light fall on. Each is one more thing the browser draws on every frame; a canvas is always a
// layer of its own and also forces the wall pictures around it onto layers. For a plain wall picture the three can be
// one ordinary picture:
//   old stack over a backdrop B:  ((P over B) with the shadow S over it) + the light L
//   folded picture F:             colour x alpha  C = c*a*(1-s) + cs*s + l ,  alpha  A = 1 - (1-a)*(1-s)
// F over B gives the same pixel as long as a PNG can hold it (C <= A; it cannot where light falls on a see-through
// part of the picture). Every receiver is checked at 1x and @2x against black, grey and white backdrops, with the
// browser's rounding after each of its three draws; one that differs by more than TOL (2 of 255, the tolerance
// merged2 was accepted with) is left as it is and listed under "skipped".
//
// Not folded, on purpose: pictures the page fades or switches (the marquee's own canopy slices and the front glass
// go see-through when the camera zooms in; doors swing; the poster / props packs have their own states; the restroom
// wall slice with a clip-path), and anything not in this base pack.
// Also left alone: a picture with another still picture between it and its pieces (merged2 was made from the out10
// pack; a few pictures moved in later packs, and there the old stack lays the light over the newer picture).
// What differs: a walker whose depth lies between a picture and the depth merged2 gave its pieces (2 units for most)
// used to have that light drawn over him; now he covers it, like the rest of the picture.
//
// Writes out10m/fold3/ (same file names as the base pack's pictures, 1x and @2x) and out10m/fold3.json; nothing else
// is touched. Usage (from roxy3d/): node marquee/fold_light3.mjs [--dry]   env FOLD_BASE=out10s FOLD_TOL=2
import fs from 'node:fs';
import crypto from 'node:crypto';
import { readPng, writePng } from './png_io.mjs';

const DRY = process.argv.includes('--dry');
const BASE = (process.env.FOLD_BASE || 'out10s').replace(/[^a-z0-9_-]/gi, ''), TOL = Number(process.env.FOLD_TOL ?? 2);
// FOLD_FADE=1: the second, optional set fold3f = the pictures the page fades when the camera zooms in (the marquee's
// canopy slices, the front glass). Folded, their shadow and light fade WITH them; as separate pieces they stay at full
// strength over the see-through canopy. A change of look, so it is its own set (lobby.html ?mqfold=2).
const FADE = process.env.FOLD_FADE === '1';
const PACK = BASE + '/', M = 'out10m/', NAME = FADE ? 'fold3f' : 'fold3', DEST = `${M}${NAME}/`;
const manifestText = fs.readFileSync(PACK + 'manifest.json');
const lobby = JSON.parse(manifestText);
const merged2 = JSON.parse(fs.readFileSync(M + 'merged2.json', 'utf8'));
const two = (f) => f.replace(/\.png$/, '@2x.png');
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');

// the page's occluder pictures under the names merge_light2.mjs gave them (lobby.html setupArt)
const recv = new Map();
for (const o of lobby.occluders) {
  const sl = Array.isArray(o.depth_slices) && o.depth_slices.length ? o.depth_slices : null;
  const parts = sl && typeof o.file === 'string' && [o.x, o.y, o.w, o.h].every(Number.isFinite)
    ? [{ ...o, z_index: Math.min(...sl.map((s) => s.z_index ?? o.z_index)) }, ...sl] : sl || [o];
  parts.forEach((s, i) => {
    if (!s || typeof s.file !== 'string' || ![s.x, s.y, s.w, s.h].every(Number.isFinite)) return;
    const name = `${o.name}${sl ? (parts.length > sl.length ? (i ? `_${String(i - 1).padStart(2, '0')}` : '_whole') : `_${String(i).padStart(2, '0')}`) : ''}`;
    recv.set(name, { ...s, z: s.z_index ?? o.z_index, occ: o.name, anim: s.anim || o.anim, dir: PACK });
  });
}
// every picture that stands still in the page's depth stack (per scale): the pack's pictures, the marquee's canopy,
// the poster and props packs' source-over pieces, and the doors as their whole rect (their picture changes)
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const marq = readJson(M + 'marquee.json') || {};
const statics = { 1: null, 2: null };
function staticsAt(sc) {
  if (statics[sc]) return statics[sc];
  const list = [];
  const add = (name, r, file, z, late = false) => { const im = file && fs.existsSync(file) ? readPng(file) : null; list.push({ ord: list.length, late, name, x: r.x * sc, y: r.y * sc, w: r.w * sc, h: r.h * sc, z, im: im && im.w === r.w * sc && im.h === r.h * sc ? im : null }); };
  for (const [name, r] of recv) if (r.dir === PACK) add(name, r, PACK + (sc === 2 ? r.file_2x || two(r.file) : r.file), r.z);
  const body = (marq.render_layers || []).filter((x) => x.parent === 'marquee_body');
  for (const r of body) add(r.name, r, M + (sc === 2 ? r.file_2x || two(r.file) : r.file), r.z_index);
  if (marq.parents?.body && body.length) add('marquee_body_whole', marq.parents.body, M + (sc === 2 ? marq.parents.body.file_2x || two(marq.parents.body.file) : marq.parents.body.file), Math.min(...body.map((r) => r.z_index)));
  for (const [dir, f] of [['out10l/', readJson('out10l/leader.json')], [lobby.claw ? 'out10ps/' : 'out10p/', readJson((lobby.claw ? 'out10ps/' : 'out10p/') + 'props.json')]])
    for (const l of f?.render_layers || []) if (l && !l.under && l.blend === 'source-over' && typeof l.file === 'string' && Number.isFinite(l.z_index)) add(l.name, l, dir + (sc === 2 ? l.file_2x || two(l.file) : l.file), l.z_index, true);   // (late: after the marquee's pieces in the page)
  for (const d of [...(lobby.door_anims || []), ...(lobby.restroom?.stalls || []).map((x) => x.door_anim), lobby.restroom?.door_anim])
    if (d && [d.x, d.y, d.w, d.h].every(Number.isFinite)) add('door_' + d.id, d, null, d.z_index ?? 900);
  return (statics[sc] = list);
}
const alphaOf = (e, sx, sy) => { const x = sx - e.x, y = sy - e.y; return x < 0 || y < 0 || x >= e.w || y >= e.h ? 0 : e.im ? e.im.rgba[(y * e.im.w + x) * 4 + 3] : 255; };
const why = (name, g, r) => {
  const fades = g.kind === 'body' || /^(glass_left|glass_right)/.test(name);
  if (FADE !== fades) return fades ? 'fades when the camera zooms in (set fold3f)' : 'in the set fold3';
  if (FADE && g.kind === 'body') return r ? '' : 'not in marquee.json';
  if (FADE) return r ? '' : `not in ${BASE}`;
  if (g.kind !== 'occluder') return `a ${g.kind} picture (it has states of its own)`;
  if (/^(glass_left|glass_right)/.test(name)) return 'front glass: fades when the camera zooms in';
  if (/^(arcade|claw_body)/.test(name)) return 'not shown with the claw machine art';
  if (!r) return `not in ${BASE}`;
  if (r.occ === 'entrance_neon' || r.anim) return 'the page switches or animates it';
  if (/occ_restroom_side_wall_01\.png$/.test(r.file) && r.w === 159 && r.h === 99) return 'the page clips it';
  return '';
};
for (const r of (JSON.parse(fs.readFileSync(M + 'marquee.json', 'utf8')).render_layers || []).filter((x) => x.parent === 'marquee_body')) recv.set(r.name, { ...r, z: r.z_index, occ: 'marquee_body', dir: M });
const groups = new Map();
for (const l of merged2.layers) { if (l.under) continue; const g = groups.get(l.on) || { kind: l.on_kind }; g[l.blend === 'plus-lighter' ? 'L' : 'S'] = l; groups.set(l.on, g); }

const layers = [], skipped = [], jobs = [], seen = new Set();
let worstAll = 0;
for (const [name, g] of groups) {
  const r = recv.get(name), w0 = why(name, g, r), pieces = [g.S, g.L].filter(Boolean).map((l) => l.name);
  if (w0) { skipped.push({ on: name, pieces, why: w0 }); continue; }
  const base = r.file.replace(/^.*\//, '');
  if (seen.has(base)) throw new Error(`${name}: two receivers share the file name ${base}`);
  let worst = 0, over = 0, between = 0; const out = [], betweenWho = new Set();
  const zPiece = Math.max(...[g.S, g.L].filter(Boolean).map((l) => l.z_index));
  for (const sc of [1, 2]) {
    const P = readPng(r.dir + (sc === 2 ? r.file_2x || two(r.file) : r.file));
    if (P.w !== r.w * sc || P.h !== r.h * sc) throw new Error(`${name}: picture is ${P.w}x${P.h}, expected ${r.w * sc}x${r.h * sc}`);
    const get = (l) => { if (!l) return null; const im = readPng(M + (sc === 2 ? l.file_2x : l.file));
      if (im.w !== l.w * sc || im.h !== l.h * sc) throw new Error(`${l.name}: size`); return { im, x: (l.x - r.x) * sc, y: (l.y - r.y) * sc }; };
    const S = get(g.S), L = get(g.L);
    // a piece must lie inside its picture (a lit or shadowed pixel outside would be lost)
    for (const q of [S, L]) if (q) for (let y = 0; y < q.im.h; y++) for (let x = 0; x < q.im.w; x++) {
      const i = (y * q.im.w + x) * 4;
      if (q.im.rgba[i + 3] && (q.im.rgba[i] || q.im.rgba[i + 1] || q.im.rgba[i + 2] || q === S) && (q.x + x < 0 || q.y + y < 0 || q.x + x >= P.w || q.y + y >= P.h)) worst = 255;
    }
    const at = (q, x, y) => { if (!q) return -1; const xx = x - q.x, yy = y - q.y; return xx < 0 || yy < 0 || xx >= q.im.w || yy >= q.im.h ? -1 : (yy * q.im.w + xx) * 4; };
    // other pictures at or above this one and at or below its pieces: where one of them covers a lit or shadowed
    // pixel, the old stack draws the shadow and light over IT, so folding would change the picture
    const X0 = r.x * sc, Y0 = r.y * sc;
    // (same depth: the page's own order decides; a wall's whole picture comes before its slices, the other packs after the marquee's pieces)
    const me = staticsAt(sc).find((e) => e.name === name);
    const cand = staticsAt(sc).filter((e) => e.name !== name && (e.z > r.z || (e.z === r.z && e.ord > me.ord)) && (e.z < zPiece || (e.z === zPiece && !e.late)) && e.x < X0 + P.w && X0 < e.x + e.w && e.y < Y0 + P.h && Y0 < e.y + e.h);
    const F = Buffer.from(P.rgba);   // untouched pixels stay byte for byte
    for (let y = 0; y < P.h; y++) for (let x = 0; x < P.w; x++) {
      const i = (y * P.w + x) * 4, si = at(S, x, y), li = at(L, x, y);
      const s = si < 0 ? 0 : S.im.rgba[si + 3] / 255, la = li < 0 ? 0 : L.im.rgba[li + 3] / 255;
      if (!s && !la) continue;
      if ((s || (li >= 0 && (L.im.rgba[li] || L.im.rgba[li + 1] || L.im.rgba[li + 2]))) && cand.length) for (const e of cand) if (alphaOf(e, X0 + x, Y0 + y)) { between++; betweenWho.add(e.name); break; }
      const a = P.rgba[i + 3] / 255, A = 1 - (1 - a) * (1 - s), A8 = Math.round(A * 255);
      F[i + 3] = A8;
      for (let c = 0; c < 3; c++) {
        const col = P.rgba[i + c] / 255, cs = si < 0 ? 0 : S.im.rgba[si + c] / 255, l = li < 0 ? 0 : (L.im.rgba[li + c] / 255) * la;
        const C = col * a * (1 - s) + cs * s + l;
        if (C > A + 0.5 / 255) over++;
        const c8 = A8 ? Math.min(255, Math.round((C / (A8 / 255)) * 255)) : 0;
        F[i + c] = c8;
        for (const B of [0, 0.5, 1]) {
          let o = Math.round((col * a + B * (1 - a)) * 255) / 255;          // the picture
          o = Math.round((cs * s + o * (1 - s)) * 255) / 255;               // its shadow piece
          o = Math.min(255, Math.round((o + l) * 255));                     // its light piece
          const n = Math.min(255, Math.round(((c8 / 255) * (A8 / 255) + B * (1 - A8 / 255)) * 255));
          const d = Math.abs(o - n); if (d > worst) worst = d;
        }
      }
    }
    out.push({ rel: sc === 2 ? two(base) : base, w: P.w, h: P.h, buf: F });
  }
  if (between) { skipped.push({ on: name, pieces, why: `another picture (${[...betweenWho].slice(0, 3).join(', ')}) lies between it and its pieces at ${between} lit or shadowed pixels` }); continue; }
  if (worst > TOL) { skipped.push({ on: name, pieces, why: worst === 255 ? 'a piece reaches outside its picture or light falls on a see-through part' : `light falls on a see-through part of the picture (differs by up to ${worst} of 255)` }); continue; }
  seen.add(base); jobs.push(...out); if (worst > worstAll) worstAll = worst;
  layers.push({ on: name, replaces: r.file, file: `${NAME}/${base}`, file_2x: `${NAME}/${two(base)}`, x: r.x, y: r.y, w: r.w, h: r.h, z_index: r.z, pieces, max_difference: worst, values_clipped: over });
}
const files = [];
if (!DRY) { fs.rmSync(DEST, { recursive: true, force: true }); fs.mkdirSync(DEST, { recursive: true }); }
for (const j of jobs) { if (!DRY) { writePng(DEST + j.rel, j.w, j.h, j.buf, true); const b = fs.readFileSync(DEST + j.rel); files.push({ file: `${NAME}/${j.rel}`, bytes: b.length, sha256: sha(b) });
  const back = readPng(DEST + j.rel); if (back.w !== j.w || back.h !== j.h || !back.rgba.equals(j.buf)) throw new Error(`${j.rel}: does not read back as written`); } }
const piecesAway = layers.reduce((n, l) => n + l.pieces.length, 0);
const doc = { schema: 'marquee-fold-1', date: new Date().toISOString().slice(0, 10), built_by: 'marquee/fold_light3.mjs',
  note: 'For each entry of "layers": the base pack picture "replaces" is shown as "file" instead (the same picture with the marquee\'s shadow and light on it), and the merged2 pieces named in "pieces" are left out. Applies only with the base pack named in "base" and with out10m/merged2.json; everything in "skipped" stays as merged2 has it.',
  base: { dir: BASE, manifest_sha256: sha(manifestText) }, merged2_sha256: sha(fs.readFileSync(M + 'merged2.json')), tolerance: TOL,
  layers, skipped, validation: { receivers_folded: layers.length, pieces_left_out: piecesAway, pieces_kept: skipped.reduce((n, s) => n + s.pieces.length, 0), max_difference: worstAll, backdrops: ['black', 'grey', 'white'], scales: [1, 2], pass: worstAll <= TOL }, files };
if (!DRY) fs.writeFileSync(`${M}${NAME}.json`, JSON.stringify(doc, null, 1) + '\n');
console.log(`${DRY ? '(dry) ' : ''}${NAME}: ${layers.length} pictures folded, ${piecesAway} pieces left out, ${doc.validation.pieces_kept} kept; worst difference ${worstAll}/255; ${files.length} files, ${(files.reduce((n, f) => n + f.bytes, 0) / 1e6).toFixed(1)} MB`);
for (const s of skipped.filter((x) => !/^a (body|pack|door)/.test(x.why) && !/front glass|claw machine|set fold3/.test(x.why))) console.log(`  skipped ${s.on}: ${s.why}`);
