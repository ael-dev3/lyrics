"""Waveform recurrence observations; cannot prove lexical presence by itself."""
import hashlib,json
from pathlib import Path
import numpy as np,soundfile as sf
H=Path(__file__).resolve().parent;P=H.parents[1];I=P/'analysis/independent-audio'
signals={}
for kind,path in [('mix',I/'original-mix-16000.wav'),('vocals',I/'vocals-16000.wav'),('mix-side',H/'original-side-16000.wav'),('vocal-side',H/'vocals-side-16000.wav')]:
    signals[kind],sr=sf.read(path);assert sr==16000
templates=[('uki-tail',222.34,222.75),('mono',222.96,223.81),('wa',224.08,224.50),('nashi',224.60,225.24),('akatsuki',226.42,228.43),('bakari',228.57,229.83)]
result=[]
for kind,x in signals.items():
 for name,a,b in templates:
  t=x[round(a*sr):round(b*sr)].copy();t-=t.mean();L=len(t);tn=float(np.linalg.norm(t))
  if tn<1e-8:continue
  for window in [(230,240),(200,222)]:
   y=x[round(window[0]*sr):round(window[1]*sr)].copy();y-=y.mean()
   n=1<<((len(y)+L-1).bit_length());conv=np.fft.irfft(np.fft.rfft(y,n)*np.fft.rfft(t[::-1],n),n)[L-1:len(y)]
   cs=np.r_[0,np.cumsum(y*y)];e=cs[L:]-cs[:-L];r=conv/(np.sqrt(np.maximum(e,1e-15))*tn)
   candidates=[];scores=np.abs(r).copy()
   for _ in range(6):
    k=int(scores.argmax());candidates.append({'startSeconds':window[0]+k/sr,'normalizedCorrelation':float(r[k]),'offsetFromTemplateSeconds':window[0]+k/sr-a})
    scores[max(0,k-round(.35*sr)):min(len(scores),k+round(.35*sr))]=0
   result.append({'inputKind':kind,'template':name,'templateCrop':[a,b],'searchCrop':window,'strongestNonOverlappingCandidates':candidates})
(H/'tail-template-correlation.json').write_text(json.dumps({'schemaVersion':1,'method':'16k same-input waveform normalized cross-correlation; near 230–240 control and 200–222 search using known closing units; candidate polarity retained. A failure may reflect different takes, pitch or mixing, and is not absence proof.','humanListening':False,'observations':result},ensure_ascii=False,indent=2)+'\n')
for row in result:
 if row['searchCrop'][0]==200: print(json.dumps(row,ensure_ascii=False))
