import {execFileSync} from 'node:child_process';
import {writeFileSync,mkdirSync} from 'node:fs';
const frames=[0,720,960,2186,2907,2908,4844,5815,5816,8723,8724,8999,9000,9279,9600,9720,9840,10120,10440,10656,11028,11124,11340,11631];
const rows:{kind:string;frame:number;second:number;file:string}[]=[];
mkdirSync('evidence/encoded',{recursive:true});
for(const kind of ['YouTube','TikTok']){
 const movie=`output/Midnight-Love-${kind}-${kind==='YouTube'?'1920x1080':'1080x1920'}-60fps.mp4`;
 const endingSecond=kind==='YouTube'?164:183.8;
 const filter=`[0:v]split=3[a][b][c];[a]select='${frames.map(f=>`eq(n,${f})`).join('+')}'[review];[b]select='eq(n,2640)'[hero];[c]select='eq(n,${Math.round(endingSecond*60)})'[ending]`;
 execFileSync('ffmpeg',['-y','-v','error','-threads','2','-i',movie,'-filter_complex',filter,
  '-map','[review]','-fps_mode','vfr','-frames:v',String(frames.length),'-start_number','0','-q:v','1',`evidence/encoded/${kind}-%02d.jpg`,
  '-map','[hero]','-fps_mode','vfr','-frames:v','1',`evidence/${kind.toLowerCase()}-final-44.png`,
  '-map','[ending]','-fps_mode','vfr','-frames:v','1',`evidence/${kind.toLowerCase()}-final-${endingSecond}.png`]);
 frames.forEach((f,i)=>rows.push({kind,frame:f,second:f/60,file:`evidence/encoded/${kind}-${String(i).padStart(2,'0')}.jpg`}));
 const size=kind==='YouTube'?'480:270':'270:480',tile=kind==='YouTube'?'4x6':'6x4';
 execFileSync('ffmpeg',['-y','-v','error','-framerate','1','-i',`evidence/encoded/${kind}-%02d.jpg`,'-vf',`scale=${size},tile=${tile}:padding=8:margin=8:color=0x090f24`,'-frames:v','1',`evidence/${kind.toLowerCase()}-final-contact-sheet.png`]);
}
writeFileSync('evidence/encoded-frame-review.json',JSON.stringify({status:'Extracted for visual review; observations must be recorded after inspection.',frames:rows},null,2));
