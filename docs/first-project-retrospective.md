# First-project retrospective and semantic highlighting proposal

## Assessment

**Overall assessment: 8/10 for the first project of this type.**

This is a holistic production score for the audited Tanisea master, not a mathematical average. Lyric synchronization is a core function of a lyric film, so the blocking timing misses cap the overall result even though the visual, technical, and reproducibility work score more highly.

The assessment is tied to the production master with SHA-256 `78e14d9afd84ed8290ac5e91e0419e725d920ba959e2ceca54e91a63c564833b` and the findings in the [timing audit](../audits/tanisea-ksviety-remix.md).

| Area | Score | Assessment |
| --- | ---: | --- |
| Art direction and continuity | 9/10 | The artwork, camera motion, particles, reactive halo, equalizer, frame chrome, colour system, and title outro read as one authored film. |
| Technical delivery | 9.5/10 | The full source render, compact HEVC delivery, `hvc1`, `faststart`, untouched AAC stream, full decode, and checksums form a strong production master. |
| Reproducibility and documentation | 9.5/10 | Source, assets, dependency lock, render instructions, audit data, reference export, and final master are preserved together. |
| Translation and editorial quality | 7.5/10 | The English is generally meaningful, but a fluent Russian/English pass is still required for natural phrasing and precise semantic grouping. |
| Lyric and highlight synchronization | 6.5/10 | The first verse is about four seconds late, the second chorus develops progressive drift, the outro begins late, and the shared visual envelope creates additional perceived lag. |

### Scientific audio-visualization assessment

The current audio-reactive layer is assessed separately at approximately **5/10 scientific fidelity**. It uses real soundtrack-derived FFT data and correct low-to-high ordering, but it is uncalibrated, left-channel-only, low-resolution in the bass, non-linear in magnitude, partly duplicated in its band mapping, temporally peak-held, and displayed without units or measurement scales.

The [10/10 scientific audio-visualization target](scientific-audio-visualization.md) replaces cosmetic “science” with a measurable workflow: multi-resolution stereo analysis, calibrated spectrum, standard loudness and true peak, sample-indexed events, 60 fps rendering, published uncertainty, independent reference tests, and a sharper instrument rail.

## What succeeded

- The failed ending was rebuilt from the original Remotion source instead of being covered with a patch.
- The original Russian title became an intentional outro state for the chopped and unclear vocal tail.
- The complete 4,590-frame film remains inside one visual language.
- The locked soundtrack was preserved without generational audio loss in the delivery master.
- The project is reproducible and the remaining defects are documented rather than hidden behind a subjective approval.

## What prevents a 10/10 result

1. The first verse line starts around `3.99 s` after the clear vocal begins.
2. The second chorus drifts progressively late, with some boundaries more than one second from the performance.
3. The clean final lyric remains until `118.00`, although the repeated-title vocal begins around `116.05`.
4. Opacity, blur, and movement begin at `line.start`, the timestamp currently used as vocal onset, making otherwise correct cues feel `0.32–0.50 s` late.
5. The English translation has not received final approval from a fluent bilingual editor.
6. The current highlighting model assumes that translated semantic groups should progress in display order.

## Improvement order

1. Restore the audited first-verse and second-chorus timing map.
2. Move the integrated original-title outro to the first repeated-title vocal around `116.05`.
3. Separate vocal, visual entrance, visual exit, and semantic highlight windows.
4. Add the non-linear semantic highlighting model specified below.
5. Complete a fluent Russian/English editorial and semantic-alignment pass.
6. Render and review the high-risk windows at normal speed, slow speed, and frame level.
7. Complete one uninterrupted full-length audiovisual review before mastering.

## Why bilingual highlighting may move backwards

Russian and English do not always place equivalent ideas in the same order. A natural English sentence can therefore have a display order of `A → B → C` while the performed Russian meaning maps more accurately to `B → A → C`.

Forcing a cumulative left-to-right highlight in this situation produces false synchronization. Rewriting every English line into Russian word order would preserve a simple animation rule at the cost of awkward or misleading English.

The better model separates three things:

1. **Source-language performance order** — what is sung and when.
2. **English reading order** — the natural order in which the translated line is displayed.
3. **Semantic activation order** — which English meaning group corresponds to the current source phrase.

Semantic activation is allowed to move forwards, backwards, reactivate an earlier group, or activate more than one group at once. This is an intentional mapping, not a playback progress indicator.

