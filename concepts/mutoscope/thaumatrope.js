(() => {
  'use strict';
  const el=id=>document.getElementById(id), board=el('pixels'),disc=el('disc'),size=16;
  const colors=['#1e4741','#a24c31'], paper='#fff5d8', blank=()=>Array(256).fill(0);
  const cache=new Map(), histories=new Map(), prefix='dinkdonk.thaumatrope.v1.';
  let design='bird',face=0, drawings=[],col=7,row=7,stroke=null, spinning=false,combined=true;
  let angle=0,frame=0,previous=0,persistent=true;
  function line(x,y,endX,endY,paint) {
    const dx=endX-x,dy=endY-y,length=Math.max(Math.abs(dx),Math.abs(dy));
    for(let i=0;i<=length;i++)paint(Math.round(x+dx*i/(length||1)),Math.round(y+dy*i/(length||1)));
  }
  function defaults(name,side){
    const bits=blank(),dot=(x,y)=>{bits[y*size+x]=1;};
    const path=(...points)=>{for(let i=2;i<points.length;i+=2)line(points[i-2],points[i-1],points[i],points[i+1],dot);};
    if(name==='bird' && !side){
      ['........','.....##.','....###.','.#.#####','..#####.','...###..','....#.#.'].forEach((r,y)=>[...r].forEach((v,x)=>{if(v==='#')dot(x+4,y+4);}));
    }else if(name==='bird'){
      path(2,13,13,13,13,6,11,3,8,2,5,3,2,6,2,13);path(2,11,13,11);
      path(5,4,5,10);path(10,4,10,10);path(7,2,7,1,8,0,9,1,8,2);
    }else if(name==='fish' && !side){
      ['..###...','.#####.#','#######.','.#####.#','..###...'].forEach((r,y)=>[...r].forEach((v,x)=>{if(v==='#')dot(x+4,y+6);}));
      bits[8*size+5]=0;dot(5,4);dot(4,5);
    }else if(name==='fish'){
      path(4,2,11,2,10,4,13,7,14,10,13,12,11,14,4,14,2,12,1,10,2,7,5,4,4,2);
      path(4,5,6,5,8,4,10,5,11,5);
    }
    return bits;
  }
  const key=side=>design+'.'+side;
  function load(side){
    const k=key(side);
    if(persistent)try{
      const value=localStorage.getItem(prefix+k);
      if(value && /^[01]{256}$/.test(value))cache.set(k,[...value].map(Number));
      else cache.delete(k);
    }catch{persistent=false;}
    return (cache.get(k)||defaults(design,side)).slice();
  }
  function save(side,bits){
    cache.set(key(side),bits.slice());
    if(persistent)try{localStorage.setItem(prefix+key(side),bits.join(''));}catch{persistent=false;}
    el('saved').textContent=persistent?'Drawing saved on this device.':'Drawing lasts for this tab. Print to keep a copy.';
  }
  function history(){
    if(!histories.has(key(face)))histories.set(key(face),{undo:[],redo:[]});
    return histories.get(key(face));
  }
  function ink(g,bits,color,left,top,step){
    g.fillStyle=color;bits.forEach((on,i)=>{if(on)g.fillRect(left+(i%size)*step,top+Math.floor(i/size)*step,step,step);});
  }
  function circle(g,x,y,r,fill,outline){
    g.beginPath();g.arc(x,y,r,0,Math.PI*2);if(fill){g.fillStyle=fill;g.fill();}
    if(outline){g.strokeStyle=outline;g.stroke();}
  }
  function drawDisc(canvas,mode,invert=false,scale=1){
    const g=canvas.getContext('2d'),w=canvas.width;
    g.clearRect(0,0,w,w);g.save();g.scale(w/480,w/480);g.translate(240,240);g.scale(1,scale);g.lineWidth=2;
    circle(g,0,0,218,invert||canvas!==disc?'white':paper,'#544736');
    // Keep the entire 16-square drawing board inside the cut line.
    g.save();if(invert)g.rotate(Math.PI);
    if(mode===2||mode===1)ink(g,drawings[1],colors[1],-144,-144,18);
    if(mode===2||mode===0)ink(g,drawings[0],colors[0],-144,-144,18);
    g.restore();
    for(const x of [-193,193])circle(g,x,0,6,canvas===disc?'#28483f':'white','#554b39');
    if(canvas!==disc){g.beginPath();g.moveTo(-5,-205);g.lineTo(5,-205);g.lineTo(0,-213);g.closePath();g.fillStyle='#262e26';g.fill();}
    g.restore();
  }
  function preview(){
    const cosine=Math.cos(angle*Math.PI/180);
    drawDisc(disc,combined?2:cosine>=0?0:1,false,combined?1:Math.max(.012,Math.abs(cosine)));
    el('angle').value=String(Math.round(angle));el('degrees').textContent=Math.round(angle)+'°';
    el('together').setAttribute('aria-pressed',String(combined));el('spin').setAttribute('aria-pressed',String(spinning));
    el('spin').textContent=spinning?'Pause turn':'Slow turn';
  }
  function editView(){
    const g=board.getContext('2d'),step=board.width/size;
    g.fillStyle='#fffaf0';g.fillRect(0,0,board.width,board.height);ink(g,drawings[face],colors[face],0,0,step);
    g.lineWidth=1;g.strokeStyle='#c6c5b5';g.beginPath();
    for(let i=0;i<=size;i++){
      const k=Math.min(board.width-.5,i*step+.5);g.moveTo(k,0);g.lineTo(k,board.height);g.moveTo(0,k);g.lineTo(board.width,k);
    }g.stroke();
    if(document.activeElement===board){g.strokeStyle='#d18b00';g.lineWidth=3;g.strokeRect(col*step+2,row*step+2,step-4,step-4);}
    el('front').setAttribute('aria-pressed',String(face===0));el('back').setAttribute('aria-pressed',String(face===1));
    el('position').textContent=(face?'Back':'Front')+' · row '+(row+1)+', column '+(col+1)+' · '+(drawings[face][row*size+col]?'inked':'empty');
    el('undo').disabled=!history().undo.length;el('redo').disabled=!history().redo.length;preview();
  }
  function changes(before,after){return after.flatMap((v,i)=>before[i]===v?[]:[{i,from:before[i],to:v}]);}
  function apply(list,reverse){
    const current=load(face);
    for(const c of list)if(current[c.i]===(reverse?c.to:c.from))current[c.i]=reverse?c.from:c.to;
    drawings[face]=current;save(face,current);drawings[1-face]=load(1-face);editView();
  }
  function finish(){
    if(!stroke)return;
    const list=changes(stroke.before,drawings[face]);stroke=null;
    if(list.length){const h=history();h.undo.push(list);if(h.undo.length>64)h.undo.shift();h.redo=[];apply(list,false);}else editView();
  }
  function begin(x,y,id){finish();drawings[face]=load(face);stroke={before:drawings[face].slice(),value:1-drawings[face][y*size+x],x,y,id};move(x,y);}
  function move(x,y){line(stroke.x,stroke.y,x,y,(a,b)=>{drawings[face][b*size+a]=stroke.value;});stroke.x=col=x;stroke.y=row=y;editView();}
  function point(e){const r=board.getBoundingClientRect();return [(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height].map(n=>Math.max(0,Math.min(15,Math.floor(n*size))));}
  board.onpointerdown=e=>{if(stroke||e.button!==0)return;e.preventDefault();board.focus();board.setPointerCapture(e.pointerId);begin(...point(e),e.pointerId);};
  board.onpointermove=e=>{if(stroke&&e.pointerId===stroke.id)move(...point(e));};
  board.onpointerup=e=>{if(stroke&&e.pointerId===stroke.id){move(...point(e));finish();}};
  board.onlostpointercapture=e=>{if(stroke&&e.pointerId===stroke.id)finish();};
  board.onpointercancel=e=>{if(stroke&&e.pointerId===stroke.id){drawings[face]=stroke.before;stroke=null;editView();}};
  board.onfocus=board.onblur=editView;
  board.onkeydown=e=>{
    const moves={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
    if(e.key===' '){e.preventDefault();if(!e.repeat&&!stroke){begin(col,row,-1);finish();}return;}
    if(moves[e.key]){e.preventDefault();const [dx,dy]=moves[e.key];col=Math.max(0,Math.min(15,col+dx));row=Math.max(0,Math.min(15,row+dy));editView();}
  };
  ['undo','redo'].forEach(action=>el(action).onclick=()=>{
    finish();const h=history(),list=h[action].pop();if(!list)return;
    const reverse=action==='undo';h[reverse?'redo':'undo'].push(list);apply(list,reverse);
  });
  ['front','back'].forEach((name,i)=>el(name).onclick=()=>{finish();face=i;editView();});
  function stop(){spinning=false;cancelAnimationFrame(frame);previous=0;}
  function tick(now){
    if(!spinning)return;
    if(previous)angle=(angle+Math.min(now-previous,100)*.12)%360;
    previous=now;preview();frame=requestAnimationFrame(tick);
  }
  el('together').onclick=()=>{stop();combined=true;preview();};
  el('spin').onclick=()=>{if(spinning)stop();else{combined=false;spinning=true;frame=requestAnimationFrame(tick);}preview();};
  el('angle').oninput=e=>{stop();combined=false;angle=Number(e.target.value);preview();};
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();preview();}});
  function open(){
    finish();stop();design=el('design').value;face=0;drawings=[load(0),load(1)];angle=0;combined=true;
    el('saved').textContent=persistent?'':'Drawing lasts for this tab. Print to keep a copy.';editView();
  }
  function printFaces(){finish();el('print-name').textContent=el('design').selectedOptions[0].textContent;drawDisc(el('cut-front'),0);drawDisc(el('cut-back'),1,true);}
  el('design').onchange=open;el('print').onclick=()=>{printFaces();window.print();};window.addEventListener('beforeprint',printFaces);
  window.addEventListener('storage',e=>{if(stroke||e.key!==null&&!e.key.startsWith(prefix+design+'.'))return;drawings=[load(0),load(1)];editView();});
  open();
})();
