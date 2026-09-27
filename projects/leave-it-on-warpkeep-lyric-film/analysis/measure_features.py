"""Source-clocked full-song measurements; no beat snapping or local normalization."""
import hashlib,json,math
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy.signal import find_peaks
ROOT=Path(__file__).resolve().parent.parent
x,sr=sf.read(ROOT/'analysis/source-stereo-48k.wav',dtype='float32');duration=273.56;hz=50;hop=sr//hz;nfft=4096
mono=x.mean(axis=1);window=np.hanning(nfft).astype(np.float32);freq=np.fft.rfftfreq(nfft,1/sr)
bands=[(35,180),(180,2200),(2200,12000)];masks=[(freq>=a)&(freq<b) for a,b in bands]
raw=[];previous=None
for i in range(math.ceil(duration*hz)+1):
 center=i*hop;lo=center-nfft//2;hi=lo+nfft
 block=np.zeros(nfft,dtype=np.float32);a=max(0,lo);b=min(len(mono),hi)
 if b>a:block[a-lo:b-lo]=mono[a:b]
 power=np.abs(np.fft.rfft(block*window))**2
 rms=float(np.sqrt(np.mean(block*block)))
 band=[float(np.sqrt(power[m].sum())/(nfft/2)) for m in masks]
 spec=np.sqrt(power);flux=0 if previous is None else float(np.maximum(spec-previous,0).sum()/len(spec));previous=spec
 raw.append([rms,*band,flux])
a=np.asarray(raw);scales=np.percentile(a,98,axis=0);norm=np.clip(a/np.maximum(scales,1e-8),0,1)
# Attack/decay smoothing is a display measurement envelope, never a lyric timer.
out=norm.copy();attack=[.035,.040,.045,.035,.008];release=[.14,.20,.14,.10,.10]
for i in range(1,len(out)):
 for c in range(5):
  tau=attack[c] if norm[i,c]>out[i-1,c] else release[c]
  alpha=1-math.exp(-1/hz/tau);out[i,c]=out[i-1,c]+alpha*(norm[i,c]-out[i-1,c])
peaks,_=find_peaks(norm[:,4],height=.28,prominence=.12,distance=round(.21*hz))
# Autocorrelation gives candidates only: tempo and phase are not used as acoustic lyric proof.
env=norm[:,4]-norm[:,4].mean();corr=np.correlate(env,env,mode='full')[len(env)-1:]
lags=np.arange(round(hz*60/155),round(hz*60/75)+1);best=lags[np.argsort(corr[lags])[-5:][::-1]]
sha=hashlib.sha256((ROOT/'source/Leave It On.m4a').read_bytes()).hexdigest()
meta={'schemaVersion':1,'sourceSha256':sha,'sampleRate':hz,'duration':duration,'channels':['rms','low','mid','high','attack'],'frames':np.round(out,5).tolist(),'normalization':{'mode':'global-98th-percentile','rawScale':scales.tolist(),'clamp':[0,1],'localNormalization':False},'analysis':{'audioSampleRate':sr,'window':'Hann centered at source time','fftSize':nfft,'hopSamples':hop,'bandsHz':bands,'rms':'mono, centered 4096-sample rectangular window','attack':'positive spectral flux','smoothingAttackSeconds':attack,'smoothingReleaseSeconds':release,'wordTimingAuthority':False}}
(ROOT/'data/features.json').write_text(json.dumps(meta,separators=(',',':'))+'\n')
(ROOT/'analysis/features-audit.json').write_text(json.dumps({'sourceSha256':sha,'frameCount':len(out),'timeRange':[0,(len(out)-1)/hz],'rawScale':scales.tolist(),'rawMax':a.max(axis=0).tolist(),'normalizedRange':[float(out.min()),float(out.max())],'tempoCandidatesBpm':[round(60*hz/int(l),3) for l in best],'tempoReview':'Coarse spectral-flux autocorrelation candidates only; no adopted beat grid.','attackPeaks':[{'time':round(int(i)/hz,3),'strength':round(float(norm[i,4]),5)} for i in peaks],'measuredSectionMeans':[]},indent=2)+'\n')
print('features',len(out),'frames',scales,'tempo candidates',60*hz/best)
