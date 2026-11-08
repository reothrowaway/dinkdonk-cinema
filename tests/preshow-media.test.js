'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { createPreshowMedia } = require('../preshow-media');

test('local pre-show lists media, switches modes and ignores stale trailer completion', async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'cinema-media-'));
  await fs.mkdir(path.join(root, 'videos'));
  await fs.mkdir(path.join(root, 'trailers'));
  await fs.writeFile(path.join(root, 'videos', 'Commercial.mp4'), 'test video');
  await fs.writeFile(path.join(root, 'trailers', 'Trailer #1.mp4'), 'test trailer');
  const previousRoot = process.env.CINEMA_PRESHOW_ROOT;
  process.env.CINEMA_PRESHOW_ROOT = root;
  const selections = [];
  let probes = 0;
  let media;
  const server = http.createServer((req, res) => media.route(req, res));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    for (const folder of ['videos', 'trailers']) {
      const directory = path.join(root, folder);
      for (const name of await fs.readdir(directory)) await fs.unlink(path.join(directory, name));
      await fs.rmdir(directory);
    }
    await fs.rmdir(root);
  });
  const { port } = server.address();
  media = createPreshowMedia({ port, isReady: () => true, select: enabled => (selections.push(enabled), true),
    async readDuration(file) {
      probes++;
      return (await fs.stat(file)).size;
    } });
  if (previousRoot === undefined) delete process.env.CINEMA_PRESHOW_ROOT;
  else process.env.CINEMA_PRESHOW_ROOT = previousRoot;
  const url = `http://127.0.0.1:${port}/preshow/`;
  const post = (route, body) => fetch(url + route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

  const library = () => fetch(url + 'library').then(response => response.json());
  assert.deepEqual((await library()).trailers, ['Trailer #1.mp4']);
  assert.deepEqual((await library()).trailerDurations, { 'Trailer #1.mp4': 12 });
  assert.equal(probes, 1);
  await fs.writeFile(path.join(root, 'trailers', 'Another Trailer.webm'), 'test trailer');
  assert.deepEqual((await library()).trailers, ['Another Trailer.webm', 'Trailer #1.mp4']);
  await fs.writeFile(path.join(root, 'trailers', 'Trailer #1.mp4'), 'test trailer replacement');
  assert.deepEqual((await library()).trailerDurations, { 'Another Trailer.webm': 12, 'Trailer #1.mp4': 24 });
  assert.equal(probes, 3);
  const range = await fetch(url + 'trailers/Trailer%20%231.mp4', { headers: { Range: 'bytes=0-3' } });
  assert.equal(range.status, 206);
  assert.equal(await range.text(), 'test');
  assert.equal((await post('state', { mode: 'trailer', name: '../Commercial.mp4' })).status, 404);
  assert.equal((await fetch(url + 'library', { headers: { Origin: 'https://example.test' } })).status, 403);

  const first = await (await post('state', { mode: 'trailer', name: 'Trailer #1.mp4' })).json();
  await post('state', { mode: 'shuffle' });
  assert.equal((await (await post('finished', { revision: first.revision })).json()).mode, 'shuffle');
  const second = await (await post('state', { mode: 'trailer', name: 'Another Trailer.webm' })).json();
  const ended = await (await post('finished', { revision: second.revision })).json();
  assert.equal(ended.mode, 'stop');
  assert.equal(ended.notice, 'Trailer finished.');
  assert.deepEqual(selections, [true, true, true, false]);
});
