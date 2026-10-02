import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';

type SourceToken = {index: number; id: string; text: string};
type TargetToken = SourceToken & {
  sourceIndices: number[];
  focusSourceIndices: number[];
  relation: string;
  rationale: string;
};
type Template = {
  id: string;
  sourceLanguage: 'ru' | 'en';
  targetLanguage: 'ru' | 'en';
  sourceText: string;
  targetText: string;
  sourceTokens: SourceToken[];
  targetTokens: TargetToken[];
  sourceLineBreaksAfterIndices: number[];
  targetLineBreaksAfterIndices: number[];
  editorialNote: string;
};
type Editorial = {
  focusPolicy: string;
  suppliedLines: {id: string; templateId: string; text: string}[];
  editorialCues: {id: string; templateId: string; suppliedLineIds: string[]; timingStatus: string; recordingAdded?: boolean; coverageBasis?: {kind: string; referenceCueId: string; signalEvidence: string; sourceOffsetSeconds: number; normalizedCorrelation: number; reason: string}}[];
  templates: Template[];
  semanticRegressionExpectations: {templateId: string; sourceTexts: string[]; targetTexts: string[]; expectation: string}[];
  coverage: Record<string, number>;
};

const editorial = JSON.parse(readFileSync(new URL('../source/lyrics-editorial.json', import.meta.url), 'utf8')) as Editorial;
const normalized = (text: string) => text.toLowerCase().replace(/^[«“"]+|[.,!?;:»”"]+$/gu, '');
const textOf = (tokens: {text: string}[]) => tokens.map(token => normalized(token.text));
const template = (id: string): Template => {
  const found = editorial.templates.find(value => value.id === id);
  assert.ok(found, `Missing reviewed template ${id}`);
  return found;
};
const sourceIndex = (value: Template, text: string, occurrence = 0): number => {
  const found = value.sourceTokens.filter(token => normalized(token.text) === normalized(text))[occurrence];
  assert.ok(found, `${value.id}: missing source ${text} occurrence ${occurrence + 1}`);
  return found.index;
};

// This is a standalone editorial oracle, not the production renderer. Deliberate
// synthetic gaps expose broad spans, premature focus and incomplete expansions.
// These integer windows are test fixtures, never estimates of recorded vocals.
type Window = {index: number; start: number; end: number};
const fixture = (value: Template): Window[] => value.sourceTokens.map(token => ({
  index: token.index, start: 1000 + token.index * 1000, end: 1400 + token.index * 1000,
}));
const originalAt = (windows: Window[], at: number): number[] => windows.filter(window => window.start <= at && at < window.end).map(window => window.index);
const translatedAt = (value: Template, windows: Window[], at: number): string[] => {
  const active = new Set(originalAt(windows, at));
  return textOf(value.targetTokens.filter(token => token.focusSourceIndices.some(index => active.has(index))));
};

function focus(value: Template, source: string, expected: string[], occurrence = 0, independent = true): void {
  const index = sourceIndex(value, source, occurrence);
  const targets = value.targetTokens.filter(token => token.focusSourceIndices.includes(index));
  assert.deepEqual(textOf(targets), expected.map(normalized), `${value.id}: complete, bounded display meaning for ${source}`);
  if (independent) {
    for (const target of targets) assert.deepEqual(target.focusSourceIndices, [index], `${target.id}: explicit source event must stay independent`);
  }
  const windows = fixture(value);
  const own = windows[index]!;
  assert.deepEqual(originalAt(windows, own.start), [index], 'Source words remain independently active');
  for (const at of [own.start, own.end - 1]) assert.deepEqual(translatedAt(value, windows, at), expected.map(normalized), 'Onset and last-active sample retain the complete meaning');
  for (const at of [own.start - 1, own.end, own.end + 250]) assert.deepEqual(translatedAt(value, windows, at), [], 'No early onset, inclusive end or focus across an actual gap');
}

