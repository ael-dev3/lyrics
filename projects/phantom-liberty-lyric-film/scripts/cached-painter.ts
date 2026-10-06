/**
 * Approved portrait source-background cache. The unchanged painter is always
 * invoked; only repeated opaque source-picture background rasterization may be
 * replaced with its exact cached RGBA pixels. The caller must retain immutable
 * decoder buffers. Every production export still requires encoded-file checks.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';
import {createCanvas, ImageData} from '@napi-rs/canvas';
import {paintScene} from '../src/scene.ts';
import type {Format} from '../src/model.ts';
import {checkCurrentProductionGate} from './render-gate.ts';
import {createApprovedPainter, rawFrames, renderClock, readJson, root, sceneTimeForOutput, sourceFrameForOutput, startSourceDecoder, watchChild, type Recording} from './render-production.ts';

export function createCachedPainter(format: Format) {
  if (format !== 'portrait') throw Error('This background cache supports only the approved portrait scene');
  const ordinary = createApprovedPainter(format);
  const real = ordinary.canvas.getContext('2d');
  const width = ordinary.canvas.width, height = ordinary.canvas.height;
  const sourceCanvas = createCanvas(1920, 1080), sourceContext = sourceCanvas.getContext('2d');
  let sourceFrameKey = -1, sourceBufferKey: Buffer | undefined;
  let background: ReturnType<typeof real.getImageData> | undefined;
  let inBackground = false, replay = false, fillCount = 0, drawCount = 0, clearCount = 0;
  const methodCache = new Map<PropertyKey, unknown>();
  const proxy = new Proxy(real, {
    get(target, property) {
      if (methodCache.has(property)) return methodCache.get(property);
      const value: unknown = Reflect.get(target, property, target);
      if (typeof value !== 'function') return value;
      const callable = value as (...args: unknown[]) => unknown;
      const wrapped = (...args: unknown[]): unknown => {
        if (inBackground && ['clearRect', 'fillRect'].includes(String(property))) {
          assert.deepEqual(args, [0, 0, width, height], 'Cache checkpoint requires a full-frame operation');
          if (property === 'clearRect') {
            clearCount++; assert.equal(clearCount, 1, 'Unexpected repeated background clear');
            if (!replay) return Reflect.apply(callable, target, args);
            return undefined;
          }
          fillCount++; assert.ok(fillCount <= 3, 'Unexpected portrait background fill sequence');
          if (!replay) Reflect.apply(callable, target, args);
          if (fillCount === 3) {
            assert.equal(clearCount, 1); assert.equal(drawCount, 2);
            if (replay) {assert.ok(background); real.putImageData(background, 0, 0);}
            else {
              background = real.getImageData(0, 0, width, height);
              for (let pixel = 3; pixel < background.data.length; pixel += 4) assert.equal(background.data[pixel], 255, 'RGBA cache requires an opaque background');
            }
            inBackground = false;
          }
          return undefined;
        }
        if (inBackground && property === 'drawImage') {
          drawCount++; assert.ok(drawCount <= 2, 'Unexpected portrait source drawing sequence');
          if (!replay) return Reflect.apply(callable, target, args);
          return undefined;
        }
        if (inBackground && !['createLinearGradient', 'save', 'restore'].includes(String(property)))
          throw Error(`Unexpected background operation ${String(property)}; cache is unsafe for this scene`);
        return Reflect.apply(callable, target, args);
      };
      methodCache.set(property, wrapped); return wrapped;
    },
    set(target, property, value) {return Reflect.set(target, property, value, target);},
  });
  return {canvas: ordinary.canvas, context: proxy, timeline: ordinary.timeline,
    paint(bytes: Buffer, sourceFrame: number, outputFrame: number): Buffer {
      assert.equal(bytes.length, 1920 * 1080 * 4);
      // A matching source index alone is insufficient. Reuse requires the same
      // actual immutable decoder buffer, as on the repeated native picture.
      replay = background !== undefined && sourceFrame === sourceFrameKey && bytes === sourceBufferKey;
      if (!replay) {
        sourceContext.putImageData(new ImageData(new Uint8ClampedArray(bytes.buffer, bytes.byteOffset, bytes.byteLength), 1920, 1080), 0, 0);
        sourceFrameKey = sourceFrame; sourceBufferKey = bytes;
      }
      inBackground = true; fillCount = 0; drawCount = 0; clearCount = 0;
      paintScene(proxy as unknown as CanvasRenderingContext2D, sceneTimeForOutput(outputFrame), format, sourceCanvas as unknown as CanvasImageSource);
      assert.equal(inBackground, false, 'Unchanged portrait painter did not reach the cache boundary');
      assert.equal(fillCount, 3); assert.equal(drawCount, 2); assert.equal(clearCount, 1);
      return ordinary.canvas.data();
    }};
}

async function experiment(): Promise<void> {
  const approved = checkCurrentProductionGate();
  const recording = readJson<Recording>('source/recording.json'), clock = renderClock(recording);
  const times = [0, .5, 1.9, 13.2, 38.55, 55.2, 78.07, 85.4, 128.5, 162, 178.4, 202, 217, 234.9, 246.81, 277, 292, 334, 347.95, 348];
  const pairs = times.map(time => Math.min(clock.outputFrames - 2, Math.max(0, Math.floor(time * 60000 / 1001 / 2) * 2)));
  pairs[pairs.length - 1] = clock.outputFrames - 2;
  const indices = [...new Set(pairs.map(frame => sourceFrameForOutput(frame, clock)))].sort((a, b) => a - b);
  const decoder = startSourceDecoder(indices), completion = watchChild(decoder, 'Cache experiment source decoder');
  const bytesBySource = new Map<number, Buffer>(); let index = 0;
  for await (const bytes of rawFrames(decoder, 1920 * 1080 * 4)) {bytesBySource.set(indices[index]!, bytes); index++;}
  await completion; assert.equal(index, indices.length);
  const ordinary = createApprovedPainter('portrait'), cached = createCachedPainter('portrait');
  const rows: object[] = []; let ordinaryMs = 0, cachedMs = 0, firstMs = 0, replayMs = 0;
  const sha = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');
  for (const [pairIndex, first] of pairs.entries()) for (let side = 0; side < 2; side++) {
    const frame = first + side, sourceFrame = sourceFrameForOutput(frame, clock), bytes = bytesBySource.get(sourceFrame)!;
    let started = performance.now(); const expected = Buffer.from(ordinary.paint(bytes, sourceFrame, frame)); const normal = performance.now() - started;
    started = performance.now(); const actual = cached.paint(bytes, sourceFrame, frame); const optimized = performance.now() - started;
    assert.equal(Buffer.compare(expected, actual), 0, `RGBA differs at output ${frame}, source ${sourceFrame}`);
    ordinaryMs += normal; cachedMs += optimized; if (side === 0) firstMs += optimized; else replayMs += optimized;
    rows.push({pairIndex, side, outputFrame: frame, time: sceneTimeForOutput(frame), sourceFrame,
      byteEquality: true, bytes: actual.length, sha256: sha(actual), ordinaryMs: normal, cachedMs: optimized});
  }
  assert.deepEqual(checkCurrentProductionGate(), approved);
  const result = {schemaVersion: 1, status: 'sampled byte-identical', revision: approved.revision, approvedInputHashes: approved.inputs,
    sourceSha256: recording.sourceSha256, sceneSha256: approved.inputs['src/scene.ts'],
    experimentSha256: sha(readFileSync(fileURLToPath(import.meta.url))), referencePainterProducerSha256: sha(readFileSync(resolve(root, 'scripts/render-production.ts'))),
    gateSha256: sha(readFileSync(resolve(root, 'scripts/render-gate.ts'))), frames: rows.length, pairs: pairs.length,
    totalOrdinaryMs: ordinaryMs, totalCachedMs: cachedMs, speedup: ordinaryMs / cachedMs,
    averageFirstFrameMs: firstMs / pairs.length, averageRepeatedFrameMs: replayMs / pairs.length, rows,
    method: 'Invoke unchanged paintScene through a transparent native-context wrapper; cache only opaque source-picture/background pixels at its third full-frame fill; restore exact RGBA for the identical repeated source buffer while forwarding context state and all dynamic painting.',
    limitations: 'Twenty paired-output-frame samples and a local microbenchmark do not prove whole-recording equality or predict production speed. Every exported film still requires its separate complete encoded-file checks.'};
  mkdirSync(resolve(root, 'analysis'), {recursive: true}); writeFileSync(resolve(root, 'analysis/cached-painter-experiment.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({status: result.status, frames: rows.length, speedup: result.speedup, ordinaryMs, cachedMs, averageFirstFrameMs: result.averageFirstFrameMs, averageRepeatedFrameMs: result.averageRepeatedFrameMs}));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.argv.includes('--experiment')) throw Error('Pass --experiment for the bounded cache-equivalence and performance check');
  await experiment();
}
