"""Independent signal-review proposals, not canonical selections or listening."""
from pathlib import Path
import json,hashlib
H=Path(__file__).resolve().parent;P=H.parents[1];SAMPLE_RATE=44100

def streamed_hash(path):
 h=hashlib.sha256()
 with Path(path).open('rb') as f:
  for block in iter(lambda:f.read(4*1024*1024),b''):h.update(block)
 return h.hexdigest()
assert streamed_hash(P/'public/source.mp4')=='8563f6b817c9b1cc39649363a52486214c691c0d98ae7bb82263021ac7363523','Source changed; review must be repeated'

# Values are manually proposed against both plotted streams, not automatic leads.
# Each instance was viewed independently, including sustained context beyond crop.
B={
'RU-001':[(86.20,86.27),(86.27,87.69),(87.69,88.25),(88.25,90.12)],
'RU-002':[(90.55,91.085),(91.085,91.67),(91.67,91.94),(91.94,93.36),(93.36,94.85)],
'RU-003':[(95.045,95.69),(95.69,96.53),(96.53,96.84),(96.84,99.39)],
'RU-004':[(99.735,101.135),(101.135,103.91)],
'RU-005':[(103.91,104.55),(104.55,105.94),(105.94,106.51),(106.51,108.43)],
'RU-006':[(108.80,109.11),(109.11,109.67),(109.67,111.00),(111.00,111.33),(111.33,113.265)],
'RU-007':[(113.73,115.08),(115.08,115.64),(115.64,117.63)],
'RU-008':[(117.97,118.82),(118.82,119.665),(119.665,120.22),(120.22,124.23)],
'RU-009':[(126.24,126.28),(126.28,127.11),(127.11,127.59)],
'RU-010':[(128.43,128.485),(128.485,129.34),(129.34,129.94),(129.94,130.40)],
'RU-011':[(141.13,142.30),(142.575,143.39),(143.65,143.93),(144.26,144.89),(144.89,145.25)],
'RU-012':[(146.69,147.135),(147.135,147.47),(147.47,148.12)],
'RU-013':[(149.945,150.22),(150.22,151.04),(151.04,151.39),(151.39,151.94),(151.94,153.665),(153.665,154.94)],
'RU-014':[(155.98,156.18),(156.62,157.28)],
'RU-015':[(159.44,160.45),(160.825,161.645),(161.88,162.185),(162.555,163.11),(163.145,163.79)],
'RU-016':[(165.02,165.46),(165.46,165.785),(165.785,166.43)],
'RU-017':[(168.255,168.51),(168.51,169.40),(169.40,169.775),(169.775,170.47),(170.53,171.96),(171.96,177.60)],
'RU-018':[(177.60,177.70),(177.70,179.14),(179.14,179.70),(179.70,181.84)],
'RU-019':[(181.98,182.505),(182.505,183.10),(183.10,183.35),(183.35,184.79),(184.79,186.51)],
'RU-020':[(186.56,187.175),(187.175,187.945),(187.945,188.27),(188.27,191.14)],
'RU-021':[(191.185,192.545),(192.545,195.53)],
'RU-022':[(195.53,195.91),(195.91,197.435),(197.435,197.98),(197.98,199.84)],
'RU-023':[(200.27,200.575),(200.575,201.39),(201.39,202.455),(202.455,202.78),(202.78,204.73)],
'RU-024':[(205.155,206.535),(206.535,207.13),(207.13,209.39)],
'RU-025':[(209.40,210.28),(210.28,211.10),(211.10,211.665),(211.665,217.43)],
'RU-026':[(217.60,217.645),(217.645,218.53),(218.53,219.15)],
'RU-027':[(219.835,219.95),(219.95,220.79),(220.79,221.39),(221.39,222.24)]
}
# Deliberately wide ranges where consonants, breath, overlap or reverb are unresolved.
O={
('RU-001',0):[86.12,86.29],('RU-005',0):[103.85,104.28],
('RU-008',1):[118.72,118.95],('RU-008',3):[120.12,120.32],
('RU-009',0):[123.60,126.30],('RU-009',1):[123.94,126.33],
('RU-011',0):[140.65,141.18],('RU-014',1):[156.50,156.68],
('RU-018',0):[176.60,177.73],('RU-022',0):[195.25,195.79],
('RU-026',0):[215.40,217.68],('RU-026',1):[215.70,217.70]
}
R={
('RU-001',3):[89.95,90.32],('RU-002',4):[94.70,95.045],
('RU-003',3):[99.25,99.60],('RU-004',1):[103.82,104.25],
('RU-005',3):[108.30,108.55],('RU-006',4):[113.14,113.45],
('RU-007',2):[117.52,117.82],('RU-008',3):[123.48,124.42],
('RU-009',2):[127.53,127.73],('RU-010',3):[130.30,130.53],
('RU-011',4):[145.17,145.36],('RU-012',2):[148.02,148.23],
('RU-013',5):[154.86,155.06],('RU-014',1):[157.18,157.39],
('RU-015',4):[163.64,163.94],('RU-016',2):[166.32,166.55],
('RU-017',5):[177.35,177.72],('RU-018',3):[181.69,182.03],
('RU-019',4):[186.36,186.62],('RU-020',3):[190.90,191.23],
('RU-021',1):[195.24,195.75],('RU-022',3):[199.70,200.06],
('RU-023',4):[204.59,204.89],('RU-024',2):[209.22,209.48],
('RU-025',3):[215.30,217.64],('RU-026',2):[219.08,219.31],
('RU-027',3):[222.14,222.35]
}
N={
('RU-001',0):'Very low-score preposition at the end of Japanese kana. Do not simply select the earlier stem event; bound quiet consonant before the clear p entrance.',
('RU-002',0):'Reject conditioned Whisper crop-bound89.50: new vocal attack/body occurs near90.55 after prior kada tail.',
('RU-003',0):'Reject crop-bound Whisper94.50; connected tv prefix immediately precedes voiced entrance near95.06.',
('RU-003',3):'Original CTC final m is weak/early97.44, stem97.94 is also before a clearly sustained vocal body. Keep lexical focus/readability through the later main vowel into99.3, apart from decorative reverberation.',
('RU-004',0):'Reject crop-bound Whisper98.00: preceding hair note continues, then new u articulation near99.75.',
('RU-004',1):'CTC/Whisper ends101.46–101.64 omit a long sustained vowel. Shared original/stem voiced formants continue until the quiet nasal transition into the next phrase near103.9–104.25.',
('RU-005',0):'Reject Whisper102.00. Original CTC104.267 follows the clear vowel; stem103.886 may recover the m/n consonant but may also borrow preceding menya. Provisional connected-prefix onset103.91; wide explicit uncertainty retained.',
('RU-006',2):'Original CTC109.703 includes initial na; stem109.963 is a later core. Physical voiced change near109.7 supports the earlier word entrance.',
('RU-006',4):'Path end112.368 is not the end of the held yu vowel. Sustained original/stem formants continue to about113.26 before the new ostalos entrance113.73.',
('RU-007',2):'Reject original start116.237 as the middle of a held word. Stem115.655 and the physical changed vowel near115.65 support earlier zh/l entrance.',
('RU-008',1):'No clear v onset in either low-score path; broader quiet-prefix interval retained before the strong zor body.',
('RU-008',3):'Original120.793 starts on a later n/core. Stem120.251 supports the earlier l prefix. Harmonic vowel continues past crop end122.4; short voiced bursts123.65/123.95 cannot be assigned confidently between moon tail and next preposition without listening.',
('RU-009',0):'Neither constrained v path is trustworthy (near-zero scores and earlier moon tail). Provisional onset placed by the quiet cluster immediately before clear tem body126.28; earlier123.6–124.2 fragments remain unresolved, so onset range is broad and human review essential.',
('RU-009',1):'Original forces t/e/m across early123.96–124.26 and n/y across a near-absent stem gap. Stem finds clear tem articulation126.287. Earlier fragments may be preceding lunoyu or split/night prefix. Do not assert the whole gap is sung; provisional onset126.28 is a strong-core candidate with broad unresolved prefix range.',
('RU-009',2):'Original starts n126.528 inside preceding tem syllables. Clear renewed n/body near127.13 and following frication127.5 support the later word boundary.',
('RU-010',0):'Near-zero constrained preposition. Original128.291 sits in a quiet region; stem begins128.431 before clear tem articulation128.49. Use a bounded short connected prefix, not a full half-second preposition.',
('RU-011',0):'Reject Whisper134.66 and original sparse t138.509/a139.15 before any matching articulation. Stem t141.153/a141.253/k141.453 matches actual ta-ko shape. The isolated high burst140.67–140.89 may be breath/leakage, so141.13 is provisional and onset range remains140.65–141.18.',
('RU-012',0):'Whisper145.90 is crop-bound. The first matching frication/sharp vocal entrance is near146.69–146.73.',
('RU-013',0):'Whisper148.95 borrows prior decay. Initial articulated ya is near149.95; preceding high burst149.75 may be inhalation.',
('RU-013',3):'Original151.514 misses quiet v prefix; stem151.394 agrees with preceding low body before the s-like high-energy core.',
('RU-014',0):'Reject Whisper155.10. New ya harmonic onset155.98 is independently visible after an intervening quiet body gap.',
('RU-016',2):'Original end166.865 is after the main voiced body, on residual music. Stem166.342 plus original closure/decay supports a bounded body release about166.43; final effect residue is separate.',
('RU-017',5):'Both CTC ends174.52/174.56 are crop-censored and Whisper172.95 releases a held note far too early. Original/stem matching formants continue into177.3–177.6 before the next articulation.',
('RU-018',0):'Original176.747 and Whisper176.58 can borrow the preceding person vowel. Stem177.449 is also near-zero. Quiet preposition boundary before the clear p onset177.71 is unresolved; use a provisional177.60 with broad range, not a claimed exact entrance.',
('RU-019',0):'Reject crop-bound Whisper181.10. The moi entrance near181.98 has a distinct renewed waveform and vowel trajectory.',
('RU-020',3):'Stem extends end190.619 beyond original190.018, but the sustained body still continues towards191.1. Retain acoustic vowel/readability into that transition; do not define release solely from the final m score.',
('RU-021',1):'Original192.929/stem192.949 are sparse character ends, not the end of the sustained ya. Full harmonic body remains towards195.3–195.7 and feeds a quiet m/n transition; exact handoff remains broad.',
('RU-022',0):'Both near-crop stem195.280 and late original195.742 may choose different parts of the connected menya-mne transition. Reject blind crop195.20; retain broader195.25–195.79 range around a provisional195.53.',
('RU-022',1):'Original196.084 omits the initial o portion; stem195.883 recovers it. Connected ostalos onset belongs near195.91 rather than late strong s/t.',
('RU-022',3):'Original198.875/Whisper199.20 end in the sustained vowel. Stem199.920 and physical closed main body about199.8 support a longer release.',
('RU-023',4):'CTC203.828 ends well inside sustained yu; harmonic body extends towards204.73 before ostalos205.16.',
('RU-024',2):'Original207.704 is late in held word; stem207.161 and physical changed vowel near207.13 support an earlier zh entrance. Final held vowel feeds into next phrase209.4.',
('RU-025',3):'Original212.195 is a later n/core, while stem211.674 supports initial l. Full original/stem body extends beyond the crop214.8. Overlap versus next quiet night prefix215.4–217.6 remains unresolved and is not treated as millisecond certainty.',
('RU-026',0):'Near-zero original216.003/stem215.441 do not identify a reliable v. Provisional217.60 is adjacent to clear tem core, but earlier vocal fragments/overlap215.4–217.6 remain unresolved; human listening required.',
('RU-026',1):'Strong repeated tem core near217.646 agrees across both paths, but a quiet earlier initial portion215.7 may be mixed with prior lunoyu. Broad onset interval retained instead of stretching focus automatically through the whole region.',
('RU-027',3):'Reject stem224.060: it borrows the Japanese response that begins around222.4. Original222.176 and actual Russian closing body/frication around222.2 support release222.24, prior to the new Japanese vocal phrase.'
}
phrases=json.loads((P/'analysis/russian-phrases.json').read_text());whrows=json.loads((P/'analysis/whisper-russian-candidates.json').read_text())['records'];wh={r['phraseId']:[w for s in r['result']['segments'] for w in s.get('words',[])] for r in whrows}
records=[]
for p in phrases:
 cid=p['id'];o=json.loads((H/f'ctc-{cid}.json').read_text());v=json.loads((H/f'ctc-vocals-{cid}.json').read_text());assert len(B[cid])==len(p['units'])==len(o['words'])==len(v['words'])
 units=[]
 for i,text in enumerate(p['units']):
  a,b=B[cid][i];key=(cid,i);on=O.get(key,[round(a-.055,3),round(a+.055,3)]);en=R.get(key,[round(b-.075,3),round(b+.075,3)]);assert on[0]<=a<=on[1] and en[0]<=b<=en[1] and a<b
  units.append({'sourceIndex':i,'text':text,'proposedOnsetSeconds':a,'proposedReleaseSeconds':b,'proposedOnsetSample44100':round(a*SAMPLE_RATE),'proposedReleaseSample44100':round(b*SAMPLE_RATE),'onsetRangeSeconds':on,'releaseRangeSeconds':en,'uncertainty':'high: overlapping/masked prefix or unusually held handoff' if key in O and on[1]-on[0]>.15 else 'moderate: signal/model review, no listening attestation','rationale':N.get(key,'Original-mix and clock-verified estimate panel inspected at this occurrence; follow the quiet articulation/body transition rather than conditioned Whisper enclosing spans. Internal release is a connected handoff proposal; uncertainty bounds retain closure/reverb ambiguity.'),'observations':{'originalCtc':{k:o['words'][i][k] for k in ['startSeconds','endSeconds','ctcPathScore']},'vocalsCtc':{k:v['words'][i][k] for k in ['startSeconds','endSeconds','ctcPathScore']},'conditionedWhisper':{k:wh[cid][i][k] for k in ['start','end','probability']}},'humanListening':False})
 records.append({'phraseId':cid,'templateId':p['templateId'],'language':'ru','sourceIndicesAreTemplateLocal':True,'candidateCropSeconds':p['crop'],'reviewPanel':f'analysis/independent-audio/panels/{cid}.png','units':units,'neutralReadingHold':'Keep the complete bilingual phrase opaque/readable through every actual voiced body, then an independently chosen neutral hold. This review does not define a decorative or neutral reading duration.'})
