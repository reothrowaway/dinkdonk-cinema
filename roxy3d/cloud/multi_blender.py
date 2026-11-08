"""Overlay for sealed Brief 67/68 bundles; no change to their render settings."""
import sys
sys.dont_write_bytecode = True
import hashlib
import os
from pathlib import Path
import shutil
import re

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from multi_queue import Queue, Lock, atomic, read, sha


def selection(total,quality,smoke,range_text=None):
    if range_text:
        if smoke or quality!='final' or not re.fullmatch(r'[0-9]+-[0-9]+',range_text):
            raise ValueError('FRAMES requires final quality and a valid inclusive range')
        a,b=map(int,range_text.split('-'))
        if not 1<=a<=b<=total:raise ValueError('FRAMES outside production timeline')
        return list(range(a,b+1)),[a,b]
    return ([1,185,225,519,1101,total-30,total-29,total] if smoke else list(range(1,total+1,2 if quality=='draft' else 1))),None


def main():
    root = Path(os.environ['BUNDLE_ROOT']).resolve()
    sys.path.insert(0, str(root))
    import pipeline as p
    from render67 import Renderer
    smoke = os.environ.get('MULTI_LOCAL_SMOKE') == '1'
    quality = p.QUALITY
    build = hashlib.sha256((p.verify_bundle() + quality).encode()).hexdigest()[:16]
    run = Path(os.environ['MULTI_ROOT'])
    out = run / ('smoke-frames' if smoke else 'frames')
    out.mkdir(parents=True, exist_ok=True)
    indices,subset = selection(p.TOTAL,quality,smoke,os.environ.get('FRAMES'))
    if subset:
        build += '-test-'+str(subset[0])+'-'+str(subset[1])
        out = run/'test-frames';out.mkdir(parents=True,exist_ok=True)
        original_atomic = p.atomic_json
        def test_metadata(path,value):
            if Path(path).name=='frames.json':value={**value,'test_range':subset,'test_only':True}
            original_atomic(path,value)
        p.atomic_json = test_metadata
    queue = Queue(run / 'queue', indices, build + ('-smoke' if smoke else ''),
                  int(os.environ.get('CHUNK', '8')), float(os.environ.get('LEASE_SECONDS', '180')),
                  float(os.environ.get('POLL_SECONDS', '5')))
    with Lock(out / 'locks' / 'build.lock'):
        marker = {'build': build, 'smoke': smoke, 'quality': quality}
        if read(out / 'build.json', marker) != marker:
            raise RuntimeError('Different build at output path')
        atomic(out / 'build.json', marker)
    renderer, tag = None, None
    signatures = {part: p.signature(part, 'smoke' if smoke else quality) for part in ('A', 'B')}

    def valid(i):
        # Same contract as pipeline.read_receipt, but cache the scene signatures
        # instead of repeatedly hashing .blend inputs on the network volume.
        try:
            r = read(out / f'{i:05d}.json', {})
            dims = [160, 90] if smoke else ([960, 540] if quality == 'draft' else [1920, 1080])
            return (r.get('global_frame') == i and r.get('resolution') == dims and
                    r.get('signature') == signatures['A' if i <= 1100 else 'B'] and
                    sha(out / f'{i:05d}.png') == r['color_sha256'] and
                    sha(out / f'{i:05d}_depth.png') == r['depth_sha256'])
        except (OSError, ValueError, KeyError):
            return False

    def render(i):
        nonlocal renderer, tag
        part = 'A' if i <= 1100 else 'B'
        if tag != part:
            renderer = Renderer(part, out, smoke, mode='smoke' if smoke else quality)
            tag = part
        # Malformed/corrupt receipts cannot be allowed into Renderer.resume.
        (out / f'{i:05d}.json').unlink(missing_ok=True)
        renderer.render(i if part == 'A' else i - 1100)

    def finalize():
        result = p.finalize(out, indices, smoke)
        dest = run / 'out10.tar.gz'
        shutil.copyfile(root / 'out10.tar.gz', dest.with_suffix('.partial'))
        os.replace(dest.with_suffix('.partial'), dest)
        if sha(dest) != result['archive_sha256']:
            raise RuntimeError('Published archive checksum mismatch')
        atomic(run / 'result.json', {'sha256': result['archive_sha256'], 'frames': len(indices), 'quality': quality,
                                    **({'test_range':subset} if subset else {})})
        return read(run / 'result.json')

    queue.work(os.environ.get('MULTI_WORKER_ID', os.environ.get('RUNPOD_POD_ID', 'local-' + str(os.getpid()))),
               os.environ.get('MULTI_GPU', 'local'), valid, render, finalize)


if __name__ == '__main__':
    main()
