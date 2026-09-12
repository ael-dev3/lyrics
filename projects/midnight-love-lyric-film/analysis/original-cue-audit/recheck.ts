import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const original=JSON.parse(readFileSync('../midnight-love/src/cues.json','utf8')) as {id:string;words:{text:string}[]}[];
const windows=[{id:'L07-a',cue:'L07',start:35.7,end:37.95},{id:'L07-b',cue:'L07',start:35.95,end:37.95},{id:'L19',cue:'L19',start:80.35,end:82.55}].map(s=>({...s,text:original.find(c=>c.id===s.cue)?.words.map(w=>w.text).join(' ')}));
writeFileSync('analysis/original-cue-audit/recheck-windows.json',JSON.stringify(windows,null,2));
const bridge=String.raw`
import json,re,torch,soundfile as sf
from torchaudio.pipelines import MMS_FA,WAV2VEC2_ASR_BASE_960H
from torchaudio.functional import forced_align,merge_tokens
torch.set_num_threads(4)
windows=json.load(open('analysis/original-cue-audit/recheck-windows.json'))
for method in ['mms','english']:
 if method=='mms':
  model=MMS_FA.get_model(with_star=False).eval();tokenizer=MMS_FA.get_tokenizer();aligner=MMS_FA.get_aligner()
 else:
  model=WAV2VEC2_ASR_BASE_960H.get_model().eval();labels=WAV2VEC2_ASR_BASE_960H.get_labels();vocab={c:i for i,c in enumerate(labels)}
 for source in ['vocals16','audio16']:
  samples,sr=sf.read('analysis/'+source+'.wav',dtype='float32');assert sr==16000
  output=[]
  for s in windows:
   a=round(s['start']*sr);b=round(s['end']*sr);clip=torch.from_numpy(samples[a:b]);words=s['text'].split()
   with torch.inference_mode():emission,_=model(clip.unsqueeze(0))
   if method=='mms':
    emission=emission[0];spans=aligner(emission,tokenizer([re.sub("[^a-z']",'',w.lower()) for w in words]));ratio=len(clip)/sr/emission.shape[0]
   else:
    target='|'.join(re.sub("[^A-Z']",'',w.upper()) for w in words)
    path,scores=forced_align(emission.log_softmax(-1),torch.tensor([[vocab[c] for c in target]]),blank=0)
    tokens=merge_tokens(path[0],scores[0].exp());ratio=len(clip)/sr/emission.shape[1];spans=[];group=[]
    for sp in tokens:
     if labels[sp.token]=='|':
      if group:spans.append(group);group=[]
     else:group.append(sp)
    if group:spans.append(group)
   aligned=[]
   for word,span in zip(words,spans,strict=True):
    length=sum(t.end-t.start for t in span)
    aligned.append({'word':word,'start':a/sr+span[0].start*ratio,'end':a/sr+span[-1].end*ratio,'probability':sum(t.score*(t.end-t.start) for t in span)/length})
   output.append({'id':s['id'],'text':s['text'],'words':aligned})
  json.dump({'segments':output},open('analysis/original-cue-audit/recheck-'+method+'-'+source+'.json','w'),indent=2)
  print(method,source,[(s['id'],s['words'][0]['start'],s['words'][0]['end']) for s in output],flush=True)
`;
const p=spawnSync(process.env.ALIGN_PYTHON??'python3',['-c',bridge],{stdio:'inherit',env:process.env});if(p.status!==0)throw Error('Recheck failed');
