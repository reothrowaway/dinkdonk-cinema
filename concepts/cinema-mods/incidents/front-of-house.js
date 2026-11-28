import {anchor,attrs,beat,brass,def,ease,ellipse,f,gradient,group,ice,incident,ink,likeness,mix,node,paper,path,place,ramp,rect,rose,shadow,type,via} from './stage.js';

export const frontOfHouse={
  'thermal-receipt':incident(14,1,3,anchor.tickets,({scene,actors})=>{
    const slots=actors.map((_,i)=>[-5+i*44,6+i*8]);
    const printer=group(scene);
    shadow(printer,-38,1,23,7);
    path(printer,'M-57 -29l37 5v18l-37-5Z','#4a3447',{stroke:brass});
    path(printer,'M-53 -29l9-6 34 4-10 7Z','#957680');
    path(printer,'M-51 -23l25 3','none',{stroke:ink,'stroke-width':4});
    ellipse(printer,-24,-15,2,2,ice);
    const strip=path(scene,'','none',{stroke:paper,'stroke-width':9,'stroke-linecap':'butt','stroke-linejoin':'round'});
    const print=path(scene,'','none',{stroke:'#6c5350','stroke-width':4,'stroke-dasharray':'1 6 1 3'});
    const bundle=group(scene);
    for(let i=0;i<4;i++)path(bundle,`M${-13+i} ${i*2}l23-6 3 5-24 7Z`,i%2?paper:'#c5ab89',{stroke:'#685348','stroke-width':.7});
    const points=[[-39,-21],[-28,-5],...slots.map(([x,y])=>[x+12,y-40]),[slots.at(-1)[0]+43,slots.at(-1)[1]-11]];
    return {slots,paint(t){
      const tear=ease(ramp(t,10.1,11.5)),feed=ease(ramp(t,1.5,9.9));
      const pts=[];
      for(let k=0;k<=36;k++){
        const u=k/36;
        const [x,y]=via(points,u*feed);
        const sag=4*Math.sin(u*3*Math.PI+t*3.2)*Math.sin(u*Math.PI);
        pts.push([mix(x,slots[0][0]+11,tear),mix(y+sag,slots[0][1]-20,tear)]);
      }
      const d=pts.map(([x,y],i)=>(i?'L':'M')+f(x)+' '+f(y)).join(' ');
      attrs(strip,{d,opacity:1-tear});attrs(print,{d,opacity:1-tear});
      attrs(bundle,{opacity:tear*(1-ramp(t,12.5,13.7))});place(bundle,slots[0][0]+11,slots[0][1]-20+6*ramp(t,11.5,12.8),-12);
    },act(i,t){return {tilt:-11*beat(t,2+i*1.1,5+i*1.1)+6*beat(t,10,12.7),lift:4*beat(t,3+i,6+i)};}};
  }),
  'vector-rebuild':incident(10,1,3,anchor.tickets,({scene,actors})=>{
    const slots=actors.map((_,i)=>[19+i*28,18+i*7]);
    const ropePath='M-64 -30Q-22 -6 18 -19';
    for(const [x,y] of [[-64,-30],[18,-19]]){
      shadow(scene,x,y+29,11,4);
      path(scene,`M${x} ${y}v29`,'none',{stroke:brass,'stroke-width':3});
      ellipse(scene,x,y,4,3,'#ffdbad');ellipse(scene,x,y+29,8,3,brass);
    }
    const cord=path(scene,ropePath,'none',{stroke:'#b35569','stroke-width':5});
    const mesh=group(scene);
    for(let i=0;i<12;i++){
      const x=-64+i*6.8,y=-30+11*i/12+11*Math.sin(Math.PI*i/12);
      path(mesh,`M${f(x)} ${f(y)}l4 -6 4 8-8 -2Z`,'none',{stroke:i%2?rose:ice,'stroke-width':1.5});
    }
    const light=ellipse(scene,0,0,7,3,'#fffac0');
    const beam=path(scene,'','rgba(245,240,173,.25)');
    return {slots,paint(t){
      const outline=ease(ramp(t,1.5,2.5))*(1-ease(ramp(t,7,8.2)));
      attrs(mesh,{opacity:outline});attrs(cord,{opacity:1-outline});
      const u=ease(ramp(t,4,7.6)),x=-64+82*u,y=-30+11*u+11*Math.sin(Math.PI*u);
      attrs(light,{cx:f(x),cy:f(y),opacity:outline*ramp(t,3.4,4)});
      attrs(beam,{d:`M-71 -58L${f(x-5)} ${f(y+2)}L${f(x+5)} ${f(y-2)}Z`,opacity:outline});
    },act(i,t){return {dx:-8*ease(ramp(t,7.4+i*.16,8.9+i*.16)),tilt:9*beat(t,2.1,5.2)};}};
  }),
  'lenticular-marquee':incident(10,1,2,anchor.poster,({scene,actors})=>{
    const board=group(scene);
    place(board,0,-2,-5);
    rect(board,-28,-93,56,93,brass,{rx:2});rect(board,-25,-90,50,87,ink);
    const field=gradient(board,[[0,'#3b2354'],[.5,'#a4476d'],[1,'#3e3061']]);
    rect(board,-22,-86,44,74,field);
    ellipse(board,0,-58,17,23,'#ecd0aa');path(board,'M-18 -59q-8-38 28-25l8 17-12-6-15 9Z','#302638');
    const pupils=[];
    for(const x of [-7,7]){
      ellipse(board,x,-57,6,3,'#fff2d8');pupils.push(ellipse(board,x,-57,2.6,2.8,ink));
    }
    path(board,'M-5 -46q5 3 10 -1','none',{stroke:'#974963','stroke-width':2});
    for(let i=-20;i<=20;i+=4)rect(board,i,-86,1,74,'#fff',{opacity:.11});
    type(board,0,-16,'ENCORE',8,paper);
    const slots=actors.length===1?[[-59,4]]:[[-59,4],[56,9]];
    return {slots,paint(t){
      const side=-3+6*ease(ramp(t,2.2,4.2))-6*ease(ramp(t,4.3,5.6))+5*ease(ramp(t,6.2,7.6));
      pupils.forEach((p,i)=>p.setAttribute('cx',f((i?7:-7)+side*(1-ramp(t,8.0,8.8)))));
    },act(i,t){return {dx:(i?-1:1)*(34*ease(ramp(t,2.1+i*2,4.15+i*2))-21*ease(ramp(t,4.3+i*2,5.6+i*2))),tilt:(i?-1:1)*11*beat(t,4.2+i,6.5+i)};}};
  }),
  'leaded-glass':incident(10,1,1,anchor.entrance,({scene,actors})=>{
    const glass=group(scene);
    const clip=def(glass,'clipPath','leaded-pane');
    path(clip.el,'M-52 -101l69 36v68l-69-36Z','#fff');
    const panes=group(glass,{'clip-path':clip.url});
    const colors=['#c998e8','#efbea2','#72cbb9','#958fe0','#b586a1','#e8d8a6'];
    for(let j=0;j<3;j++)for(let i=0;i<4;i++){
      const x=-54+i*22,y=-107+j*28+i*10;
      path(panes,`M${x} ${y}l22 10v28l-22-10Z`,colors[(j*4+i)%6],{stroke:'#403a49','stroke-width':2});
    }
    const imprint=group(panes,{opacity:.79,style:'filter:brightness(.19) sepia(.8)'});
    likeness(imprint,actors[0],-16,-13,49);
    const spill=path(scene,'M-48 -30l65 34 44 5-72-38Z','#e4a392',{opacity:.3});
    return {slots:[[-38,12]],walks:[{at:2.1,slot:0,offset:[83,18]}],paint(t){
      const glow=ease(ramp(t,.65,2.5))*(1-ease(ramp(t,7.5,9.3)));
      attrs(glass,{opacity:glow*.87});attrs(spill,{opacity:.43*glow});
      const catchUp=ease(ramp(t,6.1,8));
      place(imprint,catchUp*76,catchUp*19);attrs(imprint,{opacity:ramp(t,2,3)*(1-ramp(t,7,8))});
    },act(i,t){return {tilt:-12*beat(t,5.3,7)};}};
  }),
};
