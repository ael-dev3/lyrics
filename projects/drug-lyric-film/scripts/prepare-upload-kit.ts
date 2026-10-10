import {mkdirSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import {root,read,createPainter,type Recording} from './render-production.ts';
import {checkCurrentProductionAuthorization} from './production-authorization.ts';
import type {Timeline} from '../src/model.ts';

checkCurrentProductionAuthorization();
const kit=resolve(root,'publishing-kit');
for(const folder of ['YouTube','TikTok','Captions'])mkdirSync(resolve(kit,folder),{recursive:true});
if(!GlobalFonts.registerFromPath(resolve(root,'public/fonts/Oswald-Medium.ttf'),'Ink'))throw Error('Cover font unavailable.');
const artwork=await loadImage(resolve(root,'public/artwork-reference.png'));
const source=execFileSync('ffmpeg',['-v','error','-i',resolve(root,'public/source.mp4'),'-frames:v','1','-pix_fmt','rgba','-f','rawvideo','-'],{maxBuffer:16*1024*1024});
const painter=await createPainter('landscape');painter.paint(source,0);
const covers=[{platform:'YouTube',width:1920,height:1080,file:'Drug-REDCHINAWAVE-YouTube-Thumbnail-1920x1080.jpg'}, {platform:'TikTok',width:1200,height:1600,file:'Drug-REDCHINAWAVE-TikTok-Cover-1200x1600.jpg'}] as const;
const coverRecords=[];
for(const c of covers){
 const canvas=createCanvas(c.width,c.height),ctx=canvas.getContext('2d'),portrait=c.platform==='TikTok';
 ctx.fillStyle='#10090e';ctx.fillRect(0,0,c.width,c.height);
 if(portrait){
  ctx.drawImage(artwork,0,0,1200,1200);
  const shade=ctx.createLinearGradient(0,1010,0,1250);shade.addColorStop(0,'#10090e00');shade.addColorStop(1,'#10090e');ctx.fillStyle=shade;ctx.fillRect(0,1010,1200,240);
 }else ctx.drawImage(painter.canvas,0,0);
 ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.shadowColor='#17070b';ctx.shadowBlur=0;ctx.shadowOffsetY=2;
 const x=portrait?600:1480,titleY=portrait?1365:565,artistY=portrait?1470:680;
 ctx.fillStyle='#fff0d7';ctx.font=`500 ${portrait?230:240}px Ink`;
 const title=ctx.measureText('ДРУГ');if(title.width>(portrait?1008:730))throw Error('Title exceeds safe margins.');ctx.fillText('ДРУГ',x,titleY);
 ctx.fillStyle='#ded2cb';ctx.font=`500 ${portrait?64:58}px Ink`;const artist=ctx.measureText('REDCHINAWAVE');
 if(artist.width>(portrait?1008:730))throw Error('Artist exceeds safe margins.');ctx.fillText('REDCHINAWAVE',x,artistY);
 writeFileSync(resolve(kit,c.platform,c.file),canvas.toBuffer('image/jpeg',94));
 mkdirSync(resolve(root,'analysis/cover-review'),{recursive:true});
 if(portrait){
  for(const [w,h] of [[150,200],[300,400]] as const){const small=createCanvas(w,h);small.getContext('2d').drawImage(canvas,0,0,w,h);writeFileSync(resolve(root,`analysis/cover-review/tiktok-${w}x${h}.png`),small.toBuffer('image/png'))}
  const zoom=createCanvas(300,400);zoom.getContext('2d').drawImage(canvas,60,80,1080,1440,0,0,300,400);writeFileSync(resolve(root,'analysis/cover-review/tiktok-crop-stress.png'),zoom.toBuffer('image/png'));
 }else{const small=createCanvas(320,180);small.getContext('2d').drawImage(canvas,0,0,320,180);writeFileSync(resolve(root,'analysis/cover-review/youtube-320x180.png'),small.toBuffer('image/png'));}
 coverRecords.push({file:`${c.platform}/${c.file}`,width:c.width,height:c.height,ratio:portrait?'3:4 portrait':'16:9 landscape',color:'RGB JPEG; no rotation metadata',method:'Source illustration and approved scene, with code-composed title typography. No generated replacement artwork.'});
}
writeFileSync(resolve(kit,'YouTube/Title.txt'),'REDCHINAWAVE — Друг | Russian & English Lyrics\n');
writeFileSync(resolve(kit,'YouTube/Description.txt'),`REDCHINAWAVE — «Друг»\n\nRussian lyrics and an original English translation, highlighted together. Ravens cross the red sky while the city's windows respond to the music.\n\nOriginal song and illustration: REDCHINAWAVE's official recording\nhttps://www.youtube.com/watch?v=SXAReusgEC0\n\nBilingual lyric film, translation, animation and typography prepared for this edition with AI-assisted tools and manual preview review. The original soundtrack is preserved. Music and source artwork belong to their respective rights holders.\n\n#REDCHINAWAVE #Друг #RussianMusic #Lyrics\n`);
writeFileSync(resolve(kit,'TikTok/Description.txt'),'REDCHINAWAVE — «Друг»\nРусский текст + английский перевод. Вороны над красным небом, огни города в ритме музыки.\n\nOriginal song & artwork: REDCHINAWAVE — https://www.youtube.com/watch?v=SXAReusgEC0\nAI-assisted bilingual lyric animation and translation; manually reviewed preview.\n\n#REDCHINAWAVE #Друг #RussianMusic #Lyrics\n');
const timeline=read<Timeline>('public/timeline.json');
const stamp=(seconds:number)=>{const ms=Math.round(seconds*1000),s=Math.floor(ms/1000);return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`};
for(const language of ['Russian','English','Bilingual'] as const){const captions=timeline.cues.map((c,i)=>`${i+1}\n${stamp(c.visibleStart)} --> ${stamp(c.visibleEnd)}\n${language==='Russian'?c.sourceText:language==='English'?c.targetText:c.sourceText+'\n'+c.targetText}\n`).join('\n');writeFileSync(resolve(kit,'Captions',language+'.srt'),captions);}
writeFileSync(resolve(kit,'README.txt'),`REDCHINAWAVE — ДРУГ\n\nYouTube: use the 1920x1080 60 fps MP4, Title.txt, Description.txt and landscape thumbnail in YouTube.\n\nTikTok: use the 1080x1920 60 fps MP4, Description.txt and 1200x1600 portrait profile cover in TikTok.\n\nBoth films contain Russian and English word highlighting. Captions contains optional line subtitle files. The original source illustration and soundtrack are preserved. This kit is prepared for manual upload. CHECKSUMS.sha256 and DELIVERY.json identify the delivered files.\n`);
writeFileSync(resolve(root,'evidence/cover-specification.json'),JSON.stringify({sourceSha256:read<Recording>('source/recording.json').sourceSha256,covers:coverRecords,reviewMethod:'Local 150x200 / 300x400 portrait, 320x180 wide and 5% crop simulations; no platform-upload preview claimed.',rights:'Original music and artwork remain outside repository licensing; attribution links the supplied official recording.'},null,2)+'\n');
console.log(JSON.stringify({kit:'publishing-kit',covers:coverRecords.length,copyFiles:3,captions:3}));
