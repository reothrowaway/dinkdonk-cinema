const NS = 'http://www.w3.org/2000/svg';
const clamp = x => Math.max(0, Math.min(1, x));
const pulse = (t, start, width) => Math.sin(Math.PI * clamp((t-start)/width));
const colors = ['#65ffef', '#ff72c7', '#ffc86c', '#afb0ff'];
const durations = {'laser-choir':14, 'prism-cathedral':10, 'ribbon-plotter':12};
const ids = Object.keys(durations);
function attr(el, props) {
  for (const [key,value] of Object.entries(props)) el.setAttribute(key, value);
  return el;
}
function svg(root, tag, props = {}) {
  const el = attr(document.createElementNS(NS,tag), props);
  root.append(el);
  return el;
}
function overlay(root, width, height) {
  const el = svg(root,'svg',{viewBox:'0 0 '+width+' '+height, 'data-preshow-event':''});
  el.style.cssText='position:absolute;inset:0;pointer-events:none;overflow:hidden;width:'+width+'px;height:'+height+'px;z-index:70001';
  return el;
}
function ellipse(root, color) {
  return svg(root,'ellipse',{rx:26,ry:9,fill:color,'fill-opacity':.26,stroke:color,'stroke-width':2});
}
function spotlight(light, p, strength, size = 1) {
  attr(light,{transform:'translate('+p+') scale('+size+')', opacity:strength});
}
function ray(root, col) { return svg(root,'path',{fill:col,stroke:col,'fill-opacity':.12,'stroke-width':1.1}); }
function beam(el, from, to, width, strength) {
  attr(el,{d:'M'+from+'L'+(to[0]-width)+','+to[1]+'Q'+to[0]+','+(to[1]+8)+' '+(to[0]+width)+','+to[1]+'Z',opacity:strength});
}
function cast(host, kind) {
  const byRow=new Map();
  for (const w of host.seated()) {
    const row=w.seat.row;
    if(!byRow.has(row)) byRow.set(row,[]);
    byRow.get(row).push(w);
  }
  // Prefer occupied runs in different rows. A full house can feature different
  // sections each time, with the answer coming from the other end of the bank.
  const ranked = [...byRow.values()].map(row => ({row, weight: Math.min(6,row.length) + Math.random()}));
  ranked.sort((a,b)=>b.weight-a.weight);
  const rows=ranked.slice(0,2).map(({row},index)=>{
    row.sort((a,b)=>a.seat.u-b.seat.u);
    const offset = kind==='laser-choir' ? index : .5;
    const start = Math.max(0, Math.floor((row.length-6)*offset));
    return row.slice(start,start+6);
  });
  if (!rows[0] || rows[0].length<3) return null;
  if (['laser-choir','ribbon-plotter'].includes(kind) && (rows[1]?.length||0)<2) return null;
  return [rows[0],rows[1]||[]];
}
function choir(s) {
  const defs=svg(s.light,'defs');
  const fans=s.rows.map((row,side)=>{
    const ink=colors[side];
    const grad=svg(defs,'radialGradient',{id:'singer-light-'+side});
    for(const [offset,opacity] of [[0,.77],[.45,.5],[1,0]])
      svg(grad,'stop',{offset,'stop-color':ink,'stop-opacity':opacity});
    return row.map((w,i)=>{
      const fan=attr(ray(s.light,ink),{'fill-opacity':.39,'stroke-width':2.3});
      const halo=svg(s.light,'ellipse',{rx:41,ry:40,fill:'url(#singer-light-'+side+')'});
      const pool=attr(ellipse(s.light,ink),{'fill-opacity':.58,'stroke-width':3});
      // The first and last singer send a note up so both ends of the row read in the wide shot.
      const note=(i===0||i===row.length-1) ? svg(s.light,'path',{
        d:'M0 2v-20l13-4v18c0 7-12 10-13 4-1-4 5-7 9-6v-10l-6 2V2c0 8-13 11-14 5-1-4 6-8 11-5Z',
        fill:side?'#ffe0f2':'#d5ffff',stroke:ink,'stroke-width':1.5
      }):null;
      return {w,fan,halo,pool,note};
    });
  });
  return t=>{
    fans.forEach((row,side)=>row.forEach(({w,fan,halo,pool,note},i)=>{
      const delay=i*.13;
      const beats=side===0?[.35,4.5,10.05]:[2.4,6.85,10.05];
      if (s.encore) beats.push(13.65);
      const elapsed=t-beats.filter(b=>b+delay<=t).at(-1)-delay;
      const a=Number.isFinite(elapsed)?elapsed:-1;
      const light=clamp(a/.19)*clamp((1.52-a)/.52)*s.fade;
      const kick=pulse(a,0,1.12)*s.fade;
      const p=s.point(w);
      beam(fan,s.apex,[p[0],p[1]-8],25,light);
      spotlight(halo,[p[0],p[1]-22-kick*16],.8*light);
      spotlight(pool,p,light,1.20+kick*.30);
      s.pose(w,29*kick,(side?1:-1)*8*kick);
      if(note)attr(note,{opacity:light,transform:'translate('+(p[0]+14)+' '+(p[1]-42-clamp(a)*25)+') scale(1.25)'});
    }));
  };
}
function prism(s) {
  const [tl,,br]=s.screen;
  const end=[(tl[0]+br[0])/2,(tl[1]+br[1])/2];
  const hub=s.apex.map((v,i)=>v+(end[i]-v)*.48);
  const incoming=ray(s.light,'#fff4c9');
  const picks=[s.rows[0][0],s.rows[0].at(-1),...(s.rows[1].length?[s.rows[1][0],s.rows[1].at(-1)]:[s.rows[0][1]])];
  const focus=picks.reduce((a,b)=>a.seat.v<b.seat.v?a:b);
  const pools=picks.map((w,i)=>({w,beam:ray(s.light,colors[i]),pool:ellipse(s.light,colors[i])}));
  const chain=svg(s.light,'path',{stroke:'#f5deab','stroke-width':2});
  const glass=svg(s.light,'g',{'stroke-linejoin':'round',stroke:'#fffae8','stroke-width':1.8});
  svg(glass,'path',{d:'M-29 9L3 -24L28 14Z',fill:'#7ef9ff','fill-opacity':.8});
  svg(glass,'path',{d:'M3 -24L9 6L28 14Z',fill:'#ed91e9'});
  svg(glass,'path',{d:'M-29 9L9 6L3 -24',fill:'none'});
  return t=>{
    const reveal=clamp(t/.9)*clamp((10-t)/1.3), swing=s.reduced?0:Math.sin(t*1.9)*11*Math.exp(-t*.18);
    const p=[hub[0]+swing,hub[1]-100*(1-reveal)];
    attr(glass,{transform:'translate('+p+') rotate('+swing+')',opacity:reveal});
    attr(chain,{d:'M'+hub[0]+','+(hub[1]-90)+'L'+p[0]+','+(p[1]-20),opacity:reveal});
    beam(incoming,s.apex,p,8,reveal*.85);
    const merge=clamp((t-6.1)/1.65);
    pools.forEach(({w,beam:light,pool},i)=>{
      const home=s.point(w), target=s.point(focus), point=home.map((v,j)=>v+(target[j]-v)*merge);
      const power=clamp((t-.85-i*.29)*1.8)*reveal;
      beam(light,p,point,19,power*.95); spotlight(pool,point,power,1.05+.32*merge);
      const lean=pulse(t,1.2+i*.3,4.5);
      s.pose(w,5*lean,w===focus?11*lean+12*pulse(t,7.15,1.65):-9*lean);
    });
  };
}
function plotter(s) {
  const panel=s.panel();
  svg(panel,'rect',{width:960,height:540,fill:'#101d30'});
  const grid=Array.from({length:23},(_,i)=>'M'+(i*44)+' 0V540').concat(Array.from({length:13},(_,i)=>'M0 '+(i*45)+'H960')).join('');
  svg(panel,'path',{d:grid,stroke:'#377f87','stroke-width':1.7,opacity:.7});
  svg(panel,'path',{d:'M0 288H960',stroke:'#89cec8','stroke-width':2});
  const trace=svg(panel,'path',{fill:'none',stroke:'#87fff5','stroke-width':7,'stroke-linejoin':'round'});
  const tip=svg(panel,'circle',{r:10,fill:'#fff3b5'});
  const lamps=[...s.rows[0],...s.rows[1]].map(w=>({w,pool:ellipse(s.light,'#87fff5')}));
  const start=lamps.map((_,i)=>i===lamps.length-1?8.75:i<s.rows[0].length?1.12+i*.29:4.2+(i-s.rows[0].length)*.29);
  const samples=[];
  return t=>{
    const x=42+860*clamp(t/10.7);
    let peak=0;
    lamps.forEach(({w,pool},i)=>{
      const k=pulse(t,start[i],i===lamps.length-1 ? .95 : .8);
      peak+=k;
      s.pose(w,32*k,-5*k,1+.08*k); spotlight(pool,s.point(w),k);
    });
    const y=288-Math.min(195,peak*(t>8?160:73));
    if (!samples.length || x>samples.at(-1)[0]+2) samples.push([+x.toFixed(1),+y.toFixed(1)]);
    attr(trace,{d:'M'+samples.join('L')+'L'+x+','+y});attr(tip,{cx:x,cy:y});
    panel.style.opacity=String(s.fade);
  };
}
const build={'laser-choir':choir,'prism-cathedral':prism,'ribbon-plotter':plotter};

