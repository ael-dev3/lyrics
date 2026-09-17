import {writeFileSync} from 'node:fs';
type Line={section:string;ru:string;en:string;note?:string};
const verse1:Line[]=[
 {section:'Verse 1',ru:'Каждый, кто сделал тебе больно — покойник',en:'Everyone|0 who|1 hurt|2,4 you|3 is|5 dead|5',note:'сделал больно is the discontinuous construction meaning hurt; English hurt follows the union of its two source intervals.'},
 {section:'Verse 1',ru:'Укрою тебя пледом, посажу на подоконник',en:"I'll|0 cover|0 you|1 with|2 a|2 blanket,|2 sit|3 you|3 on|4 the|5 windowsill|5",note:'Instrumental пледом supplies with a blanket. The second you is the grammatical object continued by посажу.'},
 {section:'Verse 1',ru:'Залезу под свитер, в самое сердце',en:"I'll|0 crawl|0 under|1 the|2 sweater,|2 into|3 the|5 very|4 heart|5"},
 {section:'Verse 1',ru:'Ты — холодный Питер, но в тебе можно согреться',en:"You're|0 cold|1 St.|2 Petersburg,|2 but|3 one|6 can|6 warm|7 up|7 in|4 you|5",note:'Питер is colloquial Saint Petersburg. Можно is impersonal possibility; no new personal subject is supplied.'},
 {section:'Verse 1',ru:'Каждый шрамом на запястье остался',en:'Each|0 remained|4 as|1 a|1 scar|1 on|2 the|3 wrist|3',note:'The wrist remains non-possessive, as in the source. Remained retains past tense.'},
 {section:'Verse 1',ru:'Я убью всех тех, кто посмел тебя касаться',en:'I|0 will|1 kill|1 all|2 those|3 who|4 dared|5 to|7 touch|7 you|6'},
 {section:'Verse 1',ru:'Мятые простыни, отключили свет',en:'Crumpled|0 sheets;|1 they|2 turned|2 off|2 the|3 lights|3',note:'The unspecified plural subject in отключили is retained as they, without identifying anyone.'},
 {section:'Verse 1',ru:'Мы друг для друга созданы, бракованный дуэт',en:"We're|0 made|4 for|2 each|1 other,|3 a|5 defective|5 duet|6"},
];
const hook=(section:string):Line[]=>[
 {section,ru:'Чай на столе, жаль, что не ты',en:"Tea|0 on|1 the|2 table|2 —|3 a|3 pity|3 it's|4 not|5 you|6",note:'The table image and explicit negation remain literal. No unstated action is added.'},
 {section,ru:'Привяжу тебя к себе, чтоб не боялась темноты',en:"I'll|0 tie|0 you|1 to|2 me|3 so|4 you|6 aren't|5 afraid|6 of|7 the|7 dark|7",note:'The grammatical subject of боялась is you. English negation is linked to не separately; of the dark is the complete inflected noun meaning.'},
 {section,ru:'Чай на столе, жаль, что не ты…',en:"Tea|0 on|1 the|2 table|2 —|3 a|3 pity|3 it's|4 not|5 you…|6"},
];
const verse2:Line[]=[
 {section:'Verse 2',ru:'Я бы хотела стать твоим одеялом',en:'I|0 would|1 like|2 to|3 become|3 your|4 blanket|5'},
 {section:'Verse 2',ru:'Чтобы ночью ты со мной спала и не замерзала',en:"So|0 you|2 sleep|5 with|3 me|4 at|1 night|1 and|6 don't|7 get|8 cold|8"},
 {section:'Verse 2',ru:'Согреть тебя тем, что от меня осталось',en:"To|0 warm|0 you|1 with|2 what's|3 left|6 of|4 me|5"},
 {section:'Verse 2',ru:'Лишь бы ты не заболела, лишь бы утром улыбалась',en:"Just|0,1 so|0,1 you|2 don't|3 fall|4 ill,|4 just|5,6 so|5,6 you|8 smile|8 in|7 the|7 morning|7",note:'Лишь бы is an irreducible wish construction, repeated independently. Just so retains the wish without implying that illness has already happened. The second subject is encoded by улыбалась. No invented English acoustic times.'},
 {section:'Verse 2',ru:'Я бы хотела жить с тобой в одном теле',en:'I|0 would|1 like|2 to|3 live|3 with|4 you|5 in|6 one|7 body|8'},
 {section:'Verse 2',ru:'Игнорировать соседей, что стучат по батареям',en:'Ignoring|0 the|1 neighbors|1 who|2 bang|3 on|4 the|5 radiators|5'},
 {section:'Verse 2',ru:'Днём или ночью — это неважно',en:"By|0 day|0 or|1 by|2 night|2 —|3 it|3 doesn't|4 matter|4"},
 {section:'Verse 2',ru:'Я так счастлива с тобой в этой большой многоэтажке',en:"I'm|0 so|1 happy|2 with|3 you|4 in|5 this|6 big|7 high-rise|8"},
];
const lines=[...verse1,...hook('Pre-chorus 1'),...hook('Chorus 1'),...verse2,...hook('Pre-chorus 2'),...hook('Chorus 2'),...hook('Final chorus')];
const normalized=lines.map((line,i)=>{
 const id='KB-'+String(i+1).padStart(3,'0');
 const ru=line.ru.split(/\s+/).filter(t=>t!=='—').map((text,j)=>({id:id+'-s'+String(j+1).padStart(2,'0'),text}));
 const en=line.en.split(' ').map((part,j)=>{const [text,index]=part.split('|');if(!text||!index)throw Error('Bad map '+part);return {id:id+'-e'+String(j+1).padStart(2,'0'),text,sourceIds:index.split(',').map(n=>{const w=ru[Number(n)];if(!w)throw Error('Unknown map '+part);return w.id;})};});
 return {id,section:line.section,ru,en,mappingRationale:line.note??'Individual lexical correspondences; articles, auxiliaries and inflectional expansions share the complete source meaning.'};
});
writeFileSync('source/text-and-mapping.json',JSON.stringify(normalized,null,2)+'\n');
writeFileSync('source/performed-reference.txt',lines.map(l=>l.ru).join('\n')+'\n');
writeFileSync('source/translation-en.txt',normalized.map(c=>c.en.map(w=>w.text).join(' ')).join('\n')+'\n');
console.log({cues:normalized.length,ru:normalized.reduce((n,c)=>n+c.ru.length,0),en:normalized.reduce((n,c)=>n+c.en.length,0)});
