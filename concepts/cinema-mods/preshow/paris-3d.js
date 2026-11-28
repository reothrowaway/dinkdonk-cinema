import {nearbyGuests} from './visual-applause.js';
import {node, path, group} from '../incidents/stage.js';

const plateUrl = new URL('./paris-plate.webp',import.meta.url).href;
const clamp = n => Math.max(0,Math.min(1,n));
const smooth = n => { const t=clamp(n); return t*t*(3-2*t); };
const duration = 29;

function glassProp(guest) {
  const w = guest.w;
  const width = Math.min(56,Math.max(25,w.emW*.91));
  const faceY = -Math.max(w.hideLocal+9,w.emH*.65);
  const lapY = -Math.max(w.hideLocal+4,w.emH*.25);
  // The guest and cardboard share body coordinates, including seat clipping.
  const root = node(w.bod,'svg',{viewBox:'-75 -135 150 155',width:150,height:155,'aria-hidden':'true','data-paris-glasses':''});
  root.style.cssText='position:absolute;left:-75px;top:-135px;overflow:visible;pointer-events:none;z-index:5';
  const sleeve=path(root,'','none',{stroke:'#594339','stroke-width':5.6,'stroke-linecap':'round','stroke-linejoin':'round'});
  const arm=path(root,'','none',{stroke:'#e1ac73','stroke-width':3.4,'stroke-linecap':'round','stroke-linejoin':'round'});
  const mask=group(root);
  path(mask,'M-24 1L-24 28Q-25 31-28 29L-28 3Z','#c9a274',{stroke:'#594334','stroke-width':1});
  const openings='M-27-10H-9Q-6-10-6-7V3Q-6 6-9 6H-27Q-30 6-30 3V-7Q-30-10-27-10ZM9-10H27Q30-10 30-7V3Q30 6 27 6H9Q6 6 6 3V-7Q6-10 9-10Z';
  path(mask,'M-35-12Q-35-15-31-15H30Q35-15 35-11V9Q35 13 30 13H9L3 5H-2L-8 13H-31Q-35 13-35 9Z'+openings,
    '#ffedbd',{stroke:'#3a302a','stroke-width':2,'fill-rule':'evenodd'});
  node(mask,'rect',{x:-30,y:-10,width:24,height:16,rx:3,fill:'#00c3da','fill-opacity':.65,stroke:'#6e6657','stroke-width':1.2});
  node(mask,'rect',{x:6,y:-10,width:24,height:16,rx:3,fill:'#ef3834','fill-opacity':.68,stroke:'#755747','stroke-width':1.2});
  path(mask,'M-31 17Q-34 16-33 13Q-32 11-29 13L-26 15Q-24 13-22 16Q-20 18-22 22L-27 24Q-31 23-31 17Z',
    '#f6c589',{stroke:'#654937','stroke-width':1.3});
  return {root,mask,sleeve,arm,width,faceY,lapY,half:Math.max(7,w.emW*.28),shoulder:-Math.max(w.hideLocal+5,w.emH*.43)};
}

function makeSlide() {
  const card=node(document.getElementById('preshow'),'svg',{viewBox:'0 0 960 540',width:960,height:540,'data-paris-show':'','aria-label':'Paris stereo travelogue'});
  card.style.cssText='position:absolute;inset:0;z-index:20;pointer-events:none;background:#1e2526';
  node(card,'rect',{x:15,y:15,width:930,height:510,rx:3,stroke:'#d7bc82',fill:'none','stroke-width':3});
  const title=group(card);
  function label(parent,x,y,size,content,fill='#f7eace') {
    node(parent,'text',{x,y,'font-size':size,fill,'font-family':'Georgia, serif','text-anchor':'middle'}).textContent=content;
  }
  label(title,480,130,34,'DINKDONK CINEMA','#cebd97');
  label(title,480,263,88,'Paris in 3-D');
  label(title,480,362,41,'Raise your viewers');
  label(title,480,428,31,'Red over your left eye','#e5d5aa');
  const show=group(card);
  node(show,'image',{x:183,y:17,width:594,height:477,href:plateUrl,preserveAspectRatio:'xMidYMid meet'});
  label(show,480,520,24,'Avenue de l’Opéra · Paris, 1900');
  const insert=document.createElement('div');
  insert.dataset.parisInsert='';insert.setAttribute('aria-hidden','true');
  insert.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:70004;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:#101413;color:#e5d5b4;font:31px Georgia,serif;visibility:hidden;opacity:0';
  const photo=new Image();photo.alt='Horse-drawn traffic outside the Paris Opera in 1900';photo.src=plateUrl;
  photo.style.cssText='height:85%;width:auto;max-width:95%;object-fit:contain';
  const credit=document.createElement('span');credit.textContent='Avenue de l’Opéra, Paris · Underwood & Underwood, 1900 · Library of Congress';
  insert.append(photo,credit);document.getElementById('stage').append(insert);
  return {card,title,show,insert,photo};
}

