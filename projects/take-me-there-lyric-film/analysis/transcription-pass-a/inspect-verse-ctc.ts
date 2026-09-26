import {spawnSync} from 'node:child_process';
const bridge=String.raw`
import json,re,torch,soundfile as sf
from torchaudio.pipelines import WAV2VEC2_ASR_BASE_960H,MMS_FA
from torchaudio.functional import forced_align,merge_tokens
torch.set_num_threads(3)
windows=[{'id':'first','start':16.7,'end':23.3,'text':'Can we go far away to a room with a view'},{'id':'first-double','start':16.7,'end':23.3,'text':'Can we go far far away to a room with a view'},{'id':'second','start':62.3,'end':69.2,'text':'Can we go far far away to a room with a view'}]
model=WAV2VEC2_ASR_BASE_960H.get_model().eval();labels=WAV2VEC2_ASR_BASE_960H.get_labels();vocab={c:i for i,c in enumerate(labels)}
output=[]
for name in ['mix','vocals']:
 x,sr=sf.read(name+'16.wav',dtype='float32');assert sr==16000
 cache={}
 for w in windows:
  a=round(w['start']*sr);b=round(w['end']*sr);clip=torch.from_numpy(x[a:b])
  if (a,b) not in cache:
   with torch.inference_mode():emission,_=model(clip.unsqueeze(0))
   cache[(a,b)]=emission.log_softmax(-1)
  logprob=cache[(a,b)];ratio=len(clip)/sr/logprob.shape[1]
  words=w['text'].split();target='|'.join(re.sub("[^A-Z']",'',word.upper()) for word in words)
  path,scores=forced_align(logprob,torch.tensor([[vocab[c] for c in target]]),blank=0)
  spans=merge_tokens(path[0],scores[0].exp());groups=[];g=[]
  for sp in spans:
   if labels[sp.token]=='|':
    if g:groups.append(g);g=[]
   else:g.append(sp)
  if g:groups.append(g)
  aligned=[]
  for word,g in zip(words,groups,strict=True):
   length=sum(t.end-t.start for t in g)
   aligned.append({'word':word,'start':a/sr+g[0].start*ratio,'end':a/sr+g[-1].end*ratio,'score':sum(t.score*(t.end-t.start) for t in g)/length,'characters':[{'char':labels[t.token],'start':a/sr+t.start*ratio,'end':a/sr+t.end*ratio,'score':t.score} for t in g]})
  best=logprob[0].argmax(-1);raw=[];previous=-1
  for i,token in enumerate(best.tolist()):
   if token!=previous and token!=0:raw.append({'char':labels[token],'time':a/sr+i*ratio,'score':float(logprob[0,i,token].exp())})
   previous=token
  output.append({'audio':name,**w,'greedyText':''.join(t['char'] for t in raw),'greedyCharacters':raw,'forcedWords':aligned})
  print(name,w['id'],''.join(t['char'] for t in raw),[(t['word'],round(t['start'],3),round(t['end'],3),round(t['score'],3)) for t in aligned],flush=True)
json.dump({'method':'Independent English Wav2Vec2_ASR_BASE_960H; unprompted greedy character paths and separately forced candidate text','segments':output},open('wav2vec-verse-review.json','w'),indent=2)
`;
const result=spawnSync(process.env.ALIGN_PYTHON??'python3',['-u','-c',bridge],{stdio:'inherit'});
if(result.status!==0)throw Error('Independent verse CTC inspection failed');
