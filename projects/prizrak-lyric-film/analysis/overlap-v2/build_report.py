"""Evidence-only overlap report. Does not modify selected source or rendering."""
from pathlib import Path
import hashlib,json
H=Path(__file__).resolve().parent;P=H.parents[1];E=P/'evidence'
def sha(path):
 h=hashlib.sha256()
 with path.open('rb') as f:
  for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
 return h.hexdigest()
source_hash=sha(P/'public/source.mp4')
assert source_hash=='8563f6b817c9b1cc39649363a52486214c691c0d98ae7bb82263021ac7363523'
units=[
 {'sourceIndex':0,'text':'憂き','start':212.34,'end':213.70,'onsetRange':[212.20,212.60],'releaseRange':[213.32,213.92],'reason':'The newly distinct lower body enters before the sparse u core around212.52–212.54. Broad-pair CTC releases i too early; bounded phonetic symbols continue into213.20. Preserve the selected body through the independently checked nasal transition.'},
 {'sourceIndex':1,'text':'もの','start':213.70,'end':214.90,'onsetRange':[213.32,213.92],'releaseRange':[214.75,215.05],'reason':'Standalone cropped CTC finds m around213.735; bounded first-half m around213.868 supports the strong following o. Broad-pair m213.084 has score.008 and borrows the preceding articulation. The initial213.12 candidate is superseded, not silently retained.'},
 {'sourceIndex':2,'text':'は','start':214.90,'end':215.44,'onsetRange':[214.75,215.05],'releaseRange':[215.30,215.60],'reason':'Broad side path has wa cores214.908–215.028 and a following n onset215.449. Bounded first-half paths can shift wa onto that n/a pair; retain explicit uncertainty under foreground Russian.'},
 {'sourceIndex':3,'text':'なし','start':215.44,'end':216.30,'onsetRange':[215.30,215.60],'releaseRange':[216.10,216.50],'reason':'Broad and bounded side CTC retain s/i cores around215.97–216.13. Extend beyond the sparse final core into the observed lower body, while excluding sustained Russian lead and room decay from certain lexical claims.'},
 {'sourceIndex':4,'text':'暁','start':216.95,'end':219.36,'onsetRange':[216.80,217.10],'releaseRange':[219.20,219.50],'reason':'Quiet initial vowel/body precedes the strong k/a material. Whole-pair side CTC begins216.951; tighter two-unit CTC starts on later217.221 core. Both retain late k/i218.84–218.95 before the next unit.'},
 {'sourceIndex':5,'text':'ばかり','start':219.36,'end':221.06,'onsetRange':[219.20,219.50],'releaseRange':[220.85,221.25],'reason':'Whole-pair and tighter paths agree on the onset core219.375/219.386 and final i220.898/220.889. The selected release retains the low direct body after the core; exact direct-vowel/room-decay separation remains perceptual.'}
]
for u in units:
 u['startSample']=round(u['start']*44100);u['endSample']=round(u['end']*44100)
 u['timingStatus']='Independent provisional proposal with explicit range; not human listening.'

asr=[]
for f in sorted(H.glob('unprompted-*.json')):
 r=json.loads(f.read_text())
 asr.append({'file':str(f.relative_to(P)),'sha256':sha(f),'model':r['method']['model'],'inputKind':r['method']['inputKind'],'cropSamples16000':[r['method']['cropStartSample16000'],r['method']['cropEndSample16000']], 'conditioningText':None,'humanListening':False,'segments':[{k:s[k] for k in ['start','end','text']}for s in r['result']['segments']]})
artifacts=[]
for f in sorted(H.glob('*.json')):
 if f.name.startswith(('mix-','vocal-')) and not f.name.endswith('all.json'):
  artifacts.append({'file':str(f.relative_to(P)),'sha256':sha(f)})
for f in [H/'inventory.py',H/'ctc.py',H/'make_panels.py',H/'make_side_panels.py',H/'template_correlation.py',H/'tail_template_correlation.py',H/'template-correlation.json',H/'tail-template-correlation.json',H/'build_report.py',P/'analysis/independent-audio/stem-clock.json',P/'analysis/independent-audio/original-mix-16000.wav',P/'analysis/independent-audio/vocals-16000.wav',H/'original-side-16000.wav',H/'vocals-side-16000.wav']:
 artifacts.append({'file':str(f.relative_to(P)),'sha256':sha(f)})
