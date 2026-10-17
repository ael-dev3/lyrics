"""Original/stem signal views; 64 ms Hann windows with 5 ms view hop.

Matrices and model marks support editorial timing selection. They are not
millisecond certainty, listening attestation or automatic word ownership.
"""
from pathlib import Path
import json,numpy as np,soundfile as sf
from scipy import signal
root=Path(__file__).resolve().parents[2];ed=json.loads((root/'source/editorial.json').read_text());mix,sr=sf.read(root/'analysis/mix-16k.wav',dtype='float32');vocal,vr=sf.read(root/'analysis/vocals-16k.wav',dtype='float32');assert sr==vr==16000
hz=np.geomspace(100,6000,100);out=root/'analysis/spectral-review';out.mkdir(exist_ok=True)
for p in ed['phrases']:
 lo,hi=p['crop'];hi={'NN-007':59.35,'NN-015':90.1,'NN-024':133.3,'NN-039':195.013}.get(p['id'],hi);left,right=round(lo*sr),round(hi*sr);tracks=[];dbs=[]
 for sound in [mix,vocal]:
  x=sound[left:right];freq,t,z=signal.stft(x,sr,nperseg=1024,noverlap=944,nfft=2048,boundary='zeros',padded=False);spec=20*np.log10(np.maximum(np.abs(z),1e-7));spec=np.stack([np.interp(hz,freq,spec[:,i]) for i in range(len(t))],axis=1);tracks.append(np.round(np.clip((spec+85)/70,0,1)*255).astype('uint8').tolist())
  pref=np.r_[0,np.cumsum(x.astype('float64')**2)];c=np.minimum(len(x),np.round(t*sr).astype(int));a=np.maximum(0,c-320);b=np.minimum(len(x),c+320);dbs.append(np.round(10*np.log10(np.maximum(1e-12,(pref[b]-pref[a])/np.maximum(1,b-a))),2).tolist())
 d={'id':p['id'],'crop':[lo,hi],'times':np.round(lo+t,4).tolist(),'spectrograms':tracks,'mixDb':dbs[0],'vocalDb':dbs[1],'window':.064,'hop':.005,'humanListening':False};(out/(p['id']+'.json')).write_text(json.dumps(d,separators=(',',':'))+'\n')
print('Saved',len(ed['phrases']),'original/stem source-clock spectral panels')
