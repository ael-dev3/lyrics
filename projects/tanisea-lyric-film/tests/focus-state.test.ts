import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, test} from 'vitest';
import {LyricDisplay} from '../src/components/LyricDisplay';
import {getSegmentFocusState} from '../src/focus-state';
import {getPresentationProgress} from '../src/presentation-progress';
import {lyrics} from '../src/timed-lyrics';
import {frameForSample} from '../src/timing/alignment-types';
import {taniseaAlignment} from '../src/timing/tanisea-alignment';

const findLine = (lineId: string) => {
  const line = lyrics.find(({id}) => id === lineId);
  if (!line) throw new Error(`Missing production lyric line ${lineId}`);
  return line;
};

const focusSnapshot = (lineId: string, frame: number, fps = 60) => {
  const line = findLine(lineId);
  return line.segments.map(({id, text}) => ({
    id,
    text,
    ...getSegmentFocusState(line.cues, id, frame, fps),
  }));
};

const dataStyle = (
  markup: string,
  attribute: string,
  identifier: string,
): string => {
  const attributeIndex = markup.indexOf(`${attribute}="${identifier}"`);
  if (attributeIndex < 0) {
    throw new Error(`Rendered lyric is missing ${attribute}=${identifier}`);
  }
  const tagStart = markup.lastIndexOf('<span', attributeIndex);
  const tagEnd = markup.indexOf('>', attributeIndex);
  const openingTag = markup.slice(tagStart, tagEnd);
  const style = /style="([^"]*)"/.exec(openingTag)?.[1];
  if (!style) throw new Error(`Rendered lyric ${identifier} has no style`);
  return style;
};

const dataOpeningTag = (
  markup: string,
  attribute: string,
  identifier: string,
): string => {
  const attributeIndex = markup.indexOf(`${attribute}="${identifier}"`);
  if (attributeIndex < 0) {
    throw new Error(`Rendered lyric is missing ${attribute}=${identifier}`);
  }
  const tagStart = markup.lastIndexOf('<', attributeIndex);
  const tagEnd = markup.indexOf('>', attributeIndex);
  return markup.slice(tagStart, tagEnd + 1);
};

