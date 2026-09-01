import {win32} from 'node:path';
import {describe, expect, test, vi} from 'vitest';

const importIo = vi.hoisted(() => {
  const childProcess = vi.fn();
  const filesystem = vi.fn();
  const stdoutWrite = vi.spyOn(process.stdout, 'write');
  stdoutWrite.mockImplementation(() => true);
  return {childProcess, filesystem, stdoutWrite};
});

vi.mock('node:child_process', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:child_process')>()),
  execFileSync: importIo.childProcess,
  spawnSync: importIo.childProcess,
}));

vi.mock('node:fs', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:fs')>()),
  mkdirSync: importIo.filesystem,
  readFileSync: importIo.filesystem,
  readdirSync: importIo.filesystem,
  realpathSync: importIo.filesystem,
  renameSync: importIo.filesystem,
  rmSync: importIo.filesystem,
  statSync: importIo.filesystem,
  writeFileSync: importIo.filesystem,
}));

vi.mock('node:fs/promises', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:fs/promises')>()),
  mkdir: importIo.filesystem,
  readFile: importIo.filesystem,
  readdir: importIo.filesystem,
  realpath: importIo.filesystem,
  rename: importIo.filesystem,
  rm: importIo.filesystem,
  stat: importIo.filesystem,
  writeFile: importIo.filesystem,
}));

type QaRunId = 'run-1' | 'run-2';

type QaCommandSpec = Readonly<{
  id: string;
  command: string;
  logPath: string;
}>;

type QaCommandResult = Readonly<{
  id: string;
  command: string;
  exitCode: number;
  durationMs: number;
  logPath: string;
  logSha256: string;
}>;

type QaOrchestratorApi = Readonly<{
  parseQaRunId: (value: string | undefined) => QaRunId;
  createQaCommandLedger: (runId: QaRunId) => readonly QaCommandSpec[];
  verifyQaRunDirectorySafety: (options: Readonly<{
    qaRoot: string;
    runRoot: string;
    runId: QaRunId;
    existingEntries: readonly string[];
    canonicalize: (path: string) => string;
  }>) => void;
  executeQaCommandLedger: (options: Readonly<{
    ledger: readonly QaCommandSpec[];
    execute: (
      command: QaCommandSpec,
    ) => Promise<
      Readonly<{
        exitCode: number;
        durationMs: number;
        stdout: string;
        stderr: string;
      }>
    >;
    writeLog: (path: string, content: string) => Promise<void>;
    sha256: (content: string) => string;
  }>) => Promise<readonly QaCommandResult[]>;
  createRunComparison: (
    run1: unknown,
    run2: unknown,
    verifyQaRunPair: (first: unknown, second: unknown) => void,
  ) => Readonly<{
    matched: true;
    authoritativeRunId: 'run-2';
    recordPath: 'projects/tanisea-lyric-film/work/qa/run-2/run-comparison.json';
    unexplainedDrift: readonly [];
  }>;
  createSelectedFrameExtractionCommand: (
    sourcePath: string,
    frame: number,
    outputPath: string,
  ) => Readonly<{
    executable: 'ffmpeg';
    arguments: readonly string[];
  }>;
  createRequirementMatrix: (
    runId: QaRunId,
    artifacts: readonly Readonly<{
      id: string;
      kind: string;
      path: string;
      sizeBytes: number;
      sha256: string;
    }>[],
    commands: readonly QaCommandResult[],
    selectedFrames: readonly Readonly<{
      id: string;
      path: string;
      sha256: string;
    }>[],
  ) => Readonly<{
    criteria: readonly Readonly<{
      id: number;
      status: string;
      evidence: readonly Readonly<{
        artifact: string;
        sha256: string;
      }>[];
    }>[];
  }>;
  qaAuditRepositoryPaths: () => Readonly<{
    json: 'audits/tanisea-final-qa-vnext.json';
    markdown: 'audits/tanisea-final-qa-vnext.md';
  }>;
  renderQaReportMarkdown: (report: unknown) => string;
  parseEmbeddedQaReport: (markdown: string) => unknown;
}>;

const moduleSpecifier = '../scripts/run-release-qa';
const qaOrchestratorModule = (await import(
  /* @vite-ignore */ moduleSpecifier
).catch(() => ({}))) as Partial<QaOrchestratorApi>;

const importSideEffects = {
  childProcesses: importIo.childProcess.mock.calls.length,
  filesystemCalls: importIo.filesystem.mock.calls.length,
  stdoutWrites: importIo.stdoutWrite.mock.calls.length,
};
importIo.stdoutWrite.mockRestore();

