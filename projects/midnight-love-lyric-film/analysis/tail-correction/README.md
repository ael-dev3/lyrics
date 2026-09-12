# Missing ending: investigation and proposed correction

The first production stopped its lyric timeline after cue L32 at 153.416 s and described the remainder as instrumental. That assumption was incorrect. The retained recording contains a final two-line chorus followed by a four-line reprise, using words already supplied for earlier sections.

## Integration status in v1.1.0

The six additions are now integrated into the production cue file: **38 cues, 185 performed words and 161 focus groups**. The original 151-word reference remains intact. The source composition places the closing-title return **after 188 s**, following the selected final held-vocal end at **185.4 s**; the approximately 186 s title timing below is a superseded investigation proposal.

The first 32 cues are preserved except for the three approved cue revisions from the [original-cue audit](../original-cue-audit/README.md): L07 keeps the original “But” onset, shortens its release to 35.72 s and groups “I always”; L18 restores the “die” release to 80.20 s; L19 moves the “Able” onset to 80.735 s. L06 is unchanged. The initial timing-only replacement plan covered **33–39 s**, **77–84 s**, and **150 s through the end**. The final cinematic revision removes active-word underlines throughout the recording, so it reconstructs the complete opaque lyric viewport on every frame at 2× delivery dimensions. Surrounding pixels and locked audio remain unchanged. See the [current rendering method](../../README.md#reproduction).

The existing presentation-time calculations were retained and checked for all **161 first-focus contacts**; no new frame-domain presentation API was adopted. The following sections preserve the original investigation and proposal history. Both v1.1.0 films passed rendering and delivery QA; see the [final verification](../../evidence/final-verification.md) for hashes and review limits.

## Proposed addition

| Cue | Repeated text | Selected start–end, global seconds |
| --- | --- | --- |
| L33 | I can't be your midnight love | 154.650–161.980 |
| L34 | When your silver is my gold | 162.711–167.206 |
| L35 | I can't be your second best | 168.660–172.179 |
| L36 | Close but not your favorite | 172.611–175.799 |
| L37 | I keep going back for more | 176.650–180.069 |
| L38 | Where there's nothing from before | 180.461–185.400 |

`tail-cues.json` contains only the six proposed additions in the existing Cue schema: **34 words and 29 focus groups**. Appending them to the unchanged first 32 cues yields **38 cues, 185 words and 161 groups**. `corrected-full-lyrics.txt` supplies the complete repeated text for coverage validation. Nothing in the original cue file, audio, composition or rendered media was modified by this investigation.

The focused tail evidence does not support adding the earlier “In this light” sequence to this ending. A previous chorus pattern alone is not sufficient evidence to extend the lyric sequence.

## Evidence and decisions

- Independent blind Whisper transcription of the mixed recording and separated vocals from 150 s to the actual end detects the same six phrases in the same order. The mix's isolated “back no more” substitution is contradicted by the vocal transcription, bounded alignment and supplied wording. Full-mix and vocal observations remain in separate JSON files.
- The YouTube auto-caption track contains only `[Music]` in this region. It does not establish that vocals are absent and cannot be used as the completeness authority.
- The separate [blind full-track mix pass](../original-cue-audit/blind-full-mix-transcription.json) places a “midnight love / In this light / I swear I’m blind” sequence at **190.04–193.84 s**. This conflicts with the focused mix and vocal tail passes, which identify the six reprise phrases above, and the 184 s vocal crop, which returns only sustained “Oh” sounds through 185.42 s. The isolated full-track output is treated as an unsupported, hallucination-like repetition rather than accepted new lyrics. This records the contradiction; it does not claim perfect vocal absence or human listening after the selected final release.
- Two bounded passes refine the six phrases with MMS on mix and vocals, wav2vec2 BASE 960h on vocals, and Whisper attention on vocals. `first-pass/` retains the first windows and observations; the root JSON files contain the wider refined pass.
- Attention places the “When” onset near 159 s by absorbing the preceding held note and gap. All three acoustic paths instead identify its contact near **162.71 s**; the proposal uses that acoustic contact.
- Wider-window CTC shifts “love” into its held vowel around 160 s. The first bounded English-encoder contact is retained while the wider-window release and visible sustain inform the ending. **“midnight / love” share focus** to avoid implying an independently certain boundary between these sustained words.
- Very short opening “I” vowels are paired with the following word. Visible vocal-envelope rises and independent observations support starts at 154.65, 168.66 and 176.65 s; CTC spikes often occur later inside these vowels.
- Both mix and vocal MMS locate the final “before” near **182.97 s**. The stem spectrogram and 5 ms RMS show the vowel continuing through approximately **185.4 s**, then decaying. A separate blind transcription beginning at 184 s emits only “Oh, oh, oh” over this sustained sound. This is not treated as three additional lexical events.
- Independent waveform-correlation searches against earlier matching phrases produce low signed correlations, **0.085–0.165**. They do not justify copying timestamps. All added cues retain independently measured candidate observations.

`tail-correction-evidence.json` records selected boundaries, every refined candidate, correction reasons, exact 48 kHz sample positions, source-cue hash and validation totals. `vocal-window-review.png` shows the first review windows. `tail-vocal-spectrum.png` covers global 153.000–193.8535 s; its horizontal labels are seconds relative to 153.000 s. `vocal-rms-5ms.json` keeps global timestamps.

The blind-transcription files' top-level `segments` and `words` use global source seconds. Retained raw `ori_dict` and `nonspeech_sections` remain crop-relative; add `analysisWindow.start` before comparing those raw observations to the source timeline.

## Original integration proposal

1. Preserve the existing first 32 cues and append `tail-cues.json`; update the lyric coverage text with `corrected-full-lyrics.txt`.
2. Remove the closing title that previously began at 181 s. A title return after approximately **186 s** follows the final lyric and its presentation release.
3. A replacement beginning at **150 s / frame 9000** precedes the earliest added display window and covers the old final line, all added lyrics and title repair. Retain the complete recording: **9,304,968 samples at 48 kHz**, with the existing **11,632-frame** video duration.
4. Preserve the locked AAC packets; no source-audio edit or retiming is needed. Review the replacement at normal speed and at the join, first new onset, held “midnight love,” 162.71 s handoff and final “before.”

## Reproduction

Use the exact model environment from the production's SOFTWARE.md and set `ALIGN_PYTHON` to that Python executable. These commands read existing model-input WAVs without changing their time zero:

```sh
node analysis/tail-correction/infer.ts transcribe vocals16
node analysis/tail-correction/infer.ts transcribe audio16
node analysis/tail-correction/infer.ts transcribe vocals16 184
node analysis/tail-correction/infer.ts mms vocals16
node analysis/tail-correction/infer.ts mms audio16
node analysis/tail-correction/infer.ts wav2vec vocals16
node analysis/tail-correction/infer.ts whisper vocals16
node analysis/tail-correction/review.ts
node analysis/tail-correction/build-tail.ts
```

The wider current windows are the recorded refined pass. The first pass is archived separately. Exclude local inference logs from publication because third-party warning messages can contain machine-specific paths.

## Review limits

The six omitted phrases are independently corroborated. Their precise acoustic word boundaries remain inferred. The sustained “midnight/love” transition and releases near 162 s and 185.4 s carry particular uncertainty. Grouped focus and explicit notes expose that limitation. This investigation does not claim human/native-listener audition or ground-truth timing accuracy.
