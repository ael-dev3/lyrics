import {spawnSync} from 'node:child_process';
const code=String.raw`
import torch,soundfile as sf,json
from torchaudio.pipelines import MMS_FA
torch.set_num_threads(2)
model=MMS_FA.get_model(with_star=False).eval();labels=MMS_FA.get_labels(star=None)
x,sr=sf.read('analysis/vocals16.wav',dtype='float32');records=[]
for start,end in [(29,41),(78,91),(128,141)]:
 with torch.inference_mode():p,_=model(torch.from_numpy(x[int(start*sr):int(end*sr)]).unsqueeze(0))
 p=p[0].exp();ids=p.argmax(-1);dt=(end-start)/len(ids);events=[]
 prev=-1
 for i,k in enumerate(ids.tolist()):
  if k and k!=prev:events.append({'t':round(start+i*dt,3),'label':labels[k],'p':round(p[i,k].item(),3)})
  prev=k
 records.append({'start':start,'end':end,'events':events})
 print(start,events,flush=True)
json.dump(records,open('analysis/acoustic-events.json','w'),indent=2)
`;
const r=spawnSync(process.env.ALIGN_PYTHON??'python3',['-c',code],{stdio:'inherit'});if(r.status!==0)throw Error('Acoustic audit failed');
