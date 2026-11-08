"""Offline v8 bundle checks; all generated files and caches stay in fly/v8."""
import sys
sys.dont_write_bytecode=True
import json,os,subprocess,tarfile,tempfile,time
from pathlib import Path
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
from multi import validate_archive,verify_unpack
from multi_queue import atomic,read,sha
P=HERE.parent/'fly/v8';ARCHIVE=HERE/'roxy-cloud-bundle-76.tar.gz'
BLENDER=HERE.parent.parent/'tools/blender-5.2.3-windows-x64/blender.exe'

def workspace(root):
    root.mkdir(parents=True)
    with tarfile.open(ARCHIVE,'r:gz') as tar:tar.extractall(root,filter='data')
    env={**os.environ,'BUNDLE_ROOT':str(root/'bundle'),'PYTHONDONTWRITEBYTECODE':'1'}
    for name,folder in [('TEMP','temp'),('TMP','temp'),('CUDA_CACHE_PATH','cuda'),('OPTIX_CACHE_PATH','optix'),
                        ('BLENDER_USER_CONFIG','config'),('BLENDER_USER_DATAFILES','datafiles'),
                        ('BLENDER_USER_SCRIPTS','scripts'),('BLENDER_USER_EXTENSIONS','extensions'),('XDG_CACHE_HOME','xdg')]:
        cache=root/'cache'/folder;cache.mkdir(parents=True,exist_ok=True);env[name]=str(cache)
    return env

def command(script):return [str(BLENDER),'-b','--factory-startup','--threads','2','--python-exit-code','1','--python',str(script)]
def run(cmd,env,log,timeout=600):
    with log.open('wb') as out:subprocess.run(cmd,env=env,stdout=out,stderr=subprocess.STDOUT,timeout=timeout,check=True)
def colors(out):return {p.name:(p.stat().st_mtime_ns,sha(p)) for p in out.glob('*.png')}
def package_report(out):
    p=read(out/'package.json');v=p['video']
    return {'frames':v['frames'],'resolution':v['resolution'],'fps':v['fps'],'decoded_samples':len(v['decoded_samples']),
            'max_decoded_mean_rgb_error_255':max(r['mean_rgb_error_255'] for r in v['decoded_samples']),
            'resume_unchanged':True,'archive_sha256':p['archive_sha256']}
def main():
    digest,total=validate_archive(ARCHIVE);assert total==1504
    base=P/'smoke76';base.mkdir(exist_ok=True);base=Path(tempfile.mkdtemp(prefix='run-',dir=base))
    report={'archive_sha256':digest,'production_frames':total,'root':str(base),'legacy':{},'multi':{}}
    atomic(P/'smoke76.json',report)
    for quality in ['final','draft']:
        root=base/('legacy-'+quality);env=workspace(root);out=root/'frames'
        env.update(FLY_MODE=quality,OUTPUT_ROOT=str(out))
        cmd=command(P/'legacy_smoke76.py');run(cmd,env,root/'render.log')
        package=read(out/'package.json');frames=read(out/'frames.json')['global_indices'];assert frames==[1,45,90,500,516,1101,1250,1474,1475,1504]
        verify_unpack(root/'bundle/out10.tar.gz',root/'unpacked',{'frames':10,'quality':quality})
        before=colors(out);before_video=(out/('flythrough_1080p30.webm' if quality=='final' else 'flythrough_draft_540p15.webm')).stat().st_mtime_ns
        run(cmd,env,root/'resume.log',120)
        assert colors(out)==before
        assert (root/'resume.log').read_text().count('SKIP_FINISHED')==10
        assert (out/('flythrough_1080p30.webm' if quality=='final' else 'flythrough_draft_540p15.webm')).stat().st_mtime_ns==before_video
        report['legacy'][quality]=package_report(out);atomic(P/'smoke76.json',report);print('LEGACY76',quality,json.dumps(report['legacy'][quality]),flush=True)
        # Exercise the existing Brief 75 queue/finalizer overlay unchanged.
        root=base/('multi-'+quality);jobs=[]
        for i in range(2):
            local=root/f'worker-{i}';env=workspace(local)
            env.update(FLY_MODE=quality,MULTI_ROOT=str(root/'volume'),MULTI_LOCAL_SMOKE='1',RUNPOD_POD_ID=f'local-v8-{i}',
                       MULTI_GPU='local RTX 3050 worker '+str(i),CHUNK='1',LEASE_SECONDS='60',POLL_SECONDS='.2')
            log=(local/'worker.log').open('wb');cmd=command(HERE/'multi_blender.py')
            jobs.append((subprocess.Popen(cmd,env=env,stdout=log,stderr=subprocess.STDOUT),log,cmd,env))
        try:
            for process,log,_,_ in jobs:
                code=process.wait(timeout=600);log.close();assert code==0,root
        finally:
            for process,log,_,_ in jobs:
                if process.poll() is None:process.terminate()
                if not log.closed:log.close()
        volume=root/'volume';success=read(volume/'queue/SUCCESS.json');assert success and success['frames']==8
        verify_unpack(volume/'out10.tar.gz',root/'unpacked',success)
        before=colors(volume/'smoke-frames');_,_,cmd,env=jobs[0]
        run(cmd,env,root/'resume.log',120);assert before==colors(volume/'smoke-frames')
        report['multi'][quality]={**package_report(volume/'smoke-frames'),'workers':len(jobs),
                                  'workers_reported':len(list((volume/'queue/workers').glob('*.json')))}
        atomic(P/'smoke76.json',report);print('MULTI76',quality,json.dumps(report['multi'][quality]),flush=True)
    print('SMOKE76_ALL_PASS',str(base),flush=True)
if __name__=='__main__':main()
