import {execFileSync, spawnSync} from 'node:child_process';
import {
  existsSync,
  linkSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import {basename, dirname, join, resolve} from 'node:path';
import {
  Children,
  createElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, test} from 'vitest';
import {
  createProofRenderPlan,
  decodeProof,
  parseInclusiveFrameRange,
  prepareProofRenderPaths,
  verifyAudioPacketIdentity,
  verifyProofProbe,
} from '../scripts/render-sync-proof';
import {LyricFilm} from '../src/LyricFilm';
import {RemotionRoot} from '../src/Root';
import {
  featureFrameForTime,
  ProofDiagnosticOverlay,
  proofFrameState,
  SyncProof,
  SyncProofFrame,
} from '../src/SyncProof';
import {lyrics} from '../src/timed-lyrics';
import {taniseaAlignment} from '../src/timing/tanisea-alignment';

const withTemporaryDirectory = <Result>(
  prefix: string,
  use: (directory: string) => Result,
): Result => {
  const temporaryRoot = resolve(tmpdir());
  const directory = mkdtempSync(join(temporaryRoot, prefix));
  try {
    return use(directory);
  } finally {
    const resolvedDirectory = resolve(directory);
    if (
      dirname(resolvedDirectory).toLocaleLowerCase('en-US') !==
        temporaryRoot.toLocaleLowerCase('en-US') ||
      !basename(resolvedDirectory).startsWith(prefix)
    ) {
      throw new Error(`Refusing unsafe temporary cleanup: ${resolvedDirectory}`);
    }
    rmSync(resolvedDirectory, {recursive: true, force: true});
  }
};

const createSymbolicLinkIfPermitted = (
  target: string,
  path: string,
  type: 'file' | 'dir',
): boolean => {
  try {
    symlinkSync(target, path, type);
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (process.platform === 'win32' && (code === 'EPERM' || code === 'EACCES')) {
      process.stderr.write(
        `[render-contract] ${type} symlink coverage unavailable: ${code}\n`,
      );
      return false;
    }
    throw error;
  }
};

type PacketProbe = Readonly<{
  packets?: readonly Readonly<{
    pos?: string;
    size?: string;
    flags?: string;
  }>[];
}>;

const createDecodeFixtures = (
  directory: string,
): Readonly<{cleanPath: string; damagedPath: string}> => {
  const cleanPath = join(directory, 'clean.mp4');
  const damagedPath = join(directory, 'damaged.mp4');
  execFileSync(
    'ffmpeg',
    [
      '-v',
      'error',
      '-f',
      'lavfi',
      '-i',
      'testsrc2=size=96x96:rate=30:duration=2',
      '-f',
      'lavfi',
      '-i',
      'sine=frequency=1000:sample_rate=44100:duration=2',
      '-map',
      '0:v:0',
      '-map',
      '1:a:0',
      '-c:v',
      'libx264',
      '-preset',
      'ultrafast',
      '-g',
      '30',
      '-keyint_min',
      '30',
      '-sc_threshold',
      '0',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-shortest',
      '-movflags',
      '+faststart',
      '-y',
      cleanPath,
    ],
    {stdio: 'pipe'},
  );

  const probe = JSON.parse(
    execFileSync(
      'ffprobe',
      [
        '-v',
        'error',
        '-select_streams',
        'v:0',
        '-show_packets',
        '-show_entries',
        'packet=pos,size,flags',
        '-of',
        'json',
        cleanPath,
      ],
      {encoding: 'utf8'},
    ),
  ) as PacketProbe;
  const packet = probe.packets?.find(
    ({flags, size}) => !flags?.includes('K') && Number(size) >= 256,
  );
  if (!packet?.pos || !packet.size) {
    throw new Error('Generated fixture has no suitable non-key H.264 packet');
  }

  const packetPosition = Number(packet.pos);
  const packetSize = Number(packet.size);
  const damageStart = packetPosition + 12;
  const damageLength = Math.min(128, packetSize - 16);
  const bytes = readFileSync(cleanPath);
  bytes.fill(0, damageStart, damageStart + damageLength);
  writeFileSync(damagedPath, bytes);
  return {cleanPath, damagedPath};
};

const INDEPENDENT_SAMPLE_RATE = 44_100;
const INDEPENDENT_PROOF_FPS = 120;

const independentlyNearestFrame = (sample: number): number =>
  Math.round(
    (sample * INDEPENDENT_PROOF_FPS) / INDEPENDENT_SAMPLE_RATE,
  );

type ReviewedLine = (typeof taniseaAlignment.lines)[number];
type ReviewedCue = ReviewedLine['cues'][number];

const presentationProofLines = lyrics.map((presentationLine) => {
  const line = taniseaAlignment.lines.find(({id}) => id === presentationLine.id);
  if (!line) throw new Error(`Missing reviewed line ${presentationLine.id}`);
  return {line, cues: presentationLine.presentationCues};
});

type IndependentCueCandidate = Readonly<{
  line: ReviewedLine;
  cue: ReviewedCue;
  startFrame: number;
  endFrame: number;
}>;

const independentCandidateOrder = (
  left: IndependentCueCandidate,
  right: IndependentCueCandidate,
): number =>
  right.cue.startSample - left.cue.startSample ||
  left.cue.endSample - right.cue.endSample ||
  left.line.id.localeCompare(right.line.id) ||
  left.cue.id.localeCompare(right.cue.id);

const independentlyActiveCandidates = (
  lineId: string | null,
  frame: number,
): readonly IndependentCueCandidate[] =>
  presentationProofLines
    .filter(({line}) => lineId === null || line.id === lineId)
    .flatMap(({line, cues}) =>
      cues.map((cue) => ({
        line,
        cue,
        startFrame: independentlyNearestFrame(cue.startSample),
        endFrame: independentlyNearestFrame(cue.endSample),
      })),
    )
    .filter(({startFrame, endFrame}) =>
      frame >= startFrame && frame < endFrame
    )
    .sort(independentCandidateOrder);

const activeStateAtCueStart = (lineId: string, cueIndex: number) => {
  const line = lyrics.find(({id}) => id === lineId);
  if (!line) throw new Error(`Missing presentation line ${lineId}`);
  const cue = line.presentationCues[cueIndex];
  if (!cue) throw new Error(`Missing presentation cue ${lineId}[${cueIndex}]`);

  const state = proofFrameState(
    lineId,
    INDEPENDENT_PROOF_FPS,
    independentlyNearestFrame(cue.startSample),
  );
  if (state.status !== 'active') {
    throw new Error(`Expected active proof state for ${cue.id}`);
  }
  return state;
};

describe('cadence-independent audio-feature lookup', () => {
  test('samples the committed 60 fps package by composition time', () => {
    expect(featureFrameForTime(2_400, 120, 60)).toBe(1_200);
    expect(featureFrameForTime(1_200, 60, 60)).toBe(1_200);
    expect(featureFrameForTime(2_401, 120, 60)).toBe(1_201);
  });

  test.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid composition frame %s',
    (frame) => {
      expect(() => featureFrameForTime(frame, 120, 60)).toThrow();
    },
  );

  test.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid composition fps %s',
    (fps) => {
      expect(() => featureFrameForTime(0, fps, 60)).toThrow();
    },
  );

  test.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid feature fps %s',
    (fps) => {
      expect(() => featureFrameForTime(0, 120, fps)).toThrow();
    },
  );
});

