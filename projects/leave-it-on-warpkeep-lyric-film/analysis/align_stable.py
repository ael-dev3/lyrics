"""Whisper alignment corroboration, same family as unforced Whisper (not independent)."""
import json,os,sys
from pathlib import Path
import torch,soundfile as sf,stable_whisper
ROOT=Path(__file__).resolve().parent
label=sys.argv[1] if len(sys.argv)>1 else 'mix'
source=ROOT/('vocals-mono-16k.wav' if label=='stem' else 'source-mono-16k.wav')
samples,sr=sf.read(source,dtype='float32');assert sr==16000
torch.set_num_threads(3)
model=stable_whisper.load_model('large-v3-turbo',device='cpu',download_root=os.environ.get('WHISPER_CACHE',str(Path.home()/'.cache/whisper')))
rows=[]
for w in json.loads((ROOT/'windows-v2.json').read_text()):
 result=model.align_words(samples,[{k:w[k] for k in ('start','end','text')}],language='en',regroup=False,suppress_silence=False,verbose=None)
 words=[x for s in result.to_dict()['segments'] for x in s['words']]
 words=[{'text':x['word'].strip(),'start':x['start'],'end':x['end'],'probability':x.get('probability')} for x in words]
 rows.append({**w,'words':words});(ROOT/f'raw-stable-{label}.json').write_text(json.dumps(rows,indent=2)+'\n')
 print(w['id'],[(x['text'],x['start'],x['end']) for x in words],flush=True)