// The following 20 contracts are authored from selected meanings, not generated
// by reading the JSON's own expectation strings or encoded correspondence lists.
const contracts: {name: string; templateId: string; check: (value: Template) => void}[] = [
  {name: 'substantive Тот includes the complete The one', templateId: 'v1-opening', check(value) {
    focus(value, 'Тот', ['The', 'one']);
  }},
  {name: 'кто keeps its independent relative-pronoun event', templateId: 'v1-opening', check(value) {
    focus(value, 'кто', ['who']);
  }},
  {name: 'погас includes went dark without an added light object', templateId: 'v1-opening', check(value) {
    focus(value, 'погас', ['went', 'dark']);
    assert.deepEqual(textOf(value.targetTokens), ['the', 'one', 'who', 'went', 'dark', 'will', 'shine', 'brighter', 'than', 'comets']);
  }},
  {name: 'ярче and светить keep separate events in natural reversed order', templateId: 'v1-opening', check(value) {
    focus(value, 'ярче', ['brighter']);
    focus(value, 'светить', ['shine']);
    assert.ok(textOf(value.targetTokens).indexOf('shine') < textOf(value.targetTokens).indexOf('brighter'));
  }},
  {name: 'explicit твоей and красоты stay independent', templateId: 'v1-bird', check(value) {
    focus(value, 'твоей', ['your']);
    focus(value, 'красоты', ['beauty']);
  }},
  {name: 'не is separate from the complete will be born expression', templateId: 'v1-bird', check(value) {
    focus(value, 'не', ['not']);
    focus(value, 'родится', ['will', 'be', 'born']);
  }},
  {name: 'youth free bird keeps three reordered subject events', templateId: 'v1-bird', check(value) {
    focus(value, 'Юности', ["youth's"]);
    focus(value, 'вольная', ['free']);
    focus(value, 'птица', ['bird']);
    assert.ok(textOf(value.targetTokens).indexOf('bird') < textOf(value.targetTokens).indexOf('will'));
    assert.equal(value.targetTokens.find(token => normalized(token.text) === "youth's")!.text, "youth's", 'The merged sentence does not turn youth into a proper name');
  }},
  {name: 'both eagle repetitions include their own necessary article', templateId: 'refrain-eagle', check(value) {
    focus(value, 'орёл', ['an', 'eagle'], 0);
    focus(value, 'орёл', ['an', 'eagle'], 1);
    focus(value, 'Словно', ['Like'], 0);
    focus(value, 'Словно', ['like'], 1);
  }},
  {name: 'терял keeps complete has lost with no guessed loss object', templateId: 'v2-loss', check(value) {
    focus(value, 'терял', ['has', 'lost']);
    assert.deepEqual(textOf(value.targetTokens), ['the', 'one', 'who', 'has', 'lost', 'will', 'love', 'again']);
  }},
  {name: 'future repetition and loving are independent and objectless', templateId: 'v2-loss', check(value) {
    focus(value, 'будет', ['will']);
    focus(value, 'снова', ['again']);
    focus(value, 'любить', ['love']);
  }},
  {name: 'близится includes the full draws near expression', templateId: 'v2-summer', check(value) {
    focus(value, 'близится', ['draws', 'near']);
    assert.deepEqual(textOf(value.targetTokens), ['beyond', 'the', 'dawn', 'eternal', 'summer', 'draws', 'near']);
  }},
  {name: 'Ночь includes complete elliptical Through the night grammar', templateId: 'v2-guard', check(value) {
    focus(value, 'Ночь', ['Through', 'the', 'night']);
    focus(value, 'до', ['till']);
    focus(value, 'зари', ['dawn']);
  }},
  {name: 'you in and your soul preserve distinct display anchors', templateId: 'v2-guard', check(value) {
    focus(value, 'ты', ['you']);
    focus(value, 'в', ['in']);
    focus(value, 'душе', ['your', 'soul']);
    const possessive = value.targetTokens.filter(token => normalized(token.text) === 'your')[1]!;
    assert.deepEqual(possessive.sourceIndices, [sourceIndex(value, 'ты'), sourceIndex(value, 'душе')], 'Possessive lexical context must remain explicit');
    assert.deepEqual(possessive.focusSourceIndices, [sourceIndex(value, 'душе')], 'Context must not become extra pronoun-time focus');
  }},
  {name: 'береги includes keep safe without swallowing the intervening bird', templateId: 'v2-guard', check(value) {
    focus(value, 'береги', ['keep', 'safe']);
    const text = textOf(value.targetTokens);
    assert.ok(text.indexOf('keep') < text.indexOf('bird') && text.indexOf('bird') < text.indexOf('safe'));
  }},
  {name: 'свою and птицу retain individual possessive and object events', templateId: 'v2-guard', check(value) {
    focus(value, 'свою', ['your']);
    focus(value, 'птицу', ['bird']);
    assert.ok(!textOf(value.targetTokens).includes('own'), 'No unsupported contrastive own');
  }},
  {name: 'negative let it crash remains four separate events', templateId: 'v2-bird', check(value) {
    focus(value, 'Не', ["Don't"]);
    focus(value, 'дай', ['let']);
    focus(value, 'ей', ['it']);
    focus(value, 'разбиться', ['crash']);
    assert.deepEqual(textOf(value.targetTokens), ["don't", 'let', 'it', 'crash']);
  }},
  {name: 'radio zero copula follows only the this is source union', templateId: 'radio-captain', check(value) {
    focus(value, 'this', ['это'], 0, false);
    focus(value, 'is', ['это'], 0, false);
    assert.deepEqual(value.targetTokens.find(token => token.text === 'это')!.focusSourceIndices, [sourceIndex(value, 'this'), sourceIndex(value, 'is')]);
  }},
  {name: 'radio a message releases while repeated keeps its own event', templateId: 'radio-message', check(value) {
    focus(value, 'a', ['сообщение'], 0, false);
    focus(value, 'message', ['сообщение'], 0, false);
    focus(value, 'repeated', ['повторяющееся']);
    assert.deepEqual(value.targetTokens.find(token => token.text === 'сообщение')!.focusSourceIndices, [sourceIndex(value, 'a'), sourceIndex(value, 'message')]);
  }},
  {name: 'radio the surface releases while Martian keeps its own event', templateId: 'radio-message', check(value) {
    focus(value, 'the', ['поверхности'], 0, false);
    focus(value, 'surface', ['поверхности'], 0, false);
    focus(value, 'Martian', ['марсианской']);
    assert.deepEqual(value.targetTokens.find(token => normalized(token.text) === 'поверхности')!.focusSourceIndices, [sourceIndex(value, 'the'), sourceIndex(value, 'surface')]);
  }},
  {name: 'radio question retains all four anchors in natural Russian order', templateId: 'radio-check', check(value) {
    focus(value, 'Do', ['ли']);
    focus(value, 'you', ['вы']);
    focus(value, 'read', ['Слышите']);
    focus(value, 'me', ['меня']);
    assert.deepEqual(textOf(value.targetTokens), ['слышите', 'ли', 'вы', 'меня']);
  }},
];

