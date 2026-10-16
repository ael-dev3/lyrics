"""Explicit meaning anchors for the rebuilt Russian / English edition."""
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[1]
EN_RE=re.compile(r"[A-Za-z]+(?:[’'\-][A-Za-z]+)*")
RU_RE=re.compile(r'[А-Яа-яЁё]+(?:-[А-Яа-яЁё]+)*')
phrases=json.loads((ROOT/'source/acoustic-phrases.json').read_text())['phrases']
templates={}

def add(key,en,anchors,reason=None):
    tokens=EN_RE.findall(en)
    assert len(tokens)==len(anchors),(key,tokens,anchors)
    rows=[]
    for i,(token,anchor) in enumerate(zip(tokens,anchors)):
        indices=[anchor] if isinstance(anchor,int) else anchor
        explanation=(reason or {}).get(i)
        if explanation is None:
            explanation='Explicit source meaning; English grammatical completions share this source event and have no invented timing.'
        rows.append({'token':token,'sourceIndices':indices,'focusSourceIndices':indices,'rationale':explanation})
    templates[key]={'en':en,'targets':rows}

add('open-words','Words cannot describe the beauty.',[0,1,2,3,3])
add('open-courtyard','That I saw today in the courtyard of the house.',[0,1,2,3,4,5,5,6,6,6])
add('why-speak','So why should I speak, then?',[0,1,1,3,4,2])
add('familiar','That will not make it any more familiar to you.',[[0,1],4,3,4,2,6,6,7,5,5],
    {0:'От того is a causal construction: that is the consequence of speaking, not an added addressee.'})
add('familiar-repeat','Any more familiar.',[0,0,1])
add('tend-love','I will keep this love warm and nurture it, so…',[0,3,4,2,1,4,5,6,6,7],
    {8:'English needs the object of nurture; it resumes the already explicit love and follows вынашивать, not a new sung token.'})
add('tree','that it grows within me into a tree…',[0,1,2,3,4,5,5,5])
add('fingertips','so the fingertips become colored by it…',[0,[1,2],[1,2],3,5,4,4],
    {1:'Кончики пальцев forms the compound noun fingertips; its article follows the same union of the two source intervals.',
     2:'Кончики пальцев is the irreducible English compound fingertips; original words remain independently focused.'})
add('measure','and for it to be within me beyond measure.',[0,1,2,1,1,3,4,5,5])
add('measure-repeat','Beyond measure…',[0,0])
add('keep-it','Keep it, and keep it, and keep it deep within yourself.',[1,0,2,3,3,4,5,5,6,7,8],
    {4:'The object is elliptical in the second Russian храни; English completes the imperative at that verb.',
     7:'The object is elliptical in the third Russian храни; English completes the imperative at that verb.'})
add('warmer','It is warmer and softer there.',[1,2,2,3,4,0])
add('linen','There she is in her snow-white underwear.',[0,1,1,2,3,4,5])
add('quietly','Softly, softly, she cries with happiness.',[0,1,4,4,2,3],
    {2:'The feminine personification is established in the preceding source line; the necessary English subject follows the inflected verb плачет.'})
add('share',"I'd shelter her, I'd embrace her, I'd share her.",[1,2,0,4,5,3,7,8,6],
    {0:'The conditional бы expresses the narrator’s wish; English supplies I would without guessing a beloved.',
     3:'The repeated conditional remains independent and receives its own English contraction.',
     6:'The third conditional remains independent and receives its own English contraction.'})
add('enough','God grant that it will be enough.',[1,0,0,2,3,3,3])
add('lose-stars','However much you lose—stars fall that way…',[[0,1,3],0,2,4,7,6,5,5],
    {0:'Сколько бы … ни is a concessive construction. However follows only its contributing source intervals, excluding intervening you.'})
add('blue-sky','shining again in the blue sky.',[1,0,2,3,4,3])
add('heart-breaks','However often your heart breaks into pieces…',[[0,1,6],0,3,2,7,4,5],
    {0:'Сколько бы … не/ни expresses concession here, not negation of the heart breaking; focus is the union of contributing words.'})
add('new-strength','It will bloom again with new strength.',[0,2,2,1,3,4,5])
add('keep-light','Keep your light…',[0,1,2])
add('hand-full','for your palm will not grow empty…',[0,3,4,2,1,2,2])
add('as-long-as-a','as long as you are love, as long as you are love…',[[0,1,2,3],[0,1,2,3],[0,1,2,3],4,5,5,6,6,6,7,8,8],
    {0:'До тех пор, пока is one temporal construction, as long as. Focus uses the union, not an enclosing span.',
     1:'The complete temporal expression follows its four contributing source words.',
     2:'The complete temporal expression follows its four contributing source words.'})
add('as-long-as-b','as long as you are love.',[0,0,0,1,2,2])
add('because-i','For I…',[0,1])
add('bloom-again','She will bloom again, she will bloom again.',[0,2,2,1,3,5,5,4])
add('backing-keep-a','Keep it, keep it, keep it deep within yourself.',[1,0,2,2,3,3,4,5,6])
add('backing-ah','Ah…',[0])
add('backing-keep-b','Keep it, keep it, and keep it.',[1,0,3,2,4,5,5])

def template_for(cid):
    for prefix in ['tend-love','tree','fingertips','measure-repeat','measure','keep-it','warmer','linen','quietly','share','enough']:
        if cid.startswith(prefix+'-'):return prefix
    return cid

cues=[]
for phrase in phrases:
    pieces=[{'id':phrase['id'],'ru':phrase['ru'],'alignmentSlice':None}]
    if phrase['id']=='open-beauty':
        pieces=[{'id':'open-words','ru':'Словами не описать красоты,','alignmentSlice':[0,4]},
                {'id':'open-courtyard','ru':'что я видел сегодня во дворе дома.','alignmentSlice':[4,11]}]
    for piece in pieces:
        key=template_for(piece['id']);template=templates[key]
        count=len(RU_RE.findall(piece['ru']))
        mapped=set(i for target in template['targets'] for i in target['sourceIndices'])
        assert mapped==set(range(count)),(piece['id'],mapped,count)
        source_text=piece['ru'][0].upper()+piece['ru'][1:]
        english=template['en'][0].upper()+template['en'][1:]
        anchors=[dict(a) for a in template['targets']]
        anchors[0]['token']=EN_RE.findall(english)[0]
        cues.append({**phrase,**piece,'ru':source_text,'alignmentGroup':phrase['id'],'semanticTemplate':key,
          'lane':'backing' if phrase['id']=='because-i' else phrase['lane'],
          'en':english,'anchors':anchors})

out={'schemaVersion':2,'revision':'nemereno-rebuild-v4.3','song':'немерено','sourceLanguage':'ru','translationLanguage':'en',
 'translationStyle':'Meaning-faithful poetic English. Explicit word/grammar anchors replace positional interpolation; original and English remain equally prominent.',
 'cues':cues}
(ROOT/'source/lyrics-editorial.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
(ROOT/'source/semantic-map.json').write_text(json.dumps({'schemaVersion':1,'revision':out['revision'],'policy':'Every English token has an explicit source meaning and complete grammatical focus. Groups are limited to documented compounds or constructions. All repeats use independent acoustic events.','templates':templates},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'cues':len(cues),'templates':len(templates),'targetTokens':sum(len(c['anchors']) for c in cues)},ensure_ascii=False))
