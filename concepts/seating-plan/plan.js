(() => {
  'use strict';
  const get = id => document.getElementById(id);
  const dialog = get('seating-plan'), rowsEl = get('plan-rows'), search = get('plan-name');
  const chairs = new Map();
  let rows = [], members = new Map(), occupants = new Map();
  let selection = '', tabSeat = '', lastNames = '', timer, request, observed = false;

  const label = seat => 'Row ' + seat.row + ' · ' + seat.block + ' block · seat ' + seat.number + ' from the left';

  function build(layout) {
    const data = layout.rows.map(({row, seat_u_by_block: blocks}) =>
      Object.entries(blocks).flatMap(([block, coordinates]) =>
        coordinates.filter(Number.isFinite).slice().sort((a, b) => a - b).map((u, i) =>
          ({id: [row, block, u].join(':'), u, row, block, number: i + 1}))).sort((a, b) => a.u - b.u)
    ).filter(row => row.length);
    if (!data.length) throw new Error('Empty layout');
    const columns = [...new Set(data.flat().map(s => s.u))].sort((a, b) => a - b);
    const pitch = columns.length > 1 ? Math.min(...columns.slice(1).map((u, i) => u - columns[i])) : 1;
    const span = columns.at(-1) - columns[0] + pitch;
    const fragment = document.createDocumentFragment();
    for (const row of data) {
      const line = document.createElement('div'), name = document.createElement('span'), group = document.createElement('div');
      line.className = 'plan-row';
      name.className = 'plan-row-name';
      name.textContent = row[0].row;
      group.className = 'plan-seats';
      for (const seat of row) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'plan-seat';
        button.dataset.chair = seat.id;
        button.style.left = (100 * (seat.u - columns[0] + pitch / 2) / span) + '%';
        button.style.width = (100 * pitch * .86 / span) + '%';
        button.tabIndex = -1;
        button.setAttribute('aria-pressed', 'false');
        button.textContent = seat.number;
        seat.button = button;
        chairs.set(seat.id, seat);
        group.append(button);
      }
      line.append(name, group);
      fragment.append(line);
    }
    rows = data;
    tabSeat = rows[0][0].id;
    chairs.get(tabSeat).button.tabIndex = 0;
    rowsEl.replaceChildren(fragment);
  }

  function moveTab(seat) {
    if (!seat || seat.id === tabSeat) return;
    chairs.get(tabSeat).button.tabIndex = -1;
    tabSeat = seat.id;
    seat.button.tabIndex = 0;
  }

  function describe() {
    const query = search.value.trim().replace(/^@/, '').toLowerCase();
    const member = members.get(query);
    const seat = chairs.get(query ? member?.seat : selection);
    const occupant = occupants.get(seat?.id);
    let message = 'Select a seat or enter a name.';
    if (!observed) message = 'Waiting for the first room snapshot.';
    else if (seat) message = label(seat) + ' — ' + (occupant || 'unassigned') + '.';
    else if (query) message = member ? member.nick + (member.seat ? ' has an assignment outside this layout.' : ' is waiting for a seat.') : 'No exact match in the room.';
    if (get('plan-selection').textContent !== message) get('plan-selection').textContent = message;
    for (const chair of chairs.values()) {
      const value = String(chair.id === seat?.id);
      if (chair.button.getAttribute('aria-pressed') !== value) chair.button.setAttribute('aria-pressed', value);
    }
    if (seat && !rowsEl.contains(document.activeElement)) moveTab(seat);
  }

  function update(snapshot) {
    if (!Array.isArray(snapshot.roster) || snapshot.page !== 'auditorium') throw new Error('No auditorium roster');
    members = new Map();
    occupants = new Map();
    let waiting = 0, unknown = 0;
    for (const {nick, seat} of snapshot.roster) {
      if (typeof nick !== 'string' || !nick) continue;
      members.set(nick.toLowerCase(), {nick, seat});
      if (chairs.has(seat)) occupants.set(seat, nick);
      else if (seat) unknown++;
      else waiting++;
    }
    for (const chair of chairs.values()) {
      const occupant = occupants.get(chair.id);
      const title = label(chair) + ' — ' + (occupant || 'unassigned');
      if (chair.button.title !== title) {
        chair.button.title = title;
        chair.button.setAttribute('aria-label', title);
        chair.button.classList.toggle('assigned', Boolean(occupant));
      }
    }
    const names = Array.from(members.values(), e => e.nick).sort((a,b) => a.localeCompare(b));
    const signature = JSON.stringify(names);
    if (signature !== lastNames) {
      get('plan-names').replaceChildren(...names.map(nick => new Option(nick, nick)));
      lastNames = signature;
    }
    get('plan-count').textContent = occupants.size + ' of ' + chairs.size + ' seats assigned · ' + waiting + ' waiting' + (unknown ? ' · ' + unknown + ' outside this layout' : '');
    observed = true;
    describe();
  }

  async function json(url, signal) {
    const res = await fetch(url, {cache: 'no-store', signal});
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }

  async function layout(signal) {
    for (const draft of ['14', '13']) {
      try { return await json('/roxy3d/qa11/cinema_layout_' + draft + '.json', signal); }
      catch (error) { if (signal.aborted || draft === '13') throw error; }
    }
  }

  function stop() {
    clearTimeout(timer);
    request?.abort();
    request = null;
  }

  async function refresh() {
    stop();
    if (!dialog.open || document.hidden) return;
    const active = new AbortController();
    request = active;
    const timeout = setTimeout(() => active.abort(), 6000);
    try {
      const [plan, snapshot] = await Promise.all([
        rows.length ? null : layout(active.signal),
        json('/ctl/room-roster?page=auditorium', active.signal)
      ]);
      if (request !== active) return;
      if (plan) build(plan);
      update(snapshot);
      get('plan-status').textContent = '';
    } catch {
      if (request === active) get('plan-status').textContent = (observed ? 'Showing the last room snapshot. ' : '') + 'Room data unavailable. Retrying…';
    } finally {
      clearTimeout(timeout);
      if (request === active) {
        active.abort();
        request = null;
        timer = setTimeout(refresh, 12000);
      }
    }
  }

  rowsEl.addEventListener('click', event => {
    const chair = chairs.get(event.target.closest('button')?.dataset.chair);
    if (!chair) return;
    search.value = '';
    selection = chair.id;
    moveTab(chair);
    describe();
  });
  rowsEl.addEventListener('keydown', event => {
    const chair = chairs.get(event.target.dataset.chair);
    if (!chair) return;
    const ri = rows.findIndex(row => row[0].row === chair.row), row = rows[ri], ci = row.indexOf(chair);
    let next;
    if (event.key === 'ArrowLeft') next = row[ci - 1];
    else if (event.key === 'ArrowRight') next = row[ci + 1];
    else if (event.key === 'Home') next = row[0];
    else if (event.key === 'End') next = row.at(-1);
    else if (['ArrowUp','ArrowDown'].includes(event.key)) {
      const target = rows[ri + (event.key === 'ArrowUp' ? -1 : 1)];
      next = target?.reduce((a, b) => Math.abs(b.u - chair.u) < Math.abs(a.u - chair.u) ? b : a);
    } else return;
    event.preventDefault();
    if (next) { moveTab(next); next.button.focus(); }
  });
  search.addEventListener('input', () => {
    selection = '';
    describe();
    const selected = rowsEl.querySelector('[aria-pressed="true"]');
    if (selected && rowsEl.scrollWidth > rowsEl.clientWidth) {
      const offset = selected.getBoundingClientRect().left - rowsEl.getBoundingClientRect().left;
      rowsEl.scrollLeft += offset - (rowsEl.clientWidth - selected.offsetWidth) / 2;
    }
  });
  get('open-seating-plan').addEventListener('click', () => {
    dialog.showModal();
    search.focus();
    refresh();
  });
  dialog.addEventListener('close', stop);
  document.addEventListener('visibilitychange', () => { if (dialog.open) refresh(); });
})();