for (const contract of contracts) {
  test(contract.name, () => {
    const occurrences = editorial.editorialCues.filter(cue => cue.templateId === contract.templateId);
    assert.ok(occurrences.length > 0, 'Every contract belongs to a planned performed occurrence');
    for (const _occurrence of occurrences) contract.check(template(contract.templateId));
  });
}

test('all 20 reviewed expectations have independent named contracts', () => {
  assert.equal(contracts.length, 20);
  assert.equal(editorial.semanticRegressionExpectations.length, 20);
  assert.deepEqual(editorial.semanticRegressionExpectations.map(expectation => expectation.templateId), contracts.map(contract => contract.templateId));
  for (const expectation of editorial.semanticRegressionExpectations) {
    assert.ok(expectation.expectation.trim() && expectation.sourceTexts.length && expectation.targetTexts.length);
  }
});

test('24 supplied lines occur once in 23 source-sheet cues plus four supported radio reprises', () => {
  assert.equal(editorial.suppliedLines.length, 24);
  assert.equal(editorial.editorialCues.length, 27);
  assert.deepEqual(editorial.editorialCues.map(cue => cue.id), Array.from({length: 27}, (_, index) => `KOM-${String(index + 1).padStart(3, '0')}`));
  const assigned = editorial.editorialCues.flatMap(cue => cue.suppliedLineIds);
  assert.equal(new Set(assigned).size, assigned.length, 'No duplicated supplied line');
  assert.deepEqual(assigned, editorial.suppliedLines.map(line => line.id), 'No omitted or reordered supplied line');
  assert.deepEqual(editorial.editorialCues.filter(cue => cue.suppliedLineIds.length > 1).map(cue => [cue.templateId, cue.suppliedLineIds]), [['v1-bird', ['v1-03', 'v1-04']]], 'Only the reviewed inverted birth sentence is joined');
  const counts = Object.fromEntries(editorial.templates.map(value => [value.id, editorial.editorialCues.filter(cue => cue.templateId === value.id).length]));
  assert.deepEqual(counts, {
    'v1-opening': 1, 'v1-comets': 1, 'v1-bird': 1,
    'refrain-fly': 3, 'refrain-eagle': 3, 'refrain-shine': 3, 'refrain-fire': 3,
    'v2-loss': 1, 'v2-summer': 1, 'v2-guard': 1, 'v2-bird': 1,
    'radio-captain': 2, 'radio-message': 2, 'radio-check': 4,
  });
  const additions = editorial.editorialCues.filter(cue => cue.recordingAdded);
  assert.deepEqual(additions.map(cue => [cue.id, cue.templateId, cue.suppliedLineIds, cue.coverageBasis?.referenceCueId]), [
    ['KOM-024', 'radio-captain', [], 'KOM-016'],
    ['KOM-025', 'radio-message', [], 'KOM-017'],
    ['KOM-026', 'radio-check', [], 'KOM-018'],
    ['KOM-027', 'radio-check', [], 'KOM-019'],
  ], 'Recording additions must not fabricate supplied-line provenance');
  for (const cue of additions) {
    assert.equal(cue.coverageBasis?.kind, 'performed-radio-reprise-beyond-supplied-reference');
    assert.equal(cue.coverageBasis?.sourceOffsetSeconds, 79.120);
    assert.equal(cue.coverageBasis?.signalEvidence, 'analysis/acoustic/radio-repeat-signal.json');
    assert.ok(cue.coverageBasis && cue.coverageBasis.normalizedCorrelation > .7 && cue.coverageBasis.reason.trim(), 'Each repeated audio phrase needs its own documented evidence');
  }
});

