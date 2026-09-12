import {spawnSync} from 'node:child_process';
const python=process.env.ALIGN_PYTHON??'python3';
const bridge=String.raw`
import torch,stable_whisper,soundfile as sf
from pathlib import Path
torch.set_num_threads(4)
audio,sr=sf.read('analysis/audio16.wav',dtype='float32');assert sr==16000
model=stable_whisper.load_model('large-v3-turbo',device='cpu')
result=model.transcribe(audio,language='en',regroup=False,verbose=None)
result.save_as_json('analysis/original-cue-audit/blind-full-mix-transcription.json')
`;
const p=spawnSync(python,['-c',bridge],{stdio:'inherit',env:process.env});if(p.status!==0)throw Error('Blind audit failed');
