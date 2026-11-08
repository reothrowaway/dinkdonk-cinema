'use strict';

// The DinkDonk poll that is being built or is open for voting right now, plus the lobby's roll-up poll screen
// (down or up), per room: 'local' on the local server; on the hosted edition each room key has its own poll (sent by
// that streamer's own script) and its own screen. dinkdonk.mov only lists polls once they are finished, so the poll builder's browser sends the poll
// here (userscripts/dinkdonk-poll-draft.user.js) and the lobby reads it from /dd/draft.json. Votes and the final
// result come from the poll's public results page (setResults, fed by standby-server.js). Kept on disk so a server
// restart doesn't lose a poll halfway through or roll the screen back up.

const fs = require('node:fs');
const path = require('node:path');

// a test server on another port (STANDBY_PORT=18771 …) keeps its own file, so it can't overwrite the live poll;
// the hosted edition (web/server.js) sets POLL_DRAFT_FILE to a file in its data folder
const PORT = Number(process.env.STANDBY_PORT || 18770);
const FILE = process.env.POLL_DRAFT_FILE || path.join(__dirname, 'cache', PORT === 18770 ? 'poll-draft.json' : `poll-draft-${PORT}.json`);
const MAX_AGE_MS = 6 * 60 * 60 * 1000;      // a draft nobody touched for 6 h is over
const STATES = ['building', 'open', 'closed'];

const str = (v, n) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, n) : '');
const key = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const num = (v) => (v != null && v !== '' && Number.isFinite(Number(v)) ? Number(v) : null);

let drafts = {};
let screens = {};
try {
  const disk = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  if (disk && (disk.drafts || 'draft' in disk)) {
    drafts = disk.drafts && typeof disk.drafts === 'object' ? disk.drafts : {};
    screens = disk.screens && typeof disk.screens === 'object' ? disk.screens : {};
    if (disk.draft && !drafts.local) drafts.local = disk.draft;      // (files from before rooms)
    if (disk.screen && !screens.local) screens.local = disk.screen;
  } else if (disk) drafts.local = disk;   // (the first files: the draft alone)
} catch { /* nothing saved yet */ }

function save() {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify({ drafts, screens }));
  } catch (e) { console.error('Poll draft:', e.message); }
}

function get(room = 'local') {
  const d = drafts[room];
  if (d && Date.now() - d.updatedAt > MAX_AGE_MS) { delete drafts[room]; save(); return null; }
  return d || null;
}
const getScreen = (room = 'local') => screens[room] || { open: false, at: 0 };
// the rooms with a poll that has an id and isn't final yet (the servers read its votes for these)
const openPolls = () => Object.keys(drafts).filter((r) => { const d = get(r); return d?.pollId && d.state !== 'building' && !(d.state === 'closed' && d.results?.winners?.length); });

function setScreen(open, room = 'local') {
  if (getScreen(room).open !== !!open) { screens[room] = { open: !!open, at: Date.now() }; save(); }
  return getScreen(room);
}
function dropRoom(room) { if (drafts[room] || screens[room]) { delete drafts[room]; delete screens[room]; save(); } }   // a revoked room

// input: { clear } or { title, type, state, pollId, by, options: [{ title, year, poster }] }
function set(input, room = 'local') {
  if (!input || typeof input !== 'object') throw new Error('bad body');
  if (input.clear) { delete drafts[room]; save(); return null; }
  const now = Date.now();
  const prev = get(room);
  const pollId = /^[A-Za-z0-9]{1,16}$/.test(input.pollId || '') ? input.pollId : null;
  const state = STATES.includes(input.state) ? input.state : 'building';
  // a different poll starts a new list: another id, or building again after a poll went to voting or finished
  const same = !!prev && prev.state !== 'closed' && !(state === 'building' && prev.state === 'open') &&
    (prev.pollId === pollId || !prev.pollId || !pollId);
  // the same finished poll again (its results page reopened): nothing changes
  if (prev && prev.state === 'closed' && pollId && prev.pollId === pollId) return prev;
  const before = new Map(same ? prev.options.map((o) => [key(o.title), o]) : []);
  const seen = new Set();
  // no options at all (the vote page only says "this poll is open now"): keep the list the build page sent
  if (!Array.isArray(input.options) && same) input = { ...input, options: prev.options };
  const options = [];
  for (const o of Array.isArray(input.options) ? input.options.slice(0, 60) : []) {
    const title = str(o && o.title, 120);
    if (!title || seen.has(key(title))) continue;
    seen.add(key(title));
    const poster = str(o.poster, 400);
    options.push({
      title,
      year: /^\d{4}$/.test(String(o.year || '')) ? String(o.year) : '',
      poster: /^https:\/\//.test(poster) ? poster : '',
      addedAt: before.get(key(title))?.addedAt || now,
    });
  }
  const next = {
    pollId: pollId || (same ? prev.pollId : null),
    // the vote page may not show everything the build page did: keep what the same poll already had
    title: str(input.title, 160) || (same ? prev.title : ''),
    type: str(input.type, 40) || (same ? prev.type : ''),
    by: str(input.by, 25) || (same ? prev.by : ''),
    state,
    options,
    results: same ? prev.results || null : null,
    startedAt: same ? prev.startedAt : now,
    updatedAt: now,
    rev: (prev?.rev || 0) + 1,
  };
  // the userscript re-sends the same list every few seconds: only a real change bumps rev
  const unchanged = same && JSON.stringify({ ...prev, updatedAt: 0, rev: 0 }) === JSON.stringify({ ...next, updatedAt: 0, rev: 0 });
  drafts[room] = unchanged ? { ...prev, updatedAt: now } : next;
  save();
  return drafts[room];
}

// Votes from the poll's results page (dinkdonk.js parsePollDetail), and the winners from the finished-polls list.
// endedAt in the past, or the poll among the finished ones = voting is over.
function setResults(pollId, detail, winners, room = 'local') {
  const d = get(room);
  if (!d || d.pollId !== pollId) return d;
  const now = Date.now();
  const results = {
    type: str(detail?.type, 30) || d.results?.type || '',
    voters: num(detail?.voters) ?? d.results?.voters ?? null,
    endsAt: num(detail?.endedAt) ?? d.results?.endsAt ?? null,
    options: Array.isArray(detail?.options) && detail.options.length
      ? detail.options.slice(0, 60).map((o) => ({ title: str(o.title, 120), year: str(String(o.year || ''), 4),
        poster: /^https:\/\//.test(o.poster || '') ? o.poster : '', votes: num(o.votes), pct: num(o.pct) }))
      : d.results?.options || [],
    winners: Array.isArray(winners) ? winners.slice(0, 2).map((w) => ({ label: str(w.label, 20), title: str(w.title, 160) }))
      : d.results?.winners || [],
  };
  const over = (results.endsAt && results.endsAt <= now) || Array.isArray(winners);
  const next = { ...d, results, state: over ? 'closed' : d.state };
  if (JSON.stringify(next) === JSON.stringify(d)) return d;
  drafts[room] = { ...next, updatedAt: now, rev: d.rev + 1 };
  save();
  return drafts[room];
}

module.exports = { get, set, getScreen, setScreen, dropRoom, setResults, openPolls };
