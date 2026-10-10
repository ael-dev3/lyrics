"""Native-library observations only. These are not accepted lyric boundaries."""
import json, time, importlib.metadata
from pathlib import Path
import numpy as np, soundfile as sf, torch, stable_whisper

ROOT=Path(__file__).resolve().parents[2]/"analysis"
plan=json.loads((ROOT/'phrases.private.json').read_text())
wave,sr=sf.read(ROOT/'mix16.wav',dtype='float32')
assert sr==16000 and wave.ndim==1
torch.set_num_threads(4)
torch.set_num_interop_threads(1)
model=stable_whisper.load_model('large-v3-turbo',device='cpu')
out=ROOT/'whisper';out.mkdir(exist_ok=True)
recognition_file=out/'opening-unprompted.json'
if not recognition_file.exists():
    a,b=8,35.5
    result=model.transcribe(wave[round(a*sr):round(b*sr)],language='ru',verbose=False,temperature=0,
        condition_on_previous_text=False,initial_prompt=None,word_timestamps=True,regroup=False,
        suppress_silence=False,fp16=False)
    result.offset_time(a)
    data=result.to_dict()
    data['provenance']={'sourceSha256':plan['sourceSha256'],'input':'analysis/mix16.wav','crop':[a,b],
        'conditioningText':None,'humanListening':False,'purpose':'Opening coverage check; not timing authority'}
    recognition_file.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'recognition':data.get('text')}),flush=True)
records=[]
for phrase in plan['phrases']:
    dest=out/('align-'+phrase['id']+'.json')
    if dest.exists():
        record=json.loads(dest.read_text())
        assert record['provenance']['sourceSha256']==plan['sourceSha256']
        records.append(record)
        continue
    a,b=phrase['crop'];start=time.monotonic()
    text=' '.join(phrase['units']).strip()
    result=model.align(wave[round(a*sr):round(b*sr)],text,language='ru',verbose=False,original_split=True,
        suppress_silence=False,word_dur_factor=None,max_word_dur=None,fast_mode=False)
    result.offset_time(a)
    record=result.to_dict()
    record['provenance']={'sourceSha256':plan['sourceSha256'],'model':'large-v3-turbo',
        'modelFamily':'OpenAI Whisper','implementation':importlib.metadata.version('stable-ts'),
        'input':'analysis/mix16.wav','crop':[a,b],'conditioningText':text,'humanListening':False,
        'status':'Transcript-conditioned observations requiring independent acoustic reconciliation'}
    dest.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n');records.append(record)
    print(json.dumps({'id':phrase['id'],'seconds':round(time.monotonic()-start,2),
        'words':[(w['word'],w['start'],w['end']) for s in record['segments'] for w in s['words']]},ensure_ascii=False),flush=True)
(out/'align-all.json').write_text(json.dumps({'sourceSha256':plan['sourceSha256'],'records':records},ensure_ascii=False,indent=2)+'\n')
