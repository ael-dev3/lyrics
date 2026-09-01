import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe, expect, test} from 'vitest';

describe('compiled media tool project roots', () => {
  test.each([
    'scripts/encode-delivery.ts',
    'scripts/make-platform-delivery.ts',
  ])('%s uses the source/compiled-aware root helper', (relativePath) => {
    const source = readFileSync(resolve(relativePath), 'utf8');
    expect(source).toContain('projectRootFromScriptDirectory');
    expect(source).toMatch(
      /const root = projectRootFromScriptDirectory\(__dirname\);/,
    );
    expect(source).not.toContain("const root = resolve(__dirname, '..')");
  });
});
