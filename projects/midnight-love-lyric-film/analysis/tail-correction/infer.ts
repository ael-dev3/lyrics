import {spawnSync} from 'node:child_process';
const python = process.env.ALIGN_PYTHON ?? 'python3';
const mode = process.argv[2] ?? 'transcribe', audio = process.argv[3] ?? 'vocals16';
const start = process.argv[4] ?? '150';
// Python is confined to pretrained audio model interfaces; input time zero is unchanged.
const bridge = String.raw`
import sys,json,re,torch,soundfile as sf
mode,audio,start=sys.argv[1:];start=float(start);torch.set_num_threads(2)
samples,sr=sf.read('analysis/'+audio+'.wav',dtype='float32');assert sr==16000
root='analysis/tail-correction/'
if mode=='transcribe':
 import stable_whisper
 model=stable_whisper.load_model('large-v3-turbo',device='cpu')
 result=model.transcribe(samples[round(start*sr):],language='en',regroup=False,verbose=None,condition_on_previous_text=False,temperature=0)
 data=result.to_dict()
 for s in data['segments']:
  s['start']+=start;s['end']+=start
  for w in s.get('words',[]):w['start']+=start;w['end']+=start
 data['analysisWindow']={'start':start,'end':len(samples)/sr,'timeConvention':'Top-level segments and words use global source seconds. Retained raw ori_dict and nonspeech_sections use crop-relative seconds; add this window start before comparing them to the source.'}
 suffix='' if start==150 else '-from-'+str(int(start))
 json.dump(data,open(root+'transcribe-'+audio+suffix+'.json','w'),indent=2)
 for s in data['segments']:print(s['start'],s['end'],s['text'],flush=True)
elif mode=='whisper':
 import stable_whisper
 model=stable_whisper.load_model('large-v3-turbo',device='cpu');output=[]
 for s in json.load(open(root+'windows.json')):
  result=model.align_words(samples,[s],language='en',regroup=False,suppress_silence=True,verbose=None)
  words=[w for seg in result.to_dict()['segments'] for w in seg['words']]
  output.append({'id':s['id'],'text':s['text'],'words':words});print(s['id'],words,flush=True)
 json.dump({'segments':output},open(root+'whisper-'+audio+'.json','w'),indent=2)
else:
 if mode=='wav2vec':
  from torchaudio.pipelines import WAV2VEC2_ASR_BASE_960H
  from torchaudio.functional import forced_align,merge_tokens
  model=WAV2VEC2_ASR_BASE_960H.get_model().eval();labels=WAV2VEC2_ASR_BASE_960H.get_labels();vocab={c:i for i,c in enumerate(labels)}
 else:
  from torchaudio.pipelines import MMS_FA
  model=MMS_FA.get_model(with_star=False).eval();tokenizer=MMS_FA.get_tokenizer();aligner=MMS_FA.get_aligner()
 output=[]
 for s in json.load(open(root+'windows.json')):
  a=round(s['start']*sr);b=round(s['end']*sr);clip=torch.from_numpy(samples[a:b]);words=s['text'].split()
  with torch.inference_mode():emission,_=model(clip.unsqueeze(0))
  if mode=='wav2vec':
   tokens=[re.sub("[^A-Z']",'',w.upper()) for w in words];target='|'.join(tokens)
   path,scores=forced_align(emission.log_softmax(-1),torch.tensor([[vocab[c] for c in target]]),blank=0)
   spans=merge_tokens(path[0],scores[0].exp());ratio=len(clip)/sr/emission.shape[1];grouped=[];group=[]
   for sp in spans:
    if labels[sp.token]=='|':
     if group:grouped.append(group);group=[]
    else:group.append(sp)
   if group:grouped.append(group)
  else:
   tokens=[re.sub("[^a-z']",'',w.lower()) for w in words];emission=emission[0];grouped=aligner(emission,tokenizer(tokens));ratio=len(clip)/sr/emission.shape[0]
  aligned=[]
  for word,span in zip(words,grouped,strict=True):
   length=sum(t.end-t.start for t in span)
   aligned.append({'word':word,'start':a/sr+span[0].start*ratio,'end':a/sr+span[-1].end*ratio,'probability':sum(t.score*(t.end-t.start) for t in span)/length})
  output.append({'id':s['id'],'text':s['text'],'words':aligned});print(s['id'],aligned,flush=True)
 json.dump({'segments':output},open(root+mode+'-'+audio+'.json','w'),indent=2)
`;
const result = spawnSync(python, ['-c', bridge, mode, audio, start], {stdio: 'inherit', env: process.env});
if (result.status !== 0) throw Error(`Tail inference failed (${mode}/${audio}): ${result.status}`);
