import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {root,read} from './render-production.ts';
import {parseTimeline} from '../src/model.ts';
const kit=resolve(root,'publishing-kit'),timeline=parseTimeline(read('public/timeline.json'));
for(const dir of ['YouTube','TikTok','Farcaster','Captions'])mkdirSync(resolve(kit,dir),{recursive:true});
const save=(path:string,text:string)=>writeFileSync(resolve(kit,path),text.trim()+'\n');
const source='https://www.youtube.com/watch?v=ghRP43_z5N8',title='забей, лерочка — ничего нет | Russian & English Lyrics';assert(title.length<=100);
save('YouTube/Title.txt',title);
save('YouTube/Description.txt',`«ничего нет» — забей, лерочка
Russian lyrics and an English translation, with word highlighting that follows the singing.

A quiet winter scene, warmth and shelter from the dark. The original monochrome photograph stays central, with equal bilingual lyrics and a gentle silver music filament along the edge of the gift box.

Original recording: ${source}
From «мой маленький холодный мир». Original music, vocals and source artwork belong to their respective creators. Separate photographer credit has not been independently verified.

AI-assisted transcription review, English translation, word timing, lyric presentation, visualizer code, cover typography and posting copy; human-directed. The accepted preview guided this lyric edition. Original music and vocals are retained.

#забейлерочка #ничегонет #RussianMusic #EnglishTranslation #Lyrics`);
save('TikTok/Title.txt','забей, лерочка — ничего нет');
save('TikTok/Description.txt',`забей, лерочка — «ничего нет»
Russian + English lyrics. A little warmth in a cold world.

AI-assisted translation, word timing, visuals and posting text; human-directed.
Original music, vocals and source image: ${source}
Credits belong to the original creators.

#забейлерочка #ничегонет #RussianMusic #EnglishTranslation #Lyrics`);
const cast=`забей, лерочка — ничего нет | Russian & English Lyrics

AI-assisted translation, timing, visuals, cover and caption. Human-directed.
Original: https://youtu.be/ghRP43_z5N8`;assert(Buffer.byteLength(cast,'utf8')<=320);save('Farcaster/Caption.txt',cast);
save('README.txt',`ЗАБЕЙ, ЛЕРОЧКА — НИЧЕГО НЕТ — UPLOAD KIT

YouTube/ — complete 1920×1080 MP4 at 60 fps, 1280×720 thumbnail, title and description.
TikTok/ — complete 1080×1920 MP4 at 60 fps, 1200×1600 portrait profile cover, title and description.
Farcaster/ — complete landscape MP4, matching thumbnail and one Caption.txt combining title, AI disclosure and source credit.
Captions/ — optional Russian, English and bilingual SRTs. Both films already contain synchronized bilingual word highlighting.

Accepted edition: nichego-net-v1.1-preview. Each film contains 11,701 pictures at 60 fps (3:15.017). The complete original recording lasts 3:15.013. The upload soundtrack is high-quality 320 kb/s stereo AAC, with measured zero sample offset. One original-image crop fills each format, and the final source picture covers the short audio tail.

The YouTube video is 16:9. TikTok's video is 9:16; its separate tall profile cover is 3:4 width:height. CHECKSUMS.sha256 and DELIVERY.json identify the verified files. The kit is ready for manual uploading.`);
const stamp=(seconds:number)=>{const ms=Math.round(seconds*1000),s=Math.floor(ms/1000);return `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor(s/60%60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')},${(ms%1000).toString().padStart(3,'0')}`};
for(const language of ['Russian','English','Bilingual']){const rows=timeline.cues.map((c,i)=>`${i+1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${language==='Russian'?c.sourceText:language==='English'?c.targetText:c.sourceText+'\n'+c.targetText}`);assert.equal(rows.length,39);save(`Captions/${language}.srt`,rows.join('\n\n'))}
writeFileSync(resolve(root,'evidence/publishing-copy.json'),JSON.stringify({schemaVersion:1,source,captionCues:39,farcasterCaptionUtf8Bytes:Buffer.byteLength(cast,'utf8'),disclosure:'Visible AI assistance and original-creator/source credits. Farcaster uses one ready-to-post title/disclosure/credit file, including caption assistance.',platformUploadPerformed:false,youTubeClassificationReference:'https://support.google.com/youtube/answer/15424877?hl=en',policyCheckedLocalDate:'2026-10-18',youTubeFormat:'1920x1080, square pixels, 16:9 standard video'},null,2)+'\n');console.log('Posting text and optional captions prepared.');
