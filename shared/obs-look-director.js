// Shared page clock, preset strengths and migration for old OBS collections.
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CinemaLookDirector = api;
})(globalThis, () => {
  'use strict';
  const presets = ['After-hours mall', 'Pearl diffusion', 'Chrome & cyan', 'Pink halation', 'Miami dusk',
    'Anamorphic neon', 'Star-filter glass', 'Curved CRT', 'VHS rental', 'Milk-glass pastels',
    'Ultraviolet arcade', '35 mm midnight', 'Neon rain'];
  const strengths = { lobby: { 0: 75, 2: 65, 4: 65, 7: 65, 10: 60, 12: 85 }, auditorium: { 1: 55, 11: 70 } };
  const packaged = new Map(Object.values(strengths).flatMap(room => Object.entries(room).map(([id, strength]) =>
    [presets[id] + ' · ' + strength + '%', Number(id)])));
  function hash(text) {
    let n = 2166136261;
    for (let i = 0; i < text.length; i++) n = Math.imul(n ^ text.charCodeAt(i), 16777619);
    return n >>> 0;
  }
  function shuffled(seed, block) {
    let n = hash(seed + '/' + block);
    const order = presets.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
      const j = Math.floor((n / 4294967296) * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }
  function intervalMs(settings) {
    return Math.min(600, Math.max(5, Math.round(Number(settings.filterSeconds) || 30))) * 1000;
  }
  function untilNextPreset(room, settings, seed, now) {
    const interval = intervalMs(settings);
    return interval - (now + hash(seed + '/' + room + '/offset') % interval) % interval;
  }
  function strengthFor(room, preset) {
    return strengths[room][preset] ?? (room === 'auditorium' ? 55 : 85);
  }
  function choosePreset(room, settings = {}, seed = '', nowMs = Date.now()) {
    if (settings.filterDirector === false) {
      if (settings.cinemaFilter === 'off') return 'off';
      return /^(?:[0-9]|1[0-2])$/.test(String(settings.cinemaFilter)) ? Number(settings.cinemaFilter) : room === 'auditorium' ? 1 : 12;
    }
    const interval = intervalMs(settings);
    const key = seed + '/' + room;
    const slot = Math.floor((nowMs + hash(key + '/offset') % interval) / interval);
    const block = Math.floor(slot / presets.length), pos = slot - block * presets.length;
    const order = shuffled(key, block);
    // A swap at the start leaves the last entry unchanged for the following block.
    if (pos < 2 && order[0] === shuffled(key, block - 1).at(-1)) [order[0], order[1]] = [order[1], order[0]];
    return order[pos];
  }
  function localRoom(value, port, addresses = new Set(['127.0.0.1', '::1'])) {
    let url;
    try { url = new URL(value); } catch { return null; }
    const host = url.hostname.replace(/^\[|\]$/g, '');
    if (url.protocol !== 'http:' || url.port !== String(port) || (host !== 'localhost' && !addresses.has(host)) ||
        url.username || url.password || url.searchParams.has('k')) return null;
    if (/^\/(lobby|roxy)(-qa)?\.html$/.test(url.pathname)) return 'lobby';
    return /^\/auditorium(-qa)?\.html$/.test(url.pathname) ? 'auditorium' : null;
  }
  function normalized(text) { return String(text || '').replace(/\r\n/g, '\n').trim(); }
  function managed(filter, shader) {
    if (filter.filterKind !== 'shader_filter') return false;
    const name = filter.filterName;
    if (!packaged.has(name) && name !== 'Cinema look' && !/^DinkDonk Cinema Look \(director\)(?: [2-9]\d*| 1\d+)?$/.test(name)) return false;
    const s = filter.filterSettings || {};
    return s.from_file ? /(?:^|\/)cinema-looks\.shader$/i.test(String(s.shader_file_name || '').replace(/\\/g, '/')) :
      normalized(s.shader_text) === shader;
  }
  // Migration for collections saved by the old OBS director. This runs on connection
  // or a collection change. The caller cancels pending work if either changes.
  async function disableLegacy({ request, matchSource, readShader, current }) {
    const { inputs = [] } = await request('GetInputList', { inputKind: 'browser_source' });
    let shader, firstError;
    for (const input of inputs) {
      if (!current()) return;
      if (input.inputKind && input.inputKind !== 'browser_source') continue;
      const id = input.inputUuid ? { inputUuid: input.inputUuid } : { inputName: input.inputName };
      const source = input.inputUuid ? { sourceUuid: input.inputUuid } : { sourceName: input.inputName };
      try {
        const { inputSettings } = await request('GetInputSettings', id);
        if (!current()) return;
        if (inputSettings?.is_local_file || !matchSource(inputSettings?.url)) continue;
        const { filters = [] } = await request('GetSourceFilterList', source);
        for (const f of filters) {
          if (!current()) return;
          if (!f.filterEnabled || f.filterKind !== 'shader_filter') continue;
          if (!f.filterSettings?.from_file && !shader) {
            shader = normalized(await readShader());
            if (!shader.includes('uniform int Preset') || !shader.includes('Keyed_Plate')) throw Error('Legacy shader unavailable');
          }
          if (!managed(f, shader)) continue;
          const latest = await request('GetInputSettings', id);
          if (!current()) return;
          if (latest.inputSettings?.is_local_file || latest.inputSettings?.url !== inputSettings.url) break;
          const filter = { ...source, filterName: f.filterName };
          const details = await request('GetSourceFilter', filter);
          if (current() && details.filterEnabled && managed({ ...details, filterName: f.filterName }, shader)) {
            await request('SetSourceFilterEnabled', { ...filter, filterEnabled: false });
          }
        }
      } catch (error) { firstError ||= error; }
    }
    if (firstError && current()) throw firstError;
  }
  return { disableLegacy, choosePreset, untilNextPreset, strengthFor, presets, localRoom };
});
