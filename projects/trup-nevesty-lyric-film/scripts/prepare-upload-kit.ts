import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import {root,read,type Recording} from './render-production.ts';
import type {Timeline} from '../src/model.ts';

const kit=resolve(root,'publishing-kit');
for(const folder of ['YouTube','TikTok','Captions'])mkdirSync(resolve(kit,folder),{recursive:true});
if(!GlobalFonts.registerFromPath(resolve(root,'public/fonts/Alegreya.ttf'),'Bridal'))throw Error('Cover font unavailable.');
const artwork=await loadImage(resolve(root,'public/material-reference.png'));
const covers=[{platform:'YouTube',width:1280,height:720,file:'Trup-Nevesty-YouTube-Thumbnail-1280x720.jpg'}, {platform:'TikTok',width:1200,height:1600,file:'Trup-Nevesty-TikTok-Cover-Profile-1200x1600.jpg'}] as const;
const coverRecords=[];
for(const c of covers){
 const canvas=createCanvas(c.width,c.height),ctx=canvas.getContext('2d'),portrait=c.platform==='TikTok';
 const background=ctx.createLinearGradient(0,0,0,c.height);background.addColorStop(0,'#414652');background.addColorStop(.55,'#45434b');background.addColorStop(1,'#866b70');ctx.fillStyle=background;ctx.fillRect(0,0,c.width,c.height);
 if(portrait)ctx.drawImage(artwork,0,300,1200,1200);else ctx.drawImage(artwork,280,0,720,720);
 const shade=ctx.createLinearGradient(0,0,0,portrait?410:310);shade.addColorStop(0,'rgba(7,16,28,.56)');shade.addColorStop(.7,'rgba(7,16,28,.48)');shade.addColorStop(1,'rgba(7,16,28,0)');ctx.fillStyle=shade;ctx.fillRect(0,0,c.width,portrait?410:310);
 ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.shadowColor='#07101c';ctx.shadowBlur=5;ctx.shadowOffsetY=2;
 ctx.fillStyle='#f1cd82';ctx.font=`600 ${portrait?146:110}px Bridal`;const title='Труп невесты',titleMetrics=ctx.measureText(title),titleY=portrait?230:151;if(titleMetrics.width>c.width*.84)throw Error('Cover title exceeds safe width.');if(portrait&&titleY-titleMetrics.actualBoundingBoxAscent<c.height*.07)throw Error('Cover title exceeds safe top margin.');ctx.fillText(title,c.width/2,titleY);
 ctx.fillStyle='#f0eee8';ctx.font=`600 ${portrait?64:48}px Bridal`;ctx.fillText('Green Apelsin',c.width/2,portrait?320:215);
 const target=resolve(kit,c.platform,c.file);writeFileSync(target,canvas.toBuffer('image/jpeg',94));
 mkdirSync(resolve(root,'analysis/cover-review'),{recursive:true});
 if(portrait){for(const [w,h] of [[150,200],[300,400]] as const){const small=createCanvas(w,h);small.getContext('2d').drawImage(canvas,0,0,w,h);writeFileSync(resolve(root,`analysis/cover-review/tiktok-${w}x${h}.png`),small.toBuffer('image/png'))}const zoom=createCanvas(300,400);zoom.getContext('2d').drawImage(canvas,60,80,1080,1440,0,0,300,400);writeFileSync(resolve(root,'analysis/cover-review/tiktok-crop-stress.png'),zoom.toBuffer('image/png'));}
 else{const small=createCanvas(320,180);small.getContext('2d').drawImage(canvas,0,0,320,180);writeFileSync(resolve(root,'analysis/cover-review/youtube-320x180.png'),small.toBuffer('image/png'));}
 coverRecords.push({file:`${c.platform}/${c.file}`,width:c.width,height:c.height,ratio:portrait?'3:4 portrait':'16:9 landscape',color:'RGB JPEG; no rotation metadata',method:'Code-composed typography and the original recording illustration; no newly generated raster artwork.'});
}
writeFileSync(resolve(kit,'YouTube/Title.txt'),'Green Apelsin — Труп невесты | Russian & English Lyrics\n');
writeFileSync(resolve(kit,'YouTube/Description.txt'),`Green Apelsin — «Труп невесты»\n\nRussian lyrics and an original English translation, with the guitar strings, bridal veil and wedding ring gently brought to life.\n\nOriginal song and illustration: Green Apelsin’s official recording\nhttps://www.youtube.com/watch?v=1CT57xZoYVg\n\nBilingual lyric film, English translation, animation and typography created for this edition. The original soundtrack is preserved. Original music and artwork remain the property of their respective rights holders.\n\n#GreenApelsin #ТрупНевесты #RussianMusic #Lyrics\n`);
writeFileSync(resolve(kit,'TikTok/Description.txt'),'Green Apelsin — «Труп невесты» 🥀\nРусский текст + английский перевод. Струны, фата и обручальное кольцо оживают вместе с музыкой.\n\nOriginal song & artwork: Green Apelsin’s official recording. Bilingual lyric animation and English translation for this edition.\n\n#GreenApelsin #ТрупНевесты #RussianMusic #Lyrics\n');
const timeline=read<Timeline>('public/timeline.json');
const stamp=(seconds:number)=>{const ms=Math.round(seconds*1000),s=Math.floor(ms/1000);return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`};
for(const language of ['Russian','English','Bilingual'] as const){const captions=timeline.cues.map((c,i)=>`${i+1}\n${stamp(c.visibleStart)} --> ${stamp(c.visibleEnd)}\n${language==='Russian'?c.sourceText:language==='English'?c.targetText:c.sourceText+'\n'+c.targetText}\n`).join('\n');writeFileSync(resolve(kit,'Captions',language+'.srt'),captions);}
writeFileSync(resolve(kit,'README.txt'),`GREEN APELSIN — ТРУП НЕВЕСТЫ\n\nYouTube: upload the 1920x1080 60 fps MP4 in YouTube. Title.txt and Description.txt are ready to paste. Use the YouTube thumbnail JPEG.\n\nTikTok: upload the 1080x1920 60 fps MP4 in TikTok. Description.txt is ready to paste. The dedicated profile cover is 1200x1600 pixels, 3:4 portrait.\n\nBoth films include Russian and English word highlighting. Captions contains optional separate subtitle files; they are not required to see the embedded lyrics.\n\nThe original source illustration and soundtrack are preserved. This kit is prepared for manual uploading; no platform upload has been performed. CHECKSUMS.sha256 and DELIVERY.json identify these files.\n`);
writeFileSync(resolve(root,'evidence/cover-specification.json'),JSON.stringify({sourceSha256:read<Recording>('source/recording.json').sourceSha256,covers:coverRecords,reviewMethod:'Local 150x200 / 300x400 portrait, 320x180 wide and 5% crop simulations; no platform-upload preview claimed.',rights:'Source music/artwork excluded from repository licensing. Covers adapt the official source; no separate uncredited artist identity invented.'},null,2)+'\n');
console.log(JSON.stringify({kit:'publishing-kit',covers:coverRecords.length,copyFiles:3,captions:3}));
