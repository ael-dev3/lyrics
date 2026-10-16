"""Reconcile source-clock proposals without pretending to perform listening."""
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[2]
comparison=json.loads((ROOT/'analysis/rebuild/word-comparison.json').read_text())
manual={}
def choose(cid,index,start=None,end=None,reason='',bounds=None):
    manual[(cid,index)]={'start':start,'end':end,'reason':reason,'plausibleOnsetRange':bounds}
choose('open-beauty',0,.575,None,'The original/stem panel shows the initial high-frequency sibilant at about 0.57 before the voiced body near 0.70. Both CTC paths retain an initial character core at 0.632; the former 0.740 selection omitted the quiet prefix.',[.55,.61])
choose('open-beauty',4,None,3.06,'The bounded original/stem allocation agrees on the next short I pickup at 3.06; pair the preceding relative-word release.')
choose('open-beauty',5,3.06,None,'Both bounded materials place the quiet я pickup at 3.06, before the stronger 3.13 CTC vowel.')
choose('tend-love-a',0,19.30,None,'The estimated-vocal bounded pickup precedes the stronger 19.432 character core; the original conditioned word collapsed. Preserve a conservative quiet entrance.',[19.26,19.40])
choose('tend-love-b',0,43.30,None,'The wide original/stem panel shows renewed upper vocal structure around 43.30. The old 42.50 interval mostly carried preceding musical leakage; CTC Я cores agree at 43.412.',[43.26,43.37])
choose('tend-love-c',0,62.48,None,'Fresh vocal structure is established around 62.45–62.55. Bounded original/stem starts are 62.54/62.60 with CTC core 62.612; reject the former 60.50 instrumental allocation.',[62.43,62.57])
choose('tend-love-d',0,160.94,None,'The duet pickup is supported by bounded vocal 160.92 before the 161.092 core. The original path collapsed the word; this remains a soft-overlap review target.',[160.85,161.10])
choose('tree-b',0,47.25,47.56,'Both CTC materials locate the connected first word before the nearly zero-duration Whisper core. Preserve its quiet prefix and pair the following pronoun.',[47.22,47.31])
choose('tree-b',1,47.56,None,'Paired handoff from the complete preceding чтобы.')
choose('tree-c',0,66.39,66.68,'Both CTC materials place the initial core at 66.432; the Whisper short core omitted the connected prefix.',[66.35,66.46])
choose('tree-c',1,66.68,None,'Paired handoff from the complete preceding чтобы.')
choose('tend-love-d',5,None,163.84,'The conjunction hands into the quiet вынашивать prefix before its stronger body.')
choose('tend-love-d',6,163.84,None,'Original bounded 163.90 and both CTC paths 163.872 support the leading body omitted by the later stem allocation.',[163.80,163.92])
choose('tend-love-d',7,None,164.82,'Pair the end of так with the following connected чтоб.')
choose('tree-d',0,164.82,165.10,'Both CTC materials agree on the 164.852 initial character core before the short full-song allocation.',[164.78,164.91])
choose('tree-d',1,165.10,None,'Paired handoff from the complete preceding чтоб.')
choose('fingertips-a',4,None,29.34,'End ею where the connected окрашены vowel/closure begins; the former blank span is not a proven silence.')
choose('fingertips-a',5,29.34,None,'Both bounded Whisper paths start 29.34 and the CTC core follows at 29.372. The source panel supports that entrance; reject the former 29.98 delayed start.',[29.30,29.39])
choose('fingertips-c',0,69.95,None,'The bounded vocal onset 69.96 precedes both 70.032 character cores; reject the much earlier mix-only gap allocation.',[69.90,70.03])
choose('fingertips-d',0,168.40,168.70,'The source/stem character core at 168.472 and vocal 168.48 support a quiet prefix. The mix-only 167.94 proposal borrows prior held voice.',[168.35,168.50])
choose('fingertips-d',1,168.70,None,'Paired handoff from the complete preceding чтобы.')
choose('measure-repeat-a',0,38.36,39.82,'The wide original/stem panel distinguishes prior decay from renewed direct voice around 38.4. The 37.14 broad allocation is rejected; the stronger model core is later at 38.65.',[38.30,38.48])
choose('quietly-a',0,90.46,90.82,'Split the two performed quietly words. The first source/stem CTC core is 90.452 and bounded words distinguish both occurrences.',[90.42,90.55])
choose('quietly-a',1,90.82,91.30,'Second quietly is an independent acoustic event, supported by the next character path and bounded word allocation.',[90.77,90.90])
choose('lose-stars',0,121.12,None,'The original/stem panel shows a high-frequency initial с prefix around 121.1 before renewed voiced body near 121.4. Reject the stem-only 119.28 instrumental allocation and the former late 121.40 core.',[121.08,121.22])
choose('enough-a',3,101.44,102.76,'Both bounded original/stem paths and independent first-character observations place this word directly after её at 101.44, ending around 102.7. The former 120.06–121.26 allocation borrowed the next verse across an 18-second bridge.',[101.40,101.55])
choose('hand-full',1,None,149.04,'Pair the negative release with the following quiet опустеет entrance.')
choose('hand-full',2,149.04,None,'Bounded original/stem 149.06/149.00 both support a quiet entrance before the 149.17–149.19 character cores.',[148.99,149.17])
choose('as-long-as-a',2,None,153.465,'The source panel supports a changed body after пор; preserve its release independently of the aligner’s zero-duration pickup.')
choose('as-long-as-a',3,153.465,153.785,'Both CTC paths preserve пока. Its body continues beyond the former 153.70 split into the next т closure around 153.79.',[153.43,153.55])
choose('as-long-as-a',4,153.785,154.15,'The original/stem panel shows the т closure and resumed body around 153.8, then the following quiet lateral transition around 154.15.',[153.75,153.85])
choose('as-long-as-a',5,154.15,155.15,'Remove the printed-dash allocation from lexical ownership. Select the quiet любовь entrance before its stronger 154.292 core; held release remains a review proposal.',[154.10,154.24])
choose('as-long-as-a',6,155.30,None,'Retain a real short phrase gap after the prior held love; do not fill it with synthetic focus.',[155.24,155.35])
choose('as-long-as-a',7,None,155.94,'Paired connected pronoun-to-love handoff; the printed dash is not a separately timed sound.')
choose('as-long-as-a',8,155.94,157.34,'The bounded source/stem allocation and 156.052 core support an earlier quiet love entrance and a longer direct body than the prior truncated interval.',[155.85,156.05])
choose('as-long-as-b',0,157.69,158.10,'Preserve the third independently sung temporal pickup; bounded observations differ, with a strong stem character path near 157.732.',[157.56,157.80])
choose('as-long-as-b',1,158.10,159.00,'Coupled held pronoun and following love ownership; no printed-dash sound is inserted.')
choose('as-long-as-b',2,159.00,160.66,'Retain the quiet love prefix before the 159.092 core and the existing held release before the male pickup.',[158.90,159.12])
choose('fingertips-d',5,None,173.22,'Pair the prior held body with the following soft conjunction; duet ownership remains uncertain.')
choose('measure-d',0,173.22,173.48,'The source/stem independent initial core appears near 173.25, before the nearly invisible 20ms broad alignment.',[173.15,173.44])
choose('measure-d',1,173.48,None,'Paired handoff from the complete preceding conjunction.')
choose('measure-d',4,None,175.70,'The lower vocal structure changes around 175.6–175.8 before the final word. Reject the collapsed 178.28 stem allocation.')
choose('measure-d',5,175.70,177.10,'The original/stem panel and independent 175.932 character core support a connected final word later than the former 175.20 point but before the mix-only 176.18 core. Direct release is a duet review proposal.',[175.55,175.94])
choose('because-i',0,None,180.16,'The last male phrase receives its own upper reading lane as the female pickup begins.')
choose('because-i',1,180.16,180.55,'Original/stem proposals span 180.16–180.62. Preserve the male voice independently of the earlier female pickup.')
choose('keep-it-b',0,180.38,180.58,'The bounded original quiet female pickup starts at 180.38 and the following храни has independent support. Earlier male/female ownership is unresolved; do not delay the entire word until 180.54.',[180.15,180.54])
choose('keep-it-b',1,180.58,None,'The complete female храни starts with its fricative before the 180.672 CTC core.')
choose('quietly-b',0,189.02,189.30,'Keep the soft first quietly and give the second its independent event. Source/stem character observations reject one shared whole-phrase highlight.')
choose('quietly-b',1,189.30,189.70,'The second quietly has a distinct character core at 189.292 and a separate bounded-vocal body.')
choose('quietly-b',2,189.70,None,'Paired handoff after the second quietly.')
choose('bloom-again',0,191.70,191.84,'Bounded source/stem estimates support a short complete feminine pronoun before вновь; the former 20ms event was too small to represent the pickup.',[191.58,191.81])
choose('bloom-again',1,191.84,None,'Paired pronoun-to-adverb handoff.')
choose('bloom-again',2,None,193.78,'Preserve the first independently held bloom through the next actual pronoun.')
choose('bloom-again',3,193.78,194.04,'The source/stem panel and 193.872 core preserve the second feminine pronoun. Reject the broad Whisper path that later jumps toward 199.')
choose('bloom-again',4,194.04,None,'The independently supported repeated adverb precedes the second bloom; broad 198-second proposals borrow later material.')
choose('bloom-again',5,None,196.0,'Retain the second performed bloom and its held body. The 199-second conditioned paths are rejected as a different later phrase.')
choose('enough-b',0,199.25,None,'Bounded original/stem onsets converge near 199.28–199.32; keep a quiet leading consonant before those cores.',[199.17,199.36])
choose('enough-b',3,None,201.30,'Both independent character paths and the original conditioned release continue beyond the former 201.02 tail; preserve the final direct word body.',None)

