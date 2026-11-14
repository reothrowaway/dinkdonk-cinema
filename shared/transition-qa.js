/* Lobby -> auditorium fly-through with the real chatters drawn into it (7 Nov 2026). Live: lobby.html loads
 * shared/transition.js; lobby-qa.html loads this file (try changes here first, then copy).
 *
 * Plays roxy3d/fly/transition/transition.webm (colour on top, two depth tiles below; see build_transition.py) in a
 * WebGL canvas over the stage. Every chatter is their (animated) emote standing at their real 3D spot:
 *   part A (lobby, street, hallway): the lobby keeps running underneath, so every frame each chatter is where the
 *     lobby has them right now (walking, queueing, hopping, turning); anyone who leaves the lobby fades out (13 Nov 2026,
 *     owner: "they should basically keep working and do the same things"; ?flylive=0 = frozen at the start, as before);
 *   part B (auditorium): the seated people at their seats (from the shared room's auditorium roster); a seated
 *     chatter who types in chat gives a little hop, as in the auditorium.
 * Sprites are upright and turn with the camera; the per-frame depth hides them behind walls, counters and seat backs.
 *
 * Start: key T on the lobby page, or ?fly=N (first play N s after load, then again N s after each one ends), or the
 * control panel's "Fly to the auditorium" (cmd 'fly' = cut mode): the auditorium is put in its wide shot, the picture
 * shifts by the lobby's crop during the black cut into the auditorium (A1100 -> B1), so the last frame lands where the
 * cinema scene shows the auditorium, and the copy inside OBS asks obs-bridge.js to cut OBS to the cinema scene.
 * ?flycut=1 makes any copy (not just OBS's) call the bridge; ?flycutdry=1 asks the bridge for a dry run only.
 * Options: ?flyghost=1 shows hidden parts faintly (QA), ?flytol=0.35 occlusion tolerance in depth steps,
 *          ?flyhold=4 seconds to hold the last frame before returning to the lobby.
 */
