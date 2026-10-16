import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,existsSync,copyFileSync,unlinkSync} from 'node:fs';
import {resolve} from 'node:path';
import {root,read} from './render-production.ts';
import {parseTimeline} from '../src/model.ts';
const kit=resolve(root,'publishing-kit'),timeline=parseTimeline(read('public/timeline.json'));
for(const dir of ['YouTube','TikTok','Farcaster','Captions'])mkdirSync(resolve(kit,dir),{recursive:true});
const save=(path:string,text:string)=>writeFileSync(resolve(kit,path),text.trim()+'\n');
const source='https://www.youtube.com/watch?v=sPw-_Of_LgQ';
const title='лампабикт feat. Элли на маковом поле — немерено | Russian & English Lyrics';
assert(title.length<=100);save('YouTube/Title.txt',title);
save('YouTube/Description.txt',`«немерено» — лампабикт feat. Элли на маковом поле
Russian lyrics and an English translation with synchronized word highlighting.

A quiet forest, love growing like a tree, and a restrained spectrum that follows the recording. Both languages receive equal emphasis; overlapping voices keep separate reading blocks.

Original recording: ${source}
Music and original source imagery belong to their respective creators. Separate photographer and composer credits have not been independently verified by this project.

AI-assisted English translation, word timing, lyric presentation, visualizer implementation, cover typography and posting copy, developed under human direction and reviewed by the creator. The original soundtrack is retained; this project does not synthesize the vocals or replace the source photograph.

#немерено #лампабикт #ЭллиНаМаковомПоле #RussianMusic #EnglishTranslation #Lyrics`);
save('TikTok/Title.txt','немерено — лампабикт feat. Элли на маковом поле');
save('TikTok/Description.txt',`«немерено» — лампабикт feat. Элли на маковом поле
Russian + English lyrics. Love growing like a tree, in a quiet forest.

AI-assisted translation, lyric timing, visualizer code and posting copy; human-directed and reviewed. Original recording and source image: ${source}
Music and source imagery belong to their creators.

#немерено #лампабикт #ЭллиНаМаковомПоле #RussianMusic #EnglishTranslation`);
const cast=`${title}

AI-assisted translation, timing, visuals and caption. Human-directed and reviewed.
Original recording/artwork: https://youtu.be/sPw-_Of_LgQ`;
assert(Buffer.byteLength(cast,'utf8')<=320,'Combined Farcaster post exceeds the conservative local byte budget.');
save('Farcaster/Caption.txt',cast);
// Retire superseded text files while retaining a local recovery copy.
for(const name of ['AI-Disclosure.txt','README.txt']){
 const old=resolve(kit,'Farcaster',name);
 if(existsSync(old)){const archive=resolve(root,'analysis/retired-farcaster-copy');mkdirSync(archive,{recursive:true});copyFileSync(old,resolve(archive,name));unlinkSync(old)}
}
save('README.txt',`НЕМЕРЕНО — UPLOAD KIT

YouTube/ — full 1920×1080 MP4 at 60 fps, 1280×720 thumbnail, title and description.
TikTok/ — full 1080×1920 MP4 at 60 fps, portrait 1200×1600 profile cover, title and description.
Farcaster/ — full landscape MP4, dedicated thumbnail and one ready-to-post Caption.txt containing title, AI disclosure and original-source credit.
Captions/ — optional Russian, English and bilingual SRTs. The films already contain synchronized bilingual word highlighting.

The approved edition is nemereno-rebuild-v4.3. Complete original soundtrack: 3:24.900. Each film has 12,294 frames at 60 fps. A single, uniformly scaled source-image crop fills each format while keeping the seated figure visible. The compact ivory spectrum supports stable equal-size lyrics. The final original source picture is held through the short audio tail.

Use matching video, cover and text for manual upload. YouTube is a 16:9 standard-video composition. TikTok's profile cover is 3:4 width:height, distinct from the 9:16 video. The optional SRTs preserve independent overlapping vocal cues; the embedded presentation is authoritative for their layout and word focus.

CHECKSUMS.sha256 and DELIVERY.json identify the final verified files. AI assistance and original-creator credits are disclosed in the posting text. No platform upload is performed by this kit.`);
const stamp=(seconds:number)=>{const ms=Math.round(seconds*1000),s=Math.floor(ms/1000);return `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor(s/60%60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')},${(ms%1000).toString().padStart(3,'0')}`};
for(const language of ['Russian','English','Bilingual']){
 const rows=timeline.cues.map((c,i)=>`${i+1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${language==='Russian'?c.sourceText:language==='English'?c.targetText:c.sourceText+'\n'+c.targetText}`);
 assert.equal(rows.length,46);save(`Captions/${language}.srt`,rows.join('\n\n'));
}
writeFileSync(resolve(root,'evidence/publishing-copy.json'),JSON.stringify({schemaVersion:1,source,captionCues:46,farcasterCopyRevision:3,farcasterCaptionUtf8Bytes:Buffer.byteLength(cast,'utf8'),disclosure:'One ready-to-post file combines factual title/credits, explicit AI-assisted translation/timing/visuals/caption, actual human direction/review and original-source credit. Caption authorship is disclosed even for this concise post.',policyBasis:'Current official client notice and Network Code checked 16 October 2026. Undisclosed AI content is prohibited; repeatedly presenting AI writing as one\'s own is listed as a bannable offense. Including caption assistance is the workflow\'s disclosure choice; no mandatory phrase or short-caption exemption is asserted.',policyUrl:'https://farcaster.xyz/~/code',noticeUrl:'https://farcaster.xyz/~/vote',referenceClientSnapshot:'https://github.com/farcasterxyz/client',youtubeStandardAspectReference:'https://support.google.com/youtube/answer/15424877?hl=en',platformUploadPerformed:false},null,2)+'\n');
console.log(JSON.stringify({status:'publishing text and optional captions prepared',farcasterBytes:Buffer.byteLength(cast,'utf8')}));
