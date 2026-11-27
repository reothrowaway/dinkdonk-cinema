import {anchor,attrs,beat,brass,def,ease,ellipse,f,gradient,group,ice,incident,ink,likeness,mix,node,paper,path,place,ramp,rect,rose,type,via} from './stage.js';

function puddle(scene,rx,ry){
  const silhouette=`M${-rx} -2Q${-rx*.96} ${-ry*1.18} -15 ${-ry*.83}T${rx} -1 Q${rx*.8} ${ry*.55} 40 ${ry*.7}T-46 ${ry*.84}Q${-rx*.83} ${ry*.5} ${-rx} -2Z`;
  const edge=def(scene,'clipPath','puddle');
  path(edge.el,silhouette,'#fff');
  path(scene,silhouette,gradient(scene,[[0,'#a8d8df',.43],[.32,'#938dad',.62],[.52,'#171e3b',.85],[.79,'#78778f',.55],[1,'#d2e4d7',.62]]),{stroke:'#accaeb','stroke-width':1.3});
  return group(scene,{'clip-path':edge.url});
}
function ripple(root){return ellipse(root,0,0,1,1,'none',{stroke:ice,'stroke-width':1.6});}
function wave(el,t,start,life,x,y,radius){
  const p=ramp(t,start,start+life);
  attrs(el,{cx:x,cy:y,rx:f(.2+radius*p),ry:f(.2+radius*p*.25),opacity:f(Math.sin(Math.PI*p)*.75)});
}
const victoryLetters=Array.from('PEPEWINS');

