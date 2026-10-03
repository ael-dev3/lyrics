"""Text-conditioned competing timestamps. These do not establish lexical presence."""
import argparse,json,time,hashlib
from pathlib import Path
import numpy as np,soundfile as sf,torch,stable_whisper
p=Path(__file__).resolve().parent;project=p.parent
a=argparse.ArgumentParser();a.add_argument('phrases');a.add_argument('--output',required=True);args=a.parse_args()
phrases=json.load(open(args.phrases));wave,sr=sf.read(p/'independent-audio/original-mix-16000.wav');assert sr==16000
torch.set_num_threads(4);model=stable_whisper.load_model('large-v3-turbo',device='cpu');records=[]
for phrase in phrases:
 lo,hi=[round(x*sr) for x in phrase['crop']];begun=time.monotonic()
 r=model.align(wave[lo:hi].astype(np.float32),' '.join(phrase['units']),language=phrase['language'],original_split=True,suppress_silence=False,word_dur_factor=None,max_word_dur=None,fast_mode=False,verbose=False)
 r.offset_time(lo/sr)
 records.append({'phraseId':phrase['id'],'language':phrase['language'],'cropStartSample16000':lo,'cropEndSample16000':hi,'conditionedText':phrase['units'],'method':'Whisper large-v3-turbo stable-ts conditioned attention alignment, not lexical proof or listening','result':r.to_dict()})
 Path(args.output).write_text(json.dumps({'sourceSha256':hashlib.sha256((project/'public/source.mp4').read_bytes()).hexdigest(),'humanListening':False,'records':records},ensure_ascii=False,indent=2)+'\n')
 print(phrase['id'],round(time.monotonic()-begun,2),[(w.word,round(w.start,3),round(w.end,3)) for w in r.all_words()],flush=True)
