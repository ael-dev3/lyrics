import {win32} from 'node:path';
import {describe, expect, test, vi} from 'vitest';
import {lyrics, presentationMilestones} from '../src/timed-lyrics';
import {taniseaAlignment} from '../src/timing/tanisea-alignment';
import {
  PUBLIC_FPS,
  PROOF_FPS,
  SAMPLE_RATE,
  frameForSample,
} from '../src/timing/alignment-types';

const importIo = vi.hoisted(() => {
  const childProcess = vi.fn(() => '');
  const filesystemRead = vi.fn(() => Buffer.alloc(0));
  const filesystemMutation = vi.fn();
  const stdoutWrite = vi.spyOn(process.stdout, 'write');
  stdoutWrite.mockImplementation(() => true);
  return {
    childProcess,
    filesystemMutation,
    filesystemRead,
    stdoutWrite,
  };
});

vi.mock('node:child_process', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:child_process')>()),
  execFileSync: importIo.childProcess,
  spawnSync: importIo.childProcess,
}));

vi.mock('node:fs', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:fs')>()),
  closeSync: importIo.filesystemRead,
  existsSync: importIo.filesystemRead,
  mkdirSync: importIo.filesystemMutation,
  openSync: importIo.filesystemRead,
  readFileSync: importIo.filesystemRead,
  readSync: importIo.filesystemRead,
  readdirSync: importIo.filesystemRead,
  realpathSync: importIo.filesystemRead,
  renameSync: importIo.filesystemMutation,
  rmSync: importIo.filesystemMutation,
  statSync: importIo.filesystemRead,
  unlinkSync: importIo.filesystemMutation,
  writeFileSync: importIo.filesystemMutation,
}));

vi.mock('node:fs/promises', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:fs/promises')>()),
  mkdir: importIo.filesystemMutation,
  readFile: importIo.filesystemRead,
  readdir: importIo.filesystemRead,
  realpath: importIo.filesystemRead,
  rename: importIo.filesystemMutation,
  rm: importIo.filesystemMutation,
  stat: importIo.filesystemRead,
  unlink: importIo.filesystemMutation,
  writeFile: importIo.filesystemMutation,
}));

type QaMediaSource = 'public' | 'proof' | 'reference';

type CommandPlan = Readonly<{
  executable: 'ffmpeg';
  arguments: readonly string[];
}>;

type ClipVariant = Readonly<{
  speed: 'normal' | 'half';
  path: string;
  command: CommandPlan;
}>;

type ReviewRange = Readonly<{
  id: string;
  source: 'public' | 'proof';
  centerSample: number;
  startSample: number;
  endSample: number;
  variants: readonly ClipVariant[];
}>;

type ContactFrame = Readonly<{
  id: string;
  lineId: 'V1-03' | 'V1-08';
  cueId: string;
  cueStartSample: number;
  cadenceFps: 60 | 120;
  offsetFrames: -1 | 0 | 1 | 2;
  frame: number;
  path: string;
}>;

type ContactSheet = Readonly<{
  id: string;
  lineId: 'V1-03' | 'V1-08';
  cadenceFps: 60 | 120;
  path: string;
  contactIds: readonly string[];
  labels: readonly string[];
  command: CommandPlan;
}>;

type SelectedStill = Readonly<{
  id: string;
  source: QaMediaSource;
  frame: number;
  width: 1080 | 2160;
  height: 1080 | 2160;
  path: string;
  command: CommandPlan;
}>;

type QaMediaPlan = Readonly<{
  schemaVersion: 1;
  authority: Readonly<{
    timedLyrics: 'src/timed-lyrics.ts';
    alignmentManifest: 'alignment/tanisea-word-alignment-v3.json';
    roughHistoryUsed: false;
  }>;
  publicRanges: readonly ReviewRange[];
  proofRanges: readonly ReviewRange[];
  contacts: readonly ContactFrame[];
  contactSheets: readonly ContactSheet[];
  selectedStills: readonly SelectedStill[];
}>;

type QaMediaArtifactRecord = Readonly<{
  path: string;
  sha256: string;
  sizeBytes: number;
}>;

type QaMediaManifest = Readonly<{
  schemaVersion: 1;
  artifactCount: number;
  artifacts: readonly QaMediaArtifactRecord[];
}>;

