"""Brief 75 shared-filesystem queue. Standard library; Windows smoke / Linux NFS.

Rename commits + kernel locks, never unlink lock files. An expired claim is only
reclaimed after its writer's kernel lock is free. A stalled but live writer is
left to the pod watchdog, preventing two writers even if its heartbeat stalls.
"""
import hashlib
import json
import os
from pathlib import Path
import threading
import time
import uuid


def atomic(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + '.' + uuid.uuid4().hex + '.tmp')
    with tmp.open('w', encoding='utf-8', newline='\n') as f:
        json.dump(value, f, sort_keys=True)
        f.flush()
        os.fsync(f.fileno())
    for attempt in range(100):
        try:
            os.replace(tmp, path)
            break
        except PermissionError:
            # Windows readers/rename sharing can briefly deny replacement.
            if os.name != 'nt' or attempt==99:raise
            time.sleep(.02)


def read(path, default=None):
    for attempt in range(100):
        try:
            return json.loads(Path(path).read_text(encoding='utf-8'))
        except FileNotFoundError:
            return default
        except PermissionError:
            if os.name != 'nt' or attempt==99:raise
            time.sleep(.02)


def sha(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as f:
        for block in iter(lambda: f.read(4 * 1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


class Lock:
    def __init__(self, path):
        self.path = Path(path)
        self.file = None

    def acquire(self, wait=True):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        f = self.path.open('a+b')
        if os.name == 'nt':
            import msvcrt
            # Byte zero is always the lock, including concurrent first opens.
            if not self.path.stat().st_size:
                f.write(b'0')
                f.flush()
        while True:
            try:
                if os.name == 'nt':
                    f.seek(0)
                    msvcrt.locking(f.fileno(), msvcrt.LK_NBLCK, 1)
                else:
                    import fcntl
                    fcntl.flock(f, fcntl.LOCK_EX | fcntl.LOCK_NB)
                self.file = f
                return True
            except (BlockingIOError, PermissionError):
                if not wait:
                    f.close()
                    return False
                time.sleep(.05)

    def close(self):
        if self.file:
            if os.name == 'nt':
                import msvcrt
                self.file.seek(0)
                msvcrt.locking(self.file.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                import fcntl
                fcntl.flock(self.file, fcntl.LOCK_UN)
            self.file.close()
            self.file = None

    def __enter__(self):
        self.acquire()
        return self

    def __exit__(self, *args):
        self.close()


class Queue:
    def __init__(self, root, indices, identity, chunk=8, lease=180, poll=5):
        self.root = Path(root)
        self.indices = list(indices)
        self.lease, self.poll = lease, poll
        for name in ('pending', 'claims', 'done', 'locks', 'workers', 'receipts'):
            (self.root / name).mkdir(parents=True, exist_ok=True)
        with Lock(self.root / 'locks' / 'queue'):
            config = {'identity': identity, 'indices': self.indices, 'chunk': chunk}
            previous = read(self.root / 'config.json')
            if previous is not None and previous != config:
                raise RuntimeError('Queue belongs to another bundle, mode or chunk size')
            atomic(self.root / 'config.json', config)
            for start in range(0, len(self.indices), chunk):
                key = f'{start // chunk:06d}.json'
                if not any((self.root / d / key).exists() for d in ('pending', 'claims', 'done')):
                    atomic(self.root / 'pending' / key, {'indices': self.indices[start:start + chunk]})

    def claim(self, worker):
        with Lock(self.root / 'locks' / 'queue'):
            for path in sorted((self.root / 'claims').glob('*.json')):
                if time.time() - path.stat().st_mtime < self.lease:
                    continue
                lock = Lock(self.root / 'locks' / path.stem)
                if lock.acquire(False):
                    try:
                        # Heartbeats cannot recreate a renamed claim: they keep
                        # this lock for their entire lifetime.
                        os.replace(path, self.root / 'pending' / path.name)
                    finally:
                        lock.close()
            for path in sorted((self.root / 'pending').glob('*.json')):
                lock = Lock(self.root / 'locks' / path.stem)
                if not lock.acquire(False):
                    continue
                job = read(path)
                job.update(worker=worker, token=uuid.uuid4().hex, claimed=time.time())
                atomic(path, job)
                target = self.root / 'claims' / path.name
                os.replace(path, target)
                return target, job, lock
        return None

    def finished(self):
        return (not list((self.root / 'pending').glob('*.json')) and
            not list((self.root / 'claims').glob('*.json')))

    def work(self, worker, gpu, valid, render, finalize):
        """render(i) commits its receipt last; finalize verifies all frames again."""
        leader = Lock(self.root / 'locks' / 'coordinator')
        stats = {'worker': worker, 'pod': os.environ.get('MULTI_POD_ID', os.environ.get('RUNPOD_POD_ID', worker)),
                 'pid': os.getpid(), 'gpu': gpu, 'frames': 0, 'seconds': 0, 'state': 'working'}
        status = self.root / 'workers' / (worker + '.json')

        def report(state):
            stats.update(state=state, updated=time.time())
            atomic(status, stats)

        try:
            while True:
                if (self.root / 'SUCCESS.json').exists():
                    report('idle')
                    return
                claim = self.claim(worker)
                if claim:
                    path, job, lock = claim
                    stop = threading.Event()
                    def heartbeat():
                        while not stop.wait(max(.05, self.lease / 3)):
                            os.utime(path, None)
                    heart = threading.Thread(target=heartbeat, daemon=True)
                    heart.start()
                    try:
                        for i in job['indices']:
                            if not valid(i):
                                start = time.monotonic()
                                render(i)
                                if not valid(i):
                                    raise RuntimeError(f'Invalid rendered frame {i}')
                                stats['frames'] += 1
                                stats['seconds'] += time.monotonic() - start
                            atomic(self.root / 'receipts' / f'{i:05d}.json', {'frame': i, 'worker': worker})
                            stats['last_frame'] = i
                            report('working')
                        stop.set()
                        heart.join()
                        with Lock(self.root / 'locks' / 'queue'):
                            os.replace(path, self.root / 'done' / path.name)
                    finally:
                        stop.set()
                        heart.join()
                        lock.close()
                    continue
                # Keep one idle worker available to reclaim a dead last worker.
                # Other workers retire as soon as no claimable work remains.
                if not leader.file and not leader.acquire(False):
                    report('idle')
                    return
                if self.finished():
                    with Lock(self.root / 'locks' / 'finalize'):
                        if not (self.root / 'SUCCESS.json').exists():
                            bad = {i for i in self.indices if not valid(i)}
                            if bad:
                                with Lock(self.root / 'locks' / 'queue'):
                                    for i in bad:
                                        (self.root / 'receipts' / f'{i:05d}.json').unlink(missing_ok=True)
                                    for path in (self.root / 'done').glob('*.json'):
                                        if bad.intersection(read(path)['indices']):
                                            os.replace(path, self.root / 'pending' / path.name)
                                continue
                            report('finalizing')
                            result = finalize()
                            atomic(self.root / 'SUCCESS.json', result)
                    report('complete')
                    return
                report('waiting')
                time.sleep(self.poll)
        except BaseException:
            report('failed')
            raise
        finally:
            leader.close()


def progress(root):
    root = Path(root)
    config = read(root / 'config.json', {})
    workers = [w for p in (root / 'workers').glob('*.json') if (w := read(p))]
    done = len(list((root / 'receipts').glob('*.json')))
    rates = {}
    for w in workers:
        if w['seconds']:
            g = rates.setdefault(w['gpu'], {'frames': 0, 'seconds': 0, 'active_fps': 0})
            g['frames'] += w['frames']
            g['seconds'] += w['seconds']
            if w['state'] == 'working' and time.time() - w['updated'] < 900:
                g['active_fps'] += w['frames'] / w['seconds']
    rate = sum(g['active_fps'] for g in rates.values())
    total = len(config.get('indices', []))
    pods = [t for p in (root.parent / 'telemetry').glob('*.json') if (t := read(p))]
    return {'done': done, 'total': total, 'rates': rates, 'workers': workers, 'pods': pods,
            'eta_seconds': (total - done) / rate if rate else None,
            'success': read(root / 'SUCCESS.json')}
