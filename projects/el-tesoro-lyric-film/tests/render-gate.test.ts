import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {test} from 'node:test';
import {assertRenderGate, inputHashes, PREVIEW_INPUTS, REVISION, SONG} from '../scripts/render-gate.ts';

test('production refuses absent, incomplete and stale bilingual review or approval', async () => {
  const base = mkdtempSync(join(tmpdir(), 'el-tesoro-gate-'));
  try {
    for (const name of PREVIEW_INPUTS) {
      const path = join(base, name);
      mkdirSync(dirname(path), {recursive: true});
      writeFileSync(path, `locked-${name}`);
    }
    mkdirSync(join(base, 'evidence'), {recursive: true});
    await assert.rejects(assertRenderGate(base), /missing or invalid/);
    const hashes = await inputHashes(base);
    const review = {
      song: SONG, revision: REVISION, status: 'incomplete', translationReview: 'complete',
      actualAudioReview: 'pending', audiovisualReview: 'complete', reviewedFormats: ['landscape', 'portrait'],
      reviewedSpeeds: ['normal', 'reduced'], reviewedLines: Array.from({length: 24}, (_, i) => `L${String(i + 1).padStart(2, '0')}`),
      unresolvedDefects: [], inputHashes: hashes,
    };
    const reviewPath = join(base, 'evidence/cross-language-sync-review.json');
    const approvalPath = join(base, 'evidence/render-authorization.json');
    writeFileSync(reviewPath, JSON.stringify(review));
    await assert.rejects(assertRenderGate(base), /Complete current-song/);
    review.status = 'complete';
    review.actualAudioReview = 'complete';
    writeFileSync(reviewPath, JSON.stringify(review));
    await assert.rejects(assertRenderGate(base), /render-authorization.json is missing/);
    const approval = {song: SONG, revision: REVISION, productionAuthorized: false, reviewedPreview: true, inputHashes: hashes};
    writeFileSync(approvalPath, JSON.stringify(approval));
    await assert.rejects(assertRenderGate(base), /Explicit production authorization/);
    approval.productionAuthorized = true;
    approval.revision = 'other-revision';
    writeFileSync(approvalPath, JSON.stringify(approval));
    await assert.rejects(assertRenderGate(base), /another song or preview revision/);
    approval.revision = REVISION;
    writeFileSync(approvalPath, JSON.stringify(approval));
    await assertRenderGate(base);
    writeFileSync(join(base, 'src/timeline.json'), 'changed after approval');
    await assert.rejects(assertRenderGate(base), /does not match current preview input/);
  } finally {rmSync(base, {recursive: true, force: true});}
});
