(() => {
  'use strict';
  const get = id => document.getElementById(id);
  const reels = get('reels'), format = get('format'), speed = get('speed');
  const storageKey = 'dinkdonk.reel-sheet.v1';

  function timecode(frames, fps) {
    const seconds = Math.floor(frames / fps);
    const parts = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60, frames % fps];
    return parts.map(n => String(n).padStart(2, '0')).join(':');
  }

  function addRow(feet, frames) {
    const row = get('row').content.firstElementChild.cloneNode(true);
    row.querySelector('.feet').value = feet;
    row.querySelector('.frames').value = frames;
    reels.append(row);
    return row;
  }

  function update() {
    const fps = Number(speed.value), perFoot = Number(format.value), values = [];
    let cumulative = 0, firstProblem = '';
    get('factor').textContent = perFoot + ' frames per foot · ' + fps + ' fps';
    Array.from(reels.children).forEach((row, index) => {
      const name = 'Reel ' + (index + 1);
      const feet = row.querySelector('.feet'), frames = row.querySelector('.frames');
      const remove = row.querySelector('.remove');
      row.querySelector('h2').textContent = name;
      frames.max = String(perFoot - 1);
      feet.setAttribute('aria-label', name + ' feet');
      frames.setAttribute('aria-label', name + ' extra frames');
      remove.setAttribute('aria-label', 'Remove ' + name.toLowerCase());
      remove.disabled = reels.children.length === 1;
      for (const input of [feet, frames]) input.setAttribute('aria-invalid', String(!input.validity.valid));
      const count = feet.valueAsNumber * perFoot + frames.valueAsNumber;
      const valid = feet.validity.valid && frames.validity.valid;
      cumulative = valid && cumulative !== null ? cumulative + count : null;
      row.querySelector('.duration').textContent = valid ? timecode(count, fps) : '—';
      row.querySelector('.end').textContent = cumulative === null ? '—' : timecode(cumulative, fps);
      if (!valid && !firstProblem) firstProblem = name + ' needs whole feet from 0 to 99,999 and extra frames from 0 to ' + frames.max + '.';
      values.push([feet.value, frames.value]);
    });
    get('total').value = cumulative === null ? '—' : timecode(cumulative, fps);
    get('problem').textContent = firstProblem;
    get('problem').hidden = !firstProblem;
    try { localStorage.setItem(storageKey, JSON.stringify({format:format.value, speed:speed.value, reels:values})); } catch {}
  }

  let saved;
  try { saved = JSON.parse(localStorage.getItem(storageKey)); } catch {}
  if (saved && [...format.options].some(o => o.value === saved.format) &&
      [...speed.options].some(o => o.value === saved.speed) && Array.isArray(saved.reels) && saved.reels.length &&
      saved.reels.every(r => Array.isArray(r) && r.length === 2 && r.every(v => typeof v === 'string'))) {
    format.value = saved.format;
    speed.value = saved.speed;
    saved.reels.forEach(([feet, frames]) => addRow(feet, frames));
  } else addRow('0', '0');
  reels.addEventListener('input', update);
  format.addEventListener('change', update);
  speed.addEventListener('change', update);
  get('add').addEventListener('click', () => {
    const row = addRow('0', '0');
    update();
    row.querySelector('.feet').focus();
  });
  reels.addEventListener('click', event => {
    if (!event.target.matches('.remove') || reels.children.length <= 1) return;
    const row = event.target.closest('.reel');
    const next = row.nextElementSibling || row.previousElementSibling;
    row.remove();
    update();
    next.querySelector('.feet').focus();
  });
  update();
})();