type QaMediaApi = Readonly<{
  createQaMediaPlan: () => QaMediaPlan;
  qaMediaOutputPaths: (plan: QaMediaPlan) => readonly string[];
  createCanonicalQaMediaManifest: (
    plan: QaMediaPlan,
    artifacts: readonly QaMediaArtifactRecord[],
  ) => QaMediaManifest;
  verifyQaMediaOutputSafety: (options: Readonly<{
    qaRoot: string;
    outputPaths: readonly string[];
    existingEntries: readonly string[];
    protectedInputs: readonly string[];
    canonicalize: (path: string) => string;
  }>) => void;
}>;

const qaMediaModuleSpecifier = '../scripts/render-qa-clips';
const qaMediaModule = (await import(
  /* @vite-ignore */ qaMediaModuleSpecifier
).catch(() => ({}))) as Partial<QaMediaApi>;

const importSideEffects = {
  childProcesses: importIo.childProcess.mock.calls.length,
  filesystemMutations: importIo.filesystemMutation.mock.calls.length,
  filesystemReads: importIo.filesystemRead.mock.calls.length,
  stdoutWrites: importIo.stdoutWrite.mock.calls.length,
};
importIo.stdoutWrite.mockRestore();

const requireApi = <Name extends keyof QaMediaApi>(
  name: Name,
): QaMediaApi[Name] => {
  const value = qaMediaModule[name];
  expect(value, `render-qa-clips must export ${name}`).toBeTypeOf('function');
  return value as QaMediaApi[Name];
};

const createPlan = (): QaMediaPlan => requireApi('createQaMediaPlan')();

const highRiskCueAuthorities = taniseaAlignment.lines
  .filter(({id}) => id === 'V1-03' || id === 'V1-08')
  .flatMap(({id, cues}) =>
    cues.map((cue) => ({
      lineId: id as 'V1-03' | 'V1-08',
      cueId: cue.id,
      startSample: cue.startSample,
    })),
  );

const expectedStillAuthorities = [
  {
    id: 'chrome',
    source: 'public',
    frame: 3844,
    width: 1080,
    height: 1080,
    path: 'stills/public-chrome.png',
  },
  {
    id: 'handoff',
    source: 'public',
    frame: 7079,
    width: 1080,
    height: 1080,
    path: 'stills/public-handoff.png',
  },
  {
    id: 'focus',
    source: 'public',
    frame: 4355,
    width: 1080,
    height: 1080,
    path: 'stills/public-focus.png',
  },
  {
    id: 'safe-area',
    source: 'public',
    frame: 4458,
    width: 1080,
    height: 1080,
    path: 'stills/public-safe-area.png',
  },
  {
    id: 'spectrum-peak',
    source: 'public',
    frame: 2306,
    width: 1080,
    height: 1080,
    path: 'stills/public-spectrum-peak.png',
  },
  {
    id: 'backward-contact',
    source: 'proof',
    frame: 10394,
    width: 1080,
    height: 1080,
    path: 'stills/proof-backward-contact.png',
  },
  {
    id: 'final-transition',
    source: 'reference',
    frame: 7092,
    width: 2160,
    height: 2160,
    path: 'stills/reference-final-transition.png',
  },
] as const;

