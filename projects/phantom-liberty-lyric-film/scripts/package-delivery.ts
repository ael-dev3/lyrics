import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createReadStream, copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {basename, dirname, isAbsolute, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkCurrentProductionGate} from './render-gate.ts';

const root = fileURLToPath(new URL('../', import.meta.url)), approved = checkCurrentProductionGate();
const argument = process.argv.indexOf('--dest');
const specified = argument < 0 ? undefined : process.argv[argument + 1];
if (specified !== undefined && !isAbsolute(specified)) throw Error('--dest requires an absolute folder path');
const destination = specified ? resolve(specified) : resolve(root, 'archives/Phantom-Liberty-Upload-Kit');
if (existsSync(destination)) throw Error('Preserve the existing upload kit; this packager never overwrites a folder');
const read = <T>(path: string): T => JSON.parse(readFileSync(resolve(root, path), 'utf8')) as T;
const relativeDestination = relative(root, destination);
if (isAbsolute(relativeDestination) || relativeDestination === '..' || relativeDestination.startsWith('../')) {
  assert.equal(read<{desktopKitAuthorized: boolean}>('evidence/render-authorization.json').desktopKitAuthorized, true,
    'An external destination requires current Desktop-kit authorization');
}
const hash = async (path: string): Promise<string> => {const h = createHash('sha256'); for await (const b of createReadStream(path)) h.update(b as Buffer); return h.digest('hex');};
type Film = {file: string; sha256: string; width: number; height: number; fps: {numerator: number; denominator: number}; frameCount?: number;
  producerScript: string; producerSha256: string; dependencyHashes: Record<string, string>};
