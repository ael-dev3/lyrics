"""Independent-family conditioned CTC timing observations, never lexical proof."""
from pathlib import Path
import argparse,json,re,hashlib,time
import numpy as np,soundfile as sf,torch,torchaudio,uroman
HERE=Path(__file__).resolve().parent;PROJECT=HERE.parents[1]
a=argparse.ArgumentParser();a.add_argument('--phrases',required=True);args=a.parse_args()
phrases=json.loads(Path(args.phrases).read_text());wave,sr=sf.read(str(HERE/'vocals-16000.wav'));assert sr==16000
source_hash=hashlib.sha256((PROJECT/'public/source.mp4').read_bytes()).hexdigest()
torch.set_num_threads(4);bundle=torchaudio.pipelines.MMS_FA;model=bundle.get_model(with_star=False).eval();tokenizer=bundle.get_tokenizer();aligner=bundle.get_aligner();labels=bundle.get_labels(star=None);normalizer=uroman.Uroman()
observations=[]
for phrase in phrases:
 start,end=phrase['crop'];source=phrase['units'];tokens=[re.sub("[^a-z']",'',normalizer.romanize_string(unit).lower()) for unit in source]
 assert all(tokens),f"Empty internal CTC normalized unit in {phrase['id']}"
 lo,hi=round(start*sr),round(end*sr);assert 0<=lo<hi<=len(wave)
 with torch.inference_mode():emission,_=model(torch.from_numpy(wave[lo:hi].astype(np.float32)).unsqueeze(0))
 paths=aligner(emission[0],tokenizer(tokens));step=(hi-lo)/sr/emission.shape[1];words=[]
 for index,(text,token,path) in enumerate(zip(source,tokens,paths)):
  weight=sum(part.end-part.start for part in path)
  words.append({'unitIndex':index,'text':text,'startSeconds':lo/sr+path[0].start*step,'endSeconds':lo/sr+path[-1].end*step,'ctcPathScore':sum(part.score*(part.end-part.start) for part in path)/weight,'characterObservations':[{'internalSymbol':token[j],'startSeconds':lo/sr+part.start*step,'endSeconds':lo/sr+part.end*step,'score':part.score} for j,part in enumerate(path)]})
 greedy=[];best=emission[0].argmax(-1).numpy()
 for i,symbol in enumerate(best):
  if symbol!=0 and (i==0 or best[i-1]!=symbol):greedy.append({'timeSeconds':lo/sr+i*step,'internalSymbol':labels[symbol],'score':float(emission[0,i,symbol].exp())})
 record={'phraseId':phrase['id'],'language':phrase.get('language'),'cropStartSeconds':lo/sr,'cropEndSeconds':hi/sr,'emissionFrameSupportSeconds':step,'conditionedUnits':source,'words':words,'unforcedInternalSymbols':greedy,'humanListening':False,'inputKind':'clock-verified HTDemucs estimate','limits':['Forced CTC placement cannot determine lexical presence.','CTC character cores may omit quiet connected prefixes or held endings.','Japanese internal romanization is model preprocessing and can differ from performed particle pronunciation; no displayed pronunciation layer is created.','Scores are uncalibrated path evidence, not timing accuracy probabilities.']}
 observations.append(record);(HERE/f"ctc-vocals-{phrase['id']}.json").write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'phraseId':phrase['id'],'language':phrase.get('language'),'words':[{k:w[k] for k in ['text','startSeconds','endSeconds','ctcPathScore']} for w in words]},ensure_ascii=False),flush=True)
(HERE/'ctc-vocals-all.json').write_text(json.dumps({'schemaVersion':1,'sourceSha256':source_hash,'modelFamily':'Meta MMS multilingual Wav2Vec2 CTC','model':'torchaudio.pipelines.MMS_FA with_star=False','torch':torch.__version__,'torchaudio':torchaudio.__version__,'conditioned':True,'inputKind':'clock-verified HTDemucs estimate','humanListening':False,'observations':observations},ensure_ascii=False,indent=2)+'\n')
