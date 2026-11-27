import {
  attrs, beat, def, ease, ellipse, f, group, incident, node, place, ramp, rect, type,
} from './stage.js';

function hasPortrait(walker) {
  return walker.em?.firstElementChild?.classList.contains('emote');
}

function loadPortrait(walker) {
  const sprite = walker.em.firstElementChild;
  const src = getComputedStyle(sprite).backgroundImage.match(/^url\(["']?(.*?)["']?\)$/)?.[1];
  if (!src) return null;
  const image = new Image();
  image.src = src;
  return {sprite, image};
}

function printPortrait(parent, walker, portrait, center, maxWidth) {
  const {sprite, image} = portrait;
  const css = getComputedStyle(sprite);
  const width = sprite.offsetWidth, height = sprite.offsetHeight;
  const scale = Math.min(maxWidth / width, 41 / height);
  const w = width * scale, h = height * scale;
  const tile = node(parent, 'foreignObject', {x: center - w / 2, y: -41 - h / 2, width: w, height: h});
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(w * 3);
  canvas.height = Math.ceil(h * 3);
  canvas.style.cssText = 'display:block;width:100%;height:100%';
  tile.append(canvas);
  const ctx = canvas.getContext('2d');
  ctx.scale(canvas.width / width, canvas.height / height);
  if (walker.em.dataset.flip === 'true') {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }
  const box = window.SB.emoteBackgroundRect(css, width, height, image.naturalWidth, image.naturalHeight);
  ctx.drawImage(image, ...box);
}

function buildPhoto({scene, actors}) {
  const [photographer, ...subjects] = actors;
  const portraits = subjects.map(loadPortrait);
  const sleeve = node(photographer.bod, 'svg', {width: 1, height: 1, 'aria-hidden': 'true'});
  sleeve.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none;visibility:hidden';

  const camera = group(sleeve);
  rect(camera, -17, -11, 34, 22, '#343845', {rx: 4, stroke: '#151823', 'stroke-width': 2});
  rect(camera, -14, -15, 12, 5, '#ebe0be', {rx: 1});
  rect(camera, -14, -7, 7, 4, '#eee7d2', {rx: 1});
  ellipse(camera, 5, 0, 8, 8, '#171c29', {stroke: '#d3ba89', 'stroke-width': 2});
  ellipse(camera, 5, 0, 4, 4, '#7797a0');
  rect(camera, -11, 6, 9, 3, '#c36a4b');

  const print = group(sleeve);
  rect(print, -45, -76, 90, 76, '#fff4d9', {rx: 2, stroke: '#433d36', 'stroke-width': 2});
  rect(print, -40, -71, 80, 53, '#284349');
  const clip = def(scene, 'clipPath', 'marquee-portrait');
  rect(clip.el, -40, -71, 80, 53, 'white');
  const picture = group(print, {'clip-path': clip.url});
  rect(picture, -40, -71, 80, 10, '#bd825e');
  for (let x = -35; x < 40; x += 10) ellipse(picture, x, -67, 2, 2, '#ffe7aa');
  type(print, 0, -5, 'DINKDONK', 10, '#564234');

  const height = parseFloat(photographer.em.style.height) || 46;
  const solo = subjects.length === 1;
  let exposed = false;
  return {
    slots: solo ? [[-58,-23],[34,12]] : [[-66,-27],[19,4],[62,24]],
    zoom: 2.1,
    focusY: 44,
    actionBounds: () => [-104, -190, 114, 44],
    valid: () => exposed || actors.every(hasPortrait) && portraits.every((p, i) =>
      p && p.sprite === subjects[i].em.firstElementChild && (!p.image.complete || p.image.naturalWidth > 0)),
    paint(t, reduced) {
      sleeve.style.visibility = t > .2 && t < 11.8 ? 'visible' : 'hidden';
      const raise = ease(ramp(t, .3, 1.8)) * (1 - ease(ramp(t, 4.5, 6.1)));
      const stow = ease(ramp(t, 9.3, 11.6));
      place(camera, 19, -height * (.39 + raise * .33) + stow * 8, reduced ? 0 : -8 * raise, .8 + .2 * raise);
      attrs(camera, {opacity: f(1 - stow)});

      // Sample the subjects at the shutter beat. Their movements after this point
      // belong to the sidewalk, while each printed emote keeps its captured pose.
      if (t >= 3.6 && !exposed && portraits.every(p => p?.image.naturalWidth)) {
        subjects.forEach((w, i) => printPortrait(picture, w, portraits[i], solo ? 0 : -19 + i * 38, solo ? 72 : 34));
        exposed = true;
      }
      const eject = ease(ramp(t, 4.2, 6.5));
      const hold = ease(ramp(t, 6.1, 7.7));
      attrs(print, {opacity: exposed ? f(eject * (1 - stow)) : 0});
      attrs(picture, {opacity: f(ease(ramp(t, 5.7, 7.7)))});
      place(print, 20 + 18 * hold, -height * .42 - 10 * raise - 48 * hold, reduced ? 0 : 7 - 9 * hold, .16 + .84 * hold);
    },
    act(i, t) {
      if (i === 0) return {tilt: -6 * beat(t, 1.3, 4.4)};
      const pose = ease(ramp(t, 1.6, 2.4)) * (1 - ease(ramp(t, 4, 5)));
      return {tilt: (i === 1 ? 7 : -7) * pose, lift: 3 * pose};
    },
    dispose() { sleeve.remove(); },
  };
}

export const marqueePhoto = {
  ...incident(12, 2, 3, () => [8.05, 10.6], buildPhoto),
  automatic: true,
  eligible: hasPortrait,
};
