"""Measured 48-band spectrum from locked source; source-clocked, globally scaled."""
import hashlib,json,math
from pathlib import Path
import numpy as np,soundfile as sf
ROOT=Path(__file__).resolve().parent.parent
x,sr=sf.read(ROOT/'analysis/source-stereo-48k.wav',dtype='float32');mono=x.mean(axis=1)
hz=25;duration=273.56;nfft=8192;hop=sr//hz;window=np.hanning(nfft).astype(np.float32);freq=np.fft.rfftfreq(nfft,1/sr)
centers=np.geomspace(45,10000,48);ratio=centers[1]/centers[0];edges=np.r_[centers[0]/ratio,centers,centers[-1]*ratio]
filters=[]
for i in range(48):
 left,center,right=edges[i:i+3];filters.append(np.maximum(0,np.minimum((freq-left)/(center-left),(right-freq)/(right-center))))
filters=np.asarray(filters);assert np.all(filters.sum(axis=1)>0)
raw=[]
for i in range(math.ceil(duration*hz)+1):
 center=i*hop;lo=center-nfft//2;hi=lo+nfft;block=np.zeros(nfft,dtype=np.float32);a=max(0,lo);b=min(len(mono),hi)
 if b>a:block[a-lo:b-lo]=mono[a:b]
 power=np.abs(np.fft.rfft(block*window))**2
 rms=np.sqrt(np.maximum(0,2*(filters@power)/(nfft*np.sum(window**2))))
 raw.append(rms)
raw=np.asarray(raw);ref=float(np.percentile(raw,99.5));ceiling_db=20*math.log10(ref);floor_db=ceiling_db-54
levels=np.clip((20*np.log10(np.maximum(raw,1e-10))-floor_db)/54,0,1)
# A short decay removes bin chatter while preserving source-time deterministic playback.
smoothed=levels.copy();attack=.025;release=.11
for i in range(1,len(smoothed)):
 tau=np.where(levels[i]>smoothed[i-1],attack,release);alpha=1-np.exp(-1/hz/tau)
 smoothed[i]=smoothed[i-1]+alpha*(levels[i]-smoothed[i-1])
quantized=np.rint(smoothed*255).astype(np.uint8)
sha=hashlib.sha256((ROOT/'source/Leave It On.m4a').read_bytes()).hexdigest()
out={'schemaVersion':1,'sourceSha256':sha,'duration':duration,'sampleRate':hz,'hz':hz,'bandCount':48,'bandCentersHz':np.round(centers,4).tolist(),'valueRange':[0,255],'frames':quantized.tolist(),'normalization':{'mode':'single full-recording reference for every band','referencePercentile':99.5,'referenceRms':ref,'floorDbFS':floor_db,'ceilingDbFS':ceiling_db,'rangeDb':54,'localNormalization':False,'perBandNormalization':False},'analysis':{'audioSampleRate':sr,'channels':'arithmetic stereo mean','fftSize':nfft,'hopSamples':hop,'window':'8192-sample centered Hann','filter':'48 triangular log-frequency filters; outer edges extend one center ratio beyond 45 and 10000 Hz','bandRms':'sqrt(2 * triangular-weighted FFT power / (FFT size * sum(Hann squared)))','attackSeconds':attack,'releaseSeconds':release,'quantization':'round(255 * globally-scaled-smoothed-level)','wordTimingAuthority':False}}
(ROOT/'data/spectrum.json').write_text(json.dumps(out,separators=(',',':'))+'\n')
(ROOT/'analysis/spectrum-audit.json').write_text(json.dumps({'sourceSha256':sha,'frames':len(quantized),'bands':48,'sampleRate':hz,'lastSampleTime':(len(quantized)-1)/hz,'normalizedRange':[int(quantized.min()),int(quantized.max())],'rawBandRmsMaxima':raw.max(axis=0).tolist(),'filterNonzeroFftBins':(filters>0).sum(axis=1).tolist(),'normalization':out['normalization'],'spectrumSha256':hashlib.sha256((ROOT/'data/spectrum.json').read_bytes()).hexdigest()},indent=2)+'\n')
print(len(quantized),'frames by',quantized.shape[1],'measured bands; scale',floor_db,ceiling_db,'dBFS')