describe('sample-indexed segment focus', () => {
  test.each([60, 120])(
    'contacts on the nearest start frame and eases emphasis over three frames at %i fps',
    (fps) => {
      const cues = [
        {
          startSample: 3_245_130,
          endSample: 3_270_000,
          targets: ['S02'],
        },
      ] as const;
      const contactFrame = frameForSample(cues[0].startSample, fps);
      const endFrame = frameForSample(cues[0].endSample, fps);

      expect(
        getSegmentFocusState(cues, 'S02', contactFrame - 1, fps),
      ).toEqual({contact: 0, emphasis: 0});
      expect(
        getSegmentFocusState(cues, 'S02', contactFrame, fps),
      ).toEqual({contact: 1, emphasis: 1 / 3});
      expect(
        getSegmentFocusState(cues, 'S02', contactFrame + 1, fps),
      ).toEqual({contact: 1, emphasis: 2 / 3});
      expect(
        getSegmentFocusState(cues, 'S02', contactFrame + 2, fps),
      ).toEqual({contact: 1, emphasis: 1});
      expect(
        getSegmentFocusState(cues, 'S02', endFrame - 1, fps),
      ).toEqual({contact: 1, emphasis: 1});
    },
  );

  test.each([60, 120])(
    'drops contact at the exclusive end frame and releases to zero within two frames at %i fps',
    (fps) => {
      const cues = [
        {
          startSample: 3_245_130,
          endSample: 3_270_000,
          targets: ['S02'],
        },
      ] as const;
      const endFrame = frameForSample(cues[0].endSample, fps);

      expect(getSegmentFocusState(cues, 'S02', endFrame, fps)).toEqual({
        contact: 0,
        emphasis: 1,
      });
      expect(
        getSegmentFocusState(cues, 'S02', endFrame + 1, fps),
      ).toEqual({contact: 0, emphasis: 0.5});
      expect(
        getSegmentFocusState(cues, 'S02', endFrame + 2, fps),
      ).toEqual({contact: 0, emphasis: 0});
      expect(
        getSegmentFocusState(cues, 'S02', endFrame + 20, fps),
      ).toEqual({contact: 0, emphasis: 0});
    },
  );

  test.each([60, 120])(
    'makes a precision cue fully visible on contact and absent at its exclusive end at %i fps',
    (fps) => {
      const cue = {
        startSample: 1_491_462,
        endSample: 1_494_108,
        targets: ['C1-04-S01'],
      } as const;
      const startFrame = frameForSample(cue.startSample, fps);
      const endFrame = frameForSample(cue.endSample, fps);

      expect(
        getSegmentFocusState(
          [cue],
          'C1-04-S01',
          startFrame - 1,
          fps,
          'precision',
        ),
      ).toEqual({contact: 0, emphasis: 0});
      expect(
        getSegmentFocusState(
          [cue],
          'C1-04-S01',
          startFrame,
          fps,
          'precision',
        ),
      ).toEqual({contact: 1, emphasis: 1});
      expect(
        getSegmentFocusState(
          [cue],
          'C1-04-S01',
          endFrame - 1,
          fps,
          'precision',
        ),
      ).toEqual({contact: 1, emphasis: 1});
      expect(
        getSegmentFocusState(
          [cue],
          'C1-04-S01',
          endFrame,
          fps,
          'precision',
        ),
      ).toEqual({contact: 0, emphasis: 0});
    },
  );

  test('releases the old target completely across a gap before a new target contacts', () => {
    const cues = [
      {startSample: 7_350, endSample: 9_555, targets: ['left']},
      {startSample: 11_760, endSample: 13_230, targets: ['right']},
    ] as const;

    expect(getSegmentFocusState(cues, 'left', 13, 60)).toEqual({
      contact: 0,
      emphasis: 1,
    });
    expect(getSegmentFocusState(cues, 'left', 14, 60)).toEqual({
      contact: 0,
      emphasis: 0.5,
    });
    expect(getSegmentFocusState(cues, 'left', 15, 60)).toEqual({
      contact: 0,
      emphasis: 0,
    });
    expect(getSegmentFocusState(cues, 'right', 15, 60)).toEqual({
      contact: 0,
      emphasis: 0,
    });
    expect(getSegmentFocusState(cues, 'right', 16, 60)).toEqual({
      contact: 1,
      emphasis: 1 / 3,
    });
  });

  test('aggregates repeated, overlapping, unsorted, and multi-target cues by maximum state', () => {
    const cues = [
      {startSample: 8_820, endSample: 13_230, targets: ['S01', 'S02']},
      {startSample: 7_350, endSample: 11_025, targets: ['S01']},
      {startSample: 8_820, endSample: 13_230, targets: ['S01', 'S02']},
    ] as const;
    const reordered = [cues[1], cues[2], cues[0]] as const;

    for (const frame of [9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20]) {
      for (const segmentId of ['S01', 'S02', 'unmapped']) {
        expect(
          getSegmentFocusState(cues, segmentId, frame, 60),
        ).toEqual(getSegmentFocusState(reordered, segmentId, frame, 60));
      }
    }

    expect(getSegmentFocusState(cues, 'S01', 12, 60)).toEqual({
      contact: 1,
      emphasis: 1,
    });
    expect(getSegmentFocusState(cues, 'S02', 12, 60)).toEqual({
      contact: 1,
      emphasis: 1 / 3,
    });
  });

  test('accepts frame zero and a cue beginning at sample zero', () => {
    expect(
      getSegmentFocusState(
        [{startSample: 0, endSample: 735, targets: ['S01']}],
        'S01',
        0,
        60,
      ),
    ).toEqual({contact: 1, emphasis: 1 / 3});
  });

  test.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid frame %s',
    (frame) => {
      expect(() =>
        getSegmentFocusState([], 'S01', frame, 60),
      ).toThrow();
    },
  );

  test.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid fps %s',
    (fps) => {
      expect(() => getSegmentFocusState([], 'S01', 0, fps)).toThrow();
    },
  );

  test.each([
    [-1, 735],
    [0.5, 735],
    [Number.NaN, 735],
    [Number.POSITIVE_INFINITY, 735],
    [0, -1],
    [0, 735.5],
    [0, Number.NaN],
    [0, Number.POSITIVE_INFINITY],
    [735, 735],
    [736, 735],
  ])('rejects invalid cue interval %s..%s', (startSample, endSample) => {
    expect(() =>
      getSegmentFocusState(
        [{startSample, endSample, targets: ['S01']}],
        'S01',
        0,
        60,
      ),
    ).toThrow();
  });
});

