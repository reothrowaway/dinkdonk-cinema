// Opt-in QA light installation. Coordinates live inside the room camera.
(() => {
  const ns = 'http://www.w3.org/2000/svg';
  const node = (tag, attributes, parent) => {
    const child = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attributes)) child.setAttribute(key, value);
    parent.append(child);
    return child;
  };
  const cam = document.getElementById('cam');
  const screen = document.getElementById('screenpoly');
  const svg = node('svg', { id: 'laser-choir', viewBox: '0 0 1920 1080', 'aria-hidden': 'true' }, cam);
  svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1';
  if (screen) cam.insertBefore(svg, document.getElementById('names'));
  const defs = node('defs', {}, svg);
  const stage = node('g', {}, svg);
  const lights = node('g', { opacity: '.78' }, stage);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = [];
  const fans = [];
  const wavefronts = [];
  function fan(color, phase) {
    const mount = node('g', {}, lights);
    const vane = node('g', {}, mount);
    const gradient = node('linearGradient', { id: 'choir-' + phase, x1:'0%', x2:'100%', y1:'0%', y2:'0%' }, defs);
    for (const [offset, opacity] of [[0,.98],[.16,.78],[.64,.48],[1,0]]) {
      node('stop', { offset, 'stop-color':color, 'stop-opacity':opacity }, gradient);
    }
    const paint = 'url(#choir-' + phase + ')';
    node('path', { d:'M0 0 L600 -110 L600 110Z', fill:paint, opacity:'.19' }, vane);
    for (let i = -3; i <= 3; i++) {
      const y = i * 34;
      node('path', { d:`M0 0 L600 ${y-2.5} L600 ${y+2.5}Z`, fill:paint }, vane);
    }
    // A real message sends a curved front down each fan, like light catching a sheet of haze.
    const front = node('path',{d:'M530 -90 Q580 0 530 90',fill:'none',stroke:color,
      'stroke-width':3,opacity:0},vane);
    wavefronts.push(front);
    node('circle', {r:5,fill:'#fff'}, mount);
    const animation = vane.animate([{transform:'rotate(-9deg)'},{transform:'rotate(9deg)'}],
      { duration:phase ? 4800 : 6400, iterations:Infinity, direction:'alternate', easing:'ease-in-out' });
    animations.push(animation);
    fans.push(mount);
  }
  fan('#45fff5',0);
  fan('#ff46af',1);

  if (screen) {
    // Use the projector and four screen corners calibrated by the auditorium itself.
    const port = document.getElementById('pportc');
    const clip = node('clipPath',{id:'choir-aperture', clipPathUnits:'userSpaceOnUse'},defs);
    const opening = node('path',{'clip-rule':'evenodd'},clip);
    stage.setAttribute('clip-path','url(#choir-aperture)');
    function align() {
      const points = Array.from(screen.points, p => [p.x,p.y]);
      if (!port?.hasAttribute('cx') || points.length !== 4) { stage.style.display = 'none'; return; }
      stage.style.display = '';
      opening.setAttribute('d','M0 0H1920V1080H0Z M' + points.map(p=>p.join(' ')).join('L') + 'Z');
      const x = Number(port.getAttribute('cx')), y = Number(port.getAttribute('cy'));
      for (let i = 0; i < 2; i++) {
        const dx = points[i][0]-x, dy = points[i][1]-y;
        fans[i].setAttribute('transform',`translate(${x} ${y}) rotate(${Math.atan2(dy,dx)*180/Math.PI}) scale(${Math.hypot(dx,dy)/480})`);
      }
    }
    const observer = new MutationObserver(align);
    observer.observe(screen,{attributes:true,attributeFilter:['points']});
    if (port) observer.observe(port,{attributes:true,attributeFilter:['cx','cy']});
    align();
  } else {
    // The two physical rooftop searchlight mounts in the lobby art.
    fans[0].setAttribute('transform','translate(940 212) rotate(-157) scale(1.23)');
    fans[1].setAttribute('transform','translate(1050 252) rotate(-16) scale(1.28)');
  }

  let swell, last = -Infinity;
  function motionPreference() {
    for (const anim of animations) reduced.matches ? anim.pause() : anim.play();
    if (reduced.matches) swell?.cancel();
    if (reduced.matches) for (const front of wavefronts) front.getAnimations().forEach(a=>a.cancel());
  }
  motionPreference();
  reduced.addEventListener('change',motionPreference);
  window.SB.on('msg', () => {
    const now = performance.now();
    if (reduced.matches || now-last < 2600) return;
    last = now;
    // One breath per burst, independent of message text, with a longer release.
    swell?.cancel();
    swell = lights.animate([{opacity:.78},{opacity:1,offset:.22},{opacity:.78}],
      { duration:2400, easing:'ease-in-out' });
    for (const front of wavefronts) {
      front.animate([{transform:'scale(.04)',opacity:0},{transform:'scale(.33)',opacity:.95,offset:.3},
        {transform:'scale(1.08)',opacity:0}],{duration:1650,easing:'ease-out'});
    }
  });
})();
