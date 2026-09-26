import {spawnSync} from 'node:child_process';
const bridge=String.raw`
import json,sys,torch,soundfile as sf,stable_whisper,numpy as np,subprocess
torch.set_num_threads(3)
model=stable_whisper.load_model('large-v3-turbo',device='cpu')
windows=[{'id':'first-phrase','start':16.7,'end':20.3,'speed':1},{'id':'first-phrase-slow','start':16.7,'end':20.3,'speed':0.8},{'id':'first-far','start':17.95,'end':19.45,'speed':1}]
for name in ['mix','vocals']:
 x,sr=sf.read(name+'16.wav',dtype='float32');assert sr==16000
 for w in windows:
  clip=x[round(w['start']*sr):round(w['end']*sr)];speed=w['speed']
  if speed!=1:
   raw=subprocess.run(['ffmpeg','-v','error','-f','f32le','-ar','16000','-ac','1','-i','pipe:0','-af','atempo='+str(speed),'-f','f32le','pipe:1'],input=clip.tobytes(),stdout=subprocess.PIPE,check=True).stdout
   clip=np.frombuffer(raw,dtype=np.float32).copy()
  result=model.transcribe(clip,language='en',fp16=False,word_timestamps=True,regroup=False,condition_on_previous_text=False,beam_size=5,suppress_silence=False,verbose=None)
  data=result.to_dict()
  for s in data['segments']:
   s['start']=s['start']*speed+w['start'];s['end']=s['end']*speed+w['start']
   for word in s['words']:word['start']=word['start']*speed+w['start'];word['end']=word['end']*speed+w['start']
  data['analysisWindow']=w;data['sourceAudio']=name;data['note']='Unprompted ASR on bounded audio; output timestamps manually transformed back to original source clock. ori_dict, if present, retains raw recognizer timing.'
  json.dump(data,open('large-v3-turbo-'+name+'-review-'+w['id']+'.json','w'),indent=2)
  print(name,w['id'],[(s['start'],s['end'],s['text']) for s in data['segments']],flush=True)
`;
const result=spawnSync(process.env.ALIGN_PYTHON??'python3',['-u','-c',bridge],{stdio:'inherit'});
if(result.status!==0)throw Error('Bounded verse recognition failed');