describe('reviewed backward semantic focus', () => {
  test('V1-03 contacts S01, jumps forward to S03, then genuinely backward to stationary S02', () => {
    const expectedSegments = [
      {id: 'V1-03-S01', text: 'I remember what happened;'},
      {id: 'V1-03-S02', text: 'questions'},
      {id: 'V1-03-S03', text: 'gnaw at me'},
    ];
    const snapshots = [4224, 4318, 4355].map((frame) =>
      focusSnapshot('V1-03', frame),
    );

    for (const snapshot of snapshots) {
      expect(snapshot.map(({id, text}) => ({id, text}))).toEqual(
        expectedSegments,
      );
    }
    expect(
      snapshots.map((snapshot) =>
        snapshot.map(({id, contact, emphasis}) => ({
          id,
          contact,
          emphasis,
        })),
      ),
    ).toEqual([
      [
        {id: 'V1-03-S01', contact: 1, emphasis: 1 / 3},
        {id: 'V1-03-S02', contact: 0, emphasis: 0},
        {id: 'V1-03-S03', contact: 0, emphasis: 0},
      ],
      [
        {id: 'V1-03-S01', contact: 0, emphasis: 0},
        {id: 'V1-03-S02', contact: 0, emphasis: 0},
        {id: 'V1-03-S03', contact: 1, emphasis: 1 / 3},
      ],
      [
        {id: 'V1-03-S01', contact: 0, emphasis: 0},
        {id: 'V1-03-S02', contact: 1, emphasis: 1 / 3},
        {id: 'V1-03-S03', contact: 0, emphasis: 0},
      ],
    ]);
  });

  test('V1-03 releases its final backward target at the exclusive cue end', () => {
    expect(
      [4403, 4404, 4405].map((frame) =>
        getSegmentFocusState(
          findLine('V1-03').cues,
          'V1-03-S02',
          frame,
          60,
        ),
      ),
    ).toEqual([
      {contact: 0, emphasis: 1},
      {contact: 0, emphasis: 0.5},
      {contact: 0, emphasis: 0},
    ]);
  });

  test("V1-08 keeps four stationary segments while focus jumps S02, backward S01, S03, then S04", () => {
    const expectedSegments = [
      {id: 'V1-08-S01', text: 'Behind my back,'},
      {id: 'V1-08-S02', text: 'someone'},
      {id: 'V1-08-S03', text: "couldn't hold back"},
      {id: 'V1-08-S04', text: 'a laugh'},
    ];
    const snapshots = [5180, 5197, 5265, 5323].map((frame) =>
      focusSnapshot('V1-08', frame),
    );

    for (const snapshot of snapshots) {
      expect(snapshot.map(({id, text}) => ({id, text}))).toEqual(
        expectedSegments,
      );
    }
    expect(
      snapshots.map((snapshot) =>
        snapshot.map(({id, contact, emphasis}) => ({
          id,
          contact,
          emphasis,
        })),
      ),
    ).toEqual([
      [
        {id: 'V1-08-S01', contact: 0, emphasis: 0},
        {id: 'V1-08-S02', contact: 1, emphasis: 1 / 3},
        {id: 'V1-08-S03', contact: 0, emphasis: 0},
        {id: 'V1-08-S04', contact: 0, emphasis: 0},
      ],
      [
        {id: 'V1-08-S01', contact: 1, emphasis: 1 / 3},
        {id: 'V1-08-S02', contact: 0, emphasis: 0},
        {id: 'V1-08-S03', contact: 0, emphasis: 0},
        {id: 'V1-08-S04', contact: 0, emphasis: 0},
      ],
      [
        {id: 'V1-08-S01', contact: 0, emphasis: 0},
        {id: 'V1-08-S02', contact: 0, emphasis: 0},
        {id: 'V1-08-S03', contact: 1, emphasis: 1 / 3},
        {id: 'V1-08-S04', contact: 0, emphasis: 0},
      ],
      [
        {id: 'V1-08-S01', contact: 0, emphasis: 0},
        {id: 'V1-08-S02', contact: 0, emphasis: 0},
        {id: 'V1-08-S03', contact: 0, emphasis: 0},
        {id: 'V1-08-S04', contact: 1, emphasis: 1 / 3},
      ],
    ]);
  });

  test('V1-08 releases its final target at the exclusive cue end', () => {
    expect(
      [5373, 5374, 5375].map((frame) =>
        getSegmentFocusState(
          findLine('V1-08').cues,
          'V1-08-S04',
          frame,
          60,
        ),
      ),
    ).toEqual([
      {contact: 0, emphasis: 1},
      {contact: 0, emphasis: 0.5},
      {contact: 0, emphasis: 0},
    ]);
  });
});

