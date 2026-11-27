const NS = 'http://www.w3.org/2000/svg';
const node = (root, tag, attrs) => {
  const el = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  root.append(el);
  return el;
};
const clamp = x => Math.max(0, Math.min(1, x));

// The caller owns the floor anchor and the black hole that opens at its origin.
export function topographyEntrance(root) {
  const group = node(root, 'g', { 'data-cue': 'topography', fill: 'none', 'stroke-linecap': 'round' });
  const lines = Array.from({length: 9}, (_, i) => node(group, 'path', {
    stroke: i === 4 ? '#fff5ca' : i % 2 ? '#fe64da' : '#61fff2', 'stroke-width': i === 4 ? 3 : 1.6
  }));
  return (t, reduced = false) => {
    if (t >= 3) { group.remove(); return; }
    const bend = clamp((t - .55) / 1.35), fade = clamp(t * 5) * clamp((3 - t) / .6);
    group.setAttribute('opacity', fade);
    lines.forEach((path, i) => {
      const y = (i - 4) * 7, sweep = reduced ? 1 : clamp(t * 1.65 - i * .055);
      const d = [];
      for (let j = 0; j <= 40; j++) {
        const x = -118 + 236 * j / 40 * sweep;
        const well = Math.exp(-(x*x / 760 + y*y / 340)) * bend;
        d.push((j ? 'L' : 'M') + (x + .4*y - well*7).toFixed(1) + ' ' + (y + x*.07 + well*42).toFixed(1));
      }
      path.setAttribute('d', d.join(' '));
    });
  };
}

// Flight frames contain the actual camera matrices in Blender coordinates. The last
// low camera in A crosses the doorway; intersect that pass with the wall at y=0.
export function createWarpGate(stage, meta, guests) {
  const cross = meta.cam.findIndex((c, i) => i && c.part === 'A' && c.eye[2] < 2 && c.eye[1] >= 0 && meta.cam[i-1].eye[1] < 0);
  if (cross < 1) return null;
  const a = meta.cam[cross-1].eye, b = meta.cam[cross].eye;
  const center = a[0] + (b[0]-a[0]) * (-a[1]/(b[1]-a[1]));
  const nearby = guests.filter(c => c.part === 'A' && c.tag !== 'staff' && c.em &&
    Math.hypot(c.p[0]-center, c.p[1]) <= 4).sort((a,b) =>
    Math.hypot(a.p[0]-center,a.p[1])-Math.hypot(b.p[0]-center,b.p[1]))[0];
  if (!nearby) return null;
  const svg = node(stage,'svg',{viewBox:'0 0 1920 1080','data-flight-cue':'warp-gate'});
  svg.style.cssText='position:absolute;inset:0;width:1920px;height:1080px;z-index:901;pointer-events:none;display:none;overflow:hidden';
  const rim = node(svg,'g',{fill:'none','stroke-linejoin':'round'});
  const halo = node(rim,'path',{stroke:'#ff5cce','stroke-width':14,opacity:.45,pathLength:100});
  const wire = node(rim,'path',{stroke:'#ccffff','stroke-width':4,pathLength:100});
  const portal = node(svg,'foreignObject',{x:0,y:0,width:100,height:100});
  const em = window.SB.emoteEl(nearby.em,76);
  em.style.cssText+=';position:absolute;bottom:5px;left:4px;filter:brightness(.17) drop-shadow(0 0 3px #95fff8);transform-origin:50% 95%';
  portal.append(em);
  const mul=(m,v)=>[0,4,8,12].map(j=>m[j]*v[0]+m[j+1]*v[1]+m[j+2]*v[2]+m[j+3]*v[3]);
  const project=(cam,p)=>{const v=mul(cam.proj,mul(cam.view,p));return [960*(1+v[0]/v[3]),540*(1-v[1]/v[3])];};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frame=meta.cam[cross].g;
  return {
    draw(cam) {
      const t=(cam.g-frame)/meta.fps+4.8;
      if (cam.part!=='A'||t<0||t>4) { svg.style.display='none'; return; }
      svg.style.display='block';
      const points=[[-.55,0],[-.55,1.55],[.55,1.55],[.55,0]].map(([x,z])=>project(cam,[center+x,-.05,z,1]));
      const d='M'+points.join('L')+'Z', draw=reduced?1:clamp(t/.9);
      for(const line of [halo,wire]) { line.setAttribute('d',d); line.setAttribute('stroke-dasharray',draw*100+' 101'); }
      svg.setAttribute('opacity',clamp(t*4)*clamp((4-t)*2));
      const walk=clamp((t-.75)/1.8);
      const foot=project(cam,[center-.40+.74*walk,-.07,.02,1]), head=project(cam,[center-.4+.74*walk,-.07,1.12,1]);
      const scale=Math.max(.05,(foot[1]-head[1])/90);
      portal.setAttribute('transform','translate('+(foot[0]-scale*44)+' '+(foot[1]-scale*95)+') scale('+scale+')');
      portal.setAttribute('opacity',clamp((t-.65)*2)*clamp((3.65-t)*2)*.85);
      em.style.transform='rotate('+(reduced?0:Math.sin(clamp((t-2.45)/.75)*Math.PI*2)*16)+'deg)';
    },
    stop:()=>svg.remove()
  };
}
