const ramp = (n, a, b) => Math.max(0, Math.min(1, (n - a) / (b - a)));
const ease = t => t * t * (3 - 2 * t);
const pulse = (n, a, b) => Math.sin(Math.PI * ramp(n, a, b));

function chooseNeighbors(host) {
  const eligible = host.seated().filter(w => !w.dozing && !w.texting && !w.pendingSeat);
  const occupants = new Map(eligible.map(w => [w.seat, w]));
  for (const owner of eligible) {
    if (owner.item?.dataset.item !== 'popcorn' || !owner.item.naturalWidth) continue;
    const seat = owner.seat;
    const row = host.seats().filter(s => s.row === seat.row && s.block === seat.block).sort((a, b) => a.u - b.u);
    const index = row.indexOf(seat);
    for (const adjacent of [row[index + 1], row[index - 1]]) {
      const neighbor = occupants.get(adjacent);
      if (neighbor && neighbor.item?.dataset.item !== 'popcorn') return [owner, neighbor];
    }
  }
  return null;
}

export function startPopcornPass(host, reduced) {
  const pair = chooseNeighbors(host);
  if (!pair) return null;
  const [owner, guest] = pair, seats = pair.map(w => w.seat);
  const original = owner.item, visibility = original.style.visibility;
  const bucket = original.cloneNode(false);
  bucket.className = 'passing-popcorn';
  bucket.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;transform-origin:50% 80%';
  const width = parseFloat(original.style.width), height = parseFloat(original.style.height);
  bucket.style.width = width + 'px';
  bucket.style.height = height + 'px';
  bucket.style.zIndex = Math.max(...pair.map(w => Number(w.el.style.zIndex))) + 1;
  owner.el.parentNode.append(bucket);
  original.style.visibility = 'hidden';
  const began = performance.now();
  const [ax, ay] = host.point(owner), [bx, by] = host.point(guest);
  const direction = Math.sign(bx - ax);
  const camera = reduced ? null : [(ax + bx) / 2, (ay + by) / 2 - 27, 2.7];
  const bounds = [Math.min(ax, bx) - 24, Math.min(ay - owner.emH, by - guest.emH) - 12,
    Math.max(ax, bx) + 24, Math.max(ay, by)];
  let t = 0;
  function cancel() {
    bucket.remove();
    original.style.visibility = visibility;
  }
  const pose = w => {
    if (w !== owner && w !== guest) return;
    const tilt = w === owner ? direction * (pulse(t, 2.4, 5.4) + pulse(t, 10.4, 13))
      : -direction * (pulse(t, 4.2, 6.5) + pulse(t, 9.5, 12));
    return {tilt: tilt * (reduced ? 2 : 11), lift: w === guest ? pulse(t, 7, 8.5) * (reduced ? 2 : 9) : 0, sq: 1};
  };
  function state() {
    if (pair.some((w, i) => !host.active(w) || w.seat !== seats[i]) || owner.item !== original) {
      cancel(); return 'interrupted';
    }
    t = (performance.now() - began) / 1000;
    if (t >= 15) { cancel(); return 'complete'; }
    const pass = ease(ramp(t, 3, 5.7)) * (1 - ease(ramp(t, 10, 12.7)));
    const raised = ease(ramp(t, .6, 2.4)) * (1 - ease(ramp(t, 12.7, 14.5)));
    const scale = 1 + .85 * raised;
    const sx = ax + parseFloat(original.style.left) + width / 2, sy = ay + parseFloat(original.style.top) + height / 2;
    const startX = sx + (ax - direction * owner.emW * .4 - sx) * raised;
    const ex = bx + direction * guest.emW * .48, ey = by - Math.max(guest.hideLocal + 10, guest.emH * .65);
    const arc = reduced ? 0 : 14 * Math.sin(Math.PI * pass) + 7 * pulse(t, 7, 8.5);
    const x = startX + (ex - startX) * pass - width / 2, y = sy + (ey - sy) * pass - height / 2 - arc;
    bucket.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + scale.toFixed(2) + ')';
    return 'playing';
  }
  state();
  return {state, cancel, pose, camera: () => camera, bounds};
}
