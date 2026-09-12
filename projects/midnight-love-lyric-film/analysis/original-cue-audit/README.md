# Original 32-cue timing audit

The audit recommends **one material onset correction and one focus-group correction**. The remaining original lyric lines should retain their acoustic timing. The omitted closing refrain is handled separately by the tail audit.

The original production `src/cues.json` was read only. Its SHA-256 is `ec01e2cc3f5131165dbbe1b0c635bd4fc1bd478e7070e43b1aea31e7a06c6462`. Proposed edits, their exact 48 kHz samples, and validation are in [proposed-corrections.json](proposed-corrections.json).

## Integration status in v1.1.0

The three approved cue revisions are integrated into the current production: L07 retains the 35.432 s “But” onset, ends it at 35.72 s and groups “I always”; L18 restores the “die” release to 80.20 s; L19 starts “Able” at 80.735 s. L06 remains unchanged. The rejected 36.21 s “But” proposal was not adopted. All other original cue words and acoustic intervals remain as before; the separate [tail correction](../tail-correction/README.md) adds six closing cues for **38 cues, 185 words and 161 groups** in total.

The implementation retains the existing presentation-time calculations. It does **not** adopt the new frame-domain presentation API considered below. The existing logic was checked for all **161 first-focus contacts**, recorded in [timing-checks.json](../../evidence/timing-checks.json). The first integration plan expanded the proposed windows to **33–39 s**, **77–84 s**, and **150 s through the end**. The final cinematic revision instead reconstructs the complete opaque lyric viewport on every frame, removing active-word underlines throughout the recording while retaining the surrounding lossless pixels. The closing title returns **after 188 s**, following the selected final held-vocal end at **185.4 s**, with no audio retiming.

The recommendations and experiments below remain as investigation history. Source integration, rendering and delivery QA are complete; see the [final verification](../../evidence/final-verification.md) for hashes and review limits.

## Recommended changes

| Cue | Delivered behavior | Proposed behavior | Evidence |
|---|---|---|---|
| L07, “But” | The word holds through 36.338 s, while the shared But/I group lights I at 35.432 s—about one second before its selected contact. | Keep the 35.432 s onset, end But at **35.720 s**, then group I with always. Preserve I at 36.439 s and subsequent word contacts. | Independent English CTC ends But at 35.714 s; blind full-mix transcription ends it at 35.720 s. The stem envelope decays before the later I/always contact. |
| L18, “die” | Ends at 80.100 s because the next cue was incorrectly early. | Restore its original vocal-MMS release at **80.200 s**. | Removes the old overlap clamp; this is a release estimate within the visible decay. |
| L19, “Able” | Starts at 80.100 s during the previous word’s decay. | Start at **80.735 s** (sample **3,875,280**), retaining the existing 81.0648 s word end. | A distinct new stem attack near 80.735 s; original vocal/mix MMS at 80.744/80.764 s; narrow-window vocal/mix MMS both at 80.754 s. |

L07’s proposed groups are `[[0],[1,2],[3],[4]]`, replacing `[[0,1],[2],[3],[4]]`. L06 remains acoustically unchanged. The new frame-domain presentation logic should independently fix the first-frame visibility issue at contiguous handoffs.

Safe local replacement windows are **34.0–38.2 s** (frames 2040–2291) and **78.0–82.8 s** (frames 4680–4967), both at 60 fps. These include neighboring presentation states, rather than only the changed source-word intervals. The final compositing and decoded-frame checks must confirm continuity at both ends.

## Evidence and checks

- [comparison.txt](comparison.txt) and [comparison.json](comparison.json) compare all **151 words / 32 original cues** against existing vocal MMS, mix MMS, independent English CTC, and bounded attention candidates. 124 delivered starts are within 80 ms of both MMS candidates; 108 are within 120 ms of all three acoustic encoder candidates. These are **agreement measures, not measured acoustic accuracy**.
- [waveforms-1.png](waveforms-1.png) and [waveforms-2.png](waveforms-2.png) show isolated vocal RMS in 5 ms hops. Both pages were visually reviewed. PCM was interpreted at its actual **16 kHz** rate; duration was checked against the locked source.
- [recheck-windows.json](recheck-windows.json) defines the small independent rechecks. The four `recheck-{mms,english}-{vocals16,audio16}.json` files retain every candidate and model score.
- [blind-full-mix-transcription.json](blind-full-mix-transcription.json) was produced without supplying the lyric text. Before 150 s it finds the same substantive verses and choruses, plus nonlexical/ad-lib “Oh” tokens, occasional light/night or your/you’re misrecognition, and a duplicated recognition of part of the silver/gold phrase. **It provides no evidence for an additional omitted pre-150 s verse.** It is not a proof that every vocal sound has a lyric cue.
- The blind ASR itself absorbs long gaps into short words, including the initial I and the I preceding the closing verse. Its sparse final output also cannot replace the dedicated tail audit. No ASR gap is treated as proof of an instrumental passage.
- Proposed source intervals remain positive and ordered, cue overlaps are absent, all 151 supplied words remain unchanged, and focus groups still cover every word exactly once.

## Rejected experiment

A restricted L07 window beginning after 35.7 s forced But onto a later contact around 36.21 s. This was **rejected**: clipping away the earlier word reduced vocal/mix MMS scores from about 0.24/0.21 to 0.002–0.018. Blind transcription and the existing independent encoder retain the earlier 35.43–35.72 s word. Agreement between models after excluding the real word is not sufficient evidence to move it.

The L19 recheck behaves differently: its MMS confidence remains consistent with the original observation (vocal ~0.31, mix ~0.51), the actual onset is inside the window rather than on its boundary, and the waveform has a separate attack. The early English-encoder start at 80.081 s was the outlier.

## Retained uncertainty

L11 and L25 In/this remain low-confidence boundaries under a dense instrumental mix; their connected focus groups are appropriate. L08 it/all also remains grouped, protecting an ambiguous stretched/echoed transition. L13/L27 light and several short function words have tens-of-milliseconds onset disagreement; this audit does not introduce small unsupported shifts. Held vowel and reverb releases remain estimates. The earlier L14 repair is supported by the retained mix/English candidates and should remain intact.

This audit uses model evidence and visible waveforms. It does **not** claim human listening, native-listener approval, perfect synchronization, or a calibrated millisecond error bound.
