"""Collect the multi-run result through a surviving extra pod (7 Nov 2026: the helper exited because its own two
pods retired while added pods finalized). Waits for result.json, downloads out10.tar.gz, checks its sha256."""
import sys, json, time, hashlib
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import multi
s = json.loads((HERE / 'cloud-state-multi.json').read_text()); R = s['remote']
pod = sys.argv[1]; out = Path(s['outdir']); out.mkdir(parents=True, exist_ok=True)
p = multi.Provider()
for _ in range(120):
    r = p.ssh(pod, f"cat {R}/result.json 2>/dev/null; true", timeout=40).strip()
    if r: break
    time.sleep(20)
else: sys.exit('no result.json after 40 min')
res = json.loads(r); print('result', res)
dest = out / 'result.tar.gz'
p.copy(pod, dest, f"{R}/out10.tar.gz")
h = hashlib.sha256(dest.read_bytes()).hexdigest()
print('downloaded', dest, dest.stat().st_size, 'sha ok' if h == res['sha256'] else 'SHA MISMATCH ' + h)
