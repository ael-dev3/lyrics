import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
type Word={word:string;start:number;end:number};type Seg={words:Word[]};
const offsets=[0,45,60.15,106.5,121.75],sr=48000;
const templates=[
 {ru:['Прыгай','за','мной'],en:[{text:'Jump',words:[0]},{text:'after me',words:[1,2]}]},
 {ru:['Социально','дно','уже','близко'],en:[{text:'Rock bottom',words:[0,1]},{text:'is already',words:[2]},{text:'close',words:[3]}]},
 {ru:['Давай','с','головой'],en:[{text:'Come on,',words:[0]},{text:'dive in headfirst',words:[1,2]}]},
 {ru:['Отменяй','таксиста'],en:[{text:'Cancel',words:[0]},{text:'the taxi',words:[1]}]},
 {ru:['Нам','не','нужно','больше','домой'],en:[{text:'We',words:[0]},{text:"don’t need to go",words:[1,2]},{text:'home',words:[4]},{text:'anymore',words:[3]}]},
];
const cues=offsets.flatMap((offset,part)=>{
 const data=JSON.parse(readFileSync(`../prygay-source/aligned-window-${part}.json`,'utf8')) as {segments:Seg[]};
 return data.segments.map((s,line)=>{const template=templates[line];assert(template);assert.equal(s.words.length,template.ru.length);
 const words=s.words.map((w,i)=>({text:template.ru[i]??'',startSample:Math.round((offset+w.start)*sr),endSample:Math.round((offset+Math.max(w.end,w.start+.06))*sr),uncertaintyMs:80,evidence:'provisional windowed vocal alignment; pending reconciliation'}));
 return {id:`p${part+1}-l${line+1}`,part:part+1,line:line+1,startSample:words[0]?.startSample??0,endSample:words.at(-1)?.endSample??0,words,en:template.en};
 });
});
writeFileSync('src/cues.json',JSON.stringify(cues,null,2));console.log({cues:cues.length,words:cues.flatMap(c=>c.words).length});
