// Lobby events use the existing 1920 x 1080 camera space.
import {topographyEntrance} from './preshow/transition-cues.js';
import {availableForTravel, beginGuestTravel, syncGuestTravel} from './guest-travel.js';
import {guestRoute, walkableMark} from './guest-routes.js';
const TAU = Math.PI * 2;
const clamp = n => Math.min(1, Math.max(0, n));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const ease = n => n * n * (3 - 2 * n);
const mix = (a, b, n) => a + (b - a) * n;
const at = (n, digits = 2) => n.toFixed(digits);
const duration = {mirrorball: 14, 'black-hole': 17};
const cooldown = () => (12 + 8 * Math.random()) * 60000;
const onFoot = w => !w.gone && !w.removing && !w.staff && !w.jan && !w.ride &&
  !w.inDoor && !w.thru && !w.reFreeze && !w.fighting && w.alpha > .65;

function svg(parent, tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  parent.append(el);
  return el;
}
function mount(world, pos, z) {
  const root = svg(world, 'svg', {width: 2, height: 2, 'aria-hidden':'true'});
  root.style.cssText = `position:absolute;left:${pos[0]}px;top:${pos[1]}px;overflow:visible;pointer-events:none;z-index:${z}`;
  root.dataset.cinemaIncident = '';
  return root;
}
function transform(node, value) { node.setAttribute('transform', value); }
function gradient(defs, id, stops) {
  const g = svg(defs,'radialGradient',{id});
  for (const [offset,color,opacity] of stops) svg(g,'stop',{offset,'stop-color':color,'stop-opacity':opacity});
}

function ballroom(root) {
  const defs = svg(root,'defs');
  gradient(defs,'ev-dance-pool',[[0,'#a882ff',.42],[.65,'#e536a3',.18],[1,'#d12d99',0]]);
  gradient(defs,'ev-ball-shade',[[0,'#dfffff',0],[.65,'#101528',0],[1,'#050a21',.75]]);
  const spill=svg(root,'g');
  const shafts=['#e985c9','#b8a6ff','#6cdbdb'].map(fill=>svg(spill,'path',{fill}));
  const floor = svg(root,'g');
  svg(floor,'ellipse',{rx:166,ry:58,fill:'url(#ev-dance-pool)'});
  const soloLight=svg(floor,'ellipse',{cy:43,rx:43,ry:14,fill:'#ffe8a6'});
  const flecks = svg(floor,'g');
  for (let i=0;i<32;i++) {
    const a=i*2.40, r=25+((i*47)%152);
    svg(flecks,'rect',{x:at(r*Math.cos(a)),y:at(r*Math.sin(a)),width:6+(i%4),height:4,rx:1,
      fill:['#c3fffe','#fa8fd1','#fff3b2','#b79dfa'][i%4]});
  }
  const cable = svg(root,'line',{x1:0,y1:-330,stroke:'#b4b6bb','stroke-width':2});
  const ball = svg(root,'g');
  svg(ball,'circle',{r:25,fill:'#192436'});
  // Project a tiled sphere. Meridians narrow toward the rim and at the poles.
  const vertex = (lat,lon) => [25*Math.cos(lat)*Math.sin(lon),25*Math.sin(lat)].map(n=>at(n)).join(',');
  const tiles=[];
  for(let row=0;row<9;row++)for(let col=0;col<12;col++){
    const a=-Math.PI/2+row*Math.PI/9,b=a+Math.PI/9,c=-Math.PI/2+col*Math.PI/12,d=c+Math.PI/12;
    const face=svg(ball,'polygon',{points:[vertex(a,c),vertex(a,d),vertex(b,d),vertex(b,c)].join(' '),
      stroke:'#243343','stroke-width':.48});
    tiles.push({face,row,col});
  }
  svg(ball,'circle',{r:25,fill:'url(#ev-ball-shade)'});
  svg(ball,'path',{d:'M-24 -6A25 25 0 0 1 5 -24',fill:'none',stroke:'#e4fffc','stroke-width':1.2,opacity:.85});
  const glint=svg(ball,'path',{d:'M-8 -20l1.7 7 7 1.6-7 1.7-1.7 7-1.6-7-7-1.7 7-1.6Z',fill:'#fff'});
  const colors=['#29304a','#49677c','#94a1b7','#e68ed2','#a4e9ee','#f9f2da'];
  let lastFrame=-1;
  return (t, reduced) => {
    const down=ease(ramp(t,.25,1.65))*(1-ease(ramp(t,11.1,13.3)));
    const answer=ease(ramp(t,6.45,7.0));
    soloLight.setAttribute('opacity',at(.36*ease(ramp(t,3.9,4.5))*(1-ease(ramp(t,10.9,11.4)))));
    soloLight.setAttribute('cy',at(43-27*answer));
    soloLight.setAttribute('rx',at(43+95*answer));soloLight.setAttribute('ry',at(14+26*answer));
    const swing=reduced?0:Math.sin((t-2.1)*3.8)*Math.exp(-Math.max(0,t-2.1)*.64)*12*down;
    const y=-325+159*down;
    ball.setAttribute('opacity',at(down));
    transform(ball,`translate(${at(swing)} ${at(y)}) scale(1.5)`);
    cable.setAttribute('opacity',at(down));cable.setAttribute('x2',at(swing));cable.setAttribute('y2',at(y-37));
    spill.setAttribute('opacity',at(down*.092));
    shafts.forEach((ray,i)=>{
      const angle=i*TAU/3+(reduced?0:t*.55);
      const endX=144*Math.cos(angle),endY=32*Math.sin(angle);
      ray.setAttribute('d',`M${at(swing)} ${at(y)} L${at(endX-17)} ${at(endY)} q17 7 34 0Z`);
    });
    floor.setAttribute('opacity',at(down*.83));
    transform(flecks,`scale(1 .38) rotate(${at(reduced?15:t*24)})`);
    const frame=reduced?0:Math.floor(t*7);
    if(frame!==lastFrame){
      lastFrame=frame;
      for(const tile of tiles){
        const band=.5+.5*Math.cos(tile.col*.71+tile.row*.95+frame*.27);
        tile.face.setAttribute('fill',colors[Math.min(5,Math.floor(band*6))]);
      }
      glint.setAttribute('opacity',at(.55+.4*Math.cos(frame*.21)));
    }
  };
}

