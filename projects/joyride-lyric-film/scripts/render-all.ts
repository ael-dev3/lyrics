import {bundle} from '@remotion/bundler';
import {ensureBrowser, selectComposition} from '@remotion/renderer';
import {spawn, type ChildProcess} from 'node:child_process';
import {openSync, closeSync, writeFileSync, mkdirSync, readFileSync, existsSync} from 'node:fs';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {FRAMES, FPS} from '../src/config.ts';
import {verifyFrozenInputs, hashFile} from './record-render-inputs.ts';

const flag = (name: string): string | undefined => process.argv.find(value => value.startsWith(`--${name}=`))?.slice(name.length + 3);
const integer = (name: string, fallback: number, maximum: number): number => {
  const value = Number(flag(name) ?? fallback);
  assert(Number.isInteger(value) && value >= 1 && value <= maximum, `--${name} must be an integer from 1 to ${maximum}`);
  return value;
};
const totalConcurrency = integer('total-concurrency', 6, 12), workers = integer('workers', Math.min(2, totalConcurrency), totalConcurrency);
const parts = integer('parts', 2, FRAMES), concurrencyPerWorker = Math.floor(totalConcurrency / workers);
const actualMaximumTabs = workers * concurrencyPerWorker;
const reuseCapture = process.argv.includes('--reuse-capture');
const children = new Set<ChildProcess>(), grouped = process.platform !== 'win32';
let interrupted = false;
let firstFailure: Error | undefined;
const stop = (): void => {
  interrupted = true;
  for (const child of children) {
    if (!child.pid) continue;
    try { if (grouped) process.kill(-child.pid, 'SIGINT'); else child.kill('SIGINT'); } catch { /* Child already exited. */ }
  }
};
process.once('SIGINT', stop); process.once('SIGTERM', stop);
mkdirSync('evidence', {recursive: true});

const run = (command: string, args: string[], log: string): Promise<void> => new Promise((resolveRun, reject) => {
  if (interrupted) { reject(Error('Render run cancelled')); return; }
  const fd = openSync(log, 'w');
  const child = spawn(command, args, {stdio: ['ignore', fd, fd], detached: grouped});
  closeSync(fd); children.add(child);
  child.once('error', error => { children.delete(child); firstFailure??=error; stop(); reject(firstFailure); });
  child.once('exit', code => { children.delete(child); if (code === 0 && !interrupted) resolveRun(); else { firstFailure??=Error(`${command} exited ${code}; see ${log}`); stop(); reject(firstFailure); } });
});
const preflight: {name: string; passed: boolean}[] = [];
const gate = async (name: string, command: string, args: string[]): Promise<void> => {
  await run(command, args, `evidence/preflight-${name}.log`);
  preflight.push({name, passed: true});
};

// Direct invocation of this script enforces the same gate as npm invocation.
await gate('typecheck', process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'typecheck']);
await gate('cue-check', process.execPath, ['scripts/check.ts']);
await gate('timing-boundaries', process.execPath, ['scripts/timing-boundaries.ts']);
await gate('dsp-check', process.execPath, ['scripts/dsp-test.ts']);
if (interrupted) throw Error('Render run cancelled');
const serveUrl = await bundle({entryPoint: resolve('src/index.tsx')});
const requestedBrowser = flag('browser-executable');
const browser = await ensureBrowser(requestedBrowser ? {browserExecutable: requestedBrowser} : {});
assert('path' in browser, 'No render browser is available');
for (const id of ['JoyrideYouTube', 'JoyrideTikTok']) {
  const composition = await selectComposition({serveUrl, id, browserExecutable: browser.path});
  assert.equal(composition.fps, FPS); assert.equal(composition.durationInFrames, FRAMES);
}
preflight.push({name: 'composition-discovery', passed: true});
// layout.ts accepts the already-built serve URL and therefore does not rebundle.
await gate('layout', process.execPath, ['scripts/layout.ts', `--serve-url=${serveUrl}`, `--browser-executable=${browser.path}`]);
writeFileSync('evidence/render-preflight.json', JSON.stringify({passed: true, steps: preflight}, null, 2));
writeFileSync('evidence/render-options.json', JSON.stringify({
  fps: FPS, frames: FRAMES, compositions: ['JoyrideYouTube', 'JoyrideTikTok'],
  scale: 2, segmentsPerComposition: parts, maximumWorkers: workers, concurrencyPerWorker, maximumTotalTabs: actualMaximumTabs,
  frameCapture: 'PNG', intermediate: {codec: 'H.264', pixelFormat: 'yuv444p', crf: 0, preset: 'ultrafast', colorSpace: 'bt709', muted: true},
  decodeLimits: {offthreadVideoCacheBytes: 512*1024*1024,mediaCacheBytes:128*1024*1024,decodeThreads:2,timeoutMilliseconds:120000},
  captureReuse: reuseCapture ? 'evidence/recovery/capture-reuse.json' : null,
  delivery: 'Concatenate lossless segments, then scripts/encode.ts performs the single downsample and locked-audio delivery encode.',
  bundlePolicy: 'One shared bundle for layout, composition discovery and every render worker.',
}, null, 2));
await run(process.execPath, ['scripts/record-render-inputs.ts', `--bundle=${serveUrl}`, `--browser-executable=${browser.path}`], 'evidence/render-inputs.log');

