"""Brief 75 controller. DRY_RUN never constructs a live provider or invokes CLI.

Resources carry a unique persisted run name before any mutation; recovery scans
that exact name prefix to cover a killed/ambiguous create response. No raw API
objects, account details or credentials are logged or persisted.
"""
import sys
sys.dont_write_bytecode = True
if sys.version_info < (3, 12):
    raise RuntimeError('Python 3.12+ required (included Blender Python is supported)')
import base64
from contextlib import contextmanager
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
import math
import os
from pathlib import Path, PurePosixPath
import re
import shlex
import signal
import subprocess
import tarfile
import time
import uuid
from multi_queue import Lock, atomic, read, sha

HERE = Path(__file__).resolve().parent
ROXY = HERE.parent
DEFAULT_GPUS = 'NVIDIA GeForce RTX 4090,NVIDIA GeForce RTX 5090,NVIDIA L40S,NVIDIA RTX A6000,NVIDIA GeForce RTX 3090'


class CapacityUnavailable(RuntimeError):
    """A definite no-capacity response, safe to try the next GPU type."""


class VolumeUnsupported(RuntimeError):
    """The data center cannot host a network volume; nothing was created, try the next center."""


# Data centers that accept network volumes, from RunPod's own error text (7 Nov 2026: the first Brief 77 test picked
# EUR-IS-2, which lists 4090s but has no network volumes). Override with MULTI_VOLUME_DCS=a,b,c if RunPod changes it.
VOLUME_DCS = set(os.environ.get('MULTI_VOLUME_DCS', 'AP-IN-1,AP-IN-2,AP-JP-1,CA-MTL-1,CA-MTL-3,CA-MTL-4,EU-CZ-1,'
    'EU-FR-1,EU-NL-1,EU-RO-1,EUR-IS-1,EUR-IS-3,EUR-IS-4,EUR-NO-1,EUR-NO-2,US-CA-2,US-CO-1,US-IL-1,US-NC-1,US-NE-1,'
    'US-TX-3,US-WA-1').split(','))


@contextmanager
def controller_lock(path):
    lock = Lock(path)
    if not lock.acquire(False):
        raise RuntimeError('Another helper owns this multi state; stop that local helper before recovery/cleanup')
    try:
        yield
    finally:
        lock.close()


def local_path(value):
    if os.name == 'nt' and re.match(r'^/[a-zA-Z]/', str(value)):
        value = str(value)[1] + ':' + str(value)[2:]
    return Path(value).resolve()


def positive(name, default, integer=False):
    value = float(os.environ.get(name, default))
    if not math.isfinite(value) or value <= 0 or (integer and value != int(value)):
        raise ValueError(name + ' must be positive' + (' integer' if integer else ''))
    return int(value) if integer else value


def run(cmd, timeout=90, data=None):
    # Never print full commands / stdout from RunPod: objects can contain env.
    # Bytes, not text mode: on Windows text-mode stdin turns LF into CRLF, and the pod's sha256sum then reads
    # every filename with a trailing CR (7 Nov 2026: all workers failed setup on the first live run).
    result = subprocess.run([str(x) for x in cmd], input=None if data is None else data.encode('utf-8'),
                            capture_output=True, timeout=timeout,
                            env={**os.environ, 'MSYS_NO_PATHCONV': '1', 'RUNPOD_NO_UPDATE_CHECK': '1'})
    result.stdout = result.stdout.decode('utf-8', 'replace'); result.stderr = result.stderr.decode('utf-8', 'replace')
    if result.returncode:
        error = (result.stdout + result.stderr).lower()
        if any(message in error for message in ('no instances available', 'no longer any instances available',
                'no available instances', 'no available gpu', 'no capacity available', 'insufficient stock', 'not enough gpus')):
            raise CapacityUnavailable('No eligible GPU capacity')
        if 'does not support network volumes' in error:
            raise VolumeUnsupported('Data center has no network volumes')
        raise RuntimeError(f'{Path(cmd[0]).name} failed (exit {result.returncode}); raw output withheld')
    return result.stdout


def validate_archive(path):
    with tarfile.open(path, 'r:gz') as tar:
        members = tar.getmembers()
        names = [m.name for m in members]
        if len(names) != len(set(names)):
            raise ValueError('Duplicate bundle members')
        for m in members:
            parts = PurePosixPath(m.name).parts
            if not parts or parts[0] != 'bundle' or '..' in parts or '\\' in m.name or ':' in m.name or not (m.isfile() or m.isdir()):
                raise ValueError('Unsafe bundle member')
        for name in ('pipeline.py', 'render67.py', 'camera_path.json', 'bundle-manifest.json', 'BUNDLE-SHA256SUMS'):
            if 'bundle/' + name not in names:
                raise ValueError('Multi currently requires the sealed Brief 67/68 bundle contract')
        manifest = json.load(tar.extractfile('bundle/bundle-manifest.json'))
        import hashlib
        for name, digest in manifest.items():
            f = tar.extractfile('bundle/' + name)
            if hashlib.file_digest(f, 'sha256').hexdigest() != digest:
                raise ValueError('Bundle manifest mismatch: ' + name)
        camera = json.load(tar.extractfile('bundle/camera_path.json'))
    return sha(path), camera['total_frames']


def rank_centers(inventory, gpus, count, pin=None):
    ranked = []
    for dc in inventory:
        if pin and dc['id'] != pin:
            continue
        available = {a['gpuId']: a for a in dc.get('gpuAvailability', [])
                     if str(a.get('stockStatus', 'None')).lower() not in ('none', '', 'unavailable')}
        choices = [g for g in gpus if g in available]
        # Numeric stock counts are optional. Categorical stock isn't a promise
        # of N GPUs; only successful creates establish actual capacity. Without a count, the stock label is the
        # estimate (owner, 7 Nov 2026: a data center showing High should win over Low): High 4, Medium 2, Low 1.
        level = {'high': 4, 'medium': 2, 'low': 1}
        def estimate(a):
            if a.get('availableCount') is not None:
                return int(a['availableCount'])
            return level.get(str(a.get('stockStatus', '')).lower(), 1)
        capacity = sum(estimate(available[g]) for g in choices)
        if choices:
            ranked.append((min(count, capacity), capacity, len(choices), -gpus.index(choices[0]), dc['id'], choices))
    ranked.sort(reverse=True)
    return [(r[4], r[5]) for r in ranked]


