(() => {
  'use strict';
  const el=id=>document.getElementById(id);
  const articles=[...document.querySelectorAll('article')];
  const links=[...document.querySelectorAll('.steps a')];

  function showStop() {
    const selected=articles.find(a=>'#'+a.id===location.hash) || articles[0];
    for (const page of articles) page.classList.toggle('current',page===selected);
    for (const link of links) {
      if (link.hash==='#'+selected.id) link.setAttribute('aria-current','step');
      else link.removeAttribute('aria-current');
    }
  }
  links.forEach(link=>link.addEventListener('click',event=>{
    if (event.button!==0 || event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) return;
    event.preventDefault();
    if (location.hash!==link.hash) history.pushState(null,'',link.hash);
    showStop();
  }));
  window.addEventListener('popstate',showStop);
  window.addEventListener('hashchange',showStop);

  function choices(id,onSelect) {
    const group=el(id), buttons=[...group.querySelectorAll('button')];
    buttons.forEach((button,i)=>button.addEventListener('click',()=>{
      buttons.forEach(other=>other.setAttribute('aria-pressed',String(button===other)));
      onSelect(i,button);
    }));
    group.hidden=false;
    onSelect(0,buttons[0]);
  }
  choices('landmarks',(i,button)=>{
    el('pin').style.left=button.dataset.x+'%';
    el('pin').style.top=button.dataset.y+'%';
    el('landmark').textContent=button.textContent;
    el('landmark-note').textContent=el('lobby-notes').children[i].textContent;
  });
  [...el('landmarks').children].forEach((button,i)=>{
    const label=document.createElement('span');
    label.className='print-pin';label.textContent=String(i+1);
    label.setAttribute('aria-hidden','true');
    label.style.left=button.dataset.x+'%';label.style.top=button.dataset.y+'%';
    el('pin').after(label);
  });

  // Draft 14's rear portal, cross aisle and stair treads, projected through
  // the auditorium camera. The final two points turn into row F at u=8.5.
  const route=[[-67,910],[-3,878],[82,836],[167,793],[251,751],[310,722],[319,717],[334,709],
    [379,687],[442,655],[506,623],[568,620],[580,614],[582,613],[584,607],[593,602],[593,585],
    [602,572],[631,551],[635,543],[708,520],[712,512],[742,497],[784,476],[861,515],[839,519],
    [824,519],[809,520],[795,520],[772,525],[743,535],[713,544],[683,553],[653,562],[628,569],[841,676]];
  const sections=[route,route.slice(0,25),route.slice(24,-1),route.slice(-2)];
  const context=el('route').getContext('2d');
  const house=el('route').previousElementSibling;
  function draw(points,color,width) {
    context.beginPath();
    points.forEach(([x,y],i)=>i ? context.lineTo(x,y) : context.moveTo(x,y));
    context.strokeStyle=color; context.lineWidth=width; context.stroke();
  }
  function showRoute(i) {
    if (!context) return;
    context.clearRect(0,0,1920,1080);
    // Print engines can flatten a transparent canvas against paper. Keep the
    // map and route together when the room image has finished loading.
    if (house.complete && house.naturalWidth) context.drawImage(house,0,0,1920,1080);
    context.lineCap='round'; context.lineJoin='round';
    draw(route,'#17261e',11);
    draw(route,'#b8beb3',5);
    draw(sections[i],'#1f231d',12);
    draw(sections[i],'#ffe7a2',6);
    const [x,y]=sections[i].at(-1);
    context.beginPath(); context.arc(x,y,13,0,Math.PI*2);
    context.fillStyle='#fbe5a5';context.fill();context.strokeStyle='#26251d';context.lineWidth=4;context.stroke();
  }
  let activeLeg=0;
  house.addEventListener('load',()=>showRoute(activeLeg));
  choices('route-choices',i=>{
    activeLeg=i;showRoute(i);
    el('route-note').textContent=i ? el('route-notes').children[i-1].textContent : 'From the entrance corridor, follow the cross aisle, turn onto the stairs, then enter row F.';
  });
  const split=el('split');
  function compare() {
    const value=Number(split.value);
    el('comparison').style.setProperty('--split',value+'%');
    el('lit-label').hidden=value<22;
    el('dim-label').hidden=value>78;
    split.setAttribute('aria-valuetext',value===0 ? 'All film lighting' : value===100 ? 'All house lights up' :
      value+' percent house lights up, '+(100-value)+' percent film lighting');
  }
  split.addEventListener('input',compare);
  split.parentElement.hidden=false;compare();
  window.addEventListener('beforeprint',()=>showRoute(0));
  window.addEventListener('afterprint',()=>showRoute(activeLeg));
  el('print').hidden=false;
  el('print').onclick=()=>window.print();
  showStop();document.documentElement.classList.add('enhanced');
})();
