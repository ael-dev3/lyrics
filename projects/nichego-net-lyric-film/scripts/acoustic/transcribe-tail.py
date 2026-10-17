"""Unprompted bounded recognition. Observations are not performed-text authority."""
from pathlib import Path
import json,time,torch,soundfile as sf,stable_whisper
root=Path(__file__).resolve().parents[2]
torch.set_num_threads(4);torch.set_num_interop_threads(1)
a,sr=sf.read(root/'analysis/mix-16k.wav',dtype='float32');assert sr==16000
model=stable_whisper.load_model('small',device='cpu')
for i,(lo,hi) in enumerate([(160.7,165.4),(168.1,172.8),(175.5,180.2),(179.2,183.9),(183,188.4)]):
 save=root/f'analysis/asr-tail-{i:02}.json'
 if save.exists():continue
 started=time.monotonic();r=model.transcribe(a[round(lo*sr):round(hi*sr)],language='ru',regroup=False,verbose=False,condition_on_previous_text=False)
 d=r.to_dict()
 for s in d.get('segments',[]):
  s['start']+=lo;s['end']+=lo
  for w in s.get('words',[]):w['start']+=lo;w['end']+=lo
 d.update(crop=[lo,hi],model='small',humanListening=False)
 save.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');print(i,round(time.monotonic()-started,1),r.text,flush=True)
