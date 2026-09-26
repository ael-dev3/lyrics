import {spawnSync} from 'node:child_process';

// Independent unprompted recognition on spans where the preview appears empty.
const bridge=String.raw`
import json,sys,torch,soundfile as sf,stable_whisper
torch.set_num_threads(3)
model=stable_whisper.load_model('large-v3-turbo',device='cpu')
windows=json.loads(sys.argv[1])
for name in ['mix','vocals']:
 x,sr=sf.read(name+'16.wav',dtype='float32');assert sr==16000
 for w in windows:
  a=round(w['start']*sr);b=round(w['end']*sr)
  result=model.transcribe(x[a:b],language='en',fp16=False,word_timestamps=True,regroup=False,condition_on_previous_text=False,beam_size=5,suppress_silence=False,verbose=None)
  result.offset_time(w['start'])
  result.save_as_json('large-v3-turbo-'+name+'-gap-'+w['id']+'.json')
  print(name,w['id'],[(s.start,s.end,s.text) for s in result.segments],flush=True)
`;
const windows=process.argv.includes('--lead-only')?[{id:'forty-five-lead-only',start:43.8,end:46.2}]:[
 {id:'forty-five',start:40,end:48.2},
 {id:'intro-tail',start:11.6,end:17.2},
 {id:'middle-tail',start:57.3,end:63.2},
 {id:'late',start:109,end:121.5},
];
const result=spawnSync(process.env.ALIGN_PYTHON??'python3',['-u','-c',bridge,JSON.stringify(windows)],{stdio:'inherit'});
if(result.status!==0)throw Error(`Gap recognition failed:${result.status}`);