test('all source and target tokens have valid unique covered identities', () => {
  assert.equal(editorial.templates.length, 14);
  const ids = new Set<string>();
  for (const value of editorial.templates) {
    assert.ok(value.editorialNote.trim(), `${value.id}: missing editorial rationale`);
    assert.deepEqual(value.sourceText.split(/\s+/u), value.sourceTokens.map(token => token.text));
    assert.deepEqual(value.targetText.split(/\s+/u), value.targetTokens.map(token => token.text));
    for (const list of [value.sourceTokens, value.targetTokens]) {
      assert.deepEqual(list.map(token => token.index), list.map((_token, index) => index));
      for (const token of list) {
        assert.ok(token.text.trim() && token.id.trim());
        assert.ok(!ids.has(token.id), `Duplicate identity ${token.id}`);
        ids.add(token.id);
      }
    }
    const coverage = new Set<number>();
    for (const token of value.targetTokens) {
      assert.ok(token.sourceIndices.length > 0 && token.focusSourceIndices.length > 0, `${token.id}: neutral target grammar`);
      assert.ok(token.rationale.trim() && token.relation.trim(), `${token.id}: missing correspondence reason`);
      for (const list of [token.sourceIndices, token.focusSourceIndices]) {
        assert.equal(new Set(list).size, list.length, `${token.id}: duplicate index`);
        assert.ok(list.every(index => Number.isInteger(index) && index >= 0 && index < value.sourceTokens.length), `${token.id}: unknown or cross-template source`);
      }
      assert.ok(token.focusSourceIndices.every(index => token.sourceIndices.includes(index)), `${token.id}: focus outside lexical contributors`);
      for (const index of token.sourceIndices) coverage.add(index);
    }
    assert.deepEqual([...coverage].sort((a, b) => a - b), value.sourceTokens.map(token => token.index), `${value.id}: untranslated source meaning`);
    for (const [breaks, tokens] of [[value.sourceLineBreaksAfterIndices, value.sourceTokens], [value.targetLineBreaksAfterIndices, value.targetTokens]] as const) {
      assert.ok(breaks.every(index => Number.isInteger(index) && index >= 0 && index < tokens.length - 1), `${value.id}: invalid authored line break`);
    }
  }
  assert.equal(editorial.templates.reduce((sum, value) => sum + value.sourceTokens.length, 0), 81);
  assert.equal(editorial.templates.reduce((sum, value) => sum + value.targetTokens.length, 0), 95);
  assert.equal(editorial.editorialCues.reduce((sum, cue) => sum + template(cue.templateId).sourceTokens.length, 0), 139);
  assert.equal(editorial.editorialCues.reduce((sum, cue) => sum + template(cue.templateId).targetTokens.length, 0), 157);
  assert.deepEqual(editorial.coverage, {
    suppliedLineCount: 24, editorialCueCount: 27, uniqueTemplateCount: 14,
    uniqueSourceTokenCount: 81, uniqueTargetTokenCount: 95,
    sourceTokenEventsAcrossEditorialCues: 139, targetTokenEventsAcrossEditorialCues: 157,
    suppliedCueCount: 23, recordingAddedCueCount: 4,
  });
});

