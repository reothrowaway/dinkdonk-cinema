(() => {
  'use strict';
  const duration = 18000;
  const allowed = s => !!s && s.screen === 'auto' && !s.houseOut && !s.intermissionUntil &&
    !s.shadowRound && (s.phase === 'seating' || s.phase === 'up');

  function player(video, visible) {
    let id = 0, started = 0, timer = 0, finished = 0;
    const elapsed = () => Math.max(0,(Date.now()-started)/1000);
    function stop() {
      clearTimeout(timer);
      id = 0;
      video.pause();
      video.hidden = true;
      video.classList.remove('needs-audio');
      visible(false);
    }
    function finish() { finished = id; stop(); }
    function align() {
      if (!id || !Number.isFinite(video.duration) || video.seeking) return;
      const time = elapsed();
      if (time >= video.duration) { finish(); return; }
      if (Math.abs(video.currentTime-time)>.18) video.currentTime=time;
    }
    async function play() {
      const cue = id;
      if (!cue) return;
      align();
      if (id !== cue) return;
      try { await video.play(); }
      catch (error) {
        if (id !== cue || error.name === 'AbortError') return;
        if (error.name !== 'NotAllowedError') { finish(); return; }
        video.muted = true;
        video.classList.add('needs-audio');
        try { await video.play(); } catch { if (id===cue) finish(); }
      }
    }
    function enableAudio() {
      if (id && video.muted) {
        video.muted = false;
        video.classList.remove('needs-audio');
        void play();
      }
    }
    video.addEventListener('loadedmetadata',play);
    video.addEventListener('playing',align);
    video.addEventListener('ended',finish);
    video.addEventListener('error',finish);
    video.addEventListener('click',enableAudio);
    video.addEventListener('keydown',e=>{
      if (e.key==='Enter' || e.key===' ') { e.preventDefault(); enableAudio(); }
    });
    return function sync(cue, localStart) {
      if (!Number.isFinite(cue) || !cue || cue===finished || Date.now()>=localStart+duration) {
        if(id)stop();
        return;
      }
      if (id === cue) return;
      stop(); id=cue; started=localStart;
      video.hidden=false; visible(true); video.muted=false;
      timer=setTimeout(finish,Math.max(0,localStart+duration-Date.now()));
      if (!video.hasAttribute('src') || video.error) {
        video.preload='auto'; video.src='concepts/house-organ/save-me-a-seat.mp4';
      }
      if (video.readyState>=1) void play(); else video.load();
    };
  }
  const api = {allowed,duration,player};
  if (typeof module==='object' && module.exports) module.exports=api;
  else window.CinemaSingAlong=api;
})();