def bootstrap_command():
    payload = base64.b64encode((HERE / 'multi_boot.sh').read_bytes()).decode('ascii')
    return 'bash -lc ' + shlex.quote('printf %s ' + shlex.quote(payload) + ' | base64 -d | bash')


def pod_args(state, gpu, name):
    env = {'NVIDIA_DRIVER_CAPABILITIES': 'all', 'MULTI_ROOT': state['remote'],
           'MULTI_GPU': gpu, 'FLY_MODE': state['quality'], 'BUNDLE_SHA256': state['sha256'],
           'HARD_SECONDS': str(state['hard_seconds']), 'STARTUP_SECONDS': str(state['startup_seconds']),
           'CHUNK': str(state['chunk']), 'LEASE_SECONDS': str(state['lease']),
           'WORKERS': str(state.get('workers', 'auto')), 'MAX_WORKERS': str(state.get('max_workers', 4)),
           'TUNE_SECONDS': str(state.get('tune_seconds', 20))}
    if state.get('frames'):env['FRAMES'] = '-'.join(map(str,state['frames']))
    return ['pod', 'create', '--name', name, '--image', state['image'], '--gpu-id', gpu,
            '--cloud-type', 'SECURE', '--gpu-count', '1', '--ports', '22/tcp',
            '--data-center-ids', state['dc'], '--network-volume-id', state['volume'],
            '--volume-mount-path', '/vol', '--container-disk-in-gb', '80',
            '--env', json.dumps(env), '--docker-args', bootstrap_command()]


class Provider:
    def __init__(self):
        self.rpc = local_path(os.environ.get('MULTI_RPC', ROXY.parent / 'tools/runpodctl/runpodctl.exe'))
        self.key = local_path(os.environ.get('MULTI_KEY', Path.home() / '.ssh/runpod_ed25519'))
        if not self.rpc.is_file() or not self.key.is_file():
            raise RuntimeError('Missing runpodctl or SSH key')

    def api(self, *args):
        return json.loads(run([self.rpc, *args, '-o', 'json'], timeout=120) or '{}')

    def ssh_args(self, pod, scp=False):
        endpoint = self.api('pod', 'get', pod).get('ssh') or {}
        host, port, user = endpoint.get('ip'), endpoint.get('port'), endpoint.get('user', 'root')
        if not host or not port or not re.fullmatch(r'[a-zA-Z0-9.:-]+', str(host)) or not re.fullmatch(r'[a-zA-Z0-9_-]+', user):
            raise RuntimeError('No valid SSH endpoint')
        if not 0 < int(port) < 65536:
            raise RuntimeError('Invalid SSH port')
        args = ['scp' if scp else 'ssh', '-i', str(self.key), '-P' if scp else '-p', str(port),
                '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=accept-new',
                '-o', 'ConnectTimeout=10', '-o', 'ServerAliveInterval=10', '-o', 'ServerAliveCountMax=2']
        return args, f'{user}@{host}'

    def ssh(self, pod, command, timeout=45, data=None):
        args, host = self.ssh_args(pod)
        return run([*args, host, command], timeout=timeout, data=data)

    def copy(self, pod, local, remote, upload=False):
        args, host = self.ssh_args(pod, True)
        # Paths are generated safe remote paths; local absolute Windows paths
        # are converted for Git for Windows scp to avoid its host:path parsing.
        path = str(local)
        if os.name == 'nt':
            path = '/' + path[0].lower() + path[2:].replace('\\', '/')
        source, dest = (path, host + ':' + remote) if upload else (host + ':' + remote, path)
        run([*args, source, dest], timeout=1800)


class DryProvider:
    def __init__(self, inventory, balance=100):
        self.inventory, self.balance = inventory, balance
        self.calls, self.pods, self.volumes = [], [], []
        self.stock = {(d['id'], a['gpuId']): int(a.get('availableCount', 1)) for d in inventory for a in d.get('gpuAvailability', [])
                      if a.get('stockStatus') not in (None, 'None')}

    def api(self, *args):
        self.calls.append(args)
        if args == ('datacenter', 'list'):
            return self.inventory
        if args == ('user',):
            return {'clientBalance': self.balance}
        if args[:2] == ('network-volume', 'create'):
            vol = {'id': 'dry-volume-' + str(len(self.volumes)), 'name': args[args.index('--name') + 1]}
            self.volumes.append(vol)
            return vol
        if args[:2] == ('network-volume', 'delete'):
            return {}
        if args[:2] == ('pod', 'create'):
            dc, gpu = (args[args.index(k) + 1] for k in ('--data-center-ids', '--gpu-id'))
            if not self.stock.get((dc, gpu), 0):
                raise CapacityUnavailable('Simulated capacity exhausted')
            self.stock[dc, gpu] -= 1
            pod = {'id': 'dry-pod-' + str(len(self.pods)), 'name': args[args.index('--name') + 1], 'costPerHr': .9}
            self.pods.append(pod)
            return pod
        if args[:2] == ('pod', 'list'):
            return self.pods
        if args[:2] == ('network-volume', 'list'):
            return self.volumes
        raise AssertionError('Unexpected dry-run operation')


