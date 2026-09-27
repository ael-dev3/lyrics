/** Package verified social videos, the explicit publishing kit, and editable source.
 *
 * Run only after the final project source commit and both production receipts exist.
 * The source ZIP is built from that exact Git tree, with every ignored local file in
 * the frozen preview identity restored at its verified hash. This script never
 * uploads or publishes anything.
 */
import {createHash, randomBytes} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createReadStream, existsSync, lstatSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, rmdirSync, rmSync, utimesSync, writeFileSync, copyFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {basename, dirname, extname, isAbsolute, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildIdentity, LOCKED_SOURCE_SHA256, PREVIEW_REVISION, PROJECT_ID} from './render-gate.mjs';

const project = resolve(fileURLToPath(new URL('..', import.meta.url)));
const shaPattern = /^[0-9a-f]{64}$/;
const hexCommit = /^[0-9a-f]{40}$/;
const forbiddenSegments = new Set(['node_modules', '.venv', 'model-cache', '__pycache__', 'stems', 'output', '.git']);
const textExtensions = new Set(['.cjs','.css','.html','.js','.json','.md','.mjs','.py','.srt','.svg','.ts','.tsx','.txt']);
const localPathPattern = /(?:\/Users\/[^/\s]+\/|\/home\/[^/\s]+\/|\/private\/(?:tmp|var)\/|file:\/\/\/)/i;
const rendererInputs = ['review/render.html', 'scripts/render-production.mjs'];

function parseArgs(argv) {
  const flags = new Set(['--youtube', '--tiktok', '--kit-dir', '--source-commit', '--desktop-dir']);
  if (argv.length !== flags.size * 2) throw Error('Usage: node scripts/package-delivery.mjs --youtube FILE.mp4 --tiktok FILE.mp4 --kit-dir DIR --source-commit FULL_SHA --desktop-dir DESKTOP_FOLDER');
  const result = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (!flags.has(argv[i]) || result[argv[i]] !== undefined || !argv[i + 1] || argv[i + 1].startsWith('--')) throw Error(`Unknown, repeated, or missing delivery argument: ${argv[i]}`);
    result[argv[i]] = argv[i + 1];
  }
  if (Object.keys(result).length !== flags.size) throw Error('All five delivery arguments are required.');
  return result;
}

function run(program, args, cwd = project, maxBuffer = 32 * 1024 * 1024, env = process.env) {
  const result = spawnSync(program, args, {cwd, encoding: 'utf8', maxBuffer, env});
  if (result.error || result.status !== 0) throw Error(`${program} failed: ${(result.stderr || result.error?.message || result.stdout || '').slice(-4000)}`);
  return result.stdout.trim();
}

function safeRelative(path) {
  if (typeof path !== 'string' || !path || isAbsolute(path) || path.startsWith('/') || path.includes('\\') || path.includes('\0') || /^[A-Za-z]:/.test(path)) throw Error(`Unsafe archive path: ${String(path)}`);
  const parts = path.split('/');
  if (parts.some(part => !part || part === '.' || part === '..' || /[\x00-\x1f]/.test(part))) throw Error(`Unsafe archive path: ${path}`);
  return path;
}

function assertRegular(path, label) {
  const stat = lstatSync(path);
  if (!stat.isFile() || stat.isSymbolicLink()) throw Error(`${label} must be a regular file: ${path}`);
  return stat;
}

function assertUnder(path, directory, label) {
  const rel = relative(directory, path);
  if (!rel || rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw Error(`${label} must live inside ${directory}: ${path}`);
}

function assertCleanTree(tree) {
  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      const stat = lstatSync(path);
      if (stat.isSymbolicLink()) throw Error(`Package tree contains a symlink: ${path}`);
      if (stat.isDirectory()) walk(path);
      else if (!stat.isFile()) throw Error(`Package tree contains a special file: ${path}`);
    }
  }
  walk(tree);
}

function assertNoLocalPaths(tree) {
  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      const stat = lstatSync(path);
      if (stat.isDirectory()) walk(path);
      else if (stat.isFile() && textExtensions.has(extname(path).toLowerCase()) && localPathPattern.test(readFileSync(path, 'utf8'))) {
        throw Error(`A packaged text file contains a machine-local absolute path: ${relative(tree, path)}`);
      }
    }
  }
  walk(tree);
}

