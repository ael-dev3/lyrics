import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import {createPainter,root,read,type Recording} from './render-production.ts';
import type {Timeline} from '../src/model.ts';

const kit=resolve(root,'publishing-kit');
for(const folder of ['YouTube','TikTok','Captions'])mkdirSync(resolve(kit,folder),{recursive:true});
if(!GlobalFonts.registerFromPath(resolve(root,'public/fonts/RoomSerif.ttf'),'Room'))throw Error('Cover font unavailable.');
const artwork=await loadImage(resolve(root,'public/material-reference.png'));
const covers=[{platform:'YouTube',width:1280,height:720,file:'Gde-Ty-YouTube-Thumbnail-1280x720.jpg'},{platform:'TikTok',width:1200,height:1600,file:'Gde-Ty-TikTok-Cover-Profile-1200x1600.jpg'}] as const;
const records=[];
for(const c of covers){
 const portrait=c.platform==='TikTok',canvas=createCanvas(c.width,c.height),ctx=canvas.getContext('2d');
 const gradient=ctx.createLinearGradient(0,0,c.width,c.height);gradient.addColorStop(0,'#505966');gradient.addColorStop(1,'#343c49');ctx.fillStyle=gradient;ctx.fillRect(0,0,c.width,c.height);
 if(portrait)ctx.drawImage(artwork,0,400,1200,1200);
 else{const painter=await createPainter('landscape'),ref=createCanvas(1080,1080);ref.getContext('2d').drawImage(artwork,0,0);painter.paint(ref.data(),0);ctx.drawImage(painter.canvas,0,0,1280,720);}
 ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.shadowColor='#222c38';ctx.shadowBlur=3;ctx.shadowOffsetY=1.5;ctx.fillStyle='#ffd493';ctx.font=`600 ${portrait?146:106}px Room`;
 const title='где ты?',x=portrait?600:996,y=portrait?240:276,m=ctx.measureText(title);
 if(m.width>(portrait?1040:485)||y-m.actualBoundingBoxAscent<c.height*.07)throw Error('Cover title outside safe area.');
 ctx.fillText(title,x,y);ctx.fillStyle='#dce1e5';ctx.font=`600 ${portrait?75:45}px Room`;
 for(const [text,baseline] of [['элли на маковом поле',portrait?310:350],['feat. лампабикт',portrait?366:394]] as const){if(ctx.measureText(text).width>(portrait?1020:492))throw Error('Cover artist outside safe area.');ctx.fillText(text,x,baseline);}
 writeFileSync(resolve(kit,c.platform,c.file),canvas.toBuffer('image/jpeg',94));
 mkdirSync(resolve(root,'analysis/cover-review'),{recursive:true});
 for(const [w,h,label] of portrait?[[150,200,'tiktok-150x200'],[300,400,'tiktok-300x400']]:[[320,180,'youtube-320x180']]){const small=createCanvas(w as number,h as number);small.getContext('2d').drawImage(canvas,0,0,w as number,h as number);writeFileSync(resolve(root,`analysis/cover-review/${label}.png`),small.toBuffer('image/png'));}
 if(portrait){const crop=createCanvas(300,400);crop.getContext('2d').drawImage(canvas,60,80,1080,1440,0,0,300,400);writeFileSync(resolve(root,'analysis/cover-review/tiktok-crop-stress.png'),crop.toBuffer('image/png'));}
 records.push({file:`${c.platform}/${c.file}`,width:c.width,height:c.height,ratio:portrait?'3:4 portrait':'16:9 landscape',color:'RGB JPEG; no rotation metadata',method:'Code-composed typography with the official recording photograph. Complete source subject, no invented photograph or photographer credit.'});
}
writeFileSync(resolve(kit,'YouTube/Title.txt'),'элли на маковом поле feat. лампабикт — где ты? | Russian & English Lyrics\n');
writeFileSync(resolve(kit,'YouTube/Description.txt'),`«где ты?» — элли на маковом поле feat. лампабикт\n\nRussian lyrics and an original English translation, synchronized word by word. The room’s crystal chandelier and exposed piano keys respond gently to the music; both voices keep their own complete lyric lines when they overlap.\n\nOriginal recording and photograph:\nhttps://www.youtube.com/watch?v=Dpek_5Wh6IE\nReleased March 22, 2024 · ℗ МТС Лейбл\n\nEnglish translation, bilingual typography and audio-reactive treatment created for this edition. The original soundtrack is preserved. Original music and photograph remain the property of their respective rights holders.\n\n#эллиНаМаковомПоле #лампабикт #ГдеТы #RussianMusic #Lyrics\n`);
writeFileSync(resolve(kit,'TikTok/Description.txt'),'«где ты?» — элли на маковом поле feat. лампабикт\nРусский текст + английский перевод. Свет в хрустале и клавишах откликается музыке, а два голоса остаются рядом.\n\nOriginal recording & photograph: Dpek_5Wh6IE · ℗ МТС Лейбл. English translation and lyric animation for this edition.\n\n#эллиНаМаковомПоле #лампабикт #ГдеТы #RussianMusic #Lyrics\n');
const timeline=read<Timeline>('public/timeline.json'),boundaries=[...new Set(timeline.cues.flatMap(c=>[c.visibleStart,c.visibleEnd]))].sort((a,b)=>a-b);
const stamp=(seconds:number)=>{const ms=Math.round(seconds*1000),s=Math.floor(ms/1000);return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`};
for(const language of ['Russian','English','Bilingual'] as const){let index=0;const blocks=[];for(let i=0;i<boundaries.length-1;i++){const start=boundaries[i]!,end=boundaries[i+1]!,active=timeline.cues.filter(c=>start>=c.visibleStart&&start<c.visibleEnd);if(!active.length)continue;const text=active.map(c=>language==='Russian'?c.sourceText:language==='English'?c.targetText:c.sourceText+'\n'+c.targetText).join('\n');blocks.push(`${++index}\n${stamp(start)} --> ${stamp(end)}\n${text}\n`);}writeFileSync(resolve(kit,'Captions',language+'.srt'),blocks.join('\n'));}
writeFileSync(resolve(kit,'README.txt'),`ГДЕ ТЫ? — ЭЛЛИ НА МАКОВОМ ПОЛЕ FEAT. ЛАМПАБИКТ\n\nYouTube: upload the 1920x1080 60 fps MP4. Title.txt, Description.txt and the 1280x720 thumbnail are ready to use.\n\nTikTok: upload the full 1080x1920 60 fps MP4. Description.txt and the 1200x1600 portrait profile cover are ready to use.\n\nBoth films include Russian and English word/meaning highlighting. Optional SRTs preserve simultaneous singers in non-overlapping subtitle blocks. The embedded lyrics do not require external subtitles.\n\nOriginal soundtrack preserved. Prepared for manual uploading; no platform upload has been performed. DELIVERY.json and CHECKSUMS.sha256 identify the final kit.\n`);
writeFileSync(resolve(root,'evidence/cover-specification.json'),JSON.stringify({sourceSha256:read<Recording>('source/recording.json').sourceSha256,covers:records,reviewMethod:'150x200 and 300x400 portrait, 320x180 wide and 5% portrait crop simulation; no platform-upload preview claimed.',rights:'Original music/photograph excluded from repository licensing. No separate photographer credit was available in the recording metadata.'},null,2)+'\n');
console.log(JSON.stringify({kit:'publishing-kit',covers:records.length,copyFiles:3,captions:3}));