describe('pure synchronization-proof state', () => {
  test('returns an explicit idle state without stale authority identifiers', () => {
    const state = proofFrameState('V1-03', 120, 0);

    expect(state).toEqual({
      status: 'idle',
      compositionFps: 120,
      proofFrame: 0,
      proofTimeSeconds: 0,
      proofTimeMilliseconds: 0,
    });
    for (const forbidden of [
      'lineId',
      'cueId',
      'sourceTokenIds',
      'sourceTokens',
      'targetIds',
      'targets',
    ]) {
      expect(forbidden in state).toBe(false);
    }
  });

  test('reports every reviewed active-state field from authority data', () => {
    const state = activeStateAtCueStart('V1-08', 1);

    expect(state).toMatchObject({
      status: 'active',
      lineId: 'V1-08',
      cueId: 'V1-08-C02',
      activation: 'backward',
      sourceTokenIds: ['V1-08-R03', 'V1-08-R04'],
      sourceTokens: [
        {id: 'V1-08-R03', text: 'за'},
        {id: 'V1-08-R04', text: 'спиною'},
      ],
      sourceText: 'за спиною',
      targetIds: ['V1-08-S01'],
      targets: [{id: 'V1-08-S01', text: 'Behind my back,'}],
      targetText: 'Behind my back,',
      selectedSample: 3_819_545,
      confidence: 'high',
      uncertaintySamples: 441,
      compositionFps: 120,
      proofFrame: 10_393,
      nearestFrame: 10_393,
      matchingCueIds: ['V1-08/V1-08-C02'],
    });
    expect(state.selectedMilliseconds).toBeCloseTo(
      (3_819_545 / INDEPENDENT_SAMPLE_RATE) * 1_000,
      9,
    );
    expect(state.uncertaintyMilliseconds).toBe(10);
    expect(state.frameErrorMilliseconds).toBeCloseTo(-2.664399, 6);
    expect(state.absoluteFrameErrorMilliseconds).toBeCloseTo(2.664399, 6);
  });

  test.each([
    ['C1-01', 27.0, 'C1-01-S02'],
    ['C1-06', 42.0, 'C1-06-S02'],
    ['C1-06', 44.2, 'C1-06-S03'],
    ['C1-07', 46.0, 'C1-07-S02'],
    ['C1-07', 46.6, 'C1-07-S03'],
    ['C1-08', 49.6, 'C1-08-S03'],
  ] as const)(
    'mirrors the public presentation target for %s at %s seconds',
    (lineId, seconds, expectedTargetId) => {
      const state = proofFrameState(lineId, 120, Math.round(seconds * 120));

      expect(state.status).toBe('active');
      if (state.status === 'active') {
        expect(state.targetIds).toEqual([expectedTargetId]);
      }
    },
  );

  test('independently proves every reviewed cue and 120 fps frame error', () => {
    for (const line of taniseaAlignment.lines) {
      for (const cue of line.cues) {
        const nearestFrame = Math.round(
          (cue.startSample * 120) / 44_100,
        );
        const signedErrorMilliseconds =
          (nearestFrame / 120 - cue.startSample / 44_100) * 1_000;
        const absoluteErrorMilliseconds = Math.abs(signedErrorMilliseconds);
        const state = proofFrameState(
          line.id,
          120,
          nearestFrame,
        );
        expect(state.status, cue.id).toBe('active');
        if (state.status === 'active') {
          expect(state.lineId, cue.id).toBe(line.id);
          expect(state.cueId, cue.id).toBe(cue.id);
          expect(state.selectedSample, cue.id).toBe(cue.startSample);
          expect(state.nearestFrame, cue.id).toBe(nearestFrame);
          expect(state.frameErrorMilliseconds, cue.id).toBeCloseTo(
            signedErrorMilliseconds,
            12,
          );
          expect(state.absoluteFrameErrorMilliseconds, cue.id).toBeCloseTo(
            absoluteErrorMilliseconds,
            12,
          );
          expect(absoluteErrorMilliseconds, cue.id).toBeLessThanOrEqual(4.167);
          expect(state.absoluteFrameErrorMilliseconds, cue.id).toBeLessThanOrEqual(
            4.167,
          );
        }
      }
    }
  });

  test('applies start-inclusive and end-exclusive selection at every presentation cue boundary', () => {
    for (const {line, cues} of presentationProofLines) {
      for (const cue of cues) {
        const startFrame = independentlyNearestFrame(cue.startSample);
        const endFrame = independentlyNearestFrame(cue.endSample);
        const boundaries = [
          {label: 'startFrame - 1', frame: startFrame - 1, includesCue: false},
          {label: 'startFrame', frame: startFrame, includesCue: true},
          {label: 'endFrame - 1', frame: endFrame - 1, includesCue: true},
          {label: 'endFrame', frame: endFrame, includesCue: false},
        ] as const;

        for (const boundary of boundaries) {
          if (boundary.frame < 0) continue;
          const expectedCandidates = independentlyActiveCandidates(
            null,
            boundary.frame,
          );
          const expectedMatchingCueIds = expectedCandidates.map(
            ({line: candidateLine, cue: candidateCue}) =>
              `${candidateLine.id}/${candidateCue.id}`,
          );
          expect(
            expectedMatchingCueIds.includes(`${line.id}/${cue.id}`),
            `${cue.id} at ${boundary.label}`,
          ).toBe(boundary.includesCue);

          const state = proofFrameState(
            null,
            INDEPENDENT_PROOF_FPS,
            boundary.frame,
          );
          const selected = expectedCandidates[0];
          if (!selected) {
            expect(state.status, `${cue.id} at ${boundary.label}`).toBe('idle');
            continue;
          }

          expect(state.status, `${cue.id} at ${boundary.label}`).toBe('active');
          if (state.status === 'active') {
            expect(state.lineId, `${cue.id} at ${boundary.label}`).toBe(
              selected.line.id,
            );
            expect(state.cueId, `${cue.id} at ${boundary.label}`).toBe(
              selected.cue.id,
            );
            expect(state.matchingCueIds, `${cue.id} at ${boundary.label}`).toEqual(
              expectedMatchingCueIds,
            );
          }
        }
      }
    }
  });

  test('preserves the exact V1-03 source-to-target order and backward contact', () => {
    expect(
      [0, 1, 2].map((cueIndex) => {
        const state = activeStateAtCueStart('V1-03', cueIndex);
        return {
          cueId: state.cueId,
          sourceTokenIds: state.sourceTokenIds,
          targetIds: state.targetIds,
          activation: state.activation,
          nearestFrame: state.nearestFrame,
        };
      }),
    ).toEqual([
      {
        cueId: 'V1-03-C01',
        sourceTokenIds: [
          'V1-03-R01',
          'V1-03-R02',
          'V1-03-R03',
          'V1-03-R04',
        ],
        targetIds: ['V1-03-S01'],
        activation: 'forward',
        nearestFrame: 8_448,
      },
      {
        cueId: 'V1-03-C02',
        sourceTokenIds: ['V1-03-R05'],
        targetIds: ['V1-03-S03'],
        activation: 'forward',
        nearestFrame: 8_636,
      },
      {
        cueId: 'V1-03-C03',
        sourceTokenIds: ['V1-03-R06'],
        targetIds: ['V1-03-S02'],
        activation: 'backward',
        nearestFrame: 8_710,
      },
    ]);
  });

  test('preserves the exact V1-08 order and two-source backward S01 contact', () => {
    expect(
      [0, 1, 2, 3].map((cueIndex) => {
        const state = activeStateAtCueStart('V1-08', cueIndex);
        return {
          cueId: state.cueId,
          sourceTokenIds: state.sourceTokenIds,
          targetIds: state.targetIds,
          activation: state.activation,
          nearestFrame: state.nearestFrame,
        };
      }),
    ).toEqual([
      {
        cueId: 'V1-08-C01',
        sourceTokenIds: ['V1-08-R02'],
        targetIds: ['V1-08-S02'],
        activation: 'forward',
        nearestFrame: 10_360,
      },
      {
        cueId: 'V1-08-C02',
        sourceTokenIds: ['V1-08-R03', 'V1-08-R04'],
        targetIds: ['V1-08-S01'],
        activation: 'backward',
        nearestFrame: 10_393,
      },
      {
        cueId: 'V1-08-C03',
        sourceTokenIds: ['V1-08-R05', 'V1-08-R06'],
        targetIds: ['V1-08-S03'],
        activation: 'forward',
        nearestFrame: 10_530,
      },
      {
        cueId: 'V1-08-C04',
        sourceTokenIds: ['V1-08-R07'],
        targetIds: ['V1-08-S04'],
        activation: 'forward',
        nearestFrame: 10_646,
      },
    ]);
  });

  test('covers the concrete V1-03 and V1-08 proof regression windows', () => {
    const v103Backward = proofFrameState('V1-03', 120, 8_710);
    expect(v103Backward).toMatchObject({
      status: 'active',
      cueId: 'V1-03-C03',
      targetIds: ['V1-03-S02'],
      activation: 'backward',
    });

    const v108Backward = proofFrameState('V1-08', 120, 10_394);
    expect(v108Backward).toMatchObject({
      status: 'active',
      cueId: 'V1-08-C02',
      sourceTokenIds: ['V1-08-R03', 'V1-08-R04'],
      targetIds: ['V1-08-S01'],
      activation: 'backward',
      nearestFrame: 10_393,
    });

    for (const state of [v103Backward, v108Backward]) {
      expect(state.proofFrame).toBeGreaterThanOrEqual(
        state === v103Backward ? 8_448 : 10_360,
      );
      expect(state.proofFrame).toBeLessThanOrEqual(
        state === v103Backward ? 8_806 : 10_746,
      );
    }
  });

  test.each([
    ['V1-03', 120, -1],
    ['V1-03', 0, 0],
    ['V1-03', Number.NaN, 0],
    ['V1-03', 120, Number.POSITIVE_INFINITY],
  ] as const)('rejects invalid proof input %s/%s/%s', (lineId, fps, frame) => {
    expect(() => proofFrameState(lineId, fps, frame)).toThrow();
  });

  test('rejects an unknown reviewed line', () => {
    expect(() => proofFrameState('missing-line', 120, 0)).toThrow(
      /Unknown reviewed line/,
    );
  });
});

