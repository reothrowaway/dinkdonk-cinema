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
  const clamp = x => Math.min(1, Math.max(0, x));
  const primitive = (name, attrs) => element(name, attrs, filter);
  function curves(input, result, channel) {
    const group = primitive('feComponentTransfer', { in: input, result });
    ['R','G','B'].forEach((component, i) => {
      const values = Array.from({length: 33}, (_, j) => clamp(channel(i, j / 32)).toFixed(5));
      element('feFunc' + component, { type: 'table', tableValues: values.join(' ') }, group);
    });
  }
  const textures = new Map();
  function texture(name, w, h, pixel) {
    if (!textures.has(name)) {
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d'), data = ctx.createImageData(w,h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) data.data.set(pixel(x,y), 4*(y*w+x));
      ctx.putImageData(data,0,0);
      textures.set(name, canvas.toDataURL());
    }
    return textures.get(name);
  }
  function image(href, result, width='100%', height='100%') {
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
      const scale = 1920 * k;
      const map = texture('lens'+preset, 256,144,(x,y) => {
        const u=(x+.5)/128-1, v=(y+.5)/72-1;
        const factor = (u*u+v*v-2) / (2*(1+2*k));
        return [255*(.5+u*factor),255*(.5+v*factor*1080/1920),0,255];
      });
      image(map,'lens');
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
        const offsets = [[-8,-8],[8,-8],[-8,8],[8,8]];
        offsets.forEach(([dx,dy],i) => primitive('feOffset',{ in:'halo', dx,dy,result:'ray'+i }));
        const rays = primitive('feMerge',{result:'stars'});
        offsets.forEach((_,i) => element('feMergeNode',{in:'ray'+i},rays));
      }
      primitive('feBlend', { in:'grade', in2:preset===6?'stars':'halo', mode:'screen', result:'lit' });
      result='lit';
    } else if (preset===8) {
      primitive('feOffset', { in:source, dx:8, result:'echo' });
      primitive('feComposite', { in:'grade', in2:'echo', operator:'arithmetic', k2:.73, k3:.27, result:'tape' });
      result='tape';
    }
    if (preset===7 || preset===11) {
      image(texture('falloff',160,90,(x,y) => {
        const radius2 = ((x+.5)/80-1)**2 + ((y+.5)/45-1)**2;
        return [0,0,0,255*.08*radius2**2];
      }), 'corners');
      primitive('feComposite',{ in:'corners', in2:result, operator:'atop',result:'vignette' });
      result='vignette';
    }
    if (preset===7 || preset===8 || preset===11) {
      const scan = preset===7, size=scan?5:96;
      image(texture(scan?'scanlines':'grain', size,size,(x,y) => {
        if (scan) return [0,0,0,255*.065*(1+Math.cos(y*2*Math.PI/5))];
        const n=(52.9829189*((x*.06711056+y*.00583715)%1))%1;
        const c=n<.5?0:255;
        return [c,c,c,Math.abs(n-.5)*8];
      }),'tile',size,size);
      primitive('feTile',{in:'tile',result:'texture'});
      primitive('feComposite',{in:'texture',in2:result,operator:'atop',result:'textured'});
      result='textured';
    }
    primitive('feComposite', { in:result, in2:source, operator:'arithmetic', k2:amount, k3:1-amount, result:'mixed' });
    if (keyed) primitive('feComposite', { in:'key', in2:'mixed', operator:'over' });
    stage.style.filter = 'url(#cinema-page-look)';
  }
  let settings={}, timer;
  function update(values=settings) {
    settings = values || {};
    clearTimeout(timer);
    const now = Date.now();
    const preset = director.choosePreset(room,settings,'',now);
    if (stage.dataset.cinemaFilter !== String(preset)) apply(preset);
    if (settings.filterDirector !== false) timer = setTimeout(update, director.untilNextPreset(room,settings,'',now));
  }
  window.CinemaPageLook = { update };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
  update();
})();