class Controller:
    def __init__(self, provider, state, path=None):
        self.provider, self.state, self.path = provider, state, path

    def save(self):
        if self.path:
            atomic(self.path, self.state)

    def say(self, message):
        line = time.strftime('[%H:%M:%S] ') + message
        print(line, flush=True)
        if self.path:
            with Path(self.state['log']).open('a', encoding='utf-8') as f:
                f.write(line + '\n')

    def reconcile(self):
        # Discovery is mandatory after ambiguous creates / helper kill. Match
        # exact generated names, never a broad dinkdonk prefix or foreign run.
        s = self.state
        pods = self.provider.api('pod', 'list', '--all')
        volumes = self.provider.api('network-volume', 'list')
        if not isinstance(pods, list) or not isinstance(volumes, list):
            raise RuntimeError('Unrecognized inventory response; cleanup refused')
        known = {p['id'] for p in s['pods']}
        for p in pods:
            if re.fullmatch(re.escape(s['run']) + r'-[pr][0-9]+', p.get('name', '')) and p['id'] not in known:
                s['pods'].append({'id': p['id'], 'name': p['name'], 'gpu': 'recovered', 'prepared': False,
                                  'reader': bool(re.search(r'-r[0-9]+$', p['name']))})
                known.add(p['id'])
        discovered = {p.get('name') for p in pods}
        s['pending_pods'] = [name for name in s.get('pending_pods', []) if name not in discovered]
        found = [v for v in volumes if v.get('name') == s['run']]
        if len(found) > 1:
            raise RuntimeError('Multiple matching volumes; inspect run before cleanup')
        if found and s.get('volume') not in (None, found[0]['id']):
            raise RuntimeError('Volume identity conflict')
        if found:
            s['volume'] = found[0]['id']
            s['pending_volume'] = False
        self.save()
        return {p['id']: p for p in pods}, {v['id']: v for v in volumes}

    def provision(self):
        s = self.state
        existing = [p for p in s['pods'] if not p.get('deleted')]
        if existing:
            self.say(f'Reusing {len(existing)} existing workers on the recorded volume')
            return
        balance = self.provider.api('user').get('clientBalance')
        if balance is None or not math.isfinite(float(balance)) or float(balance) < s['minimum_balance']:
            raise RuntimeError(f'Credit guard: need at least ${s["minimum_balance"]:.2f}; unavailable/insufficient balance')
        inventory = self.provider.api('datacenter', 'list')
        centers = [(s['dc'], s['gpus'])] if s.get('volume') else rank_centers(inventory, s['gpus'], s['requested'], s.get('pin'))
        if not s.get('volume') and type(self.provider) is Provider:  # real RunPod only, not test doubles
            skipped = [dc for dc, _ in centers if dc not in VOLUME_DCS]
            centers = [c for c in centers if c[0] in VOLUME_DCS]
            if skipped:
                self.say('Skipping data centers without network volumes: ' + ', '.join(skipped))
        if not centers:
            raise RuntimeError('No listed eligible capacity; no resources created')
        for dc, choices in centers:
            s['dc'] = dc
            if not s.get('volume'):
                s['pending_volume'] = True
                self.save()  # run name exists before create, including lost responses
                try:
                    result = self.provider.api('network-volume', 'create', '--name', s['run'], '--size', str(s['volume_gb']), '--data-center-id', dc)
                except VolumeUnsupported:
                    s['pending_volume'] = False; self.save()
                    self.say(f'{dc} has no network volumes; trying the next data center')
                    continue
                s['volume'] = result['id']
                s['pending_volume'] = False
                self.save()
            for gpu in choices:
                while len([p for p in s['pods'] if not p.get('deleted')]) < s['requested']:
                    serial = s.get('serial', 0) + 1
                    s['serial'] = serial
                    name = s['run'] + '-p' + str(serial)
                    s.setdefault('pending_pods', []).append(name)
                    self.save()
                    try:
                        result = self.provider.api(*pod_args(s, gpu, name))
                    except (RuntimeError, subprocess.TimeoutExpired) as exc:
                        self.reconcile()  # could have been created despite failed response
                        if any(p['name'] == name for p in s['pods']):
                            raise RuntimeError('Ambiguous pod create recovered; rerun with MULTI_RESUME=1')
                        if not isinstance(exc, CapacityUnavailable):
                            raise RuntimeError('Pod create unconfirmed; pending run name retained for recovery') from None
                        s['pending_pods'].remove(name)
                        self.save()
                        break
                    result = result.get('pod', result)
                    s['pending_pods'].remove(name)
                    s['pods'].append({'id': result['id'], 'name': name, 'gpu': gpu, 'rate': result.get('costPerHr'), 'prepared': False})
                    self.save()
                    self.say(f'Created {result["id"]}: {gpu} in {dc}')
            count = len([p for p in s['pods'] if not p.get('deleted')])
            if count:
                self.say(f'Using {count}/{s["requested"]} pods, one {s["volume_gb"]} GB volume in {dc}' + (' (reduced capacity)' if count < s['requested'] else ''))
                return
            self.provider.api('network-volume', 'delete', s['volume'])
            s['volume'] = None
            self.save()
        raise RuntimeError('No GPU could be created')

    def prepare(self, pod):
        deadline = time.monotonic() + self.state['startup_seconds'] - 60
        while time.monotonic() < deadline:
            try:
                self.provider.ssh(pod['id'], 'test -s /workspace/multi75/GUARD && kill -0 "$(cat /workspace/multi75/GUARD)" && command -v runpodctl >/dev/null')
                break
            except (RuntimeError, subprocess.TimeoutExpired):
                time.sleep(10)
        else:
            raise RuntimeError('No SSH/armed guardian before startup deadline')
        for name in ('multi_queue.py', 'multi_blender.py', 'multi_launch.sh', 'multi_supervisor.py'):
            self.provider.copy(pod['id'], HERE / name, '/workspace/multi75/' + name, True)
        self.provider.copy(pod['id'], self.state['archive'], '/workspace/multi75/bundle.tar.gz', True)
        # Read-back hashes before READY; a partial upload is never executable.
        pairs = [(sha(HERE / name), '/workspace/multi75/' + name) for name in ('multi_queue.py', 'multi_blender.py', 'multi_launch.sh', 'multi_supervisor.py')]
        pairs.append((self.state['sha256'], '/workspace/multi75/bundle.tar.gz'))
        data = ''.join(h + '  ' + path + '\n' for h, path in pairs)
        self.provider.ssh(pod['id'], 'sha256sum --check --quiet - && touch /workspace/multi75/READY', timeout=120, data=data)

    def remote_status(self, pod):
        command = "python3 -c " + shlex.quote(
            "import sys,json;sys.path.insert(0,'/workspace/multi75');from multi_queue import progress;print(json.dumps(progress(" + repr(self.state['remote'] + '/queue') + ")))" )
        return json.loads(self.provider.ssh(pod, command, timeout=60))

    def collect(self, pod, result):
        s = self.state
        expected = s['frames'][1]-s['frames'][0]+1 if s.get('frames') else s['total'] if s['quality'] == 'final' else (s['total'] + 1) // 2
        if result.get('frames') != expected or result.get('quality') != s['quality'] or result.get('test_range') != s.get('frames'):
            raise RuntimeError('Unexpected result mode/frame count; volume retained')
        archive = HERE / (s['run'] + '-result.tar.gz')
        partial = archive.with_suffix('.partial')
        self.say('Downloading verified result')
        self.provider.copy(pod, partial, s['remote'] + '/out10.tar.gz')
        if sha(partial) != result['sha256']:
            raise RuntimeError('Download checksum mismatch; volume retained')
        os.replace(partial, archive)
        verify_unpack(archive, local_path(s['outdir']), result)
        s['home'] = {'archive': str(archive), 'sha256': result['sha256'], 'outdir': s['outdir']}
        self.save()
        self.say('Result checked and unpacked into ' + s['outdir'])

    def cleanup(self, cancel=False):
        s = self.state
        inventory, volumes = self.reconcile()
        all_gone = not (s.get('pending_pods') or s.get('pending_volume'))
        if not all_gone:
            self.say('Unconfirmed create requests retained in state; retry cleanup after provider settles')
        for pod in s['pods']:
            current = inventory.get(pod['id'])
            if current is None:
                pod['deleted'] = True
                continue
            state = str(current.get('runtimeStatus') or current.get('desiredStatus', 'unknown')).lower()
            reachable = False
            try:
                self.provider.ssh(pod['id'], 'true')
                reachable = True
            except (RuntimeError, subprocess.TimeoutExpired):
                pass
            # A confirmed stopped pod is no longer an unreachable renderer.
            stopped = state in ('stopped', 'exited', 'terminated')
            allowed = cancel or bool(s.get('home')) or pod.get('idle')
            if allowed and (reachable or stopped):
                try:
                    self.provider.api('pod', 'remove', pod['id'])
                    pod['deleted'] = True
                    self.say('Deleted pod ' + pod['id'])
                except (RuntimeError, subprocess.TimeoutExpired):
                    all_gone = False
                    self.say('Delete unconfirmed: ' + pod['id'] + '; state retained')
            else:
                all_gone = False
                self.say('Kept pod ' + pod['id'] + (' (unreachable; watchdog owns shutdown)' if not reachable else ' (still working)'))
            self.save()
        home = s.get('home')
        checked = bool(home and Path(home['archive']).is_file() and sha(home['archive']) == home['sha256'])
        if s.get('volume') and s['volume'] not in volumes:
            self.say('Recorded volume is already absent from provider inventory')
            s['volume'] = None
            self.save()
        if s.get('volume') and s['volume'] in volumes and all_gone and checked:
            self.provider.api('network-volume', 'delete', s['volume'])
            self.say('Deleted volume after local archive recheck')
            s['volume'] = None
            self.save()
        if not s.get('volume') and all_gone:
            if self.path:
                self.path.unlink(missing_ok=True)
            return True
        self.say('State/volume retained; use multi-cleanup after recovery. No result data discarded.')
        return False

    def start_pending(self):
        if not hasattr(self, '_pool'):
            self._pool = ThreadPoolExecutor(max_workers=max(1,self.state.get('requested',1)+1));self._futures = {}
        busy = {p['id'] for p in self._futures.values()}
        for pod in self.state['pods']:
            if not pod.get('deleted') and not pod.get('idle') and not pod.get('prepared') and pod['id'] not in busy:
                future = self._pool.submit(self.prepare_reader if pod.get('reader') else self.prepare, pod)
                self._futures[future] = pod

    def poll_pending(self):
        for future,pod in list(getattr(self,'_futures',{}).items()):
            if future.done():
                try:
                    future.result();pod['prepared'] = True;self.say('Pod ready: '+pod['id'])
                except Exception:
                    pod['idle'] = True;self.say('Pod setup failed: '+pod['id']+'; guardian owns shutdown')
                del self._futures[future];self.save()

    def top_up(self, status=None, force=False):
        s = self.state
        active = [p for p in s['pods'] if not p.get('deleted') and not p.get('idle') and not p.get('reader')]
        needed = s['requested']-len(active)
        if needed<=0 or s.get('pending_pods'):return False
        if not force and (not status or not status.get('total')):return False
        if not force and status and status.get('total') and status['done']/status['total']>=.75:return False
        if force and status and status.get('total') and status['done']/status['total']>=.75:needed=min(needed,1)
        balance = self.provider.api('user').get('clientBalance')
        minimum = max(5,s['minimum_balance']*needed/s['requested'])
        if balance is None or not math.isfinite(float(balance)) or float(balance)<minimum:
            self.say(f'Credit guard: top-up deferred (needs ${minimum:.2f})');return False
        # Existing volume/DC never changes. Persist intent before each create.
        for gpu in s['gpus']:
            while needed>0:
                s['serial'] = s.get('serial',0)+1;name = s['run']+'-p'+str(s['serial'])
                s.setdefault('pending_pods',[]).append(name);self.save()
                try:result = self.provider.api(*pod_args(s,gpu,name))
                except (RuntimeError,subprocess.TimeoutExpired) as exc:
                    self.reconcile()
                    if any(p['name']==name for p in s['pods']):
                        self.say('Recovered top-up create response: '+name);return True
                    if not isinstance(exc,CapacityUnavailable):
                        self.say('Top-up create unconfirmed; recorded name retained');return False
                    s['pending_pods'].remove(name);self.save();break
                result = result.get('pod',result);s['pending_pods'].remove(name)
                s['pods'].append({'id':result['id'],'name':name,'gpu':gpu,'rate':result.get('costPerHr'),'prepared':False})
                self.save();self.say('Added pod '+result['id']+' in '+s['dc']);needed-=1
        return True

    def ensure_reader(self):
        s = self.state
        existing = [p for p in s['pods'] if p.get('reader') and not p.get('deleted') and not p.get('idle')]
        if existing:return existing[0]
        if s.get('pending_pods'):return None
        balance = self.provider.api('user').get('clientBalance')
        if balance is None or not math.isfinite(float(balance)) or float(balance)<.5:
            self.say('Credit guard: reader needs at least $0.50');return None
        choices = s.get('reader_gpus',['NVIDIA RTX 2000 Ada Generation','NVIDIA RTX A4000','NVIDIA L4','CPU'])
        for gpu in choices:
            s['reader_serial'] = s.get('reader_serial',0)+1;name = s['run']+'-r'+str(s['reader_serial'])
            s.setdefault('pending_pods',[]).append(name);self.save()
            env = {'MULTI_ROOT':s['remote'],'MULTI_READER':'1','HARD_SECONDS':'1800','STARTUP_SECONDS':'600'}
            args = ['pod','create','--name',name,'--image','runpod/base:0.6.2-cpu' if gpu=='CPU' else s['image'],
                    '--ports','22/tcp','--data-center-ids',s['dc'],'--network-volume-id',s['volume'],
                    '--volume-mount-path','/vol','--container-disk-in-gb','20','--env',json.dumps(env),'--docker-args',bootstrap_command()]
            args += ['--compute-type','cpu'] if gpu=='CPU' else ['--gpu-id',gpu,'--gpu-count','1','--cloud-type','SECURE']
            try:result = self.provider.api(*args)
            except (RuntimeError,subprocess.TimeoutExpired) as exc:
                self.reconcile()
                recovered = next((p for p in s['pods'] if p['name']==name),None)
                if recovered:return recovered
                if not isinstance(exc,CapacityUnavailable):
                    self.say('Reader create unconfirmed; recorded name retained');return None
                s['pending_pods'].remove(name);self.save();continue
            result = result.get('pod',result);s['pending_pods'].remove(name)
            pod = {'id':result['id'],'name':name,'gpu':gpu,'reader':True,'prepared':False}
            s['pods'].append(pod);self.save();self.say('Created collection/status reader '+pod['id']);return pod
        return None

    def prepare_reader(self,pod):
        deadline = time.monotonic()+540
        while time.monotonic()<deadline:
            try:
                self.provider.ssh(pod['id'],'test -s /workspace/multi75/GUARD && kill -0 "$(cat /workspace/multi75/GUARD)"')
                self.provider.copy(pod['id'],HERE/'multi_queue.py','/workspace/multi75/multi_queue.py',True)
                self.provider.ssh(pod['id'],'sha256sum --check --quiet - && touch /workspace/multi75/READY',
                                  data=sha(HERE/'multi_queue.py')+'  /workspace/multi75/multi_queue.py\n')
                return
            except (RuntimeError,subprocess.TimeoutExpired):time.sleep(10)
        raise RuntimeError('Reader startup timeout')

    def reconcile_runtime(self):
        inventory,_ = self.reconcile()
        for pod in self.state['pods']:
            current = inventory.get(pod['id'])
            if current is None:pod['deleted'] = True
            elif str(current.get('runtimeStatus') or current.get('desiredStatus','')).lower() in ('stopped','exited','terminated'):
                pod['idle'] = True
                try:
                    self.provider.api('pod','remove',pod['id']);pod['deleted'] = True
                    self.say('Removed stopped pod '+pod['id'])
                except (RuntimeError,subprocess.TimeoutExpired):self.say('Stopped pod removal deferred: '+pod['id'])
        self.save()

    def telemetry_line(self,status):
        details=[];now=time.time()
        for t in status.get('pods',[]):
            if now-t.get('updated',0)>180:continue
            gpu=t.get('gpu_pct');used=t.get('vram_used_mb');total=t.get('vram_total_mb')
            details.append(f'{t["pod"]}: GPU {gpu:.0f}%' if gpu is not None else t['pod']+': GPU unknown')
            details[-1] += (f', VRAM {used/1024:.1f}/{total/1024:.1f} GB' if used is not None and total else ', VRAM unknown')
            details[-1] += f', {t["workers"]} workers, {t["frames_per_minute"]:.1f} f/min'
            if t.get('low_since') and now-t['low_since']>=300:
                self.say('WARNING '+t['pod']+': GPU below 70% for five minutes after warm-up')
        return '; '.join(details) or 'pods warming up'

    def monitor(self):
        deadline = time.monotonic() + self.state['hard_seconds'];last_ok = time.monotonic()
        last_topup = time.monotonic();last_report = 0;status = None
        while time.monotonic() < deadline:
            self.poll_pending()
            reached = False
            readers = [p for p in self.state['pods'] if not p.get('deleted')]
            for pod in readers:
                try:
                    status = self.remote_status(pod['id'])
                except (RuntimeError, subprocess.TimeoutExpired, ValueError):
                    continue
                last_ok = time.monotonic()
                reached = True
                if status['success']:
                    self.collect(pod['id'], status['success'])
                    if not self.cleanup():
                        raise RuntimeError('Result is home; cleanup incomplete, retry multi-cleanup')
                    return
                break
            try:self.reconcile_runtime()
            except (RuntimeError,subprocess.TimeoutExpired):
                self.say('Provider inventory unavailable; keeping recorded pods and retrying')
            active = [p for p in self.state['pods'] if not p.get('deleted') and not p.get('idle') and not p.get('reader')]
            if reached and status:
                eta = status['eta_seconds']
                if time.monotonic()-last_report>=self.state.get('telemetry_seconds',120):
                    self.say(f'{status["done"]}/{status["total"]} frames; '+self.telemetry_line(status)+'; ETA '+(f'{eta/60:.1f} min + finalize/transfer' if eta is not None else 'pending'));last_report=time.monotonic()
                telemetry = {t['pod']:t for t in status.get('pods',[]) if time.time()-t.get('updated',0)<180}
                for pod in active:
                    t = telemetry.get(pod['id'])
                    members = [w for w in status['workers'] if w.get('pod',w['worker'])==pod['id']]
                    idle = t and t['state'] in ('idle','failed') and t['workers']==0
                    if not t and members:idle = all(w['state'] in ('idle','failed') for w in members)
                    if idle:
                        pod['idle'] = True
                        try:
                            self.provider.ssh(pod['id'], 'true')
                            self.provider.api('pod', 'remove', pod['id'])
                            pod['deleted'] = True
                            self.say('Deleted idle pod ' + pod['id'])
                        except (RuntimeError, subprocess.TimeoutExpired):
                            self.say('Idle pod unreachable: left to watchdog ' + pod['id'])
                        self.save()
            active = [p for p in self.state['pods'] if not p.get('deleted') and not p.get('idle') and not p.get('reader')]
            due = time.monotonic()-last_topup>=self.state.get('topup_seconds',240)
            if due or not active:
                # No workers left is a recovery condition, never a successful exit.
                if due or not getattr(self,'_recovery_tried',False):
                    try:
                        if not active and not reached:
                            self.ensure_reader() # Inspect SUCCESS before renting replacement renderers.
                            self._awaiting_reader=True
                        else:self.top_up(status,force=not active)
                        if active and time.monotonic()-last_ok>300:self.ensure_reader()
                    except (RuntimeError,subprocess.TimeoutExpired):
                        self.say('Capacity/status recovery deferred; all create intents remain recorded')
                    last_topup=time.monotonic();self._recovery_tried=not active
                # A reader has just made the unfinished queue visible.
                elif not active and reached and getattr(self,'_awaiting_reader',False):
                    try:self.top_up(status,force=True)
                    except (RuntimeError,subprocess.TimeoutExpired):self.say('Replacement attempt deferred; recorded run retained')
                    self._awaiting_reader=False;last_topup=time.monotonic()
            else:self._recovery_tried=False
            self.start_pending()
            time.sleep(positive('POLL_SECONDS', 30))
        raise RuntimeError('Local time cap; pod guardians enforce their own caps')


