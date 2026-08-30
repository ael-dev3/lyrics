# Tanisea “Закричу на весь мир (ksviety Remix)” timing audit

> **Superseded timing evidence:** this early source-recovery audit remains for provenance, but its provisional `60.09 s` verse interpretation and `116.05 s` outro interpretation are not used by vNext. Two later full-master audits independently place the verse near `64.03–64.09 s` and the original-title transition near `118.20–118.25 s`. Use the [reconciled vNext record](tanisea-vnext-qc-implementation.md) and [schema v2 cue data](tanisea-vnext-qc-implementation.json) for production.

## Audited master

| Property | Value |
| --- | --- |
| File | `Tanisea - I'll Scream to the Whole World [English Lyric Film - Production Master].mp4` |
| SHA-256 | `78e14d9afd84ed8290ac5e91e0419e725d920ba959e2ceca54e91a63c564833b` |
| Duration | `153.000 s` |
| Video | HEVC Main, `hvc1`, 1080×1080, 30 fps, 4,590 frames |
| Audio | Original AAC-LC stream, 44.1 kHz stereo |
| Audio stream MD5 | `d7bc6720b532a4a1c6b3035c65eed91c` |
| Size | 66,221,023 bytes |
| Audit date | 2026-08-30 |

This audit is tied to the checksum above. A different render may not have the same findings.

## Evidence used

