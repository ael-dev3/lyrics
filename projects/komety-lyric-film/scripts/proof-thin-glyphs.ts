import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas,ImageData,loadImage} from '@napi-rs/canvas';
import {cueLayout} from '../src/scene.ts';
import {checkCurrentProductionGate} from './render-gate.ts';
import {createApprovedPainter,fileHash,rawFrames,root,watchChild} from './render-production.ts';

// Native decoded crops for the three thin endcard examples. Four pixels in
// one420cell are correlated evidence, not four independent observations.
checkCurrentProductionGate();
const file=resolve(root,'renders/KOMETY-landscape-1920x796-60fps.mp4');
const beforeHash=await fileHash(file),rendererHash=await fileHash(resolve(root,'scripts/render-production.ts'));
const scriptHash=createHash('sha256').update(readFileSync(fileURLToPath(import.meta.url))).digest('hex');
const painter=createApprovedPainter('landscape');
const cases=[{cueId:'KOM-024',kind:'source',text:'is'},{cueId:'KOM-025',kind:'source',text:'a'},{cueId:'KOM-025',kind:'target',text:'с'}] as const;
const specifications=cases.map(row=>{
  const cue=painter.timeline.cues.find(c=>c.id===row.cueId);assert.ok(cue);
  const index=row.kind==='source'?cue.words.findIndex(w=>w.text===row.text):cue.targets.findIndex(t=>t.text===row.text);assert.ok(index>=0);
  const tokens=row.kind==='source'?cue.words:cue.targets,token=tokens[index]!;
  const contributors=row.kind==='source'?[cue.words[index]!]:cue.targets[index]!.focusSourceIndices.map(i=>cue.words.find(w=>w.sourceIndex===i)!);
  assert.ok(contributors.every(Boolean));
  const first=contributors.reduce((a,b)=>a.startSample<b.startSample?a:b),end=Math.max(...contributors.map(w=>w.endSample));
  const frames=[Math.ceil(first.startSample/735)-1,Math.round((first.startSample+first.endSample)/1470),Math.ceil(end/735)];
  const layout=cueLayout(painter.context,cue,'landscape'),slot=(row.kind==='source'?layout.source:layout.target).find(s=>s.index===index)!;
  const mask=createCanvas(1920,796),m=mask.getContext('2d');m.font=`600 ${layout.size}px Komety`;m.textBaseline='alphabetic';m.fillStyle='white';m.fillText(slot.text,slot.x,slot.y);
  const alpha=m.getImageData(0,0,1920,796).data,points:number[]=[];
  for(let y=Math.max(1,Math.floor(slot.y-layout.size*1.1));y<Math.min(795,Math.ceil(slot.y+layout.size*.35));y++)
    for(let x=Math.max(1,Math.floor(slot.x)-2);x<Math.min(1919,Math.ceil(slot.x+slot.width)+2);x++) {
      const p=(y*1920+x)*4,g=(Math.floor(y/2)*2*1920+Math.floor(x/2)*2)*4;
      if(alpha[p+3]===255&&[g,g+4,g+1920*4,g+1920*4+4].every(i=>alpha[i+3]===255))points.push(p);
    }
  assert.ok(points.length>=4);
  return {...row,cue,tokenId:token.id,contributors,slot,size:layout.size,frames,points};
});
const frames=[...new Set(specifications.flatMap(c=>c.frames))].sort((a,b)=>a-b);
const child=spawn('ffmpeg',['-v','error','-nostdin','-threads','2','-xerror','-err_detect','explode','-i',file,
  '-vf',`select=${frames.map(n=>`eq(n\\,${n})`).join('+')}`,'-frames:v',String(frames.length),'-fps_mode','passthrough','-f','rawvideo','-pix_fmt','rgba','pipe:1'],{stdio:['pipe','pipe','pipe']});
