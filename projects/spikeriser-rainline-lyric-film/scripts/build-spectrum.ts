import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {bandFilter, measure, SR} from './dsp.ts';

const audio = readFileSync('public/soundtrack.m4a');
const decoded = spawnSync('ffmpeg', ['-v','error','-i','public/soundtrack.m4a','-vn','-ac','2','-ar',String(SR),'-f','f32le','-'], {maxBuffer: 128 * 1024 * 1024});
if (decoded.status !== 0) throw new Error(decoded.stderr.toString());
const buffer = decoded.stdout;
const copy = new Uint8Array(buffer.byteLength);
copy.set(buffer);
const pcm = new Float32Array(copy.buffer);
const bands = Array.from({length:12}, (_, i) => bandFilter(40 * 300 ** (i / 12), 40 * 300 ** ((i + 1) / 12)));
const frames = Math.ceil(pcm.length / 2 / SR * 60);
const raw: number[][] = [];
const ceilings: number[] = [];
for (const band of bands) {
  const values = measure(pcm, band, 60);
  const sorted = [...values].sort((a,b) => a-b);
  const ceiling = sorted[Math.floor(sorted.length * .96)] ?? -18;
  ceilings.push(ceiling);
  raw.push(values);
}
const values = Array.from({length:frames}, (_, frame) => bands.map((_, band) => {
  const db = raw[band]?.[frame] ?? -120;
  const ceiling = ceilings[band] ?? -18;
  return Math.round(12 * Math.max(0, Math.min(1, (db - (ceiling - 34)) / 34)) ** 1.4);
}));
writeFileSync('src/spectrum.json', JSON.stringify({fps:60, values}) + '\n');
mkdirSync('evidence', {recursive:true});
writeFileSync('evidence/spectrum-analysis.json', JSON.stringify({
  sourceSha256:createHash('sha256').update(audio).digest('hex'),
  pcmSha256:createHash('sha256').update(buffer).digest('hex'),
  sampleRate:SR,channels:2,sampleCount:pcm.length/2,fps:60,frames,
  algorithm:'Repository DSP: unique prewarped band-pass biquads, forward/backward zero phase, reflected endpoint padding, centered max(25 ms, four center-frequency cycles) RMS.',
  units:'dBFS RMS of mean left/right filtered power',
  display:'Per-band fixed track p96 ceiling; 34 dB range; power 1.4 artistic contrast; quantized 0–12 lit architecture cells. No lyric timing is inferred from these values.',
  ceilings,bands,
},null,2)+'\n');
console.log(`Built ${frames} frames × ${bands.length} architectural spectrum bands.`);
