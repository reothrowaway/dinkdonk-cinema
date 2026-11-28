'use strict';
const $ = id => document.getElementById(id);
const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
const pageSize = 6;
let sessions = [], page = 0, timer, lastLoad = 0, loading = false, notice = '';

function validTime(ms) {
  if (!Number.isSafeInteger(ms)) return false;
  const year = new Date(ms).getUTCFullYear();
  return year >= 1 && year <= 9999;
}
function setZones(source) {
  try { new Intl.DateTimeFormat('en', {timeZone: source}); } catch { source = 'America/New_York'; }
  const current = $('zone').value;
  const zones = new Map([[localZone, 'Your time · ' + localZone]]);
  if (!zones.has(source)) zones.set(source, 'Cinema time · ' + source);
  $('zone').replaceChildren(...Array.from(zones, ([key,label]) => new Option(label, key)));
  if (zones.has(current)) $('zone').value = current;
}
const utc = ms => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
const escapeText = s => s.replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/[,;]/g,'\\$&');
function fold(line) {
  const encoder = new TextEncoder();
  let result = '', size = 0;
  for (const char of line) {
    const bytes = encoder.encode(char).length;
    if (size + bytes > 75) { result += '\r\n '; size = 1; }
    result += char;
    size += bytes;
  }
  return result;
}
function saveCalendar(list) {
  if (!list.length) return;
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//DinkDonk Cinema//Movie Night//EN'];
  const stamp = utc(Date.now());
  for (const s of list) {
    lines.push('BEGIN:VEVENT','UID:session-' + s.start + '@dinkdonk.mov','DTSTAMP:' + stamp,
      'DTSTART:' + utc(s.start),'DTEND:' + utc(s.end),
      'SUMMARY:' + escapeText(s.events || 'DinkDonk Cinema session'),'URL:https://dinkdonk.mov/schedule','END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.map(fold).join('\r\n') + '\r\n'], {type:'text/calendar;charset=utf-8'});
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = list.length === 1 ? 'dinkdonk-' + utc(list[0].start) + '.ics' : 'dinkdonk-schedule.ics';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function render() {
  const now = Date.now(), pending = sessions.filter(s => s.end > now);
  const total = Math.ceil(pending.length / pageSize);
  page = Math.min(page, Math.max(0, total - 1));
  const start = page * pageSize;
  const zone = $('zone').value;
  const day = new Intl.DateTimeFormat('en-US', {timeZone:zone, weekday:'short', month:'short', day:'numeric'});
  const clockOptions = {timeZone:zone, hour:'numeric', minute:'2-digit'};
  const time = new Intl.DateTimeFormat('en-US', clockOptions);
  const zonedTime = new Intl.DateTimeFormat('en-US', {...clockOptions, timeZoneName:'short'});
  const offset = ms => zonedTime.formatToParts(ms).find(p => p.type === 'timeZoneName')?.value;
  const dayKey = new Intl.DateTimeFormat('en-US', {timeZone:zone, dateStyle:'short'});
  $('sessions').replaceChildren(...pending.slice(start, start + pageSize).map(s => {
    const row = document.createElement('li'), date = document.createElement('span'), content = document.createElement('div');
    row.className = 'row'; date.className = 'date'; content.className = 'session';
    date.textContent = day.format(s.start);
    const range = document.createElement('time');
    range.dateTime = new Date(s.start).toISOString();
    const overnight = dayKey.format(s.start) !== dayKey.format(s.end);
    const clock = offset(s.start) === offset(s.end) ? time : zonedTime;
    range.textContent = clock.format(s.start) + ' – ' + (overnight ? day.format(s.end) + ', ' : '') + clock.format(s.end);
    content.append(range);
    if (s.events || s.start <= now) {
      const details = document.createElement('span'); details.className = 'details';
      details.textContent = [s.start <= now ? 'In progress' : '', s.events].filter(Boolean).join(' · ');
      content.append(details);
    }
    const add = document.createElement('button');
    add.type = 'button'; add.textContent = 'Save .ics';
    add.setAttribute('aria-label', 'Save calendar file for ' + date.textContent + ', ' + range.textContent);
    add.onclick = () => saveCalendar([s]); row.append(date, content, add); return row;
  }));
  const listingNote = pending.length && pending.every(s => !s.events) ? 'The published guide currently lists time slots only.' : '';
  $('status').textContent = [notice || (!pending.length ? 'No upcoming sessions are listed.' : ''), listingNote].filter(Boolean).join(' ');
  $('save').disabled = !pending.length;
  $('pages').hidden = total < 2; $('previous').disabled = page === 0; $('next').disabled = page + 1 >= total;
  $('page-count').textContent = pending.length ? (start + 1) + '–' + Math.min(start + pageSize, pending.length) + ' of ' + pending.length + ' sessions' : '';
  clearTimeout(timer);
  const boundary = Math.min(...pending.flatMap(s => [s.start,s.end]).filter(ms => ms > now));
  if (Number.isFinite(boundary)) timer = setTimeout(render, Math.min(boundary - now + 50, 2147483647));
}
async function load() {
  if (loading) return;
  loading = true; $('retry').hidden = true;
  try {
    const response = await fetch('/dd/data.json', {signal:AbortSignal.timeout(20000)});
    if (!response.ok) throw Error();
    const data = await response.json(), schedule = data.schedule;
    if (!Array.isArray(schedule?.sessions)) throw Error();
    const byStart = new Map();
    for (const s of schedule.sessions) {
      if (!validTime(s?.start) || !validTime(s.end) || s.end <= s.start) continue;
      byStart.set(s.start, {start:s.start, end:s.end, events:typeof s.events === 'string' ? s.events.trim() : ''});
    }
    sessions = [...byStart.values()].sort((a,b) => a.start - b.start);
    setZones(schedule.tz || 'America/New_York');
    notice = data.stale ? 'Showing the last saved schedule.' : '';
    lastLoad = Date.now();
  } catch {
    notice = sessions.length ? 'Refresh failed. Showing the last loaded schedule.' : 'The schedule could not be loaded.';
    $('retry').hidden = false;
  } finally { loading = false; render(); }
}
setZones('America/New_York');
$('zone').onchange = render;
$('previous').onclick = () => { page--; render(); };
$('next').onclick = () => { page++; render(); };
$('retry').onclick = load;
$('save').onclick = () => saveCalendar(sessions.filter(s => s.end > Date.now()));
document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - lastLoad > 600000) load(); });
load();
