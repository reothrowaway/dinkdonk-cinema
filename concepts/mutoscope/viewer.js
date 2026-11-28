(() => {
  'use strict';
  const get=id=>document.getElementById(id);
  const cards=get('cards'), wheel=get('wheel'), count=11;
  let position=0, previousCard=-1, standing=false, running=false, raf=0, lastTime=0, drag=null, ignoreClick=false;
  const ready=()=>cards.complete && cards.naturalWidth>0;
  function render() {
    const card=standing ? 11 : ((Math.round(position)%count)+count)%count;
    get('arm').style.transform='rotate('+(position*360/count)+'deg)';
    if (card===previousCard) return;
    previousCard=card;
    cards.style.transform='translate('+(-(card%4)*25)+'%,'+(-Math.floor(card/4)*100/3)+'%)';
    get('number').textContent=standing ? 'CARD 12 · STILL' : 'CARD '+String(card+1).padStart(2,'0')+' / 11';
    get('window').setAttribute('aria-label',standing ? 'Sallie Gardner and rider standing still' : 'Sallie Gardner and rider, gallop card '+(card+1));
  }
  function stop() {
    running=false;
    cancelAnimationFrame(raf);
    get('play').textContent='Run reel';
  }
  function setStanding(value) {
    standing=value;
    get('still').setAttribute('aria-pressed',String(value));
    get('still').textContent=value ? 'Return to gallop' : 'Standing pose';
  }
  function advance(step) {
    stop(); setStanding(false);
    position=Math.round(position)+step;
    render();
  }
  function tick(now) {
    if (!running) return;
    position+=(now-lastTime)*count/1000;
    lastTime=now; render();
    raf=requestAnimationFrame(tick);
  }
  function toggleRun() {
    if (running) { stop(); return; }
    setStanding(false); running=true; lastTime=performance.now();
    get('play').textContent='Stop reel';
    raf=requestAnimationFrame(tick);
  }
  function angle(event) {
    const r=wheel.getBoundingClientRect(),x=event.clientX-r.left-r.width/2,y=event.clientY-r.top-r.height/2;
    return Math.hypot(x,y)<r.width*.14 ? null : Math.atan2(y,x);
  }
  wheel.addEventListener('pointerdown',event=>{
    if (!event.isPrimary || event.button!==0) return;
    stop(); ignoreClick=false;
    drag={id:event.pointerId,angle:angle(event),travel:0};
    wheel.setPointerCapture(event.pointerId);
  });
  wheel.addEventListener('pointermove',event=>{
    if (drag?.id!==event.pointerId) return;
    const next=angle(event);
    if (next!==null && drag.angle!==null) {
      const change=Math.atan2(Math.sin(next-drag.angle),Math.cos(next-drag.angle));
      drag.travel+=Math.abs(change);
      if (drag.travel>.065) {
        ignoreClick=true;
        setStanding(false); position+=change*count/(2*Math.PI); render();
      }
    }
    drag.angle=next;
  });
  wheel.addEventListener('lostpointercapture',()=>{ drag=null; });
  wheel.addEventListener('pointercancel',()=>{ drag=null; ignoreClick=true; });
  wheel.addEventListener('click',event=>{
    if (!ignoreClick || event.detail===0) advance(1);
    ignoreClick=false;
  });
  get('prev').addEventListener('click',()=>advance(-1));
  get('next').addEventListener('click',()=>advance(1));
  get('still').addEventListener('click',()=>{stop();setStanding(!standing);render();});
  get('play').addEventListener('click',toggleRun);
  document.addEventListener('keydown',event=>{
    if (!ready() || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key==='ArrowLeft' || event.key==='ArrowRight') {event.preventDefault();advance(event.key==='ArrowLeft'?-1:1);}
    if (event.key==='Escape') stop();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  window.addEventListener('pagehide',stop);
  function status() {
    const available=ready();
    for (const button of document.querySelectorAll('button')) button.disabled=!available;
    get('error').hidden=available;
    render();
  }
  cards.addEventListener('load',status);
  cards.addEventListener('error',status);
  if(cards.complete)status();
})();
