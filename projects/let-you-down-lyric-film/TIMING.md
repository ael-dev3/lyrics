# Let You Down — timing method

**Status: aligned in `preview-v1`; `preview-v2` and `preview-v3` carry the same timing unchanged. Production is authorized as a scoped owner-approved preview, so the priority words below were not individually audited.**

- All 217 supplied words across 40 lines have word-level timing. 198 are supported by a second, different model, and 19 rely on a median.
- 71 words in 29 lines are flagged for priority listening.
- The flags concentrate at line entrances and in the outro (3:14–3:52). There, lead and backing phrases overlap in long melismas, and recognition is weakest.
- Nothing here is a listening review.

## Clock

The original AAC soundtrack is the only clock. Picture frame *n* is presented at `n × 1001/24000` s. Word intervals are start-inclusive and end-exclusive on the 44.1 kHz sample grid (`startSample`, `endSample`). The 60 fps film paints output frame *m* at exactly `m/60` s, using the latest source picture with PTS ≤ `m/60`. No global offset, stretch or beat snapping exists anywhere in the chain.

## Vocal activity

The HTDemucs vocal stem ([analysis/separate_stems.py](analysis/separate_stems.py), [analysis/stem-estimate.json](analysis/stem-estimate.json)) shows these spans:

- Vocals begin with a sharp rise at 38.8 s.
- They drop out for the instrumental break between 106.8 s and 126.1 s.
- The sung region ends at 234.3 s, the start of a silent gap of more than 10 s that runs to the logo sound effect.

## Observation sets (per word, IDs only)

[analysis/align_candidates.py](analysis/align_candidates.py) writes [analysis/word-candidates.json](analysis/word-candidates.json):

| Key | Model | Signal |
| --- | --- | --- |
| `whisper_unforced` | faster-whisper large-v3, one unforced pass over the stem, matched to the supplied word sequence **in memory** | stem |
| `global_mms` / `segment_mms` | torchaudio MMS_FA, whole song in text order / re-aligned runs | stem |
| `mms_stem`, `mms_mix` | MMS_FA forced alignment of each line in its window | stem and mix |
| `w2v_stem`, `w2v_mix` | English wav2vec2 LV60K-960h CTC | stem and mix |
| `whisper_stem` | Whisper large-v3 `align()` via stable-ts in each line window | stem |

**Independence is limited and recorded as such.** Stem and mix passes of one model are one model looking at two signals. MMS and English wav2vec2 are both wav2vec2 family (different training and vocabulary). Whisper is the only different family.

### Line windows

- **What went wrong first.** The first attempt, a whole-song MMS pass, placed lines 1–29 well but collapsed after 3:02. It stretched lines 30–33 over tens of seconds and pushed the outro into the silent credits.
- **Whisper anchors.** Whisper's unforced pass (189 of 217 words matched to the text in memory) gave an independent line order, used as anchors. They start early at entrances after gaps: 0.8–1.5 s before the vocal rise at 38.8 s and 126.1 s.
- **Lines 1–27 and 29.** Windows come from the whole-song pass, which agrees with the anchors there (within 2.5 s, plausible duration).
- **Lines 28, 30–33, 36–38 and 40.** Whisper recognized at least half of each line's words (at least 2), so these lines are pinned to their anchor.
- **Lines 34–35 and 39.** These were weakly recognized and are re-aligned as runs between the pins.
- **Lane order.** Each line's lead and backing words are aligned as one sequence in text order. Aligning the lanes independently placed an echo on the previous line's rhyme.

## Selection rules

[analysis/select_timing.py](analysis/select_timing.py) writes [analysis/timing-selection.json](analysis/timing-selection.json), logging the basis for every word:

1. **Cross-model agreement.** Of the CTC starts, take the one supported by the most other models: the other CTC model within 70 ms and/or Whisper within 120 ms. Ties prefer stem over mix and MMS over wav2vec2. With no cross-model support, take the median of the CTC starts and flag the word. The earliest candidate is never chosen automatically.
2. **Silence guard.** A start in stem silence (< −40 dBFS) moves to the rise within 250 ms.
3. **Entrance fixes (line-first words):**
   - A first word whose interval spans a breath dip (< −30 dBFS for ≥ 150 ms in its first half) starts at the rise after the dip. This happened once: line 30, moved 2.63 s from the previous line's held note to its own entrance.
   - A first word that is a short blip before a long voiced gap moves to the rise inside that gap. This happened 3 times, including the outro's first "oh" at 3:14.87.
4. **Held vowels.** A voiced gap (stem above −32 dBFS for ≥ 80 % of it, up to 2.5 s) joins a word to the next (134 words). Lane-final words hold while the stem stays within 20 dB of their peak (36 words, median +0.5 s), never past the next line's first onset − 80 ms.
5. **Priority review** when the CTC starts spread > 120 ms, when no cross-model support exists, when a word is shorter than 70 ms, or when rule 3 or a voiced gap of more than 0.6 s moved it.

[scripts/build-timeline.ts](scripts/build-timeline.ts) applies reviewed repairs from `analysis/timing-overrides.json` (a ledger, per word, each with a reason and source) and writes [public/timeline.json](public/timeline.json). It holds IDs, sample-grid times, basis, spread, review flag, section and effect tags, and character counts; never text. `npm run check` confirms three things: the local text binds to every timed word, the effect tags match the text, and no committed data file contains lyric words.

## Listening review

The preview marks every priority word with a dashed border in the word panel, and every priority line with ⚑ in the line list. Listen to the complete film at 1× in both formats, then to the flagged lines at 0.5×. Pay particular attention to:

- line entrances after gaps: 0:38.8 and 2:06.2, and line 30 after its breath at 3:02.8;
- the three choruses, each timed independently;
- the outro (3:14.9–3:52), where the backing echoes can overlap the lead. Word order is kept, but overlap is not represented;
- the final held note (3:48–3:52).

Record corrections as timestamps in the preview's notes. They become ledger entries in `analysis/timing-overrides.json`, followed by a new `--revision` and a fresh review of what changed. Model agreement and passing tests are evidence, not a listening review.
