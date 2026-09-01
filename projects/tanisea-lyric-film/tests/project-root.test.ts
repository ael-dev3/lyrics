import {join, resolve} from 'node:path';
import {describe, expect, test} from 'vitest';
import {projectRootFromScriptDirectory} from '../scripts/project-root';

describe('compiled tool project-root resolution', () => {
  const projectRoot = resolve('fixture-project');

  test('resolves a source scripts directory to the project root', () => {
    expect(
      projectRootFromScriptDirectory(join(projectRoot, 'scripts')),
    ).toBe(projectRoot);
  });

  test('resolves a compiled .tools-dist scripts directory to the project root', () => {
    expect(
      projectRootFromScriptDirectory(
        join(projectRoot, '.tools-dist', 'scripts'),
      ),
    ).toBe(projectRoot);
  });
});
