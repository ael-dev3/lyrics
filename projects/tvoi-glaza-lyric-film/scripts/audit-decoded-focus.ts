import {spawn} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {basename} from 'node:path';
import {GlobalFonts,createCanvas} from '@napi-rs/canvas';
import {parseData} from '../src/schema.ts';
import type {Format} from '../src/schema.ts';
import type {Layouts} from '../src/layout-types.ts';
import {visibleCue,activeSource,activeTargets} from '../src/focus.ts';
const path=process.argv[2],format=(process.argv[3]??'portrait') as Format,offset=Number(process.argv[4]??0);if(!path||!['landscape','portrait'].includes(format))throw Error('Usage: file format [global frame offset]');
const data=parseData(JSON.parse(readFileSync('src/cues.json','utf8'))),layouts:Layouts=JSON.parse(readFileSync('src/layout.json','utf8')),l=layouts[format];
GlobalFonts.registerFromPath('public/CormorantGaramond-Semibold.ttf','LyricSerif');
const crop={x:0,y:format==='landscape'?680:940,width:l.width,height:format==='landscape'?340:620};
const masks=new Map<string,number[]>();
for(const cue of data.cues){const layout=l.cues[cue.id]!;for(const w of [...layout.ru,...layout.en]){
 const canvas=createCanvas(Math.ceil(w.width+8),Math.ceil(l.fontSize*1.5)),ctx=canvas.getContext('2d');ctx.font=`600 ${l.fontSize}px LyricSerif`;ctx.fillStyle='white';const localX=w.x-Math.floor(w.x)+3,localY=l.fontSize;ctx.fillText(w.text,localX,localY);const rgba=ctx.getImageData(0,0,canvas.width,canvas.height).data;
 const inside=(x:number,y:number)=>x>=0&&x<canvas.width&&y>=0&&y<canvas.height&&rgba[(y*canvas.width+x)*4+3]!>=254;
 const points:number[]=[];for(let y=1;y<canvas.height-1;y++)for(let x=1;x<canvas.width-1;x++)if(inside(x,y)&&inside(x-1,y)&&inside(x+1,y)&&inside(x,y-1)&&inside(x,y+1)){
  const globalX=Math.floor(w.x)-3+x,globalY=Math.round(w.y-l.fontSize)+y;
  if(globalX>=0&&globalX<crop.width&&globalY>=crop.y&&globalY<crop.y+crop.height)points.push(((globalY-crop.y)*crop.width+globalX)*3);
 }
 if(points.length<4)throw Error('Insufficient interior glyph samples '+w.id);
 const chosen=Array.from({length:Math.min(32,points.length)},(_,i)=>points[Math.floor(i*points.length/Math.min(32,points.length))]!);masks.set(w.id,chosen);
}}
const child=spawn('ffmpeg',['-v','error','-threads','4','-i',path,'-an','-vf',`crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`,'-pix_fmt','rgb24','-fps_mode','passthrough','-f','rawvideo','pipe:1']);
let errors='';child.stderr.on('data',x=>errors+=x);let frame=0,wordStates=0,ambiguous=0;const mismatches:{frame:number;word:string;expected:boolean;median:number;brightness:number}[]=[];
const bytes=crop.width*crop.height*3,buffer=Buffer.allocUnsafe(bytes);let filled=0;
const processFrame=()=>{const globalFrame=offset+frame,cue=visibleCue(data,globalFrame);if(cue){const active=new Set([...activeSource(cue,globalFrame,data),...activeTargets(cue,globalFrame,data)]);for(const word of [...cue.ru,...cue.en]){const points=masks.get(word.id)!;const deltas=points.map(p=>buffer[p]!-buffer[p+2]!).sort((a,b)=>a-b),brightness=points.map(p=>buffer[p]!).sort((a,b)=>a-b);const median=deltas[Math.floor(deltas.length/2)]!,r=brightness[Math.floor(brightness.length/2)]!;if(r<100){ambiguous++;continue;}const expected=active.has(word.id);if((median>25)!==expected)mismatches.push({frame:globalFrame,word:word.id,expected,median,brightness:r});wordStates++;}}frame++;};
for await(const chunk of child.stdout){let at=0;while(at<chunk.length){const amount=Math.min(bytes-filled,chunk.length-at);chunk.copy(buffer,filled,at,at+amount);filled+=amount;at+=amount;if(filled===bytes){processFrame();filled=0;}}}
const code=await new Promise<number|null>(resolve=>child.exitCode!==null?resolve(child.exitCode):child.on('close',resolve));if(code!==0||filled)throw Error('Incomplete decode: '+errors);
const report={status:mismatches.length||ambiguous?'inspection required':'passed',format,offset,decodedFrames:frame,wordStates,ambiguous,mismatchCount:mismatches.length,mismatches:mismatches.slice(0,100),method:'Independent bundled-font masks select eroded glyph-interior pixels; median red-minus-blue classifies pale-gold active versus blue-silver inactive in every visible word of every decoded frame. This verifies rendered state, not acoustic truth.'};
writeFileSync(`evidence/${basename(path)}${offset?'.offset-'+offset:''}.focus-verification.json`,JSON.stringify(report,null,2));console.log(report);if(mismatches.length||ambiguous)process.exitCode=1;
