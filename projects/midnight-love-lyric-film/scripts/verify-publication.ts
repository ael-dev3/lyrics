import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync, readdirSync, statSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {hashBytes, hashFile, readRecord, record, RELEASE_FILES, RELEASE_TAG, RELEASE_URL, validateCorrectedDelivery} from './stage-repo.ts';

// Local-only verification: the caller first downloads the release assets and
// public README/image/tag response. This script never uploads or edits GitHub.
const {production, outputAssets} = await validateCorrectedDelivery();
const inventory = readRecord('release/release-assets.json');
assert(typeof inventory.sourceCommit === 'string' && /^[a-f0-9]{40}$/.test(inventory.sourceCommit));
const sourceCommit = inventory.sourceCommit;
for (const [key, value] of Object.entries(production)) assert.equal(inventory[key], value, `Wrong release edition or render: ${key}`);
assert(Array.isArray(inventory.assets));
const declared = inventory.assets.map(value => {
  const entry = record(value);
  assert(typeof entry.file === 'string' && typeof entry.sha256 === 'string' && /^[a-f0-9]{64}$/.test(entry.sha256) && typeof entry.bytes === 'number');
  return {file: entry.file, sha256: entry.sha256, bytes: entry.bytes};
});
assert.deepEqual(declared.map(entry => entry.file).sort(), [...RELEASE_FILES].sort());
assert.equal(readFileSync('release/CHECKSUMS.sha256', 'utf8'), [...declared].sort((a, b) => a.file < b.file ? -1 : a.file > b.file ? 1 : 0).map(entry => `${entry.sha256}  ${entry.file}\n`).join(''), 'Release checksums do not match the inventory');
const expectedFiles = [...RELEASE_FILES, 'CHECKSUMS.sha256', 'release-assets.json'].sort();
assert.deepEqual(readdirSync('release').sort(), expectedFiles, 'Unexpected local release assets');
assert.deepEqual(readdirSync('remote-verified').sort(), expectedFiles, 'Download every asset into a fresh remote-verified directory');
const assets = [];
for (const name of expectedFiles) {
  const local = await hashFile('release/' + name), remote = await hashFile('remote-verified/' + name);
  assert.equal(local, remote, `Remote bytes differ: ${name}`);
  const bytes = statSync('remote-verified/' + name).size;
  assert.equal(statSync('release/' + name).size, bytes);
  const entry = declared.find(entry => entry.file === name);
  if (entry) {assert.equal(entry.sha256, local); assert.equal(entry.bytes, bytes);}
  const output = outputAssets.find(entry => entry.file === name);
  if (output) assert.equal(output.sha256, local, `Release does not contain the current reviewed ${name}`);
  assets.push({name, bytes, sha256: remote, matchedAfterDownload: true, url: `https://github.com/ael-dev3/lyrics/releases/download/${RELEASE_TAG}/${encodeURIComponent(name)}`});
}
const repo = resolve(process.env.LYRICS_REPO ?? '../lyrics');
const git = (args: string[]) => execFileSync('git', ['-C', repo, ...args], {maxBuffer: 16 * 1024 * 1024});
const readmeCommit = git(['rev-parse', 'HEAD']).toString().trim();
git(['merge-base', '--is-ancestor', sourceCommit, readmeCommit]);
assert.equal(git(['status', '--porcelain', '--', 'README.md', 'assets/midnight-love-44.png']).toString().trim(), '', 'Commit and push the public README and screenshot before verifying their remote bytes');
const committedReadme = git(['show', `${readmeCommit}:README.md`]);
const committedScreenshot = git(['show', `${readmeCommit}:assets/midnight-love-44.png`]);
assert.equal(await hashFile('evidence/readme-remote.md'), hashBytes(committedReadme), 'Downloaded public README differs from its recorded commit');
assert.equal(await hashFile('evidence/readme-screenshot-remote.png'), hashBytes(committedScreenshot), 'Downloaded screenshot differs from its recorded commit');
assert.equal(hashBytes(committedScreenshot), await hashFile('evidence/youtube-final-44.png'), 'The public screenshot is not the current decoded final frame');
assert.equal(await hashFile(join(repo, 'README.md')), hashBytes(committedReadme));
const tag = readRecord('evidence/release-tag-remote.json');
assert.equal(tag.ref, `refs/tags/${RELEASE_TAG}`, 'Downloaded tag response names the wrong edition');
let object = record(tag.object);
const tagObjects: {sha: string; file: string}[] = [];
while (object.type === 'tag') {
  const sha = object.sha; assert(typeof sha === 'string' && /^[a-f0-9]{40}$/.test(sha));
  assert(tagObjects.length < 8 && !tagObjects.some(item => item.sha === sha), 'Invalid annotated tag chain');
  const file = `evidence/release-tag-object-${sha}-remote.json`;
  assert(existsSync(file), `Annotated tag: save the GitHub API response for /repos/ael-dev3/lyrics/git/tags/${sha} to ${file}, then rerun`);
  const annotated = readRecord(file); assert.equal(annotated.sha, sha); tagObjects.push({sha, file}); object = record(annotated.object);
}
assert.equal(object.type, 'commit'); assert.equal(object.sha, sourceCommit, 'Release tag does not point at the packaged source commit');
writeFileSync('evidence/release-upload-verification.json', JSON.stringify({release: RELEASE_URL, ...production, sourceCommit, readmeCommit,
  tagCommitObservedViaGitHubAPI: object.sha, annotatedTagObjects: tagObjects, assets,
  publicReadmeMatchesCommittedSource: true, publicScreenshotMatchesDecodedFrame: true,
  localInventorySha256: await hashFile('release/release-assets.json'),
  cinematicPixelVerificationSha256: await hashFile('evidence/cinematic-pixel-verification.json'),
  limits: 'Verifies the locally downloaded GitHub bytes and recorded API response, not playback on YouTube/TikTok or continued future availability.'}, null, 2));
console.log({assets: assets.length, allRemoteHashesMatched: true, publicReadmeAndScreenshotMatched: true, sourceCommit, readmeCommit, ...production});
