import {makeHand,nearbyGuests} from './visual-applause.js';
import {rainScore,rainWave,rainDuration} from './rain-score.js';
import {node,path} from '../incidents/stage.js';

const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{const n=clamp(x);return n*n*(3-2*n);};
const cues=[[0,'Audience Foley','Make it rain'],[2.2,'Wind','Brush your palms'],[6.55,'First drops','Snap your fingers'],
  [10.9,'Downpour','Pat your knees'],[15.35,'Passing shower','Snap your fingers'],[18.45,'Last breeze','Brush your palms'],[22.3,'The street falls quiet','Hands still']];
function makeCard(){
  const stage=document.getElementById('preshow');
  const card=node(stage,'svg',{viewBox:'0 0 960 540',width:960,height:540,'aria-label':'Audience Foley cues','data-rain-foley':''});
  card.style.cssText='position:absolute;inset:0;z-index:20;pointer-events:none;background:#26383c';
  node(card,'rect',{x:18,y:18,width:924,height:504,rx:3,fill:'none',stroke:'#d1c29e','stroke-width':3});
  node(card,'rect',{x:27,y:27,width:906,height:486,rx:2,fill:'none',stroke:'#889c94'});
  for(const x of [94,866])for(const y of [79,461]){
    const pos=node(card,'g',{transform:'translate('+x+' '+y+') scale('+(x<480?1:-1)+' '+(y<270?1:-1)+')'});
    path(pos,'M0 0h105M0 8h67M0 16h32','none',{stroke:'#e3c899','stroke-width':3});
  }
  function label(y,size,color,family){
    return node(card,'text',{x:480,y,'font-size':size,fill:color,'text-anchor':'middle','font-family':family});
  }
  label(129,29,'#dbcba7','Georgia, serif').textContent='D I N K D O N K   C I N E M A';
  const action=label(282,76,'#fff1cf','Georgia, serif'),title=label(363,37,'#b5d1c3','Georgia, serif');
  return {card,action,title};
}
function prepare(g,i,score){
  const w=g.w;
  const half=Math.min(15,Math.max(9,w.emW*.29)),shoulderY=-Math.max(w.hideLocal+7,w.emH*.47);
  const lapY=-Math.max(w.hideLocal+4,w.emH*.29);
  const hands=[-1,1].map(side=>{
    const h=makeHand(w,side),drawing=h.palm.firstElementChild;
    const pinch=path(drawing,'M10 34L8 27Q2 23 3 16Q3 13 6 15L10 19L8 13Q6 8 9 7Q11 6 14 12L17 14L20 8Q21 5 24 7Q26 9 24 13L21 18Q28 12 28 16Q29 20 23 26L20 34Z','#ffd18b',{stroke:'#563925','stroke-width':1.5});
    const height=Math.min(17,Math.max(11,w.emW*.35)),width=height*17/22,length=parseFloat(h.arm.style.height);
    h.arm.style.left=(side*half-2.5)+'px';h.arm.style.top=(shoulderY-length)+'px';
    w.bod.append(h.palm);Object.assign(h.palm.style,{width:width+'px',height:height+'px',left:(-width/2)+'px',top:(-.90*height)+'px',
      bottom:'auto',transformOrigin:'50% 90%',zIndex:5,opacity:0,pointerEvents:'none'});
    h.palm.dataset.rainPalm=String(i);
    pinch.style.display='none';h.arm.dataset.rainHand=String(i);
    return {...h,open:[...drawing.children].filter(n=>n!==pinch),pinch,height,length};
  });
  const lap=node(w.bod,'svg',{width:half*3.2,height:12,viewBox:'0 0 48 15','aria-hidden':'true'});
  lap.dataset.rainKnees=String(i);
  Object.assign(lap.style,{position:'absolute',left:(-half*1.6)+'px',top:lapY+'px',pointerEvents:'none',opacity:0});
  path(lap,'M1 13Q1 2 11 2Q21 2 23 13ZM25 13Q26 2 36 2Q46 2 47 13Z','#53606a',{stroke:'#2b3039','stroke-width':1.5});
  return {...g,hands,lap,half,shoulderY,lapY,beats:score.filter(beat=>beat.player===i),index:-1};
}
export function startRainFoley(host,reduced){
  const chosen=nearbyGuests(host).slice(0,3);
  if(chosen.length<2)return null;
  const score=rainScore(chosen.length),mediaUrl=URL.createObjectURL(rainWave(score,chosen.length));
  const cast=chosen.map((g,i)=>prepare(g,i,score)),screen=makeCard(),music=new Audio();
  const cueStrip=document.createElement('div');
  cueStrip.setAttribute('aria-hidden','true');cueStrip.dataset.rainInstruction='';
  cueStrip.style.cssText='position:absolute;bottom:39px;left:50%;transform:translateX(-50%);padding:8px 22px;border-block:1px solid #c6b694;background:#1b2b2dee;color:#fff1cf;font:600 28px/1.15 Georgia,serif;z-index:70005;pointer-events:none;white-space:nowrap;visibility:hidden';
  document.getElementById('stage').append(cueStrip);
  music.className='rain-foley-audio';music.preload='auto';music.volume=.74;
  screen.card.after(music);music.src=mediaUrl;
  const left=cast[0].x-61,right=cast.at(-1).x+61,top=Math.min(...cast.map(g=>g.y))-24,bottom=Math.max(...cast.map(g=>host.point(g.w)[1]))+15;
  const start=performance.now();let t=0,shown=-1,closed=false,firstPlay=false;
  function play(){
    if(closed||!music.paused||t>=rainDuration-.2||music.readyState<1)return;
    music.currentTime=Math.min(t,rainDuration-.2);music.play().catch(()=>{});
  }
  music.addEventListener('loadedmetadata',play);document.addEventListener('pointerdown',play);
  function cancel(){
    if(closed)return;closed=true;document.removeEventListener('pointerdown',play);music.removeEventListener('loadedmetadata',play);
    music.pause();music.removeAttribute('src');music.load();music.remove();URL.revokeObjectURL(mediaUrl);screen.card.remove();cueStrip.remove();
    for(const g of cast){g.lap.remove();for(const h of g.hands){h.arm.remove();h.palm.remove();}}
  }
  function state(){
    t=(performance.now()-start)/1000;
    if(t>=rainDuration){cancel();return 'complete';}
    if(cast.some(g=>!host.active(g.w)||g.w.seat!==g.seat))return 'interrupted';
    if(!firstPlay&&music.readyState>=1){firstPlay=true;play();}
    const song=music.paused?t:music.currentTime;
    const cue=cues.findLastIndex(c=>song>=c[0]);
    if(cue!==shown){
      shown=cue;screen.action.textContent=cues[cue][2];screen.title.textContent=cues[cue][1];
      cueStrip.textContent=cues[cue][1]+' · '+cues[cue][2];
      screen.card.dataset.cue=String(cue);
    }
    cueStrip.style.visibility=!reduced&&t>=3.2&&t<=21.7?'visible':'hidden';
    cast.forEach((g,i)=>{
      while(g.index+1<g.beats.length&&g.beats[g.index+1].t<=song)g.index++;
      const beat=g.beats[g.index],age=beat?song-beat.t:1,kind=beat?.kind||'rub';
      const strength=smooth((song-1.3-i*.18)/.7)*(1-smooth((song-22.25-i*.16)/.68));
      const next=g.beats[g.index+1];
      const preparation=next?.kind===kind?smooth(1-(next.t-song)/.14):0;
      // Hold the palm against the fabric on each downbeat before the rebound.
      const recoil=kind==='pat'?1-smooth((age-.20)/.19):Math.exp(-age*16);
      const strike=beat?Math.max(preparation,recoil):0;
      const rub=beat?Math.sin(2*Math.PI*clamp(age/beat.length)):0;
      g.lap.style.opacity=kind==='pat'?String(strength):'0';
      for(const h of g.hands){
        const {side,arm,palm,pinch}=h;
        const snap=kind==='snap'&&strike<.54;
        if(h.snap!==snap){h.snap=snap;pinch.style.display=snap?'':'none';for(const n of h.open)n.style.display=snap?'none':'';}
        let x,y,wrist;
        if(kind==='rub'){
          x=side*(.45*h.height+1);y=g.shoulderY-4+side*3.3*rub;wrist=-side*52;
        }else if(kind==='snap'){
          x=side*(g.half+7+3*strike);y=g.shoulderY-8-4*strike;wrist=side*(23+9*strike);
        }else{
          x=side*(g.half*.79+1);y=g.lapY+6-h.height*.80-17*(1-strike);wrist=side*(158+17*strike);
        }
        if(reduced)y=(y+g.shoulderY)/2;
        x=side*g.half+(x-side*g.half)*strength;y=g.shoulderY+(y-g.shoulderY)*strength;
        const dx=x-side*g.half,dy=y-g.shoulderY,angle=Math.atan2(dx,-dy)*180/Math.PI;
        arm.style.opacity=palm.style.opacity=String(strength);
        arm.style.transform='rotate('+angle+'deg) scaleY('+Math.max(.05,Math.hypot(dx,dy)/h.length)+')';
        palm.style.transform='translate('+x+'px,'+y+'px) rotate('+wrist+'deg)';arm.dataset.gesture=kind;
      }
    });
    return 'playing';
  }
  function pose(w){
    const g=cast.find(p=>p.w===w);if(!g||g.index<0)return;
    const beat=g.beats[g.index],age=(music.paused?t:music.currentTime)-beat.t;
    const n=beat.kind==='pat'?Math.exp(-Math.max(0,age)*8):0;
    return {tilt:0,lift:0,sq:1-(reduced?.015:.065)*n};
  }
  function bubbleClearance(project){return cast.map(({w})=>{
    const b=w.box,[x0,y0]=project(b[0]-15,b[1]-22),[x1,y1]=project(b[2]+15,b[3]+4);return {x0,y0,x1,y1};
  });}
  function camera(){
    if(reduced||t<3.2||t>21.7)return null;
    return [(left+right)/2,(top+bottom)/2,Math.min(3.2,1450/(right-left),840/(bottom-top))];
  }
  state();return {state,cancel,pose,camera,bubbleClearance,bounds:[left,top,right,bottom]};
}
