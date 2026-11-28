// A browser script on the hosted control panel and a CommonJS module in the local OBS bridge.
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
  const directorName = 'DinkDonk Cinema Look (director)';
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
  function create({ request, readSettings, matchSource, readShader, seed = '', onError = () => {} }) {
    let timer = null, looping = false, generation = 0, running = null, runningGeneration = 0, queued = false, shader = '';
    const verified = new Map();
    const cancelled = new Error('Look director stopped');
    async function pass(force, version) {
      const check = () => { if (version !== generation) throw cancelled; };
      const call = (type, data) => { check(); return request(type, data); };
      const { inputs = [] } = await call('GetInputList', { inputKind: 'browser_source' });
      const roomInputs = [];
      for (const input of inputs) {
        if (input.inputKind && input.inputKind !== 'browser_source') continue;
        const id = input.inputUuid ? { inputUuid: input.inputUuid, inputName: input.inputName } : { inputName: input.inputName };
        const info = await call('GetInputSettings', id);
        const url = info.inputSettings?.url;
        const room = !info.inputSettings?.is_local_file && url && matchSource(url);
        if (room === 'lobby' || room === 'auditorium') roomInputs.push({ input, url, room });
      }
      const names = new Set(roomInputs.map(v => v.input.inputName));
      for (const name of verified.keys()) if (!names.has(name)) verified.delete(name);
      if (!roomInputs.length) return;
      const settings = await readSettings();
      if (!settings || typeof settings !== 'object') throw Error('Cinema room settings unavailable');
      const now = Date.now();
      let success = true;
      for (const { input, url, room } of roomInputs) {
        check();
        const sourceName = input.inputName;
        const id = input.inputUuid ? { sourceUuid: input.inputUuid, sourceName } : { sourceName };
        const preset = choosePreset(room, settings[room] || {}, seed, now);
        const stamp = JSON.stringify([input.inputUuid, url, preset]);
        const prior = verified.get(sourceName);
        if (!force && prior?.stamp === stamp && now - prior.at < 10000) continue;
        try {
          if (!shader) {
            shader = normalized(await readShader());
            if (!shader.includes('uniform int Preset') || !shader.includes('Keyed_Plate')) { shader = ''; throw Error('Cinema shader unavailable'); }
          }
          const { filters = [] } = await call('GetSourceFilterList', id);
          const owned = filters.filter(f => managed(f, shader));
          const strength = strengths[room][preset] ?? (room === 'auditorium' ? 55 : 85);
          const setOn = (filterName, filterEnabled) => call('SetSourceFilterEnabled', { ...id, filterName, filterEnabled });
          let target = owned.find(f => packaged.get(f.filterName) === preset);
          if (!target) target = owned.find(f => !packaged.has(f.filterName));
          const disable = owned.filter(f => f.filterEnabled && (preset === 'off' || f !== target));
          const uniforms = { Preset: preset, Strength: strength, Keyed_Plate: room === 'auditorium' };
          // A collection switch or a changed room URL can arrive during discovery.
          const current = await call('GetInputSettings', input.inputUuid ? { inputUuid: input.inputUuid } : { inputName: sourceName });
          if (current.inputSettings?.is_local_file || current.inputSettings?.url !== url) continue;
          if (preset !== 'off' && target) {
            // Move only our shader. If it started before the key, removing it shifts the key down one index.
            const keyIndex = Math.max(-1, ...filters.filter(f => /^(?:color|chroma)_key_filter(?:_v\d+)?$/.test(f.filterKind)).map(f => f.filterIndex));
            if (target.filterIndex < keyIndex) await call('SetSourceFilterIndex', { ...id, filterName: target.filterName, filterIndex: keyIndex });
            const s = target.filterSettings || {};
            if (Number(s.Preset) !== preset || Number(s.Strength) !== strength || !!s.Keyed_Plate !== uniforms.Keyed_Plate) {
              await call('SetSourceFilterSettings', { ...id, filterName: target.filterName, filterSettings: uniforms, overlay: true });
            }
          }
          for (const f of disable) await setOn(f.filterName, false);
          if (preset !== 'off' && !target) {
            let name = directorName, suffix = 2;
            while (filters.some(f => f.filterName === name)) name = directorName + ' ' + suffix++;
            await call('CreateSourceFilter', { ...id, filterName: name, filterKind: 'shader_filter',
              filterSettings: { from_file: false, shader_text: shader, ...uniforms } });
          } else if (preset !== 'off' && !target.filterEnabled) await setOn(target.filterName, true);
          check();
          verified.set(sourceName, { stamp, at: now });
        } catch (e) { if (e === cancelled) throw e; success = false; verified.delete(sourceName); onError(e); }
      }
      return success;
    }
    function reconcile(force) {
      if (running) {
        if (runningGeneration !== generation) return running.then(() => reconcile(force));
        queued ||= force; return running;
      }
      const version = generation;
      runningGeneration = version;
      running = (async () => {
        let again = force, success = true;
        do {
          queued = false;
          try { success = (await pass(again, version)) !== false; } catch (e) { success = false; if (e !== cancelled) onError(e); }
          again = queued;
        } while (queued && version === generation);
        return success;
      })().finally(() => { running = null; });
      return running;
    }
    async function tick(version) {
      await reconcile(false);
      if (looping && version === generation) timer = setTimeout(() => tick(version), 2000);
    }
    return {
      start() { if (!looping) { looping = true; void tick(generation); } },
      stop() { looping = false; generation++; queued = false; clearTimeout(timer); timer = null; verified.clear(); },
      refresh() { return reconcile(true); },
    };
  }
  return { create, choosePreset, untilNextPreset, strengthFor, presets, localRoom };
});
