import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const data=JSON.parse(readFileSync('source/original.en-orig.json3','utf8')) as {events:{tStartMs:number;segs?:{utf8:string}[]}[]};
let text=data.events.filter(e=>e.segs&&e.tStartMs>=12400&&e.tStartMs<130000).map(e=>e.segs?.map(s=>s.utf8).join('')).join(' ').replace(/\[.*?\]/g,'').replace(/[.,!?]/g,'').replace(/\s+/g,' ').trim();
const fixes:[string,string][]=[
 ["don't want to","don't wanna"],["if you want to","if you wanna"],['you best really','you best believe'],['Shorty kind of','Shorty kinda'],['She looked','She look'],['I got to ask','I gotta ask'],['going to','gonna'],["I'mma","I'ma"],['do you want to come home','do you wanna come through'],['I want to do you','I wanna do ya'],["I'll give it to you","I'll give it to ya"],['I want to do it','I wanna do it'],['be alone','be in love'],['right now now','right damn now'],['I like you freaky','I like it freaky'],['teach me','tease me'],
];
for(const [a,b] of fixes)text=text.replaceAll(a,b);
const words=text.split(' '),chorus=[8,11,8,11,10,11,8,11],rap=[10,8,12,11,12,11,11,6],bridge=[9,6,7,8,7,5,9,5,5,9,8,2];
const counts=[...chorus,...rap,...chorus,...bridge,...chorus];let offset=0;
const lines=counts.map(n=>{const l=words.slice(offset,offset+n).join(' ');offset+=n;return l;});
writeFileSync('analysis/lyrics-transport-draft.txt',lines.join('\n')+'\n');
console.log({words:words.length,planned:offset,remaining:words.slice(offset),lines:lines.length});
console.log(lines.map((l,i)=>`${i+1}: ${l}`).join('\n'));
assert.equal(offset,words.length);assert.equal(words.length,395);
const punct:Record<number,Record<number,string>>={};
for(const base of [0,16,36]){punct[base+4]={5:'need,'};punct[base+5]={1:'girl,',4:'believe,'};}
Object.assign(punct,{8:{0:'Boom,',1:'who',9:'to?'},9:{2:'bad,'},10:{5:'that,'},11:{4:'ask,'},12:{6:'at,',11:'move?'},13:{4:'math,',5:'what',10:'do?'},15:{0:'Shorty,',5:'through?'},24:{3:'ya,'},27:{3:'it,'},30:{3:'ya,'},33:{3:'freaky,'}});
const final=lines.map((l,i)=>l.split(' ').map((w,j)=>punct[i]?.[j]??w).join(' '));
writeFileSync('analysis/lyrics-user-en.txt',final.join('\n')+'\n');
writeFileSync('analysis/text-authority.json',JSON.stringify({authority:'User-supplied lyrics',words:395,lines:44,transport:'Common words transported from source captions, then reconciled word-for-word and punctuated against the supplied text. Caption timing is not used as alignment truth.',captionCorrections:fixes,omissions:'No added or omitted verses, outro hallucinations, pronunciation or translations.'},null,2));
