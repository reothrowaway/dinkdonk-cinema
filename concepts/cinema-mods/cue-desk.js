(() => {
  'use strict';
  const storageKey='dinkdonk.show-caller.v1';
  const label={ready:'Standby',called:'Sent',waiting:'Waiting for the room',playing:'Playing',finished:'Finished',
    interrupted:'Interrupted',unavailable:'Could not start',unconfirmed:'Awaiting confirmation',skipped:'Skipped'};
  const active=s=>['called','waiting','playing','unconfirmed'].includes(s);
  const roomName=room=>room==='lobby'?'Lobby':'Auditorium';
  const token=()=>globalThis.crypto?.randomUUID?.()||('cue-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
  function mount(root,names,send){
    const $=id=>root.querySelector('[data-desk="'+id+'"]'),rooms=new Map();
    let rows=[],raw,stored=true,locked=false,drawn='';
    function read(){
      if(!stored)return;
      try{
        const saved=localStorage.getItem(storageKey);if(saved===raw)return;
        const parsed=JSON.parse(saved||'[]');
        if(!Array.isArray(parsed))throw Error();
        const ids=new Set();
        rows=parsed.filter(r=>{
          if(!r||typeof r.id!=='string'||ids.has(r.id)||!Object.hasOwn(names,r.room)||
            !Object.hasOwn(names[r.room],r.kind)||!Object.hasOwn(label,r.state)||
            typeof r.call!=='string'||typeof r.note!=='string'||!Number.isFinite(r.sent))return false;
          ids.add(r.id);return true;
        });raw=saved;
      }catch{stored=false;$('feedback').textContent='Cue list changes will last for this tab.';}
    }
    function write(){
      const next=JSON.stringify(rows);
      if(stored)try{localStorage.setItem(storageKey,next);raw=next;}catch{stored=false;$('feedback').textContent='Cue list changes will last for this tab.';}
    }
    async function edit(fn){
      const run=()=>{read();const result=fn();if(result)write();paint();return result;};
      if(navigator.locks){
        try{return await navigator.locks.request(storageKey,run);}catch(e){
          if(e.name!=='SecurityError'&&e.name!=='NotSupportedError')throw e;
        }
      }
      return run();
    }
    const selected=()=>rows.find(r=>active(r.state))||rows.find(r=>r.state==='ready');
    const compatible=room=>rooms.get(room)?.ready===true;
    function roomOptions(){
      $('event').replaceChildren(...Object.entries(names[$('room').value]).map(([value,text])=>new Option(text,value)));
    }
    function action(text,title,handler){
      const b=document.createElement('button');b.type='button';b.textContent=text;b.setAttribute('aria-label',title);b.onclick=handler;return b;
    }
    function changeOrder(id,offset){
      edit(()=>{const i=rows.findIndex(r=>r.id===id),j=i+offset;
        if(rows[i]?.state!=='ready'||rows[j]?.state!=='ready')return false;
        [rows[i],rows[j]]=[rows[j],rows[i]];return true;});
    }
    function paint(){
      const signature=JSON.stringify(rows);
      if(signature!==drawn){
        drawn=signature;
        $('list').replaceChildren(...rows.map((r,i)=>{
          const li=document.createElement('li'),name=names[r.room][r.kind],body=document.createElement('div'),line=document.createElement('strong');
          li.dataset.state=r.state;li.dataset.id=r.id;line.textContent=(i+1)+'. '+name;body.append(line);
          const info=document.createElement('small');info.textContent=roomName(r.room)+' · '+label[r.state]+(r.note?' · '+r.note:'');body.append(info);li.append(body);
          if(!active(r.state)){
            const actions=document.createElement('div');actions.className='btns';
            if(r.state==='ready'&&rows[i-1]?.state==='ready')actions.append(action('↑','Move '+name+' up',()=>changeOrder(r.id,-1)));
            if(r.state==='ready'&&rows[i+1]?.state==='ready')actions.append(action('↓','Move '+name+' down',()=>changeOrder(r.id,1)));
            actions.append(action('Remove','Remove '+name,()=>edit(()=>{const j=rows.findIndex(x=>x.id===r.id&&x.call===r.call&&!active(x.state));if(j<0)return false;rows.splice(j,1);return true;})));
            li.append(actions);
          }
          return li;
        }));
      }
      const r=selected();
      $('standby').textContent=r?(active(r.state)?label[r.state]:'Standby')+' · '+roomName(r.room)+' · '+names[r.room][r.kind]:
        rows.length?'Cue list complete.':'Add an event to begin.';
      $('go').disabled=locked||!r||active(r.state)||!compatible(r.room);
      $('skip').disabled=locked||!r;$('skip').textContent=r&&active(r.state)?'Release this cue':'Skip next cue';
      $('again').disabled=locked||!rows.length||rows.some(r=>active(r.state)||r.state==='ready');
      const progress={called:'Waiting for the screen to acknowledge this call.',waiting:'The screen has accepted this cue and is waiting for its cast or room phase.',
        playing:'The screen is playing this cue. The next call becomes available when it finishes.',
        unconfirmed:'The screen has not confirmed the request. Releasing it lets you call the next cue.'};
      $('skip').title=r&&active(r.state)?'Stop tracking this call. The room director continues handling its performance.':'';
      $('reason').textContent=!r?'':active(r.state)?progress[r.state]:
        compatible(r.room)?(r.note||'Press GO to call this event.'):'Open a compatible '+roomName(r.room)+' screen to call this event.';
    }
    $('room').onchange=roomOptions;roomOptions();
    $('add').onclick=()=>{
      const room=$('room').value,kind=$('event').value,note=$('note').value.trim();if(!Object.hasOwn(names[room],kind))return;
      $('note').value='';
      edit(()=>{rows.push({id:token(),call:token(),room,kind,note,state:'ready',sent:0});return true;});
    };
    $('skip').onclick=()=>{const r=selected();if(!r)return;edit(()=>{
      const live=selected();if(live?.id!==r.id||live.call!==r.call)return false;live.state='skipped';return true;
    });};
    $('again').onclick=()=>edit(()=>{
      if(!rows.length||rows.some(r=>active(r.state)||r.state==='ready'))return false;
      rows=rows.map(r=>({...r,call:token(),state:'ready',sent:0}));return true;
    });
    $('go').onclick=async()=>{
      if(locked)return;const next=selected();if(!next||next.state!=='ready')return;
      locked=true;paint();let dispatch;
      try{
        await edit(()=>{
          const r=selected();if(!r||r.id!==next.id||r.call!==next.call||r.state!=='ready'||!compatible(r.room))return false;
          r.state='called';r.sent=Date.now();dispatch={...r};return true;
        });
        if(!dispatch)return;
        let response;
        try{response=await send(dispatch.room,dispatch.kind,dispatch.call);}catch{}
        await edit(()=>{
          const r=rows.find(x=>x.call===dispatch.call);if(r?.state!=='called')return false;
          if(!response){r.state='unconfirmed';return true;}
          if(!response.screens){r.state='ready';r.sent=0;rooms.delete(r.room);return true;}
          return false;
        });
      }finally{locked=false;paint();}
    };
    function update(room,screen,version){
      const info=screen?.timedShow;
      rooms.set(room,{ready:!!info&&(room!=='auditorium'||version>=2)});
      const current=rows.find(r=>r.room===room&&active(r.state));
      if(!current){paint();return;}
      const receipt=info?.cue;
      const state=receipt?.id===current.call&&receipt.kind===current.kind&&['waiting','playing','finished','unavailable','interrupted'].includes(receipt.state)?
        receipt.state:Date.now()-current.sent>=12000?'unconfirmed':null;
      if(!state||current.state===state){paint();return;}
      edit(()=>{
        const r=rows.find(x=>x.call===current.call);if(!r||!active(r.state)||r.state===state||(r.state==='playing'&&state==='waiting'))return false;
        r.state=state;return true;
      });
    }
    window.addEventListener('storage',e=>{if(e.key===null||e.key===storageKey){read();paint();}});
    read();paint();
    return {update,offline:()=>{rooms.clear();paint();}};
  }
  window.CinemaCueDesk={mount};
})();
