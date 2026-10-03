from pathlib import Path
import json,hashlib
import numpy as np,soundfile as sf
HERE=Path(__file__).resolve().parent
original,sr=sf.read(str(HERE/'original-mix-44100.wav'));vocals,vr=sf.read(str(HERE/'stems/htdemucs/source/vocals.wav'));accomp,ar=sf.read(str(HERE/'stems/htdemucs/source/no_vocals.wav'))
assert sr==vr==ar==44100 and original.shape==vocals.shape==accomp.shape
mono=lambda x:x.mean(axis=1) if x.ndim==2 else x
x=mono(original);v=mono(vocals);summed=mono(vocals+accomp)
def check(data,lo,hi):
 a,b=round(lo*sr),round(hi*sr);left=x[a:b]-x[a:b].mean();right=data[a:b]-data[a:b].mean();n=1<<(len(left)*2-1).bit_length()
 cc=np.fft.irfft(np.fft.rfft(left,n)*np.conj(np.fft.rfft(right,n)),n)
 lags=np.arange(-2205,2206);vals=cc[lags%n];i=int(vals.argmax());lag=int(lags[i]);zero=float(np.dot(left,right)/(np.linalg.norm(left)*np.linalg.norm(right)))
 return {'crop':[lo,hi],'searchLagSamples':[-2205,2205],'peakLagSamples':lag,'peakLagSeconds':lag/sr,'zeroLagNormalizedCorrelation':zero}
record={'schemaVersion':1,'sourceSha256':hashlib.sha256((HERE.parents[1]/'public/source.mp4').read_bytes()).hexdigest(),'model':'HTDemucs htdemucs (preexisting local checkpoint)','sampleRate':sr,'channels':int(original.shape[1]),'originalDecodedSamples':len(original),'estimatedVocalSamples':len(vocals),'estimatedAccompanimentSamples':len(accomp),'maximumMixtureReconstructionError':float(abs(original-vocals-accomp).max()),'originalVersusVocal':[check(v,*window) for window in [(20,38),(87,104),(150,172),(223,239)]],'originalVersusSummedStems':[check(summed,*window) for window in [(0,20),(20,38),(87,104),(150,172),(223,239),(240,255)]],'scope':'Numerical source-clock validation of estimated components, not lexical presence or human listening. Lag against estimated vocals can be ambiguous in mixed music; mixture reconstruction is the stronger source-zero check.'}
(HERE/'stem-clock.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record,indent=2))
