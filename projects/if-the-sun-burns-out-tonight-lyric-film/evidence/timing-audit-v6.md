# Timing audit — preview v6

## Finding and status

The prior map passed structural checks while still carrying serious acoustic errors. This revision replaces the old small-model timing shape with independent, transcript-conditioned alignment observations. It remains **provisional**; improved model agreement does not establish the requested perfect listening sync. The actual source recording and picture/audio clock are unchanged.

All **44 lines / 254 words** remain separate. **242 word onsets** changed by more than 50 ms. No selected word window is shorter than 100 ms, no words overlap within a line, and all releases are exclusive. Sample indices encode selected estimates at 44.1 kHz; their existence does not imply sample-accurate phonetic boundaries.

## Evidence collected

1. Local HTDemucs extraction of the source vocals, with no shift augmentation and 25% overlap; used only for analysis.
2. MMS_FA transcript-conditioned character alignment on the original mix and on isolated vocals. These two passes are the same model on two inputs, not two independent models.
3. English wav2vec2 base-960h transcript-conditioned CTC on the original mix and on isolated vocals. The isolated-vocal pass includes explicit word separators; the first mix pass is retained as a diagnostic observation.
4. Independent stable-whisper **large-v3-turbo** transcript-conditioned `align_words` over broad line windows derived from the unforced transcript, not the old truncated word spans.
5. Unforced large-v3-turbo checks over the opening and processed tail, plus a visual inspection of the opening isolated-vocal spectrogram.

The complete per-word observations, model path scores, selected samples, previous values, selection method, uncertainty, and model hashes are in [alignment-v6.json](alignment-v6.json). Scores from different model families are not calibrated or interchangeable accuracy probabilities.

## Concrete corrections

| Word or line | Previous candidate | New candidate | Evidence |
| --- | --- | --- | --- |
| Opening hook | Copied later-hook shape, 26.910–30.840 | Own performance, 26.905–29.560 | Voiced harmonic energy and unforced recognition establish a real phrase here; exact wording is still misheard by the model. |
| “I wonder…” | Whole line 30.840–32.940 | 30.700–34.855 | Old line was compressed by roughly two seconds. CTC + large Whisper independently place “tonight” near34.03. |
| “tonight” in that line |31.910–32.940|34.032–34.855|MMS starts34.032, English CTC34.073; selected release avoids MMS spill into following line.|
| “Would” |36.950–36.980|35.861–36.182|MMS/wav2vec onset35.861; large Whisper35.860. The 30 ms old event was invalid.|
| “barely” |55.170–55.230|54.465–55.049|Both CTC families start54.465; large Whisper54.460.|
| “getting” |60.070–60.420|59.244–59.827|Both CTC families start59.244; large Whisper collapses this word, so it is explicitly rejected here.|
| First “Now the void…” |90.030–93.270|88.950–92.720|Independent models place the opening near88.92–88.98.|
| “Please drag me out” |175.390–177.620|174.452–176.560|CTC starts174.442/174.462; large Whisper confirms the phrase earlier than the old map.|

## Selection policy and remaining uncertainty

Use phonetic onset agreement when the CTC models agree and have plausible path scores; retain the large Whisper candidate when CTC drifts into the next word or line. Explicit per-word exceptions are documented. Do not average known failures: for example, the first “All I need is you” CTC passes put “is you” into the next hook, and the first “every day” drifts towards the next line. Large Whisper provides a coherent alternative in those passages.

The processed opening is **performed**. Unforced recognition produces “Is the sun going down tonight?” and the spectrogram shows voiced harmonics in the same region. This supports phrase presence, but does not certify the distorted words; the supplied wording is preserved. The two final processed hooks are also misrecognized, so their exact word boundaries were included in the targeted review described below.

All candidate disagreements over 25 ms are retained, including release disagreements. The following acoustic regions remain in the record. The requested processed opening, short chorus words in both choruses and final hooks were accepted in targeted listening; separate reduced-speed review of the other listed ranges has not been established:

- **26.9–29.6:** heavily processed opening hook, especially the first attack and `burns / out / tonight`.
- **71.9–74.5 and129.4–131.8:** `All I need is you`; CTC pronouns drift into the next hook.
- **79–83.8 and136.5–141.3:** long `Supernova` and short following pronouns.
- **93.8–97.3:** first `louder / every / day`; CTC drift is explicitly rejected.
- **100.4–103.0 and158.0–160.7:** connected short words after `darkness`.
- **103.8–107.4,113.4–117.4,199.6–203.3:** hook releases separate vocal cores from long effects tails imperfectly.
- **209.5–212.3 and219.2–222.6:** processed final hooks; unforced text differs and CTC confidence is low.

Word focus remains individual. For connected singing, selected releases may hand off at the next independently selected onset, while all raw acoustic-end observations remain recorded. This prevents a CTC character spike from becoming a 20 ms word flash, but does not turn display handoffs into independently certified vocal endpoints. There is no forced global minimum-duration padding.

## Review boundary

No production render was made. Targeted listening of the requested uncertain passages has been accepted by the reviewer; the exact playback rate was not separately recorded. This does not establish a complete full-recording or both-layout listening review, and does not authorize production rendering. Original candidate uncertainty is preserved. The v5 timeline is preserved as [timeline-v5.json](timeline-v5.json) for exact before/after audit.

## Final-hook sample refinement

A later independent audio comparison found actual repeated/sample-derived waveform content between the last two hooks. The isolated-vocal whole-phrase correlation is **0.726** at exactly **+9.600000 s**. After250–3500 Hz filtering, local `sun / burns / out / tonight` slices correlate0.839/0.779/0.805/0.704, all at the same exact shift. First-word and `the` slices also peak at+9.6s, with weaker0.520/0.324 correlation. This supports a shared relative timeline; it does not validate the absolute phonetic anchors.

The final hook now uses corresponding L43 boundaries+9.6s. Its `sun` starts **219.420** instead of219.800; `the` starts **219.240** instead of219.442. All six source observations, former selections and uncertainty remain intact under each word’s `refinement` record. The selected final sung-core release is now **221.900**; effects may continue beyond it. No invented minimum-duration padding was added.

A prior hook near113s independently correlates with the first final hook at+96s; selected `sun` and `burns` anchors already agree within18ms and2ms, so the first final hook was retained. Opening slices also peak at+182.4s relative to the first final hook, but correlations are much weaker; spectral DTW suggests a20ms median/50ms90th-percentile local warp. This corroborates performed/shared material without justifying an opening timing change. See [repeat-correlation-v6.json](repeat-correlation-v6.json) for search ranges, scores, methods, before/after values and limits.

## Targeted listening acceptance

The reviewer manually checked the requested preview passages and accepted their timing. This is recorded as targeted listening evidence in [review-status-v6.json](review-status-v6.json), without changing any selected word interval or suppressing prior acoustic uncertainty. It does not imply a complete full-recording review, a separately recorded playback rate, both-layout listening, or render approval. Subsequent solar-fire visuals remain a separate preview refinement.