describe('production lyric view model', () => {
  test('preserves every reviewed vocal and semantic cue sample exactly', () => {
    expect(
      lyrics.map((line) => ({
        id: line.id,
        vocalStartSample: line.vocalStartSample,
        vocalEndSample: line.vocalEndSample,
        segments: line.segments,
        cues: line.cues.map(
          ({
            id,
            startSample,
            endSample,
            sourceTokenIds,
            targets,
            activation,
          }) => ({
            id,
            startSample,
            endSample,
            sourceTokenIds,
            targets,
            activation,
          }),
        ),
      })),
    ).toEqual(
      taniseaAlignment.lines.map((line) => ({
        id: line.id,
        vocalStartSample: line.vocalStartSample,
        vocalEndSample: line.vocalEndSample,
        segments: line.segments,
        cues: line.cues.map(
          ({
            id,
            startSample,
            endSample,
            sourceTokenIds,
            targets,
            activation,
          }) => ({
            id,
            startSample,
            endSample,
            sourceTokenIds,
            targets,
            activation,
          }),
        ),
      })),
    );
  });

  test('derives deterministic section styles and fixed visual leads from reviewed vocal samples', () => {
    for (const line of lyrics) {
      const expectedSection = line.id.startsWith('V1-')
        ? 'verse'
        : Number(line.id.slice(-2)) <= 4
          ? 'build'
          : 'chorus';
      expect(line.section, line.id).toBe(expectedSection);
      expect(line.vocalStartSample - line.visualInStartSample, line.id).toBe(
        line.focusProfile === 'precision' ? 368 : 10_584,
      );
      expect(
        line.vocalStartSample - line.visualInCompleteSample,
        line.id,
      ).toBe(line.focusProfile === 'precision' ? 0 : 2_205);
    }
  });

  test('assigns immediate precision focus only to the first vocal act', () => {
    for (const line of lyrics) {
      expect(line.focusProfile, line.id).toBe(
        line.id.startsWith('C1-') ? 'precision' : 'cinematic',
      );
    }
  });

  test('keeps both chorus performances on independent reviewed samples', () => {
    for (let index = 1; index <= 8; index++) {
      const suffix = String(index).padStart(2, '0');
      const first = findLine(`C1-${suffix}`);
      const second = findLine(`C2-${suffix}`);

      expect(first.segments.map(({text}) => text)).toEqual(
        second.segments.map(({text}) => text),
      );
      expect(first.cues).not.toBe(second.cues);
      expect(
        first.cues.map(({startSample, endSample}) => [
          startSample,
          endSample,
        ]),
      ).not.toEqual(
        second.cues.map(({startSample, endSample}) => [
          startSample,
          endSample,
        ]),
      );
    }

    expect(
      findLine('C1-01').cues.map(({startSample, endSample}) => [
        startSample,
        endSample,
      ]),
    ).toEqual([
      [1_066_955, 1_097_825],
      [1_100_471, 1_124_991],
    ]);
    expect(
      findLine('C2-01').cues.map(({startSample, endSample}) => [
        startSample,
        endSample,
      ]),
    ).toEqual([
      [4_031_225, 4_061_213],
      [4_062_977, 4_169_743],
    ]);
  });
});

