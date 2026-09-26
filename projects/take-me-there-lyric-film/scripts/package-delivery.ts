import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {copyFileSync, createReadStream, existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync} from 'node:fs';
import {basename, dirname, isAbsolute, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const argument = process.argv.indexOf('--dest');
const destination = argument >= 0 ? process.argv[argument + 1] : undefined;
if (!destination || !isAbsolute(destination)) throw Error('Pass an absolute --dest upload-kit folder');
const folder = resolve(destination);
const temporary = `${folder}.partial`;
if (existsSync(folder) || existsSync(temporary)) throw Error('Delivery folder already exists; preserve the previous edition');

type VerifiedFormat = {file: string; sha256: string};
type Verification = {status: string; song: string; revision: string; formats: {landscape: VerifiedFormat; portrait: VerifiedFormat}};
const verification = JSON.parse(readFileSync(resolve(root, 'evidence/final-verification.json'), 'utf8')) as Verification;
assert.equal(verification.status, 'passed');
assert.equal(verification.song, 'CPznmfSbAiE');
assert.equal(verification.revision, 'source-integrated-preview-v2');

async function sha256(path: string): Promise<string> {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk as Buffer);
  return hash.digest('hex');
}
type Entry = {path: string; bytes: number; sha256: string; role: string};
const entries: Entry[] = [];
async function add(source: string, relative: string, role: string, expectedHash?: string): Promise<void> {
  const from = resolve(root, source), to = join(temporary, relative);
  if (!existsSync(from)) throw Error(`Missing delivery input: ${source}`);
  const originalHash = await sha256(from);
  if (expectedHash && originalHash !== expectedHash) throw Error(`Verified film changed: ${source}`);
  mkdirSync(dirname(to), {recursive: true});
  copyFileSync(from, to);
  const copiedHash = await sha256(to);
  if (copiedHash !== originalHash) throw Error(`Copy mismatch: ${relative}`);
  entries.push({path: relative, bytes: statSync(to).size, sha256: copiedHash, role});
}
async function addText(relative: string, contents: string, role: string): Promise<void> {
  const to = join(temporary, relative);
  mkdirSync(dirname(to), {recursive: true});
  writeFileSync(to, contents, 'utf8');
  entries.push({path: relative, bytes: statSync(to).size, sha256: await sha256(to), role});
}

mkdirSync(temporary, {recursive: true});
try {
  await add(`renders/${verification.formats.landscape.file}`, 'YouTube/excape-Take-Me-There-YouTube-16x9.mp4', 'YouTube film', verification.formats.landscape.sha256);
  await add('publishing/excape-Take-Me-There-YouTube-Thumbnail-1920x1080.jpg', 'YouTube/thumbnail.jpg', 'YouTube thumbnail');
  await add('publishing/YouTube-Title.txt', 'YouTube/title.txt', 'YouTube title');
  await add('publishing/YouTube-Description.txt', 'YouTube/description.txt', 'YouTube description');
  await add(`renders/${verification.formats.portrait.file}`, 'TikTok/excape-Take-Me-There-TikTok-9x16.mp4', 'TikTok film', verification.formats.portrait.sha256);
  await add('publishing/excape-Take-Me-There-TikTok-Cover-Profile-1200x1600.jpg', 'TikTok/profile-cover.jpg', 'TikTok profile cover');
  await add('publishing/TikTok-Title.txt', 'TikTok/title.txt', 'TikTok title');
  await add('publishing/TikTok-Description.txt', 'TikTok/description.txt', 'TikTok description');
  await add('source/lyrics-preview-draft.srt', 'Captions/english.srt', 'Optional English captions');
  const captions = readFileSync(resolve(root, 'source/lyrics-preview-draft.srt'), 'utf8');
  const webvtt = captions.replace(/^(\d\d:\d\d:\d\d),(\d\d\d) --> (\d\d:\d\d:\d\d),(\d\d\d)$/gmu, '$1.$2 --> $3.$4');
  await addText('Captions/english.vtt', `WEBVTT\n\n${webvtt}`, 'Optional English captions');
  await addText('START-HERE.md', [
    '# excape. — TAKE ME THERE — Upload Kit',
    '',
    'Use the video, cover, title and description in each platform folder together. Both full-length films are 60 fps and preserve the original soundtrack. The Captions folder is optional.',
    '',
    'YouTube: 1920×1080 landscape video and thumbnail.',
    'TikTok: 1080×1920 vertical video and 1200×1600 portrait profile cover.',
    '',
    'The videos are an unofficial lyric edit of the original moving video by excape. Review the platform preview before posting. No platform upload is included in this package.',
    '',
    'Delivery-Manifest.json lists file identities. Run `shasum -a 256 -c SHA256SUMS.txt` in this folder to verify the package.',
    '',
  ].join('\n'), 'Posting guide');
  const manifest = {
    schema: 'take-me-there-upload-kit/v1', song: 'CPznmfSbAiE',
    revision: 'source-integrated-preview-v2', status: 'verified local delivery; not posted',
    sourceUrl: 'https://www.youtube.com/watch?v=CPznmfSbAiE',
    filmFrames: 8096, framesPerSecond: 60, files: entries,
  };
  const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
  writeFileSync(join(temporary, 'Delivery-Manifest.json'), manifestText, 'utf8');
  const checksumLines = [...entries, {path: 'Delivery-Manifest.json', sha256: await sha256(join(temporary, 'Delivery-Manifest.json'))}]
    .map(entry => `${entry.sha256}  ${entry.path}`);
  writeFileSync(join(temporary, 'SHA256SUMS.txt'), `${checksumLines.join('\n')}\n`, 'utf8');
  for (const entry of entries) assert.equal(await sha256(join(temporary, entry.path)), entry.sha256);
  renameSync(temporary, folder);
  console.log(JSON.stringify({status: 'packaged', folder: basename(folder), files: entries.length + 2,
    manifestSha256: await sha256(join(folder, 'Delivery-Manifest.json')),
    checksumsSha256: await sha256(join(folder, 'SHA256SUMS.txt'))}));
} catch (error) {
  rmSync(temporary, {recursive: true, force: true});
  throw error;
}
