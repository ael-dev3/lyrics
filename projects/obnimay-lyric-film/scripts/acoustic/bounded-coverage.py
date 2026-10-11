"""Native unprompted recognition of uncovered spans. No selection or authoring."""
import json,time
from pathlib import Path
import torch,soundfile as sf,stable_whisper
root=Path(__file__).resolve().parents[2]
torch.set_num_threads(3);torch.set_num_interop_threads(1)
wave,sr=sf.read(root/'analysis/vocals16.wav',dtype='float32')
windows=[('opening-a',0,11),('opening-b',9,23),('opening-c',21,31),('post-1',68,94),('gap',93,117),('post-2',156,182),('end',181,200.6)]
model=stable_whisper.load_model('large-v3-turbo',device='cpu')
records=[]
for name,lo,hi in windows:
 result=model.transcribe(wave[round(lo*sr):round(hi*sr)],language='ru',verbose=False,temperature=0,condition_on_previous_text=False,initial_prompt=None,word_timestamps=True,regroup=False,suppress_silence=False,fp16=False)
 result.offset_time(lo);data=result.to_dict();data['crop']=[lo,hi];data['name']=name;data['humanListening']=False
 (root/f'analysis/coverage-{name}.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');records.append(data)
 print(json.dumps({'name':name,'text':data['text'],'words':[(w['word'],w['start'],w['end']) for s in data['segments'] for w in s['words']]},ensure_ascii=False),flush=True)
(root/'analysis/bounded-coverage-all.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
