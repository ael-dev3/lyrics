import {cpSync,mkdirSync,readdirSync,writeFileSync,createReadStream,statSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const target=process.argv[2];assert(target,'Provide a destination directory as the first argument.');
const dest=resolve(target);mkdirSync(dest,{recursive:true});
const names=readdirSync('output').filter(n=>/\.(mp4|jpg|txt|srt|json)$/.test(n));
const hash=async(p:string)=>{const h=createHash('sha256');for await(const b of createReadStream(p))h.update(b);return h.digest('hex');};
const assets=[];
for(const name of names){const source='output/'+name,out=join(dest,name);cpSync(source,out);const sha256=await hash(out);assert.equal(sha256,await hash(source));assets.push({file:name,bytes:statSync(out).size,sha256});}
const original='Midnight-Love-Original-Source.mkv';cpSync('source/original.mkv',join(dest,original));
const originalHash=await hash(join(dest,original));assert.equal(originalHash,await hash('source/original.mkv'));assets.push({file:original,bytes:statSync(join(dest,original)).size,sha256:originalHash});
writeFileSync(join(dest,'START-HERE.txt'),`girl in red — midnight love\n\nYouTube: Midnight-Love-YouTube-1920x1080-60fps.mp4\nThumbnail: Midnight-Love-YouTube-Thumbnail-1920x1080.jpg\nUse the matching YouTube Title and Description text files.\n\nTikTok: Midnight-Love-TikTok-1080x1920-60fps.mp4\nProfile cover: Midnight-Love-TikTok-Cover-Profile-1200x1600.jpg\nThe cover is PORTRAIT 1200 wide × 1600 tall (3:4 width:height), matching the upload UI's tall preview labelled 4:3.\nUse the matching TikTok Title and Description text files.\n\nBoth videos contain the same full recording and synchronized English lyrics. The supplied SRT is an optional separate caption track. Do not add it as a second burned-in lyric layer.\n\nThe final grading is continuous across the frame, without a visible dark lyric panel. Source animation remains nominally 24 fps; added graphics and camera motion run at 60 fps.\n\nOriginal song and visual: https://www.youtube.com/watch?v=9256X67IQdQ\nPhotograph credited to Fabian Fjeldvik in the original upload.\nAdded lyric presentation by Ael, assisted with OpenAI Codex (GPT-6 Astra). Covers are AI-assisted adaptations. Original works remain credited to their creators.\n\nComplete editable production and original media:\nhttps://github.com/ael-dev3/lyrics/releases/tag/midnight-love-v1.0.0\n\nCHECKSUMS.sha256 records the delivered media and publishing files.\n`);
writeFileSync(join(dest,'CHECKSUMS.sha256'),assets.map(a=>`${a.sha256}  ${a.file}\n`).join(''));
writeFileSync('evidence/desktop-verification.json',JSON.stringify({destination:'User-requested Desktop delivery folder',assets,allCopiedHashesMatch:true},null,2));
console.log({assets:assets.length,allCopiedHashesMatch:true});
