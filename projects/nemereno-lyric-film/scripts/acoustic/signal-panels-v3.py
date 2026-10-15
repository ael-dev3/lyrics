from pathlib import Path
import numpy as np,soundfile as sf,json
from scipy.signal import stft
ROOT=Path(__file__).resolve().parents[2]
out=ROOT/'analysis/rebuild/signals';out.mkdir(exist_ok=True)
comparison=json.loads((ROOT/'analysis/rebuild/word-comparison.json').read_text())
windows=[('first-prefix',.35,1.60,['open-beauty']),('chorus-enter',42.0,44.4,['tend-love-b']),
 ('chorus-third',60.0,63.5,['tend-love-c']),('measure-repeat',36.8,40.6,['measure-repeat-a']),
 ('colored-prefix',28.7,30.9,['fingertips-a']),
 ('measure-duet',173.4,178.2,['fingertips-d','measure-d','backing-keep-b']),
 ('female-enter',120.3,122.2,['lose-stars']),('love-pickup',153.0,154.5,['as-long-as-a']),
 ('late-bloom',193.4,196.4,['bloom-again']),('duet',160.5,171.9,['tend-love-d','tree-d','fingertips-d','backing-keep-a'])]
waves={k:sf.read(ROOT/('analysis/rebuild/'+p+'16.wav'),dtype='float32')[0]for k,p in [('mix','mix'),('vocals','vocals')]}
for name,a,b,ids in windows:
 meta={'name':name,'start':a,'end':b,'rows':180,'width':1200,'words':[{'cue':c['id'],**w}for c in comparison['groups']if c['id']in ids for w in c['words']]}
 for kind,wave in waves.items():
  x=wave[round(a*16000):round(b*16000)]
  f,t,z=stft(x,fs=16000,nperseg=512,noverlap=480,boundary=None)
  fi=np.geomspace(90,7000,180);ti=np.linspace(0,b-a,1200)
  p=20*np.log10(np.maximum(abs(z),1e-9));byf=np.array([np.interp(fi,f,p[:,i])for i in range(len(t))])
  cols=np.array([np.interp(ti,t,byf[:,i])for i in range(180)])
  np.clip((cols+80)/62,0,1).astype('float32').tofile(out/(name+'-'+kind+'.f32'))
 (out/(name+'.json')).write_text(json.dumps(meta,ensure_ascii=False))
print('saved',len(windows),'original/stem panels; 32ms window, 2ms hop')
