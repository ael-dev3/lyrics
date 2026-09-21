import {spawnSync} from 'node:child_process';
const python=process.env.ALIGN_PYTHON??'python3';
const bridge=String.raw`
import sys,json,re,torch,soundfile as sf
torch.set_num_threads(4)
mode,audio,windowfile=sys.argv[1:4]
tag=sys.argv[4] if len(sys.argv)>4 else ''
windows=json.load(open(windowfile))
samples,sr=sf.read('analysis/'+audio+'16.wav',dtype='float32');assert sr==16000
output=[]
if mode=='whisper':
 import stable_whisper
 model=stable_whisper.load_model('large-v3-turbo',device='cpu')
else:
 from torchaudio.pipelines import MMS_FA
 import uroman
 model=MMS_FA.get_model(with_star=False).eval()
 tokenizer=MMS_FA.get_tokenizer();aligner=MMS_FA.get_aligner();roman=uroman.Uroman()
for s in windows:
 if mode=='whisper':
  result=model.align_words(samples,[{k:s[k] for k in ['start','end','text']}],language='en',regroup=False,suppress_silence=False,verbose=None)
  words=[w for seg in result.to_dict()['segments'] for w in seg['words']]
 else:
  a=round(s['start']*sr);b=round(s['end']*sr);clip=torch.from_numpy(samples[a:b])
  sourcewords=s['text'].split()
  tokens=[re.sub("[^a-z']",'',roman.romanize_string(w.lower(),lcode='eng')) for w in sourcewords]
  with torch.inference_mode():emission,_=model(clip.unsqueeze(0))
  emission=emission[0];spans=aligner(emission,tokenizer(tokens));ratio=len(clip)/sr/emission.shape[0]
  words=[]
  for word,span in zip(sourcewords,spans,strict=True):
   length=sum(t.end-t.start for t in span)
   words.append({'word':word,'start':a/sr+span[0].start*ratio,'end':a/sr+span[-1].end*ratio,'probability':sum(t.score*(t.end-t.start) for t in span)/length,'acousticSpans':[{'start':a/sr+t.start*ratio,'end':a/sr+t.end*ratio,'score':t.score} for t in span]})
 item={'id':s['id'],'text':s['text'],'words':words}
 output.append(item)
 json.dump({'method':mode,'audio':audio,'windowFile':windowfile,'segments':output},open('analysis/'+mode+'-'+audio+tag+'.json','w'),ensure_ascii=False,indent=2)
 print(s['id'],[(w['word'],round(w['start'],3),round(w['end'],3)) for w in words],flush=True)
`;
const run=spawnSync(python,['-c',bridge,...process.argv.slice(2)],{stdio:'inherit'});
if(run.status!==0)throw new Error(`Alignment failed: ${run.status}`);
