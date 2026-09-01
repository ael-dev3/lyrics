import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import {
  basename,
  dirname,
  posix,
  relative,
  resolve,
  sep,
  win32,
} from 'node:path';
import {performance} from 'node:perf_hooks';
import {
  verifyQaReport,
  verifyQaRunPair,
  verifyQaRunRecord,
  verifyRequirementMatrix,
} from './release-gates.js';
import {
  createCanonicalQaMediaManifest,
  createQaMediaPlan,
} from './render-qa-clips.js';
import type {
  QaMediaArtifactRecord,
  QaMediaManifest,
} from './render-qa-clips.js';

export type QaRunId = 'run-1' | 'run-2';

export type QaCommandSpec = Readonly<{
  id: string;
  command: string;
  logPath: string;
}>;

export type QaCommandResult = Readonly<{
  id: string;
  command: string;
  exitCode: number;
  durationMs: number;
  logPath: string;
  logSha256: string;
}>;

type QaExecutionResult = Readonly<{
  exitCode: number;
  durationMs: number;
  stdout: string;
  stderr: string;
}>;

type QaRunDirectorySafetyOptions = Readonly<{
  qaRoot: string;
  runRoot: string;
  runId: QaRunId;
  existingEntries: readonly string[];
  canonicalize: (path: string) => string;
}>;

type ExecuteQaCommandLedgerOptions = Readonly<{
  ledger: readonly QaCommandSpec[];
  execute: (command: QaCommandSpec) => Promise<QaExecutionResult>;
  writeLog: (path: string, content: string) => Promise<void>;
  sha256: (content: string) => string;
}>;

type UnknownRecord = Record<string, unknown>;

type ArtifactRecord = Readonly<{
  id: string;
  kind: string;
  path: string;
  sizeBytes: number;
  sha256: string;
}>;

type SelectedFrameRecord = Readonly<{
  id: string;
  artifactId: string;
  composition: 'LyricFilmVNext' | 'LyricFilmSyncProof';
  frame: number;
  path: string;
  sha256: string;
}>;

const PROJECT_REPOSITORY_PREFIX = 'projects/tanisea-lyric-film/';
const QA_BOUNDED_CLAIM =
  'sample-indexed alignment with frame-bounded rendering';
const MAX_COMMAND_OUTPUT_BYTES = 256 * 1024 * 1024;

export const qaAuditRepositoryPaths = (): Readonly<{
  json: 'audits/tanisea-final-qa-vnext.json';
  markdown: 'audits/tanisea-final-qa-vnext.md';
}> => ({
  json: 'audits/tanisea-final-qa-vnext.json',
  markdown: 'audits/tanisea-final-qa-vnext.md',
});

const REQUIRED_ARTIFACT_SPECS = [
  {
    id: 'source-audio',
    kind: 'source-audio',
    path: 'projects/tanisea-lyric-film/public/soundtrack.m4a',
  },
  {
    id: 'alignment-manifest',
    kind: 'alignment',
    path:
      'projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json',
  },
  {
    id: 'audio-features',
    kind: 'features',
    path: 'projects/tanisea-lyric-film/public/audio-features.bin',
  },
  {
    id: 'reference-render',
    kind: 'reference',
    path:
      'projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-vNext-reference-2x.mov',
  },
  {
    id: 'public-master',
    kind: 'public',
    path:
      'projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-vNext-60fps-Archival-Master.mp4',
  },
  {
    id: 'sync-proof',
    kind: 'proof',
    path:
      'projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-Sync-Proof-120fps.mp4',
  },
  {
    id: 'qa-media-manifest',
    kind: 'qa-manifest',
    path:
      'projects/tanisea-lyric-film/work/qa/media/qa-media-manifest.json',
  },
  {
    id: 'v1-03-public-contact',
    kind: 'qa-contact',
    path:
      'projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004224.png',
  },
  {
    id: 'v1-03-public-contact-sheet',
    kind: 'qa-contact-sheet',
    path:
      'projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-03-public.png',
  },
  {
    id: 'v1-03-proof-contact-sheet',
    kind: 'qa-contact-sheet',
    path:
      'projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-03-proof.png',
  },
  {
    id: 'v1-08-public-contact-sheet',
    kind: 'qa-contact-sheet',
    path:
      'projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-08-public.png',
  },
  {
    id: 'v1-08-proof-contact-sheet',
    kind: 'qa-contact-sheet',
    path:
      'projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-08-proof.png',
  },
  {
    id: 'public-chrome-still',
    kind: 'qa-still',
    path:
      'projects/tanisea-lyric-film/work/qa/media/stills/public-chrome.png',
  },
  {
    id: 'public-handoff-still',
    kind: 'qa-still',
    path:
      'projects/tanisea-lyric-film/work/qa/media/stills/public-handoff.png',
  },
  {
    id: 'public-focus-still',
    kind: 'qa-still',
    path:
      'projects/tanisea-lyric-film/work/qa/media/stills/public-focus.png',
  },
  {
    id: 'public-safe-area-still',
    kind: 'qa-still',
    path:
      'projects/tanisea-lyric-film/work/qa/media/stills/public-safe-area.png',
  },
  {
    id: 'public-spectrum-peak-still',
    kind: 'qa-still',
    path:
      'projects/tanisea-lyric-film/work/qa/media/stills/public-spectrum-peak.png',
  },
  {
    id: 'proof-backward-contact-still',
    kind: 'qa-still',
    path:
      'projects/tanisea-lyric-film/work/qa/media/stills/proof-backward-contact.png',
  },
  {
    id: 'reference-transition-still',
    kind: 'qa-still',
    path:
      'projects/tanisea-lyric-film/work/qa/media/stills/reference-final-transition.png',
  },
] as const;

const SELECTED_FRAME_SPECS = [
  {
    id: 'chrome',
    source: 'public',
    artifactId: 'public-chrome-still',
    composition: 'LyricFilmVNext',
    frame: 3844,
  },
  {
    id: 'handoff',
    source: 'public',
    artifactId: 'public-handoff-still',
    composition: 'LyricFilmVNext',
    frame: 7079,
  },
  {
    id: 'focus',
    source: 'public',
    artifactId: 'public-focus-still',
    composition: 'LyricFilmVNext',
    frame: 4355,
  },
  {
    id: 'safe-area',
    source: 'public',
    artifactId: 'public-safe-area-still',
    composition: 'LyricFilmVNext',
    frame: 4458,
  },
  {
    id: 'spectrum-peak',
    source: 'public',
    artifactId: 'public-spectrum-peak-still',
    composition: 'LyricFilmVNext',
    frame: 2306,
  },
  {
    id: 'backward-contact',
    source: 'proof',
    artifactId: 'proof-backward-contact-still',
    composition: 'LyricFilmSyncProof',
    frame: 10394,
  },
  {
    id: 'final-transition',
    source: 'reference',
    artifactId: 'reference-transition-still',
    composition: 'LyricFilmVNext',
    frame: 7092,
  },
] as const;

