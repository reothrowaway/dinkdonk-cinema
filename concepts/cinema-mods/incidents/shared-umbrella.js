import {beat, incident} from './stage.js';

export function sharedUmbrella(blowUmbrella, walkers, project) {
  function openPavement() {
    const crowd = [...walkers.values()].filter(w => w.out && !w.gone && !w.removing);
    let best, clearance = -1;
    for (const u of [4, 6.5, 8.8, 10.5, 12.2]) {
      const point = [u, 10.5], [x, y] = project(...point);
      const nearest = crowd.reduce((d, w) => Math.min(d, Math.hypot(x - w.x, y - w.y)), Infinity);
      if (nearest > clearance) { best = point; clearance = nearest; }
    }
    return best;
  }
  const story = incident(19, 2, 2, openPavement, ({actors}) => {
    const [host, guest] = actors;
    let gust = false, sharing = false;
    return {
      slots: [[-33, -6], [63, 8]],
      walks: [
        {at: 7, slot: 1, offset: [-53, -8]},
        {at: 15.2, slot: 1, offset: [4, 0]},
      ],
      zoom: 2.25,
      showWhileApproaching: true,
      focusY: 48,
      actionBounds: () => [-100, -162, 138, 37],
      valid: () => !!host.umb && !!guest.umb,
      paint(t, reduced) {
        if (!gust && t >= 4) {
          gust = true;
          if (!reduced) blowUmbrella(guest, 2400);
        }
        const together = t >= 6.4 && t < 15;
        if (sharing === together) return;
        sharing = together;
        host.el.classList.toggle('umbrella-offer', together);
        guest.el.classList.toggle('umbrella-stowed', together);
      },
      act(i, t) {
        if (i === 0) return {tilt: 8 * beat(t, 6.5, 9)};
        return {tilt: -10 * beat(t, 4, 6.3), lift: 7 * beat(t, 11, 11.9) + 4 * beat(t, 12, 12.7)};
      },
      dispose() {
        host.el.classList.remove('umbrella-offer');
        guest.el.classList.remove('umbrella-stowed');
      },
    };
  });
  return {...story, automatic: true, eligible: w => w.out && !!w.umb && !w.umbIo};
}
