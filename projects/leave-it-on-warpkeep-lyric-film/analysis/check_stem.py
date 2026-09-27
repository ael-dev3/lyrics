import hashlib,json
from pathlib import Path
import numpy as np,soundfile as sf
from scipy.signal import correlate,correlation_lags
ROOT=Path(__file__).resolve().parent
x,sr=sf.read(ROOT/'source-mono-16k.wav',dtype='float32');y,ysr=sf.read(ROOT/'vocals-mono-16k.wav',dtype='float32');assert sr==ysr
rows=[]
for a,b in [(24,28),(69,73),(103,109),(178,184),(222,228),(254,269)]:
 xx=x[round(a*sr):round(b*sr)];yy=y[round(a*sr):round(b*sr)]
 # Subtract DC, keep the exact analysis sample grid and search ±100 ms.
 xx=xx-xx.mean();yy=yy-yy.mean();c=correlate(yy,xx,mode='full',method='fft');lags=correlation_lags(len(yy),len(xx));mask=abs(lags)<=round(.1*sr);ix=np.where(mask)[0][np.argmax(c[mask])];lag=int(lags[ix]);score=float(c[ix]/np.sqrt(np.sum(xx*xx)*np.sum(yy*yy)))
 rows.append({'start':a,'end':b,'lagSamples':lag,'lagSeconds':lag/sr,'normalizedCorrelation':score})
out={'model':'HTDemucs 4.1.0 htdemucs','purpose':'Estimated vocals for alignment only. Source soundtrack is never replaced.','sourceSampleRate':sr,'sourceSamples':len(x),'stemSamples':len(y),'sourceSha256':hashlib.sha256((ROOT/'source-mono-16k.wav').read_bytes()).hexdigest(),'stemSha256':hashlib.sha256((ROOT/'vocals-mono-16k.wav').read_bytes()).hexdigest(),'lagSearch':'±100 ms cross-correlation over specified full waveform regions','windows':rows,'limitations':'Estimated separation may remove sung harmonics or retain instrumental leakage; model boundaries still require actual-audio review.'}
(ROOT/'stem-audit.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out,indent=2))