function singularity(root, prize, scan) {
  const defs=svg(root,'defs');
  gradient(defs,'ev-hole-halo',[[0,'#1b102c',0],[.44,'#925add',.19],[.60,'#ff924b',.70],[.75,'#cf467e',.24],[1,'#6b3886',0]]);
  const portal=svg(root,'g');
  svg(portal,'ellipse',{rx:70,ry:36,fill:'url(#ev-hole-halo)'});
  svg(portal,'ellipse',{rx:35,ry:18,fill:'#090512',stroke:'#ffc073','stroke-width':2.4});
  const disk=svg(portal,'g');
  for(let i=0;i<5;i++)svg(disk,'ellipse',{rx:36+i*3,ry:36+i*3,fill:'none',stroke:i%2?'#ffba74':'#e874ac',
    'stroke-width':1.4,'stroke-dasharray':`${21+i*8} ${14+i*3} 4 8`,opacity:at(.83-i*.10)});
  const tickets=[];
  let scanFloor=scan?topographyEntrance(root):null;
  for(let i=0;i<(scan?0:3);i++){
    const g=svg(root,'g');
    svg(g,'path',{d:'M-9 -4H9V-1Q6 0 9 1V4H-9V1Q-6 0 -9 -1Z',fill:'#ffd58e',stroke:'#50364a','stroke-width':.65});
    svg(g,'path',{d:'M-5 -1H1 M-5 1H0 M4 -3V3',stroke:'#674750','stroke-width':.8});
    tickets.push(g);
  }
  const flap=svg(root,'g',{transform:`translate(${prize[0]} ${prize[1]})`});
  const slot=svg(flap,'rect',{x:-13,y:-4,width:26,height:7,rx:2,fill:'#180e23',stroke:'#f3b28c','stroke-width':1.3});
  return (t,reduced) => {
    if(scanFloor){scanFloor(t,reduced);if(t>=3)scanFloor=null;}
    const size=ease(ramp(t,1.2,4.5))*(1-ease(ramp(t,9.3,10.1)));
    transform(portal,`rotate(-16) scale(${at(size*1.18,3)})`);
    transform(disk,`scale(1 .49) rotate(${at(reduced?0:t*68)})`);
    tickets.forEach((g,i)=>{
      const p=ramp(t,.25+i*.73,3.8+i*.80),angle=i*2.17+p*(reduced?.45:2.75);
      const radius=(1-ease(p))*(110+i*13);
      transform(g,`translate(${at(Math.cos(angle)*radius)} ${at(Math.sin(angle)*radius*.48)}) rotate(${at(angle*65)}) scale(${at(1-p*.92)})`);
      g.setAttribute('opacity',at(ramp(t,i*.73,.3+i*.73)*(1-ramp(p,.90,1))));
    });
    slot.setAttribute('opacity',at(ramp(t,10.1,10.6)*(1-ramp(t,14.3,15))));
  };
}

