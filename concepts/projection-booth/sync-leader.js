(() => {
  'use strict';
  const video = document.getElementById('leader');
  const position = document.getElementById('position');
  const prev = document.getElementById('prev'), next = document.getElementById('next');
  const cues = document.querySelectorAll('button[data-frame]');
  const fps = 24;
  let target = null, animation = 0;

  const lastFrame = () => Math.max(0, Math.round(video.duration * fps) - 1);
  const currentFrame = () => target ?? Math.min(lastFrame(), Math.floor(video.currentTime * fps + .00001));
  function display() {
    if (!Number.isFinite(video.duration)) return;
    const frame = currentFrame();
    const twoDigits = n => String(n).padStart(2, '0');
    position.textContent = 'Frame ' + String(frame).padStart(3, '0') + ' · 00:00:' +
      twoDigits(Math.floor(frame / fps)) + ':' + twoDigits(frame % fps);
    prev.disabled = frame <= 0;
    next.disabled = frame >= lastFrame();
    for (const cue of cues) cue.disabled = false;
  }
  function seek(frame) {
    if (!Number.isFinite(video.duration)) return;
    video.pause();
    target = Math.max(0, Math.min(lastFrame(), frame));
    // Seek inside the encoded frame, clear of the timestamp boundary in different decoders.
    video.currentTime = (target + .5) / fps;
    display();
  }
  function tick() {
    display();
    if (!video.paused && !video.ended) animation = requestAnimationFrame(tick);
  }
  prev.onclick = () => seek(currentFrame() - 1);
  next.onclick = () => seek(currentFrame() + 1);
  for (const cue of cues) cue.onclick = () => seek(Number(cue.dataset.frame));
  video.addEventListener('loadedmetadata', display);
  video.addEventListener('timeupdate', display);
  video.addEventListener('seeked', () => { target = null; display(); });
  video.addEventListener('playing', () => { target = null; cancelAnimationFrame(animation); tick(); });
  video.addEventListener('pause', () => { cancelAnimationFrame(animation); display(); });
  function fail() {
    document.getElementById('error').hidden = false;
    for (const button of [prev, next, ...cues]) button.disabled = true;
    cancelAnimationFrame(animation);
  }
  video.addEventListener('error', fail);
  video.querySelector('source').addEventListener('error', fail);
  if (video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) fail(); else display();
})();