export function startParisShow(host,reduced) {
  const cast=nearbyGuests(host).slice(0,3);
  if (!cast.length) return null;
  for (const g of cast) g.prop=glassProp(g);
  const slide=makeSlide(), start=performance.now();
  const left=cast[0].x-57,right=cast.at(-1).x+57,top=Math.min(...cast.map(g=>g.y))-20;
  const bottom=Math.max(...cast.map(g=>host.point(g.w)[1]))+18;
  const screen=host.screen();
  const center=screen.reduce(([x,y],p)=>[x+p[0]/4,y+p[1]/4],[0,0]);
  let t=0,phase='';
  function cancel() {
    slide.card.remove();slide.insert.remove();for(const g of cast)g.prop.root.remove();
  }
  function state() {
    t=(performance.now()-start)/1000;
    if(t>=duration){cancel();return 'complete';}
    if(cast.some(g=>!host.active(g.w)||g.w.seat!==g.seat)||slide.photo.complete&&!slide.photo.naturalWidth)return 'interrupted';
    const next=t<7.8?'raise':t<21.5?'view':'lower';
    if(next!==phase){
      phase=next;slide.card.dataset.phase=phase;
      slide.title.style.display=phase==='raise'?'':'none';slide.show.style.display=phase==='raise'?'none':'';
    }
    const insert=reduced?0:smooth((t-11.6)/.65)*(1-smooth((t-19.2)/.65));
    slide.insert.style.visibility=insert?'visible':'hidden';slide.insert.style.opacity=String(insert);
    cast.forEach(({prop:p},i)=>{
      const lift=smooth((t-3.6-i*.33)/1.55)*(1-smooth((t-22.6-i*.22)/1.65));
      const appear=smooth((t-2.5-i*.2)/.6)*(1-smooth((t-25.1-i*.1)/.65));
      const scale=p.width/70;
      const x=-(1-lift)*p.half*.72,y=p.lapY+(p.faceY-p.lapY)*lift;
      const angle=reduced?0:-17*(1-lift),rad=angle*Math.PI/180;
      p.root.style.opacity=String(appear);
      p.mask.setAttribute('transform','translate('+x+' '+y+') rotate('+angle+') scale('+scale+')');
      const dx=-27*scale,dy=20*scale;
      const gripX=x+dx*Math.cos(rad)-dy*Math.sin(rad),gripY=y+dx*Math.sin(rad)+dy*Math.cos(rad);
      const d='M'+(-p.half)+' '+p.shoulder+'Q'+(-p.half-6)+' '+(p.shoulder+6)+' '+gripX+' '+gripY;
      p.arm.setAttribute('d',d);p.sleeve.setAttribute('d',d);
    });
    return 'playing';
  }
  function camera() {
    if(reduced||t<1.1||t>25.8)return null;
    if(t>=8.3&&t<20.4)return [center[0],center[1],2.3];
    return [(left+right)/2,(top+bottom)/2,Math.min(3.5,1420/(right-left),840/(bottom-top))];
  }
  function bubbleClearance(project) {
    return cast.map(({w})=>{const b=w.box,[x0,y0]=project(b[0]-14,b[1]-14),[x1,y1]=project(b[2]+14,b[3]+5);return {x0,y0,x1,y1};});
  }
  state();return {state,cancel,camera,bubbleClearance,bounds:[left,top,right,bottom]};
}
