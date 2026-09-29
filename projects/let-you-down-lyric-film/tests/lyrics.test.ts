import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {normalizeLyrics, normalizeWord, parseLyrics, placeholderWord} from '../src/lyrics.ts';

// Synthetic fixture text only (never the song's lyric).
const FIXTURE = '﻿Alpha  bravo’s charlie —\r\n\r\n\r\nDelta (echo foxtrot)\n(Golf, hotel)\nIndia\t juliet\n\n';

test('normalization: BOM, CRLF, spacing and blank-line stanzas', () => {
  assert.equal(normalizeLyrics(FIXTURE), "Alpha bravo’s charlie —\n\nDelta (echo foxtrot)\n(Golf, hotel)\nIndia juliet\n");
});

test('tokens: IDs, punctuation attachment, apostrophes and backing lanes', () => {
  const {lines} = parseLyrics(FIXTURE);
  assert.deepEqual(lines.map(l => [l.id, l.stanza, l.tokens.map(t => `${t.id}:${t.norm}:${t.voice}`)]), [
    ['L01', 1, ['L01-W01:alpha:lead', "L01-W02:bravo's:lead", 'L01-W03:charlie:lead']],
    ['L02', 2, ['L02-W01:delta:lead', 'L02-W02:echo:backing', 'L02-W03:foxtrot:backing']],
    ['L03', 2, ['L03-W01:golf:backing', 'L03-W02:hotel:backing']],
    ['L04', 2, ['L04-W01:india:lead', 'L04-W02:juliet:lead']],
  ]);
  assert.equal(lines[0]!.tokens[2]!.display, 'charlie —', 'a dash attaches to the previous word');
  assert.equal(normalizeWord("'Tis"), 'tis');
});

test('Python mirror produces identical IDs, norms, voices and hash', () => {
  const py = process.env.LYD_PYTHON ?? 'python';
  const out = spawnSync(py, [fileURLToPath(new URL('../analysis/lyrics_io.py', import.meta.url))], {input: FIXTURE, encoding: 'utf8'});
  if (out.error || out.status !== 0) {console.warn('python unavailable; skipping mirror check'); return;}
  const mirror = JSON.parse(out.stdout) as {sha256: string; lines: {id: string; stanza: number; tokens: [string, string, string, string][]}[]};
  const {normalized, lines} = parseLyrics(FIXTURE);
  assert.equal(mirror.sha256, createHash('sha256').update(normalized, 'utf8').digest('hex'));
  assert.deepEqual(mirror.lines, lines.map(l => ({id: l.id, stanza: l.stanza, tokens: l.tokens.map(t => [t.id, t.norm, t.voice, t.display])})));
});

test('placeholder words are neutral lorem words, never the input', () => {
  assert.equal(placeholderWord(5), 'dolor');
  assert.equal(placeholderWord(99), 'exercitation');
  assert.equal(placeholderWord(0), 'a');
});
