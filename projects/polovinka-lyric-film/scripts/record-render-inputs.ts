import {createHash} from 'node:crypto';
import {createReadStream, readFileSync, writeFileSync, readdirSync} from 'node:fs';
import {resolve, join, relative, basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {ensureBrowser} from '@remotion/renderer';
import assert from 'node:assert/strict';

export const hashFile = async (path: string): Promise<string> => {
  const hash = createHash('sha256');
  for await (const bytes of createReadStream(path)) hash.update(bytes);
  return hash.digest('hex');
};
export type FrozenInput = Readonly<{path: string; sha256: string}>;

/** The worker checks the actual frozen inputs, rather than trusting old success flags. */
export async function verifyFrozenInputs(path: string): Promise<void> {
  const manifest: unknown = JSON.parse(readFileSync(path, 'utf8'));
  assert(manifest && typeof manifest === 'object' && 'inputs' in manifest && Array.isArray(manifest.inputs));
  assert(manifest.inputs.length > 0, 'Empty frozen input manifest');
  for (const item of manifest.inputs as unknown[]) {
    assert(item && typeof item === 'object' && 'path' in item && typeof item.path === 'string' && 'sha256' in item && typeof item.sha256 === 'string');
    assert.equal(await hashFile(item.path), item.sha256, `Frozen input changed: ${item.path}`);
  }
}

const walk = (directory: string): string[] => readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
  const path = join(directory, entry.name);
  if (entry.isDirectory()) return walk(path);
  assert(entry.isFile(), `Expected regular input file: ${path}`);
  return [path];
});
const flag = (name: string): string | undefined => process.argv.find(value => value.startsWith(`--${name}=`))?.slice(name.length + 3);
const versionOf = (name: string): string => {
  const value: unknown = JSON.parse(readFileSync(`node_modules/${name}/package.json`, 'utf8'));
  assert(value && typeof value === 'object' && 'version' in value && typeof value.version === 'string');
  return value.version;
};

async function record(): Promise<void> {
  const optionsPath = flag('options') ?? 'evidence/render-options.json';
  const preflightPath = flag('preflight') ?? 'evidence/render-preflight.json';
  const preflight: unknown = JSON.parse(readFileSync(preflightPath, 'utf8'));
  assert(preflight && typeof preflight === 'object' && 'passed' in preflight && preflight.passed === true, 'A successful awaited render preflight is required');
  const options: unknown = JSON.parse(readFileSync(optionsPath, 'utf8'));
  const reports = ['evidence/timing-checks.json', 'evidence/timing-boundary-checks.json', 'evidence/layout-YouTube.json', 'evidence/layout-TikTok.json'];
  if(options && typeof options==='object' && 'captureReuse' in options && options.captureReuse){
    reports.push('evidence/recovery/original-render-inputs.json','evidence/recovery/capture-reuse.json');
  }
  // Publication helpers and README drafting may continue while immutable media renders.
  // Freeze all code used by this run, without freezing unrelated publishing scripts.
  const pipelineScripts = ['render.ts', 'render-all.ts', 'record-render-inputs.ts', 'encode.ts', 'check.ts', 'layout.ts', 'timing-boundaries.ts', 'dsp-test.ts', 'dsp.ts'].map(name => 'scripts/' + name);
  const paths = [...walk('src'), ...pipelineScripts, ...walk('public'), 'package.json', 'package-lock.json', 'tsconfig.json', optionsPath, preflightPath, ...reports];
  const inputs: FrozenInput[] = [];
  for (const path of [...new Set(paths)].sort()) inputs.push({path, sha256: await hashFile(path)});
  const bundleDirectory = flag('bundle');
  assert(bundleDirectory, 'The final shared bundle is required');
  const bundleFiles: FrozenInput[] = [];
  for (const path of walk(bundleDirectory).sort()) bundleFiles.push({path: relative(bundleDirectory, path), sha256: await hashFile(path)});
  const browserExecutable = flag('browser-executable');
  const browser = await ensureBrowser(browserExecutable ? {browserExecutable} : {});
  assert('path' in browser, 'No render browser is available');
  const browserVersion = execFileSync(browser.path, ['--version'], {encoding: 'utf8'}).trim();
  const manifest = {
    schemaVersion: 2,
    inputs,
    renderOptions: options,
    preflight,
    sharedBundle: {fileCount: bundleFiles.length, sha256: createHash('sha256').update(JSON.stringify(bundleFiles)).digest('hex')},
    runtime: {
      node: process.version, platform: process.platform, architecture: process.arch,
      typescript: versionOf('typescript'), remotion: versionOf('remotion'),
      browser: {name: basename(browser.path), version: browserVersion, sha256: await hashFile(browser.path)},
      ffmpeg: execFileSync('ffmpeg', ['-version'], {encoding: 'utf8'}).split('\n')[0],
      ffprobe: execFileSync('ffprobe', ['-version'], {encoding: 'utf8'}).split('\n')[0],
    },
    purpose: 'Composition, render/encode code, dependencies, media, options and freshly generated audit reports frozen after preflight. Workers reject changed inputs before and after rendering.',
  };
  writeFileSync('evidence/render-inputs.json', JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify({frozenInputs: inputs.length, bundleFiles: bundleFiles.length, browser: browserVersion}));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await record();