function normalizeMtimes(tree, epochSeconds) {
  if (!Number.isSafeInteger(epochSeconds) || epochSeconds < 315532800) throw Error('Invalid source-commit timestamp for ZIP normalization.');
  const time = new Date(epochSeconds * 1000);
  function walk(dir) {
    for (const entry of readdirSync(dir).sort()) {
      const path = join(dir, entry);
      const stat = lstatSync(path);
      if (stat.isSymbolicLink()) throw Error(`ZIP staging symlink refused: ${path}`);
      if (stat.isDirectory()) walk(path);
      else if (!stat.isFile()) throw Error(`ZIP staging special file refused: ${path}`);
      utimesSync(path, time, time);
    }
    utimesSync(dir, time, time);
  }
  walk(tree);
}

function makeDeterministicZip(tree, zip, paths, epochSeconds) {
  if (!Array.isArray(paths) || !paths.length || new Set(paths).size !== paths.length) throw Error('ZIP file inventory must be nonempty and unique.');
  for (const path of paths) safeRelative(path);
  normalizeMtimes(tree, epochSeconds);
  run('zip', ['-q','-X',zip,...paths.slice().sort()], tree, 32 * 1024 * 1024, {...process.env, TZ:'UTC', COPYFILE_DISABLE:'1'});
}

function emptyDesktopSkeleton(directory) {
  if (!existsSync(directory)) return false;
  const stat = lstatSync(directory);
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw Error(`Desktop destination is not an ordinary directory: ${directory}`);
  const allowed = new Set(['YouTube', 'TikTok', 'Source & Verification']);
  for (const entry of readdirSync(directory)) {
    if (!allowed.has(entry)) throw Error(`Desktop destination already contains user content: ${entry}`);
    const child = join(directory, entry);
    const childStat = lstatSync(child);
    if (!childStat.isDirectory() || childStat.isSymbolicLink() || readdirSync(child).length) throw Error(`Desktop destination subfolder is not empty: ${child}`);
  }
  return true;
}

async function shaFile(path) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}

async function rendererDigestFor(root) {
  const parts = [];
  for (const rel of rendererInputs) {
    const path = join(root, rel);
    assertRegular(path, `Renderer input ${rel}`);
    parts.push(`${rel}\0${await shaFile(path)}`);
  }
  return createHash('sha256').update(parts.join('\n')).digest('hex');
}

function assertRendererBinding(digest, parity, receipt, inputDigest, format) {
  if (!shaPattern.test(digest) || parity?.projectId !== PROJECT_ID || parity.previewRevision !== PREVIEW_REVISION || parity.inputDigest !== inputDigest || parity.rendererDigest !== digest || parity.approved !== true || !['landscape','portrait'].every(item => parity.formats?.includes(item)) || !parity.evidence) throw Error('Current renderer bytes do not match approved both-format parity.');
  if (receipt?.rendererDigest !== digest || receipt.inputDigest !== inputDigest || receipt.format !== format || receipt.mode !== 'production') throw Error(`${format} final render receipt does not match the approved renderer bytes.`);
}

async function descriptor(path) {
  const stat = assertRegular(path, 'Delivery input');
  return {sha256: await shaFile(path), bytes: stat.size};
}

function publicDescriptor(value) {
  if (!value || !shaPattern.test(value.sha256) || !Number.isSafeInteger(value.bytes) || value.bytes < 0) throw Error('Invalid public delivery descriptor.');
  return {sha256:value.sha256, bytes:value.bytes};
}

async function assertDescriptor(path, expected, label) {
  if (!expected || !shaPattern.test(expected.sha256) || !Number.isSafeInteger(expected.bytes) || expected.bytes < 0) throw Error(`Invalid expected hash/size for ${label}`);
  const actual = await descriptor(path);
  if (actual.sha256 !== expected.sha256 || actual.bytes !== expected.bytes) throw Error(`${label} differs from its recorded bytes: ${path}`);
  return actual;
}

function readJson(path) { return JSON.parse(readFileSync(path, 'utf8')); }

