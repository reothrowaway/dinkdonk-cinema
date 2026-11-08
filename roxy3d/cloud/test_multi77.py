"""Offline-only supervisor/controller regressions, all state under qa77 temp dirs."""
import sys
sys.dont_write_bytecode=True
import contextlib,io,json,multiprocessing as mp,os,subprocess,tarfile,tempfile,time,unittest
from pathlib import Path
from unittest.mock import patch,Mock
import multi as m
from multi_supervisor import Tuner,Supervisor,gpu_sample
from multi_blender import selection
from multi_queue import atomic,read,sha,progress
import test_multi75 as old
HERE=Path(__file__).resolve().parent
BASE=HERE/'qa77';BASE.mkdir(exist_ok=True)
ROOT=Path(tempfile.mkdtemp(prefix='offline-',dir=BASE))

def state():
    with patch.dict(os.environ,{'ARCHIVE':str(HERE/'roxy-cloud-bundle-76.tar.gz'),'PODS':'5','FLY_MODE':'final'},clear=True):
        s=m.new_state()
    s.update(log=str(ROOT/(s['run']+'.log')),outdir=str(ROOT/(s['run']+'-out')))
    return s

def sample(util=40,used=9000,total=24000,worker=4500):
    return {'gpu_pct':util,'used_mb':used,'total_mb':total,'process_mb':{10:worker}}

