import {beginGuestTravel} from '../guest-travel.js';

// All drawing coordinates are local to a prop's foot on the 1920 × 1080 world.
export const ink='#211723', brass='#c49a62', paper='#f4dcb1', rose='#ff94ac', ice='#a2f6eb';
export const mix=(a,b,p)=>a+(b-a)*p;
export const ramp=(t,a,b)=>Math.min(1,Math.max(0,(t-a)/(b-a)));
export const ease=p=>p*p*(3-2*p);
export const beat=(t,a,b)=>Math.sin(Math.PI*ramp(t,a,b));
export const f=n=>Number(n.toFixed(2));
export function attrs(el,values){for(const [key,v] of Object.entries(values))el.setAttribute(key,String(v));return el;}
export function node(parent,tag,values={}){
  const el=document.createElementNS('http://www.w3.org/2000/svg',tag);
  attrs(el,values);parent.append(el);return el;
}
export const group=(parent,values)=>node(parent,'g',values);
export const path=(parent,d,fill,more={})=>node(parent,'path',{d,fill,...more});
export const rect=(parent,x,y,width,height,fill,more={})=>node(parent,'rect',{x,y,width,height,fill,...more});
export const ellipse=(parent,cx,cy,rx,ry,fill,more={})=>node(parent,'ellipse',{cx,cy,rx,ry,fill,...more});
export function place(el,x,y,angle=0,sx=1,sy=sx){
  el.setAttribute('transform',`translate(${f(x)} ${f(y)}) rotate(${f(angle)}) scale(${f(sx)} ${f(sy)})`);
}
export function type(parent,x,y,text,size,color,weight='bold'){
  const el=node(parent,'text',{x,y,fill:color,'font-family':'Arial, sans-serif','font-size':size,'font-weight':weight,'text-anchor':'middle'});
  el.textContent=text;return el;
}
let sequence=0;
export function def(parent,tag,suffix,values={}){
  const id='lobby-incident-'+suffix+'-'+(++sequence);
  const el=node(node(parent,'defs'),tag,{id,...values});
  return {el,url:'url(#'+id+')'};
}
export function gradient(parent,colors,radial=false){
  const {el,url}=def(parent,radial?'radialGradient':'linearGradient','paint',radial?{}:{x1:0,y1:0,x2:0,y2:'100%'});
  for(const [offset,color,opacity=1] of colors)node(el,'stop',{offset,'stop-color':color,'stop-opacity':opacity});
  return url;
}
export function via(points,p){
  const lengths=points.slice(1).map(([x,y],i)=>Math.hypot(x-points[i][0],y-points[i][1]));
  let remain=lengths.reduce((a,b)=>a+b,0)*Math.min(1,Math.max(0,p));
  for(let i=0;i<lengths.length;i++){
    if(remain<=lengths[i]||i===lengths.length-1){
      const part=lengths[i]?remain/lengths[i]:0;
      return [mix(points[i][0],points[i+1][0],part),mix(points[i][1],points[i+1][1],part)];
    }
    remain-=lengths[i];
  }
  return points[0];
}
// Preserve real emote sprite CSS, animation frames and text fallbacks in a prop-local miniature.
export function likeness(parent,walker,x,y,height=38,still=false){
  const g=group(parent);
  if(!walker?.em)return g;
  const copy=walker.em.cloneNode(true);
  const h=parseFloat(copy.style.height)||50,w=Number(copy.dataset.w)||h;
  const tile=node(g,'foreignObject',{x:-w/2,y:-h,width:w,height:h});
  Object.assign(copy.style,{display:'block',position:'relative',left:'0',top:'0',bottom:'auto'});
  tile.append(copy);
  if(still&&copy.getAnimations){
    const source=walker.em.getAnimations({subtree:true});
    copy.getAnimations({subtree:true}).forEach((anim,i)=>{
      anim.pause();
      if(source[i]?.currentTime!=null)anim.currentTime=source[i].currentTime;
    });
  }
  place(g,x,y,0,height/h);
  return g;
}
export function shadow(root,x,y,rx,ry){
  return ellipse(root,x,y,rx,ry,'#100e1c',{opacity:.42});
}
export const anchor={
  // The street canopy occupies world x=717..1071. The right service aisle lets
  // the audience follow a length of paper or a falling standee all the way down.
  tickets:a=>a.counter?[a.counter[0]+2.05,a.counter[1]+.35]:[10.25,5.4],
  floor:a=>a.counter?[a.counter[0]-1.1,a.counter[1]+.28]:null,
  arcade:a=>a.claw?[a.claw[0]-.35,a.claw[1]-.15]:null,
  door:a=>a.infinityDoor?.floor,
  poster:a=>a.counter?[a.counter[0]+1.6,a.counter[1]+.13]:[9.8,5.18],
  curb:()=>[7.55,10.1],
  entrance:()=>[9.55,9.56],
  marquee:a=>String(a.marqueeText??'').trim()?[8.05,10.6]:null,
};