function gitEntries(treeRef) {
  const result = spawnSync('git', ['ls-tree', '--full-tree', '-r', '-z', treeRef], {cwd: project, encoding: 'buffer', maxBuffer: 32 * 1024 * 1024});
  if (result.error || result.status !== 0) throw Error(`git ls-tree failed: ${result.stderr?.toString() || result.error?.message}`);
  const entries = result.stdout.toString('utf8').split('\0').filter(Boolean).map(row => {
    const tab = row.indexOf('\t');
    if (tab < 0) throw Error('Malformed Git tree entry.');
    const [mode, type] = row.slice(0, tab).split(' ');
    const path = safeRelative(row.slice(tab + 1));
    if (mode !== '100644' && mode !== '100755' || type !== 'blob') throw Error(`Symlink, submodule, or special Git entry refused: ${path} (${mode})`);
    if (path.split('/').some(segment => forbiddenSegments.has(segment)) || /\.(?:pt|pth|ckpt|onnx|safetensors)$/i.test(path)) throw Error(`Committed cache, model, or intermediate refused: ${path}`);
    return path;
  });
  if (entries.length < 30 || new Set(entries).size !== entries.length) throw Error('The committed project tree is missing or contains duplicate paths.');
  return entries;
}

function scanTar(tar, expectedPaths) {
  const scanner = String.raw`
import sys,tarfile,posixpath,json
archive,expected=sys.argv[1:3]
expected=set(json.load(open(expected)))
seen=set()
with tarfile.open(archive,'r:') as tf:
 for m in tf.getmembers():
  n=m.name.rstrip('/')
  if not n or n.startswith('/') or '\\' in n or any(p in ('','.','..') for p in n.split('/')) or ':' in n.split('/')[0]: raise SystemExit('Unsafe TAR path: '+m.name)
  if not (m.isfile() or m.isdir()): raise SystemExit('TAR symlink, link, or special entry: '+m.name)
  if m.isfile():
   if n in seen: raise SystemExit('Duplicate TAR file: '+n)
   seen.add(n)
if seen!=expected: raise SystemExit('TAR file inventory differs from committed Git tree: '+str((len(seen),len(expected))))
print(len(seen))`;
  const expectedFile = `${tar}.expected.json`;
  writeFileSync(expectedFile, JSON.stringify(expectedPaths));
  run('python3', ['-c', scanner, tar, expectedFile]);
}

function scanZip(zip, expected) {
  const scanner = String.raw`
import sys,zipfile,hashlib,json,stat
archive,expected_path=sys.argv[1:3]
expected=json.load(open(expected_path));seen={}
with zipfile.ZipFile(archive) as z:
 for item in z.infolist():
  n=item.filename.rstrip('/')
  if not n or n.startswith('/') or '\\' in n or any(p in ('','.','..') for p in n.split('/')) or ':' in n.split('/')[0]: raise SystemExit('Unsafe ZIP path: '+item.filename)
  mode=item.external_attr>>16
  if stat.S_ISLNK(mode): raise SystemExit('ZIP symlink refused: '+n)
  if item.is_dir():
   if mode and not stat.S_ISDIR(mode): raise SystemExit('Invalid ZIP directory type: '+n)
   continue
  if mode and not stat.S_ISREG(mode): raise SystemExit('ZIP special entry refused: '+n)
  if n in seen: raise SystemExit('Duplicate ZIP entry: '+n)
  data=z.read(item)
  seen[n]={'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)}
if seen!=expected: raise SystemExit('ZIP contents or hashes differ from staging inventory: '+str((len(seen),len(expected))))
print(len(seen))`;
  const expectedFile = `${zip}.expected.json`;
  writeFileSync(expectedFile, JSON.stringify(expected));
  run('python3', ['-c', scanner, zip, expectedFile]);
}

async function inventory(tree) {
  const files = {};
  async function walk(dir, rel = '') {
    for (const entry of readdirSync(dir).sort()) {
      const next = rel ? `${rel}/${entry}` : entry;
      safeRelative(next);
      const path = join(dir, entry);
      const stat = lstatSync(path);
      if (stat.isSymbolicLink()) throw Error(`Package tree contains symlink: ${next}`);
      if (stat.isDirectory()) await walk(path, next);
      else if (stat.isFile()) files[next] = await descriptor(path);
      else throw Error(`Package tree contains special file: ${next}`);
    }
  }
  await walk(tree);
  return files;
}

