import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

type Word = {
  id: string; text: string; start: number; end: number;
  startSample: number; endSampleExclusive: number; requiresReview: boolean;
};
type Line = {
  id: string; text: string; start: number; end: number;
  startSample: number; endSampleExclusive: number;
  uncertainText: boolean; uncertain: boolean; requiresReview: boolean; words: Word[];
};
type Candidate = {start: number; end: number; modelProbability: number};
type Observation = {
  id: string; text: string;
  selected: {start: string; end: string};
  candidateSpreadMsCtc: {start: number; end: number};
  candidates: Record<string, Candidate>;
};
type Evidence = {observations: Observation[]};
type Provenance = {
  sourceMp4Sha256: string; sourceAudioSampleRate: number; decodedSamplesPerChannel: number;
  wordCueFileSha256: string; candidateEvidenceFileSha256: string;
  lineCueCount: number; wordCueCount: number;
  forcedAlignmentPasses: {id: string}[];
  ctcWordsOver25MsSpread: number; actualAudioReviewComplete: boolean;
};

const MODELS = ['mms-mix', 'wav2vec-mix', 'mms-stem', 'wav2vec-stem', 'stable-stem', 'stable-mix'];
const CTC_MODELS = MODELS.slice(0, 4);
const sha256 = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');

export function verifyWordTiming(root = process.cwd()): {lines: number; words: number; reviewFlags: number} {
  const read = (path: string) => readFileSync(resolve(root, path));
  const cueBytes = read('src/word-cues.json');
  const evidenceBytes = read('evidence/word-alignment-candidates.json');
  const lines = JSON.parse(cueBytes.toString('utf8')) as Line[];
  const evidence = JSON.parse(evidenceBytes.toString('utf8')) as Evidence;
  const provenance = JSON.parse(read('evidence/word-alignment-provenance.json').toString('utf8')) as Provenance;
  assert(Array.isArray(lines) && lines.length === 18, 'Expected all 18 independently timed lines');
  assert(Array.isArray(evidence.observations) && evidence.observations.length === 76, 'Expected 76 source-word observations');
  assert.equal(provenance.sourceAudioSampleRate, 48000, 'Unexpected source sample clock');
  assert.equal(provenance.decodedSamplesPerChannel, 11868160, 'Unexpected decoded source length');
  assert.equal(provenance.sourceMp4Sha256, '939d24391e68d460a4d21fee88196c738b6f491362f192cabdcf33d15153a9b0');
  assert.equal(sha256(cueBytes), provenance.wordCueFileSha256, 'Word-cue bytes differ from the evidence snapshot');
  assert.equal(sha256(evidenceBytes), provenance.candidateEvidenceFileSha256, 'Candidate evidence differs from the snapshot');
  assert.deepEqual(provenance.forcedAlignmentPasses.map(pass => pass.id), MODELS, 'Incomplete six-pass inventory');
  assert.equal(typeof provenance.actualAudioReviewComplete, 'boolean', 'Actual-audio review status is missing');

  const observationById = new Map(evidence.observations.map(row => [row.id, row]));
  assert.equal(observationById.size, 76, 'Duplicate word observation ID');
  const sampleRate = provenance.sourceAudioSampleRate;
  const checkClock = (seconds: number, sample: number, label: string) => {
    assert(Number.isFinite(seconds) && Number.isInteger(sample), `Invalid ${label} clock value`);
    assert(Math.abs(seconds - sample / sampleRate) <= 0.00000051, `${label} does not derive from its source sample`);
  };
  const ids = new Set<string>();
  let previousLineEnd = 0;
  let count = 0;
  let reviewFlags = 0;
  for (const line of lines) {
    assert(typeof line.id === 'string' && !ids.has(line.id), 'Missing or duplicate line ID');
    ids.add(line.id);
    assert(Array.isArray(line.words) && line.words.length === line.text.split(/\s+/).length, `Word count differs from line text: ${line.id}`);
    assert.equal(line.uncertain, line.uncertainText, `Uncertain text flag lost: ${line.id}`);
    assert.equal(line.uncertain, line.id === 'V1-02', `Unexpected text uncertainty: ${line.id}`);
    assert(line.startSample >= previousLineEnd && line.endSampleExclusive <= provenance.decodedSamplesPerChannel, `Line outside source or preceding line: ${line.id}`);
    assert(line.startSample < line.endSampleExclusive, `Nonpositive line interval: ${line.id}`);
    checkClock(line.start, line.startSample, `${line.id} start`);
    checkClock(line.end, line.endSampleExclusive, `${line.id} end`);
    assert.equal(line.startSample, line.words[0]?.startSample, `Line start differs from first word: ${line.id}`);
    assert.equal(line.endSampleExclusive, line.words.at(-1)?.endSampleExclusive, `Line end differs from last word: ${line.id}`);
    let previousWordEnd = line.startSample;
    for (const [index, word] of line.words.entries()) {
      const expectedId = `${line.id}:${index + 1}`;
      assert.equal(word.id, expectedId, `Wrong stable word ID in ${line.id}`);
      assert.equal(word.text, line.text.split(/\s+/)[index], `Displayed and timed text differ: ${word.id}`);
      assert(word.startSample >= previousWordEnd && word.endSampleExclusive <= line.endSampleExclusive, `Word crosses another word or line: ${word.id}`);
      assert(word.startSample < word.endSampleExclusive, `Nonpositive word interval: ${word.id}`);
      checkClock(word.start, word.startSample, `${word.id} start`);
      checkClock(word.end, word.endSampleExclusive, `${word.id} end`);
      const observation = observationById.get(word.id);
      assert(observation && observation.text === word.text, `Missing matching evidence: ${word.id}`);
      assert.deepEqual(Object.keys(observation.candidates), MODELS, `Incomplete model evidence: ${word.id}`);
      for (const boundary of ['start', 'end'] as const) {
        const model: string = observation.selected[boundary];
        const candidate: Candidate | undefined = observation.candidates[model];
        assert(candidate, `Selected ${boundary} model is absent: ${word.id}`);
        const selectedSample = boundary === 'start' ? word.startSample : word.endSampleExclusive;
        assert.equal(selectedSample, Math.round(candidate[boundary] * sampleRate), `Invented or stale selected boundary: ${word.id} ${boundary}`);
        const ctcValues: number[] = CTC_MODELS.map(name => {
          const ctc: Candidate | undefined = observation.candidates[name];
          assert(ctc, `Missing CTC candidate: ${word.id}`);
          return ctc[boundary];
        });
        assert(ctcValues.every(value => Number.isFinite(value)), `Invalid CTC candidate: ${word.id}`);
        const spread = 1000 * (Math.max(...ctcValues) - Math.min(...ctcValues));
        assert(Math.abs(spread - observation.candidateSpreadMsCtc[boundary]) <= 0.11, `Candidate spread changed: ${word.id} ${boundary}`);
      }
      const needsReview = observation.candidateSpreadMsCtc.start > 25 || observation.candidateSpreadMsCtc.end > 25;
      assert.equal(word.requiresReview, needsReview, `Review flag disagrees with candidate spread: ${word.id}`);
      if (needsReview) reviewFlags++;
      previousWordEnd = word.endSampleExclusive;
      count++;
    }
    assert.equal(line.requiresReview, line.words.some(word => word.requiresReview), `Line review flag missing: ${line.id}`);
    previousLineEnd = line.endSampleExclusive;
  }
  assert.equal(count, 76);
  assert.equal(provenance.lineCueCount, lines.length);
  assert.equal(provenance.wordCueCount, count);
  assert.equal(provenance.ctcWordsOver25MsSpread, reviewFlags);
  return {lines: lines.length, words: count, reviewFlags};
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const result = verifyWordTiming();
  process.stdout.write(`Verified ${result.words} words in ${result.lines} lines on the locked 48 kHz source clock; ${result.reviewFlags} await perceptual review.\n`);
}
