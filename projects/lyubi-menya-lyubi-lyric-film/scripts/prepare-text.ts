import {writeFileSync} from 'node:fs';
type Line={key:string;ru:string;en:string;note?:string};
const verse:Line[]=[
 {key:'v1',ru:'Непокорная моя любовь',en:'My|1 untamed|0 love|2',note:'Preserve personified untamed love and the explicit possessive in natural English order.'},
 {key:'v2',ru:'Любит не меня уже который год',en:'Loves,|0 but|1 not|1 me,|2 year|3,4,5 after|3,4,5 year|3,4,5',note:'Preserve loves-but-not-me contrast, present tense, and unstated alternative object. Уже который год is one temporal idiom, year after year; focus uses the union of those source intervals.'},
 {key:'v3a',ru:'Те же стены и цветы',en:'The|0,1 same|0,1 walls|2 and|3 flowers|4',note:'Те же is a compound determiner, the same. Both language lanes use the union of its two source intervals.'},
 {key:'v3b',ru:'Те же люди и стихи',en:'The|0,1 same|0,1 people|2 and|3 poems|4',note:'Те же is a compound determiner. Стихи retains poems without interpreting it as song lyrics.'},
 {key:'v4',ru:'Те же мысли и слова вслух',en:'The|0,1 same|0,1 thoughts|2 and|3 words|4 out|5 loud|5',note:'Те же is a compound determiner. Вслух maps to the complete expression out loud.'},
];
const chorus:Line[]=[
 {key:'c1',ru:'Люби меня, люби жарким огнём',en:'Love|0 me,|1 love|2 with|4 blazing|3 fire|4',note:'Explicit меня remains independent. Instrumental огнём supplies with and fire; жарким alone supplies blazing. Do not add an object after the second люби.'},
 {key:'c2',ru:'Ночью и днём, сердце сжигая',en:'Night|0 and|1 day,|2 burning|4 the|3 heart|3',note:'Keep night/day, explicit conjunction, and reversed burning/heart correspondence. Do not add my or your to сердце.'},
 {key:'c3',ru:'Люби меня, люби, не улетай',en:"Love|0 me,|1 love,|2 don't|3 fly|4 away|4",note:'Keep explicit me and negation independent. Улетай maps to the complete fly away event.'},
 {key:'c4',ru:'Не исчезай, я умоляю',en:"Don't|0 disappear,|1 I|2 am|3 begging|3",note:'Keep explicit я independent; умоляю supplies am begging. Do not add an unstated object.'},
];
const refrain:Line={key:'r1',ru:'Люби меня, люби',en:'Love|0 me,|1 love|2',note:'Three independently performed words have three individual lexical correspondences.'};
const section=(name:string,lines:Line[])=>lines.map(line=>({...line,section:name}));
const sequence=[...section('Verse 1',verse),...section('Chorus 1',[...chorus,refrain,refrain]),...section('Verse 2',verse),...section('Chorus 2',chorus),...section('Bridge',[refrain,refrain,refrain,refrain]),...section('Final chorus',[...chorus,...chorus,refrain])];
const text=sequence.map((line,i)=>{const id='LM-'+String(i+1).padStart(3,'0');const ru=line.ru.split(/\s+/).map((text,j)=>({id:id+'-s'+String(j+1).padStart(2,'0'),text}));const en=line.en.split(' ').map((token,j)=>{const [text,indices]=token.split('|');if(!text||!indices)throw Error('Invalid map');return {id:id+'-e'+String(j+1).padStart(2,'0'),text,sourceIds:indices.split(',').map(index=>{const word=ru[Number(index)];if(!word)throw Error('Invalid source index');return word.id;})};});return {id,key:line.key,section:line.section,ru,en,mappingRationale:line.note};});
writeFileSync('source/text-and-mapping.json',JSON.stringify(text,null,2)+'\n');
writeFileSync('source/performed-reference.txt',sequence.map(l=>l.ru).join('\n')+'\n');
writeFileSync('source/translation-en.txt',text.map(c=>c.en.map(w=>w.text).join(' ')).join('\n')+'\n');
writeFileSync('source/lyrics-supplied.txt',`User-supplied reference for «Люби меня, люби»\nAnnotation URLs and unrelated recommendation blocks excluded.\nPerformed repeats and wording require recording-specific coverage review.\n\n${sequence.map((l,i)=>(i===0||sequence[i-1]!.section!==l.section?'['+l.section+']\n':'')+l.ru).join('\n')}\n`);
console.log({cues:text.length,words:text.reduce((n,c)=>n+c.ru.length,0),targetWords:text.reduce((n,c)=>n+c.en.length,0)});
