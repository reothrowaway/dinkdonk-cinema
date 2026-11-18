'use strict';

// Which files the lobby (lobby.html) and the auditorium (auditorium.html) load at runtime, shared by the zip package
// (package/build.js) and the hosted edition (web/build.js). Returns paths relative to the standby folder.

const fs = require('node:fs');
const path = require('node:path');

const ART_EXT = /\.(png|webp|webm|jpg|avif|mp4|json)$/i;
const NOT_ART = /\.(md|txt|py|ps1|log)$/i;
const with2x = (rel) => { const m = rel.match(/^(.*)(\.[a-z0-9]+)$/i); return m ? [rel, `${m[1]}@2x${m[2]}`] : [rel]; };

function walkFiles(dir, base, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const a = path.join(dir, e.name);
    if (e.isDirectory()) walkFiles(a, base, out);
    else if (!NOT_ART.test(e.name)) out.push(path.relative(base, a).replace(/\\/g, '/'));
  }
}

function artFiles(standby, fail) {
  const files = [];
  // The lobby (roxy3d/out10 + out10mist) is read through manifests that list everything, so those folders go in whole.
  // out10m is the street marquee's layer pack (marquee.json), drawn over out10 by lobby.html.
  // out10l is the "Dear Leader" poster's layer pack (leader.json), drawn over out10 and out10m by lobby.html.
  // out10p is the lobby props' layer pack (props.json: claw machine, jukebox, TV), drawn over those by lobby.html.
  // auditorium.html also loads roxy3d/out10/ (ITEM_ART), already covered.
  // out10r is the Brief 95 re-render (12 Nov 2026), the lobby's base and mist pack now (out10 stays for the auditorium's
  // item pictures and ?artdir=out10).
  // out10s (Brief 96, 13 Nov 2026) is the lobby's base now (claw machine in the arcade's place, the leftover page
  // drawings as pictures); out10ps its props pack (jukebox and TV). out10r and out10p stay for ?artdir=out10r.
  // out10t (Brief 104, 17 Nov 2026) is the second lobby look, the dark magenta/cyan "gamer lobby" (the panel's Lobby look,
  // or ?look=gamer), with its own mist maps and its layer packs out10tps (jukebox tubes, TV glow), out10tm (marquee body
  // and chase) and out10tl (poster body), named in its manifest (brief104.layer_packs).
  for (const dir of ['out10s', 'out10ps', 'out10r', 'out10', 'out10mist', 'out10m', 'out10l', 'out10p', 'out10t', 'out10tps', 'out10tm', 'out10tl']) walkFiles(path.join(standby, 'roxy3d', dir), standby, files);

  // The auditorium (roxy3d/qa11, 2 GB of drafts) loads one draft: its layout JSON names every picture it needs.
  const aud = fs.readFileSync(path.join(standby, 'auditorium.html'), 'utf8');
  const draft = aud.match(/\? q\.get\('draft'\) : '(\d{2})'/)?.[1] || fail('default draft not found in auditorium.html');
  const audArt = aud.match(/const ART = '(roxy3d\/[^']+\/)';/)?.[1] || fail('ART folder not found in auditorium.html');
  const layoutRel = `cinema_layout_${draft}.json`;
  const wanted = new Set([layoutRel, ...with2x(`cinema_draft_${draft}.png`)]);
  (function walk(o) {
    if (typeof o === 'string') { if (ART_EXT.test(o) && !/^(roxy3d|qa\d+)\//.test(o)) with2x(o).forEach((r) => wanted.add(r)); }
    else if (o && typeof o === 'object') Object.values(o).forEach(walk);
  })(JSON.parse(fs.readFileSync(path.join(standby, audArt, layoutRel), 'utf8')));
  let audCount = 0;
  for (const rel of wanted) {
    // the @2x guesses and provenance-only names may not exist
    if (fs.existsSync(path.join(standby, audArt, rel))) { files.push(audArt + rel); audCount++; }
  }
  // the lobby -> auditorium fly-through (shared/transition.js): packed video (colour + depth) and its camera table
  for (const rel of ['roxy3d/fly/transition/transition.webm', 'roxy3d/fly/transition/transition-camera.json']) {
    if (!fs.existsSync(path.join(standby, rel))) fail(`fly-through file missing: ${rel}`);
    files.push(rel);
  }
  // the auditorium's screen shots T1 / T2 / T3 (Brief 102, shared/aud-shots.js): packed videos, cameras, screen corners,
  // the T2 hold plate and its depth
  const shots = 'roxy3d/aud101/page/final';
  const shotFiles = ['T1.webm', 'T2.webm', 'T3.webm', 'T1-camera.json', 'T2-camera.json', 'T3-camera.json',
    't1_screen_corners.json', 't2_screen_corners.json', 't3_screen_corners.json',
    'hold_t2.png', 'hold_t2@2x.png', 'hold_t2.json', 'hold_t2_camera.json', 'hold_t2_depth_tiles.png'];
  for (const f of shotFiles) {
    if (!fs.existsSync(path.join(standby, shots, f))) fail(`screen shot file missing: ${shots}/${f}`);
    files.push(`${shots}/${f}`);
  }
  return { files, draft, audArt, audCount };
}

module.exports = { artFiles };
