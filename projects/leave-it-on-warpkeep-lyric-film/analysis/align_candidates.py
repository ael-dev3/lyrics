"""Independent acoustic forced-alignment candidates; supplied text is not existence proof."""
import json,os,re,sys
from pathlib import Path
import soundfile as sf
import torch
from torchaudio.functional import forced_align,merge_tokens
ROOT=Path(__file__).resolve().parent
MODE=sys.argv[1];LABEL=sys.argv[2] if len(sys.argv)>2 else 'v1'
windows=json.loads((ROOT/f'windows-{LABEL}.json').read_text())
x,sr=sf.read(ROOT/os.environ.get('ALIGN_AUDIO','source-mono-16k.wav'),dtype='float32');assert sr==16000
torch.set_num_threads(3)
if MODE=='mms':
 from torchaudio.pipelines import MMS_FA
 model=MMS_FA.get_model(with_star=False).eval();tokenizer=MMS_FA.get_tokenizer();aligner=MMS_FA.get_aligner()
else:
 from torchaudio.pipelines import WAV2VEC2_ASR_BASE_960H
 model=WAV2VEC2_ASR_BASE_960H.get_model().eval();labels=WAV2VEC2_ASR_BASE_960H.get_labels();vocab={c:i for i,c in enumerate(labels)}
rows=[]
for win in windows:
 left=round(win['start']*sr);right=round(win['end']*sr);clip=torch.from_numpy(x[left:right]);words=win['text'].split()
 with torch.inference_mode():emission,_=model(clip.unsqueeze(0))
 if MODE=='mms':
  spans=aligner(emission[0],tokenizer([re.sub('[^a-z]','',w.lower()) for w in words]));ratio=len(clip)/sr/emission.shape[1]
 else:
  target='|'.join(re.sub('[^A-Z]','',w.upper()) for w in words);ids=torch.tensor([[vocab[c] for c in target]])
  path,scores=forced_align(emission.log_softmax(-1),ids,blank=0);token_spans=merge_tokens(path[0],scores[0].exp());ratio=len(clip)/sr/emission.shape[1]
  spans=[];group=[]
  for span in token_spans:
   if labels[span.token]=='|':
    if group:spans.append(group);group=[]
   else:group.append(span)
  if group:spans.append(group)
 assert len(words)==len(spans),(win['id'],len(words),len(spans))
 aligned=[]
 for w,s in zip(words,spans):
  n=sum(t.end-t.start for t in s)
  aligned.append({'text':w,'start':round(left/sr+s[0].start*ratio,6),'end':round(left/sr+s[-1].end*ratio,6),'probability':sum(t.score*(t.end-t.start) for t in s)/n})
 row={**win,'words':aligned};rows.append(row)
 (ROOT/f"raw-{MODE}-{os.environ.get('ALIGN_OUTPUT_LABEL',LABEL)}.json").write_text(json.dumps(rows,indent=2)+'\n')
 print(win['id'],[(w['text'],round(w['start'],2),round(w['end'],2),round(w['probability'],2)) for w in aligned],flush=True)
