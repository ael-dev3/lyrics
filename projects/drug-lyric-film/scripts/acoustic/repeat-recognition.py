"""Complementary bounded recognition; proposals are not listening evidence."""
import json, torch,stable_whisper,soundfile as sf
from pathlib import Path
r=Path(__file__).resolve().parents[2];torch.set_num_threads(4);torch.set_num_interop_threads(1)
m=stable_whisper.load_model('small',device='cpu');a,sr=sf.read(r/'analysis/mix16.wav',dtype='float32');records=[]
for lo,hi in [(36.8,44),(97,104.8),(104.3,113.5),(112,130)]:
 s=m.transcribe(a[round(lo*sr):round(hi*sr)],language='ru',verbose=False,temperature=0,condition_on_previous_text=False,initial_prompt=None,word_timestamps=True,regroup=False,suppress_silence=False,fp16=False);s.offset_time(lo);d=s.to_dict();d['crop']=[lo,hi];records.append(d)
 print(json.dumps({'crop':[lo,hi],'words':[(w['word'],w['start'],w['end']) for s in d['segments'] for w in s['words']]},ensure_ascii=False),flush=True)
(r/'analysis/repeat-recognition-small.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
