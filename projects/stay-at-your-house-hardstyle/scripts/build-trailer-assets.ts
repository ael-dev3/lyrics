import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const edit=JSON.parse(readFileSync('source/trailer-edit.json','utf8'));
mkdirSync('analysis/trailer-clips',{recursive:true});
const hashes:Record<string,string>={};
for(const montage of edit.montages){const files:string[]=[];
 for(const [i,shot] of montage.shots.entries()){
  const out=`analysis/trailer-clips/${montage.id}-${i}.mp4`,duration=shot.frames/edit.fps,rate=(shot.sourceOut-shot.sourceIn)/duration;
  const accent=shot.accent,anchor=accent?accent.sourceTime-shot.sourceFirstFrame:0,at=accent?accent.frame/edit.fps:0;
  const warp=accent?`if(lt(T\\,${anchor})\\,T/${anchor/at}\\,${at}+(T-${anchor})/${((shot.sourceOut-shot.sourceIn)-anchor)/(duration-at)})/TB`:`PTS/${rate}`;
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(shot.sourceIn),'-t',String(shot.sourceOut-shot.sourceIn),'-i','public/trailer.mp4','-map','0:v:0','-an','-vf',`settb=1/60000,setpts=PTS-STARTPTS,setpts=${warp},fps=60:round=up,scale=1920:1080,setsar=1,tpad=stop_mode=clone:stop_duration=0.1`,'-frames:v',String(shot.frames),'-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-g','30',out],{stdio:'inherit'});
  files.push(`file '${montage.id}-${i}.mp4'`);console.log(montage.id,i+1,'/',montage.shots.length);
 }
 const list=`analysis/trailer-clips/${montage.id}.txt`;writeFileSync(list,files.join('\n')+'\n');
 const out=`public/${montage.id}.mp4`;
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',list,'-map','0:v:0','-an','-c','copy','-movflags','+faststart',out],{stdio:'inherit'});
 hashes[out]=createHash('sha256').update(readFileSync(out)).digest('hex');
}
writeFileSync('evidence/trailer-assets.json',JSON.stringify({scope:'Silent edited footage assets only; no full song composition encoded',sourceSha256:createHash('sha256').update(readFileSync('public/trailer.mp4')).digest('hex'),editSha256:createHash('sha256').update(readFileSync('source/trailer-edit.json')).digest('hex'),hashes},null,2)+'\n');
