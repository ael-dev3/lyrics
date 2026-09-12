import {execFileSync} from 'node:child_process';
import {writeFileSync,mkdirSync} from 'node:fs';
const frames=[0,60,420,720,840,888,930,959,960,1020,2640,4200,5190,5815,5816,6390,6480,7140,8460,9240,10320,11040,11631];
const rows:{kind:string;frame:number;second:number;file:string}[]=[];
mkdirSync('evidence/encoded',{recursive:true});
for(const kind of ['YouTube','TikTok']){
 const movie=`output/Midnight-Love-${kind}-${kind==='YouTube'?'1920x1080':'1080x1920'}-60fps.mp4`;
 execFileSync('ffmpeg',['-y','-v','error','-i',movie,'-vf',"select='"+frames.map(f=>`eq(n,${f})`).join('+')+"'",'-fps_mode','vfr','-start_number','0','-q:v','1',`evidence/encoded/${kind}-%02d.jpg`]);
 frames.forEach((f,i)=>rows.push({kind,frame:f,second:f/60,file:`evidence/encoded/${kind}-${String(i).padStart(2,'0')}.jpg`}));
 execFileSync('ffmpeg',['-y','-v','error','-i',movie,'-vf',"select='eq(n,2640)'",'-frames:v','1',`evidence/${kind.toLowerCase()}-final-44.png`]);
 const size=kind==='YouTube'?'480:270':'270:480',tile=kind==='YouTube'?'4x6':'6x4';
 execFileSync('ffmpeg',['-y','-v','error','-framerate','1','-i',`evidence/encoded/${kind}-%02d.jpg`,'-vf',`scale=${size},tile=${tile}:padding=8:margin=8:color=0x090f24`,'-frames:v','1',`evidence/${kind.toLowerCase()}-final-contact-sheet.png`]);
}
writeFileSync('evidence/encoded-frame-review.json',JSON.stringify({status:'Extracted for visual review; observations must be recorded after inspection.',frames:rows},null,2));
