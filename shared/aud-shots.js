/* Brief 102 (15 Nov 2026): the auditorium's three screen shots, played by auditorium.html (QA copy: aud-shots-qa.js).
 *   T1 "Into the film"   8 s: from the zoomed Film shot until the screen fills the frame; OBS then cuts to the
 *                              fullscreen film scene (obs-bridge.js).
 *   T2 "Out of the film" 10 s: OBS cuts back to the auditorium (frame 1 = all green = the film full frame), the camera
 *                              comes out over the heads and HOLDS there: the 4K hold plate with the chatters drawn in, live.
 *   T3 "Back to the room" 11 s: from the hold to the page's default view; its last frame is the page's own dim plate,
 *                              then the page carries on live (lights still down, wide shot).
 * Modelled on shared/transition.js (the fly-through player): the rendered colour + two depth tiles per frame
 * (roxy3d/aud101/build_page101.py) in a WebGL canvas over the stage, the real chatters drawn as upright cards at their
 * spots through each frame's camera, hidden behind seat backs by the video's depth (and, for a seated chatter, by
 * their own row's backrest top, as the page cuts them), emotes animating, names by the page's own rules.
 *
 * The film: OBS keys the auditorium browser source on exact #00ff00 and shows the film UNDER it (owner, 14 Nov), so
 * the seat backs that cross the screen in T2 stay in front of the film (obs-bridge.js moves the film under the
 * auditorium at T1's first frame and back on top at T3's last). Every pixel of the screen that is green in
 * the render is written as exact (0, 255, 0); the screen's soft edges are despilled (no green fringe); a card over the
 * green is drawn opaque or not at all (no green halo round a head over the film). Nothing else (glow, beam, dust,
 * bubbles) is drawn over the screen while a shot plays. Per video frame the screen's corners
 * (t1|t2|t3_screen_corners.json) go to the bridge, so OBS pins the film to the frame actually shown.
 *
 * Commands: control panel (control.html) -> {cmd: 'shot', value: 't1' | 't2' | 't3' | 'stop'} -> DD_SHOTS.command().
 * Options: ?shotsdir=<folder> (default roxy3d/aud101/page/final/), ?shottol=0.35 occlusion tolerance (depth steps),
 *          ?shotghost=1 hidden parts faint (QA), ?shotwarm=<ms> wait between the bridge's warm-up and the cut back (2500).
 */
