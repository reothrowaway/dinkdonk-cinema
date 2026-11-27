import {anchor,attrs,beat,brass,def,ease,ellipse,f,gradient,group,ice,incident,ink,likeness,mix,node,paper,path,place,ramp,rect,rose,shadow,type,via} from './stage.js';

export const arcade={
  'pin-matrix':incident(9,1,2,anchor.arcade,({scene,actors})=>{
    const slots=[[-43,5],[43,11]];
    shadow(scene,0,4,43,9);
    for(const x of [-22,22])rect(scene,x,-21,4,23,brass);
    rect(scene,-38,-75,76,60,ink,{rx:4,stroke:brass,'stroke-width':3});
    const pins=def(scene,'pattern','pins',{width:3.6,height:3.6,patternUnits:'userSpaceOnUse'});
    ellipse(pins.el,1.8,1.8,1.22,1.22,'white');
    const mask=def(scene,'mask','pin-heads',{maskUnits:'userSpaceOnUse',x:-36,y:-72,width:72,height:52});
    rect(mask.el,-36,-72,72,52,pins.url);
    rect(scene,-34,-71,68,50,'#393041');
    rect(scene,-34,-71,68,50,pins.url,{opacity:.18});
    const matrix=group(scene,{mask:mask.url});
    const impressions=[actors[0],actors[1]||actors[0]].map((a,i)=>{
      const plate=group(matrix);
      likeness(plate,a,0,-23,44);
      plate.style.filter=i?'grayscale(1) sepia(1) saturate(4) hue-rotate(130deg) brightness(1.7)':'grayscale(1) sepia(1) saturate(3) brightness(1.8)';
      return plate;
    });
    type(scene,0,-8,'PIN ART',7,paper);
    return {slots,paint(t){
      const push=ease(ramp(t,2,3.3)),reverse=ease(ramp(t,4.7,5.8)),settle=1-ease(ramp(t,7,8.2));
      impressions.forEach((p,i)=>{
        attrs(p,{opacity:(i?reverse:push*(1-reverse))*settle});
        place(p,(i?1:-1)*(1-(i?reverse:push))*10,0,0,i?-1:1,1);
      });
    },act(i,t){const press=i?beat(t,4,6.3):beat(t,1.6,4.0),recoil=i?0:beat(t,5.2,6.7);
      return {dx:(i?-1:1)*press*19-recoil*13,tilt:(i?-1:1)*press*15-recoil*16,lift:recoil*7};}};
  }),
  'contact-printer':incident(15,2,2,anchor.tickets,({scene,actors})=>{
    const slots=[[-23,5],[22,4]];
    shadow(scene,-1,5,56,10);
    const metal=gradient(scene,[['0%','#b8a899'],['40%','#644d53'],['100%','#372d42']]);
    path(scene,'M-49 1V-98h100v99h-9v-85h-81v85Z',metal,{stroke:brass,'stroke-width':2});
    rect(scene,-48,-104,99,17,ink,{rx:3,stroke:brass});
    type(scene,1,-92,'FOTO • 3 POSES',9,paper);
    const curtain=group(scene);
    for(let i=0;i<9;i++)path(curtain,`M${-40+i*9} -83h10v70q-5 4-10 0Z`,i%2?'#74394f':'#99526a',{stroke:'#552c49','stroke-width':.8});
    const lamp=rect(scene,-39,-82,80,67,paper,{opacity:0});
    const strip=group(scene);
    rect(strip,0,0,32,76,paper,{rx:1,stroke:'#68505c'});
    const panels=[],captured=new Set();
    for(let i=0;i<3;i++){
      const panel=group(strip);
      rect(panel,2,2+i*23,28,21,['#4c5064','#804957','#4f5369'][i]);
      panels.push(panel);
    }
    type(strip,16,74,'FOTO',4,ink);
    rect(scene,40,-49,18,29,ink,{stroke:brass,rx:2});
    path(scene,'M43 -33h12','none',{stroke:paper,'stroke-width':2});
    return {slots,showWhileApproaching:true,focusY:42,zoom:1.9,paint(t,reduced){
      const closed=ease(ramp(t,2,3.1))*(1-ease(ramp(t,9.6,10.7)));
      attrs(curtain,{transform:`translate(-40 0) scale(${f(.12+.88*closed)} 1) translate(40 0)`});
      const exposure=[3.6,5.9,8.2].reduce((sum,start)=>sum+beat(t,start,start+.8),0);
      attrs(lamp,{opacity:exposure*(reduced ? .05 : .24)*closed});
      const print=ease(ramp(t,9,11.8));
      place(strip,48,-34+3*print,4,1,.03+.97*print);
      attrs(strip,{opacity:print*(1-ease(ramp(t,13.4,14.4)))});
      panels.forEach((panel,i)=>{
        if(t<3.9+i*2.3||captured.has(i))return;
        captured.add(i);
        actors.forEach((a,j)=>{
          if(a.removing||a.gone)return;
          const pose=group(panel);
          place(pose,9+j*13,22+i*23,(j?-1:1)*[10,-12,17][i]);
          likeness(pose,a,0,0,16,true);
        });
      });
    },act(i,t){return {tilt:(i?-1:1)*(10*beat(t,3.1,4.6)-12*beat(t,5.3,6.8)+17*beat(t,7.6,9.1))-(i?14*beat(t,10.3,14.2):0),dx:(i?1:-1)*25*ease(ramp(t,10.2+i*.4,12.1+i*.4)),zOffset:-2};}};
  }),
  'scanline-elevator':incident(9,1,2,anchor.floor,({scene,actors})=>{
    const slots=actors.map((_,i)=>[-13+i*32,0+i*5]);
    const platform=group(scene);
    const slab='M-48 -2l49-15 49 15-49 17Z';
    shadow(scene,0,2,55,13);
    const shaft=path(scene,'','rgba(54,35,67,.83)',{stroke:'#a8859d'});
    path(platform,slab,'#4d475b',{stroke:ice,'stroke-width':2});
    path(platform,'M-37 -2l38-11 38 11-38 12Z','none',{stroke:'#f4c390','stroke-dasharray':'4 4'});
    for(let i=0;i<3;i++)path(platform,`M${-21+i*15} 1l6-4 6 3`,'none',{stroke:ice,'stroke-width':2});
    const tray=group(scene);
    ellipse(tray,0,0,12,4,brass);
    path(tray,'M-5 -15h9l-1 13h-7Z',rose,{stroke:paper});path(tray,'M0 -14l3-8h4','none',{stroke:ice,'stroke-width':1.7});
    const height=t=>37*ease(ramp(t,2.1,3.7))*(1-ease(ramp(t,6,7.6)));
    return {slots,paint(t){
      const h=height(t);
      place(platform,0,-h);
      attrs(shaft,{d:`M-48 -2v${f(-h)}l49 17 49-17v${f(h)}l-49 17Z`,opacity:.9*ramp(h,0,4)});
      attrs(tray,{opacity:ease(ramp(t,3.3,4.2))*(1-ease(ramp(t,7.3,8.3)))});
      place(tray,mix(-44,slots[0][0]-4,ease(ramp(t,3.5,5.1))),-h-32);
    },act(i,t){return {lift:height(t),onPlatform:true,tilt:(i?1:-1)*6*beat(t,2.1,3.9)};}};
  }),
  'pinball-optics':incident(12,1,3,a=>a.clawBusy?null:anchor.arcade(a),({scene,actors,project,anchors,center})=>{
    const slots=actors.map((_,i)=>[[-27,4],[23,17],[59,-2]][i]);
    const posts=[[-47,-5],[35,-15],[-17,23],[62,8]];
    posts.forEach(([x,y])=>{
      shadow(scene,x,y,7,3);rect(scene,x-3,y-15,6,15,brass);
      ellipse(scene,x,y-15,6,4,'#ffe7be',{stroke:ink});
    });
    const flap=project(anchors.claw[0],anchors.claw[1]-.40,24);
    const hatch=[flap[0]-center[0],flap[1]-center[1]];
    const course=[hatch,[hatch[0],-2],[-45,-9],[33,-19],[-15,18],[60,3],[-8,-2],hatch];
    const chrome=gradient(scene,[['0%','#fff'],['24%','#cff7fa'],['43%','#404155'],['68%','#ad83a2'],['100%','#363345']]);
    const ball=group(scene);
    ellipse(ball,0,0,9,9,chrome,{stroke:'#f2d7c7'});ellipse(ball,-3,-4,2.4,1.7,'white');
    const reflection=shadow(scene,0,0,8,3),spark=path(scene,'M0 -11l2 8 7 3-7 2-2 8-2-8-7-2 7-3Z',paper);
    const resets=[1.3,2.5,3.65,5.25,6.85,8.45,9.85,10.85];
    return {slots,paint(t,reduced){
      let seg=0;
      while(seg<resets.length-2&&t>resets[seg+1])seg++;
      const u=ramp(t,resets[seg],resets[seg+1]),[x,y]=via(course.slice(seg,seg+2),u);
      const hop=reduced?0:5*Math.sin(u*Math.PI);
      place(ball,x,y-hop);
      place(reflection,x,y+7);
      const show=ease(ramp(t,.75,1.3))*(1-ease(ramp(t,10.6,11.3)));
      attrs(ball,{opacity:show});attrs(reflection,{opacity:.4*show});
      const nearest=posts.reduce((best,p)=>Math.hypot(x-p[0],y-p[1])<Math.hypot(x-best[0],y-best[1])?p:best,posts[0]);
      const hit=1-ramp(Math.hypot(x-nearest[0],y-nearest[1]),3,13);
      place(spark,nearest[0],nearest[1]-10,35,.5+hit*.75);attrs(spark,{opacity:hit*(reduced ? .2 : .85)});
    },act(i,t){const start=[3.75,5.5,7.48][i],jump=beat(t,start,start+1.35);return {dx:(i===1?-1:1)*jump*14,tilt:jump*(i===1?-17:17),lift:jump*(i===2?3:15)};}};
  })
};
