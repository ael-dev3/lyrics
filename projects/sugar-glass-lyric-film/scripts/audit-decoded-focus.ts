import {spawn} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {basename} from 'node:path';
import {GlobalFonts,createCanvas} from '@napi-rs/canvas';
import {parseData} from '../src/schema.ts';
import type {Format} from '../src/schema.ts';
import type {Layouts} from '../src/layout-types.ts';
import {visibleCues,activeSource} from '../src/focus.ts';
const path=process.argv[2],format=(process.argv[3]??'landscape') as Format,offset=Number(process.argv[4]??0);if(!path||!['landscape','portrait'].includes(format))throw Error('Usage: file format [global frame offset]');
const data=parseData(JSON.parse(readFileSync('src/cues.json','utf8'))),layouts:Layouts=JSON.parse(readFileSync('src/layout.json','utf8')),l=layouts[format];
GlobalFonts.registerFromPath('public/CormorantGaramond-Semibold.ttf','LyricSerif');
const crop={x:0,y:format==='landscape'?420:780,width:l.width,height:format==='landscape'?470:670},masks=new Map<string,number[]>();
for(const cue of data.cues){const layout=l.cues[cue.id]!;for(const w of layout.source){
 const size=layout.fontSize,canvas=createCanvas(Math.ceil(w.width+8),Math.ceil(size*1.5)),ctx=canvas.getContext('2d');ctx.font=`600 ${size}px LyricSerif`;ctx.fillStyle='white';ctx.fillText(w.text,w.x-Math.floor(w.x)+3,size);const rgba=ctx.getImageData(0,0,canvas.width,canvas.height).data;
 const inside=(x:number,y:number)=>x>=0&&x<canvas.width&&y>=0&&y<canvas.height&&rgba[(y*canvas.width+x)*4+3]!>=254,points:number[]=[];
 for(let y=2;y<canvas.height-2;y++)for(let x=2;x<canvas.width-2;x++)if(inside(x,y)&&inside(x-2,y)&&inside(x+2,y)&&inside(x,y-2)&&inside(x,y+2)){
  const px=Math.floor(w.x)-3+x,py=Math.round(w.y-size)+y;if(px>=0&&px<crop.width&&py>=crop.y&&py<crop.y+crop.height)points.push(((py-crop.y)*crop.width+px)*3);
 }
 if(points.length<4)throw Error('Insufficient glyph interior '+w.id);
 masks.set(w.id,Array.from({length:Math.min(40,points.length)},(_,i)=>points[Math.floor(i*points.length/Math.min(40,points.length))]!));
}}
const child=spawn('ffmpeg',['-v','error','-threads','4','-i',path,'-an','-vf',`scale=${l.width}:${l.height}:flags=lanczos,crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`,'-pix_fmt','rgb24','-fps_mode','passthrough','-f','rawvideo','pipe:1']);
let errors='';child.stderr.on('data',x=>errors+=x);let frame=0,wordStates=0,ambiguous=0;const mismatches:{frame:number;word:string;expected:boolean;median:number;brightness:number}[]=[];
const bytes=crop.width*crop.height*3,buffer=Buffer.allocUnsafe(bytes);let filled=0;
const processFrame=()=>{const globalFrame=offset+frame;for(const cue of visibleCues(data,globalFrame)){const active=activeSource(cue,globalFrame,data);for(const word of cue.source){const points=masks.get(word.id)!;const deltas=points.map(p=>buffer[p]!-buffer[p+2]!).sort((a,b)=>a-b),brightness=points.map(p=>buffer[p]!).sort((a,b)=>a-b),median=deltas[Math.floor(deltas.length/2)]!,r=brightness[Math.floor(brightness.length/2)]!;if(r<100){ambiguous++;continue;}const expected=active.has(word.id);if((median>35)!==expected)mismatches.push({frame:globalFrame,word:word.id,expected,median,brightness:r});wordStates++;}}frame++;};
for await(const chunk of child.stdout){let at=0;while(at<chunk.length){const amount=Math.min(bytes-filled,chunk.length-at);chunk.copy(buffer,filled,at,at+amount);filled+=amount;at+=amount;if(filled===bytes){processFrame();filled=0;}}}
const code=await new Promise<number|null>(resolve=>child.exitCode!==null?resolve(child.exitCode):child.on('close',resolve));if(code!==0||filled)throw Error('Incomplete decode '+errors);
const negative=process.argv.includes('--negative-control');
const report={status:mismatches.length||ambiguous?'inspection required':'passed',format,offset,negativeControl:negative,decodedFrames:frame,wordStates,ambiguous,mismatchCount:mismatches.length,mismatches:mismatches.slice(0,100),method:'Bundled-font masks select eroded glyph-interior pixels. Median red-minus-blue separates warm active words from neutral inactive words for all visible lead and backing words in every decoded frame. Verifies displayed state, not acoustic truth.'};writeFileSync(`evidence/${basename(path)}${negative?'.negative-control':''}.focus-verification.json`,JSON.stringify(report,null,2)+'\n');console.log({...report,mismatches:report.mismatches.slice(0,6)});if(mismatches.length||ambiguous)process.exitCode=1;