describe('QA-media authority plan', () => {
  test('performs no process, filesystem, or stdout I/O on import', () => {
    expect(importSideEffects).toEqual({
      childProcesses: 0,
      filesystemMutations: 0,
      filesystemReads: 0,
      stdoutWrites: 0,
    });
  });

  test('exports an import-safe deterministic planning API', () => {
    expect(requireApi('createQaMediaPlan')).toBeTypeOf('function');
    expect(requireApi('qaMediaOutputPaths')).toBeTypeOf('function');
    expect(requireApi('createCanonicalQaMediaManifest')).toBeTypeOf(
      'function',
    );
    expect(requireApi('verifyQaMediaOutputSafety')).toBeTypeOf('function');
  });

  test('declares only the accepted timing authorities', () => {
    expect(createPlan().authority).toEqual({
      timedLyrics: 'src/timed-lyrics.ts',
      alignmentManifest: 'alignment/tanisea-word-alignment-v3.json',
      roughHistoryUsed: false,
    });
  });

  test('creates exactly 24 line-contact and five dedicated public ranges', () => {
    const publicRanges = createPlan().publicRanges;
    const lineRanges = publicRanges.filter(({id}) => id.startsWith('line-'));
    const dedicatedRanges = publicRanges.filter(
      ({id}) => !id.startsWith('line-'),
    );

    expect(publicRanges).toHaveLength(29);
    expect(lineRanges).toHaveLength(24);
    expect(lineRanges.map(({id}) => id)).toEqual(
      lyrics.map(({id}) => `line-${id.toLowerCase()}`),
    );
    expect(dedicatedRanges.map(({id}) => id).sort()).toEqual([
      'chorus-1',
      'chorus-2',
      'final-handoff',
      'v1-03',
      'v1-08',
    ]);
  });

  test('centers every public line-contact range on reviewed vocal timing', () => {
    const rangesById = new Map(
      createPlan().publicRanges.map((range) => [range.id, range] as const),
    );
    for (const line of lyrics) {
      const range = rangesById.get(`line-${line.id.toLowerCase()}`);
      expect(range?.centerSample, line.id).toBe(line.vocalStartSample);
      expect(range?.startSample, line.id).toBe(
        Math.max(0, line.vocalStartSample - SAMPLE_RATE),
      );
      expect(range?.endSample, line.id).toBe(
        Math.min(
          presentationMilestones.publicTimelineEndSample,
          line.vocalStartSample + SAMPLE_RATE,
        ),
      );
    }
  });

  test('creates only the two dedicated proof ranges', () => {
    expect(createPlan().proofRanges.map(({id}) => id).sort()).toEqual([
      'v1-03',
      'v1-08',
    ]);
  });

  test('keeps every review range ordered and inside the public timeline', () => {
    const plan = createPlan();
    for (const range of [...plan.publicRanges, ...plan.proofRanges]) {
      expect(range.startSample, range.id).toBeGreaterThanOrEqual(0);
      expect(range.centerSample, range.id).toBeGreaterThanOrEqual(
        range.startSample,
      );
      expect(range.centerSample, range.id).toBeLessThanOrEqual(range.endSample);
      expect(range.endSample, range.id).toBeLessThanOrEqual(
        presentationMilestones.publicTimelineEndSample,
      );
    }
  });

  test('emits normal and pitch-preserved half-speed variants for all 31 ranges', () => {
    const plan = createPlan();
    const ranges = [...plan.publicRanges, ...plan.proofRanges];
    expect(ranges).toHaveLength(31);

    for (const range of ranges) {
      expect(range.variants.map(({speed}) => speed)).toEqual([
        'normal',
        'half',
      ]);
      const normal = range.variants[0]!;
      const half = range.variants[1]!;
      expect(normal.command.executable).toBe('ffmpeg');
      expect(normal.command.arguments.join(' ')).not.toContain('setpts=2*PTS');
      expect(normal.command.arguments.join(' ')).not.toContain('atempo=0.5');
      expect(half.command.executable).toBe('ffmpeg');
      expect(half.command.arguments).toContain('setpts=2*PTS');
      expect(half.command.arguments).toContain('atempo=0.5');
      expect(normal.path).toMatch(
        new RegExp(`^clips/${range.source}/${range.id}-normal\\.mp4$`),
      );
      expect(half.path).toMatch(
        new RegExp(`^clips/${range.source}/${range.id}-half\\.mp4$`),
      );
    }
  });
});