backing=[(161.34,162.62),(162.62,164.72),(164.72,165.45),(165.45,166.44),(166.44,169.90),(169.90,169.99),(169.99,171.80)]
for i,(a,b)in enumerate(backing):
    choose('backing-keep-a',i,a,b,'Separate female backing proposal from the original/stem character paths and stereo-difference conditioned observation. The previous mix-only start at 166.1 ignored earlier countervoice evidence; precise ownership remains unresolved.',[a-.25,a+.30])

groups=[];changed=0;pending=[]
for group in comparison['groups']:
    words=[]
    for row in group['words']:
        cid,index=group['id'],row['index'];base=row['baseline'];selection=manual.get((cid,index),{})
        start=base['start'] if selection.get('start')is None else selection['start']
        end=base['end'] if selection.get('end')is None else selection['end']
        if start!=base['start']or end!=base['end']:changed+=1
        observations={k:{f:v for f,v in value.items()if f!='characters'}for k,value in row.items()if k.startswith(('whisper','ctc'))}
        disagreement=any(abs(o['start']-start)>.20 for k,o in observations.items()if k.startswith('whisper'))
        risk='high' if group['lane']=='backing' or cid in ['measure-d','because-i','keep-it-b','bloom-again'] else 'medium' if disagreement or selection else 'lower'
        reason=selection.get('reason')or('Retain the full-context baseline; bounded and character observations were inspected as competing proposals. No global offset or transfer from another repeat is applied.')
        words.append({'id':'NEM-'+cid+'-R'+str(index+1).zfill(2),'text':row['text'],'sourceIndex':index,
            'startSample':round(start*44100),'endSample':round(end*44100),'before':base,'selectedSeconds':[start,end],
            'decision':reason,'plausibleOnsetRange':selection.get('plausibleOnsetRange'),'observations':observations,'reviewPriority':risk,'listeningReviewed':False})
        if risk=='high':pending.append({'id':words[-1]['id'],'text':row['text'],'start':start,'end':end})
    for i,w in enumerate(words):
        assert w['endSample']>w['startSample'],w['id']
        if i:assert w['startSample']>=words[i-1]['endSample'],(w['id'],words[i-1]['id'])
    groups.append({'id':group['id'],'voice':group['voice'],'lane':group['lane'],'sourceText':group['text'],'words':words})
