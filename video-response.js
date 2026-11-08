'use strict';

const fs = require('node:fs');

function sendVideo(req, res, file, type) {
  fs.stat(file, (error, st) => {
    if (error || !st.isFile() || st.size === 0) {
      res.writeHead(404, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' });
      res.end('Not found');
      return;
    }
    const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    let start = 0;
    let end = st.size - 1;
    if (match) {
      start = match[1] ? Number(match[1]) : Math.max(0, st.size - Number(match[2]));
      end = match[1] && match[2] ? Math.min(Number(match[2]), st.size - 1) : st.size - 1;
      if (start > end || start >= st.size) {
        res.writeHead(416, { 'Content-Range': `bytes */${st.size}` });
        res.end();
        return;
      }
    }
    const head = { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, 'Cache-Control': 'no-cache' };
    if (match) head['Content-Range'] = `bytes ${start}-${end}/${st.size}`;
    res.writeHead(match ? 206 : 200, head);
    if (req.method === 'HEAD') { res.end(); return; }
    const stream = fs.createReadStream(file, { start, end });
    stream.on('error', () => res.destroy());
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  });
}

module.exports = { sendVideo };
