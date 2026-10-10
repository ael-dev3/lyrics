"""Relative acoustic similarity diagnostics; no inferred absolute lyric truth."""
from pathlib import Path
import json, numpy as np,soundfile as sf
from scipy.signal import correlate,find_peaks
root=Path(__file__).resolve().parents[2];v,sr=sf.read(root/'analysis/vocals16.wav',dtype='float32')
for lo,hi in [(37.15,37.88),(38.1,39.03),(40,40.89),(97.15,97.88)]:
 ref=v[round(lo*sr):round(hi*sr)];ref=ref-ref.mean()
 c=correlate(v,ref,mode='valid',method='fft');norm=np.sqrt(np.maximum(1e-12,np.convolve(v*v,np.ones(len(ref),np.float32),mode='valid')*np.sum(ref*ref)));score=c/norm
 peaks,_=find_peaks(score,height=.1,distance=round(sr*.6));best=sorted([(float(score[p]),round(p/sr,4)) for p in peaks if 36<p/sr<60 or 96<p/sr<140],reverse=True)[:28]
 print(json.dumps({'reference':[lo,hi],'peaks':best}),flush=True)
