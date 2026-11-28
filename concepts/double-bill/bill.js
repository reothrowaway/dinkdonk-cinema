(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const positions = ['first', 'second'];
  let films = [];
  let pairs = {};
  let lineup = [];
  let cached = false;
  const notePrefix = 'dinkdonk.double-bill.note.';
  const includeKey = 'dinkdonk.double-bill.includeNotes';
  const unsavedNotes = new Map();

  function runtime(value) {
    const match = /^(\d{1,2})h(?:\s*(\d{1,2})m)?$|^(\d{1,4})m$/i.exec(String(value || '').trim());
    if (!match || (match[1] && Number(match[2]) >= 60)) return 0;
    return Number(match[1] || 0) * 60 + Number(match[2] || match[3] || 0);
  }

  function duration(minutes) {
    const hours = Math.floor(minutes / 60);
    return [hours && hours + 'h', minutes % 60 && (minutes % 60) + 'm'].filter(Boolean).join(' ');
  }

  function archive(feed) {
    const catalog = new Map();
    const ratings = feed.details?.ratings || {};
    const rows = (Array.isArray(feed.history) ? feed.history : []).filter(entry =>
      entry?.type === 'Movie' && typeof entry.title === 'string' && entry.title.trim()).map(entry => {
      const title = entry.title.trim();
      const year = /^\d{4}$/.test(String(entry.year)) ? String(entry.year) : '';
      const imdb = /\/title\/(tt\d+)(?:[/?#]|$)/i.exec(entry.imdb || '')?.[1].toLowerCase();
      return {title, year, imdb, label: title.toLowerCase() + '|' + year, detail: ratings[entry.ratingId]};
    });
    const knownIds = new Map();
    for (const {imdb, label} of rows) {
      if (!imdb) continue;
      if (!knownIds.has(label)) knownIds.set(label, new Set());
      knownIds.get(label).add(imdb);
    }
    for (const {title, year, imdb, label, detail} of rows) {
      const ids = knownIds.get(label);
      if (!imdb && ids?.size > 1) continue;
      const key = imdb || ids?.values().next().value || label;
      const film = catalog.get(key) || {key, title, year, genres: [], minutes: 0};
      if (!film.year) film.year = year;
      if (detail) {
        if (!film.minutes) film.minutes = runtime(detail.runtime);
        for (const genre of String(detail.genres || '').split(',').map(s => s.trim()).filter(Boolean)) {
          if (!film.genres.some(g => g.toLowerCase() === genre.toLowerCase())) film.genres.push(genre);
        }
      }
      catalog.set(key, film);
    }
    return Array.from(catalog.values()).sort((a, b) => a.title.localeCompare(b.title) || a.year.localeCompare(b.year));
  }

  function common(a, b) {
    return a.genres.filter(g => b.genres.some(h => g.toLowerCase() === h.toLowerCase()));
  }

  function pairings() {
    const result = {year: [], genre: []};
    for (let a = 0; a < films.length; a++) {
      for (let b = a + 1; b < films.length; b++) {
        if (films[a].year && films[a].year === films[b].year) result.year.push([a, b]);
        if (common(films[a], films[b]).length) result.genre.push([a, b]);
      }
    }
    return result;
  }

  function suggest() {
    const candidates = pairs[el('match').value];
    if (!candidates?.length) return;
    const alternatives = candidates.filter(([a, b]) => !lineup.includes(a) || !lineup.includes(b));
    const pool = alternatives.length ? alternatives : candidates;
    lineup = pool[Math.floor(Math.random() * pool.length)].slice();
    render();
  }

  function readNote(key) {
    if (unsavedNotes.has(key)) return unsavedNotes.get(key);
    try { return (localStorage.getItem(notePrefix + key) || '').slice(0, 600); }
    catch { return ''; }
  }

  function showNotes() {
    positions.forEach((pos, i) => {
      const film = films[lineup[i]];
      const editor = el(pos + '-editor');
      const note = readNote(film.key);
      if (editor.value !== note) editor.value = note;
      el(pos + '-label').textContent = film.title + ' · program note';
      el(pos + '-note').textContent = el('include-notes').checked ? note.trim() : '';
    });
    el('note-status').textContent = unsavedNotes.size ? 'Browser storage is unavailable. Your edits last for this tab session.' : '';
  }

  positions.forEach((pos, i) => el(pos + '-editor').addEventListener('input', event => {
    const key = films[lineup[i]].key;
    const value = event.target.value;
    try {
      if (value) localStorage.setItem(notePrefix + key, value);
      else localStorage.removeItem(notePrefix + key);
      unsavedNotes.delete(key);
    } catch { unsavedNotes.set(key, value); }
    showNotes();
  }));
  try { el('include-notes').checked = localStorage.getItem(includeKey) !== 'off'; } catch {}
  el('include-notes').addEventListener('change', event => {
    try { localStorage.setItem(includeKey, event.target.checked ? 'on' : 'off'); } catch {}
    showNotes();
  });
  window.addEventListener('storage', event => {
    if (event.key === includeKey || event.key === null) el('include-notes').checked = event.newValue !== 'off';
    if (lineup.length && (event.key === null || event.key === includeKey || event.key.startsWith(notePrefix))) showNotes();
  });

  function render() {
    const [a, b] = lineup.map(i => films[i]);
    const links = [];
    const genres = common(a, b);
    if (genres.length) links.push('Shared genre · ' + genres.join(', '));
    if (a.year && a.year === b.year) links.push('Both released in ' + a.year);
    el('connection').textContent = links.join(' / ') || 'Selected from the DinkDonk watch log';
    positions.forEach((pos, i) => {
      const film = films[lineup[i]];
      el(pos).value = String(lineup[i]);
      el(pos + '-name').textContent = film.title;
      el(pos + '-meta').textContent = [film.year, film.minutes ? duration(film.minutes) : 'Runtime unlisted', ...film.genres].filter(Boolean).join(' · ');
    });
    const pause = Number(el('minutes').value);
    el('interval').textContent = pause + '-minute intermission';
    el('total').textContent = a.minutes && b.minutes ? 'Full program · ' + duration(a.minutes + pause + b.minutes) : 'Full program runtime unavailable';
    el('status').textContent = films.length + ' films in the ' + (cached ? 'cached ' : '') + 'watch log. Selected ' + a.title + ' and ' + b.title + '.';
    el('program').hidden = false;
    showNotes();
  }

  async function load() {
    el('retry').hidden = true;
    el('status').textContent = 'Opening the watch log…';
    try {
      const res = await fetch('/dd/data.json', {cache: 'no-store', signal: AbortSignal.timeout(8000)});
      if (!res.ok) throw new Error();
      const feed = await res.json();
      films = archive(feed);
      cached = Boolean(feed.stale);
      if (films.length < 2) {
        el('status').textContent = 'Two different films are needed. The watch log has ' + films.length + '.';
        el('retry').hidden = false;
        return;
      }
      pairs = pairings();
      for (const pos of positions) {
        el(pos).replaceChildren(...films.map((film, i) => new Option(film.title + (film.year ? ' (' + film.year + ')' : ''), i)));
      }
      for (const opt of el('match').options) opt.disabled = !pairs[opt.value].length;
      const method = Array.from(el('match').options).find(o => !o.disabled);
      el('match').disabled = el('suggest').disabled = !method;
      el('tools').disabled = false;
      if (method) {
        el('match').value = method.value;
        suggest();
      } else {
        lineup = [0, 1];
        render();
      }
    } catch {
      el('status').textContent = 'The watch log could not be opened.';
      el('retry').hidden = false;
    }
  }

  positions.forEach((pos, i) => el(pos).addEventListener('change', () => {
    const next = Number(el(pos).value);
    if (lineup[1 - i] === next) lineup.reverse();
    else lineup[i] = next;
    render();
  }));
  el('swap').addEventListener('click', () => { lineup.reverse(); render(); });
  el('suggest').addEventListener('click', suggest);
  el('minutes').addEventListener('change', render);
  el('print').addEventListener('click', () => window.print());
  el('retry').addEventListener('click', load);
  load();
})();
