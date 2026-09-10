import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
const width=1920,height=1080;
const decoded=spawnSync('ffmpeg',['-v','error','-i','public/poster-original.png','-f','rawvideo','-pix_fmt','rgb24','pipe:1'],{maxBuffer:width*height*3+1024});
if(decoded.status!==0)throw new Error(decoded.stderr.toString());
const rgb=decoded.stdout,palette=[[3,3,3],[92,92,92],[194,194,194],[225,5,8]] as const;
for(let i=0;i<rgb.length;i+=3){const r=rgb[i]??0,g=rgb[i+1]??0,b=rgb[i+2]??0;const index=r>70&&r>g*1.8&&r>b*1.8?3:(r+g+b)/3<42?0:(r+g+b)/3<145?1:2;const c=palette[index];rgb[i]=c[0];rgb[i+1]=c[1];rgb[i+2]=c[2];}
const encoded=spawnSync('ffmpeg',['-y','-v','error','-f','rawvideo','-pixel_format','rgb24','-video_size',`${width}x${height}`,'-i','pipe:0','-frames:v','1','public/artwork.png'],{input:rgb});
if(encoded.status!==0)throw new Error(encoded.stderr.toString());
writeFileSync('analysis/palette.json',JSON.stringify({colors:['#e10508','#030303','#c2c2c2','#5c5c5c'],method:'Four-color classification of source still; red chroma dominance or gray luma threshold',note:'Design uses these four base colors. Antialiasing, compositing and delivery compression produce intermediate edge shades.'},null,2));
