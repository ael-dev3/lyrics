import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {SONG, REVISION, PREVIEW_INPUTS, inputHashes, assertRenderGate} from './render-gate.mjs';

async function fixture() {
  const base = mkdtempSync(join(tmpdir(), 'mitski-render-gate-'));
  for (const name of PREVIEW_INPUTS) {
    const path = join(base, name); mkdirSync(join(path, '..'), {recursive: true});
    writeFileSync(path, name);
  }
  mkdirSync(join(base, 'evidence'));
  const record = {
    song: SONG, revision: REVISION, productionAuthorized: true,
    synchronizationReview: 'owner-attested-complete',
    reviewedFormats: ['landscape', 'portrait'], reviewedSpeeds: ['normal', 'reduced'],
    inputHashes: await inputHashes(base),
  };
  const save = () => writeFileSync(join(base, 'evidence/render-authorization.json'), JSON.stringify(record));
  save(); return {base, record, save, cleanup: () => rmSync(base, {recursive: true, force: true})};
}
test('production gate accepts only matching complete review and frozen preview', async () => {
  const f = await fixture(); try { assert.equal((await assertRenderGate({base: f.base})).song, SONG); } finally { f.cleanup(); }
});
test('production gate rejects missing, partial, stale or differently scoped review', async () => {
  const f = await fixture();
  try {
    const scenarios = [
      ['missing authorization', () => { f.record.productionAuthorized = false; }],
      ['incomplete listening', () => { f.record.synchronizationReview = 'preview-available'; }],
      ['one layout', () => { f.record.reviewedFormats = ['landscape']; }],
      ['one speed', () => { f.record.reviewedSpeeds = ['normal']; }],
      ['wrong song', () => { f.record.song = 'another-song'; }],
      ['wrong revision', () => { f.record.revision = 'old-revision'; }],
      ['missing input', () => { delete f.record.inputHashes['src/timeline.json']; }],
      ['stale input', () => { f.record.inputHashes['src/timeline.json'] = '0'.repeat(64); }],
    ];
    for (const [label, mutate] of scenarios) {
      const previous = structuredClone(f.record); mutate(); f.save();
      await assert.rejects(() => assertRenderGate({base: f.base}), Error, label);
      Object.assign(f.record, previous); f.save();
    }
    writeFileSync(join(f.base, 'src/timeline.json'), 'changed');
    await assert.rejects(() => assertRenderGate({base: f.base}), /input changed/);
  } finally { f.cleanup(); }
});
