"""One local supervisor, two Blender workers, tiny v8 frames. Never provisions."""
import sys
sys.dont_write_bytecode=True
import json,os,subprocess,tarfile,tempfile
from pathlib import Path
from multi import validate_archive,verify_unpack
from multi_queue import read,sha,atomic
HERE=Path(__file__).resolve().parent
def main():
    archive=HERE/'roxy-cloud-bundle-76.tar.gz';validate_archive(archive)
    base=HERE/'qa77';base.mkdir(exist_ok=True);root=Path(tempfile.mkdtemp(prefix='blender-',dir=base))
    with tarfile.open(archive,'r:gz') as tar:tar.extractall(root,filter='data')
    volume=root/'volume';pod=root/'pod';pod.mkdir()
    env={**os.environ,'BUNDLE_ROOT':str(root/'bundle'),'MULTI_ROOT':str(volume),'MULTI_LOCAL_BASE':str(pod),
         'MULTI_LOCAL_SMOKE':'1','RUNPOD_POD_ID':'local77','WORKERS':'2','MAX_WORKERS':'2','FLY_MODE':'final',
         'CHUNK':'1','LEASE_SECONDS':'15','POLL_SECONDS':'.2','SUPERVISOR_POLL':'.5','PYTHONDONTWRITEBYTECODE':'1'}
    env.pop('FRAMES',None)
    for name,folder in [('CUDA_CACHE_PATH','cuda'),('OPTIX_CACHE_PATH','optix'),('XDG_CACHE_HOME','xdg')]:
        p=root/'cache'/folder;p.mkdir(parents=True,exist_ok=True);env[name]=str(p)
    blender=HERE.parent.parent/'tools/blender-5.2.3-windows-x64/blender.exe'
    command=[sys.executable,'-B',str(HERE/'multi_supervisor.py'),'--',str(blender),'-b','--factory-startup','--threads','2',
             '--python-exit-code','1','--python',str(HERE/'multi_blender.py')]
    with (root/'supervisor.log').open('wb') as log:
        subprocess.run(command,env=env,stdout=log,stderr=subprocess.STDOUT,check=True,timeout=600)
    result=read(volume/'queue/SUCCESS.json');assert result['frames']==8
    verify_unpack(volume/'out10.tar.gz',root/'unpacked',result)
    workers=[read(p) for p in (volume/'queue/workers').glob('*.json')]
    assert {w['worker'] for w in workers}=={'local77-w1','local77-w2'}
    assert {w['pod'] for w in workers}=={'local77'}
    assert (pod/'COMPLETE').exists() and not list((pod/'worker-pids').glob('*.pid'))
    before={p.name:(sha(p),p.stat().st_mtime_ns) for p in (volume/'smoke-frames').glob('*.png')}
    with (root/'resume.log').open('wb') as log:subprocess.run(command,env=env,stdout=log,stderr=subprocess.STDOUT,check=True,timeout=120)
    assert before=={p.name:(sha(p),p.stat().st_mtime_ns) for p in (volume/'smoke-frames').glob('*.png')}
    package=read(volume/'smoke-frames/package.json');v=package['video']
    report={'workers':2,'one_pod':True,'frames':8,'resolution':[160,90],'fps':v['fps'],
            'decoded_samples':len(v['decoded_samples']),'max_decoded_mean_rgb_error_255':max(x['mean_rgb_error_255'] for x in v['decoded_samples']),
            'resume_unchanged':True,'all_workers_exited':True,'complete_marker':True,'root':str(root)}
    atomic(base/'blender-smoke.json',report);print(json.dumps(report,indent=2))
if __name__=='__main__':main()