child.stdin.end();const done=watchChild(child,'Thin glyph native decoder');
const canvas=createCanvas(1920,796),ctx=canvas.getContext('2d'),contact=createCanvas(900,360),cc=contact.getContext('2d');
cc.fillStyle='#111713';cc.fillRect(0,0,900,360);const crops:{file:string;bytes:Buffer}[]=[],observations:Record<string,unknown>[]=[];
let cursor=0;
try {
  for await(const bytes of rawFrames(child,1920*796*4)) {
    const n=frames[cursor++];assert.ok(n!==undefined);
    ctx.putImageData(new ImageData(new Uint8ClampedArray(bytes.buffer,bytes.byteOffset,bytes.byteLength),1920,796),0,0);
    for(const [row,c] of specifications.entries()) {
      const column=c.frames.indexOf(n);if(column<0)continue;
      const sample=n*735,focused=c.contributors.some(w=>sample>=w.startSample&&sample<w.endSample);
      const expected=focused?[255,213,141]:[238,227,207],alternate=focused?[238,227,207]:[255,213,141];
      const expectedDistances:number[]=[],alternateDistances:number[]=[];let matching=0;
      for(const p of c.points) {
        const a=Math.hypot(bytes[p]!-expected[0]!,bytes[p+1]!-expected[1]!,bytes[p+2]!-expected[2]!);
        const b=Math.hypot(bytes[p]!-alternate[0]!,bytes[p+1]!-alternate[1]!,bytes[p+2]!-alternate[2]!);
        expectedDistances.push(a);alternateDistances.push(b);if(a<34&&a+6<b)matching++;
      }
      const median=(values:number[])=>{const a=[...values].sort((u,v)=>u-v);return (a[Math.floor((a.length-1)/2)]!+a[Math.floor(a.length/2)]!)/2;};
      const x=Math.max(0,Math.floor(c.slot.x)-10),y=Math.max(0,Math.floor(c.slot.y-c.size*1.1)-7);
      const width=Math.min(1920-x,Math.ceil(c.slot.width)+20),height=Math.min(796-y,Math.ceil(c.size*1.45)+14);
      const crop=createCanvas(width,height),cx=crop.getContext('2d');cx.drawImage(canvas,x,y,width,height,0,0,width,height);
      const name=`final-thin-${c.cueId}-${c.kind}-${c.text==='с'?'c':c.text}-${n}.png`,encoded=crop.toBuffer('image/png');crops.push({file:name,bytes:encoded});
      const snapshot=await loadImage(encoded);cc.imageSmoothingEnabled=false;cc.drawImage(snapshot,column*300+8,row*120+24,width*2,height*2);
      cc.fillStyle='#eee3cf';cc.font='13px sans-serif';cc.fillText(`${c.tokenId} · ${n}/60 · ${focused?'gold':'neutral'}`,column*300+8,row*120+16);
      observations.push({tokenId:c.tokenId,text:c.text,kind:c.kind,frame:n,time:n/60,expectedFocused:focused,
        opaquePixels:c.points.length,fullyOpaqueChromaCells:c.points.length/4,matchingFraction:matching/c.points.length,
        medianExpectedRgbDistance:median(expectedDistances),medianAlternateRgbDistance:median(alternateDistances),
        maximumExpectedRgbDistance:Math.max(...expectedDistances),nativeCrop:name});
    }
  }
  await done;assert.equal(cursor,frames.length);
  assert.equal(await fileHash(file),beforeHash);assert.equal(await fileHash(resolve(root,'scripts/render-production.ts')),rendererHash);
  checkCurrentProductionGate();
  mkdirSync(resolve(root,'evidence'),{recursive:true});
  for(const crop of crops)writeFileSync(resolve(root,'evidence',crop.file),crop.bytes);
  writeFileSync(resolve(root,'evidence/final-thin-glyph-contact.png'),contact.toBuffer('image/png'));
  const report={schema:'komety/thin-glyph-native-review/v1',status:'native-crops-and-measurements; visual review separate',
    revision:painter.timeline.revision,sourceSha256:painter.timeline.sourceSha256,file:basename(file),sha256:beforeHash,
    rendererSha256:rendererHash,verifierSha256:scriptHash,observations,
    method:'Native decoded output crops before, during and after each source-linked event; no redraw of delivered pixels. Contact enlarges native crops2× with nearest-neighbor sampling. Only completely opaque glyph2×2 cells aligned to420chroma are measured. Exact integer n*735 independently defines focus; RGB criteria unchanged from decoded audit. Pixels in one chroma cell are correlated.'};
  writeFileSync(resolve(root,'evidence/thin-glyph-native-review.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:'written',report:'thin-glyph-native-review.json',crops:crops.length}));
} catch(error) {child.kill('SIGTERM');throw error;}
