(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const prefix = 'dinkdonk.film-diary.v1.';
  const entries = new Map();
  const form = el('entry-form');
  const displayDate = new Intl.DateTimeFormat('en-US', {dateStyle:'long', timeZone:'UTC'});
  let editing = null;
  let draftTouched = false;
  let removed = null;

  function dateValue(date, zone) {
    const parts = new Intl.DateTimeFormat('en-US', {year:'numeric', month:'2-digit', day:'2-digit', timeZone:zone}).formatToParts(date);
    const get = key => parts.find(part => part.type === key).value;
    return [get('year'), get('month'), get('day')].join('-');
  }

  function validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + 'T12:00:00Z');
    return Number.isFinite(+date) && date.toISOString().slice(0,10) === value;
  }

  function readEntries() {
    const current = new Map();
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith(prefix)) continue;
        const raw = localStorage.getItem(key);
        let row;
        try { row = JSON.parse(raw); } catch { continue; }
        if (!row || typeof row.title !== 'string' || !row.title.trim() || !validDate(row.date) ||
            typeof row.note !== 'string' || typeof row.performance !== 'string') continue;
        current.set(key, {raw, row});
      }
    } catch {
      el('status').textContent = 'This browser could not open your saved diary.';
      return;
    }
    entries.clear();
    for (const [key,value] of current) entries.set(key,value);
  }

  function element(tag, text, className) {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function action(label, fn, title) {
    const button = element('button', label);
    button.type = 'button';
    if (title) button.setAttribute('aria-label',label + ' entry for ' + title);
    button.addEventListener('click',fn);
    return button;
  }

  function render() {
    const sorted = [...entries].sort(([keyA,a],[keyB,b]) =>
      a.row.date.localeCompare(b.row.date) || a.row.created - b.row.created || keyA.localeCompare(keyB));
    const visits = new Map();
    const items = sorted.map(([key,{row}]) => {
      const identity = row.title.trim().replace(/\s+/g,' ').toLowerCase();
      const visit = (visits.get(identity) || 0) + 1;
      visits.set(identity,visit);
      const item = document.createElement('li');
      const date = element('time',displayDate.format(new Date(row.date+'T12:00:00Z')));
      date.dateTime = row.date;
      const meta = element('p','','meta');
      meta.append(date);
      if (visit > 1) meta.append(' · Diary visit ' + visit);
      if (row.favorite) meta.append(' · Favorite');
      const title = element('h3',row.title,row.favorite ? 'red' : '');
      item.append(meta,title);
      if (row.performance) item.append(element('p',row.performance,'performance'));
      if (row.note) item.append(element('p',row.note,'reflection'));
      const actions = element('div','','entry-actions');
      actions.append(action('Edit',()=>edit(key),row.title),action('Remove',()=>remove(key),row.title));
      item.append(actions);
      return item;
    });
    el('entries').replaceChildren(...items.reverse());
    el('empty').hidden = Boolean(items.length);
    el('print').hidden = !items.length;
    el('count').textContent = items.length + (items.length === 1 ? ' entry' : ' entries');
  }

  function reset() {
    form.reset();
    editing = null;
    el('watched').value = dateValue(new Date());
    el('save').textContent = 'Save entry';
    el('cancel').hidden = true;
    el('film').setCustomValidity('');
    draftTouched = true;
  }
  function edit(key) {
    const saved = entries.get(key);
    if (!saved) return;
    const {row,raw} = saved;
    editing = {key,raw};
    el('film').value = row.title;
    el('watched').value = row.date;
    el('note').value = row.note;
    el('performance').value = row.performance;
    el('favorite').checked = Boolean(row.favorite);
    el('save').textContent = 'Save changes';
    el('cancel').hidden = false;
    el('status').textContent = '';
    draftTouched = true;
    el('film').focus();
  }

  function conflict(key, raw) {
    if (localStorage.getItem(key) === raw) return false;
    readEntries();
    render();
    el('status').textContent = 'Another tab changed this entry. Your draft is still here. Open the latest entry to edit it.';
    return true;
  }
  function remove(key) {
    const saved = entries.get(key);
    if (!saved) return;
    try {
      if (conflict(key,saved.raw)) return;
      localStorage.removeItem(key);
    } catch { el('status').textContent = 'The browser could not remove this entry.'; return; }
    removed = {key,raw:saved.raw};
    if (editing?.key === key) reset();
    readEntries();
    render();
    const undo = action('Undo removal',() => {
      if (!removed || removed.key !== key) return;
      try {
        if (conflict(key,null)) return;
        localStorage.setItem(key,removed.raw);
      } catch { el('status').textContent = 'The browser could not restore this entry.'; return; }
      readEntries();
      render();
      removed = null;
      el('status').textContent = 'Entry restored.';
      el('film').focus();
    });
    el('status').replaceChildren('Entry removed. ', undo);
    undo.focus();
  }

  form.addEventListener('submit',event => {
    event.preventDefault();
    const title = el('film').value.trim(), date = el('watched').value;
    if (!title) {
      el('film').setCustomValidity('Enter a film title.');
      el('film').reportValidity();
      return;
    }
    if (!validDate(date)) { el('status').textContent = 'Choose a valid viewing date.'; return; }
    const key = editing?.key || prefix + [...crypto.getRandomValues(new Uint8Array(16))].map(n=>n.toString(16).padStart(2,'0')).join('');
    const row = {title,date,performance:el('performance').value.trim(),note:el('note').value.trim(),
      favorite:el('favorite').checked,created:editing ? JSON.parse(editing.raw).created : Date.now()};
    try {
      if (editing && conflict(key,editing.raw)) return;
      localStorage.setItem(key,JSON.stringify(row));
    } catch { el('status').textContent = 'The browser could not save this entry. Your draft is still here.'; return; }
    readEntries();
    render();
    reset();
    el('status').textContent = 'Saved to your diary.';
  });
  form.addEventListener('input',()=>{ draftTouched = true; el('film').setCustomValidity(''); });
  el('cancel').addEventListener('click',()=>{ reset(); el('status').textContent='Edit canceled.'; el('film').focus(); });
  el('print').addEventListener('click',()=>window.print());
  window.addEventListener('storage',event=>{
    if (event.key === null || event.key.startsWith(prefix)) { readEntries(); render(); }
  });

  async function loadArchive() {
    const id = new URLSearchParams(location.search).get('screening');
    try {
      const response = await fetch('/dd/data.json',{signal:AbortSignal.timeout(8000)});
      if (!response.ok) throw Error();
      const feed = await response.json();
      const films = feed.history.filter(f => f?.type === 'Movie' && typeof f.title === 'string' && f.title.trim());
      const label = f => f.title.trim() + (/^\d{4}$/.test(String(f.year)) ? ' ('+f.year+')' : '');
      const titles = [...new Set(films.map(label))].sort((a,b)=>a.localeCompare(b));
      el('archive').replaceChildren(...titles.map(title=>new Option(title,title)));
      const chosen = id && films.find(f => String(f.id) === id);
      if (chosen && !draftTouched) {
        el('film').value = label(chosen);
        if (Number.isFinite(chosen.watchedTs) && Number.isFinite(+new Date(chosen.watchedTs)))
          el('watched').value = dateValue(new Date(chosen.watchedTs),'America/New_York');
      }
      if (id && !chosen) el('catalog').textContent = 'This screening is missing from the archive. You can enter its title.';
    } catch { el('catalog').textContent = 'The watch log is unavailable. You can still enter a title.'; }
  }
  el('watched').value = dateValue(new Date());
  readEntries();
  render();
  loadArchive();
})();