def verify_unpack(archive, dest, result):
    """Check archive + every color/depth receipt before extracting into fresh OUTDIR."""
    import hashlib
    if dest.exists() and any(dest.iterdir()):
        raise RuntimeError('OUTDIR must be empty/new; existing output is never removed')
    with tarfile.open(archive, 'r:gz') as tar:
        members = tar.getmembers()
        names = [m.name for m in members]
        if len(set(names)) != len(names):
            raise ValueError('Duplicate archive entries')
        for m in members:
            p = PurePosixPath(m.name)
            if p.is_absolute() or '..' in p.parts or '\\' in m.name or ':' in m.name or not m.isfile():
                raise ValueError('Unsafe result member')
        metadata = [m for m in members if m.name.endswith('/frames.json')]
        if len(metadata) != 1:
            raise ValueError('Missing result metadata')
        frames = json.load(tar.extractfile(metadata[0]))
        if frames['total_frames'] != result['frames'] or frames['quality'] != result['quality']:
            raise ValueError('Result frame count/mode mismatch')
        prefix = str(PurePosixPath(metadata[0].name).parent)
        rows = frames['frames']
        if len(rows) != result['frames'] or [r['global_frame'] for r in rows] != frames['global_indices']:
            raise ValueError('Result frame sequence mismatch')
        indices = frames['global_indices']
        if indices != sorted(set(indices)):
            raise ValueError('Duplicated/unordered frame sequence')
        subset = frames.get('test_range')
        if subset:
            if (result.get('test_range')!=subset or not frames.get('test_only') or frames.get('smoke') or frames['quality']!='final' or
                len(subset)!=2 or not 1<=subset[0]<=subset[1]<=frames['production_frames'] or indices!=list(range(subset[0],subset[1]+1))):
                raise ValueError('Invalid/mismatched isolated test range')
            if any(row.get('resolution')!=[1920,1080] for row in rows):raise ValueError('Test range is not full final resolution')
        elif result.get('test_range') or (not frames.get('smoke') and indices != list(range(1, frames['production_frames'] + 1, 2 if frames['quality'] == 'draft' else 1))):
            raise ValueError('Incomplete production timeline')
        for row in rows:
            with tar.extractfile(prefix + f'/frames/{row["global_frame"]:05d}.png') as f:
                if hashlib.file_digest(f, 'sha256').hexdigest() != row['color_sha256']:
                    raise ValueError('Color hash mismatch')
        # Nested gzip stays streamed; no multigigabyte in-memory depth archive.
        with tar.extractfile(prefix + '/depth_pngs.tar.gz') as raw, tarfile.open(fileobj=raw, mode='r|gz') as depth:
            expected = {f'depth/{r["global_frame"]:05d}.png': r['depth_sha256'] for r in rows}
            seen = set()
            for m in depth:
                if m.name in expected:
                    if m.name in seen or not m.isfile() or hashlib.file_digest(depth.extractfile(m), 'sha256').hexdigest() != expected[m.name]:
                        raise ValueError('Depth hash mismatch')
                    seen.add(m.name)
            if seen != expected.keys():
                raise ValueError('Missing depth frames')
        videos = [m for m in members if m.name.endswith('.webm')]
        if len(videos) != 1 or b'V_VP9' not in tar.extractfile(videos[0]).read(10000):
            raise ValueError('Missing VP9 video')
        dest.mkdir(parents=True, exist_ok=True)
        tar.extractall(dest, members=members, filter='data')


