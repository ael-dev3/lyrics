"""Unconstrained recording observations, kept separate from performed text.

Native Python adapter for stable-whisper/PyTorch. No model result is a listener
attestation or a source of automatic lyric approval.
"""
import argparse,json,time
from pathlib import Path
import torch,soundfile as sf,stable_whisper

parser=argparse.ArgumentParser();parser.add_argument('--model',default='large-v3-turbo');parser.add_argument('--threads',type=int,default=4);parser.add_argument('--input',default='analysis/mix16.wav');parser.add_argument('--output')
args=parser.parse_args();root=Path(__file__).resolve().parents[2]
torch.set_num_threads(args.threads);torch.set_num_interop_threads(1)
wave,sr=sf.read(root/args.input,dtype='float32');assert sr==16000 and wave.ndim==1
begun=time.monotonic();model=stable_whisper.load_model(args.model,device='cpu')
result=model.transcribe(wave,language='ru',verbose=False,temperature=0,condition_on_previous_text=False,initial_prompt=None,word_timestamps=True,regroup=False,suppress_silence=False,fp16=False)
record=result.to_dict();record['provenance']={'model':args.model,'input':args.input,'sourceSha256':json.loads((root/'source/recording.json').read_text())['sourceSha256'],'conditioningText':None,'humanListening':False,'sourceClockOffsetSeconds':0,'elapsedSeconds':time.monotonic()-begun}
(root/(args.output or f'analysis/coverage-{args.model}.json')).write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'model':args.model,'elapsedSeconds':record['provenance']['elapsedSeconds'],'segments':[{'start':s['start'],'end':s['end'],'text':s['text']} for s in record['segments']]},ensure_ascii=False),flush=True)
