'use strict';

const ticket = document.getElementById('ticket');
const screenings = document.getElementById('screenings');
const save = document.getElementById('save');
const statusText = document.getElementById('status');
const retry = document.getElementById('retry');
const dateFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York', month: 'short', day: 'numeric', year: 'numeric',
});
const timeFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
});
let films = [];

function screeningTime(film) {
  if (!Number.isFinite(film.watchedTs)) return 'Time unlisted';
  return dateFormat.format(film.watchedTs) + '  /  ' + timeFormat.format(film.watchedTs);
}

function drawTicket(film) {
  const g = ticket.getContext('2d');
  const ink = '#28312b';
  const red = '#8d3025';
  const serial = String(film.id).padStart(6, '0');
  g.clearRect(0, 0, ticket.width, ticket.height);
  g.save();
  g.fillStyle = '#f3cb9c';
  g.fillRect(8, 8, 1384, 524);
  g.globalCompositeOperation = 'destination-out';
  for (const x of [8, 1392]) {
    for (let y = 25; y < 540; y += 34) {
      g.beginPath();
      g.arc(x, y, 9, 0, Math.PI * 2);
      g.fill();
    }
  }
  for (const y of [8, 532]) {
    g.beginPath();
    g.arc(1080, y, 22, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
  function rule(x1, y1, x2, y2, width = 2) {
    g.lineWidth = width;
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
  }
  function print(value, x, y, font, color = ink, limit) {
    g.font = font; g.fillStyle = color;
    if (limit) g.fillText(value, x, y, limit);
    else g.fillText(value, x, y);
  }
  g.strokeStyle = red;
  rule(69, 130, 1008, 130, 5);
  rule(69, 139, 1008, 139);
  print('DINKDONK CINEMA', 65, 108, 'bold 55px Georgia', red);
  print('SCREENING ARCHIVE', 70, 193, 'bold 23px "Courier New"');

  // Keep a two-line title in natural proportions. Only compress an unbroken word
  // or an exceptionally long title after trying smaller type.
  let lines;
  let size = 85;
  for (; size >= 39; size -= 2) {
    g.font = 'bold ' + size + 'px Georgia';
    lines = [''];
    for (const word of film.title.trim().split(/\s+/)) {
      const i = lines.length - 1;
      const candidate = lines[i] ? lines[i] + ' ' + word : word;
      if (lines[i] && g.measureText(candidate).width > 945) lines.push(word);
      else lines[i] = candidate;
    }
    if (lines.length <= 2 && lines.every(line => g.measureText(line).width <= 945)) break;
  }
  if (lines.length > 2) lines = [lines[0], lines.slice(1).join(' ')];
  lines.forEach((line, i) => print(line, 65, (lines.length === 1 ? 318 : 272) + i * size, 'bold ' + size + 'px Georgia', ink, 945));
  g.strokeStyle = ink;
  rule(69, 392, 1008, 392);
  print('SCREENED', 70, 429, 'bold 21px "Courier New"', red);
  print(screeningTime(film), 68, 479, 'bold 36px "Courier New"', ink, 940);
  g.save();
  g.strokeStyle = '#926a4e'; g.setLineDash([5, 10]); rule(1080, 37, 1080, 503); g.restore();
  g.save();
  g.translate(1225, 270); g.rotate(-Math.PI / 2); g.textAlign = 'center';
  print('ADMIT ONE', 0, -18, 'bold 65px Georgia', red);
  print('No. ' + serial, 0, 48, 'bold 32px "Courier New"');
  g.restore();
  ticket.setAttribute('aria-label', film.title + ', ' + screeningTime(film) + ', ticket ' + serial);
  ticket.hidden = false;
}

async function load() {
  retry.hidden = true;
  statusText.textContent = 'Opening the watch log…';
  try {
    const response = await fetch('/dd/data.json', { signal: AbortSignal.timeout(25000) });
    if (!response.ok) throw Error();
    const feed = await response.json();
    films = feed.history.filter(f => f && Number.isSafeInteger(f.id) && typeof f.title === 'string' && f.title.trim());
    if (!films.length) {
      statusText.textContent = 'No screenings in the watch log yet.';
      retry.hidden = false;
      return;
    }
    screenings.replaceChildren(...films.map(f => new Option(f.title + ' — ' + screeningTime(f), String(f.id))));
    drawTicket(films[0]);
    screenings.disabled = save.disabled = false;
    statusText.textContent = feed.stale ? 'Showing the last saved watch log.' : '';
  } catch {
    statusText.textContent = 'The watch log could not be loaded.';
    retry.hidden = false;
  }
}
screenings.addEventListener('change', () => drawTicket(films[screenings.selectedIndex]));
save.addEventListener('click', () => {
  const download = document.createElement('a');
  download.download = 'dinkdonk-ticket-' + screenings.value + '.png';
  download.href = ticket.toDataURL('image/png');
  download.click();
});
retry.addEventListener('click', load);
load();
