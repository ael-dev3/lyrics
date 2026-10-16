from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1];rate=48000;duration=227.074
ed=json.loads((root/'source/editorial.json').read_text());sha='1a2efa9d95b57fe72ff56e8028a39793ef1a69e0d10a8ed47fbcf25885ed855c'
# Individually selected preview proposals after comparing source/stem activity,
# unprompted bounded ASR, attention allocations and CTC character cores.
# These are not a listening attestation or a millisecond-accuracy claim.
starts=[
 [.74,6.77,12.73,18.70],
 [23.20,23.64,24.14,24.76],
 [29.21,29.65,29.93,31.10],
 [35.26,35.72,36.27,36.71],
 [41.30,42.05,43.13],
 [47.28,47.83,48.11,48.75,49.10,53.34,53.57,54.25,55.08],
 [59.35,60.19,60.49,61.23,61.48],
 [65.38,66.15,66.43,67.28],
 [71.42,72.20,72.47,73.42],
 [77.49,78.20,78.47,79.42],
 [83.52,84.29,84.54,85.48],
 [91.28,97.34,103.38,109.35],
 [113.70,114.20,114.72,115.28],
 [119.80,120.26,120.56,121.69],
 [125.80,126.28,126.94,127.51],
 [131.90,132.28,132.50,132.78,133.49],
 [137.86,138.32,138.66,139.27,139.62,143.84,144.10,144.73,145.56],
 [149.88,150.70,151.01,151.72,152.05],
 [155.92,156.70,157.00,157.92],
 [162.01,162.81,163.00,164.06],
 [168.10,168.86,169.13,170.04],
 [174.12,174.90,175.16,176.16],
 [180.08,180.88,181.15,182.10],
 [186.14,186.94,187.19,188.16],
 [192.21,192.96,193.20,193.89],
 [198.27,198.45,198.79,199.07,199.37,200.06],
]
ends=[22.04,25.77,33.08,38.65,44.82,57.65,63.11,68.12,74.14,80.29,87.02,110.64,116.27,123.20,128.40,135.00,147.93,153.62,160.69,166.45,172.28,178.37,184.45,190.42,196.47,202.02]
# The stretched syllables are not blanket-transferred between repetitions.
internal_ends={0:{0:3.76,1:8.54,2:15.12},5:{4:51.86},11:{0:94.09,1:98.90,2:105.08},16:{4:142.01}}
correction_layer=json.loads((root/'source/held-release-corrections-v1.1.json').read_text())
assert correction_layer['sourceSha256']==sha and correction_layer['sampleRate']==rate
corrections={r['id']:r for r in correction_layer['records']}
rows=[];cues=[]
for i,p in enumerate(ed['phrases']):
 template=ed['templates'][p['templateId']];tokens=template['sourceText'].split();assert len(tokens)==len(starts[i]),p['id']
 model=json.loads((root/f"analysis/mms-mix/mms-{p['id']}.json").read_text());words=[]
 for j,(text,onset) in enumerate(zip(tokens,starts[i])):
  release=starts[i][j+1] if j+1<len(tokens) else ends[i]
  release=internal_ends.get(i,{}).get(j,release)
  correction=corrections.get(f"{p['id']}-s{j:02d}")
  if correction:
   assert round(release*rate)==correction['oldEndSample'], 'Correction layer must apply once against the frozen baseline'
   release=correction['selectedEndSample']/rate
  bare=text.rstrip(',!.?');punct=text[len(bare):];w={'id':f"{p['id']}-s{j:02d}",'text':bare,'sourceIndex':j,'startSample':round(onset*rate),'endSample':round(release*rate),'confidence':'preview proposal; listening pending','method':'selected source-clock proposal from original/stem activity, bounded unprompted Whisper and MMS CTC cores'}
  if punct:w['punctuationAfter']=punct
  words.append(w);m=model['words'][j]
  rows.append({'id':w['id'],'text':bare,'selectedStartSample':w['startSample'],'selectedEndSample':w['endSample'],'mmsFirstCenterSeconds':m['startSeconds'],'mmsLastCenterSeconds':m['endSeconds'],'mmsScore':m['score'],'onsetUncertainty':'Model-supported preview proposal; a unique physical boundary has not been certified','releaseStatus':correction['reason'] if correction else 'Connected ownership handoff retained.','humanListening':False})
 targets=[]
 for j,t in enumerate(template['targets']):
  bare=t['text'].rstrip(',!.?');q={**t,'id':f"{p['id']}-t{j:02d}",'text':bare};punct=t['text'][len(bare):]
  if punct:q['punctuationAfter']=punct
  targets.append(q)
 c={'id':p['id'],'templateId':p['templateId'],'lane':'lead','voice':'Settlers lead','sourceLanguage':'ru','targetLanguage':'en','sourceText':template['sourceText'],'targetText':' '.join(t['text'] for t in template['targets']),'start':starts[i][0],'end':words[-1]['endSample']/rate,'words':words,'targets':targets,'sourceBreaks':[5] if p['templateId']=='shard' else [],'targetBreaks':[7] if p['templateId']=='shard' else []}
 cues.append(c)
prior=0
for i,c in enumerate(cues):
 nxt=cues[i+1]['start'] if i+1<len(cues) else duration
 hold=c['end']+(.95 if i!=25 else 1.30)
 deadline=nxt-.24
 if deadline-hold>=.50:
  end=min(hold+.65,deadline);c.update(visibleStart=max(prior,c['start']-.24),fullOpacityEnd=hold,visibleEnd=end,exitMode='fade')
 else:
  c.update(visibleStart=max(prior,c['start']-.24),fullOpacityEnd=nxt,visibleEnd=nxt,exitMode='vocal-handoff')
 prior=c['visibleEnd']
 assert c['fullOpacityEnd']>=c['end']
result={'schemaVersion':1,'revision':'razuchimsya-plakat-v1.1-preview','sampleRate':rate,'sourceSha256':sha,'sourceDuration':duration,'cues':cues}
(root/'public/timeline.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
(root/'evidence/timing-selections.json').write_text(json.dumps({'schemaVersion':1,'sourceSha256':sha,'sampleRate':rate,'status':'Technical/model-supported preview proposals; complete human listening review pending','events':rows},ensure_ascii=False,indent=2)+'\n')
print(len(cues),'cues;',len(rows),'source-word events;',sum(len(c['targets']) for c in cues),'translated tokens')
