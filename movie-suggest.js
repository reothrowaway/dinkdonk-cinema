'use strict';

// Movie suggestions from chat (docs/movie-suggestions-plan.md, 15 Nov 2026).
//
// While the owner has suggestions open (control panel), chat suggests films with `!movie <title> [year]`,
// `@arealhumanbean <title>` at the start of a message, or an IMDb link with either. Each suggestion becomes an item:
//
//   pending  -> handed to the dinkdonk tab's userscript, which searches dinkdonk.mov (TMDB) and posts the top result
//   lookup   -> (handed out, waiting for that result; back to pending after LOOKUP_MS)
//   approved -> passed every filter; the userscript clicks Select in the poll builder ("adding" while it does)
//   added    -> in the builder
//   bench    -> passed, but the builder is at the cap; the owner can promote it, or it moves up when a spot frees
//   dry      -> passed, dry run: nothing is added (tuning on real chat)
//   rejected -> with a reason code (the lobby shows it as a stamp)
//   removed  -> the owner took it out of the builder: the entry is refunded and the film can't come back this round
//
// The bot never writes in chat. Chat frames come from the server's relay connection (chatFrame), the builder's
// contents from the poll-draft userscript (syncBuilder). State is kept on disk so a restart doesn't lose a round.

const fs = require('node:fs');
const path = require('node:path');

const DAY = 86400000;
const LOOKUP_MS = 30000;      // a handed-out lookup with no answer goes back to pending
const ADD_MS = 30000;         // an "adding" item with no answer goes back to approved
const REMOVE_GRACE_MS = 15000; // a film just added may not be in the builder report yet
const MAX_ITEMS = 400;
const MAX_EVENTS = 40;

// panel settings: key -> [kind, default, min, max, label]. Defaults = the owner's panel values of 15 Nov 2026
const SCHEMA = {
  entries:       ['num', 2, 1, 5, 'Entries per person'],
  cap:           ['num', 20, 2, 40, 'Builder cap'],
  minScore:      ['num', 30, 0, 100, 'Min TMDB score (%)'],
  minVotes:      ['num', 2000, 0, 100000, 'Min TMDB votes'],
  watchedDays:   ['num', 120, 0, 3650, 'Not watched within (days, 0 = off)'],
  maxRuntimeOn:  ['bool', false, null, null, 'Max runtime on'],
  maxRuntime:    ['num', 165, 30, 600, 'Max runtime (minutes)'],
  // owner, 16 Nov 2026 (idea from dggTrivia/movie-requests): films the community has seen too often (dinkdonk's
  // "Watched N times" on the search result); 0 = off
  maxShows:      ['num', 0, 0, 100, 'Reject if shown more than (times, 0 = off)'],
  filmsOnly:     ['bool', false, null, null, 'Films only (no TV)'],
  windowOn:      ['bool', false, null, null, 'Release window on'],
  minAgeDays:    ['num', 90, 0, 3650, 'Not newer than (days)'],
  minYear:       ['num', 1950, 1888, 2100, 'Not older than (year)'],
  banTitles:     ['text', '', null, null, 'Banned films (one per line)'],
  banGenres:     ['text', '', null, null, 'Banned genres (comma separated)'],
  cmdOn:         ['bool', true, null, null, 'Chat command on'],
  cmd:           ['text', '!rqmovie', null, null, 'Chat command'],   // owner, 15 Nov 2026: !rqmovie (was !movie)
  tagOn:         ['bool', true, null, null, 'Tag trigger'],
  tag:           ['text', 'arealhumanbean', null, null, 'Tag name'],
  dryRun:        ['bool', false, null, null, 'Dry run (look up and decide, add nothing)'],
  // owner, 15 Nov 2026: test without chat knowing about !movie: now and then a real chatter's message is swapped
  // (for this module only; the lobby keeps the real message) for a film from movie-test-list.js
  testFeed:      ['bool', false, null, null, 'Test feed (swap chat messages for films)'],
  testEvery:     ['num', 8, 1, 200, 'Test feed: 1 in this many messages'],
};

