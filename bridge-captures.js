'use strict';

// Keep host visibility gating separate from the viewer's choice in OBS.
function createCaptures({ request, sceneName, filterName, preshowSource, log = () => {} }) {
  let targets = [], selected = null;
  function configure(items) {
    const previous = selected;
    targets = items.map(item => ({ name: item.sourceName, id: item.sceneItemId,
      enabled: item.sceneItemEnabled, index: item.sceneItemIndex || 0, echoes: [], quad: null }));
    selected = targets.some(t => t.name === previous) ? previous
      : targets.filter(t => t.enabled).sort((a, b) => b.index - a.index)[0]?.name || null;
  }
  function visibility(event) {
    if (event.sceneName !== sceneName) return false;
    const target = targets.find(t => t.id === event.sceneItemId);
    if (!target) return false;
    target.enabled = event.sceneItemEnabled;
    // Our automatic hide/show events must never overwrite the user's selection.
    if (target.echoes[0] === event.sceneItemEnabled) { target.echoes.shift(); return false; }
    if (event.sceneItemEnabled) selected = target.name;
    else if (selected === target.name) selected = null;
    log(`screen source: ${selected || 'none'}`);
    return true;
  }
  const has = (name) => targets.some(target => target.name === name);
  function select(name, enabled) {
    if (!has(name)) return false;
    if (enabled) selected = name;
    else if (selected === name) selected = null;
    log(`screen source: ${selected || 'none'}`);
    return true;
  }
  async function enabled(target, value) {
    if (target.enabled === value) return;
    target.echoes.push(value);
    target.enabled = value;
    try {
      await request('SetSceneItemEnabled', { sceneName, sceneItemId: target.id, sceneItemEnabled: value });
    } catch (error) { target.echoes = []; target.enabled = !value; throw error; }
  }
  async function render({ film, quad, active = true }) {
    // Movie captures keep their eye enabled while the shader hides their picture.
    // The commercial browser source can also play before Film.
    for (const target of targets) {
      const settings = { ...(quad || {}), Cinema_Visible: !!(active && quad && (film || target.name === preshowSource)) };
      const key = JSON.stringify(settings);
      if (target.quad !== key) {
        await request('SetSourceFilterSettings', { sourceName: target.name,
          filterName, filterSettings: settings, overlay: true });
        target.quad = key;
      }
    }
    // Shut down the commercial player when it has nowhere to project, so its audio stops too.
    const chosen = active && targets.find(t => t.name === selected && (t.name !== preshowSource || quad));
    for (const target of targets) if (target !== chosen) await enabled(target, false);
    if (chosen) await enabled(chosen, true);
  }
  return { configure, visibility, render, select, has, selected: () => selected };
}
module.exports = { createCaptures };
