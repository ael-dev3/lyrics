# Let You Down — timing method

**Status: not yet aligned.** The alignment chain below is implemented and was exercised end to end on a synthetic placeholder text (mechanics only). It runs on the real text once `source/lyrics.local.txt` exists. Until then `public/timeline.json` does not exist and the preview shows no lyrics.

## Clock

The original AAC soundtrack is the only clock. Picture frame *n* is presented at `n × 1001/24000` s. Word intervals are start-inclusive and end-exclusive on the 44.1 kHz sample grid (`startSample`, `endSample`). The 60 fps film paints output frame *m* at exactly `m/60` s, using the latest source picture with PTS ≤ `m/60`. No global offset, stretch or beat snapping exists anywhere in the chain.

## Measured vocal activity (available now)

The HTDemucs vocal stem ([analysis/separate_stems.py](analysis/separate_stems.py), [analysis/stem-estimate.json](analysis/stem-estimate.json)) shows the following sections in [evidence/audio-features-audit.json](evidence/audio-features-audit.json):

- Digital silence under the opening logo (0–3.6 s).
- An instrumental intro to about 36.8 s.
- Vocals from about 36.8 s to 108 s.
- An instrumental drop from about 108 s to 123 s.
- Vocals again to about 232 s.
- The finale, logos and silent credits after that.

These spans set provisional section tiers before timing exists. They never assign a word time.

## Observation sets (per word, IDs only)

[analysis/align_candidates.py](analysis/align_candidates.py) writes `analysis/word-candidates.json`:

| Key | Model | Signal |
| --- | --- | --- |
| `global_mms` | torchaudio MMS_FA, whole song in text order | vocal stem; used only to place line windows |
| `mms_stem`, `mms_mix` | MMS_FA forced alignment per line window | stem and mix |
| `w2v_stem`, `w2v_mix` | English wav2vec2 LV60K-960h CTC | stem and mix |
| `whisper_stem` | faster-whisper large-v3 via stable-ts `align()` per line window | stem |

**Independence is limited and recorded as such.** Stem and mix passes of one model are one model looking at two signals. MMS and English wav2vec2 are both wav2vec2 family (different training and vocabulary). Whisper is the only different family.

Lead and parenthesised backing words are aligned as separate sequences in the same window, because they can overlap.

An unforced Whisper large-v3 pass over the stem and a vocal-energy scan (≥ −38 dBFS for ≥ 0.15 s, more than 0.30 s from any supplied word) list vocal activity that no supplied word covers. Both record times, probabilities and character counts only.

## Selection rules

[analysis/select_timing.py](analysis/select_timing.py) writes `analysis/timing-selection.json`, logging the basis for every word:

1. **Start from `mms_stem`** when any other observation lies within 70 ms (`mms-stem-corroborated`). Otherwise use `w2v_stem` when `w2v_mix` or `whisper_stem` agrees within 70 ms. Otherwise take the median of all starts and flag the word for priority review. The earliest candidate is never chosen automatically.
2. **Silence guard.** A start that sits in stem silence (< −40 dBFS for 80 ms) while energy rises within 250 ms moves to that rise (`+energy-onset`).
3. **Lanes.** Words stay ordered within each lane. A word's end is clipped to the next word's start, and gaps under 60 ms join (connected singing).
4. **Held endings.** A lane-final word extends while the stem stays within 20 dB of the word's peak, up to 1.6 s and never past the next line's first onset − 80 ms (`releaseExtendedMs`).
5. **Priority review** when starts spread > 150 ms, when no rule-1 corroboration exists, or when a word is shorter than 70 ms.

[scripts/build-timeline.ts](scripts/build-timeline.ts) then writes `public/timeline.json`. It contains IDs, sample-grid times, basis, spread, review flag, section and effect tags, and each word's character count; it never contains the text. `npm run check` confirms the local text binds to every timed word, that the effect tags agree with the text, and that no committed data file contains lyric words.

## Review priorities for the listening pass

Once aligned, listen to the complete preview at 1×, then at 0.5×, in both formats. Pay particular attention to:

- line entrances after long gaps (the first line near 37 s, the first line after the drop near 123 s);
- every chorus repeat, each aligned independently (three choruses);
- the outro's overlapping lead/backing phrases, including the fully parenthesised line;
- the held final words of each chorus (release extension);
- every priority-flagged word, listed with a dashed border in the preview's word panel;
- uncovered vocal spans reported in `word-candidates.json`.

Model agreement and passing tests are evidence, not a listening review; record the review scope honestly in `evidence/sync-review.json`.
