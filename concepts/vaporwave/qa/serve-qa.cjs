'use strict';

const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');

const standby = path.resolve(__dirname, '../../..');
const relay = path.resolve(standby, '../dist/DinkDonk-Cinema/chat-relay');
const host = '127.0.0.1';
const pagePort = 18791;
const relayPort = 18792;
const children = [];

function checkAvailable(port) {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', reject);
    probe.listen(port, host, () => probe.close(resolve));
  });
}

function stop(code) {
  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill();
  }
  process.exit(code);
}

function start(script, cwd, env) {
  const child = spawn(process.execPath, [script], {
    cwd, env: { ...process.env, ...env }, stdio: 'inherit', windowsHide: true,
  });
  children.push(child);
  child.once('error', error => { console.error(error.message); stop(1); });
  child.once('exit', code => stop(code ?? 1));
}

async function main() {
  await Promise.all([checkAvailable(pagePort), checkAvailable(relayPort)]);
  process.once('SIGINT', () => stop(0));
  process.once('SIGTERM', () => stop(0));
  start('server.js', relay, { DGG_OBS_PORT: String(relayPort) });
  start('standby-server.js', standby, { STANDBY_PORT: String(pagePort), DGG_RELAY: host + ':' + relayPort });
}

main().catch(error => {
  console.error(error.code === 'EADDRINUSE'
    ? 'A QA port is already in use. The existing services are still running.'
    : error.message);
  process.exitCode = 1;
});
