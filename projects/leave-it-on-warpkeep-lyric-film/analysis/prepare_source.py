"""Preserve and inspect the supplied master; generate an explicit provisional cue map."""
import hashlib,json,wave
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
source=ROOT/'source/Leave It On.m4a'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
probe=json.loads((ROOT/'analysis/source-probe.json').read_text())
packets=json.loads((ROOT/'analysis/source-packets.json').read_text())['packets']
with wave.open(str(ROOT/'analysis/source-stereo-48k.wav')) as w:
 frames=w.getnframes();rate=w.getframerate();channels=w.getnchannels();pcm=w.readframes(frames)
reference=json.loads((ROOT/'source/embedded_cues_unreviewed.json').read_text())['cues']
section_names=['intro','verse-1','pre-chorus-1','chorus-1','verse-2','pre-chorus-2','chorus-2','bridge','instrumental','final-chorus','outro']
sections=[];cues=[];section='intro';sidx=0
for r in reference:
 if r['kind']=='section_hint':
  section=section_names[sidx];sidx+=1
  sections.append({'id':section,'label':r['text'].split(' —')[0].replace('[','').replace(']',''),'start':r['start'],'end':273.56,'boundaryStatus':'embedded-candidate'})
 else:
  cues.append({'id':f'L{len(cues)+1:02d}','referenceId':r['id'],'section':section,'text':r['text'],'start':r['start'],'end':r['end'],'displayStart':r['start'],'displayEnd':r['end'],'words':[],'requiresReview':True,'notes':['Embedded line candidate only; acoustic word map pending.']})
for i,s in enumerate(sections[:-1]):s['end']=sections[i+1]['start']
inspection={'schemaVersion':1,'fileName':source.name,'sha256':sha(source),'bytes':source.stat().st_size,'declaredDuration':273.56,'codec':probe['streams'][0]['codec_name'],'sampleRate':rate,'channels':channels,'decodedSamplesPerChannel':frames,'decodedDuration':frames/rate,'decodedPcmS16LeSha256':hashlib.sha256(pcm).hexdigest(),'firstPackets':packets[:2],'lastPackets':packets[-2:],'timeline':'Use HTMLMediaElement presentation time from the untouched MP4 master. Adopt 273.560 seconds for the review timeline. Analysis zero aligns to decoded first sample after FFmpeg applied Opus pre-skip. The extra 13.5 ms decoder tail is retained in evidence and is not stretched or added to lyric time. Browser duration/onset/tail verification remains required.','reviewStatus':'file/packet/decode inspection only; no perceptual listening claim','referenceCount':len(reference),'lyricReferenceCount':len(cues),'sectionHintCount':len(sections),'sourceAudioUrl':'/source/Leave%20It%20On.m4a','fallbackAudioUrl':'/source/leave-it-on.opus.webm'}
(ROOT/'analysis/source-inspection.json').write_text(json.dumps(inspection,indent=2)+'\n')
(ROOT/'data/lyrics.json').write_text(json.dumps({'schemaVersion':1,'source':{'sha256':sha(source),'duration':273.56,'sampleRate':rate,'audioUrl':'/source/Leave%20It%20On.m4a','fallbackAudioUrl':'/source/leave-it-on.opus.webm'},'status':'embedded-reference-placeholder','sections':sections,'cues':cues,'review':{'actualAudioReviewComplete':False,'productionApproved':False,'acousticWordCandidatesComplete':False}},indent=2)+'\n')
print(json.dumps(inspection,indent=2))
