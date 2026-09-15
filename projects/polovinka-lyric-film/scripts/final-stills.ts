import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
const cues=JSON.parse(readFileSync('src/cues.json','utf8')) as {startSample:number}[];
const frames=[90,777,...cues.map(c=>Math.round((c.startSample/48000+.5)*60)),8331,9600].sort((a,b)=>a-b);
for(const portrait of [false,true]){
 const kind=portrait?'tiktok':'youtube',path=`output/Polovinka-${portrait?'TikTok-1080x1920':'YouTube-1920x1080'}-60fps.mp4`,size=portrait?'270:480':'480:270';
 const select=frames.map(f=>`eq(n,${f})`).join('+');
 const filter=`select='${select}',scale=${size}:flags=lanczos,tile=4x4`;
 execFileSync('ffmpeg',['-y','-v','error','-i',path,'-vf',filter,'-frames:v','1','-q:v','2',`evidence/final-contact-${kind}.jpg`],{stdio:'inherit'});
 for(const frame of [777,7440,8331,10500])execFileSync('ffmpeg',['-y','-v','error','-ss',String(frame/60),'-i',path,'-frames:v','1',`evidence/final-${kind}-f${frame}.png`],{stdio:'inherit'});
}
writeFileSync('evidence/final-still-times.json',JSON.stringify({contactFrames:frames,contactSeconds:frames.map(f=>f/60),nativeFrames:[777,7440,8331,10500]},null,2));console.log('FINAL_STILLS_READY');
