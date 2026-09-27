import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, utimesSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {assertNoLocalPaths, assertRendererBinding, emptyDesktopSkeleton, makeDeterministicZip, rendererDigestFor, safeRelative, scanTar, scanZip} from './package-delivery.mjs';
import {PREVIEW_REVISION, PROJECT_ID} from './render-gate.mjs';

function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'leave-it-on-package-test-'));
  t.after(() => rmSync(dir, {recursive: true, force: true}));
  return dir;
}

function command(program, args, cwd) {
  const result = spawnSync(program, args, {cwd, encoding: 'utf8', env: {...process.env, COPYFILE_DISABLE:'1'}});
  assert.equal(result.status, 0, `${program}: ${result.stderr}`);
}

test('archive names are relative and cannot traverse the extraction root', () => {
  assert.equal(safeRelative('YouTube/title and description.txt'), 'YouTube/title and description.txt');
  for (const path of ['/absolute', '../escape', 'a/../b', 'a/./b', 'a\\b', 'C:/drive', 'a//b', 'a\nnext']) {
    assert.throws(() => safeRelative(path), path);
  }
});

test('existing Desktop layout is accepted only when all platform folders are empty', t => {
  const dir = fixture(t);
  assert.equal(emptyDesktopSkeleton(dir), true);
  for (const folder of ['YouTube', 'TikTok', 'Source & Verification']) mkdirSync(join(dir, folder));
  assert.equal(emptyDesktopSkeleton(dir), true);
  writeFileSync(join(dir, 'YouTube', 'owner-file.txt'), 'keep this');
  assert.throws(() => emptyDesktopSkeleton(dir), /not empty/);
});

test('source text rejects machine-local paths while allowing web links', t => {
  const dir = fixture(t);
  writeFileSync(join(dir, 'notes.txt'), 'https://farcaster.xyz/~/channel/warpkeep\n');
  assert.doesNotThrow(() => assertNoLocalPaths(dir));
  const homePath = ['','Users','example','private','audio.m4a'].join('/');
  writeFileSync(join(dir, 'notes.txt'), `Source: ${homePath}\n`);
  assert.throws(() => assertNoLocalPaths(dir), /machine-local/);
});

test('renderer parity and final receipt reject any changed renderer byte', async t => {
  const dir = fixture(t);
  mkdirSync(join(dir, 'review')); mkdirSync(join(dir, 'scripts'));
  writeFileSync(join(dir, 'review/render.html'), '<main>approved</main>\n');
  writeFileSync(join(dir, 'scripts/render-production.mjs'), 'export const frame = 1;\n');
  const digest = await rendererDigestFor(dir), inputDigest = 'frozen-preview-inputs';
  const parity = {projectId:PROJECT_ID, previewRevision:PREVIEW_REVISION, inputDigest, rendererDigest:digest, approved:true, formats:['landscape','portrait'], evidence:'native stills'};
  const receipt = {rendererDigest:digest, inputDigest, format:'landscape', mode:'production'};
  assert.doesNotThrow(() => assertRendererBinding(digest, parity, receipt, inputDigest, 'landscape'));
  writeFileSync(join(dir, 'review/render.html'), '<main>changed</main>\n');
  const changed = await rendererDigestFor(dir);
  assert.notEqual(changed, digest);
  assert.throws(() => assertRendererBinding(changed, parity, receipt, inputDigest, 'landscape'), /parity/);
  assert.throws(() => assertRendererBinding(digest, parity, {...receipt, rendererDigest:'0'.repeat(64)}, inputDigest, 'landscape'), /receipt/);
});

test('source ZIP bytes remain identical when original file mtimes differ', t => {
  const dir = fixture(t), source = join(dir, 'source');
  mkdirSync(source); mkdirSync(join(source, 'assets'));
  writeFileSync(join(source, 'README.md'), 'identical source\n');
  writeFileSync(join(source, 'assets/castle.glb'), Buffer.from([0,1,2,3]));
  const files = ['README.md','assets/castle.glb'], epoch = 1700000000;
  for (const path of files) utimesSync(join(source, path), new Date('2012-01-01'), new Date('2012-01-01'));
  const first = join(dir, 'first.zip'), second = join(dir, 'second.zip');
  makeDeterministicZip(source, first, files, epoch);
  for (const path of files) utimesSync(join(source, path), new Date('2032-01-01'), new Date('2032-01-01'));
  utimesSync(join(source, 'assets'), new Date('2032-01-01'), new Date('2032-01-01'));
  makeDeterministicZip(source, second, files, epoch);
  assert.deepEqual(readFileSync(first), readFileSync(second));
});

test('TAR scanner accepts committed-style regular files and rejects symlinks', t => {
  const dir = fixture(t), source = join(dir, 'tree');
  mkdirSync(source);
  writeFileSync(join(source, 'asset.txt'), 'known bytes\n');
  const good = join(dir, 'good.tar');
  command('tar', ['-cf', good, '-C', source, 'asset.txt']);
  assert.doesNotThrow(() => scanTar(good, ['asset.txt']));
  symlinkSync('asset.txt', join(source, 'asset-link'));
  const unsafe = join(dir, 'symlink.tar');
  command('tar', ['-cf', unsafe, '-C', source, 'asset-link']);
  assert.throws(() => scanTar(unsafe, ['asset-link']), /TAR symlink/);
});

test('ZIP scanner verifies bytes and rejects a stored symlink', t => {
  const dir = fixture(t), source = join(dir, 'tree');
  mkdirSync(source);
  const content = 'verified delivery\n';
  writeFileSync(join(source, 'description.txt'), content);
  const expected = {'description.txt': {sha256: createHash('sha256').update(content).digest('hex'), bytes: Buffer.byteLength(content)}};
  const good = join(dir, 'good.zip');
  command('zip', ['-q','-X',good,'description.txt'], source);
  assert.doesNotThrow(() => scanZip(good, expected));
  assert.throws(() => scanZip(good, {'description.txt': {...expected['description.txt'], bytes: 1}}), /ZIP contents or hashes differ/);
  symlinkSync('description.txt', join(source, 'description-link'));
  const unsafe = join(dir, 'symlink.zip');
  command('zip', ['-q','-y',unsafe,'description-link'], source);
  assert.throws(() => scanZip(unsafe, {'description-link': expected['description.txt']}), /ZIP symlink/);
  const traversal = join(dir, 'traversal.zip');
  command('python3', ['-c', 'import sys,zipfile; z=zipfile.ZipFile(sys.argv[1],"w"); z.writestr("../escape.txt","x"); z.close()', traversal]);
  assert.throws(() => scanZip(traversal, {}), /Unsafe ZIP path/);
});
