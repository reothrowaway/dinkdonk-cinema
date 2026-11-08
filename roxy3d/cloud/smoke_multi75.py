"""Three real Blender workers, eight 160x90/4-sample frames per mode; offline."""
import sys
sys.dont_write_bytecode = True
import json
import os
from pathlib import Path
import subprocess
import tarfile
import tempfile
import time
from multi import validate_archive, verify_unpack
from multi_queue import atomic, read, sha

HERE = Path(__file__).resolve().parent


def main():
    archive = HERE / 'roxy-cloud-bundle-68.tar.gz'
    validate_archive(archive)
    blender = HERE.parent.parent / 'tools/blender-5.2.3-windows-x64/blender.exe'
    base = Path(tempfile.mkdtemp(prefix='blender-', dir=HERE / 'qa75'))
    report = {}
    for quality in ('final', 'draft'):
        root = base / quality
        root.mkdir()
        jobs = []
        for i in range(3):
            local = root / f'worker-{i}'
            local.mkdir()
            with tarfile.open(archive, 'r:gz') as tar:
                tar.extractall(local, filter='data')
            for folder in ('temp', 'cuda', 'optix', 'blender-user'):
                (local / folder).mkdir()
            env = {**os.environ, 'BUNDLE_ROOT': str(local / 'bundle'), 'MULTI_ROOT': str(root / 'volume'),
                   'FLY_MODE': quality, 'MULTI_LOCAL_SMOKE': '1', 'RUNPOD_POD_ID': f'local-{i}',
                   'MULTI_GPU': 'local RTX 3050 worker ' + str(i), 'CHUNK': '1', 'LEASE_SECONDS': '15', 'POLL_SECONDS': '.2',
                   'PYTHONDONTWRITEBYTECODE': '1', 'TEMP': str(local / 'temp'), 'TMP': str(local / 'temp'),
                   'CUDA_CACHE_PATH': str(local / 'cuda'), 'OPTIX_CACHE_PATH': str(local / 'optix'),
                   'BLENDER_USER_RESOURCES': str(local / 'blender-user')}
            log = (local / 'worker.log').open('wb')
            command = [str(blender), '-b', '--threads', '2', '--python-exit-code', '1', '--python', str(HERE / 'multi_blender.py')]
            jobs.append((subprocess.Popen(command, env=env, stdout=log, stderr=subprocess.STDOUT), log, command, env))
        for process, log, _, _ in jobs:
            try:
                code = process.wait(timeout=600)
            except BaseException:
                for proc, _, _, _ in jobs:
                    if proc.poll() is None:
                        proc.terminate()
                raise
            finally:
                log.close()
            assert code == 0, f'Worker failure: {root}'
        run = root / 'volume'
        result = read(run / 'queue/SUCCESS.json')
        assert result and result['frames'] == 8
        verify_unpack(run / 'out10.tar.gz', root / 'unpacked', result)
        before = {p.name: (p.stat().st_mtime_ns, sha(p)) for p in (run / 'smoke-frames').glob('*.png')}
        _, _, command, env = jobs[0]
        with (root / 'resume.log').open('wb') as log:
            subprocess.run(command, env=env, stdout=log, stderr=subprocess.STDOUT, timeout=120, check=True)
        assert before == {p.name: (p.stat().st_mtime_ns, sha(p)) for p in (run / 'smoke-frames').glob('*.png')}
        package = read(run / 'smoke-frames/package.json')
        workers = [read(p) for p in (run / 'queue/workers').glob('*.json')]
        report[quality] = {'frames': 8, 'resolution': [160, 90], 'workers': len(jobs),
                           'fps': package['video']['fps'], 'decoded_samples': len(package['video']['decoded_samples']),
                           'max_decoded_mean_rgb_error_255': max(r['mean_rgb_error_255'] for r in package['video']['decoded_samples']),
                           'sha256': result['sha256'], 'resume_unchanged': True,
                           'root': str(root), 'workers_reported': len(workers)}
        atomic(HERE / 'qa75/blender-smoke.json', report)
        print(json.dumps({quality: report[quality]}, indent=2), flush=True)


if __name__ == '__main__':
    main()
