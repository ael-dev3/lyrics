import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {isAbsolute,join,relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateTimeline} from '../src/model.ts';
import type {Timeline} from '../src/model.ts';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const at=process.argv.indexOf('--dest'),argument=at<0?undefined:process.argv[at+1];
assert.ok(argument&&isAbsolute(argument),'Pass an absolute --dest staging folder');
const destination=resolve(argument),stagingRelative=relative(root,destination);
assert.ok(stagingRelative&&!stagingRelative.startsWith('..')&&!isAbsolute(stagingRelative),'Stage captions within this project');
const sha=(bytes:Uint8Array)=>createHash('sha256').update(bytes).digest('hex');
const identity=JSON.parse(readFileSync(join(root,'evidence/preview-inputs.json'),'utf8')) as {revision:string;inputs:Record<string,string>};
const timelineBytes=readFileSync(join(root,'public/timeline.json'));
assert.equal(sha(timelineBytes),identity.inputs['public/timeline.json']);
const timeline=JSON.parse(timelineBytes.toString()) as Timeline;validateTimeline(timeline);assert.equal(timeline.revision,identity.revision);
const stamp=(milliseconds:number,delimiter:string)=>{
  assert.ok(Number.isInteger(milliseconds)&&milliseconds>=0);
  const hours=Math.floor(milliseconds/3600000),minutes=Math.floor(milliseconds/60000)%60,seconds=Math.floor(milliseconds/1000)%60;
  return`${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}${delimiter}${String(milliseconds%1000).padStart(3,'0')}`;
};
// Cue-level sidecars use actual first lexical onset and the complete neutral
// reading lifetime. Millisecond formats cannot reproduce sample-level word
// focus: that focus is already baked into both films, including semantic unions.
const files:{path:string;bytes:number;sha256:string}[]=[];
mkdirSync(join(destination,'Captions'),{recursive:true});
for(const language of ['russian','english'] as const)for(const extension of ['srt','vtt'] as const){
  const delimiter=extension==='srt'?',':'.';let priorEnd=0;
  const cues=timeline.cues.map((cue,index)=>{
    const start=Math.ceil(cue.words[0]!.startSample/timeline.sampleRate*1000),end=Math.min(Math.ceil(cue.visibleEnd*1000),Math.floor(timeline.sourceDuration*1000));
    assert.ok(start>=priorEnd&&end>start,`Overlapping subtitle interval ${cue.id}`);priorEnd=end;
    const text=language==='russian'?cue.sourceText:cue.targetText;
    assert.ok(text&&!/[<>]/.test(text),`Unexpected markup ${cue.id}`);
    return`${index+1}\n${stamp(start,delimiter)} --> ${stamp(end,delimiter)}\n${text}`;
  });
  const content=(extension==='vtt'?'WEBVTT\n\n':'')+cues.join('\n\n')+'\n',path=`Captions/${language}.${extension}`;
  writeFileSync(join(destination,path),content);files.push({path,bytes:Buffer.byteLength(content),sha256:sha(Buffer.from(content))});
}
writeFileSync(join(root,'evidence/caption-assets.json'),JSON.stringify({schemaVersion:1,status:'passed',revision:identity.revision,sourceSha256:timeline.sourceSha256,timelineSha256:sha(timelineBytes),makerSha256:sha(readFileSync(fileURLToPath(import.meta.url))),cueCount:timeline.cues.length,method:'Optional separate Russian/English cue-level SRT/VTT. Starts ceiling-quantized from first original 44.1k lexical sample; ends from the reviewed neutral reading lifetime. Burned-in words use canonical integer sample events and semantic source unions; sidecars are not word-timing replacements.',files},null,2)+'\n');
console.log(JSON.stringify({status:'captions generated',cueCount:timeline.cues.length,files:files.map(file=>file.path)}));
