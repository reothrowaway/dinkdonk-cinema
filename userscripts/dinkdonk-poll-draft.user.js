// ==UserScript==
// @name         DinkDonk poll → cinema lobby
// @namespace    dinkdonk-cinema
// @version      0.6
// @description  While you build a poll on dinkdonk.mov, sends its title and movies to your cinema lobby, so the lobby can show them live. Also says when that poll opens for voting and when it ends. With movie suggestions open (control panel), adds the films chat suggested to the builder.
// @match        https://dinkdonk.mov/*
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @connect      127.0.0.1
// @run-at       document-idle
// ==/UserScript==

// How it reads the page: the poll builder is a form with data-controller="create-poll". Every movie picked from
// the search is a hidden <input name="options[]"> holding the TMDB item as JSON (title, release_date, poster_path);
// a typed-in option is a visible <input name="options[]">. After "Create", the site goes to /poll/<id> in the same
// tab, and the results are at /poll/<id>/results.
// Sent only to one cinema server and one room. Nothing on dinkdonk.mov is changed, except (0.4; hosted rooms too since 0.6):
// while movie suggestions are open, films chat suggested are looked up with the builder's own TMDB search
// (POST /api/tmdb/search, the page's CSRF token) and the approved ones are added to the builder the way the
// search's Select button does it (a tmdb-search:select event). It never presses Create and never removes anything.
// As it is here, it talks to the local server on this PC. The hosted edition hands each streamer their own copy from
// their control panel (Install your poll script), with SERVER and ROOM_KEY below filled in (web/server.js pollScript),
// so a streamer's script only changes their own room's poll.

