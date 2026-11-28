(() => {
  'use strict';
  const el=id=>document.getElementById(id),video=el('player'),F=window.CaptionFile;
  const track=video.addTextTrack('captions','Caption desk','en');
  const prefix='dinkdonk.captions.v1.',sheets=new Map(),drafts=new Map(),perPage=10;
  let key='',objectURL=null,sheet,selected=null,baseline=null,page=0,previewEnd=null,canStore=true;
  const sampleKey='sync-leader-v1',sampleCues=[{id:'sync-tone',start:6000,end:7000,text:'[Short sync tone]'}];
  const report=message=>{el('status').textContent=message;};
  const now=()=>Math.round((video.currentTime||0)*1000);
  const duration=()=>Number.isFinite(video.duration)?Math.round(video.duration*1000):null;
  const id=()=>Array.from(crypto.getRandomValues(new Uint32Array(3)),v=>v.toString(36)).join('-');
  function read(k){
    if(canStore)try{return localStorage.getItem(prefix+k);}catch{canStore=false;}
    return undefined;
  }
  function fromStore(raw,k){
    if(!raw)return k===sampleKey?sampleCues.slice():[];
    const cues=JSON.parse(raw);
    if(!Array.isArray(cues))throw Error('Invalid saved cue sheet.');
    const ids=new Set();
    for(const c of cues){F.verify(c);if(typeof c.id!=='string'||!c.id||ids.has(c.id))throw Error('Invalid saved cue ID.');ids.add(c.id);}
    return F.ordered(cues);
  }
  function rememberDraft(){
    if(!key)return;
    const draft={selected,baseline,start:el('in').value,end:el('out').value,text:el('words').value};drafts.set(key,draft);
    try{sessionStorage.setItem(prefix+'draft.'+key,JSON.stringify(draft));}catch{}
  }
  function setForm(cue,at=now()){
    selected=cue?.id||null;baseline=cue?JSON.stringify(cue):null;el('copy').hidden=true;
    el('in').value=F.time(cue?.start??at);
    el('out').value=F.time(cue?.end??Math.min(at+1000,duration()??at+1000));
    el('words').value=cue?.text||'';formTitle();
  }
  function formTitle(){
    el('form-title').textContent=selected?'Edit caption':'New caption';
    el('save').textContent=selected?'Save changes':'Add cue';el('remove').disabled=!selected;
  }
  function restoreDraft(){
    let draft=drafts.get(key);
    try{if(!draft)draft=JSON.parse(sessionStorage.getItem(prefix+'draft.'+key)||'null');}catch{}
    if(!draft||![draft.start,draft.end,draft.text].every(v=>typeof v==='string')){setForm(null,0);return;}
    selected=draft.selected||null;baseline=draft.baseline||null;el('copy').hidden=true;
    el('in').value=draft.start;el('out').value=draft.end;el('words').value=draft.text;formTitle();
  }
  function syncTrack(){
    track.mode='showing';
    for(const cue of Array.from(track.cues||[]))track.removeCue(cue);
    for(const c of sheet.cues){
      const cue=new VTTCue(c.start/1000,c.end/1000,F.escape(c.text));cue.id=c.id;track.addCue(cue);
    }
  }
  function progress(){
    const t=now();el('clock').textContent=F.time(t);
    if(previewEnd!==null&&t>=previewEnd){const end=previewEnd;previewEnd=null;video.pause();video.currentTime=end/1000;}
    for(const row of el('cues').children){
      const on=t>=Number(row.dataset.start)&&t<Number(row.dataset.end);
      row.classList.toggle('current',on);
      if(on)row.setAttribute('aria-current','time');else row.removeAttribute('aria-current');
    }
  }
  function seek(ms){
    const end=duration();if(end===null){report('Wait for the video to open before seeking.');return false;}
    video.currentTime=Math.min(end,Math.max(0,ms))/1000;progress();return true;
  }
  function rows(){
    const total=sheet.cues.length,last=Math.max(0,Math.ceil(total/perPage)-1);
    page=Math.max(0,Math.min(page,last));el('cues').replaceChildren();
    for(const c of sheet.cues.slice(page*perPage,(page+1)*perPage)){
      const row=document.createElement('li');row.className='cue';row.dataset.start=c.start;row.dataset.end=c.end;
      const edit=document.createElement('button'),range=document.createElement('span'),words=document.createElement('span');
      edit.type='button';edit.className='entry';range.textContent=F.time(c.start).replace(/^00:/,'')+' – '+F.time(c.end).replace(/^00:/,'');words.textContent=c.text;
      edit.append(range,words);edit.onclick=()=>{previewEnd=null;video.pause();seek(c.start);setForm(c);rememberDraft();};
      const play=document.createElement('button');play.type='button';play.textContent='Play cue';play.onclick=async()=>{
        previewEnd=null;if(!seek(c.start))return;previewEnd=c.end;
        try{await video.play();}catch{previewEnd=null;report('Press Play on the video to preview this cue.');}
      };
      row.append(edit,play);el('cues').append(row);
    }
    el('count').textContent=total+' '+(total===1?'cue':'cues');el('undo').disabled=!sheet.undo.length;
    el('vtt').disabled=el('srt').disabled=!total;el('pages').hidden=last===0;el('page').textContent=(page+1)+' / '+(last+1);
    el('prev').disabled=!page;el('next').disabled=page===last;progress();
  }
  function refresh(raw){
    try{sheet.cues=fromStore(raw,key);}catch{report('The stored cue sheet could not be read.');return false;}
    sheet.raw=raw;sheet.undo=[];syncTrack();rows();return true;
  }
  async function change(make,message,after,undo=false){
    const requested=key;
    const commit=()=>{
      if(key!==requested)return;
      try{
        const raw=read(key);
        if(raw!==undefined&&sheet.raw!==raw){
          if(refresh(raw))report('The sheet changed in another tab. Review it and try again. Your form is still here.');
          return;
        }
        const previous=sheet.cues;
        const next=F.ordered(make(previous));for(const c of next)F.verify(c);
        if(JSON.stringify(next)===JSON.stringify(previous)){report('The cue sheet is already up to date.');return;}
        const serialized=JSON.stringify(next);
        if(canStore)try{localStorage.setItem(prefix+key,serialized);sheet.raw=serialized;}catch{canStore=false;}
        if(undo)sheet.undo.pop();else{sheet.undo.push(previous);if(sheet.undo.length>20)sheet.undo.shift();}
        sheet.cues=next;previewEnd=null;syncTrack();if(after)after();rememberDraft();rows();
        report(message+(canStore?'':' Save a caption file to keep this session.'));
      }catch(e){report(e.message);}
    };
    if(navigator.locks){
      try{await navigator.locks.request(prefix+requested,commit);return;}
      catch{/* Some offline viewers decline browser locks. The revision check still applies. */}
    }
    commit();
  }
  function open(k,title,url){
    rememberDraft();video.pause();previewEnd=null;const old=objectURL;objectURL=url.startsWith('blob:')?url:null;
    key=k;page=0;el('title').textContent=title;video.src=url;video.load();if(old)URL.revokeObjectURL(old);
    const raw=read(k);
    const known=sheets.has(k);
    if(!known)sheets.set(k,{cues:[],undo:[],raw:null});
    sheet=sheets.get(k);report('');
    if(raw!==undefined||!known){
      try{if(raw!==sheet.raw)sheet.undo=[];sheet.cues=fromStore(raw,k);sheet.raw=raw;}catch{sheet.raw=raw;report('The stored cue sheet could not be read.');}
    }
    restoreDraft();syncTrack();rows();el('sample').disabled=key===sampleKey;
  }
  function mark(which){
    if(duration()===null){report('Wait for the video to open before marking a time.');return;}
    el(which).value=F.time(now());rememberDraft();
  }
  ['in','out'].forEach(which=>el('mark-'+which).onclick=()=>mark(which));
  ['in','out','words'].forEach(control=>el(control).addEventListener('input',rememberDraft));
  el('earlier').onclick=()=>{video.pause();previewEnd=null;seek(now()-100);};el('later').onclick=()=>{video.pause();previewEnd=null;seek(now()+100);};
  document.addEventListener('keydown',e=>{
    if(e.ctrlKey||e.metaKey||e.altKey||e.repeat||e.target.closest('input,textarea,select,[contenteditable=true]'))return;
    const which={i:'in',o:'out'}[e.key.toLowerCase()];if(which){e.preventDefault();mark(which);}
  });
  el('new').onclick=()=>{setForm(null);rememberDraft();el('words').focus();};
  el('save').onclick=()=>{
    const cue={id:selected||id(),start:F.milliseconds(el('in').value),end:F.milliseconds(el('out').value),text:el('words').value.trim()};
    const editing=selected;
    change(list=>{
      F.verify(cue);if(duration()!==null&&cue.end>duration())throw Error('The out time falls after the end of this video.');
      if(editing&&JSON.stringify(list.find(c=>c.id===editing))!==baseline){
        el('copy').hidden=false;throw Error('This cue changed in another tab. Select it to review the saved version, or choose Save as new to keep your edit.');
      }
      return [...list.filter(c=>c.id!==cue.id),cue];
    },editing?'Caption updated.':'Caption added.',()=>{page=Math.floor(sheet.cues.findIndex(c=>c.id===cue.id)/perPage);setForm(cue);});
  };
  el('copy').onclick=()=>{selected=null;baseline=null;formTitle();el('copy').hidden=true;el('save').click();};
  el('remove').onclick=()=>{const target=selected;if(target)change(list=>{
    if(JSON.stringify(list.find(c=>c.id===target))!==baseline)throw Error('This cue changed in another tab. Select the saved version before removing it.');
    return list.filter(c=>c.id!==target);
  },'Caption removed.',()=>setForm(null));};
  el('undo').onclick=()=>{if(sheet.undo.length)change(()=>sheet.undo.at(-1),'Previous cue sheet restored.',()=>setForm(null),true);};
  el('media').onchange=e=>{
    const file=e.target.files[0];if(file)open('file.'+JSON.stringify([file.name,file.size,file.lastModified]),file.name,URL.createObjectURL(file));e.target.value='';
  };
  el('sample').onclick=()=>open(sampleKey,'Picture & sound sync leader','./sync-leader.mp4');
  el('import').onchange=async e=>{
    const file=e.target.files[0],source=key;e.target.value='';if(!file)return;
    try{
      const imported=F.read(await file.text());if(key!==source)return;
      if(duration()!==null&&imported.some(c=>c.end>duration()))throw Error('A cue ends after this video. Open the matching video and import again.');
      const signature=c=>JSON.stringify([c.start,c.end,c.text]);
      await change(list=>{
        const seen=new Set(list.map(signature)),added=[];
        for(const c of imported){const s=signature(c);if(!seen.has(s)){seen.add(s);added.push({...c,id:id()});}}
        return [...list,...added];
      },'Imported captions from '+file.name+'.');
    }catch(error){if(source===key)report(error.message);}
  };
  ['vtt','srt'].forEach(format=>el(format).onclick=()=>{
    const name=key===sampleKey?'sync-leader':el('title').textContent.replace(/\.[^.]+$/,'');
    const url=URL.createObjectURL(new Blob([F.write(sheet.cues,format)],{type:format==='vtt'?'text/vtt;charset=utf-8':'text/plain;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=(name||'captions')+'.'+format;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  });
  el('prev').onclick=()=>{page--;rows();};el('next').onclick=()=>{page++;rows();};
  video.addEventListener('timeupdate',progress);video.addEventListener('seeked',progress);
  video.addEventListener('loadedmetadata',()=>{syncTrack();progress();});
  video.addEventListener('error',()=>report('This video could not be played. Choose a local video your browser supports.'));
  window.addEventListener('storage',e=>{
    if(e.key!==prefix+key&&e.key!==null)return;
    const raw=read(key);if(raw!==undefined&&refresh(raw))report('Cue sheet updated from another tab. Your form is still here.');
  });
  open(sampleKey,'Picture & sound sync leader','./sync-leader.mp4');
})();