## Interaction design

Backward activation must not resemble a video glitch or rewind.

- Display the complete English line and settle its entrance before the vocal starts.
- Keep every word stationary; only the focus state changes.
- Use transient glow, weight, underline, or colour emphasis instead of a permanent left-to-right fill.
- Crossfade focus over approximately `3–4` frames at 30 fps rather than snapping harshly.
- Let completed groups return to a quiet readable state instead of leaving a cumulative painted trail.
- Permit simultaneous targets when one source phrase carries meaning distributed across multiple English groups.
- Permit repeated activation when a performed source fragment repeats the same translated idea.
- Add a second visual signal such as weight or underline so meaning does not depend on colour alone.

A separate line-duration indicator may still progress monotonically from left to right. It represents elapsed time inside the line, not source-to-translation meaning. Only the semantic word-group focus is allowed to follow a non-linear target sequence.

If a line requires several long jumps across the display, treat that as an editorial warning. First consider a better translation, shorter semantic groups, or a two-line layout. Non-linear highlighting should resolve genuine language-order differences, not compensate for weak transcription or inaccurate timing.

## Proposed timing model

Keep English segments in natural visual order. Store cue events independently in chronological performance order and let each event target any segment ID.

```js
{
  id: 'line-01',
  sourceText: 'Verified source-language line',
  text: 'Natural English translation',
  vocalStart: 60.09,
  vocalEnd: 67.0,
  visualInStart: 59.77,
  visualInComplete: 60.09,
  visualOutStart: 67.0,
  visualOutEnd: 67.24,

  // Natural English reading order. These positions never move.
  segments: [
    {id: 'meaning-a', text: 'English group A'},
    {id: 'meaning-b', text: 'English group B'},
    {id: 'meaning-c', text: 'English group C'}
  ],

  // Chronological source-performance order may target B, then A, then C.
  cueEvents: [
    {
      start: 60.09,
      end: 61.8,
      targets: ['meaning-b'],
      confidence: 'high'
    },
    {
      start: 61.8,
      end: 63.4,
      targets: ['meaning-a'],
      confidence: 'high',
      mappingNote: 'Approved source/translation phrase-order difference'
    },
    {
      start: 63.4,
      end: 67.0,
      targets: ['meaning-c'],
      confidence: 'medium'
    }
  ]
}
```

`cueEvents` must be chronological. The order of their target positions must **not** be required to increase. This distinction is what allows natural English and accurate Russian timing to coexist.

`mappingNote` is optional audit metadata for intentional non-linear relationships. Rendering is determined only by the chronological event and its `targets`; the renderer must not rearrange the displayed text.

## Rendering rules

At each frame:

1. determine the active cue events from audio time;
2. collect their target segment IDs;
3. animate those segments towards the active focus style;
4. animate previously active segments back to the readable base style;
5. leave segment position and line layout unchanged;
6. keep line entrance and exit calculations independent of cue activation.

The renderer should support:

- one source cue targeting one English group;
- one source cue targeting several English groups;
- several source cues targeting the same English group;
- overlapping cue events when the performance overlaps;
- no lyric target for an explicitly documented unclear or non-literal vocal state.

## Validation rules

Automated validation should confirm that:

- every segment ID is unique inside its line;
- every cue target references an existing segment;
- cue events are chronologically ordered and contained within the vocal window;
- target display positions are allowed to be non-monotonic;
- overlaps are intentional and documented;
- low-confidence mappings include an editorial note;
- clear performed phrases are not left without a semantic target.

Human review should confirm that:

- the English remains grammatical and natural when read without the source text;
- every activation corresponds to performed meaning rather than merely a similar sound;
- a backward activation feels like a change of focus, not a rewind;
- repeated or simultaneous activation remains readable at normal playback speed;
- lines with excessive visual travel are rewritten or restructured;
- unclear chopped vocals transition to an intentional title or refrain state.

## Definition of done for vNext

The next master can be considered substantially improved when:

- all P0 timing findings in the current audit are fixed;
- line entrances are complete by vocal onset and exits begin after vocal end;
- a bilingual editor approves both the English wording and semantic mappings;
- non-linear mappings use independent focus states rather than reversible progress fills;
- every backward, repeated, or simultaneous activation has been reviewed in the audiovisual clip;
- the full master passes the existing editorial, audiovisual, decode, audio-identity, and checksum checks.
