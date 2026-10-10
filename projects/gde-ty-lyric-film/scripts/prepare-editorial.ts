import {readFileSync,writeFileSync} from 'node:fs';
type Group={text:string;source:number[];rationale:string};
const g=(text:string,source:number|number[],rationale='Lexical correspondence; necessary English morphology or grammar shares this source event.'):Group=>({text,source:Array.isArray(source)?source:[source],rationale});
const idiom='Complete irreducible English construction follows the union of its actual Russian contributors; real intervening gaps remain neutral.';
const rows:{ru:string;crop:[number,number];voice:string;lane?:string;groups:Group[]}[]=[
 {ru:'Когда…',crop:[0,8],voice:'элли на маковом поле',groups:[g('When…',0)]},
 {ru:'Я искал тебя, заглядывал во все магазины',crop:[10.5,20.8],voice:'элли на маковом поле',groups:[g('I',0),g('searched for',1),g('you,',2),g('peering',3),g('into',4),g('every',5),g('shop.',6)]},
 {ru:'Прилавки хранили твой запах тёплого смеха и сухого вина',crop:[19.5,30.1],voice:'элли на маковом поле',groups:[g('The counters',0),g('held',1),g('your',2),g('scent',3),g('of warm',4),g('laughter',5),g('and',6),g('dry',7),g('wine.',8)]},
 {ru:'Подозревал в твоей краже всех, включая кассиров',crop:[29.8,35.7],voice:'элли на маковом поле',groups:[g('I suspected',0),g('everyone',4),g('of',1),g('stealing',3),g('you,',2,'Твоей identifies the person taken; the English object retains that explicit meaning.'),g('including',5),g('the cashiers.',6)]},
 {ru:'Они ведь тоже могли смотреть в твои стеклянно-пустые глаза',crop:[35.5,43.8],voice:'элли на маковом поле',groups:[g('After all,',1),g('they',0),g('too',2),g('could have',3),g('looked',4),g('into',5),g('your',6),g('glassy, empty',7,'One performed compound retains both English adjectives.'),g('eyes.',8)]},
 {ru:'Я, обезумев, бросаюсь за каждым прохожим',crop:[43.8,49.8],voice:'элли на маковом поле',groups:[g('I,',0),g('gone mad,',1),g('rush',2),g('after',3),g('every',4),g('passerby',5)]},
 {ru:'Чьи волосы цвета ржи',crop:[49.1,52.5],voice:'элли на маковом поле',groups:[g('whose',0),g('hair is',1),g('the color',2),g('of rye.',3)]},
 {ru:'А тонкие запястья лишь слегка на твои похожи',crop:[52.0,58.0],voice:'элли на маковом поле',groups:[g('And',0),g('slender',1),g('wrists',2),g('are',7),g('only',3),g('slightly',4),g('like',5,'The comparison preposition remains separately focused.'),g('yours.',6)]},
 {ru:'Через пару дней, из трещин в потолке',crop:[58.2,63.0],voice:'элли на маковом поле',groups:[g('After',0),g('a couple of',1),g('days,',2),g('from',3),g('cracks',4),g('in',5),g('the ceiling,',6)]},
 {ru:'Составляю твои черты',crop:[62.3,65.8],voice:'элли на маковом поле',groups:[g('I piece together',0),g('your',1),g('features.',2)]},
 {ru:'Я искал тебя в каждой чёртовой очереди',crop:[65.6,72.5],voice:'элли на маковом поле',groups:[g('I',0),g('searched for',1),g('you',2),g('in',3),g('every',4),g('damn',5),g('queue.',6)]},
 {ru:'Где ты?',crop:[73.5,75.8],voice:'элли на маковом поле',groups:[g('Where',0),g('are you?',1)]},
 {ru:'Когда время придёт, мы окажемся рядом',crop:[75.5,85.4],voice:'лампабикт',groups:[g('When',0),g('the time',1),g('comes,',2),g('we',3),g('will be',4),g('together.',5,'Рядом means beside each other, preserving physical closeness without adding a place.') ]},
 {ru:'Не торопись, всё своим чередом',crop:[84.4,89.7],voice:'лампабикт',groups:[g("Don't",0),g('rush;',1),g('everything',2),g('in its own',3),g('time.',4,'Черёд expresses an orderly turn; no independent English time is invented.') ]},
 {ru:'Тебе так далеко до заката',crop:[89.0,93.0],voice:'лампабикт',groups:[g('You are',0),g('so',1),g('far',2),g('from',3),g('sunset.',4)]},
 {ru:'А я здесь полежу',crop:[92.5,96.5],voice:'лампабикт',groups:[g('And',0),g('I',1),g('will lie',3),g('here.',2)]},
 {ru:'Я тебя подожду',crop:[95.5,100.5],voice:'лампабикт',groups:[g('I',0),g('will wait for',2),g('you.',1)]},
 {ru:'Я тебя дождусь',crop:[99.6,104.0],voice:'лампабикт',groups:[g('I',0),g('will wait until',2),g('you',1),g('come.',2,'The perfective дождусь supplies waiting through the eventual arrival; the explicit object remains separately focused.') ]},
 {ru:'Тебя дождусь',crop:[103.0,108.5],voice:'лампабикт',groups:[g("I'll wait until",1),g('you',0),g('come.',1,'The implied English subject belongs to the inflected verb; the Russian object stays independent.') ]},
 {ru:'Когда это случилось, мне почему-то стало полегче',crop:[113.5,122.2],voice:'лампабикт',groups:[g('When',0),g('it',1),g('happened,',2),g('for some reason',4),g('I',3),g('felt',5),g('a little better.',6)]},
 {ru:'Теперь мне не нужно ждать зимы',crop:[121.9,126.5],voice:'лампабикт',groups:[g('Now',0),g('I',1),g('do',3),g('not',2),g('need',3),g('to wait for',4),g('winter;',5)]},
 {ru:'Она тут со мной',crop:[126.1,129.8],voice:'лампабикт',groups:[g('it is',0,'Она refers to the explicit winter, not a guessed woman.'),g('here',1),g('with',2),g('me.',3)]},
 {ru:'А ты поздней осенью ищешь меня не там',crop:[129.0,134.9],voice:'лампабикт',groups:[g('And',0),g('you,',1),g('in late',2),g('autumn,',3),g('search for',4),g('me',5),g('in the wrong place.',[6,7],idiom)]},
 {ru:'По первому снегу идёшь по пятам',crop:[134.4,139.0],voice:'лампабикт',groups:[g('Through',0),g('the first',1),g('snow,',2),g('you walk',3),g('in my footsteps.',[4,5],'Идти по пятам is following closely in someone’s footsteps; the implied speaker is retained in natural English.') ]},
 {ru:'Не иди, стой, постой',crop:[138.3,143.65],voice:'лампабикт',groups:[g("Don't",0),g('go;',1),g('stop,',2),g('wait.',3)]},
 {ru:'Я сам тебя найду',crop:[143.2,148.0],voice:'лампабикт',groups:[g('I',0),g('myself',1),g('will find',3),g('you',2)]},
 {ru:'Когда время придёт',crop:[147.0,151.8],voice:'лампабикт',groups:[g('when',0),g('the time',1),g('comes.',2)]},
 {ru:'Ты ляжешь вместе со мной?',crop:[151.2,156.5],voice:'лампабикт',groups:[g('Will',1),g('you',0),g('lie down',1),g('together',2),g('with',3),g('me?',4)]},
 {ru:'Я лягу вместе с тобой',crop:[156.1,161.5],voice:'элли на маковом поле',lane:'backing',groups:[g('I',0),g('will lie down',1),g('together',2),g('with',3),g('you.',4)]},
 {ru:'Время придёт, мы окажемся рядом',crop:[158.1,164.0],voice:'лампабикт',groups:[g('The time',0),g('will come;',1),g('we',2),g('will be',3),g('together.',4)]},
 {ru:'Не торопись, всё своим чередом',crop:[163.5,168.8],voice:'лампабикт',groups:[g("Don't",0),g('rush;',1),g('everything',2),g('in its own',3),g('time.',4)]},
 {ru:'Тебе так далеко до заката',crop:[168.0,172.3],voice:'лампабикт',groups:[g('You are',0),g('so',1),g('far',2),g('from',3),g('sunset.',4)]},
 {ru:'А я здесь полежу',crop:[171.5,176.4],voice:'лампабикт',groups:[g('And',0),g('I',1),g('will lie',3),g('here.',2)]},
 {ru:'Я тебя подожду',crop:[176.0,180.5],voice:'лампабикт',groups:[g('I',0),g('will wait for',2),g('you.',1)]},
 {ru:'Я тебя дождусь',crop:[179.5,183.3],voice:'лампабикт',groups:[g('I',0),g('will wait until',2),g('you',1),g('come.',2,'Eventual arrival completes the inflected verb; the object remains independent.') ]},
 {ru:'Тебя дождусь',crop:[182.4,186.5],voice:'лампабикт',groups:[g("I'll wait until",1),g('you',0),g('come.',1,'The implied subject belongs to the verb; the explicit object remains independent.') ]},
 {ru:'Я тебя подожду',crop:[178.5,185.5],voice:'элли на маковом поле',lane:'backing',groups:[g('I',0),g('will wait for',2),g('you.',1)]},
 {ru:'Дождусь тебя',crop:[185.0,193.2],voice:'элли на маковом поле',lane:'backing',groups:[g("I'll wait until",0),g('you',1),g('come.',0,'The inflected perfective supplies the completion; object correspondence remains independent.') ]},
 {ru:'Где ты?',crop:[191.0,199.5],voice:'элли на маковом поле',lane:'backing',groups:[g('Where',0),g('are you?',1)]},
 {ru:'А-а…',crop:[10.4,14.4],voice:'элли на маковом поле',groups:[g('Ah…',0,'A supplied wordless opening vocalization, with no invented lexical meaning.')]},
];
const lex=/[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu;
const tokens=(text:string)=>{const matches=[...text.matchAll(lex)];return matches.map((m,i)=>({text:m[0],punctuationAfter:text.slice(m.index!+m[0].length,matches[i+1]?.index??text.length).trim()}));};
const recording=JSON.parse(readFileSync('source/recording.json','utf8'));
const cues=rows.map((r,i)=>{const id=`GT-${String(i+1).padStart(3,'0')}`,sourceTokens=tokens(r.ru).map((t,j)=>({...t,id:`${id}-s${j}`,sourceIndex:j})),targetTokens=r.groups.flatMap(g=>tokens(g.text).map(t=>({...t,sourceIndices:g.source,focusSourceIndices:g.source,relation:g.source.length>1?'semantic-union':'lexical-correspondence',rationale:g.rationale}))).map((t,j)=>({...t,id:`${id}-e${j}`}));
 const mapped=new Set(targetTokens.flatMap(t=>t.sourceIndices));if(sourceTokens.some(t=>!mapped.has(t.sourceIndex))||targetTokens.some(t=>t.sourceIndices.some(i=>!sourceTokens[i])))throw Error(`Incomplete meaning ${id}`);
 return {id,sourceLanguage:'ru',targetLanguage:'en',sourceText:r.ru,targetText:r.groups.map(g=>g.text).join(' '),sourceTokens,targetTokens,voice:r.voice,lane:r.lane??'lead',crop:r.crop};});
writeFileSync('source/lyrics-editorial.json',JSON.stringify({schemaVersion:1,sourceSha256:recording.sourceSha256,authority:'Supplied text reconciled with independent acoustic observations; uncertain quiet samples and overlaps still require listening.',translation:'Original English meaning-based translation for this edition.',editorialChanges:['Advertisements and unrelated suggested tracks excluded.','Russian spelling/ё and sentence capitalization normalized.','First-chorus Когда retained: wider-context unforced consonant observations contradict recognition omission.','The female reply and final backing voice have an independent complete bilingual lane.'],cues},null,2)+'\n');
writeFileSync('analysis/phrases.private.json',JSON.stringify({sourceSha256:recording.sourceSha256,phrases:cues.map(c=>({id:c.id,crop:c.crop,units:c.sourceTokens.map(t=>t.text),vocalTrack:c.voice,lane:c.lane}))},null,2)+'\n');
console.log(JSON.stringify({cues:cues.length,sourceWords:cues.reduce((n,c)=>n+c.sourceTokens.length,0),targetWords:cues.reduce((n,c)=>n+c.targetTokens.length,0)}));
