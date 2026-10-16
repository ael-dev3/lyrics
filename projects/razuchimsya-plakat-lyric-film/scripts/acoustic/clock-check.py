import json,subprocess
from pathlib import Path
import soundfile as sf,numpy as np
from scipy import signal
root=Path(__file__).resolve().parents[2]
v,sr=sf.read(root/'analysis/stems/htdemucs/mix-48k/vocals.wav',dtype='float32')
b,br=sf.read(root/'analysis/stems/htdemucs/mix-48k/no_vocals.wav',dtype='float32')
subprocess.run(['ffmpeg','-v','error','-i',str(root/'public/source.mp4'),'-ar',str(sr),'-ac','2','-c:a','pcm_f32le','-y',str(root/'analysis/mix-stem-clock.wav')],check=True)
a,ar=sf.read(root/'analysis/mix-stem-clock.wav',dtype='float32')
n=min(len(a),len(v),len(b));x=(v[:n]+b[:n]).mean(axis=1)[::20];y=a[:n].mean(axis=1)[::20];c=signal.correlate(x,y,mode='full',method='fft');lag=(int(np.argmax(c))-(len(y)-1))*20
result={'sourceRate':48000,'stemRate':sr,'stemFrames':len(v),'decodedMixFramesAtStemRate':len(a),'recombinationCrossCorrelationLagSamples':lag,'relativeRecombinationRmsError':float(np.sqrt(np.mean((v[:n]+b[:n]-a[:n])**2))/np.sqrt(np.mean(a[:n]**2))),'humanListening':False}
(root/'analysis/stem-clock.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