- the exact 153-second soundtrack embedded in the master;
- the current Remotion timing source and rendering logic;
- the earlier hand-aligned cue map retained before the latest timing changes;
- a multilingual large-v3-turbo transcription with token timestamps;
- dense source-rendered previews and final-master contact strips;
- the published lyric and credit listing for the exact remix on [Shazam](https://www.shazam.com/song/1759983214/d0b7d0b0d0bad180d0b8d187d183-d0bdd0b0-d0b2d0b5d181d18c-d0bcd0b8d180-ksviety-remix).

The speech model is evidence, not authority. Distorted words were resolved from the known remix structure and the hand-aligned map. No machine guess should replace fluent human listening before the next render.

The retained hand-aligned timing source has SHA-256 `86c4a7720817826480158978f570bc1ed6cc0f699643855df9c90acad5661ad2`, allowing future work to verify that it is using the same reference map.

## Performed structure versus current visual structure

| Performed audio | Current visual state | Finding |
| --- | --- | --- |
| `0.00–24.00` processed/stretched opening fragment | title intro, then atmospheric transition | Intentional non-literal treatment; exact words are too processed for reliable karaoke. |
| `24.00–50.00` first chorus | English lyrics | Mostly strong; four adjacent boundaries around mountain/ocean/title phrase were moved by `0.27–0.46 s`. |
| `50.00–60.09` instrumental break | break card | Correct. |
| `60.09–91.00` verse | break card until `64.00`, then English lyrics | Major miss: the break card covers about four seconds of the first verse line. |
| `91.05–116.00` second chorus | English lyrics until `118.00` | Progressive late drift after the first line; the last lyric overlaps the repeated-title tail. |
| `116.05–153.00` chopped/repeated title vocal, with a quieter gap around `138–146` | integrated original-title outro from `118.00` | The state choice is correct, but it begins about `1.95 s` late. |

## Highest-priority findings

### P0 — the first verse line is almost four seconds late

The vocal phrase corresponding to “Night in the silence freezes helplessly;” begins around `60.09` and runs to `67.00`. The master keeps the break card through `64.00` and starts the line at `64.08`.

Impact:

- approximately `3.99 s` of clear vocal has no lyric;
- the compressed `64.08–66.61` cue map forces five English groups into only `2.53 s`;
- the next line starts `0.44 s` before its performed phrase.

Fix:

- end the break card at `60.00`;
- restore the line to `60.09–67.00`;
- restore its semantic cue windows while retaining the requested semicolon;
- restore the sky line to `67.05–70.00`.

### P0 — the second chorus progressively trails the singer

The first second-chorus line begins correctly at `91.05`, but later boundaries move progressively late. The mountain line begins about `1.03 s` late; the ocean line begins about `1.47 s` late; the final fire line begins about `1.37 s` late and remains until `118.00`.

Fix: restore the earlier hand-aligned second-chorus map shown in the full table and machine-readable audit.

### P0 — the outro begins after the repeated title vocal

The final clean chorus line ends at `116.00`. The chopped title phrase begins around `116.05`. The current lyric remains until `118.00`, and the native title outro starts at `118.00`.

Fix:

- end “I'll pass through as a wave of fire” at `116.00`;
- start the integrated title state at `116.05`;
- pre-roll the title's visual entrance so it is legible on that first repeat.

### P1 — one timing pair controls both the vocal and the animation envelope

`LyricDisplay` currently starts opacity, motion, and blur animation at `line.start`:

- opacity takes `0.32 s` to reach full strength;
- motion and blur take `0.50 s` to settle;
- the same `0.32 s` fade begins before `line.end`, so the final word loses opacity while it is still being performed.

This creates apparent lag even for correct timestamps and encourages extending line ends as compensation.

Fix: add separate `vocalStart`, `vocalEnd`, `visualInStart`, `visualInComplete`, `visualOutStart`, and `visualOutEnd` fields. Keep cue highlighting tied only to vocal time.

## Complete line audit

Delta is `current − recommended`. A positive value is late; a negative value is early.

| ID | Displayed English | Current | Recommended | Start / end delta | Status |
| --- | --- | ---: | ---: | ---: | --- |
| C1-01 | And I'll erase the horizon | `24.00–27.34` | `24.00–27.34` | `+0.00 / +0.00` | Pass; processed opening makes word-level confidence medium. |
| C1-02 | And split it in half | `27.34–30.09` | `27.34–30.36` | `+0.00 / −0.27` | Noticeable early handoff. |
| C1-03 | I'll fold the peaks of every mountain | `30.09–32.95` | `30.36–33.00` | `−0.27 / −0.05` | Starts early. |
| C1-04 | And raise the ocean | `32.95–36.51` | `33.00–36.05` | `−0.05 / +0.46` | Ends late. |
| C1-05 | I'll scream to the whole world | `36.51–40.20` | `36.05–40.20` | `+0.46 / +0.00` | Starts late. |
| C1-06 | Let the earth tremble | `40.27–43.00` | `40.27–43.00` | `+0.00 / +0.00` | Pass. |
| C1-07 | And through the walls of apartments | `43.05–46.37` | `43.05–46.37` | `+0.00 / +0.00` | Pass. |
| C1-08 | I'll pass through as a wave of fire | `46.37–50.00` | `46.37–50.00` | `+0.00 / +0.00` | Pass. |
| V1-01 | Night in the silence freezes helplessly; | `64.08–66.61` | `60.09–67.00` | `+3.99 / −0.39` | Major. |
| V1-02 | The sky sagged a silent ceiling | `66.61–70.00` | `67.05–70.00` | `−0.44 / +0.00` | Starts early. |
| V1-03 | I remember what happened and questions gnaw at me | `70.05–73.00` | `70.05–73.00` | `+0.00 / +0.00` | Pass. |
| V1-04 | Who am I? Where from? And where is my home? | `73.08–76.00` | `73.08–76.00` | `+0.00 / +0.00` | Timing passes; English needs revision. |
| V1-05 | My essence walked along the edge | `76.05–79.00` | `76.05–79.00` | `+0.00 / +0.00` | Pass. |
| V1-06 | My hands shook from the weight of years | `79.05–82.00` | `79.05–82.00` | `+0.00 / +0.00` | Pass. |
| V1-07 | Some spoke; others stayed silent | `82.06–86.00` | `82.06–86.00` | `+0.00 / +0.00` | Pass. |
| V1-08 | And someone behind my back couldn't hold back laughter | `86.05–90.20` | `86.05–90.20` | `+0.00 / +0.00` | Pass; retain a short gap before the chorus. |
| C2-01 | And I'll erase the horizon | `91.05–94.30` | `91.05–94.00` | `+0.00 / +0.30` | Ends late. |
| C2-02 | And split it in half | `94.30–97.00` | `94.05–96.00` | `+0.25 / +1.00` | Major end drift. |
| C2-03 | I'll fold the peaks of every mountain | `97.09–101.53` | `96.06–100.00` | `+1.03 / +1.53` | Major. |
| C2-04 | And raise the ocean | `101.53–104.00` | `100.06–104.00` | `+1.47 / +0.00` | Major onset drift. |
| C2-05 | I'll scream to the whole world | `104.00–107.00` | `104.05–106.20` | `−0.05 / +0.80` | Major end drift. |
| C2-06 | Let the earth tremble | `107.05–110.70` | `106.36–110.00` | `+0.69 / +0.70` | Noticeably late. |
| C2-07 | And through the walls of apartments | `110.70–114.25` | `110.05–112.88` | `+0.65 / +1.37` | Major end drift. |
| C2-08 | I'll pass through as a wave of fire | `114.25–118.00` | `112.88–116.00` | `+1.37 / +2.00` | Major; overlaps title loop. |
| OUTRO | Original-title state | starts `118.00` | starts `116.05` | `+1.95` | Major handoff delay. |

## Text and translation audit

Timing and translation should be approved separately. These are wording recommendations, not automatic replacements:

| Current English | Finding | Suggested review wording |
| --- | --- | --- |
| And split it in half | “Split” is acceptable, but the source verb is stronger. | “And break it in half.” |
| I'll fold the peaks of every mountain | The requested line is defensible and should remain unless the translator chooses a more literal verb. | Keep as requested. |
| Night in the silence freezes helplessly; | Matches the requested wording and the meaning of a powerless/listless freeze. | Keep as requested. |
| The sky sagged a silent ceiling | Missing the “as/like a ceiling” relationship; “mute” is closer than “silent.” | “The sky sagged like a mute ceiling.” |
| I remember what happened and questions gnaw at me | Semantically accurate; “what was” is more literal than “what happened.” | Current wording is acceptable. |
| Who am I? Where from? And where is my home? | “Where from?” is not natural standalone English. | “Who am I? Where am I from? And where is my home?” |
| My essence walked along the edge | Meaning is sound; “passed along” is slightly closer. | Current wording is acceptable. |
| I'll pass through as a wave of fire | Meaning is sound; “sweep through” carries more force. | Optional: “I'll sweep through as a wave of fire.” |

## Recommended vNext implementation order

1. Restore the earlier hand-aligned cue map listed in `tanisea-ksviety-remix.json`.
2. End the break card at `60.00` and restore V1-01/V1-02.
3. End C2-08 at `116.00` and move the native title outro to `116.05`.
4. Refactor line data to separate vocal and visual windows.
5. Make lyric entrances complete before vocal onset and exits begin after vocal end.
6. Obtain human approval for the two English wording changes marked above.
7. Render short previews for `23–41`, `58–71`, `89–120`, and `149–153`.
8. Conduct a full real-time listening pass before the production render.
9. Render the entire film from source, remux the original AAC, and repeat frame/audio integrity QA.

## What worked and should remain

- rebuilding from the original Remotion source rather than patching an encoded MP4;
- retaining the same artwork, particles, halo, equalizer, frame chrome, and colour system in the outro;
- replacing unreliable late-loop lyric animation with the original Russian song title;
- deterministic source animation and full-length regeneration;
- compact HEVC delivery with `hvc1`, `faststart`, and bit-identical original AAC audio;
- full-frame decode and checksum verification of the delivered master.
