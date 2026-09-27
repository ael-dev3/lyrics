"""Select recorded model observations only; preserve disagreement and closed review status."""
import hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
ref=json.loads((ROOT/'source/embedded_cues_unreviewed.json').read_text())['cues'];lyrics=[r for r in ref if r['kind']=='lyric_reference'];byref={r['id']:r for r in lyrics};idmap={r['id']:f'L{i+1:02d}' for i,r in enumerate(lyrics)}
models={}
for name,file in [('mms-mix','raw-mms-v2.json'),('wav2vec-mix','raw-wav2vec-v2.json'),('mms-stem','raw-mms-stem.json'),('wav2vec-stem','raw-wav2vec-stem.json'),('stable-mix','raw-stable-mix.json'),('stable-stem','raw-stable-stem.json')]:
 p=ROOT/'analysis'/file
 if p.exists():models[name]={r['id']:r for r in json.loads(p.read_text())}
# Explicit model adjudication. Every selected start/end remains an observed model boundary.
# Each choice corrects a visible failure in raw candidates; perceptual review remains pending.
WHOLE_OVERRIDES={
  (20,3):'stable-stem',(20,4):'stable-stem',(20,5):'stable-stem',
  (48,0):'mms-mix',(48,1):'wav2vec-stem',(48,2):'wav2vec-stem',(48,3):'wav2vec-stem',
  (50,0):'mms-mix',(50,1):'mms-mix',(50,2):'mms-mix',
  (51,0):'mms-mix',(51,1):'mms-mix',(51,2):'mms-mix',(51,3):'stable-stem',(51,4):'stable-stem',
  (52,0):'mms-mix',(52,1):'mms-mix',(52,2):'mms-mix',
  (55,0):'mms-mix',
  **{(61,j):'mms-mix' for j in range(7)},
  **{(62,j):'mms-mix' for j in range(8)},
  (70,0):'wav2vec-stem',(70,1):'wav2vec-stem',(70,2):'wav2vec-stem',(70,3):'wav2vec-stem',(70,4):'stable-stem',
  **{(71,j):'mms-mix' for j in range(3)},
}
END_OVERRIDES={(9,6):'stable-stem',(20,2):'stable-stem',(72,2):'wav2vec-stem'}
windows=json.loads((ROOT/'analysis/windows-v2.json').read_text());out=[];evidence=[]
section='intro';sections=[];sidx=0;names=['intro','verse-1','pre-chorus-1','chorus-1','verse-2','pre-chorus-2','chorus-2','bridge','instrumental','final-chorus','outro'];secmap={}
for r in ref:
 if r['kind']=='section_hint':
  section=names[sidx];sidx+=1;sections.append({'id':section,'label':r['text'].split(' —')[0].replace('[','').replace(']',''),'start':r['start'],'end':273.56,'boundaryStatus':'embedded-candidate'})
 else:secmap[r['id']]=section
for win in windows:
 wi=0
 for rid in win['referenceIds']:
  r=byref[rid];display=r['text'].replace('Warpkeep—Hyperion','Warpkeep— Hyperion');tokens=display.split();words=[]
  for j,text in enumerate(tokens):
   candidates={name:row[win['id']]['words'][wi+j] for name,row in models.items() if win['id'] in row and len(row[win['id']]['words'])==len(win['text'].split())}
   selected=WHOLE_OVERRIDES.get((rid,j),'mms-stem' if 'mms-stem' in candidates else 'mms-mix')
   if selected not in candidates:selected='mms-mix'
   end_source=END_OVERRIDES.get((rid,j),selected)
   if end_source not in candidates:end_source=selected
   obs=candidates[selected];ss=round(obs['start']*48000);ee=round(candidates[end_source]['end']*48000)
   if ee<=ss:raise RuntimeError((rid,text,'zero duration'))
   starts=[c['start'] for c in candidates.values()];ends=[c['end'] for c in candidates.values()]
   word={'id':f'{idmap[rid]}-W{j+1:02d}','text':text,'start':ss/48000,'end':ee/48000,'startSample':ss,'endSampleExclusive':ee,'confidence':obs.get('probability'),'requiresReview':True,'timingSource':selected,'endTimingSource':end_source,'candidateSpreadSeconds':round(max(max(starts)-min(starts),max(ends)-min(ends)),6)}
   words.append(word);evidence.append({'id':word['id'],'text':text,'selectedStart':selected,'selectedEnd':end_source,'candidates':candidates,'requiresReview':True})
  wi+=len(tokens)
  notes=[]
  if rid in [23,24,29,30]:notes.append('First chorus contains two model-supported refrain pairs; four supplied embedded pairs are not accepted.')
  if rid==55:notes.append('Embedded line is incorrectly early and compressed. Model-supported onset is around 178.8 seconds.')
  if rid in [3,70,71,72,73]:notes.append('High-risk held/processed vocal: actual-audio review required.')
  out.append({'id':idmap[rid],'referenceId':rid,'section':secmap[rid],'text':r['text'],'start':words[0]['start'],'end':words[-1]['end'],'displayStart':max(0,words[0]['start']-.24),'displayEnd':max(words[-1]['end']+.9,words[0]['start']+1.8),'words':words,'requiresReview':True,'notes':notes})
