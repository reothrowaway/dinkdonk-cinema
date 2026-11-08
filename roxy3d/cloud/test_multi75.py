"""Offline fault tests; no provider network calls and no downloaded dependencies."""
import sys
sys.dont_write_bytecode = True
import hashlib
import json
import multiprocessing as mp
import os
from pathlib import Path
import shutil
import struct
import tempfile
import time
import zlib
from multi_queue import Queue, Lock, atomic, read, sha, progress
from multi import Controller, DryProvider, new_state, rank_centers, pod_args, verify_unpack

HERE = Path(__file__).resolve().parent


def png(i):
    def chunk(tag, data):
        return struct.pack('!I', len(data)) + tag + data + struct.pack('!I', zlib.crc32(tag + data))
    rows = b''.join(b'\0' + bytes([(i * 13 + y) % 256, 30, 90]) * 32 for y in range(18))
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('!2I5B', 32, 18, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(rows)) + chunk(b'IEND', b'')


def valid(root, i):
    try:
        r = read(root / f'{i:05d}.json', {})
        return sha(root / f'{i:05d}.png') == r['sha256']
    except (OSError, ValueError, KeyError):
        return False


def fixture_worker(root, worker, crash=False):
    root = Path(root)
    q = Queue(root / 'queue', range(1, 49), 'fixture-32x18', 4, .5, .05)
    def render(i):
        # Exclusive creation provides evidence that completed frames were never
        # rerendered, even after an abruptly killed worker / concurrent resume.
        with (root / f'{i:05d}.rendered').open('x'):
            pass
        time.sleep(.015 * (1 + worker % 3))
        (root / f'{i:05d}.png').write_bytes(png(i))
        atomic(root / f'{i:05d}.json', {'sha256': sha(root / f'{i:05d}.png')})
        if crash:
            os._exit(71)
    def finalize():
        assert all(valid(root, i) for i in range(1, 49))
        with (root / 'finalized-once').open('x'):
            pass
        return {'frames': 48}
    q.work('worker-' + str(worker), 'sim-GPU-' + str(worker % 3), lambda i: valid(root, i), render, finalize)


def stale_holder(root):
    q = Queue(root, [1, 2], 'fence', 2, .1, .02)
    claim = q.claim('old')
    atomic(Path(root) / 'held.json', {'claim': str(claim[0])})
    while True:
        time.sleep(.1)


class CleanupProvider:
    def __init__(self, state, reachable=(), stopped=(), delete_fail=False, volume_fail=False):
        self.s, self.reachable, self.stopped = state, set(reachable), set(stopped)
        self.deleted = []
        self.delete_fail, self.volume_fail = delete_fail, volume_fail

    def api(self, *args):
        if args[:2] == ('pod', 'list'):
            return [{'id': p['id'], 'name': p['name'], 'runtimeStatus': 'stopped' if p['id'] in self.stopped else 'running'} for p in self.s['pods'] if p['id'] not in self.deleted]
        if args[:2] == ('network-volume', 'list'):
            return [{'id': self.s['volume'], 'name': self.s['run']}]
        if args[:2] == ('pod', 'remove'):
            if self.delete_fail:
                raise RuntimeError('Simulated delete failure')
            self.deleted.append(args[2])
            return {}
        if args[:2] == ('network-volume', 'delete'):
            if self.volume_fail:
                raise RuntimeError('Simulated volume delete failure')
            self.deleted.append(args[2])
            return {}
        raise AssertionError(args)

    def ssh(self, pod, command):
        if pod not in self.reachable:
            raise RuntimeError('Simulated unreachable')
        return ''


