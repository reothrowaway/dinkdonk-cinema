(() => {
  'use strict';
  const el=id=>document.getElementById(id);
  const query=new URLSearchParams(location.hash.slice(1));
  const films=[0,1].map(i=>(query.get('film'+i)||'').trim().slice(0,320));
  if (films.some(title=>!title)) return;
  const names=['Welcome',films[0],'Intermission',films[1],'Audience discussion'];
  const feature=i=>i===1||i===3;
  const minutes=60000;
  const zone=Intl.DateTimeFormat().resolvedOptions().timeZone;
  const clock=new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit'});
  const clockWithZone=new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit',timeZoneName:'short'});
  const key='dinkdonk.rundown.v1.'+JSON.stringify([query.get('id0')||films[0],query.get('id1')||films[1],
    query.get('break'),query.get('run')||'']);
  let persistent=true,message='',timer;
  const pad=n=>String(n).padStart(2,'0');
  function localInput(ms) {
    const d=new Date(ms);
    return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes());
  }
  function timestamp(value) {
    if (!value) return null;
    const time=new Date(value).getTime();
    return Number.isFinite(time) && localInput(time)===value ? time : null;
  }
  function duration(value,i) {
    if (value==='' || value==null || !/^\d{1,4}$/.test(String(value))) return null;
    const n=Number(value);
    return n<=(feature(i)?1440:240) && (!feature(i)||n>0) ? n : null;
  }
  const defaults={start:localInput(Math.ceil(Date.now()/(15*minutes))*15*minutes),deadline:'',
    lengths:['3',query.get('minutes0')||'',query.get('break')||'10',query.get('minutes1')||'','10'],marks:[]};
  function read() {
    try {
      const raw=localStorage.getItem(key);
      if (!raw) return null;
      const s=JSON.parse(raw);
      if (typeof s?.start!=='string'||typeof s.deadline!=='string'||!Array.isArray(s.lengths)||s.lengths.length!==5||
          !s.lengths.every(v=>typeof v==='string')||!Array.isArray(s.marks)||s.marks.length>6||
          !s.marks.every((v,i)=>Number.isSafeInteger(v)&&v>0&&(!i||v>=s.marks[i-1]))) return null;
      return s;
    } catch { persistent=false;return null; }
  }
  let state=read()||defaults;
  function change(edit) {
    function apply() {
      if(persistent)state=read()||state;
      if(edit(state)!==false && persistent) {
        try {localStorage.setItem(key,JSON.stringify(state));} catch {persistent=false;}
      }
      render();
    }
    if(navigator.locks)navigator.locks.request(key,apply).catch(()=>{message='Could not update the timing sheet.';render();});
    else apply();
  }
  function schedule() {
    const locked=state.marks.length && Number.isFinite(state.baseline?.start) ? state.baseline : null;
    const start=locked ? locked.start : timestamp(state.start),deadline=locked ? locked.deadline : timestamp(state.deadline);
    const lengths=state.lengths.map(duration);
    const active=names.map((_,i)=>i).filter(i=>lengths[i]!==0);
    let finish=start;
    const starts=[];
    for(let i=0;i<names.length;i++){
      starts.push(finish);
      finish=finish!==null&&lengths[i]!==null ? finish+lengths[i]*minutes : null;
    }
    const problem=start===null ? 'Choose a valid local start time.' :
      state.deadline && (deadline===null || deadline<=start) ? 'Choose a finish deadline after the planned start.' :
      lengths.includes(null) ? 'Enter minutes for '+names[lengths.indexOf(null)]+'.' : '';
    return {start,deadline,finish,starts,lengths,active,problem};
  }
  function dayNumber(ms) {
    const d=new Date(ms);
    return Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000;
  }
  function time(ms,start) {
    if(ms===null||ms===undefined)return '—';
    const days=start===null?0:dayNumber(ms)-dayNumber(start);
    const changedOffset=start!==null && new Date(start).getTimezoneOffset()!==new Date(ms).getTimezoneOffset();
    return (changedOffset ? clockWithZone : clock).format(ms)+(days ? ' ('+(days>0?'+':'')+days+'d)' : '');
  }
  function difference(ms,deadline) {
    const n=Math.round(Math.abs(ms)/1000);
    if(!n)return deadline?'On deadline':'On time';
    const amount=n<60 ? n+' sec' : Math.floor(n/60)+' min'+(n%60?' '+n%60+' sec':'');
    return amount+(ms>0 ? deadline?' over':' late' : deadline?' spare':' early');
  }
  const cells=names.map((name,i)=>{
    const row=document.createElement('tr'),label=document.createElement('th'),runtime=document.createElement('td');
    label.scope='row';label.textContent=name;
    const input=document.createElement('input');input.type='number';input.step='1';input.min=feature(i)?'1':'0';input.max=feature(i)?'1440':'240';
    input.setAttribute('aria-label','Minutes for '+name);
    input.addEventListener('change',()=>{const value=input.value;change(s=>{
      if(s.marks.length)return false;
      s.lengths[i]=value;message='';
    });});
    runtime.append(input);
    const plan=document.createElement('td'),actual=document.createElement('td');plan.className=actual.className='time';
    row.append(label,runtime,plan,actual);el('rows').append(row);
    return {row,input,plan,actual};
  });
  function render() {
    const {start,finish,starts,deadline,lengths,active,problem}=schedule();
    const marks=state.marks,running=marks.length>0,done=marks.length>active.length,now=Date.now();
    const current=running&&!done?active[marks.length-1]:null;
    for(const id of ['start','deadline']) {
      const instant=id==='start'?start:deadline;
      const value=running && instant!==null ? localInput(instant) : state[id];
      if(el(id).value!==value)el(id).value=value;
      el(id).disabled=running;
    }
    cells.forEach(({input,actual,plan,row},i)=>{
      if(input.value!==state.lengths[i])input.value=state.lengths[i];
      input.disabled=running;input.setAttribute('aria-invalid',String(lengths[i]===null));
      plan.textContent=lengths[i]===0?'Skipped':time(starts[i],start);
      actual.textContent=time(marks[active.indexOf(i)],start);
      row.classList.toggle('live',i===current);
    });
    let expected=finish;
    if(done)expected=marks.at(-1);
    else if(running && !problem) {
      const next=active.slice(marks.length).reduce((n,i)=>n+lengths[i]*minutes,0);
      expected=Math.max(now,marks.at(-1)+lengths[current]*minutes)+next;
    }
    el('planned').textContent=time(finish,start);
    el('expected').textContent=time(expected,start);
    el('estimate-label').textContent=done?'Actual finish':'Expected finish';
    el('margin-label').textContent=deadline?'Time against deadline':'Time against plan';
    const target=deadline??finish;
    el('margin').textContent=problem || expected===null || target===null?'—':difference(expected-target,deadline!==null);
    const nextId=active[marks.length];
    el('advance').textContent=done?'Plan another show':running ? nextId===undefined?'Finish program now':'Start '+names[nextId]+' now' : 'Start program now';
    el('advance').disabled=Boolean(problem)||(!done&&running&&now-marks.at(-1)<1000);
    el('undo').hidden=!running;
    const text=problem || message || (done?'Program complete.':running?'Now running · '+names[current]:'Set the local start and review the cue durations.');
    const status=text+(persistent?'':' Changes last only in this tab.');
    if(el('status').textContent!==status)el('status').textContent=status;
    if(running&&!done&&!timer)timer=setInterval(render,1000);
    if((!running||done)&&timer){clearInterval(timer);timer=null;}
  }
  for(const id of ['start','deadline'])el(id).addEventListener('change',()=>{const value=el(id).value;
    change(s=>{if(s.marks.length)return false;s[id]=value;message='';});
  });
  el('advance').addEventListener('click',()=>{
    const expected=state.marks.length, {active,problem}=schedule();
    if(problem)return;
    if(expected>active.length){
      const next=new URL(location.href),q=new URLSearchParams(location.hash.slice(1));
      q.set('run',Date.now().toString(36));next.hash=q.toString();location.assign(next);return;
    }
    change(s=>{
      const now=Date.now();
      const plan=schedule();
      if(s.marks.length!==expected || plan.problem || (expected && now-s.marks.at(-1)<1000))return false;
      if(!expected)s.baseline={start:plan.start,deadline:plan.deadline};
      s.marks.push(now);message='';
    });
  });
  el('undo').addEventListener('click',()=>{
    const last=state.marks.at(-1);
    change(s=>{
      if(!last||s.marks.at(-1)!==last)return false;
      s.marks.pop();
      if(!s.marks.length && s.baseline){
        s.start=localInput(s.baseline.start);
        s.deadline=s.baseline.deadline===null?'':localInput(s.baseline.deadline);
        delete s.baseline;
      }
      message='Last cue undone.';
    });
  });
  window.addEventListener('storage',event=>{if(event.key===key){state=read()||defaults;message='';render();}});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
  window.addEventListener('focus',render);
  window.addEventListener('hashchange',()=>location.reload());
  el('zone').textContent='Local time · '+zone;
  el('missing').hidden=true;el('desk').hidden=false;el('print').hidden=false;el('print').onclick=()=>window.print();
  render();
})();