// The room walks the cast to their marks before the story clock starts.
export function incident(duration,minCast,maxCast,anchorFn,build){
  return {walksToMark:true,duration,minCast,maxCast,anchor:anchorFn,start(ctx){
    const {root,center,cast,project}=ctx;
    const actors=[...cast.keys()];
    const baseZ=Number(root.style.zIndex)||3000;
    const scene=group(root);
    const story=build({...ctx,scene,actors});
    const slots=story.slots;
    const zoom=story.zoom??1.42;
    let travel;
    if (!story.pose) {
      const targets=actors.map((_,i)=>{
        const [dx,dy]=slots[i];
        return [ctx.floor[0]+dx/120+dy/60,ctx.floor[1]-dx/120+dy/60];
      });
      const cues=(story.walks??[]).map(({at,slot,offset:[dx,dy]})=>({
        at,slot,offset:[dx/120+dy/60,-dx/120+dy/60]
      }));
      travel=beginGuestTravel(cast,targets,ctx.anchors,cues);
      if(!travel){story.dispose?.();return null;}
      travel.marks.forEach((mark,i)=>{
        const [x,y]=project(...mark);
        slots[i]=[x-center[0],y-center[1]];
      });
    }
    let reveal=0,approachGain=0;
    const focus=gain=>gain>.01?{x:center[0],y:center[1]-(story.focusY??30),z:1+(zoom-1)*gain}:null;
    return {
      gather(t,reduced){
        if(!story.showWhileApproaching)return;
        reveal=ramp(t,0,.35);scene.setAttribute('opacity',f(reveal));
        story.paint(0,reduced);
        if(reduced)return;
        const farthest=Math.max(...actors.map((w,i)=>Math.hypot(w.u-travel.marks[i][0],w.v-travel.marks[i][1])));
        approachGain=Math.max(approachGain,.46*ease(ramp(t,0,2))*(1-ramp(farthest,.65,3.3)));
      },
      approachCamera:()=>focus(approachGain),
      paint(t,reduced){
        travel?.setTime(t);
        scene.setAttribute('opacity',f(Math.max(reveal,ramp(t,0,.35))*(1-ramp(t,duration-.65,duration))));
        story.paint(t,reduced);
      },
      valid:onFoot=>(!travel || travel.valid() && actors.every(onFoot)) && (!story.valid || story.valid(onFoot)),
      ready:travel?.ready ?? story.ready,
      hold:story.hold,
      actionBounds:story.actionBounds,
      dispose(){travel?.release();story.dispose?.();},
      camera(t,reduced){
        if(reduced||!zoom)return null;
        const gain=mix(approachGain,1,ease(ramp(t,0,2)))*(1-ease(ramp(t,duration-1.8,duration)));
        return focus(gain);
      },
      pose(w,x,y,t,reduced){
        if(story.pose)return story.pose(w,x,y,t,reduced);
        const i=cast.get(w);
        if(i===undefined||i>=slots.length)return;
        if(!travel?.ready())return;
        const gesture=story.act?.(i,t,reduced)||{};
        const weight=ease(ramp(t,0,.3))*(1-ease(ramp(t,duration-.8,duration)));
        return {x:x+(gesture.dx||0)*weight,y:y+(gesture.dy||0)*weight,
          tilt:(gesture.tilt||0)*weight*(reduced ? .35 : 1),
          lift:(gesture.lift||0)*weight*(reduced&&!gesture.onPlatform ? .32 : 1),
          z:gesture.zOffset===undefined ? undefined : baseZ+gesture.zOffset+1,
          ...(gesture.scale!==undefined?{scale:mix(1,gesture.scale,weight)}:{})};
      }
    };
  }};
}
