import {execFileSync} from 'node:child_process';
import {writeFileSync,mkdirSync} from 'node:fs';
const rows:{kind:string;frame:number;second:number;file:string}[]=[];mkdirSync('evidence/encoded',{recursive:true});
for(const kind of ['YouTube','TikTok']){
 const movie=`output/Pozhary-${kind}-${kind==='YouTube'?'1920x1080':'1080x1920'}-60fps.mp4`;
 // Includes the two-part lossless join and the documented uncertain bridge/handoff.
 execFileSync('ffmpeg',['-y','-v','error','-ss','16.2','-i',movie,'-frames:v','1',`evidence/${kind.toLowerCase()}-16.2.png`]);
 const frames=[0,60,972,1170,2340,2616,3558,4499,4500,5658,6240,7188,7590,8700,9000];
 execFileSync('ffmpeg',['-y','-v','error','-i',movie,'-vf',"select='"+frames.map(f=>`eq(n,${f})`).join('+')+"'",'-fps_mode','vfr','-start_number','0','-q:v','1',`evidence/encoded/${kind}-%02d.jpg`]);
 frames.forEach((f,i)=>rows.push({kind,frame:f,second:f/60,file:`evidence/encoded/${kind}-${String(i).padStart(2,'0')}.jpg`}));
}
writeFileSync('evidence/encoded-frame-review.json',JSON.stringify({status:'Frames extracted for review; visual observations recorded separately.',frames:rows},null,2));
