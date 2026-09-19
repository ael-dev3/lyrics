# Timing, wording and review scope

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
| About 04:49–04:50 | “Esto se acabó” / “This is over,” supported by bounded recognition; listening review pending |
| Through 04:54.104 | Preserve the complete source ending and original production credit |

These rounded regions summarize the candidate inventory. Exact selected sample boundaries are in `src/cues.json`; every raw alternative and selection reason is in `analysis/boundary-ledger.json`.

## Acoustic evidence

Three observations inform each source word: multilingual MMS forced alignment on the full mixture, MMS on Demucs-isolated vocals, and stable Whisper small alignment on the mixture. They are not three independent human reviews. Bounded Whisper transcriptions help check repetition and wording; recognizers can omit, merge or hallucinate syllables.

The selection script prefers corroborated onsets, rejects crop-edge-pinned Whisper candidates and documents detached low-confidence final-character tails. Two examples are `rodillas` and `millas`, where a late /s/ alignment would carry emphasis into the following phrase. The long closing `aún` has a vowel onset around 04:21.12; a forced aligner attached its onset to a much later consonant. The selected earlier onset retains the sustained vowel and still needs listening confirmation.

548 of 586 words have candidate spreads greater than 25 ms. This count includes disagreements caused by alignment-window edges and rejected outliers; it is not an error estimate. **All words remain review-required.** Waveform/spectrogram evidence is available in the preview. A 60 fps overlay introduces at most half a frame of quantization; that bound does not describe model or hardware latency.

## Meaning and capitalization

The source keeps `mi costado` as supplied and supported by recognition, even though the image is unusual. `Al lado` becomes “close by,” without adding an unstated object. Rioplatense `vos` and verb forms are preserved. The distance fragment becomes “Despite millions of miles,” retaining the concession without inventing a subject or action.

Each target token names source IDs. Spanish word order is allowed to differ from English: `muchacho dorado` focuses “boy” and “golden” at their own source events. `No` owns “don't,” and `quiero` owns “I want” in the corresponding negative construction. Expansions share an acoustic interval only where they express one source event or documented irreducible construction. The semantic ledger records the complete interval union for every English token.

Capitalization belongs to displayed cue text, not the recognizer. Capitalize the first letter of each cue in both languages; preserve internal grammar, diacritics and first-person English “I.” A wrapped continuation is not a new sentence. Capitalization edits do not shift boundaries or create new acoustic evidence.

## Production remains closed

The frozen review record has all listening and approval flags unset. Automated color, geometry and playback checks cannot set them. Review the actual recording, meaning and full highlight spans in both formats, then obtain explicit render approval for the same revision before implementing or starting production. No previous song's acceptance grants an exception here.