async function copyVerified(source, destination, expected) {
  mkdirSync(dirname(destination), {recursive: true});
  if (existsSync(destination)) throw Error(`Destination already exists: ${destination}`);
  copyFileSync(source, destination);
  await assertDescriptor(destination, expected, 'Copied file');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const commit = args['--source-commit'];
  if (!hexCommit.test(commit)) throw Error('--source-commit must be a full 40-character lowercase Git commit SHA.');
  const repo = run('git', ['rev-parse', '--show-toplevel']);
  const prefix = relative(repo, project).split(sep).join('/');
  safeRelative(prefix);
  if (run('git', ['rev-parse', 'HEAD']) !== commit || run('git', ['rev-parse', '--verify', `${commit}^{commit}`]) !== commit) throw Error('Source commit must be the current, committed HEAD.');
  if (run('git', ['diff', '--name-only', commit, '--', prefix], repo)) throw Error('Tracked project changes exist after the source commit.');
  const commitEpoch = Number(run('git', ['show', '-s', '--format=%ct', commit], repo));
  const treeRef = `${commit}:${prefix}`;
  const committed = gitEntries(treeRef);
  for (const required of ['README.md','package-lock.json','scripts/render-production.mjs','scripts/package-delivery.mjs','review/render.html','review/preview-identity.json','review/owner-acceptance.json','review/render-parity.json']) {
    if (!committed.includes(required)) throw Error(`Committed source lacks ${required}`);
  }

  const frozen = readJson(join(project, 'review/preview-identity.json'));
  const accepted = readJson(join(project, 'review/owner-acceptance.json'));
  const current = await buildIdentity(project);
  if (frozen.projectId !== PROJECT_ID || frozen.previewRevision !== PREVIEW_REVISION || frozen.inputDigest !== current.inputDigest || JSON.stringify(frozen.files) !== JSON.stringify(current.files)) throw Error('Frozen preview identity differs from current inputs.');
  if (accepted.accepted !== true || accepted.inputDigest !== frozen.inputDigest || accepted.scope !== 'both-aspect-production-render') throw Error('Current owner acceptance is absent or stale.');
  const currentRendererDigest = await rendererDigestFor(project);
  const parity = readJson(join(project, 'review/render-parity.json'));

  const youtube = resolve(args['--youtube']);
  const tiktok = resolve(args['--tiktok']);
  const kitDir = resolve(args['--kit-dir']);
  const desktop = resolve(args['--desktop-dir']);
  if (youtube === tiktok) throw Error('YouTube and TikTok videos must be distinct files.');
  const videoEvidence = {};
  const archivalMasters = [];
  for (const [format, path] of [['landscape', youtube], ['portrait', tiktok]]) {
    assertUnder(realpathSync(path), join(project, 'output'), `${format} production video`);
    assertRegular(path, `${format} production video`);
    if (!path.endsWith('.mp4')) throw Error(`${format} delivery must be an MP4.`);
    const receipt = readJson(`${path}.json`);
    if (receipt.projectId !== PROJECT_ID || receipt.previewRevision !== PREVIEW_REVISION || receipt.mode !== 'production' || receipt.format !== format || receipt.inputDigest !== frozen.inputDigest || receipt.postingMp4?.path !== path) throw Error(`${format} production receipt is missing or stale.`);
    assertRendererBinding(currentRendererDigest, parity, receipt, frozen.inputDigest, format);
    await assertDescriptor(path, receipt.postingMp4, `${format} production video`);
    const archive = resolve(receipt.sourceOpusArchive?.path || '');
    if (archive !== path.replace(/\.mp4$/, '.source-opus.mkv')) throw Error(`${format} original-Opus master has an unexpected name.`);
    assertUnder(realpathSync(archive), join(project, 'output'), `${format} original-Opus master`);
    await assertDescriptor(archive, receipt.sourceOpusArchive, `${format} original-Opus master`);
    const verificationPath = join(project, 'output', `verification-${format}.json`);
    const verification = readJson(verificationPath);
    const verifiedPostingPath = relative(project, path).split(sep).join('/');
    const verifiedArchivePath = relative(project, archive).split(sep).join('/');
    if (verification.projectId !== PROJECT_ID || verification.previewRevision !== PREVIEW_REVISION || verification.inputDigest !== frozen.inputDigest || verification.format !== format || verification.decodedCompletely !== true || verification.geometryCadenceColorAndAudioVerified !== true || ![path, verifiedPostingPath].includes(verification.postingMp4?.path) || verification.postingMp4.sha256 !== receipt.postingMp4.sha256 || verification.postingMp4.bytes !== receipt.postingMp4.bytes || ![archive, verifiedArchivePath].includes(verification.sourceOpusArchive?.path) || verification.sourceOpusArchive.sha256 !== receipt.sourceOpusArchive.sha256 || verification.sourceOpusArchive.bytes !== receipt.sourceOpusArchive.bytes) throw Error(`${format} final decode/metadata verification is absent or stale.`);
    archivalMasters.push(archive);
    videoEvidence[format] = {
      deliveryFile:`${format === 'landscape' ? 'YouTube' : 'TikTok'}/${basename(path)}`,
      postingMp4:{sha256:receipt.postingMp4.sha256, bytes:receipt.postingMp4.bytes},
      originalOpusMaster:{deliveryFile:`Source & Verification/${basename(archive)}`, sha256:receipt.sourceOpusArchive.sha256, bytes:receipt.sourceOpusArchive.bytes},
      renderReceiptSha256:await shaFile(`${path}.json`),
      verificationReportSha256:await shaFile(verificationPath),
      dimensions:verification.dimensions, fps:verification.fps, frames:verification.frames,
      videoDuration:verification.videoDuration,
      decodedCompletely:true, geometryCadenceColorAndAudioVerified:true,
      originalOpusPacketIdentity:JSON.stringify(verification.sourceOpusPackets)===JSON.stringify(verification.archiveOpusPackets)
    };
    if (!videoEvidence[format].originalOpusPacketIdentity) throw Error(`${format} original Opus packet verification differs.`);
  }
  assertUnder(realpathSync(kitDir), project, 'Publishing kit');
  const kitManifestPath = join(kitDir, 'KIT-MANIFEST.json');
  assertRegular(kitManifestPath, 'Publishing kit manifest');
  const kitManifest = readJson(kitManifestPath);
  if (kitManifest.schemaVersion !== 1 || !Array.isArray(kitManifest.files) || kitManifest.files.length < 4) throw Error('Publishing kit manifest is incomplete.');
  const kitFiles = new Map();
  for (const entry of kitManifest.files) {
    const rel = safeRelative(entry.path);
    if (kitFiles.has(rel) || rel === 'KIT-MANIFEST.json') throw Error(`Duplicate or self-referential kit path: ${rel}`);
    const file = join(kitDir, rel);
    assertUnder(realpathSync(file), kitDir, 'Publishing kit file');
    await assertDescriptor(file, entry, `Publishing kit ${rel}`);
    kitFiles.set(rel, {path:file, sha256:entry.sha256, bytes:entry.bytes});
  }
  const kitRel = relative(project, kitDir).split(sep).join('/');
  for (const rel of ['KIT-MANIFEST.json', ...kitFiles.keys()]) if (!committed.includes(`${kitRel}/${rel}`)) throw Error(`Publishing kit file is absent from source commit: ${rel}`);

  const existingSkeleton = emptyDesktopSkeleton(desktop);
  if (!existsSync(dirname(desktop)) || !lstatSync(dirname(desktop)).isDirectory()) throw Error('Desktop destination parent is missing or not a directory.');
  const temp = mkdtempSync(join(tmpdir(), 'leave-it-on-package-'));
  const desktopStage = join(dirname(desktop), `.leave-it-on-package-${randomBytes(8).toString('hex')}`);
  let published = false;
  try {
    const tar = join(temp, 'committed-source.tar');
    run('git', ['archive', '--format=tar', `--output=${tar}`, treeRef], repo);
    scanTar(tar, committed);
    const sourceTree = join(temp, 'source');
    mkdirSync(sourceTree);
    run('tar', ['-xf', tar, '-C', sourceTree]);
    assertCleanTree(sourceTree);
    if (await rendererDigestFor(sourceTree) !== currentRendererDigest) throw Error('Committed source archive contains different renderer bytes from approved parity.');

    // Git intentionally omits local source audio and GLBs. Restore exactly the
    // files bound by the approved preview identity, including superseded assets.
    for (const [rel, expected] of Object.entries(frozen.files)) {
      safeRelative(rel);
      const archived = join(sourceTree, rel);
      if (!existsSync(archived)) {
        if (!rel.startsWith('source/') && !rel.startsWith('public/assets/')) throw Error(`A non-media frozen input is absent from the committed tree: ${rel}`);
        const local = join(project, rel);
        await assertDescriptor(local, expected, `Frozen local input ${rel}`);
        mkdirSync(dirname(archived), {recursive: true});
        copyFileSync(local, archived);
      }
      await assertDescriptor(archived, expected, `Archived frozen input ${rel}`);
    }
    if (frozen.files['source/Leave It On.m4a']?.sha256 !== LOCKED_SOURCE_SHA256 || !frozen.files['source/leave-it-on.opus.webm']) throw Error('Original and playback audio are absent from frozen inputs.');
    const pr375 = readJson(join(sourceTree, 'source/asset-provenance/pr375/manifest.json'));
    if (pr375.ref !== '75934520a8dc295c8b68d4c8c197785299e2ff0b' || pr375.assets?.length !== 9) throw Error('Unexpected PR #375 asset manifest.');
    for (const asset of pr375.assets) {
      const rel = safeRelative(`public/${asset.path}`);
      await assertDescriptor(join(sourceTree, rel), asset, `PR #375 asset ${rel}`);
    }
    // The source archive must also contain the same finalized publishing copy.
    for (const [rel, file] of kitFiles) await assertDescriptor(join(sourceTree, kitRel, rel), file, `Committed kit ${rel}`);
    await assertDescriptor(join(sourceTree, kitRel, 'KIT-MANIFEST.json'), await descriptor(kitManifestPath), 'Committed kit manifest');

    const revision = {
      repository:'https://github.com/ael-dev3/lyrics', project:prefix, commit,
      previewRevision:PREVIEW_REVISION, inputDigest:frozen.inputDigest,
      rendererDigest:currentRendererDigest,
      originalAudioSha256:LOCKED_SOURCE_SHA256,
      gameAssetCommit:pr375.ref,
      note:'Git-committed source plus exact frozen local media. Publication/upload receipt is added later and is outside this immutable archive.'
    };
    writeFileSync(join(sourceTree, 'SOURCE-REVISION.json'), `${JSON.stringify(revision, null, 2)}\n`);
    assertNoLocalPaths(sourceTree);
    const sourceFiles = await inventory(sourceTree);
    writeFileSync(join(sourceTree, 'PACKAGE-CHECKSUMS.sha256'), Object.entries(sourceFiles).sort(([a],[b]) => a.localeCompare(b)).map(([rel, data]) => `${data.sha256}  ${rel}`).join('\n') + '\n');
    const archivedFiles = await inventory(sourceTree);
    const zip = join(temp, `Leave-It-On-Warpkeep-Source-${commit.slice(0,12)}.zip`);
    makeDeterministicZip(sourceTree, zip, Object.keys(archivedFiles), commitEpoch);
    run('unzip', ['-tq', zip]);
    scanZip(zip, archivedFiles);

    mkdirSync(desktopStage);
    const deliveryFiles = {};
    async function add(source, rel, expected = null) {
      safeRelative(rel);
      const supplied = expected || await descriptor(source);
      const digest = publicDescriptor(supplied);
      await copyVerified(source, join(desktopStage, rel), digest);
      deliveryFiles[rel] = digest;
    }
    await add(youtube, `YouTube/${basename(youtube)}`);
    await add(tiktok, `TikTok/${basename(tiktok)}`);
    for (const archive of archivalMasters) await add(archive, `Source & Verification/${basename(archive)}`);
    const verificationSummary = {
      schemaVersion:1, projectId:PROJECT_ID, previewRevision:PREVIEW_REVISION,
      sourceCommit:commit, frozenInputDigest:frozen.inputDigest, rendererDigest:currentRendererDigest,
      sourceAudioSha256:LOCKED_SOURCE_SHA256, formats:videoEvidence,
      limits:'Technical video and audio checks do not establish perceptual word-timing accuracy.'
    };
    const verificationText = `${JSON.stringify(verificationSummary, null, 2)}\n`;
    if (localPathPattern.test(verificationText)) throw Error('Verification summary contains a machine-local path.');
    const verificationSummaryPath = join(desktopStage, 'Source & Verification/PRODUCTION-VERIFICATION.json');
    mkdirSync(dirname(verificationSummaryPath), {recursive:true});
    writeFileSync(verificationSummaryPath, verificationText);
    deliveryFiles['Source & Verification/PRODUCTION-VERIFICATION.json'] = await descriptor(verificationSummaryPath);
    await add(zip, `Source & Verification/${basename(zip)}`);
    await add(kitManifestPath, 'Source & Verification/KIT-MANIFEST.json');
    for (const [rel, file] of kitFiles) {
      const platform = rel.startsWith('YouTube-') || rel.includes('-YouTube-') ? 'YouTube' : rel.startsWith('TikTok-') || rel.includes('-TikTok-') ? 'TikTok' : null;
      if (!platform) throw Error(`Publishing kit file has no delivery platform: ${rel}`);
      await add(file.path, `${platform}/${rel}`, file);
    }
    const manifest = {schemaVersion:1, projectId:PROJECT_ID, previewRevision:PREVIEW_REVISION,
      sourceCommit:commit, frozenInputDigest:frozen.inputDigest, rendererDigest:currentRendererDigest,
      generatedAt:new Date().toISOString(), files:deliveryFiles};
    const manifestPath = join(desktopStage, 'Source & Verification/DELIVERY-MANIFEST.json');
    const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
    if (localPathPattern.test(manifestText)) throw Error('Delivery manifest contains a machine-local path.');
    writeFileSync(manifestPath, manifestText);
    deliveryFiles['Source & Verification/DELIVERY-MANIFEST.json'] = await descriptor(manifestPath);
    const checksums = Object.entries(deliveryFiles).sort(([a],[b]) => a.localeCompare(b)).map(([rel,data]) => `${data.sha256}  ${rel}`).join('\n') + '\n';
    writeFileSync(join(desktopStage, 'Source & Verification/CHECKSUMS.sha256'), checksums);
    assertCleanTree(desktopStage);
    const copied = await inventory(desktopStage);
    for (const [rel, expected] of Object.entries(deliveryFiles)) {
      if (copied[rel]?.sha256 !== expected.sha256 || copied[rel]?.bytes !== expected.bytes) throw Error(`Desktop copy verification failed: ${rel}`);
    }
    if (Object.keys(copied).length !== Object.keys(deliveryFiles).length + 1) throw Error('Desktop folder has an unexpected file.');
    if (!existingSkeleton) {
      if (existsSync(desktop)) throw Error(`Desktop destination appeared during packaging: ${desktop}`);
      renameSync(desktopStage, desktop);
    } else {
      emptyDesktopSkeleton(desktop);
      // Only remove confirmed-empty directories. A crash during this step leaves
      // another empty skeleton (or no target), so a retry can still publish the
      // already verified staging tree atomically instead of leaving partial media.
      for (const entry of readdirSync(desktop)) rmdirSync(join(desktop, entry));
      rmdirSync(desktop);
      renameSync(desktopStage, desktop);
    }
    const finalFiles = await inventory(desktop);
    if (JSON.stringify(finalFiles) !== JSON.stringify(copied)) throw Error('Final Desktop destination failed byte verification.');
    published = true;
    console.log(JSON.stringify({desktop, sourceCommit:commit, frozenInputDigest:frozen.inputDigest,
      sourceArchive:join(desktop,'Source & Verification',basename(zip)), sourceArchiveSha256:deliveryFiles[`Source & Verification/${basename(zip)}`].sha256,
      files:copied}, null, 2));
  } finally {
    if (!published && existsSync(desktopStage)) rmSync(desktopStage, {recursive:true, force:true});
    rmSync(temp, {recursive:true, force:true});
  }
}

export {assertNoLocalPaths, assertRendererBinding, emptyDesktopSkeleton, gitEntries, makeDeterministicZip, publicDescriptor, rendererDigestFor, safeRelative, scanTar, scanZip};
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {console.error(`Delivery package refused: ${error.message}`); process.exitCode = 1;});
}