(() => {
  'use strict';
  const q = new URLSearchParams(location.search);
  const BASE = (q.get('shotsdir') || 'roxy3d/aud101/page/final/').replace(/\/?$/, '/');
  const ZPP = 73.48469228349535, XPP = 84.8528137423857;   // page z px / horizontal px per world unit, at K = 1
  const TOL = Number(q.get('shottol') ?? 0.35);
  const GHOST = q.get('shotghost') === '1';
  const WARM_MS = Math.max(0, Number(q.get('shotwarm') ?? 2500));
  const FADE_NEAR = 0.35, FADE_LEN = 0.9;   // world units from the lens: cards fade before the camera goes through them
  // owner, 15 Nov: the back-row chatters right under the camera (T2's low pass, the hold) were huge and blurry. A chatter
  // whose picture (its larger side on the 1080 frame) grows past BIG[0] + BIG[1] px fades out over BIG_MS, and back in
  // below BIG[0] - BIG[1] (the margin keeps a hopping chatter from flickering). Fully in or out once settled, so the
  // still hold has no half-faded cards; over the film a card that is mid-fade dissolves in a 4x4 pattern.
  const BIG = (q.get('shotbig') || '295,12').split(',').map(Number), BIG_MS = 400;
  const bigState = new Map();
  let lastSizes = [], bigAt = 0;
  // owner, 15 Nov: over the heads (T2 and the hold) everyone looks at the screen: the chatters left of it face right, the
  // ones right of it face left (by each emote's own facing, shared/emote-facing.json; 'front' emotes keep the page's).
  // Decided with the hold camera, so nobody turns mid-move in T2; in T3 they turn back to the page's facing one by one
  // between 35 % and 60 % of the shot. A change of facing is a quick turn (the card narrows to nothing and opens mirrored).
  const TURN_MS = 320, FORCE_OVER = q.get('shotover') === '1';   // QA: ?shotover=1 = the over-the-heads facing always
  const turnState = new Map();
  const keyHash = (k) => { let h = 2166136261; for (let i = 0; i < k.length; i++) h = Math.imul(h ^ k.charCodeAt(i), 16777619); return (h >>> 0) / 4294967296; };
  function wantFlip(f, bx, by, bz) {
    const over = FORCE_OVER || cur === 'T2' || (state === 'hold' && !cur) ||
      (cur === 'T3' && curFrame < meta.T3.frames * (0.35 + 0.25 * keyHash(f.key)));
    const facing = window.SB?.emoteFacing?.(f.em) || 'front';
    if (!over || !hold || facing === 'front') return f.flip;
    const c = mul(hold.cam.proj, ...mul(hold.cam.view, bx, by, bz).slice(0, 3));
    if (!(c[3] > 0)) return f.flip;
    const sx = 960 * (c[0] / c[3] + 1);
    const mid = (hold.corners[0][0] + hold.corners[1][0] + hold.corners[2][0] + hold.corners[3][0]) / 4;
    return (facing === 'right') !== (mid - sx > 0);
  }
  function facingOf(f, want, now) {   // -> [flip shown, width factor]
    let st = turnState.get(f.key);
    if (!st) { st = { flip: want, from: want, t0: -1e9 }; turnState.set(f.key, st); }
    if (want !== st.flip) { st.from = now - st.t0 < TURN_MS ? st.from : st.flip; st.flip = want; st.t0 = now; }
    const p = Math.min(1, (now - st.t0) / TURN_MS);
    if (p >= 1 || st.from === st.flip) return [st.flip, 1];
    return [p < 0.5 ? st.from : st.flip, Math.max(0.04, Math.abs(Math.cos(Math.PI * p)))];
  }
  const SHOTS = ['T1', 'T2', 'T3'];
  const TAIL_GREEN = 40;   // T3's last frames: the screen is held green (the plate handover would fade it to dark)
  const page = () => window.DD_AUD;

  let gl = null, canvas = null, bgProg = null, cardProg = null, bgBuf = null, buf = null;
  let atlasTex = null, labelTex = null, holdTex = null, holdDepthTex = null, videoTex = null;
  const meta = {}, corners = {}, videos = {};
  let hold = null;          // { cam, corners: [[x,y] x4], img, img2x }
  let state = 'idle', note = '', cur = null, curFrame = 0, holdRaf = 0, filmTimer = 0, t2Token = 0;
  let lastQuadKey = '', cutSent = false, layerSent = false, overSent = false;

  // ---------- GL ----------
  // key green: inside the screen quad, a pixel that is mostly green becomes exact #00ff00; the rest, and a rim of 8 px
  // round it, is despilled, so the screen's soft edges never leave a green fringe the key would not take
  const KEY = `
    uniform sampler2D uCol; uniform float uColV; uniform vec2 uQ[4]; uniform float uForce;
    float sdQuad(vec2 p) {
      float d = 1e9;
      for (int i = 0; i < 4; i++) {
        vec2 a = uQ[i], b = uQ[(i + 1) % 4], e = b - a;
        float l = length(e);
        if (l < 1e-3) continue;
        d = min(d, (e.x * (p.y - a.y) - e.y * (p.x - a.x)) / l);
      }
      return d;
    }
    // (outside the quad nothing is keyed - the film is pinned to the quad - only despilled, up to 8 px out: T1's plate
    // handover frames 2-8 left a faint green line ~5 px above the screen's top edge, recording 15 Nov)
    vec3 keyed(vec2 px, vec3 c, out float isKey) {
      isKey = 0.0;
      float sd = sdQuad(px);
      if (sd < -8.0) return c;
      if (sd >= 0.0 && ((uForce > 0.5 && sd > 0.0) || c.g - max(c.r, c.b) > 0.45)) { isKey = 1.0; return vec3(0.0, 1.0, 0.0); }
      c.g = min(c.g, max(c.r, c.b) + 0.04);
      return c;
    }
    // (explicit level 0: in the card shader this runs after discards, where implicit derivatives - and with them the
    // hold plate's mip level - are undefined)
    vec3 bgAt(vec2 px) { return textureLod(uCol, vec2(px.x / 1920.0, px.y / 1080.0 * uColV), 0.0).rgb; }`;
  const BG_VS = `#version 300 es
    in vec2 aPos; out vec2 vPx;
    void main() { gl_Position = vec4(aPos, 0.0, 1.0); vPx = vec2((aPos.x + 1.0) * 960.0, (1.0 - aPos.y) * 540.0); }`;
  const BG_FS = `#version 300 es
    precision highp float; in vec2 vPx; out vec4 o;
    ${KEY}
    void main() { float k; o = vec4(keyed(vPx, bgAt(vPx), k), 1.0); }`;
  const VS = `#version 300 es
    in vec4 aClip; in vec2 aUv; in float aZ; in float aAlpha; in vec3 aAnchor; in vec3 aWorld; in vec2 aBack; in float aBright;
    out vec2 vUv; out float vZ; out float vAlpha; flat out vec3 vAnchor; out vec3 vWorld; flat out vec2 vBack; flat out float vBright;
    void main() { gl_Position = aClip; vUv = aUv; vZ = aZ; vAlpha = aAlpha; vAnchor = aAnchor; vWorld = aWorld; vBack = aBack; vBright = aBright; }`;
  const FS = `#version 300 es
    precision highp float;
    uniform sampler2D uAtlas; uniform sampler2D uDepth; uniform ivec2 uDOff;
    uniform vec2 uCanvas; uniform float uNear, uFar, uPeriod, uTol, uGhost, uOrtho; uniform vec3 uEye, uFwd;
    in vec2 vUv; in float vZ; in float vAlpha; flat in vec3 vAnchor; in vec3 vWorld; flat in vec2 vBack; flat in float vBright; out vec4 o;
    ${KEY}
    float sceneQ(ivec2 t) {
      float c = texelFetch(uDepth, t + uDOff, 0).r * 255.0;
      if (c > 254.5) return 1e9;
      float f = texelFetch(uDepth, t + uDOff + ivec2(960, 0), 0).r;
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
      float hidden = 0.0;
      if (vAnchor.z < 1.5) {
        vec2 dp = vAnchor.z > 0.5 ? vAnchor.xy : px;
        ivec2 t = ivec2(clamp(floor(dp.x * 0.5), 0.0, 959.0), clamp(floor(dp.y * 0.5), 0.0, 539.0));
        float myQ = log(max(vZ, uNear) / uNear) / log(uFar / uNear) * 254.0;
        if (sceneQ(t) < myQ - uTol) hidden = 1.0;
        // a seated chatter's own backrest top (a line along u at world y = vBack.x, height vBack.y), as the page cuts them
        if (vBack.y > -1e8) {
          vec3 E = uOrtho > 0.5 ? vWorld - uFwd * 1000.0 : uEye;
          float dy = vWorld.y - E.y;
          if (abs(dy) > 1e-6) {
            float s = (vBack.x - E.y) / dy;
            if (s > 0.0 && s < 1.0 && E.z + (vWorld.z - E.z) * s < vBack.y) hidden = 1.0;
          }
        }
      }
      float a = card.a * vAlpha * mix(1.0, uGhost, hidden);
      vec3 rgb = card.rgb / max(card.a, 1e-4) * vBright;
      float k; keyed(px, bgAt(px), k);
      if (k > 0.5) {   // over the film: opaque or nothing; a fading card (vAlpha < 1) dissolves in a fixed 4x4 pattern
        if (card.a * mix(1.0, uGhost, hidden) < 0.45) discard;
        ivec2 d4 = ivec2(gl_FragCoord.xy) & 3;
        ivec2 lo = d4 & 1, hi = d4 >> 1;   // 4x4 Bayer: 4 * b2(low bits) + b2(high bits), b2(x, y) = 2 * (x ^ y) + y
        float th = (float(4 * (2 * (lo.x ^ lo.y) + lo.y) + 2 * (hi.x ^ hi.y) + hi.y) + 0.5) / 16.0;
        if (vAlpha < th) discard;
        o = vec4(rgb, 1.0); return;
      }
      if (a < 0.01) discard;
      o = vec4(rgb * a, a);
    }`;
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
    p.loc = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const u = gl.getActiveUniform(p, i); p.loc[u.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, u.name); }
    return p;
  }
  function tex(mip = false) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  let prepP = null;
  function prepare() {
    prepP ||= (async () => {
      const stage = document.getElementById('stage');
      canvas = document.createElement('canvas');
      canvas.id = 'audshots';
      canvas.style.cssText = 'position:absolute;left:0;top:0;width:1920px;height:1080px;z-index:90000;display:none;pointer-events:none';
      stage.append(canvas);
      gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: false, antialias: false });
      if (!gl) throw new Error('no WebGL2');
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
      bgProg = compile(BG_VS, BG_FS);
      cardProg = compile(VS, FS);
      videoTex = tex(); holdTex = tex(true); holdDepthTex = tex(); atlasTex = tex(); labelTex = tex();
      bgBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, bgBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      buf = gl.createBuffer();
      initAtlas();
      const json = (f) => fetch(BASE + f, { cache: 'no-store' }).then((r) => { if (!r.ok) throw new Error(`${f}: ${r.status}`); return r.json(); });
      const [m1, m2, m3, c1, c2, c3, hc] = await Promise.all([
        json('T1-camera.json'), json('T2-camera.json'), json('T3-camera.json'),
        json('t1_screen_corners.json'), json('t2_screen_corners.json'), json('t3_screen_corners.json'), json('hold_t2_camera.json')]);
      [meta.T1, meta.T2, meta.T3] = [m1, m2, m3];
      for (const [s, c] of [['T1', c1], ['T2', c2], ['T3', c3]]) corners[s] = c.corners.map((f) => [f.TL, f.TR, f.BR, f.BL]);
      const sc = hc.screen_corners_1x;
      hold = { cam: { type: 'PERSP', view: hc.view, proj: hc.proj, near: hc.near, far: hc.far, eye: hc.eye }, corners: [sc.TL, sc.TR, sc.BR, sc.BL] };
      const img = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error(src)); i.src = BASE + src; });
      const [plate, depth] = await Promise.all([img(devicePixelRatio * stageScale() > 1.3 ? 'hold_t2@2x.png' : 'hold_t2.png'), img('hold_t2_depth_tiles.png')]);
      gl.bindTexture(gl.TEXTURE_2D, holdTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, plate);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.bindTexture(gl.TEXTURE_2D, holdDepthTex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, depth);
      for (const s of SHOTS) {
        const v = document.createElement('video');
        v.muted = true; v.playsInline = true; v.preload = 'auto'; v.crossOrigin = 'anonymous';
        v.src = BASE + meta[s].packing.video;
        // full size under the canvas, shown only while it plays: Chrome pauses muted video it thinks nobody sees
        v.style.cssText = 'position:absolute;left:0;top:0;width:1920px;height:1080px;object-fit:fill;z-index:89999;display:none;pointer-events:none';
        v.addEventListener('ended', () => onEnded(s));
        stage.append(v);
        videos[s] = v;
      }
      console.log('[shots] ready:', SHOTS.map((s) => `${s} ${meta[s].frames} frames`).join(', '));
      return true;
    })();
    prepP.catch((e) => { console.error('[shots] prepare failed', e); prepP = null; });
    return prepP;
  }
  const stageScale = () => { const r = document.getElementById('stage').getBoundingClientRect(); return r.width / 1920 || 1; };
  function resize() {
    const r = canvas.getBoundingClientRect();
    const s = Math.min(2, Math.max(1, (r.width / 1920) * (devicePixelRatio || 1)));
    const w = Math.round(1920 * s), h = Math.round(1080 * s);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  }

  // ---------- sprites (as shared/transition.js): every frame of each emote from DGG's CSS, drawn into one atlas ----------
  // Here the atlas grows while it is used (people keep arriving during the hold): each new emote is sampled once and
  // its cells are uploaded on their own.
  const ATLAS = 4096, EBH = 96, MX = 0.25, MT = 0.3, MAX_FRAMES = 16;
  const LAB_W = 360, LAB_H = 34, LAB_ATLAS = 2048, LAB_COLS = Math.floor(LAB_ATLAS / LAB_W), LAB_MAX = LAB_COLS * Math.floor(LAB_ATLAS / LAB_H);
  let atlasCanvas = null, actx = null, ax = 0, ay = 0, rowH = 0, atlasFull = false, mipDirty = false;
  let labCanvas = null, lctx = null, labDirty = false;
  const emoteInfo = new Map();   // key -> info | 'pending' | null
  const labels = new Map();      // nick|color|rainbow -> { i, w, used }
  function initAtlas() {
    atlasCanvas = document.createElement('canvas');
    atlasCanvas.width = atlasCanvas.height = ATLAS;
    actx = atlasCanvas.getContext('2d', { willReadFrequently: true });
    gl.bindTexture(gl.TEXTURE_2D, atlasTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, ATLAS, ATLAS, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    mipDirty = true;
    labCanvas = document.createElement('canvas');
    labCanvas.width = labCanvas.height = LAB_ATLAS;
    lctx = labCanvas.getContext('2d');
  }
  let versionedP = null;
  function versioned() {
    versionedP ||= fetch('/dgg/emotes.json', { cache: 'force-cache' }).then((r) => r.json()).then((list) => {
      const m = new Map();
      for (const e of list) for (const im of e?.image || []) if (im?.name && im?.url) m.set(im.name, im.url);
      return m;
    }).catch(() => new Map());
    return versionedP;
  }
  async function proxied(url) {
    const abs = new URL(url, location.href);
    if (abs.origin === location.origin) return abs.href;
    const map = await versioned();
    const v = map.get(abs.pathname.split('/').pop());
    if (v) return `/dgg/emote-img?u=${encodeURIComponent(v)}`;
    if (abs.hostname === 'cdn.destiny.gg' && /^\/emotes\/[\w-]+\.(png|gif|webp|avif)$/.test(abs.pathname)) {
      const ver = /cdn\.destiny\.gg\/([0-9.]+)\//.exec(map.values().next().value || '')?.[1];
      if (ver) return `/dgg/emote-img?u=${encodeURIComponent(`https://cdn.destiny.gg/${ver}${abs.pathname}`)}`;
    }
    return null;
  }
  const loadImg = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  async function decodeFrames(src, type) {
    if (typeof ImageDecoder === 'undefined') return null;
    try {
      const res = await fetch(src, { signal: AbortSignal.timeout(4000) });
      const dec = new ImageDecoder({ data: await res.arrayBuffer(), type });
      await dec.tracks.ready;
      const count = dec.tracks.selectedTrack.frameCount;
      if (!(count > 1)) { dec.close(); return null; }
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
  // still = the sleeping look (SB.sleepEmote): DGG's resting frame, no animation, no transform of its own
  async function sampleEmote(name, still = false) {
    const el = document.createElement('span');
    el.className = `emote ${name}`;
    el.style.cssText = 'position:absolute;left:-9999px;top:0';
    if (still) {
      el.style.animation = 'none';
      const bg = window.SB?.sleepInfo?.(name)?.bg;
      if (bg) el.style.backgroundPosition = bg;
    }
    document.body.append(el);
    try {
      const cs = getComputedStyle(el);
      const w = parseFloat(cs.width), h = parseFloat(cs.height);
      const url = /url\(["']?([^"')]+)["']?\)/.exec(cs.backgroundImage)?.[1];
      if (!url || !(w > 1) || !(h > 1)) return null;
      const origin = cs.transformOrigin.split(/\s+/).map((v) => parseFloat(v) || 0);
      const read = (ms) => ({ pos: cs.backgroundPosition, bs: cs.backgroundSize, tf: still ? 'none' : cs.transform, op: parseFloat(cs.opacity) || 1, ms });
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
            anims.forEach((a) => { a.currentTime = (t.delay || 0) + ((k + 0.5) / N) * period; });
            samples.push(read(period / N));
          }
        }
      } else samples = [read(1000)];
      return { url, w, h, origin, samples };
    } finally { el.remove(); }
  }
  const LOCAL_IMG = { cpMOP: 'assets/cpMOP.webp', MOPPING: 'assets/cpMOP.webp' };
  async function plainFrames(src, type) {
    let frames = type ? await decodeFrames(src, type) : null;
    if (!frames?.length) {
      const img = await loadImg(src);
      if (!img) return null;
      frames = [{ src: img, ms: 1000 }];
    }
    const w = frames[0].src.naturalWidth || frames[0].src.width, h = frames[0].src.naturalHeight || frames[0].src.height;
    return { w, h, origin: [w / 2, h / 2], frames: frames.map((f) => ({ src: f.src, sx: 0, sy: 0, sw: w, sh: h, tf: 'none', op: 1, ms: f.ms })) };
  }
  async function emoteFrames(name, still = false) {
    if (LOCAL_IMG[name]) {
      const job = await plainFrames(LOCAL_IMG[name], still ? null : 'image/webp');
      return job;
    }
    const s = await sampleEmote(name, still);
    if (!s) return null;
    const src = await proxied(s.url);
    if (!src) return null;
    let gif = s.samples.length === 1 && /\.gif(\?|$)/i.test(s.url) ? await decodeFrames(src, 'image/gif') : null;
    if (gif && still) gif = gif.slice(0, 1);   // (asleep: the first frame, as the page's frozen canvas)
    const base = gif ? null : await loadImg(src);
    if (!gif && !base) return null;
    const rect = (im, smp) => {
      const nw = im.naturalWidth || im.width, nh = im.naturalHeight || im.height;
      const bs = smp.bs.split(',')[0].trim().split(/\s+/), pos = smp.pos.split(',')[0].trim().split(/\s+/);
      let kx = 1, ky = 1;
      if (bs[0] && bs[0] !== 'auto' && parseFloat(bs[0])) { kx = parseFloat(bs[0]) / nw; ky = bs[1] && bs[1] !== 'auto' ? parseFloat(bs[1]) / nh : kx; }
      const off = (v, box, size) => (v?.endsWith('%') ? (parseFloat(v) / 100) * (box - size) : parseFloat(v) || 0);
      const px = off(pos[0], s.w, nw * kx), py = off(pos[1] ?? pos[0], s.h, nh * ky);
      return { sx: -px / kx, sy: -py / ky, sw: s.w / kx, sh: s.h / ky };
    };
    const frames = gif
      ? gif.map((g) => ({ src: g.src, ...rect(g.src, s.samples[0]), tf: s.samples[0].tf, op: s.samples[0].op, ms: g.ms }))
      : s.samples.map((smp) => ({ src: base, ...rect(base, smp), tf: smp.tf, op: smp.op, ms: smp.ms }));
    return { w: s.w, h: s.h, origin: s.origin, frames };
  }
  // each cell keeps a transparent gutter: without it the mipmaps bled the neighbouring cell's edge into a card's top or
  // bottom row, a thin line that showed over the green (QA 15 Nov)
  const GUT = 6;
  function place(cw, ch) {
    const w = cw + 2 * GUT, h = ch + 2 * GUT;
    if (ax + w > ATLAS) { ax = 0; ay += rowH; rowH = 0; }
    if (ay + h > ATLAS) return null;
    const at = [ax + GUT, ay + GUT];
    ax += w; rowH = Math.max(rowH, h);
    return at;
  }
  // key: an emote name, or 'img:<url>' for a carried item; margins: emotes get room for their CSS transforms
  function ensure(key) {
    if (emoteInfo.has(key)) return;
    emoteInfo.set(key, 'pending');
    const item = key.startsWith('img:');
    const sleeper = key.startsWith('sleep:') ? key.slice(6) : null;   // a dozing chatter's emote: still, eyes closed
    const limit = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(() => r(null), ms))]);
    limit((item ? plainFrames(key.slice(4)) : emoteFrames(sleeper || key, !!sleeper)).catch(() => null), 6000).then((job) => {
      const w = job?.w || 40, h = job?.h || 30;
      const mx = item ? 0.02 : MX, mt = item ? 0.02 : MT;
      const boxH = item ? Math.min(EBH, h * 2) : EBH, boxW = boxH * w / h;
      const cellW = Math.ceil(boxW * (1 + 2 * mx)), cellH = Math.ceil(boxH * (1 + mt));
      const info = { mx, mt, frames: [], total: 0 };
      const list = job?.frames?.length ? job.frames : [null];
      for (const fr of (atlasFull ? list.slice(0, 1) : list)) {
        const at = place(cellW, cellH);
        if (!at) { atlasFull = true; break; }
        const [cx, cy] = at, bx = cx + boxW * mx, by = cy + boxH * mt;
        actx.save();
        actx.clearRect(cx, cy, cellW, cellH);
        actx.beginPath(); actx.rect(cx, cy, cellW, cellH); actx.clip();
        if (fr) {
          actx.translate(bx, by);
          actx.scale(boxW / w, boxH / h);
          const m = /matrix\(([^)]+)\)/.exec(fr.tf || '');
          if (m) {
            const [a, b, c2, d, e, f] = m[1].split(',').map(Number);
            actx.translate(job.origin[0], job.origin[1]);
            actx.transform(a, b, c2, d, e, f);
            actx.translate(-job.origin[0], -job.origin[1]);
          }
          actx.globalAlpha = fr.op;
          actx.drawImage(fr.src, fr.sx, fr.sy, fr.sw, fr.sh, 0, 0, w, h);
          if (sleeper) window.SB?.drawSleepLids?.(actx, sleeper);   // the page's lids, same box px
        } else if (!item) {
          actx.fillStyle = 'rgba(30,26,48,.85)';
          actx.fillRect(bx, by + boxH * 0.3, boxW, boxH * 0.4);
          actx.fillStyle = '#ddd';
          actx.font = `600 ${Math.round(boxH * 0.22)}px Oswald, Arial Narrow, sans-serif`;
          actx.textAlign = 'center'; actx.textBaseline = 'middle';
          actx.fillText(sleeper || key, bx + boxW / 2, by + boxH / 2, boxW);
        }
        actx.restore();
        gl.bindTexture(gl.TEXTURE_2D, atlasTex);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, cx, cy, gl.RGBA, gl.UNSIGNED_BYTE, actx.getImageData(cx, cy, cellW, cellH));
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        mipDirty = true;
        const ms = fr?.ms || 1000;
        info.frames.push({ u0: (cx + 0.5) / ATLAS, v0: (cy + 0.5) / ATLAS, u1: (cx + cellW - 0.5) / ATLAS, v1: (cy + cellH - 0.5) / ATLAS, ms });
        info.total += ms;
      }
      if (atlasFull) console.warn('[shots] emote atlas full: later emotes keep one frame or none');
      emoteInfo.set(key, info.frames.length && (job || !item) ? info : null);
    });
  }
  // dozing chatters (the page's figures: asleep) get their own atlas entry: still frame with the lids
  const emKey = (f) => (f.asleep ? `sleep:${f.em}` : f.em);
  function frameOf(info, phase, now) {
    if (info.frames.length === 1) return info.frames[0];
    let t = (now + phase) % info.total;
    for (const f of info.frames) { if (t < f.ms) return f; t -= f.ms; }
    return info.frames[info.frames.length - 1];
  }
  // the page's name pill (#names .nm: 12 px Oswald on a dark pill), drawn at 2x
  function labelOf(f) {
    const key = `${f.nick}|${f.color}|${f.rainbow}`;
    let L = labels.get(key);
    if (L) { L.used = performance.now(); return L; }
    let i = labels.size;
    if (i >= LAB_MAX) {   // full: reuse the least recently shown
      const old = [...labels.entries()].sort((a, b) => a[1].used - b[1].used)[0];
      labels.delete(old[0]); i = old[1].i;
    }
    const lx = (i % LAB_COLS) * LAB_W, ly = Math.floor(i / LAB_COLS) * LAB_H;
    lctx.clearRect(lx, ly, LAB_W, LAB_H);
    lctx.font = "500 24px Oswald, 'Arial Narrow', sans-serif";
    const tw = Math.min(LAB_W - 20, lctx.measureText(f.nick).width);
    lctx.fillStyle = 'rgba(8,6,18,.5)';
    lctx.beginPath(); lctx.roundRect(lx + (LAB_W - tw) / 2 - 8, ly + 2, tw + 16, LAB_H - 4, 4); lctx.fill();
    lctx.textAlign = 'center'; lctx.textBaseline = 'middle';
    lctx.shadowColor = '#000'; lctx.shadowBlur = 6;
    if (f.rainbow) {
      const g = lctx.createLinearGradient(lx + (LAB_W - tw) / 2, 0, lx + (LAB_W + tw) / 2, 0);
      ['#ff6b6b', '#ffd93d', '#6bff95', '#67d8ff', '#b28dff', '#ff78c6'].forEach((c, k) => g.addColorStop(k / 5, c));
      lctx.fillStyle = g;
    } else lctx.fillStyle = f.color || '#fff';
    lctx.fillText(f.nick, lx + LAB_W / 2, ly + LAB_H / 2 + 1, LAB_W - 20);
    lctx.shadowBlur = 0;
    labDirty = true;
    L = { i, w: (tw + 16) / 2, used: performance.now() };
    labels.set(key, L);
    return L;
  }

  // ---------- per frame ----------
  const mul = (m, x, y, z) => [m[0] * x + m[1] * y + m[2] * z + m[3], m[4] * x + m[5] * y + m[6] * z + m[7],
    m[8] * x + m[9] * y + m[10] * z + m[11], m[12] * x + m[13] * y + m[14] * z + m[15]];
  const phases = new Map();
  function cardVerts(cam) {
    const P = page();
    const K = P.K();
    const V = cam.view, Pm = cam.proj;
    let rx = V[0], ry = V[1];
    const rl = Math.hypot(rx, ry) || 1;
    rx /= rl; ry /= rl;
    const now = performance.now();
    const quads = [], labs = [], sizes = [];
    const bigDt = bigAt ? Math.min(100, now - bigAt) : 0;
    bigAt = now;
    const project = (x, y, z) => { const pc = mul(V, x, y, z); return { clip: mul(Pm, pc[0], pc[1], pc[2]), z: -pc[2] }; };
    const toPx = (c) => [960 * (c[0] / c[3] + 1), 540 * (1 - c[1] / c[3])];
    for (const f of P.figures()) {
      if (!f.seen || f.alpha < 0.02 || !f.em) continue;
      if (!phases.has(f.key)) phases.set(f.key, Math.random() * 60000);
      // page (u, v, zpx) -> world [u, -v, zpx / ZPP]; the hop (lift) is in stage px, i.e. zpx * K
      const bx = f.pos[0], by = -f.pos[1], bz = f.pos[2] / ZPP + (f.lift || 0) / (ZPP * K);
      // the body: page px -> world (horizontal XPP*K, vertical ZPP*K per unit); tilt and squash as the page's bod
      const pxToW = (sx, hy) => [sx / (XPP * K), hy / (ZPP * K)];
      const rot = (f.tilt || 0) * Math.PI / 180, cs = Math.cos(rot), sn = Math.sin(rot), sqx = (2 - (f.sq || 1)), sqy = f.sq || 1;
      const local = (sx, hy) => { const x = sx * sqx, y = hy * sqy; return pxToW(x * cs + y * sn, -x * sn + y * cs); };
      const [flipNow, wf] = facingOf(f, wantFlip(f, bx, by, bz), now);
      const parts = [{ key: emKey(f), w: f.emW * f.grow * wf, h: f.emH * f.grow, x0: -f.emW * f.grow * wf / 2, y0: 0, flip: flipNow, back: f.back, bright: f.bright, emote: true }];
      for (const it of f.items) parts.push({ key: `img:${it.src}`, w: it.w * f.grow, h: it.h * f.grow, x0: it.x * f.grow, y0: -(it.y + it.h) * f.grow, flip: false, back: null, bright: f.itemBright });
      let first = null, big = 1;
      for (const p of parts) {
        const info = emoteInfo.get(p.key);
        if (info === undefined) { ensure(p.key); continue; }
        if (!info || info === 'pending') continue;
        // cell = box plus margins (mx each side, mt on top), feet (box bottom) at y0
        const cw = p.w * (1 + 2 * info.mx), ch = p.h * (1 + info.mt), cx0 = p.x0 - p.w * info.mx;
        const corners4 = [[cx0, p.y0], [cx0 + cw, p.y0], [cx0, p.y0 + ch], [cx0 + cw, p.y0 + ch]].map(([sx, hy]) => {
          const [s, h] = local(sx, hy);
          const wx = bx + rx * s, wy = by + ry * s, wz = bz + h + 0.004;
          return { ...project(wx, wy, wz), w: [wx, wy, wz] };
        });
        if (corners4.some((c) => c.z <= cam.near + 0.01 || c.clip[3] <= 0)) continue;
        const fr = frameOf(info, phases.get(f.key), now);
        const [ua, ub] = p.flip ? [fr.u1, fr.u0] : [fr.u0, fr.u1];
        const uv = [[ua, fr.v1], [ub, fr.v1], [ua, fr.v0], [ub, fr.v0]];
        const zc = (corners4[0].z + corners4[1].z) / 2;
        if (p.emote) {
          const pa0 = toPx(corners4[0].clip), pa1 = toPx(corners4[1].clip), pa2 = toPx(corners4[2].clip);
          const hpx = Math.max(Math.abs(pa0[1] - pa2[1]) / (1 + info.mt), Math.hypot(pa1[0] - pa0[0], pa1[1] - pa0[1]) / (1 + 2 * info.mx));   // the larger side of the picture
          let st = bigState.get(f.key);
          if (!st) { st = { on: hpx < BIG[0], v: hpx < BIG[0] ? 1 : 0 }; bigState.set(f.key, st); }
          if (st.on && hpx > BIG[0] + BIG[1]) st.on = false;
          else if (!st.on && hpx < BIG[0] - BIG[1]) st.on = true;
          st.v = st.on ? Math.min(1, st.v + bigDt / BIG_MS) : Math.max(0, st.v - bigDt / BIG_MS);
          big = st.v * st.v * (3 - 2 * st.v);
          sizes.push(Math.round(hpx));
        }
        const alpha = Math.min(1, Math.max(0, (zc - FADE_NEAR) / FADE_LEN)) * f.alpha * big;
        if (alpha <= 0.01) continue;
        const back = p.back ? [-p.back[0], p.back[1] / ZPP] : [0, -1e9];
        quads.push({ zc: zc - (p.emote ? 0 : 0.001), corners: corners4, uv, alpha, back, bright: p.bright });
        if (!first) {   // the name's anchor: 60 % up the emote's own box (not its margins), so a hidden chatter's name hides too
          const b0 = toPx(corners4[0].clip), b1 = toPx(corners4[1].clip), t0 = toPx(corners4[2].clip), t1 = toPx(corners4[3].clip);
          const bz = (corners4[0].z + corners4[1].z) / 2, tz = (corners4[2].z + corners4[3].z) / 2;
          const f2 = 0.6 / (1 + info.mt), f1 = 1 - f2;
          first = { zc, alpha, hx: ((b0[0] + b1[0]) * f1 + (t0[0] + t1[0]) * f2) / 2, hy: ((b0[1] + b1[1]) * f1 + (t0[1] + t1[1]) * f2) / 2, hz: bz * f1 + tz * f2 };
        }
      }
      // name under the feet, sized with the shot as the page's #names layer zooms with its camera
      if (f.name > 0.01 && first) {
        const a = project(bx, by, bz), b = project(bx + rx, by + ry, bz);
        if (a.clip[3] > 0 && b.clip[3] > 0) {
          const pa = toPx(a.clip), pb = toPx(b.clip);
          const k = Math.min(3, Math.max(0.6, Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) / (XPP * K)));
          const L = labelOf(f);
          const s = (k * 14) / (LAB_H / 2);   // the page's pill is ~14 px tall, 5 px under the feet
          const hw = (LAB_W / 4) * s, top = pa[1] + 4 * k, bot = top + (LAB_H / 2) * s;
          const lu0 = (L.i % LAB_COLS) * LAB_W / LAB_ATLAS, lv0 = Math.floor(L.i / LAB_COLS) * LAB_H / LAB_ATLAS;
          labs.push({ zc: a.z, alpha: f.name * first.alpha, ax: first.hx, ay: first.hy, az: first.hz, x: pa[0], top, bot, hw, lu0, lv0, lu1: lu0 + LAB_W / LAB_ATLAS, lv1: lv0 + LAB_H / LAB_ATLAS });
        }
      }
    }
    lastSizes = sizes;
    quads.sort((a, b) => b.zc - a.zc);
    const data = [];
    for (const { corners: c4, uv, alpha, back, bright } of quads) {
      for (const k of [0, 1, 2, 2, 1, 3]) {
        const c = c4[k];
        data.push(c.clip[0], c.clip[1], 0, c.clip[3], uv[k][0], uv[k][1], c.z, alpha, 0, 0, 0, c.w[0], c.w[1], c.w[2], back[0], back[1], bright);
      }
    }
    const ldata = [];
    const nx = (p) => p / 960 - 1, ny = (p) => 1 - p / 540;
    for (const L of labs) {
      const pts = [[L.x - L.hw, L.bot, L.lu0, L.lv1], [L.x + L.hw, L.bot, L.lu1, L.lv1], [L.x - L.hw, L.top, L.lu0, L.lv0], [L.x + L.hw, L.top, L.lu1, L.lv0]];
      for (const k of [0, 1, 2, 2, 1, 3]) {
        const p = pts[k];
        ldata.push(nx(p[0]), ny(p[1]), 0, 1, p[2], p[3], L.az, L.alpha, L.ax, L.ay, 1, 0, 0, 0, 0, -1e9, 1);   // (owner 15 Nov: hidden by the room where the head is)
      }
    }
    return { data: new Float32Array(data), labels: new Float32Array(ldata), drawn: quads.length };
  }

  // one picture: background (a video frame or the hold plate), keyed green, then the chatters over it
  function render(src) {
    resize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    const isHold = src.kind === 'hold';
    gl.activeTexture(gl.TEXTURE0);
    if (isHold) gl.bindTexture(gl.TEXTURE_2D, holdTex);
    else {
      gl.bindTexture(gl.TEXTURE_2D, videoTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src.video);
    }
    const colV = isHold ? 1 : 1080 / 1620;
    const quad = new Float32Array(src.quad.flat());
    const force = src.force ? 1 : 0;
    gl.disable(gl.BLEND);
    gl.useProgram(bgProg);
    gl.bindBuffer(gl.ARRAY_BUFFER, bgBuf);
    const ap = gl.getAttribLocation(bgProg, 'aPos');
    gl.enableVertexAttribArray(ap);
    gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1i(bgProg.loc.uCol, 0);
    gl.uniform1f(bgProg.loc.uColV, colV);
    gl.uniform2fv(bgProg.loc.uQ, quad);
    gl.uniform1f(bgProg.loc.uForce, force);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.disableVertexAttribArray(ap);

    if (mipDirty) { gl.bindTexture(gl.TEXTURE_2D, atlasTex); gl.generateMipmap(gl.TEXTURE_2D); mipDirty = false; }
    if (labDirty) {
      gl.bindTexture(gl.TEXTURE_2D, labelTex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, labCanvas);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      labDirty = false;
    }
    const cam = src.cam;
    const { data, labels: ldata, drawn } = cardVerts(cam);
    if (data.length || ldata.length) {
      gl.useProgram(cardProg);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      const stride = 17 * 4;
      const attrs = [['aClip', 4, 0], ['aUv', 2, 16], ['aZ', 1, 24], ['aAlpha', 1, 28], ['aAnchor', 3, 32], ['aWorld', 3, 44], ['aBack', 2, 56], ['aBright', 1, 64]];
      const L = cardProg.loc;
      // unit 0 again: the atlas / label uploads above rebind whatever unit is active (they took unit 0 from the
      // background, and the key test then read the atlas: green halos round cards in the OBS recording, 15 Nov)
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, isHold ? holdTex : videoTex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, isHold ? holdDepthTex : videoTex);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, atlasTex);
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, labelTex);
      gl.uniform1i(L.uCol, 0);
      gl.uniform1i(L.uDepth, 1);
      gl.uniform1i(L.uAtlas, 2);
      gl.uniform2i(L.uDOff, 0, isHold ? 0 : 1080);
      gl.uniform1f(L.uColV, colV);
      gl.uniform2fv(L.uQ, quad);
      gl.uniform1f(L.uForce, force);
      gl.uniform2f(L.uCanvas, canvas.width, canvas.height);
      gl.uniform1f(L.uNear, cam.near);
      gl.uniform1f(L.uFar, cam.far);
      gl.uniform1f(L.uPeriod, 32);
      gl.uniform1f(L.uTol, TOL);
      gl.uniform1f(L.uGhost, (window.DD_SHOTS_GHOST ?? GHOST) ? 0.25 : 0);
      gl.uniform1f(L.uOrtho, cam.type === 'ORTHO' ? 1 : 0);
      gl.uniform3f(L.uEye, cam.eye[0], cam.eye[1], cam.eye[2]);
      gl.uniform3f(L.uFwd, -cam.view[8], -cam.view[9], -cam.view[10]);
      const draw = (arr) => {
        gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STREAM_DRAW);
        for (const [name, size, off] of attrs) {
          const l = gl.getAttribLocation(cardProg, name);
          gl.enableVertexAttribArray(l);
          gl.vertexAttribPointer(l, size, gl.FLOAT, false, stride, off);
        }
        gl.drawArrays(gl.TRIANGLES, 0, arr.length / 17);
      };
      if (data.length) draw(data);
      if (ldata.length) { gl.uniform1i(L.uAtlas, 3); draw(ldata); }
    }
    return drawn;
  }

  // ---------- the film's corners to OBS (latest only, per shown frame) ----------
  function sendQuad(quad) {
    const P = page();
    if (!P?.inObs()) return;
    const vq = P.toViewport(quad);
    const key = vq.map((p) => p.join(',')).join(' ');
    if (key === lastQuadKey) return;
    if (P.bridgeSend({ film: true, w: innerWidth, h: innerHeight, quad: vq })) lastQuadKey = key;
  }
  function bridgeAsk(what) {
    const P = page();
    if (!P?.inObs()) return Promise.resolve({ ok: null, skipped: 'not in OBS' });
    return new Promise((res) => {
      const id = Math.random().toString(36).slice(2, 8);
      const t = setTimeout(() => { delete waiting[id]; res({ ok: false, error: 'no answer from the bridge' }); }, 5000);
      waiting[id] = (m) => { clearTimeout(t); res(m); };
      if (!P.bridgeSend({ shot: what, rid: id })) { clearTimeout(t); delete waiting[id]; res({ ok: false, error: 'bridge not linked' }); }
    });
  }
  const waiting = {};
  function onBridge(m) { if (m && m.rid && waiting[m.rid]) { const f = waiting[m.rid]; delete waiting[m.rid]; f(m); } }

  // ---------- playing ----------
  function videoFrame(s, mediaTime) { return Math.min(meta[s].frames, Math.max(1, Math.round(mediaTime * meta[s].fps) + 1)); }
  function showVideoFrame(s, g) {
    curFrame = g;
    const cam = meta[s].cam[g - 1];
    const quad = corners[s][g - 1];
    render({ kind: 'video', video: videos[s], cam, quad, force: s === 'T3' && g > meta[s].frames - TAIL_GREEN });
    sendQuad(quad);
  }
  function onFrame(s) {
    return (now, m) => {
      if (cur !== s) return;
      const g = videoFrame(s, m.mediaTime);
      showVideoFrame(s, g);
      if (canvas.style.display === 'none') canvas.style.display = 'block';
      // keyed OBS: the film goes under the auditorium once OBS surely shows the canvas (0.4 s in; nothing crosses the
      // screen that early). Sent with the canvas's first frame, OBS still had the page's black screen for ~8 frames
      // and the film vanished for 0.13 s (recording, 15 Nov).
      if (s === 'T1' && g >= 12 && !layerSent) { layerSent = true; bridgeAsk('layer-under').then((r) => console.log('[shots] film layer:', JSON.stringify(r))); }
      if (s === 'T1' && g >= meta.T1.frames && !cutSent) { cutSent = true; cutToFilm(); }
      // T3's last second: the film back on top already (the screen is held exact green then, so on top and under look
      // the same), so the page can take over the moment T3 ends. Waiting for the bridge's answer after the end held the
      // still last frame for a while (owner, 15 Nov: "the transition to the actual auditorium takes a long time")
      if (s === 'T3' && g >= meta.T3.frames - 30 && !overSent) { overSent = true; bridgeAsk('layer-over').then((r) => console.log('[shots] film layer:', JSON.stringify(r))); }
      videos[s].requestVideoFrameCallback(onFrame(s));
    };
  }
  async function play(s) {
    const v = videos[s];
    cur = s;
    if (v.currentTime !== 0 || v.readyState < 2) {
      await new Promise((r) => { const done = () => r(); v.addEventListener('seeked', done, { once: true }); v.currentTime = 0; setTimeout(done, 1500); });
    }
    // frame 1 on the canvas first, then the (packed, not presentable) video under it: shown before the canvas, the raw
    // colour + depth picture flashed for two frames at T1's start (OBS recording, 15 Nov)
    showVideoFrame(s, 1);
    canvas.style.display = 'block';
    v.style.display = 'block';
    v.requestVideoFrameCallback(onFrame(s));
    try { await v.play(); } catch { await new Promise((r) => setTimeout(r, 400)); await v.play(); }
  }
  function cutToFilm() {
    bridgeAsk('cut-film').then((r) => console.log('[shots] cut to the fullscreen film:', JSON.stringify(r)));
  }
  function onEnded(s) {
    if (cur !== s) return;
    const v = videos[s];
    showVideoFrame(s, meta[s].frames);
    if (s === 'T1') {
      if (!cutSent) { cutSent = true; cutToFilm(); }
      state = 'film'; note = 'the film is full screen (OBS: fullscreen film scene); T2 brings the room back';
      cur = null;
      page()?.camHidden(true);
      // keep the last frame (all green) on the canvas while OBS shows the film full screen
      clearInterval(filmTimer);
      filmTimer = setInterval(() => { if (state === 'film') render({ kind: 'video', video: v, cam: meta.T1.cam[meta.T1.frames - 1], quad: corners.T1[meta.T1.frames - 1] }); }, 1000);
    } else if (s === 'T2') {
      cur = null;
      state = 'hold'; note = 'holding over the heads (live); T3 goes back to the room';
      v.style.display = 'none';
      holdLoop();
    } else if (s === 'T3') {
      cur = null;
      // the film back on top of the auditorium first (T3's last frame and the page show the same screen), then the page
      if (!overSent) { overSent = true; bridgeAsk('layer-over').then((r) => console.log('[shots] film layer:', JSON.stringify(r))); }
      finishShots(true);
    }
  }
  let holdAt = 0, holdTimer = 0;
  function holdLoop() {
    cancelAnimationFrame(holdRaf);
    clearInterval(holdTimer);
    const draw = () => {
      holdAt = performance.now();
      try { render({ kind: 'hold', cam: hold.cam, quad: hold.corners }); sendQuad(hold.corners); } catch (e) { console.error('[shots] hold', e); }
    };
    const stepHold = () => {
      if (state !== 'hold') return;
      holdRaf = requestAnimationFrame(stepHold);
      draw();
    };
    stepHold();
    // rAF stalls in a hidden tab / source: a slow timer keeps the picture current
    holdTimer = setInterval(() => { if (state !== 'hold') clearInterval(holdTimer); else if (performance.now() - holdAt > 200) draw(); }, 100);
  }
  function finishShots(wide = false) {
    if (!wide && state !== 'idle') bridgeAsk('layer-over');   // (a stop or a failure: the film back on top)
    cancelAnimationFrame(holdRaf);
    clearInterval(holdTimer);
    clearInterval(filmTimer);
    for (const s of SHOTS) { videos[s].pause(); videos[s].style.display = 'none'; }
    if (canvas) canvas.style.display = 'none';
    lastQuadKey = '';
    state = 'idle'; note = ''; cur = null; curFrame = 0;
    const P = page();
    P?.camHidden(false);
    // the page's own camera (after T3: the wide shot, film still on, no push), effects and bubbles back, its own
    // corners to the bridge
    P?.afterShots(wide);
  }

  async function startT1() {
    const P = page();
    const ok = P?.filmReady();
    if (ok !== true) { note = `T1 needs ${ok || 'the auditorium page'}`; return; }
    state = 'prep'; note = 'getting ready: the Film shot, then T1';
    try {
      await prepare();
      P.shotsOn(true);   // glow, beam, dust (1.5 s fade) and bubbles fade out; no automatic follows
      const fadeEnd = performance.now() + 1700;
      for (const f of P.figures()) { ensure(emKey(f)); for (const it of f.items) ensure(`img:${it.src}`); }
      const until = performance.now() + 2500;
      await new Promise((r) => {
        const tick = () => {
          const pending = [...emoteInfo.values()].some((i) => i === 'pending');
          if (!pending || performance.now() > until) r(); else setTimeout(tick, 100);
        };
        tick();
      });
      await P.camera('film');          // eases onto the Film framing if it is not there, then holds it exactly
      await new Promise((r) => setTimeout(r, Math.max(0, fadeEnd - performance.now())));
      if (state !== 'prep') return;
      cutSent = false; layerSent = false; overSent = false;
      state = 't1'; note = 'T1: into the film';
      await play('T1');
    } catch (e) {
      console.error('[shots] T1', e);
      note = `T1 failed: ${e.message || e}`;
      finishShots();
    }
  }
  async function startT2() {
    const my = ++t2Token;
    state = 't2wait'; note = 'T2: bringing the auditorium back in OBS';
    try {
      clearInterval(filmTimer);
      const v = videos.T2;
      await new Promise((r) => { if (v.currentTime === 0 && v.readyState >= 2) return r(); v.addEventListener('seeked', () => r(), { once: true }); v.currentTime = 0; setTimeout(r, 1500); });
      v.style.display = 'block';
      showVideoFrame('T2', 1);   // frame 1: all green = the film full frame, exactly what OBS shows now
      canvas.style.display = 'block';
      if (page()?.inObs()) {
        const w = await bridgeAsk('warm');   // OBS renders the hidden auditorium source off-canvas first (no freeze at the cut)
        console.log('[shots] warm-up:', JSON.stringify(w));
        await new Promise((r) => setTimeout(r, w?.ok ? WARM_MS : 300));
        showVideoFrame('T2', 1);
        const c = await bridgeAsk('cut-cinema');
        console.log('[shots] cut back to the auditorium:', JSON.stringify(c));
        await new Promise((r) => setTimeout(r, 120));
      }
      if (my !== t2Token || state !== 't2wait') return;
      state = 't2'; note = 'T2: out of the film';
      await play('T2');
    } catch (e) {
      console.error('[shots] T2', e);
      note = `T2 failed: ${e.message || e}`;
      finishShots();
    }
  }
  async function startT3() {
    cancelAnimationFrame(holdRaf);
    state = 't3'; note = 'T3: back to the room';
    try {
      const P = page();
      await P.camera('wide');   // the page under the canvas: wide shot, held still, painted before T3 ends
      P.camHidden(false);
      await play('T3');
    } catch (e) {
      console.error('[shots] T3', e);
      note = `T3 failed: ${e.message || e}`;
      finishShots();
    }
  }
  function command(v) {
    const s = String(v || '').toLowerCase();
    if (s === 'stop') { t2Token++; finishShots(); note = 'stopped: the live page is back'; return true; }
    if (s === 't1' && state === 'idle') { startT1(); return true; }
    if (s === 't2' && state === 'film') { startT2(); return true; }
    if (s === 't3' && state === 'hold') { startT3(); return true; }
    console.warn(`[shots] ${s} ignored in state ${state}`);
    return false;
  }

  window.DD_SHOTS = {
    command,
    prepare,
    onBridge,
    active: () => state !== 'idle',
    ownsBridge: () => state !== 'idle' && state !== 'prep',
    state: () => ({ state, note, shot: cur, frame: curFrame, frames: cur ? meta[cur]?.frames || 0 : 0 }),
    // QA: hold one frame of a shot (video paused) and render it - DD_SHOTS.seek('T2', 200); 'hold' renders the plate
    seek: async (s, g) => {
      await prepare();
      canvas.style.display = 'block';
      if (s === 'hold') { render({ kind: 'hold', cam: hold.cam, quad: hold.corners }); return true; }
      const v = videos[s];
      v.pause(); v.style.display = 'block';
      await new Promise((r) => { v.addEventListener('seeked', r, { once: true }); v.currentTime = (g - 0.5) / meta[s].fps; });
      showVideoFrame(s, g);
      return true;
    },
    hide: () => { if (canvas) canvas.style.display = 'none'; for (const s of SHOTS) if (videos[s]) videos[s].style.display = 'none'; },
    atlas: () => ({ emotes: emoteInfo.size, full: atlasFull, labels: labels.size }),
    sizes: () => lastSizes.slice().sort((a, b) => b - a),
  };
  // get the videos and the emote atlas ready while the film plays, so T1 starts at once
  setInterval(() => {
    const P = page();
    if (state !== 'idle' || !P?.filmReady || P.filmReady() !== true) return;
    prepare().then(() => { for (const f of P.figures()) { ensure(emKey(f)); for (const it of f.items) ensure(`img:${it.src}`); } }).catch(() => {});
  }, 3000);
})();
