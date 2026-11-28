import {attrs, beat, def, ease, ellipse, gradient, group, incident, mix, node, path, place, ramp, rect, type} from './stage.js';

function prints(data) {
  if (!Array.isArray(data?.history)) return [];
  const available=[data.ratings,data.best,data.worst].filter(Array.isArray).flat();
  const rated=new Map(available.filter(r=>r?.id!=null && r.poster).map(r=>[String(r.id),r]));
  return data.history.filter(f=>f?.type==='Movie' && typeof f.title==='string' && f.title.trim() && rated.has(String(f.ratingId)))
    .map(f=>({title:f.title,year:f.year,poster:rated.get(String(f.ratingId)).poster}))
    .filter(f=>typeof f.poster==='string' && /^https:\/\/image\.tmdb\.org\/t\/p\/[^?#\s]+$/i.test(f.poster));
}

function titleLines(title) {
  const words=title.trim().split(/\s+/);const lines=[''];
  for (const word of words) {
    const i=lines.length-1;
    if (lines[i] && lines[i].length+word.length>15) lines.push(word);
    else lines[i]+=(lines[i]?' ':'')+word;
  }
  return lines;
}

function makeBin(scene) {
  const box=group(scene,{transform:'translate(-60 -23)'});
  ellipse(box,0,2,28,6,'#291e28',{opacity:.45});
  path(box,'M-24-33l9-6 43 3-5 9Z','#504039',{stroke:'#34282a','stroke-width':1.5});
  for (const [x,y,angle] of [[-13,-30,-15],[-4,-30,-4],[7,-27,7],[13,-30,14]]) {
    const roll=group(box);place(roll,x,y,angle);
    rect(roll,-3,-15,6,22,'#e3cbb0',{rx:1,stroke:'#775b48','stroke-width':1});
    ellipse(roll,0,-15,3,1.4,'#6d5547',{stroke:'#f5e4c7','stroke-width':1.1});
  }
  path(box,'M-24-33l47 3-3 33-40-3Z','#aa7852',{stroke:'#5a4132','stroke-width':1.4});
  path(box,'M23-30l6-6-3 34-6 5Z','#785541');
  const label=group(box,{transform:'translate(0 -17) rotate(3)'});
  rect(label,-19,-9,38,19,'#f4e9cc',{rx:1});
  type(label,0,-1,'FREE',8,'#493d32');type(label,0,7,'POSTERS',7.4,'#493d32');
}

function makeSheet(scene,film) {
  const sheet=group(scene,{class:'souvenir-poster','aria-label':film.title,'data-image':'loading'});
  const clip=def(sheet,'clipPath','rolled-film-poster');
  const opening=rect(clip.el,0,0,52,0,'white');
  const paper=group(sheet,{'clip-path':clip.url});
  rect(paper,0,0,52,76,'#f6eace',{stroke:'#7e6f58','stroke-width':1});
  rect(paper,1.5,1.5,49,59,'#243a3c');
  const fallback=group(paper);
  ellipse(fallback,26,24,13,13,'#d99662');
  path(fallback,'M2 56l17-22 8 11 7-6 16 21H2Z','#486468');
  const image=node(paper,'image',{x:1.5,y:1.5,width:49,height:59,preserveAspectRatio:'xMidYMid meet'});
  image.addEventListener('load',()=>{sheet.dataset.image='loaded';fallback.setAttribute('visibility','hidden');});
  image.addEventListener('error',()=>{sheet.dataset.image='unavailable';image.remove();});
  image.setAttribute('href',film.poster);
  const lines=titleLines(film.title);
  const size=Math.min(6.2,12/lines.length,76/Math.max(...lines.map(s=>s.length)));
  lines.forEach((s,i)=>type(paper,26,67-(lines.length-1)*size*.52+i*size,s,size,'#242729'));
  type(paper,26,71.8,String(film.year||''),3.8,'#6d5041');
  const roll=group(sheet);
  const shade=gradient(sheet,[['0%','#735341'],['24%','#f3dbb4'],['65%','#d6b48c'],['100%','#8c6953']]);
  rect(roll,-1,-3,54,6,shade,{rx:2,stroke:'#6c5140','stroke-width':.7});
  ellipse(roll,52.4,0,1.5,2.5,'#614a3d',{stroke:'#f2dbc0','stroke-width':.7});
  return {sheet,opening,roll};
}

// Distance to the part of a walk that a passer can cover during the next beat.
function trafficDistance(w,spot,project) {
  const [x,y]=project(w.u,w.v),to=w.plan?.[0]?.to;
  const [tx,ty]=to ? project(...to) : [x,y];
  const dx=tx-x,dy=(ty-y)*1.5, length=Math.hypot(dx,dy);
  const px=spot[0]-x,py=(spot[1]-y)*1.5;
  const part=length ? Math.max(0,Math.min(1,140/length,(px*dx+py*dy)/(length*length))) : 0;
  return Math.hypot(px-dx*part,py-dy*part);
}

function paperGrip(scene) {
  const grip=group(scene);
  path(grip,'M-5 1 Q-7-2-6-4 Q-5-6-3-4 L0-2 L3-4 Q6-6 7-3 L4 2 Q1 5-3 4Z',
    '#ffda9e',{stroke:'#58412e','stroke-width':1.1,'stroke-linejoin':'round'});
  return grip;
}

export function posterBin(getData,wearRole,walkers,project) {
  let lastTitle='';
  const passing=()=>[...walkers.values()].filter(w=>!w.gone&&!w.removing&&!w.out&&w.alpha>.6);
  function findSpot() {
    if (!prints(getData()).length) return null;
    const moving=passing();
    let best, space=-1;
    for(const floor of [[11.7,.94],[9.2,.94],[6.1,.94]]) {
      const mark=project(...floor);
      const nearest=moving.reduce((n,w)=>Math.min(n,trafficDistance(w,mark,project)),Infinity);
      if(nearest>space){best=floor;space=nearest;}
    }
    return best;
  }
  const story=incident(20,1,1,findSpot,
    ({root,scene,actors,center,project})=>{
      const guest=actors[0], available=prints(getData());
      const others=available.filter(f=>f.title!==lastTitle), pool=others.length?others:available;
      const film=pool[Math.floor(Math.random()*pool.length)];lastTitle=film.title;
      const release=wearRole(guest,guest.emName);
      makeBin(scene);
      // A passer can share the guest's mark. Keep the actual guest and the
      // paper in adjacent drawing layers while the bin stays on the floor.
      const paperLayer=root.cloneNode(false);
      paperLayer.removeAttribute('data-cinema-incident');
      root.after(paperLayer);
      const baseDepth=Number(root.style.zIndex);
      let guestDepth=baseDepth;
      const sleeve=path(paperLayer,'','none',{stroke:'#b48760','stroke-width':4.5,'stroke-linecap':'round'});
      const secondSleeve=path(paperLayer,'','none',{stroke:'#927247','stroke-width':3.8,'stroke-linecap':'round'});
      const {sheet,opening,roll}=makeSheet(paperLayer,film);
      const hand=paperGrip(paperLayer),secondHand=paperGrip(paperLayer);
      const w=Number(guest.em.dataset.w)||45,h=parseFloat(guest.em.style.height)||45;
      const waits=new Map();
      return {
        slots:[[-14,-2]],walks:[{at:17.2,slot:0,offset:[40,15]}],
        zoom:2.8,focusY:43,showWhileApproaching:true,actionBounds:()=>[-96,-110,122,34],
        hold(t) {
          const beat=t>=1.6&&t<2.1 ? 'pickup' : t>=14.8&&t<15.2 ? 'carry' : null;
          if(!beat || waits.get(beat)===0)return false;
          const now=performance.now();
          const deadline=waits.get(beat) ?? now+7000;
          const spot=[center[0]+(beat==='pickup'?-34:15),center[1]-4];
          if(now<deadline && passing().some(w=>w!==guest && trafficDistance(w,spot,project)<79)){
            waits.set(beat,deadline);return true;
          }
          waits.set(beat,0);return false;
        },
        paint(t,reduced) {
          const [wx,wy]=project(guest.u,guest.v),gx=wx-center[0],gy=wy-center[1];
          if(t>0){
            guestDepth=baseDepth;
            for(const w of walkers.values()){
              if(w===guest || w.gone || w.alpha<.05)continue;
              if(Math.abs(w.x-wx)<150 && Math.abs(w.y-wy)<110)guestDepth=Math.max(guestDepth,(w.z||0)+1);
            }
          }
          paperLayer.style.zIndex=String(guestDepth+1);
          paperLayer.style.opacity=scene.getAttribute('opacity')||'1';
          const lift=ease(ramp(t,2.1,4.6)), turn=ease(ramp(t,3.8,6.5)), carry=ease(ramp(t,15,17.2));
          const open=ease(ramp(t,6.3,8.8))*(1-ease(ramp(t,12.8,15.1)));
          const pickupX=-60,pickupY=-58;
          const topX=gx+w*.37+2,topY=gy-Math.max(78,h+14);
          const x=mix(mix(pickupX,topX,lift),gx+w*.3+4,carry);
          const y=mix(mix(pickupY,topY,lift),gy-h*.42,carry);
          const angle=mix(mix(-83,0,turn),reduced?0:19,carry);
          const scale=mix(mix(.57,1,lift),.8,carry);
          place(sheet,x,y,angle,scale);
          opening.setAttribute('height',(76*open).toFixed(2));place(roll,0,76*open);
          sheet.dataset.phase=t<2.1?'bin':t<6.3?'lifting':open>.98?'open':t<15.2?'rolling':'carrying';
          const grip=ease(ramp(t,.8,2.1)), side=mix(-1,1,lift);
          const ax=gx+side*w*.26,ay=gy-h*.44;
          const hx=mix(ax,x,grip),hy=mix(ay,y+2+open*23,grip);
          attrs(sleeve,{d:'M'+ax+' '+ay+'Q'+mix(ax,hx,.47)+' '+(Math.max(ay,hy)+5)+' '+hx+' '+hy,opacity:grip});
          place(hand,hx,hy,-12);hand.setAttribute('opacity',grip);
          const steady=ease(ramp(t,6,7.1))*(1-ease(ramp(t,14.4,15.2)));
          const bottomY=y+76*open,otherX=gx+w*.08,otherY=gy-h*.32;
          const fingerX=mix(otherX,x+1,steady),fingerY=mix(otherY,bottomY,steady);
          attrs(secondSleeve,{d:'M'+otherX+' '+otherY+'Q'+otherX+' '+(otherY+8)+' '+fingerX+' '+fingerY,opacity:steady});
          place(secondHand,fingerX,fingerY,-14,.92);secondHand.setAttribute('opacity',steady);
        },
        act(i,t) {return {tilt:-8*beat(t,.6,4.4)+5*beat(t,9.6,12.1),zOffset:guestDepth-baseDepth-1};},
        dispose(){paperLayer.remove();release();},
      };
    });
  return {...story,automatic:true,eligible:w=>!w.out&&!w.pairedRole&&!!w.emName&&!!w.bod};
}
