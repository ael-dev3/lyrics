"""Unforced ASR evidence, with no supplied lyrics. Models are candidates, not listening."""
import json,os
from pathlib import Path
import soundfile as sf
import torch,whisper
ROOT=Path(__file__).resolve().parent
samples,sr=sf.read(ROOT/'source-mono-16k.wav',dtype='float32');assert sr==16000
torch.set_num_threads(4)
model=whisper.load_model('large-v3-turbo',device='cpu',download_root=os.environ.get('WHISPER_CACHE',str(Path.home()/'.cache/whisper')))
regions=[(0,24),(22,59),(58,70),(68,103),(102,137),(135,147),(144,176),(174,205),(203,240),(237,273.56)]
rows=[]
for start,end in regions:
 result=model.transcribe(samples[round(start*sr):round(end*sr)],language='en',fp16=False,temperature=0,condition_on_previous_text=False,word_timestamps=True,verbose=False)
 words=[{'text':w['word'].strip(),'start':round(start+w['start'],3),'end':round(start+w['end'],3),'probability':w['probability']} for s in result['segments'] for w in s.get('words',[])]
 row={'region':[start,end],'text':result['text'],'words':words};rows.append(row)
 (ROOT/'unforced-whisper-turbo.json').write_text(json.dumps(rows,indent=2)+'\n')
 print(json.dumps(row),flush=True)