input_tags=['unprompted-full-auto','unprompted-full-ru','unprompted-opening-ja','unprompted-opening-small-ja','unprompted-tail-ja','unprompted-tail-small-ja','unprompted-early-ja','unprompted-early-small-ja','unprompted-opening-vocals-ja','unprompted-tail-vocals-ja','unprompted-main-ja','unprompted-main-small-ja','unprompted-night-ru','unprompted-night-vocals-ru','unprompted-chorus-small-ru']
inputs=[]
for tag in input_tags:
 f=H/(tag+'.json');r=json.loads(f.read_text());inputs.append({'file':str(f.relative_to(P)),'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'method':r['method'],'segments':[{k:s[k] for k in ['start','end','text']} for s in r['result']['segments']]})
review={'schemaVersion':1,'status':'Independent technical acoustic review completed; proposals only, masked words and final listening remain pending','sourceSha256':'8563f6b817c9b1cc39649363a52486214c691c0d98ae7bb82263021ac7363523','scope':{'completeRecordingInventorySeconds':[0,255.094422],'russianCuesIndividuallyReviewed':27,'russianSourceUnitsIndividuallyProposed':106,'sourceFrameClock':'25 fps original; source audio zero preserved','sampleRate44100':44100,'decodedStereoSamples':11249664,'japaneseMainUnpromptedPasses':[38,86],'japaneseOpeningAndTailExamined':[[0,38.5],[221,255.0944]],'canonicalTimingChanged':False,'humanListening':False,'humanApproval':False},'methods':{'originalMixAuthority':True,'waveformSpectrogram':{'fftSamples':1024,'hopSamples':88,'sampleRate':44100,'windowSupportMilliseconds':1024/44100*1000,'hopMilliseconds':88/44100*1000,'displayRangeDb':[-82,-17],'notes':'Fixed amplitude scale across panels. Dense hop/sample integers are representations, not millisecond acoustic certainty. Original waveform/spectrum compared with clock-verified estimate; estimated isolation does not establish lexical truth or make a core an onset.'},'ctc':'torchaudio MMS_FA; independent from Whisper architecture, but conditioned on reconciled units; sparse character paths are only candidates. Original and stem are same family and do not count as independent votes.','whisper':'Unprompted full and language-specific bounded large-v3-turbo/small plus separately conditioned attention candidates; no lyric prompt or previous-text conditioning for lexical inventory. Checkpoint sizes are not independent model families.','stemClockEvidence':'analysis/independent-audio/stem-clock.json','phonemeReview':'Use quiet connected prefixes and complete vocal bodies; isolated inhalation, leaked music, model-selected strong vowel, crop boundary or following language must not become a lexical event automatically.','listeningLimitation':'No human or synthetic claim of hearing. Signal/model evidence cannot certify canonical text, the quiet prepositions or every word onset/release. Reduction-speed human listening remains a separate requirement.'},'performedInventory':[{'rangeSeconds':[0,20.3],'finding':'No supported lexical sequence recovered. Large tight pass produced the music label 音楽; small tight pass was empty. Weak estimated-vocal bursts are not enough to insert unseen text.','status':'instrumental/weak-leakage observation; hidden voice not categorically excluded'},{'rangeSeconds':[20.3,38.2],'finding':'Two pairs: phonetic uki mono wa nashi near20.4–23.8/29.2–32.7 followed by akatsuki bakari near25–28.9/33.6–37.9. Canonical editorial poem30 corroborates spelling/meaning separately; do not add its unperformed first half.','status':'independent lexical shape compatible; exact word/sample borders provisional'},{'rangeSeconds':[38.2,47.5],'finding':'First main Japanese ASR segments swallow the instrumental lead-in. Small labels38–43 as Dedededed; large begins a broad phrase at38. Source panels/CTC must establish actual first articulated onset near49, not38.','status':'reject broad segment start as onset'},{'rangeSeconds':[47.5,85.65],'finding':'Two recognizable poem59 performances. Large/small share phonetic first line, night-growing-late phrase, katabuku/made/no, tsuki/wo, mishi/kana shapes while replacing them with similar modern words. No exact classical spelling is established by ASR alone.','status':'two performed runs compatible with editorial59; root Japanese boundary reconciliation separate'},{'rangeSeconds':[85.65,132.8],'finding':'First Russian chorus,10 cues. Japanese-global ASR is not meaningful Russian text; unprompted RU recovered recognizable line content but broad first-word spans and held ends require signal review.','status':'27-cue Russian review below contains this occurrence'},{'rangeSeconds':[132.8,140.65],'finding':'Instrumental interval before the first credible ta-ko articulation. Original conditioned t138.509/Whisper134.66 select nonmatching preceding music.','status':'reject false early lyric onset'},{'rangeSeconds':[140.65,177.6],'finding':'Russian verse7 cues, first quiet-prefix/body entrance around141.1; final person note remains held much longer than ASR/crop.','status':'individual instance review below'},{'rangeSeconds':[177.6,222.35],'finding':'Second Russian chorus10 cues; quiet night prefixes and the preceding long moon note overlap ambiguously, so do not copy timings or equate core confidence with exact onset.','status':'individual instance review below'},{'rangeSeconds':[222.35,239.6],'finding':'Two poem30 response pairs recur, separately from the closing Russian night/night. Distinct checkpoint agrees on Japanese-like phonetic shapes; global RU phonetic nonsense and stem thank-you omission do not establish absence.','status':'response inventory supported by unprompted original observations, exact source units root responsibility'},{'rangeSeconds':[239.6,255.094422],'finding':'Last articulated Japanese phrase decays into approximately240; later instrumental bed around242.8–255 has no matching articulated stem sequence for the ASR stock thank-you251–255. Small original also omits it.','status':'reject fabricated thank-you subtitle; do not assert categorical silence'}],'highPriorityFindings':[{'id':'false-early-first-feeling','phraseId':'RU-011','sourceIndex':0,'finding':'Conditioned alternatives134.66 and138.509 precede matching ta-ko articulation; stem141.153 recovers the body. Isolated pre-burst140.67 may be breath, so exact quiet onset remains uncertain.'},{'id':'held-words-crop-censored','finding':'RU003/004/006/008/017/020/021/023/025 require main vowel/body continuation beyond sparse CTC last character and often beyond phrase crop; root must widen candidates and keep entire lane group visible.'},{'id':'quiet-night-prepositions','finding':'RU009/RU026 prepositions are low/near-zero path scores and share a region with earlier moon tails. Provisional cluster-based starts are proposals, not accepted listening facts. Long gap/overlap must not be interpreted automatically as continuous pronunciation.'},{'id':'following-japanese-borrowed','phraseId':'RU-027','sourceIndex':3,'finding':'Stem forced final ночь to224.060, borrowing new Japanese response. Its Russian body releases around222.2; Japanese k/i articulation near222.32/222.40 may follow an initial u already overlapping near221.8.'},{'id':'scope-and-language-inventory','finding':'Add performed opening and final poem30 excerpt repetitions; never invent prelude or stock end-title lyrics from unconstrained ASR. Preserve source reference unchanged.'}],'russianPerWordProposals':records,'unpromptedInventoryInputs':inputs,'reviewArtifactIdentity':{'builder':'analysis/independent-audio/build_review.py','builderSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'ctcOriginalFiles':[{ 'file':f'analysis/independent-audio/ctc-{p["id"]}.json','sha256':hashlib.sha256((H/f'ctc-{p["id"]}.json').read_bytes()).hexdigest()} for p in phrases],'ctcStemFiles':[{ 'file':f'analysis/independent-audio/ctc-vocals-{p["id"]}.json','sha256':hashlib.sha256((H/f'ctc-vocals-{p["id"]}.json').read_bytes()).hexdigest()} for p in phrases],'noAbsolutePaths':True}}


review['modelAndPcmIdentity']={
 'mmsFamily':'Meta MMS multilingual Wav2Vec2 CTC',
 'mmsCheckpointArtifact':'torchaudio MMS_FA model.pt',
 'mmsCheckpointSha256':streamed_hash(Path.home()/'.cache/torch/hub/checkpoints/model.pt'),
 'originalMix44100Sha256':streamed_hash(H/'original-mix-44100.wav'),
 'originalMix16000Sha256':streamed_hash(H/'original-mix-16000.wav'),
 'vocals44100EstimateSha256':streamed_hash(H/'stems/htdemucs/source/vocals.wav'),
 'vocals16000EstimateSha256':streamed_hash(H/'vocals-16000.wav'),
 'ctcOriginalRunnerSha256':streamed_hash(H/'ctc_observations.py'),
 'ctcStemRunnerSha256':streamed_hash(H/'ctc_stem_observations.py'),
 'plotRunnerSha256':streamed_hash(H/'make_panels.py'),
 'stemClockSha256':streamed_hash(H/'stem-clock.json'),
 'japaneseCandidateWarning':'The generic uroman runner is not suitable for Japanese kanji: its default normalization can produce Chinese readings. Those early Japanese outputs are rejected; only root’s separate native-kana normalized pipeline is considered for the overlap addendum. Russian source units use the correct script-compatible normalization.'
}

review['japaneseOverlapProposal'] = {
 'phraseId':'JP30-003','sourceIndex':0,'text':'憂き',
 'proposedOnsetSeconds':221.80,'onsetRangeSeconds':[221.65,222.12],
 'releaseRangeSeconds':[222.40,222.58],
 'preserveRussianClosingBodyRangeSeconds':[222.14,222.35],
 'method':'Original/stem fixed-scale 220.8–225.6 physical panel plus individually evaluated native-kana normalized CTC and phonetic syllable anatomy; not listening.',
 'rationale':'Narrow crop222.35 truncates the initial u. Widened stem assigns u220.780 with score0.00023 to Russian noch while k222.322/i222.402 and mono222.862 are plausible. Independently evaluated other uki occurrences show a held u followed by k about0.48–0.50s later. A changed/lower body around221.8–222.05 is compatible with that sequence under the Russian tail; it is not a reason to shorten the preceding Russian word.',
 'displayImplication':'If canonical events choose this overlap, represent concurrent source ownership and transition the bilingual/trilingual groups without losing the final Russian held note. Do not manufacture a non-overlap by clipping old body or pinning Japanese u to crop start.',
 'panel':'analysis/independent-audio/panels/detail-language-handoff.png',
 'normalizedCandidate':'analysis/japanese-ctc/vocal-JP30-003-wide.json',
 'candidateSha256':hashlib.sha256((P/'analysis/japanese-ctc/vocal-JP30-003-wide.json').read_bytes()).hexdigest(),
 'humanListening':False,'status':'provisional overlap; lexical ownership and onset require listening'
}
review['highPriorityFindings'].append({'id':'japanese-russian-overlap','finding':'Third Japanese 憂き likely begins around221.8 under the final Russian night body. Narrow222.35 crop censors its u; wide220.780 u score0.00023 borrows Russian voice. Preserve Russian body and explicit overlapping ownership instead of forcing a synthetic handoff.'})
review['performedInventory'][8]['rangeSeconds']=[221.65,239.6]
review['performedInventory'][8]['finding'] += ' The first late 憂き may begin around221.8 beneath the final Russian night; crop222.35 is not a trustworthy lexical onset.'

E=P/'evidence';E.mkdir(exist_ok=True);(E/'independent-acoustic-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
lines=['# Independent acoustic review — Призрак','','## Scope and limits','','Complete recording inventory, two Whisper checkpoints, original MMS and clock-verified estimated-vocal MMS, all27 Russian cues/106 word proposals, plus separate Japanese opening/main/response checks. No canonical event was edited. No human listening or approval is implied. Dense sample/hop coordinates are representations, not acoustic millisecond certainty.','','Source SHA256: `'+review['sourceSha256']+'`. Original audio44,100Hz/11,249,664 decoded stereo samples; source zero retained. HTDemucs stems have matching length and six original-versus-reconstruction zero-lag windows, with reconstruction correlations .996–.9999. Estimates are not bit-identical audio or lexical authority.','','## Findings','','- First «Такое» must not start on134.66/138.509 music. Its ta-ko articulation is around141.15; a preceding quiet burst140.67–140.89 may be breath. Explicit range140.65–141.18 remains pending listening.','- Several sustained final words continue far beyond ASR/CTC cores: «волосам», «меня», «луною», and especially verse-ending «человек» through about177.6. Full bilingual text must remain readable through actual vocal bodies.','- Four quiet «В» events before night phrases or after long tails are particularly uncertain. Both constrained model scores are weak/near-zero. Prefix/overlap ranges are retained rather than claiming a perfect onset from the strongest vowel.','- Final Russian «ночь» cannot extend to224.060 using the stem path: that borrows the Japanese response. Its Russian body ends around222.2. A separately examined Japanese initial «憂き» may begin around221.8 beneath that closing body; preserve overlap rather than clipping either word to force a non-overlapping handoff.','- The source contains two opening and two final pairs compatible with poem30 «憂きものはなし / 暁ばかり», in addition to two main poem59 runs. No first-half poem30 line is invented. Canonical institutions corroborate spelling/meaning in the separate editorial report, not acoustic performance.','- Large/small lexical main passes preserve recognizable phonetic shapes but often replace classical wording. Japanese-global ASR garbles Russian. Music labels, instrument syllables and251–255 “thanks for watching” are rejected rather than subtitled.','','## Per-word proposals','','The JSON contains each source word, raw original/stem/Whisper bounds and scores, a proposed onset/release, explicit ranges, sample representations and rationale. They remain proposals for the coordinator’s single canonical writer. Separate lyric focus, neutral reading hold and effect tail; do not fill an uncertain gap with active highlighting.','','| Cue | First proposed onset | Last proposed body release | Words |','| --- | ---: | ---: | ---: |']
for r in records:lines.append(f'| {r["phraseId"]} | {r["units"][0]["proposedOnsetSeconds"]:.3f}s | {r["units"][-1]["proposedReleaseSeconds"]:.3f}s | {len(r["units"])} |')
lines += ['','## Reproducibility','','Owned scripts and model/checkpoint/input identities are retained under `analysis/independent-audio/`. Every Russian instance has a fixed-scale original/estimate spectrum and original-sample min/max panel. FFT1024 at44.1k has23.22ms support; hop88 is1.995ms, which does not resolve phonetic uncertainty to2ms. No remote operation, production render, Desktop output or human listening log was created.']
md='\n'.join(lines)+'\n'
import re
md=re.sub(r'\b(all|audio|on|around|burst|range|about|to|poem|and|FFT|at|has|is)(?=\d)', r'\1 ', md)
md=md.replace('at44.1k','at 44.1k').replace('has23.22ms','has 23.22ms').replace('is1.995ms','is 1.995ms').replace('to2ms','to 2ms')
(E/'independent-acoustic-review.md').write_text(md);print(json.dumps({'status':'proposals saved','cues':len(records),'words':sum(len(r['units']) for r in records),'json':'evidence/independent-acoustic-review.json','humanListening':False}))
