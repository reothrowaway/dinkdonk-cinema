// The camera, walkers and screen-space speech all live inside the stage.
// Filter their final composite in sRGB, in the same 1920 x 1080 units as the OBS shader.
(() => {
  'use strict';
  const room = window.DD_ROOM_PAGE, stage = document.getElementById('stage');
  const director = window.CinemaLookDirector;
  const svgNS = 'http://www.w3.org/2000/svg';
  function element(tag, attributes, parent) {
    const node = document.createElementNS(svgNS, tag);
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
    parent.appendChild(node);
    return node;
  }
  const svg = element('svg', { width: 0, height: 0, 'aria-hidden': true }, document.body);
  svg.style.position = 'absolute';
  const filter = element('filter', { id: 'cinema-page-look', x: 0, y: 0, width: '100%', height: '100%',
    'color-interpolation-filters': 'sRGB' }, svg);

  // Shadow RGB, light RGB, halo tint, saturation, contrast and glow as evaluated by cinema-looks.shader.
  const crt = [[-3,6,8], [4,2,8], [.72,1,.96], 1,1,.38];
  const grades = [
    [[-13,17,26],[30,-7,18],[1,.69,.97],1.12,1,.95],
    [[3,1,6],[10,7,8],[1,.93,.96],.92,1,1.75],
    [[-9,7,18],[-15,26,27],[.48,.94,1],.84,1.2,.5],
    [[8,-4,10],[15,-2,-4],[1,.24,.32],1,1,1.6],
    [[18,-13,39],[43,12,-22],[1,.61,.43],1.14,1,.75],
    [[-3,0,13],[4,6,14],[.34,.72,1],1,1.07,.52],
    [[4,-3,9],[12,6,-4],[1,.83,.65],1,1,.38],
    crt, [[10,4,16],[3,5,2],[1,.75,.94],.91,1,0],
    [[18,5,25],[-4,17,14],[.77,1,.9],.76,.83,.9],
    [[16,-18,42],[37,-18,30],[.96,.4,1],1.28,1.12,1.05],
    [[0,2,12],[23,10,-7],[1,.72,.46],.91,1.05,.66], crt
  ];
  const greenTable = Array.from({length:256}, (_, i) => Math.min(i, 254) / 255).join(' ');
  const clamp = x => Math.min(1, Math.max(0, x));
  const primitive = (name, attrs) => element(name, attrs, filter);
  function curves(input, result, channel) {
    const group = primitive('feComponentTransfer', { in: input, result });
    ['R','G','B'].forEach((component, i) => {
      const values = Array.from({length: 33}, (_, j) => clamp(channel(i, j / 32)).toFixed(5));
      element('feFunc' + component, { type: 'table', tableValues: values.join(' ') }, group);
    });
  }
  function image(name, result, width=1920, height=1080) {
    const href = new URL('assets/cinema-filters/' + name + '.png', document.baseURI).href;
    primitive('feImage', { href, result, x:0, y:0, width, height, preserveAspectRatio:'none' });
  }
  function apply(preset) {
    filter.replaceChildren();
    stage.dataset.cinemaFilter = preset;
    if (preset === 'off') { stage.style.removeProperty('filter'); return; }
    const amount = director.strengthFor(room, preset) / 100;
    const [shadow, light, tint, saturation, contrast, glow] = grades[preset];
    const keyed = room === 'auditorium';
    let source = 'SourceGraphic';
    if (keyed) {
      // Only a pure green source pixel reaches alpha 1. Occluding seat backs, walkers,
      // and their antialiased edges supply their own colors at this point in the composite.
      primitive('feColorMatrix', { in:source, result:'key', values:
        '0 0 0 0 0  0 0 0 0 1  0 0 0 0 0  -255 255 -255 0 -254' });
      primitive('feComposite', { in:source, in2:'key', operator:'out', result:'room' });
      source = 'room';
    } else if (preset === 7 || preset === 12) {
      const k = (preset === 7 ? .12 : .027) * amount;
      const scale = 1920 * 1.2 * k / (1 + 2*k);
      image('lens','lens');
      primitive('feDisplacementMap', { in:source, in2:'lens', xChannelSelector:'R', yChannelSelector:'G', scale, result:'curved' });
      source = 'curved';
    }
    primitive('feColorMatrix', { in:source, type:'saturate', values:saturation, result:'sat' });
    curves('sat','grade',(i,v) => {
      const low = clamp(v*12) * (1-v)**2.1;
      const lift = preset===9 ? .031 : preset===8 ? .016 : 0;
      const shine = preset===2 ? .65 : preset===12 ? .41 : 0;
      return (v-.37)*contrast+.37+(shadow[i]*low+light[i]*v**.95)/255+lift+shine*Math.max(0,v-.57)*v*v;
    });
    let result = 'grade';
    if (glow) {
      curves(source,'bulbs',(i,v) => tint[i]*v*clamp((v-.4)/.52)**2*glow);
      primitive('feGaussianBlur', { in:'bulbs', stdDeviation:preset===5 ? '22 1.8' : preset===1 ? 7 : 4.5, result:'halo' });
      if (preset===6) {
        // A sparse diagonal kernel puts light on all four arms of a point highlight.
        primitive('feConvolveMatrix', { in:'bulbs', order:5, kernelUnitLength:'6 6',
          kernelMatrix:'.5 0 0 0 .5  0 1 0 1 0  0 0 0 0 0  0 1 0 1 0  .5 0 0 0 .5',
          divisor:3, preserveAlpha:'true', result:'spikes' });
        primitive('feBlend', { in:'spikes', in2:'halo', mode:'screen', result:'stars' });
      }
      primitive('feBlend', { in:'grade', in2:preset===6?'stars':'halo', mode:'screen', result:'lit' });
      result='lit';
    } else if (preset===8) {
      primitive('feOffset', { in:source, dx:8, result:'echo' });
      primitive('feComposite', { in:'grade', in2:'echo', operator:'arithmetic', k2:.73, k3:.27, result:'tape' });
      result='tape';
    }
    if (preset===7 || preset===11) {
      image('falloff','corners');
      primitive('feComposite',{ in:'corners', in2:result, operator:'atop',result:'vignette' });
      result='vignette';
    }
    if (preset===7 || preset===8 || preset===11) {
      const scan = preset===7, size=scan?5:96;
      image(scan ? 'scanlines' : 'grain','tile',size,size);
      primitive('feTile',{in:'tile',result:'texture'});
      primitive('feComposite',{in:'texture',in2:result,operator:'atop',result:'textured'});
      result='textured';
    }
    primitive('feComposite', { in:result, in2:source, operator:'arithmetic', k2:amount, k3:1-amount, result:'mixed' });
    if (keyed) {
      // Reserve #00ff00 for the original aperture. Saturated highlights outside it can
      // otherwise round to the key color when the grade is clamped to eight bits.
      const cap = primitive('feComponentTransfer', { in:'mixed', result:'foreground' });
      element('feFuncG', { type:'table', tableValues:greenTable }, cap);
      primitive('feComposite', { in:'key', in2:'foreground', operator:'over' });
    }
    stage.style.filter = 'url(#cinema-page-look)';
  }
  let settings = {}, timer, serverEpoch;
  function update(values = settings, serverTime) {
    // The same settings snapshot reaches every screen. Anchor its wall time to the
    // monotonic clock so a viewer's local clock setting cannot shift the rotation.
    if (Number.isFinite(serverTime)) serverEpoch = serverTime - performance.now();
    settings = values || {};
    clearTimeout(timer);
    const now = serverEpoch === undefined ? Date.now() : serverEpoch + performance.now();
    const preset = director.choosePreset(room,settings,'',now);
    if (stage.dataset.cinemaFilter !== String(preset)) apply(preset);
    if (settings.filterDirector !== false) timer = setTimeout(update, Math.ceil(director.untilNextPreset(room, settings, '', now)));
  }
  window.CinemaPageLook = { update };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
  update();
})();
