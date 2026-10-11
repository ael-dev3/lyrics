import json, time, random
from pathlib import Path
import torch, numpy as np, soundfile as sf
from demucs.hf import load_safetensors_model
from demucs.apply import apply_model

root=Path(__file__).resolve().parents[2]
torch.set_num_threads(2);torch.set_num_interop_threads(1)
random.seed(0);np.random.seed(0);torch.manual_seed(0)
weights=next((Path.home()/'.cache/huggingface/hub/models--adefossez--HTDemucs/snapshots').glob('*/955717e8.safetensors'))
model=load_safetensors_model(weights).eval()
pcm=np.fromfile(root/'analysis/stereo44100.f32',dtype='<f4').reshape(-1,2)
wave=torch.from_numpy(pcm.T.copy());reference=wave.mean(0);mean=reference.mean();std=reference.std()
started=time.monotonic()
with torch.inference_mode():
    result=apply_model(model,((wave-mean)/std).unsqueeze(0),device='cpu',shifts=1,split=True,overlap=.25,progress=True)[0]*std+mean
vocals=result[model.sources.index('vocals')].T.numpy()
assert vocals.shape==pcm.shape
sf.write(root/'analysis/vocals44100.wav',vocals,44100,subtype='FLOAT')
(root/'analysis/demucs-native-provenance.json').write_text(json.dumps({'model':'HTDemucs 955717e8 cached safetensors','torch':torch.__version__,'sampleRate':44100,'inputSamples':len(pcm),'vocalSamples':len(vocals),'channels':2,'sourceClockOffsetSeconds':0,'shifts':1,'overlap':.25,'randomSeed':0,'elapsedSeconds':time.monotonic()-started,'humanListening':False,'limits':'Estimated vocals can smear consonants, retain echo and leak instruments; original audio remains authoritative.'},indent=2)+'\n')
print('Native-rate vocal estimate saved with unchanged sample count.',flush=True)
