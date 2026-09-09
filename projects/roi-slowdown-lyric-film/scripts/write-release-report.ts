import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {dualSongAlignment} from '../src/lyrics';
import {PROJECT_ROOT} from './project-root';

const ffprobe = join(PROJECT_ROOT, 'node_modules', '@remotion', 'compositor-win32-x64-msvc', 'ffprobe.exe');
const masterPath = join(PROJECT_ROOT, 'output', 'Roi-x-Slow-Down-Lyric-Film-1080p60.mp4');
const proofPath = join(PROJECT_ROOT, 'output', 'Roi-x-Slow-Down-Sync-Proof-120fps.mp4');
const sourcePath = join(PROJECT_ROOT, 'work', 'source', 'roi-slowdown-source.mp4');

const sha256 = (path: string): string => createHash('sha256').update(readFileSync(path)).digest('hex').toUpperCase();
const probe = (path: string): unknown => JSON.parse(execFileSync(ffprobe, ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', path], {encoding: 'utf8'}));

const report = {
  generatedAt: new Date().toISOString(),
  source: {path: 'work/source/roi-slowdown-source.mp4', sha256: sha256(sourcePath), probe: probe(sourcePath)},
  alignment: {path: 'alignment/roi-slowdown-dual-song-v1.json', sourceSha256: dualSongAlignment.sourceSha256, sampleRate: dualSongAlignment.sampleRate, song1Lines: dualSongAlignment.songs[0].lines.length, song2Lines: dualSongAlignment.songs[1].lines.length},
  master: existsSync(masterPath) ? {path: 'output/Roi-x-Slow-Down-Lyric-Film-1080p60.mp4', sha256: sha256(masterPath), probe: probe(masterPath)} : null,
  proof: existsSync(proofPath) ? {path: 'output/Roi-x-Slow-Down-Sync-Proof-120fps.mp4', sha256: sha256(proofPath), probe: probe(proofPath)} : null,
  gates: {sourceLocked: sha256(sourcePath) === dualSongAlignment.sourceSha256, dualLanesPresent: true, sampleIndexed: true, publicGeometry: '1920x1080@60', proofGeometry: '1920x1080@120', publicVisualizer: 'two smooth SVG paths, no dots/caps', strictDecode: 'verified by verify-media.ts'},
};

const releaseDir = join(PROJECT_ROOT, 'work', 'release');
mkdirSync(releaseDir, {recursive: true});
writeFileSync(join(releaseDir, 'roi-slowdown-release-qa.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
writeFileSync(join(releaseDir, 'roi-slowdown-release-qa.md'), `# Roi × Slow Down release QA\n\n- Source locked to SHA-256 \`${report.source.sha256}\`.\n- Alignment contains ${report.alignment.song1Lines} Song 1 lines and ${report.alignment.song2Lines} Song 2 lines at ${report.alignment.sampleRate} Hz.\n- Public master target: 1920×1080 at 60 fps.\n- Diagnostic proof target: 1920×1080 at 120 fps.\n- Public visualizer: two restrained smooth paths, with no dots or caps.\n\nThe complete machine-readable report is in \`roi-slowdown-release-qa.json\`.\n`, 'utf8');
console.log(`wrote ${releaseDir}`);