describe('cue-contact and sheet plan', () => {
  test('derives seven high-risk cues from the reviewed alignment', () => {
    expect(highRiskCueAuthorities.map(({cueId}) => cueId)).toEqual([
      'V1-03-C01',
      'V1-03-C02',
      'V1-03-C03',
      'V1-08-C01',
      'V1-08-C02',
      'V1-08-C03',
      'V1-08-C04',
    ]);
  });

  test('emits exactly 56 cadence-specific contact PNGs at offsets -1 through +2', () => {
    const contacts = createPlan().contacts;
    expect(contacts).toHaveLength(56);

    for (const cue of highRiskCueAuthorities) {
      for (const cadenceFps of [PUBLIC_FPS, PROOF_FPS] as const) {
        const cueContacts = contacts.filter(
          (contact) =>
            contact.cueId === cue.cueId &&
            contact.cadenceFps === cadenceFps,
        );
        expect(cueContacts.map(({offsetFrames}) => offsetFrames)).toEqual([
          -1,
          0,
          1,
          2,
        ]);
        for (const contact of cueContacts) {
          const expectedFrame =
            frameForSample(cue.startSample, cadenceFps) +
            contact.offsetFrames;
          const cadence = cadenceFps === PUBLIC_FPS ? 'public' : 'proof';
          expect(contact.lineId).toBe(cue.lineId);
          expect(contact.cueStartSample).toBe(cue.startSample);
          expect(contact.frame).toBe(expectedFrame);
          expect(contact.path).toBe(
            `contacts/${cue.lineId.toLowerCase()}/${cadence}/` +
              `frame-${String(expectedFrame).padStart(6, '0')}.png`,
          );
        }
      }
    }
  });

  test('retains the exact representative V1-03 public contact authority', () => {
    const representative = createPlan().contacts.find(
      ({cueId, cadenceFps, offsetFrames}) =>
        cueId === 'V1-03-C01' &&
        cadenceFps === PUBLIC_FPS &&
        offsetFrames === 0,
    );
    expect(representative).toMatchObject({
      frame: 4224,
      path: 'contacts/v1-03/public/frame-004224.png',
    });
  });

  test('emits exactly four contact sheets with authoritative paths', () => {
    const sheets = createPlan().contactSheets;
    expect(sheets.map(({path}) => path).sort()).toEqual([
      'contact-sheets/v1-03-proof.png',
      'contact-sheets/v1-03-public.png',
      'contact-sheets/v1-08-proof.png',
      'contact-sheets/v1-08-public.png',
    ]);
  });

  test('labels every sheet cell with cue, cadence, frame, and offset identity', () => {
    const plan = createPlan();
    const contactsById = new Map(
      plan.contacts.map((contact) => [contact.id, contact] as const),
    );
    for (const sheet of plan.contactSheets) {
      expect(sheet.contactIds).toHaveLength(sheet.labels.length);
      expect(sheet.contactIds.length).toBeGreaterThan(0);
      for (const [index, contactId] of sheet.contactIds.entries()) {
        const contact = contactsById.get(contactId);
        const label = sheet.labels[index];
        expect(contact, contactId).toBeDefined();
        expect(label).toContain(contact!.cueId);
        expect(label).toContain(`${contact!.cadenceFps}fps`);
        expect(label).toContain(`frame ${contact!.frame}`);
        expect(label).toContain(`offset ${contact!.offsetFrames}`);
      }
    }
  });

  test('uses the tracked Space Grotesk font for deterministic sheet labels', () => {
    for (const sheet of createPlan().contactSheets) {
      const filterIndex = sheet.command.arguments.indexOf('-filter_complex');
      expect(filterIndex).toBeGreaterThan(-1);
      expect(sheet.command.arguments[filterIndex + 1]).toContain(
        "fontfile='public/SpaceGrotesk.ttf'",
      );
    }
  });
});

describe('selected encoded still authorities', () => {
  test('binds all seven exact source/frame/geometry/path authorities', () => {
    const stills = createPlan().selectedStills.map(
      ({id, source, frame, width, height, path}) => ({
        id,
        source,
        frame,
        width,
        height,
        path,
      }),
    );
    expect(stills).toEqual(expectedStillAuthorities);
  });

  test('extracts every still at its encoded frame without scaling', () => {
    for (const still of createPlan().selectedStills) {
      const command = still.command.arguments;
      expect(still.command.executable).toBe('ffmpeg');
      expect(command.join(' ')).toContain(`select=eq(n\\,${still.frame})`);
      expect(command).not.toContain('scale');
      expect(command.at(-1)).toBe(still.path);
    }
  });
});

