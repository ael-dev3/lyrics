import {spawnSync} from 'node:child_process';
// NumPy is used for the FFT only; this never infers lyrics or alters the audio.
const python=process.env.ALIGN_PYTHON??'python3';
const bridge=String.raw`
import numpy as np,json,hashlib
x=np.fromfile('analysis/audio-delivery.f32',dtype='<f4').reshape(-1,2).mean(axis=1)
sr=44100;hop=44;n=512;win=np.hanning(n);total=(len(x)-n)//hop+1;out=[]
previous=None
for first in range(0,total,10000):
 count=min(10000,total-first);a=first*hop
 frames=np.lib.stride_tricks.sliding_window_view(x[a:a+(count-1)*hop+n],n)[::hop]
 mag=np.abs(np.fft.rfft(frames*win,axis=1))[:,5:116]
 z=np.log1p(mag*8)
 before=np.vstack([previous if previous is not None else z[0],z[:-1]])
 flux=np.maximum(0,z-before).mean(axis=1);previous=z[-1]
 times=((first+np.arange(count))*hop+n/2)/sr
 out.extend(zip(times.tolist(),flux.tolist()))
a=np.array(out);events=[]
for lo,hi in [(102.35,129.16),(174.35,213.56)]:
 for grid in np.arange(lo,hi,.2):
  around=a[np.abs(a[:,0]-grid)<.012];peak=around[np.argmax(around[:,1])]
  bg=a[np.abs(a[:,0]-grid)<.09,1];contrast=float(peak[1]/max(np.median(bg),1e-6))
  if contrast<1.3:continue
  events.append({'time':round(float(peak[0]),6),'flux':round(float(peak[1]),6),'contrast':round(contrast,4),'grid':round(float(grid),6)})
quarters=[e for e in events if abs((e['grid']-.35)/.4-round((e['grid']-.35)/.4))<1e-4 and e['contrast']>=1.45]
errors=np.array([e['time']-e['grid'] for e in quarters]);cuts=json.load(open('source/trailer-edit.json'))
cutcheck=[];actioncheck=[]
for m in cuts['montages']:
 for s in m['shots']:
  t=m['songStart']+s['startFrame']/60
  around=a[np.abs(a[:,0]-t)<.012];p=around[np.argmax(around[:,1])]
  cutcheck.append({'montage':m['id'],'shot':s['name'],'cut':round(t,6),'measuredAttack':round(float(p[0]),6),'errorMs':round((t-p[0])*1000,3)})
  for accent in s.get('accents',[s['accent']] if 'accent' in s else []):
   target=t+accent['frame']/60
   around=a[np.abs(a[:,0]-target)<.012];peak=around[np.argmax(around[:,1])]
   row={'montage':m['id'],'shot':s['name'],'basis':accent['basis'],'sourceTime':accent['sourceTime'],'targetFrame':s['startFrame']+accent['frame'],'musicTime':round(target,6),'measuredAttack':round(float(peak[0]),6),'errorMs':round((target-peak[0])*1000,3)}
   if m['id']=='drop-two':
    previous=t+(accent['sourceTime']-s['sourceFirstFrame'])/(s['sourceOut']-s['sourceFirstFrame'])*s['frames']/60
    row['previousLinearTimeEstimate']=round(previous,6);row['previousLinearOffsetFromTargetMs']=round((previous-target)*1000,3)
   actioncheck.append(row)
report={'method':'512-sample Hann STFT, 44-sample hop (~0.998 ms), positive log-magnitude spectral flux averaged over FFT bins 5–115; center timestamp. Local attack candidates near a 150 BPM grid, qualified against the local median. Not a human-certified beat annotation.','audioPcmSha256':hashlib.sha256(open('analysis/audio-delivery.f32','rb').read()).hexdigest(),'periodSeconds':.4,'phaseSeconds':.35,'qualifiedQuarterAttacks':len(quarters),'quarterGridResidualMs':{'medianAbs':round(float(np.median(abs(errors)))*1000,3),'p95Abs':round(float(np.quantile(abs(errors),.95))*1000,3),'maxAbs':round(float(max(abs(errors)))*1000,3)},'cutAudit':cutcheck,'actionAudit':actioncheck,'scope':'Measures arrangement attacks and edit boundaries, not word timing or device output latency.'}
json.dump(report,open('evidence/beat-audit.json','w'),indent=2)
json.dump(events,open('public/beat-pulses.json','w'),separators=(',',':'))
print(json.dumps({k:report[k] for k in ['qualifiedQuarterAttacks','quarterGridResidualMs']}))
print('Cuts',len(cutcheck),'median absolute residual ms',round(float(np.median([abs(c['errorMs']) for c in cutcheck])),3))
`;
const r=spawnSync(python,['-c',bridge],{stdio:'inherit'});if(r.status!==0)throw Error('Beat analysis failed');
