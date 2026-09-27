# Word-onset review — Must Have Been A Dream

## Current scope

The revised preview uses the exact original video and soundtrack identified in [asset provenance](ASSET-PROVENANCE.md). Its [timeline](public/timeline.json) contains 26 sung cues and 156 individual English word events. The [structured refinement](source/onset-refinement.json) records 34 changed word starts, with old and new source-clock times. The project owner subsequently reviewed this revised full-song preview, including the closing phrase at 2:36–2:41, uncertain events at reduced speed and both 16:9 and 9:16 presentations, and approved rendering this revision. Both full-length films were then encoded and independently checked; [final verification](evidence/final-verification.json) records the resulting files. The approval and encoded-file verification remain separate kinds of evidence.

This record does not assert that automated alignment establishes the exact audible onset of every consonant. The complete-preview listening judgment and the reproducible signal/model checks are separate kinds of evidence.

## Clock and display behavior

`public/source.mp4` supplies one synchronized media clock. The browser draws the decoded picture at `requestVideoFrameCallback`'s `metadata.mediaTime`, and [the scene](src/scene.ts) gives a word its bright focus only when `time >= word.start && time < word.end`. There is no intentional bright-focus lead or global offset. A subdued whole line can appear shortly before its first active word so the reader has context; this is separate from highlighting.

The original picture runs at `24000/1001` frames per second, about 41.71 ms per frame. A continuous onset timestamp becomes visible on the first decoded frame at or after that timestamp, so a frame-based preview cannot display a brighter word at arbitrary subframe precision. The same source-clock map drives both aspect ratios; crop and lyric placement do not shift a word's timestamp. The audio has a short tail beyond the last picture frame, but that does not justify moving any sung onset.

## Alignment and local corrections

The initial map used bounded Whisper small and large-v3-turbo alignment candidates. The subsequent audit compared **every one of the 156 words** against exact-source mix crops, an independently aligned MMS path, an English wav2vec2 CTC path, and a Demucs-separated vocal-stem MMS pass. Mix and stem passes of MMS are observations from the *same model family*, not independent votes. The stem was checked against the original waveform clock before use. The [candidate audit](source/onset-audit-candidates.json) is explicitly anchored to the earlier timeline SHA-256; its `previewStart` values are historical, not the revised values. The [refinement file](source/onset-refinement.json) is the direct old/new ledger.

The strongest discrepancies occurred at **local line entrances**, not as a uniform soundtrack delay. Representative shifts in seconds on the original video clock:

| Cue and word | Earlier start | Revised start | Reason for focused review |
| --- | ---: | ---: | --- |
| L07 “Once” | 62.10 | 62.88 | First sung word after a gap |
| L08 “Mr.” | 76.38 | 77.45 | Early entrance in the first refrain |
| L09 “It's” | 87.48 | 88.80 | Initial highlight preceded the candidate vocal entrance |
| L10 “Running” | 99.37 | 100.80 | Large onset spread across candidate methods |
| L14 “for” | 112.36 | 112.06 | Former allocation lasted only about 20 ms |
| L18 “Just” | 125.54 | 126.06 | Later local vocal entrance |
| L26 “It's” | 155.30 | 156.56 | Closing repeat enters after a source-picture blackout |

Some inner-word boundaries also moved in either direction to keep each spoken word's own focus interval legible. Examples include “coming” in L07, “why'd” in L08, “idea” in L09, “be” in L18 and “Know-It-All” in L25. The detailed 34-event ledger should be used instead of extrapolating any example's shift to neighboring cues. The closing L26 map retains its conservative `to` boundary after the user-reviewed preview; a low-confidence forced-path discrepancy alone did not justify changing it.

Forced alignment can place a required word even if its sound is masked. The wav2vec2 greedy transcript was poor on this music mix, so its forced timestamps are weak independent evidence. Demucs may suppress low consonants or backing voices. Long vowels, stylized attacks and compounds also make a single acoustic start debatable. These limitations are why the model comparison produced **candidate corrections** for review rather than a mechanical rewrite or a claim of perfect phonetic ground truth.

## Reusable review rule

For a future source-video lyric film, first verify that decoded picture and audio share the original media clock. Then compare every word, paying special attention to first words after gaps, repeated sections, compressed function words and held endings. Keep the dim line's pre-appearance separate from bright sung-word focus. Repair local boundaries with evidence; do not apply a global offset to solve local errors. Test the same map in full moving previews at normal and reduced speed in every delivery format, then bind production approval to that reviewed input revision. A passing interval test, model score or screenshot only checks part of this chain.
