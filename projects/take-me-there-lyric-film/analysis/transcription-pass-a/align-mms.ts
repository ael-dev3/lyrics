import {spawnSync} from 'node:child_process';

// Python is confined to the pretrained MMS_FA interface and audio I/O.
// The supplied text is forced through the model; an aligned word is not proof
// that the word, or its submitted repetition count, occurs in the recording.
const bridge = String.raw`
import sys,json,re,torch,soundfile as sf
from torchaudio.pipelines import MMS_FA
torch.set_num_threads(3)
windows=json.load(open(sys.argv[1]))
output_prefix=sys.argv[2]
model=MMS_FA.get_model(with_star=False).eval()
tokenizer=MMS_FA.get_tokenizer();aligner=MMS_FA.get_aligner()
for name in ['mix','vocals']:
 x,sr=sf.read(name+'16.wav',dtype='float32');assert sr==16000
 output=[];emission_cache={}
 for window in windows:
  a=round(window['start']*sr);b=round(window['end']*sr)
  clip=torch.from_numpy(x[a:b])
  source=window['text'].split()
  tokens=[re.sub("[^a-z']",'',word.lower()) for word in source]
  if (a,b) not in emission_cache:
   with torch.inference_mode():emission,_=model(clip.unsqueeze(0))
   emission_cache[(a,b)]=emission[0]
  emission=emission_cache[(a,b)];spans=aligner(emission,tokenizer(tokens));ratio=len(clip)/sr/emission.shape[0]
  words=[]
  for word,span in zip(source,spans,strict=True):
   length=sum(t.end-t.start for t in span)
   words.append({'word':word,'start':a/sr+span[0].start*ratio,'end':a/sr+span[-1].end*ratio,'score':sum(t.score*(t.end-t.start) for t in span)/length,'acousticSpans':[{'start':a/sr+t.start*ratio,'end':a/sr+t.end*ratio,'score':t.score} for t in span]})
  output.append({**window,'words':words})
  json.dump({'method':'MMS_FA forced alignment','audio':name,'warning':'Submitted repetitions may be forced even if absent. These are candidate timings, not listening-verified truth.','segments':output},open(output_prefix+'-'+name+'.json','w'),ensure_ascii=False,indent=2)
  print(name,window['id'],[(w['word'],round(w['start'],3),round(w['end'],3),round(w['score'],3)) for w in words],flush=True)
`;
const run = spawnSync(process.env.ALIGN_PYTHON ?? 'python3', ['-u', '-c', bridge, process.argv[2] ?? 'mms-windows.json', process.argv[3] ?? 'mms'], {stdio:'inherit'});
if (run.status !== 0) throw new Error(`MMS alignment failed: ${run.status}`);
