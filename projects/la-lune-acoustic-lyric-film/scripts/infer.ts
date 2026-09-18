import {spawnSync} from 'node:child_process';
// Python is a bridge to the existing pretrained audio models only.
const python=process.env.ALIGN_PYTHON??'python3';
const bridge=String.raw`
import sys,os,json
os.environ['HF_HUB_OFFLINE']='1'
import torch,soundfile as sf,numpy as np
torch.set_num_threads(4)
mode=sys.argv[1]
if mode in ['separate','drums']:
 from demucs.pretrained import get_model
 from demucs.apply import apply_model
 import torchaudio.functional as AF
 model=get_model('htdemucs')
 x,sr=sf.read('analysis/mix48.wav',dtype='float32',always_2d=True)
 x=torch.from_numpy(x.T.copy())
 x=AF.resample(x,sr,model.samplerate)
 ref=x.mean(0);mean=ref.mean();std=ref.std();x=(x-mean)/std
 with torch.inference_mode():stems=apply_model(model,x[None],device='cpu',shifts=1,split=True,overlap=.25,progress=True,num_workers=0)[0]
 stems=stems*std+mean
 for name in (['drums'] if mode=='drums' else ['vocals']):
  v=stems[model.sources.index(name)]
  sf.write('analysis/'+name+'44.wav',v.T.numpy(),model.samplerate,subtype='FLOAT')
  v16=AF.resample(v.mean(0),model.samplerate,16000)
  sf.write('analysis/'+name+'16.wav',v16.numpy(),16000,subtype='FLOAT')
 print('separation complete',flush=True)
elif mode in ['transcribe','windows','compress']:
 import stable_whisper
 name=sys.argv[2]
 x,sr=sf.read('analysis/'+name+'16.wav',dtype='float32');assert sr==16000
 modelname=sys.argv[4] if len(sys.argv)>4 else 'large-v3-turbo'
 model=stable_whisper.load_model(modelname,device='cpu',download_root='models' if modelname=='large-v3' else None)
 windows=json.load(open(sys.argv[3])) if mode in ['windows','compress'] else [{'id':'full','start':0,'end':len(x)/sr}]
 for w in windows:
  a=round(w['start']*sr);b=round(w['end']*sr)
  clip=x[a:b]
  factor=w.get('factor',1) if mode=='compress' else 1
  if factor!=1:
   import subprocess
   raw=subprocess.run(['ffmpeg','-v','error','-f','f32le','-ar','16000','-ac','1','-i','pipe:0','-af','atempo='+str(factor),'-f','f32le','pipe:1'],input=clip.tobytes(),stdout=subprocess.PIPE,check=True).stdout
   clip=np.frombuffer(raw,dtype=np.float32).copy()
  result=model.transcribe(clip,language='fr',task='transcribe',fp16=False,verbose=None,regroup=False,word_timestamps=True,condition_on_previous_text=False,beam_size=5)
  if factor!=1:result.rescale_time(factor)
  result.offset_time(w['start'])
  suffix='-'+w['id'] if mode in ['windows','compress'] else ''
  if mode=='compress':suffix+='-compress-'+modelname
  elif modelname!='large-v3-turbo':suffix+='-'+modelname
  result.save_as_json('analysis/transcription-'+name+suffix+'.json')
  for s in result.segments:print(f'{s.start:.3f} {s.end:.3f} {s.text}',flush=True)
`;
const run=spawnSync(python,['-c',bridge,...process.argv.slice(2)],{stdio:'inherit'});
if(run.status!==0)throw new Error(`Model bridge failed: ${run.status}`);
