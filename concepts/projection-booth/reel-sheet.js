(() => {
  'use strict';
  const get = id => document.getElementById(id);
  const reels = get('reels'), format = get('format'), speed = get('speed');
  const storageKey = 'dinkdonk.reel-sheet.v1';
  const switching = get('switching');
  const transferInputs = ['prep','trip','stagger'].map(get);

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

  function planSwitch(durations, fps) {
    if (!switching.open) return;
    const list = get('deliveries'), result = get('switch-result'), useStart = get('safe-start');
    list.replaceChildren();
    useStart.hidden = true;
    get('switch-origin').hidden = true;
    if (durations.some(n => !(n > 0))) {
      result.textContent = 'Enter a positive picture length for every reel to plan the two screenings.';
      return;
    }
    if (transferInputs.some(input => !input.validity.valid)) {
      result.textContent = 'Enter whole numbers within the ranges shown by the timing fields.';
      return;
    }
    const [prepSeconds, tripMinutes, delayMinutes] = transferInputs.map(input => input.valueAsNumber);
    const trip = tripMinutes * 60 * fps, delay = delayMinutes * 60 * fps;
    let start = 0, prepFree = 0, courierBack = 0, minimum = 0, late = 0;
    function cell(row, label, value) {
      const box = document.createElement('div'), name = document.createElement('span'), detail = document.createElement('strong');
      name.textContent = label; detail.textContent = value; box.append(name,detail); row.append(box);
      return detail;
    }
    durations.forEach((duration, i) => {
      const ready = Math.max(start + duration, prepFree) + prepSeconds * fps;
      prepFree = ready;
      const delivered = Math.max(ready, courierBack) + trip;
      const due = start + delay, slack = due - delivered;
      courierBack = delivered + trip;
      minimum = Math.max(minimum, delivered - start);
      const row = document.createElement('div'), title = document.createElement('b');
      row.className = 'dispatch'; title.textContent = 'Reel ' + (i+1); row.append(title);
      cell(row, 'At Booth B', timecode(delivered,fps));
      cell(row, 'Needed at', timecode(due,fps));
      const margin = cell(row, slack < 0 ? 'Late by' : 'Time to spare', timecode(Math.abs(slack),fps));
      if (slack < 0) { late++; margin.className = 'late'; }
      list.append(row);
      start += duration;
    });
    get('switch-origin').hidden = false;
    result.textContent = (late ? late + (late === 1 ? ' reel arrives late.' : ' reels arrive late.') : 'Every reel arrives on time.') +
      ' Earliest uninterrupted start for Booth B is ' + timecode(minimum,fps) + ' after Booth A.';
    const wholeMinutes = Math.ceil(minimum / (60 * fps));
    if (wholeMinutes <= Number(get('stagger').max) && delayMinutes !== wholeMinutes) {
      useStart.hidden = false;
      useStart.dataset.minutes = String(wholeMinutes);
      useStart.textContent = 'Use ' + wholeMinutes + (wholeMinutes === 1 ? ' minute' : ' minutes') + ' for Booth B';
    }
  }

  function update() {
    const fps = Number(speed.value), perFoot = Number(format.value), values = [], durations = [];
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
      durations.push(valid ? count : null);
      cumulative = valid && cumulative !== null ? cumulative + count : null;
      row.querySelector('.duration').textContent = valid ? timecode(count, fps) : '—';
      row.querySelector('.end').textContent = cumulative === null ? '—' : timecode(cumulative, fps);
      if (!valid && !firstProblem) firstProblem = name + ' needs whole feet from 0 to 99,999 and extra frames from 0 to ' + frames.max + '.';
      values.push([feet.value, frames.value]);
    });
    get('total').value = cumulative === null ? '—' : timecode(cumulative, fps);
    get('problem').textContent = firstProblem;
    get('problem').hidden = !firstProblem;
    planSwitch(durations, fps);
    const transfer = transferInputs.map(input => input.value);
    try { localStorage.setItem(storageKey, JSON.stringify({format:format.value, speed:speed.value, reels:values, transfer})); } catch {}
  }

  let saved;
  try { saved = JSON.parse(localStorage.getItem(storageKey)); } catch {}
  if (saved && [...format.options].some(o => o.value === saved.format) &&
      [...speed.options].some(o => o.value === saved.speed) && Array.isArray(saved.reels) && saved.reels.length &&
      saved.reels.every(r => Array.isArray(r) && r.length === 2 && r.every(v => typeof v === 'string'))) {
    format.value = saved.format;
    speed.value = saved.speed;
    saved.reels.forEach(([feet, frames]) => addRow(feet, frames));
    if (Array.isArray(saved.transfer) && saved.transfer.length === transferInputs.length &&
        saved.transfer.every(v => typeof v === 'string')) {
      transferInputs.forEach((input,i) => { input.value = saved.transfer[i]; });
    }
  } else addRow('0', '0');
  reels.addEventListener('input', update);
  format.addEventListener('change', update);
  speed.addEventListener('change', update);
  switching.addEventListener('toggle', update);
  for (const input of transferInputs) input.addEventListener('input', update);
  get('safe-start').addEventListener('click', event => {
    get('stagger').value = event.currentTarget.dataset.minutes;
    get('stagger').focus();
    update();
  });
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
