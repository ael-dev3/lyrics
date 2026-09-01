import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readdirSync,
  realpathSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import {
  basename,
  dirname,
  isAbsolute,
  posix,
  resolve,
  win32,
} from 'node:path';
import {lyrics, presentationMilestones} from '../src/timed-lyrics';
import {taniseaAlignment} from '../src/timing/tanisea-alignment';
import {
  frameForSample,
  PROOF_FPS,
  PUBLIC_FPS,
  SAMPLE_RATE,
} from '../src/timing/alignment-types';

export type QaMediaSource = 'public' | 'proof' | 'reference';

export type CommandPlan = Readonly<{
  executable: 'ffmpeg';
  arguments: readonly string[];
}>;

export type ClipVariant = Readonly<{
  speed: 'normal' | 'half';
  path: string;
  command: CommandPlan;
}>;

export type ReviewRange = Readonly<{
  id: string;
  source: 'public' | 'proof';
  centerSample: number;
  startSample: number;
  endSample: number;
  variants: readonly ClipVariant[];
}>;

export type ContactFrame = Readonly<{
  id: string;
  lineId: 'C1-04' | 'V1-03' | 'V1-08';
  cueId: string;
  cueStartSample: number;
  cadenceFps: 60 | 120;
  offsetFrames: -1 | 0 | 1 | 2;
  frame: number;
  path: string;
  command: CommandPlan;
}>;

export type ContactSheet = Readonly<{
  id: string;
  lineId: 'C1-04' | 'V1-03' | 'V1-08';
  cadenceFps: 60 | 120;
  path: string;
  contactIds: readonly string[];
  labels: readonly string[];
  command: CommandPlan;
}>;

export type SelectedStill = Readonly<{
  id: string;
  source: QaMediaSource;
  frame: number;
  width: 1080 | 2160;
  height: 1080 | 2160;
  path: string;
  command: CommandPlan;
}>;

