(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const source = byId('original'), first = byId('first'), second = byId('second');
  const buttons = [...document.querySelectorAll('[data-mode]')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const makeLayer = () => Object.assign(document.createElement('canvas'), { width: first.width, height: first.height });
  const left = makeLayer(), right = makeLayer(), color = makeLayer(), tint = makeLayer();
  let mode = 'pair', frame = 0, timer, ready = false, crossed = false, fitted = false;
  const captions = {
    left: 'Left-eye photograph. Use the right arrow in the photograph to compare.',
    right: 'Right-eye photograph. Use the left arrow in the photograph to compare.',
    alternate: 'Alternating eyes once per second. Select either eye to hold the photograph still.',
    color: 'Wear red/cyan glasses with red over the left eye. Adjust alignment to change the plane of the screen.',
    card: 'The complete publisher’s card, including its original mount and lettering.'
  };

  function crop(canvas, displacement, correctMount) {
    // Coordinates were measured on a 1024 × 530 reference copy of the card.
    // Map each output pixel to its location on the scan, then invert for drawImage.
    const sx = source.naturalWidth / 1024, sy = source.naturalHeight / 530;
    const x = 92, y = 96;
    const shear = correctMount ? -.00494470 : 0, stretch = correctMount ? .00103676 : 0;
    const correction = correctMount ? -2.70314301 + shear * (x - 300) + stretch * (y - 270) : 0;
    const sample = new DOMMatrix([sx / 2, sy * shear / 2, 0, sy * (1 + stretch) / 2,
      sx * (x + displacement), sy * (y + correction)]);
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.setTransform(sample.inverse());
    ctx.drawImage(source, 0, 0);
    ctx.restore();
  }

  function channel(layer, canvas, mask) {
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.filter = 'grayscale(1)';
    ctx.drawImage(layer, 0, 0);
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = mask;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  function register() {
    if (!ready) return;
    const fine = Number(byId('fine').value);
    byId('offset').value = (fine > 0 ? '+' : '') + fine + ' px';
    crop(right, Number(byId('anchor').value) + fine, true);
    channel(left, color, '#f00');
    channel(right, tint, '#0ff');
    const ctx = color.getContext('2d');
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(tint, 0, 0);
    ctx.restore();
    paint();
  }

  function paint() {
    if (!ready) return;
    const pair = mode === 'pair', card = mode === 'card';
    byId('views').hidden = card;
    source.hidden = !card;
    second.hidden = !pair;
    byId('views').classList.toggle('pair', pair);
    byId('views').classList.toggle('fitted', pair && fitted);
    byId('adjust').hidden = card || mode === 'left';
    byId('swap').hidden = !pair;
    byId('swap').setAttribute('aria-pressed', String(crossed));
    byId('fit').hidden = !pair;
    byId('fit').setAttribute('aria-pressed', String(fitted));
    byId('size').hidden = !pair || !fitted;
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
    if (!card) {
      const rightFirst = mode === 'right' || (pair && crossed) || (mode === 'alternate' && frame === 1);
      first.getContext('2d').drawImage(mode === 'color' ? color : rightFirst ? right : left, 0, 0);
      first.setAttribute('aria-label', mode === 'color' ? 'Combined red and cyan view' : rightFirst ? 'Right-eye view' : 'Left-eye view');
      if (pair) {
        second.getContext('2d').drawImage(crossed ? left : right, 0, 0);
        second.setAttribute('aria-label', crossed ? 'Left-eye view' : 'Right-eye view');
      }
    }
    const order = crossed ? 'Right eye at left and left eye at right for cross-eyed viewing.' : 'Left eye at left and right eye at right for parallel viewing.';
    const caption = pair ? order + (fitted ? ' Adjust spacing until the central images overlap comfortably.' : ' Select Fit to eyes for a smaller pair.') : captions[mode];
    if (byId('caption').textContent !== caption) byId('caption').textContent = caption;
  }

  function select(next) {
    clearInterval(timer);
    if (next === 'alternate' && (motion.matches || document.hidden)) next = 'left';
    mode = next;
    frame = 0;
    paint();
    if (mode === 'alternate') timer = setInterval(() => { frame = 1 - frame; paint(); }, 1000);
  }
  function stopAlternating() {
    if (mode === 'alternate') select(frame ? 'right' : 'left');
  }
  function motionChange() {
    const alternate = buttons.find(b => b.dataset.mode === 'alternate');
    alternate.disabled = motion.matches;
    alternate.title = motion.matches ? 'Reduced motion is enabled. Use Left eye or Right eye to step manually.' : '';
    if (motion.matches) stopAlternating();
  }
  buttons.forEach(b => b.addEventListener('click', () => select(b.dataset.mode)));
  byId('anchor').addEventListener('change', register);
  byId('fine').addEventListener('input', register);
  byId('swap').addEventListener('click', () => { crossed = !crossed; paint(); });
  byId('fit').addEventListener('click', () => { fitted = !fitted; paint(); });
  byId('spacing').addEventListener('input', e => byId('views').style.setProperty('--eye-spacing', e.target.value + 'mm'));
  byId('mount').addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      select(e.key === 'ArrowLeft' ? 'left' : 'right');
    }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAlternating(); });
  window.addEventListener('pagehide', stopAlternating);
  motion.addEventListener('change', motionChange);
  motionChange();
  function loaded() { ready = true; crop(left, 0, false); register(); }
  function failed() { byId('caption').textContent = 'The scan could not be loaded. The original is available through the catalog record below.'; }
  if (source.complete) { if (source.naturalWidth) loaded(); else failed(); }
  else { source.addEventListener('load', loaded, { once: true }); source.addEventListener('error', failed, { once: true }); }
})();
