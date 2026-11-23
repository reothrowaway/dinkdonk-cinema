'use strict';
// Preloaded into web/server.js by the tests (node --require): keeps the server offline. No Destiny.gg chat, no CDN,
// no dinkdonk.mov; any outside connection fails, so the tests can never reach a real service.
const EventEmitter = require('node:events');
const net = require('node:net');
const tls = require('node:tls');

const LOCAL = new Set(['127.0.0.1', 'localhost', '::1', undefined]);
const hostOf = (args) => {
  const a = args[0];
  if (a && typeof a === 'object') return a.host;
  return typeof args[1] === 'string' ? args[1] : undefined;
};
for (const [mod, name] of [[net, 'connect'], [net, 'createConnection'], [tls, 'connect']]) {
  const real = mod[name];
  mod[name] = function offlineOnly(...args) {
    const host = hostOf(args);
    if (!LOCAL.has(host)) throw new Error(`offline test: no connection to ${host}`);
    return real.apply(this, args);
  };
}
globalThis.fetch = async (url) => { throw new Error(`offline test: no fetch of ${url}`); };

// The shared Destiny.gg chat upstream: a socket that never connects (server.js reconnects with backoff, harmless)
const ws = require('ws');
const Real = ws.WebSocket;
class OfflineChat extends EventEmitter {
  constructor() { super(); this.readyState = Real.CONNECTING; setTimeout(() => { this.readyState = Real.CLOSED; this.emit('close', 1006); }, 50); }
  close() {}
  terminate() {}
  send() {}
}
for (const k of ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED']) OfflineChat[k] = Real[k];
ws.WebSocket = OfflineChat;
