from pathlib import Path
import json,re,zipfile
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'analysis/rebuild'
phrases=json.loads((ROOT/'source/acoustic-phrases.json').read_text())['phrases']
plan=json.loads((ROOT/'source/acoustic-crop-plan-v3.json').read_text())['phrases']
key=lambda s:re.sub(r'[^а-яё]','',s.lower().replace('ё','е'))
tokens=lambda s:re.findall(r'[А-Яа-яЁё]+(?:-[А-Яа-яЁё]+)*',s)
groups={p['id']:{'id':p['id'],'voice':p['voice'],'lane':p['lane'],'text':p['ru'],'words':[{'text':w,'index':i}for i,w in enumerate(tokens(p['ru']))]}for p in phrases}
with zipfile.ZipFile(OUT/'baseline-v2.zip') as z:
    baseline=json.loads(z.read('public/timeline.json'))
for old in baseline['cues']:
    index=0
    for w in old['words']:
        target=groups[old['id']]['words'][index]
        if key(w['text'])=='тихотихо':
            for j in [index,index+1]:groups[old['id']]['words'][j]['baseline']={'start':w['startSample']/44100,'end':w['endSample']/44100,'note':'one former event covered both quietly repeats'}
            index+=2;continue
        assert key(target['text'])==key(w['text']),(old['id'],target,w)
        target['baseline']={'start':w['startSample']/44100,'end':w['endSample']/44100};index+=1
    assert index==len(groups[old['id']]['words'])

for context in [p for p in plan if p['id'].startswith('context-')]:
    name=context['id'].removeprefix('context-')
    expected=[row for cid in context['contextCueIds'] for row in groups[cid]['words']]
    for material in ['vocal','original']:
        d=json.loads((OUT/(name+'-'+material+'.json')).read_text())
        raw=[w for s in d['segments'] for w in s['words'] if re.search(r'[А-Яа-яЁё]',w['word'])]
        assert len(raw)==len(expected),(name,material,len(raw),len(expected))
        for word,row in zip(raw,expected):
            assert key(word['word'])==key(row['text']),(name,word,row['text'])
            row['whisper-'+material]={'start':word['start'],'end':word['end'],'probability':word.get('probability')}
    for material in ['original','vocals']:
        d=json.loads((OUT/('mms-'+material)/('mms-'+context['id']+'.json')).read_text())
        assert len(d['words'])==len(expected)
        for word,row in zip(d['words'],expected):
            assert key(word['text'])==key(row['text'])
            row['ctc-'+material]={'start':word['startSeconds'],'end':word['endSeconds'],'score':word['score'],'characters':word['characters']}

for p in phrases[42:]:
    g=groups[p['id']]
    for material in ['original','vocals']:
        d=json.loads((OUT/('mms-'+material)/('mms-'+p['id']+'.json')).read_text())
        for word,row in zip(d['words'],g['words']):
            row['ctc-'+material]={'start':word['startSeconds'],'end':word['endSeconds'],'score':word['score'],'characters':word['characters']}

flat=[{'cueId':g['id'],**w}for g in groups.values()for w in g['words']]
bad=[{'id':w['cueId'],'text':w['text'],'vocal':w['whisper-vocal'],'original':w['whisper-original']}for w in flat if 'whisper-vocal'in w and(w['whisper-vocal']['end']-w['whisper-vocal']['start']<.06 or abs(w['whisper-vocal']['start']-w['whisper-original']['start'])>.18)]
payload={'sourceSha256':baseline['sourceSha256'],'status':'Acoustic/model comparison, not listening approval','groups':list(groups.values()),'highPriority':bad}
(OUT/'word-comparison.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'groups':len(groups),'words':len(flat),'highPriority':len(bad),'items':bad},ensure_ascii=False,indent=2))
