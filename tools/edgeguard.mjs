// Closes a test script's headless Edge however the script ends (14 Nov 2026). Killing edge.pid alone left browsers
// running: msedge hands off to a new browser process, so the spawned PID is gone while the real one keeps rendering.
// Here every msedge.exe whose command line carries this script's own profile folder name (unique per port) is
// stopped by exact PID (no tree kill), on normal exit, errors, Ctrl-C and a hard time limit; then the profile is removed.
import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { basename } from 'node:path';

export function guard(profileDir, maxMinutes = Number(process.env.EDGE_MAX_MIN || 15)) {
  const tag = basename(String(profileDir).replace(/[\\/]+$/, ''));
  if (!/^edge-[\w-]+-\d+$/.test(tag)) throw new Error(`edgeguard: unexpected profile name ${tag}`);
  let done = false;
  const kill = () => {
    if (done) return;
    done = true;
    const ps = `Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" | Where-Object { $_.CommandLine -like '*${tag}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`;
    const enc = Buffer.from(ps, 'utf16le').toString('base64');
    try { execSync(`powershell -NoProfile -NonInteractive -EncodedCommand ${enc}`, { stdio: 'ignore', timeout: 20000 }); } catch { /* nothing left */ }
    for (let i = 0; i < 5; i++) { try { rmSync(profileDir, { recursive: true, force: true }); break; } catch { execSync('ping -n 2 127.0.0.1', { stdio: 'ignore' }); } }
  };
  process.on('exit', kill);
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) process.on(sig, () => { kill(); process.exit(130); });
  process.on('uncaughtException', (e) => { console.error('ERROR', e?.stack || e); kill(); process.exit(1); });
  process.on('unhandledRejection', (e) => { console.error('ERROR', e?.stack || e); kill(); process.exit(1); });
  setTimeout(() => { console.error(`edgeguard: over ${maxMinutes} min, closing Edge`); process.exit(2); }, maxMinutes * 60000).unref();
  return kill;
}
