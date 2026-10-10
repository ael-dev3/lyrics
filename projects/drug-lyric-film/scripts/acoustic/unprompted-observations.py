"""Unprompted native-library coverage observations; never accepted lyric timing."""
import json, torch, soundfile as sf, stable_whisper
from pathlib import Path
root=Path(__file__).resolve().parents[2]
torch.set_num_threads(4); torch.set_num_interop_threads(1)
wave,sr=sf.read(root/'analysis/mix16.wav',dtype='float32')
model=stable_whisper.load_model('large-v3-turbo',device='cpu')
r=model.transcribe(wave,language='ru',verbose=False,temperature=0,condition_on_previous_text=False,initial_prompt=None,word_timestamps=True,regroup=False,suppress_silence=False,fp16=False)
d=r.to_dict(); d['provenance']={'model':'Whisper large-v3-turbo','conditioningText':None,'humanListening':False,'sourceClockOffsetSeconds':0}
(root/'analysis/coverage-unprompted.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'text':d.get('text'),'segments':[(s['start'],s['end'],s['text']) for s in d['segments']]},ensure_ascii=False),flush=True)
