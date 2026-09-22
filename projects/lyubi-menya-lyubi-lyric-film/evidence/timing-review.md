# Timing preparation — review preview v2

**Status: provisional preview timing. Actual-audio listening and complete bilingual audiovisual review remain pending.** These measurements do not authorize a production render.

## Locked clock and coverage

The original AAC track remains at 44,100 Hz stereo. The decoded interleaved Float32 file is 66,121,216 bytes, hence 8,265,152 samples per channel. The container presents 187.401995 seconds; the decoded sample extent is 187.4184127 seconds. Resampling and vocal separation retain sample zero. Composition duration follows the container; source events use integer 44.1 kHz sample indices.

The 33 cues and 147 Russian words preserve the supplied performed sequence. Repeated sections are independently bounded and aligned. The four bridge repetitions are separate cues, followed by two final-chorus passes and the final imperative. The selected final vocal release is now **180.75 seconds**.

| Recording span | Coverage evidence |
| --- | --- |
| 0–29.5 s | Bounded and full vocal-stem ASR recover the opening verse at 1.78–26.40 s. Full mixed-audio ASR misses this verse; its omission is rejected. Five display cues preserve the verse words. |
| 29.5–63.1 s | Full mix and stem observations recover the first chorus and both standalone repetitions. Six cues. |
| 63.1–96.4 s | Independent stem and bounded passes recover the second verse beginning near 68.86 s. Five cues; the earlier broad mixed-ASR segment boundary is not treated as vocal onset. |
| 96.4–120.6 s | Both full-recording observations recover the second chorus. Four cues. |
| 120.5–132.75 s | Full stem ASR recovers four separate “Люби меня, люби” repetitions. Bounded bridge ASR invents a music label; section and line MMS independently recover the corresponding word sequences. The failed recognition is retained as evidence, not displayed text. |
| 132.75–181.5 s | Full stem ASR and independently bounded MMS recover two final choruses and the final repetition. Nine cues. |
| Final vocal to 187.401995 s | Full stem and bounded ending transcription support no additional lyric after the final repetition. Its selected release is 180.75 s, near the recognizer's 180.76 s ending. The mixed recognizer invents a subtitle credit at 186.68 s; it is absent from the supplied text and stem observation and is rejected. Tail classification still requires listening. |

## Boundary observations

Five observations remain available for every word in [the boundary ledger](../analysis/boundary-ledger.json):

1. MMS forced alignment of the bounded vocal-stem line: the original phonetic-core draft.
2. MMS alignment of the same line in the original mix.
3. Whisper-turbo bounded vocal-line alignment.
4. MMS vocal alignment in a larger, independently bounded section.
5. MMS original-mix alignment in the larger section.

[Line windows](../source/lines.json) and [section windows](../source/sections.json) preserve each performance separately. Broad section checks exposed substantial late-chorus drift in original-mix MMS; bounded lines resolve the sequences. Whisper often includes leading context or inter-word gaps, so estimates remain separate rather than being averaged. MMS may align a sustained vowel to a short phonetic core. Model agreement and 20 ms model resolution do not establish perceptual accuracy.

The separated-stem waveform and spectrogram in `public/acoustic.json` provide a 10 ms hop / 32 ms Hann-window inspection aid. [The initial boundary chart](timing/acoustic-boundaries.png) records selected disagreements. These signal observations are not listening attestations.

## V2 corrections

[The explicit correction ledger](../source/timing-corrections.json) now contains **24 selections**:

| Category | Count | Change and evidence |
| --- | ---: | --- |
| Initial gap corrections | 2 | LM-019-s04 rejects a negation onset that spans the previous word and a quiet gap. LM-031-s03 removes a held imperative's spurious extension into the next negation. The selected latter release remains 167.30 s. |
| Short conjunction vowel spans | 10 | Replace 20–40 ms “и” cores with separately inspected 110–300 ms vowel spans. [Numerical traces](../analysis/refinement-v2-signal.json) retain RMS, smoothed spectral similarity, model anchors and neighboring-word bounds. [The comparison chart](../analysis/refinement-v2-conjunctions.png) shows original cores and selected spans. |
| Final-chorus word handoff | 1 | LM-026-s03 moves “днём” from the unsupported early line-stem estimate to the independently supported section estimate near 139.57 s. Three other context/mix observations and the preceding vowel transition support rejecting the early assignment. |
| Held releases | 11 | Extend individually inspected vocal bodies that outlast their phonetic cores, including each bridge repetition and the final vowel. [Release traces](../analysis/refinement-v2-releases.json) retain 40 ms RMS, normalized lag correlation, spectral shape and neighboring onsets. [The release chart](../analysis/refinement-v2-held-tails.png) compares original and selected ends. |

The conjunction traces use a 20 ms RMS window and a 64 ms cepstrally smoothed spectrum on a 10 ms grid. The held-release traces use a 40 ms RMS window and normalized lag correlation over lags 30–220 samples at 16 kHz. Model anchors identify candidate vowel identity; waveform and spectral evidence support duration. These signals cannot always distinguish articulation from reverberation or source-separation residue.

Two conjunction releases need a particularly careful handoff review: **LM-007 at 37.218 s** lies about 7.9 ms before the following source onset, and **LM-018 at 104.515 s** lies about 10.3 ms before it. These are conservative, neighbor-limited choices within coarticulated vowel transitions. They are not separately proven acoustic silence or release points.

Every repetition keeps its own measurements. No global offset, copied chorus timing, generic minimum word duration or uniform tail extension is applied. Original model candidates remain unchanged beneath the explicit correction layer. The cue builder rejects unknown or duplicate correction IDs and invalid intervals.

## Verification and remaining review

The rebuilt 33 cues and 147 source intervals are positive, ordered and within the locked sample range. No source intervals or displayed cue windows overlap. The shortest line entrance lead is approximately 210.16 ms and shortest exit clearance is approximately 210.18 ms after the revised releases. TypeScript checks pass.

All source boundaries and complete English meaning spans still require actual-audio review. Priorities are:

- the two neighbor-limited conjunction handoffs and other coarticulated short words;
- the opening “моя любовь” handoff and both independent “вслух” onsets;
- each held “люби”, “огнём”, “сжигая” and the final release, separating vocal body from reverb;
- the four independently timed bridge entries and releases;
- confirmation that the rejected music label and subtitle credit are not performed lyrics;
- the complete original recording at normal speed, uncertain events at reduced speed, and both 16:9 and 9:16 bilingual layouts.

An independent evidence review found no clear neighboring-word crossing or long quiet-gap hold in the selected corrections. It did not establish alternate exact boundaries or complete listening. The technical checks do not close the cross-language synchronization gate or certify perfect sync.

## Reproduction

Use the existing model environment through `ALIGN_PYTHON`; model inference uses three Torch CPU threads. Run vocal separation from the zero-aligned analysis mix and retain full and bounded transcription evidence. Then run:

```sh
node scripts/align.ts mms mix source/sections.json -sections
node scripts/align.ts mms vocals source/sections.json -sections
node scripts/align.ts mms mix source/lines.json -lines
node scripts/align.ts mms vocals source/lines.json -lines
node scripts/align.ts whisper vocals source/lines.json -lines
node scripts/build-cues.ts
node scripts/acoustic-review.ts
node scripts/timing-diagnostics.ts
```

`build-cues.ts` checks the byte-derived decoded clock against the media manifest, validates token correspondence, and applies the recorded correction layer to unchanged inference artifacts. Rebuilding cannot accumulate extensions. The v2 numerical traces preserve the signal observations underlying the explicit editorial selections.
