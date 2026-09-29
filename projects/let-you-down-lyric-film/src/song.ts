// Song-specific decisions for this edition only. Nothing here is a preset for
// another recording. Sections and effects address words by line/word ID; each
// word effect also names the single normalized word it expects, so a different
// lyric file disables the effect instead of decorating the wrong word.

export const SONG = 'BnnbP7pCIvQ';
export const TITLE = 'Let You Down';
export const ARTIST = 'Dawid Podsiadło';
export const EXPECTED_LINES = 40;

export type SectionKind = 'verse' | 'prechorus' | 'chorus' | 'outro';
export type Section = {id: string; kind: SectionKind; first: number; last: number; tier: number};
/** Line ranges (1-based, inclusive) of the supplied 40-line text. `tier` sets
 * how much reach the measured light and spectrum may use in that section. */
export const SECTIONS: readonly Section[] = [
  {id: 'verse-1', kind: 'verse', first: 1, last: 8, tier: 0.46},
  {id: 'prechorus-1', kind: 'prechorus', first: 9, last: 12, tier: 0.62},
  {id: 'chorus-1', kind: 'chorus', first: 13, last: 16, tier: 0.84},
  {id: 'verse-2', kind: 'verse', first: 17, last: 20, tier: 0.64},
  {id: 'prechorus-2', kind: 'prechorus', first: 21, last: 24, tier: 0.74},
  {id: 'chorus-2', kind: 'chorus', first: 25, last: 28, tier: 0.94},
  {id: 'chorus-3', kind: 'chorus', first: 29, last: 32, tier: 0.97},
  {id: 'outro', kind: 'outro', first: 33, last: 40, tier: 0.9},
];
export const sectionOfLine = (line: number): Section | undefined => SECTIONS.find(s => line >= s.first && line <= s.last);

/** Instrumental passages on the source clock (seconds). The drop between the
 * first chorus and the second verse carries the film's strongest light. */
export const INSTRUMENTAL = {introStart: 3.64, introTier: 0.55, dropTier: 1, tailTier: 0.5, visualEnd: 232.55};

export type WordEffect = 'neon' | 'moon' | 'flame' | 'drop';
export const WORD_EFFECTS: readonly {id: string; effect: Exclude<WordEffect, 'drop'>; expect: string}[] = [
  {id: 'L02-W01', effect: 'neon', expect: 'neon'},
  {id: 'L02-W04', effect: 'neon', expect: 'neon'},
  {id: 'L07-W06', effect: 'moon', expect: 'moon'},
  {id: 'L17-W06', effect: 'flame', expect: 'flames'},
  {id: 'L18-W01', effect: 'flame', expect: 'flames'},
  {id: 'L19-W06', effect: 'flame', expect: 'burn'},
];
/** The title hook's final word, only where it closes a chorus or outro phrase.
 * The same word inside the second verse is a deliberate negative case. */
export const DROP_EFFECT = {expect: 'down', sections: ['chorus-1', 'chorus-2', 'chorus-3', 'outro']} as const;

export function effectFor(id: string, norm: string, line: number): WordEffect | null {
  const listed = WORD_EFFECTS.find(e => e.id === id);
  if (listed) return listed.expect === norm ? listed.effect : null;
  const section = sectionOfLine(line);
  if (norm === DROP_EFFECT.expect && section && (DROP_EFFECT.sections as readonly string[]).includes(section.id)) return 'drop';
  return null;
}

// Palette. Verses answer the film's magenta light with cyan; choruses carry
// the Edgerunners yellow. Bright memory frames switch to dark ink.
export const PALETTE = {
  rest: '#e4e2f3', ink: '#231a36', stroke: 'rgba(10,4,24,0.8)',
  verse: {core: '#ffffff', mid: '#9ff9ff', edge: '#2ee6ff', glow: '#27dcff'},
  chorus: {core: '#ffffff', mid: '#fff6a0', edge: '#fcee0a', glow: '#f8e600'},
  moon: {core: '#ffffff', mid: '#d6e1ff', edge: '#8ea6ff', glow: '#7d97ff'},
  memoryFocus: '#c8126c',
  flame: ['#fff1c2', '#ffab3d', '#ff5a2a', '#ff2e8a'],
  glitch: {left: '#1ff2ff', right: '#ff2ea8'},
  spectrum: ['#ff3fa4', '#b35cff', '#4fe3ff'],
} as const;
