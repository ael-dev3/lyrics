export type LyricSection = 'build' | 'chorus' | 'verse';

export type LyricCue = Readonly<{
  text: string;
  start: number;
  end: number;
}>;

export type LyricLine = Readonly<{
  start: number;
  end: number;
  section: LyricSection;
  cues: readonly LyricCue[];
  text: string;
}>;

const cue = (text: string, start: number, end: number): LyricCue => ({
  text,
  start,
  end,
});

const line = (
  start: number,
  end: number,
  section: LyricSection,
  cues: readonly LyricCue[],
): LyricLine => ({
  start,
  end,
  section,
  cues,
  text: cues.map((item) => item.text).join(' '),
});

// Cue boundaries are anchored to the performed Russian words. Multi-word English
// groups stay together when one Russian word or phrase carries the same meaning.
export const lyrics: readonly LyricLine[] = [
  line(24.0, 27.34, 'build', [
    cue('And', 24.0, 24.21),
    cue("I'll", 24.21, 24.42),
    cue('erase', 24.42, 25.66),
    cue('the horizon', 25.66, 27.34),
  ]),
  line(27.34, 30.09, 'build', [
    cue('And', 27.34, 27.51),
    cue('split', 27.51, 28.74),
    cue('it in half', 28.74, 30.09),
  ]),
  line(30.09, 32.95, 'build', [
    cue("I'll fold", 30.09, 30.82),
    cue('the peaks', 30.82, 31.85),
    cue('of every mountain', 31.85, 32.95),
  ]),
  line(32.95, 36.51, 'build', [
    cue('And', 32.95, 33.15),
    cue('raise', 33.15, 34.84),
    cue('the ocean', 34.84, 36.51),
  ]),
  line(36.51, 40.2, 'chorus', [
    cue("I'll", 36.51, 36.71),
    cue('scream', 36.71, 38.08),
    cue('to', 38.08, 38.48),
    cue('the whole', 38.48, 39.07),
    cue('world', 39.07, 40.0),
  ]),
  line(40.27, 43.0, 'chorus', [
    cue('Let', 40.27, 40.95),
    cue('the earth', 40.95, 42.16),
    cue('tremble', 42.16, 43.0),
  ]),
  line(43.05, 46.37, 'chorus', [
    cue('And', 43.05, 43.21),
    cue('through', 43.21, 44.27),
    cue('the walls', 44.27, 45.32),
    cue('of apartments', 45.32, 46.37),
  ]),
  line(46.37, 50.0, 'chorus', [
    cue("I'll pass through", 46.37, 47.84),
    cue('as a wave', 47.84, 49.1),
    cue('of fire', 49.1, 50.0),
  ]),

  line(64.08, 66.61, 'verse', [
    cue('Night', 64.08, 64.48),
    cue('in', 64.48, 64.63),
    cue('the silence', 64.63, 65.02),
    cue('freezes', 65.02, 65.72),
    cue('helplessly;', 65.72, 66.61),
  ]),
  line(66.61, 70.0, 'verse', [
    cue('The sky', 66.61, 67.22),
    cue('sagged', 67.22, 68.14),
    cue('a silent', 68.14, 69.05),
    cue('ceiling', 69.05, 70.0),
  ]),
  line(70.05, 73.0, 'verse', [
    cue('I remember', 70.05, 70.35),
    cue('what happened', 70.49, 71.0),
    cue('and', 71.24, 71.36),
    cue('questions gnaw at me', 71.36, 73.0),
  ]),
  line(73.08, 76.0, 'verse', [
    cue('Who', 73.08, 73.37),
    cue('am I?', 73.37, 73.49),
    cue('Where from?', 73.73, 74.47),
    cue('And', 74.47, 74.59),
    cue('where', 74.59, 74.96),
    cue('is', 74.96, 75.21),
    cue('my', 75.21, 75.58),
    cue('home?', 75.58, 76.0),
  ]),
  line(76.05, 79.0, 'verse', [
    cue('My essence', 76.05, 77.25),
    cue('walked', 77.25, 78.28),
    cue('along', 78.28, 78.51),
    cue('the edge', 78.51, 79.0),
  ]),
  line(79.05, 82.0, 'verse', [
    cue('My hands', 79.05, 79.52),
    cue('shook', 79.52, 80.43),
    cue('from', 80.43, 80.69),
    cue('the weight', 80.69, 81.6),
    cue('of years', 81.6, 82.0),
  ]),
  line(82.06, 86.0, 'verse', [
    cue('Some', 82.06, 82.66),
    cue('spoke;', 82.66, 84.0),
    cue('others', 84.29, 85.06),
    cue('stayed silent', 85.06, 86.0),
  ]),
  line(86.05, 90.2, 'verse', [
    cue('And', 86.05, 86.14),
    cue('someone', 86.14, 86.58),
    cue('behind', 86.58, 86.87),
    cue('my back', 86.87, 87.74),
    cue("couldn't", 87.74, 88.03),
    cue('hold back', 88.03, 89.35),
    cue('laughter', 89.35, 90.2),
  ]),

  line(91.05, 94.3, 'build', [
    cue('And', 91.05, 91.21),
    cue("I'll", 91.21, 91.42),
    cue('erase', 91.42, 92.73),
    cue('the horizon', 92.73, 94.3),
  ]),
  line(94.3, 97.0, 'build', [
    cue('And', 94.3, 94.47),
    cue('split', 94.47, 95.69),
    cue('it in half', 95.69, 97.0),
  ]),
  line(97.09, 101.53, 'build', [
    cue("I'll fold", 97.09, 98.08),
    cue('the peaks', 98.08, 99.58),
    cue('of every mountain', 99.58, 101.53),
  ]),
  line(101.53, 104.0, 'build', [
    cue('And', 101.53, 101.75),
    cue('raise', 101.75, 102.93),
    cue('the ocean', 102.93, 104.0),
  ]),
  line(104.0, 107.0, 'chorus', [
    cue("I'll", 104.0, 104.17),
    cue('scream', 104.17, 105.38),
    cue('to', 105.38, 105.73),
    cue('the whole', 105.73, 106.25),
    cue('world', 106.25, 107.0),
  ]),
  line(107.05, 110.7, 'chorus', [
    cue('Let', 107.05, 107.95),
    cue('the earth', 107.95, 109.4),
    cue('tremble', 109.4, 110.7),
  ]),
  line(110.7, 114.25, 'chorus', [
    cue('And', 110.7, 110.9),
    cue('through', 110.9, 111.8),
    cue('the walls', 111.8, 112.9),
    cue('of apartments', 112.9, 114.25),
  ]),
  line(114.25, 118.0, 'chorus', [
    cue("I'll pass through", 114.25, 115.5),
    cue('as a wave', 115.5, 116.75),
    cue('of fire', 116.75, 118.0),
  ]),
];
