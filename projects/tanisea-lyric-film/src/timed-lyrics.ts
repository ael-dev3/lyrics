export type LyricSection = 'build' | 'chorus' | 'verse';

export type LyricSegment = Readonly<{
  id: string;
  text: string;
}>;

export type CueEvent = Readonly<{
  start: number;
  end: number;
  targets: readonly string[];
}>;

export type LyricLine = Readonly<{
  id: string;
  section: LyricSection;
  vocalStart: number;
  vocalEnd: number;
  visualInStart: number;
  visualInComplete: number;
  visualOutStart: number;
  visualOutEnd: number;
  segments: readonly LyricSegment[];
  cueEvents: readonly CueEvent[];
  text: string;
}>;

type CueTemplate = readonly [text: string, normalizedStart: number, normalizedEnd: number];

type LineTemplate = Readonly<{
  section: LyricSection;
  cues: readonly CueTemplate[];
}>;

const roundMilliseconds = (value: number): number =>
  Math.round(value * 1000) / 1000;

const makeLine = (
  id: string,
  vocalStart: number,
  vocalEnd: number,
  template: LineTemplate,
): LyricLine => {
  const duration = vocalEnd - vocalStart;
  const segments = template.cues.map(([text], index) => ({
    id: `${id}-S${String(index + 1).padStart(2, '0')}`,
    text,
  }));

  return {
    id,
    section: template.section,
    vocalStart,
    vocalEnd,
    // QC rule: impact starts 0.24 s early, the line is sharp three frames
    // before the onset, and the active semantic state begins on the onset.
    visualInStart: roundMilliseconds(Math.max(0, vocalStart - 0.24)),
    visualInComplete: roundMilliseconds(vocalStart - 0.05),
    visualOutStart: vocalEnd,
    visualOutEnd: roundMilliseconds(
      vocalEnd + (id === 'C2-08' ? 0.12 : 0.05),
    ),
    segments,
    cueEvents: template.cues.map(([, start, end], index) => ({
      start: roundMilliseconds(vocalStart + start * duration),
      end: roundMilliseconds(vocalStart + end * duration),
      targets: [segments[index]?.id ?? `${id}-S${index + 1}`],
    })),
    text: segments.map((segment) => segment.text).join(' '),
  };
};

// Both choruses are generated from this one approved semantic marker stack.
// Absolute phrase starts use the rounded midpoint of two independent audits;
// normalized subdivisions keep repeated wording internally consistent. The
// marker stack follows Russian vocal stresses rather than English word counts.
const chorusStack: readonly LineTemplate[] = [
  {
    section: 'build',
    cues: [
      ["And I'll erase", 0, 0.43],
      ['the horizon', 0.43, 1],
    ],
  },
  {
    section: 'build',
    cues: [
      ['And shatter', 0, 0.459],
      ['it in two', 0.459, 1],
    ],
  },
  {
    section: 'build',
    cues: [
      ["I'll fold", 0, 0.258],
      ['the peaks', 0.258, 0.656],
      ['of every mountain', 0.656, 1],
    ],
  },
  {
    section: 'build',
    cues: [
      ['And', 0, 0.075],
      ['raise', 0.075, 0.603],
      ['the ocean', 0.603, 1],
    ],
  },
  {
    section: 'chorus',
    cues: [
      ["I'll scream to", 0, 0.46],
      ['the whole world', 0.46, 1],
    ],
  },
  {
    section: 'chorus',
    cues: [
      ['Let', 0, 0.249],
      ['the earth', 0.249, 0.692],
      ['tremble', 0.692, 1],
    ],
  },
  {
    section: 'chorus',
    cues: [
      ['Through', 0, 0.319],
      ['apartment', 0.319, 0.635],
      ['walls', 0.635, 1],
    ],
  },
  {
    section: 'chorus',
    cues: [
      ["I'll sweep through", 0, 0.405],
      ['like a wave', 0.405, 0.752],
      ['of fire', 0.752, 1],
    ],
  },
];

const firstChorusOnsets = [
  24.29, 27.41, 30.56, 33.75, 37.03, 40.13, 43.4, 46.58,
] as const;

const secondChorusOnsets = [
  91.46, 94.65, 97.74, 100.89, 104.26, 107.37, 110.57, 113.81,
] as const;

const makeChorus = (
  prefix: 'C1' | 'C2',
  onsets: readonly number[],
  sectionEnd: number,
): readonly LyricLine[] =>
  chorusStack.map((template, index) => {
    const vocalStart = onsets[index];
    if (vocalStart === undefined) {
      throw new Error(`Missing onset for ${prefix}-${index + 1}`);
    }
    const nextOnset = onsets[index + 1];
    const vocalEnd = nextOnset === undefined ? sectionEnd : nextOnset - 0.05;
    return makeLine(
      `${prefix}-${String(index + 1).padStart(2, '0')}`,
      vocalStart,
      roundMilliseconds(vocalEnd),
      template,
    );
  });