// A sign belongs to its carrier's body, so walk cycles, occlusion, camera moves and
// cleanup all follow the same real figure. The face rotates edge-on as it is stowed.
function victorySign(w,ch,i){
  const layer=node(w.bod,'svg',{width:1,height:1,'aria-hidden':'true','data-glyph-carrier':ch});
  layer.style.cssText='position:absolute;left:0;top:0;overflow:visible;pointer-events:none;visibility:hidden';
  w.bod.insertBefore(layer,w.em);
  const swing=group(layer);
  const board=group(swing,{'data-marquee-letter':ch});
  rect(board,-2.5,-19,5,23,'#765743',{rx:1,stroke:'#432d30','stroke-width':1});
  rect(board,-24,-62,48,48,'#654b47',{rx:3});
  rect(board,-25,-64,48,48,'#fff2c6',{rx:2,stroke:'#50394a','stroke-width':2});
  rect(board,-20,-22,38,2,i<4?'#a64b76':'#377e74');
  type(board,-1,-26,ch,40,'#342739','900');
  const side=i%2?-1:1;
  const height=parseFloat(w.em.style.height)||44;
  const width=Number(w.em.dataset.w)||40;
  const shoulder=Math.min(18,width*.36);
  let canopy=null;
  return {layer,dispose(){canopy?.cancel();delete w.bod.dataset.glyphBusy;layer.remove();},paint(t,reduced){
    const folded=ease(ramp(t,.05,.88))*(1-ease(ramp(t,12.9,13.55)));
    if(!canopy&&folded>0&&w.umb){
      canopy=w.umb.animate([
        {scale:'1 1',translate:'0 0',opacity:1},
        {scale:'.15 .65',translate:'0 18px',opacity:1,offset:.64},
        {scale:'.09 .48',translate:'0 23px',opacity:0}
      ],{duration:1000,fill:'both'});
      canopy.pause();
    }
    if(canopy)canopy.currentTime=1000*folded;
    if(folded>.5)w.bod.dataset.glyphBusy='';else delete w.bod.dataset.glyphBusy;
    const pull=ease(ramp(t,.55+i*.12,2.05+i*.12));
    const lower=ease(ramp(t,10.1+i*.11,12.15+i*.11));
    const raised=pull*(1-lower);
    layer.style.visibility=raised>.015?'visible':'hidden';
    if(raised<=.015)return null;
    const sway=(reduced?0:2.4*Math.sin(t*2.2+i*.45))*ramp(raised,.82,1);
    const x=side*mix(-shoulder*.5,4,raised)+side*shoulder*Math.sin(Math.PI*raised);
    const y=mix(-height*.23,-height+7,raised);
    const angle=side*mix(69,0,raised)+sway;
    const face=mix(.08,1,raised);
    place(swing,x,y,angle);
    place(board,0,0,0,face,1);
    return [x,y];
  }};
}
export const sidewalk={
  'mercury-bath':incident(11,1,1,anchor.curb,({scene,actors,center,project})=>{
    const surface=puddle(scene,85,22);
    const reflection=group(surface);
    const ghost=group(reflection,{style:'filter:saturate(.55) brightness(1.45)'});
    likeness(ghost,actors[0],0,0,44);
    const rings=[ripple(surface),ripple(surface)];
    const bead=ellipse(scene,-36,-91,4.8,6,gradient(scene,[[0,'#fff'],[.39,'#bfdde6'],[.60,'#54566b'],[1,'#f7b6c5']]),{stroke:'#c8ecf1','stroke-width':.75});
    return {slots:[[-48,-11]],walks:[{at:2.2,slot:0,offset:[40,0]}],paint(t){
      const drop=ease(ramp(t,.6,2.0));
      attrs(bead,{cx:f(-44+8*drop),cy:f(-96+96*drop),opacity:1-ramp(t,2.0,2.2)});
      const extra=ease(ramp(t,4.5,6.0)),back=ease(ramp(t,7.1,8.7));
      const gx=project(actors[0].u,actors[0].v)[0]-center[0]+34*extra*(1-back);
      transformReflection(reflection,gx,-8, .60, .62);
      wave(rings[0],t,2,2.9,-36,0,45);wave(rings[1],t,8.4,2,-8,0,58);
    },act(i,t){return {tilt:14*beat(t,5.0,7.6),lift:3*beat(t,7.2,8.4)};}};
  }),
  'tidal-glass':incident(11,1,2,anchor.entrance,({scene,actors})=>{
    const surface=puddle(scene,115,30);
    const crests=[];
    for(let i=0;i<3;i++)crests.push(path(surface,'M-32 -12q20 -7 42 1t36 4q-18 -2-34 0t-44 -5Z',i===1?'#73e7eb':'#c4dfe7'));
    const cup=group(scene);
    path(cup,'M-6 -15L6 -15 4 0-4 0Z','#edc6ae',{stroke:ink,'stroke-width':1});
    rect(cup,-6,-12,12,3,'#ad4f66');ellipse(cup,0,-15,6.5,2,'#fbdbab');
    const slots=actors.length===1?[[-60,3]]:[[-60,3],[66,-10]];
    return {slots,walks:[{at:2.9,slot:0,offset:[103,0]}],paint(t){
      crests.forEach((g,i)=>{
        const p=ramp(t,.8+i*1.8,5+i*1.8);place(g,-122+249*p,2+i*4);attrs(g,{opacity:f(.88*Math.sin(p*Math.PI))});
      });
      const float=beat(t,1.4,4.9),settle=beat(t,5.7,8.6);
      place(cup,-35+46*ease(ramp(t,1.5,6.6)),8-11*float-4*settle,-33*(1-ramp(t,4.8,8.5))+23*float);
    },act(i,t){return i===0?{lift:14*beat(t,2.9,6.9),tilt:-17*beat(t,2.9,6.9)+9*beat(t,6.9,8.4)}:{tilt:-12*beat(t,3.2,7.8)};}};
  }),
  'horizon-drive':incident(12,1,3,anchor.curb,({scene,actors,root,world,project,center})=>{
    const pool=group(scene);
    const sunset=puddle(pool,163,54);
    rect(sunset,-170,-56,340,114,gradient(scene,[[0,'#35214e'],[.34,'#cf7199'],[.48,'#955394'],[1,'#262140']]));
    ellipse(sunset,-35,-23,35,29,'#ffb276');
    for(let i=0;i<5;i++)rect(sunset,-73,-33+i*6,76,1.4+i*.45,'#ab5784');
    const vanishing=[-34,-9];
    for(let i=-7;i<=7;i++)path(sunset,`M-34 -9L${i*55} 59`,'none',{stroke:'#f095c4','stroke-width':1.4});
    const bars=Array.from({length:7},()=>path(sunset,'','none',{stroke:'#bc95d4','stroke-width':1.3}));
    const rings=[ripple(scene),ripple(scene)];

    // The coupe travels continuously from inside the reflection to the near (+u) traffic lane.
    // A separate depth-sorted layer lets real vehicles pass in front of or behind it on the street.
    const laneAt=u=>{const [x,y]=project(u,11);return [x-center[0],y-center[1]];};
    const merge=laneAt(8.7),exit=laneAt(19);
    const layer=node(world,'svg',{width:2,height:2,'aria-hidden':'true','data-horizon-car':''});
    layer.style.cssText=root.style.cssText;
    const baseDepth=Number(root.style.zIndex);
    const car=group(layer);
    ellipse(car,-3,5,66,12,'#35223e',{transform:'rotate(22)',opacity:.55});
    path(car,'M-61 -15L37 25 70 11 52 22 22 30-68 -9Z','#5edcd6',{opacity:.5});
    path(car,'M-74 -28L-40 -42-21 -41-7 -55 19 -46 31 -28 69 -11 81 2 79 12 43 27-72 -14Z',
      gradient(layer,[[0,'#f08ebc'],[.45,'#a14f81'],[.67,'#e996aa'],[1,'#34283e']]),{stroke:'#332637','stroke-width':2.4});
    path(car,'M-69 -27L-39 -38-18 -31-46 -21Z','#8e4e78');
    path(car,'M-44 -21L-24 -40-7 -52 17 -44 31 -26 5 -16Z','#5d5379',{stroke:'#fbc5cf','stroke-width':1.4});
    path(car,'M-38 -24L-23 -38-9 -33-2 -20Z','#342d56');
    path(car,'M-5 -34L-5 -50 15 -43 26 -28 4 -19Z','#88c2d1');
    path(car,'M8 -16L33 -26 67 -10 75 -1 44 12Z','#ee97ae',{stroke:'#f7b4c8','stroke-width':1});
    path(car,'M-72 -23L43 18 78 4 78 12 43 27-71 -14Z','#382d43');
    path(car,'M-70 -23L41 16 77 2','none',{stroke:'#75fae7','stroke-width':2.6});
    for(const [x,y] of [[-52,-9],[24,19]]){
      ellipse(car,x,y,9,10,'#262132',{stroke:'#ab8fa0','stroke-width':1.8});
      ellipse(car,x,y,4.2,5,'#8eb0bb');
    }
    for(const x of [46,66]){
      const y=10-(x-46)*.4;
      path(car,`M${x} ${y}l9 -3.7v4.5l-9 3.7Z`,'#fff5c9');
    }
    const slots=[[-112,-55],[99,20],[149,45]].slice(0,actors.length);
    return {slots,zoom:1.66,focusY:7,dispose:()=>layer.remove(),paint(t,reduced){
      const appear=ease(ramp(t,.25,1.65))*(1-ease(ramp(t,8.1,10.45)));
      attrs(pool,{opacity:f(appear)});
      bars.forEach((bar,i)=>{
        const p=((i/7+(reduced?0:t*.13))%1)**2;
        attrs(bar,{d:`M-165 ${f(-9+68*p)}H165`,opacity:f(.32+p*.62)});
      });
      const approach=ramp(t,2,5.8)**1.65, turn=ease(ramp(t,5.8,7.3)), drive=ramp(t,7.3,11.8)**1.55;
      const x=mix(mix(mix(vanishing[0],-20,approach),merge[0],turn),exit[0],drive);
      const y=mix(mix(mix(vanishing[1],34,approach),merge[1],turn),exit[1],drive);
      const size=mix(mix(.12,.87,approach),1.02,turn);
      const hop=reduced?0:9*beat(t,5.45,6.55);
      place(car,x,y-hop,16*(1-turn),size);
      attrs(car,{opacity:f(ramp(t,1.85,2.5)*(1-ramp(t,11.5,11.9)))});
      layer.style.zIndex=String(Math.round(baseDepth+y*100/30));
      wave(rings[0],t,5.42,1.45,-20,29,reduced?32:66);
      wave(rings[1],t,5.75,1.4,-20,31,reduced?25:47);
    },act(i,t,reduced){
      const toward=i===0?1:-1, flinch=beat(t,5.28+i*.12,6.75+i*.12);
      const watch=beat(t,2.4,5.4);
      return {dx:-toward*flinch*(reduced?5:21),dy:-flinch*5,lift:flinch*13,
        tilt:toward*(10*watch-24*flinch)+9*beat(t,7,9.8)};
    }};
  }),
  'glyph-cascade':incident(13.6,8,8,()=>[8.05,10.6],({scene,actors})=>{
    node(scene,'style').textContent='[data-glyph-busy] > .umbio {visibility:hidden}';
    const signs=actors.map((w,i)=>victorySign(w,victoryLetters[i],i));
    // This diagonal follows the pavement between the road and the glass. The
    // extra gap after the fourth carrier separates the two words.
    const slots=actors.map((_,i)=>{
      const du=(i-3.5)*.91+(i<4?-.26:.26),dv=(3.5-i)*.10;
      return [(du-dv)*60,(du+dv)*30];
    });
    let cardBounds=null;
    return {slots,focusY:58,zoom:1.75,actionBounds:()=>cardBounds,
      valid:onFoot=>actors.every(w=>onFoot(w)&&w.bod.isConnected),
      dispose(){for(const sign of signs)sign.dispose();},
      paint(t,reduced){
        cardBounds=null;
        signs.forEach((sign,i)=>{
          const grip=sign.paint(t,reduced);
          if(!grip)return;
          const x=slots[i][0]+grip[0],y=slots[i][1]+grip[1];
          const padding=13;
          if(!cardBounds)cardBounds=[Infinity,Infinity,-Infinity,-Infinity];
          cardBounds[0]=Math.min(cardBounds[0],x-70-padding);
          cardBounds[1]=Math.min(cardBounds[1],y-70-padding);
          cardBounds[2]=Math.max(cardBounds[2],x+70+padding);
          cardBounds[3]=Math.max(cardBounds[3],y+padding);
        });
      },
      act(i,t,reduced){
        const side=i%2?-1:1,pull=beat(t,.55+i*.12,2.05+i*.12),stow=beat(t,10.1+i*.11,12.15+i*.11);
        return {tilt:side*(reduced?2:6)*(pull-stow),lift:(reduced?1:3)*pull};
      }
    };
  }),
};
function transformReflection(el,x,y,scaleX,scaleY){
  el.setAttribute('transform',`translate(${f(x)} ${f(y)}) scale(${scaleX} ${-scaleY})`);
}
