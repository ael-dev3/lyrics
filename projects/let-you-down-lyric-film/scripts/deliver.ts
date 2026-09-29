import {execFileSync, spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createReadStream, existsSync, readFileSync, rmSync, statSync, writeFileSync} from 'node:fs';
import {basename, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertGate} from './render-gate.ts';
import {FILMS, kitDir, RELEASE} from './kit.ts';

// Owner-run delivery. The films carry the lyric text, so the owner runs this;
// an agent never renders or uploads them. One command, safe to re-run
// (finished steps are kept and re-checked):
//   1. renders each missing film under the gate (roughly 30 min per format);
//   2. verifies both films (container, 60 fps grid, AAC packet and PCM
//      identity, strict decode, black intervals) and their encoded word focus;
//   3. assembles the posting kit on the owner's Desktop (films, thumbnail,
//      cover, titles, descriptions, SHA256SUMS), re-hashing every copy;
//   4. publishes the GitHub release with the kit's files, pinned to the
//      current main commit, then confirms GitHub's stored SHA-256 digests and
//      writes evidence/release-upload-verification.json.
//   npm run deliver                 (everything)
//   npm run deliver -- --dry-run    (checks and plan only: renders and uploads nothing)
const root = fileURLToPath(new URL('../', import.meta.url));
const dry = process.argv.includes('--dry-run');
const git = (...a: string[]): string => execFileSync('git', a, {cwd: root, encoding: 'utf8'}).trim();
function run(label: string, cmd: string, args: string[]): void {
  console.log(`\n▶ ${label}`);
  const r = spawnSync(cmd, args, {cwd: root, stdio: 'inherit'});
  if (r.status !== 0) throw Error(`${label} failed (exit ${r.status}). Fix the reported problem and run the same command again; finished steps are kept.`);
}
async function sha(p: string): Promise<string> {const h = createHash('sha256'); for await (const c of createReadStream(p)) h.update(c as Buffer); return h.digest('hex');}
const json = <T>(p: string): T => JSON.parse(readFileSync(join(root, p), 'utf8')) as T;
const mb = (bytes: number): string => `${(bytes / 1e6).toFixed(1)} MB`;

// 0. The approved revision, on the merged main commit, with nothing edited.
assertGate();
git('fetch', '-q', 'origin', 'main');
const head = git('rev-parse', 'HEAD'), main = git('rev-parse', 'origin/main');
if (head !== main) throw Error(`Check out the merged main commit first (HEAD ${head.slice(0, 12)}, origin/main ${main.slice(0, 12)}).`);
const dirty = git('status', '--porcelain', '--untracked-files=no', '--', '.', ':(exclude)evidence');
if (dirty) throw Error(`Tracked project files differ from main:\n${dirty}`);
console.log(`Gate passed; source commit ${head.slice(0, 12)}.${dry ? ' Dry run: nothing is rendered or uploaded.' : ''}`);

// 1. Render.
for (const [format, film] of FILMS) {
  const out = join(root, 'renders', film), partial = out.replace(/\.mp4$/u, '.partial.mp4');
  if (existsSync(out)) {console.log(`✓ ${film} is already rendered`); continue;}
  if (dry) {console.log(`• would render ${film}`); continue;}
  if (existsSync(partial)) {console.log(`Removing the unfinished ${basename(partial)} left by an interrupted run`); rmSync(partial);}
  run(`Render the ${format} film (${film})`, process.execPath, ['scripts/render-production.ts', '--production', '--format', format]);
}
if (dry && FILMS.some(([, f]) => !existsSync(join(root, 'renders', f)))) {
  console.log(`• would verify both films and their word focus, assemble ${kitDir()}, publish ${RELEASE.tag} to ${RELEASE.repo} at ${head.slice(0, 12)}, and confirm its digests`);
  process.exit(0);
}

