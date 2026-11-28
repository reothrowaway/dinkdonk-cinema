(() => {
  'use strict';
  const el=id=>document.getElementById(id),zone='America/New_York',key='dinkdonk.archive-calendar.v1';
  const clock=new Intl.DateTimeFormat('en-US',{timeZone:zone,hour:'numeric',minute:'2-digit',timeZoneName:'short'});
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'});
  const full=new Intl.DateTimeFormat('en-US',{timeZone:'UTC',weekday:'long',month:'long',day:'numeric',year:'numeric'});
  const monthName=new Intl.DateTimeFormat('en-US',{timeZone:'UTC',month:'long',year:'numeric'});
  const short=new Intl.DateTimeFormat('en-US',{timeZone:'UTC',weekday:'short',month:'short',day:'numeric'});
  const weekdays=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const days=new Map(),months=new Map();
  let ordered=[],current='',selected='',firstDate='',lastDate='';
  function element(tag,text,cls){
    const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;
  }
  function dayOf(ms){const p=Object.fromEntries(parts.formatToParts(ms).map(v=>[v.type,v.value]));return p.year+'-'+p.month+'-'+p.day;}
  const utc=date=>new Date(date+'T12:00:00Z');
  const safePoster=url=>typeof url==='string'&&/^https:\/\/image\.tmdb\.org\/t\/p\/[A-Za-z\d_/.-]+$/.test(url)?url:'';
  function archive(feed){
    if(!Array.isArray(feed?.history))throw Error('Missing watch log');
    const posters=new Map();
    for(const r of [...(feed.ratings||[]),...(feed.best||[]),...(feed.worst||[]),...Object.values(feed.details?.ratings||{})]){
      const src=safePoster(r?.poster);if(src&&r.id!=null)posters.set(String(r.id),src);
    }
    const found=new Map();
    for(const f of feed.history){
      if(f?.type!=='Movie'||!Number.isSafeInteger(f.id)||typeof f.title!=='string'||!f.title.trim()||
        !Number.isFinite(f.watchedTs)||!Number.isFinite(new Date(f.watchedTs).getTime())||found.has(f.id))continue;
      const day=dayOf(f.watchedTs);if(!/^\d{4}-\d\d-\d\d$/.test(day))continue;
      found.set(f.id,{id:f.id,title:f.title.trim(),year:/^\d{4}$/.test(String(f.year))?String(f.year):'',
        at:f.watchedTs,poster:posters.get(String(f.ratingId))||''});
    }
    return [...found.values()].sort((a,b)=>a.at-b.at||a.id-b.id);
  }
  function index(rows){
    days.clear();months.clear();
    for(const f of rows){
      const date=dayOf(f.at),month=date.slice(0,7);
      if(!days.has(date))days.set(date,[]);days.get(date).push(f);
      if(!months.has(month))months.set(month,[]);months.get(month).push(f);
    }
    ordered=[...months.keys()].sort();const dated=[...days.keys()].sort();firstDate=dated[0];lastDate=dated.at(-1);
  }
  function readCache(){
    try{
      const obj=JSON.parse(localStorage.getItem(key));
      if(!Number.isFinite(obj?.at)||!Array.isArray(obj.rows))return null;
      const rows=archive({history:obj.rows.map(f=>({...f,type:'Movie',watchedTs:f.at,ratingId:f.id})),
        ratings:obj.rows.map(f=>({id:f.id,poster:f.poster}))});
      return rows.length?{rows,at:obj.at}:null;
    }catch{return null;}
  }
  function featureStrip(films){
    const seen=new Set(),unique=films.filter(f=>{
      if(seen.has(f.title))return false;seen.add(f.title);return true;
    });
    const withArt=unique.filter(f=>f.poster);
    const pick=[],pool=withArt.length>=3?withArt:unique;
    const candidates=[...(withArt.length<3?withArt:[]),pool[0],pool[Math.floor((pool.length-1)/2)],pool.at(-1),...pool];
    for(const f of candidates){
      if(f&&!pick.includes(f))pick.push(f);if(pick.length===3)break;
    }
    el('strip').replaceChildren(...pick.map(f=>{
      const card=element('figure',undefined,'cover');card.setAttribute('aria-label',f.title);
      const title=element('span',f.title);card.append(title);
      if(f.poster){
        const im=new Image();im.alt='';im.referrerPolicy='no-referrer';im.onerror=()=>im.remove();im.src=f.poster;card.append(im);
      }
      return card;
    }));
  }
  function filmTime(f){const t=element('time',clock.format(f.at));t.dateTime=new Date(f.at).toISOString();return t;}
  function listFilms(films,print){
    return films.map(f=>{
      const li=element('li'),title=element('span',f.title+(f.year?' ('+f.year+')':''),print?'':'title');
      li.append(filmTime(f),title);
      if(!print){const link=element('a','Ticket');link.href='../ticket-counter/index.html?screening='+f.id;
        link.setAttribute('aria-label','Ticket for '+f.title);li.append(link);}
      return li;
    });
  }
  function selectDay(date){
    const active=el('calendar').querySelector('[data-day="'+date+'"]');if(!active)return;
    selected=date;
    for(const b of el('calendar').querySelectorAll('button')){b.setAttribute('aria-pressed',String(b===active));b.tabIndex=b===active?0:-1;}
    const films=days.get(date)||[];el('day-title').textContent=full.format(utc(date));el('day-link').href='#'+date;
    el('none').hidden=films.length>0;
    el('none').textContent=date<firstDate||date>lastDate?'This date is outside the available watch log.':'No movie screenings for this date in the watch log.';
    el('list').replaceChildren(...listFilms(films,false));
  }
  function chooseDay(date,method,focus=false){
    if(method)history[method](null,'','#'+date);
    if(date.slice(0,7)!==current)showMonth(date.slice(0,7),date);
    else selectDay(date);
    if(focus)el('calendar').querySelector('[aria-pressed=true]')?.focus();
  }
  function buttonFor(date,number){
    const films=days.get(date)||[],count=films.length,b=element('button',undefined,'day');b.type='button';b.dataset.day=date;
    const outside=date<firstDate||date>lastDate;
    b.classList.toggle('outside',outside);
    b.setAttribute('aria-label',full.format(utc(date))+', '+(outside?'outside the available watch log':count+' '+(count===1?'screening':'screenings')));
    const top=element('span',undefined,'day-top');top.append(element('span',String(number),'num'));
    if(count)top.append(element('span',String(count)+(count===1?' film':' films'),'top-count'));
    b.append(top);
    const names=element('span',undefined,'titles');for(const f of films.slice(0,2))names.append(element('span',f.title));b.append(names);
    if(count>2)b.append(element('span','+'+(count-2)+' more','more'));b.onclick=()=>chooseDay(date,'pushState');
    return b;
  }
  function showMonth(month,date){
    current=month;const films=months.get(month);if(!films)return;
    const name=monthName.format(utc(month+'-01')),inMonth=[...days.keys()].filter(day=>day.startsWith(month+'-')).sort();
    const begin=utc(month+'-01'),end=new Date(begin);end.setUTCMonth(end.getUTCMonth()+1,0);
    el('calendar').style.setProperty('--print-row',(144/Math.ceil((begin.getUTCDay()+end.getUTCDate())/7)).toFixed(2)+'mm');
    el('heading').textContent=name;el('month').value=month;
    el('summary').textContent=films.length+' movie '+(films.length===1?'screening':'screenings')+' on '+inMonth.length+' '+(inMonth.length===1?'date':'dates');
    el('scope').textContent='New York dates and times. This watch log covers '+short.format(utc(firstDate))+', '+firstDate.slice(0,4)+' through '+short.format(utc(lastDate))+', '+lastDate.slice(0,4)+'.';
    el('prev').disabled=ordered.indexOf(month)===0;el('next').disabled=ordered.indexOf(month)===ordered.length-1;
    featureStrip(films);const grid=el('calendar');grid.replaceChildren(...weekdays.map(day=>element('span',day,'weekday')));
    const pad=()=>{const x=element('span',undefined,'empty');x.setAttribute('aria-hidden','true');grid.append(x);};
    for(let i=0;i<begin.getUTCDay();i++)pad();
    for(let i=1;i<=end.getUTCDate();i++)grid.append(buttonFor(month+'-'+String(i).padStart(2,'0'),i));
    for(let i=end.getUTCDay()+1;i<7;i++)pad();
    el('reverse-title').textContent='DinkDonk Cinema · '+name;
    el('program').replaceChildren(...inMonth.map(d=>{const section=element('section'),ol=element('ol');
      ol.append(...listFilms(days.get(d),true));section.append(element('h3',full.format(utc(d)).replace(/, \d{4}$/, '')),ol);return section;}));
    selectDay(date&&grid.querySelector('[data-day="'+date+'"]')?date:inMonth.at(-1));
  }
  function restore(){
    if(!ordered.length)return;
    const hash=location.hash.slice(1),month=hash.slice(0,7);
    if(/^\d{4}-\d\d(?:-\d\d)?$/.test(hash)&&months.has(month))showMonth(month,hash.length===10?hash:null);
    else showMonth(ordered.at(-1));
  }
  function openMonth(month){const last=months.get(month).at(-1);chooseDay(dayOf(last.at),'pushState');}
  el('month').onchange=e=>openMonth(e.target.value);el('prev').onclick=()=>openMonth(ordered[ordered.indexOf(current)-1]);
  el('next').onclick=()=>openMonth(ordered[ordered.indexOf(current)+1]);el('print').onclick=()=>window.print();
  el('calendar').onkeydown=e=>{
    if(!e.target.dataset.day)return;
    const offsets={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7},d=utc(selected);
    if(e.key==='Home')d.setUTCDate(1);else if(e.key==='End')d.setUTCMonth(d.getUTCMonth()+1,0);
    else if(e.key in offsets)d.setUTCDate(d.getUTCDate()+offsets[e.key]);else return;
    e.preventDefault();const date=d.toISOString().slice(0,10);if(months.has(date.slice(0,7)))chooseDay(date,'replaceState',true);
  };
  function display(rows){
    index(rows);el('display').hidden=!rows.length;el('month').disabled=el('print').disabled=!rows.length;
    el('month').replaceChildren(...ordered.map(m=>new Option(monthName.format(utc(m+'-01')),m)));
    if(rows.length)restore();else el('prev').disabled=el('next').disabled=true;
  }
  async function load(){
    el('retry').hidden=true;el('notice').textContent='Opening the watch log…';
    try{
      const response=await fetch('/dd/data.json',{signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error();
      const feed=await response.json(),rows=archive(feed);
      try{localStorage.setItem(key,JSON.stringify({at:Date.now(),rows}));}catch{}
      display(rows);el('notice').textContent=rows.length?(feed.stale?'Showing the server’s saved watch log.':''):'No dated movie screenings in this watch log.';
      el('retry').hidden=Boolean(rows.length&&!feed.stale);
    }catch{
      const saved=readCache();display(saved?.rows||[]);el('retry').hidden=false;
      el('notice').textContent=saved?'Offline · showing the watch log saved '+new Date(saved.at).toLocaleDateString()+'.':'The watch log could not be opened.';
    }
  }
  el('retry').onclick=load;window.addEventListener('hashchange',restore);window.addEventListener('popstate',restore);load();
})();
