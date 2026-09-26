# Independent transcription pass A

This pass analyzes the user-attached MP4. It does not retrieve lyric text from a website, and the recognizer was not seeded with a lyric prompt. Automatic recognition supplies candidate words and timing evidence, not a completed listening review.

## Source identity

- Attached MP4 SHA-256: `954ce98a308937e81a167ab740381cd46195abbad3279f3bc57319fa48bbd73c`.
- Decoded 16 kHz mono mix SHA-256: `083f4c35610dd8c2280cd74cb8efd4f07eb674942cbf63aaa7cdb9ec5d6d0d79`.
- Decode duration: 134.931188 seconds. No leading trim or timeline shift was applied.
- Demucs vocal-stem 16 kHz mono SHA-256: `20ebbdc3096d44a4fd1917d3fa83230898533b6e4e48496b747522ae72677593`.
- Container and stream metadata: `attached-source-probe.json`.

## Models and method

- stable-ts 2.19.1; OpenAI Whisper 20250625; PyTorch 2.14.0; CPU inference.
- Whisper `large-v3-turbo` model SHA-256: `aff26ae408abcba5fbf8813c21e62b0941638c5f6eebfb145be0c9839262a19a`.
- Demucs 4.1.0 `htdemucs`, one shift, stereo floating-point output, resampled to 16 kHz mono for recognition. Model SHA-256: `8726e21a993978c7ba086d3872e7608d7d5bfca646ca4aca459ffda844faa8b4`.
- Recognition uses English, word timestamps, beam size 5, no prompt, no conditioning on previous text, no regrouping and no silence suppression. Raw JSON preserves the model's observations, including errors or possible omissions.

## Reproduction

With the recorded model dependencies available, decode the attached source as `mix16.wav` and run:

```sh
stable-ts mix16.wav --model large-v3-turbo --device cpu --language en --fp16 False --threads 3 --word_timestamps True --regroup False --condition_on_previous_text False --beam_size 5 --suppress_silence False --output large-v3-turbo-mix.json --verbose 2
python -m demucs --two-stems=vocals --float32 -d cpu -j 2 --shifts 1 -n htdemucs -o stems ATTACHED_SOURCE.mp4
```

The source video, PCM copies, separation outputs, model weights and local execution logs are analysis assets. They are not part of the final film or a lyric authority. The stem is solely for checking the mixed recording; its separation artifacts must not be interpreted as missing original vocals.

## Evidence limits

No direct human or model listening attestation is recorded by this pass. The user-supplied transcript can establish intended text, while independent ASR helps flag disagreements. Chopped syllables and long repeated echoes are especially vulnerable to recognizer omissions or repetition hallucinations. Final cue timing and performed coverage require the project's actual-audio review.

## Completed outputs and findings

- `large-v3-turbo-mix.json`: full mixed recording, unprompted.
- `large-v3-turbo-vocals.json`: full Demucs vocal stem, unprompted.
- `large-v3-turbo-vocals-{opening,first-verse,transition-hooks,life,chops,closing}.json`: independent bounded recognition, still without lyric prompts. `transcribe-windows.ts` records the exact crop windows; results are offset back to the original source clock.
- `mms-windows.json`: submitted text and bounded source windows. `align-mms.ts` forces that text through MMS_FA on both the mix and stem, yielding `mms-mix.json` and `mms-vocals.json`. Each word includes the original model token spans and weighted score. These are candidates, not finalized cues.
- `mms-calibration-windows.json` and `mms-calibration-{mix,vocals}.json`: a short initial lead phrase and three separate closing-phrase windows. Reproduce with `node align-mms.ts mms-calibration-windows.json mms-calibration` after setting `ALIGN_PYTHON`.

### Lexical comparison

1. **Closing text is supported.** The targeted stem pass independently returns three complete repetitions of “Dreams come true with you.” The second and third repetitions have consistently strong word probabilities. Broad passes truncate, stretch or misrecognize the same tail, so the bounded result is the useful lexical evidence here. The first “Dreams” onset is overextended into preceding audio and must not become a final highlight onset.
2. **“Leave” versus “Live” remains a listening question.** Both full passes and the bounded stem pass return “Leave a life where dreams come true.” However, the bounded pass gives the first word very low probability (about 0.002); agreement on this strongly sung vowel is not sufficient proof. The submitted text is retained in the forced-alignment input, with the ambiguity kept visible.
3. **Keep the submitted “room with a view.”** Automatic runs variously produce “room with you,” “room with a few” and “moon with a view.” They are recognizable phonetic confusions, not a reason to silently rewrite the supplied clause.
4. **Keep the submitted “You can.”** Some runs output “You could” for the first verse. The stem MMS word candidate for “can” and the independent repeated verse are useful comparison evidence, but these do not establish a new listening attestation.
5. **Recognition does not establish echo coverage.** Full and bounded passes frequently omit delay repeats or turn chopped “Take me” samples into “Tiny,” “Like me,” “Slime me,” “Baby,” “windy” or “days.” Those outputs stay in raw evidence; they do not enter production lyrics.

### Timing comparison

MMS on the nonrepeated verse and bridge clauses generally gives close mix/stem onsets and useful separate word events. Read the actual token spans before deciding held endings. The broad repetition windows are poor: MMS can force weakly supported repetitions into the wrong cycle, stretch a single “there” through several samples, or place a final forced word against the crop boundary. These hook/outro candidates are explicitly unsuitable for direct timeline import. Use independent waveform/sample correspondence and smaller reviewed windows for repeated samples.

