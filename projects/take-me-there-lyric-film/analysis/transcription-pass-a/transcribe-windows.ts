import {spawnSync} from 'node:child_process';

// The Python bridge calls the existing pretrained recognizer only.
// No lyric text or contextual lyric prompt is supplied to this pass.
const bridge = String.raw`
import json,sys,torch,soundfile as sf,stable_whisper
torch.set_num_threads(3)
x,sr=sf.read(sys.argv[1],dtype='float32')
assert sr==16000
model=stable_whisper.load_model('large-v3-turbo',device='cpu')
windows=json.loads(sys.argv[2])
for window in windows:
 a=round(window['start']*sr);b=round(window['end']*sr)
 result=model.transcribe(x[a:b],language='en',fp16=False,word_timestamps=True,regroup=False,condition_on_previous_text=False,beam_size=5,suppress_silence=False,verbose=None)
 result.offset_time(window['start'])
 result.save_as_json('large-v3-turbo-vocals-'+window['id']+'.json')
 print(window['id'],[(s.start,s.end,s.text) for s in result.segments],flush=True)
`;

const windows: ReadonlyArray<{id: string; start: number; end: number}> = [
  {id: 'opening', start: 0, end: 15},
  {id: 'first-verse', start: 13, end: 30.8},
  {id: 'transition-hooks', start: 47, end: 62},
  {id: 'life', start: 76, end: 84.8},
  {id: 'chops', start: 104, end: 121.5},
  {id: 'closing', start: 118.5, end: 134.932},
];

const python = process.env.ALIGN_PYTHON ?? 'python3';
const run = spawnSync(python, ['-u', '-c', bridge, 'vocals16.wav', JSON.stringify(windows)], {stdio: 'inherit'});
if (run.status !== 0) throw new Error(`Unprompted window transcription failed: ${run.status}`);