const verseTemplates: readonly LineTemplate[] = [
  {
    section: 'verse',
    cues: [
      ['Night', 0, 0.25],
      ['in', 0.25, 0.34],
      ['the silence', 0.34, 0.64],
      ['freezes', 0.64, 0.81],
      ['helplessly;', 0.81, 1],
    ],
  },
  {
    section: 'verse',
    cues: [
      ['The sky', 0, 0.14],
      ['hangs low,', 0.14, 0.48],
      ['a silent', 0.48, 0.7],
      ['ceiling', 0.7, 1],
    ],
  },
  {
    section: 'verse',
    cues: [
      ['I remember what happened;', 0, 0.43],
      ['questions', 0.43, 0.68],
      ['gnaw at me', 0.68, 1],
    ],
  },
  {
    section: 'verse',
    cues: [
      ['Who am I?', 0, 0.32],
      ['Where am I from?', 0.32, 0.66],
      ['Where is my home?', 0.66, 1],
    ],
  },
  {
    section: 'verse',
    cues: [
      ['My soul', 0, 0.28],
      ['walked', 0.28, 0.63],
      ['along', 0.63, 0.78],
      ['the edge', 0.78, 1],
    ],
  },
  {
    section: 'verse',
    cues: [
      ['My hands', 0, 0.16],
      ['shook', 0.16, 0.47],
      ['from', 0.47, 0.56],
      ['the weight', 0.56, 0.86],
      ['of years', 0.86, 1],
    ],
  },
  {
    section: 'verse',
    cues: [
      ['Some', 0, 0.15],
      ['spoke;', 0.15, 0.49],
      ['others', 0.49, 0.73],
      ['stayed silent', 0.73, 1],
    ],
  },
  {
    section: 'verse',
    cues: [
      ['Behind my back,', 0, 0.34],
      ['someone', 0.34, 0.46],
      ["couldn't", 0.46, 0.58],
      ['hold back', 0.58, 0.83],
      ['a laugh', 0.83, 1],
    ],
  },
];

const verseOnsets = [
  64.06, 67.18, 70.43, 73.59, 76.83, 79.99, 83.18, 86.4,
] as const;

const verse = verseTemplates.map((template, index) => {
  const vocalStart = verseOnsets[index];
  if (vocalStart === undefined) throw new Error(`Missing verse onset ${index + 1}`);
  const nextOnset = verseOnsets[index + 1] ?? 91.46;
  return makeLine(
    `V1-${String(index + 1).padStart(2, '0')}`,
    vocalStart,
    roundMilliseconds(nextOnset - 0.05),
    template,
  );
});

// The three lines explicitly approved by the user remain verbatim:
// “Night in the silence freezes helplessly;”, “I'll fold the peaks of every
// mountain”, and “And raise the ocean”. Other wording follows the QC report's
// natural-English pass. The source-language cue model remains independent of
// display order, so targets may later jump backward, repeat, or activate together.
export const lyrics: readonly LyricLine[] = [
  ...makeChorus('C1', firstChorusOnsets, 50.05),
  ...verse,
  ...makeChorus('C2', secondChorusOnsets, 118.08),
];

const assertTimingContract = (lines: readonly LyricLine[]): void => {
  if (lines.length !== 24) {
    throw new Error(`Timing contract requires 24 lines, received ${lines.length}`);
  }

  for (const [index, line] of lines.entries()) {
    if (line.visualInComplete > line.vocalStart - 0.049) {
      throw new Error(`${line.id} is not fully legible three frames early`);
    }
    if (line.cueEvents.length !== line.segments.length) {
      throw new Error(`${line.id} has unmatched semantic segments and cue events`);
    }
    for (const event of line.cueEvents) {
      if (event.start < line.vocalStart || event.end > line.vocalEnd) {
        throw new Error(`${line.id} cue falls outside its vocal window`);
      }
      if (event.targets.some((target) => !line.segments.some(({id}) => id === target))) {
        throw new Error(`${line.id} cue targets an unknown semantic segment`);
      }
    }

    const next = lines[index + 1];
    if (next && next.vocalStart - line.vocalEnd < 0.25) {
      if (line.visualOutEnd > next.vocalStart + 0.001) {
        throw new Error(`${line.id} visibly overlaps ${next.id} after its onset`);
      }
      if (next.visualInComplete > line.visualOutEnd + 0.001) {
        throw new Error(`${line.id} leaves a blank handoff before ${next.id}`);
      }
    }
  }

  for (let index = 0; index < chorusStack.length; index++) {
    const first = lines[index];
    const second = lines[index + 16];
    if (!first || !second || first.text !== second.text) {
      throw new Error(`Repeated chorus wording diverges at marker ${index + 1}`);
    }
    const normalize = (line: LyricLine, event: CueEvent): readonly number[] => [
      (event.start - line.vocalStart) / (line.vocalEnd - line.vocalStart),
      (event.end - line.vocalStart) / (line.vocalEnd - line.vocalStart),
    ];
    first.cueEvents.forEach((event, eventIndex) => {
      const repeatedEvent = second.cueEvents[eventIndex];
      if (!repeatedEvent) throw new Error(`${second.id} is missing a repeated cue`);
      const firstNormalized = normalize(first, event);
      const secondNormalized = normalize(second, repeatedEvent);
      if (
        Math.abs((firstNormalized[0] ?? 0) - (secondNormalized[0] ?? 0)) > 0.001 ||
        Math.abs((firstNormalized[1] ?? 0) - (secondNormalized[1] ?? 0)) > 0.001
      ) {
        throw new Error(`${second.id} diverges from the shared chorus marker stack`);
      }
    });
  }
};

assertTimingContract(lyrics);

export const qcVocalOnsets = lyrics.map(({id, vocalStart}) => ({
  id,
  vocalStart,
}));
