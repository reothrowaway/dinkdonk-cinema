(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const letters = 'awsedftgyhujk';
  const names = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B','C'];
  const board = el('keys'), keys = [];
  const inputs = new Map(), voices = new Map();
  let context, instrument, overture, frame, melodyPitch = null;

  function updateKeys() {
    const base = Number(el('octave').value);
    keys.forEach((button, i) => {
      const down = voices.has(base + i) || melodyPitch === base + i;
      button.classList.toggle('down', down);
      button.setAttribute('aria-pressed', String(down));
      const octave = Math.floor((base + i) / 12) - 1;
      button.setAttribute('aria-label', names[i] + octave + ' (' + letters[i].toUpperCase() + ')');
    });
    el('stop').disabled = !overture && !inputs.size;
    el('overture').disabled = !!overture;
  }

  function silence(message = 'Sound stopped.') {
    cancelAnimationFrame(frame);
    overture = null;
    melodyPitch = null;
    inputs.clear();
    voices.clear();
    instrument?.silence();
    updateKeys();
    el('status').textContent = message;
  }

  function enable() {
    try {
      if (!context) {
        context = new AudioContext();
        instrument = CinemaOrgan.create(context);
        instrument.volume(Number(el('volume').value) / 100);
        instrument.register(document.querySelector('[name=stop]:checked').value);
      }
      if (context.state !== 'running') context.resume().catch(() => silence('Audio could not start. Try playing a key again.'));
      return true;
    } catch { silence('Audio is unavailable in this browser.'); return false; }
  }

  function release(id) {
    const pitch = inputs.get(id);
    if (pitch === undefined) return;
    inputs.delete(id);
    if (![...inputs.values()].includes(pitch)) {
      voices.get(pitch)?.release();
      voices.delete(pitch);
    }
    updateKeys();
    if (!inputs.size && !overture) el('status').textContent = 'Ready to play.';
  }
  function press(id, index) {
    const pitch = Number(el('octave').value) + index;
    if (inputs.get(id) === pitch || !enable()) return;
    release(id);
    inputs.set(id, pitch);
    if (!voices.has(pitch)) voices.set(pitch, instrument.note(pitch));
    updateKeys();
    if (!overture && inputs.size === 1) el('status').textContent = 'Playing keyboard.';
  }
  let whites = 0;
  names.forEach((name, i) => {
    const black = name.includes('♯'), button = document.createElement('button');
    button.type = 'button';
    button.className = 'key ' + (black ? 'black' : 'white');
    button.dataset.note = String(i);
    if (black) button.style.left = whites * 12.5 + '%';
    else whites++;
    const pitch = document.createElement('span'), key = document.createElement('kbd');
    pitch.className = 'pitch';
    pitch.textContent = name;
    key.textContent = letters[i].toUpperCase();
    button.append(pitch, key);
    button.addEventListener('click', event => {
      // Assistive technology can activate a note without a pointer or key-down event.
      if (event.detail) return;
      const id = Symbol();
      press(id, i);
      setTimeout(() => release(id), 450);
    });
    keys.push(button);
    board.append(button);
  });
  const keyAt = node => node?.closest('.key');
  board.addEventListener('pointerdown', event => {
    const key = keyAt(event.target);
    if (!key || event.button !== 0) return;
    event.preventDefault();
    board.setPointerCapture(event.pointerId);
    press(event.pointerId, Number(key.dataset.note));
  });
  board.addEventListener('pointermove', event => {
    if (!board.hasPointerCapture(event.pointerId)) return;
    const key = keyAt(document.elementFromPoint(event.clientX, event.clientY));
    if (key) press(event.pointerId, Number(key.dataset.note));
    else release(event.pointerId);
  });
  for (const name of ['pointerup','pointercancel','lostpointercapture']) {
    board.addEventListener(name, event => release(event.pointerId));
  }
  window.addEventListener('keydown', event => {
    if (event.ctrlKey || event.altKey || event.metaKey || event.target.closest?.('textarea,input:not([type=radio]):not([type=range]),[contenteditable=true]')) return;
    const key = keyAt(event.target);
    const focusKey = key && ['Enter','Space'].includes(event.code);
    const index = focusKey ? Number(key.dataset.note) : letters.indexOf(event.key.toLowerCase());
    if (index < 0 || (!focusKey && event.key.length !== 1)) return;
    event.preventDefault();
    if (!event.repeat) press(event.code, index);
  });
  window.addEventListener('keyup', event => { if (inputs.has(event.code)) { event.preventDefault(); release(event.code); } });
  document.querySelectorAll('[name=stop]').forEach(radio=>radio.addEventListener('change',()=>instrument?.register(radio.value)));
  el('volume').addEventListener('input',event=>instrument?.volume(Number(event.target.value) / 100));
  el('octave').addEventListener('change', () => { for (const id of [...inputs.keys()]) release(id); updateKeys(); });
  el('overture').addEventListener('click', () => {
    if (overture || !enable()) return;
    overture = instrument.playOverture();
    el('status').textContent = 'Playing the house overture.';
    updateKeys();
    function follow() {
      if (!overture) return;
      const now = context.currentTime;
      if (now >= overture.end) {
        overture = null;
        melodyPitch = null;
        updateKeys();
        el('status').textContent = 'Overture complete.';
        return;
      }
      const pitch = overture.melody.find(n => n.time <= now && now < n.end)?.pitch ?? null;
      if (pitch !== melodyPitch) { melodyPitch = pitch; updateKeys(); }
      frame = requestAnimationFrame(follow);
    }
    follow();
  });
  el('stop').addEventListener('click', () => silence());
  const releaseKeys = () => { for (const id of [...inputs.keys()]) release(id); };
  window.addEventListener('blur', releaseKeys);
  window.addEventListener('pagehide', () => { if (overture || inputs.size) silence(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) releaseKeys(); });
  updateKeys();
})();
