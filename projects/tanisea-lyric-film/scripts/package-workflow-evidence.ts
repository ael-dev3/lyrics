import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import {basename, dirname, relative, resolve, sep} from 'node:path';
import {projectRootFromScriptDirectory} from './project-root.js';

type PayloadFile = Readonly<{
  path: string;
  sizeBytes: number;
  sha256: string;
}>;

type CategorySummary = Readonly<{
  category: string;
  fileCount: number;
  sizeBytes: number;
}>;

const RELEASE_TAG = 'v2.4.1';
const ARCHIVE_NAME = 'Tanisea-Lyric-Film-Workflow-Evidence-vNext.zip';
const MANIFEST_NAME = 'tanisea-workflow-evidence-vnext.json';
const CHECKSUM_NAME = 'WORKFLOW-EVIDENCE.sha256';
const INTERNAL_MANIFEST_NAME = 'EVIDENCE-MANIFEST.json';
const INTERNAL_CHECKSUM_NAME = 'EVIDENCE-MANIFEST.sha256';

const textExtensions = new Set([
  '.json',
  '.log',
  '.md',
  '.txt',
  '.ts',
  '.tsx',
  '.sh',
]);

const requireValue: (
  condition: unknown,
  message: string,
) => asserts condition = (condition, message) => {
  if (!condition) throw new Error(message);
};

const sha256File = (path: string): string =>
  createHash('sha256').update(readFileSync(path)).digest('hex');

const sha256Text = (value: string): string =>
  createHash('sha256').update(value).digest('hex');

const normalizedRelativePath = (root: string, path: string): string => {
  const candidate = relative(root, path).split(sep).join('/');
  requireValue(
    candidate.length > 0 &&
      candidate !== '..' &&
      !candidate.startsWith('../') &&
      !candidate.startsWith('/'),
    `Workflow evidence path escapes its root: ${path}`,
  );
  return candidate;
};

