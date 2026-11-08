// ==UserScript==
// @name         DinkDonk poll → cinema lobby
// @namespace    dinkdonk-cinema
// @version      0.3
// @description  While you build a poll on dinkdonk.mov, sends its title and movies to your cinema lobby, so the lobby can show them live. Also says when that poll opens for voting and when it ends.
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
// Sent only to one cinema server and one room; nothing on dinkdonk.mov is changed.
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
})();
