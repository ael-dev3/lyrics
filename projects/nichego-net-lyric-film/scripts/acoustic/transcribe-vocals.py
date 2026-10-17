"""Unprompted bounded recognition. Observations are not performed-text authority."""
from pathlib import Path
import json,time,torch,soundfile as sf,stable_whisper
root=Path(__file__).resolve().parents[2]
torch.set_num_threads(4);torch.set_num_interop_threads(1)
a,sr=sf.read(root/'analysis/vocals-16k.wav',dtype='float32');assert sr==16000
model=stable_whisper.load_model('large-v3-turbo',device='cpu')
for i,(lo,hi) in enumerate([(15,31),(50,59),(119,136),(143,151),(150,158),(157,165),(164,172),(171,179),(178,188),(187,len(a)/sr)]):
 save=root/f'analysis/asr-vocal-{i:02}.json'
 if save.exists():continue
 started=time.monotonic();r=model.transcribe(a[round(lo*sr):round(hi*sr)],language='ru',regroup=False,verbose=False,condition_on_previous_text=False)
 d=r.to_dict()
 for s in d.get('segments',[]):
  s['start']+=lo;s['end']+=lo
  for w in s.get('words',[]):w['start']+=lo;w['end']+=lo
 d.update(crop=[lo,hi],model='large-v3-turbo',humanListening=False)
 save.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');print(i,round(time.monotonic()-started,1),r.text,flush=True)
