(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const query = new URLSearchParams(location.hash.slice(1));
  const films = [0, 1].map(i => (query.get('film' + i) || '').trim().slice(0, 320));
  if (films.some(title => !title)) return;
  const features = films.map((full,i) => {
    const year = query.get('year'+i);
    return /^\d{4}$/.test(year) && full.endsWith(' ('+year+')') ? {title:full.slice(0,-7),year} : {title:full,year:''};
  });
  const interval = [5, 10, 15].includes(Number(query.get('break'))) ? Number(query.get('break')) : 10;
  const key = 'dinkdonk.handbill.v1.' + JSON.stringify([films, interval]) + '.';
  const ids = ['headline', 'venue', 'start', 'occurrence'];
  const defaults = Object.fromEntries(ids.map(id => [id, el(id).value]));
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const localTime = new Intl.DateTimeFormat('en-US', {weekday:'short', month:'short', day:'numeric',
    year:'numeric', hour:'numeric', minute:'2-digit', timeZoneName:'short'});
  const utcOffset = new Intl.DateTimeFormat('en-US',{timeZoneName:'longOffset'});
  const card = el('card'), ctx = card.getContext('2d'), art = el('engraving');
  const ink = '#203646', red = '#9c392a', paper = '#fff1cf';
  let invitation = '', canExport = false, persist = true;
  const parts = new Intl.Segmenter(undefined, {granularity:'grapheme'});

  function wallTime(ms) {
    const d = new Date(ms), pad = n => String(n).padStart(2, '0');
    return [String(d.getFullYear()).padStart(4,'0'), pad(d.getMonth()+1), pad(d.getDate())].join('-') +
      'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function instants(value) {
    if (!value) return [];
    const first = new Date(value).getTime();
    if (!Number.isFinite(first) || wallTime(first) !== value) return [];
    // Check both sides of a clock change, including half-hour changes.
    const offsets = [-86400000, 0, 86400000].map(delta => new Date(first + delta).getTimezoneOffset());
    return [...new Set(offsets.map(offset => first + (offset - offsets[1]) * 60000))]
      .filter(ms => wallTime(ms) === value).sort((a,b) => a-b);
  }

  function lines(text, width) {
    const result = [];
    let current = '';
    for (const word of text.trim().split(/\s+/)) {
      const candidate = current ? current + ' ' + word : word;
      if (ctx.measureText(candidate).width <= width) { current = candidate; continue; }
      if (current) result.push(current);
      current = '';
      for (const {segment} of parts.segment(word)) {
        if (current && ctx.measureText(current + segment).width > width) {
          result.push(current); current = '';
        }
        current += segment;
      }
    }
    if (current) result.push(current);
    return result;
  }
  function block(text, top, height, maxSize, width, family, color) {
    let size = maxSize, rows;
    do {
      ctx.font = 'bold ' + size + 'px ' + family;
      rows = lines(text, width);
      if (rows.length * size * 1.12 <= height || size <= 9) break;
      size -= 1;
    } while (size > 0);
    ctx.fillStyle = color;
    const step = size * 1.12, y = top + (height - (rows.length - 1) * step) / 2;
    rows.forEach((s,i) => ctx.fillText(s, 500, y + i * step));
  }
  function rule(y, x = 72) {
    ctx.fillStyle = red; ctx.fillRect(x, y, 1000-2*x, 3);
  }
  function picture() {
    ctx.save();
    ctx.beginPath(); ctx.ellipse(500,344,295,138,0,0,Math.PI*2); ctx.clip();
    ctx.fillStyle = paper; ctx.fillRect(200,200,600,290);
    if (art.naturalWidth) {
      // Map the black and white of the embedded house halftone to the two stock colors.
      ctx.drawImage(art,200,192,600,303);
      ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = ink; ctx.fillRect(198,190,604,308);
      ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = paper; ctx.fillRect(198,190,604,308);
    }
    ctx.restore();
    ctx.strokeStyle = ink; ctx.lineWidth = 4;
    ctx.beginPath();ctx.ellipse(500,344,296,139,0,0,Math.PI*2);ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const inset = Math.abs(i-2)*13;
      ctx.fillStyle = red;
      ctx.fillRect(72+inset,312+i*16,115-inset,4);
      ctx.fillRect(813,312+i*16,115-inset,4);
    }
  }

  function draw() {
    const heading = el('headline').value.trim() || defaults.headline;
    const venue = el('venue').value.trim() || defaults.venue;
    const start = el('start').value, options = instants(start);
    const invalid = el('start').validity.badInput || (start && !options.length);
    el('start').setAttribute('aria-invalid', String(Boolean(invalid)));
    el('occurrence-wrap').hidden = options.length < 2;
    if (options.length === 2) {
      [...el('occurrence').options].forEach((o,i) => { o.textContent = (i ? 'Second · ' : 'First · ') + localTime.format(options[i]); });
    }
    const ms = options[Number(el('occurrence').value)] ?? options[0];
    const offset = options.length ? utcOffset.formatToParts(ms).find(p => p.type === 'timeZoneName').value.replace('GMT','UTC') : '';
    const when = options.length ? localTime.format(ms) + ' (' + offset + ')' : 'Date to be announced';
    const showtime = invalid ? 'Choose a valid local showtime' : when;
    invitation = [heading, films[0], interval + '-minute intermission', films[1], venue, showtime].join('\n');
    card.setAttribute('aria-label',invitation.replaceAll('\n', '. '));
    ctx.fillStyle = paper; ctx.fillRect(0,0,1000,1320);
    ctx.strokeStyle = ink; ctx.lineWidth = 8; ctx.strokeRect(24,24,952,1272);
    ctx.lineWidth = 2; ctx.strokeRect(38,38,924,1244);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.letterSpacing = '4px';
    block('DINKDONK CINEMA',48,51,30,830,'sans-serif',ink); rule(103);
    ctx.letterSpacing = '0px';
    block(heading.toUpperCase(),111,83,76,864,'Georgia, serif',red);
    picture();
    block(['OPENING FEATURE',features[0].year].filter(Boolean).join(' · '),494,52,31,820,'sans-serif',red);
    block(features[0].title,552,167,81,848,'Georgia, serif',ink);
    rule(735,157);
    block(interval + '-minute intermission',743,66,37,810,'Georgia, serif',ink);
    rule(814,157);
    block(['SECOND FEATURE',features[1].year].filter(Boolean).join(' · '),826,46,31,820,'sans-serif',red);
    block(features[1].title,881,162,81,848,'Georgia, serif',ink);
    ctx.fillStyle = ink; ctx.fillRect(40,1060,920,220);
    block(venue,1073,98,55,850,'Georgia, serif',paper);
    block(showtime,1172,88,42,850,'sans-serif',paper);
    canExport = !invalid && art.complete && Boolean(art.naturalWidth);
    ['png','print','copy'].forEach(id => { el(id).disabled = !canExport; });
    el('message').textContent = invalid ? 'That time is missing or falls in a clock change. Choose another time.' :
      !persist ? 'Browser storage is unavailable. You can still save this handbill.' : '';
    el('manual').hidden = true;
  }
  function restore(id) {
    try {
      const value = localStorage.getItem(key + id);
      if (id !== 'showtime') { el(id).value = value ?? defaults[id]; return; }
      const saved = value ? JSON.parse(value) : {};
      if (Number.isSafeInteger(saved.ms) && !Number.isNaN(new Date(saved.ms).getTime())) {
        el('start').value = wallTime(saved.ms);
        el('occurrence').value = String(Math.max(0,instants(el('start').value).indexOf(saved.ms)));
      } else { el('start').value = saved.wall || ''; el('occurrence').value = '0'; }
    } catch { persist = false; }
  }
  const keys = ['headline','venue','showtime'];
  keys.forEach(restore);
  ids.forEach(id => {
    el(id).addEventListener('input', () => {
      try {
        if (id === 'start' || id === 'occurrence') {
          if (id === 'start') el('occurrence').value = '0';
          const wall = el('start').value, ms = instants(wall)[Number(el('occurrence').value)];
          localStorage.setItem(key + 'showtime',JSON.stringify({wall,ms}));
        } else localStorage.setItem(key + id,el(id).value);
      } catch { persist = false; }
      draw();
    });
  });
  window.addEventListener('storage', e => {
    const changed = keys.filter(id => e.key === null || e.key === key + id);
    if (changed.length) { changed.forEach(restore); draw(); }
  });
  function printSheet() {
    const sheet = el('print-sheet');
    sheet.replaceChildren();
    if (!canExport) return;
    for (let i = 0; i < 4; i++) {
      const copy = document.createElement('canvas'); copy.width = card.width; copy.height = card.height;
      copy.getContext('2d').drawImage(card,0,0); sheet.append(copy);
    }
  }
  window.addEventListener('beforeprint', printSheet);
  window.addEventListener('afterprint', () => el('print-sheet').replaceChildren());
  el('print').addEventListener('click', () => window.print());
  el('png').addEventListener('click', () => card.toBlob(blob => {
    if (!blob) { el('message').textContent = 'The browser could not encode the image.'; return; }
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = 'dinkdonk-movie-handbill.png'; link.click();
    setTimeout(() => URL.revokeObjectURL(url),1000);
  }, 'image/png'));
  el('copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(invitation); el('message').textContent = 'Invitation copied.'; }
    catch { const field = el('manual'); field.value = invitation; field.hidden = false; field.focus(); field.select(); }
  });
  art.addEventListener('load', draw);
  art.addEventListener('error', () => { el('message').textContent = 'The house illustration could not be loaded.'; });
  el('empty').hidden = true; el('editor').hidden = false;
  el('zone').textContent = 'Local time in ' + zone + '. Leave blank for an undated invitation.';
  draw();
})();
