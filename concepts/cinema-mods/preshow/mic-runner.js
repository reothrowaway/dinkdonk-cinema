// A festival volunteer takes a roving mic to a seated guest and collects it.
export function startMicRunner(host, reduced) {
  const guests = host.seated().filter(w => !w.dozing && !w.texting && !w.pendingSeat);
  if (!guests.length) return null;
  // The volunteer stays on the stair where the aisle seat has an unobstructed handoff.
  const aisle = w => Math.abs(w.seat.u - 3.475) < Math.abs(w.seat.u - 15.15) ? 3.475 : 15.15;
  const reachable = guests.filter(w => Math.abs(w.seat.u - aisle(w)) <= 1.12);
  if (!reachable.length) return null;
  const guest = reachable[Math.floor(Math.random() * reachable.length)], seat = guest.seat;
  const runner = host.staff();
  if (!runner) return null;
  const card = document.createElement('section');
  card.className = 'festival-program';
  card.innerHTML = '<small>After the screening</small><strong>Audience Q&amp;A</strong><span></span>';
  const caption = card.querySelector('span');
  caption.textContent = 'The floor is open';
  document.getElementById('preshow').append(card);
  const entry = runner.path;
  const mic = document.createElement('span');
  mic.className = 'festival-mic';
  mic.setAttribute('aria-hidden', 'true');
  mic.innerHTML = '<i class="mic-grille"></i><i class="mic-flag">Q</i><i class="mic-grip"></i>';
  runner.bod.append(mic);
  let phase = 'entrance', route, offeredAt = 0, leavingAt = 0, holder = runner;

  function carry(w, side) {
    const from = holder !== w && !reduced ? mic.getBoundingClientRect() : null;
    holder = w;
    w.bod.append(mic);
    mic.style.left = (side * Math.max(12, w.emW * .41) - 5) + 'px';
    mic.style.top = (-Math.max(w.hideLocal + 16, w.emH * .70) - 12) + 'px';
    mic.style.setProperty('--angle', side * 21 + 'deg');
    if (from) {
      const to = mic.getBoundingClientRect(), scale = document.getElementById('cam').getBoundingClientRect().width / 1920 || 1;
      mic.animate([{translate: (from.x - to.x) / scale + 'px ' + (from.y - to.y) / scale + 'px'}, {translate:'0 0'}],
        {duration:650, easing:'ease-in-out'});
    }
  }
  carry(runner, 1);

  function back() {
    phase = 'return';
    leavingAt = performance.now();
    caption.textContent = 'Thank you';
    host.go(runner, [...route].reverse(), host.out);
  }
  runner.onArrive = () => {
    phase = 'approach';
    route = host.toAisle(runner, seat, aisle(guest));
    host.go(runner, route, () => {
      host.face(runner, guest);
      const side = host.point(guest)[0] >= host.point(runner)[0] ? 1 : -1;
      carry(runner, side);
      phase = 'offer';
      offeredAt = performance.now();
      guest.nameT = 4;
      host.label(runner);
      host.hold(runner, 10, back);
    });
  };

  function cancel() {
    mic.remove();
    card.remove();
    if (!host.present(runner) || runner.exiting || phase === 'return') return;
    if (phase === 'entrance') {
      host.exitEntry(runner, entry);
    } else if (phase === 'approach') {
      route = [...route.slice(0, runner.seg + 1), [...runner.pos]];
      back();
    } else back();
    phase = 'return';
  }
  function state() {
    if (!host.present(runner)) { mic.remove(); card.remove(); return phase === 'return' ? 'complete' : 'interrupted'; }
    if (phase === 'return') return 'playing';
    if (!host.active(guest) || guest.seat !== seat) return 'interrupted';
    if (phase === 'offer') {
      const t = (performance.now() - offeredAt) / 1000;
      const side = host.point(guest)[0] >= host.point(runner)[0] ? 1 : -1;
      if (t >= 2 && t < 7.7 && holder !== guest) {
        carry(guest, -side);
        guest.nameT = 5;
        caption.textContent = 'At the microphone · ' + guest.nick;
      } else if (t >= 7.7 && holder !== runner) {
        carry(runner, side);
        caption.textContent = 'Thank you';
      }
    }
    return 'playing';
  }
  function camera() {
    if (reduced || !runner.seen) return null;
    const [rx, ry] = host.point(runner), [gx, gy] = host.point(guest);
    if (phase === 'return') {
      if (runner.exiting) return null;
      const blend = Math.min(1, (performance.now() - leavingAt) / 4500);
      return [rx + (gx-rx)*(1-blend)/2, ry + (gy-ry)*(1-blend)/2 - 27, 2.65 - blend*.85];
    }
    if (phase === 'offer' || (phase === 'approach' && Math.hypot(rx - gx, ry - gy) < 125))
      return [(rx + gx) / 2, (ry + gy) / 2 - 27, 2.8];
    return [rx, ry - 26, 1.65];
  }
  function pose(w) {
    if (phase !== 'offer' || reduced || (w !== runner && w !== guest)) return;
    const t = (performance.now() - offeredAt) / 1000;
    const ramp = x => Math.max(0, Math.min(1, x));
    const reach = Math.sin(Math.PI * ramp((t - .5) / 3)) + Math.sin(Math.PI * ramp((t - 6.1) / 3.2));
    const side = host.point(guest)[0] >= host.point(runner)[0] ? 1 : -1;
    return {lift: w === guest ? 3 * reach : 0, tilt: reach * (w === runner ? side : -side) * 10, sq: 1};
  }
  return {state, cancel, camera, pose};
}
