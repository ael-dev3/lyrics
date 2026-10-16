"""Bounded unprompted observations; they never become performed lyrics automatically."""
import argparse,json,time
from pathlib import Path
import torch,soundfile as sf,stable_whisper
root=Path(__file__).resolve().parents[2]
p=argparse.ArgumentParser();p.add_argument('--track',choices=['mix','vocals'],default='mix');p.add_argument('--model',choices=['large-v3-turbo','small'],default='large-v3-turbo');p.add_argument('--scope',choices=['full','repeats','diagnostic'],default='full');args=p.parse_args()
torch.set_num_threads(4);torch.set_num_interop_threads(1)
a,sr=sf.read(root/f'analysis/{args.track}-16k.wav',dtype='float32');assert sr==16000 and a.ndim==1
m=stable_whisper.load_model(args.model,device='cpu')
crops={'full':[(0,30),(22,48),(45,81),(78,114),(111,142),(139,174),(171,203),(198,len(a)/sr)],'repeats':[(64,70),(70,76),(76,82),(82,88),(88,94),(173,179),(179,185),(185,191),(191,197),(197,204)],'diagnostic':[(64,89),(87,113),(173,195),(195,204)]}[args.scope]
for n,(lo,hi) in enumerate(crops):
 if args.scope=='full':name=f"{'stem-' if args.track=='vocals' else ''}asr-{n:02d}"
 elif args.scope=='repeats':name=f'repeat-{lo}'
 else:name=f'small-{args.track}-{lo}'
 target=root/f'analysis/{name}.json'
 if target.exists():continue
 start=time.monotonic();r=m.transcribe(a[round(lo*sr):round(hi*sr)],language='ru',regroup=False,verbose=False,condition_on_previous_text=False,suppress_silence=args.scope=='full')
 d=r.to_dict()
 for segment in d.get('segments',[]):
  segment['start']+=lo;segment['end']+=lo
  for w in segment.get('words',[]):w['start']+=lo;w['end']+=lo
 d.update(crop=[lo,hi],model=args.model,track=args.track,humanListening=False)
 target.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'crop':[lo,hi],'seconds':round(time.monotonic()-start,1),'text':r.text},ensure_ascii=False),flush=True)
