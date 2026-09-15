import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const phrases=read('source/phrases.json').phrases as {id:string;ru:string;en:string}[];
type Word={word:string;start:number;end:number;probability:number};
const align=read('analysis/mms-vocals.json').segments as {words:Word[]}[];
const mix=read('analysis/mms-mix.json').segments as {words:Word[]}[];
const definitions:[string,number[]][][]=[
 [['By the fire at night,',[0,1,2]],['beneath',[3]],['an enormous',[4]],['moon,',[5]]],
 [['The dark forest',[0,1]],['sheltered',[2]],['us',[3]],['with green leaves.',[4,5]]],
 [['I',[0]],['kissed you',[1,2]],['by the fire that night.',[3,4,5]]],
 [['I',[0]],['gave you',[1,2]],['half of',[3]],['myself.',[4]]],
 [['Light',[0]],['from a distant',[1]],['star,',[2]],['birdsong',[3,4]],['until dawn.',[5,6]]],
 [['You looked',[0,1]],['into my eyes',[2,3,4]],['and whispered',[5]],['words.',[6]]],
 [["You didn’t believe me,",[0,1,2,3]],['but',[4]],['you loved me.',[5,6]]],
 [['I left',[0,1]],['half of',[4]],['myself',[5]],['with you.',[2,3]]],
 [["What’s past is forgotten;",[0,1,2,3]],["what’s past is gone.",[4,5,6,7]]],
 [['You waved',[0,1]],['a turquoise scarf',[4,5]],['as I left.',[2,3]]],
 [['I',[0]],['kissed you',[1,2]],['by the fire that night.',[3,4,5]]],
 [['You left me',[0,1,2]],['half of',[3]],['myself.',[4]]],
];
const SR=48000,indices=[0,0,0],deltas:number[]=[];
const cues=phrases.map((p,i)=>{
 const v=Math.floor(i/4),offset=indices[v]!,text=p.ru.replace(/\s+-\s+/g,' — '),tokens=text.split(/\s+/).filter(x=>x!=='—');
 const words=align[v]!.words.slice(offset,offset+tokens.length);assert.equal(words.length,tokens.length);
 words.forEach((w,j)=>deltas.push(Math.abs(w.start-mix[v]!.words[offset+j]!.start)));
 indices[v]!+=tokens.length;
 const ru=words.map((w,j)=>({text:tokens[j]!+(i===8&&[2,6].includes(j)?' —':''),startSample:Math.round(w.start*SR),endSample:Math.round(w.end*SR),score:w.probability}));
 const groups=definitions[i]!.map(([text,sourceWords])=>({text,sourceWords,startSample:Math.min(...sourceWords.map(j=>ru[j]!.startSample)),endSample:Math.max(...sourceWords.map(j=>ru[j]!.endSample))}));
 return {id:p.id,verse:v+1,ruText:p.ru,enText:groups.map(g=>g.text).join(' '),startSample:ru[0]!.startSample,endSample:ru.at(-1)!.endSample,ru,en:groups};
});
assert.equal(indices.reduce((a,b)=>a+b,0),75);
writeFileSync('src/cues.json',JSON.stringify(cues,null,2));
deltas.sort((a,b)=>a-b);
writeFileSync('analysis/alignment-comparison.json',JSON.stringify({words:75,method:'MMS forced alignment independently on original mix and Demucs vocals; vocal alignment is the source cue authority. Whisper cross-checks are evidence, not substituted time grids.',onsetMedianDifferenceSeconds:deltas[37],onsetMaximumDifferenceSeconds:deltas.at(-1),caveat:'Agreement between recordings processed by the same model is not proof of absolute accuracy. Acoustic boundaries and 60 fps quantization remain estimates.'},null,2));
console.log('Built',cues.length,'bilingual phrases / 75 Russian words.');
