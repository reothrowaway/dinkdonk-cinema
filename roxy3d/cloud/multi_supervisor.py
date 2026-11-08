"""One pod's RUNNING process: worker groups, measured tuning and telemetry.

Standard library only; runs on the base image's Python, before Blender starts.
No provider calls. Guardian owns the hard/startup caps and all process groups.
"""
import sys
sys.dont_write_bytecode = True
import collections
import json
import os
from pathlib import Path
import signal
import subprocess
import time
from multi_queue import atomic, read


def gpu_sample():
    try:
        r = subprocess.run(['nvidia-smi', '--query-gpu=utilization.gpu,memory.used,memory.total',
                            '--format=csv,noheader,nounits'], capture_output=True, text=True, timeout=5, check=True)
        util, used, total = [float(x.strip()) for x in r.stdout.splitlines()[0].split(',')]
        apps = subprocess.run(['nvidia-smi', '--query-compute-apps=pid,used_gpu_memory',
                               '--format=csv,noheader,nounits'], capture_output=True, text=True, timeout=5, check=True)
        memory = {}
        for line in apps.stdout.splitlines():
            try:
                pid, mb = line.split(',');memory[int(pid.strip())] = float(mb.strip())
            except ValueError:
                pass
        return {'gpu_pct': util, 'used_mb': used, 'total_mb': total, 'process_mb': memory}
    except (OSError, ValueError, IndexError, subprocess.SubprocessError):
        return None  # Missing telemetry never authorizes an extra worker.


class Tuner:
    def __init__(self, workers='auto', maximum=4, cores=None, window=20):
        self.cores = cores or os.cpu_count() or 1
        self.maximum = min(int(maximum), self.cores)
        self.auto = workers == 'auto'
        self.initial = min(2, self.maximum) if self.auto else int(workers)
        if self.maximum < 1 or not 1 <= self.initial <= self.maximum:
            raise ValueError('WORKERS must be auto or 1..min(MAX_WORKERS, CPU cores)')
        self.window = float(window);self.samples = [];self.started = None;self.peak_mb = 0
        self.last_frames = 0

    def observe(self, now, frames, live, sample, pending=True):
        if sample:
            per_worker = max(sample.get('process_mb', {}).values(), default=0)
            if not per_worker and live:
                per_worker = sample['used_mb'] / live
            self.peak_mb = max(self.peak_mb, per_worker)
        if not self.auto:
            return None
        if self.started is None and frames > self.last_frames:
            self.started = now;self.samples = []
        if self.started is None:
            return None
        if sample:
            self.samples.append(sample)
        if now - self.started < self.window:
            return None
        samples = self.samples;self.samples = [];self.started = None;self.last_frames = frames
        if not samples:
            return {'add': False, 'reason': 'GPU telemetry unavailable'}
        busy = sum(s['gpu_pct'] for s in samples) / len(samples)
        latest = samples[-1];reason = 'GPU busy >= 90%'
        add = False
        if not pending:
            reason = 'No pending chunks'
        elif live >= self.maximum:
            reason = 'Worker/CPU cap'
        elif self.peak_mb <= 0:
            reason = 'Per-worker VRAM not measured'
        elif max(s['used_mb'] for s in samples) + self.peak_mb * 1.05 > latest['total_mb'] * .85:
            reason = 'Projected VRAM exceeds 85%'
        elif busy < 90:
            add = True;reason = 'GPU below 90%; VRAM and CPU allow another worker'
        return {'add': add, 'reason': reason, 'gpu_pct': round(busy, 1), 'worker_peak_mb': round(self.peak_mb, 1)}