const jobs = ['youtube', 'tiktok'].flatMap(kind => Array.from({length: parts}, (_, index) => ({kind, part: index + 1})));
if(reuseCapture){
  assert.equal(parts,8,'The recovered prefix corresponds to the first of eight parts.');
  const proof=JSON.parse(readFileSync('evidence/recovery/capture-reuse.json','utf8'));
  assert.equal(proof.frames,Math.floor(FRAMES/parts));assert(proof.sampledPixelsIdentical);assert.equal(proof.file,'evidence/youtube-part-1.mkv');
  assert.equal(await hashFile(proof.file),proof.sha256);
  const old=JSON.parse(readFileSync('evidence/recovery/original-render-inputs.json','utf8'));
  for(const item of old.inputs.filter((x: {path:string})=>x.path.startsWith('src/')||x.path.startsWith('public/')||['package.json','package-lock.json','tsconfig.json'].includes(x.path)))assert.equal(await hashFile(item.path),item.sha256,'Recovered pixels use different media or composition.');
  assert(existsSync('evidence/youtube-part-1.json'));jobs.shift();
}
let cursor = 0;
const worker = async (): Promise<void> => {
  while (cursor < jobs.length && !interrupted) {
    const job = jobs[cursor++];
    assert(job);
    await run(process.execPath, ['scripts/render.ts', `--part=${job.part}`, `--parts=${parts}`, `--concurrency=${concurrencyPerWorker}`, '--scale=2', `--serve-url=${serveUrl}`, `--browser-executable=${browser.path}`, '--frozen-inputs=evidence/render-inputs.json', ...(job.kind === 'tiktok' ? ['--portrait'] : [])], `evidence/${job.kind}-part-${job.part}.log`);
  }
};
const rendered = await Promise.allSettled(Array.from({length: Math.min(workers, jobs.length)}, worker));
for (const result of rendered) if (result.status === 'rejected') throw result.reason;
if (interrupted) throw Error('Render run cancelled');
await verifyFrozenInputs('evidence/render-inputs.json');
for (const kind of ['youtube', 'tiktok']) {
  writeFileSync(`evidence/${kind}-concat.txt`, Array.from({length: parts}, (_, index) => `file '${kind}-part-${index + 1}.mkv'\n`).join(''));
  await run('ffmpeg', ['-y', '-v', 'warning', '-f', 'concat', '-safe', '0', '-i', `evidence/${kind}-concat.txt`, '-map', '0:v', '-c', 'copy', `evidence/${kind}-master-lossless.mkv`], `evidence/${kind}-concat.log`);
}
// Serial final encodes avoid competing slow x264 jobs after browser rendering.
for (const kind of ['youtube', 'tiktok']) await run(process.execPath, ['scripts/encode.ts', ...(kind === 'tiktok' ? ['--portrait'] : [])], `evidence/${kind}-encode.log`);
await verifyFrozenInputs('evidence/render-inputs.json');
console.log(JSON.stringify({completed: true, formats: ['YouTube', 'TikTok'], maximumTotalRenderTabs: actualMaximumTabs, sharedBundle: true}));
