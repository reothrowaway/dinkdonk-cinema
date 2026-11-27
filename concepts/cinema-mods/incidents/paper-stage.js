import {anchor,attrs,beat,brass,def,ease,ellipse,f,gradient,group,incident,ink,likeness,mix,node,paper,path,place,ramp,rect,rose,shadow,type} from './stage.js';

export const paperStage={
  'infinity-foyer':{
    nativeRoute:true,waitForCast:true,eligible:(w,a)=>a.infinityDoor?.eligible(w),
    ...incident(15,1,1,anchor.door,({root,scene,center,actors:[guest],anchors})=>{
    const door=anchors.infinityDoor;
    root.style.zIndex=String(door.z);
    const doorway=group(scene,{'data-infinity-doorway':door.id});
    const quad=door.quad.map(([x,y])=>[x-center[0],y-center[1]]);
    // Use the inset between the two swung leaves. Keep the photographed jamb,
    // threshold, hinges and the light falling across the carpet untouched.
    function inside(across,up){
      const [left,right,topRight,topLeft]=quad;
      return [0,1].map(k=>mix(mix(left[k],right[k],across),mix(topLeft[k],topRight[k],across),up));
    }
    const corners=(left,right,bottom,top)=>[inside(left,bottom),inside(right,bottom),inside(right,top),inside(left,top)];
    const polygon=points=>'M'+points.map(p=>p.map(f).join(' ')).join('L')+'Z';
    const aperture=def(doorway,'clipPath','screen-door');
    path(aperture.el,polygon(corners(.13,.90,.045,.91)),'white');
    const echoes=group(doorway,{'clip-path':aperture.url});
    // Dim receding lines live in the dark corridor behind the open doors.
    // The photographed screen-door trim remains the only frame at its entrance.
    const vanishing=inside(.72,.75);
    const entrance=corners(.10,.95,-.04,1.04);
    for(const corner of entrance){
      path(echoes,'M'+corner.join(' ')+'L'+vanishing.join(' '),'none',{stroke:'#9d8b91','stroke-width':.8,opacity:.50});
    }
    for(const distance of [.40,.70]){
      const inner=entrance.map(p=>p.map((n,k)=>mix(n,vanishing[k],distance)));
      path(echoes,polygon(inner),'none',{stroke:'#ac9997','stroke-width':.8,opacity:.7});
    }
    const depths=[
      {across:.70,up:.64,size:16,start:4.25},
      {across:.53,up:.37,size:23,start:5.75},
      {across:.38,up:.09,size:33,start:7.25},
    ];
    const copies=depths.map(({across,up,size},i)=>{
      const copy=group(echoes,{'data-infinity-copy':String(i+1)});
      place(copy,...inside(across,up),0,size/70);
      const body=group(copy);
      const hand=group(copy);
      path(hand,'M-3 3Q3-5 3-12l6 1q1 9-7 17Z',brass,{stroke:ink,'stroke-width':1.7});
      path(hand,'M2-10l-6-7q-2-4 1-5l6 4-3-12q0-4 3-3l4 12-1-15q1-3 4-2l1 15 2-13q1-4 4-2l-1 15 3-8q2-3 4-1l-3 15q-3 9-12 7Z',paper,{stroke:ink,'stroke-width':1.8,'stroke-linejoin':'round'});
      return {body,hand};
    });
    // The reaching hand moves with the guest. The lobby owns their speech bubble.
    const actorArt=node(guest.el,'svg',{width:2,height:2,'aria-hidden':'true'});
    actorArt.style.cssText='position:absolute;left:0;top:0;overflow:visible;pointer-events:none';
    const reach=group(actorArt);
    path(reach,'M-7 -17q-8 -2 -13 -7l-5 -1 -5 -3q-2 -2 0 -3l6 2 -4 -5q-1 -3 2 -2l6 5 3 4 11 4Z',paper,{stroke:ink,'stroke-width':1.3,'stroke-linejoin':'round'});
    const route=door.approach(guest);
    let native=null,started=false,sourceEmote,spoke=false;
    return {focusY:58,zoom:3.45,valid:onFoot=>onFoot(guest)&&route.valid(),
      ready(){
        if(route.ready())native??=door.open();
        return started=!!native;
      },
      dispose(){native?.release();route.release();actorArt.remove();},
      paint(t,reduced){
        if(started&&guest.em!==sourceEmote){
          sourceEmote=guest.em;
          const aspect=(Number(sourceEmote?.dataset.w)||50)/(parseFloat(sourceEmote?.style.height)||50);
          const height=Math.min(70,71/aspect);
          for(const c of copies){
            c.portrait?.remove();c.portrait=likeness(c.body,guest,0,0,height,true);
            c.wristX=Math.min(29,aspect*height*.40);c.wristY=-height*.30;
          }
        }
        const open=ramp(t,2.15,3.65),close=ramp(t,9.88,10.15);
        route.setTime(t);
        const frame=Math.round(close>0?mix(10,15,close):mix(0,5,open));
        native?.set(frame);
        doorway.dataset.infinityDoorFrame=String(frame);
        if(native&&t>=10.22){native.release();native=null;}
        attrs(echoes,{opacity:f(ease(ramp(t,3.35,3.9))*(1-ease(ramp(t,9.87,10.03))))});
        attrs(reach,{opacity:f(Math.max(beat(t,1.97,3.45),beat(t,9.48,10.34)))});
        if(started&&!spoke&&t>=10.54){
          const bubble=anchors.sayRemark(guest,'wtf');
          if(bubble){bubble.dataset.infinityReaction='';spoke=true;}
        }
        copies.forEach(({body,hand,wristX,wristY},i)=>{
          const elapsed=t-depths[i].start;
          const wave=ease(ramp(elapsed,0,.22))*(1-ease(ramp(elapsed,1.04,1.33)));
          const swing=Math.sin(Math.PI*3*ramp(elapsed,.18,1.15));
          place(body,0,-wave*(reduced?1:4),wave*(reduced?2:8));
          place(hand,wristX||0,(wristY||0)-wave*10,(1-wave)*78+wave*swing*(reduced?8:27));
          attrs(hand,{opacity:f(wave)});
        });
      },pose(w,x,y,t,reduced){
        if(!started)return;
        const open=beat(t,1.85,3.5),peer=ease(ramp(t,3.6,4.25))*(1-ease(ramp(t,8.95,9.5)));
        const grab=ease(ramp(t,9.43,9.95))*(1-ease(ramp(t,10.03,10.38))),recoil=beat(t,10.1,11.08);
        // Feet and depth always belong to the walker, including the step into
        // the slam. Only their upper-body gestures are performed by the scene.
        return {x,y,indoors:true,tilt:(-13*open-9*peer-22*grab+15*recoil)*(reduced?.35:1),lift:5*recoil*(reduced?.32:1)};
      }};
    }),
  },
  'folding-screen':incident(12,1,2,anchor.poster,({scene,actors})=>{
    const slots=[[-42,4],[62,13]];
    shadow(scene,0,5,58,10);
    const faces=[];
    for(let i=0;i<4;i++){
      const panel=group(scene);
      rect(panel,0,-68,27,67,['#6c4855','#354653','#764a62','#485969'][i],{stroke:brass,'stroke-width':1.6});
      rect(panel,2,-62,23,49,ink,{stroke:'#b58b81'});
      path(panel,'M3 -16l8-23 5 7 4-13 5 29Z',i%2?'#599397':'#ac788e');
      ellipse(panel,16,-50,5,5,i%2?paper:rose);
      faces.push(panel);
    }
    const peek=group(scene);
    likeness(peek,actors[0],0,0,29);
    const walks=[{at:3.9,slot:0,offset:[27,0]}, {at:5.2,slot:0,offset:[54,0]},
      {at:6.5,slot:0,offset:[81,0]}, {at:8.4,slot:0,offset:[0,0]}];
    return {slots,walks,paint(t,reduced){
      const opened=ease(ramp(t,2,4.5))*(1-ease(ramp(t,8.4,10.2)));
      let x=-48,y=0;
      faces.forEach((face,i)=>{
        const width=.13+.85*opened,slant=(i%2?-1:1)*mix(22,12,opened);
        attrs(face,{transform:`translate(${f(x)} ${f(y)}) skewY(${slant}) scale(${f(width)} 1)`});
        x+=27*width;y+=Math.tan(slant*Math.PI/180)*27*width;
      });
      const location=Math.min(2,Math.max(0,Math.floor((t-4.1)/1.3)));
      const rise=beat(t,4.1+location*1.3,5.35+location*1.3);
      attrs(peek,{opacity:rise});
      place(peek,-20+location*25,-60-(reduced?1:8)*rise,location%2?12:-12);
    },act(i,t){return i?{tilt:-10*beat(t,5,8)}:{zOffset:t>3.5&&t<9?-2:3,lift:9*beat(t,8.6,9.6)};}};
  }),
  'poster-peel':incident(10,1,3,anchor.poster,({scene,actors})=>{
    const slots=[[-42,10],[49,13],[68,22]];
    shadow(scene,0,4,33,7);
    rect(scene,-2,-28,4,31,brass);
    rect(scene,-33,-91,66,69,'#202338',{stroke:brass,'stroke-width':3});
    const art=group(scene);
    rect(art,-30,-88,60,63,'#443653');
    ellipse(art,8,-65,15,15,'#dc98a3');path(art,'M-29 -38l19-27 13 18 10-11 17 20Z','#4b8190');
    type(art,0,-30,'MIDNIGHT',7,paper);
    const opening=def(scene,'clipPath','curled-corner'),cut=path(opening.el,'','white');
    const back=group(scene,{'clip-path':opening.url});
    rect(back,-30,-88,60,63,'#243746');
    for(let i=0;i<3;i++)path(back,`M-30 ${-66+i*13}q25-10 60 0v7q-30-8-60 0Z`,'#81495c');
    const spectators=actors.map((actor,i)=>{
      const g=group(back);
      likeness(g,actor,0,0,17);
      place(g,-14+i*16,-49+i%2*6);
      return g;
    });
    const flap=path(scene,'',gradient(scene,[['0%','#fff0cd'],['68%','#b092a5'],['100%','#77546e']]),{stroke:brass,'stroke-width':1});
    return {slots,paint(t,reduced){
      const curl=ease(ramp(t,1.7,4.6))*(1-ease(ramp(t,6.8,8.15)));
      const w=59*curl,h=56*curl;
      const edge=`M30 ${f(-88+h)} Q${f(32-w*.16)} ${f(-88+h*.22)} ${f(30-w)} -88`;
      attrs(cut,{d:edge+' H30Z'});
      attrs(flap,{d:edge+` Q${f(30-w*.57)} ${f(-88+h*.52)} 30 ${f(-88+h)}Z`,opacity:curl});
      spectators.forEach((g,i)=>place(g,-14+i*16,-49+i%2*6-(reduced?1:4)*beat(t,4.5+i*.25,6.6),-8*beat(t,4.5+i*.25,6.6),-1,1));
    },act(i,t){const lean=beat(t,3.5,6.7),snap=beat(t,6.5,8.4);return {dx:(i?-1:1)*(lean*10-snap*13),tilt:(i?-1:1)*(lean*17-snap*18),lift:snap*5};}};
  }),
  'parallax-cutouts':incident(9,1,2,anchor.poster,({scene,actors})=>{
    const slots=[[0,0],[53,15]];
    shadow(scene,1,4,36,9);
    const stand=group(scene);
    const contour='M-19 0l4-25-10-11 8-19 6 1 3-17 11-4 12 12-1 11 13 5 8 20-11 7-8-9 2 29Z';
    path(stand,contour,'#a88075',{stroke:brass,'stroke-width':4});
    path(stand,'M-19 -5l6-30 14 11 17-14 4 32Z','#5a7682',{stroke:paper});
    const portrait=likeness(stand,actors[0],1,-16,51);
    portrait.style.filter='sepia(.75) saturate(1.5)';
    path(stand,'M-25 -6l47 1 4 7h-53Z',brass,{stroke:ink});
    const brace=path(scene,'','none',{stroke:paper,'stroke-width':3});
    return {slots,paint(t){
      const flop=ease(ramp(t,2.2,3.5))*(1-ease(ramp(t,6,7.5)));
      const angle=-77*flop;
      place(stand,0,0,angle);
      attrs(brace,{d:`M4 0l${f(-20*flop)} ${f(-11*flop)}`,opacity:flop});
    },act(i,t){return i?{tilt:-12*beat(t,3.4,5.6)}:{zOffset:-2,dx:6*beat(t,3.75,5.75),tilt:-18*beat(t,3.6,5.9),lift:4*beat(t,4.1,5.7)};}};
  })
};
