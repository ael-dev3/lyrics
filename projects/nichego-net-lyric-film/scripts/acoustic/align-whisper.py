from pathlib import Path
import json,time,torch,soundfile as sf,stable_whisper
root=Path(__file__).resolve().parents[2];torch.set_num_threads(4);torch.set_num_interop_threads(1)
a,sr=sf.read(root/'analysis/mix-16k.wav',dtype='float32');model=stable_whisper.load_model('large-v3-turbo',device='cpu')
d=json.loads((root/'source/editorial.json').read_text());out=root/'analysis/whisper-align';out.mkdir(exist_ok=True)
for p in d['phrases']:
 save=out/(p['id']+'.json')
 if save.exists():continue
 lo,hi=p['crop'];r=model.align(a[round(lo*sr):round(hi*sr)],' '.join(p['units']),language='ru',original_split=True,verbose=False)
 data=r.to_dict()
 for s in data.get('segments',[]):
  s['start']+=lo;s['end']+=lo
  for w in s.get('words',[]):w['start']+=lo;w['end']+=lo
 data.update(crop=[lo,hi],id=p['id'],humanListening=False,model='stable-ts/Whisper large-v3-turbo')
 save.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');print(p['id'],[(w['word'].strip(),round(w['start'],3),round(w['end'],3)) for s in data['segments'] for w in s.get('words',[])],flush=True)