type Verified = {status: string; revision: string; sourceSha256: string; approvedInputHashes: Record<string, string>; rendererSha256: string; verifierSha256: string; encodedSceneReview: {file: string; sha256: string}; formats: {landscape: Film; portrait: Film}};
type Asset = {path: string; sha256: string};
type Assets = {status: string; revision: string; sourceSha256: string; approvedInputHashes: Record<string, string>; makerSha256: string; files: Asset[]; proofs?: Asset[]};
const verified = read<Verified>('evidence/final-verification.json');
assert.equal(verified.status, 'passed'); assert.equal(verified.revision, approved.revision);
assert.equal(verified.sourceSha256, approved.inputs['public/source.mp4']); assert.deepEqual(verified.approvedInputHashes, approved.inputs);
assert.equal(verified.rendererSha256, await hash(resolve(root, 'scripts/render-production.ts')));
assert.equal(verified.verifierSha256, await hash(resolve(root, 'scripts/verify-delivery.ts')));
assert.equal(verified.encodedSceneReview.file, 'evidence/encoded-scene-review.json');
assert.equal(verified.encodedSceneReview.sha256, await hash(resolve(root, verified.encodedSceneReview.file)));
const encoded = read<{status: string; revision: string; sourceSha256: string}>('evidence/encoded-scene-review.json');
assert.equal(encoded.status, 'passed'); assert.equal(encoded.revision, approved.revision); assert.equal(encoded.sourceSha256, verified.sourceSha256);
const covers = read<Assets>('publishing/cover-assets.json'), captions = read<Assets>('publishing/caption-assets.json');
for (const assets of [covers, captions]) {
  assert.equal(assets.revision, approved.revision); assert.equal(assets.sourceSha256, verified.sourceSha256);
  assert.deepEqual(assets.approvedInputHashes, approved.inputs);
}
assert.equal(covers.status, 'local-cover-review-passed'); assert.equal(covers.files.length, 2);
assert.equal(covers.makerSha256, await hash(resolve(root, 'scripts/make-covers.ts')));
assert.equal(captions.status, 'passed'); assert.equal(captions.files.length, 2);
assert.equal(captions.makerSha256, await hash(resolve(root, 'scripts/make-captions.ts')));
type Planned = {from: string; to: string; role: string; expected?: string};
const planned: Planned[] = [];
for (const format of ['landscape', 'portrait'] as const) {
  const film = verified.formats[format], platform = format === 'landscape' ? 'YouTube' : 'TikTok';
  assert.ok(film.producerScript === 'scripts/render-production.ts' ||
    (format === 'portrait' && film.producerScript === 'scripts/render-portrait-cached.ts'), 'Unknown verified producer');
  assert.equal(film.producerSha256, await hash(resolve(root, film.producerScript)), 'Verified producer changed');
  assert.equal(Object.keys(film.dependencyHashes).length, film.producerScript === 'scripts/render-production.ts' ? 1 : 2);
  assert.equal(film.dependencyHashes['scripts/render-production.ts'], verified.rendererSha256);
  for (const [file, digest] of Object.entries(film.dependencyHashes)) {
    assert.ok(['scripts/render-production.ts', 'scripts/cached-painter.ts'].includes(file), 'Unknown producer dependency');
    assert.equal(await hash(resolve(root, file)), digest, 'Verified producer dependency changed');
  }
  assert.equal(film.file, basename(film.file)); assert.match(film.file, /^Phantom-Liberty-.*\.mp4$/);
  assert.equal(film.width, format === 'landscape' ? 1920 : 1080); assert.equal(film.height, format === 'landscape' ? 816 : 1920);
  assert.deepEqual(film.fps, {numerator: 60000, denominator: 1001});
  planned.push({from: `renders/${film.file}`, to: `${platform}/${film.file}`, role: `Complete ${platform} film`, expected: film.sha256});
}
for (const cover of covers.files) planned.push({from: cover.path, to: `${cover.path.includes('TikTok') ? 'TikTok' : 'YouTube'}/${basename(cover.path)}`, role: 'Dedicated reviewed platform cover', expected: cover.sha256});
for (const caption of captions.files) planned.push({from: caption.path, to: `Captions/${basename(caption.path)}`, role: 'Optional complete English caption sidecar', expected: caption.sha256});
for (const platform of ['YouTube', 'TikTok']) for (const kind of ['Title', 'Description']) planned.push({from: `publishing/${platform}-${kind}.txt`, to: `${platform}/${kind.toLowerCase()}.txt`, role: `${platform} ${kind.toLowerCase()}`});
for (const path of ['evidence/final-verification.json', 'evidence/encoded-scene-review.json', 'publishing/cover-assets.json', 'publishing/caption-assets.json']) planned.push({from: path, to: `Verification/${basename(path)}`, role: 'Source identity and delivery checks'});
for (const proof of covers.proofs ?? []) planned.push({from: proof.path, to: `Verification/Cover-Review/${basename(proof.path)}`, role: 'Local profile-size and crop review proof', expected: proof.sha256});
const ready = await Promise.all(planned.map(async p => {
  assert.ok(!isAbsolute(p.from) && !p.from.split('/').includes('..') && !isAbsolute(p.to) && !p.to.split('/').includes('..'), 'Unsafe delivery path');
  const input = resolve(root, p.from), bytes = statSync(input).size, sha256 = await hash(input);
  assert.ok(bytes > 0, `Empty delivery input: ${p.from}`); if (p.expected) assert.equal(sha256, p.expected, `Verified input changed: ${p.from}`);
  return {...p, bytes, sha256};
}));
assert.deepEqual(checkCurrentProductionGate(), approved);
// Every production and asset identity is checked before creating a destination.
// Root runs the explicit Desktop destination only after verified workspace staging.
mkdirSync(destination, {recursive: true});
const entries: {path: string; bytes: number; sha256: string; role: string}[] = [];
for (const item of ready) {
  const target = join(destination, item.to); mkdirSync(dirname(target), {recursive: true}); copyFileSync(resolve(root, item.from), target);
  assert.equal(await hash(target), item.sha256, `Copied file changed: ${item.to}`);
  entries.push({path: item.to, bytes: item.bytes, sha256: item.sha256, role: item.role});
}
const guide = `# Phantom Liberty — Upload Kit\n\nThe YouTube and TikTok folders contain the complete recording, matching cover, title and description.\n\n- YouTube: 1920×816 native wide film at 60000/1001 fps (59.94); 1280×720 thumbnail.\n- TikTok: 1080×1920 portrait film at the same cadence; dedicated 1200×1600 (3:4) profile cover.\n- Both films preserve the original stereo AAC soundtrack and source zero. Original authored dark shots and the closing black frame remain intact.\n- Captions: optional English SRT/VTT with independent backing lyrics labelled. Precise word highlights already appear in the films, so enabling captions duplicates visible text.\n- Verification: final-file hashes, decoded scene/audio checks, cover dimensions and local crop proofs.\n\nInspect the actual platform cover crop before posting. The supplied profile proofs are local simulations. This is an unofficial lyric edition of the original CD PROJEKT RED music video; original credits are in each description. No platform upload or public full-media release has been performed.\n\nVerify this package from its folder with: shasum -a 256 -c SHA256SUMS.txt\n`;
writeFileSync(join(destination, 'START-HERE.md'), guide);
entries.push({path: 'START-HERE.md', bytes: Buffer.byteLength(guide), sha256: await hash(join(destination, 'START-HERE.md')), role: 'Posting guide'});
const manifest = {schemaVersion: 1, status: 'verified local upload kit; not posted', revision: approved.revision,
  sourceUrl: 'https://www.youtube.com/watch?v=u15tEo0wsQI', sourceSha256: verified.sourceSha256,
  formats: verified.formats, audio: 'Original unchanged AAC stereo, 44100 Hz', files: entries};
writeFileSync(join(destination, 'Delivery-Manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
const manifestSha256 = await hash(join(destination, 'Delivery-Manifest.json'));
writeFileSync(join(destination, 'SHA256SUMS.txt'), [...entries, {path: 'Delivery-Manifest.json', sha256: manifestSha256}].map(f => `${f.sha256}  ${f.path}`).join('\n') + '\n');
assert.deepEqual(checkCurrentProductionGate(), approved);
for (const item of ready) assert.equal(await hash(resolve(root, item.from)), item.sha256, `Source changed while packaging: ${item.from}`);
for (const entry of entries) assert.equal(await hash(join(destination, entry.path)), entry.sha256);
const receipt = {schemaVersion: 1, status: specified ? 'destination copy hash-verified' : 'workspace staging hash-verified; Desktop delivery pending',
  revision: approved.revision, sourceSha256: verified.sourceSha256, folderLabel: basename(destination), packagerSha256: await hash(fileURLToPath(import.meta.url)),
  manifestSha256, checksumsSha256: await hash(join(destination, 'SHA256SUMS.txt')), files: entries,
  scope: 'Verified local upload kit. Every film matches final-verification.json; every copied payload hash matches its input. No platform posting or public full-media release.'};
writeFileSync(resolve(root, 'evidence/delivery-receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({status: receipt.status, folderLabel: basename(destination), files: entries.length + 2}));
