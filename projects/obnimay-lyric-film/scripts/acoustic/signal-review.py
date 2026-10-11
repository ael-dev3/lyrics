"""Native spectral adapter. Exports source-bound observations, not word choices."""
import json
from pathlib import Path
import numpy as np,soundfile as sf
from scipy.signal import stft,correlate,correlation_lags
root=Path(__file__).resolve().parents[2]
mix,sr=sf.read(root/'analysis/mix16.wav',dtype='float32');vocal,_=sf.read(root/'analysis/vocals16.wav',dtype='float32')
windows=[('entry',4.8,9.4),('verse-a',9,18.8),('verse-b',18.4,30.2),('pre-1',30.6,43.8),('chorus-1a',43.6,56.3),('chorus-1b',56.1,69),('post-1a',69,82),('post-1b',81.8,94),('pre-2',118.4,131.8),('chorus-2a',131.6,144.5),('chorus-2b',144.3,157.4),('post-2a',157.2,170),('post-2b',169.8,182.2),('outro',182.5,198)]
for name,lo,hi in windows:
 data={'name':name,'start':lo,'end':hi,'windowSeconds':512/sr,'hopSeconds':32/sr,'columns':1100,'frequencies':96,'humanListening':False}
 for kind,wave in [('mix',mix),('vocals',vocal)]:
  crop=wave[round(lo*sr):round(hi*sr)];frequency,time,z=stft(crop,fs=sr,nperseg=512,noverlap=480,boundary=None)
  frequencies=np.geomspace(95,6500,96);times=np.linspace(0,hi-lo,1100);power=20*np.log10(np.maximum(abs(z),1e-9))
  by_frequency=np.array([np.interp(frequencies,frequency,power[:,i]) for i in range(len(time))]);columns=np.array([np.interp(times,time,by_frequency[:,i]) for i in range(96)])
  data[kind+'Spectrogram']=np.rint(np.clip((columns+80)/65,0,1)*255).astype('uint8').reshape(-1).tolist()
  n=32;trim=crop[:len(crop)//n*n].reshape(-1,n);data[kind+'Rms']=[float(s) for s in np.sqrt(np.mean(trim**2,axis=1))]
 (root/f'analysis/signal-{name}.json').write_text(json.dumps(data,separators=(',',':'))+'\n')
# Relative repetition observations use actual waveform, not lyric-string identity.
out=[]
for name,a,b,duration in [('pre',31.4,119.4,11.2),('chorus',44.1,132.1,24.2),('post',70,158,23.4)]:
 x=vocal[round(a*sr):round((a+duration)*sr)];y=vocal[round((b-.25)*sr):round((b+duration+.25)*sr)]
 scores=correlate(y,x,mode='valid',method='fft');lags=np.arange(len(scores))
 cumulative=np.r_[0,np.cumsum(y.astype('float64')**2)];energy=np.sqrt((cumulative[len(x):]-cumulative[:-len(x)])*np.sum(x.astype('float64')**2));normalized=scores/np.maximum(energy,1e-15);i=int(np.argmax(normalized));lag=(b-.25)+i/sr-a
 out.append({'name':name,'referenceStart':a,'comparisonStart':b,'duration':duration,'relativeOffsetSeconds':lag,'normalizedSimilarity':float(normalized[i]),'scope':'Relative waveform comparison only; does not establish an absolute phonetic boundary or authorize copied performance timing.'})
(root/'analysis/repetition-observations.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out),flush=True)
