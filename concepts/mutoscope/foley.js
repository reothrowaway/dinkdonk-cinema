(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const rate = 48000, seconds = 4, length = seconds * rate, limit = 128;
  const key = 'dinkdonk.foley.sallie.v1';
  const pads = [el('low'),el('high')];
  let audio, buffers, playback, startTime = 0, frame = 0;
  let phase = 'idle', run = 0, take = [], recording = [], pictureReady = false;
  let lastCard = -1, lastCount = -1, nextFlash = 0;

  // A short contact transient followed by the two halves' different cavity resonances.
  function shell(high) {
    const result = new Float32Array(Math.round(rate * .17));
    let seed = high ? 7927 : 3967, filtered = 0;
    const pitch = high ? 1.29 : 1;
    for (let i = 0; i < result.length; i++) {
      const t = i / rate, angle = 2 * Math.PI * pitch * t;
      seed = (Math.imul(seed,1664525) + 1013904223) >>> 0;
      const noise = seed / 2147483648 - 1;
      filtered += .32 * (noise-filtered);
      const knock = .35 * Math.sin(angle*356) * Math.exp(-t*55) +
        .23 * Math.sin(angle*864) * Math.exp(-t*110) +
        .13 * Math.sin(angle*1451) * Math.exp(-t*170);
      const edge = .48 * (noise - filtered) * Math.exp(-t*370);
      result[i] = (knock + edge) * Math.min(1,i/13);
    }
    return result;
  }
  const samples = [shell(false),shell(true)];
  function mix(hits) {
    const output = new Float32Array(length);
    for (const {at,side} of hits) {
      const sound = samples[side];
      for (let i=0, end=Math.min(sound.length,length-at); i<end; i++) output[at+i] += sound[i];
    }
    for (let i=0; i<length; i++) output[i]=Math.max(-1,Math.min(1,output[i]));
    return output;
  }
  function audioBuffer(values) {
    const buffer = audio.createBuffer(1,values.length,rate);
    buffer.copyToChannel(values,0);
    return buffer;
  }
  async function openAudio() {
    if (!audio) {
      audio = new AudioContext({latencyHint:'interactive'});
      buffers = samples.map(audioBuffer);
    }
    if (audio.state !== 'running') await audio.resume();
    if (audio.state !== 'running') throw Error();
  }
  function sound(buffer,when) {
    const source=audio.createBufferSource();
    source.buffer=buffer;
    source.connect(audio.destination);
    source.onended=()=>source.disconnect();
    source.start(when);
    return source;
  }
  function restore() {
    try {
      const saved=JSON.parse(localStorage.getItem(key));
      if (Array.isArray(saved) && saved.length<=limit &&
          saved.every(h=>h && Number.isInteger(h.at) && h.at>=0 && h.at<length && [0,1].includes(h.side)))
        take=saved.sort((a,b)=>a.at-b.at);
    } catch { /* The bench also works without storage. */ }
  }
  function status(text) {
    if (el('status').textContent !== text) el('status').textContent=text;
  }
  function buttons() {
    const idle=phase==='idle';
    el('record').disabled=!idle || !pictureReady;
    el('play').disabled=!idle || !pictureReady || !take.length;
    el('download').disabled=!idle || !take.length;
    el('stop').disabled=idle;
    el('stop').textContent=phase==='record' ? 'Cancel take' : 'Stop';
    pads.forEach(p=>p.disabled=phase==='replay');
  }
  function marks(hits) {
    const dots=hits.map(({at,side})=>{
      const dot=document.createElement('i');
      dot.className='mark'+(side ? ' b' : '');
      dot.style.left=100*at/length+'%';
      return dot;
    });
    el('marks').replaceChildren(...dots);
    el('hits').textContent=hits.length+(hits.length===1 ? ' hit' : ' hits');
  }
  function picture(t) {
    const card=Math.min(43,Math.floor(t*11))%11;
    if (card!==lastCard) {
      el('cards').style.transform='translate('+(-25*(card%4))+'%,'+(-100*Math.floor(card/4)/3)+'%)';
      lastCard=card;
    }
    el('cursor').style.left='min(calc(100% - 2px),'+(100*t/seconds)+'%)';
    el('position').textContent=t.toFixed(2)+' / 4.00 s';
  }
  const flashTimers=[];
  function flash(side) {
    clearTimeout(flashTimers[side]);
    pads[side].classList.add('hit');
    flashTimers[side]=setTimeout(()=>pads[side].classList.remove('hit'),95);
  }
  async function strike(side) {
    if (phase==='replay' || phase==='opening') return;
    const session=run;
    try { await openAudio(); } catch { status('Sound is unavailable in this browser.'); return; }
    if (session!==run || document.hidden) return;
    const now=audio.currentTime;
    const at=Math.round((now-startTime)*rate);
    if (phase==='record') {
      if (at<0 || at>=length || recording.length>=limit) return;
      recording.push({at,side});
      marks(recording);
    }
    sound(buffers[side],now);
    flash(side);
  }
  function finish(message,completed) {
    ++run;
    if (playback) { playback.stop(); playback=null; }
    cancelAnimationFrame(frame);
    if (completed && phase==='record' && recording.length) {
      take=recording;
      try { localStorage.setItem(key,JSON.stringify(take)); }
      catch { message='Take ready in this tab. Save the WAV to keep it.'; }
    }
    phase='idle'; recording=[]; lastCount=-1;
    marks(take); buttons(); picture(completed ? seconds : 0); status(message);
  }
  function tick() {
    if (phase!=='replay' && phase!=='record') return;
    const t=audio.currentTime-startTime;
    if (t>=seconds) {
      const message=phase==='replay' ? 'Playback finished.' :
        recording.length ? 'Take ready to replay or save.' : 'No hits recorded. Your previous take is kept.';
      finish(message,true);
      return;
    }
    if (t<0 && phase==='record') {
      const n=Math.ceil(-t/.5);
      if (n!==lastCount) { lastCount=n; status('Get ready · '+n); }
    } else if (phase==='record') status('Recording · Tap A and L.');
    if (phase==='replay') {
      while (nextFlash<take.length && take[nextFlash].at<=t*rate) flash(take[nextFlash++].side);
    }
    picture(Math.max(0,t));
    frame=requestAnimationFrame(tick);
  }
  async function start(mode) {
    if (phase!=='idle' || !pictureReady || (mode==='replay' && !take.length)) return;
    const session=++run;
    phase='opening'; buttons();
    try { await openAudio(); } catch { if (run===session) finish('Sound is unavailable in this browser.',false); return; }
    if (session!==run) return;
    phase=mode; recording=[]; nextFlash=0;
    startTime=audio.currentTime+(mode==='record' ? 1.5 : .05);
    if (mode==='replay') {
      playback=sound(audioBuffer(mix(take)),startTime);
      status('Playing your take.');
    }
    marks(mode==='record' ? recording : take);
    buttons(); tick();
  }
  function saveWav() {
    const output=mix(take);
    const bytes=new ArrayBuffer(44+2*length), view=new DataView(bytes);
    const tag=(at,s)=>{for (let i=0;i<s.length;i++) view.setUint8(at+i,s.charCodeAt(i));};
    tag(0,'RIFF'); view.setUint32(4,bytes.byteLength-8,true); tag(8,'WAVE'); tag(12,'fmt ');
    view.setUint32(16,16,true); view.setUint16(20,1,true); view.setUint16(22,1,true);
    view.setUint32(24,rate,true); view.setUint32(28,rate*2,true); view.setUint16(32,2,true); view.setUint16(34,16,true);
    tag(36,'data'); view.setUint32(40,length*2,true);
    for (let i=0;i<length;i++) view.setInt16(44+2*i,Math.round(output[i]*32767),true);
    const url=URL.createObjectURL(new Blob([bytes],{type:'audio/wav'})), link=document.createElement('a');
    link.href=url; link.download='sallie-gardner-foley.wav'; link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  pads.forEach((pad,side)=>{
    pad.addEventListener('pointerdown',e=>{ if (e.button===0) strike(side); });
    pad.addEventListener('click',e=>{ if (e.detail===0) strike(side); });
  });
  window.addEventListener('keydown',e=>{
    if (e.ctrlKey || e.altKey || e.metaKey || e.repeat) return;
    const side=['a','l'].indexOf(e.key.toLowerCase());
    if (side>=0) {e.preventDefault();strike(side);}
  });
  el('record').onclick=()=>start('record');
  el('play').onclick=()=>start('replay');
  el('stop').onclick=()=>finish('Stopped. Your last completed take is kept.',false);
  el('download').onclick=saveWav;
  function leave() { if (phase!=='idle') finish('Stopped. Your last completed take is kept.',false); }
  document.addEventListener('visibilitychange',()=>{ if (document.hidden) leave(); });
  window.addEventListener('pagehide',leave);
  function ready() {
    pictureReady=el('cards').naturalWidth>0;
    buttons();
    status(pictureReady ? take.length ? 'Your saved take is ready.' : 'Ready to record.' : 'The photograph could not be loaded.');
  }
  restore(); marks(take); buttons();
  el('cards').addEventListener('load',ready);
  el('cards').addEventListener('error',ready);
  if (el('cards').complete) ready();
})();