// 2. Verify (re-run each time: cheap next to a render, and it binds the bytes).
if (!dry) {
  run('Verify both films', process.execPath, ['scripts/verify-final.ts']);
  for (const [format] of FILMS) run(`Verify the encoded word focus (${format})`, process.execPath, ['scripts/verify-word-focus.ts', '--format', format]);
}
type Final = {expectedFrames: number; files: {file: string; bytes: number; sha256: string; frames: number; failures: string[]; strictDecode: string; timestampGrid: {offGrid: number}; audio: {packetsMatchSource: boolean; pcmMatchesSource: boolean}; black: {unexpected: unknown[]}}[]};
type Focus = {glyphChecks: number; pass: number; mismatches: number; ambiguous: number; negativeControl: {differingChecks: number; detected: number}; notFullyShownWhileActive?: string[]};
const final = json<Final>('evidence/final-verification.json');
for (const [, film] of FILMS) {
  const f = final.files.find(x => x.file === film);
  if (!f || f.failures.length || f.sha256 !== await sha(join(root, 'renders', film))) throw Error(`${film} has no passing verification for its current bytes; run without --dry-run`);
}
const focus = Object.fromEntries(FILMS.map(([format]) => [format, json<Focus>(`evidence/encoded-focus-${format}.json`)])) as Record<string, Focus>;

// 3. Kit.
const kit = kitDir();
if (!existsSync(kit)) {
  if (dry) {console.log(`• would assemble ${kit}`); process.exit(0);}
  run('Assemble the Desktop posting kit', process.execPath, ['scripts/package-delivery.ts']);
}
const sums = readFileSync(join(kit, 'SHA256SUMS'), 'utf8').trim().split(/\r?\n/u).map(line => {const [hash, ...name] = line.split('  '); return {file: name.join('  '), sha256: hash!};});
for (const s of sums) if (await sha(join(kit, s.file)) !== s.sha256) throw Error(`${s.file} in ${kit} no longer matches SHA256SUMS`);
for (const [, film] of FILMS) if (sums.find(s => s.file === film)?.sha256 !== final.files.find(x => x.file === film)!.sha256) throw Error(`${film} in the kit differs from the verified film`);
const assets = [...sums.map(s => ({file: s.file, path: join(kit, s.file), sha256: s.sha256})), {file: 'SHA256SUMS', path: join(kit, 'SHA256SUMS'), sha256: await sha(join(kit, 'SHA256SUMS'))}];
console.log(`✓ Kit ${kit}: ${sums.length} files match SHA256SUMS`);

