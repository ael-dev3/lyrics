"""Source-clock editorial selections, not model-core endpoints or listening proof."""
from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1];ed=json.loads((root/'source/editorial.json').read_text());rec=json.loads((root/'source/recording.json').read_text());sr=48000;duration=rec['sourceDuration']
starts=[
 [16.18,17.40,17.64,18.25], [19.94,21.32,21.60],
 [23.68,24.78,24.98,25.04,25.62,25.86,27.30,29.25],
 [31.06,32.42,32.59,33.32,34.68,36.18,36.69],
 [38.50,38.63,39.96,40.08,40.79], [42.10,43.47,43.76], [47.88],
 [59.36,60.04,60.40,61.05], [61.94,62.21,62.66,63.10,64.94],
 [66.81,67.48,67.95,68.40], [69.34,69.59,70.01,70.46,72.33],
 [73.26,74.00], [76.93,77.82], [80.63,81.52], [84.33],
 [90.00,90.36,91.66,92.38], [93.82,94.04,94.18,94.96,95.40,95.93],
 [97.54,97.77,98.92,99.47], [101.16,101.24,101.59,102.31,102.79],
 [104.89,105.20,105.96,106.26,107.08], [108.57,108.89,110.02,110.21,110.46],
 [112.37,112.50,112.65,113.99,114.44], [115.88,115.98,117.58], [121.78],
 [133.25,133.94,134.28,134.91], [135.82,136.06,136.48,136.90,138.80],
 [140.65,141.34,141.84,142.28], [143.21,143.46,143.88,144.37,146.22],
 [147.12,148.04], [150.74,151.70], [154.50,155.82], [158.11,159.04],
 [161.88], [165.56,166.96], [169.24], [172.94,174.28], [176.61], [180.32], [184.02]
]
ends=[19.53,23.43,30.44,37.94,41.72,46.72,58.88,61.77,66.44,69.22,73.14,75.94,79.75,83.46,86.35,93.58,97.22,100.96,104.30,108.24,111.79,115.75,120.98,132.83,135.71,140.30,143.09,147.01,150.34,154.15,157.97,161.75,165.31,169.13,172.82,176.50,180.18,183.90,187.60]
# Real pauses or release consonants are distinct from the next onset. Do not
# fill every gap or extend every CTC marker by the same offset.
internal={0:{0:17.32},2:{5:27.02},3:{3:34.35},4:{4:41.72},7:{0:59.93},8:{3:64.77},9:{0:67.22},10:{3:72.16},16:{2:94.78},19:{1:105.82},24:{0:133.83},25:{3:138.60},26:{0:141.09},27:{3:146.08}}
assert len(starts)==len(ends)==len(ed['phrases'])
cues=[];events=[]
for i,p in enumerate(ed['phrases']):
 template=ed['templates'][p['templateId']];tokens=template['sourceText'].split();assert len(tokens)==len(starts[i]),p['id']
 model=json.loads((root/f"analysis/mms-vocals/mms-{p['id']}.json").read_text());words=[]
 for j,(token,onset) in enumerate(zip(tokens,starts[i])):
  release=internal.get(i,{}).get(j,starts[i][j+1] if j+1<len(tokens) else ends[i]);bare=token.rstrip(',!.?');w={'id':f"{p['id']}-s{j:02}",'text':bare,'sourceIndex':j,'startSample':round(onset*sr),'endSample':round(release*sr),'confidence':'source/model-supported preview selection; listening review pending','method':'Original and clock-verified estimated-vocal spectrum/energy, bounded unprompted Whisper and independent MMS character cores; ownership selected per occurrence.'}
  if bare!=token:w['punctuationAfter']=token[len(bare):]
  words.append(w);m=model['words'][j]
  events.append({'id':w['id'],'text':bare,'startSample':w['startSample'],'endSample':w['endSample'],'mmsFirstCore':m['startSeconds'],'mmsLastCore':m['endSeconds'],'mmsScore':m['score'],'releaseVsCoreSeconds':round(release-m['endSeconds'],4),'evidencePanel':f"analysis/spectral-review/{p['id']}.json",'status':'Connected lexical selection, full held-body release and next event kept distinct. Model/signal review only.','humanListening':False})
 targets=[]
 for j,t in enumerate(template['targets']):
  bare=t['text'].rstrip(',!.?');target={**t,'id':f"{p['id']}-t{j:02}",'text':bare}
  if bare!=t['text']:target['punctuationAfter']=t['text'][len(bare):]
  targets.append(target)
 c={'id':p['id'],'templateId':p['templateId'],'lane':'lead','voice':'забей, лерочка lead','sourceLanguage':'ru','targetLanguage':'en','sourceText':template['sourceText'],'targetText':' '.join(w['text'] for w in template['targets']),'start':starts[i][0],'end':ends[i],'words':words,'targets':targets,'sourceBreaks':[6] if p['templateId']=='winds' else [4] if p['templateId']=='years' else [],'targetBreaks':[7] if p['templateId']=='years' else []}
 cues.append(c)
prior=0
for i,c in enumerate(cues):
 nxt=cues[i+1]['start'] if i+1<len(cues) else duration
 hold=min(duration,c['end']+(1.12 if i==len(cues)-1 else .36))
 if nxt-.20-hold>=.5:c.update(visibleStart=max(prior,c['start']-.20),fullOpacityEnd=hold,visibleEnd=min(hold+.60,nxt-.20),exitMode='fade')
 else:c.update(visibleStart=max(prior,c['start']-.20),fullOpacityEnd=nxt,visibleEnd=nxt,exitMode='vocal-handoff')
 prior=c['visibleEnd'];assert c['end']<=nxt,c['id']
result={'schemaVersion':1,'revision':'nichego-net-v1.1-preview','sampleRate':sr,'sourceSha256':rec['sourceSha256'],'sourceDuration':duration,'cues':cues}
(root/'public/timeline.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
(root/'evidence/timing-selections.json').write_text(json.dumps({'sourceSha256':rec['sourceSha256'],'status':'Preview timing proposals, not a full listening certification','windowSeconds':.064,'viewHopSeconds':.005,'sampleRate':sr,'events':events},ensure_ascii=False,indent=2)+'\n')
print(len(cues),'cues',len(events),'source-word events',sum(len(c['targets']) for c in cues),'English tokens')
