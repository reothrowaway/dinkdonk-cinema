import {node} from '../incidents/stage.js';

const clamp=n=>Math.max(0,Math.min(1,n));
const ease=n=>{const x=clamp(n);return x*x*(3-2*x);};
const pulse=(t,a,b)=>Math.sin(Math.PI*clamp((t-a)/(b-a)));
const path=(parent,d,attrs)=>node(parent,'path',{d,...attrs});
const aisle=w=>Math.abs(w.seat.u-3.475)<Math.abs(w.seat.u-15.15)?3.475:15.15;

function tub(parent,x,y,flavor) {
  const cup=node(parent,'g',{transform:'translate('+x+' '+y+')'});
  path(cup,'M-7 -3L-5 8Q0 11 5 8L7 -3Z',{fill:'#fff1cc',stroke:'#502d34','stroke-width':1.2});
  path(cup,'M-5 1Q0 4 5 1L4 5Q0 7 -4 5Z',{fill:flavor});
  node(cup,'ellipse',{cx:0,cy:-3,rx:7.5,ry:3,fill:flavor,stroke:'#64363a','stroke-width':1.3});
  path(cup,'M-4 -3Q-1 -5 3 -3',{fill:'none',stroke:'#fff2d8','stroke-width':1.2});
  return cup;
}
function svgSprite(w,width,height,left,top,tag){
  const shape=node(w.bod,'svg',{width,height,viewBox:'0 0 '+width+' '+height,'aria-hidden':'true'});
  shape.setAttribute(tag,'');Object.assign(shape.style,{position:'absolute',left:left+'px',top:top+'px',pointerEvents:'none',overflow:'visible'});
  return shape;
}
function makeTray(w){
  const wTray=65,top=-Math.max(33,w.emH*.93),art=svgSprite(w,wTray,45,-wTray/2,top,'data-ice-tray');
  path(art,'M11 26L22 2M53 26L43 2',{fill:'none',stroke:'#402b2c','stroke-width':4});
  path(art,'M11 26L22 2M53 26L43 2',{fill:'none',stroke:'#dbb88a','stroke-width':2});
  path(art,'M1 27L11 18H52L64 25L58 35L11 37Z',{fill:'#f2ce8c',stroke:'#492c31','stroke-width':2});
  tub(art,15,22,'#d2ae73');tub(art,45,19,'#dd8698');tub(art,52,24,'#a57750');
  const stock=tub(art,29,22,'#ec9b9d');
  path(art,'M1 27L59 27L64 25L61 36L57 40H8Z',{fill:'#9a3940',stroke:'#4b262c','stroke-width':1.5});
  path(art,'M7 30H57M10 38H55',{fill:'none',stroke:'#eac581','stroke-width':1});
  const brand=node(art,'text',{x:32,y:36,'text-anchor':'middle','font-family':'Georgia,serif','font-weight':'bold','font-size':7,fill:'#fff0cc'});brand.textContent='ICES';
  return {art,stock,from:[-wTray/2+29,top+22]};
}
function clearServiceSpot(host){
  const people=host.seated().filter(w=>w.box);
  const backs=host.seats().map(s=>host.aisleSpot(s.u,s.v+.29,s.z+62));
  let best,least=Infinity;
  function obstruction(x,y,depth,except){
    let cost=0;
    for(const w of people){
      if(w===except||w.box[4]<depth)continue;
      const [x1,y1,x2,y2]=w.box;
      const dx=Math.max(x1+6-x,x-x2+6,0),dy=Math.max(y1+5-y,y-y2+6,0);
      cost+=Math.max(0,28-Math.hypot(dx,dy));
    }
    for(const b of backs)if(b.depth>depth&&Math.abs(x-b.x)<34&&y>b.y-5&&y<b.y+48)cost+=16;
    return cost;
  }
  for(const guest of people){
    if(guest.dozing||guest.texting||guest.pendingSeat||Math.abs(guest.seat.u-aisle(guest))>1.18)continue;
    const s=guest.seat,[gx,gy]=host.point(guest);
    for(const offset of [.12,-.15,.32]){
      const v=s.v+offset,spot=host.aisleSpot(aisle(guest),v,s.z);
      const sx=spot.x,sy=spot.y,side=Math.sign(sx-gx)||1;
      const cost=obstruction(sx,sy-25,spot.depth,null)*2+obstruction(sx,sy-10,spot.depth,null)*2+
        obstruction(gx+side*guest.emW*.34,gy-guest.emH*.75,guest.box[4],guest)+
        Math.max(0,64-Math.abs(sx-gx))*.65+Math.abs(offset)*3+Math.random()*3;
      if(cost<least){least=cost;best={guest,v};}
    }
  }
  return best;
}
export function startIntervalIces(host,reduced){
  if(host.breakRemaining()<50)return null;
  const spot=clearServiceSpot(host);if(!spot)return null;
  const {guest}=spot,seat=guest.seat;
  const usher=host.staff('interval-ices');if(!usher)return null;
  const tray=makeTray(usher),world=usher.el.parentNode;
  const serving=node(world,'svg',{width:38,height:42,viewBox:'-14 -23 28 33','aria-hidden':'true','data-ice-serving':''});
  Object.assign(serving.style,{position:'absolute',left:0,top:0,overflow:'visible',pointerEvents:'none',visibility:'hidden'});
  const spoon=node(serving,'g');
  path(spoon,'M1 1L8 -16Q9 -20 11 -18Q13 -17 11 -14L4 2Z',{fill:'#e4c393',stroke:'#5e4737','stroke-width':1});
  const scoop=node(spoon,'ellipse',{cx:10,cy:-17,rx:3.8,ry:2.5,fill:'#edb0b0',stroke:'#834c4c','stroke-width':1,opacity:0});
  tub(serving,0,0,'#ec9b9d');
  const fingers=node(serving,'g',{visibility:'hidden'});
  path(fingers,'M-15 5L-11 1Q-10 -2 -8 -1L-4 2L-1 2Q2 3 0 6L-3 8Q-6 11 -9 8L-13 9Z',{fill:'#d7a16d',stroke:'#5b3736','stroke-width':1.4});
  let phase='entrance',route=null,offered=0,leftAt=0,elapsed=0,cleaned=false;
  const setPhase=name=>{phase=name;tray.art.dataset.phase=name;};
  function leave(){
    setPhase('return');leftAt=performance.now();host.go(usher,[...route].reverse(),host.out);
  }
  usher.onArrive=()=>{
    setPhase('approach');route=host.toAisle(usher,seat,aisle(guest));
    route[route.length-1][1]=spot.v;
    host.go(usher,route,()=>{
      host.face(usher,guest);setPhase('offer');offered=performance.now();guest.nameT=2;
      host.hold(usher,8.8,leave);
    });
  };
  function clear(){
    if(cleaned)return;cleaned=true;serving.remove();tray.art.remove();
  }
  function cancel(){clear();if(host.present(usher))host.dismissStaff(usher);}
  function drawCup(time){
    const hand=ease((time-1)/2.2),[ux,uy]=host.point(usher),[gx,gy]=host.point(guest),side=Math.sign(ux-gx)||1;
    const endX=gx+side*Math.max(24,guest.emW*.62),endY=gy-Math.max(guest.hideLocal+3,guest.emH*.34);
    const start=[ux+tray.from[0],uy+tray.from[1]],taste=ease((time-4.2)/1.1)*(1-ease((time-5.85)/1.05));
    const x=start[0]*(1-hand)+endX*hand;
    const y=start[1]*(1-hand)+endY*hand-(reduced?0:10*Math.sin(Math.PI*hand));
    const scale=.58+.15*hand;serving.style.transformOrigin='50% 69.7%';
    serving.style.transform='translate('+(x-19)+'px,'+(y-29.3)+'px) scale('+scale+')';
    serving.style.zIndex=String(Math.max(Number(usher.el.style.zIndex),Number(guest.el.style.zIndex))+1);
    const unit=38/28*scale;
    const mouthX=gx+side*guest.emW*.07,mouthY=gy-Math.max(guest.hideLocal+5,guest.emH*.49);
    // The tub stays down in the near hand. Only the loaded spoon crosses the cheek.
    const toMouthX=(mouthX-x)/unit+side*10,toMouthY=(mouthY-y)/unit+17;
    const resting=13*(1-taste);
    spoon.setAttribute('transform','translate('+toMouthX*taste+' '+(toMouthY*taste+resting)+') scale('+(-side)+' 1)');
    scoop.setAttribute('opacity',String(clamp((time-4.15)/.2)*(1-clamp((time-5.55)/.2))));
    fingers.setAttribute('visibility',hand>.55?'visible':'hidden');
    fingers.setAttribute('transform','scale('+side+' 1)');
  }
  function state(){
    if(!host.present(usher)){clear();return phase==='return'?'complete':'interrupted';}
    if(!host.active(guest)||guest.seat!==seat)return 'interrupted';
    if(phase==='offer'){
      elapsed=(performance.now()-offered)/1000;
      if(elapsed>=1){tray.stock.style.visibility='hidden';serving.style.visibility='visible';drawCup(elapsed);}
    }else if(phase==='return'){
      drawCup(9);serving.style.opacity=String(1-ease(((performance.now()-leftAt)/1000-1.6)/1.5));
    }
    return 'playing';
  }
  function camera(){
    if(reduced||!usher.seen)return null;
    const [ux,uy]=host.point(usher),[gx,gy]=host.point(guest);
    if(phase==='return'){
      const blend=ease((performance.now()-leftAt)/5600);if(blend===1)return null;
      return [(ux+gx)/2,(uy+gy)/2-25,2.7-1.45*blend];
    }
    if(phase==='offer'||(phase==='approach'&&Math.hypot(ux-gx,uy-gy)<140))return [(ux+gx)/2,(uy+gy)/2-26,2.7];
    return [ux,uy-24,1.85];
  }
  function pose(w){
    if(reduced||phase!=='offer'||(w!==usher&&w!==guest))return;
    const side=Math.sign(host.point(guest)[0]-host.point(usher)[0])||1,reach=pulse(elapsed,.3,3.8);
    const nod=pulse(elapsed,6.9,8.2);
    return {tilt:w===usher?side*10*reach:-side*(10*reach+6*nod),lift:w===guest?3*reach+3*nod:0,sq:1};
  }
  setPhase('entrance');return {state,cancel,camera,pose};
}
