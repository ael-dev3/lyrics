"""Native-only diagnostic recognition of processed hooks.

Pitch variants retain duration but cannot establish source-clock boundaries.
Their transcripts are observations, not authored lyrics or listening evidence.
"""
import json
from pathlib import Path
import numpy as np, soundfile as sf, torch, torchaudio, stable_whisper

root=Path(__file__).resolve().parents[2]
torch.set_num_threads(4);torch.set_num_interop_threads(1)
mix,sr=sf.read(root/'analysis/mix16.wav',dtype='float32')
vocals,_=sf.read(root/'analysis/vocals16.wav',dtype='float32')
model=stable_whisper.load_model('large-v3-turbo',device='cpu')
records=[]
for name,lo,hi in [('post-1',69.5,94),('post-2',157.5,182.2)]:
    for kind,wave,steps in [('mix-up',mix,5),('vocal-up',vocals,5),('mix-down',mix,-4)]:
        crop=wave[round(lo*sr):round(hi*sr)]
        shifted=torchaudio.functional.pitch_shift(torch.from_numpy(crop),sr,steps,n_fft=1024).numpy()
        assert len(shifted)==len(crop)
        result=model.transcribe(shifted,language='ru',verbose=False,temperature=0,
            condition_on_previous_text=False,initial_prompt=None,word_timestamps=True,
            regroup=False,suppress_silence=False,fp16=False)
        result.offset_time(lo);data=result.to_dict()
        data['diagnostic']={'name':name,'input':kind,'pitchSemitones':steps,'crop':[lo,hi],
            'samples':len(crop),'humanListening':False,
            'scope':'Duration-preserving recognition aid; not boundary evidence.'}
        records.append(data)
        print(json.dumps({'name':name,'input':kind,'text':data['text']},ensure_ascii=False),flush=True)
(root/'analysis/repeat-diagnostics.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