// 4. Release notes (no lyric text), then publish.
const film = (name: string) => final.files.find(x => x.file === name)!;
const f0 = film(FILMS[0][1]), f1 = film(FILMS[1][1]), fl = focus.landscape!, fp = focus.portrait!;
const notes = `# Dawid Podsiadło — Let You Down · lyric film v1.0.0

An unofficial English lyric film made inside the official *Cyberpunk: Edgerunners* ending-theme video. Each word lights up with the vocal in the video's own neon, the film's lights breathe with the music, and a neon spectrum follows the recording.

## Editions

| Edition | File | Picture | Sound | Size |
| --- | --- | --- | --- | --- |
| YouTube | \`${f0.file}\` | 1920 × 1080, 60 fps H.264, BT.709 | Original AAC stereo 44.1 kHz, stream-copied | ${mb(f0.bytes)} |
| TikTok | \`${f1.file}\` | 1080 × 1920, 60 fps H.264, BT.709 | Original AAC stereo 44.1 kHz, stream-copied | ${mb(f1.bytes)} |

## Posting assets

| File | Use |
| --- | --- |
${sums.filter(s => !s.file.endsWith('.mp4')).map(s => `| \`${s.file}\` | ${s.file.includes('Thumbnail') ? 'YouTube thumbnail (1920 × 1080)' : s.file.includes('Cover') ? 'TikTok profile cover (1200 × 1600, 3:4)' : s.file.replace(/\.txt$/u, '').replace('-', ' ')} |`).join('\n')}
| \`SHA256SUMS\` | SHA-256 of every file above |

## Verification

- Both films have ${final.expectedFrames} frames on an exact 1/60 s grid, decode strictly without errors and show no black interval beyond the source's own. Their AAC packets and decoded PCM are identical to the official upload's soundtrack.
- Word focus was checked in the decoded films at the middle of every timed word, for every visible word. Landscape: ${fl.pass}/${fl.glyphChecks} glyph checks pass, ${fl.mismatches} mismatches. Portrait: ${fp.pass}/${fp.glyphChecks} pass, ${fp.mismatches} mismatches. A negative control that expects the next word instead detects ${fl.negativeControl.detected}/${fl.negativeControl.differingChecks} and ${fp.negativeControl.detected}/${fp.negativeControl.differingChecks} of those one-word shifts.
- Review scope: the owner accepted the browser preview and authorized production (a scoped owner-approved preview). Word timing is model-assisted, with 198 of 217 words supported by a second model; no every-cue listening audit is claimed.

## Credits and rights

Music: Dawid Podsiadło, Magdalena Laskowska · Lyrics: Dawid Podsiadło · Producer: Akira Yamaoka (as credited in the music video). Music video directed by Ilya Kuvshinov, produced by STUDIO MASSKET; [official upload](https://www.youtube.com/watch?v=BnnbP7pCIvQ) on the Cyberpunk 2077 / CD PROJEKT RED channel. Lyric-film production: Ael, assisted by Claude (Anthropic).

This is an independent, AI-assisted lyric edit, not an official Dawid Podsiadło, CD PROJEKT RED, STUDIO MASSKET or Netflix release. Music, lyrics and animation belong to their respective rights holders. The films contain the lyric text; the repository itself stores none.

Source: [project record](https://github.com/${RELEASE.repo}/tree/${head}/projects/let-you-down-lyric-film) at commit \`${head}\`.
`;
const notesPath = join(root, 'renders', 'release-notes.md');
writeFileSync(notesPath, notes);
const exists = spawnSync('gh', ['release', 'view', RELEASE.tag, '--repo', RELEASE.repo], {stdio: 'ignore'}).status === 0;
if (!exists) {
  if (dry) {console.log(`• would publish ${RELEASE.tag} with ${assets.length} files (notes: ${notesPath})`); process.exit(0);}
  run(`Publish ${RELEASE.tag} (${assets.length} files, ${mb(assets.reduce((n, a) => n + statSync(a.path).size, 0))})`, 'gh',
    ['release', 'create', RELEASE.tag, ...assets.map(a => a.path), '--repo', RELEASE.repo, '--target', head, '--title', RELEASE.title, '--notes-file', notesPath]);
}

// 5. Confirm what GitHub stores.
type Asset = {name: string; size: number; digest: string | null; browser_download_url: string; node_id: string};
const rel = JSON.parse(execFileSync('gh', ['api', `repos/${RELEASE.repo}/releases/tags/${RELEASE.tag}`], {encoding: 'utf8'})) as {html_url: string; draft: boolean; target_commitish: string; assets: Asset[]};
const tagCommit = execFileSync('git', ['ls-remote', 'origin', `refs/tags/${RELEASE.tag}^{}`, `refs/tags/${RELEASE.tag}`], {cwd: root, encoding: 'utf8'}).trim().split(/\r?\n/u).map(l => l.split('\t')[0]).at(-1) ?? '';
const rows = assets.map(a => {
  const r = rel.assets.find(x => x.name === a.file);
  return {name: a.file, bytes: statSync(a.path).size, sha256: a.sha256, url: r?.browser_download_url ?? null, githubAssetId: r?.node_id ?? null,
    sizeMatched: r?.size === statSync(a.path).size, publishedDigestMatched: r?.digest === `sha256:${a.sha256}`};
});
const passed = !rel.draft && tagCommit === head && rel.assets.length === assets.length && rows.every(r => r.sizeMatched && r.publishedDigestMatched);
const receipt = {schemaVersion: 1, passed, verifiedAt: new Date().toISOString(), releaseUrl: rel.html_url, tag: RELEASE.tag, sourceCommit: head,
  tagPointsToSourceCommit: tagCommit === head, isDraft: rel.draft, assetCount: rel.assets.length, assets: rows,
  note: 'GitHub-computed SHA-256 digests compared with the local posting kit; no platform post is implied.'};
if (!dry) writeFileSync(join(root, 'evidence', 'release-upload-verification.json'), JSON.stringify(receipt, null, 2) + '\n');
console.log(`\n${passed ? '✓' : '✗'} ${rel.html_url}: ${rows.filter(r => r.publishedDigestMatched).length}/${rows.length} digests match, tag at ${tagCommit.slice(0, 12)}`);
if (!passed) process.exit(1);
