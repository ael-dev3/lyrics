# Разучимся плакать — lyric film

Settlers · Russian / English · 16:9 and 9:16 · **Approved v1.1 production · verified Desktop delivery**

![Decoded final YouTube frame with complete bilingual held focus and one gentle music line](evidence/final-youtube-33.500.jpg)

*Exact decoded final frame 2,010 at 00:33.500, uniformly resized for documentation. Original picture and recording: [Settlers’ supplied recording](https://www.youtube.com/watch?v=24oIDKiYaFs). [Final-frame provenance](evidence/final-stills.json). Separate photographer credit is unverified.*

The original room remains the setting. A stationary carpet reading area carries equal Semibold Russian and English text. One smooth warm-ivory music line sits below the lyrics. Twenty-four measured bands control its small bends; no replacement artwork, image extension or camera motion is added. Each format uses one uniform crop of the actual source and protects the complete seated figure.

## Open the complete preview

```sh
npm ci
python3 scripts/prepare-source.py '/path/to/exact/original.mp4'
npm run build
npm run identity
npm run preview
```

Open **http://127.0.0.1:4341/**. The complete original recording, native picture, word focus and the complete music-line response are present. Controls include seeking, cue jumps, normal/0.75/0.5 speed, both formats, effects comparison, source reference and recovery.

The original is identified in [source/recording.json](source/recording.json). It stays out of Git, along with private transcript inputs, decoded audio, model emissions and temporary stills. The font and license are included. Local preparation refuses different source bytes.

## Current state — approved v1.1 delivery

- **29 held endings extended**, five audited endings retained, and **all 118 word starts preserved**. The original mix and vocal estimate were examined at all 34 separated held positions. [Per-occurrence reasons and evidence limits](HELD-RELEASE-REVIEW.md).
- A **single continuous line** replaces the initial pigment effect and the trial bar row. It stays fixed below the lyrics, moves gently with measured music, and remains visible at ordinary player size. The existing [rose-paper ribbon lesson](../lyubi-menya-lyubi-lyric-film/PRODUCTION-LESSONS.md#a-continuous-ribbon-can-carry-restrained-musical-motion) informs the form; its palette and dimensions are not copied.
- 26 complete reading cues, 118 independently timed Russian events and 164 English display tokens.
- Four first-half and seven second-half performances of «Насколько мне хочется жить»; broad ASR omitted several, which shorter source crops recovered.
- Supplied «весенняя зряка» corrected to **«весенняя слякоть»**. The original reference remains unchanged privately. Closing **Ну / Но** and the corrected held releases remain explicit listening-review points.
- The unchanged original soundtrack supplies all playback. Integer 48 kHz samples govern focus; the native 25 fps picture clock is separate.
- The owner accepted this exact preview and explicitly directed production and delivery. Granular normal/reduced-speed and layout listening fields remain separately unlogged; [the scoped authorization](source/PRODUCTION-AUTHORIZATION.json) preserves that distinction.
- Both full films contain **13,625 pictures at 60 fps**, with complete original-source coverage and a final-picture hold through the audio tail.
- Each film passes every-frame timestamps, strict full decoding, **547 selected scenes**, **5,062 glyph-state checks** and all **282 source/target tokens** focused and neutral. No unintended black interval was detected.
- Source Opus becomes checked Apple AAC LC at 320 kb/s: zero measured offset, gain 0.994308 and waveform SNR 30.91 dB. The first AAC export failed quality checks and was replaced without changing a single video packet.
- The **17-file Desktop kit** contains YouTube/TikTok films and covers, posting text, optional SRTs and a Farcaster copy with a single disclosure/caption file. [Delivery manifest](evidence/upload-kit.json) · [Desktop hash verification](evidence/desktop-delivery.json).

[Production adapter, audio correction and delivery process](PRODUCTION-DELIVERY.md) · [Final landscape checks](evidence/final-landscape-verification.json) · [Final portrait checks](evidence/final-portrait-verification.json) · [Authenticated recovery backup](RELEASE-BACKUP.md)

[Production notes and exact decisions](PRODUCTION-NOTES.md) · [Agent handoff](AGENT-HANDOFF.md) · [Held-release audit](HELD-RELEASE-REVIEW.md) · [Timing selections](evidence/timing-selections.json) · [Raw model comparisons](evidence/acoustic-observations.json) · [Technical checks](evidence/technical-preview-checks.json) · [Current review identity](source/REVIEW.json)

## Local validation

```sh
npm run check
node scripts/visualizer-review.ts
npm run stills
```

`check` verifies sample boundaries, semantic unions, every rendered source/target focus state, both-layout fit, phone-side clearances, sampled exact source pixels on the protected figure and delayed-clock negative controls. The added late-body regression anchors check actual focused glyphs after their former cutoff. `visualizer-review.ts` measures on/off pixel differences at 480 px landscape and 320 px portrait; this is a visibility proxy, not listening or creative acceptance. `stills` saves shared-scene illustrations privately under `review/stills/`; it does not encode a film or establish listening review.

## Retained acoustic workflow

Use an existing analysis environment containing the package versions in `evidence/acoustic-observations.json`. The soundtrack remains the original mix; stems are private observations.

1. `scripts/prepare-source.py` verifies and decodes the original.
2. Run unprompted `scripts/acoustic/transcribe.py` on `mix`, then on `vocals` after Demucs separation/resampling. `--scope repeats` provides shorter coverage checks; `--model small --scope diagnostic` retains a correlated comparison.
3. `python3 scripts/prepare-acoustic-phrases.py` creates bounded model input from the canonical editorial map without overwriting it.
4. `scripts/acoustic/mms-observations.py --phrases analysis/phrases.json --input analysis/mix-16k.wav --output analysis/mms-mix --threads 4` retains CTC cores. `scripts/acoustic/align-whisper.py` retains the separate attention comparison, including its known failed stretched paths.
5. Keep observations separate from the selected proposals in `scripts/build-timeline.py`. After any text/event change, rebuild, validate, refresh identity and reload the complete preview. Listening review remains separate.
6. For held-release diagnostics, run `scripts/acoustic/release-review.py`, then `node scripts/acoustic/plot-release-review.ts`. The script loads and hashes the committed v1 baseline. Inspect original/stem traces before applying the separate v1.1 correction layer; plotting density and threshold candidates do not certify acoustic boundaries.