const sanitizeText = (value: string, repositoryRoot: string): string =>
  value
    .replaceAll(repositoryRoot, '<repository-root>')
    .replace(/\/(?:Users|home)\/[^\s"'<>)]*/g, '<local-path>');

const isTextPath = (path: string): boolean =>
  textExtensions.has(path.slice(path.lastIndexOf('.')).toLowerCase());

const copySanitizedFile = (
  sourcePath: string,
  targetPath: string,
  repositoryRoot: string,
): void => {
  mkdirSync(dirname(targetPath), {recursive: true});
  if (!isTextPath(sourcePath)) {
    copyFileSync(sourcePath, targetPath);
    return;
  }

  const source = readFileSync(sourcePath);
  if (source.includes(0)) {
    copyFileSync(sourcePath, targetPath);
    return;
  }
  writeFileSync(targetPath, sanitizeText(source.toString('utf8'), repositoryRoot), 'utf8');
};

const copySanitizedTree = (
  sourceRoot: string,
  targetRoot: string,
  repositoryRoot: string,
): void => {
  requireValue(existsSync(sourceRoot), `Workflow evidence input is missing: ${sourceRoot}`);
  const sourceStat = statSync(sourceRoot);
  if (sourceStat.isFile()) {
    copySanitizedFile(sourceRoot, targetRoot, repositoryRoot);
    return;
  }
  requireValue(sourceStat.isDirectory(), `Unsupported evidence input: ${sourceRoot}`);
  mkdirSync(targetRoot, {recursive: true});
  for (const entry of readdirSync(sourceRoot, {withFileTypes: true})) {
    const sourcePath = resolve(sourceRoot, entry.name);
    const targetPath = resolve(targetRoot, entry.name);
    requireValue(!entry.isSymbolicLink(), `Evidence input may not contain a symlink: ${sourcePath}`);
    if (entry.isDirectory()) {
      copySanitizedTree(sourcePath, targetPath, repositoryRoot);
    } else if (entry.isFile()) {
      copySanitizedFile(sourcePath, targetPath, repositoryRoot);
    } else {
      throw new Error(`Unsupported evidence entry: ${sourcePath}`);
    }
  }
};

const listPayloadFiles = (root: string, directory = root): readonly PayloadFile[] => {
  const files: PayloadFile[] = [];
  for (const entry of readdirSync(directory, {withFileTypes: true})) {
    const path = resolve(directory, entry.name);
    requireValue(!entry.isSymbolicLink(), `Evidence output may not contain a symlink: ${path}`);
    if (entry.isDirectory()) {
      files.push(...listPayloadFiles(root, path));
    } else if (entry.isFile()) {
      const name = normalizedRelativePath(root, path);
      requireValue(
        name !== INTERNAL_MANIFEST_NAME && name !== INTERNAL_CHECKSUM_NAME,
        `Internal manifest files must not be payloads: ${name}`,
      );
      files.push({
        path: name,
        sizeBytes: statSync(path).size,
        sha256: sha256File(path),
      });
    } else {
      throw new Error(`Unsupported evidence output: ${path}`);
    }
  }
  return files.sort((first, second) => first.path.localeCompare(second.path));
};

const categoryForPath = (path: string): string =>
  path.includes('/') ? path.slice(0, path.indexOf('/')) : path;

const categorySummary = (
  files: readonly PayloadFile[],
): readonly CategorySummary[] => {
  const summaries = new Map<string, {fileCount: number; sizeBytes: number}>();
  for (const file of files) {
    const category = categoryForPath(file.path);
    const current = summaries.get(category) ?? {fileCount: 0, sizeBytes: 0};
    current.fileCount += 1;
    current.sizeBytes += file.sizeBytes;
    summaries.set(category, current);
  }
  return [...summaries.entries()]
    .map(([category, summary]) => ({category, ...summary}))
    .sort((first, second) => first.category.localeCompare(second.category));
};

const assertPublicSafeText = (root: string): void => {
  for (const file of listPayloadFiles(root)) {
    const absolutePath = resolve(root, file.path);
    if (!isTextPath(absolutePath)) continue;
    const source = readFileSync(absolutePath, 'utf8');
    requireValue(
      !/(?:^|[\s"'(])\/(?:Users|home)\//.test(source),
      `Unsanitized local path in public evidence: ${file.path}`,
    );
  }
};

const gitText = (args: readonly string[], repositoryRoot: string): string => {
  const result = spawnSync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  requireValue(
    result.status === 0,
    `git ${args.join(' ')} failed: ${result.stderr || ''}`,
  );
  return String(result.stdout).trim();
};

const runZip = (stageRoot: string, archivePath: string): void => {
  const entries = [
    INTERNAL_MANIFEST_NAME,
    INTERNAL_CHECKSUM_NAME,
    ...readdirSync(stageRoot).filter(
      (entry) => entry !== INTERNAL_MANIFEST_NAME && entry !== INTERNAL_CHECKSUM_NAME,
    ),
  ];
  const result = spawnSync('zip', ['-X', '-r', archivePath, ...entries], {
    cwd: stageRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  requireValue(
    result.status === 0,
    `zip failed: ${result.stderr || result.stdout || ''}`,
  );
};

const runPackageWorkflowEvidenceCli = (): void => {
  requireValue(
    process.argv.slice(2).length === 0,
    `Unexpected argument: ${process.argv.slice(2)[0] ?? ''}`,
  );
  const projectRoot = projectRootFromScriptDirectory(__dirname);
  const repositoryRoot = resolve(projectRoot, '..', '..');
  const releaseRoot = resolve(projectRoot, 'work', 'release');
  const stageRoot = resolve(releaseRoot, 'workflow-evidence-stage');
  const archivePath = resolve(releaseRoot, ARCHIVE_NAME);
  const manifestPath = resolve(releaseRoot, MANIFEST_NAME);
  const checksumPath = resolve(releaseRoot, CHECKSUM_NAME);

  for (const path of [stageRoot, archivePath, manifestPath, checksumPath]) {
    requireValue(!existsSync(path), `Workflow evidence output already exists: ${path}`);
  }
  mkdirSync(stageRoot, {recursive: true});

  const releaseSourceCommit = process.env.TANISEA_RELEASE_SOURCE_COMMIT;
  requireValue(
    typeof releaseSourceCommit === 'string' && /^[0-9a-f]{40}$/.test(releaseSourceCommit),
    'TANISEA_RELEASE_SOURCE_COMMIT must be a 40-character lowercase Git commit',
  );
  requireValue(
    gitText(['cat-file', '-e', `${releaseSourceCommit}^{commit}`], repositoryRoot)
      .length === 0,
    `Release source commit is not available: ${releaseSourceCommit}`,
  );

  const inputs = [
    ['alignment', resolve(projectRoot, 'alignment')],
    ['qa', resolve(projectRoot, 'work', 'qa')],
    [
      'visual-review/C1-Highlight-Parity-Preview-Synced.mp4',
      resolve(
        projectRoot,
        'output',
        'Tanisea-Lyric-Film-v2.4-C1-Highlight-Parity-Preview-Synced.mp4',
      ),
    ],
    ['repository-records/README.md', resolve(repositoryRoot, 'README.md')],
    [
      'repository-records/project-README.md',
      resolve(projectRoot, 'README.md'),
    ],
    [
      'repository-records/first-act-and-outro-polish-v2.4-implementation.md',
      resolve(repositoryRoot, 'docs', 'first-act-and-outro-polish-v2.4-implementation.md'),
    ],
    [
      'repository-records/workflow-evidence.md',
      resolve(repositoryRoot, 'docs', 'workflow-evidence.md'),
    ],
    [
      'repository-records/tanisea-word-alignment-v3.md',
      resolve(repositoryRoot, 'audits', 'tanisea-word-alignment-v3.md'),
    ],
    [
      'repository-records/tanisea-final-qa-vnext.json',
      resolve(repositoryRoot, 'audits', 'tanisea-final-qa-vnext.json'),
    ],
    [
      'repository-records/tanisea-final-qa-vnext.md',
      resolve(repositoryRoot, 'audits', 'tanisea-final-qa-vnext.md'),
    ],
    [
      'publication/release-publication.json',
      resolve(projectRoot, 'work', 'release-publication.json'),
    ],
  ] as const;

  for (const [destination, source] of inputs) {
    copySanitizedTree(source, resolve(stageRoot, destination), repositoryRoot);
  }

  const archiveGuide = [
    '# Tanisea v2.4.1 workflow evidence',
    '',
    `Release tag: ${RELEASE_TAG}`,
    `Source revision: ${releaseSourceCommit}`,
    '',
    'This archive contains reviewed alignment data, both deterministic QA runs,',
    'generated QA contact/release media, the approved early-chorus review clip,',
    'the final QA record, and publication evidence. The source archive and final',
    'media are separate release assets and are intentionally not duplicated here.',
    '',
    `Verify ${INTERNAL_CHECKSUM_NAME}, then compare payload files with ${INTERNAL_MANIFEST_NAME}.`,
    '',
  ].join('\n');
  writeFileSync(resolve(stageRoot, 'README.md'), archiveGuide, 'utf8');

  assertPublicSafeText(stageRoot);
  const files = listPayloadFiles(stageRoot);
  const manifest = {
    schemaVersion: 1,
    title: 'Tanisea v2.4.1 workflow evidence',
    releaseTag: RELEASE_TAG,
    releaseTagCommit: gitText(['rev-parse', 'HEAD'], repositoryRoot),
    sourceArchiveRevision: releaseSourceCommit,
    generatedUtc: new Date().toISOString(),
    hashAlgorithm: 'SHA-256',
    payloadFileCount: files.length,
    payloadSizeBytes: files.reduce((total, file) => total + file.sizeBytes, 0),
    categorySummary: categorySummary(files),
    privacyNormalization: {
      repositoryRootReplacement: '<repository-root>',
      localPathReplacement: '<local-path>',
    },
    exclusions: [
      'Replaceable dependencies, runtime downloads, models, and caches',
      'Decoded audio, source-separation stems, and MFA clip WAV intermediates',
      'Superseded review iterations and failed or intentionally invalid QA runs',
      'Duplicate downloaded release assets',
      'The reproducible 2x ProRes reference render recorded in final QA',
      'Final media and source assets published separately on the v2.4.1 release',
    ],
    files,
  } as const;
  const manifestSource = `${JSON.stringify(manifest, null, 2)}\n`;
  const internalManifestPath = resolve(stageRoot, INTERNAL_MANIFEST_NAME);
  writeFileSync(internalManifestPath, manifestSource, 'utf8');
  writeFileSync(
    resolve(stageRoot, INTERNAL_CHECKSUM_NAME),
    `${sha256Text(manifestSource)}  ${INTERNAL_MANIFEST_NAME}\n`,
    'utf8',
  );
  writeFileSync(manifestPath, manifestSource, 'utf8');
  runZip(stageRoot, archivePath);
  writeFileSync(
    checksumPath,
    `${sha256File(archivePath)}  ${ARCHIVE_NAME}\n` +
      `${sha256File(manifestPath)}  ${MANIFEST_NAME}\n`,
    'utf8',
  );

  process.stdout.write(
    `${JSON.stringify(
      {
        status: 'packaged',
        archivePath,
        archiveSha256: sha256File(archivePath),
        manifestPath,
        manifestSha256: sha256File(manifestPath),
        checksumPath,
        payloadFileCount: manifest.payloadFileCount,
        payloadSizeBytes: manifest.payloadSizeBytes,
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
  try {
    runPackageWorkflowEvidenceCli();
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  }
}
