import {attrs,def,group,node,path,rect} from '../incidents/stage.js';
import '../../house-organ/instrument.js';

const clamp=n=>Math.max(0,Math.min(1,n));
function ease(t,a,b) { const p=clamp((t-a)/(b-a));return p*p*(3-2*p); }
const musicAt=5.65, lowerAt=19.7, end=25;
const melody=window.CinemaOrgan.melodyAt(.06);

function makeLift(root) {
  const well='M-95-16L-62-33 95 45 62 62Z';
  path(root,well,'#171016',{stroke:'#9a7965','stroke-width':2});
  const inner=path(root,'M-90-16l28-13 149 74-25 13Z','#2d1d26');
  const side=path(root,'M-95-16L62 62v4L-95-12Z','#634638');
  const mask=def(root,'clipPath','organ-pit');
  path(mask.el,'M-116-190H120V91L-116-27Z','#fff');
  const visible=group(root,{'clip-path':mask.url});
  const lift=group(visible);
  path(lift,'M-91-18l29-14 152 76-29 15Z','#6c5347',{stroke:'#c6a782','stroke-width':1.5});
  path(lift,'M-91-18L61 59v3L-91-15Z','#332832');
  const plane=group(lift,{transform:'skewY(21) translate(-82 -72) scale(.10256)'});
  const image=node(plane,'image',{width:1560,height:1008,preserveAspectRatio:'none'});
  const paper=def(plane,'clipPath','organ-paper');
  const paperShape='M651 149L917 172 901 303 633 284Z';
  path(paper.el,paperShape,'white');
  const roll=group(plane,{'clip-path':paper.url});
  const shade=def(plane,'linearGradient','organ-paper-light',{x1:0,y1:0,x2:0,y2:'100%'});
  for(const [offset,color] of [[0,'#ac703b'],[.37,'#e4b66f'],[.75,'#efd094'],[1,'#be894a']])
    node(shade.el,'stop',{offset,'stop-color':color});
  path(roll,paperShape,shade.url);
  const holes=group(roll);
  for(const note of melody) {
    const x=653+(note.pitch-60)*16;
    rect(holes,x,196+note.time*65+(x-640)*.075,8,Math.max(7,(note.end-note.time)*61),'#593821',{rx:2});
  }
  const key=path(plane,'','none');
  const lidLeft=path(root,'M-95-16L-62-33 16 6-17 23Z','#68564e',{stroke:'#a58b70','stroke-width':1});
  const lidRight=path(root,'M-17 23L16 6 95 45 62 62Z','#594d4b',{stroke:'#a58b70','stroke-width':1});
  // Fold the leaves flat against the two short ends of the pit.
  function doors(open) {
    const seam1=[-17,23], seam2=[16,6];
    const at=(a,b)=>a+(b-a)*open;
    const lx=at(seam1[0],-95),ly=at(seam1[1],-16),rx=at(seam1[0],62),ry=at(seam1[1],62);
    const l2x=at(seam2[0],-62),l2y=at(seam2[1],-33),r2x=at(seam2[0],95),r2y=at(seam2[1],45);
    lidLeft.setAttribute('d','M-95-16L-62-33 '+l2x+' '+l2y+' '+lx+' '+ly+'Z');
    lidRight.setAttribute('d','M'+rx+' '+ry+'L'+r2x+' '+r2y+' 95 45 62 62Z');
  }
  function draw(t,songTime) {
    const open=ease(t,.5,2.2)*(1-ease(t,22.6,24.2));
    const raised=ease(t,2.0,5.5)*(1-ease(t,lowerAt,22.9));
    doors(open);
    lift.setAttribute('transform','translate(0 '+((1-raised)*169).toFixed(2)+')');
    inner.setAttribute('opacity',String(1-raised*.65));
    side.setAttribute('opacity',String(open));
    holes.setAttribute('transform','translate(0 '+(-songTime*65).toFixed(2)+')');
    const sounding=melody.find(n=>songTime>=n.time && songTime<n.end);
    if (sounding) {
      const midi=sounding.pitch, note=(midi-60)%12;
      const index=7*Math.floor((midi-60)/12)+[0,.65,1,1.65,2,3,3.65,4,4.65,5,5.65,6][note];
      const x=434+index*29,y=538+(x-434)*.075,black=!Number.isInteger(index);
      const depth=black?27:52,width=black?15:24;
      key.setAttribute('d','M'+x+' '+y+'l'+width+' 2 -15 '+depth+' -'+width+' -2Z');
      attrs(key,{fill:black?'#b57632':'#e8a948',opacity:.92});
    } else key.setAttribute('opacity',0);
  }
  return {image,draw};
}

