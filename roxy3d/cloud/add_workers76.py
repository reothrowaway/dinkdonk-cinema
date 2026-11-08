"""Add extra workers to a running multi run (7 Nov 2026, owner: "why can't you get the other 3 working?").
The first provisioning found only two GPUs in EU-RO-1. This creates more pods on the SAME volume/data center with the
same bootstrap (guardian, hard cap) and runs the same prepare step; they join the shared queue on the volume.
Does not touch cloud-state-multi.json (the running helper owns it); extra pod ids go to add_workers76.json for cleanup.
Usage: <blender python> add_workers76.py N
"""
import json, sys, time, types
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import multi
want = int(sys.argv[1]) if len(sys.argv) > 1 else 3
state = json.loads((HERE / 'cloud-state-multi.json').read_text(encoding='utf-8'))
prov = multi.Provider()
bal = float(prov.api('user').get('clientBalance'))
print('balance', round(bal, 2))
if bal < 6: sys.exit('balance too low for extra workers')
rec_path = HERE / 'add_workers76.json'
rec = json.loads(rec_path.read_text()) if rec_path.exists() else {'volume': state['volume'], 'pods': []}
made = []
for gpu in state['gpus']:
    while len(made) < want:
        name = state['run'] + '-x' + str(len(rec['pods']) + len(made) + 1)
        try:
            res = prov.api(*multi.pod_args(state, gpu, name)); res = res.get('pod', res)
        except Exception as e:
            print('no', gpu, '-', type(e).__name__); break
        made.append({'id': res['id'], 'name': name, 'gpu': gpu}); print('created', res['id'], gpu)
        rec['pods'] = rec['pods'] + [made[-1]]; rec_path.write_text(json.dumps(rec, indent=2))
    if len(made) >= want: break
if not made: sys.exit('no capacity for extra workers')
ctl = types.SimpleNamespace(provider=prov, state=state)
def prep(p):
    try:
        multi.Controller.prepare(ctl, p); return p['id'] + ' ready'
    except Exception as e:
        return p['id'] + ' setup failed: ' + type(e).__name__ + ' ' + str(e)[:120]
with ThreadPoolExecutor(len(made)) as ex:
    for line in ex.map(prep, made): print(line)