const REASONS = {
  entries: 'NO ENTRIES LEFT', notfound: 'NOT FOUND', score: 'SCORE TOO LOW', votes: 'TOO FEW VOTES',
  watched: 'WATCHED', runtime: 'TOO LONG', notmovie: 'NOT A MOVIE', toonew: 'TOO NEW', tooold: 'TOO OLD',
  banned: 'BANNED', already: 'ALREADY IN', removed: 'REMOVED', shown: 'SEEN TOO OFTEN',
};

const TEST_LIST = require('./movie-test-list');
// settings that decide whether a film may come in: changing one re-judges the round (recheck)
const RULE_KEYS = new Set(['minScore', 'minVotes', 'watchedDays', 'maxRuntimeOn', 'maxRuntime', 'maxShows', 'filmsOnly',
  'windowOn', 'minAgeDays', 'minYear', 'banTitles', 'banGenres']);
const RULE_REASONS = new Set(['score', 'votes', 'watched', 'runtime', 'shown', 'notmovie', 'toonew', 'tooold', 'banned']);

const ACTIVE = new Set(['pending', 'lookup', 'approved', 'adding', 'added', 'bench', 'dry']);   // uses an entry
const IN_BUILDER = new Set(['approved', 'adding', 'added', 'dry']);                              // counts to the cap

const str = (v, n) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n) : '');
const key = (t) => String(t || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '');
const num = (v) => (v != null && v !== '' && Number.isFinite(Number(v)) ? Number(v) : null);

/**
 * Parse one chat message. Returns { query, year, imdb } or null when it isn't a suggestion.
 * `!rqmovie Alien 1979`, `!rqmovie Alien (1979)`, `@arealhumanbean Alien`, `!rqmovie https://www.imdb.com/title/tt0078748/`
 * (the command is the panel setting `cmd`).
 */
