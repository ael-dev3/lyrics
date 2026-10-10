"""Native STFT/RMS observations with explicit support; no word decisions."""
import numpy as np, soundfile as sf,json
from scipy.signal import stft
from pathlib import Path
root=Path(__file__).resolve().parents[2]/'analysis'
mix,r=sf.read(root/'mix16.wav',dtype='float32');v,_=sf.read(root/'vocals16.wav',dtype='float32')
windows=[('onsets',7.5,15.7),('verse',15.3,23.3),('love',23.1,37.95),('repeats-first',37,54),('repeats-last',97,114),('tail',113,150)]
for name,a,b in windows:
 out={'name':name,'start':a,'end':b,'rows':180,'width':1400,'windowSeconds':1024/r,'hopSeconds':64/r}
 for kind,wave in [('mix',mix),('vocals',v)]:
  x=wave[round(a*r):round(b*r)];f,t,z=stft(x,fs=r,nperseg=1024,noverlap=960,boundary=None)
  fi=np.geomspace(90,6000,180);ti=np.linspace(0,b-a,1400);p=20*np.log10(np.maximum(abs(z),1e-9))
  byf=np.array([np.interp(fi,f,p[:,i]) for i in range(len(t))]);cols=np.array([np.interp(ti,t,byf[:,i]) for i in range(180)])
  np.clip((cols+80)/65,0,1).astype('<f4').tofile(root/(name+'-'+kind+'-spec.f32'))
  n=round(.004*r);en=np.sqrt(np.mean(x[:len(x)//n*n].reshape(-1,n)**2,axis=1));out[kind+'Envelope']=[float(s) for s in en]
 (root/(name+'-panel.json')).write_text(json.dumps(out))