def new_state():
    archive = local_path(os.environ.get('ARCHIVE', HERE / 'roxy-cloud-bundle-76.tar.gz'))
    digest, total = validate_archive(archive)
    count = positive('PODS', 5, True)
    if count > 32:
        raise ValueError('PODS maximum is 32')
    quality = os.environ.get('FLY_MODE', 'final')
    if quality not in ('draft', 'final'):
        raise ValueError('FLY_MODE must be draft or final')
    subset = None
    if os.environ.get('FRAMES'):
        if quality!='final' or not re.fullmatch(r'[0-9]+-[0-9]+',os.environ['FRAMES']):raise ValueError('FRAMES requires final quality and a-b')
        subset = list(map(int,os.environ['FRAMES'].split('-')))
        if not 1<=subset[0]<=subset[1]<=total:raise ValueError('FRAMES outside timeline')
    workers = os.environ.get('WORKERS','auto');maximum = positive('MAX_WORKERS',4,True)
    if workers!='auto' and (not workers.isdigit() or not 1<=int(workers)<=maximum):raise ValueError('Invalid WORKERS')
    gpus = [g.strip() for g in os.environ.get('GPUS', DEFAULT_GPUS).split(',') if g.strip()]
    if not gpus:
        raise ValueError('GPUS cannot be empty')
    estimate = positive('ESTIMATE_HOURS', max(1.5, 4 / count))
    max_rate = positive('GPU_HOURLY_ESTIMATE', 1.25)
    minimum = max(5, count * estimate * max_rate * 1.25 + .5, positive('MIN_BALANCE', .01))
    name = ('dinkdonk-m77-test-' if subset else 'dinkdonk-m77-') + time.strftime('%Y%m%d-%H%M%S-') + uuid.uuid4().hex[:8]
    return {'version': 1, 'run': name, 'archive': str(archive), 'sha256': digest, 'total': total,
            'quality': quality, 'requested': count, 'gpus': gpus, 'pin': os.environ.get('PIN_DC'),
            'image': os.environ.get('IMAGE', 'runpod/base:0.7.0-ubuntu2004'), 'minimum_balance': minimum,
            'volume_gb': max(20, positive('VOLUME_GB', 20, True)), 'pods': [], 'volume': None,
            'remote': ('/vol/multi77/tests/' if subset else '/vol/multi77/') + name, 'hard_seconds': int(positive('MAX_HOURS', 6) * 3600),
            'startup_seconds': int(positive('BOOT_MIN', 30) * 60), 'chunk': positive('CHUNK', 8, True),
            'lease': positive('LEASE_SECONDS', 180), 'log': str(HERE / (name + '.log')),
            'frames':subset,'workers':workers,'max_workers':maximum,'tune_seconds':positive('TUNE_SECONDS',20),
            'topup_seconds':positive('TOPUP_SECONDS',240),'telemetry_seconds':positive('TELEMETRY_SECONDS',120),
            'outdir': str(local_path(os.environ.get('OUTDIR', HERE / (name + '-result'))))}


