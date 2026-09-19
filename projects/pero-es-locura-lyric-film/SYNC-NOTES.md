# Timing, wording and review scope

## Revision 3 scope

The current preview pairs complete Spanish and English focus, including te quiero / I love you, while preserving every acoustic timestamp and displayed word. [The paired-focus audit](PAIRED-FOCUS-V3.md) separates acoustic source events, lexical correspondence and bilingual display groups. The corrected presentation is approved for production. Original listening evidence is retained for identical source audio and acoustic events; current display acceptance and technical checks are recorded separately.

## Performed order

The supplied text is a reference, not a time grid. Full-track recognizers collapse repeats, so bounded mixture/vocal transcripts were compared with independently aligned windows. Original text and the later expanded reference remain separate from the normalized performed sequence. Copied website controls and recommendation links are excluded.

| Recording region | Treatment |
| --- | --- |
| Opening through about 00:39 | Four complete love-refrain pairs, then four heart-refrain pairs |
| About 00:39–00:57 | Nonlexical singing; no invented words |
| About 00:58–01:16 | Four returning refrains; last second line stops at “muchacho” |
| About 01:16–01:39 | Nonlexical singing / accompaniment |
| About 01:40–02:11 | First verse |
| About 02:12–02:30 | Four middle refrains; last shortened |
| About 02:31–02:54 | Nonlexical singing / accompaniment |
| About 02:54–03:27 | Second verse, including three “mucho” repetitions |
| About 03:27–03:45 | Four final love refrains; last shortened |
| About 03:46–04:04 | Four heart-refrain pairs |
| About 04:04–04:27 | Closing distance verse and sustained “aún” |
| Following vocal tail | Nonlexical vocalization is not labelled instrumental silence |
| About 04:49–04:50 | “Esto se acabó” / “This is over,” supported by bounded recognition and included in completed listening review |
| Through 04:54.104 | Preserve the complete source ending and original production credit |

These rounded regions summarize the performed inventory. Exact selected sample boundaries are in `src/cues.json`; every raw alternative and selection reason is in `analysis/boundary-ledger.json`.

## Acoustic evidence

Three observations inform each source word: multilingual MMS forced alignment on the full mixture, MMS on Demucs-isolated vocals, and stable Whisper small alignment on the mixture. They are not three independent human reviews. Bounded Whisper transcriptions help check repetition and wording; recognizers can omit, merge or hallucinate syllables.

The selection script prefers corroborated onsets, rejects crop-edge-pinned Whisper candidates and documents detached low-confidence final-character tails. Two examples are `rodillas` and `millas`, where a late /s/ alignment would carry emphasis into the following phrase. The long closing `aún` has a vowel onset around 04:21.12; a forced aligner attached its onset to a much later consonant. The selected earlier onset retains the sustained vowel and is included in the completed human listening review.

548 of 586 words have candidate spreads greater than 25 ms. This count includes disagreements caused by alignment-window edges and rejected outliers; it is not an error estimate. The original model records retain **all words as review-required**; their flags describe model uncertainty and are not rewritten as automated listening evidence. Human completion is recorded separately. Waveform/spectrogram evidence is available in the preview. A 60 fps overlay introduces at most half a frame of quantization; that bound does not describe model or hardware latency.

## Meaning and capitalization

The source keeps `mi costado` as supplied and supported by recognition, even though the image is unusual. `Al lado` becomes “close by,” without adding an unstated object. Rioplatense `vos` and verb forms are preserved. The distance fragment becomes “Despite millions of miles,” retaining the concession without inventing a subject or action.

Each target token names source IDs. Spanish word order is allowed to differ from English: `muchacho dorado` focuses “boy” and “golden” at their own source events. `No` owns “don't,” and `quiero` owns “I want” in the corresponding negative construction. Lexical correspondence remains separate from revision 3 paired display groups. Both sides of each selected complete phrase use the union of their documented source events without bridging gaps or unrelated words. The semantic ledger records both lexical intervals and display-focus intervals.

Capitalization belongs to displayed cue text, not the recognizer. Capitalize the first letter of each cue in both languages; preserve internal grammar, diacritics and first-person English “I.” A wrapped continuation is not a new sentence. Capitalization edits do not shift boundaries or create new acoustic evidence.

## Historical v1 review and production authorization

The project owner explicitly attested to reviewing the complete actual-audio preview, uncertain events at reduced speed and both delivery layouts, then authorized production of the same frozen revision. The original gate passed for v1 without an exception. The current record retains that acoustic review for unchanged events and separately binds approval to the corrected paired presentation. Per-cue completion records identify this attestation as their basis; they do not claim observed playback telemetry or machine listening. The original pending review snapshot remains in `evidence/history/`.

Automated color, geometry and final-file checks supplement human review. They establish agreement with the approved timing map and unchanged source audio, not independent acoustic ground truth. See the [completed review](evidence/history/delivery-v1/cross-language-sync-review.json), [production authorization](evidence/history/delivery-v1/render-authorization.json) and [production method](PRODUCTION-NOTES.md).