describe('diagnostic-only proof composition', () => {
  test('renders the accepted public film once beneath a proof-only overlay', () => {
    const element = SyncProofFrame({frame: 8_710, fps: 120}) as ReactElement<{
      children?: ReactNode;
    }>;
    const children = Children.toArray(element.props.children).filter(
      (child): child is ReactElement => typeof child === 'object' && child !== null,
    );

    expect(children).toHaveLength(2);
    expect(children[0]?.type).toBe(LyricFilm);
    expect(children[1]?.type).toBe(ProofDiagnosticOverlay);
  });

  test('renders stable active and idle proof identifiers and audit text', () => {
    const active = activeStateAtCueStart('V1-08', 1);
    const activeMarkup = renderToStaticMarkup(
      createElement(ProofDiagnosticOverlay, {state: active}),
    );
    expect(activeMarkup).toContain('data-sync-proof-overlay="true"');
    expect(activeMarkup).toContain('data-sync-proof-status="active"');
    expect(activeMarkup).toContain('data-sync-proof-line-id="V1-08"');
    expect(activeMarkup).toContain('V1-08-C02');
    expect(activeMarkup).toContain('V1-08-R03 + V1-08-R04');
    expect(activeMarkup).toContain('за спиною');
    expect(activeMarkup).toContain('V1-08-S01');
    expect(activeMarkup).toContain('Behind my back,');
    expect(activeMarkup).toContain('3819545');
    expect(activeMarkup).toContain('HIGH');
    expect(activeMarkup).toContain('441 samples');
    expect(activeMarkup).toContain('10393');

    const idleMarkup = renderToStaticMarkup(
      createElement(ProofDiagnosticOverlay, {
        state: proofFrameState('V1-08', 120, 0),
      }),
    );
    expect(idleMarkup).toContain('data-sync-proof-status="idle"');
    expect(idleMarkup).toContain('IDLE — NO REVIEWED CUE ACTIVE');
    expect(idleMarkup).not.toContain('V1-08-C02');
  });

  test('registers exact public and proof composition contracts', () => {
    const root = RemotionRoot() as ReactElement<{children?: ReactNode}>;
    const compositions = Children.toArray(root.props.children).filter(
      (child): child is ReactElement<Record<string, unknown>> =>
        typeof child === 'object' && child !== null,
    );

    expect(
      compositions.map(({props}) => ({
        id: props.id,
        component: props.component,
        durationInFrames: props.durationInFrames,
        fps: props.fps,
        width: props.width,
        height: props.height,
      })),
    ).toEqual([
      {
        id: 'LyricFilmVNext',
        component: LyricFilm,
        durationInFrames: 9_180,
        fps: 60,
        width: 1_080,
        height: 1_080,
      },
      {
        id: 'LyricFilmSyncProof',
        component: SyncProof,
        durationInFrames: 18_360,
        fps: 120,
        width: 1_080,
        height: 1_080,
      },
    ]);
    expect(9_180 / 60).toBe(153);
    expect(18_360 / 120).toBe(153);
  });
});