export function createHouseEvents(host, query, { allowed = ids, automatic = query.get('events') === '1' } = {}) {
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let live=null, reason='', pending=allowed.includes(query.get('event'))?query.get('event'):null;
  let sourceVisible=true, sourceActive=true;
  const next=()=>performance.now()+180000+Math.random()*180000;
  let due=pending?performance.now()+2200:next();
  function stop(why='stopped') {
    if(live){ live.light.ownerSVGElement.remove(); live.screenLayer?.remove(); live.poses.clear(); live=null; reason=why; }
    due=next();
  }
  function play(kind) {
    if(live||!allowed.includes(kind)||!host.ready()||document.hidden||!sourceVisible||!sourceActive)return false;
    const rows=cast(host,kind); if(!rows)return false;
    const screen=host.screen();
    const layer=overlay(document.getElementById('cam'),1920,1080);
    const defs=svg(layer,'defs'),clip=svg(defs,'clipPath',{id:'house-light-mask'});
    svg(clip,'path',{d:'M0 0H1920V1080H0Z M'+screen.join('L')+'Z','clip-rule':'evenodd'});
    const light=svg(layer,'g',{'clip-path':'url(#house-light-mask)'});
    const s={kind, rows,screen,light,apex:host.apex(),point:host.point,
      at:performance.now(),t:0,fade:0,encore:false,poses:new Map(),reduced:motion.matches,
      panel:()=>s.screenLayer=overlay(document.getElementById('preshow'),960,540),
      pose(w,lift,tilt,sq=1){ const k=s.reduced ? .37 : 1; s.poses.set(w,{lift:lift*k,tilt:tilt*k,sq:1+(sq-1)*k}); }};
    live=s;
    try{s.render=build[kind](s);s.render(0);}catch(e){stop('error');throw e;}
    pending=null;return true;
  }
  function step(now) {
    if(!live){
      if((pending||automatic)&&now>=due){
        if(!play(pending||'laser-choir'))due=now+5000;
      }
      return;
    }
    const s=live;
    if(!host.ready()||s.rows.some(row=>row.some(w=>!host.active(w)))){stop('interrupted');return;}
    const t=Math.max(0,(now-s.at)/1000), duration=durations[s.kind]+(s.encore?2:0);
    if(t>=duration){stop('complete');return;}
    s.t=t; s.fade=clamp(t/.42)*clamp((duration-t)/.65);
    s.render(t);
  }
  const interrupt=()=>{if(live)stop('interrupted');};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)interrupt();});
  window.addEventListener('pagehide',interrupt);
  window.addEventListener('obsSourceVisibleChanged',e=>{sourceVisible=e.detail?.visible!==false;if(!sourceVisible)interrupt();});
  window.addEventListener('obsSourceActiveChanged',e=>{sourceActive=e.detail?.active!==false;if(!sourceActive)interrupt();});
  return {play,step,stop,interrupt,playing:()=>!!live,pose:w=>live?.poses.get(w),
    message(m){if(live?.kind==='laser-choir'&&live.t>10&&live.t<13.5&&m?.nick)live.encore=true;},
    status:()=>({event:live?.kind||null,seconds:live?.t||0,cast:live?.rows.map(row=>row.map(w=>w.nick))||[],
      encore:!!live?.encore,reduced:!!live?.reduced,lastStop:reason})};
}
