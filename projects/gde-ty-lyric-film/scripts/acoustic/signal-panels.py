import numpy as np, soundfile as sf,json
from scipy.signal import stft
from pathlib import Path
root=Path(__file__).resolve().parents[2]/"analysis"
mix,r=sf.read(root/'mix16.wav',dtype='float32');v,r=sf.read(root/'vocals16.wav',dtype='float32')
windows=[('intro',0,14.3),('opening',14.3,20.8),('first-chorus',74,86),('held-first',92.5,108.5),('answer',156.3,162),('final-chorus',163.8,176.1),('final-backing',178.5,199.5)]
for name,a,b in windows:
 out={'name':name,'start':a,'end':b,'rows':300,'width':1500}
 for kind,wave in [('mix',mix),('vocals',v)]:
  x=wave[round(a*r):round(b*r)];f,t,z=stft(x,fs=r,nperseg=1024,noverlap=960,boundary=None)
  # logarithmic frequency 90..5000 Hz, 300 rows; fixed -80..-15 dBFS reference.
  fi=np.geomspace(90,5000,300);ti=np.linspace(0,b-a,1500)
  p=20*np.log10(np.maximum(abs(z),1e-9));byf=np.array([np.interp(fi,f,p[:,i]) for i in range(len(t))]);cols=np.array([np.interp(ti,t,byf[:,i]) for i in range(300)])
  np.clip((cols+80)/65,0,1).astype('float32').tofile(root/(name+'-'+kind+'-spec.f32'))
  n=round(.004*r);en=np.sqrt(np.mean(x[:len(x)//n*n].reshape(-1,n)**2,axis=1));out[kind+'Envelope']=[float(s) for s in en]
 (root/(name+'-panel.json')).write_text(json.dumps(out))
