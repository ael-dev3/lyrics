"""Bounded acoustic proposals for the full rebuild; no listening claims."""
from pathlib import Path
import hashlib, json, subprocess, zipfile, time, re
import numpy as np
import stable_whisper

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'analysis/rebuild'
OUT.mkdir(parents=True,exist_ok=True)
BASELINE=OUT/'baseline-v2.zip'
if not BASELINE.exists():
    with zipfile.ZipFile(BASELINE,'w',zipfile.ZIP_DEFLATED) as z:
        for folder in ['src','source','review']:
            for p in (ROOT/folder).rglob('*'):
                if p.is_file():z.write(p,p.relative_to(ROOT))
        for name in ['public/timeline.json','public/visual-contract.json','public/preview-identity.json','scripts/build-timeline.py']:
            z.write(ROOT/name,name)

editorial={'cues':json.loads((ROOT/'source/acoustic-phrases.json').read_text())['phrases'][:42]}
baseline=json.loads((ROOT/'public/timeline.json').read_text())
cue_map={c['id']:c for c in baseline['cues']}
blocks=[
 ('opening',0,18,0,4),('first-tree',18,42,4,9),
 ('two-choruses',41.5,81,9,17),('male-post',80.5,110,17,23),
 ('female-verse',119,160.4,23,31),('male-duet',159.5,181,31,36),
 ('female-ending',179.8,204.9,36,42),
]

def audio(path,start=0,end=None,side=False):
    filters=[]
    if end is not None:filters.append(f'atrim=start={start}:end={end}')
    if side:filters.extend(['pan=mono|c0=0.5*c0-0.5*c1','highpass=f=170','lowpass=f=8000','volume=5'])
    filters.append('asetpts=PTS-STARTPTS')
    cmd=['ffmpeg','-v','error','-nostdin','-i',str(path),'-af',','.join(filters),'-ac','1','-ar','16000','-f','f32le','pipe:1']
    return np.frombuffer(subprocess.check_output(cmd),dtype=np.float32).copy()

def offset(result,seconds):
    d=result.to_dict()
    for segment in d['segments']:
        segment['start']+=seconds;segment['end']+=seconds
        for w in segment.get('words',[]):w['start']+=seconds;w['end']+=seconds
    return d

def save(name,payload):
    (OUT/name).write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n')

print('Loading bounded-alignment model',flush=True)
model=stable_whisper.load_model('large-v3-turbo',device='cpu')
vocal=ROOT/'analysis/separated/htdemucs/original/vocals.wav'
original=ROOT/'analysis/original.wav'
print('Reviewing the final backing on stereo difference',flush=True)
side=audio(vocal,158.5,181.2,True)
if not (OUT/'duet-side-unprompted.json').exists():
    try:
        r=model.transcribe(side,language='ru',regroup=False,verbose=False)
        save('duet-side-unprompted.json',offset(r,158.5))
    except Exception as e:save('duet-side-recognition-error.json',{'error':str(e)})
backing='Её храни, храни, храни глубоко в себе\nА-а-а\nЕё храни, её храни, и храни'
for material,path,is_side in [('side',vocal,True),('original',original,False)]:
    if (OUT/f'duet-{material}-supplied.json').exists():continue
    result=model.align(audio(path,158.5,181.2,is_side),backing,language='ru',original_split=True,verbose=False)
    if result:save(f'duet-{material}-supplied.json',offset(result,158.5))
    print('Backing proposal saved:',material,flush=True)

for name,start,end,first,last in blocks:
    # A standalone printed dash can receive its own forced interval. It is
    # editorial punctuation, so exclude it from acoustic token ownership.
    text='\n'.join(c['ru'] for c in editorial['cues'][first:last]).replace('—','')
    ids=[c['id'] for c in editorial['cues'][first:last]]
    for material,path in [('vocal',vocal),('original',original)]:
        output=OUT/f'{name}-{material}.json'
        if output.exists():
            retained=json.loads(output.read_text())
            existing=[re.sub(r'[^а-яё]','',w['word'].lower()) for s in retained['segments'] for w in s['words']]
            expected=[re.sub(r'[^а-яё]','',w.lower()) for w in re.findall(r'[А-Яа-яЁё]+(?:-[А-Яа-яЁё]+)*',text)]
            if existing==expected:continue
        print('Aligning',name,material,start,end,flush=True)
        result=model.align(audio(path,start,end),text,language='ru',original_split=True,verbose=False)
        if not result:raise RuntimeError(f'No alignment: {name}/{material}')
        d=offset(result,start)
        d['proposal']={'block':name,'cueIds':ids,'crop':[start,end],'material':material,'conditionedText':text,'method':'Stable-ts large-v3-turbo bounded forced word alignment; not an independent listening review'}
        save(output.name,d)
        print('Saved',output.name,flush=True)
save('provenance.json',{'sourceSha256':baseline['sourceSha256'],'baselineTimelineSha256':hashlib.sha256((ROOT/'public/timeline.json').read_bytes()).hexdigest(),
 'model':'large-v3-turbo','device':'cpu','originalClockPreserved':True,'cropOffsetPolicy':'All crop coordinates are restored to original seconds before canonical 44.1 kHz source-sample selection.',
 'evidenceLimit':'Different materials and crops from the same model family remain correlated proposals; direct listening remains a separate review.'})
print('ACOUSTIC_REBUILD_COMPLETE',flush=True)
