"""Project editorial reference and smallest complete English meaning maps."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
templates={}
def add(key,ru,eng,indices,note='Individual lexical correspondence; required English grammar shares the same source event.'):
 assert len(eng.split())==len(indices),(key,eng,indices)
 templates[key]={'sourceText':ru,'targets':[{'text':w,'sourceIndices':(s if isinstance(s,list) else [s]),'focusSourceIndices':(s if isinstance(s,list) else [s]),'relation':'lexical or necessary English grammar','rationale':note} for w,s in zip(eng.split(),indices)]}
add('sleep','Засыпай на моих плечах','Fall asleep on my shoulders',[0,0,1,2,3])
add('stay','Оставайся здесь навсегда','Stay here forever',[0,1,2])
add('winds','Украдут нас с тобой во снах Ускользающие ветра','The fleeting winds will steal you and me away in dreams',[7,6,7,0,0,3,2,1,0,4,5],'Complete two-line sentence. English subject precedes the verb; you / with / us remain individually anchored. No fabricated English syllable times.')
# source indices: Исчезают0 со1 снегом2 пусть3 Непрожитые4 впрок5 года6
add('years','Исчезают со снегом пусть Непрожитые впрок года','Let the unlived years saved for later vanish with the snow',[3,6,4,6,5,5,5,0,1,2,2],'Complete poetic inversion. Непрожитые is one orthographic word; впрок retains the sense of provision for later.')
add('lips','И срывается с моих уст','And from my lips it slips',[0,2,3,4,1,1])
add('ooh','У-у','Ooh',[0],'Nonlexical sung vowel, not a lexical repeat or an English invention.')
add('dawn','Пусть ночь озарит рассвет','Let dawn light up the night',[0,3,2,2,1,1],'Poetic inversion interpreted as dawn illuminating night. Both ночь and рассвет have ambiguous case forms; preserve the plausible alternative in translation notes.')
add('pain','Ведь боли больше нет, нет','For there is no more pain, no more',[0,3,3,3,2,1,4,4],'English existential grammar belongs to нет, pain to боли, more to больше; the separately sung second нет has its own complete no-more event.')
add('warmth','Ты моим теплом согрет','You are warmed by my warmth',[0,3,3,3,1,2])
add('nothing','Ничего нет','There is nothing',[1,1,[0,1]],'Russian negative concord: ничего introduces nothing; нет completes its negative existential meaning. Keep nothing focused across both events, so the held нет highlights the complete There is nothing rather than an affirmative There is.')
add('nothing-alone','Ничего','Nothing',[0])
add('touch','Свет касается твоих плеч','Light touches your shoulders',[0,1,2,3])
add('sleep-day','Но ты спи, будто день ушёл','But you sleep as though the day has gone',[0,1,2,3,3,4,4,5,5])
add('guard','Я останусь тебя беречь','I will stay to keep you safe',[0,1,1,3,3,2,3],'Infinitive беречь supplies to keep safe; тебя remains the independently mapped you.')
add('alright','С нами всё будет хорошо','Everything will be alright with us',[2,3,3,4,0,1])
add('snow','Пусть сотрёт все подсказки снег','Let the snow erase every clue',[0,4,4,1,2,3])
add('trace','Не оставит им ни следа','Will leave no trace of them',[1,1,[0,3],4,2,2],'Не…ни is a discontinuous negation; no follows its exact two-event union, not an enclosing interval. Им refers to the clues, not an invented person.')
add('hide','И мы спрячемся ото всех','And we will hide from everyone',[0,1,2,2,3,4])
add('infinite','В бесконечное навсегда','Into an endless forever',[0,1,1,2])
phrases=[]
def p(key,lo,hi):
 i=len(phrases)+1;phrases.append({'id':f'NN-{i:03}','templateId':key,'crop':[lo,hi],'units':templates[key]['sourceText'].replace(',','').split(),'vocalTrack':'HTDemucs estimated vocal, source-locked'})
for item in [('sleep',15.1,20),('stay',19.2,23.7),('winds',23.1,30.7),('years',30.4,38.1),('lips',37.9,42),('stay',41.7,46.7),('ooh',46.4,55.4),('dawn',58,61.9),('pain',61.6,65.9),('warmth',65.6,69.3),('pain',69,73.2),('nothing',73,76.8),('nothing',76.6,80.5),('nothing',80.3,84.1),('nothing-alone',83.9,86.1),('touch',89.1,93.6),('sleep-day',93.2,97.3),('guard',97.1,101),('alright',100.8,104.6),('snow',104.5,108.3),('trace',108.1,112),('hide',111.7,115.7),('infinite',115.3,120.8),('ooh',120.7,131.3),('dawn',132,136),('pain',135.7,139.8),('warmth',139.4,143.4),('pain',143,147.4),('nothing',147,151),('nothing',150.7,154.7),('nothing',154.4,158.4),('nothing',158.1,162.2),('nothing-alone',161.9,165),('nothing',165.3,169.4),('nothing-alone',169.1,172.3),('nothing',172.5,176.5),('nothing-alone',176.4,179.9),('nothing-alone',180.1,183.6),('nothing-alone',183.8,188)]:p(*item)
x={'schemaVersion':1,'templates':templates,'phrases':phrases,'status':'Recording-supported text with provisional bounded crop inventory. Canonical onset/release selection follows independent model and original/stem spectral review.'}
(root/'source/editorial.json').write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
r=json.loads((root/'source/recording.json').read_text());(root/'analysis/phrases.json').write_text(json.dumps({'sourceSha256':r['sourceSha256'],'phrases':phrases},ensure_ascii=False,indent=2)+'\n')
print(len(phrases),'provisional phrase crops')