def dry_run():
    s = new_state()
    inventory = read(local_path(os.environ['INVENTORY'])) if os.environ.get('INVENTORY') else [
        {'id': 'SIMULATED-DC-A', 'gpuAvailability': [
            {'gpuId': s['gpus'][0], 'stockStatus': 'High', 'availableCount': 2},
            {'gpuId': s['gpus'][min(1, len(s['gpus']) - 1)], 'stockStatus': 'Medium', 'availableCount': 2},
            {'gpuId': s['gpus'][min(2, len(s['gpus']) - 1)], 'stockStatus': 'Low', 'availableCount': 1}]},
        {'id': 'SIMULATED-DC-B', 'gpuAvailability': [
            {'gpuId': s['gpus'][0], 'stockStatus': 'Low', 'availableCount': 1}]}]
    provider = DryProvider(inventory)
    controller = Controller(provider, s)
    print('OFFLINE DRY RUN: synthetic stock/prices; no CLI, SSH or RunPod calls.')
    controller.provision()
    print(json.dumps({'volume_gb': s['volume_gb'], 'dc': s['dc'], 'requested': s['requested'],
                      'gpus': [p['gpu'] for p in s['pods']], 'frames': s['total'] if s['quality'] == 'final' else (s['total'] + 1) // 2,
                      'chunk': s['chunk'], 'minimum_balance': round(s['minimum_balance'], 2),
                      'watchdog_seconds': s['hard_seconds'], 'create_time_guard': True}, indent=2))


