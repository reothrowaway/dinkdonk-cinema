import {group, node, path} from '../incidents/stage.js';

const clamp = n => Math.max(0, Math.min(1,n));
const smooth = n => { const p=clamp(n); return p*p*(3-2*p); };

// Work in the same 1920 × 1080 coordinates as the chat layer. Keep the
// normal position whenever it leaves the performers clear.
export function clearOfGuests(x,y,width,height,guests,placed) {
  const limit = (n,maximum) => Math.max(8,Math.min(maximum,n));
  const overlap = (left,top,r) => Math.max(0, Math.min(left+width,r.x1)-Math.max(left,r.x0)) *
    Math.max(0, Math.min(top+height,r.y1)-Math.max(top,r.y0));
  if (!guests.some(r=>overlap(x,y,r))) return [x,y];
  const xs=new Set([x]), ys=new Set([y]);
  for (const r of guests) {
    xs.add(limit(r.x0-width-8,1912-width)); xs.add(limit(r.x1+8,1912-width));
    ys.add(limit(r.y0-height-8,1072-height)); ys.add(limit(r.y1+8,1072-height));
  }
  let best=[x,y], bestArea=Infinity, bestChat=Infinity, bestDistance=Infinity;
  for (const left of xs) for (const top of ys) {
    const area=guests.reduce((sum,r)=>sum+overlap(left,top,r),0);
    const chat=placed.reduce((sum,r)=>sum+overlap(left,top,r),0);
    const distance=(left-x)**2+(top-y)**2;
    if (area<bestArea || (area===bestArea && (chat<bestChat || (chat===bestChat && distance<bestDistance)))) {
      best=[left,top]; bestArea=area; bestChat=chat; bestDistance=distance;
    }
  }
  return best;
}

function nearbyGuests(host) {
  const seats = host.seated().filter(w => w.box && !w.dozing && !w.texting && !w.pendingSeat)
    .map(w => ({w, seat:w.seat, x:host.point(w)[0], y:w.box[1]}))
    .sort((a,b) => a.x-b.x);
  let best = [], bestWidth = Infinity;
  for (const first of seats) {
    const group = [first];
    for (const next of seats) {
      if (next.x-first.x > 530) break;
      if (next.x-group.at(-1).x < 72 || Math.abs(next.y-first.y) > 110) continue;
      group.push(next);
      if (group.length === 4) break;
    }
    const width = group.at(-1).x-first.x;
    if (group.length > best.length || (group.length === best.length && width < bestWidth)) {
      best=group; bestWidth=width;
    }
  }
  return best;
}

// The forearm pivots at the spectator's shoulder. The palm twists separately at the wrist.
function makeHand(w, side) {
  const arm = document.createElement('span');
  arm.className = 'visual-applause-arm';
  arm.setAttribute('aria-hidden','true');
  const length = Math.max(14,Math.min(32,w.emH*.48));
  Object.assign(arm.style,{position:'absolute',pointerEvents:'none',zIndex:'4',width:'5px',height:length+'px',
    left:(side*Math.max(5,w.emW*.24)-2.5)+'px',top:(-w.emH*.41-length)+'px',
    borderRadius:'4px',background:'#dfaa67',border:'1px solid #563a29',transformOrigin:'50% 100%',opacity:'0'});
  const palm = node(arm,'svg',{width:17,height:22,viewBox:'0 0 30 38'});
  palm.style.cssText = 'position:absolute;left:-7px;bottom:calc(100% - 3px);overflow:visible;transform-origin:50% 90%';
  const drawing = group(palm,side<0?{transform:'translate(30 0) scale(-1 1)'}:{});
  path(drawing,'M10 35 L9 29 Q5 25 3 20 L1 15 Q0 12 2 12 Q4 11 6 15 L9 19 L6 6 Q5 3 7 3 Q9 2 10 5 L13 15 L12 3 Q12 0 14 0 Q16 0 16 3 L17 15 L19 3 Q20 1 22 2 Q23 2 23 5 L21 17 L25 8 Q26 6 28 7 Q30 8 28 11 L25 22 Q25 27 21 31 L20 35 Z',
    '#ffd18b',{stroke:'#563925','stroke-width':1.3,'stroke-linejoin':'round'});
  path(drawing,'M11 23 Q16 19 20 20 M11 33 L20 33','none',{stroke:'#be864d','stroke-width':1.2,'stroke-linecap':'round'});
  w.bod.append(arm);
  return {arm,palm,side};
}

export function startVisualApplause(host,reduced) {
  const cast = nearbyGuests(host);
  if (cast.length < 2) return null;
  for (const guest of cast) guest.hands = [-1,1].map(side=>makeHand(guest.w,side));
  const left=cast[0].x-85,right=cast.at(-1).x+85;
  const top=Math.min(...cast.map(g=>g.y))-75,bottom=Math.max(...cast.map(g=>host.point(g.w)[1]))+25;
  const began=performance.now(), duration=11.8;
  let t=0;
  const strength = i => smooth((t-1.4-i*.63)/1.1)*(1-smooth((t-8.2-i*.23)/1.1));
  function cancel() { for (const guest of cast) for (const {arm} of guest.hands) arm.remove(); }
  function state() {
    t=(performance.now()-began)/1000;
    if (t>=duration) { cancel(); return 'complete'; }
    if (cast.some(g=>!host.active(g.w)||g.w.seat!==g.seat)) return 'interrupted';
    cast.forEach((guest,i)=>{
      const raised=strength(i);
      for (const {arm,palm,side} of guest.hands) {
        const turn=Math.sin(t*(5.8+i*.21)+i*1.7+side*.62);
        arm.style.opacity=String(clamp(raised*2));
        arm.style.transform='rotate('+side*(102-raised*82+(reduced?0:3*turn*raised))+'deg) scaleY('+(0.55+.45*raised)+')';
        const wristAngle = side*8 + turn*(reduced ? 3 : 18)*raised;
        const palmWidth = reduced ? .95 : .77 + .23*turn;
        palm.style.transform='rotate('+wristAngle+'deg) scaleX('+palmWidth+')';
      }
    });
    return 'playing';
  }
  function pose(w) {
    const i=cast.findIndex(g=>g.w===w);
    if(i>=0) return {lift:(reduced?1:4)*strength(i),tilt:0,sq:1};
  }
  function bubbleClearance(project) {
    return cast.map(({w})=>{
      const b=w.box;
      const [x0,y0]=project(b[0]-22,b[1]-39),[x1,y1]=project(b[2]+22,b[3]+2);
      return {x0,y0,x1,y1};
    });
  }
  return {state,cancel,pose,bounds:[left,top,right,bottom],bubbleClearance,
    camera:()=>reduced || t<.45 || t>10.4 ? null : [(left+right)/2,(top+bottom)/2,Math.min(2.8,1500/(right-left),850/(bottom-top))]};
}
