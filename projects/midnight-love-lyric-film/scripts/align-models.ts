import {spawnSync} from 'node:child_process';
const python=process.env.ALIGN_PYTHON??'python3';
const mode=process.argv[2]??'full',audio=process.argv[3]??'audio16',windows=process.argv[4]??'analysis/windows.json';
// Python is confined to pretrained model interfaces; source cue decisions and
// all presentation, DSP, rendering and delivery verification are TypeScript.
const bridge=String.raw`
import sys,json,re,torch,soundfile as sf
mode,audio,windows=sys.argv[1:]
torch.set_num_threads(4)
samples,sr=sf.read('analysis/'+audio+'.wav',dtype='float32');assert sr==16000
if mode in ['full','whisper','transcribe']:
 import stable_whisper
 model=stable_whisper.load_model('large-v3-turbo',device='cpu')
 if mode=='full':
  text=open('analysis/lyrics-user-en.txt').read()
  result=model.align(samples,text,language='en',regroup=False,suppress_silence=True,verbose=None)
  result.save_as_json('analysis/full-'+audio+'.json')
 elif mode=='transcribe':
  result=model.transcribe(samples,language='en',regroup=False,verbose=None)
  result.save_as_json('analysis/transcription-'+audio+'.json')
 else:
  output=[]
  for s in json.load(open(windows)):
   result=model.align_words(samples,[s],language='en',regroup=False,suppress_silence=True,verbose=None)
   words=[w for seg in result.to_dict()['segments'] for w in seg['words']]
   output.append({'id':s['id'],'text':s['text'],'words':words})
   print(s['id'],round(words[0]['start'],3),round(words[-1]['end'],3),flush=True)
  json.dump({'segments':output},open('analysis/bounded-'+audio+'.json','w'),indent=2)
elif mode=='wav2vec':
 from torchaudio.pipelines import WAV2VEC2_ASR_BASE_960H
 from torchaudio.functional import forced_align,merge_tokens
 model=WAV2VEC2_ASR_BASE_960H.get_model().eval();labels=WAV2VEC2_ASR_BASE_960H.get_labels();vocab={c:i for i,c in enumerate(labels)}
 output=[]
 for s in json.load(open(windows)):
  a=round(s['start']*sr);b=round(s['end']*sr);clip=torch.from_numpy(samples[a:b])
  words=s['text'].split();tokens=[re.sub("[^A-Z']",'',w.upper()) for w in words];target='|'.join(tokens)
  with torch.inference_mode():emission,_=model(clip.unsqueeze(0))
  path,scores=forced_align(emission.log_softmax(-1),torch.tensor([[vocab[c] for c in target]]),blank=0)
  spans=merge_tokens(path[0],scores[0].exp());ratio=len(clip)/sr/emission.shape[1]
  grouped=[];group=[]
  for sp in spans:
   if labels[sp.token]=='|':
    if group:grouped.append(group);group=[]
   else:group.append(sp)
  if group:grouped.append(group)
  aligned=[]
  for word,span in zip(words,grouped,strict=True):
   length=sum(t.end-t.start for t in span)
   aligned.append({'word':word,'start':a/sr+span[0].start*ratio,'end':a/sr+span[-1].end*ratio,'probability':sum(t.score*(t.end-t.start) for t in span)/length})
  output.append({'id':s['id'],'text':s['text'],'words':aligned})
  print(s['id'],round(aligned[0]['start'],3),round(aligned[-1]['end'],3),flush=True)
 json.dump({'segments':output},open('analysis/wav2vec-'+audio+'.json','w'),indent=2)
else:
 from torchaudio.pipelines import MMS_FA
 model=MMS_FA.get_model(with_star=False).eval();tokenizer=MMS_FA.get_tokenizer();aligner=MMS_FA.get_aligner()
 output=[]
 for s in json.load(open(windows)):
  a=round(s['start']*sr);b=round(s['end']*sr);clip=torch.from_numpy(samples[a:b])
  words=s['text'].split();tokens=[re.sub("[^a-z']",'',w.lower()) for w in words]
  with torch.inference_mode():emission,_=model(clip.unsqueeze(0))
  emission=emission[0];spans=aligner(emission,tokenizer(tokens));ratio=len(clip)/sr/emission.shape[0]
  aligned=[]
  for word,span in zip(words,spans,strict=True):
   length=sum(t.end-t.start for t in span)
   aligned.append({'word':word,'start':a/sr+span[0].start*ratio,'end':a/sr+span[-1].end*ratio,'probability':sum(t.score*(t.end-t.start) for t in span)/length})
  output.append({'id':s['id'],'text':s['text'],'words':aligned})
  print(s['id'],round(aligned[0]['start'],3),round(aligned[-1]['end'],3),flush=True)
 json.dump({'segments':output},open('analysis/mms-'+audio+'.json','w'),indent=2)
`;
const result=spawnSync(python,['-c',bridge,mode,audio,windows],{stdio:'inherit',env:process.env});
if(result.status!==0)throw new Error(`Alignment process failed: ${result.status}`);
