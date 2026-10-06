import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {APPROVED_INPUTS, REVISION, SONG, currentInputHashes, validateProductionGate, checkCurrentProductionGate} from '../scripts/render-gate.ts';
const root = fileURLToPath(new URL('../', import.meta.url));
const read = (file: string): Record<string, unknown> => JSON.parse(readFileSync(`${root}evidence/${file}`, 'utf8')) as Record<string, unknown>;
test('production requires the exact owner-reviewed full v2 inputs', () => {
  const checked = checkCurrentProductionGate(); assert.equal(checked.revision, REVISION);
  assert.equal(Object.keys(checked.inputs).length, APPROVED_INPUTS.length);
  assert.equal(read('owner-review.json').song, SONG);
});
test('missing, stale, inherited and unreviewed production records are rejected', () => {
  const frozen = read('preview-inputs.json'), review = read('owner-review.json'), approval = read('render-authorization.json');
  const hashes = currentInputHashes();
  assert.throws(() => validateProductionGate(frozen, null, approval, hashes), /Owner review/);
  assert.throws(() => validateProductionGate(frozen, review, {...approval, revision: 'phantom-liberty-preview-v1'}, hashes), /another recording/);
  assert.throws(() => validateProductionGate(frozen, {...review, acceptedCurrentPreview: false}, approval, hashes), /complete owner review/);
  assert.throws(() => validateProductionGate(frozen, review, {...approval, authorized: false}, hashes), /authorization/);
  assert.throws(() => validateProductionGate(frozen, review, approval, {...hashes, 'src/scene.ts': '0'.repeat(64)}), /stale/);
  assert.throws(() => validateProductionGate(frozen, review, {...approval, formats: ['landscape']}, hashes), /formats/);
});