describe('proof render and remux contract', () => {
  test('accepts clean generated media in muted and full decode modes', () =>
    withTemporaryDirectory('tanisea-proof-decode-', (directory) => {
      const {cleanPath} = createDecodeFixtures(directory);

      expect(() => decodeProof(cleanPath, false)).not.toThrow();
      expect(() => decodeProof(cleanPath, true)).not.toThrow();
    }), 30_000);

  test('rejects recoverable H.264 corruption in muted and full decode modes', () =>
    withTemporaryDirectory('tanisea-proof-decode-', (directory) => {
      const {damagedPath} = createDecodeFixtures(directory);
      const ordinaryDecode = spawnSync(
        'ffmpeg',
        [
          '-v',
          'error',
          '-i',
          damagedPath,
          '-map',
          '0:v:0',
          '-f',
          'null',
          '-',
        ],
        {encoding: 'utf8'},
      );

      expect(ordinaryDecode.status).toBe(0);
      expect(ordinaryDecode.stderr).toMatch(/error|invalid|corrupt/i);
      expect(() => decodeProof(damagedPath, false)).toThrow();
      expect(() => decodeProof(damagedPath, true)).toThrow();
    }), 30_000);

  test('rejects a full output that aliases the soundtrack before deleting any target', () =>
    withTemporaryDirectory('tanisea-proof-paths-', (directory) => {
      const entryPoint = join(directory, 'index.ts');
      const soundtrackPath = join(directory, 'soundtrack.m4a');
      const mutedOutputPath = join(directory, 'soundtrack.video-only.m4a');
      writeFileSync(entryPoint, 'protected entry point');
      writeFileSync(soundtrackPath, 'protected soundtrack');
      writeFileSync(mutedOutputPath, 'existing muted output');
      const plan = createProofRenderPlan({
        entryPoint,
        soundtrackPath,
        outputPath: soundtrackPath,
        frameRange: null,
      });

      expect(() =>
        prepareProofRenderPaths({entryPoint, soundtrackPath, plan}),
      ).toThrow(/final output.*protected soundtrack/i);
      expect(readFileSync(soundtrackPath, 'utf8')).toBe('protected soundtrack');
      expect(readFileSync(mutedOutputPath, 'utf8')).toBe(
        'existing muted output',
      );
    }));

  test('rejects a short output that aliases the entry point before deletion', () =>
    withTemporaryDirectory('tanisea-proof-paths-', (directory) => {
      const entryPoint = join(directory, 'index.ts');
      const soundtrackPath = join(directory, 'soundtrack.m4a');
      writeFileSync(entryPoint, 'protected entry point');
      writeFileSync(soundtrackPath, 'protected soundtrack');
      const plan = createProofRenderPlan({
        entryPoint,
        soundtrackPath,
        outputPath: entryPoint,
        frameRange: {start: 0, end: 0},
      });

      expect(() =>
        prepareProofRenderPaths({entryPoint, soundtrackPath, plan}),
      ).toThrow(/muted output.*protected entry point/i);
      expect(readFileSync(entryPoint, 'utf8')).toBe('protected entry point');
    }));

  test('rejects case-only Windows aliases before deletion', () =>
    withTemporaryDirectory('tanisea-proof-paths-', (directory) => {
      const entryPoint = join(directory, 'MixedCaseEntry.ts');
      const soundtrackPath = join(directory, 'soundtrack.m4a');
      writeFileSync(entryPoint, 'case-protected entry point');
      writeFileSync(soundtrackPath, 'protected soundtrack');
      const plan = createProofRenderPlan({
        entryPoint,
        soundtrackPath,
        outputPath: entryPoint.toUpperCase(),
        frameRange: {start: 0, end: 0},
      });

      expect(() =>
        prepareProofRenderPaths({entryPoint, soundtrackPath, plan}),
      ).toThrow(/muted output.*protected entry point/i);
      expect(readFileSync(entryPoint, 'utf8')).toBe(
        'case-protected entry point',
      );
    }));

  test('rejects dot-segment aliases before deletion', () =>
    withTemporaryDirectory('tanisea-proof-paths-', (directory) => {
      const sourceDirectory = join(directory, 'source');
      const entryPoint = join(sourceDirectory, 'index.ts');
      const soundtrackPath = join(directory, 'soundtrack.m4a');
      const outputPath = join(sourceDirectory, '..', 'source', 'index.ts');
      mkdirSync(sourceDirectory);
      writeFileSync(entryPoint, 'dot-protected entry point');
      writeFileSync(soundtrackPath, 'protected soundtrack');
      const plan = createProofRenderPlan({
        entryPoint,
        soundtrackPath,
        outputPath,
        frameRange: {start: 0, end: 0},
      });

      expect(() =>
        prepareProofRenderPaths({entryPoint, soundtrackPath, plan}),
      ).toThrow(/muted output.*protected entry point/i);
      expect(readFileSync(entryPoint, 'utf8')).toBe(
        'dot-protected entry point',
      );
    }));

  test('rejects a normalized temporary output collision before any deletion', () =>
    withTemporaryDirectory('tanisea-proof-paths-', (directory) => {
      const outputPath = join(directory, 'proof.mp4');
      const entryPoint = join(directory, 'proof.bt709-normalized.mp4');
      const soundtrackPath = join(directory, 'soundtrack.m4a');
      writeFileSync(outputPath, 'existing proof output');
      writeFileSync(entryPoint, 'protected normalized-path entry point');
      writeFileSync(soundtrackPath, 'protected soundtrack');
      const plan = createProofRenderPlan({
        entryPoint,
        soundtrackPath,
        outputPath,
        frameRange: {start: 0, end: 0},
      });

      expect(() =>
        prepareProofRenderPaths({entryPoint, soundtrackPath, plan}),
      ).toThrow(/BT\.709 normalized output.*protected entry point/i);
      expect(readFileSync(outputPath, 'utf8')).toBe('existing proof output');
      expect(readFileSync(entryPoint, 'utf8')).toBe(
        'protected normalized-path entry point',
      );
    }));

  test('rejects a real directory-junction output alias before deleting protected files', () =>
    withTemporaryDirectory('tanisea-proof-paths-', (directory) => {
      const realDirectory = join(directory, 'real');
      const aliasDirectory = join(directory, 'alias');
      const entryPoint = join(directory, 'index.ts');
      const soundtrackPath = join(realDirectory, 'soundtrack.m4a');
      const outputPath = join(aliasDirectory, 'soundtrack.m4a');
      const mutedOutputPath = join(aliasDirectory, 'soundtrack.video-only.m4a');
      mkdirSync(realDirectory);
      symlinkSync(realDirectory, aliasDirectory, 'junction');
      writeFileSync(entryPoint, 'protected entry point');
      writeFileSync(soundtrackPath, 'protected junction soundtrack');
      writeFileSync(mutedOutputPath, 'existing muted output');

      expect(resolve(outputPath)).not.toBe(resolve(soundtrackPath));
      expect(realpathSync.native(outputPath)).toBe(
        realpathSync.native(soundtrackPath),
      );

      const plan = createProofRenderPlan({
        entryPoint,
        soundtrackPath,
        outputPath,
        frameRange: null,
      });
      let rejection: unknown;
      try {
        prepareProofRenderPaths({entryPoint, soundtrackPath, plan});
      } catch (error) {
        rejection = error;
      }

      expect({
        rejection:
          rejection instanceof Error ? rejection.message : null,
        soundtrack: existsSync(soundtrackPath)
          ? readFileSync(soundtrackPath, 'utf8')
          : null,
        mutedOutput: existsSync(mutedOutputPath)
          ? readFileSync(mutedOutputPath, 'utf8')
          : null,
      }).toEqual({
        rejection: expect.stringMatching(
          /final output.*protected soundtrack/i,
        ),
        soundtrack: 'protected junction soundtrack',
        mutedOutput: 'existing muted output',
      });
    }));

  test('rejects an existing hardlink output before deleting any target', () =>
    withTemporaryDirectory('tanisea-proof-paths-', (directory) => {
      const entryPoint = join(directory, 'index.ts');
      const soundtrackPath = join(directory, 'soundtrack.m4a');
      const outputPath = join(directory, 'proof.mp4');
      const mutedOutputPath = join(directory, 'proof.video-only.mp4');
      writeFileSync(entryPoint, 'protected entry point');
      writeFileSync(soundtrackPath, 'protected hardlink soundtrack');
      linkSync(soundtrackPath, outputPath);
      writeFileSync(mutedOutputPath, 'existing muted output');

      expect(realpathSync.native(outputPath)).not.toBe(
        realpathSync.native(soundtrackPath),
      );
      expect({
        dev: statSync(outputPath).dev,
        ino: statSync(outputPath).ino,
      }).toEqual({
        dev: statSync(soundtrackPath).dev,
        ino: statSync(soundtrackPath).ino,
      });

      const plan = createProofRenderPlan({
        entryPoint,
        soundtrackPath,
        outputPath,
        frameRange: null,
      });
      let rejection: unknown;
      try {
        prepareProofRenderPaths({entryPoint, soundtrackPath, plan});
      } catch (error) {
        rejection = error;
      }

      expect({
        rejection:
          rejection instanceof Error ? rejection.message : null,
        soundtrack: readFileSync(soundtrackPath, 'utf8'),
        output: existsSync(outputPath)
          ? readFileSync(outputPath, 'utf8')
          : null,
        mutedOutput: existsSync(mutedOutputPath)
          ? readFileSync(mutedOutputPath, 'utf8')
          : null,
      }).toEqual({
        rejection: expect.stringMatching(
          /final output.*protected soundtrack/i,
        ),
        soundtrack: 'protected hardlink soundtrack',
        output: 'protected hardlink soundtrack',
        mutedOutput: 'existing muted output',
      });
    }));

  test('rejects a future output alias through its nearest real junction ancestor before mkdir', () =>
    withTemporaryDirectory('tanisea-proof-paths-', (directory) => {
      const realDirectory = join(directory, 'real');
      const aliasDirectory = join(directory, 'alias');
      const entryPoint = join(directory, 'index.ts');
      const futureDirectory = join(realDirectory, 'future');
      const soundtrackPath = join(futureDirectory, 'proof.mp4');
      const outputPath = join(aliasDirectory, 'future', 'proof.mp4');
      mkdirSync(realDirectory);
      symlinkSync(realDirectory, aliasDirectory, 'junction');
      writeFileSync(entryPoint, 'protected entry point');

      expect(resolve(outputPath)).not.toBe(resolve(soundtrackPath));
      expect(existsSync(futureDirectory)).toBe(false);
      const plan = createProofRenderPlan({
        entryPoint,
        soundtrackPath,
        outputPath,
        frameRange: {start: 0, end: 0},
      });

      expect(() =>
        prepareProofRenderPaths({entryPoint, soundtrackPath, plan}),
      ).toThrow(/muted output.*protected soundtrack/i);
      expect(existsSync(futureDirectory)).toBe(false);
      expect(readFileSync(entryPoint, 'utf8')).toBe('protected entry point');
    }));

  test('rejects a BT.709 normalized output alias through a directory junction', () =>
    withTemporaryDirectory('tanisea-proof-paths-', (directory) => {
      const realDirectory = join(directory, 'real');
      const aliasDirectory = join(directory, 'alias');
      const outputPath = join(aliasDirectory, 'proof.mp4');
      const entryPoint = join(realDirectory, 'proof.bt709-normalized.mp4');
      const soundtrackPath = join(directory, 'soundtrack.m4a');
      mkdirSync(realDirectory);
      symlinkSync(realDirectory, aliasDirectory, 'junction');
      writeFileSync(outputPath, 'existing proof output');
      writeFileSync(entryPoint, 'protected normalized entry point');
      writeFileSync(soundtrackPath, 'protected soundtrack');
      const plan = createProofRenderPlan({
        entryPoint,
        soundtrackPath,
        outputPath,
        frameRange: {start: 0, end: 0},
      });

      expect(() =>
        prepareProofRenderPaths({entryPoint, soundtrackPath, plan}),
      ).toThrow(/BT\.709 normalized output.*protected entry point/i);
      expect(readFileSync(outputPath, 'utf8')).toBe('existing proof output');
      expect(readFileSync(entryPoint, 'utf8')).toBe(
        'protected normalized entry point',
      );
    }));

  test('rejects an output file-symlink alias before deletion when supported', () =>
    withTemporaryDirectory('tanisea-proof-paths-', (directory) => {
      const entryPoint = join(directory, 'index.ts');
      const soundtrackPath = join(directory, 'soundtrack.m4a');
      const outputPath = join(directory, 'proof.mp4');
      const mutedOutputPath = join(directory, 'proof.video-only.mp4');
      writeFileSync(entryPoint, 'protected entry point');
      writeFileSync(soundtrackPath, 'protected symlink soundtrack');
      writeFileSync(mutedOutputPath, 'existing muted output');
      if (!createSymbolicLinkIfPermitted(soundtrackPath, outputPath, 'file')) {
        return;
      }
      const plan = createProofRenderPlan({
        entryPoint,
        soundtrackPath,
        outputPath,
        frameRange: null,
      });

      expect(() =>
        prepareProofRenderPaths({entryPoint, soundtrackPath, plan}),
      ).toThrow(/final output.*protected soundtrack/i);
      expect(readFileSync(soundtrackPath, 'utf8')).toBe(
        'protected symlink soundtrack',
      );
      expect(readFileSync(outputPath, 'utf8')).toBe(
        'protected symlink soundtrack',
      );
      expect(readFileSync(mutedOutputPath, 'utf8')).toBe(
        'existing muted output',
      );
    }));

  test('rejects a real output when its protected input uses a directory symlink', () =>
    withTemporaryDirectory('tanisea-proof-paths-', (directory) => {
      const realDirectory = join(directory, 'real');
      const protectedAliasDirectory = join(directory, 'protected-alias');
      const entryPoint = join(directory, 'index.ts');
      const outputPath = join(realDirectory, 'soundtrack.m4a');
      const soundtrackPath = join(protectedAliasDirectory, 'soundtrack.m4a');
      const mutedOutputPath = join(realDirectory, 'soundtrack.video-only.m4a');
      mkdirSync(realDirectory);
      writeFileSync(entryPoint, 'protected entry point');
      writeFileSync(outputPath, 'protected directory-symlink soundtrack');
      writeFileSync(mutedOutputPath, 'existing muted output');
      if (
        !createSymbolicLinkIfPermitted(
          realDirectory,
          protectedAliasDirectory,
          'dir',
        )
      ) {
        return;
      }
      const plan = createProofRenderPlan({
        entryPoint,
        soundtrackPath,
        outputPath,
        frameRange: null,
      });

      expect(() =>
        prepareProofRenderPaths({entryPoint, soundtrackPath, plan}),
      ).toThrow(/final output.*protected soundtrack/i);
      expect(readFileSync(outputPath, 'utf8')).toBe(
        'protected directory-symlink soundtrack',
      );
      expect(readFileSync(soundtrackPath, 'utf8')).toBe(
        'protected directory-symlink soundtrack',
      );
      expect(readFileSync(mutedOutputPath, 'utf8')).toBe(
        'existing muted output',
      );
    }));

  test('cleans arbitrary distinct short-proof targets without touching protected inputs', () =>
    withTemporaryDirectory('tanisea-proof-paths-', (directory) => {
      const entryPoint = join(directory, 'index.ts');
      const soundtrackPath = join(directory, 'soundtrack.m4a');
      const outputDirectory = join(directory, 'arbitrary', 'nested');
      const outputPath = join(outputDirectory, 'proof.custom.mp4');
      const normalizedOutputPath = join(
        outputDirectory,
        'proof.custom.bt709-normalized.mp4',
      );
      mkdirSync(outputDirectory, {recursive: true});
      writeFileSync(entryPoint, 'protected entry point');
      writeFileSync(soundtrackPath, 'protected soundtrack');
      writeFileSync(outputPath, 'stale output');
      writeFileSync(normalizedOutputPath, 'stale normalized output');
      const plan = createProofRenderPlan({
        entryPoint,
        soundtrackPath,
        outputPath,
        frameRange: {start: 0, end: 0},
      });

      expect(
        prepareProofRenderPaths({entryPoint, soundtrackPath, plan}),
      ).toBe(normalizedOutputPath);
      expect(existsSync(outputPath)).toBe(false);
      expect(existsSync(normalizedOutputPath)).toBe(false);
      expect(readFileSync(entryPoint, 'utf8')).toBe('protected entry point');
      expect(readFileSync(soundtrackPath, 'utf8')).toBe(
        'protected soundtrack',
      );
    }));

  test('plans an arbitrary inclusive short range as a muted H.264 proof', () => {
    const plan = createProofRenderPlan({
      entryPoint: 'src/index.ts',
      soundtrackPath: 'public/soundtrack.m4a',
      outputPath: 'work/V1-03.mp4',
      frameRange: {start: 8_448, end: 8_806},
    });

    expect(plan).toEqual({
      compositionId: 'LyricFilmSyncProof',
      frameRange: {start: 8_448, end: 8_806},
      expectedFrameCount: 359,
      expectedDurationSeconds: 359 / 120,
      mutedOutputPath: 'work/V1-03.mp4',
      finalOutputPath: 'work/V1-03.mp4',
      renderArguments: [
        'render',
        'src/index.ts',
        'LyricFilmSyncProof',
        'work/V1-03.mp4',
        '--codec=h264',
        '--crf=12',
        '--pixel-format=yuv420p',
        '--color-space=bt709',
        '--muted',
        '--overwrite',
        '--frames=8448-8806',
      ],
      remuxArguments: null,
    });
  });

  test('plans the full proof and packet-copy remux without audio re-encoding', () => {
    const plan = createProofRenderPlan({
      entryPoint: 'src/index.ts',
      soundtrackPath: 'public/soundtrack.m4a',
      outputPath: 'output/Tanisea-Lyric-Film-Sync-Proof-120fps.mp4',
      frameRange: null,
    });

    expect(plan.expectedFrameCount).toBe(18_360);
    expect(plan.expectedDurationSeconds).toBe(153);
    expect(plan.mutedOutputPath).toBe(
      'output/Tanisea-Lyric-Film-Sync-Proof-120fps.video-only.mp4',
    );
    expect(plan.renderArguments).toEqual([
      'render',
      'src/index.ts',
      'LyricFilmSyncProof',
      'output/Tanisea-Lyric-Film-Sync-Proof-120fps.video-only.mp4',
      '--codec=h264',
      '--crf=12',
      '--pixel-format=yuv420p',
      '--color-space=bt709',
      '--muted',
      '--overwrite',
    ]);
    expect(plan.remuxArguments).toEqual([
      '-hide_banner',
      '-i',
      'output/Tanisea-Lyric-Film-Sync-Proof-120fps.video-only.mp4',
      '-i',
      'public/soundtrack.m4a',
      '-map',
      '0:v:0',
      '-map',
      '1:a:0',
      '-c:v',
      'copy',
      '-c:a',
      'copy',
      '-tag:v',
      'avc1',
      '-movflags',
      '+faststart',
      '-y',
      'output/Tanisea-Lyric-Film-Sync-Proof-120fps.mp4',
    ]);
  });

  test.each([
    ['8448-8806', {start: 8_448, end: 8_806}],
    ['10360-10746', {start: 10_360, end: 10_746}],
  ] as const)('parses inclusive frame range %s', (value, expected) => {
    expect(parseInclusiveFrameRange(value)).toEqual(expected);
  });

  test.each(['', '8448', '8806-8448', '-1-4', '1.5-4', '1-NaN'])(
    'rejects invalid inclusive frame range %s',
    (value) => {
      expect(() => parseInclusiveFrameRange(value)).toThrow();
    },
  );

  test('accepts exact full-proof probe metadata and exposes counted packets', () => {
    const summary = verifyProofProbe(
      {
        streams: [
          {
            codec_type: 'video',
            codec_name: 'h264',
            codec_tag_string: 'avc1',
            width: 1_080,
            height: 1_080,
            pix_fmt: 'yuv420p',
            color_range: 'tv',
            color_space: 'bt709',
            color_transfer: 'bt709',
            color_primaries: 'bt709',
            avg_frame_rate: '120/1',
            r_frame_rate: '120/1',
            start_time: '0.000000',
            duration: '153.000000',
            nb_read_frames: '18360',
          },
          {
            codec_type: 'audio',
            codec_name: 'aac',
            sample_rate: '44100',
            channels: 2,
            start_time: '0.000000',
            duration: '153.000000',
            nb_read_packets: '6590',
          },
        ],
        format: {duration: '153.000000', start_time: '0.000000'},
      },
      {
        expectedFrameCount: 18_360,
        expectedDurationSeconds: 153,
        requireAudio: true,
      },
    );

    expect(summary).toMatchObject({
      frameCount: 18_360,
      frameRate: '120/1',
      dimensions: '1080x1080',
      audioPacketCount: 6_590,
    });
  });

  test('rejects a stale or incomplete proof probe', () => {
    expect(() =>
      verifyProofProbe(
        {
          streams: [
            {
              codec_type: 'video',
              codec_name: 'h264',
              codec_tag_string: 'avc1',
              width: 1_080,
              height: 1_080,
              pix_fmt: 'yuv420p',
              color_range: 'tv',
              color_space: 'bt709',
              color_transfer: 'bt709',
              color_primaries: 'bt709',
              avg_frame_rate: '120/1',
              r_frame_rate: '120/1',
              start_time: '0.000000',
              duration: '152.991667',
              nb_read_frames: '18359',
            },
          ],
          format: {duration: '152.991667', start_time: '0.000000'},
        },
        {
          expectedFrameCount: 18_360,
          expectedDurationSeconds: 153,
          requireAudio: true,
        },
      ),
    ).toThrow(/18,360 decoded video frames/);
  });

  test('requires unchanged AAC packet count and packet-stream hash', () => {
    const identity = {packetCount: 6_590, streamHash: 'SHA256=abc123'};
    expect(() => verifyAudioPacketIdentity(identity, identity)).not.toThrow();
    expect(() =>
      verifyAudioPacketIdentity(identity, {...identity, packetCount: 6_589}),
    ).toThrow(/packet count mismatch/);
    expect(() =>
      verifyAudioPacketIdentity(identity, {...identity, streamHash: 'SHA256=def456'}),
    ).toThrow(/packet hash mismatch/);
  });
});