const requireApi = <Name extends keyof QaOrchestratorApi>(
  name: Name,
): QaOrchestratorApi[Name] => {
  const value = qaOrchestratorModule[name];
  expect(value, `run-release-qa must export ${name}`).toBeTypeOf('function');
  return value as QaOrchestratorApi[Name];
};

const expectedCommands = [
  {id: 'npm-ci', command: 'npm ci'},
  {id: 'check', command: 'npm run check'},
  {id: 'alignment-verify', command: 'npm run alignment:verify'},
  {id: 'layout-verify', command: 'npm run layout:verify'},
  {id: 'compositions', command: 'npm run compositions'},
  {id: 'verify-reference', command: 'npm run verify -- --kind reference'},
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

describe('release-QA import and run selection', () => {
  test('performs no process, filesystem, or stdout I/O on import', () => {
    expect(importSideEffects).toEqual({
      childProcesses: 0,
      filesystemCalls: 0,
      stdoutWrites: 0,
    });
  });

  test.each(['run-1', 'run-2'] as const)('accepts exact run ID %s', (runId) => {
    expect(requireApi('parseQaRunId')(runId)).toBe(runId);
  });

  test.each([
    undefined,
    '',
    'run-0',
    'run-3',
    'RUN-1',
    ' run-1',
    'run-1 ',
    '../run-1',
  ])('rejects unsupported TANISEA_QA_RUN value %s', (value) => {
    expect(() => requireApi('parseQaRunId')(value)).toThrow(
      /TANISEA_QA_RUN|run-1|run-2/i,
    );
  });
});

describe('exact ten-command run ledger', () => {
  test.each(['run-1', 'run-2'] as const)(
    'creates the exact ordered ledger for %s',
    (runId) => {
      const ledger = requireApi('createQaCommandLedger')(runId);
      expect(ledger).toHaveLength(10);
      expect(ledger.map(({id, command}) => ({id, command}))).toEqual(
        expectedCommands,
      );
      expect(ledger[0]).toMatchObject({id: 'npm-ci', command: 'npm ci'});
      for (const entry of ledger) {
        expect(entry.logPath).toBe(
          `projects/tanisea-lyric-film/work/qa/${runId}/logs/${entry.id}.log`,
        );
      }
    },
  );

  test('uses unique command IDs, commands, and run-local log paths', () => {
    const ledger = requireApi('createQaCommandLedger')('run-1');
    expect(new Set(ledger.map(({id}) => id)).size).toBe(10);
    expect(new Set(ledger.map(({command}) => command)).size).toBe(10);
    expect(new Set(ledger.map(({logPath}) => logPath)).size).toBe(10);
  });
});

describe('run-directory preflight', () => {
  const qaRoot = 'C:\\repo\\projects\\tanisea-lyric-film\\work\\qa';
  const canonicalize = (path: string) => win32.normalize(path).toLowerCase();

  test.each(['run-1', 'run-2'] as const)(
    'accepts an empty exact directory for %s',
    (runId) => {
      expect(() =>
        requireApi('verifyQaRunDirectorySafety')({
          qaRoot,
          runRoot: win32.join(qaRoot, runId),
          runId,
          existingEntries: [],
          canonicalize,
        }),
      ).not.toThrow();
    },
  );

  test('rejects a nonempty selected run directory', () => {
    expect(() =>
      requireApi('verifyQaRunDirectorySafety')({
        qaRoot,
        runRoot: win32.join(qaRoot, 'run-1'),
        runId: 'run-1',
        existingEntries: ['qa-run.json'],
        canonicalize,
      }),
    ).toThrow(/nonempty|empty|existing/i);
  });

  test.each([
    'C:\\repo\\projects\\tanisea-lyric-film\\work\\qa\\run-2',
    'C:\\repo\\projects\\tanisea-lyric-film\\work\\qa\\..\\run-1',
    'C:\\outside\\run-1',
  ])('rejects a mismatched or escaped run-1 root %s', (runRoot) => {
    expect(() =>
      requireApi('verifyQaRunDirectorySafety')({
        qaRoot,
        runRoot,
        runId: 'run-1',
        existingEntries: [],
        canonicalize,
      }),
    ).toThrow(/run-1|root|path|outside|alias/i);
  });

  test('rejects canonical aliasing between the run root and QA root', () => {
    expect(() =>
      requireApi('verifyQaRunDirectorySafety')({
        qaRoot,
        runRoot: win32.join(qaRoot, 'run-1'),
        runId: 'run-1',
        existingEntries: [],
        canonicalize: () => 'c:\\same-directory',
      }),
    ).toThrow(/alias|root|path/i);
  });
});

describe('fail-fast command execution and evidence', () => {
  test('captures all ten successful commands with distinct hashed logs', async () => {
    const ledger = requireApi('createQaCommandLedger')('run-1');
    const writes: Array<{path: string; content: string}> = [];
    const execute = vi.fn(async (entry: QaCommandSpec) => ({
      exitCode: 0,
      durationMs: 100 + ledger.indexOf(entry),
      stdout: `stdout:${entry.id}`,
      stderr: '',
    }));
    const results = await requireApi('executeQaCommandLedger')({
      ledger,
      execute,
      writeLog: async (path, content) => {
        writes.push({path, content});
      },
      sha256: (content) => content.padEnd(64, 'a').slice(0, 64),
    });

    expect(execute).toHaveBeenCalledTimes(10);
    expect(results).toHaveLength(10);
    expect(writes.map(({path}) => path)).toEqual(
      ledger.map(({logPath}) => logPath),
    );
    for (const [index, result] of results.entries()) {
      expect(result).toMatchObject({
        id: ledger[index]!.id,
        command: ledger[index]!.command,
        exitCode: 0,
        durationMs: 100 + index,
        logPath: ledger[index]!.logPath,
      });
      expect(result.logSha256).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  test('writes the failing log and stops before every later command', async () => {
    const ledger = requireApi('createQaCommandLedger')('run-2');
    const writes: string[] = [];
    const execute = vi.fn(async (entry: QaCommandSpec) => ({
      exitCode: entry.id === 'layout-verify' ? 9 : 0,
      durationMs: 1,
      stdout: '',
      stderr: entry.id === 'layout-verify' ? 'layout failed' : '',
    }));

    await expect(
      requireApi('executeQaCommandLedger')({
        ledger,
        execute,
        writeLog: async (path) => {
          writes.push(path);
        },
        sha256: () => 'a'.repeat(64),
      }),
    ).rejects.toThrow(/layout-verify|layout failed|exit/i);

    expect(execute).toHaveBeenCalledTimes(4);
    expect(writes).toEqual(ledger.slice(0, 4).map(({logPath}) => logPath));
  });

  test('rejects malformed command evidence before returning success', async () => {
    const ledger = requireApi('createQaCommandLedger')('run-1').slice(0, 1);
    await expect(
      requireApi('executeQaCommandLedger')({
        ledger,
        execute: async () => ({
          exitCode: 0,
          durationMs: 1,
          stdout: '',
          stderr: '',
        }),
        writeLog: async () => undefined,
        sha256: () => 'not-a-sha',
      }),
    ).rejects.toThrow(/sha|hash/i);
  });
});

describe('run-local requirement evidence', () => {
  const artifacts = [
    {
      id: 'source-audio',
      kind: 'source-audio',
      path: 'projects/tanisea-lyric-film/public/soundtrack.m4a',
      sizeBytes: 1,
      sha256: '1'.repeat(64),
    },
    {
      id: 'alignment-manifest',
      kind: 'alignment',
      path:
        'projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json',
      sizeBytes: 1,
      sha256: '2'.repeat(64),
    },
    {
      id: 'public-master',
      kind: 'public',
      path:
        'projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-vNext-60fps-Archival-Master.mp4',
      sizeBytes: 1,
      sha256: '3'.repeat(64),
    },
  ] as const;

  const selectedFrames = (runId: QaRunId) => [
    {
      id: 'chrome',
      path:
        `projects/tanisea-lyric-film/work/qa/${runId}/selected-frames/chrome.png`,
      sha256: 'c'.repeat(64),
    },
    {
      id: 'safe-area',
      path:
        `projects/tanisea-lyric-film/work/qa/${runId}/selected-frames/safe-area.png`,
      sha256: 'f'.repeat(64),
    },
  ] as const;

  test.each(['run-1', 'run-2'] as const)(
    'binds criterion evidence to actual %s command logs',
    (runId) => {
      const commands = requireApi('createQaCommandLedger')(runId).map(
        (entry, index) => ({
          ...entry,
          exitCode: 0,
          durationMs: index + 1,
          logSha256: `${index}`.repeat(64),
        }),
      );
      const matrix = requireApi('createRequirementMatrix')(
        runId,
        artifacts,
        commands,
        selectedFrames(runId),
      );

      for (const [criterionId, commandId] of [
        [2, 'check'],
        [8, 'verify-public-markup'],
        [9, 'layout-verify'],
      ] as const) {
        const evidence = matrix.criteria.find(({id}) => id === criterionId)!
          .evidence[0]!;
        const command = commands.find(({id}) => id === commandId)!;
        expect(evidence).toMatchObject({
          artifact: command.logPath,
          sha256: command.logSha256,
        });
      }

      const cadenceEvidence = matrix.criteria.find(({id}) => id === 7)!
        .evidence;
      expect(cadenceEvidence).toEqual(
        ['verify-public', 'verify-proof'].map((commandId) => {
          const command = commands.find(({id}) => id === commandId)!;
          return expect.objectContaining({
            artifact: command.logPath,
            sha256: command.logSha256,
          });
        }),
      );

      for (const [criterionId, selectedFrameId] of [
        [8, 'chrome'],
        [9, 'safe-area'],
      ] as const) {
        const encodedEvidence = matrix.criteria.find(
          ({id}) => id === criterionId,
        )!.evidence[1]!;
        const selectedFrame = selectedFrames(runId).find(
          ({id}) => id === selectedFrameId,
        )!;
        expect(encodedEvidence).toMatchObject({
          artifact: selectedFrame.path,
          sha256: selectedFrame.sha256,
        });
      }

      expect(matrix.criteria.find(({id}) => id === 10)!.status).toBe(
        runId === 'run-1' ? 'pending-repeat' : 'proved',
      );
    },
  );

  test('writes final reports to the repository audit authority', () => {
    expect(requireApi('qaAuditRepositoryPaths')()).toEqual({
      json: 'audits/tanisea-final-qa-vnext.json',
      markdown: 'audits/tanisea-final-qa-vnext.md',
    });
  });
});

describe('independent selected-frame extraction', () => {
  test('plans an exact FFmpeg frame extraction from authoritative media', () => {
    const sourcePath = String.raw`C:\repo\output\public.mp4`;
    const outputPath = String.raw`C:\repo\work\qa\run-1\selected-frames\chrome.png`;

    expect(
      requireApi('createSelectedFrameExtractionCommand')(
        sourcePath,
        3844,
        outputPath,
      ),
    ).toEqual({
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
        'select=eq(n\\,3844)',
        '-frames:v',
        '1',
        '-fps_mode',
        'vfr',
        '-n',
        outputPath,
      ],
    });
  });
});

describe('run comparison and faithful neutral Markdown', () => {
  test('verifies run-1/run-2 before selecting run-2 as authoritative', () => {
    const run1 = {runId: 'run-1'};
    const run2 = {runId: 'run-2'};
    const verifyPair = vi.fn();
    const comparison = requireApi('createRunComparison')(
      run1,
      run2,
      verifyPair,
    );

    expect(verifyPair).toHaveBeenCalledExactlyOnceWith(run1, run2);
    expect(comparison).toEqual({
      matched: true,
      authoritativeRunId: 'run-2',
      recordPath:
        'projects/tanisea-lyric-film/work/qa/run-2/run-comparison.json',
      unexplainedDrift: [],
    });
  });

  test('does not produce a matched comparison when pair verification fails', () => {
    expect(() =>
      requireApi('createRunComparison')(
        {runId: 'run-1'},
        {runId: 'run-2'},
        () => {
          throw new Error('deterministic drift');
        },
      ),
    ).toThrow(/deterministic drift/);
  });

  test('embeds the complete machine report so Markdown is losslessly faithful', () => {
    const report = {
      schemaVersion: 1,
      status: 'passed-prepublication',
      boundedClaim: 'sample-indexed alignment with frame-bounded rendering',
      nested: {value: 42, list: ['a', 'b']},
    };
    const markdown = requireApi('renderQaReportMarkdown')(report);

    expect(markdown).toContain('passed-prepublication');
    expect(markdown).toContain(
      'sample-indexed alignment with frame-bounded rendering',
    );
    expect(markdown).not.toMatch(/C:\\|\\Users\\|\.superpowers|subagent/i);
    expect(requireApi('parseEmbeddedQaReport')(markdown)).toEqual(report);
  });

  test.each([
    '',
    '# QA\n\n```json\nnot json\n```',
    '# QA without embedded machine report',
    '```json\n{}\n```\n```json\n{}\n```',
  ])('rejects non-faithful Markdown form %j', (markdown) => {
    const parseEmbeddedQaReport = requireApi('parseEmbeddedQaReport');
    expect(() => parseEmbeddedQaReport(markdown)).toThrow(
      /markdown|json|embedded|report/i,
    );
  });
});