def peek(controller, count):
    if not 1 <= count <= 100:
        raise ValueError('peek count must be 1..100')
    # Read-only: no reconcile/save/cleanup/provision. Discover via recorded pods.
    s = controller.state
    dest = local_path(os.environ.get('PEEK_DEST', HERE / (s['run'] + '-peek')))
    script = '''import json,sys,hashlib
from pathlib import Path
out=Path(sys.argv[1])/sys.argv[3];rows=[]
for p in out.glob('[0-9][0-9][0-9][0-9][0-9].json'):
 try:
  r=json.loads(p.read_text());i=int(p.stem)
  if r['global_frame']!=i:continue
  files=[p.with_suffix('.png'),p.with_name(p.stem+'_depth.png')]
  if all(hashlib.sha256(f.read_bytes()).hexdigest()==r[k] for f,k in zip(files,['color_sha256','depth_sha256'])):rows.append((p.stat().st_mtime_ns,[f.name for f in files]+[p.name]))
 except (OSError,ValueError,KeyError):pass
print(json.dumps([names for _,names in sorted(rows)[-int(sys.argv[2]):]]))
'''
    for pod in s['pods']:
        if pod.get('deleted'):
            continue
        try:
            folder = 'test-frames' if s.get('frames') else 'frames'
            command = 'python3 - ' + shlex.quote(s['remote']) + ' ' + str(count)+' '+folder
            rows = json.loads(controller.provider.ssh(pod['id'], command, timeout=180, data=script))
            dest.mkdir(parents=True, exist_ok=True)
            for names in rows:
                for name in names:
                    if not re.fullmatch(r'[0-9]{5}(_depth)?\.(png|json)', name):
                        raise ValueError('Invalid peek path')
                    tmp = dest / (name + '.partial')
                    controller.provider.copy(pod['id'], tmp, s['remote'] + '/'+folder+'/' + name)
                    os.replace(tmp, dest / name)
            print(f'Copied {len(rows)} frame pairs to {dest}; cloud run untouched.')
            return
        except (RuntimeError, subprocess.TimeoutExpired):
            continue
    raise RuntimeError('No reachable reader for shared volume; peek left run untouched')


