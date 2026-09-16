import {mkdirSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const format=process.argv[2];if(!['landscape','portrait'].includes(format??''))throw Error('Expected format');
const root=`evidence/final-${format}`;mkdirSync(root,{recursive:true});
const source=`output/Sugar-Glass-${format}-${format==='landscape'?'1920x1080':'1080x1920'}-60fps.mp4`;
const joins=Array.from({length:11},(_,i)=>Math.floor((i+1)*13881/12));
const frames=[...new Set([0,150,375,425,2100,5400,6720,7600,8920,11010,11160,11640,11940,13200,13560,13770,13875,13876,13880,...joins.flatMap(n=>[n-1,n])])].sort((a,b)=>a-b);
for(const frame of frames){const r=spawnSync('ffmpeg',['-v','error','-threads','2','-y','-ss',String(Math.floor(frame/60)),'-i',source,'-vf',`select=eq(n\\,${frame%60})`,'-frames:v','1',`${root}/frame-${String(frame).padStart(5,'0')}.png`],{stdio:'inherit'});if(r.status)throw Error('Extraction '+frame);}
writeFileSync(root+'/frames.json',JSON.stringify({source,frames,method:'Full composition decoded from final delivery; exact zero-based 60 fps indices; adjacent frames around every capture join.'},null,2)+'\n');
