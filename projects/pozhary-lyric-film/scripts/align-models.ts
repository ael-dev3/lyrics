import {spawnSync} from 'node:child_process';
const python=process.env.ALIGN_PYTHON??'python3';
const mode=process.argv[2]??'whisper', audio=process.argv[3]??'vocals16', windows=process.argv[4]??'analysis/windows.json';
const tag=process.argv[5]??'';
// This bridge only invokes pretrained Python model APIs. Cue selection, semantics,
// production geometry and verification remain TypeScript-owned.
const bridge=String.raw`
import sys,json,re,torch,soundfile as sf
mode,audio,windows,tag=sys.argv[1:]
torch.set_num_threads(4)
segments=json.load(open(windows))
if mode=='whisper':
 import stable_whisper
 model=stable_whisper.load_model('large-v3-turbo',device='cpu')
 samples,sr=sf.read('analysis/'+audio+'.wav',dtype='float32');assert sr==16000
 output=[]
 for s in segments:
  result=model.align_words(samples,[s],language='ru',regroup=False,suppress_silence=True,verbose=None)
  words=[w for seg in result.to_dict()['segments'] for w in seg['words']]
  output.append({'id':s['id'],'text':s['text'],'words':words})
  print(s['id'],round(words[0]['start'],3),round(words[-1]['end'],3),flush=True)
 json.dump({'segments':output},open('analysis/bounded-'+audio+tag+'.json','w'),ensure_ascii=False,indent=2)
else:
 from torchaudio.pipelines import MMS_FA
 import uroman
 model=MMS_FA.get_model(with_star=False).eval()
 tokenizer=MMS_FA.get_tokenizer();aligner=MMS_FA.get_aligner();roman=uroman.Uroman()
 samples,sr=sf.read('analysis/'+audio+'.wav',dtype='float32');assert sr==16000
 output=[]
 for s in segments:
  a=round(s['start']*sr);b=round(s['end']*sr);clip=torch.from_numpy(samples[a:b])
  words=s['text'].split();tokens=[re.sub("[^a-z']",'',roman.romanize_string(w.lower(),lcode='rus')) for w in words]
  with torch.inference_mode():emission,_=model(clip.unsqueeze(0))
  emission=emission[0];spans=aligner(emission,tokenizer(tokens));ratio=len(clip)/sr/emission.shape[0]
  aligned=[]
  for word,span in zip(words,spans,strict=True):
   length=sum(t.end-t.start for t in span)
   aligned.append({'word':word,'start':a/sr+span[0].start*ratio,'end':a/sr+span[-1].end*ratio,'probability':sum(t.score*(t.end-t.start) for t in span)/length})
  output.append({'id':s['id'],'text':s['text'],'words':aligned})
  print(s['id'],round(aligned[0]['start'],3),round(aligned[-1]['end'],3),flush=True)
 json.dump({'segments':output},open('analysis/mms-'+audio+tag+'.json','w'),ensure_ascii=False,indent=2)
`;
const result=spawnSync(python,['-c',bridge,mode,audio,windows,tag],{stdio:'inherit',env:process.env});
if(result.status!==0)throw new Error(`Alignment process failed: ${result.status}`);