export type QaMediaPlan = Readonly<{
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

export type QaMediaArtifactRecord = Readonly<{
  path: string;
  sha256: string;
  sizeBytes: number;
}>;

export type QaMediaManifest = Readonly<{
  schemaVersion: 1;
  artifactCount: number;
  artifacts: readonly QaMediaArtifactRecord[];
}>;

type QaMediaOutputSafetyOptions = Readonly<{
  qaRoot: string;
  outputPaths: readonly string[];
  existingEntries: readonly string[];
  protectedInputs: readonly string[];
  canonicalize: (path: string) => string;
}>;

const SOURCE_MEDIA_PATHS = {
  public:
    'output/Tanisea-Lyric-Film-vNext-60fps-Archival-Master.mp4',
  proof: 'output/Tanisea-Lyric-Film-Sync-Proof-120fps.mp4',
  reference: 'output/Tanisea-Lyric-Film-vNext-reference-2x.mov',
} as const satisfies Readonly<Record<QaMediaSource, string>>;

const HIGH_RISK_LINE_IDS = ['C1-04', 'V1-03', 'V1-08'] as const;
const EXPECTED_HIGH_RISK_CUE_IDS = [
  'C1-04-C01',
  'C1-04-C02',
  'C1-04-C03',
  'V1-03-C01',
  'V1-03-C02',
  'V1-03-C03',
  'V1-08-C01',
  'V1-08-C02',
  'V1-08-C03',
  'V1-08-C04',
] as const;
const CONTACT_CADENCES = [PUBLIC_FPS, PROOF_FPS] as const;
const CONTACT_OFFSETS = [-1, 0, 1, 2] as const;

const requireValue: (
  condition: unknown,
  message: string,
) => asserts condition = (condition, message) => {
  if (!condition) throw new Error(message);
};

const secondsForSample = (sample: number): string =>
  (sample / SAMPLE_RATE).toFixed(9);

const sourceMediaPath = (source: QaMediaSource): string =>
  SOURCE_MEDIA_PATHS[source];

const clipCommand = (
  source: 'public' | 'proof',
  startSample: number,
  endSample: number,
  speed: 'normal' | 'half',
  outputPath: string,
): CommandPlan => ({
  executable: 'ffmpeg',
  arguments: [
    '-hide_banner',
    '-v',
    'error',
    '-xerror',
    '-nostdin',
    '-ss',
    secondsForSample(startSample),
    '-t',
    secondsForSample(endSample - startSample),
    '-i',
    sourceMediaPath(source),
    '-map',
    '0:v:0',
    '-map',
    '0:a:0',
    ...(speed === 'half'
      ? ['-vf', 'setpts=2*PTS', '-af', 'atempo=0.5']
      : []),
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    '18',
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-movflags',
    '+faststart',
    '-map_metadata',
    '-1',
    '-shortest',
    '-n',
    outputPath,
  ],
});

const createReviewRange = (
  id: string,
  source: 'public' | 'proof',
  centerSample: number,
): ReviewRange => {
  const startSample = Math.max(0, centerSample - SAMPLE_RATE);
  const endSample = Math.min(
    presentationMilestones.publicTimelineEndSample,
    centerSample + SAMPLE_RATE,
  );
  const variant = (speed: 'normal' | 'half'): ClipVariant => {
    const path = `clips/${source}/${id}-${speed}.mp4`;
    return {
      speed,
      path,
      command: clipCommand(source, startSample, endSample, speed, path),
    };
  };

  return {
    id,
    source,
    centerSample,
    startSample,
    endSample,
    variants: [variant('normal'), variant('half')],
  };
};

const lineStartSample = (lineId: string): number => {
  const line = lyrics.find(({id}) => id === lineId);
  requireValue(line, `Reviewed timed lyric ${lineId} is missing`);
  return line.vocalStartSample;
};

const stillCommand = (
  source: QaMediaSource,
  frame: number,
  outputPath: string,
): CommandPlan => ({
  executable: 'ffmpeg',
  arguments: [
    '-hide_banner',
    '-v',
    'error',
    '-xerror',
    '-nostdin',
    '-i',
    sourceMediaPath(source),
    '-vf',
    `select=eq(n\\,${frame})`,
    '-frames:v',
    '1',
    '-fps_mode',
    'vfr',
    '-n',
    outputPath,
  ],
});

const contactCommand = (
  source: 'public' | 'proof',
  frame: number,
  outputPath: string,
): CommandPlan => stillCommand(source, frame, outputPath);

const sheetCommand = (
  contacts: readonly ContactFrame[],
  labels: readonly string[],
  outputPath: string,
): CommandPlan => {
  requireValue(
    contacts.length === labels.length && contacts.length > 0,
    `Contact sheet ${outputPath} requires matching contacts and labels`,
  );
  const columns = 4;
  const cellSize = 480;
  const rows = Math.ceil(contacts.length / columns);
  const cellFilters = labels.map(
    (label, index) =>
      `[${index}:v]scale=${cellSize}:${cellSize},` +
      `drawtext=fontfile='public/SpaceGrotesk.ttf':text='${label}':` +
      'x=16:y=h-th-16:' +
      'fontcolor=white:fontsize=24:box=1:boxcolor=black@0.72[cell' +
      `${index}]`,
  );
  const layout = contacts
    .map(
      (_contact, index) =>
        `${(index % columns) * cellSize}_${Math.floor(index / columns) * cellSize}`,
    )
    .join('|');
  const stackInputs = contacts
    .map((_contact, index) => `[cell${index}]`)
    .join('');
  const stackFilter =
    `${stackInputs}xstack=inputs=${contacts.length}:layout=${layout}:` +
    `fill=black,format=rgb24[sheet]`;

  return {
    executable: 'ffmpeg',
    arguments: [
      '-hide_banner',
      '-v',
      'error',
      '-xerror',
      '-nostdin',
      ...contacts.flatMap(({path}) => ['-i', path]),
      '-filter_complex',
      [...cellFilters, stackFilter].join(';'),
      '-map',
      '[sheet]',
      '-frames:v',
      '1',
      '-f',
      'image2',
      '-s',
      `${columns * cellSize}x${rows * cellSize}`,
      '-n',
      outputPath,
    ],
  };
};

const createContacts = (): readonly ContactFrame[] => {
  const highRiskLines = taniseaAlignment.lines.filter(
    ({id}) => id === 'C1-04' || id === 'V1-03' || id === 'V1-08',
  );
  const cues = highRiskLines.flatMap((line) =>
    line.cues.map((cue) => ({
      lineId: line.id as (typeof HIGH_RISK_LINE_IDS)[number],
      cueId: cue.id,
      cueStartSample: cue.startSample,
    })),
  );
  requireValue(
    JSON.stringify(cues.map(({cueId}) => cueId)) ===
      JSON.stringify(EXPECTED_HIGH_RISK_CUE_IDS),
    'Reviewed C1-04/V1-03/V1-08 cue authority has drifted',
  );

  return cues.flatMap(({lineId, cueId, cueStartSample}) =>
    CONTACT_CADENCES.flatMap((cadenceFps) => {
      const cadence = cadenceFps === PUBLIC_FPS ? 'public' : 'proof';
      const baseFrame = frameForSample(cueStartSample, cadenceFps);
      return CONTACT_OFFSETS.map((offsetFrames) => {
        const frame = baseFrame + offsetFrames;
        const path =
          `contacts/${lineId.toLowerCase()}/${cadence}/` +
          `frame-${String(frame).padStart(6, '0')}.png`;
        return {
          id:
            `${cueId}-${cadenceFps}fps-offset-` +
            `${offsetFrames < 0 ? 'minus' : 'plus'}${Math.abs(offsetFrames)}`,
          lineId,
          cueId,
          cueStartSample,
          cadenceFps,
          offsetFrames,
          frame,
          path,
          command: contactCommand(cadence, frame, path),
        };
      });
    }),
  );
};

const createContactSheets = (
  contacts: readonly ContactFrame[],
): readonly ContactSheet[] =>
  HIGH_RISK_LINE_IDS.flatMap((lineId) =>
    CONTACT_CADENCES.map((cadenceFps) => {
      const cadence = cadenceFps === PUBLIC_FPS ? 'public' : 'proof';
      const sheetContacts = contacts.filter(
        (contact) =>
          contact.lineId === lineId && contact.cadenceFps === cadenceFps,
      );
      const labels = sheetContacts.map(
        ({cueId, frame, offsetFrames}) =>
          `${cueId} ${cadenceFps}fps frame ${frame} offset ${offsetFrames}`,
      );
      const path =
        `contact-sheets/${lineId.toLowerCase()}-${cadence}.png`;
      return {
        id: `${lineId.toLowerCase()}-${cadence}-contact-sheet`,
        lineId,
        cadenceFps,
        path,
        contactIds: sheetContacts.map(({id}) => id),
        labels,
        command: sheetCommand(sheetContacts, labels, path),
      };
    }),
  );

const selectedStill = (
  id: string,
  source: QaMediaSource,
  frame: number,
  width: 1080 | 2160,
  height: 1080 | 2160,
  path: string,
): SelectedStill => ({
  id,
  source,
  frame,
  width,
  height,
  path,
  command: stillCommand(source, frame, path),
});

export const createQaMediaPlan = (): QaMediaPlan => {
  requireValue(lyrics.length === 24, 'Expected exactly 24 reviewed lyric lines');

  const publicRanges = [
    ...lyrics.map(({id, vocalStartSample}) =>
      createReviewRange(`line-${id.toLowerCase()}`, 'public', vocalStartSample),
    ),
    createReviewRange('v1-03', 'public', lineStartSample('V1-03')),
    createReviewRange('v1-08', 'public', lineStartSample('V1-08')),
    createReviewRange('chorus-1', 'public', lineStartSample('C1-05')),
    createReviewRange('chorus-2', 'public', lineStartSample('C2-05')),
    createReviewRange(
      'final-handoff',
      'public',
      presentationMilestones.outroRevealStartSample,
    ),
  ];
  const proofRanges = [
    createReviewRange('v1-03', 'proof', lineStartSample('V1-03')),
    createReviewRange('v1-08', 'proof', lineStartSample('V1-08')),
  ];
  const contacts = createContacts();
  const contactSheets = createContactSheets(contacts);
  const selectedStills = [
    selectedStill(
      'chrome',
      'public',
      3844,
      1080,
      1080,
      'stills/public-chrome.png',
    ),
    selectedStill(
      'handoff',
      'public',
      7079,
      1080,
      1080,
      'stills/public-handoff.png',
    ),
    selectedStill(
      'focus',
      'public',
      4355,
      1080,
      1080,
      'stills/public-focus.png',
    ),
    selectedStill(
      'safe-area',
      'public',
      4458,
      1080,
      1080,
      'stills/public-safe-area.png',
    ),
    selectedStill(
      'spectrum-peak',
      'public',
      2306,
      1080,
      1080,
      'stills/public-spectrum-peak.png',
    ),
    selectedStill(
      'backward-contact',
      'proof',
      10394,
      1080,
      1080,
      'stills/proof-backward-contact.png',
    ),
    selectedStill(
      'final-transition',
      'reference',
      7092,
      2160,
      2160,
      'stills/reference-final-transition.png',
    ),
  ];

  return {
    schemaVersion: 1,
    authority: {
      timedLyrics: 'src/timed-lyrics.ts',
      alignmentManifest: 'alignment/tanisea-word-alignment-v3.json',
      roughHistoryUsed: false,
    },
    publicRanges,
    proofRanges,
    contacts,
    contactSheets,
    selectedStills,
  };
};

export const qaMediaOutputPaths = (
  plan: QaMediaPlan,
): readonly string[] => [
  ...plan.publicRanges.flatMap(({variants}) =>
    variants.map(({path}) => path),
  ),
  ...plan.proofRanges.flatMap(({variants}) =>
    variants.map(({path}) => path),
  ),
  ...plan.contacts.map(({path}) => path),
  ...plan.contactSheets.map(({path}) => path),
  ...plan.selectedStills.map(({path}) => path),
];

export const createCanonicalQaMediaManifest = (
  plan: QaMediaPlan,
  artifacts: readonly QaMediaArtifactRecord[],
): QaMediaManifest => {
  const plannedPaths = qaMediaOutputPaths(plan);
  const plannedSet = new Set(plannedPaths);
  requireValue(
    plannedSet.size === plannedPaths.length,
    'QA-media plan contains a duplicate artifact path',
  );

  const artifactPaths = new Set<string>();
  for (const artifact of artifacts) {
    requireValue(
      typeof artifact.path === 'string' && artifact.path.length > 0,
      'QA-media artifact path must be nonempty',
    );
    requireValue(
      !artifactPaths.has(artifact.path),
      `Duplicate QA-media artifact path: ${artifact.path}`,
    );
    artifactPaths.add(artifact.path);
    requireValue(
      /^[0-9a-f]{64}$/.test(artifact.sha256),
      `QA-media artifact ${artifact.path} has an invalid SHA-256`,
    );
    requireValue(
      Number.isSafeInteger(artifact.sizeBytes) && artifact.sizeBytes > 0,
      `QA-media artifact ${artifact.path} has an invalid size`,
    );
  }

  const missingPaths = plannedPaths.filter((path) => !artifactPaths.has(path));
  requireValue(
    missingPaths.length === 0,
    `QA-media manifest is missing planned artifact ${missingPaths[0] ?? ''}`,
  );
  const extraPaths = [...artifactPaths].filter((path) => !plannedSet.has(path));
  requireValue(
    extraPaths.length === 0,
    `QA-media manifest contains extra unplanned artifact ${extraPaths[0] ?? ''}`,
  );

  const sortedArtifacts = artifacts
    .map(({path, sha256, sizeBytes}) => ({path, sha256, sizeBytes}))
    .sort((left, right) =>
      left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
    );
  return {
    schemaVersion: 1,
    artifactCount: sortedArtifacts.length,
    artifacts: sortedArtifacts,
  };
};

const normalizedCanonicalKey = (value: string, label: string): string => {
  requireValue(
    typeof value === 'string' && value.trim().length > 0,
    `${label} canonical path must be nonempty`,
  );
  return value.replaceAll('\\', '/').replace(/\/+$/, '');
};

const rootPathLibrary = (path: string): typeof win32 | typeof posix =>
  win32.isAbsolute(path) || /^[A-Za-z]:/.test(path) ? win32 : posix;

const validateRelativeOutputPath = (path: string): readonly string[] => {
  requireValue(
    typeof path === 'string' && path.length > 0 && path === path.trim(),
    'QA-media output path must be a nonempty canonical relative path',
  );
  requireValue(
    !path.includes('\\') &&
      !isAbsolute(path) &&
      !win32.isAbsolute(path) &&
      !posix.isAbsolute(path) &&
      !/^[A-Za-z]:/.test(path),
    `QA-media output path must be canonical and relative: ${path}`,
  );
  const segments = path.split('/');
  requireValue(
    segments.every(
      (segment) =>
        segment.length > 0 &&
        segment !== '.' &&
        segment !== '..' &&
        !segment.includes('\0'),
    ),
    `QA-media output path contains traversal or an empty segment: ${path}`,
  );
  requireValue(
    posix.normalize(path) === path,
    `QA-media output path is not canonical: ${path}`,
  );
  return segments;
};

export const verifyQaMediaOutputSafety = ({
  qaRoot,
  outputPaths,
  existingEntries,
  protectedInputs,
  canonicalize,
}: QaMediaOutputSafetyOptions): void => {
  requireValue(
    typeof qaRoot === 'string' && qaRoot.trim().length > 0,
    'QA-media root path must be nonempty',
  );
  requireValue(
    existingEntries.length === 0,
    `QA-media root must be empty; found stale/nonempty entry ${existingEntries[0] ?? ''}`,
  );
  requireValue(
    outputPaths.length > 0,
    'QA-media output path plan must not be empty',
  );

  const pathLibrary = rootPathLibrary(qaRoot);
  const absoluteRoot = pathLibrary.resolve(qaRoot);
  const rootCanonical = normalizedCanonicalKey(
    canonicalize(absoluteRoot),
    'QA-media root',
  );
  const protectedCanonicalPaths = new Map(
    protectedInputs.map((path) => [
      normalizedCanonicalKey(
        canonicalize(pathLibrary.resolve(path)),
        `Protected input ${path}`,
      ),
      path,
    ]),
  );
  requireValue(
    !protectedCanonicalPaths.has(rootCanonical),
    'QA-media root aliases a protected input',
  );

  const rawPaths = new Set<string>();
  const canonicalPaths = new Map<string, string>();
  for (const outputPath of outputPaths) {
    const segments = validateRelativeOutputPath(outputPath);
    requireValue(
      !rawPaths.has(outputPath),
      `Duplicate QA-media output path collision: ${outputPath}`,
    );
    rawPaths.add(outputPath);

    const absoluteOutput = pathLibrary.resolve(absoluteRoot, ...segments);
    const outputCanonical = normalizedCanonicalKey(
      canonicalize(absoluteOutput),
      `QA-media output ${outputPath}`,
    );
    const protectedPath = protectedCanonicalPaths.get(outputCanonical);
    requireValue(
      protectedPath === undefined,
      `QA-media output path ${outputPath} aliases protected input ${protectedPath ?? ''}`,
    );
    requireValue(
      outputCanonical !== rootCanonical,
      `Canonical collision: QA-media output ${outputPath} aliases the QA root`,
    );
    requireValue(
      outputCanonical.startsWith(`${rootCanonical}/`),
      `QA-media output path resolves outside the canonical root: ${outputPath}`,
    );
    const previousPath = canonicalPaths.get(outputCanonical);
    requireValue(
      previousPath === undefined,
      `Canonical alias collision between ${previousPath ?? ''} and ${outputPath}`,
    );
    canonicalPaths.set(outputCanonical, outputPath);
  }
};

const canonicalFilesystemPath = (path: string): string => {
  const unresolvedSegments: string[] = [];
  let existingAncestor = resolve(path);
  while (!existsSync(existingAncestor)) {
    const parent = dirname(existingAncestor);
    requireValue(
      parent !== existingAncestor,
      `Unable to resolve an existing ancestor for ${path}`,
    );
    unresolvedSegments.push(basename(existingAncestor));
    existingAncestor = parent;
  }
  const filesystemPath = resolve(
    realpathSync.native(existingAncestor),
    ...unresolvedSegments.reverse(),
  );
  const normalized = filesystemPath.replaceAll('/', '\\');
  return process.platform === 'win32'
    ? normalized.toLocaleLowerCase('en-US')
    : filesystemPath;
};

const projectRootFromModule = (): string => {
  const parent = resolve(__dirname, '..');
  return basename(parent) === '.tools-dist' ? resolve(parent, '..') : parent;
};

const allCommands = (plan: QaMediaPlan): readonly CommandPlan[] => [
  ...plan.publicRanges.flatMap(({variants}) =>
    variants.map(({command}) => command),
  ),
  ...plan.proofRanges.flatMap(({variants}) =>
    variants.map(({command}) => command),
  ),
  ...plan.contacts.map(({command}) => command),
  ...plan.contactSheets.map(({command}) => command),
  ...plan.selectedStills.map(({command}) => command),
];

const executePlannedCommand = (
  command: CommandPlan,
  projectRoot: string,
  qaRoot: string,
  outputPaths: ReadonlySet<string>,
): void => {
  const argumentsList = command.arguments.map((argument, index, argumentsArray) => {
    if (outputPaths.has(argument)) {
      return index === argumentsArray.length - 1 || argumentsArray[index - 1] === '-i'
        ? resolve(qaRoot, ...argument.split('/'))
        : argument;
    }
    if (argumentsArray[index - 1] === '-i') {
      return resolve(projectRoot, ...argument.split('/'));
    }
    return argument;
  });
  const outputPath = argumentsList.at(-1);
  requireValue(outputPath, 'Planned ffmpeg command is missing its output path');
  execFileSync(command.executable, argumentsList, {
    cwd: projectRoot,
    stdio: 'inherit',
  });
  requireValue(
    existsSync(outputPath) && statSync(outputPath).isFile() && statSync(outputPath).size > 0,
    `QA-media artifact was not created: ${outputPath}`,
  );
};

const streamingSha256 = async (path: string): Promise<string> => {
  const hash = createHash('sha256');
  await new Promise<void>((resolvePromise, rejectPromise) => {
    const stream = createReadStream(path);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.once('error', rejectPromise);
    stream.once('end', resolvePromise);
  });
  return hash.digest('hex');
};

const renderQaMedia = async (): Promise<void> => {
  const argumentsList = process.argv.slice(2);
  if (argumentsList.length === 1 && argumentsList[0] === '--help') {
    process.stdout.write('Usage: render-qa-clips\n');
    return;
  }
  requireValue(
    argumentsList.length === 0,
    `Unexpected argument: ${argumentsList[0] ?? ''}`,
  );

  const projectRoot = projectRootFromModule();
  const qaRoot = resolve(projectRoot, 'work', 'qa', 'media');
  const plan = createQaMediaPlan();
  const outputPaths = qaMediaOutputPaths(plan);
  const protectedInputs = Object.values(SOURCE_MEDIA_PATHS).map((path) =>
    resolve(projectRoot, ...path.split('/')),
  );

  for (const inputPath of protectedInputs) {
    requireValue(
      existsSync(inputPath) &&
        statSync(inputPath).isFile() &&
        statSync(inputPath).size > 0,
      `Required release media does not exist or is empty: ${inputPath}`,
    );
  }
  const existingEntries = existsSync(qaRoot) ? readdirSync(qaRoot) : [];
  verifyQaMediaOutputSafety({
    qaRoot,
    outputPaths,
    existingEntries,
    protectedInputs,
    canonicalize: canonicalFilesystemPath,
  });

  mkdirSync(qaRoot, {recursive: true});
  for (const path of outputPaths) {
    mkdirSync(dirname(resolve(qaRoot, ...path.split('/'))), {recursive: true});
  }

  const outputPathSet = new Set(outputPaths);
  for (const command of allCommands(plan)) {
    executePlannedCommand(command, projectRoot, qaRoot, outputPathSet);
  }

  const artifacts: QaMediaArtifactRecord[] = [];
  for (const path of outputPaths) {
    const absolutePath = resolve(qaRoot, ...path.split('/'));
    const statistics = statSync(absolutePath);
    requireValue(
      statistics.isFile() && statistics.size > 0,
      `QA-media artifact is missing or empty: ${path}`,
    );
    artifacts.push({
      path,
      sha256: await streamingSha256(absolutePath),
      sizeBytes: statistics.size,
    });
  }
  const manifest = createCanonicalQaMediaManifest(plan, artifacts);
  const manifestPath = resolve(qaRoot, 'qa-media-manifest.json');
  const temporaryManifestPath = resolve(
    qaRoot,
    '.qa-media-manifest.json.tmp',
  );
  writeFileSync(
    temporaryManifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    {encoding: 'utf8', flag: 'wx'},
  );
  renameSync(temporaryManifestPath, manifestPath);
  process.stdout.write(
    `${JSON.stringify({manifestPath: 'work/qa/media/qa-media-manifest.json', ...manifest}, null, 2)}\n`,
  );
};

const isCommonJsMain =
  typeof require !== 'undefined' &&
  typeof module !== 'undefined' &&
  require.main === module;

if (isCommonJsMain) {
  void renderQaMedia().catch((error: unknown) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  });
}