function floorPlaces(count,floor,anchors){
  const places=[];
  // Fill the front solo spot, then both sides in rows beneath the mirrorball.
  // Each dancer needs clear carpet for the side step as well as a standing spot.
  for(const dy of [38,0,-34,71,-67,99]){
    for(const dx of [0,-55,55,-110,110,-165,165]){
      const requested=[floor[0]+dx/120+dy/60,floor[1]-dx/120+dy/60];
      const mark=walkableMark(requested,anchors);
      if(!mark)continue;
      const roomForKick=[-26,11].every(shift=>{
        const end=[mark[0]+shift/120,mark[1]-shift/120];
        return guestRoute(mark,end,anchors)?.length===2;
      });
      if(!roomForKick)continue;
      const spaced=places.every(p=>{
        const du=mark[0]-p[0],dv=mark[1]-p[1];
        return Math.hypot((du-dv)*60/48,(du+dv)*30/30)>=1;
      });
      if(spaced)places.push(mark);
      if(places.length===count)return places;
    }
  }
  return places;
}
// A low side step winds up the high kick. The chorus copies the same gesture two seconds later.
function discoStep(t){
  const lean=ease(ramp(t,0,.23))*(1-ease(ramp(t,.57,.81)));
  const kick=ease(ramp(t,.67,.94))*(1-ease(ramp(t,1.27,1.55)));
  const land=Math.sin(Math.PI*ramp(t,1.43,1.78));
  return {dx:-25*lean+27*kick,tilt:-34*lean+38*kick-10*land,lift:4*lean+34*kick};
}
function danceScene(root,center,floor,cast,anchors){
  const marks=floorPlaces(cast.size,floor,anchors);
  if(marks.length<2)return null;
  for(const [w,i] of cast)if(i>=marks.length)cast.delete(w);
  const trip=beginGuestTravel(cast,marks,anchors);
  if(!trip)return null;
  const draw=ballroom(root);
  let drop=0;
  return {ready:trip.ready, valid:onFoot=>trip.valid()&&[...cast.keys()].every(onFoot),dispose:trip.release,
    gather(t,reduced){drop=Math.min(t,2);draw(drop,reduced);},
    paint(t,reduced){draw(Math.max(t,drop),reduced);},
    camera(t){
      const zoom=ease(ramp(t,.6,3.9))*(1-ease(ramp(t,11,13.8)));
      return zoom>0?{x:center[0],y:center[1]-72,z:1+zoom*.74}:null;
    },
    pose(w,x,y,t,reduced){
      if(!trip.ready()||t<3.9)return;
      const i=cast.get(w),solo=t<6.45,soft=reduced?.28:1;
      const move=discoStep(solo?(i===0?t-4.5:-1):t-6.55);
      const together=Math.sin(Math.PI*ramp(t,8.52,9.31));
      const pose=ease(ramp(t,9.35,9.68))*(1-ease(ramp(t,10.93,11.15)));
      const facing=i===0?1:Math.sign(center[0]-x)||1;
      return {x:x+(move.dx+facing*10*pose)*soft,y,lift:(move.lift+29*together+5*pose)*soft,
        tilt:(move.tilt+facing*(27*pose-12*together))*soft,indoors:true,floorBeat:true};
    }};
}
function cries(stage){
  const layer=svg(stage,'svg',{'viewBox':'0 0 1920 1080','aria-hidden':'true'});
  layer.dataset.incidentSpeech='';
  layer.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:87000';
  const bubbles=new Map();
  function hide(w){bubbles.get(w)?.setAttribute('visibility','hidden');}
  return {hide,remove:()=>layer.remove(),show(w,i,x,y,opacity){
    let g=bubbles.get(w);
    if(!g){
      g=svg(layer,'g',{'data-reaction':'black-hole'});bubbles.set(w,g);
      svg(g,'path',{fill:'#fff1cb',stroke:'#432044','stroke-width':2});
      svg(g,'rect',{width:122,height:38,rx:13,fill:'#fff1cb',stroke:'#432044','stroke-width':2.5});
      const line=svg(g,'text',{'font-family':'Segoe UI, sans-serif','font-style':'italic','font-weight':'bold','font-size':23,'text-anchor':'middle',fill:'#491c40'});
      line.textContent='Noooooo!';
    }
    const bx=Math.max(5,Math.min(1793,x+(i%2?13:-135))),by=Math.max(4,y-(i%2?60:81));
    g.setAttribute('visibility','visible');g.setAttribute('opacity',at(opacity));
    g.firstChild.setAttribute('d',`M${bx+49} ${by+34}L${at(x)} ${at(y)}L${bx+68} ${by+34}Z`);
    const box=g.children[1];box.setAttribute('x',at(bx));box.setAttribute('y',at(by));
    const line=g.lastChild;line.setAttribute('x',at(bx+61));line.setAttribute('y',at(by+27));
  }};
}
export function createLobbyEvents({world,project,toScreen,depth,walkers,anchors,blocked,preview,timed=true,enabled=true,incidents={}}) {
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const featured=new Set(['contact-printer','horizon-drive','infinity-foyer','glyph-cascade']);
  const smallEvents=Object.keys(incidents).filter(kind=>featured.has(kind)||incidents[kind].automatic);
  const smallDelay=()=>(3+3*Math.random())*60000;
  const known=kind=>Object.hasOwn(duration,kind)||Object.hasOwn(incidents,kind)||kind==='laser-topography';
  let active=null,requested=enabled&&known(preview)?preview:null,next=performance.now()+cooldown();
  let nextSmall=performance.now()+smallDelay(),retryAt=performance.now()+2000;
  let camera=null, phase='', checked=-Infinity, querying=null, generation=0, lastFinished='', lastStop='', lastEventStop=null, obsActive=true, obsVisible=true;
  const visible=()=>!document.hidden&&obsActive&&obsVisible;
  let holesBeforeDance=1+Math.floor(Math.random()*2);
  let lastSmall='', smallQueue=[], castDeadline=0;
  let manual=null, manualCast=null, manualRetry=0, manualExpires=0;
  const recentRequests=new Set();
  function drawSmall(now){
    // Try another story if this room cannot supply the cast. Put the previous
    // story last so a small room can still run its only eligible event.
    smallQueue=smallEvents.filter(kind=>kind!==lastSmall);
    for(let i=smallQueue.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [smallQueue[i],smallQueue[j]]=[smallQueue[j],smallQueue[i]];
    }
    if(lastSmall)smallQueue.push(lastSmall);
    nextSmall=now+smallDelay();
    castDeadline=now+30000;
  }
  const phaseOK=()=>['seating','up'].includes(phase) && performance.now()-checked<16000;
  function readPhase(){
    if(!querying)querying=fetch('/ctl/room-state',{cache:'no-store',signal:AbortSignal.timeout(2500)})
      .then(r=>r.ok?r.json():null).then(room=>{phase=room?.auditorium?.show?.phase || '';})
      .catch(()=>{phase='';}).finally(()=>{checked=performance.now();querying=null;});
    return querying;
  }
  function finish(reason,cause=reason){
    generation++;
    if(active){
      if(active.cueId && active.cueId===manual?.id)manual.state=reason==='complete'?'finished':'interrupted';
      lastEventStop={event:active.label,reason,cause,stage:active.staging?'approach':'performance',
        seconds:Math.max(0,Math.round((performance.now()-active.start)/10)/100)};
      if(['black-hole','mirrorball'].includes(active.kind))next=performance.now()+cooldown();
      nextSmall=performance.now()+smallDelay();
      active.scene?.dispose?.(reason,cause);active.reactions?.remove();active.root.remove();lastFinished=active.label;active=null;
    }
    camera=null;lastStop=reason;retryAt=performance.now()+15000;
  }
  function interrupt(cause='manual stop'){
    if(manual?.state==='waiting')manual.state='interrupted';
    requested=null;smallQueue=[];finish('interrupted',cause);
  }
  function request(kind,id){
    if(!known(kind)||typeof id!=='string'||!id||id.length>80)return false;
    if(recentRequests.has(id))return manual?.id===id;
    recentRequests.add(id);
    if(recentRequests.size>64)recentRequests.delete(recentRequests.values().next().value);
    generation++; // discard an automatic selection still awaiting the room phase
    manual={kind,id,state:'waiting'};manualCast=null;
    manualRetry=performance.now();manualExpires=manualRetry+90000;
    return true;
  }
  function setEnabled(on){
    if(enabled===on)return;
    enabled=on;
    if(!enabled){interrupt('timed events disabled');return;}
    const now=performance.now();
    next=now+cooldown();nextSmall=now+smallDelay();
  }
  function suspend(cause){if(active)interrupt(cause);else generation++;}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend('page hidden');});
  window.addEventListener('obsSourceActiveChanged',e=>{obsActive=e.detail?.active!==false;if(!obsActive)suspend('OBS source inactive');});
  window.addEventListener('obsSourceVisibleChanged',e=>{obsVisible=e.detail?.visible!==false;if(!obsVisible)suspend('OBS source hidden');});
  window.addEventListener('pagehide',()=>interrupt('page unloaded'));
  async function start(label,named,cue){
    const oneShot=cue?.manual===true && manual?.state==='waiting' && manual.id===cue.requestId;
    if((!enabled&&!oneShot)||!known(label)||active||blocked()||!visible())return false;
    const definition=incidents[label];
    // A named doorway preview waits for a real ticket holder to clear the usher.
    // A short corridor leg may last less than the usual three-second retry.
    if(named&&!oneShot&&definition?.waitForCast){requested=label;retryAt=performance.now()+250;}
    const startGeneration=generation;
    if(!definition?.waitForCast||performance.now()-checked>1000)await readPhase();
    if(startGeneration!==generation||active||blocked()||!visible()||!phaseOK())return false;
    const kind=label==='laser-topography'?'black-hole':label;
    const a=anchors(),crowd=[...walkers.values()].filter(onFoot);
    if(kind==='mirrorball' && (!a.juke||crowd.length<2))return false;
    if(kind==='black-hole' && (!a.counter||!a.claw))return false;
    // Stage the opening in the right service aisle, beyond the marquee even in the initial wide shot.
    const floor=definition?definition.anchor(a):kind==='mirrorball'?[a.juke[0]-1.35,a.juke[1]+1.4]:[a.counter[0]+2.05,a.counter[1]+.35];
    if(!floor)return false;
    const center=project(...floor),z=depth(...floor)+1, prize=a.claw?project(...a.claw,18):center;
    const cast=new Map();
    const gathering=kind==='mirrorball'||(definition?.walksToMark && !definition.nativeRoute);
    const meeting=gathering && walkableMark(floor,a);
    const candidates=gathering ? crowd.filter(w=>meeting && availableForTravel(w,a) && guestRoute([w.u,w.v],meeting,a)) : crowd;
    if(definition){
      const rank=w=>definition.rank?definition.rank(w,center):Math.hypot(w.x-center[0],w.y-center[1]);
      const available=definition.selectCast ? definition.selectCast(candidates,a,named,cue) :
        candidates.filter(w=>!definition.eligible||definition.eligible(w,a)).sort((u,v)=>rank(u)-rank(v)).slice(0,definition.maxCast??3);
      if(available.length<(definition.minCast??1))return false;
      available.forEach((w,i)=>cast.set(w,i));
    }else if(kind==='black-hole'){
      const distance=w=>Math.hypot(w.x-center[0],w.y-center[1]);
      const nearest=crowd.filter(w=>!w.entering&&!w.hurry&&!w.doorBound&&distance(w)<620).sort((u,v)=>distance(u)-distance(v)).slice(0,4);
      if(nearest.length<2)return false;
      nearest.forEach((w,i)=>cast.set(w,i));
    }else{
      if(candidates.length<2)return false;
      candidates.sort((a,b)=>Math.hypot(a.u-floor[0],a.v-floor[1])-Math.hypot(b.u-floor[0],b.v-floor[1])).forEach((w,i)=>cast.set(w,i));
    }
    const root=mount(world,center,z);
    let scene;
    try{
      if(definition)scene=definition.start({root,center,floor,project,depth,cast,world,anchors:a,cue});
      else if(kind==='mirrorball')scene=danceScene(root,center,floor,cast,a);
      if((definition||kind==='mirrorball')&&!scene){root.remove();return false;}
    }
    catch(error){root.remove();throw error;}
    const paint=scene?scene.paint:singularity(root,[prize[0]-center[0],prize[1]-center[1]],label==='laser-topography');
    active={kind,label,scene,cueId:oneShot?cue.requestId:null,staging:!!scene?.ready,seconds:definition?.duration??duration[kind],center,z,prize,cast,root,paint,start:performance.now(),t:0,drawn:-1,
      reactions:kind==='black-hole'?cries(document.getElementById('stage')):null};
    requested=null;smallQueue=[];
    if(kind==='black-hole')holesBeforeDance=Math.max(0,holesBeforeDance-1);
    else if(kind==='mirrorball')holesBeforeDance=2+Math.floor(Math.random()*2);
    else if(smallEvents.includes(label))lastSmall=label;
    if(oneShot)manual.state='playing';
    paint(0,motion.matches);
    return true;
  }
  function play(label,cue){
    // In a shared room the lead screen supplies the actual pair to the other screens.
    if(cue?.manual && cue.a && cue.b && cue.requestId){
      if(!request(label,cue.requestId)||manual.state!=='waiting')return Promise.resolve(false);
      manualCast=cue;
    }
    return start(label,true,cue);
  }
  function step(now){
    if(manual?.state==='waiting'&&now>=manualExpires){manual.state='unavailable';generation++;}
    if(!active && manual?.state==='waiting'){
      if(now>=manualRetry){
        manualRetry=now+(incidents[manual.kind]?.waitForCast?250:500);
        void start(manual.kind,true,manualCast||{manual:true,requestId:manual.id}).catch(console.error);
      }
      return;
    }
    if(!enabled&&!active)return;
    if(active && now-checked>1000)void readPhase();
    if(!active){
      if(now<retryAt||(!requested&&!timed))return;
      let kind=requested;
      if(!kind&&now>=next){
        kind=holesBeforeDance===0?'mirrorball':Math.random()<.25?'laser-topography':'black-hole';
        next=now+30000;
      }
      let retry=3000;
      if(!kind&&smallEvents.length){
        if(now>=nextSmall)drawSmall(now);
        kind=smallQueue[0];
        if(kind){
          // The ticket holder's natural corridor leg is short. Give it a bounded
          // casting window, then let another story use the slot.
          if(incidents[kind].waitForCast&&now<castDeadline)retry=250;
          else smallQueue.shift();
        }
      }
      if(kind){retryAt=now+retry;void start(kind,!!requested).catch(console.error);}
      return;
    }
    const block=blocked(active.label);
    if(block){finish('interrupted',typeof block==='string'?block:'room busy');return;}
    if(!phaseOK()){finish('interrupted',phase&&now-checked<16000?'house phase '+phase:'house phase unavailable');return;}
    if(!visible()){finish('interrupted','room hidden');return;}
    if(active.scene?.complete?.()){finish('complete');return;}
    if(active.scene?.valid?.(onFoot)===false){
      const w=[...active.cast.keys()].find(w=>!onFoot(w)||w.quitting);
      const reason=!w?'guest route replaced':w.gone||w.removing||w.quitting?'guest leaving':
        w.reFreeze?'guest reeducation':w.ride?'guest in vehicle':w.inDoor||w.thru?'guest entering doorway':
        w.fighting?'guest in fight':w.staff||w.jan?'guest on staff duty':'guest fading';
      finish('interrupted',reason);return;
    }
    const e=active;
    if(e.staging){
      if(!e.scene.ready()){
        const elapsed=(now-e.start)/1000;
        if(elapsed>90){finish('approach timed out');return;}
        const frame=Math.floor(elapsed*24);
        if(frame!==e.drawn){e.scene.gather?.(elapsed,motion.matches);e.drawn=frame;}
        camera=motion.matches?null:e.scene.approachCamera?.()??null;
        return;
      }
      e.staging=false;e.start=now;
    }
    if(e.scene?.hold?.(e.t))e.start=now-e.t*1000;
    e.t=Math.max(0,(now-e.start)/1000);
    if(e.reactions)for(const w of e.cast.keys())if(!onFoot(w))e.reactions.hide(w);
    if(e.t>=e.seconds){finish(e.scene?.complete?'performance timed out':'complete');return;}
    if(e.scene)camera=motion.matches?null:e.scene.camera?.(e.t,false)??null;
    else if(e.kind==='black-hole' && !motion.matches){
      const pan=ease(ramp(e.t,9.8,11.6)), zoom=ease(ramp(e.t,.8,4))*(1-ease(ramp(e.t,14.4,16.7)));
      camera=zoom>0?{x:mix(e.center[0],e.prize[0],pan),y:mix(e.center[1],e.prize[1],pan)-25,z:1+zoom*.8}:null;
    }else camera=null;
    const frame=Math.floor(e.t*24);
    if(frame!==e.drawn){e.paint(e.t,motion.matches);e.drawn=frame;}
  }
  function progress(w){
    const i=active.cast.get(w),t=active.t;
    return {pull:ease(ramp(t,3.6+i*.72,6.7+i*.72)),out:ease(ramp(t,10.9+i*.68,12+i*.68)),
      home:ease(ramp(t,12+i*.68,14.4+i*.68))};
  }
  function pose(w,x,y){
    const e=active;
    if(!e)return;
    if(!onFoot(w)){e.reactions?.hide(w);return;}
    if(e.scene)return e.cast.has(w)?e.scene.pose?.(w,x,y,e.t,motion.matches):undefined;
    if(!e.cast.has(w))return;
    const {pull,out,home}=progress(w);
    const i=e.cast.get(w),reaction=e.t-(3.6+i*.72);
    let p;
    const common={lift:0,tilt:0,z:e.z+2};
    if(!pull||home>=1)p=undefined;
    else if(motion.matches)p={...common,x,y,scale:1-pull+out};
    else if(pull<1){
      const a=pull*2.8,dx=x-e.center[0],dy=y-e.center[1];
      p={...common,x:e.center[0]+(1-pull)*(dx*Math.cos(a)-dy*Math.sin(a)*.64),
        y:e.center[1]+(1-pull)*(dy*Math.cos(a)+dx*Math.sin(a)*.45),scale:1-pull,tilt:pull*85};
    }else p={...common,x:mix(e.prize[0],x,home),y:mix(e.prize[1],y,home)-Math.sin(out*Math.PI)*35,
      scale:out,tilt:Math.sin(out*Math.PI)*-22};
    if(reaction>=-.48&&reaction<1.48){
      const [sx,sy]=toScreen(p?.x??x,(p?.y??y)-38*(p?.scale??1));
      if(sx>0&&sx<1920&&sy>0&&sy<1080)e.reactions.show(w,i,sx,sy,1-ramp(reaction,1.22,1.48));
      else e.reactions.hide(w);
    }else e.reactions.hide(w);
    return p;
  }
  function concealed(w){
    if(active?.kind!=='black-hole'||!active.cast.has(w)||!onFoot(w))return false;
    const {pull,out}=progress(w);
    const reaction=active.t-(3.6+active.cast.get(w)*.72);
    return (reaction>=-.48&&reaction<1.48)||(pull>.9&&out<.4);
  }
  return {step,pose,concealed,play,request,interrupt,setEnabled,syncGuestTravel,get camera(){return camera;},
    get actionRect(){
      if(!active)return null;
      const [x,y]=active.center;
      const bounds=active.scene?.actionBounds?.();
      if(bounds)return [...toScreen(x+bounds[0],y+bounds[1]),...toScreen(x+bounds[2],y+bounds[3])];
      if(active.label==='laser-topography'&&active.t<3)return [...toScreen(x-130,y-44),...toScreen(x+130,y+63)];
      // Speech keeps its owner. Place incidental bubbles around the ball, the dancers or the borrowed letters.
      if(active.label==='mirrorball'&&active.t>=1&&active.t<11.6)return [...toScreen(x-152,y-210),...toScreen(x+152,y+62)];
      if(active.label==='contact-printer')return [...toScreen(x-75,y-117),...toScreen(x+98,y+36)];
      if(active.label==='infinity-foyer'&&active.t>=1.6&&active.t<10.54)return [...toScreen(x-38,y-137),...toScreen(x+89,y+54)];
      return null;
    },
    status:()=>({enabled,cue:manual&&{...manual},event:active?.label||null,queued:requested,staging:!!active?.staging,seconds:active?.t||0,duration:active?.seconds||0,participants:active?.cast.size||0,
      camera,phase,lastFinished,lastStop,lastEventStop:lastEventStop&&{...lastEventStop},nextIn:enabled&&(requested||timed)?Math.max(0,(requested||smallQueue.length?retryAt:Math.max(retryAt,Math.min(next,smallEvents.length?nextSmall:Infinity)))-performance.now())/1000:null})};
}
