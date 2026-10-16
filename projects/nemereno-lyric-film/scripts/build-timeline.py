"""Build the full preview from explicit source events and semantic anchors."""
from pathlib import Path
import json,re,hashlib
ROOT=Path(__file__).resolve().parents[1]
SR=44100
RU_RE=re.compile(r'[А-Яа-яЁё]+(?:-[А-Яа-яЁё]+)*')
EN_RE=re.compile(r"[A-Za-z]+(?:[’'\-][A-Za-z]+)*")
key=lambda s:re.sub(r'[^а-яё]','',s.lower().replace('ё','е'))
editorial=json.loads((ROOT/'source/lyrics-editorial.json').read_text())
recording=json.loads((ROOT/'source/recording.json').read_text())
boundaries=json.loads((ROOT/'source/word-boundaries-v3.json').read_text())
holds=json.loads((ROOT/'source/cue-holds-v3.json').read_text())['holdThrough']
actual=hashlib.sha256((ROOT/'public/source.mp4').read_bytes()).hexdigest()
assert actual==recording['sourceSha256']==boundaries['sourceSha256'],'Source identity changed'
groups={g['id']:g for g in boundaries['groups']}

def punctuation(text,token,following):
    suffix=text[token.end():following]
    if '—'in suffix:return ' —' if token.re.pattern==RU_RE.pattern else '—'
    match=re.search(r'[.,!?…:;]+',suffix)
    return match.group()if match else''

cues=[];ledger=[]
for item in editorial['cues']:
    group=groups[item['alignmentGroup']]
    offset,limit=item['alignmentSlice']or(0,len(group['words']))
    chosen=group['words'][offset:limit]
    ru=list(RU_RE.finditer(item['ru']));en=list(EN_RE.finditer(item['en']))
    assert len(chosen)==len(ru),(item['id'],len(chosen),len(ru))
    words=[]
    for i,(token,event)in enumerate(zip(ru,chosen)):
        assert key(token.group())==key(event['text']),(item['id'],token.group(),event['text'])
        following=ru[i+1].start()if i+1<len(ru)else len(item['ru'])
        words.append({'id':event['id'],'text':token.group(),'punctuationAfter':punctuation(item['ru'],token,following),
          'sourceIndex':i,'sourceEventIndex':event['sourceIndex'],'startSample':event['startSample'],'endSample':event['endSample'],
          'confidence':'Preview proposal; '+event['reviewPriority']+' review priority. Source-sample storage is not a claim of perceptual certainty.',
          'method':event['decision']})
    assert len(en)==len(item['anchors']),(item['id'],len(en),len(item['anchors']))
    targets=[]
    for i,(token,anchor)in enumerate(zip(en,item['anchors'])):
        assert token.group()==anchor['token'],(item['id'],token.group(),anchor['token'])
        for index in anchor['sourceIndices']+anchor['focusSourceIndices']:assert 0<=index<len(words)
        following=en[i+1].start()if i+1<len(en)else len(item['en'])
        targets.append({'id':'NEM-'+item['id']+'-E'+str(i+1).zfill(2),'text':token.group(),
          'punctuationAfter':punctuation(item['en'],token,following),'sourceIndices':anchor['sourceIndices'],
          'focusSourceIndices':anchor['focusSourceIndices'],'relation':'Explicit meaning / necessary English grammar',
          'rationale':anchor['rationale']})
    covered={i for target in targets for i in target['sourceIndices']}
    assert covered==set(range(len(words))),(item['id'],covered)
    start=words[0]['startSample']/SR;end=words[-1]['endSample']/SR
    cue={'id':item['id'],'templateId':item['semanticTemplate'],'alignmentGroup':item['alignmentGroup'],'lane':item['lane'],'voice':item['voice'],
       'sourceLanguage':'ru','targetLanguage':'en','sourceText':item['ru'],'targetText':item['en'],'start':start,'end':end,
       'visibleStart':start,'fullOpacityEnd':end,'visibleEnd':end,'exitMode':'fade','words':words,'targets':targets,
       'sourceBreaks':[],'targetBreaks':[]}
    cues.append(cue)
    ledger.append({'cueId':cue['id'],'acousticGroup':item['alignmentGroup'],'voice':cue['voice'],'sourceText':cue['sourceText'],
       'targetText':cue['targetText'],'sourceEvents':words,'targetEvents':targets})

for lane in ['lead','backing']:
    lane_cues=sorted((c for c in cues if c['lane']==lane),key=lambda c:c['start'])
    prior_visible=0
    for i,cue in enumerate(lane_cues):
        next_start=lane_cues[i+1]['start']if i+1<len(lane_cues)else recording['sourceDuration']
        assert cue['end']<=next_start,(lane,cue['id'],cue['end'],next_start)
        cue['visibleStart']=max(0,cue['start']-.22,prior_visible)
        hold=min(next_start,max(cue['end']+.22,holds.get(cue['alignmentGroup'],cue['end'])))
        deadline=next_start-.22
        if deadline-hold>=.42:
            cue['fullOpacityEnd']=hold;cue['visibleEnd']=min(hold+.50,deadline);cue['exitMode']='fade'
        else:
            cue['fullOpacityEnd']=next_start;cue['visibleEnd']=next_start;cue['exitMode']='vocal-handoff'
        prior_visible=cue['visibleEnd']
        assert cue['visibleStart']<=cue['start']

timeline={'schemaVersion':1,'revision':editorial['revision'],'sampleRate':SR,'sourceSha256':actual,'sourceDuration':recording['sourceDuration'],
 'cues':sorted(cues,key=lambda c:(c['start'],c['lane']))}
(ROOT/'public/timeline.json').write_text(json.dumps(timeline,ensure_ascii=False,indent=2)+'\n')
(ROOT/'source/correspondence-ledger.json').write_text(json.dumps({'schemaVersion':2,'revision':timeline['revision'],'sourceSha256':actual,
 'policy':'Explicit per-token meanings, including reordered pronouns, articles, tense and inflection. Focus is a union of source events; no proportional token interpolation or English audio clock.','ledger':ledger},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'revision':timeline['revision'],'cues':len(cues),'sourceWords':sum(len(c['words'])for c in cues),
 'englishTokens':sum(len(c['targets'])for c in cues),'firstVoice':min(c['start']for c in cues),'lastVoice':max(c['end']for c in cues)},ensure_ascii=False))
