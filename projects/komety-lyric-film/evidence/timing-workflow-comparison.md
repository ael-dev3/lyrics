# Timing workflow comparison — Кометы

**Status:** local comparison supporting the ongoing onset and release audit. This is not listening approval, a frozen production input, or a claim of exact phonetic ground truth. The main timing ledger remains authoritative for the next candidate revision.

## Relevant completed examples

### Must Have Been A Dream: repair individual entrances

[The onset review](../../must-have-been-a-dream-lyric-film/TIMING-REVIEW.md) and [old/new ledger](../../must-have-been-a-dream-lyric-film/source/onset-refinement.json) record **34 changed starts among 156 events**. Some entrances moved later by more than a second, while the short “for” moved earlier. Repair local phonetic edges, especially entrances after pauses, rather than applying a global offset.

Its subsequent normal-speed, uncertain-word reduced-speed and both-format human review is separate evidence. Its older frame-callback word clock had approximately 41.7 ms cadence; copying it would not improve the finer current Кометы clock.

### Люби меня, люби: recover the complete sung body

[The timing review](../../lyubi-menya-lyubi-lyric-film/evidence/timing-review.md) and [correction ledger](../../lyubi-menya-lyubi-lyric-film/source/timing-corrections.json) record **11 held-release extensions**, **10 short-conjunction expansions**, and three other repairs. Some 20–40 ms alignment cores became independently inspected 110–300 ms vowel spans. Waveform, spectral shape, periodicity and neighboring onsets supported duration choices.

Held words retained direct sung endings without automatically including passive reverberation. Repetitions had separate measurements. No generic minimum duration, uniform tail, or hold-until-next-word policy was applied. Later listening approval did not erase acoustic uncertainty.

### TAKE ME THERE: preserve real gaps and neighboring articulation

[Its timing decisions](../../take-me-there-lyric-film/evidence/timing-decisions.json) extend a supported “TRUE” vowel, reject “ME” spilling across the next “WITH” consonant, and reject a quiet “GO”-like decay as proof of continuing articulation. [Production notes](../../take-me-there-lyric-film/PRODUCTION-NOTES.md) record an omitted phrase restored near 45 seconds. Coverage, onset and release need separate checks.

## Application to the current candidate

- Find the first consonant or vowel in the original mix, supported by a clock-verified stem. Strong CTC character cores can occur after quiet entrances.
- Follow the direct sung ending beyond a short character core; distinguish articulation from reverb, accompaniment and separation residue.
- Inspect neighboring edges together. Do not mechanically clamp the preceding release to a revised onset.
- Separate neutral visibility from bright focus. English semantic anchors inherit source intervals without enclosing unrelated gaps.
- Retain genuine gaps. A large selected gap warrants review; it does not prove silence or justify filling it.

### Pre-release-audit snapshot

The inspected `public/timeline.json` had revision `komety-preview-v2-leading-edges`, SHA-256 **fa40ea33474a99e40918b580fd7348594fbed51261676057758ff49f4e8ed065**, against original source SHA-256 **af518bcde332f296dfc7982ebd7d8724c80c722decf5a32dfe3b00ef86107bf6**. It contained 139 word events and 112 within-cue handoffs: 39 selected gaps exceeded 100 ms, 28 exceeded 200 ms, and five exceeded 500 ms. These historical metrics must not be presented as the pending release revision's measurements.

Review priorities included «родится / Юности» at 28.880–29.715 s, «красоты / не» at 26.800–27.370 s, and «над / землёй» at 176.587–177.090 s and 190.008–190.710 s. The 60 ms «ей» at 120.429–120.489 s warranted short-vowel inspection. Acoustic evidence, rather than these durations alone, must decide whether to change them.

## Display-path inspection

[The model](../src/model.ts) uses fractional playback samples, exclusive ends and no bright-focus anticipation. [The player](../src/player.ts) evaluates the source video's `currentTime` at display cadence, separately from picture PTS. [The scene](../src/scene.ts) changes active color immediately. All inspected starts, midpoints and release-adjacent samples had full cue opacity; visible windows did not overlap. No activation ramp or fade cutting an active interval was found.

Runtime needs separate measurement. A picture PTS more than 160 ms behind the media clock suppresses painting and shows recovery. Measure paint cost, presentation gaps and word-clock versus picture-clock difference before compensating acoustically. Late starts together with early ends warrant inspecting interval width, not assuming one constant offset.

The general rule is preserved in [the source-clocked workflow](../../../docs/source-clocked-word-effects-workflow.md): source phonetic edges, semantic focus, neutral reading visibility, decorative lifetime, and browser presentation are related but distinct. Complete moving normal/reduced-speed review in both formats remains a separate requirement before production.
