"""Offline synthetic queue worker, used only by test_multi77.py."""
import sys
sys.dont_write_bytecode=True
import os,time
from pathlib import Path
from multi_queue import Queue,atomic,sha,read
from test_multi75 import png,valid
root=Path(os.environ['MULTI_ROOT']);root.mkdir(exist_ok=True)
worker=os.environ['MULTI_WORKER_ID']
q=Queue(root/'queue',range(1,65),'supervisor-fixture-32x18',1,.3,.02)
def render(i):
    # Exclusive create makes duplicate rendering a hard failure.
    with (root/f'{i:05d}.rendered').open('x'):pass
    time.sleep(.12)
    (root/f'{i:05d}.png').write_bytes(png(i))
    atomic(root/f'{i:05d}.json',{'sha256':sha(root/f'{i:05d}.png')})
    if worker.endswith('-w1'):os._exit(71) # Commit then die, before completing its claim.
def finalize():
    assert all(valid(root,i) for i in range(1,65))
    with (root/'finalized-once').open('x'):pass
    return {'frames':64,'by':worker}
q.work(worker,'mock-24GB',lambda i:valid(root,i),render,finalize)
