import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,basename} from 'node:path';
import {vocalTrack,type Timeline} from '../src/model.ts';
const root=resolve(import.meta.dirname,'..');
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const hash=(p:string)=>createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex');
const timeline=read('public/timeline.json') as Timeline,identity=read('evidence/preview-inputs.json');
if(hash('public/timeline.json')!==identity.inputHashes['public/timeline.json'])throw Error('Caption timeline is not the frozen preview.');
const stamp=(seconds:number,separator:string)=>{const ms=Math.round(seconds*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}${separator}${String(ms%1000).padStart(3,'0')}`;};
const files=[];
mkdirSync(resolve(root,'publishing/Captions'),{recursive:true});
for(const language of ['ru','en','ja'] as const){
 const cues=timeline.cues.filter(c=>c.lanes.some(l=>l.language===language));
 const boundaries=[...new Set(cues.flatMap(c=>[c.start,c.end]))].sort((a,b)=>a-b);
 const segments:{start:number;end:number;text:string}[]=[];
 for(let i=0;i<boundaries.length-1;i++){
  const start=boundaries[i]!,end=boundaries[i+1]!;
  const active=cues.filter(c=>c.start<=start&&c.end>start).sort((a,b)=>Number(vocalTrack(b)==='japanese-upper')-Number(vocalTrack(a)==='japanese-upper'));
  const text=active.map(c=>c.lanes.find(l=>l.language===language)!.tokens.map(t=>t.text).join(language==='ja'?'':' ')).join('\n');
  if(!text)continue;
  const prior=segments.at(-1);
  if(prior&&prior.end===start&&prior.text===text)prior.end=end;else segments.push({start,end,text});
 }
 for(const format of ['srt','vtt'] as const){
  const content=(format==='vtt'?'WEBVTT\n\n':'')+segments.map((s,i)=>`${i+1}\n${stamp(s.start,format==='srt'?',':'.')} --> ${stamp(s.end,format==='srt'?',':'.')}\n${s.text}\n`).join('\n');
  const path=`publishing/Captions/Prizrak-Sotode-${language}.${format}`;
  writeFileSync(resolve(root,path),content);
  files.push({path,language,format,segments:segments.length,sha256:hash(path),bytes:Buffer.byteLength(content)});
 }
}
writeFileSync(resolve(root,'evidence/caption-assets.json'),JSON.stringify({status:'passed',revision:timeline.revision,sourceSha256:timeline.sourceSha256,timelineSha256:hash('public/timeline.json'),makerSha256:hash('scripts/make-captions.ts'),kind:'Optional cue-level SRT/VTT accessibility sidecars; word highlighting is burned into the film. Simultaneous vocal cues are merged into complete non-overlapping caption intervals, with the upper track first. Japanese sidecars cover only Japanese passages. Millisecond subtitle rounding is independent of exact source-sample film focus.',files},null,2)+'\n');
console.log(`Prepared ${files.length} source-bound caption sidecars from ${basename(root)}.`);
