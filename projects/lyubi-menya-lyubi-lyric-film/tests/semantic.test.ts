import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {activeDisplaySource, activeSource, activeTargets, sourceFocusIds, targetFocusIds} from '../src/focus.ts';
import type {Cue, ProductionData, TargetWord} from '../src/schema.ts';

type PlannedCue = {
  id: string;
  key: string;
  section: string;
  ru: {id: string; text: string}[];
  en: TargetWord[];
  mappingRationale: string;
};
const planned: PlannedCue[] = JSON.parse(readFileSync(new URL('../source/text-and-mapping.json', import.meta.url), 'utf8'));
const normalized = (text: string) => text.toLowerCase().replace(/[.,!?;:]+$/u, '');
const words = (items: {text: string}[]) => items.map(word => normalized(word.text));
const members = (cue: PlannedCue, key: string) => cue.ru.filter(word => normalized(word.text) === key);
const sourceId = (cue: PlannedCue, key: string, occurrence = 0) => {
  const found = members(cue, key)[occurrence];
  assert.ok(found, `${cue.id}: expected source word ${key} #${occurrence + 1}`);
  return found.id;
};

// Deliberately separated synthetic windows expose invented holds and grouping.
// These fixtures test display behavior; they are not estimates of sung timing.
function fixture(cue: PlannedCue): {cue: Cue; data: ProductionData} {
  const ru = cue.ru.map((word, index) => ({...word, startSample: 1000 + index * 1000, endSample: 1400 + index * 1000, candidateSpreadMs: 0, reviewRequired: true}));
  const timed: Cue = {...cue, ru, startSample: ru[0]!.startSample, endSample: ru.at(-1)!.endSample, visibleFrom: 0, visibleUntil: 10000};
  return {cue: timed, data: {sampleRate: 1000, sampleCount: 10000, duration: 10, fps: 100, frames: 1000, audioSha256: 'synthetic-display-contract-only', cues: [timed]}};
}

function assertMeaning(cue: PlannedCue, source: string, expected: string[], occurrence = 0, pairedSource?: string[]) {
  const id = sourceId(cue, source, occurrence);
  const targets = cue.en.filter(word => word.sourceIds.includes(id));
  assert.deepEqual(words(targets), expected, `${cue.id}: complete lexical meaning of ${source}`);
  assert.deepEqual(words(cue.en.filter(word => targetFocusIds(word).includes(id))), expected, `${cue.id}: display must neither omit nor broaden ${source}`);
  const {cue: timed, data} = fixture(cue);
  const sourceIndex = cue.ru.findIndex(word => word.id === id);
  const expectedSource = pairedSource ? pairedSource.map(key => sourceId(cue, key)) : [id];
  assert.deepEqual(sourceFocusIds(timed, id), expectedSource, `${cue.id}: paired source focus for ${source}`);
  for (const frame of [100 + sourceIndex * 100, 139 + sourceIndex * 100]) {
    assert.deepEqual([...activeSource(timed, frame, data)], [id], 'Acoustic evidence stays a single source event');
    assert.deepEqual([...activeDisplaySource(timed, frame, data)].sort(), [...expectedSource].sort(), `${cue.id}: both lanes complete the same phrase`);
    assert.deepEqual(words(cue.en.filter(word => activeTargets(timed, frame, data).has(word.id))), expected, `${cue.id}: onset/last-active-frame meaning`);
  }
  for (const frame of [99 + sourceIndex * 100, 140 + sourceIndex * 100, 170 + sourceIndex * 100]) {
    assert.equal(activeTargets(timed, frame, data).size, 0, `${cue.id}: no focus before onset or through a real gap`);
    assert.equal(activeDisplaySource(timed, frame, data).size, 0, `${cue.id}: source display releases with English`);
  }
}

function independent(cue: PlannedCue, source: string, expected: string[], occurrence = 0) {
  const id = sourceId(cue, source, occurrence);
  assertMeaning(cue, source, expected, occurrence);
  for (const target of cue.en.filter(word => word.sourceIds.includes(id))) {
    assert.deepEqual(target.sourceIds, [id], `${cue.id}: ${source} must retain its independent event`);
    assert.deepEqual(targetFocusIds(target), [id], `${cue.id}: explicit ${source} must not be swallowed by a broader display phrase`);
  }
}

