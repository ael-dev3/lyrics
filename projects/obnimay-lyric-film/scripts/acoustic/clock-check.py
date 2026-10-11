"""Native waveform correlation; estimates stem clock lag, not word ownership."""
import json
from pathlib import Path
import numpy as np,soundfile as sf
from scipy.signal import correlate
root=Path(__file__).resolve().parents[2]
original=np.fromfile(root/'analysis/stereo44100.f32',dtype='<f4').reshape(-1,2).mean(axis=1)
stem,sr=sf.read(root/'analysis/vocals44100.wav',dtype='float32');stem=stem.mean(axis=1)
assert sr==44100 and len(original)==len(stem)
records=[];radius=round(.08*sr)
for a,b in [(5.5,9),(31.5,42),(44,55.8),(119.5,130),(132,143.8),(183.3,197.8)]:
    lo,hi=round(a*sr),round(b*sr);x=stem[lo:hi].astype('float64');y=original[lo-radius:hi+radius].astype('float64')
    c=correlate(y,x,mode='valid',method='fft');energy=np.r_[0,np.cumsum(y*y)];denom=np.sqrt((energy[len(x):]-energy[:-len(x)])*np.sum(x*x));c/=np.maximum(denom,1e-18)
    p=int(np.argmax(c));records.append({'crop':[a,b],'lagSamples':p-radius,'lagSeconds':(p-radius)/sr,'peakCorrelation':float(c[p]),'zeroLagCorrelation':float(c[radius])})
data={'schemaVersion':1,'sampleRate':sr,'originalSamples':len(original),'estimatedVocalSamples':len(stem),'observations':records,
      'medianLagSamples':float(np.median([r['lagSamples'] for r in records])),
      'scope':'Normalized source/stem cross-correlation, ±80 ms search. Diagnostic fixed-delay check; does not prove lexical boundaries or actual listening.'}
(root/'source/vocal-clock-check.json').write_text(json.dumps(data,indent=2)+'\n');print(json.dumps(data),flush=True)
