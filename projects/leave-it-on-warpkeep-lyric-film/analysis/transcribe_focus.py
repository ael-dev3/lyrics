"""Unforced model-only review of high-risk windows; no supplied transcript."""
import json,os,sys
from pathlib import Path
import soundfile as sf,torch,whisper
ROOT=Path(__file__).resolve().parent
modelname=sys.argv[1] if len(sys.argv)>1 else 'small';label=sys.argv[2] if len(sys.argv)>2 else 'stem'
x,sr=sf.read(ROOT/('vocals-mono-16k.wav' if label=='stem' else 'source-mono-16k.wav'),dtype='float32')
torch.set_num_threads(3);model=whisper.load_model(modelname,device='cpu',download_root=os.environ.get('WHISPER_CACHE',str(Path.home()/'.cache/whisper')));out=[]
for start,end in [(0,24),(82,103),(160,178),(178,184),(194,214),(228,242),(241,273.56)]:
 result=model.transcribe(x[round(start*sr):round(end*sr)],language='en',fp16=False,temperature=0,condition_on_previous_text=False,word_timestamps=True,verbose=False)
 words=[{'text':w['word'].strip(),'start':round(start+w['start'],3),'end':round(start+w['end'],3),'probability':w['probability']} for s in result['segments'] for w in s.get('words',[])]
 row={'region':[start,end],'text':result['text'],'words':words};out.append(row);print(row,flush=True)
 (ROOT/f'unforced-{modelname}-{label}-focus.json').write_text(json.dumps(out,indent=2)+'\n')
