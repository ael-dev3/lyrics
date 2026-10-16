# Разучимся плакать — complete review preview

Settlers · Russian / English · 16:9 and 9:16 · **Preview only**

![Actual browser preview with original room portrait and complete bilingual shard meaning](evidence/browser-wide-55.600.jpg)

*Browser canvas exported at 00:55.600, resized for documentation. Original picture and recording: [Settlers’ supplied recording](https://www.youtube.com/watch?v=24oIDKiYaFs). This is a review preview, not a decoded production film. Separate photographer credit is unverified.*

The original room remains the setting. A stationary carpet reading area carries equal Semibold Russian and English text. Twenty-four measured frequency bands gently brighten existing rust embroidery on the bedspread; no new decorative object, image extension or camera motion is added. Each format uses one uniform crop of the actual source and protects the complete seated figure.

## Open the complete preview

```sh
npm ci
python3 scripts/prepare-source.py '/path/to/exact/original.mp4'
npm run build
npm run identity
npm run preview
```

Open **http://127.0.0.1:4341/**. The complete original recording, native picture, word focus and material response are present. Controls include seeking, cue jumps, normal/0.75/0.5 speed, both formats, effects comparison, source reference and recovery.

The original is identified in [source/recording.json](source/recording.json). It stays out of Git, along with private transcript inputs, decoded audio, model emissions and temporary stills. The font and license are included. Local preparation refuses different source bytes.

## Current state

- 26 complete reading cues, 118 independently timed Russian events and 164 English display tokens.
- Four first-half and seven second-half performances of «Насколько мне хочется жить»; broad ASR omitted several, which shorter source crops recovered.
- Supplied «весенняя зряка» corrected to **«весенняя слякоть»**. The original reference remains unchanged privately. Closing **Ну / Но** and several held releases remain explicit listening-review points.
- The unchanged original soundtrack supplies all playback. Integer 48 kHz samples govern focus; the native 25 fps picture clock is separate.
- Technical display and transport checks are documented. Full normal-speed listening, uncertain-event reduced-speed review, creative acceptance and production authorization remain **pending** for this revision.
- No full film has been rendered. [The production gate](scripts/production-authorization.ts) rejects missing, incomplete or stale authorization; `npm run gate` is expected to refuse this preview.

[Production notes and exact decisions](PRODUCTION-NOTES.md) · [Agent handoff](AGENT-HANDOFF.md) · [Timing selections](evidence/timing-selections.json) · [Raw model comparisons](evidence/acoustic-observations.json) · [Technical checks](evidence/technical-preview-checks.json) · [Current review identity](source/REVIEW.json)

## Local validation

```sh
npm run check
npm run stills
```

`check` verifies sample boundaries, semantic unions, every rendered source/target focus state, both-layout fit, phone-side clearances, sampled exact source pixels on the protected figure and delayed-clock negative controls. `stills` saves shared-scene illustrations privately under `review/stills/`; it does not encode a film or establish listening review.

## Retained acoustic workflow

Use an existing analysis environment containing the package versions in `evidence/acoustic-observations.json`. The soundtrack remains the original mix; stems are private observations.

1. `scripts/prepare-source.py` verifies and decodes the original.
2. Run unprompted `scripts/acoustic/transcribe.py` on `mix`, then on `vocals` after Demucs separation/resampling. `--scope repeats` provides shorter coverage checks; `--model small --scope diagnostic` retains a correlated comparison.
3. `python3 scripts/prepare-acoustic-phrases.py` creates bounded model input from the canonical editorial map without overwriting it.
4. `scripts/acoustic/mms-observations.py --phrases analysis/phrases.json --input analysis/mix-16k.wav --output analysis/mms-mix --threads 4` retains CTC cores. `scripts/acoustic/align-whisper.py` retains the separate attention comparison, including its known failed stretched paths.
5. Keep observations separate from the selected proposals in `scripts/build-timeline.py`. After any text/event change, rebuild, validate, refresh identity and reload the complete preview. Listening review remains separate.
