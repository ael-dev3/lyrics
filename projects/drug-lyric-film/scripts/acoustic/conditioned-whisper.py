"""Native-library conditioned paths, kept as proposals rather than truth."""
import json,torch,soundfile as sf,stable_whisper,time
from pathlib import Path
root=Path(__file__).resolve().parents[2]
torch.set_num_threads(4);torch.set_num_interop_threads(1)
m=stable_whisper.load_model('large-v3-turbo',device='cpu')
a,sr=sf.read(root/'analysis/mix16.wav',dtype='float32')
plan=json.load(open(root/'source/acoustic-crop-plan.json'));records=[]
for p in plan['phrases']:
 lo,hi=p['crop'];r=m.align(a[round(lo*sr):round(hi*sr)],' '.join(p['units']),language='ru',verbose=False,original_split=True,suppress_silence=False,word_dur_factor=None,max_word_dur=None,fast_mode=False)
 r.offset_time(lo);d=r.to_dict();d['phraseId']=p['id'];d['provenance']={'sourceSha256':plan['sourceSha256'],'input':'mix16.wav','conditioningText':p['units'],'humanListening':False,'crop':p['crop'],'model':'Whisper large-v3-turbo'}
 (root/f'analysis/whisper-{p["id"]}.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');records.append(d)
 print(json.dumps({'id':p['id'],'words':[(w['word'],w['start'],w['end']) for s in d['segments'] for w in s['words']]},ensure_ascii=False),flush=True)
(root/'analysis/conditioned-whisper-all.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