files=sorted((ROOT/'analysis/rebuild').glob('*-vocal.json'))+sorted((ROOT/'analysis/rebuild').glob('*-original.json'))
out={'schemaVersion':1,'revision':'nemereno-rebuild-v3','sourceSha256':comparison['sourceSha256'],'sampleRate':44100,
 'status':'Reconciled preview proposals; direct full-song listening has not been attested.',
 'method':'Original/stem signal panels, bounded Stable-ts and an independent MMS character family. Character cores, source samples and listening certainty are distinct.',
 'groups':groups,'highPriority':pending,'observationHashes':{str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest()for p in files}}
(ROOT/'source/word-boundaries-v3.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
(ROOT/'source/cue-holds-v3.json').write_text(json.dumps({'schemaVersion':1,'policy':'Neutral reading holds are editorial lifetimes, independent of lexical highlighting; no singing is claimed in the hold.',
 'holdThrough':{'familiar-repeat':16.42,'measure-repeat-a':40.60,'tree-b':50.15,'tree-c':69.60,'new-strength':141.50,'measure-d':178.08,'quietly-b':191.70,'bloom-again':196.55,'enough-b':201.90}},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'groups':len(groups),'words':sum(len(g['words'])for g in groups),'changedWordIntervals':changed,'highPriority':len(pending)},ensure_ascii=False))
