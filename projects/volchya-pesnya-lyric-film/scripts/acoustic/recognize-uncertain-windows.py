"""Unprompted bounded lexical checks; correlated recognizer observations."""
import json,time
from pathlib import Path
import torch,soundfile as sf,stable_whisper
root=Path(__file__).resolve().parents[2];torch.set_num_threads(2);torch.set_num_interop_threads(1)
model=stable_whisper.load_model('large-v3-turbo',device='cpu')
windows=[('powder',20.9,28.0),('tail-verb',107.7,113.8),('clock',160.9,164.1),('heart',230.9,236.3)]
records=[]
for input in ['mix16.wav','vocals16.wav']:
 wave,sr=sf.read(root/'analysis'/input,dtype='float32');assert sr==16000
 for name,lo,hi in windows:
  result=model.transcribe(wave[round(lo*sr):round(hi*sr)],language='ru',verbose=False,temperature=0,condition_on_previous_text=False,initial_prompt=None,word_timestamps=True,regroup=False,suppress_silence=False,fp16=False)
  result.offset_time(lo);data=result.to_dict();records.append({'window':name,'crop':[lo,hi],'input':input,'conditioningText':None,'humanListening':False,'result':data})
  print(json.dumps({'window':name,'input':input,'text':data.get('text')},ensure_ascii=False),flush=True)
(root/'analysis/uncertain-window-recognition.json').write_text(json.dumps({'sourceSha256':json.loads((root/'source/recording.json').read_text())['sourceSha256'],'model':'large-v3-turbo','limits':'Original/stem/crop observations of one recognizer are correlated, not independent listening votes.','records':records},ensure_ascii=False,indent=2)+'\n')
