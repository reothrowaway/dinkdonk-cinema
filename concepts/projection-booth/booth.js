(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const mode = byId('mode'), run = byId('run'), motor = byId('motor'), change = byId('change');
  const dot = byId('dot'), status = byId('status');
  const frameTime = 1000 / 24, cueDuration = 4 * frameTime;
  let onScreen = 'A', stage = 'idle', paused = false, timer = 0;
  let start = 0, elapsed = 0, motorCue = 0, changeCue = 0, motorDelay = 0;
  const running = () => stage === 'motor' || stage === 'change';
  const incoming = () => onScreen === 'A' ? 'B' : 'A';
  const guided = () => mode.value === 'guided';
  const clock = () => paused ? elapsed : performance.now() - start;

  function panel() {
    byId('reel').textContent = onScreen;
    byId('onscreen').textContent = 'ON SCREEN · ' + onScreen;
    byId('motor-state').textContent = 'MOTOR ' + incoming() + (stage === 'change' ? ' · RUNNING' : ' · IDLE');
    mode.disabled = running();
    run.textContent = running() ? (paused ? 'Resume reel' : 'Pause reel') : stage === 'idle' ? 'Start reel' : 'Run another reel';
    motor.disabled = stage !== 'motor' || paused;
    change.disabled = stage !== 'change' || paused;
  }

  function finish(message) {
    clearTimeout(timer);
    stage = 'done';
    paused = false;
    dot.hidden = true;
    status.textContent = message;
    panel();
    run.focus();
  }

  function tick() {
    clearTimeout(timer);
    if (!running() || paused) return;
    const now = clock(), cue = stage === 'motor' ? motorCue : changeCue;
    if (now < cue) {
      dot.hidden = true;
      timer = setTimeout(tick, Math.max(1, cue - now));
      return;
    }
    if (guided()) {
      dot.hidden = false;
      status.textContent = stage === 'motor' ? 'First dot. Start the incoming motor.' : 'Second dot. Change projectors.';
      return;
    }
    // The four-frame mark disappears before the reaction window closes.
    const deadline = stage === 'motor' ? motorCue + 1000 : changeCue + 1000;
    if (now >= deadline) {
      finish(stage === 'motor' ? 'Missed the motor cue. Watch for the first dot on the next reel.' : 'The outgoing reel ended before the changeover.');
      return;
    }
    dot.hidden = now >= cue + cueDuration;
    timer = setTimeout(tick, Math.max(1, (dot.hidden ? deadline : cue + cueDuration) - now));
  }

  function startReel() {
    stage = 'motor'; paused = false; start = performance.now();
    motorCue = 2200 + Math.random() * 2200;
    changeCue = motorCue + 7000;
    status.textContent = guided() ? 'Watch for the first dot. It will stay on screen.' : 'Watch the picture. Each dot lasts four frames.';
    panel(); tick(); motor.focus();
  }

  function togglePause() {
    if (!paused) {
      elapsed = clock(); paused = true; clearTimeout(timer); dot.hidden = true;
      status.textContent = 'Reel paused.';
    } else {
      paused = false; start = performance.now() - elapsed;
      status.textContent = stage === 'motor' ? 'Watch for the first dot.' : 'Motor running. Watch for the second dot.';
      tick();
    }
    panel();
  }

  function operate(action) {
    if (stage !== action || paused) return;
    const now = clock(), cue = action === 'motor' ? motorCue : changeCue;
    if (now < cue) {
      if (guided()) { status.textContent = 'Wait until the dot appears.'; return; }
      finish(action === 'motor' ? 'Motor started before its cue.' : 'Changed projectors before the second cue.');
      return;
    }
    if (!guided() && now >= cue + 1000) { tick(); return; }
    if (action === 'motor') {
      motorDelay = now - motorCue;
      stage = 'change';
      if (guided()) changeCue = now + 7000;
      status.textContent = 'Motor running. Watch for the second dot.';
      panel(); tick(); change.focus();
    } else {
      onScreen = incoming();
      finish(guided() ? 'Clean changeover. Reel ' + onScreen + ' is on screen.' :
        'Reel ' + onScreen + ' is on screen. Motor +' + Math.round(motorDelay) + ' ms · changeover +' + Math.round(now - changeCue) + ' ms.');
    }
  }
  run.addEventListener('click', () => running() ? togglePause() : startReel());
  mode.addEventListener('change', () => { status.textContent = guided() ? 'Guided practice holds each dot until you act.' : 'At 24 frames per second, each four-frame dot lasts about one sixth of a second.'; });
  motor.addEventListener('click', () => operate('motor'));
  change.addEventListener('click', () => operate('change'));
  document.addEventListener('keydown', event => {
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || !running() || event.target === mode) return;
    const key = event.key.toLowerCase();
    if (key === 'm' || key === 'c') { event.preventDefault(); operate(key === 'm' ? 'motor' : 'change'); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && running() && !paused) togglePause(); });
  window.addEventListener('pagehide', () => { if (running() && !paused) togglePause(); });
})();
