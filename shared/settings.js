'use strict';

// Scene settings the control panel changes live (7 Nov 2026; owner: "migrate the url modifiers to the control panel").
// Used by standby-server.js (server side only). The screens' URL options stay the defaults: a setting the panel
// changes is remembered here (cache/ctl-settings.json, survives a server restart) and sent to every screen of that
// scene, right after it connects too, so a reloaded OBS source keeps it. Clearing a setting gives the URL value back.
// Setup options that need a reload (artdir, maxres, draft, layout, ...) stay URL-only.
//
// Protocol (POST /ctl/cmd, then the usual /ctl/events stream):
//   {cmd:'setting', page, key, value}   value null = back to the URL value; the server sends the page
//   {cmd:'settingsReset', page}         {cmd:'settings', page, values:{...every override}} instead
// GET /ctl/settings -> { schema, values: { lobby: {...}, auditorium: {...} } } for the panel.

const fs = require('node:fs');
const path = require('node:path');

const num = (key, label, min, max, step, def, group, hint = '') => ({ key, label, kind: 'num', min, max, step, def, group, hint });
const pick = (key, label, options, def, group, hint = '') => ({ key, label, kind: 'select', options, def, group, hint });
const bool = (key, label, def, group, hint = '') => ({ key, label, kind: 'bool', def, group, hint });

const BUBSTYLE = pick('bubstyle', 'Bubble look', [[0, 'Old dialog box'], [1, 'Marquee'], [2, 'Ticket stub'], [3, 'Neon'], [4, 'Comic'], [5, 'RPG window']], 3, 'Look');
const JANIDLE = num('janidle', 'Janny clocks off after', 20, 3600, 10, 600, 'People', 's without a message');

const SCHEMA = {
  lobby: [
    BUBSTYLE,
    num('bubbles', 'Bubbles on screen at most', 2, 14, 1, 8, 'Look', 'the oldest fades for a new one'),
    bool('pollscreen', 'Poll screen on the back wall', true, 'Look', 'off hides it (the Poll screen card still rolls it up/down)'),
    num('crowd', 'Crowd before new chatters are thinned', 0, 60, 1, 14, 'People', 'people outside or in line; 0 = never thin'),
    num('quit', 'Chance to give up in the ticket line', 0, 1, 0.01, 0.06, 'People', '0-1, for people joining the line'),
    pick('janitor', 'Janitor', [['none', "Only mods' jannies"], ['always', 'cpMOP penguin always'], ['3d', 'Rendered 3D janitor']], 'none', 'People'),
    JANIDLE,
    pick('morerain', 'Extra rain', [[5, 'Follows the weather'], [0, 'Off'], [1, 'Steady'], [2, 'Downpour'], [3, 'Curtains'], [4, 'Deluge']], 5, 'Weather'),
    num('moreraingain', 'Extra-rain brightness', 0.1, 4, 0.1, 1, 'Weather'),
    num('rainspeed', 'Rain fall speed', 0, 2, 0.02, 0, 'Weather', '0 = follows the weather'),
    num('rainfps', 'Extra-rain steps per second', 0, 120, 1, 24, 'Weather', '0 = every display frame'),
    num('weather', 'Weather clock speed', 0.1, 100, 0.1, 1, 'Weather', 'x faster, for testing'),
    pick('mist', 'Splash mist', [[0, 'Off'], [1, 'Sparkle'], [2, 'Edge spray'], [3, 'Lamp-lit mist'], [4, 'Wind sheets']], 0, 'Weather'),
    num('mistgain', 'Mist brightness', 0.1, 4, 0.1, 1, 'Weather'),
  ],
  auditorium: [
    BUBSTYLE,
    bool('screen', 'Screen always green', false, 'Look', 'never the pre-show slides'),
    pick('slidefade', 'Pre-show slide change', [['cross', 'Cross-fade'], ['seq', 'Fade out, then in']], 'cross', 'Look'),
    num('sitscale', 'Seated emote size', 0.5, 2, 0.05, 1.2, 'Look'),
    num('sitz', 'Seated emote lift', 0, 120, 1, 48, 'Look', 'px above the seat'),
    num('leave', 'Dozers go home when full after', 0, 240, 1, 0, 'People', 'min quiet; 0 = off'),
    num('doze', 'Nod off after', 10, 7200, 10, 600, 'People', 's quiet (x0.8-1.6 each)'),
    num('chatty', 'Phone out in the dark after', 2, 20, 1, 3, 'People', 'messages within a minute'),
    num('phones', 'Share who carry a phone', 0, 1, 0.05, 0.3, 'People', '0-1, for new arrivals'),
    num('kick', 'Chance an usher visit ends in a kick', 0, 1, 0.05, 0.5, 'People'),
    JANIDLE,
  ],
};

// a panel value -> the stored value, or undefined when it is not valid for that setting
function normalize(def, value) {
  if (def.kind === 'bool') return typeof value === 'boolean' ? value : value === 1 || value === '1' ? true : value === 0 || value === '0' ? false : undefined;
  if (def.kind === 'select') return def.options.map((o) => o[0]).find((o) => String(o) === String(value));
  const n = Number(value);
  if (value === '' || value === null || !Number.isFinite(n)) return undefined;
  const stepped = Number((Math.round(n / def.step) * def.step).toFixed(4));   // on the slider's steps
  return Math.min(def.max, Math.max(def.min, stepped));
}

function createSettings({ file = null, log = () => {} } = {}) {
  const values = { lobby: {}, auditorium: {} };
  if (file) {
    try {
      const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
      for (const page of Object.keys(values)) {
        for (const def of SCHEMA[page]) {
          const v = saved?.[page]?.[def.key];
          if (v !== undefined && normalize(def, v) !== undefined) values[page][def.key] = normalize(def, v);
        }
      }
    } catch { /* first start, or a broken file: no overrides */ }
  }
  const save = () => {
    if (!file) return;
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(`${file}.tmp`, JSON.stringify(values));
      fs.renameSync(`${file}.tmp`, file);
    } catch (e) { log(`settings: not saved (${e.message})`); }
  };
  return {
    schema: SCHEMA,
    get: (page) => ({ ...values[page] }),
    all: () => ({ lobby: { ...values.lobby }, auditorium: { ...values.auditorium } }),
    // a /ctl/cmd 'setting' or 'settingsReset': true when it was one (handled), with the page's values changed
    command(c) {
      const page = c.page === 'auditorium' ? 'auditorium' : 'lobby';
      if (c.cmd === 'settingsReset') {
        values[page] = {};
        save();
        log(`settings: ${page} back to the screen links`);
        return true;
      }
      if (c.cmd !== 'setting') return false;
      const def = SCHEMA[page].find((d) => d.key === c.key);
      if (!def) return true;
      if (c.value === null || c.value === undefined) delete values[page][def.key];
      else {
        const v = normalize(def, c.value);
        if (v === undefined) return true;
        values[page][def.key] = v;
      }
      save();
      log(`settings: ${page} ${def.key} = ${values[page][def.key] ?? '(screen link)'}`);
      return true;
    },
    // the message every screen of the page gets (after a change, and when it connects)
    message: (page) => ({ cmd: 'settings', page, values: { ...values[page] } }),
  };
}

module.exports = { createSettings, SCHEMA };