def main():
    mode = sys.argv[1]
    if os.environ.get('DRY_RUN') == '1' and mode == 'multi':
        dry_run()
        return
    path = local_path(os.environ.get('MULTI_STATE', HERE / 'cloud-state-multi.json'))
    if mode in ('multi-peek', 'peek'):
        state = read(path)
        if not state:
            raise RuntimeError('No multi state')
        peek(Controller(Provider(), state), int(sys.argv[2]) if len(sys.argv) > 2 else 6)
        return
    with controller_lock(path.with_suffix('.lock')):
        state = read(path)
        if mode == 'multi-cleanup':
            if not state:
                print('No multi state; nothing to clean.')
                return
            controller = Controller(Provider(), state, path)
            if not controller.cleanup(cancel=True):
                raise RuntimeError('Cleanup incomplete; kept resources are listed above')
            return
        if state and os.environ.get('MULTI_RESUME') != '1':
            raise RuntimeError('Existing multi state: use MULTI_RESUME=1 or multi-cleanup')
        if state:
            if 'FRAMES' in os.environ:
                supplied = list(map(int,os.environ['FRAMES'].split('-'))) if os.environ['FRAMES'] else None
                if supplied!=state.get('frames'):
                    raise RuntimeError('Resume test range differs; use a separate MULTI_STATE and OUTDIR')
            if validate_archive(Path(state['archive']))[0] != state['sha256']:
                raise RuntimeError('Resume archive changed')
            if 'OUTDIR' in os.environ and not state.get('home'):
                state['outdir'] = str(local_path(os.environ['OUTDIR']))
        else:
            state = new_state()
        destination = Path(state['outdir'])
        if not state.get('home') and destination.exists() and (not destination.is_dir() or any(destination.iterdir())):
            raise RuntimeError('OUTDIR must be empty/new; set a fresh OUTDIR before starting or resuming')
        controller = Controller(Provider(), state, path)
        controller.save()
        try:
            if state.get('home'):
                home = state['home']
                if not Path(home['archive']).is_file() or sha(home['archive']) != home['sha256']:
                    raise RuntimeError('Previously collected archive missing/changed; volume retained')
                if not controller.cleanup():
                    raise RuntimeError('Result is home; cleanup incomplete, retry multi-cleanup')
                return
            if os.environ.get('MULTI_RESUME') == '1':
                inventory, _ = controller.reconcile()
                if state.get('pending_pods') or state.get('pending_volume'):
                    raise RuntimeError('Unconfirmed create request; reconcile with multi-cleanup before resuming')
                # Collect from any surviving pod before renting replacements.
                for pod in state['pods']:
                    current = inventory.get(pod['id'])
                    if current is None:
                        pod['deleted'] = True
                        continue
                    status = None
                    try:
                        status = controller.remote_status(pod['id'])
                    except (RuntimeError, subprocess.TimeoutExpired):
                        if str(current.get('runtimeStatus', '')).lower() not in ('stopped', 'exited', 'terminated'):
                            continue
                        controller.provider.api('pod', 'remove', pod['id'])
                        pod['deleted'] = True
                    if status and status['success']:
                        controller.collect(pod['id'], status['success'])
                        if not controller.cleanup():
                            raise RuntimeError('Result is home; cleanup incomplete, retry multi-cleanup')
                        return
                controller.save()
            if not state.get('volume'):controller.provision()
            controller.start_pending()
            controller.monitor()
        except BaseException:
            controller.say('Helper exiting; independent pod guardians remain armed. Results/state retained.')
            try:
                controller.cleanup(cancel=True)
            except Exception:
                controller.say('Cleanup could not verify all resources; run multi-cleanup later')
            raise
        finally:
            if hasattr(controller,'_pool'):controller._pool.shutdown(wait=False,cancel_futures=True)


if __name__ == '__main__':
    signal.signal(signal.SIGTERM, lambda *_: (_ for _ in ()).throw(KeyboardInterrupt()))
    try:
        main()
    except (Exception, KeyboardInterrupt) as exc:
        print('MULTI: ' + (str(exc) or 'interrupted'), file=sys.stderr)
        sys.exit(130 if isinstance(exc, KeyboardInterrupt) else 1)