test('imperative Fly and Shine stay distinct across all three refrains', () => {
  for (const [id, verb] of [['refrain-fly', 'Fly'], ['refrain-shine', 'Shine']] as const) {
    const value = template(id);
    focus(value, id === 'refrain-fly' ? 'Лети' : 'Свети', [verb]);
    focus(value, 'над', ['above']);
    focus(value, 'землёй', ['the', 'Earth']);
    assert.deepEqual(textOf(value.targetTokens), [verb.toLowerCase(), 'above', 'the', 'earth']);
  }
  const fire = template('refrain-fire');
  focus(fire, 'словно', ['Like'], 0);
  focus(fire, 'огонь', ['fire'], 0);
  focus(fire, 'словно', ['like'], 1);
  focus(fire, 'огонь', ['fire'], 1);
});

test('remaining compact lines retain complete independent prepositions nouns and articles', () => {
  const comets = template('v1-comets');
  focus(comets, 'Пролетающие', ['Passing']);
  focus(comets, 'над', ['over']);
  focus(comets, 'планетой', ['the', 'planet']);
  const birth = template('v1-bird');
  focus(birth, 'Из', ['From']);
  focus(birth, 'пустоты', ['the', 'void']);
  focus(birth, 'без', ['without']);
  const summer = template('v2-summer');
  focus(summer, 'За', ['Beyond']);
  focus(summer, 'рассветом', ['the', 'dawn']);
  focus(summer, 'вечное', ['eternal']);
  focus(summer, 'лето', ['summer']);
});

test('original English radio speech stays source authority with complete Russian target', () => {
  for (const value of editorial.templates) {
    assert.equal(value.sourceLanguage, value.id.startsWith('radio-') ? 'en' : 'ru');
    assert.equal(value.targetLanguage, value.id.startsWith('radio-') ? 'ru' : 'en');
  }
  const captain = template('radio-captain');
  focus(captain, 'Planet', ['Планета']);
  focus(captain, 'Earth', ['Земля']);
  focus(captain, 'Captain', ['капитан']);
  focus(captain, 'Adams', ['Адамс']);
  focus(captain, 'on', ['на']);
  focus(captain, 'the', ['Серенити'], 0, false);
  focus(captain, 'Serenity', ['Серенити'], 0, false);
  const message = template('radio-message');
  focus(message, "We're", ['Мы']);
  focus(message, 'receiving', ['принимаем']);
  focus(message, 'from', ['с']);
  assert.deepEqual(message.targetTokens.find(token => token.text === 'принимаем')!.sourceIndices, [sourceIndex(message, "We're"), sourceIndex(message, 'receiving')]);
});

