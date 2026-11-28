import {beat, ease, group, incident, node, path, ramp, rect, type} from './stage.js';

function cassette(walker, title, color) {
  const svg = node(walker.bod, 'svg', {class:'swap-cassette',viewBox:'0 0 92 52',width:50,height:29,'aria-label':title});
  svg.style.cssText = 'position:absolute;z-index:5;pointer-events:none;transform-origin:center';
  rect(svg,1,1,90,50,'#202225',{rx:4,stroke:'#aeaaa0','stroke-width':2});
  rect(svg,6,4,80,16,color,{rx:1});
  const label = type(svg,46,16,title,Math.min(10,139 / Math.max(1,title.length)),'#202128');
  label.setAttribute('font-family','Arial, sans-serif');
  rect(svg,12,23,68,17,'#777978',{rx:4,stroke:'#08090b'});
  for (const cx of [27,65]) {
    node(svg,'circle',{cx,cy:31,r:7,fill:'#dedbbc'});
    node(svg,'circle',{cx,cy:31,r:3,fill:'#24242a'});
  }
  path(svg,'M9 46H83','#202225',{stroke:color,'stroke-width':3});
  return {svg,walker};
}

function grip(tape, walker, side, raised, reduced) {
  const svg = tape.svg;
  const moved = tape.walker !== walker;
  const from = moved && !reduced ? svg.getBoundingClientRect() : null;
  if (moved) { walker.bod.append(svg); tape.walker = walker; }
  const w = Number(walker.em.dataset.w) || 48, h = parseFloat(walker.em.style.height) || 48;
  svg.style.left = (side * (Math.min(34, w * .46) + 14) - 25) + 'px';
  svg.style.top = (-h * .29 - 12 - raised * 9) + 'px';
  svg.style.transform = 'rotate(' + (reduced ? 0 : side * (6 - raised * 12)) + 'deg)';
  if (from) {
    const to = svg.getBoundingClientRect(), zoom = document.getElementById('cam').getBoundingClientRect().width / 1920 || 1;
    svg.animate([{translate:(from.x-to.x)/zoom+'px '+(from.y-to.y)/zoom+'px'},{translate:'0 0'}],
      {duration:850,easing:'ease-in-out'});
  }
}

export function tapeSwap(getHistory, walkers, project, wearRole) {
  const titles = () => {
    const history = getHistory();
    if (!Array.isArray(history)) return [];
    return [...new Set(history.filter(e => e?.type === 'Movie' &&
    Number(e.year) >= 1900 && Number(e.year) <= 2005 && typeof e.title === 'string' &&
    e.title.trim() && e.title.trim().length <= 23).map(e => e.title.trim()))];
  };
  function meetingPoint() {
    if (titles().length < 2) return null;
    // The carpet outside the screens stays visible above the concession case.
    const visitors = [...walkers.values()].filter(w => !w.gone && !w.removing);
    let best, clearance = -1;
    for (const u of [6.1, 8.2, 10.5]) {
      const point = [u, 1.12], [x, y] = project(...point);
      const nearest = visitors.reduce((dist,w) => Math.min(dist,Math.hypot(w.x-x,(w.y-y)*1.4)),Infinity);
      if (nearest > clearance) { best = point; clearance = nearest; }
    }
    return best;
  }
  const story = incident(18,2,2,meetingPoint,({scene,actors}) => {
    const choices = titles();
    const take = () => choices.splice(Math.floor(Math.random() * choices.length),1)[0];
    const [left,right] = actors;
    const releases = actors.map(w => wearRole(w, w.emName));
    const gold = cassette(left,take(),'#ffd17b'), blue = cassette(right,take(),'#8ce1ec');
    const sign = group(scene,{transform:'translate(-110 -48) scale(.8)'});
    path(sign,'M-40 0l6-33h70l5 33Z','#b79a66',{stroke:'#483225','stroke-width':2});
    rect(sign,-32,-31,67,28,'#f9e7bb',{rx:1});
    type(sign,1,-13,'TAPE SWAP',11,'#582c2e');
    return {
      slots:[[-51,-12],[51,12]], walks:[{at:15,slot:0,offset:[-20,-8]},{at:15.5,slot:1,offset:[24,9]}],
      zoom:2.35,focusY:35,showWhileApproaching:true,
      actionBounds:()=>[-166,-111,130,38],
      paint(t,reduced) {
        const study = ease(ramp(t,1,2.3)) * (1-ease(ramp(t,4.6,5.6)));
        const inspect = ease(ramp(t,10.5,11.7)) * (1-ease(ramp(t,14,15)));
        const changeHands = ease(ramp(t,7,8.5));
        grip(gold,t<6?left:right,t<6?1:2*changeHands-1,t<6?study:inspect,reduced);
        grip(blue,t<9?right:left,t<9?1-2*changeHands:1,t<9?study+changeHands*.65:inspect,reduced);
      },
      act(i,t) { return {tilt:(i? -1:1) * (7*beat(t,4.6,7.6)+7*beat(t,7.6,10.6)),lift:3*beat(t,12.1,13.4)}; },
      dispose() { gold.svg.remove(); blue.svg.remove(); for (const release of releases) release(); },
    };
  });
  return {...story, automatic:true, eligible:w => !w.out && !w.pairedRole && !!w.emName && !!w.em && !!w.bod};
}
