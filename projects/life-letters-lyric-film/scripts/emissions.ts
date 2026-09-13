import {spawnSync} from 'node:child_process';
const python=process.env.ALIGN_PYTHON??'python3';
const bridge=String.raw`
import torch,soundfile as sf,json,numpy as np
from torchaudio.pipelines import MMS_FA
torch.set_num_threads(4)
model=MMS_FA.get_model(with_star=False).eval();labels=MMS_FA.get_labels(star=None)
x,sr=sf.read('analysis/vocals16.wav',dtype='float32');assert sr==16000
observations=[]
for start,end in [(0,18),(70,92),(92,118),(118,143.5),(179,212.5),(225,261.526)]:
 a=round(start*sr);b=round(end*sr)
 with torch.inference_mode():logits,_=model(torch.from_numpy(x[a:b]).unsqueeze(0))
 probs=logits[0].softmax(-1);ids=probs.argmax(-1);step=(b-a)/sr/len(ids)
 runs=[];last=-1
 for i,token in enumerate(ids.tolist()):
  if token==last:runs[-1]['end']=start+(i+1)*step
  else:runs.append({'token':token,'start':start+i*step,'end':start+(i+1)*step,'p':float(probs[i,token])})
  last=token
 text=''.join(labels[r['token']] for r in runs if r['token']!=0)
 print(start,end,text,flush=True)
 observations.append({'start':start,'end':end,'step':step,'runs':runs,'vowelPosteriors':{v:probs[:,labels.index(v)].tolist() for v in ['a','e','i','o','u']}})
json.dump({'status':'Raw model observations, not accepted source transcription','labels':labels,'regions':observations},open('analysis/mms-emissions.json','w'))
`;
const result=spawnSync(python,['-c',bridge],{stdio:'inherit'});
if(result.status!==0)throw Error('Emission study failed');
