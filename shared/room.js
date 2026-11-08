'use strict';

// Shared, persistent room state for the lobby and the auditorium (web/PLAN-shared-rooms.md). Node only: both
// standby-server.js (one room) and the hosted web/server.js (one room per invite key) load it.
//
// The server decides WHAT happens: who walks in (the tag / everyone filter, crowd rules, caps), each walker's random
// choices (room, detour, a seed for everything else), auditorium seats and the queue outside, the director's
// follows, and what is in the room right now. Every screen of the room gets the same events and draws them its own
// way. The state keeps going while no screen is open (chat keeps filling the room) and is saved to disk.
//
// Screens that use it (pages with window.DD_ROOM_PAGE, see shared/cinema.js) subscribe to GET /ctl/room and get:
//   {t:'snapshot', page, roster, director, show?, settings, lead}   at once, and after every reconnect
//   {t:'walk', page, e, again, follow, say}   a chatter walks in (again: already in the room, talks)
//   {t:'seat', page, nick, seat}              auditorium: someone waiting outside got a seat
//   {t:'remove', page, nick, why}             the server took someone out: why cap, panel, queue full, quiet,
//                                             kicked / home (auditorium), left (a lobby screen saw them leave)
//   {t:'follow', page, nick}                  director: follow this chatter now (the panel's "follow someone")
//   {t:'lead', page, id}                      which screen leads page-local randomness (the usher's kicks)
//   {t:'clear', page}                         panel: Clear lobby / Reset auditorium
// Older screens keep using /ctl/events only; nothing here changes what they get.

const fs = require('node:fs');
const path = require('node:path');

const LOBBY = { CAP: 40, HARD_CAP: 55, CROWD: 14 };              // lobby.html CAP, HARD_CAP, CROWD
const AUD = { MAX_QUEUE: 270, QUEUE_QUIET_MS: 10 * 60000 };       // auditorium.html MAX_QUEUE, QUEUE_QUIET_MS
const AVATAR_BLOCK = new Set(['JARVIS']);                          // shared/cinema.js AVATAR_BLOCK
// auditorium.html YEE_EMOTES: the front ("wheelchair") row is theirs
const YEE_EMOTES = new Set(['YEE', 'diNoThanks', 'YeeMODS', 'YeeLaugh', 'YeeSmug', 'nathanYee', 'TeddYEE', 'ComfYEE',
  'diNOWAY', 'YEEHAW', 'FeelsPeekMan', 'KYEK', 'YAM']);
const ROW_WEIGHT = { B: 0.5, C: 0.8, D: 1.1, E: 1.4, F: 1.5, G: 1.3, H: 1, I: 0.8 };
const OUTSIDE = new Set(['street', 'ticket line']);                // lobby statusOf() values counted as "outside"
const URL_RE = /\bhttps?:\/\/\S+|\bwww\.\S+/gi;
const PAGES = ['lobby', 'auditorium'];
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const rand = (a, b) => a + Math.random() * (b - a);

// same as shared/core.js tokenize(): the emote names a message uses, in order
function messageEmotes(text, names) {
  const out = [];
  for (const part of String(text || '').replace(URL_RE, ' ').split(/\s+/)) {
    if (!part) continue;
    const [base, ...mods] = part.split(':');
    if (names.has(base) && mods.every((m) => /^[a-z]+$/.test(m))) out.push(base);
  }
  return out;
}
// the fields of a DGG MSG the pages need to rebuild the message (shared/core.js parseMessage)
function slimMsg(d, text) {
  const s = { nick: String(d.nick || '').slice(0, 25), data: String(text ?? d.data ?? '').slice(0, 512) };
  if (Array.isArray(d.features)) s.features = d.features.filter((f) => typeof f === 'string').slice(0, 12);
  if (Array.isArray(d.roles)) s.roles = d.roles.filter((f) => typeof f === 'string').slice(0, 12);
  const tier = d.subscription?.tier ?? d.subTier;
  if (Number.isFinite(tier)) s.subTier = tier;
  return s;
}
function tagMatcher(tag) {
  if (!tag) return () => true;
  const re = new RegExp(`(^|[^a-z0-9_])@?${tag.replace(/[^a-z0-9_]/gi, '')}(?![a-z0-9_])`, 'i');
  return (nick, text) => nick.toLowerCase() === tag.toLowerCase() || re.test(text || '');
}

