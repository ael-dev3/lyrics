import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import type {ProductionData,SourceWord} from '../src/schema.ts';
type Candidate={word:string;start:number;end:number;probability:number};
type Segment={id:string;words:Candidate[]};
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const lines=read('source/lines.json') as {id:string;section:string;start:number;end:number;text:string}[];
const mix=read('analysis/mms-mix-lines.json').segments as Segment[],vocals=read('analysis/mms-vocals-lines.json').segments as Segment[],whisper=read('analysis/whisper-vocals-lines.json').segments as Segment[];
const sections=read('source/sections.json') as {id:string;lineIds:string[]}[];
const wideMix=read('analysis/mms-mix-sections.json').segments as Segment[],wideStem=read('analysis/mms-vocals-sections.json').segments as Segment[];
const wide=new Map<string,{mix:Candidate[];stem:Candidate[]}>();
for(const section of sections){let offset=0;for(const id of section.lineIds){const count=lines.find(l=>l.id===id)!.text.split(/\s+/).length;wide.set(id,{mix:wideMix.find(s=>s.id===section.id)!.words.slice(offset,offset+count),stem:wideStem.find(s=>s.id===section.id)!.words.slice(offset,offset+count)});offset+=count;}}
const sampleRate=44100,pcm=readFileSync('analysis/audio-delivery.f32'),sampleCount=pcm.length/8;
const duration=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1','public/soundtrack.m4a'],{encoding:'utf8'}).trim());
const hash=(b:Buffer)=>createHash('sha256').update(b).digest('hex'),ledger:unknown[]=[];
const cues=lines.map((line,i)=>{
 const m=mix.find(s=>s.id===line.id)!,v=vocals.find(s=>s.id===line.id)!,w=whisper.find(s=>s.id===line.id)!;
 const text=line.text.split(/\s+/);if(m.words.length!==text.length||v.words.length!==text.length||w.words.length!==text.length)throw Error('Token mismatch '+line.id);
 const source:SourceWord[]=text.map((text,j)=>{
  const a=m.words[j]!,b=v.words[j]!,c=w.words[j]!;
  const section=wide.get(line.id)!,d=section.mix[j]!,e=section.stem[j]!;
  const close=Math.abs(a.start-b.start)<.14&&Math.abs(a.end-b.end)<.18;
  // Separated vocals carry dense electronic arrangements more consistently. Raw CTC
  // token scores are not calibrated probabilities of a correct sung-word boundary.
  let start=close?(a.start+b.start)/2:b.start,end=close?(a.end+b.end)/2:b.end;
  let method=close?'Convergent bounded original-mix/stem candidates':'Bounded isolated-vocal candidate; disagreement retained';
  // Wider context can repair clipped first onsets, but is never accepted wholesale:
  // the second chorus wide-mix path visibly loses its place.
  if(j===0&&Math.abs(d.start-e.start)<.09&&Math.abs(d.start-start)<1.1&&d.end-d.start<1&&d.start<(v.words[j+1]?.start??Infinity)){start=(d.start+e.start)/2;if(end-start<1/60)end=(d.end+e.end)/2;method+='; wider-context first-onset support';}
  if(line.id==='SH-028'&&j===0){start=a.start;end=a.end;method='Bounded original mix; rejected stem/section candidates spanning the preceding gap';}
  if(line.id==='SH-031'&&j<2){start=e.start;end=e.end;method='Wide stem and bounded mix agree; rejected earlier window anchor';}
  if(line.id==='SH-014'&&j===m.words.length-1){start=e.start;end=e.end;method='Wide original/stem context rejects late line-ending attachment; reduced-speed review required';}
  if(Math.abs(c.start-start)<.12&&c.end>c.start)start=(start*2+c.start)/3;
  if(Math.abs(c.end-end)<.16&&c.end>c.start&&(end*2+c.end)/3-start>=1/60)end=(end*2+c.end)/3;
  end=Math.max(start+1/sampleRate,end);
  const spread=1000*Math.max(Math.abs(a.start-b.start),Math.abs(a.end-b.end),Math.abs(c.start-start),Math.abs(c.end-end));
  const reviewRequired=spread>180||end-start<.045;
  const id=line.id+'-w'+String(j+1).padStart(2,'0');
  ledger.push({id,text,chosen:{start,end},mix:a,stem:b,whisper:c,wideMix:d,wideStem:e,spreadMs:spread,reviewRequired,method});
  return {id,text,startSample:Math.round(start*sampleRate),endSample:Math.round(end*sampleRate),candidateSpreadMs:spread,reviewRequired};
 });
 // Keep candidate intervals half-open and ordered. Log any overlap trim.
 for(let j=0;j<source.length-1;j++){const word=source[j]!,next=source[j+1]!;if(next.startSample<=word.startSample)throw Error('Nonmonotonic adopted onset '+word.id);if(word.endSample>next.startSample){word.endSample=next.startSample;word.reviewRequired=true;}}
 const startSample=Math.min(...source.map(w=>w.startSample)),endSample=Math.max(...source.map(w=>w.endSample));
 return {id:line.id,section:line.section,layer:'main' as const,source,startSample,endSample,visibleFrom:Math.max(0,startSample-Math.round(.16*sampleRate)),visibleUntil:endSample+Math.round(.30*sampleRate)};
});
cues.forEach((c,i)=>{if(i)c.visibleFrom=Math.max(c.visibleFrom,cues[i-1]!.endSample);});
cues.forEach((c,i)=>{if(cues[i+1])c.visibleUntil=Math.min(c.visibleUntil,cues[i+1]!.visibleFrom);});
const data:ProductionData={sampleRate,sampleCount,duration,fps:60,frames:Math.ceil(duration*60),audioSha256:hash(readFileSync('public/soundtrack.m4a')),cues};
writeFileSync('src/cues.json',JSON.stringify(data,null,2)+'\n');
writeFileSync('analysis/word-candidates.json',JSON.stringify({status:'provisional acoustic candidates; listening review pending',words:ledger,adopted:cues.flatMap(c=>c.source).map(w=>({id:w.id,startSample:w.startSample,endSample:w.endSample}))},null,2)+'\n');
writeFileSync('source/media-manifest.json',JSON.stringify({source:'https://www.youtube.com/watch?v=tXFVl2Qb4zc',title:'I Really Want to Stay at Your House (Hardstyle)',uploader:'Laaemel',remixCredit:'Oblivion, as linked in the source description',coverCredit:'Samuel Kim and Lorien',originalSongCredit:'Rosa Walton / Hallie Coggins',artworkCredit:'xiaocha81269, credited by the upload',duration,sampleRate,sampleCount,pcmSha256:hash(pcm),audioSha256:data.audioSha256,sourceFileSha256:hash(readFileSync('public/source.mp4')),sourceArtworkSha256:hash(readFileSync('public/source-artwork.png')),sourceVideo:'1254×720, 6 fps source artwork; selected official trailer footage supplies drop motion'},null,2)+'\n');
console.log({cues:cues.length,words:cues.reduce((n,c)=>n+c.source.length,0),duration,reviewWords:cues.flatMap(c=>c.source).filter(w=>w.reviewRequired).length});