(function () {
  'use strict';

  const SERVER = 'http://127.0.0.1:18770';
  const ROOM_KEY = '';
  const POSTER = 'https://image.tmdb.org/t/p/w342';
  const SUBMITTED = 'ddCinemaPollSubmitted';   // sessionStorage: "Create" was just pressed in this tab
  const OURS = 'ddCinemaPollId';               // localStorage: id of the poll we built last
  const URL_DRAFT = `${SERVER}/dd/draft${ROOM_KEY ? `?k=${encodeURIComponent(ROOM_KEY)}` : ''}`;

  function post(body) {
    GM_xmlhttpRequest({
      method: 'POST',
      url: URL_DRAFT,
      headers: { 'Content-Type': 'application/json', 'X-DD-Draft': '1' },
      data: JSON.stringify(body),
      timeout: 8000,
      onload: (r) => { if (r.status !== 200) console.warn('[dd-cinema]', SERVER, 'answered', r.status); },
      onerror: () => console.warn('[dd-cinema] cinema server not reachable at', SERVER),
    });
  }

  GM_registerMenuCommand('Clear the poll in my lobby', () => post({ clear: true }));

  function readOption(input) {
    const raw = (input.value || '').trim();
    if (!raw) return null;
    if (input.type === 'hidden' || input.hidden) {
      try {
        const item = JSON.parse(raw);
        const title = item.type === 'tv' ? item.name : item.title;
        if (title) {
          return {
            title,
            year: (item.release_date || item.first_air_date || '').slice(0, 4),
            poster: item.poster_path ? POSTER + item.poster_path : '',
          };
        }
      } catch { /* not JSON: a plain typed option */ }
    }
    return { title: raw };
  }

  function readBuilder(form) {
    const type = form.querySelector('[name="pollType"]');
    return {
      state: 'building',
      title: form.querySelector('input[name="title"]')?.value || '',
      type: type?.selectedOptions?.[0]?.textContent?.trim() || type?.value || '',
      options: [...form.querySelectorAll('input[name="options[]"]')].map(readOption).filter(Boolean),
    };
  }

  // ---- poll builder: send the list whenever it changes (and every minute, so the server knows it's still alive)
  let last = '';
  let lastAt = 0;
  function tick() {
    const form = document.querySelector('[data-controller~="create-poll"]');
    if (!form) return;
    if (!form.dataset.ddCinema) {
      form.dataset.ddCinema = '1';
      form.addEventListener('submit', () => sessionStorage.setItem(SUBMITTED, String(Date.now())), true);
    }
    const body = readBuilder(form);
    if (!body.options.length && !body.title) return;   // an empty builder doesn't replace a poll that's running
    const json = JSON.stringify(body);
    if (json === last && Date.now() - lastAt < 60000) return;
    last = json;
    lastAt = Date.now();
    post(body);
  }

  // ---- after "Create": the vote page of our poll, later its results page
  const m = /^\/poll\/([A-Za-z0-9]{1,16})(\/results)?\/?$/.exec(location.pathname);
  if (m) {
    const [, id, results] = m;
    const justCreated = Date.now() - Number(sessionStorage.getItem(SUBMITTED) || 0) < 2 * 60 * 1000;
    if (justCreated && !results) {
      sessionStorage.removeItem(SUBMITTED);
      localStorage.setItem(OURS, id);
      post({ pollId: id, state: 'open' });
    } else if (localStorage.getItem(OURS) === id) {
      // results page = voting is over (the server also notices this by itself from the finished-polls list)
      post({ pollId: id, state: results ? 'closed' : 'open' });
    }
  }

  tick();
  setInterval(tick, 1500);

  // ---- movie suggestions from chat (movie-suggest.js on the cinema server; docs/movie-suggestions-plan.md)
  // (hosted, 0.6: the room's own suggestions, by room key)
  const msUrl = (p) => `${SERVER}/ms/${p}${ROOM_KEY ? `?k=${encodeURIComponent(ROOM_KEY)}` : ''}`;
  const raw = new Map();  // tmdb_id -> the search item exactly as the site gave it (what Select would add)

  function gm(method, url, body) {
    return new Promise((resolve, reject) => GM_xmlhttpRequest({
      method, url, timeout: 8000,
      headers: { 'X-DD-Draft': '1', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      data: body ? JSON.stringify(body) : undefined,
      onload: (r) => { try { resolve(r.status === 200 ? JSON.parse(r.responseText) : null); } catch { resolve(null); } },
      onerror: reject, ontimeout: reject,
    }));
  }

  async function tmdbSearch(query, year, type = 'movie', page = 1) {
    const csrf = document.getElementsByName('csrfToken')[0]?.value;
    if (!csrf) throw new Error('no csrf token');
    const fd = new FormData();
    fd.set('csrfToken', csrf);
    fd.set('searchType', type);
    fd.set('year', year ? String(year) : '');
    fd.set('query', query);
    fd.set('page', String(page));
    const j = await fetch('/api/tmdb/search', { method: 'POST', body: fd }).then((r) => r.json());
    if (j.code !== 200) throw new Error(j.reauthRequired ? 'reauth' : (j.message || 'search failed'));
    for (const it of j.data || []) if (it.tmdb_id) raw.set(`${it.type}:${it.tmdb_id}`, it);
    return j.data || [];
  }

  const inBuilder = (form, tmdbId, type = 'movie') => [...form.querySelectorAll('input[name="options[]"]')].some((i) => {
    try { const o = JSON.parse(i.value); return o && o.tmdb_id === tmdbId && (o.type || 'movie') === type; } catch { return false; }
  });

  function toResult(it, form) {
    const watched = it.last_watched ? Date.parse(String(it.last_watched).replace(' ', 'T') + 'Z') : NaN;
    return {
      tmdbId: it.tmdb_id, imdbId: it.imdb_id || null, type: it.type, title: it.title || it.name,
      year: (it.release_date || it.first_air_date || '').slice(0, 4), releaseDate: it.release_date || it.first_air_date || null, runtimeMin: it.runtime || null,
      genres: it.genres || [], scorePct: it.vote_average != null ? Math.round(it.vote_average * 1000) / 100 : null,
      votes: it.vote_count ?? null, lastWatchedDays: Number.isFinite(watched) ? (Date.now() - watched) / 86400000 : null,
      playCount: it.play_count ?? null, poster: it.poster_path ? POSTER + it.poster_path : '', duplicate: inBuilder(form, it.tmdb_id, it.type),
    };
  }

  async function lookup(job, form, filmsOnly) {
    let items = await tmdbSearch(job.query, job.year);
    // "Wonder Woman 1984": the year was part of the title
    if (!items.length && job.year) items = await tmdbSearch(`${job.query} ${job.year}`, null);
    // no film by that name and TV allowed (panel: Films only off): a series
    if (!items.length && !filmsOnly) items = await tmdbSearch(job.query, job.year, 'tv');
    if (!items.length) return gm('POST', msUrl('lookup'), { id: job.id, notFound: true });
    // the most popular match, unless one is called exactly what chat typed ("Toy Story" is not Toy Story 5); page 2
    // too when page 1 (2 results) has no exact title
    const k = (t) => String(t || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '');
    const exact = (list) => list.find((i) => k(i.title || i.name) === k(job.query) && (!job.year || String(i.release_date || i.first_air_date || '').startsWith(String(job.year))));
    let pick = job.imdb ? items[0] : exact(items);
    if (!pick && !job.imdb && items.length >= 2) pick = exact(await tmdbSearch(job.query, job.year, items[0].type, 2).catch(() => []));
    return gm('POST', msUrl('lookup'), { id: job.id, result: toResult(pick || items[0], form) });
  }

  async function add(job, form) {
    const type = job.type || 'movie';
    if (inBuilder(form, job.tmdbId, type)) return gm('POST', msUrl('added'), { id: job.id, ok: true });
    let item = raw.get(`${type}:${job.tmdbId}`);
    if (!item) item = (await tmdbSearch(job.title, job.year, type)).find((i) => i.tmdb_id === job.tmdbId);
    // a whole series (no season or episode picked), as Select does with nothing chosen
    if (item && type === 'tv') item = { ...item, selected_season: null, selected_start_episode: null, selected_end_episode: null };
    const search = form.querySelector('[data-controller~="tmdb-search"]');
    if (!item || !search) return gm('POST', msUrl('added'), { id: job.id, ok: false });
    // what the Select button does: the form's create-poll controller adds it (addFromSearch)
    search.dispatchEvent(new CustomEvent('tmdb-search:select', { bubbles: true, detail: { item, target: null } }));
    return gm('POST', msUrl('added'), { id: job.id, ok: inBuilder(form, job.tmdbId, type) });
  }

  // a small label on the builder page, so the owner sees it working
  let badge = null;
  function show(text) {
    if (!badge) {
      badge = document.createElement('div');
      badge.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:9999;padding:6px 10px;border-radius:6px;'
        + 'background:#1b1b24;color:#ffd36b;font:12px/1.3 system-ui,sans-serif;border:1px solid #ffd36b55;pointer-events:none';
      document.body.append(badge);
    }
    badge.textContent = text;
    badge.hidden = !text;
  }

  let busy = false;
  let wait = 2000;
  async function work() {
    const form = document.querySelector('[data-controller~="create-poll"]');
    if (!form || busy) { setTimeout(work, 3000); return; }
    busy = true;
    try {
      const w = await gm('GET', msUrl('work'));
      if (!w) { show(''); wait = 10000; return; }   // a cinema server without suggestions
      show(w.open ? `Chat suggestions open${w.dryRun ? ' (dry run)' : ''}` : '');
      for (const job of w.lookups) {
        try { await lookup(job, form, w.filmsOnly !== false); }
        catch (e) {
          await gm('POST', msUrl('lookup'), { id: job.id, error: String(e.message || e) }).catch(() => {});
          if (/reauth/.test(e.message)) { show('Chat suggestions: dinkdonk wants you to log in again'); break; }
        }
      }
      for (const job of w.adds) await add(job, form).catch(() => gm('POST', msUrl('added'), { id: job.id, ok: false }).catch(() => {}));
      // removed by the owner in the control panel: its X in the builder, like a click
      for (const job of w.removes || []) {
        for (const input of form.querySelectorAll('input[name="options[]"]')) {
          let o = null;
          try { o = JSON.parse(input.value); } catch { /* typed option */ }
          if (o && o.tmdb_id === job.tmdbId && (o.type || 'movie') === (job.type || 'movie')) input.closest('.create-poll__option')?.querySelector('.remove-option')?.click();
        }
        await gm('POST', msUrl('removed'), { id: job.id }).catch(() => {});
      }
      wait = w.open || w.lookups.length || w.adds.length ? 2000 : 5000;
    } catch { wait = 10000; /* cinema server not running */ } finally {
      busy = false;
      setTimeout(work, wait);
    }
  }
  setTimeout(work, 1500);
})();
