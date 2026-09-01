import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {
  createPublishedQaReport,
  verifyPublishedQaReport,
} from './release-gates.js';
import {
  parseEmbeddedQaReport,
  renderQaReportMarkdown,
} from './run-release-qa.js';
import {projectRootFromScriptDirectory} from './project-root.js';

type FinalizedPublicationArtifacts = Readonly<{
  report: unknown;
  json: string;
  markdown: string;
}>;

const readJson = (path: string): unknown => {
  const source = readFileSync(path, 'utf8');
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(
      `Publication finalization: invalid JSON in ${path}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

const sha256Text = (source: string): string =>
  createHash('sha256').update(source).digest('hex');

export const createFinalizedPublicationArtifacts = (
  prepublicationReport: unknown,
  publicationEvidence: unknown,
): FinalizedPublicationArtifacts => {
  const report = createPublishedQaReport(
    prepublicationReport,
    publicationEvidence,
  );
  verifyPublishedQaReport(report);
  const json = `${JSON.stringify(report, null, 2)}\n`;
  const markdown = renderQaReportMarkdown(report);
  if (
    JSON.stringify(parseEmbeddedQaReport(markdown)) !==
    JSON.stringify(report)
  ) {
    throw new Error(
      'Publication finalization: Markdown must preserve the complete machine report',
    );
  }
  return {report, json, markdown};
};

const runFinalizePublicationCli = (): void => {
  if (process.argv.slice(2).length !== 0) {
    throw new Error(
      `Publication finalization: unexpected argument ${process.argv[2] ?? ''}`,
    );
  }
  const projectRoot = projectRootFromScriptDirectory(__dirname);
  const repositoryRoot = resolve(projectRoot, '..', '..');
  const publicationEvidencePath = resolve(
    projectRoot,
    'work',
    'release-publication.json',
  );
  const auditJsonPath = resolve(
    repositoryRoot,
    'audits',
    'tanisea-final-qa-vnext.json',
  );
  const auditMarkdownPath = resolve(
    repositoryRoot,
    'audits',
    'tanisea-final-qa-vnext.md',
  );
  const {report, json, markdown} = createFinalizedPublicationArtifacts(
    readJson(auditJsonPath),
    readJson(publicationEvidencePath),
  );

  writeFileSync(auditJsonPath, json, 'utf8');
  writeFileSync(auditMarkdownPath, markdown, 'utf8');

  const persistedJson = readJson(auditJsonPath);
  const persistedMarkdown = readFileSync(auditMarkdownPath, 'utf8');
  verifyPublishedQaReport(persistedJson);
  if (
    JSON.stringify(parseEmbeddedQaReport(persistedMarkdown)) !==
    JSON.stringify(report)
  ) {
    throw new Error(
      'Publication finalization: persisted Markdown does not match the verified report',
    );
  }

  process.stdout.write(
    `${JSON.stringify(
      {
        status: 'passed-publication',
        reportJsonSha256: sha256Text(json),
        reportMarkdownSha256: sha256Text(markdown),
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
    runFinalizePublicationCli();
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  }
}
