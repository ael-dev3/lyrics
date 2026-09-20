import {writeFileSync} from 'node:fs';
type Line={ru:string;en:string;note?:string};
const verse1:Line[]=[
 {ru:'Разноцветные глаза',en:'Different-colored|0 eyes|1'},
 {ru:'Волосы цвета огня',en:'Hair|0 the|1 color|1 of|2 fire|2'},
 {ru:'Пару личностей во мне',en:'A|0 couple|0 of|0 personalities|1 within|2 me|3'},
 {ru:'Будь поосторожней',en:'Be|0 more|1 careful|1'},
 {ru:'Искупи свои грехи',en:'Atone|0 for|0 your|1 sins|2'},
 {ru:'Мы — священные огни',en:'We|0 are|0 sacred|1 flames|2'},
 {ru:'Мы не так плохи',en:"We're|0 not|1 as|2 bad|3"},
 {ru:'Как ты думаешь',en:'As|0 you|1 think|2'},
 {ru:'Подойди ко мне на шаг',en:'Come|0 a|3,4 step|3,4 toward|1 me|2',note:'На шаг is a single distance expression: a step. Other words retain individual events.'},
 {ru:'Подними свой белый флаг',en:'Raise|0 your|1 white|2 flag|3'},
 {ru:'Искусаю до крови',en:"I'll|0 bite|0 until|1 there's|2 blood|2",note:'The English impersonal blood construction preserves the omitted bite object rather than inventing one.'},
 {ru:'Пощады не проси',en:"Don't|1 ask|2 for|2 mercy|0"},
 {ru:'Растворившись в тишине',en:'Dissolving|0 into|1 silence|2'},
 {ru:'Голос твой на глубине',en:'Your|1 voice|0 in|2 the|3 depths|3'},
 {ru:'Тайну расскажет реке',en:'Will|1 tell|1 a|0 secret|0 to|2 the|2 river|2'},
 {ru:'Я кажусь тебе другой',en:'I|0 seem|1 different|3 to|2 you|2'},
 {ru:'Хочешь, получи любовь',en:'If|0 you|0 want,|0 receive|1 love|2',note:'If you want is the complete elliptical second-person conditional Хочешь.'},
 {ru:'Но не забывай, что это дар не мой',en:"But|0 don't|1 forget|2 that|3 this|4 gift|5 isn't|6 mine|7"},
];
const pre:Line[]=[
 {ru:'Не стоило смотреть в мои глаза',en:'You|1 should|1 not|0 have|2 looked|2 into|3 my|4 eyes|5',note:'Impersonal past warning expressed naturally in English; explicit negation and possessive retain their own events.'},
 {ru:'И не утони потом в своих слезах',en:"And|0 don't|1 drown|2 afterward|3 in|4 your|5 tears|6"},
];
const chorus:Line[]=[
 {ru:'На ветру белое платье',en:'A|3 white|2 dress|3 in|0 the|1 wind|1'},
 {ru:'На тебе проклятье',en:'A|2 curse|2 upon|0 you|1'},
 {ru:'Мне нужны объятия, поцелуи, счастье',en:'I|0 need|1 embraces,|2 kisses,|3 happiness|4'},
 {ru:'Разлетелся пепел боли',en:'The|1 ashes|1 of|2 pain|2 scattered|0'},
 {ru:'Я бегу по полю',en:'I|0 run|1 through|2 the|3 field|3'},
 {ru:'С тобою в небеса',en:'With|0 you|1 into|2 the|3 heavens|3'},
];
const verse2:Line[]=[
 {ru:'Мы с тобой как волшебство',en:'You|2 and|1 I|0 are|0 like|3 magic|4',note:'Inclusive мы с тобой is rendered as you and I, retaining the explicit companion and comparison.'},
 {ru:'Жаль, в конце ждёт ничего',en:'Too|0 bad,|0 nothing|4 awaits|3 at|1 the|2 end|2',note:'Preserves the unusual supplied wording; performed wording must be checked against the recording.'},
 {ru:'Я не знаю как нам быть',en:"I|0 don't|1 know|2 what|3 we|4 should|4 do|5"},
 {ru:'Будет проще отпустить',en:'It|0 will|0 be|0 easier|1 to|2 let|2 go|2'},
 {ru:'Мне казалось ты любил',en:'It|1 seemed|1 to|0 me|0 you|2 loved|3',note:'The object of loved is unstated in Russian and remains unstated in English.'},
 {ru:'Но в глаза кидал мне пыль',en:'But|0 you|1,2,3,5 were|1,2,3,5 deceiving|1,2,3,5 me|4',note:'Кидать пыль в глаза is an idiom meaning deceive. Its discontinuous source members share complete paired focus; explicit мне remains independent.'},
 {ru:'Книга жизни возгорит',en:'The|0 book|0 of|1 life|1 will|2 burn|2'},
 {ru:'Больше не найдёшь страниц',en:"You'll|2 find|2 no|1 more|0 pages|3"},
];
const sequence=[...verse1.map(l=>({...l,section:'Verse 1'})),...pre.map(l=>({...l,section:'Pre-chorus 1'})),...chorus.map(l=>({...l,section:'Chorus 1'})),...verse2.map(l=>({...l,section:'Verse 2'})),...pre.map(l=>({...l,section:'Pre-chorus 2'})),...chorus.map(l=>({...l,section:'Chorus 2'})),...chorus.map(l=>({...l,section:'Bridge'})),...chorus.map(l=>({...l,section:'Final chorus'}))];
const cues=sequence.map((line,i)=>{const id='VE-'+String(i+1).padStart(3,'0');const ru=line.ru.split(/\s+/).filter(t=>t!=='—').map((text,j)=>({id:id+'-s'+String(j+1).padStart(2,'0'),text}));const en=line.en.split(' ').map((part,j)=>{const [text,index]=part.split('|');if(!text||!index)throw Error('Bad translation map');return {id:id+'-e'+String(j+1).padStart(2,'0'),text,sourceIds:index.split(',').map(n=>{const w=ru[Number(n)];if(!w)throw Error('Unknown source in '+part);return w.id;})};});return {id,section:line.section,ru,en,mappingRationale:line.note??'Individual lexical correspondence with full grammatical completions; natural English order, no invented English acoustic events.'};});
writeFileSync('source/text-and-mapping.json',JSON.stringify(cues,null,2)+'\n');
writeFileSync('source/performed-reference.txt',sequence.map(l=>l.ru).join('\n')+'\n');
writeFileSync('source/translation-en.txt',cues.map(c=>c.en.map(w=>w.text).join(' ')).join('\n')+'\n');
console.log({cues:cues.length,sourceWords:cues.reduce((n,c)=>n+c.ru.length,0),targetWords:cues.reduce((n,c)=>n+c.en.length,0)});
