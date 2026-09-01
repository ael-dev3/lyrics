import packageJson from '../package.json';
import {describe, expect, test} from 'vitest';

describe('release QA package entrypoints', () => {
  test('normalizes the ProRes reference after every full render', () => {
    expect(packageJson.scripts['reference:normalize']).toBe(
      'npm run build:tools && node .tools-dist/scripts/normalize-reference.js',
    );
    expect(packageJson.scripts.render).toMatch(
      /--pixel-format=yuv444p10le .* --muted && npm run reference:normalize$/,
    );
  });

  test('builds tools before rendering deterministic QA media', () => {
    expect(packageJson.scripts['qa:clips']).toBe(
      'npm run build:tools && node .tools-dist/scripts/render-qa-clips.js',
    );
  });

  test('builds tools before executing one selected QA run', () => {
    expect(packageJson.scripts['qa:run']).toBe(
      'npm run build:tools && node .tools-dist/scripts/run-release-qa.js',
    );
  });
});
