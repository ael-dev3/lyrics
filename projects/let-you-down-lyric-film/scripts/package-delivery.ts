import {createHash} from 'node:crypto';
import {copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {homedir} from 'node:os';
import {basename, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertGate} from './render-gate.ts';

// Assemble the private posting kit after final verification: both films, both
// covers, platform copy, optional captions and checksums. Refuses to run
// without the gate and a passing evidence/final-verification.json whose file
// hashes equal the films being copied; refuses to overwrite an existing kit;
// re-hashes every copied file at the destination.
//   node scripts/package-delivery.ts [--dest DIR]   (default: Desktop/Let-You-Down-Posting-Kit)
assertGate();
const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const dest = args.includes('--dest') ? args[args.indexOf('--dest') + 1]! : join(homedir(), 'Desktop', 'Let-You-Down-Posting-Kit');
if (existsSync(dest)) throw Error(`Refusing to overwrite an existing kit: ${dest}`);
const sha = (p: string): string => createHash('sha256').update(readFileSync(p)).digest('hex');
const verification = JSON.parse(readFileSync(`${root}evidence/final-verification.json`, 'utf8')) as {files: {file: string; sha256: string; failures: string[]}[]};
const films = ['Let-You-Down-YouTube-1920x1080-60fps.mp4', 'Let-You-Down-TikTok-1080x1920-60fps.mp4'];
for (const film of films) {
  const record = verification.files.find(f => f.file === film);
  if (!record || record.failures.length) throw Error(`${film} has no passing final verification`);
  if (sha(`${root}renders/${film}`) !== record.sha256) throw Error(`${film} differs from its verified bytes`);
}
for (const format of ['landscape', 'portrait']) {
  const focus = JSON.parse(readFileSync(`${root}evidence/encoded-focus-${format}.json`, 'utf8')) as {mismatches: number; negativeControl: {detected: number; differingChecks: number}};
  if (focus.mismatches || focus.negativeControl.detected !== focus.negativeControl.differingChecks) throw Error(`Encoded focus check for ${format} did not pass cleanly`);
}
mkdirSync(dest, {recursive: true});
const copies: [string, string][] = [
  ...films.map(f => [`${root}renders/${f}`, f] as [string, string]),
  ...readdirSync(`${root}publishing`).filter(f => /\.(jpg|txt|srt|vtt)$/u.test(f)).map(f => [`${root}publishing/${f}`, f] as [string, string]),
];
const manifest: {file: string; bytes: number; sha256: string}[] = [];
for (const [from, name] of copies) {
  const to = join(dest, name), before = sha(from);
  copyFileSync(from, to);
  if (sha(to) !== before) throw Error(`Copy verification failed for ${name}`);
  manifest.push({file: name, bytes: statSync(to).size, sha256: before});
}
writeFileSync(join(dest, 'SHA256SUMS'), manifest.map(m => `${m.sha256}  ${m.file}`).join('\n') + '\n');
const receipt = {schema: 'lyric-film/delivery-receipt/v1', kit: basename(dest), files: manifest, note: 'Local posting kit. No platform upload is implied by this receipt.'};
writeFileSync(`${root}evidence/delivery-receipt.json`, JSON.stringify(receipt, null, 2) + '\n');
console.log(`${manifest.length} files copied and re-hashed into ${basename(dest)}`);