describe('canonical QA-media manifest', () => {
  const completeArtifactRecords = (plan: QaMediaPlan) => {
    const outputPaths = requireApi('qaMediaOutputPaths')(plan);
    return outputPaths.map((path, index) => ({
      path,
      sha256: (index % 16).toString(16).repeat(64),
      sizeBytes: index + 1,
    }));
  };

  test('enumerates exactly 129 unique generated artifacts', () => {
    const paths = requireApi('qaMediaOutputPaths')(createPlan());
    expect(paths).toHaveLength(129);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toContain('contacts/v1-03/public/frame-004224.png');
    for (const still of expectedStillAuthorities) expect(paths).toContain(still.path);
  });

  test('sorts and hashes every planned artifact in one canonical manifest', () => {
    const plan = createPlan();
    const createManifest = requireApi('createCanonicalQaMediaManifest');
    const records = completeArtifactRecords(plan).reverse();
    const manifest = createManifest(plan, records);
    const sortedPaths = records.map(({path}) => path).sort();

    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.artifactCount).toBe(129);
    expect(manifest.artifacts.map(({path}) => path)).toEqual(sortedPaths);
    expect(manifest.artifacts.every(({sha256}) => /^[0-9a-f]{64}$/.test(sha256)))
      .toBe(true);
    expect(manifest.artifacts.every(({sizeBytes}) => sizeBytes > 0)).toBe(true);
  });

  test('rejects a manifest missing any planned artifact', () => {
    const plan = createPlan();
    const records = completeArtifactRecords(plan);
    expect(() =>
      requireApi('createCanonicalQaMediaManifest')(plan, records.slice(1)),
    ).toThrow(/missing|artifact/i);
  });

  test('rejects extra or duplicate artifact paths', () => {
    const plan = createPlan();
    const records = completeArtifactRecords(plan);
    const createManifest = requireApi('createCanonicalQaMediaManifest');
    expect(() =>
      createManifest(plan, [
        ...records,
        {path: 'extra/stale.png', sha256: 'a'.repeat(64), sizeBytes: 1},
      ]),
    ).toThrow(/extra|planned|artifact/i);
    expect(() => createManifest(plan, [...records, records[0]!])).toThrow(
      /duplicate|path/i,
    );
  });

  test.each([
    ['short hash', {sha256: 'a'.repeat(63)}],
    ['uppercase hash', {sha256: 'A'.repeat(64)}],
    ['zero size', {sizeBytes: 0}],
    ['nonfinite size', {sizeBytes: Number.POSITIVE_INFINITY}],
  ] as const)('rejects %s evidence', (_case, change) => {
    const plan = createPlan();
    const records = completeArtifactRecords(plan);
    records[0] = {...records[0]!, ...change};
    expect(() =>
      requireApi('createCanonicalQaMediaManifest')(plan, records),
    ).toThrow(/sha|size|artifact/i);
  });
});

describe('QA-media output preflight safety', () => {
  const qaRoot =
    'C:\\repo\\projects\\tanisea-lyric-film\\work\\qa\\media';
  const protectedInputs = [
    'C:\\repo\\projects\\tanisea-lyric-film\\public\\soundtrack.m4a',
    'C:\\repo\\projects\\tanisea-lyric-film\\output\\Tanisea-Lyric-Film-vNext-60fps-Archival-Master.mp4',
  ];
  const canonicalize = (path: string) =>
    win32.normalize(path).replaceAll('/', '\\').toLowerCase();

  const safetyOptions = () => ({
    qaRoot,
    outputPaths: [...requireApi('qaMediaOutputPaths')(createPlan())],
    existingEntries: [] as string[],
    protectedInputs,
    canonicalize,
  });

  test('accepts one empty canonical root with the complete unique plan', () => {
    expect(() =>
      requireApi('verifyQaMediaOutputSafety')(safetyOptions()),
    ).not.toThrow();
  });

  test('rejects a nonempty QA-media root before mutation', () => {
    expect(() =>
      requireApi('verifyQaMediaOutputSafety')({
        ...safetyOptions(),
        existingEntries: ['stale-output.mp4'],
      }),
    ).toThrow(/nonempty|empty|stale/i);
  });

  test.each([
    '../outside.png',
    'contacts/../../outside.png',
    'C:\\outside\\absolute.png',
    '/outside/absolute.png',
  ])('rejects unsafe output path %s', (unsafePath) => {
    expect(() =>
      requireApi('verifyQaMediaOutputSafety')({
        ...safetyOptions(),
        outputPaths: [unsafePath],
      }),
    ).toThrow(/path|outside|traversal|relative/i);
  });

  test('rejects duplicate and canonical-collision output paths', () => {
    const options = safetyOptions();
    const first = options.outputPaths[0]!;
    expect(() =>
      requireApi('verifyQaMediaOutputSafety')({
        ...options,
        outputPaths: [first, first],
      }),
    ).toThrow(/duplicate|collision/i);

    expect(() =>
      requireApi('verifyQaMediaOutputSafety')({
        ...options,
        outputPaths: ['a/first.png', 'b/second.png'],
        canonicalize: () => 'c:\\same\\artifact.png',
      }),
    ).toThrow(/alias|duplicate|collision/i);
  });

  test('rejects a canonical alias to a protected input', () => {
    const options = safetyOptions();
    const protectedCanonical = canonicalize(protectedInputs[0]!);
    expect(() =>
      requireApi('verifyQaMediaOutputSafety')({
        ...options,
        outputPaths: ['stills/public-chrome.png'],
        canonicalize: (path) =>
          path.endsWith('public-chrome.png')
            ? protectedCanonical
            : canonicalize(path),
      }),
    ).toThrow(/alias|protected|collision/i);
  });
});