The supplied transcript's timestamps are coarse block boundaries, not word times. The last source block also mixes preceding “there” echoes with the closing phrase. Neither those block boundaries nor the broad ASR segment starts should become lyric-highlight intervals automatically.

The short initial MMS calibration finds the first lead onset near 0.492 seconds in both mix and stem, rather than the unprompted ASR's padded 0.000 onset. Its “me” and “there” boundaries disagree materially between model methods, so this establishes a useful phrase-start anchor rather than three certified word intervals. Separate vocal-stem closing windows place “Dreams” near 121.464, 125.284 and 129.104 seconds; compare these against waveform recurrence before adopting a repeating template. MMS scores are internal token-alignment scores, not calibrated probabilities that the submitted word is correct.

## Locally bounded hook comparison

`prepare-local-hooks.ts` defines 15 short windows using independently correlated lead restarts, plus a final intro lead-only window. For each repeated window, `align-mms.ts` compares five and six **additional** “there” words after the lead phrase. Both variants use identical cached model emissions, on both the mixed recording and vocal stem. The last candidate at 107.206 seconds and subsequent chopped vocals are excluded from this repeated-hook forcing pass.

- Inputs: `mms-local-hook-windows.json`.
- Raw candidates: `mms-local-hooks-mix.json` and `mms-local-hooks-vocals.json`.
- Diagnostic comparison: `mms-local-hooks-comparison.json`, generated by `summarize-local-hooks.ts`.
- Warnings preserve short words, unusually extended echoes, internal scores, crop-edge contact and adjacent words sharing one boundary. The warnings are diagnostic heuristics, not semantic verdicts.

The local windows prevent a hook from jumping to another loop, but they **do not resolve echo counts**. For example, the first mixed-audio window accommodates six echoes by splitting one former echo path; the stem's six-echo path instead pulls the principal “there” into the preceding syllable (about 0.953–1.173 seconds), contradicting the short lead calibration around 1.5 seconds. The five-echo version better preserves that particular lead's geometry, but its timing evidence also remains weak for the echoes. A numerical score must not be used to turn either variant into a verified count. No final candidate selection is recorded by this pass.

## Missing-vocal review around 45 seconds

`transcribe-gaps.ts` runs unprompted recognition on the mix and stem at 40–48.2, 11.6–17.2, 57.3–63.2 and 109–121.5 seconds. `--lead-only` adds a separate 43.8–46.2 crop. Outputs retain recognition failures rather than rewriting them into desired text. `mms-gap-candidate-windows.json` compares the supplied “there” and “anywhere” candidates around the two local leads; it is forced evidence, not an independent transcription.

The preview builder had ended the special “Take me anywhere” cue near 43.648 seconds and skipped the remaining span until the normal 46.219-second restart. The wider mixed ASR independently detects another “Take me” sequence, although it misrecognizes its final word. A lower-scoring full-phrase waveform match at 44.28775 seconds, plus separate Take/me/there matches, corroborates this intermediate lead. The revised timeline restores “Take me there” as a documented candidate at 44.288–45.870 seconds rather than labeling the entire span as isolated “there” echoes.

`audit-gap-coverage.ts` records every gap over 0.2 seconds in the intro, middle hooks and final processed-vocal regions in `evidence/missing-vocal-audit.json`. Remaining activity after the intro and in the late chops is not converted into guessed words: model outputs and energy alone cannot establish those lexical events. This audit is not a listening attestation.

## Independent English CTC timing comparison

`compare-english-ctc.py` runs the cached English wav2vec2 base 960h model on the mix and vocal stem. It records unprompted greedy letter events and a separate supplied-text Viterbi alignment in `english-ctc-comparison.json`. Run from this directory with the same 16 kHz audio files and a Python environment with PyTorch, torchaudio, NumPy and SoundFile. This compares a second CTC model family against MMS and Whisper; neither forced paths nor raw token probabilities certify word identity. Long blank spans and weak forced suffixes must not be interpreted as exact sung releases.

Strong vocal-stem initial letters corroborate the later MMS onsets of first-verse FAR and ROOM, and both inspected ANYWHERE words. The earlier Whisper boundaries had assigned preceding gaps to the next word. Retain those disagreements as evidence; do not use majority recognition from one model family as an independent timing vote.

## Applied phonetic review

`evidence/first-verse-sync-audit.json` records every changed interval, evidence hashes and declined proposals. `audit-phonetic-review.ts` derives that audit from the retained before/after timelines. The early ASR-only FAR, ROOM and ANYWHERE overrides are explicitly retracted in the review record. First-verse FAR begins near 19.067 seconds; GO releases at 18.120 seconds. The intervening GO-like spectral tail decays by more than 20 dB and is not evidence of a second FAR or an uninterrupted lead vowel.

The review also separates the second verse's article from ROOM, corrects the later I'M/WITH transition, extends two vowels only through corroborated phonetic evidence, refines the second closing TRUE/WITH transition and moves the recurring lead THERE onset from 1.430 to 1.525 seconds. The recovered 45-second cue keeps its separately measured timing. No new words were invented and the 37 cues retain 225 events.

`tests/phonetic-boundary-regression.test.ts` verifies the corrected transitions and scans all 8,096 frames at 60 fps: every selected event receives visible, exclusive focus. This establishes display coverage and nonoverlap, not listening certainty. The processed late vocal fragments, echo counts and Leave/Live reading remain review uncertainties.
