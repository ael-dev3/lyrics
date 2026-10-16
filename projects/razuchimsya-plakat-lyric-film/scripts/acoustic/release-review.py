"""Source/stem diagnostics for every held ending, separate from listening judgment.

5 ms view hop through a 64 ms Hann window. Threshold candidates only support
inspection; sustained voice, consonant release and passive decay need ownership.
"""
from pathlib import Path
import hashlib,json,subprocess
import numpy as np
import soundfile as sf
from scipy import signal,ndimage
root=Path(__file__).resolve().parents[2]
layer=json.loads((root/'source/held-release-corrections-v1.1.json').read_text())
baseline=root/'analysis/v1-timeline.json'
# Never make the revised timeline its own baseline on a fresh checkout.
original=subprocess.check_output(['git','show',layer['baselineCommit']+':projects/razuchimsya-plakat-lyric-film/public/timeline.json'],cwd=root.parents[1])
assert hashlib.sha256(original).hexdigest()==layer['baselineTimelineSha256']
baseline.parent.mkdir(exist_ok=True);baseline.write_bytes(original)
timeline=json.loads(baseline.read_text());sr=16000
mix,mr=sf.read(root/'analysis/mix-16k.wav',dtype='float32');vocal,vr=sf.read(root/'analysis/vocals-16k.wav',dtype='float32');assert mr==vr==sr
out=root/'analysis/release-review';out.mkdir(exist_ok=True)
records=[];frames=1024;hop=80;hz=np.geomspace(120,6000,96)
for ci,c in enumerate(timeline['cues']):
 for wi,w in enumerate(c['words']):
  next_time=(c['words'][wi+1]['startSample']/48000 if wi+1<len(c['words']) else (timeline['cues'][ci+1]['start'] if ci+1<len(timeline['cues']) else timeline['sourceDuration']))
  old=w['endSample']/48000;start=w['startSample']/48000
  if next_time-old<.50:continue
  lo=max(start-.20,old-3.20);hi=min(next_time-.16,old+(12.0 if ci==len(timeline['cues'])-1 else 3.70),timeline['sourceDuration']);a=round(lo*sr);b=round(hi*sr);lo=a/sr;hi=b/sr
  matrices=[];energies=[];spectra=[]
  for sound in [mix,vocal]:
   freq,time,z=signal.stft(sound[a:b],sr,window='hann',nperseg=frames,noverlap=frames-hop,nfft=2048,boundary='zeros',padded=False)
   power=np.abs(z)**2;spec=10*np.log10(np.maximum(power,1e-12))
   spec=np.stack([np.interp(hz,freq,spec[:,i]) for i in range(len(time))],axis=1)
   spectra.append(spec);matrices.append(np.round(np.clip((spec+80)/65,0,1)*255).astype('uint8').tolist())
   x=sound[a:b];pref=np.r_[0,np.cumsum(x.astype('float64')**2)];centers=np.minimum(len(x),np.round(time*sr).astype(int));left=np.maximum(0,centers-320);right=np.minimum(len(x),centers+320)
   db=10*np.log10(np.maximum((pref[right]-pref[left])/np.maximum(1,right-left),1e-12));energies.append(db)
  times=lo+time;vd=energies[1];md=energies[0]
  # Inspect harmonicity of the estimated vocal; leakage/reverb can also be tonal.
  padded=np.pad(vocal[a:b],(frames//2,frames//2));blocks=np.stack([padded[i*hop:i*hop+frames] for i in range(len(time))]);blocks-=blocks.mean(axis=1,keepdims=True);blocks*=np.hanning(frames)
  fft=np.fft.rfft(blocks,n=2048);acf=np.fft.irfft(np.abs(fft)**2,n=2048)[:,:frames]
  lags=np.arange(23,161);den=np.maximum(acf[:,0:1],1e-9);nc=acf[:,lags]/den;best=np.argmax(nc,axis=1);harm=nc[np.arange(len(time)),best];pitch=sr/lags[best]
  body_region=(times>=start+.05)&(times<=min(old,start+1.5));reference=float(np.percentile(vd[body_region],80)) if body_region.any() else float(vd.max())
  med=ndimage.median_filter(vd,size=9);valid=(times>=max(start,old-.50))&(times<=hi)
  def candidate(drop):
   active=(med>=reference-drop)&(harm>.30)&valid
   active=ndimage.binary_closing(active,structure=np.ones(11))
   where=np.flatnonzero(active)
   return round(float(times[where[-1]]),3) if len(where) else None
  at=lambda s:round(float(np.interp(s,times,vd)),2)
  item={'id':w['id'],'cue':c['id'],'word':w['text'],'start':start,'oldEnd':old,'nextStart':next_time,'crop':[lo,hi],'viewHopSeconds':hop/sr,'windowSeconds':frames/sr,'referenceVocalDb':round(reference,2),'oldEndVocalDb':at(old),'after200msVocalDb':at(min(hi,old+.2)),'after500msVocalDb':at(min(hi,old+.5)),'body10dBThresholdCandidate':candidate(10),'tail20dBThresholdCandidate':candidate(20),'humanListening':False}
  rec={**item,'times':np.round(times,4).tolist(),'mixDb':np.round(md,2).tolist(),'vocalDb':np.round(vd,2).tolist(),'harmonicity':np.round(harm,3).tolist(),'pitchHz':np.round(pitch,1).tolist(),'spectrograms':matrices,'frequenciesHz':np.round(hz,2).tolist()}
  (out/(w['id']+'.json')).write_text(json.dumps(rec,ensure_ascii=False,separators=(',',':'))+'\n');records.append(item)
(root/'analysis/release-review-summary.json').write_text(json.dumps({'baselineCommit':layer['baselineCommit'],'baselineTimelineSha256':hashlib.sha256(baseline.read_bytes()).hexdigest(),'sourceSha256':timeline['sourceSha256'],'records':records,'scope':'Numerical diagnostic candidates only; no automatic promotion to word ends or listening attestation.'},ensure_ascii=False,indent=2)+'\n')
for r in records:print(r['id'],r['word'],'old',r['oldEnd'],'vocal dB',r['oldEndVocalDb'],'ref',r['referenceVocalDb'],'10dB',r['body10dBThresholdCandidate'],'20dB',r['tail20dBThresholdCandidate'],flush=True)
