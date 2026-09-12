import assert from 'node:assert/strict';
import {cpSync, mkdirSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {asset, hashFile, RELEASE_URL, validateCorrectedDelivery, type Asset} from './stage-repo.ts';

const target = process.argv[2]; assert(target, 'Provide a destination directory as the first argument');
const {production, outputAssets} = await validateCorrectedDelivery();
const dest = resolve(target); mkdirSync(dest, {recursive: true});
const assets: Asset[] = [];
for (const expected of outputAssets) {
  const out = join(dest, expected.file); cpSync('output/' + expected.file, out);
  const copied = await asset(out, expected.file); assert.equal(copied.sha256, expected.sha256); assets.push(copied);
}
const original = 'Midnight-Love-Original-Source.mkv';
const originalHash = await hashFile('source/original.mkv'); cpSync('source/original.mkv', join(dest, original));
const copiedOriginal = await asset(join(dest, original), original); assert.equal(copiedOriginal.sha256, originalHash); assets.push(copiedOriginal);
writeFileSync(join(dest, 'START-HERE.txt'), `girl in red — midnight love · corrected v${production.version}

Restores six sung lines after 2:34 and corrects earlier word focus/onset. ${production.cues} cues, ${production.performedWords} performed words, ${production.focusGroups} focus groups.

YouTube: Midnight-Love-YouTube-1920x1080-60fps.mp4
Thumbnail: Midnight-Love-YouTube-Thumbnail-1920x1080.jpg
Use the matching YouTube Title and Description text files.

TikTok: Midnight-Love-TikTok-1080x1920-60fps.mp4
Profile cover: Midnight-Love-TikTok-Cover-Profile-1200x1600.jpg
The cover is PORTRAIT 1200 wide × 1600 tall (3:4 width:height), matching the upload UI's tall preview labelled 4:3.
Use the matching TikTok Title and Description text files.

Both videos contain the same full recording and synchronized English lyrics. The supplied SRT is an optional separate caption track. Do not add it as a second burned-in lyric layer.

Active words use pale-gold color-only emphasis with stable spacing and no lyric underlines. The final grading is continuous across the frame, without a visible dark lyric panel. Source animation remains nominally 24 fps; added graphics and camera motion run at 60 fps.

Original song and visual: https://www.youtube.com/watch?v=9256X67IQdQ
Photograph credited to Fabian Fjeldvik in the original upload.
Added lyric presentation by Ael, assisted with OpenAI Codex (GPT-6 Astra). Covers are AI-assisted adaptations. Original works remain credited to their creators.

Complete editable production and original media:
${RELEASE_URL}

CHECKSUMS.sha256 records the delivered media, publishing files and this guide.
`);
assets.push(await asset(join(dest, 'START-HERE.txt'), 'START-HERE.txt'));
writeFileSync(join(dest, 'CHECKSUMS.sha256'), assets.map(item => `${item.sha256}  ${item.file}\n`).join(''));
writeFileSync('evidence/desktop-verification.json', JSON.stringify({destination: 'User-requested Desktop delivery folder', ...production, assets, allCopiedHashesMatch: true}, null, 2));
console.log({assets: assets.length, allCopiedHashesMatch: true, ...production});