def tests():
    report = {}
    # All generated fixtures stay inside the authorized cloud directory.
    root = Path(tempfile.mkdtemp(prefix='smoke-', dir=HERE / 'qa75'))
    qroot = root / 'queue-test'
    qroot.mkdir()
    crashed = mp.Process(target=fixture_worker, args=(qroot, 0, True))
    crashed.start()
    crashed.join(20)
    assert crashed.exitcode == 71
    workers = [mp.Process(target=fixture_worker, args=(qroot, i)) for i in range(1, 6)]
    for w in workers:
        w.start()
    for w in workers:
        w.join(40)
        assert w.exitcode == 0, w.exitcode
    assert len(list(qroot.glob('*.rendered'))) == 48
    assert len(list((qroot / 'queue/done').glob('*.json'))) == 12
    assert progress(qroot / 'queue')['done'] == 48
    before = {p.name: sha(p) for p in qroot.glob('*.png')}
    fixture_worker(qroot, 7)
    assert before == {p.name: sha(p) for p in qroot.glob('*.png')}
    report['five_workers_crash_reclaim_resume_single_finalize'] = '48/48 PNGs at 32x18; one killed after commit; zero duplicate renders'

    fence = root / 'fence'
    holder = mp.Process(target=stale_holder, args=(fence,))
    holder.start()
    end = time.monotonic() + 10
    while not (fence / 'held.json').exists() and time.monotonic() < end:
        time.sleep(.05)
    q = Queue(fence, [1, 2], 'fence', 2, .1, .02)
    time.sleep(.2)
    assert q.claim('new') is None, 'Live stale writer was stolen'
    holder.terminate()
    holder.join(10)
    recovered = q.claim('new')
    assert recovered and recovered[1]['worker'] == 'new'
    recovered[2].close()
    report['expired_but_live_claim_fenced'] = 'No steal until owning process killed; reclaimed afterward'

    corrupt = root / 'repair'
    corrupt.mkdir()
    q = Queue(corrupt / 'queue', [1, 2, 3], 'repair', 1, .1, .01)
    made = []
    def render(i):
        made.append(i)
        (corrupt / f'{i:05d}.png').write_bytes(png(i))
        atomic(corrupt / f'{i:05d}.json', {'sha256': sha(corrupt / f'{i:05d}.png')})
    def failure():
        raise RuntimeError('Deliberate finalizer crash')
    try:
        q.work('first', 'sim', lambda i: valid(corrupt, i), render, failure)
    except RuntimeError:
        pass
    else:
        raise AssertionError('Expected finalizer failure')
    (corrupt / '00002.png').write_bytes(b'corrupt')
    q.work('repair', 'sim', lambda i: valid(corrupt, i), render, lambda: {'okay': True})
    assert made == [1, 2, 3, 2]
    report['finalizer_crash_and_corrupt_frame_repair'] = 'Only corrupt frame rerendered; all pairs reverified before finalize'

    s = new_state()
    inventory = [{'id': 'small', 'gpuAvailability': [{'gpuId': s['gpus'][0], 'stockStatus': 'Low', 'availableCount': 1}]},
                 {'id': 'mixed', 'gpuAvailability': [{'gpuId': g, 'stockStatus': 'High', 'availableCount': n} for g, n in zip(s['gpus'], [2, 2, 1])]}]
    dry = DryProvider(inventory)
    Controller(dry, s).provision()
    assert s['dc'] == 'mixed' and len(s['pods']) == 5 and len(dry.volumes) == 1
    assert len({p['gpu'] for p in s['pods']}) == 3
    assert all('--docker-args' in c for c in dry.calls if c[:2] == ('pod', 'create'))
    reduced = new_state()
    Controller(DryProvider(inventory[:1]), reduced).provision()
    assert len(reduced['pods']) == 1
    denied = new_state()
    provider = DryProvider(inventory, 0)
    try:
        Controller(provider, denied).provision()
    except RuntimeError:
        pass
    else:
        raise AssertionError('Credit guard not enforced')
    assert provider.calls == [('user',)]
    report['provisioning'] = '5 mixed GPUs/one volume; 1-of-5 fallback; credit refusal before create; create-time guardian in every command'
    class LostCreateResponse(DryProvider):
        def api(self, *args):
            result = super().api(*args)
            if args[:2] == ('pod', 'create'):
                raise RuntimeError('Simulated lost create response')
            return result
    lost = new_state()
    provider = LostCreateResponse(inventory)
    try:
        Controller(provider, lost).provision()
    except RuntimeError as exc:
        assert 'Ambiguous pod create recovered' in str(exc)
    else:
        raise AssertionError('Ambiguous create must stop provisioning')
    assert len(lost['pods']) == 1 and lost['pending_pods'] == []
    calls = len(provider.calls)
    Controller(provider, lost).provision()
    assert len(provider.calls) == calls, 'Resume of existing workers should not spend or recheck startup credit'
    report['lost_create_response'] = 'Pod rediscovered by exact run name; provisioning stops; resume reuses it without additional resources'

    def cleanup_state():
        return {'run': 'test-run', 'pods': [{'id': 'a', 'name': 'test-run-p1'}, {'id': 'b', 'name': 'test-run-p2'}], 'volume': 'v'}
    s = cleanup_state()
    provider = CleanupProvider(s, ['a'])
    assert not Controller(provider, s).cleanup(cancel=True)
    assert provider.deleted == ['a']
    assert s['volume'] == 'v'
    report['unreachable_pod_and_uncollected_volume'] = 'Running unreachable pod untouched; volume retained'
    archive = root / 'home.bin'
    archive.write_bytes(b'checked archive')
    s = cleanup_state()
    s['home'] = {'archive': str(archive), 'sha256': sha(archive)}
    provider = CleanupProvider(s, ['a'], ['b'])
    assert Controller(provider, s).cleanup()
    assert provider.deleted == ['a', 'b', 'v']
    s = cleanup_state()
    s['home'] = {'archive': str(archive), 'sha256': sha(archive)}
    provider = CleanupProvider(s, ['a', 'b'], delete_fail=True)
    assert not Controller(provider, s).cleanup()
    assert s['volume'] == 'v'
    archive.write_bytes(b'changed')
    s = cleanup_state()
    s['home'] = {'archive': str(archive), 'sha256': 'f' * 64}
    provider = CleanupProvider(s, ['a', 'b'])
    assert not Controller(provider, s).cleanup()
    assert s['volume'] == 'v'
    report['cleanup_guards'] = 'Confirmed stopped pod removed; delete failure or changed home archive keeps volume/state'

    class FailedDownload(Controller):
        def remote_status(self, pod):
            return {'success': {'sha256': 'test'}}
        def collect(self, pod, result):
            raise RuntimeError('Deliberate download verification failure')
    s = {'pods': [{'id': 'fake'}], 'hard_seconds': 10}
    try:
        FailedDownload(None, s).monitor()
    except RuntimeError as exc:
        assert 'download verification' in str(exc)
    else:
        raise AssertionError('Download failure swallowed')
    class FailedCleanup(FailedDownload):
        def collect(self, pod, result):
            pass
        def cleanup(self):
            return False
    try:
        FailedCleanup(None, s).monitor()
    except RuntimeError as exc:
        assert 'cleanup incomplete' in str(exc)
    else:
        raise AssertionError('Cleanup failure reported as success')
    report['monitor_failures'] = 'Bad download propagates immediately; incomplete cleanup cannot report success'
    report['artifact_directory'] = str(root)
    atomic(HERE / 'qa75' / 'offline-tests.json', report)
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    mp.freeze_support()
    tests()