panels=[]
for f in sorted(H.glob('panels*/*.png')):panels.append({'file':str(f.relative_to(P)),'sha256':sha(f)})
out={
 'schemaVersion':1,'status':'Independent acoustic overlap proposals complete; selected timing and perceptual listening remain separate.',
 'sourceSha256':source_hash,'sampleRate':44100,'reviewCropSeconds':[200,241],
 'scope':'Re-audit the quieter Japanese vocal layer under Russian, particularly202–222, using fresh unprompted language-specific observations, contextual native-kana forced CTC, source/stem mid and side spectra, and recurrence diagnostics. Evidence-only.',
 'newSupportedInventory':{'candidateCueId':'JP30-OVERLAP-001','proposedVocalTrack':'japanese-upper','originalJapaneseText':['憂きものはなし','暁ばかり'],'proposedStartSeconds':212.34,'proposedEndSeconds':221.06,'meaning':'The same poem-30 comparison, Nothing is more sorrowful than dawn; existing verified editorial mapping applies. No unsung upper stanza is inserted.','inventorySupport':'The unprompted large-model estimated-vocal stereo-side205–241 observation produces a coherent poem-30-shaped pair212.34–220.80, followed by the already supported221–230 and230–239 repetitions. Corrected native-kana side CTC and a distinct lower harmonic body support the extra pair. The foreground-dominated mono results are not absence evidence.','earlierInventoryWasIncomplete':True},
 'perWordProposals':units,
 'otherReviewedIntervals':[
  {'crop':[200,212.34],'conclusion':'No additional Japanese pair is selected. Mid/mono ASR follows Russian; short side ASR outputs stock good-night phrases without corroborated phonetic sequence. A forced prior-pair hypothesis fits fragments of Russian and is rejected as lexical proof. This is not categorical absence of every buried voice.'},
  {'crop':[221,230.3],'conclusion':'Existing Japanese pair is preserved. New side CTC finds corresponding clean cores, including u221.862, mono222.884, wa224.047, nashi224.568, dawn226.352 and bakari228.596; sparse cores do not replace earlier selected onset/held release. Russian ночь body221.39–222.24 must stay independently owned under Japanese.'},
  {'crop':[230,239.45],'conclusion':'Existing final pair is preserved. Side CTC corroborates wa233.103 and nashi233.704–234.385; its initial u230.981 is a late core, not a reason to undo the earlier physically supported230.55 entrance.'},
  {'crop':[239.45,241],'conclusion':'No further lexical pair selected; retain actual source decay and picture. No stock end-title text is introduced.'}
 ],
 'rejectedObservations':[
  'Original mix, mono estimated vocals and small-model outputs often transcribe the Russian lead as Japanese-shaped text; no model majority vote is used.',
  'Original-side short crops produce stock おやすみなさい and the tight vocal-side crop produces おめでとうございます; these are not selected lyrics.',
  'Generic kanji-to-Chinese uroman paths remain rejected. Correct native-kana readings are internal model preprocessing only, never a displayed pronunciation aid.',
  'Plain mono forced CTC for the new pair places its units on unrelated Russian articulation; original-side forced paths also lack reliable lexical sequence. Neither is copied into selected timing.',
  'Narrow crops can shift constrained CTC units onto a later foreground articulation. Low-score wide m213.084 and bounded wa215.455 do not establish those exact semantic boundaries.',
  'Waveform recurrence candidates are contaminated by accompaniment, pitch and take differences. They are diagnostics, not a source for offset-copying entire repeated phrases.'
 ],
 'methods':{'sourceAudioAuthority':'Original unchanged stereo mix. Vocal estimate and side projection are diagnostic access aids, not replacements.','sideProjection':'(left-right)/2 at original44100Hz, independently resampled to16000Hz for model input, preserving source sample zero; both original-side and estimated-vocal-side available.','stemClockReference':'analysis/independent-audio/stem-clock.json; original/estimated stems share11249664 samples at44100Hz. Previous near-tail mixture reconstruction peak lag0 samples.','asr':'Whisper large-v3-turbo and small, cached checkpoints, Japanese language forced but no lexical prompt, previous-text conditioning disabled, temperature0, no silence suppression. These checkpoints are one model family, not independent human reviewers.','ctc':'Meta MMS_FA, contextual native-kana units only; forced placement cannot prove lexical presence. Character cores and unforced symbols retained; unit path scores uncalibrated.','spectra':'Original and estimated mid/side min-max waveform plus100–10000Hz spectra. FFT1024 at44100Hz =23.22ms window support; hop88≈1.995ms is numerical spacing, not2ms perceptual accuracy.'},
 'unpromptedObservations':asr,'ctcAndMethodArtifactIdentity':artifacts,'panelIdentity':panels,
 'limits':{'humanListening':False,'humanApproval':False,'canonicalTimingModified':False,'productionAudioOrVideoChanged':False,'remoteActions':False,'newProductionRender':False,'exactSampleSchedulingDoesNotProveMillisecondPerceptualAccuracy':True,'remainingPriority':'Review the masked entrance212.2–212.6 and nasal handoff213.32–213.92, then the low-energy direct-vowel/room-decay releases. Multiple voices must remain independently highlighted.'}
}
(E/'overlap-acoustic-v2.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
table='\n'.join('| '+u['text']+' | '+f"{u['start']:.2f}–{u['end']:.2f}"+' | '+f"{u['onsetRange'][0]:.2f}–{u['onsetRange'][1]:.2f}"+' | '+f"{u['releaseRange'][0]:.2f}–{u['releaseRange'][1]:.2f}"+' |' for u in units)
md='''# Layered Japanese vocal re-audit — призрак

An additional poem-30 fragment pair is supported around **212.34–221.06 s**, beneath the continuing Russian lead. The previous mono inventory omitted this quieter layer; its absence from that transcript was not evidence of absence in the recording.

## Proposed source events

The performed fragments are **憂きものはなし / 暁ばかり**. Preserve the existing editorial comparison, “Nothing is more sorrowful than dawn,” without adding an unsung stanza.

| Japanese unit | Selected proposal, seconds | Onset review range | Release review range |
| --- | ---: | ---: | ---: |
'''+table+'''

The initial 213.12 s handoff between 憂き and もの is superseded by **213.70 s**. The wide forced path borrowed a preceding consonant at213.084 with score.008; the standalone nasal observation is213.735, with a later bounded core213.868. Retain the broad213.32–213.92 review range instead of claiming one exact perceptual instant.

## Evidence and rejection

A fresh, unprompted large-model observation of the estimated-vocal stereo side produces a coherent Japanese-shaped poem pair212.34–220.80, followed by the two known closing pairs. Contextual native-kana CTC and a newly distinct lower harmonic body support this extra occurrence. Mono/mid observations follow the Russian foreground, and short side crops produce unrelated stock phrases. Those outputs are rejected, not averaged. CTC is conditioned timing evidence and cannot independently prove that its supplied text exists.

The source/stem spectra retain original time zero. Stereo side is `(left-right)/2`; it changes access to the masked layer for analysis, not the production soundtrack. FFT support is23.22 ms even though the numerical hop is about2 ms. No Japanese phonetic or romanized display is added.

No additional pair before212.34 is selected from200–212.34. Forced-only fits and stock good-night sentences do not establish one. This does not claim categorical absence of every buried voice. The two known later pairs remain intact; fresh side cores corroborate the final は/なし sequence. The Russian **ночь221.39–222.24** must remain independently owned beneath the Japanese entrance221.8.

Waveform recurrence tests are retained as diagnostics, but accompaniment and pitch/take differences prevent using their maxima to copy timings. Each proposed word retains an uncertainty range and individually reviewed held ending.

## Limits and reproducibility

The JSON binds source, unprompted observations, CTC files, method scripts, PCM derivatives and reviewed panels by SHA256. This report provides signal/model and semantic evidence only. It does **not** attest human listening, exact perceptual synchronization, real browser playback, decoded pixels or render approval. The masked entrance, nasal handoff and direct-vowel versus room-decay boundary still require listening judgment. No canonical timeline, source mapping, scene, player, production media or remote state was edited.

[Machine-readable evidence](overlap-acoustic-v2.json).
'''
(E/'overlap-acoustic-v2.md').write_text(md)
print(json.dumps({'status':'complete','newUnits':len(units),'crop':[200,241],'sourceSha256':source_hash,'humanListening':False}))
