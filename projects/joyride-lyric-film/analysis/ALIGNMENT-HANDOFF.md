# Joyride alignment methods and selected cues

The initial analysis checkpoint has been completed. The production sequence contains **395 supplied words, 44 original lines, 70 display cues and 323 focus groups**. Selected intervals are integer samples at 48 kHz. The full decision record is [alignment-decisions.json](alignment-decisions.json); [build-cues.ts](../scripts/build-cues.ts) reproduces it.

## Evidence and selection

- `full-vocals16.json` and `bounded-vocals16.json`: full-text and phrase-bounded Whisper large-v3-turbo attention observations.
- `mms-vocals16.json` and `mms-audio16.json`: independent phrase-wise MMS-FA paths on the stem and full mix.
- `wav2vec-vocals16.json`: phrase-wise English CTC encoder observations.
- `candidate-comparison.json`: word candidates side by side. The vocal MMS path is the starting candidate, with explicit reviewed exceptions; there is no unreviewed median selection.
- `vocal-rms-5ms.json` and `../evidence/vocal-onsets-{1,2,3,4}.svg/.png`: all four energy panels were visually inspected to resolve phrase attacks. These are waveform observations, not a human listening review.
- `repeated-vocal-correlation.json`: chorus matches at approximately 45.18 and 90.35 seconds have only 0.136–0.417 normalized correlation. No word timings are transferred between choruses.

There are 112 recorded per-token adjustments, with reasons and original model candidates preserved. Leading `I` / `I'll` tokens are frequently forced into the preceding held vowel by CTC; attention alignment can instead absorb an entire gap. Selected first attacks include 12.44, 15.41, 21.07 and 32.36 seconds. L11 `like that` uses the supported mix/English path near 42.43 seconds rather than the anomalous vocal CTC path. L22/L42 `But girl` starts are reconciled with the English encoder and energy rise instead of overlapping the previous held `guarantee`.

Connected short tokens, including initial contractions and prepositions, are explicitly grouped. Internal short-token splits within one focus group are representational; they do not establish independently resolved acoustic contacts. Held vowels use the bounded attention endpoint where supported, with limits and overlap trims documented. The last selected endpoint is 6,023,007 samples / 125.4793125 seconds.

## Display planning

The 44-line supplied reference remains separate from display reflow. Long ride, guarantee and `But girl` chorus phrases split at meaningful boundaries; dense rap and bridge lines also split. The implemented split plan contains 70 cues. No words are removed or added.

`buildCueFrames` converts sample contacts once to the render clock. `cueStateAtFrame` controls both visibility and focus with exclusive ends. All 323 focus groups are fully visible at their first selected frame. Every cue has positive ordered intervals and complete group coverage. Synthetic boundary fixtures cover 48 kHz/60 fps, 44.1 kHz/60 fps and 48 kHz/120 fps.

## Coverage and limits

The [complete-recording audit](vocal-coverage.json) compares unrestricted transcription against the supplied sequence and records targeted intro/tail passes on both mix and stem. It rejects an uncorroborated final ASR reprise instead of inventing an extra line. Missing ASR text and low stem energy are not treated as proof of instrumental audio.

Source samples, model estimates, grouped-token decisions and frame rounding are distinct concepts. The 8.33 ms maximum nearest-frame rounding is display quantization, not an acoustic accuracy guarantee. No ground-truth word boundaries, native-listener audition or perfect-sync claim is made.

## Optional model rerun

Use the versions in [SOFTWARE.md](../SOFTWARE.md), set `ALIGN_PYTHON` to the model environment and retain the same time-zero model inputs:

```sh
node scripts/align-models.ts transcribe audio16
node scripts/align-models.ts full vocals16
node scripts/make-windows.ts
node scripts/align-models.ts mms vocals16
node scripts/align-models.ts mms audio16
node scripts/align-models.ts wav2vec vocals16
node scripts/align-models.ts whisper vocals16
node scripts/compare-alignment.ts
node scripts/build-cues.ts
node scripts/check.ts
```

Rerun results may differ across dependency/model environments. They are candidates for review and must not silently replace the selected production cues.