out.sort(key=lambda c:c['start'])
# Any tiny mixed-model overlap hands off at the next measured onset; preserve the reason.
for cue in out:
 for prev,word in zip(cue['words'],cue['words'][1:]):
  if prev['end']>word['start']:
   prev['end']=word['start'];prev['endSampleExclusive']=word['startSample'];prev['endTimingSource']='next-word-measured-onset'
   prev['reviewNote']='Mixed candidate overlap clipped at the following measured onset.'
 cue['start']=cue['words'][0]['start'];cue['end']=cue['words'][-1]['end']
for i,c in enumerate(out):
 c['displayStart']=max(0,c['start']-.24, out[i-1]['end'] if i else 0)
for i,c in enumerate(out):
 c['displayEnd']=min(max(c['end']+.9,c['start']+1.8),out[i+1]['displayStart'] if i+1<len(out) else 273.56)
 if c['displayEnd']<c['end']:raise RuntimeError(('display clips acoustic word',c['id']))
for s in sections:
 cs=[c for c in out if c['section']==s['id']]
 if cs:s['start']=min(c['start'] for c in cs);s['boundaryStatus']='first acoustic lyric candidate; musical boundary independently authored'
 if s['id']=='intro':s['start']=0
 if s['id']=='instrumental':s['start']=198.3;s['boundaryStatus']='provisional post-bridge lyric gap; possible vocal echo requires review'
for i,s in enumerate(sections[:-1]):s['end']=sections[i+1]['start']
sha=hashlib.sha256((ROOT/'source/Leave It On.m4a').read_bytes()).hexdigest()
data={'schemaVersion':1,'source':{'sha256':sha,'duration':273.56,'sampleRate':48000,'audioUrl':'/source/Leave%20It%20On.m4a','fallbackAudioUrl':'/source/leave-it-on.opus.webm'},'status':'acoustic-preview-candidate','sections':sections,'cues':out,'review':{'actualAudioReviewComplete':False,'productionApproved':False,'acousticWordCandidatesComplete':True,'candidateModels':list(models),'wordCount':sum(len(c['words']) for c in out),'cueCount':len(out),'excludedEmbeddedReferenceIds':[25,26,27,28],'openQuestions':['Verify all word onsets/releases with actual audio.','First-chorus omitted extra pairs remain a performed-text review question until listening adjudication.','Intro Leave it on: long processed release uncertain.','Bridge tail around 196–214 seconds: ASR suggests a possible isolated you echo near 204 seconds, not confirmed.','Final refrain may include processed on repetitions around 235–238 seconds; distinguish reverb/rearticulation by listening.','Proper-name pronunciation is model uncertain; original reference spellings retained.']}}
(ROOT/'data/lyrics.json').write_text(json.dumps(data,indent=2)+'\n')
(ROOT/'analysis/word-candidates.json').write_text(json.dumps({'schemaVersion':1,'sourceSha256':sha,'status':'model candidates, not perceptual review','words':evidence},indent=2)+'\n')
print('selected',len(out),'cues',sum(len(c['words']) for c in out),'words',list(models))