class Tests(unittest.TestCase):
    def test_supervisor_auto_workers_crash_reclaim(self):
        folder=ROOT/'supervisor';folder.mkdir();base=folder/'pod';volume=folder/'volume'
        env={'MULTI_ROOT':str(volume),'MULTI_LOCAL_BASE':str(base),'RUNPOD_POD_ID':'fixture-pod',
             'WORKERS':'auto','MAX_WORKERS':'4','TUNE_SECONDS':'.3','SUPERVISOR_POLL':'.05'}
        with patch.dict(os.environ,env):
            supervisor=Supervisor([sys.executable,'-B',str(HERE/'fixture_worker77.py')]);events=[]
            supervisor.log=lambda **row:events.append(row)
            max_live=[0]
            def reading():
                live=sum(p.poll() is None for _,p,_,_ in supervisor.jobs);max_live[0]=max(max_live[0],live)
                return sample(96 if live==4 else 40,200+4500*live)
            with patch('multi_supervisor.gpu_sample',side_effect=reading),patch('multi_supervisor.signal.signal'):
                self.assertEqual(supervisor.main(),0)
        self.assertEqual(max_live[0],4)
        self.assertTrue(any(e.get('add') for e in events))
        success=read(volume/'queue/SUCCESS.json');self.assertEqual(success['frames'],64)
        self.assertFalse(success['by'].endswith('-w1'))
        self.assertEqual(len(list(volume.glob('*.rendered'))),64)
        self.assertEqual({w['pod'] for w in progress(volume/'queue')['workers']},{'fixture-pod'})
        self.assertTrue((base/'COMPLETE').exists());self.assertFalse(list((base/'worker-pids').glob('*.pid')))

    def test_tuner(self):
        t=Tuner('auto',4,32);self.assertEqual(t.initial,2)
        self.assertIsNone(t.observe(0,1,2,sample()))
        self.assertTrue(t.observe(20,2,2,sample())['add'])
        t.observe(21,3,3,sample(96,14000));self.assertFalse(t.observe(41,4,3,sample(96,14000))['add'])
        t.observe(42,5,3,sample(60,18000,worker=6000));self.assertIn('VRAM',t.observe(62,6,3,sample(60,18000,worker=6000))['reason'])
        t48=Tuner('auto',4,32);t48.observe(0,1,2,sample(40,18000,48000,9000));self.assertTrue(t48.observe(20,2,2,sample(40,18000,48000,9000))['add'])
        cap=Tuner('auto',4,2);cap.observe(0,1,2,sample());self.assertFalse(cap.observe(20,2,2,sample())['add'])
        t.observe(63,7,4,sample());self.assertIn('cap',t.observe(83,8,4,sample())['reason'])
        fixed=Tuner('3',4,32);self.assertEqual(fixed.initial,3);self.assertIsNone(fixed.observe(20,5,3,sample()))
        absent=Tuner();absent.observe(0,1,2,None);self.assertFalse(absent.observe(20,2,2,None)['add'])
        no_work=Tuner();no_work.observe(0,1,2,sample());self.assertFalse(no_work.observe(20,2,2,sample(),False)['add'])
        with self.assertRaises(ValueError):Tuner('5',4,32)

    def test_gpu_parser_and_fencing(self):
        with patch('multi_supervisor.subprocess.run',side_effect=[Mock(stdout='68, 9200, 24564\n'),Mock(stdout='101, 4600\n102, 4600\n')]):
            self.assertEqual(gpu_sample()['process_mb'],{101:4600,102:4600})
        with patch('multi_supervisor.subprocess.run',side_effect=FileNotFoundError):self.assertIsNone(gpu_sample())
        s=Supervisor.__new__(Supervisor);s.jobs=[]
        for pid in [101,102]:
            p=Mock(pid=pid);p.poll.return_value=None;p.wait.return_value=0
            s.jobs.append(('w'+str(pid),p,Mock(),Mock()))
        s.jobs[1][1].wait.side_effect=[subprocess.TimeoutExpired('worker',5),0]
        with patch('multi_supervisor.os.name','posix'),patch('multi_supervisor.os.killpg',create=True) as kill,patch('multi_supervisor.signal.SIGKILL',9,create=True):
            s.fence()
        signals=[(args[0][0],int(args[0][1])) for args in kill.call_args_list]
        self.assertIn((101,15),signals);self.assertIn((102,15),signals);self.assertIn((102,9),signals)

    def test_crlf_and_stock(self):
        with patch('multi.subprocess.run',return_value=Mock(returncode=0,stdout=b'OK\n',stderr=b'')) as run:
            self.assertEqual(m.run(['offline'],data='a  file\n'),'OK\n')
            self.assertEqual(run.call_args.kwargs['input'],b'a  file\n');self.assertNotIn('text',run.call_args.kwargs)
        inventory=[{'id':'low','gpuAvailability':[{'gpuId':'g1','stockStatus':'Low'},{'gpuId':'g2','stockStatus':'Low'}]},
                   {'id':'high','gpuAvailability':[{'gpuId':'g1','stockStatus':'High'}]}]
        self.assertEqual(m.rank_centers(inventory,['g1','g2'],5)[0][0],'high')
        inventory[0]['gpuAvailability'][0]['availableCount']=6
        self.assertEqual(m.rank_centers(inventory,['g1','g2'],5)[0][0],'low')

    def test_topup_persists_every_pod_and_credit(self):
        s=state();g=s['gpus'][0]
        inventory=[{'id':'same-dc','gpuAvailability':[{'gpuId':g,'stockStatus':'High','availableCount':2}]}]
        class Provider(m.DryProvider):
            def api(self,*args):
                if args[:2]==('pod','create'):
                    snapshot=read(path);name=args[args.index('--name')+1]
                    assert name in snapshot['pending_pods']
                    assert args[args.index('--data-center-ids')+1]==s['dc']
                return super().api(*args)
        path=ROOT/'topup-state.json';p=Provider(inventory);c=m.Controller(p,s,path);c.save();c.provision()
        self.assertEqual(len(s['pods']),2)
        p.stock[(s['dc'],g)]=3;c.top_up({'done':20,'total':100})
        self.assertEqual(len(s['pods']),5);self.assertEqual(len(read(path)['pods']),5)
        self.assertEqual(len(p.volumes),1)
        s['pods'][-1]['idle']=True;before=len(p.pods)
        self.assertFalse(c.top_up({'done':75,'total':100}));self.assertEqual(len(p.pods),before)
        p.balance=0;self.assertFalse(c.top_up({'done':20,'total':100},True));self.assertEqual(len(p.pods),before)
        # A lost top-up response is adopted by its persisted exact run name.
        p.balance=100;p.stock[(s['dc'],g)]=1
        original=p.api
        def lost(*args):
            result=original(*args)
            if args[:2]==('pod','create'):raise RuntimeError('lost response')
            return result
        with patch.object(p,'api',side_effect=lost):self.assertTrue(c.top_up({'done':20,'total':100},True))
        self.assertEqual(len(s['pods']),6);self.assertEqual(s['pending_pods'],[])

    def test_reader_and_exited_cleanup(self):
        s=state();s.update(volume='v',dc='dc',reader_gpus=['CPU'])
        class Provider:
            def __init__(self):self.calls=[];self.pods=[]
            def api(self,*args):
                self.calls.append(args)
                if args==('user',):return {'clientBalance':10}
                if args[:2]==('pod','create'):
                    name=args[args.index('--name')+1];assert name in read(path)['pending_pods']
                    p={'id':'reader','name':name};self.pods.append(p);return p
                raise AssertionError(args)
            def ssh(self,*args,**kwargs):return ''
            def copy(self,*args,**kwargs):pass
        path=ROOT/'reader-state.json';p=Provider();c=m.Controller(p,s,path);c.save()
        pod=c.ensure_reader();self.assertTrue(pod['reader']);self.assertEqual(read(path)['pods'][0]['id'],'reader')
        args=next(a for a in p.calls if a[:2]==('pod','create'));self.assertIn('--compute-type',args)
        env=json.loads(args[args.index('--env')+1]);self.assertEqual(env['MULTI_READER'],'1');c.prepare_reader(pod)
        s={'run':'test-run','volume':'v','pods':[{'id':'a','name':'test-run-p1'},{'id':'b','name':'test-run-r1','reader':True}]}
        archive=ROOT/'home';archive.write_bytes(b'verified new fixture');s['home']={'archive':str(archive),'sha256':sha(archive)}
        class Exited(old.CleanupProvider):
            def api(self,*args):
                result=super().api(*args)
                if args[:2]==('pod','list'):
                    for pod in result:
                        if pod['id']=='b':pod['runtimeStatus']='EXITED'
                return result
        p=Exited(s,['a'],['b']);self.assertTrue(m.Controller(p,s).cleanup());self.assertEqual(p.deleted,['a','b','v'])

    def test_isolated_selection(self):
        indices,subset=selection(1504,'final',False,'1100-1160')
        self.assertEqual(indices,list(range(1100,1161)));self.assertEqual(subset,[1100,1160])
        self.assertEqual(len(selection(1504,'final',False)[0]),1504)
        for text in ['0-20','1160-1100','1-1505','abc']:
            with self.assertRaises(ValueError):selection(1504,'final',False,text)
        with self.assertRaises(ValueError):selection(1504,'draft',False,'1-20')
        with patch.dict(os.environ,{'ARCHIVE':str(HERE/'roxy-cloud-bundle-76.tar.gz'),'FRAMES':'1100-1160','FLY_MODE':'final'},clear=True):
            s=m.new_state()
        self.assertIn('/tests/',s['remote']);self.assertIn('-test-',s['run']);self.assertEqual(s['frames'],[1100,1160])
        s.update(dc='test-dc',volume='test-volume')
        args=m.pod_args(s,'g','name');env=json.loads(args[args.index('--env')+1])
        self.assertEqual(env['WORKERS'],'auto');self.assertEqual(env['FRAMES'],'1100-1160')

    def test_subset_collection_guards(self):
        # Metadata-only negative fixtures stop before any image/video extraction.
        data={'total_frames':2,'quality':'final','production_frames':1504,'global_indices':[1100,1101],
              'frames':[{'global_frame':i,'resolution':[1920,1080]} for i in [1100,1101]],
              'test_range':[1100,1101],'test_only':True,'smoke':False}
        def archive(row):
            p=ROOT/'subset-negative.tar.gz';payload=json.dumps(row).encode()
            with tarfile.open(p,'w:gz') as tar:
                info=tarfile.TarInfo('fixture/frames.json');info.size=len(payload);tar.addfile(info,io.BytesIO(payload))
            return p
        result={'frames':2,'quality':'final'}
        with self.assertRaisesRegex(ValueError,'test range'):m.verify_unpack(archive(data),ROOT/'reject-1',result)
        result['test_range']=[1100,1101]
        data['smoke']=True
        with self.assertRaisesRegex(ValueError,'test range'):m.verify_unpack(archive(data),ROOT/'reject-2',result)
        data['smoke']=False;data['frames'][0]['resolution']=[160,90]
        with self.assertRaisesRegex(ValueError,'full final resolution'):m.verify_unpack(archive(data),ROOT/'reject-3',result)

    def test_transient_inventory_does_not_kill_work(self):
        s=state();s.update(pods=[{'id':'p'}],hard_seconds=300)
        class C(m.Controller):
            count=0
            def poll_pending(self):pass
            def start_pending(self):pass
            def reconcile_runtime(self):raise RuntimeError('temporary inventory failure')
            def remote_status(self,pod):
                self.count+=1
                return {'success':{'frames':100} if self.count>1 else None,'done':20,'total':100,
                        'eta_seconds':80,'pods':[],'workers':[]}
            def collect(self,pod,result):self.collected=pod
            def cleanup(self):return True
        c=C(None,s)
        with patch('multi.time.sleep'):c.monitor()
        self.assertEqual(c.collected,'p')

    def test_monitor_replaces_and_collects_via_reader(self):
        class Clock:
            now=1000.
            def monotonic(self):return self.now
            def sleep(self,seconds):self.now+=seconds
        clock=Clock();s=state();s.update(pods=[],volume='v',hard_seconds=1000,topup_seconds=240)
        class C(m.Controller):
            def reconcile_runtime(self):pass
            def poll_pending(self):pass
            def start_pending(self):pass
            def ensure_reader(self):
                if not self.state['pods']:self.state['pods'].append({'id':'r','reader':True})
            def top_up(self,status,force=False):
                assert force and status['done']<status['total'];self.replaced=True
                self.state['pods'].append({'id':'gpu','prepared':True});return True
            def remote_status(self,pod):
                if getattr(self,'replaced',False):return {'success':{'frames':1504}}
                return {'success':None,'done':10,'total':100,'eta_seconds':100,'workers':[],'pods':[]}
            def collect(self,pod,result):self.collected=pod
            def cleanup(self):return True
        c=C(None,s)
        with patch('multi.time.monotonic',clock.monotonic),patch('multi.time.sleep',clock.sleep):c.monitor()
        self.assertTrue(c.replaced);self.assertEqual(c.collected,'r')
        self.assertLess(clock.now,1240) # Recovery doesn't wait four minutes with zero workers.
        class Complete(C):
            def remote_status(self,pod):return {'success':{'frames':1504}}
            def top_up(self,*args,**kwargs):raise AssertionError('Rented renderers before checking SUCCESS')
        s=state();s.update(pods=[],volume='v',hard_seconds=1000)
        c=Complete(None,s)
        with patch('multi.time.monotonic',clock.monotonic),patch('multi.time.sleep',clock.sleep):c.monitor()
        self.assertEqual(c.collected,'r')

    def test_monitor_topup_interval_and_all_workers(self):
        class Clock:
            now=1000.
            def monotonic(self):return self.now
            def sleep(self,seconds):self.now+=seconds
        clock=Clock();s=state();s.update(pods=[{'id':'p'}],volume='v',hard_seconds=600,requested=2)
        class P:
            def api(self,*args):raise AssertionError('An idle first worker retired its still-busy pod')
        class C(m.Controller):
            def reconcile_runtime(self):pass
            def poll_pending(self):pass
            def start_pending(self):pass
            def remote_status(self,pod):
                if getattr(self,'added',False):return {'success':{}}
                return {'success':None,'done':20,'total':100,'eta_seconds':80,'pods':[],
                        'workers':[{'worker':'p-w1','pod':'p','state':'idle'},{'worker':'p-w2','pod':'p','state':'working'}]}
            def top_up(self,status,force=False):
                assert clock.now>=1240;self.added=True
            def collect(self,*args):pass
            def cleanup(self):return True
        c=C(P(),s)
        # Success must be truthy, like the production result object.
        original=c.remote_status
        def status(pod):
            r=original(pod)
            if r.get('success')=={}:r['success']={'frames':100}
            return r
        with patch.object(c,'remote_status',side_effect=status),patch('multi.time.monotonic',clock.monotonic),patch('multi.time.sleep',clock.sleep):c.monitor()
        self.assertTrue(c.added)

    def test_telemetry_warning(self):
        s=state();c=m.Controller(None,s)
        t={'pod':'p','updated':time.time(),'workers':4,'frames_per_minute':25,'gpu_pct':65,
           'vram_used_mb':18400,'vram_total_mb':24000,'low_since':time.time()-301}
        with patch.object(c,'say') as say:line=c.telemetry_line({'pods':[t]})
        self.assertIn('4 workers',line);self.assertIn('VRAM',line);self.assertTrue(say.called)


def main():
    # Any accidental construction of the real provider is a hard test failure.
    with patch('multi.Provider',side_effect=AssertionError('Live provider forbidden in tests')):
        suite=unittest.defaultTestLoader.loadTestsFromTestCase(Tests)
        result=unittest.TextTestRunner(verbosity=2).run(suite)
        if not result.wasSuccessful():raise SystemExit(1)
        # Retain the full Brief 75 fault/cleanup suite, redirected into a new temp tree.
        old.HERE=ROOT/'legacy';(old.HERE/'qa75').mkdir(parents=True)
        with contextlib.redirect_stdout(io.StringIO()):old.tests()
    report={'tests':result.testsRun,'passed':True,'legacy_fault_suite':read(old.HERE/'qa75/offline-tests.json'),
            'root':str(ROOT),'live_provider_constructed':False}
    atomic(BASE/'offline-tests.json',report);print(json.dumps(report,indent=2))
if __name__=='__main__':mp.freeze_support();main()
