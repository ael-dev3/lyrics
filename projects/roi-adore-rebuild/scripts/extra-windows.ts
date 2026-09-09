import {readFileSync,writeFileSync} from 'node:fs';
const ref=JSON.parse(readFileSync('../projects/roi-slowdown-lyric-film/alignment/roi-slowdown-dual-song-v1.json','utf8'));
const src=JSON.parse(readFileSync('../french-lines.json','utf8')) as string[];
const eng=JSON.parse(readFileSync('../english-lines.json','utf8')) as string[];
type W={start:number;end:number;text:string};const fr:W[]=[],en:W[]=[];
for(const s of ref.songs){for(const l of s.lines){const start=l.startSample/ref.sampleRate,end=l.endSample/ref.sampleRate;if(s.id==='song-1'&&(start<42||start>168&&start<248||start>300))fr.push({start,end,text:l.text});}}
for(const start of [205.18,213.75]){fr.push({start,end:start+2.2,text:src[37]??''},{start:start+2.2,end:start+4.3,text:src[38]??''});}
fr.push({start:111.08,end:115.35,text:src[16]??''},{start:115.35,end:119.62,text:src[17]??''});
for(const start of [82.60,125.4,133.97,168.26,236.73,245.26,326.46,330.73,335.02,339.30])en.push({start,end:start+3,text:eng[3]??''});
for(const [name,rows] of [['fr',fr],['en',en]] as const){rows.sort((a,b)=>a.start-b.start);writeFileSync(`../extra-${name}.json`,JSON.stringify(rows));}
