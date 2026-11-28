(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const video = byId('clip'), file = byId('file'), format = byId('format'), placement = byId('placement');
  let objectURL = null;

  function describe(width, height, ratio, fill) {
    const source = width / height;
    const size = width + ' × ' + height;
    const horizontal = source > ratio;
    const visible = Math.min(width, height * ratio) * Math.min(height, width / ratio) / (width * height);
    const edge = ((1 - visible) * 50).toFixed(1);
    if (Math.abs(source - ratio) * height < 1) {
      return ['The frame fits edge to edge.', 'Visible source · ' + size + ' px'];
    }
    if (!fill) {
      const direction = horizontal ? 'top and bottom' : 'left and right';
      return ['The full picture is visible. Empty space at ' + direction + ' occupies ' + edge + '% of the aperture per edge.',
        'Visible source · ' + size + ' px'];
    }
    const w = Math.round(Math.min(width, height * ratio)), h = Math.round(Math.min(height, width / ratio));
    const loss = horizontal ? width - w : height - h;
    const first = Math.floor(loss / 2), second = loss - first;
    const edges = horizontal ? ['left','right'] : ['top','bottom'];
    return ['Center crop removes about ' + first + ' px at the ' + edges[0] + ' and ' + second + ' px at the ' + edges[1] + '.',
      'Visible source · ' + w + ' × ' + h + ' of ' + size + ' px'];
  }
  function render() {
    const ratio = format.value === '16:9' ? 16 / 9 : Number(format.value);
    byId('aperture').style.width = (100 * ratio / 2.39) + '%';
    video.style.objectFit = placement.value;
    byId('error').hidden = !video.error;
    if (!video.videoWidth || video.error) {
      byId('report').textContent = video.error ? '' : 'Loading clip…';
      byId('size').textContent = '';
      return;
    }
    const [report, size] = describe(video.videoWidth, video.videoHeight, ratio, placement.value === 'cover');
    byId('report').textContent = report;
    byId('size').textContent = size;
  }
  function load(source) {
    video.pause();
    const previous = objectURL;
    objectURL = source ? URL.createObjectURL(source) : null;
    byId('title').textContent = source ? source.name : 'Booth sync leader';
    byId('reference').hidden = !source;
    video.src = objectURL || './sync-leader.mp4';
    video.load();
    if (previous) URL.revokeObjectURL(previous);
    render();
  }
  file.addEventListener('change', () => { if (file.files[0]) load(file.files[0]); file.value = ''; });
  byId('reference').addEventListener('click', () => load(null));
  for (const select of [format, placement]) select.addEventListener('change', render);
  for (const event of ['loadedmetadata','resize','emptied','error']) video.addEventListener(event, render);
  render();
})();
