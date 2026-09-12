import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {asset, hashBytes, hashFile, OBSOLETE_EVIDENCE, OUTPUT_FILES, PROJECT, readRecord, record, RELEASE_FILES, RELEASE_TAG, stagedBytes, stagingFiles, validateCorrectedDelivery, VERSION, type Asset} from './stage-repo.ts';

const {production, outputAssets, reviewedFrameFiles, viewportProofFiles} = await validateCorrectedDelivery();
const repo = resolve(process.env.LYRICS_REPO ?? '../lyrics');
const git = (args: string[]) => execFileSync('git', ['-C', repo, ...args], {maxBuffer: 64 * 1024 * 1024});
const commit = git(['rev-parse', 'HEAD']).toString().trim();
const legal = ['LICENSE.md', 'AI-DISCLOSURE.md', 'CREDITS.md', 'LICENSES'];
assert.equal(git(['status', '--porcelain', '--untracked-files=all', '--', PROJECT, ...legal, 'README.md', 'assets/midnight-love-44.png']).toString().trim(), '', 'Stage and commit the finished project, README, screenshot and legal files before packaging');
for (const {source, target} of stagingFiles()) {
  assert.equal(hashBytes(git(['show', `${commit}:${PROJECT}/${target}`])), hashBytes(stagedBytes(source)), `Committed source is stale: ${target}. Run stage-repo.ts, then commit.`);
}
const committedPaths = new Set(git(['ls-tree', '-r', '--name-only', commit, '--', PROJECT]).toString().trim().split('\n'));
for (const file of OBSOLETE_EVIDENCE) assert(!committedPaths.has(`${PROJECT}/evidence/${file}`), `Remove obsolete evidence by staging before packaging: ${file}`);
assert.equal(hashBytes(git(['show', `${commit}:assets/midnight-love-44.png`])), await hashFile('evidence/youtube-final-44.png'), 'Commit the final decoded README screenshot');

const root = resolve('package/Midnight-Love-Complete-Production');
assert(!existsSync(root), 'Use a fresh package directory to avoid retaining stale assets');
assert(!existsSync('release') || readdirSync('release').length === 0, 'Use a fresh or empty release directory; old assets must not enter this release');
mkdirSync(root, {recursive: true}); mkdirSync('release', {recursive: true});
git(['archive', '--format=tar', `--output=${resolve('package/source.tar')}`, commit, PROJECT]);
execFileSync('tar', ['-xf', 'package/source.tar', '--strip-components=2', '-C', root]);
for (const dir of ['source', 'public', 'analysis', 'output', 'evidence/encoded', 'evidence/viewport-proof']) mkdirSync(join(root, dir), {recursive: true});
for (const file of ['original.mkv', 'soundtrack.opus', 'original.en-orig.json3']) cpSync('source/' + file, join(root, 'source', file));
cpSync('source.json', join(root, 'source/source-metadata.json'));
for (const file of ['source-video.webm', 'soundtrack.m4a']) cpSync('public/' + file, join(root, 'public', file));
cpSync('analysis/stems', join(root, 'analysis/stems'), {recursive: true});
cpSync('analysis/bands-dbfs.f32', join(root, 'analysis/bands-dbfs.f32'));
for (const expected of outputAssets) {
  const out = join(root, 'output', expected.file); cpSync('output/' + expected.file, out);
  assert.equal(await hashFile(out), expected.sha256, `Delivery changed during packaging: ${expected.file}`);
}
for (const file of reviewedFrameFiles) cpSync(file, join(root, file));
for (const file of viewportProofFiles) cpSync(file, join(root, file));
writeFileSync(join(root, 'SOURCE-REVISION.txt'), commit + '\n');
// Export licensing from the same immutable commit, never from a dirty worktree.
for (const file of legal.filter(file => file !== 'LICENSES')) writeFileSync(join(root, 'REPOSITORY-' + file), git(['show', `${commit}:${file}`]));
for (const file of git(['ls-tree', '-r', '--name-only', commit, '--', 'LICENSES']).toString().trim().split('\n').filter(Boolean)) {
  const out = join(root, file); mkdirSync(dirname(out), {recursive: true}); writeFileSync(out, git(['show', `${commit}:${file}`]));
}
const sourceManifest = readRecord('source.json'); assert(Array.isArray(sourceManifest.files));
for (const value of sourceManifest.files) {
  const file = record(value); assert(typeof file.path === 'string' && typeof file.sha256 === 'string');
  const path = join(root, file.path);
  assert(existsSync(path), `A declared reproduction dependency is missing from the package: ${file.path}`);
  assert.equal(await hashFile(path), file.sha256, `Packaged source does not match source.json: ${file.path}`);
}
const files: string[] = [];
const walk = (directory: string) => {
  for (const entry of readdirSync(directory, {withFileTypes: true})) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path); else {assert(entry.isFile(), `Unexpected non-regular package entry: ${path}`); files.push(path);}
  }
};
walk(root);
const entries = [];
for (const path of files.sort()) entries.push({path: relative(root, path), bytes: statSync(path).size, sha256: await hashFile(path)});
writeFileSync(join(root, 'MANIFEST.json'), JSON.stringify({sourceCommit: commit, ...production, files: entries}, null, 2));
writeFileSync(join(root, 'CHECKSUMS.sha256'), entries.map(entry => `${entry.sha256}  ${entry.path}\n`).join(''));
execFileSync('zip', ['-q', '-r', '-6', resolve('release/Midnight-Love-Complete-Production.zip'), 'Midnight-Love-Complete-Production'], {cwd: resolve('package')});
execFileSync('unzip', ['-tq', 'release/Midnight-Love-Complete-Production.zip']);
for (const file of OUTPUT_FILES) cpSync('output/' + file, 'release/' + file);
cpSync('source/original.mkv', 'release/Midnight-Love-Original-Source.mkv');
cpSync('analysis/cover-prompts.json', 'release/Midnight-Love-Cover-Prompts.json');
assert.deepEqual(readdirSync('release').sort(), [...RELEASE_FILES].sort());
const releaseAssets: Asset[] = [];
for (const file of [...RELEASE_FILES].sort()) releaseAssets.push(await asset('release/' + file, file));
for (const expected of outputAssets) assert.equal(releaseAssets.find(item => item.file === expected.file)?.sha256, expected.sha256, `Release movie/copy changed: ${expected.file}`);
writeFileSync('release/CHECKSUMS.sha256', releaseAssets.map(entry => `${entry.sha256}  ${entry.file}\n`).join(''));
writeFileSync('release/release-assets.json', JSON.stringify({sourceCommit: commit, ...production, assets: releaseAssets}, null, 2));
console.log({version: VERSION, releaseTag: RELEASE_TAG, sourceCommit: commit, productionFiles: entries.length, releaseAssets: releaseAssets.length + 2});