function imperative(cue: PlannedCue) {
  assert.equal(members(cue, 'люби').length, 2);
  independent(cue, 'люби', ['love'], 0);
  independent(cue, 'меня', ['me']);
  independent(cue, 'люби', ['love'], 1);
  assert.equal(words(cue.en).filter(word => word === 'me').length, 1, `${cue.id}: no invented object after the second imperative`);
}

function sameDeterminer(cue: PlannedCue) {
  independent(cue, 'те', ['those']);
  independent(cue, 'же', ['same']);
  assert.deepEqual(words(cue.en).slice(0, 2), ['those', 'same'], 'Natural Those same wording preserves the demonstrative and permits two distinct source events');
}

// These are editorial expectations for the supplied text, independent of the
// generator's encoded indices. Every planned repetition runs the same contract.
const meaningContracts: Record<string, (cue: PlannedCue) => void> = {
  v1(cue) {
    assert.deepEqual(words(cue.en), ['my', 'untamed', 'love']);
    independent(cue, 'непокорная', ['untamed']);
    independent(cue, 'моя', ['my']);
    independent(cue, 'любовь', ['love']);
    assert.ok(cue.en.findIndex(word => word.sourceIds.includes(sourceId(cue, 'моя'))) < cue.en.findIndex(word => word.sourceIds.includes(sourceId(cue, 'непокорная'))), 'Natural My untamed order requires reversed focus');
  },
  v2(cue) {
    independent(cue, 'любит', ['loves']);
    independent(cue, 'не', ['but', 'not']);
    independent(cue, 'меня', ['me']);
    const duration = ['уже', 'который', 'год'];
    for (const source of duration) assertMeaning(cue, source, ['year', 'after', 'year'], 0, duration);
    for (const word of cue.en.filter(word => ['year', 'after'].includes(normalized(word.text)))) assert.deepEqual(word.sourceIds, duration.map(key => sourceId(cue, key)));
    assert.ok(!words(cue.en).some(word => ['someone', 'somebody', 'else', 'she', 'he', 'her', 'him', 'you'].includes(word)), 'No invented lover, addressee or gender');
  },
  v3a(cue) {
    sameDeterminer(cue);
    independent(cue, 'стены', ['walls']);
    independent(cue, 'и', ['and']);
    independent(cue, 'цветы', ['flowers']);
  },
  v3b(cue) {
    sameDeterminer(cue);
    independent(cue, 'люди', ['people']);
    independent(cue, 'и', ['and']);
    independent(cue, 'стихи', ['poems']);
  },
  v4(cue) {
    sameDeterminer(cue);
    independent(cue, 'мысли', ['thoughts']);
    independent(cue, 'и', ['and']);
    independent(cue, 'слова', ['words']);
    independent(cue, 'вслух', ['out', 'loud']);
  },
  c1(cue) {
    imperative(cue);
    independent(cue, 'жарким', ['with', 'blazing']);
    independent(cue, 'огнём', ['fire']);
    const targetWords = words(cue.en);
    assert.equal(targetWords.indexOf('blazing') - targetWords.indexOf('with'), 1, 'The grammatical completion begins with its adjacent adjective');
    assert.equal(targetWords[targetWords.indexOf('with') + 1], 'blazing', 'The adjective leads the phrase; fire keeps the following independent source event');
  },
  c2(cue) {
    independent(cue, 'ночью', ['night']);
    independent(cue, 'и', ['and']);
    independent(cue, 'днём', ['day']);
    independent(cue, 'сердце', ['the', 'heart']);
    independent(cue, 'сжигая', ['burning']);
    assert.ok(!words(cue.en).some(word => ['my', 'your', 'our', 'his', 'her', 'their'].includes(word)), 'Do not invent ownership of the heart');
    assert.ok(words(cue.en).indexOf('burning') < words(cue.en).indexOf('heart'), 'English burning the heart retains natural order with reversed correspondence');
  },
  c3(cue) {
    imperative(cue);
    independent(cue, 'не', ["don't"]);
    independent(cue, 'улетай', ['fly', 'away']);
  },
  c4(cue) {
    independent(cue, 'не', ["don't"]);
    independent(cue, 'исчезай', ['disappear']);
    independent(cue, 'я', ['i']);
    independent(cue, 'умоляю', ['am', 'begging']);
    assert.ok(!words(cue.en).includes('you'), 'Begging has no stated addressee');
  },
  r1(cue) {
    imperative(cue);
    assert.deepEqual(words(cue.en), ['love', 'me', 'love']);
  },
};

