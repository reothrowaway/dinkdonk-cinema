(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const positions = ['first', 'second'];
  let films = [];
  let pairs = {};
  let lineup = [];
  let ballotCount = 0;
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
      return {title, year, imdb, label: title.toLowerCase() + '|' + year, ratingId: entry.ratingId, detail: ratings[entry.ratingId]};
    });
    const knownIds = new Map();
    for (const {imdb, label} of rows) {
      if (!imdb) continue;
      if (!knownIds.has(label)) knownIds.set(label, new Set());
      knownIds.get(label).add(imdb);
    }
    const ballotFilms = new Map();
    for (const {title, year, imdb, label, ratingId, detail} of rows) {
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
      if (ratingId) {
        if (!ballotFilms.has(ratingId)) ballotFilms.set(ratingId, film);
        else if (ballotFilms.get(ratingId) !== film) ballotFilms.set(ratingId, null);
      }
    }
    const recent = Array.isArray(feed.ratings) ? feed.ratings : [];
    ballotCount = recent.length;
    for (const ballot of recent) {
      const film = ballotFilms.get(ballot?.id);
      if (!film || film.ballot || !Number.isInteger(ballot.votes) || ballot.votes < 1 ||
          !Number.isFinite(ballot.avg) || ballot.avg < 0 || ballot.avg > 5) continue;
      film.ballot = {score: Math.round(ballot.avg * 100), votes: ballot.votes};
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

  function selectFeature(slot, index) {
    if (lineup[1 - slot] === index) lineup.reverse();
    else lineup[slot] = index;
    render();
  }

  function showFavorites() {
    const min = Number(el('award-min').value);
    const ranked = films.filter(film => film.ballot && film.ballot.votes >= min)
      .sort((a, b) => b.ballot.score - a.ballot.score || a.title.localeCompare(b.title));
    el('award-count').textContent = ballotCount ? ranked.length + (ranked.length === 1 ? ' film qualifies' : ' films qualify') +
      ' from the ' + ballotCount + ' latest ' + (cached ? 'cached ' : '') + 'ratings. Latest valid ballot per film.' :
      'The watch log has no recent ratings.';
    el('award-table').hidden = !ranked.length;
    let rank = 0;
    el('award-rows').replaceChildren(...ranked.map((film, i) => {
      const tiedBefore = ranked[i - 1]?.ballot.score === film.ballot.score;
      if (!tiedBefore) rank = i + 1;
      const tied = tiedBefore || ranked[i + 1]?.ballot.score === film.ballot.score;
      const row = document.createElement('tr');
      row.insertCell().textContent = (tied ? '=' : '') + rank;
      const pick = document.createElement('button');
      pick.type = 'button';
      pick.textContent = film.title + (film.year ? ' (' + film.year + ')' : '');
      pick.onclick = () => {
        selectFeature(Number(el('award-slot').value), films.indexOf(film));
        el('favorites').close();
      };
      row.insertCell().append(pick);
      row.insertCell().textContent = (film.ballot.score / 100).toFixed(2);
      row.insertCell().textContent = film.ballot.votes;
      return row;
    }));
  }
  el('browse-awards').addEventListener('click', () => { showFavorites(); el('favorites').showModal(); });
  el('award-min').addEventListener('change', showFavorites);
  el('close-awards').addEventListener('click', () => el('favorites').close());

  function clueCard(film, slot) {
    const card = document.createElement('section');
    card.className = 'film';
    card.innerHTML = '<h3></h3><dl class="mystery-clues"></dl><p class="guess-line">Your guess</p>' +
      '<p class="mystery-answer" aria-live="polite" hidden></p><button class="reveal" type="button" aria-expanded="false"></button>';
    card.querySelector('h3').textContent = slot === 0 ? 'Opening feature' : 'Second feature';
    const clues = card.querySelector('dl');
    const facts = [['Release year',film.year],['Runtime',film.minutes && duration(film.minutes)],['Genre',film.genres.join(', ')]].filter(([,value])=>value);
    const words = film.title.trim().split(/\s+/u).length;
    const letters = Array.from(film.title.matchAll(/[\p{L}\p{N}]/gu),match=>match[0]);
    if (facts.length < 3) facts.push(['Title length',words + (words === 1 ? ' word' : ' words')]);
    if (facts.length < 3 && letters.length > 1) facts.push(['First letter or digit',letters[0].toUpperCase()]);
    for (const [label,value] of facts) {
      const group = document.createElement('div'), term = document.createElement('dt'), detail = document.createElement('dd');
      term.textContent = label;
      detail.textContent = value;
      group.append(term,detail);
      clues.append(group);
    }
    const answer = card.querySelector('.mystery-answer'), button = card.querySelector('button');
    const which = slot === 0 ? 'opening title' : 'second title';
    answer.id = 'mystery-answer-' + slot;
    button.setAttribute('aria-controls',answer.id);
    button.textContent = 'Reveal ' + which;
    button.onclick = () => {
      const reveal = answer.hidden;
      answer.textContent = reveal ? film.title : '';
      answer.hidden = !reveal;
      button.setAttribute('aria-expanded',String(reveal));
      button.textContent = (reveal ? 'Hide ' : 'Reveal ') + which;
    };
    return card;
  }
  el('open-mystery').addEventListener('click', () => {
    el('mystery-cards').replaceChildren(...lineup.map((index,slot)=>clueCard(films[index],slot)));
    el('mystery-interval').textContent = el('interval').textContent;
    el('mystery').showModal();
  });
  el('mystery-close').onclick = () => el('mystery').close();
  el('mystery').addEventListener('close', () => {
    if (!el('mystery').open) el('mystery-cards').replaceChildren();
  });
  el('mystery-print').onclick = () => window.print();

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
    const schedule=new URLSearchParams({break:String(pause)});
    [a,b].forEach((film,i)=>{
      schedule.set('film'+i,film.title + (film.year ? ' ('+film.year+')' : ''));
      schedule.set('minutes'+i,String(film.minutes || ''));
      schedule.set('id'+i,film.key);
    });
    el('rundown').href='./rundown.html#'+schedule;
    const invitation = new URLSearchParams(schedule);
    [a,b].forEach((film,i) => { if (film.year) invitation.set('year'+i,film.year); });
    el('handbill').href='./handbill.html#'+invitation;
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
    selectFeature(i, Number(el(pos).value));
  }));
  el('swap').addEventListener('click', () => { lineup.reverse(); render(); });
  el('suggest').addEventListener('click', suggest);
  el('minutes').addEventListener('change', render);
  el('print').addEventListener('click', () => window.print());
  el('retry').addEventListener('click', load);
  load();
})();