function parseSuggestion(text, { cmdOn = true, cmd: cmdName = '!rqmovie', tagOn = true, tag = 'arealhumanbean' } = {}) {
  const t = str(text, 300);
  if (!t) return null;
  let rest = null;
  const name = String(cmdName || '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const cmd = name ? new RegExp(`^${name}(?:\\s+(.+))?$`, 'i').exec(t) : null;
  if (cmd) { if (!cmdOn) return null; rest = cmd[1] || ''; }
  else if (tagOn && tag) {
    const esc = tag.replace(/^@/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const m = new RegExp(`^@?${esc}\\b[\\s:,]+(.+)$`, 'i').exec(t);
    if (m) rest = m[1];
  }
  if (rest == null) return null;
  rest = rest.trim();
  const imdb = /(?:imdb\.com\/(?:[a-z]{2}\/)?title\/|^|\s)(tt\d{6,10})\b/i.exec(rest);
  if (imdb) return { query: imdb[1].toLowerCase(), year: null, imdb: imdb[1].toLowerCase() };
  rest = rest.replace(/https?:\/\/\S+/g, ' ').replace(/[!?.,;:]+$/, '').replace(/\s+/g, ' ').trim();
  let year = null;
  const maxYear = new Date().getFullYear() + 1;
  const y = /^(.+?)\s*[([]?\s*((?:18|19|20)\d{2})\s*[)\]]?$/.exec(rest);
  if (y && Number(y[2]) >= 1888 && Number(y[2]) <= maxYear && key(y[1])) { year = Number(y[2]); rest = y[1].replace(/[\s(\[,-]+$/, ''); }
  rest = rest.slice(0, 100).trim();
  if (key(rest).length < 1) return null;
  return { query: rest, year, imdb: null };
}

/** "8 months, 8 days ago" / "2 years, 1 month, 1 day ago" / "3 hours ago" -> days (approx.), null when unknown */
function agoToDays(s) {
  if (typeof s !== 'string' || !/ago/i.test(s)) return null;
  const units = { year: 365.25, month: 30.44, week: 7, day: 1, hour: 1 / 24, minute: 1 / 1440, second: 1 / 86400 };
  let days = 0;
  let any = false;
  for (const [, n, u] of s.matchAll(/(\d+)\s*(year|month|week|day|hour|minute|second)s?/gi)) { days += Number(n) * units[u.toLowerCase()]; any = true; }
  return any ? days : null;
}

/** "1h 57m" / "117 min" / 117 -> minutes */
function runtimeMinutes(v) {
  if (typeof v === 'number') return v > 0 ? v : null;
  if (typeof v !== 'string') return null;
  const h = /(\d+)\s*h/i.exec(v);
  const m = /(\d+)\s*m/i.exec(v);
  if (h || m) return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
  return num(v);
}

function createMovieSuggest({ file = null, historySearch = null, log = () => {}, now = () => Date.now() } = {}) {
  let state = { open: false, round: 0, openedAt: 0, closedAt: 0, seq: 0, items: [], events: [], settings: {} };
  try {
    const disk = file && JSON.parse(fs.readFileSync(file, 'utf8'));
    if (disk && Array.isArray(disk.items)) state = { ...state, ...disk };
  } catch (e) {
    // a damaged file is kept as .bad instead of being overwritten by an empty round without a word (audit 15 Nov 2026, F11)
    if (file && e.code !== 'ENOENT') {
      try { fs.copyFileSync(file, `${file}.bad`); } catch { /* ignore */ }
      log(`Movie suggestions: ${path.basename(file)} could not be read (${e.message}); kept as ${path.basename(file)}.bad, starting empty`);
    }
  }
  let rev = 1;
  let saveTimer = null;
  // written to a temp file and renamed over: a crash halfway through the write can't leave half a file (F11)
  function writeFile() {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(`${file}.tmp`, JSON.stringify(state));
    fs.renameSync(`${file}.tmp`, file);
  }
  function save() {
    rev++;
    if (!file || saveTimer) return;
    saveTimer = setTimeout(() => {
      saveTimer = null;
      try { writeFile(); } catch (e) { log(`Movie suggestions: ${e.message}`); }
    }, 300);
    saveTimer.unref?.();
  }
  function flush() { if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; } if (file) try { writeFile(); } catch { /* ignore */ } }

  // ---------- settings ----------
  function setting(k) {
    const [kind, def, lo, hi] = SCHEMA[k];
    const v = state.settings[k];
    if (v === undefined) return def;
    if (kind === 'num') return Math.min(hi, Math.max(lo, Number(v)));
    return v;
  }
  const settings = () => Object.fromEntries(Object.keys(SCHEMA).map((k) => [k, setting(k)]));
  function setSetting(k, v) {
    if (!SCHEMA[k]) return false;
    const [kind, , lo, hi] = SCHEMA[k];
    if (v === null) { delete state.settings[k]; return true; }
    if (kind === 'num') { const n = num(v); if (n == null) return false; state.settings[k] = Math.min(hi, Math.max(lo, Math.round(n))); }
    else if (kind === 'bool') state.settings[k] = !!v;
    else state.settings[k] = String(v).replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '').slice(0, 4000);
    return true;
  }
  const banTitles = () => new Set(String(setting('banTitles')).split(/\n/).map(key).filter(Boolean));
  const banGenres = () => new Set(String(setting('banGenres')).split(/[,\n]/).map((g) => g.trim().toLowerCase()).filter(Boolean));

  // ---------- items ----------
  const byId = (id) => state.items.find((i) => i.id === id);
  const activeFor = (nick) => state.items.filter((i) => i.round === state.round && i.nickKey === nick && ACTIVE.has(i.status)).length;
  function event(item) {
    state.events.push({ id: item.id, at: now(), nick: item.nick, status: item.status, reason: item.reason || null,
      label: item.reason ? REASONS[item.reason] + (item.reason === 'watched' && item.watchedLabel ? ` ${item.watchedLabel}` : '') : null,
      title: item.film?.title || item.query, year: item.film?.year || item.year || null, poster: item.film?.poster || '' });
    if (state.events.length > MAX_EVENTS) state.events.splice(0, state.events.length - MAX_EVENTS);
  }
  function reject(item, reason, extra = {}) {
    Object.assign(item, extra, { status: 'rejected', reason, decidedAt: now() });
    event(item);
  }

  /** one chat frame from the relay ("MSG {json}") */
  function chatFrame(raw) {
    if (!state.open || typeof raw !== 'string' || !raw.startsWith('MSG ')) return;
    let d;
    try { d = JSON.parse(raw.slice(4)); } catch { return; }
    if (!d || typeof d.nick !== 'string') return;
    const s = settings();
    if (s.testFeed && !parseSuggestion(d.data, s) && Math.random() < 1 / s.testEvery) {
      const [title, year] = TEST_LIST[Math.floor(Math.random() * TEST_LIST.length)];
      const tag = String(s.tag || 'arealhumanbean').replace(/^@/, '');
      const forms = [];
      const c = String(s.cmd || '').trim();
      if (s.cmdOn && c) forms.push(`${c} ${title}`, `${c} ${title} (${year})`, `${c} ${title} ${year}`);
      if (s.tagOn && tag) forms.push(`${tag} ${title}`, `@${tag} ${title}`);
      if (forms.length) { const item = message(d.nick, forms[Math.floor(Math.random() * forms.length)]); if (item) item.test = true; return; }
    }
    message(d.nick, d.data);
  }

  /** a chat message (also used by checks) */
  function message(nick, text) {
    if (!state.open) return null;
    const s = settings();
    const p = parseSuggestion(text, s);
    if (!p) return null;
    const nickKey = String(nick).toLowerCase();
    const item = { id: `m${++state.seq}`, round: state.round, nick: str(nick, 40), nickKey, at: now(), ...p, status: 'pending' };
    state.items.push(item);
    if (state.items.length > MAX_ITEMS) state.items.splice(0, state.items.length - MAX_ITEMS);
    if (activeFor(nickKey) - 1 >= s.entries) reject(item, 'entries');
    save();
    return item;
  }

  function inBuilderCount() { return state.items.filter((i) => i.round === state.round && IN_BUILDER.has(i.status)).length; }
  // The cap is for the whole builder (owner, 16 Nov 2026; Codex audit): films the owner picked by hand or kept from an
  // earlier round count too. builderExtra = builder options that aren't this round's chat films (syncBuilder).
  function capFull() { return inBuilderCount() + (state.builderExtra || 0) >= settings().cap; }

  /** decide one looked-up film: returns the reason code or null when it passes */
  async function judge(item, f) {
    const s = settings();
    const sameRound = state.items.filter((i) => i !== item && i.round === state.round && i.film?.tmdbId === f.tmdbId && (i.film.type || 'movie') === (f.type || 'movie'));
    if (sameRound.some((i) => i.status === 'removed')) return 'removed';
    if (f.duplicate || sameRound.some((i) => ACTIVE.has(i.status))) return 'already';
    if (s.filmsOnly && f.type && f.type !== 'movie') return 'notmovie';
    if (banTitles().has(key(f.title))) return 'banned';
    const bg = banGenres();
    if (bg.size && (f.genres || []).some((g) => bg.has(String(g).toLowerCase()))) return 'banned';
    if (f.scorePct != null && f.scorePct < s.minScore) return 'score';
    if (f.votes != null && f.votes < s.minVotes) return 'votes';
    if ((f.scorePct == null && s.minScore > 0) || (f.votes == null && s.minVotes > 0)) return f.scorePct == null ? 'score' : 'votes';
    if (s.maxRuntimeOn && f.runtimeMin != null && f.runtimeMin > s.maxRuntime) return 'runtime';
    if (s.maxShows > 0 && f.playCount != null && f.playCount > s.maxShows) return 'shown';
    if (s.windowOn) {
      const rel = f.releaseDate ? Date.parse(f.releaseDate) : NaN;
      if (Number.isFinite(rel) ? now() - rel < s.minAgeDays * DAY : (f.year && f.year > new Date(now()).getFullYear())) return 'toonew';
      if (f.year && f.year < s.minYear) return 'tooold';
    }
    if (s.watchedDays > 0) {
      let days = f.lastWatchedDays;
      if (days == null && historySearch) {
        try {
          const rows = await historySearch(f.title);
          const hit = (rows || []).filter((r) => key(r.title) === key(f.title) && (!f.year || !r.year || Number(r.year) === Number(f.year)) && r.watchedTs)
            .sort((a, b) => b.watchedTs - a.watchedTs)[0];
          if (hit) days = (now() - hit.watchedTs) / DAY;
        } catch { /* history unreachable: the result's own field decides */ }
      }
      if (days != null && days < s.watchedDays) {
        item.watchedLabel = new Date(now() - days * DAY).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
        return 'watched';
      }
    }
    return null;
  }

  function cleanFilm(r) {
    const year = num(r.year) || num(String(r.releaseDate || '').slice(0, 4));
    return {
      tmdbId: num(r.tmdbId), imdbId: str(r.imdbId, 12) || null, type: str(r.type, 10) || 'movie',
      title: str(r.title, 160), year, releaseDate: str(r.releaseDate, 10) || null,
      runtimeMin: runtimeMinutes(r.runtimeMin ?? r.runtime), genres: Array.isArray(r.genres) ? r.genres.map((g) => str(g, 40)).filter(Boolean).slice(0, 10) : [],
      scorePct: num(r.scorePct), votes: num(r.votes),
      lastWatchedDays: num(r.lastWatchedDays) ?? agoToDays(r.lastWatched), playCount: num(r.playCount),
      poster: /^https:\/\/image\.tmdb\.org\/[\w/.-]+$/.test(r.poster || '') ? r.poster : '', duplicate: !!r.duplicate,
    };
  }

  /** the userscript's answer for one lookup: { id, result } or { id, notFound: true } */
  async function lookupResult(body) {
    const item = byId(str(body?.id, 20));
    if (!item || (item.status !== 'lookup' && item.status !== 'pending')) return { ok: false };
    if (body.error) { item.status = 'pending'; item.handedAt = 0; item.tries = (item.tries || 0) + 1; if (item.tries >= 3) reject(item, 'notfound'); save(); return { ok: true }; }
    if (body.notFound || !body.result) { reject(item, 'notfound'); save(); return { ok: true, status: item.status, reason: item.reason || null }; }
    const f = cleanFilm(body.result);
    if (!f.tmdbId || !f.title) { reject(item, 'notfound'); save(); return { ok: true, status: item.status, reason: item.reason || null }; }
    item.film = f;
    const reason = await judge(item, f);
    if (item.status !== 'lookup' && item.status !== 'pending') return { ok: false };   // (changed while judging)
    if (reason) reject(item, reason);
    else {
      item.decidedAt = now();
      if (settings().dryRun) item.status = 'dry';
      else item.status = !capFull() ? 'approved' : 'bench';
      event(item);
    }
    save();
    return { ok: true, status: item.status, reason: item.reason || null };
  }

  /** what the userscript should do next: lookups to run and films to add */
  function work() {
    const t = now();
    let changed = false;
    for (const i of state.items) {
      if (i.status === 'lookup' && t - i.handedAt > LOOKUP_MS) { i.status = 'pending'; changed = true; }
      if (i.status === 'adding' && t - i.handedAt > ADD_MS) { i.status = 'approved'; changed = true; }
    }
    const lookups = state.items.filter((i) => i.round === state.round && i.status === 'pending').slice(0, 3);
    const adds = state.items.filter((i) => i.round === state.round && i.status === 'approved').slice(0, 1);
    for (const i of lookups) { i.status = 'lookup'; i.handedAt = t; }
    for (const i of adds) { i.status = 'adding'; i.handedAt = t; }
    if (changed || lookups.length || adds.length) save();
    return {
      open: state.open, dryRun: settings().dryRun, filmsOnly: settings().filmsOnly,
      lookups: lookups.map((i) => ({ id: i.id, query: i.query, year: i.year, imdb: i.imdb })),
      adds: adds.map((i) => ({ id: i.id, tmdbId: i.film.tmdbId, type: i.film.type, title: i.film.title, year: i.film.year })),
      removes: state.items.filter((i) => i.unadd).slice(0, 3).map((i) => ({ id: i.id, tmdbId: i.film.tmdbId, type: i.film.type })),
    };
  }

  /** the userscript took a film the owner removed in the panel out of the builder (or it wasn't there) */
  function unadded(body) {
    const item = byId(str(body?.id, 20));
    if (!item || !item.unadd) return { ok: false };
    delete item.unadd;
    save();
    return { ok: true };
  }

  /** the userscript clicked Select (ok) or couldn't find the film in the results (ok: false) */
  function added(body) {
    const item = byId(str(body?.id, 20));
    if (!item || item.status !== 'adding') return { ok: false };
    if (body.ok) { item.status = 'added'; item.addedAt = now(); }
    else { item.status = 'approved'; item.handedAt = 0; item.addTries = (item.addTries || 0) + 1; if (item.addTries >= 3) { item.status = 'bench'; item.note = 'could not add'; } }
    save();
    return { ok: true, status: item.status };
  }

  /** the builder's list, as the poll-draft userscript reports it: films we added that are gone were removed by the owner */
  function syncBuilder(options) {
    if (!Array.isArray(options)) return;
    const have = new Set(options.map((o) => `${key(o.title)}|${o.year || ''}`));
    const haveTitle = new Set(options.map((o) => key(o.title)));
    let freed = 0;
    for (const i of state.items) {
      if (i.round !== state.round || i.status !== 'added' || now() - i.addedAt < REMOVE_GRACE_MS) continue;
      const k = key(i.film.title);
      if (have.has(`${k}|${i.film.year || ''}`) || haveTitle.has(k)) continue;
      i.status = 'removed'; i.removedAt = now(); freed++;
      event(i);
    }
    // the rest of the builder: hand-picked films and films kept from earlier rounds count to the cap
    const ours = new Set(state.items.filter((i) => i.round === state.round && (i.status === 'added' || i.status === 'adding') && i.film)
      .map((i) => key(i.film.title)));
    const extra = options.filter((o) => !ours.has(key(o.title))).length;
    if (extra !== (state.builderExtra || 0)) { if (extra < (state.builderExtra || 0)) freed++; state.builderExtra = extra; }
    if (freed) { promoteBench(); save(); }
  }

  function promoteBench() {
    if (settings().dryRun) return;
    for (const b of state.items.filter((i) => i.round === state.round && i.status === 'bench' && !i.note)) {
      if (capFull()) break;
      b.status = 'approved'; b.handedAt = 0;
    }
  }

  // ---------- a rule changed: the round's films are judged again (owner, 16 Nov 2026; idea from dggTrivia) ----------
  // Films that now fail leave (out of the builder too); films a rule had rejected that now pass come in (or go to the
  // bench), oldest suggestion first, if the person still has an entry free. The owner's own picks stay as they are:
  // Add now (override) and films he removed. Not-found, duplicate and no-entries rejections are not rule decisions.
  let rechecking = null;
  let recheckAgain = false;
  function recheck() {
    if (rechecking) { recheckAgain = true; return rechecking; }
    rechecking = (async () => {
      do {
        recheckAgain = false;
        let changed = false;
        const items = state.items.filter((i) => i.round === state.round && i.film && !i.override).sort((a, b) => a.at - b.at);
        // first the ones that now fail (frees room and entries), then the ones that now pass
        for (const i of items.filter((x) => IN_BUILDER.has(x.status) || x.status === 'bench')) {
          const reason = await judge(i, i.film);
          if (!reason || reason === 'already' || reason === 'removed') continue;
          if (i.status === 'added' || i.status === 'adding') i.unadd = true;
          reject(i, reason, { rechecked: true });
          changed = true;
        }
        for (const i of items.filter((x) => x.status === 'rejected' && RULE_REASONS.has(x.reason))) {
          if (await judge(i, i.film)) continue;
          if (activeFor(i.nickKey) >= settings().entries) continue;   // they used their entries since
          delete i.reason; delete i.watchedLabel;
          i.decidedAt = now(); i.rechecked = true;
          i.status = settings().dryRun ? 'dry' : !capFull() ? 'approved' : 'bench';
          i.handedAt = 0;
          event(i);
          changed = true;
        }
        if (changed) { promoteBench(); save(); }
      } while (recheckAgain);
    })().finally(() => { rechecking = null; });
    return rechecking;
  }

  // ---------- panel ----------
  function command(c) {
    switch (c?.cmd) {
      case 'open':
        if (!state.open) {
          // a new round unless the last one closed less than 3 h ago (re-opening after a mistaken close)
          if (c.fresh || !state.closedAt || now() - state.closedAt > 3 * 3600000) {
            state.round++;
            state.items = state.items.filter((i) => now() - i.at < 7 * DAY && i.round >= state.round - 3);
          }
          state.open = true; state.openedAt = now();
        }
        break;
      case 'close': if (state.open) { state.open = false; state.closedAt = now(); } break;
      case 'newRound': state.round++; state.open = !!state.open; state.openedAt = now(); break;
      case 'remove': {   // owner, from the panel: a film out of the builder (the userscript can't remove; owner clicks X there too)
        const i = byId(c.id);
        if (i && ACTIVE.has(i.status)) {
          // in the builder already (or on its way): the userscript takes it out there too (work().removes)
          if (i.status === 'added' || i.status === 'adding') i.unadd = true;
          i.status = 'removed'; i.removedAt = now(); event(i); promoteBench();
        }
        break;
      }
      // Add now: the owner's pick, kept whatever the rules say later (recheck skips it)
      case 'promote': { const i = byId(c.id); if (i && i.status === 'bench') { i.status = 'approved'; i.handedAt = 0; i.override = true; delete i.note; } break; }
      case 'setting':
        if (!setSetting(c.key, c.value)) return { ok: false, error: 'bad setting' };
        if (RULE_KEYS.has(c.key)) recheck().catch((e) => log(`Movie suggestions recheck: ${e.message}`));
        break;
      case 'settingsReset': state.settings = {}; recheck().catch((e) => log(`Movie suggestions recheck: ${e.message}`)); break;
      default: return { ok: false, error: 'unknown cmd' };
    }
    save();
    return { ok: true };
  }

  /** for the lobby's poll screen: open or not, the hint and the newest rejections (small, read every 2 s) */
  function lite() {
    const s = settings();
    const ids = new Set(state.items.filter((i) => i.round === state.round).map((i) => i.id));
    return { open: state.open, entries: s.entries, cmdOn: s.cmdOn, cmd: s.cmd, tagOn: s.tagOn, tag: s.tag,
      events: state.events.filter((e) => ids.has(e.id) && e.status === 'rejected').slice(-6) };
  }

  function snapshot() {
    const items = state.items.filter((i) => i.round === state.round).map((i) => ({
      id: i.id, nick: i.nick, at: i.at, query: i.query, year: i.year, status: i.status, reason: i.reason || null,
      label: i.reason ? REASONS[i.reason] : null, film: i.film || null, note: i.note || null, test: !!i.test,
    }));
    return {
      rev, open: state.open, round: state.round, openedAt: state.openedAt, closedAt: state.closedAt,
      settings: settings(), schema: Object.fromEntries(Object.entries(SCHEMA).map(([k, [kind, def, min, max, label]]) => [k, { kind, def, min, max, label }])),
      counts: { inBuilder: inBuilderCount() + (state.builderExtra || 0), ours: inBuilderCount(), extra: state.builderExtra || 0, bench: items.filter((i) => i.status === 'bench').length, rejected: items.filter((i) => i.status === 'rejected').length },
      items,
      // for the lobby's stamp strip: the newest decisions of this round
      events: state.events.filter((e) => items.some((i) => i.id === e.id)).slice(-20),
    };
  }

  return { chatFrame, message, work, lookupResult, added, unadded, syncBuilder, command, snapshot, lite, flush, SCHEMA, REASONS };
}

module.exports = { createMovieSuggest, parseSuggestion, agoToDays, runtimeMinutes };
