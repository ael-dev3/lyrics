import {spawnSync} from 'node:child_process';
const python=process.env.ALIGN_PYTHON??'python3';
// Python is used only for the pretrained transcription interface.
const bridge=String.raw`
import json,torch,soundfile as sf,stable_whisper
torch.set_num_threads(4)
model=stable_whisper.load_model('large-v3-turbo',device='cpu')
for audio,start,end in [('audio16',0,12.4),('vocals16',0,12.4),('audio16',124,148.8535),('vocals16',124,148.8535)]:
 samples,sr=sf.read('analysis/'+audio+'.wav',dtype='float32');assert sr==16000
 result=model.transcribe(samples[round(start*sr):round(end*sr)],language='en',regroup=False,verbose=None,condition_on_previous_text=False,temperature=0)
 data=result.to_dict()
 for seg in data['segments']:
  seg['start']+=start;seg['end']+=start
  for word in seg.get('words',[]):word['start']+=start;word['end']+=start
 data['analysisWindow']={'start':start,'end':end,'timing':'segments/words are global seconds; raw ori_dict and nonspeech_sections are crop-relative'}
 json.dump(data,open('analysis/coverage-'+audio+'-'+str(start)+'.json','w'),indent=2)
 print(audio,start,[(s['start'],s['end'],s['text']) for s in data['segments']],flush=True)
`;
const result=spawnSync(python,['-c',bridge],{stdio:'inherit',env:process.env});
if(result.status!==0)throw Error(`Coverage model failed: ${result.status}`);