(() => {
  'use strict';
  const q = new URLSearchParams(location.search);
  // 13 Nov 2026: the re-render (Brief 97) is in fly/transition/; QA only: ?flydir=old = the 7 Nov one, ?flydir=98 = a staged
  // pack in fly/transition98/ (Brief 98: depth of the opening fixed), both local only
  const BASE = { old: 'roxy3d/fly/transition-7nov/', 98: 'roxy3d/fly/transition98/' }[q.get('flydir')] || 'roxy3d/fly/transition/';
  const ZPP = 73.48469228349535;            // page z px per world unit (mapping.json)
  // Each chatter is one upright quad CARD_W x CARD_H world units: the emote stands at the bottom centre at its lobby size
  // (page px -> world: width / XPP, height / ZPP, so frame 1 matches the lobby sprite), the name label above the head.
  // Transparent parts of the quad are discarded in the shader.
  const XPP = 84.8528137423857;             // page px per world unit, horizontal (60 px per tile along u-v / sqrt 2)
  const CARD_W = 1.6, CARD_H = 1.0, PXU = 200;   // world units; atlas px per world unit
  const CELL_W = CARD_W * PXU, CELL_H = CARD_H * PXU, ATLAS = 4096;
  // Name labels are screen-sized (owner, 7 Nov 2026): the lobby's 14 px Oswald pill at every distance, drawn at 2x in
  // their own atlas and pinned just above the head. LAB_W x LAB_H atlas px = half that in 1920x1080 stage px.
  const LAB_W = 360, LAB_H = 40, LAB_ATLAS = 2048, LAB_COLS = Math.floor(LAB_ATLAS / LAB_W);
  // Which names show, as in the lobby (owner, 7 Nov 2026): only people who arrived or talked recently (here: last chat
  // within NAME_RECENT s when the flight starts, from the room's roster), most recent first; a name that would overlap
  // one already shown fades out (NAME_FADE s) until it is clear.
  const NAME_RECENT = 120, NAME_FADE = 0.4;
  let lastNow = 0;
  const COLS = Math.floor(ATLAS / CELL_W), MAX_CARDS = COLS * Math.floor(ATLAS / CELL_H);
  const TOL = Number(q.get('flytol') ?? 0.35);
  const GHOST = q.get('flyghost') === '1';
  const HOLD = Number(q.get('flyhold') ?? 4) * 1000;
  const FADE_NEAR = 0.35, FADE_LEN = 0.9;   // world units from the camera: fade out before the lens goes through someone
  const LIVE = q.get('flylive') !== '0';    // part A follows the running lobby (default) or stays frozen at the start
  const LEAVE_FADE = 0.5, PUSH_RATE = 2.5;  // s to fade someone who left the lobby; max step-aside speed, units/s
  const HOP_PX = 12;                        // a seated chatter's hop when they type (page px, as the lobby's talk hop)

  let meta = null, layout = null, gl = null, prog = null, bgProg = null, videoTex = null, atlasTex = null, labelTex = null;
  let canvas = null, hud = null, video = null, playing = false, cards = [], buf = null, bgBuf = null;

  // ---------- math (float64 on the CPU; the GPU only gets clip coordinates) ----------
  const mul = (m, x, y, z) => [m[0] * x + m[1] * y + m[2] * z + m[3], m[4] * x + m[5] * y + m[6] * z + m[7],
    m[8] * x + m[9] * y + m[10] * z + m[11], m[12] * x + m[13] * y + m[14] * z + m[15]];

  function seatWorld(id) {
    const [row, , us] = String(id).split(':');
    const r = layout?.rows?.find((x) => x.row === row);
    if (!r) return null;
    return [Number(us), -r.v, ((r.floor_zpx_world || 0) + 36) / ZPP];   // 36 = seat_anchor_zpx_world
  }

  // ---------- GL setup ----------
  const VS = `#version 300 es
    in vec4 aClip; in vec2 aUv; in float aZ; in float aAlpha; in vec3 aAnchor;
    out vec2 vUv; out float vZ; out float vAlpha; flat out vec3 vAnchor;
    void main() { gl_Position = aClip; vUv = aUv; vZ = aZ; vAlpha = aAlpha; vAnchor = aAnchor; }`;
  const FS = `#version 300 es
    precision highp float;
    uniform sampler2D uVid; uniform sampler2D uAtlas;
    uniform vec2 uCanvas; uniform float uNear, uFar, uPeriod, uTol, uGhost;
    in vec2 vUv; in float vZ; in float vAlpha; flat in vec3 vAnchor; out vec4 o;
    float sceneQ(ivec2 t) {
      float c = texelFetch(uVid, t, 0).r * 255.0;
      if (c > 254.5) return 1e9;                                 // no surface: nothing in front
      float f = texelFetch(uVid, t + ivec2(960, 0), 0).r;
      float k0 = floor(c / uPeriod), best = 1e9;
      for (int dk = -1; dk <= 1; dk++) {
        float k = k0 + float(dk);
        float a = (k + f * 0.5) * uPeriod, b = (k + 1.0 - f * 0.5) * uPeriod;
        if (abs(a - c) < abs(best - c)) best = a;
        if (abs(b - c) < abs(best - c)) best = b;
      }
      return best;
    }
    void main() {
      vec4 card = texture(uAtlas, vUv);
      if (card.a < 0.02) discard;
      vec2 px = vec2(gl_FragCoord.x, uCanvas.y - gl_FragCoord.y) / uCanvas * vec2(1920.0, 1080.0);
      if (vAnchor.z > 0.5) px = vAnchor.xy;   // a name label: shown when its owner's head is, not per pixel
      ivec2 t = ivec2(clamp(floor(px.x * 0.5), 0.0, 959.0), 1080.0 + clamp(floor(px.y * 0.5), 0.0, 539.0));
      float myQ = log(max(vZ, uNear) / uNear) / log(uFar / uNear) * 254.0;
      float hidden = sceneQ(t) < myQ - uTol ? 1.0 : 0.0;
      float a = card.a * vAlpha * mix(1.0, uGhost, hidden);
      if (a < 0.01) discard;
      o = vec4(card.rgb * a, a);
    }`;
  const BG_VS = `#version 300 es
    in vec2 aPos; out vec2 vUv;
    void main() { gl_Position = vec4(aPos, 0.0, 1.0); vUv = vec2((aPos.x + 1.0) * 0.5, (1.0 - aPos.y) * 0.5 * (1080.0 / 1620.0)); }`;
  const BG_FS = `#version 300 es
    precision highp float; uniform sampler2D uVid; in vec2 vUv; out vec4 o;
    void main() { o = vec4(texture(uVid, vUv).rgb, 1.0); }`;

  function compile(vs, fs) {
    const p = gl.createProgram();
    for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      gl.attachShader(p, s);
    }
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }
  function tex() {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  function setup() {
    const stage = document.getElementById('stage');
    canvas = document.createElement('canvas');
    canvas.id = 'flyqa';
    canvas.style.cssText = 'position:absolute;left:0;top:0;width:1920px;height:1080px;z-index:900;display:none;pointer-events:none';
    hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;left:12px;bottom:10px;z-index:901;display:none;font:600 15px/1.3 monospace;color:#fff;' +
      'background:rgba(0,0,0,.55);padding:4px 8px;border-radius:3px;pointer-events:none';
    stage.append(canvas, hud);
    gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: false, antialias: true });
    if (!gl) { console.warn('[fly] no WebGL2'); return false; }
    prog = compile(VS, FS);
    bgProg = compile(BG_VS, BG_FS);
    videoTex = tex();
    atlasTex = tex();
    labelTex = tex();
    buf = gl.createBuffer();
    bgBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bgBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';
    video.src = `${BASE}transition.webm`;
    video.addEventListener('ended', finish);
    // in the page (tiny, nearly invisible): a detached video may never present frames, so no frame callbacks
    // full size just under the WebGL canvas and shown only while playing: Chrome pauses muted video it thinks nobody
    // sees ('video-only background media was paused to save power'), which a 2 px / transparent element was
    video.style.cssText = 'position:absolute;left:0;top:0;width:1920px;height:1080px;object-fit:fill;z-index:899;display:none;pointer-events:none';
    stage.append(video);
    window.DD_FLY_VIDEO = video;
    return true;
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    const s = Math.min(2, Math.max(1, (r.width / 1920) * (devicePixelRatio || 1)));
    const w = Math.round(1920 * s), h = Math.round(1080 * s);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  }

  // ---------- who is where ----------
  async function gatherCards() {
    const out = [];
    // seconds since each lobby chatter's last message or arrival (room roster), for the lobby's name rule
    const lobbyAge = new Map();
    try {
      const lob = await fetch('/ctl/room-roster?page=lobby', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null));
      for (const e of lob?.roster || []) if (e.last) lobbyAge.set(String(e.nick).toLowerCase(), (lob.now - e.last) / 1000);
    } catch { /* no room: no names */ }
    for (const f of window.DD_FLY?.figures?.() || []) {
      if (f.ride || f.alpha < 0.3) continue;
      out.push({ part: 'A', id: f.id, nick: f.nick, color: f.color, tag: f.staff ? 'staff' : f.status,
        p: [f.u, -f.v, (f.zpx || 0) / ZPP], em: f.em, emW: f.emW, emH: f.emH, flip: f.flip, rainbow: f.rainbow,
        age: lobbyAge.get(String(f.nick).toLowerCase()) ?? Infinity });
    }
    try {
      const snap = await fetch('/ctl/room-roster?page=auditorium', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null));
      for (const e of snap?.roster || []) {
        const p = e.seat && seatWorld(e.seat);
        if (!p) continue;
        // the auditorium's own pick: their emote, else the same default the pages use; colour from their chat flair
        const em = e.emote || window.Cinema?.defaultEmote?.(e.nick) || null;
        let color = null, rainbow = false;
        try { const m = window.SB?.parseMessage?.(e.d || { nick: e.nick, data: '' }); color = m?.color || null; rainbow = !!m?.rainbow; } catch { /* default colour */ }
        out.push({ part: 'B', nick: e.nick, color, rainbow, tag: e.seat.split(':')[0] + ' row', p, em, flip: false,
          age: e.last ? (snap.now - e.last) / 1000 : Infinity });
      }
    } catch (err) { console.warn('[fly] no auditorium roster', err); }
    const list = out.slice(0, MAX_CARDS);
    planStepAside(list);
    return list;
  }

  // People standing on the camera's path step aside as it comes (part A): find where the low, first-person camera
  // passes closest to each card, and slide the card out to CLEAR units from that line over the 2 s before.
  const CLEAR = 1.4, STEP_FRAMES = 60, DONE_BEFORE = 12;
  function planStepAside(list) {
    const track = meta.cam.filter((c) => c.part === 'A' && c.eye[2] < 3);
    for (const cd of list) {
      cd.push = null;
      if (cd.part !== 'A' || !track.length) continue;
      let best = null;
      for (let i = 0; i < track.length; i++) {
        const t = track[i];
        const d = Math.hypot(cd.p[0] - t.eye[0], cd.p[1] - t.eye[1]);
        if (!best || d < best.d) best = { d, i };
      }
      if (best.d >= CLEAR) continue;
      const t = track[best.i], n = track[Math.min(track.length - 1, best.i + 1)], p = track[Math.max(0, best.i - 1)];
      let dx = cd.p[0] - t.eye[0], dy = cd.p[1] - t.eye[1];
      if (Math.hypot(dx, dy) < 1e-3) { dx = -(n.eye[1] - p.eye[1]); dy = n.eye[0] - p.eye[0]; }   // dead on the line: to the left
      const l = Math.hypot(dx, dy) || 1;
      cd.push = { dx: (dx / l) * (CLEAR - best.d), dy: (dy / l) * (CLEAR - best.d), g: t.g };
    }
  }
  function cardPos(cd, g) {
    if (!cd.push) return cd.p;
    const x = (g - (cd.push.g - DONE_BEFORE - STEP_FRAMES)) / STEP_FRAMES;
    const k = x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
    return [cd.p[0] + cd.push.dx * k, cd.p[1] + cd.push.dy * k, cd.p[2]];
  }

  // Live part A (13 Nov 2026): each frame the card takes the chatter's current lobby spot, facing and hop (DD_FLY.live),
  // and the step-aside is worked out from there: over the low camera's samples from AFTER frames back to
  // DONE_BEFORE + STEP_FRAMES frames ahead, the push that keeps CLEAR units from its line, weighted 1 up to DONE_BEFORE
  // frames ahead and easing to 0 STEP_FRAMES further out. The biggest wins; the card slides towards it at most
  // PUSH_RATE units/s, so nobody jumps. Once the camera is past, they walk on. Someone who left fades out.
  const AFTER = 20;
  let lowByG = null, lastStep = 0;
  function liveStep(cd, g, dt, live) {
    const f = live.get(cd.id);
    if (f) { cd.p = [f.u, -f.v, (f.zpx || 0) / ZPP]; cd.flip = f.flip; cd.hopZ = (f.lift || 0) / ZPP; }
    const want = f && !f.ride ? Math.min(1, Math.max(0, f.alpha ?? 1)) : 0;
    cd.vis = cd.vis === undefined ? want : cd.vis + Math.max(-dt / LEAVE_FADE, Math.min(dt / LEAVE_FADE, want - cd.vis));
    if (!lowByG) {
      lowByG = [];
      for (const c of meta.cam) if (c.part === 'A' && c.eye[2] < 3) lowByG[c.g] = c;
    }
    let tx = 0, ty = 0, need = 0;
    for (let gg = Math.max(1, g - AFTER); gg <= g + DONE_BEFORE + STEP_FRAMES; gg += 2) {
      const t = lowByG[gg];
      if (!t) continue;
      const ahead = gg - g;
      const x = ahead <= DONE_BEFORE ? 1 : 1 - (ahead - DONE_BEFORE) / STEP_FRAMES;
      const n = (CLEAR - Math.hypot(cd.p[0] - t.eye[0], cd.p[1] - t.eye[1])) * x * x * (3 - 2 * x);
      if (n <= need) continue;
      let dx = cd.p[0] - t.eye[0], dy = cd.p[1] - t.eye[1];
      if (Math.hypot(dx, dy) < 1e-3) {   // dead on the line: to the left
        const nx = lowByG[gg + 1] || t, px = lowByG[gg - 1] || t;
        dx = -(nx.eye[1] - px.eye[1]); dy = nx.eye[0] - px.eye[0];
      }
      const l = Math.hypot(dx, dy) || 1;
      need = n; tx = (dx / l) * n; ty = (dy / l) * n;
    }
    if (!cd.pv) cd.pv = [0, 0];
    const ex = tx - cd.pv[0], ey = ty - cd.pv[1], el = Math.hypot(ex, ey), mx = PUSH_RATE * dt;
    if (el > mx) { cd.pv[0] += (ex / el) * mx; cd.pv[1] += (ey / el) * mx; } else cd.pv = [tx, ty];
  }
  // part B: a seated chatter who types hops once (the lobby's talk hop: 0.4 s, HOP_PX high)
  function seatHop(cd, dt) {
    if (!(cd.bounce > 0)) { cd.hopZ = 0; return; }
    cd.bounce = Math.max(0, cd.bounce - dt * 2.4);
    cd.hopZ = (Math.sin(cd.bounce * Math.PI) * HOP_PX) / ZPP;
  }
  window.SB?.on?.('msg', (m) => {
    if (!playing || !m?.nick) return;
    const n = String(m.nick).toLowerCase();
    for (const cd of cards) if (cd.part === 'B' && String(cd.nick).toLowerCase() === n && !(cd.bounce > 0)) cd.bounce = 1;
  });

  // ---------- sprites: every frame of each emote, from DGG's CSS (served same-origin through the emote proxy) ----------
  // An emote is a box of DGG's sprite CSS. Animated ones move background-position in steps (sprite sheets), animate
  // transform (wiggles, slides), or are GIF files. Each distinct emote's frames are drawn once into one atlas with their
  // timings; every frame the player picks the current frame per chatter (own phase). A finite CSS animation has
  // finished long before the flight plays, so it shows its end state, as the lobby does by then.
  const MX = 0.25, MT = 0.3, MAX_FRAMES = 24, EPXU = 160;   // cell room for transforms; atlas px per world unit
  let versionedP = null;   // emote file name -> versioned CDN url (from the server's cached emotes.json)
  function versioned() {
    versionedP ||= fetch('/dgg/emotes.json', { cache: 'force-cache' }).then((r) => r.json()).then((list) => {
      const m = new Map();
      for (const e of list) for (const im of e?.image || []) if (im?.name && im?.url) m.set(im.name, im.url);
      return m;
    }).catch(() => new Map());
    return versionedP;
  }
  // the CSS points at cdn.destiny.gg: a cross-origin image would taint the atlas (WebGL refuses it), and the proxy only
  // takes the versioned CDN path from emotes.json (cdn.destiny.gg/<version>/emotes/<file>), so map the file name to it
  async function proxied(url) {
    const abs = new URL(url, location.href);
    if (abs.origin === location.origin) return abs.href;
    const map = await versioned();
    const v = map.get(abs.pathname.split('/').pop());
    if (v) return `/dgg/emote-img?u=${encodeURIComponent(v)}`;
    // 14 Nov 2026: an emote picture that is no longer in DGG's list (core.js EMOTE_OVERRIDES: coMMMMfy's Halloween
    // picture) is still on the CDN; the proxy only takes versioned paths, so borrow the current list's version
    if (abs.hostname === 'cdn.destiny.gg' && /^\/emotes\/[\w-]+\.(png|gif|webp|avif)$/.test(abs.pathname)) {
      const ver = /cdn\.destiny\.gg\/([0-9.]+)\//.exec(map.values().next().value || '')?.[1];
      if (ver) return `/dgg/emote-img?u=${encodeURIComponent(`https://cdn.destiny.gg/${ver}${abs.pathname}`)}`;
    }
    return null;
  }
  const imgCache = new Map();
  function loadImg(url) {
    if (!imgCache.has(url)) imgCache.set(url, proxied(url).then((src) => src && new Promise((res) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => res(null);
      i.src = src;
    })));
    return imgCache.get(url);
  }
  // GIF frames (ImageDecoder), each copied to a canvas; null if not animated or not decodable
  async function gifFrames(url) {
    if (!/\.gif(\?|$)/i.test(url) || typeof ImageDecoder === 'undefined') return null;
    try {
      const src = await proxied(url);
      if (!src) return null;
      const res = await fetch(src, { signal: AbortSignal.timeout(4000) });
      const dec = new ImageDecoder({ data: await res.arrayBuffer(), type: 'image/gif' });
      await dec.tracks.ready;
      const count = dec.tracks.selectedTrack.frameCount;
      if (!(count > 1)) return null;
      const step = Math.ceil(count / MAX_FRAMES), out = [];
      for (let i = 0; i < count; i += step) {
        const { image } = await dec.decode({ frameIndex: i });
        const c = document.createElement('canvas');
        c.width = image.displayWidth; c.height = image.displayHeight;
        c.getContext('2d').drawImage(image, 0, 0);
        out.push({ src: c, ms: Math.max(20, ((image.duration || 100000) / 1000) * step) });
        image.close();
      }
      dec.close();
      return out;
    } catch { return null; }
  }
  // the CSS state of the emote box at each sample time: [{ pos, bs, tf, op, ms }], plus box size and transform origin
  async function sampleEmote(name) {
    const el = document.createElement('span');
    el.className = `emote ${name}`;
    el.style.cssText = 'position:absolute;left:-9999px;top:0';
    document.body.append(el);
    try {
      const cs = getComputedStyle(el);
      const w = parseFloat(cs.width), h = parseFloat(cs.height);
      const url = /url\(["']?([^"')]+)["']?\)/.exec(cs.backgroundImage)?.[1];
      if (!url || !(w > 1) || !(h > 1)) return null;
      const origin = cs.transformOrigin.split(/\s+/).map((v) => parseFloat(v) || 0);
      const read = (ms) => ({ pos: cs.backgroundPosition, bs: cs.backgroundSize, tf: cs.transform, op: parseFloat(cs.opacity) || 1, ms });
      const anims = el.getAnimations().filter((a) => a.effect);
      let samples;
      if (anims.length) {
        anims.forEach((a) => a.pause());
        const t = anims[0].effect.getTiming();
        const dur = typeof t.duration === 'number' ? t.duration : 0;
        const alt = String(t.direction || '').includes('alternate');
        if (!(dur > 0) || t.iterations !== Infinity) {
          anims.forEach((a) => { a.currentTime = (t.delay || 0) + dur * (Number.isFinite(t.iterations) ? t.iterations : 1) + 1000; });
          samples = [read(1000)];
        } else {
          const period = dur * (alt ? 2 : 1);
          const ease = anims[0].effect.getKeyframes().map((k) => k.easing).find((e) => /^steps\(/.test(e || ''));
          const n = ease ? parseInt(/steps\((\d+)/.exec(ease)[1], 10) * (alt ? 2 : 1) : 16;
          const N = Math.max(1, Math.min(MAX_FRAMES, n));
          samples = [];
          for (let k = 0; k < N; k++) {
            const tt = (t.delay || 0) + ((k + 0.5) / N) * period;
            anims.forEach((a) => { a.currentTime = tt; });
            samples.push(read(period / N));
          }
        }
      } else samples = [read(1000)];
      return { url, w, h, origin, samples };
    } finally { el.remove(); }
  }
  // all frames of one emote as draw jobs: [{ src, sx, sy, sw, sh, tf, op, ms }]
  // our own pictures, not DGG CSS (13 Nov 2026): the mop gag's cpMOP penguin (lobby emName 'cpMOP') and the MOPPING
  // emote are assets/cpMOP.webp (animated). Before this they showed as a "cpMOP" text pill in the flight.
  const LOCAL_IMG = { cpMOP: 'assets/cpMOP.webp', MOPPING: 'assets/cpMOP.webp' };
  async function localFrames(url) {
    let frames = null;
    if (typeof ImageDecoder !== 'undefined') {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
        const dec = new ImageDecoder({ data: await res.arrayBuffer(), type: 'image/webp' });
        await dec.tracks.ready;
        const count = dec.tracks.selectedTrack.frameCount;
        const step = Math.ceil(count / MAX_FRAMES);
        frames = [];
        for (let i = 0; i < count; i += step) {
          const { image } = await dec.decode({ frameIndex: i });
          const c = document.createElement('canvas');
          c.width = image.displayWidth; c.height = image.displayHeight;
          c.getContext('2d').drawImage(image, 0, 0);
          frames.push({ src: c, ms: Math.max(20, ((image.duration || 100000) / 1000) * step) });
          image.close();
        }
        dec.close();
      } catch { frames = null; }
    }
    if (!frames?.length) {
      const img = await new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = url; });
      if (!img) return null;
      frames = [{ src: img, ms: 1000 }];
    }
    const w = frames[0].src.naturalWidth || frames[0].src.width, h = frames[0].src.naturalHeight || frames[0].src.height;
    return { w, h, origin: [w / 2, h / 2], frames: frames.map((f) => ({ src: f.src, sx: 0, sy: 0, sw: w, sh: h, tf: 'none', op: 1, ms: f.ms })) };
  }
  async function emoteFrames(name) {
    if (LOCAL_IMG[name]) return localFrames(LOCAL_IMG[name]);
    const s = await sampleEmote(name);
    if (!s) return null;
    const gif = s.samples.length === 1 ? await gifFrames(s.url) : null;
    const base = gif ? null : await loadImg(s.url);
    if (!gif && !base) return null;
    const rect = (src, smp) => {
      const nw = src.naturalWidth || src.width, nh = src.naturalHeight || src.height;
      const bs = smp.bs.split(',')[0].trim().split(/\s+/), pos = smp.pos.split(',')[0].trim().split(/\s+/);
      let kx = 1, ky = 1;
      if (bs[0] && bs[0] !== 'auto' && parseFloat(bs[0])) {
        kx = parseFloat(bs[0]) / nw;
        ky = bs[1] && bs[1] !== 'auto' ? parseFloat(bs[1]) / nh : kx;
      }
      // background-position in px, or % of (scaled image - box), as CSS defines it
      const off = (v, box, img) => (v?.endsWith('%') ? (parseFloat(v) / 100) * (box - img) : parseFloat(v) || 0);
      const px = off(pos[0], s.w, nw * kx), py = off(pos[1] ?? pos[0], s.h, nh * ky);
      return { sx: -px / kx, sy: -py / ky, sw: s.w / kx, sh: s.h / ky };
    };
    const frames = gif
      ? gif.map((g) => ({ src: g.src, ...rect(g.src, s.samples[0]), tf: s.samples[0].tf, op: s.samples[0].op, ms: g.ms }))
      : s.samples.map((smp) => ({ src: base, ...rect(base, smp), tf: smp.tf, op: smp.op, ms: smp.ms }));
    return { w: s.w, h: s.h, origin: s.origin, frames };
  }

  // emote name -> { boxW, boxH, cellW, cellH (atlas px), frames: [{ u0, v0, u1, v1, ms }], total }
  let emoteInfo = new Map();
  async function drawAtlas(list) {
    const c = document.createElement('canvas');
    c.width = c.height = ATLAS;
    const x = c.getContext('2d');
    const lc = document.createElement('canvas');
    lc.width = lc.height = LAB_ATLAS;
    const y = lc.getContext('2d');
    emoteInfo = new Map();
    const names = [...new Set(list.map((cd) => cd.em || '?'))];
    // each emote gets 5 s (a slow GIF must not hold up the transition); a late one falls back to the text pill
    const limit = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(() => r(null), ms))]);
    const t0 = performance.now();
    console.log(`[fly] sampling ${names.length} emotes`);
    const jobs = await Promise.all(names.map((n) => (n === '?' ? null : limit(emoteFrames(n).catch((e) => { console.warn('[fly] emote', n, e); return null; }), 5000))));
    console.log(`[fly] sampled in ${Math.round(performance.now() - t0)} ms, ${jobs.filter((j) => j && j.frames.length > 1).length} animated`);
    let px = 0, py = 0, rowH = 0, full = false;
    const place = (cw, ch) => {
      if (px + cw > ATLAS) { px = 0; py += rowH; rowH = 0; }
      if (py + ch > ATLAS) return null;
      const at = [px, py];
      px += cw; rowH = Math.max(rowH, ch);
      return at;
    };
    names.forEach((name, ni) => {
      const job = jobs[ni];
      const w = job?.w || 40, h = job?.h || 30;
      // the lobby's size: 50 px tall, wide emotes fitted into 74 px (lobby setEmote); page px -> world -> atlas px
      const eh = Math.min(50, (74 * h) / w), ew = (eh * w) / h;
      const boxW = (ew / XPP) * EPXU, boxH = (eh / ZPP) * EPXU;
      const cellW = Math.ceil(boxW * (1 + 2 * MX)), cellH = Math.ceil(boxH * (1 + MT));
      const info = { boxW, boxH, cellW, cellH, frames: [], total: 0 };
      const list2 = job?.frames?.length ? job.frames : [null];
      for (const fr of (full ? list2.slice(0, 1) : list2)) {
        const at = place(cellW, cellH);
        if (!at) { full = true; break; }
        const [cx, cy] = at, bx = cx + boxW * MX, by = cy + boxH * MT;
        x.save();
        x.beginPath(); x.rect(cx, cy, cellW, cellH); x.clip();
        if (fr) {
          // CSS px of the emote box -> atlas px, with the sampled transform around the transform origin
          x.translate(bx, by);
          x.scale(boxW / w, boxH / h);
          const m = /matrix\(([^)]+)\)/.exec(fr.tf || '');
          if (m) {
            const [a, b, c2, d, e, f] = m[1].split(',').map(Number);
            x.translate(job.origin[0], job.origin[1]);
            x.transform(a, b, c2, d, e, f);
            x.translate(-job.origin[0], -job.origin[1]);
          }
          x.globalAlpha = fr.op;
          x.drawImage(fr.src, fr.sx, fr.sy, fr.sw, fr.sh, 0, 0, w, h);
        } else {
          // no sprite (CSS not loaded / unknown emote): a text pill like the page's fallback
          x.fillStyle = 'rgba(30,26,48,.85)';
          x.fillRect(bx, by + boxH * 0.3, boxW, boxH * 0.4);
          x.fillStyle = '#ddd';
          x.font = `600 ${Math.round(boxH * 0.22)}px Oswald, Arial Narrow, sans-serif`;
          x.textAlign = 'center'; x.textBaseline = 'middle';
          x.fillText(name, bx + boxW / 2, by + boxH / 2, boxW);
        }
        x.restore();
        const ms = fr?.ms || 1000;
        info.frames.push({ u0: cx / ATLAS, v0: cy / ATLAS, u1: (cx + cellW) / ATLAS, v1: (cy + cellH) / ATLAS, ms });
        info.total += ms;
      }
      if (info.frames.length) emoteInfo.set(name, info);
    });
    if (full) console.warn('[fly] emote atlas full: some emotes keep one frame');
    list.forEach((cd, i) => {
      cd.phase = Math.random() * 60000;
      const info = emoteInfo.get(cd.em || '?');
      cd.headH = info ? info.boxH / EPXU : 0.68;                       // world height of the emote (label anchor)
      cd.label = cd.tag !== 'staff' && cd.age < NAME_RECENT;          // staff names are hidden in the lobby too
      cd.nameA = undefined;
      if (!cd.label) return;
      const col = cd.color || (window.SB?.nickColor ? SB.nickColor(cd.nick) : '#9cf');
      // name label: 14 px Oswald on a dark pill (.w .nm), at 2x
      const lx = (i % LAB_COLS) * LAB_W, ly = Math.floor(i / LAB_COLS) * LAB_H;
      y.font = "500 28px Oswald, 'Arial Narrow', sans-serif";
      const tw = Math.min(LAB_W - 24, y.measureText(cd.nick).width);
      cd.labW = (tw + 16) / 2;                                         // pill width in stage px
      y.fillStyle = 'rgba(8,6,18,.5)';
      y.beginPath(); y.roundRect(lx + (LAB_W - tw) / 2 - 8, ly + 3, tw + 16, LAB_H - 6, 4); y.fill();
      y.textAlign = 'center'; y.textBaseline = 'middle';
      y.shadowColor = '#000'; y.shadowBlur = 6;
      if (cd.rainbow) {
        const g = y.createLinearGradient(lx + (LAB_W - tw) / 2, 0, lx + (LAB_W + tw) / 2, 0);
        ['#ff6b6b', '#ffd93d', '#6bff95', '#67d8ff', '#b28dff', '#ff78c6'].forEach((cc, k) => g.addColorStop(k / 5, cc));
        y.fillStyle = g;
      } else y.fillStyle = col;
      y.fillText(cd.nick, lx + LAB_W / 2, ly + LAB_H / 2 + 1, LAB_W - 24);
      y.shadowBlur = 0;
    });
    gl.bindTexture(gl.TEXTURE_2D, labelTex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, lc);
    gl.bindTexture(gl.TEXTURE_2D, atlasTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    console.log(`[fly] ${emoteInfo.size} emotes, ${[...emoteInfo.values()].reduce((s, i) => s + i.frames.length, 0)} frames in the atlas`);
  }
  // the chatter's current frame (own phase, looping)
  function frameOf(info, cd, now) {
    if (info.frames.length === 1) return info.frames[0];
    let t = (now + cd.phase) % info.total;
    for (const f of info.frames) { if (t < f.ms) return f; t -= f.ms; }
    return info.frames[info.frames.length - 1];
  }

  // ---------- per frame ----------
  function frameVerts(cam) {
    const g = cam.g;
    const V = cam.view, Pm = cam.proj;
    // camera right, flattened: cards stay upright and turn with the camera (matches the page sprites at frame 1)
    let rx = V[0], ry = V[1];
    const rl = Math.hypot(rx, ry) || 1;
    rx /= rl; ry /= rl;
    const lift = 0.02, now = performance.now();
    const sdt = lastStep ? Math.min(0.25, Math.max(0, (now - lastStep) / 1000)) : 0;
    lastStep = now;
    const live = LIVE && cam.part === 'A' ? window.DD_FLY?.live?.() : null;
    const quads = [];
    cards.forEach((cd, i) => {
      if (cd.part !== cam.part) return;
      const info = emoteInfo.get(cd.em || '?');
      if (!info) return;
      if (live) liveStep(cd, g, sdt, live); else if (cd.part === 'B') seatHop(cd, sdt);
      if ((cd.vis ?? 1) <= 0.01) return;
      const hw = info.cellW / EPXU / 2, H = info.cellH / EPXU;   // quad = the emote's atlas cell, feet at the bottom
      const [bx, by, bz] = live ? [cd.p[0] + cd.pv[0], cd.p[1] + cd.pv[1], cd.p[2]] : cardPos(cd, g);
      const hop = cd.hopZ || 0;   // the label stays at standing height, as in the lobby
      const corners = [[-hw, 0], [hw, 0], [-hw, H], [hw, H]].map(([s, h]) => {
        const wx = bx + rx * s, wy = by + ry * s, wz = bz + lift + hop + h;
        const pc = mul(V, wx, wy, wz);
        const clip = mul(Pm, pc[0], pc[1], pc[2]);
        return { clip, z: -pc[2] };
      });
      if (corners.some((c) => c.z <= cam.near + 0.01 || c.clip[3] <= 0)) return;   // behind / too close to the camera
      const fr = frameOf(info, cd, now);
      const [ua, ub] = cd.flip ? [fr.u1, fr.u0] : [fr.u0, fr.u1];   // facing as in the lobby (cells are symmetric)
      const uv = [[ua, fr.v1], [ub, fr.v1], [ua, fr.v0], [ub, fr.v0]];
      // fade people the camera is about to pass through (fully gone within FADE_NEAR units of the lens)
      const zc = (corners[0].z + corners[1].z) / 2;
      const alpha = Math.min(1, Math.max(0, (zc - FADE_NEAR) / FADE_LEN)) * (cd.vis ?? 1);
      if (alpha <= 0.01) return;
      let label = null;
      if (cd.label) {
        // pinned 3 stage px above the top of the head, LAB_W/2 x LAB_H/2 stage px, always the same size
        const pc = mul(V, bx, by, bz + lift + (cd.headH || 0.68));
        const cl = mul(Pm, pc[0], pc[1], pc[2]);
        if (cl[3] > 0) {
          const ax = 960 * (cl[0] / cl[3] + 1), ay = 540 * (1 - cl[1] / cl[3]);
          const w2 = LAB_W / 4, top = ay - 3 - LAB_H / 2, bot = ay - 3;
          const nx = (p) => p / 960 - 1, ny = (p) => 1 - p / 540;
          const lu0 = (i % LAB_COLS) * LAB_W / LAB_ATLAS, lv0 = Math.floor(i / LAB_COLS) * LAB_H / LAB_ATLAS;
          const lu1 = lu0 + LAB_W / LAB_ATLAS, lv1 = lv0 + LAB_H / LAB_ATLAS;
          label = { z: -pc[2], ax, ay, cd, rect: [ax - (cd.labW || w2) - 2, top, ax + (cd.labW || w2) + 2, bot],
            pts: [[nx(ax - w2), ny(bot), lu0, lv1], [nx(ax + w2), ny(bot), lu1, lv1],
              [nx(ax - w2), ny(top), lu0, lv0], [nx(ax + w2), ny(top), lu1, lv0]] };
        }
      }
      quads.push({ zc, corners, uv, alpha, label });
    });
    quads.sort((a, b) => b.zc - a.zc);   // far to near: nearer cards cover farther ones
    const data = [], labels = [];
    for (const { corners, uv, alpha } of quads) {
      for (const k of [0, 1, 2, 2, 1, 3]) {
        const c = corners[k].clip;
        data.push(c[0], c[1], 0, c[3], uv[k][0], uv[k][1], corners[k].z, alpha, 0, 0, 0);
      }
    }
    // the lobby's rule: most recent first; a name overlapping one already placed fades out until it is clear
    const dt = Math.min(0.25, Math.max(0, (now - lastNow) / 1000));
    lastNow = now;
    const placed = [];
    for (const q of quads.filter((q) => q.label).sort((a, b) => a.label.cd.age - b.label.cd.age)) {
      const r = q.label.rect;
      const clash = r[2] < 0 || r[0] > 1920 || r[3] < 0 || r[1] > 1080
        || placed.some((o) => r[0] < o[2] && r[2] > o[0] && r[1] < o[3] && r[3] > o[1]);
      if (!clash) placed.push(r);
      const cd = q.label.cd, target = clash ? 0 : 1;
      cd.nameA = cd.nameA === undefined ? target
        : cd.nameA + Math.max(-dt / NAME_FADE, Math.min(dt / NAME_FADE, target - cd.nameA));
    }
    for (const { alpha: a0, label: L } of quads) {
      if (!L || !(L.cd.nameA > 0.01)) continue;
      const alpha = a0 * L.cd.nameA;
      for (const k of [0, 1, 2, 2, 1, 3]) {
        const p = L.pts[k];
        labels.push(p[0], p[1], 0, 1, p[2], p[3], L.z, alpha, L.ax, L.ay, 1);
      }
    }
    const drawn = quads.length;
    return { data: new Float32Array(data), labels: new Float32Array(labels), drawn };
  }

  function render(g) {
    const cam = meta.cam[g - 1];
    const shift = (cutMode || q.get('flyalign') === '1') && cam.part === 'B' ? cropX() : 0;
    const tf = shift ? `translateX(${shift.toFixed(1)}px)` : '';
    if (canvas.style.transform !== tf) canvas.style.transform = tf;   // jumps in the black cut A1100 -> B1
    resize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, videoTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    gl.disable(gl.BLEND);
    gl.useProgram(bgProg);
    gl.bindBuffer(gl.ARRAY_BUFFER, bgBuf);
    const ap = gl.getAttribLocation(bgProg, 'aPos');
    gl.enableVertexAttribArray(ap);
    gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1i(gl.getUniformLocation(bgProg, 'uVid'), 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.disableVertexAttribArray(ap);

    const { data, labels, drawn } = frameVerts(cam);
    if (data.length) {
      gl.useProgram(prog);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STREAM_DRAW);
      const stride = 11 * 4;
      for (const [name, size, off] of [['aClip', 4, 0], ['aUv', 2, 16], ['aZ', 1, 24], ['aAlpha', 1, 28], ['aAnchor', 3, 32]]) {
        const l = gl.getAttribLocation(prog, name);
        gl.enableVertexAttribArray(l);
        gl.vertexAttribPointer(l, size, gl.FLOAT, false, stride, off);
      }
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, atlasTex);
      gl.uniform1i(gl.getUniformLocation(prog, 'uVid'), 0);
      gl.uniform1i(gl.getUniformLocation(prog, 'uAtlas'), 1);
      gl.uniform2f(gl.getUniformLocation(prog, 'uCanvas'), canvas.width, canvas.height);
      gl.uniform1f(gl.getUniformLocation(prog, 'uNear'), cam.near);
      gl.uniform1f(gl.getUniformLocation(prog, 'uFar'), cam.far);
      gl.uniform1f(gl.getUniformLocation(prog, 'uPeriod'), meta.packing.fine_period);
      gl.uniform1f(gl.getUniformLocation(prog, 'uTol'), TOL);
      gl.uniform1f(gl.getUniformLocation(prog, 'uGhost'), (window.DD_FLY_GHOST ?? GHOST) ? 0.25 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, data.length / 11);
      if (labels.length) {
        gl.bufferData(gl.ARRAY_BUFFER, labels, gl.STREAM_DRAW);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, labelTex);
        gl.uniform1i(gl.getUniformLocation(prog, 'uAtlas'), 2);
        gl.drawArrays(gl.TRIANGLES, 0, labels.length / 11);
      }
    }
    const local = cam.part === 'A' ? g : g - meta.parts.B[0] + 1;
    hud.textContent = `FLY DRAFT  frame ${g}/${meta.frames}  ${cam.part}${local}  cards ${drawn}/${cards.filter((c) => c.part === cam.part).length}`;
  }

  function onFrame(now, m) {
    if (!playing) return;
    const g = Math.min(meta.frames, Math.max(1, Math.round(m.mediaTime * meta.fps) + 1));
    render(g);
    if (cutMode) {
      if (!wideSent && g >= meta.frames - 75) { wideSent = true; auditoriumWide(); }   // 2.5 s before: still wide?
      if (!cutSent && g >= meta.frames - 2) { cutSent = true; askCut(); }
    }
    video.requestVideoFrameCallback(onFrame);
  }

  // the lobby's speech bubbles sit over the stage at lobby spots: hidden while the flight plays
  const showBubbles = (on) => { const b = document.getElementById('bubbles'); if (b) b.style.visibility = on ? '' : 'hidden'; };
  let repeatTimer = 0;
  // ---------- cut mode (control panel 'fly'): auditorium wide, picture aligned to the cinema scene, OBS cut ----------
  let cutMode = false, cutSent = false, wideSent = false, cutOk = null;
  const BRIDGE = 'http://127.0.0.1:18790/cut-to-cinema';
  const WARM = 'http://127.0.0.1:18790/warm-cinema';   // queue 55: OBS loads the auditorium during the flight
  const inObs = () => !!window.obsstudio || q.get('flycut') === '1';
  function auditoriumWide() {
    fetch('/ctl/cmd', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 'wide', page: 'auditorium' }) }).catch(() => {});
  }
  async function askCut() {
    if (!inObs()) { cutOk = null; return; }   // a preview screen plays along but does not switch the stream
    try {
      const r = await fetch(BRIDGE, { method: 'POST', body: JSON.stringify({ dry: q.get('flycutdry') === '1' }),
        signal: AbortSignal.timeout(4000) });
      cutOk = r.ok;
      console.log('[fly] bridge cut:', r.status, await r.text().catch(() => ''));
    } catch (err) {
      cutOk = false;
      console.warn('[fly] bridge cut failed (is obs-bridge.js running?):', err.message || err);
    }
  }
  // the lobby source is cropped (cover): shift by the crop so the auditorium sits where the cinema scene shows it
  function cropX() {
    const st = document.getElementById('stage').getBoundingClientRect();
    return st.width > 0 ? Math.max(0, -st.left) / (st.width / 1920) : 0;
  }
  function finish() {
    if (video.paused && !video.ended) return;
    if (cutMode && !cutSent) { cutSent = true; askCut(); }   // (ended before the last frames were seen)
    setTimeout(() => {
      playing = false;
      canvas.style.transform = '';
      canvas.style.display = hud.style.display = video.style.display = 'none';
      showBubbles(true);
      const every = Number(q.get('fly'));
      if (every > 0) repeatTimer = setTimeout(play, every * 1000);
    }, cutMode && cutOk === false ? Math.max(HOLD, 20000) : HOLD);
  }

  async function play(opts = {}) {
    if (playing) return;
    clearTimeout(repeatTimer);
    cutMode = !!opts.cut; cutSent = false; wideSent = false; cutOk = null;
    if (cutMode) {
      auditoriumWide();
      // OBS only loads the auditorium once it has been shown: have the bridge load it off-screen now (OBS copy only)
      if (inObs() && q.get('flycutdry') !== '1') fetch(WARM, { method: 'POST', body: '{}', signal: AbortSignal.timeout(4000) })
        .then((r) => r.text()).then((t) => console.log('[fly] bridge warm-up:', t)).catch((err) => console.warn('[fly] warm-up failed:', err.message || err));
    }
    try {
      if (!meta) {
        [meta, layout] = await Promise.all([
          fetch(`${BASE}transition-camera.json`, { cache: 'no-store' }).then((r) => r.json()),
          fetch('roxy3d/qa11/cinema_layout_13.json', { cache: 'no-store' }).then((r) => r.json()),
        ]);
      }
      if (!gl && !setup()) return;
      window.DD_FLY?.wide?.();
      await new Promise((r) => setTimeout(r, 1200));   // let the lobby camera settle on the wide shot (frame 1 = it)
      cards = await gatherCards();
      lastStep = 0;
      await drawAtlas(cards);
      console.log(`[fly] ${cards.filter((c) => c.part === 'A').length} lobby + ${cards.filter((c) => c.part === 'B').length} seated cards`);
      video.currentTime = 0;
      video.style.display = 'block';
      try { await video.play(); } catch (err) {
        // interrupted (e.g. the page was hidden for a moment): one more try before giving up
        await new Promise((r) => setTimeout(r, 500));
        await video.play();
      }
      playing = true;
      canvas.style.display = 'block';
      hud.style.display = cutMode || q.get('flyhud') === '0' ? 'none' : 'block';   // the debug line never goes on stream
      showBubbles(false);
      video.requestVideoFrameCallback(onFrame);
    } catch (err) {
      console.error('[fly]', err);
      playing = false;
      if (video) video.style.display = 'none';
    }
  }

  addEventListener('keydown', (e) => { if (e.key.toLowerCase() === 't' && !e.repeat) play(); });
  window.DD_FLY_PLAY = play;
  // QA: which chatters have animated emotes, and how many frames
  window.DD_FLY_ANIMATED = () => cards.filter((c) => (emoteInfo.get(c.em || '?')?.frames.length || 0) > 1).map((c) => ({ nick: c.nick, part: c.part, em: c.em, frames: emoteInfo.get(c.em).frames.length, ms: Math.round(emoteInfo.get(c.em).total) }));
  // QA: where each card is now (live part A: lobby spot + step-aside, visibility, hop)
  window.DD_FLY_CARDS = () => cards.map((c) => ({ id: c.id, nick: c.nick, part: c.part, p: c.p.map((x) => +x.toFixed(3)),
    pv: c.pv && c.pv.map((x) => +x.toFixed(3)), vis: c.vis ?? 1, hop: +(c.hopZ || 0).toFixed(3) }));
  // QA: hold one frame (video paused) - DD_FLY_SEEK(g); play() starts over
  window.DD_FLY_SEEK = (g) => new Promise((res) => {
    if (!playing) return res(false);
    video.pause();
    video.addEventListener('seeked', () => { render(g); res(true); }, { once: true });
    video.currentTime = (g - 0.5) / meta.fps;
  });
  const first = Number(q.get('fly'));
  if (first > 0) repeatTimer = setTimeout(play, first * 1000);
})();