describe('LyricDisplay rendering', () => {
  test.each([60, 120])(
    'keeps every outgoing C1 line present until the frame before incoming contact at %i fps',
    (fps) => {
      const firstAct = lyrics.filter(({id}) => id.startsWith('C1-'));
      for (let index = 1; index < firstAct.length; index++) {
        const outgoing = firstAct[index - 1];
        const incoming = firstAct[index];
        if (!outgoing || !incoming) throw new Error('Missing C1 handoff fixture');
        const frameBeforeContact =
          frameForSample(incoming.vocalStartSample, fps) - 1;
        const markup = renderToStaticMarkup(
          createElement(LyricDisplay, {frame: frameBeforeContact, fps}),
        );

        expect(
          markup,
          `${outgoing.id} before ${incoming.id} contact`,
        ).toContain(`data-lyric-line-id="${outgoing.id}"`);
        const outgoingTag = dataOpeningTag(
          markup,
          'data-lyric-line-id',
          outgoing.id,
        );
        const opacity = Number(/(?:^|;)opacity:([^;"]+)/.exec(outgoingTag)?.[1]);
        expect(
          opacity,
          `${outgoing.id} visible before ${incoming.id} contact`,
        ).toBeGreaterThan(0);
      }
    },
  );

  test.each([60, 120])(
    'keeps every incoming C1 line visually absent until its exact contact at %i fps',
    (fps) => {
      const firstAct = lyrics.filter(({id}) => id.startsWith('C1-'));
      for (let index = 1; index < firstAct.length; index++) {
        const incoming = firstAct[index];
        if (!incoming) throw new Error('Missing C1 handoff fixture');
        const frameBeforeContact =
          frameForSample(incoming.vocalStartSample, fps) - 1;
        const markup = renderToStaticMarkup(
          createElement(LyricDisplay, {frame: frameBeforeContact, fps}),
        );

        if (!markup.includes(`data-lyric-line-id="${incoming.id}"`)) continue;
        const incomingTag = dataOpeningTag(
          markup,
          'data-lyric-line-id',
          incoming.id,
        );
        const opacity = Number(/(?:^|;)opacity:([^;"]+)/.exec(incomingTag)?.[1]);
        expect(opacity, `${incoming.id} before contact`).toBe(0);
      }
    },
  );

  test.each([60, 120])(
    'contacts C1-07 / Through on the reviewed 44.773-second onset at %i fps',
    (fps) => {
      const line = findLine('C1-07');
      const cue = line.presentationCues[0];
      if (!cue) throw new Error('Missing C1-07 presentation onset');
      expect(cue.startSample).toBe(1_974_489);
      const contactFrame = frameForSample(1_974_489, fps);

      expect(
        getSegmentFocusState(
          line.presentationCues,
          'C1-07-S01',
          contactFrame - 1,
          fps,
          line.focusProfile,
        ),
      ).toEqual({contact: 0, emphasis: 0});
      expect(
        getSegmentFocusState(
          line.presentationCues,
          'C1-07-S01',
          contactFrame,
          fps,
          line.focusProfile,
        ),
      ).toEqual({contact: 1, emphasis: 1});
    },
  );

  test.each([60, 120])(
    'removes every outgoing C1 line on the incoming contact frame at %i fps',
    (fps) => {
      const firstAct = lyrics.filter(({id}) => id.startsWith('C1-'));
      for (let index = 1; index < firstAct.length; index++) {
        const outgoing = firstAct[index - 1];
        const incoming = firstAct[index];
        if (!outgoing || !incoming) throw new Error('Missing C1 handoff fixture');
        const contactFrame = frameForSample(incoming.vocalStartSample, fps);
        const markup = renderToStaticMarkup(
          createElement(LyricDisplay, {frame: contactFrame, fps}),
        );

        expect(markup, `${outgoing.id} at ${incoming.id} contact`).not.toContain(
          `data-lyric-line-id="${outgoing.id}"`,
        );
        expect(markup).toContain(`data-lyric-line-id="${incoming.id}"`);
        const incomingTag = dataOpeningTag(
          markup,
          'data-lyric-line-id',
          incoming.id,
        );
        expect(
          Number(/(?:^|;)opacity:([^;"]+)/.exec(incomingTag)?.[1]),
          `${incoming.id} opacity on contact`,
        ).toBe(1);
      }
    },
  );

  test('retains the approved cinematic overlap in the later act', () => {
    const incoming = findLine('C2-04');
    const markup = renderToStaticMarkup(
      createElement(LyricDisplay, {
        frame: frameForSample(incoming.vocalStartSample, 60),
        fps: 60,
      }),
    );

    expect(markup).toContain('data-lyric-line-id="C2-03"');
    expect(markup).toContain('data-lyric-line-id="C2-04"');
  });

  test.each([
    ['C1-01', 27.0, 'C1-01-S02'],
    ['C1-06', 42.0, 'C1-06-S03'],
    ['C1-06', 44.2, 'C1-06-S02'],
    ['C1-07', 46.0, 'C1-07-S03'],
    ['C1-07', 46.6, 'C1-07-S02'],
    ['C1-08', 48.0, 'C1-08-S03'],
  ] as const)(
    'keeps the 40–50 second passage on its reviewed semantic focus for %s at %s seconds',
    (lineId, seconds, expectedSegmentId) => {
      const line = findLine(lineId);
      const markup = renderToStaticMarkup(
        createElement(LyricDisplay, {
          frame: Math.round(seconds * 60),
          fps: 60,
        }),
      );

      for (const segment of line.segments) {
        expect(
          dataStyle(markup, 'data-lyric-glyph-id', segment.id),
          `${lineId} ${seconds}s ${segment.id}`,
        ).toContain(
          `background-size:${segment.id === expectedSegmentId ? 100 : 0}% 4px`,
        );
      }
    },
  );

  test('releases the final first-act word when the vocal ends', () => {
    const line = findLine('C1-08');
    const markup = renderToStaticMarkup(
      createElement(LyricDisplay, {
        frame: Math.round(49.6 * 60),
        fps: 60,
      }),
    );

    expect(markup).toContain('data-lyric-line-id="C1-08"');
    for (const segment of line.segments) {
      expect(
        dataStyle(markup, 'data-lyric-glyph-id', segment.id),
      ).toContain('background-size:0% 4px');
    }
  });

  test.each([60, 120])(
    'applies every corrected 40–50 second exclusive release at %i fps',
    (fps) => {
      for (const lineId of ['C1-06', 'C1-07', 'C1-08'] as const) {
        const line = findLine(lineId);
        for (const cue of line.presentationCues) {
          const target = cue.targets[0];
          if (!target) throw new Error(`Missing target for ${cue.id}`);
          const endFrame = frameForSample(cue.endSample, fps);

          expect(
            getSegmentFocusState(
              line.presentationCues,
              target,
              endFrame - 1,
              fps,
              line.focusProfile,
            ),
            `${cue.id} before exclusive end`,
          ).toEqual({contact: 1, emphasis: 1});
          expect(
            getSegmentFocusState(
              line.presentationCues,
              target,
              endFrame,
              fps,
              line.focusProfile,
            ),
            `${cue.id} on exclusive end`,
          ).toEqual({contact: 0, emphasis: 0});
        }
      }
    },
  );

  test('advances the horizontal rail by semantic cue and holds during word gaps', () => {
    const cues = [
      {startSample: 44_100, endSample: 66_150},
      {startSample: 70_560, endSample: 105_840},
    ] as const;

    expect(getPresentationProgress(cues, 119, 120)).toBe(0);
    expect(getPresentationProgress(cues, 120, 120)).toBe(0);
    expect(getPresentationProgress(cues, 150, 120)).toBeCloseTo(0.25, 12);
    expect(getPresentationProgress(cues, 180, 120)).toBe(0.5);
    expect(getPresentationProgress(cues, 191, 120)).toBe(0.5);
    expect(getPresentationProgress(cues, 192, 120)).toBe(0.5);
    expect(getPresentationProgress(cues, 240, 120)).toBeCloseTo(0.75, 12);
    expect(getPresentationProgress(cues, 288, 120)).toBe(1);
  });

  test('renders the cue-synchronous rail milestone in the first-act word gap', () => {
    const line = findLine('C1-06');
    const firstCue = line.cues[0];
    if (!firstCue) throw new Error('Missing C1-06 cue');
    const markup = renderToStaticMarkup(
      createElement(LyricDisplay, {
        frame: frameForSample(firstCue.endSample, 60),
        fps: 60,
      }),
    );

    expect(
      dataOpeningTag(markup, 'data-lyric-progress-id', line.id),
    ).toContain('width:33.3%');
  });

  test.each([
    ['C2-06', 108.5, 'C2-06-S03'],
    ['C2-07', 111.5, 'C2-07-S03'],
  ] as const)(
    'preserves the approved second-act semantic focus for %s at %s seconds',
    (lineId, seconds, expectedSegmentId) => {
      const line = findLine(lineId);
      const markup = renderToStaticMarkup(
        createElement(LyricDisplay, {
          frame: Math.round(seconds * 60),
          fps: 60,
        }),
      );

      for (const segment of line.segments) {
        expect(
          dataStyle(markup, 'data-lyric-glyph-id', segment.id),
          `${lineId} ${seconds}s ${segment.id}`,
        ).toContain(
          `background-size:${segment.id === expectedSegmentId ? 100 : 0}% 3px`,
        );
      }
    },
  );

  test('renders C1 precision contact with immediate high contrast and a tight underline', () => {
    const c1 = findLine('C1-04');
    const c1Cue = c1.cues[0];
    if (!c1Cue) throw new Error('Missing C1-04 precision cue');
    const c1Markup = renderToStaticMarkup(
      createElement(LyricDisplay, {
        frame: frameForSample(c1Cue.startSample, 60),
        fps: 60,
      }),
    );
    const activeStyle = dataStyle(
      c1Markup,
      'data-lyric-glyph-id',
      'C1-04-S01',
    );
    const inactiveStyle = dataStyle(
      c1Markup,
      'data-lyric-glyph-id',
      'C1-04-S02',
    );

    expect(c1Markup).toContain('data-focus-profile="precision"');
    expect(activeStyle).toContain('color:rgba(255,255,255,1)');
    expect(activeStyle).toContain('font-weight:690');
    expect(activeStyle).toContain('text-shadow:0 0 14px');
    expect(activeStyle).toContain('background-size:100% 4px');
    expect(inactiveStyle).toContain('color:rgba(255,255,255,0.48)');

    const c2 = findLine('C2-04');
    const c2Cue = c2.cues[0];
    if (!c2Cue) throw new Error('Missing C2-04 cinematic cue');
    const c2Markup = renderToStaticMarkup(
      createElement(LyricDisplay, {
        frame: frameForSample(c2Cue.startSample, 60),
        fps: 60,
      }),
    );
    expect(c2Markup).toContain('data-focus-profile="cinematic"');
    expect(
      dataStyle(c2Markup, 'data-lyric-glyph-id', 'C2-04-S01'),
    ).toContain('background-size:100% 3px');
  });

  test('keeps stable segment layers while contact and residual emphasis drive visible glyph styles', () => {
    const contactMarkup = renderToStaticMarkup(
      createElement(LyricDisplay, {frame: 4355, fps: 60}),
    );
    const orderedText = [
      'I remember what happened;',
      'questions',
      'gnaw at me',
    ];

    expect(orderedText.map((text) => contactMarkup.indexOf(text))).toEqual(
      [...orderedText]
        .map((text) => contactMarkup.indexOf(text))
        .sort((left, right) => left - right),
    );
    expect(
      dataStyle(contactMarkup, 'data-lyric-glyph-id', 'V1-03-S02'),
    ).toContain(
      'background-size:100% 3px',
    );
    expect(
      dataStyle(contactMarkup, 'data-lyric-glyph-id', 'V1-03-S02'),
    ).toContain(
      'font-weight:590',
    );
    expect(
      dataStyle(contactMarkup, 'data-lyric-placeholder-id', 'V1-03-S02'),
    ).toContain('font-weight:700');
    expect(contactMarkup).toContain('data-lyric-line-id="V1-03"');
    expect(contactMarkup).toContain(
      'data-lyric-segment-id="V1-03-S02"',
    );

    const releaseMarkup = renderToStaticMarkup(
      createElement(LyricDisplay, {frame: 4403, fps: 60}),
    );
    expect(
      dataStyle(releaseMarkup, 'data-lyric-glyph-id', 'V1-03-S02'),
    ).toContain(
      'background-size:0% 3px',
    );
    expect(
      dataStyle(releaseMarkup, 'data-lyric-glyph-id', 'V1-03-S02'),
    ).toContain(
      'font-weight:690',
    );
    expect(
      dataStyle(releaseMarkup, 'data-lyric-glyph-id', 'V1-03-S02'),
    ).toContain(
      'text-shadow:0 0 23px',
    );
  });

  test('keeps chorus visible glyph weights within the loaded Space Grotesk range', () => {
    const line = findLine('C1-05');
    const cue = line.cues[0];
    if (!cue) throw new Error('Missing C1-05 cue');
    const markup = renderToStaticMarkup(
      createElement(LyricDisplay, {
        frame: frameForSample(cue.startSample, 60) + 2,
        fps: 60,
      }),
    );
    const style = dataStyle(
      markup,
      'data-lyric-glyph-id',
      cue.targets[0] ?? '',
    );
    const weight = Number(/font-weight:([^;]+)/.exec(style)?.[1]);

    expect(weight).toBeLessThanOrEqual(700);
    expect(weight).toBe(700);
  });
});