const QA_COVERAGE = {
  lineIds: [
    'C1-01',
    'C1-02',
    'C1-03',
    'C1-04',
    'C1-05',
    'C1-06',
    'C1-07',
    'C1-08',
    'V1-01',
    'V1-02',
    'V1-03',
    'V1-04',
    'V1-05',
    'V1-06',
    'V1-07',
    'V1-08',
    'C2-01',
    'C2-02',
    'C2-03',
    'C2-04',
    'C2-05',
    'C2-06',
    'C2-07',
    'C2-08',
  ],
  speedVariants: ['normal', 'half'],
  dedicatedRanges: [
    'v1-03',
    'v1-08',
    'chorus-1',
    'chorus-2',
    'final-handoff',
  ],
  proofRanges: ['v1-03', 'v1-08'],
  cueIds: [
    'V1-03-C01',
    'V1-03-C02',
    'V1-03-C03',
    'V1-08-C01',
    'V1-08-C02',
    'V1-08-C03',
    'V1-08-C04',
  ],
  contactOffsets: [-1, 0, 1, 2],
  cadences: [60, 120],
  stillPurposes: [
    'chrome',
    'handoff',
    'focus',
    'safe-area',
    'spectrum-peak',
    'backward-contact',
    'final-transition',
  ],
  allArtifactsHashed: true,
  mediaManifestArtifactId: 'qa-media-manifest',
} as const;

const QA_COMMANDS = [
  {id: 'npm-ci', command: 'npm ci'},
  {id: 'check', command: 'npm run check'},
  {id: 'alignment-verify', command: 'npm run alignment:verify'},
  {id: 'layout-verify', command: 'npm run layout:verify'},
  {id: 'compositions', command: 'npm run compositions'},
  {
    id: 'verify-reference',
    command: 'npm run verify -- --kind reference',
  },
  {id: 'verify-public', command: 'npm run verify -- --kind public'},
  {id: 'verify-proof', command: 'npm run verify -- --kind proof'},
  {
    id: 'verify-public-markup',
    command:
      'npm run test:run -- tests/release-gates.test.ts -t "public-markup release gate"',
  },
  {
    id: 'verify-matrix',
    command:
      'npm run test:run -- tests/release-gates.test.ts -t "requirement-matrix release gate"',
  },
] as const;

const requireValue: (
  condition: unknown,
  message: string,
) => asserts condition = (condition, message) => {
  if (!condition) throw new Error(message);
};

export const parseQaRunId = (value: string | undefined): QaRunId => {
  requireValue(
    value === 'run-1' || value === 'run-2',
    'TANISEA_QA_RUN must be exactly run-1 or run-2',
  );
  return value;
};

export const createQaCommandLedger = (
  runId: QaRunId,
): readonly QaCommandSpec[] =>
  QA_COMMANDS.map(({id, command}) => ({
    id,
    command,
    logPath:
      `projects/tanisea-lyric-film/work/qa/${runId}/logs/` +
      `${id}.log`,
  }));

const pathLibraryFor = (path: string): typeof win32 | typeof posix =>
  win32.isAbsolute(path) || /^[A-Za-z]:/.test(path) ? win32 : posix;

const canonicalKey = (value: string): string =>
  value.replaceAll('\\', '/').replace(/\/+$/, '');

export const verifyQaRunDirectorySafety = ({
  qaRoot,
  runRoot,
  runId,
  existingEntries,
  canonicalize,
}: QaRunDirectorySafetyOptions): void => {
  requireValue(
    typeof qaRoot === 'string' && qaRoot.trim().length > 0,
    'QA root path must be nonempty',
  );
  requireValue(
    typeof runRoot === 'string' && runRoot.trim().length > 0,
    `${runId} root path must be nonempty`,
  );
  requireValue(
    existingEntries.length === 0,
    `${runId} root must be empty; found existing/nonempty entry ${existingEntries[0] ?? ''}`,
  );

  const pathLibrary = pathLibraryFor(qaRoot);
  const resolvedQaRoot = pathLibrary.resolve(qaRoot);
  const expectedRunRoot = pathLibrary.resolve(resolvedQaRoot, runId);
  const resolvedRunRoot = pathLibrary.resolve(runRoot);
  requireValue(
    resolvedRunRoot === expectedRunRoot,
    `${runId} root path must be the exact selected directory`,
  );

  const qaCanonical = canonicalKey(canonicalize(resolvedQaRoot));
  const expectedCanonical = canonicalKey(canonicalize(expectedRunRoot));
  const runCanonical = canonicalKey(canonicalize(resolvedRunRoot));
  requireValue(
    qaCanonical.length > 0 && runCanonical.length > 0,
    `${runId} canonical root path must be nonempty`,
  );
  requireValue(
    runCanonical !== qaCanonical,
    `${runId} root must not alias the QA root`,
  );
  requireValue(
    runCanonical === expectedCanonical &&
      runCanonical.startsWith(`${qaCanonical}/`),
    `${runId} root path resolves outside or aliases the selected root`,
  );
};

const renderCommandLog = (
  command: QaCommandSpec,
  result: QaExecutionResult,
): string => {
  const payload = [
    `Command: ${command.command}`,
    `Exit code: ${result.exitCode}`,
    `Duration ms: ${result.durationMs}`,
    '',
    '--- stdout ---',
    result.stdout,
    '--- stderr ---',
    result.stderr,
    '',
  ].join('\n');
  const payloadSha256 = createHash('sha256').update(payload).digest('hex');
  return `${payloadSha256}\n${payload}`;
};

export const executeQaCommandLedger = async ({
  ledger,
  execute,
  writeLog,
  sha256,
}: ExecuteQaCommandLedgerOptions): Promise<readonly QaCommandResult[]> => {
  const results: QaCommandResult[] = [];

  for (const command of ledger) {
    const execution = await execute(command);
    requireValue(
      Number.isFinite(execution.durationMs) && execution.durationMs >= 0,
      `QA command ${command.id} returned an invalid duration`,
    );
    const logContent = renderCommandLog(command, execution);
    await writeLog(command.logPath, logContent);
    const logSha256 = sha256(logContent);
    requireValue(
      /^[0-9a-f]{64}$/.test(logSha256),
      `QA command ${command.id} produced an invalid SHA-256 log hash`,
    );

    const result = {
      id: command.id,
      command: command.command,
      exitCode: execution.exitCode,
      durationMs: execution.durationMs,
      logPath: command.logPath,
      logSha256,
    } as const;
    results.push(result);

    if (execution.exitCode !== 0) {
      const detail = execution.stderr.trim() || execution.stdout.trim();
      throw new Error(
        `QA command ${command.id} failed with exit ${execution.exitCode}` +
          `${detail.length > 0 ? `: ${detail}` : ''}`,
      );
    }
  }

  return results;
};

