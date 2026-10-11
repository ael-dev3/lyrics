import {readFileSync,writeFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const recording=JSON.parse(readFileSync(new URL('source/recording.json',root),'utf8'));
const templates=JSON.parse(readFileSync(new URL('source/editorial-templates.json',root),'utf8')).templates as {id:string;source:string[]}[];
const t=(id:string)=>{const v=templates.find(x=>x.id===id);if(!v)throw Error(id);return v.source};
const verse=['hold-yourself','fist','sanity','exhaustion','reflection','eyes','concrete'];
const pre=['hinges','beast','shadow','wildly','dark-run','cope'];
const chorus=['you-embrace','surrounding','turns-light','i-embrace','surrounding','turns-light'];
const post=Array.from({length:7},()=> 'embrace');
const phrases=[
 {id:'verse',crop:[0,30],templates:verse},
 {id:'pre-1',crop:[29,44.5],templates:pre},
 {id:'chorus-1',crop:[43.5,69],templates:chorus},
 {id:'post-1',crop:[68.5,94],templates:post},
 {id:'pre-2',crop:[111,132.5],templates:pre},
 {id:'chorus-2',crop:[131.5,157.2],templates:chorus},
 {id:'post-2',crop:[156.5,182],templates:post},
 {id:'outro',crop:[181.5,198.8],templates:['i-embrace','surrounding','becomes-light']},
].map(p=>({...p,units:p.templates.flatMap(t),vocalTrack:'Acoustic model observations; backing overlaps receive separate audit.'}));
writeFileSync(new URL('source/acoustic-crop-plan.json',root),JSON.stringify({sourceSha256:recording.sourceSha256,phrases},null,2)+'\n');
console.log(JSON.stringify(phrases.map(p=>({id:p.id,crop:p.crop,words:p.units.length}))));
