"""Unprompted original-mix lexical observations; never canonical timing."""
import argparse,json,hashlib,subprocess,time
from pathlib import Path
from importlib.metadata import version
import numpy as np,soundfile as sf,torch,stable_whisper
HERE=Path(__file__).resolve().parent;PROJECT=HERE.parents[1]
a=argparse.ArgumentParser();a.add_argument('--model',default='large-v3-turbo');a.add_argument('--start',type=float,default=0);a.add_argument('--end',type=float);a.add_argument('--language',default='auto');a.add_argument('--tag',required=True);a.add_argument('--input',choices=['original','vocals'],default='original');args=a.parse_args()
source=PROJECT/'public/source.mp4';assert source.is_file(),'Exact source not present yet'
source_hash=hashlib.sha256(source.read_bytes()).hexdigest()
meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(source)]))
streams=[s for s in meta['streams'] if s['codec_type']=='audio'];assert len(streams)==1
print(json.dumps({'phase':'decode','sourceSha256':source_hash,'sourceAudio':streams[0]},ensure_ascii=False),flush=True)
for sr in [44100,16000]:
 path=HERE/f'original-mix-{sr}.wav'
 if not path.exists():subprocess.run(['ffmpeg','-v','error','-nostdin','-xerror','-err_detect','explode','-i',str(source),'-map','0:a:0','-ac','1' if sr==16000 else str(streams[0]['channels']),'-ar',str(sr),'-c:a','pcm_f32le',str(path)],check=True)
input_path=HERE/'original-mix-16000.wav'
if args.input=='vocals':
 input_path=HERE/'vocals-16000.wav'
 if not input_path.exists():subprocess.run(['ffmpeg','-v','error','-nostdin','-i',str(HERE/'stems/htdemucs/source/vocals.wav'),'-ac','1','-ar','16000','-c:a','pcm_f32le',str(input_path)],check=True)
wave,sr=sf.read(str(input_path));assert sr==16000
hi=len(wave)/sr if args.end is None else min(args.end,len(wave)/sr)
assert 0<=args.start<hi
lo_sample=round(args.start*sr);hi_sample=round(hi*sr)
torch.set_num_threads(4);print(json.dumps({'phase':'load-model','model':args.model,'cropStart':args.start,'cropEnd':hi}),flush=True)
model=stable_whisper.load_model(args.model,device='cpu');begun=time.monotonic()
result=model.transcribe(wave[lo_sample:hi_sample].astype(np.float32),language=None if args.language=='auto' else args.language,verbose=False,temperature=0,condition_on_previous_text=False,initial_prompt=None,word_timestamps=True,regroup=False,suppress_silence=False,fp16=False)
result.offset_time(lo_sample/sr)
out={'schemaVersion':1,'status':'unprompted ASR lexical/timing observation; not listening attestation or selected timing','sourceSha256':source_hash,'method':{'model':args.model,'modelFamily':'OpenAI Whisper','checkpointSha256':hashlib.sha256((Path.home()/'.cache/whisper'/f'{args.model}.pt').read_bytes()).hexdigest(),'implementation':'stable-ts '+version('stable-ts'),'language':args.language,'conditioningText':None,'initialPrompt':None,'conditionOnPreviousText':False,'suppressSilence':False,'inputKind':args.input,'inputFile':str(input_path.relative_to(PROJECT)),'originalSourceZeroPreserved':True,'sourceCropStartSample16000':lo_sample,'sourceCropEndSample16000':hi_sample,'cropStartSeconds':lo_sample/sr,'cropEndSeconds':hi_sample/sr,'humanListening':False,'elapsedSeconds':time.monotonic()-begun,'torch':torch.__version__},'result':result.to_dict()}
(HERE/(args.tag+'.json')).write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'phase':'complete','tag':args.tag,'elapsedSeconds':out['method']['elapsedSeconds'],'language':out['result'].get('language'),'segments':[{k:s[k] for k in ['start','end','text']} for s in out['result']['segments']]},ensure_ascii=False),flush=True)
