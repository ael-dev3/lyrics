// The lyric text is user-supplied, kept in source/lyrics.local.txt and never
// committed. Every stage identifies it by the SHA-256 of its normalized form and
// addresses words by stable IDs (L01-W03). analysis/lyrics_io.py implements the
// same rules; tests/lyrics.test.ts keeps the two in agreement.

export type Voice = 'lead' | 'backing';
export type Token = {id: string; index: number; display: string; norm: string; voice: Voice};
export type LyricLine = {id: string; index: number; stanza: number; tokens: Token[]};
export type Lyrics = {normalized: string; lines: LyricLine[]};

const pad = (n: number): string => String(n).padStart(2, '0');
export const lineId = (line: number): string => `L${pad(line)}`;
export const wordId = (line: number, token: number): string => `L${pad(line)}-W${pad(token)}`;

/** UTF-8 text → canonical form: BOM removed, LF endings, trimmed lines, single
 * spaces, one blank line between stanzas, no leading/trailing blank lines. */
export function normalizeLyrics(text: string): string {
  const lines = text.replace(/^﻿/u, '').replace(/\r\n?/gu, '\n').split('\n').map(l => l.replace(/[\t ]+/gu, ' ').trim());
  const out: string[] = [];
  for (const line of lines) {
    if (!line) {if (out.length && out.at(-1) !== '') out.push(''); continue;}
    out.push(line);
  }
  while (out.at(-1) === '') out.pop();
  if (!out.length) throw Error('The lyric file is empty');
  return out.join('\n') + '\n';
}

/** Lowercase alignment form: letters, digits and inner apostrophes only. */
export function normalizeWord(display: string): string {
  return display.toLowerCase().replace(/[‘’ʼ`]/gu, "'").replace(/[^a-z0-9']/gu, '').replace(/^'+|'+$/gu, '');
}

export function parseLyrics(text: string): Lyrics {
  const normalized = normalizeLyrics(text);
  const lines: LyricLine[] = [];
  let stanza = 1;
  for (const raw of normalized.split('\n')) {
    if (raw === '') {if (lines.length) stanza++; continue;}
    if (!raw) continue;
    const index = lines.length + 1, tokens: Token[] = [];
    let depth = 0;
    for (const piece of raw.split(' ')) {
      const opens = (piece.match(/\(/gu) ?? []).length, closes = (piece.match(/\)/gu) ?? []).length;
      const voice: Voice = depth > 0 || piece.startsWith('(') ? 'backing' : 'lead';
      depth = Math.max(0, depth + opens - closes);
      const norm = normalizeWord(piece);
      const previous = tokens.at(-1);
      // Punctuation-only pieces (an em dash) attach to the preceding word.
      if (!norm) {if (previous) previous.display += ` ${piece}`; continue;}
      tokens.push({id: wordId(index, tokens.length + 1), index: tokens.length + 1, display: piece, norm, voice});
    }
    if (!tokens.length) throw Error(`Line ${index} has no singable word`);
    lines.push({id: lineId(index), index, stanza, tokens});
  }
  return {normalized, lines};
}

export async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

/** A neutral stand-in used for diagnostics and public screenshots: a lorem
 * ipsum word of the same length (similar letter widths), never the lyric. */
const LOREM = ['a', 'ut', 'sed', 'amet', 'dolor', 'ipsum', 'tempor', 'aliqua', 'laboris', 'pariatur', 'consequat', 'voluptatem', 'exercitation'];
export function placeholderWord(chars: number): string {
  const n = Math.max(1, Math.min(LOREM.length, chars));
  return LOREM[n - 1]!;
}