test('all 33 supplied-reference cues and every repeated meaning have semantic contracts', () => {
  assert.equal(planned.length, 33, 'Revise this inventory only with recording-specific coverage evidence');
  const counts = Object.fromEntries(Object.keys(meaningContracts).map(key => [key, planned.filter(cue => cue.key === key).length]));
  assert.deepEqual(counts, {v1: 2, v2: 2, v3a: 2, v3b: 2, v4: 2, c1: 4, c2: 4, c3: 4, c4: 4, r1: 7});
  assert.deepEqual(planned.map(cue => cue.id), Array.from({length: 33}, (_, index) => `LM-${String(index + 1).padStart(3, '0')}`));
  assert.ok(planned.every(cue => Object.hasOwn(meaningContracts, cue.key)), 'An added text pattern requires an explicit semantic review');
});

test('every source and English word is covered, with unique identities and no neutral grammar', () => {
  const ids = new Set<string>();
  for (const cue of planned) {
    assert.ok(cue.mappingRationale.trim(), `${cue.id}: missing editorial rationale`);
    const sourceIds = new Set(cue.ru.map(word => word.id));
    for (const word of [...cue.ru, ...cue.en]) {
      assert.ok(!ids.has(word.id), `Duplicate global word identity ${word.id}`);
      ids.add(word.id);
      assert.ok(word.text.trim(), `${word.id}: empty text`);
    }
    for (const word of cue.en) {
      assert.ok(word.sourceIds.length > 0, `${word.id}: neutral English word`);
      assert.equal(new Set(word.sourceIds).size, word.sourceIds.length, `${word.id}: duplicated correspondence`);
      assert.ok(word.sourceIds.every(id => sourceIds.has(id)), `${word.id}: unknown or cross-cue source`);
      assert.ok(targetFocusIds(word).every(id => sourceIds.has(id)), `${word.id}: unknown display source`);
    }
    for (const word of cue.ru) assert.ok(cue.en.some(target => target.sourceIds.includes(word.id)), `${word.id}: untranslated Russian word`);
  }
});

for (const cue of planned) {
  test(`${cue.id} ${cue.section}: ${cue.ru.map(word => word.text).join(' ')} — complete, precise paired meaning`, () => {
    assert.ok(meaningContracts[cue.key], `No independent expectation for ${cue.key}`);
    meaningContracts[cue.key]!(cue);
  });
}

test('semantic expectations reject incomplete, over-broad and meaning-changing regressions', () => {
  const altered = (key: string, edit: (cue: PlannedCue) => void) => {
    const original = planned.find(cue => cue.key === key);
    assert.ok(original);
    const cue = structuredClone(original);
    edit(cue);
    assert.throws(() => meaningContracts[key]!(cue), `The ${key} contract must reject its intentionally defective fixture`);
  };
  altered('v4', cue => { cue.en.find(word => normalized(word.text) === 'loud')!.sourceIds = []; });
  altered('c3', cue => { cue.en.find(word => normalized(word.text) === 'away')!.sourceIds = []; });
  altered('c4', cue => { cue.en.find(word => normalized(word.text) === 'am')!.sourceIds = []; });
  altered('c4', cue => { cue.en.find(word => normalized(word.text) === 'i')!.sourceIds = [sourceId(cue, 'умоляю')]; });
  altered('c1', cue => { cue.en.find(word => normalized(word.text) === 'blazing')!.sourceIds = [sourceId(cue, 'огнём')]; });
  altered('c1', cue => { cue.en.find(word => normalized(word.text) === 'with')!.sourceIds = [sourceId(cue, 'огнём')]; });
  altered('r1', cue => { cue.en.find(word => normalized(word.text) === 'me')!.focusSourceIds = [sourceId(cue, 'меня'), sourceId(cue, 'люби')]; });
  altered('v3a', cue => {
    for (const word of cue.en.filter(word => ['those', 'same'].includes(normalized(word.text)))) {
      word.sourceIds = [sourceId(cue, 'те'), sourceId(cue, 'же')];
    }
  });
  altered('c2', cue => { cue.en.find(word => normalized(word.text) === 'the')!.text = 'my'; });
  altered('v1', cue => { cue.en.find(word => normalized(word.text) === 'my')!.sourceIds = [sourceId(cue, 'непокорная')]; });
});
