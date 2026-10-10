"""Native-library observations on bounded original and estimated vocal inputs."""
import json,torch,soundfile as sf,stable_whisper,time
from pathlib import Path
root=Path(__file__).resolve().parents[2]
torch.set_num_threads(4);torch.set_num_interop_threads(1)
m=stable_whisper.load_model('large-v3-turbo',device='cpu')
a,sr=sf.read(root/'analysis/vocals16.wav',dtype='float32')
crops=[(0,23),(21,42),(38,65),(63,84),(81,100),(97,123),(121,150)]
records=[]
for i,(lo,hi) in enumerate(crops):
 r=m.transcribe(a[round(lo*sr):round(hi*sr)],language='ru',verbose=False,temperature=0,condition_on_previous_text=False,initial_prompt=None,word_timestamps=True,regroup=False,suppress_silence=False,fp16=False)
 r.offset_time(lo);d=r.to_dict();d['provenance']={'conditioningText':None,'humanListening':False,'crop':[lo,hi],'input':'vocals16.wav'}
 (root/f'analysis/coverage-vocals-{i}.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');records.append(d)
 print(json.dumps({'crop':[lo,hi],'words':[(w['word'],w['start'],w['end']) for s in d['segments'] for w in s['words']]},ensure_ascii=False),flush=True)
(root/'analysis/coverage-vocals-all.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
