// Operator controls, opened on demand from the browser source or OBS Interact.
(() => {
  'use strict';
  const page = document.currentScript.dataset.room;
  if (!['lobby', 'auditorium'].includes(page)) return;
  let dialog, form, preset, automatic, seconds, notice, timer;
  let busy = false, version = 0;

  function build() {
    const host = document.createElement('div');
    host.id = 'cinema-filter-menu';
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>
      dialog{color-scheme:dark;position:fixed;inset:16px 16px auto auto;margin:0;border:1px solid #806981;border-radius:8px;background:#201b28;color:#fff;box-shadow:0 8px 32px #100b1c88;padding:16px;font:15px/1.4 system-ui;max-width:calc(100vw - 68px)}
      dialog::backdrop{background:transparent} header,label{display:flex;align-items:center;justify-content:space-between;gap:16px}
      header{margin-bottom:12px}strong{font-size:17px}fieldset{border:0;padding:0;margin:0;display:grid;gap:10px}
      button,select,input{font:inherit;accent-color:#e795c7}button{cursor:pointer}input[type=number]{width:5em}
      output:not(:empty){display:block;max-width:24em;margin-top:10px;color:#ffd79e}
    </style><dialog aria-labelledby="title"><header><strong id="title"></strong><button type="button" aria-label="Close filter controls">Close</button></header>
      <fieldset disabled><label>Filter <select></select></label><label>Director chooses filters <input type="checkbox"></label>
      <label>Seconds per filter <input type="number" min="5" max="600" step="1" required></label></fieldset><output role="status"></output></dialog>`;
    document.body.appendChild(host);
    dialog = root.querySelector('dialog');
    root.querySelector('strong').textContent = (page === 'lobby' ? 'Lobby' : 'Auditorium') + ' filters';
    form = root.querySelector('fieldset');
    preset = root.querySelector('select');
    automatic = root.querySelector('[type=checkbox]');
    seconds = root.querySelector('[type=number]');
    notice = root.querySelector('output');
    root.querySelector('button').onclick = () => dialog.close();
    preset.onchange = () => save('cinemaFilter', preset.value);
    automatic.onchange = () => save('filterDirector', automatic.checked);
    seconds.onchange = () => { if (seconds.reportValidity()) save('filterSeconds', seconds.valueAsNumber); };
    dialog.addEventListener('close', () => { clearInterval(timer); version++; });
  }
  async function refresh() {
    if (busy || !dialog?.open) return;
    const id = ++version;
    try {
      const response = await fetch('/ctl/settings', { cache: 'no-store', signal: AbortSignal.timeout(4000) });
      if (!response.ok) throw Error('Room settings are unavailable.');
      const {schema, values} = await response.json();
      if (id !== version || !dialog.open) return;
      const options = schema[page].find(s => s.key === 'cinemaFilter');
      if (!options) throw Error('This room server has not loaded the filter controls yet.');
      if (!preset.options.length) {
        const placeholder = new Option('Choose a look…', '');
        placeholder.disabled = true;
        preset.add(placeholder);
        for (const [value, label] of options.options) preset.add(new Option(label, value));
      }
      const settings = values[page] || {};
      automatic.checked = settings.filterDirector ?? true;
      preset.value = automatic.checked ? '' : String(settings.cinemaFilter ?? options.def);
      if (seconds.getRootNode().activeElement !== seconds) seconds.value = settings.filterSeconds ?? 30;
      seconds.disabled = !automatic.checked;
      form.disabled = false;
      notice.textContent = '';
    } catch (error) { if (id === version) { form.disabled = true; notice.textContent = error.message; } }
  }
  async function save(key, value) {
    if (busy) return;
    busy = true; version++;
    form.disabled = true;
    try {
      const r = await fetch('/ctl/cmd', { method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({page, cmd:'setting', key, value}), signal: AbortSignal.timeout(5000) });
      if (!r.ok) throw Error('Could not save this room’s filter setting.');
    } catch (error) { notice.textContent = error.message; }
    finally { busy = false; }
    if (!notice.textContent) await refresh();
  }
  function toggle() {
    if (!dialog) build();
    if (dialog.open) { dialog.close(); return; }
    dialog.showModal();
    refresh();
    timer = setInterval(refresh, 2000);
  }
  window.addEventListener('keydown', e => {
    if (e.shiftKey && e.code === 'KeyF' && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) toggle();
    } else if (dialog?.open) {
      // Leave native typing, select navigation and Escape to the dialog.
      if (e.key === 'Escape') { dialog.close(); e.preventDefault(); }
      e.stopImmediatePropagation();
    }
  }, true);
  if (new URLSearchParams(location.search).get('filtercontrols') === '1') toggle();
})();
