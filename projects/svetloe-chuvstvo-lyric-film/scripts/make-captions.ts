import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateTimeline,type Timeline} from '../src/model.ts';
import {checkCurrentProductionGate} from './render-gate.ts';
checkCurrentProductionGate();
const timeline=JSON.parse(readFileSync('public/timeline.json','utf8')) as Timeline;validateTimeline(timeline);
const hash=(path:string)=>createHash('sha256').update(readFileSync(path)).digest('hex');
const timestamp=(seconds:number,separator:string)=>{
 const ms=Math.round(seconds*1000),h=Math.floor(ms/3600000),m=Math.floor(ms%3600000/60000),s=Math.floor(ms%60000/1000);
 return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}${separator}${String(ms%1000).padStart(3,'0')}`;
};
mkdirSync('publishing/Captions',{recursive:true});
const files=[];
for(const [language,field] of [['Russian','sourceText'],['English','targetText']] as const)for(const ext of ['srt','vtt'] as const){
 const blocks=timeline.cues.map((cue,i)=>`${ext==='srt'?`${i+1}\n`:''}${timestamp(cue.start,ext==='srt'?',':'.')} --> ${timestamp(cue.visibleEnd,ext==='srt'?',':'.')}\n${cue[field]}\n`);
 const contents=(ext==='vtt'?'WEBVTT\n\n':'')+blocks.join('\n');
 const path=`publishing/Captions/Svetloe-Chuvstvo-${language}.${ext}`;writeFileSync(path,contents);
 files.push({path,sha256:hash(path),cues:blocks.length,language,scope:'Optional cue-level captions; individual word highlighting is burned into the films.'});
}
writeFileSync('evidence/caption-assets.json',JSON.stringify({status:'passed',revision:timeline.revision,sourceSha256:timeline.sourceSha256,timelineSha256:hash('public/timeline.json'),makerSha256:hash('scripts/make-captions.ts'),files},null,2)+'\n');
console.log(JSON.stringify({status:'passed',captionFiles:files.length,cuesPerFile:timeline.cues.length}));
