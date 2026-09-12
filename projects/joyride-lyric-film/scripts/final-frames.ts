import {execFileSync} from 'node:child_process';
import {mkdirSync, renameSync, writeFileSync, readFileSync, cpSync} from 'node:fs';
import {hashFile} from './record-render-inputs.ts';
import {FPS, FRAMES} from '../src/config.ts';
import {createRequire} from 'node:module';
type SharpFactory=(input:Buffer)=>{png:()=>{toFile:(path:string)=>Promise<unknown>}};
const sharp=createRequire(process.env.SHARP_REQUIRE_BASE??import.meta.url)('sharp') as SharpFactory;

const times=[0,1,10,12.433333,12.45,15.4,24,36,42.433333,55,57.65,71.95,74.6,80,89,95.733333,102.816667,110,117.133333,120,124.2,125.466667,132.5,148];
const parts=JSON.parse(readFileSync('evidence/render-options.json','utf8')).segmentsPerComposition;
const joins=Array.from({length:parts-1},(_,i)=>Math.floor((i+1)*FRAMES/parts)).flatMap(f=>[f-1,f]);
const frames=[...new Set([...times.map(t=>Math.round(t*FPS)),...joins,FRAMES-1])].sort((a,b)=>a-b);
const rows: {kind:string;frame:number;second:number;file:string;sha256:string}[]=[];
const videos:Record<string,string>={};
mkdirSync('evidence/encoded',{recursive:true});
for(const kind of ['youtube','tiktok']){
 const portrait=kind==='tiktok',name=portrait?'TikTok':'YouTube',video=`output/Joyride-${name}-${portrait?'1080x1920':'1920x1080'}-60fps.mp4`;
 videos[kind]=await hashFile(video);
 const select='select='+frames.map(f=>`eq(n\\,${f})`).join('+');
 execFileSync('ffmpeg',['-y','-v','error','-i',video,'-vf',select,'-fps_mode','vfr',`evidence/encoded/${kind}-selection-%03d.png`],{stdio:'inherit'});
 for(const [i,frame]of frames.entries()){
  const file=`evidence/encoded/${kind}-f${String(frame).padStart(6,'0')}.png`;
  renameSync(`evidence/encoded/${kind}-selection-${String(i+1).padStart(3,'0')}.png`,file);
  rows.push({kind,frame,second:frame/FPS,file,sha256:await hashFile(file)});
 }
 cpSync(`evidence/encoded/${kind}-f007200.png`,`evidence/${kind}-final-120.png`);
 // Draw timestamps from the original decoded timeline before sampling. This is
 // a QA contact sheet; no diagnostic labels enter the deliverable film.
 const size=portrait?'180:320':'384:216';
 const unlabelled=`evidence/${kind}-contact-unlabelled.png`,columns=8,rowCount=Math.ceil(frames.length/8),w=portrait?180:384,h=portrait?320:216;
 execFileSync('ffmpeg',['-y','-v','error','-i',video,'-vf',`scale=${size},${select},tile=${columns}x${rowCount}:nb_frames=${frames.length}`,'-frames:v','1',unlabelled],{stdio:'inherit'});
 const labels=frames.map((f,i)=>{const x=(i%columns)*w+4,y=Math.floor(i/columns)*h+4,ms=Math.round(f/FPS*1000),label=`${Math.floor(ms/60000)}:${((ms%60000)/1000).toFixed(3).padStart(6,'0')} · f${f}`;return `<rect x="${x}" y="${y}" width="155" height="22" fill="#000" fill-opacity=".8"/><text x="${x+4}" y="${y+16}" fill="white" font-family="Arial" font-size="14">${label}</text>`;}).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${columns*w}" height="${rowCount*h}"><image href="data:image/png;base64,${readFileSync(unlabelled).toString('base64')}" width="100%" height="100%"/>${labels}</svg>`;
 await sharp(Buffer.from(svg)).png().toFile(`evidence/${kind}-final-contact-sheet.png`);
}
writeFileSync('evidence/encoded-frame-review.json',JSON.stringify({
 videos,cueSha256:await hashFile('src/cues.json'),frames:rows,visuallyReviewed:false,
 method:'Native decoded frames and timestamped contact sheets; first/last frame, source cuts, onset/handoff candidates, dense rap, bridge, bright fire sequence, final release, closing title and all segment joins.',
 observation:'Awaiting visual inspection. Extraction and hashing alone do not establish acceptance.',
 limits:'Sampled decoded-frame review is not exhaustive every-frame visual inspection or a human listening test.',
},null,2));
console.log({frames:rows.length,awaitingVisualReview:true});