export function startOrganLift(host,reduced) {
  const guests=host.seated().filter(w=>!w.dozing&&!w.texting);
  if (!guests.length) return null;
  const [x,y]=host.floor(5.9,1.2).point;
  // Sort the whole platform at its nearest lip. The center is several floor
  // bands farther away and would let those bands cut through the cabinet.
  const {depth}=host.floor(8.2,2.1);
  const root=document.createElementNS('http://www.w3.org/2000/svg','svg');
  attrs(root,{viewBox:'-130 -175 260 260','aria-label':'Rising house organ','data-organ-lift':''});
  Object.assign(root.style,{position:'absolute',left:(x-130)+'px',top:(y-175)+'px',width:'260px',height:'260px',pointerEvents:'none',opacity:'0',zIndex:String(depth)});
  document.getElementById('world').append(root);
  const {image,draw}=makeLift(root), requested=performance.now();
  let ready=false,broken=false,began=null,t=0,attempted=false,disposed=false,drawn=-1;
  image.addEventListener('load',()=>{ready=true;},{once:true});
  image.addEventListener('error',()=>{broken=true;},{once:true});
  image.setAttribute('href',new URL('./player-organ.webp',import.meta.url).href);
  const audio=new Audio();
  audio.preload='auto';audio.volume=.66;
  audio.className='organ-lift-audio';root.after(audio);
  audio.src=new URL('./organ-overture.mp4',import.meta.url).href;
  function play() {
    if(disposed || t<musicAt || t>=lowerAt || !audio.paused)return;
    if(audio.readyState>=1) audio.currentTime=Math.max(0,t-musicAt);
    audio.play().catch(()=>{}); // A browser may wait for a local gesture.
  }
  window.addEventListener('pointerdown',play);
  window.addEventListener('keydown',play);
  function cancel(){
    disposed=true;window.removeEventListener('pointerdown',play);window.removeEventListener('keydown',play);
    audio.pause();audio.removeAttribute('src');audio.load();audio.remove();root.remove();
  }
  function state(){
    const now=performance.now();
    if(!ready)return broken||now-requested>7000?'interrupted':'playing';
    if(began===null)began=now;
    t=(now-began)/1000;
    if(t>=end){cancel();return 'complete';}
    if(!attempted && t>=musicAt){attempted=true;play();}
    const songTime=audio.paused ? Math.max(0,t-musicAt) : audio.currentTime;
    const frame=Math.floor(t*30);
    if(frame!==drawn){
      drawn=frame;
      draw(t,songTime);
      root.dataset.phase=t<2?'opening':t<5.5?'rising':t<lowerAt?'playing':t<22.9?'lowering':'closing';
      root.style.opacity=String(ease(t,0,.4)*(1-ease(t,24.2,end)));
    }
    return 'playing';
  }
  const audience=new Set(guests);
  return {state,cancel,bounds:[x-110,y-130,x+110,y+70],occlusionBox:[x-110,y-130,x+110,y+70,depth],
    pose(w){
      if(!audience.has(w) || !host.active(w) || t<musicAt || t>lowerAt)return;
      return {lift:0,tilt:(reduced ? .4 : 1.8)*Math.sin((t-musicAt)*Math.PI/.56),sq:1};
    },
    camera:()=>reduced || began===null || t<.4 || t>23.4 ? null : [x,y-22,2.8]};
}
