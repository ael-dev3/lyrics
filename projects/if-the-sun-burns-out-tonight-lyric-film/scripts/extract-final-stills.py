#!/usr/bin/env python3
"""Extract unmodified full-frame screenshots from hash-verified final masters."""
import pathlib,json,hashlib,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[1]
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
items=[]
for fmt,frame in [('landscape',12042),('portrait',9630)]:
 source=ROOT/f'output/if-the-sun-burns-out-tonight-{fmt}.mp4'
 report=json.loads((ROOT/f'evidence/{fmt}-verification.json').read_text())
 assert report['status']=='passed' and report['inputSha256']==sha(source),'Verified final master required'
 p=ROOT/f'evidence/final/{fmt}-{frame}.png';p.parent.mkdir(parents=True,exist_ok=True)
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(source),'-vf',f'select=eq(n\\,{frame})','-frames:v','1','-fps_mode','vfr','-compression_level','8',str(p)],check=True)
 items.append({'format':fmt,'path':str(p.relative_to(ROOT)),'frame':frame,'timeSeconds':frame/60,'sourceVideoSha256':sha(source),'sha256':sha(p),'bytes':p.stat().st_size,'dimensions':report['metadata']['dimensions'],'method':'Exact zero-indexed decoded final frame; full native composition, no cropping, recoloring, replacement text or generated imagery.'})
(ROOT/'evidence/final/manifest.json').write_text(json.dumps({'screenshots':items},indent=2)+'\n')
print(json.dumps(items))