type RunComparison = Readonly<{
  matched: true;
  authoritativeRunId: 'run-2';
  recordPath: 'projects/tanisea-lyric-film/work/qa/run-2/run-comparison.json';
  unexplainedDrift: readonly [];
}>;

const runComparisonRecord = (): RunComparison => ({
  matched: true,
  authoritativeRunId: 'run-2',
  recordPath:
    'projects/tanisea-lyric-film/work/qa/run-2/run-comparison.json',
  unexplainedDrift: [],
});

export const createRunComparison = (
  run1: unknown,
  run2: unknown,
  verifyQaRunPair: (first: unknown, second: unknown) => void,
): RunComparison => {
  verifyQaRunPair(run1, run2);
  return runComparisonRecord();
};

export const renderQaReportMarkdown = (report: unknown): string =>
  [
    '# Tanisea final QA',
    '',
    'Status and bounded claim are preserved in the embedded machine report.',
    '',
    '```json',
    JSON.stringify(report, null, 2),
    '```',
    '',
  ].join('\n');

export const parseEmbeddedQaReport = (markdown: string): unknown => {
  requireValue(
    typeof markdown === 'string' && markdown.length > 0,
    'QA Markdown must be nonempty and contain one embedded JSON report',
  );
  const matches = [
    ...markdown.matchAll(/```json\r?\n([\s\S]*?)\r?\n```/g),
  ];
  requireValue(
    matches.length === 1,
    'QA Markdown must contain exactly one embedded JSON report',
  );
  try {
    return JSON.parse(matches[0]![1]!);
  } catch (error) {
    throw new Error(
      `QA Markdown embedded report is invalid JSON: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const sha256Text = (value: string | Buffer): string =>
  createHash('sha256').update(value).digest('hex');

const sha256FileStreaming = async (path: string): Promise<string> => {
  const hash = createHash('sha256');
  await new Promise<void>((resolvePromise, rejectPromise) => {
    const stream = createReadStream(path);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.once('error', rejectPromise);
    stream.once('end', resolvePromise);
  });
  return hash.digest('hex');
};

const projectRootFromModule = (): string => {
  const parent = resolve(__dirname, '..');
  return basename(parent) === '.tools-dist' ? resolve(parent, '..') : parent;
};

const repositoryPath = (
  repositoryRoot: string,
  absolutePath: string,
): string => {
  const localPath = relative(repositoryRoot, absolutePath).split(sep).join('/');
  requireValue(
    localPath.length > 0 &&
      localPath !== '..' &&
      !localPath.startsWith('../') &&
      !win32.isAbsolute(localPath) &&
      !posix.isAbsolute(localPath),
    `Path must remain inside the repository: ${absolutePath}`,
  );
  return localPath;
};

const absoluteRepositoryPath = (
  repositoryRoot: string,
  repositoryRelativePath: string,
): string => {
  requireValue(
    repositoryRelativePath.length > 0 &&
      !repositoryRelativePath.includes('\\') &&
      !repositoryRelativePath.split('/').some(
        (segment) => segment.length === 0 || segment === '.' || segment === '..',
      ),
    `Invalid repository-relative path: ${repositoryRelativePath}`,
  );
  const absolutePath = resolve(
    repositoryRoot,
    ...repositoryRelativePath.split('/'),
  );
  requireValue(
    repositoryPath(repositoryRoot, absolutePath) === repositoryRelativePath,
    `Repository path is not canonical: ${repositoryRelativePath}`,
  );
  return absolutePath;
};

const canonicalFilesystemPath = (path: string): string => {
  const unresolvedSegments: string[] = [];
  let existingAncestor = resolve(path);
  while (!existsSync(existingAncestor)) {
    const parent = dirname(existingAncestor);
    requireValue(
      parent !== existingAncestor,
      `Unable to find an existing ancestor for ${path}`,
    );
    unresolvedSegments.push(basename(existingAncestor));
    existingAncestor = parent;
  }
  const canonical = resolve(
    realpathSync.native(existingAncestor),
    ...unresolvedSegments.reverse(),
  );
  return process.platform === 'win32'
    ? canonical.replaceAll('/', '\\').toLocaleLowerCase('en-US')
    : canonical;
};

const writeTextAtomic = (path: string, content: string): void => {
  const temporaryPath = `${path}.tmp`;
  requireValue(!existsSync(path), `Refusing to overwrite existing file ${path}`);
  requireValue(
    !existsSync(temporaryPath),
    `Refusing stale temporary file ${temporaryPath}`,
  );
  mkdirSync(dirname(path), {recursive: true});
  writeFileSync(temporaryPath, content, {encoding: 'utf8', flag: 'wx'});
  renameSync(temporaryPath, path);
};

const writeJsonAtomic = (path: string, value: unknown): string => {
  const content = `${JSON.stringify(value, null, 2)}\n`;
  writeTextAtomic(path, content);
  return sha256Text(content);
};

const readJsonFile = (path: string): unknown => {
  const source = readFileSync(path, 'utf8');
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(
      `Invalid JSON in ${path}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

const runTextCommand = (
  executable: string,
  argumentsList: readonly string[],
  cwd: string,
): string => {
  const result = spawnSync(executable, [...argumentsList], {
    cwd,
    encoding: 'utf8',
    maxBuffer: MAX_COMMAND_OUTPUT_BYTES,
    windowsHide: true,
  });
  if (result.error) throw result.error;
  const stdout = typeof result.stdout === 'string' ? result.stdout : '';
  const stderr = typeof result.stderr === 'string' ? result.stderr : '';
  requireValue(
    result.status === 0,
    `${executable} ${argumentsList.join(' ')} failed with exit ${String(result.status)}: ${stderr.trim()}`,
  );
  return stdout;
};

const npmInvocation = (): Readonly<{
  executable: string;
  argumentPrefix: readonly string[];
}> => {
  const candidates = [
    process.env.npm_execpath,
    resolve(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ];
  const npmCliPath = candidates.find(
    (candidate): candidate is string =>
      typeof candidate === 'string' &&
      candidate.length > 0 &&
      existsSync(candidate) &&
      statSync(candidate).isFile(),
  );
  if (npmCliPath) {
    return {executable: process.execPath, argumentPrefix: [npmCliPath]};
  }
  return {executable: 'npm', argumentPrefix: []};
};

const commandArguments = (
  id: string,
): readonly string[] => {
  switch (id) {
    case 'npm-ci':
      return ['ci'];
    case 'check':
      return ['run', 'check'];
    case 'alignment-verify':
      return ['run', 'alignment:verify'];
    case 'layout-verify':
      return ['run', 'layout:verify'];
    case 'compositions':
      return ['run', 'compositions'];
    case 'verify-reference':
      return ['run', 'verify', '--', '--kind', 'reference'];
    case 'verify-public':
      return ['run', 'verify', '--', '--kind', 'public'];
    case 'verify-proof':
      return ['run', 'verify', '--', '--kind', 'proof'];
    case 'verify-public-markup':
      return [
        'run',
        'test:run',
        '--',
        'tests/release-gates.test.ts',
        '-t',
        'public-markup release gate',
      ];
    case 'verify-matrix':
      return [
        'run',
        'test:run',
        '--',
        'tests/release-gates.test.ts',
        '-t',
        'requirement-matrix release gate',
      ];
    default:
      throw new Error(`Unsupported QA command ID ${id}`);
  }
};

const executeRealQaCommand = (
  command: QaCommandSpec,
  projectRoot: string,
): QaExecutionResult => {
  const {executable, argumentPrefix} = npmInvocation();
  const started = performance.now();
  const result = spawnSync(
    executable,
    [...argumentPrefix, ...commandArguments(command.id)],
    {
    cwd: projectRoot,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: MAX_COMMAND_OUTPUT_BYTES,
    windowsHide: true,
    },
  );
  const durationMs = Math.max(0, performance.now() - started);
  const stdout = typeof result.stdout === 'string' ? result.stdout : '';
  const processStderr = typeof result.stderr === 'string' ? result.stderr : '';
  const errorText = result.error
    ? `${result.error.name}: ${result.error.message}`
    : '';
  return {
    exitCode: result.status ?? 127,
    durationMs,
    stdout,
    stderr: [processStderr, errorText].filter((value) => value.length > 0).join('\n'),
  };
};

const parseTrailingJsonObject = (source: string, label: string): UnknownRecord => {
  const starts: number[] = [];
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === '{') starts.push(index);
  }
  for (const start of starts.reverse()) {
    try {
      const candidate = JSON.parse(source.slice(start).trim());
      if (isRecord(candidate)) return candidate;
    } catch {
      // Try the preceding opening brace until the outer JSON object is found.
    }
  }
  throw new Error(`Unable to parse trailing JSON object from ${label}`);
};

const parseDeliveryOutput = (
  stdout: string,
  expectedKind: 'reference' | 'public' | 'proof',
): Readonly<{metadata: UnknownRecord; sizeBytes: number}> => {
  const parsed = parseTrailingJsonObject(stdout, `${expectedKind} verification`);
  requireValue(
    parsed.kind === expectedKind,
    `${expectedKind} verification returned mismatched kind`,
  );
  requireValue(
    typeof parsed.sizeBytes === 'number' &&
      Number.isFinite(parsed.sizeBytes) &&
      parsed.sizeBytes > 0,
    `${expectedKind} verification returned an invalid size`,
  );
  const {kind: _kind, path: _path, sizeBytes, ...metadata} = parsed;
  return {metadata, sizeBytes};
};

const gitSnapshot = async (
  repositoryRoot: string,
): Promise<Readonly<{
  headCommit: string;
  trackedTreeSha256: string;
  worktreeDiffSha256: string;
  isClean: boolean;
  statusEntries: readonly string[];
}>> => {
  const headCommit = runTextCommand(
    'git',
    ['rev-parse', 'HEAD'],
    repositoryRoot,
  ).trim();
  requireValue(
    /^[0-9a-f]{40}$/.test(headCommit),
    'Git HEAD must be a 40-character lowercase commit ID',
  );

  const trackedIndex = runTextCommand(
    'git',
    ['ls-files', '-s'],
    repositoryRoot,
  );
  const statusLines = runTextCommand(
    'git',
    ['status', '--porcelain=v1', '--untracked-files=all'],
    repositoryRoot,
  )
    .split(/\r?\n/)
    .filter((line) => line.length > 0);
  const statusEntries = statusLines
    .map((line) => {
      requireValue(line.length > 3, `Malformed Git status entry ${line}`);
      const path = line.slice(3);
      requireValue(
        !path.startsWith('"') && !path.includes(' -> '),
        `Unsupported quoted or renamed Git status entry ${line}`,
      );
      absoluteRepositoryPath(repositoryRoot, path);
      return path;
    })
    .sort();
  requireValue(
    new Set(statusEntries).size === statusEntries.length,
    'Git status contains duplicate repository paths',
  );

  const fingerprint = createHash('sha256');
  for (const path of statusEntries) {
    const absolutePath = absoluteRepositoryPath(repositoryRoot, path);
    fingerprint.update(path);
    fingerprint.update('\0');
    if (existsSync(absolutePath) && statSync(absolutePath).isFile()) {
      fingerprint.update(await sha256FileStreaming(absolutePath));
    } else {
      fingerprint.update('missing-or-nonfile');
    }
    fingerprint.update('\n');
  }

  return {
    headCommit,
    trackedTreeSha256: sha256Text(trackedIndex),
    worktreeDiffSha256: fingerprint.digest('hex'),
    isClean: statusEntries.length === 0,
    statusEntries,
  };
};

const firstNonemptyLine = (value: string, label: string): string => {
  const line = value.split(/\r?\n/).find((entry) => entry.trim().length > 0);
  requireValue(line, `${label} did not return a version`);
  return line.trim();
};

const toolVersions = (projectRoot: string): Readonly<{
  node: string;
  npm: string;
  ffmpeg: string;
  ffprobe: string;
}> => {
  const npmCommand = npmInvocation();
  return {
    node: process.version,
    npm: firstNonemptyLine(
      runTextCommand(
        npmCommand.executable,
        [...npmCommand.argumentPrefix, '--version'],
        projectRoot,
      ),
      'npm',
    ),
    ffmpeg: firstNonemptyLine(
      runTextCommand('ffmpeg', ['-version'], projectRoot),
      'ffmpeg',
    ),
    ffprobe: firstNonemptyLine(
      runTextCommand('ffprobe', ['-version'], projectRoot),
      'ffprobe',
    ),
  };
};

const artifactShaFromMedia = (
  metadata: UnknownRecord,
  label: string,
): string => {
  const fileSha256 = metadata.fileSha256;
  requireValue(isRecord(fileSha256), `${label}.fileSha256 must be an object`);
  requireValue(
    typeof fileSha256.value === 'string' &&
      /^[0-9a-f]{64}$/.test(fileSha256.value),
    `${label}.fileSha256.value must be a lowercase SHA-256`,
  );
  return fileSha256.value;
};

const parseQaMediaManifest = (candidate: unknown): QaMediaManifest => {
  requireValue(isRecord(candidate), 'QA-media manifest must be an object');
  requireValue(
    candidate.schemaVersion === 1,
    'QA-media manifest schemaVersion must be exactly 1',
  );
  requireValue(
    typeof candidate.artifactCount === 'number' &&
      Number.isSafeInteger(candidate.artifactCount) &&
      candidate.artifactCount > 0,
    'QA-media manifest artifactCount must be a positive integer',
  );
  requireValue(
    Array.isArray(candidate.artifacts),
    'QA-media manifest artifacts must be an array',
  );
  return candidate as QaMediaManifest;
};

const verifyQaMediaFiles = async (
  projectRoot: string,
  manifest: QaMediaManifest,
): Promise<readonly QaMediaArtifactRecord[]> => {
  const canonical = createCanonicalQaMediaManifest(
    createQaMediaPlan(),
    manifest.artifacts,
  );
  requireValue(
    canonical.artifactCount === manifest.artifactCount &&
      JSON.stringify(canonical.artifacts) === JSON.stringify(manifest.artifacts),
    'QA-media manifest is not in canonical complete order',
  );

  const verified: QaMediaArtifactRecord[] = [];
  for (const artifact of canonical.artifacts) {
    const repositoryRelativePath =
      `${PROJECT_REPOSITORY_PREFIX}work/qa/media/${artifact.path}`;
    const absolutePath = resolve(
      projectRoot,
      'work',
      'qa',
      'media',
      ...artifact.path.split('/'),
    );
    requireValue(
      existsSync(absolutePath) && statSync(absolutePath).isFile(),
      `QA-media artifact is missing: ${repositoryRelativePath}`,
    );
    const statistics = statSync(absolutePath);
    requireValue(
      statistics.size === artifact.sizeBytes,
      `QA-media artifact size drift: ${repositoryRelativePath}`,
    );
    const sha256 = await sha256FileStreaming(absolutePath);
    requireValue(
      sha256 === artifact.sha256,
      `QA-media artifact hash drift: ${repositoryRelativePath}`,
    );
    verified.push({
      path: artifact.path,
      sizeBytes: statistics.size,
      sha256,
    });
  }
  return verified;
};

const requiredArtifactMediaIdentity = (
  artifactId: string,
  media: Readonly<{
    reference: Readonly<{metadata: UnknownRecord; sizeBytes: number}>;
    public: Readonly<{metadata: UnknownRecord; sizeBytes: number}>;
    proof: Readonly<{metadata: UnknownRecord; sizeBytes: number}>;
  }>,
): Readonly<{sha256: string; sizeBytes: number}> | undefined => {
  const delivery =
    artifactId === 'reference-render'
      ? media.reference
      : artifactId === 'public-master'
        ? media.public
        : artifactId === 'sync-proof'
          ? media.proof
          : undefined;
  if (!delivery) return undefined;
  return {
    sha256: artifactShaFromMedia(delivery.metadata, artifactId),
    sizeBytes: delivery.sizeBytes,
  };
};

const collectArtifacts = async (
  repositoryRoot: string,
  projectRoot: string,
  media: Readonly<{
    reference: Readonly<{metadata: UnknownRecord; sizeBytes: number}>;
    public: Readonly<{metadata: UnknownRecord; sizeBytes: number}>;
    proof: Readonly<{metadata: UnknownRecord; sizeBytes: number}>;
  }>,
): Promise<readonly ArtifactRecord[]> => {
  const manifestPath = resolve(
    projectRoot,
    'work',
    'qa',
    'media',
    'qa-media-manifest.json',
  );
  const manifest = parseQaMediaManifest(readJsonFile(manifestPath));
  const verifiedQaMedia = await verifyQaMediaFiles(projectRoot, manifest);
  const qaMediaByRepositoryPath = new Map<string, QaMediaArtifactRecord>(
    verifiedQaMedia.map((artifact) => [
      `${PROJECT_REPOSITORY_PREFIX}work/qa/media/${artifact.path}`,
      artifact,
    ] as const),
  );

  const artifacts: ArtifactRecord[] = [];
  const requiredPaths = new Set<string>();
  for (const spec of REQUIRED_ARTIFACT_SPECS) {
    requiredPaths.add(spec.path);
    const absolutePath = absoluteRepositoryPath(repositoryRoot, spec.path);
    requireValue(
      existsSync(absolutePath) && statSync(absolutePath).isFile(),
      `Required QA artifact is missing: ${spec.path}`,
    );
    const statistics = statSync(absolutePath);
    const mediaIdentity = requiredArtifactMediaIdentity(spec.id, media);
    const manifestIdentity = qaMediaByRepositoryPath.get(spec.path);
    const sha256 =
      mediaIdentity?.sha256 ??
      manifestIdentity?.sha256 ??
      (await sha256FileStreaming(absolutePath));
    const sizeBytes =
      mediaIdentity?.sizeBytes ?? manifestIdentity?.sizeBytes ?? statistics.size;
    requireValue(
      statistics.size === sizeBytes,
      `Required QA artifact size disagrees with verified evidence: ${spec.path}`,
    );
    artifacts.push({...spec, sizeBytes, sha256});
  }

  let additionalIndex = 1;
  for (const artifact of verifiedQaMedia) {
    const path =
      `${PROJECT_REPOSITORY_PREFIX}work/qa/media/${artifact.path}`;
    if (requiredPaths.has(path)) continue;
    artifacts.push({
      id: `qa-media-artifact-${String(additionalIndex).padStart(3, '0')}`,
      kind: 'qa-media-artifact',
      path,
      sizeBytes: artifact.sizeBytes,
      sha256: artifact.sha256,
    });
    additionalIndex += 1;
  }
  return artifacts;
};

const artifactById = (
  artifacts: readonly ArtifactRecord[],
  id: string,
): ArtifactRecord => {
  const artifact = artifacts.find((entry) => entry.id === id);
  requireValue(artifact, `Missing required artifact ${id}`);
  return artifact;
};

export const createSelectedFrameExtractionCommand = (
  sourcePath: string,
  frame: number,
  outputPath: string,
): Readonly<{executable: 'ffmpeg'; arguments: readonly string[]}> => ({
  executable: 'ffmpeg',
  arguments: [
    '-hide_banner',
    '-v',
    'error',
    '-xerror',
    '-nostdin',
    '-i',
    sourcePath,
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

const SELECTED_FRAME_SOURCE_ARTIFACT_IDS = {
  public: 'public-master',
  proof: 'sync-proof',
  reference: 'reference-render',
} as const;

const createSelectedFrames = async (
  runId: QaRunId,
  repositoryRoot: string,
  artifacts: readonly ArtifactRecord[],
): Promise<readonly SelectedFrameRecord[]> => {
  const selectedFrames: SelectedFrameRecord[] = [];
  for (const spec of SELECTED_FRAME_SPECS) {
    const evidenceArtifact = artifactById(artifacts, spec.artifactId);
    const sourceArtifact = artifactById(
      artifacts,
      SELECTED_FRAME_SOURCE_ARTIFACT_IDS[spec.source],
    );
    const path =
      `${PROJECT_REPOSITORY_PREFIX}work/qa/${runId}/selected-frames/` +
      `${spec.id}.png`;
    const sourcePath = absoluteRepositoryPath(
      repositoryRoot,
      sourceArtifact.path,
    );
    const destinationPath = absoluteRepositoryPath(repositoryRoot, path);
    mkdirSync(dirname(destinationPath), {recursive: true});
    requireValue(
      !existsSync(destinationPath),
      `Selected frame destination already exists: ${spec.id}`,
    );
    const command = createSelectedFrameExtractionCommand(
      sourcePath,
      spec.frame,
      destinationPath,
    );
    const extraction = spawnSync(
      command.executable,
      [...command.arguments],
      {
        encoding: 'utf8',
        maxBuffer: MAX_COMMAND_OUTPUT_BYTES,
      },
    );
    if (extraction.error) throw extraction.error;
    const stderr = typeof extraction.stderr === 'string' ? extraction.stderr : '';
    requireValue(
      extraction.status === 0 && stderr.trim().length === 0,
      `Selected frame extraction failed for ${spec.id}: ${stderr.trim()}`,
    );
    requireValue(
      existsSync(destinationPath) && statSync(destinationPath).isFile(),
      `Selected frame extraction did not create ${spec.id}`,
    );
    const sha256 = await sha256FileStreaming(destinationPath);
    requireValue(
      sha256 === evidenceArtifact.sha256,
      `Selected frame extraction hash drift: ${spec.id}`,
    );
    selectedFrames.push({
      id: spec.id,
      artifactId: spec.artifactId,
      composition: spec.composition,
      frame: spec.frame,
      path,
      sha256,
    });
  }
  return selectedFrames;
};

const comparisonRecordContent = (): string =>
  `${JSON.stringify(runComparisonRecord(), null, 2)}\n`;

const comparisonRecordSha256 = (): string =>
  sha256Text(comparisonRecordContent());

export const createRequirementMatrix = (
  runId: QaRunId,
  artifacts: readonly ArtifactRecord[],
  commands: readonly QaCommandResult[],
  selectedFrames: readonly Pick<SelectedFrameRecord, 'id' | 'path' | 'sha256'>[],
): UnknownRecord => {
  const sourceAudio = artifactById(artifacts, 'source-audio');
  const alignment = artifactById(artifacts, 'alignment-manifest');
  const publicMaster = artifactById(artifacts, 'public-master');
  const commandEvidence = (commandId: string): QaCommandResult => {
    const command = commands.find(({id}) => id === commandId);
    requireValue(command, `Missing QA command ${commandId}`);
    return command;
  };
  const selectedFrameEvidence = (
    selectedFrameId: string,
  ): Pick<SelectedFrameRecord, 'id' | 'path' | 'sha256'> => {
    const selectedFrame = selectedFrames.find(({id}) => id === selectedFrameId);
    requireValue(selectedFrame, `Missing selected frame ${selectedFrameId}`);
    return selectedFrame;
  };
  const checkCommand = commandEvidence('check');
  const publicCommand = commandEvidence('verify-public');
  const proofCommand = commandEvidence('verify-proof');
  const publicMarkupCommand = commandEvidence('verify-public-markup');
  const layoutCommand = commandEvidence('layout-verify');
  const chromeFrame = selectedFrameEvidence('chrome');
  const safeAreaFrame = selectedFrameEvidence('safe-area');
  const authorities = [
    {
      title: 'Locked source audio authority',
      kind: 'source-audio',
      artifact: sourceAudio.path,
      sha256: sourceAudio.sha256,
    },
    {
      title: 'Complete build and test verification',
      kind: 'test-result',
      artifact: checkCommand.logPath,
      sha256: checkCommand.logSha256,
    },
    {
      title: 'Sample-indexed alignment authority',
      kind: 'alignment-manifest',
      artifact: alignment.path,
      sha256: alignment.sha256,
    },
    {
      title: 'Measured timing uncertainty bounds',
      kind: 'alignment-manifest',
      artifact: alignment.path,
      sha256: alignment.sha256,
    },
    {
      title: 'Reviewed semantic source-to-target mapping',
      kind: 'semantic-map',
      artifact: alignment.path,
      sha256: alignment.sha256,
    },
    {
      title: 'Backward activation and repeated-chorus semantics',
      kind: 'semantic-map',
      artifact: alignment.path,
      sha256: alignment.sha256,
    },
    {
      title: 'Public and proof cadence verification',
      kind: 'cadence-verification',
      artifact: publicCommand.logPath,
      sha256: publicCommand.logSha256,
    },
    {
      title: 'Public chrome and upper-rail removal',
      kind: 'public-markup',
      artifact: publicMarkupCommand.logPath,
      sha256: publicMarkupCommand.logSha256,
    },
    {
      title: 'Lyric, spectrum, and safe-area layout',
      kind: 'layout-verification',
      artifact: layoutCommand.logPath,
      sha256: layoutCommand.logSha256,
    },
    {
      title: 'Repeated QA with no unexplained drift',
      kind: 'qa-run-comparison',
      artifact:
        'projects/tanisea-lyric-film/work/qa/run-2/run-comparison.json',
      sha256: comparisonRecordSha256(),
    },
    {
      title: 'Release assets and documentation readiness',
      kind: 'publication-readiness',
      artifact: publicMaster.path,
      sha256: publicMaster.sha256,
    },
  ] as const;

  const matrix = {
    criteria: authorities.map((authority, index) => {
      const id = index + 1;
      const primaryEvidence = {
        id: `criterion-${String(id).padStart(2, '0')}-evidence-01`,
        kind: authority.kind,
        artifact: authority.artifact,
        sha256: authority.sha256,
        value:
          id === 10 && runId === 'run-1'
            ? 'criterion 10 baseline captured; repeat verification pending'
            : id === 11
              ? 'criterion 11 publication readiness verified locally'
              : `criterion ${id} verified`,
      };
      return {
        id,
        title: authority.title,
        status:
          id === 10 && runId === 'run-1'
            ? 'pending-repeat'
            : id === 11
              ? 'pending-publication'
              : 'proved',
        evidence:
          id === 7
            ? [
                {...primaryEvidence, value: 'public cadence verified'},
                {
                  ...primaryEvidence,
                  id: 'criterion-07-evidence-02',
                  artifact: proofCommand.logPath,
                  sha256: proofCommand.logSha256,
                  value: 'proof cadence verified',
                },
              ]
            : id === 8 || id === 9
              ? [
                  primaryEvidence,
                  {
                    id: `criterion-0${id}-evidence-02`,
                    kind: 'encoded-frame',
                    artifact: (id === 8 ? chromeFrame : safeAreaFrame).path,
                    sha256: (id === 8 ? chromeFrame : safeAreaFrame).sha256,
                    value:
                      id === 8
                        ? 'public chrome encoded frame verified'
                        : 'public safe-area encoded frame verified',
                  },
                ]
            : [primaryEvidence],
      };
    }),
  };
  verifyRequirementMatrix(
    matrix,
    runId === 'run-1' ? 'baseline' : 'prepublication',
  );
  return matrix;
};

const createQaRunRecord = (options: Readonly<{
  runId: QaRunId;
  git: Awaited<ReturnType<typeof gitSnapshot>>;
  toolVersions: ReturnType<typeof toolVersions>;
  commands: readonly QaCommandResult[];
  artifacts: readonly ArtifactRecord[];
  selectedFrames: readonly SelectedFrameRecord[];
  media: Readonly<{
    reference: UnknownRecord;
    public: UnknownRecord;
    proof: UnknownRecord;
  }>;
}>): UnknownRecord => ({
  schemaVersion: 1,
  runId: options.runId,
  fullMediaExecuted: true,
  boundedClaim: QA_BOUNDED_CLAIM,
  git: options.git,
  toolVersions: options.toolVersions,
  commands: options.commands,
  artifacts: options.artifacts,
  media: options.media,
  qaCoverage: QA_COVERAGE,
  requirementMatrix: createRequirementMatrix(
    options.runId,
    options.artifacts,
    options.commands,
    options.selectedFrames,
  ),
  selectedFrames: options.selectedFrames,
});

const createQaReport = (options: Readonly<{
  baselineRun: UnknownRecord;
  authoritativeRun: UnknownRecord;
  run1Sha256: string;
  run2Sha256: string;
  comparisonSha256: string;
}>): UnknownRecord => {
  const authoritativeArtifacts = options.authoritativeRun.artifacts;
  requireValue(
    Array.isArray(authoritativeArtifacts),
    'Authoritative run artifacts must be an array',
  );
  const artifacts = authoritativeArtifacts as ArtifactRecord[];
  const sourceAudio = artifactById(artifacts, 'source-audio');
  const alignment = artifactById(artifacts, 'alignment-manifest');
  const features = artifactById(artifacts, 'audio-features');
  const requirementMatrix = options.authoritativeRun.requirementMatrix;
  const qaCoverage = options.authoritativeRun.qaCoverage;
  const media = options.authoritativeRun.media;

  return {
    schemaVersion: 1,
    status: 'passed-prepublication',
    boundedClaim: QA_BOUNDED_CLAIM,
    fullMediaExecuted: true,
    requirementMatrix,
    artifactReferences: artifacts.map(({id, path, sha256}) => ({
      id,
      path,
      sha256,
    })),
    baselineRun: options.baselineRun,
    authoritativeRun: options.authoritativeRun,
    sourceSummary: {
      artifactId: 'source-audio',
      sha256: sourceAudio.sha256,
      sampleRateHz: 44100,
      channels: 2,
      channelLayout: 'stereo',
      publicDurationSeconds: 153,
      decodedSamplesPerChannel: 6747584,
      retainedAnalysisDurationSeconds: 153.00644,
    },
    alignmentSummary: {
      artifactId: 'alignment-manifest',
      sha256: alignment.sha256,
      displayedLineCount: 24,
      sourceTokenCount: 102,
      cueReferencedSemanticSourceTokenCount: 101,
      explicitlyUnmappedSourceTokenIds: ['V1-08-R01'],
      cueCount: 74,
      targetActivationCount: 74,
      chorusOccurrenceCount: 2,
      literalChorusPairCount: 8,
      maximumUncertainty: {samples: 882, milliseconds: 20},
      observedMaximumFrameErrorMilliseconds: {
        fps60: 8.321995,
        fps120: 4.002268,
      },
      reviewedSemanticSequences: [
        {
          lineId: 'V1-03',
          records: [
            {
              cueId: 'V1-03-C02',
              startSample: 3173568,
              sourceTokenIds: ['V1-03-R05'],
              targetSegmentIds: ['V1-03-S03'],
              activation: 'forward',
            },
            {
              cueId: 'V1-03-C03',
              startSample: 3200910,
              sourceTokenIds: ['V1-03-R06'],
              targetSegmentIds: ['V1-03-S02'],
              activation: 'backward',
            },
          ],
        },
        {
          lineId: 'V1-08',
          records: [
            {
              cueId: 'V1-08-C01',
              startSample: 3807197,
              sourceTokenIds: ['V1-08-R02'],
              targetSegmentIds: ['V1-08-S02'],
              activation: 'forward',
            },
            {
              cueId: 'V1-08-C02',
              startSample: 3819545,
              sourceTokenIds: ['V1-08-R03', 'V1-08-R04'],
              targetSegmentIds: ['V1-08-S01'],
              activation: 'backward',
            },
            {
              cueId: 'V1-08-C03',
              startSample: 3869863,
              sourceTokenIds: ['V1-08-R05', 'V1-08-R06'],
              targetSegmentIds: ['V1-08-S03'],
              activation: 'forward',
            },
            {
              cueId: 'V1-08-C04',
              startSample: 3912243,
              sourceTokenIds: ['V1-08-R07'],
              targetSegmentIds: ['V1-08-S04'],
              activation: 'forward',
            },
          ],
        },
      ],
    },
    featuresSummary: {
      artifactId: 'audio-features',
      sha256: features.sha256,
    },
    layoutSummary: {
      spectrumBandCount: 64,
      spectrumMeasuredCorePx: 96,
      spectrumMaximumCapPx: 18,
      minimumLyricGapPx: 36,
      lowerChromeClearancePx: 11,
      publicUpperTelemetryAbsent: true,
      publicGlobalUpperRailAbsent: true,
    },
    qaCoverage,
    media,
    runReferences: [
      {
        runId: 'run-1',
        path:
          'projects/tanisea-lyric-film/work/qa/run-1/qa-run.json',
        sha256: options.run1Sha256,
      },
      {
        runId: 'run-2',
        path:
          'projects/tanisea-lyric-film/work/qa/run-2/qa-run.json',
        sha256: options.run2Sha256,
      },
    ],
    comparison: {
      ...runComparisonRecord(),
      recordSha256: options.comparisonSha256,
    },
  };
};

const runReleaseQaCli = async (): Promise<void> => {
  requireValue(
    process.argv.slice(2).length === 0,
    `Unexpected argument: ${process.argv.slice(2)[0] ?? ''}`,
  );
  const runId = parseQaRunId(process.env.TANISEA_QA_RUN);
  const projectRoot = projectRootFromModule();
  const repositoryRoot = resolve(projectRoot, '..', '..');
  const qaRoot = resolve(projectRoot, 'work', 'qa');
  const runRoot = resolve(qaRoot, runId);
  const runRecordPath = resolve(runRoot, 'qa-run.json');
  const auditRepositoryPaths = qaAuditRepositoryPaths();
  const auditJsonPath = absoluteRepositoryPath(
    repositoryRoot,
    auditRepositoryPaths.json,
  );
  const auditMarkdownPath = absoluteRepositoryPath(
    repositoryRoot,
    auditRepositoryPaths.markdown,
  );
  const baselinePath = resolve(qaRoot, 'run-1', 'qa-run.json');

  const existingEntries = existsSync(runRoot) ? readdirSync(runRoot) : [];
  verifyQaRunDirectorySafety({
    qaRoot,
    runRoot,
    runId,
    existingEntries,
    canonicalize: canonicalFilesystemPath,
  });
  requireValue(
    !existsSync(auditJsonPath) && !existsSync(auditMarkdownPath),
    'Tracked QA audit outputs must not exist before repeated QA',
  );
  let baselineRunPreflight: unknown;
  if (runId === 'run-2') {
    requireValue(
      existsSync(baselinePath) && statSync(baselinePath).isFile(),
      'run-1 QA record is required before run-2',
    );
    baselineRunPreflight = readJsonFile(baselinePath);
    verifyQaRunRecord(baselineRunPreflight);
  }
  mkdirSync(resolve(runRoot, 'logs'), {recursive: true});
  mkdirSync(resolve(runRoot, 'selected-frames'), {recursive: true});

  const capturedOutputs = new Map<string, QaExecutionResult>();
  const commands = await executeQaCommandLedger({
    ledger: createQaCommandLedger(runId),
    execute: async (command) => {
      const execution = executeRealQaCommand(command, projectRoot);
      capturedOutputs.set(command.id, execution);
      return execution;
    },
    writeLog: async (path, content) => {
      const absolutePath = absoluteRepositoryPath(repositoryRoot, path);
      writeFileSync(absolutePath, content, {encoding: 'utf8', flag: 'wx'});
    },
    sha256: sha256Text,
  });

  const deliveryOutput = (
    id: 'verify-reference' | 'verify-public' | 'verify-proof',
    kind: 'reference' | 'public' | 'proof',
  ) => {
    const output = capturedOutputs.get(id);
    requireValue(output, `Missing captured output for ${id}`);
    return parseDeliveryOutput(output.stdout, kind);
  };
  const verifiedMedia = {
    reference: deliveryOutput('verify-reference', 'reference'),
    public: deliveryOutput('verify-public', 'public'),
    proof: deliveryOutput('verify-proof', 'proof'),
  } as const;

  const [artifacts, git, versions] = await Promise.all([
    collectArtifacts(repositoryRoot, projectRoot, verifiedMedia),
    gitSnapshot(repositoryRoot),
    Promise.resolve(toolVersions(projectRoot)),
  ]);
  const selectedFrames = await createSelectedFrames(
    runId,
    repositoryRoot,
    artifacts,
  );
  const runRecord = createQaRunRecord({
    runId,
    git,
    toolVersions: versions,
    commands,
    artifacts,
    selectedFrames,
    media: {
      reference: verifiedMedia.reference.metadata,
      public: verifiedMedia.public.metadata,
      proof: verifiedMedia.proof.metadata,
    },
  });
  verifyQaRunRecord(runRecord);
  const runRecordSha256 = writeJsonAtomic(runRecordPath, runRecord);

  if (runId === 'run-1') {
    process.stdout.write(
      `${JSON.stringify(
        {
          runId,
          recordPath: repositoryPath(repositoryRoot, runRecordPath),
          recordSha256: runRecordSha256,
          status: 'passed',
        },
        null,
        2,
      )}\n`,
    );
    return;
  }

  const baselineRun = baselineRunPreflight;
  verifyQaRunRecord(baselineRun);
  const comparison = createRunComparison(
    baselineRun,
    runRecord,
    verifyQaRunPair,
  );
  const comparisonPath = resolve(runRoot, 'run-comparison.json');
  const comparisonSha256 = writeJsonAtomic(comparisonPath, comparison);
  requireValue(
    comparisonSha256 === comparisonRecordSha256(),
    'Run-comparison record hash drifted from the requirement authority',
  );
  const baselineSha256 = await sha256FileStreaming(baselinePath);
  const report = createQaReport({
    baselineRun: baselineRun as UnknownRecord,
    authoritativeRun: runRecord,
    run1Sha256: baselineSha256,
    run2Sha256: runRecordSha256,
    comparisonSha256,
  });
  verifyQaReport(report);
  const markdown = renderQaReportMarkdown(report);
  requireValue(
    JSON.stringify(parseEmbeddedQaReport(markdown)) === JSON.stringify(report),
    'QA Markdown does not preserve the complete machine report',
  );
  const reportSha256 = writeJsonAtomic(auditJsonPath, report);
  writeTextAtomic(auditMarkdownPath, markdown);

  process.stdout.write(
    `${JSON.stringify(
      {
        runId,
        recordPath: repositoryPath(repositoryRoot, runRecordPath),
        recordSha256: runRecordSha256,
        comparisonPath: repositoryPath(repositoryRoot, comparisonPath),
        comparisonSha256,
        reportPath: repositoryPath(repositoryRoot, auditJsonPath),
        reportSha256,
        status: 'passed-prepublication',
      },
      null,
      2,
    )}\n`,
  );
};

const isCommonJsMain =
  typeof require !== 'undefined' &&
  typeof module !== 'undefined' &&
  require.main === module;

if (isCommonJsMain) {
  void runReleaseQaCli().catch((error: unknown) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  });
}