test('all synthetic real gaps and exclusive ends release both language lanes', () => {
  assert.match(editorial.focusPolicy, /union/i);
  assert.match(editorial.focusPolicy, /never the enclosing span/i);
  for (const value of editorial.templates) {
    const windows = fixture(value);
    for (const own of windows) {
      assert.deepEqual(originalAt(windows, own.end), []);
      assert.deepEqual(translatedAt(value, windows, own.end), []);
      assert.deepEqual(originalAt(windows, own.end + 250), []);
      assert.deepEqual(translatedAt(value, windows, own.end + 250), []);
    }
  }
});

test('editorial mappings contain no fabricated acoustic or translation timestamps', () => {
  const forbidden = new Set(['start', 'end', 'startSample', 'endSample', 'startFrame', 'endFrame', 'timestamp', 'time']);
  const check = (value: unknown): void => {
    if (!value || typeof value !== 'object') return;
    for (const [key, entry] of Object.entries(value)) {
      assert.ok(!forbidden.has(key), `Unexpected timing field ${key}`);
      check(entry);
    }
  };
  check(editorial.templates);
  for (const cue of editorial.editorialCues) assert.equal(cue.timingStatus, 'pending-independent-recording-alignment');
});

test('independent contracts reject incomplete grammar broad focus and invented meaning', () => {
  const rejects = (contractIndex: number, edit: (value: Template) => void): void => {
    const contract = contracts[contractIndex]!;
    const changed = structuredClone(template(contract.templateId));
    edit(changed);
    assert.throws(() => contract.check(changed), `${contract.name}: failed to reject the deliberate regression`);
  };
  rejects(0, value => {value.targetTokens.find(token => token.text === 'The')!.focusSourceIndices = [];});
  rejects(2, value => {value.targetTokens.find(token => token.text === 'dark')!.focusSourceIndices = [];});
  rejects(2, value => {value.targetTokens.find(token => token.text === 'dark')!.text = 'light';});
  rejects(5, value => {value.targetTokens.find(token => token.text === 'be')!.focusSourceIndices = [];});
  rejects(5, value => {value.targetTokens.find(token => token.text === 'not')!.focusSourceIndices = [sourceIndex(value, 'родится')];});
  rejects(7, value => {value.targetTokens.find(token => token.text === 'an')!.focusSourceIndices = [sourceIndex(value, 'орёл', 0), sourceIndex(value, 'орёл', 1)];});
  rejects(8, value => {value.targetTokens.find(token => token.text === 'has')!.focusSourceIndices = [];});
  rejects(11, value => {value.targetTokens.find(token => token.text === 'Through')!.focusSourceIndices = [];});
  rejects(12, value => {value.targetTokens.filter(token => token.text === 'your')[1]!.focusSourceIndices = [sourceIndex(value, 'ты'), sourceIndex(value, 'душе')];});
  rejects(13, value => {value.targetTokens.find(token => token.text === 'bird')!.focusSourceIndices = [sourceIndex(value, 'береги')];});
  rejects(15, value => {value.targetTokens.find(token => token.text === 'it')!.text = 'her';});
  rejects(17, value => {value.targetTokens.find(token => token.text === 'сообщение')!.focusSourceIndices = [sourceIndex(value, 'a'), sourceIndex(value, 'repeated'), sourceIndex(value, 'message')];});
  rejects(18, value => {value.targetTokens.find(token => normalized(token.text) === 'поверхности')!.focusSourceIndices = [sourceIndex(value, 'the'), sourceIndex(value, 'Martian'), sourceIndex(value, 'surface')];});
  rejects(19, value => {value.targetTokens.find(token => token.text === 'ли')!.focusSourceIndices = [sourceIndex(value, 'read')];});
});