class Supervisor:
    def __init__(self, command):
        self.command = command;self.base = Path(os.environ.get('MULTI_LOCAL_BASE', '/workspace/multi75'))
        self.run = Path(os.environ['MULTI_ROOT']);self.pod = os.environ.get('RUNPOD_POD_ID', 'local')
        self.tuner = Tuner(os.environ.get('WORKERS', 'auto'), int(os.environ.get('MAX_WORKERS', '4')),
                           window=float(os.environ.get('TUNE_SECONDS', '20')))
        self.jobs = [];self.stopping = False;self.started = time.time();self.low_since = None;self.last_warning = 0
        self.frame_history = collections.deque([(self.started, 0)])
        self.gpu_history = collections.deque();self.serial = 0;self.restart_count = 0
        (self.base/'worker-pids').mkdir(parents=True, exist_ok=True)
        (self.run/'logs').mkdir(parents=True, exist_ok=True)

    def log(self, **row):
        row['time'] = time.time();row['pod'] = self.pod
        print(json.dumps(row, sort_keys=True), flush=True)

    def spawn(self):
        if self.stopping or (self.base/'FENCED').exists():
            return
        self.serial += 1;name = self.pod + '-w' + str(self.serial)
        env = {**os.environ, 'MULTI_WORKER_ID': name, 'MULTI_POD_ID': self.pod}
        cache = self.base/'worker-cache'/name
        for key, folder in [('TEMP','temp'),('TMP','temp'),('TMPDIR','temp'),('BLENDER_USER_CONFIG','config'),
                            ('BLENDER_USER_DATAFILES','datafiles'),('BLENDER_USER_SCRIPTS','scripts'),
                            ('BLENDER_USER_EXTENSIONS','extensions')]:
            p = cache/folder;p.mkdir(parents=True, exist_ok=True);env[key] = str(p)
        log = (self.run/'logs'/(name+'.log')).open('ab')
        kwargs = {'start_new_session': True} if os.name != 'nt' else {'creationflags': subprocess.CREATE_NEW_PROCESS_GROUP}
        process = subprocess.Popen(self.command, env=env, stdout=log, stderr=subprocess.STDOUT, **kwargs)
        pidfile = self.base/'worker-pids'/(name+'.pid')
        pidfile.write_text(str(process.pid)+'\n')
        self.jobs.append((name, process, log, pidfile))
        self.log(event='worker_started', worker=name, pid=process.pid)
        if (self.base/'FENCED').exists():
            self.stopping = True  # Guardian fenced the pod concurrently with spawn.

    def terminate(self, *_):
        self.stopping = True

    def fence(self):
        for _, p, _, _ in self.jobs:
            if p.poll() is None:
                try:
                    if os.name == 'nt':p.terminate()
                    else:os.killpg(p.pid, signal.SIGTERM)
                except ProcessLookupError:pass
        deadline = time.monotonic()+5
        for _, p, log, pidfile in self.jobs:
            try:p.wait(timeout=max(.01, deadline-time.monotonic()))
            except subprocess.TimeoutExpired:
                if os.name == 'nt':p.kill()
                else:
                    try:os.killpg(p.pid, signal.SIGKILL)
                    except ProcessLookupError:pass
                p.wait()
            log.close();pidfile.unlink(missing_ok=True)

    def main(self):
        signal.signal(signal.SIGTERM, self.terminate);signal.signal(signal.SIGINT, self.terminate)
        if (self.base/'FENCED').exists():return 124
        (self.base/'SUPERVISOR_READY').touch()
        self.log(event='tuning_config', workers=os.environ.get('WORKERS','auto'), initial=self.tuner.initial,
                 maximum=self.tuner.maximum, window_seconds=self.tuner.window)
        try:
            for _ in range(self.tuner.initial):self.spawn()
            while self.jobs and not self.stopping:
                now = time.time();live = sum(p.poll() is None for _,p,_,_ in self.jobs)
                for _,p,_,pidfile in self.jobs:
                    if p.poll() is not None:pidfile.unlink(missing_ok=True)
                workers = [read(self.run/'queue/workers'/(n+'.json'), {}) for n,_,_,_ in self.jobs]
                frames = sum(w.get('frames', 0) for w in workers)
                self.frame_history.append((now,frames))
                while len(self.frame_history)>2 and self.frame_history[1][0]<now-60:self.frame_history.popleft()
                t0,f0 = self.frame_history[0];rate = 60*(frames-f0)/max(1,now-t0)
                sample = gpu_sample()
                if sample:self.gpu_history.append((now,sample['gpu_pct']))
                while self.gpu_history and self.gpu_history[0][0]<now-20:self.gpu_history.popleft()
                busy = sum(v for _,v in self.gpu_history)/len(self.gpu_history) if self.gpu_history else None
                if busy is not None and busy<70 and now-self.started>60 and live:
                    self.low_since = self.low_since or now
                else:self.low_since = None
                if self.low_since and now-self.low_since>=300 and now-self.last_warning>=300:
                    self.log(event='warning', reason='GPU below 70% for five minutes after warm-up', gpu_pct=busy);self.last_warning=now
                success = (self.run/'queue/SUCCESS.json').exists()
                state = 'complete' if success else 'working' if live else 'failed' if any(p.returncode for _,p,_,_ in self.jobs) else 'idle'
                pending = any((self.run/'queue/pending').glob('*.json'))
                retry = state=='failed' and not success and self.restart_count<2 and pending
                if retry:state='working' # Not retired while a bounded retry is about to start.
                atomic(self.run/'telemetry'/(self.pod+'.json'), {'pod':self.pod,'updated':now,'state':state,'workers':live,
                       'gpu_pct':busy,'vram_used_mb':sample['used_mb'] if sample else None,
                       'vram_total_mb':sample['total_mb'] if sample else None,'frames_per_minute':rate,'low_since':self.low_since})
                if success:(self.base/'COMPLETE').touch()
                if not live:
                    if retry:
                        self.restart_count += 1;self.log(event='restart', reason='All workers failed; bounded retry');self.spawn();continue
                    return 1 if state=='failed' else 0
                decision = self.tuner.observe(now,frames,live,sample,pending and not success)
                if decision:
                    self.log(event='tune', live_workers=live, **decision)
                    if decision['add']:self.spawn()
                if (self.base/'FENCED').exists():self.stopping=True
                time.sleep(float(os.environ.get('SUPERVISOR_POLL','2')))
            return 124
        finally:self.fence()


if __name__=='__main__':
    command = sys.argv[sys.argv.index('--')+1:]
    if not command:raise ValueError('Worker command required after --')
    sys.exit(Supervisor(command).main())