// seats from the auditorium's layout JSON (auditorium.html builds the same list): id "F:main:7.25"
function seatsFromLayout(file) {
  try {
    const L = JSON.parse(fs.readFileSync(file, 'utf8'));
    const seats = [];
    for (const [ri, r] of L.rows.entries()) {
      for (const [block, us] of Object.entries(r.seat_u_by_block || {})) {
        for (const u of us) seats.push({ id: `${r.row}:${block}:${u}`, row: r.row, ri, u, block });
      }
    }
    return seats;
  } catch { return null; }
}

/**
 * createRoom({ file, layoutFile, emoteNames, log })
 *   file        where the state is saved (JSON), or null
 *   layoutFile  roxy3d/qa11/cinema_layout_13.json (auditorium seats)
 *   emoteNames  () => Set of DGG emote names (may be empty until the emote list loaded)
 */
function createRoom({ file = null, layoutFile = null, emoteNames = () => new Set(), log = () => {}, crowd = () => undefined } = {}) {
  let seats = null;
  const getSeats = () => (seats ||= (layoutFile && seatsFromLayout(layoutFile)) || null);

  const freshDirector = () => ({ on: true, every: 150, zoom: 1.85, wantNext: false, nextAt: Date.now() + rand(45, 75) * 1000 });
  const state = {
    v: 1,
    settings: { tag: 'arealhumanbean', fromPanel: false },
    pages: {
      lobby: { roster: [], director: freshDirector() },
      auditorium: { roster: [], director: freshDirector(),
        show: { phase: 'seating', shot: 'push', lightsOn: false, houseOut: false, auto: true } },
    },
  };
  // chat memory (not saved): last emotes and room per nick, like shared/cinema.js
  const lastEmotes = new Map();
  const roomOf = new Map();
  const remember = (map, key, value) => { map.delete(key); map.set(key, value); if (map.size > 4000) map.delete(map.keys().next().value); };
  // latest screen reports, per page: { id, at, chatters } (only the leading screen's)
  const reports = { lobby: null, auditorium: null };
  // room-mode screens: page -> Map(id -> { send, obs, since })
  const subs = { lobby: new Map(), auditorium: new Map() };
  const lead = { lobby: null, auditorium: null };

  // ---------- saving ----------
  let dirty = false;
  let saveTimer = null;
  function changed() {
    dirty = true;
    if (!file || saveTimer) return;
    saveTimer = setTimeout(save, 3000);
  }
  function save() {
    clearTimeout(saveTimer);
    saveTimer = null;
    if (!file || !dirty) return;
    dirty = false;
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(`${file}.tmp`, JSON.stringify(state));
      fs.renameSync(`${file}.tmp`, file);
    } catch (e) { log(`room: save failed: ${e.message}`); }
  }
  function load() {
    if (!file) return;
    try {
      const s = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (s?.v !== 1 || !s.pages) return;
      if (s.settings && typeof s.settings === 'object') Object.assign(state.settings, s.settings);
      for (const p of PAGES) {
        const src = s.pages[p];
        if (!src) continue;
        if (Array.isArray(src.roster)) state.pages[p].roster = src.roster.filter((e) => e && typeof e.key === 'string');
        if (src.director) Object.assign(state.pages[p].director, src.director, { wantNext: false });
        if (p === 'auditorium' && src.show) Object.assign(state.pages[p].show, src.show);
      }
      log(`room: loaded ${state.pages.lobby.roster.length} in the lobby, ${state.pages.auditorium.roster.length} in the auditorium`);
    } catch { /* first start */ }
  }
  load();

  // ---------- sending ----------
  function emit(page, ev) {
    const line = JSON.stringify({ page, ...ev });
    for (const s of subs[page].values()) { try { s.send(line); } catch { /* closed */ } }
  }
  const find = (page, key) => state.pages[page].roster.find((e) => e.key === key);
  const publicEntry = (e) => e;   // entries hold nothing private: nick, emote, last line, chat colour data

  function snapshot(page) {
    const P = state.pages[page];
    const d = P.director;
    return { t: 'snapshot', page, now: Date.now(), roster: P.roster.map(publicEntry),
      director: { on: d.on, every: d.every, zoom: d.zoom, wantNext: d.wantNext },
      show: page === 'auditorium' ? { ...P.show } : undefined,
      settings: { tag: state.settings.tag || null }, lead: lead[page] };
  }

  function electLead(page) {
    let best = null;
    for (const [id, s] of subs[page]) {
      if (!best || (s.obs && !best[1].obs) || (s.obs === best[1].obs && s.since < best[1].since)) best = [id, s];
    }
    const id = best ? best[0] : null;
    if (id !== lead[page]) { lead[page] = id; emit(page, { t: 'lead', id }); }
  }

  /** a room-mode screen connects: send(line) gets each event as one JSON string */
  function subscribe(page, id, send, { obs = false, who = undefined } = {}) {
    if (!PAGES.includes(page)) throw new Error('unknown page');
    // who walks in comes from the screens' URLs until the panel sets it; the OBS screen's URL wins
    if (who !== undefined && !state.settings.fromPanel && (obs || !subs.lobby.size && !subs.auditorium.size)) {
      if (state.settings.tag !== who) { state.settings.tag = who; changed(); log(`room: who walks in: ${who ? `tags ${who}` : 'everyone'}`); }
    }
    subs[page].set(id, { send, obs, since: Date.now() });
    send(JSON.stringify(snapshot(page)));
    electLead(page);   // after the snapshot: a new leader hears about it in a 'lead' event
    return () => { subs[page].delete(id); electLead(page); };
  }

  // ---------- who walks in ----------
  function crowdEvery() {
    const roster = state.pages.lobby.roster;
    const rep = reports.lobby && Date.now() - reports.lobby.at < 10000 ? reports.lobby : null;
    let outside = 0;
    if (rep) {
      for (const c of rep.chatters) if (OUTSIDE.has(c.status)) outside++;
    } else {
      // no screen open: the last minute's arrivals are still outside
      for (const e of roster) if (Date.now() - e.at < 60000) outside++;
    }
    // head count: the room's chatters the leading screen still shows (jannies are never in the roster), else the roster
    const keys = new Set(roster.map((e) => e.key));
    const live = rep ? rep.chatters.filter((c) => keys.has(String(c.nick || '').toLowerCase())).length : roster.length;
    // the panel's lobby crowd setting (shared/settings.js, like lobby.html ?crowd=): 0 = never thin, else 4-60
    const set = crowd();
    if (set === 0) return 1;
    const CROWD = Number.isFinite(set) ? clamp(set, 4, 60) : LOBBY.CROWD;
    if (live >= LOBBY.CAP || outside >= CROWD * 2) return 5;
    if (outside >= CROWD * 1.5) return 3;
    return outside >= CROWD ? 2 : 1;
  }
  let crowdN = 0;
  function crowdSkip(nick) {
    const tag = state.settings.tag;
    if (tag && nick.toLowerCase() === tag.toLowerCase()) return false;   // the host always walks in
    const every = crowdEvery();
    if (every === 1) { crowdN = 0; return false; }
    crowdN++;
    return crowdN % every !== 0;
  }

  function wantFollow(page) {
    const d = state.pages[page].director;
    if (d.wantNext) { d.wantNext = false; return true; }
    if (!d.on || Date.now() < d.nextAt) return false;
    // the auditorium's film push-in holds the screen: no automatic follows meanwhile
    const show = state.pages.auditorium.show;
    if (page === 'auditorium' && show.phase === 'film' && show.shot === 'push') return false;
    d.nextAt = Date.now() + d.every * 1000 * rand(0.85, 1.2);
    return true;
  }

  // ---------- auditorium seats ----------
  function seatOf(id) { return getSeats()?.find((s) => s.id === id) || null; }
  function chooseSeat(e, text) {
    const all = getSeats();
    if (!all?.length) return null;
    const roster = state.pages.auditorium.roster;
    const taken = new Set(roster.map((x) => x.seat).filter(Boolean));
    const yee = YEE_EMOTES.has(e.emote);
    let free = all.filter((s) => !taken.has(s.id) && (s.ri === 0) === yee);
    if (!free.length) free = all.filter((s) => !taken.has(s.id));
    if (!free.length) return null;
    const low = String(text || '').toLowerCase();
    for (const o of roster) {
      if (!o.seat || !low.includes(o.key)) continue;
      const os = seatOf(o.seat);
      const near = os && free.filter((s) => s.row === os.row && Math.abs(s.u - os.u) < 0.9);
      if (near?.length) return near[0].id;
    }
    const full = 1 - free.length / all.length;
    const mid = (14.1 + 4.5) / 2;
    const takenSeats = all.filter((s) => taken.has(s.id));
    const weight = (s) => {
      let w = ROW_WEIGHT[s.row] ?? 1;
      w *= s.block === 'main' ? 1.6 - Math.abs(s.u - mid) / 8 : 0.55;
      if (full < 0.5 && takenSeats.some((o) => o.row === s.row && Math.abs(o.u - s.u) < 0.9)) w *= 0.3;
      return Math.max(0.02, w);
    };
    let total = 0;
    const cum = free.map((s) => (total += weight(s)));
    const r = Math.random() * total;
    return free[cum.findIndex((x) => x >= r)].id;
  }
  // people waiting outside get free seats, oldest first
  function seatQueue() {
    const A = state.pages.auditorium;
    if (A.show.houseOut) return;
    for (const e of A.roster) {
      if (e.seat) continue;
      const seat = chooseSeat(e, e.d?.data);
      if (!seat) break;
      e.seat = seat;
      emit('auditorium', { t: 'seat', nick: e.nick, seat });
      changed();
    }
  }

  function removeEntry(page, key, why) {
    const P = state.pages[page];
    const i = P.roster.findIndex((e) => e.key === key);
    if (i < 0) return false;
    const [e] = P.roster.splice(i, 1);
    emit(page, { t: 'remove', nick: e.nick, why });
    changed();
    if (page === 'auditorium' && e.seat) seatQueue();
    return true;
  }

  // ---------- chat ----------
  function onMessage(d, { force = false, say = false } = {}) {
    const nick = String(d.nick || '').trim().slice(0, 25);
    const text = String(d.data || '');
    if (!nick || (!text && !force)) return;
    const key = nick.toLowerCase();
    const own = messageEmotes(text, emoteNames()).filter((n) => !AVATAR_BLOCK.has(n));
    const before = lastEmotes.get(key) || [];
    if (own.length) remember(lastEmotes, key, [...new Set([...own, ...before])].slice(0, 4));
    if (!force && Array.isArray(d.features) && d.features.includes('moderator')) return;   // mods are jannies
    const walks = tagMatcher(state.settings.tag);
    if (!force && !walks(nick, text)) return;
    const slim = slimMsg({ ...d, nick }, text);
    const now = Date.now();
    for (const page of PAGES) {
      const P = state.pages[page];
      const e = find(page, key);
      if (e) {
        // already in the room: they talk (a seated chatter keeps their emote, as in the page)
        e.d = slim;
        e.last = now;
        if (page === 'lobby' && own.length) { e.emote = own[0]; e.alt = [...new Set([...own.slice(1), ...e.alt])].slice(0, 4); }
        emit(page, { t: 'walk', e, again: true, follow: false, say });
        changed();
        continue;
      }
      if (page === 'lobby' && !force && crowdSkip(nick)) continue;
      const alt = [...new Set([...own, ...before])];
      let roomIndex = roomOf.get(key);
      if (roomIndex == null || Math.random() < 0.3) roomIndex = Math.floor(Math.random() * 5);
      remember(roomOf, key, roomIndex);
      const r = Math.random();
      const entry = { key, nick, d: slim, emote: alt[0] || null, alt: alt.slice(1, 4), roomIndex,
        detour: r < 0.12 ? 'popcorn' : r < 0.17 ? 'bathroom' : null, seed: (Math.random() * 2 ** 32) >>> 0, at: now, last: now };
      if (page === 'lobby') entry.place = null;
      if (page === 'auditorium') {
        const waiting = P.roster.filter((x) => !x.seat);
        // a full queue drops whoever has been quiet longest (auditorium.html onMessage)
        if (waiting.length >= AUD.MAX_QUEUE) {
          const quiet = waiting.reduce((a, b) => (b.last < a.last ? b : a));
          removeEntry(page, quiet.key, 'queue full');
        }
        entry.seat = P.show.houseOut ? null : chooseSeat(entry, text);
      }
      P.roster.push(entry);
      emit(page, { t: 'walk', e: entry, again: false, follow: wantFollow(page), say });
      changed();
      if (page === 'lobby' && P.roster.length > LOBBY.HARD_CAP) {
        // the page fades out its oldest walker over the hard cap; the room does the same, for every screen
        removeEntry(page, P.roster[0].key, 'cap');
      }
    }
  }

  function purge(nick) {
    const key = String(nick || '').trim().toLowerCase();
    if (!key) return;
    for (const page of PAGES) {
      // the pages run their own exit (a janny escort, a fade): the room only forgets them
      const P = state.pages[page];
      const i = P.roster.findIndex((e) => e.key === key);
      if (i < 0) continue;
      const [e] = P.roster.splice(i, 1);
      changed();
      if (page === 'auditorium' && e.seat) seatQueue();
    }
  }

  /** every frame from Destiny.gg chat (raw "TYPE {json}") */
  function chatFrame(raw) {
    const sp = raw.indexOf(' ');
    const type = sp < 0 ? raw : raw.slice(0, sp);
    if (type !== 'MSG' && type !== 'MUTE' && type !== 'BAN') return;
    let d;
    try { d = JSON.parse(raw.slice(sp + 1)); } catch { return; }
    if (!d || typeof d !== 'object') return;
    if (type === 'MSG') onMessage(d);
    else purge(d.data);
  }

  // ---------- control panel ----------
  /** a /ctl/cmd command; applied to the room before the server forwards it to the screens as before */
  function command(c) {
    const page = c.page || 'lobby';
    if (!PAGES.includes(page)) return;
    const P = state.pages[page];
    const d = P.director;
    const key = typeof c.nick === 'string' ? c.nick.trim().toLowerCase() : '';
    const num = (v, a, b) => (Number.isFinite(+v) ? clamp(+v, a, b) : null);
    switch (c.cmd) {
      case 'director': d.on = !!c.on; if (d.on) d.nextAt = Math.min(d.nextAt, Date.now() + 20000); break;
      case 'every': { const v = num(c.value, 30, 1800); if (v != null) d.every = v; break; }
      case 'zoom': { const v = num(c.value, 1.2, 3); if (v != null) d.zoom = v; break; }
      case 'next': d.wantNext = true; break;
      case 'wide': d.wantNext = false; break;
      case 'random': {
        const list = page === 'auditorium' ? P.roster.filter((e) => e.seat) : P.roster;
        const pick = list[Math.floor(Math.random() * list.length)];
        if (pick) emit(page, { t: 'follow', nick: pick.nick });
        break;
      }
      case 'remove': removeEntry(page, key, 'panel'); break;
      // the leading auditorium screen's usher kicked them, or a dozer went home (?leave=)
      case 'kicked': removeEntry(page, key, c.why === 'home' ? 'home' : 'kicked'); break;
      // a lobby screen saw them leave on their own (in through a door, home, on the bus, run over): the room forgets
      // them so a reload doesn't bring them back; the other screens let their own walker finish the exit
      case 'left': removeEntry(page, key, 'left'); break;
      case 'reset':
        P.roster = [];
        if (page === 'auditorium') P.show.houseOut = false;
        d.wantNext = false;
        emit(page, { t: 'clear' });
        log(`room: ${page} cleared from the panel`);
        break;
      case 'say':
      case 'add': {
        const nick = String(c.nick || '').trim().slice(0, 25);
        if (nick) onMessage({ nick, data: String(c.text || '').slice(0, 200) }, { force: true, say: c.cmd === 'say' });
        break;
      }
      case 'who': {
        const tag = c.value === 'everyone' ? null : String(c.nick || '').trim().replace(/^@/, '').slice(0, 25);
        if (c.value !== 'everyone' && !/^[A-Za-z0-9_]{1,25}$/.test(tag)) break;
        Object.assign(state.settings, { tag, fromPanel: true });
        log(`room: who walks in: ${tag ? `tags ${tag}` : 'everyone'} (panel)`);
        break;
      }
      default:
        if (page === 'auditorium') applyShow(c);
        break;
    }
    changed();
  }
  function applyShow(c) {
    const s = state.pages.auditorium.show;
    switch (c.cmd) {
      case 'phase':
        if (!['seating', 'dim', 'film', 'up'].includes(c.value)) return;
        if (c.value === s.phase) s.lightsOn = false;
        s.phase = c.value; s.shot = 'push'; s.auto = false;
        if (c.value === 'seating' && s.houseOut) { s.houseOut = false; seatQueue(); }   // as the page's setPhase
        break;
      case 'movie': s.phase = 'film'; s.shot = 'movie'; s.auto = false; break;
      case 'outro': if (s.phase === 'film') s.shot = 'outro'; break;
      case 'phaseAuto': s.auto = !!c.on; break;
      case 'lights': s.lightsOn = !!c.on && s.phase === 'film'; break;
      case 'houseOut':
        s.houseOut = !!c.on;
        if (s.houseOut) {
          // everyone stands up and leaves: the room forgets the seated ones; whoever waits outside stays queued
          const A = state.pages.auditorium;
          A.roster = A.roster.filter((e) => !e.seat);
        } else seatQueue();
        break;
      default: break;
    }
  }

  /** a screen's /ctl/state post; only the leading screen's report updates the room */
  function screenState(st) {
    const page = st.page === 'auditorium' ? 'auditorium' : 'lobby';
    if (!st || st.id !== lead[page] || !Array.isArray(st.chatters)) return;
    reports[page] = { at: Date.now(), chatters: st.chatters };
    if (page === 'lobby') {
      const places = new Map(st.chatters.map((c) => [String(c.nick || '').toLowerCase(), c.status]));
      for (const e of state.pages.lobby.roster) {
        const p = places.get(e.key);
        if (p && p !== e.place) { e.place = p; dirty = true; }
      }
      if (dirty) changed();
    } else if (st.preshow && typeof st.preshow === 'object') {
      // automatic phases (download progress) happen in the page; the room keeps what the leading screen shows
      const s = state.pages.auditorium.show;
      const p = st.preshow;
      if (['seating', 'dim', 'film', 'up'].includes(p.phase) && p.phase !== s.phase) { s.phase = p.phase; changed(); }
      if (['push', 'movie', 'outro'].includes(p.shot) && p.shot !== s.shot) { s.shot = p.shot; changed(); }
      if (typeof p.auto === 'boolean' && p.auto !== s.auto) { s.auto = p.auto; changed(); }
      if (typeof p.lightsOn === 'boolean' && p.lightsOn !== s.lightsOn) { s.lightsOn = p.lightsOn; changed(); }
    }
  }

  // once a second: queued chatters quiet for 10 min leave the queue, as in the page
  const timer = setInterval(() => {
    const A = state.pages.auditorium;
    for (const e of [...A.roster]) if (!e.seat && Date.now() - e.last > AUD.QUEUE_QUIET_MS) removeEntry('auditorium', e.key, 'quiet');
  }, 1000);
  timer.unref?.();

  function summary() {
    const A = state.pages.auditorium;
    return { tag: state.settings.tag || null, fromPanel: !!state.settings.fromPanel,
      lobby: { people: state.pages.lobby.roster.length, screens: subs.lobby.size },
      auditorium: { seated: A.roster.filter((e) => e.seat).length, waiting: A.roster.filter((e) => !e.seat).length,
        seats: getSeats()?.length || 0, screens: subs.auditorium.size, show: { ...A.show } } };
  }

  return {
    chatFrame, command, screenState, subscribe, snapshot, summary,
    flush: () => { dirty = true; save(); },
    close: () => { clearInterval(timer); save(); },
    state,   // for checks
  };
}

module.exports = { createRoom, messageEmotes, seatsFromLayout };
