"""Package factual source, candidate and measurement evidence without marking review complete."""
import hashlib,json,math,subprocess,wave
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
lyrics=json.loads((ROOT/'data/lyrics.json').read_text());features=json.loads((ROOT/'data/features.json').read_text());inspection=json.loads((ROOT/'analysis/source-inspection.json').read_text())
inspection['fallback']={'path':'source/leave-it-on.opus.webm','sha256':sha(ROOT/'source/leave-it-on.opus.webm'),'codec':'Opus stream copy','declaredDuration':273.568,'audioPacketPayloadSha256':'d1a6dbe54f991321838f54a25e0fca90964cbc55df8c22d2a687968a22bdfe95','decodedPcmS16LeSha256':inspection['decodedPcmS16LeSha256'],'pcmIdenticalToMasterInFFmpeg':True,'note':'WebM timestamps use millisecond timebase. Browser playback duration differs by 8 ms; no re-encode, stretched audio, or lyric offset is introduced.'}
inspection['masterAudioPacketPayloadSha256']=inspection['fallback']['audioPacketPayloadSha256']
inspection['independentSubtitleExtractionMatchesSuppliedSrt']=(ROOT/'analysis/extracted-reference.srt').read_bytes()==(ROOT/'source/embedded_lyrics.srt').read_bytes()
inspection['timeline']='Analysis clock zero is decoded sample zero after FFmpeg applies the 312-sample Opus pre-skip. The preview follows the chosen HTMLMediaElement presentation clock without stretching or manually offsetting audio. MP4 metadata duration is 273.560 s, WebM metadata duration 273.568 s, and native decoded PCM length 273.5735 s. Retain the complete media tail and read browser duration at runtime; the 50 Hz feature grid clamps after 273.560 s. Actual browser playback/tail verification is separate evidence.'
(ROOT/'analysis/source-inspection.json').write_text(json.dumps(inspection,indent=2)+'\n')
words=[w for c in lyrics['cues'] for w in c['words']]
errors=[]
for c in lyrics['cues']:
 if not c['displayStart']<=c['start']<c['end']<=c['displayEnd']:errors.append(['cue-bounds',c['id']])
 for a,b in zip(c['words'],c['words'][1:]):
  if a['end']>b['start']:errors.append(['word-overlap',a['id'],b['id']])
 for w in c['words']:
  if not c['start']<=w['start']<w['end']<=c['end']:errors.append(['word-bounds',w['id']])
  if w['startSample']/48000!=w['start'] or w['endSampleExclusive']/48000!=w['end']:errors.append(['sample-clock',w['id']])
for a,b in zip(lyrics['cues'],lyrics['cues'][1:]):
 if a['displayEnd']>b['displayStart']:errors.append(['display-overlap',a['id'],b['id']])
if len({w['id'] for w in words})!=len(words):errors.append('duplicate word IDs')
if features['sourceSha256']!=lyrics['source']['sha256']:errors.append('feature source mismatch')
if not all(len(f)==5 and all(isinstance(x,(int,float)) and math.isfinite(x) and 0<=x<=1 for x in f) for f in features['frames']):errors.append('feature range')
summary={'status':'preview candidate; full actual-audio review pending','cueCount':len(lyrics['cues']),'wordCount':len(words),'models':['MMS FA (mix and estimated vocals)','Wav2Vec2 ASR Base 960h (mix and estimated vocals)','Stable Whisper large-v3-turbo alignment (estimated vocals)'],'unforcedTextEvidence':['Whisper large-v3-turbo, full recording in overlapping windows','Whisper small, seven high-risk windows on estimated vocals'],'independence':'MMS and Wav2Vec2 are different pretrained CTC models within the wav2vec family. Whisper is a different architecture. Small/turbo/crop/stem variants of Whisper are not counted as independent model families.','wordsWithCandidateSpreadOver25ms':sum(w['candidateSpreadSeconds']>.025 for w in words),'wordsWithCandidateSpreadOver250ms':sum(w['candidateSpreadSeconds']>.25 for w in words),'wordsWithCandidateSpreadOver500ms':sum(w['candidateSpreadSeconds']>.5 for w in words),'wordsNeedingPerceptualReview':len(words),'modelConfidenceComparableAcrossModels':False,'timingSelection':'Named observed boundaries in select_timing.py. No word is distributed evenly or snapped to beat attacks. Source-sample rounding is representational precision, not proven acoustic accuracy.','featureSamples':len(features['frames']),'featureHz':features['sampleRate'],'sourceSha256':lyrics['source']['sha256'],'lyricsSha256':sha(ROOT/'data/lyrics.json'),'featuresSha256':sha(ROOT/'data/features.json'),'technicalErrors':errors,'actualAudioReviewComplete':False,'productionAuthorized':False}
(ROOT/'analysis/timing-audit.json').write_text(json.dumps(summary,indent=2)+'\n')
fAudit=json.loads((ROOT/'analysis/features-audit.json').read_text())
fAudit['measuredSectionMeans']=[]
for s in lyrics['sections']:
 rows=features['frames'][max(0,round(s['start']*50)):min(len(features['frames']),round(s['end']*50))]
 if rows:fAudit['measuredSectionMeans'].append({'id':s['id'],'start':s['start'],'end':s['end'],'means':{name:round(sum(row[i] for row in rows)/len(rows),5) for i,name in enumerate(features['channels'])}})
(ROOT/'analysis/features-audit.json').write_text(json.dumps(fAudit,indent=2)+'\n')
assert not errors,errors
print(json.dumps(summary,indent=2))
