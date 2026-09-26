import json,re,hashlib,torch,numpy as np,soundfile as sf
from pathlib import Path
from torchaudio.pipelines import WAV2VEC2_ASR_BASE_960H
base=Path.cwd(); torch.set_num_threads(3)
model=WAV2VEC2_ASR_BASE_960H.get_model().eval();labels=WAV2VEC2_ASR_BASE_960H.get_labels(); lookup={l:i for i,l in enumerate(labels)}
windows=[('first',16.7,23.3,'CAN WE GO FAR AWAY TO A ROOM WITH A VIEW'),('second',62.3,69.2,'CAN WE GO FAR FAR AWAY TO A ROOM WITH A VIEW'),('first-anywhere',24,30.8,"YOU CAN TAKE ME ANYWHERE JUST AS LONG AS I'M WITH YOU"),('last-anywhere',84.8,88.6,'YOU CAN TAKE ME ANYWHERE')]
windows += [
 ('second-anywhere',69.2,76.5,"YOU CAN TAKE ME ANYWHERE JUST AS LONG AS I'M WITH YOU"),
 ('life',77.5,81,'LEAVE A LIFE WHERE DREAMS COME TRUE'),
 ('world',81,84.8,'IN A WORLD THAT LETS YOU BREATHE'),
 ('with-me',88.6,91.8,"JUST AS LONG AS YOU'RE WITH ME"),
 ('closing-one',120.7,124.4,'DREAMS COME TRUE WITH YOU'),
 ('closing-two',124.5,128.2,'DREAMS COME TRUE WITH YOU'),
 ('closing-three',128.3,131.9,'DREAMS COME TRUE WITH YOU'),
 ('initial-lead',0.35,1.95,'TAKE ME THERE')]
outputs=[]
for source in ['mix','vocals']:
 x,sr=sf.read(base/(source+'16.wav'),dtype='float32');assert sr==16000
 for name,start,end,words in windows:
  clip=x[round(start*sr):round(end*sr)]
  with torch.inference_mode(): emission,_=model(torch.from_numpy(clip).unsqueeze(0))
  logp=emission[0].log_softmax(-1).numpy(); T,C=logp.shape;step=len(clip)/sr/T
  text=words.replace(' ','|');tokens=[lookup[c] for c in text];states=np.zeros(2*len(tokens)+1,dtype=int);states[1::2]=tokens
  S=len(states);prev=np.full(S,-np.inf);prev[0]=logp[0,0];prev[1]=logp[0,states[1]];back=np.zeros((T,S),dtype=np.uint8)
  skip=np.array([i>=2 and states[i]!=0 and states[i]!=states[i-2] for i in range(S)])
  for t in range(1,T):
   a=prev;b=np.r_[-np.inf,prev[:-1]];c=np.r_[[-np.inf,-np.inf],prev[:-2]];c[~skip]=-np.inf
   choices=np.stack([a,b,c]);direction=np.argmax(choices,axis=0);back[t]=direction;prev=choices[direction,np.arange(S)]+logp[t,states]
  s=S-1 if prev[-1]>prev[-2] else S-2;path=np.empty(T,dtype=int)
  for t in range(T-1,-1,-1):path[t]=s;s-=int(back[t,s])
  chars=[]
  for i,char in enumerate(text):
   frames=np.flatnonzero(path==i*2+1)
   if len(frames): chars.append(dict(char=char,start=start+frames[0]*step,end=start+(frames[-1]+1)*step,meanProbability=float(np.exp(logp[frames,tokens[i]]).mean())))
  greedy=[];best=logp.argmax(axis=1)
  for t,l in enumerate(best):
   if l and (t==0 or best[t-1]!=l):greedy.append(dict(char=labels[l],start=start+t*step))
  output=dict(source=source,window=name,start=start,end=end,step=step,greedyText=''.join(c['char'] for c in greedy),greedy=greedy,characters=chars)
  outputs.append(output)
  print(source,name,output['greedyText'])
  print([(c['char'],round(c['start'],3),round(c['end'],3),round(c['meanProbability'],3)) for c in chars],flush=True)
Path('english-ctc-comparison.json').write_text(json.dumps({'method':'Independent English wav2vec2 base960h CTC; forced and unprompted greedy comparison; not listening attestation','model':'torchaudio WAV2VEC2_ASR_BASE_960H','torchVersion':torch.__version__,'weightsSha256':hashlib.sha256((Path(torch.hub.get_dir())/'checkpoints/wav2vec2_fairseq_base_ls960_asr_ls960.pth').read_bytes()).hexdigest(),'windows':outputs},indent=2)+'\n')
