// Feasibility check (23 Nov 2026, perf): can the marquee's shadow and light pieces of out10m/merged2 be folded into
// the plain wall pictures they lie on (out10s occluders), as ordinary straight-alpha PNGs?
// For each receiver: P (picture), S (shadow, source-over), L (light, plus-lighter), all at the receiver's rect.
//   old stack over a backdrop B:  ((P over B) with S over it) + L
//   folded picture F:             premultiplied C = c*a*(1-s) + l ;  alpha A = 1 - (1-a)(1-s)
// A PNG holds C only up to A (straight alpha). Reports per receiver how many pixels need C > A and by how much, and the
// largest difference old vs folded over black / grey / white once F is stored as 8-bit straight alpha.
// Usage (from roxy3d/): node marquee/fold_check.mjs [pack=out10s]
import fs from 'node:fs';
import { readPng } from './png_io.mjs';
const PACK = (process.argv[2] || 'out10s') + '/', M = 'out10m/';
const lobby = JSON.parse(fs.readFileSync(PACK + 'manifest.json', 'utf8'));
const merged = JSON.parse(fs.readFileSync(M + 'merged2.json', 'utf8')).layers.filter((l) => !l.under);
const two = (f) => f.replace(/\.png$/, '@2x.png');
// the page's occluder pictures by the names merge_light2.mjs gave them
const recv = new Map();
for (const o of lobby.occluders) {
  const sl = Array.isArray(o.depth_slices) && o.depth_slices.length ? o.depth_slices : null;
  const parts = sl && typeof o.file === 'string' && [o.x, o.y, o.w, o.h].every(Number.isFinite)
    ? [{ ...o, z_index: Math.min(...sl.map((s) => s.z_index ?? o.z_index)) }, ...sl] : sl || [o];
  parts.forEach((s, i) => {
    if (!s || typeof s.file !== 'string') return;
    const name = `${o.name}${sl ? (parts.length > sl.length ? (i ? `_${String(i - 1).padStart(2, '0')}` : '_whole') : `_${String(i).padStart(2, '0')}`) : ''}`;
    recv.set(name, { ...s, z: s.z_index ?? o.z_index, occ: o.name });
  });
}
const skip = (n, r) => /^(glass_left|glass_right|arcade|claw_body)/.test(n) || !r || (/occ_restroom_side_wall_01\.png$/.test(r.file) && r.w === 159 && r.h === 99);
const groups = new Map();
for (const l of merged) { const g = groups.get(l.on) || {}; g[l.blend === 'plus-lighter' ? 'L' : 'S'] = l; g.kind = l.on_kind; groups.set(l.on, g); }
let nFold = 0, nPieces = 0, nSkipPieces = 0, tot = { over: 0, px: 0 }, worst = 0;
const rows = [];
for (const [name, g] of groups) {
  const r = recv.get(name);
  const pieces = (g.S ? 1 : 0) + (g.L ? 1 : 0);
  if (g.kind !== 'occluder' || skip(name, r)) { nSkipPieces += pieces; rows.push(`${name.padEnd(30)} skipped (${g.kind}${r ? '' : ', not in ' + PACK})`); continue; }
  let rowWorst = 0, over = 0, overMax = 0, outside = 0, lit = 0;
  for (const sc of [1, 2]) {
    const P = readPng(PACK + (sc === 2 ? r.file_2x || two(r.file) : r.file));
    if (P.w !== r.w * sc || P.h !== r.h * sc) throw new Error(`${name}: picture ${P.w}x${P.h}`);
    const get = (l) => { if (!l) return null; const im = readPng(M + (sc === 2 ? l.file_2x : l.file)); return { im, x: (l.x - r.x) * sc, y: (l.y - r.y) * sc }; };
    const S = get(g.S), L = get(g.L);
    for (const q of [S, L]) if (q) for (let y = 0; y < q.im.h; y++) for (let x = 0; x < q.im.w; x++) {
      const i = (y * q.im.w + x) * 4; const v = q === L ? Math.max(q.im.rgba[i], q.im.rgba[i + 1], q.im.rgba[i + 2]) * q.im.rgba[i + 3] : q.im.rgba[i + 3];
      if (v && (q.x + x < 0 || q.y + y < 0 || q.x + x >= P.w || q.y + y >= P.h)) outside++;
    }
    const at = (q, x, y) => { if (!q) return null; const xx = x - q.x, yy = y - q.y; if (xx < 0 || yy < 0 || xx >= q.im.w || yy >= q.im.h) return null; return (yy * q.im.w + xx) * 4; };
    for (let y = 0; y < P.h; y++) for (let x = 0; x < P.w; x++) {
      const i = (y * P.w + x) * 4, si = at(S, x, y), li = at(L, x, y);
      const s = si === null ? 0 : S.im.rgba[si + 3] / 255;
      const la = li === null ? 0 : L.im.rgba[li + 3] / 255;
      if (!s && !la) continue;
      lit++;
      const a = P.rgba[i + 3] / 255, A = 1 - (1 - a) * (1 - s);
      const A8 = Math.round(A * 255);
      for (let c = 0; c < 3; c++) {
        const col = P.rgba[i + c] / 255, sc0 = si === null ? 0 : S.im.rgba[si + c] / 255, l = li === null ? 0 : (L.im.rgba[li + c] / 255) * la;
        const C = col * a * (1 - s) + sc0 * s + l;           // premultiplied folded colour
        if (C > A + 0.5 / 255) { over++; overMax = Math.max(overMax, (C - A) * 255); }
        // what an 8-bit straight-alpha PNG keeps
        const c8 = A8 ? Math.min(255, Math.round((C / A) * 255)) : 0;
        for (const B of [0, 0.5, 1]) {
          // old: the browser rounds after each of its three draws
          let o = Math.round((col * a + B * (1 - a)) * 255) / 255;
          o = Math.round((sc0 * s + o * (1 - s)) * 255) / 255;
          o = Math.min(255, Math.round((o + l) * 255));
          const n = Math.min(255, Math.round(((c8 / 255) * (A8 / 255) + B * (1 - A8 / 255)) * 255));
          const d = Math.abs(o - n); if (d > rowWorst) rowWorst = d;
        }
      }
    }
  }
  nFold++; nPieces += pieces; tot.over += over; tot.px += lit; if (rowWorst > worst) worst = rowWorst;
  rows.push(`${name.padEnd(30)} z ${String(r.z).padStart(4)} piece z ${(g.S || g.L).z_index}  pieces ${pieces}  lit px ${String(lit).padStart(6)}  C>A ${String(over).padStart(5)} (max +${overMax.toFixed(1)})  outside ${outside}  worst diff ${rowWorst}`);
}
console.log(rows.join('\n'));
console.log(`\nfoldable receivers ${nFold}, pieces folded away ${nPieces}, pieces left as they are ${nSkipPieces}; channel values needing C > A: ${tot.over}; worst difference old vs folded ${worst}/255`);
