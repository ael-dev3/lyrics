# ray! — Пожары

A bilingual lyric film built around the official release photograph: mossy concrete, sage green clothing and copper hair. Russian words stay in a fixed reading area while English meanings respond to the corresponding performed words, including changes in word order.

The landscape and vertical editions share the same 48 kHz timing data and soundtrack. Each is composed separately and rendered at 60 fps; the source photograph receives new camera and graphic motion rather than fabricated in-between source footage.

![Landscape lyric treatment](evidence/youtube-16.2.png)

## Delivery

| Asset | Specification |
| --- | --- |
| YouTube film | 1920×1080, 16:9, 60 fps, H.264 High / AAC stereo |
| TikTok film | 1080×1920, 9:16, 60 fps, H.264 High / AAC stereo |
| Timeline | 150.0135 s retained audio; 9,001 public frames |
| YouTube thumbnail | 1920×1080 JPEG |
| TikTok profile cover | **1200×1600 portrait**, 3:4 width:height |
| Lyric data | 36 cues, 117 supplied words represented by 114 displayed words, 84 highlight groups |
| Publishing kit | Separate titles/descriptions, Russian and English SRT captions, cover prompts and verification |

The four repeated/chopped “пожар” words share one persistent bilingual bridge motif. This accounts for the difference between supplied and displayed word counts. No pronunciation material is included.

## Original creators

**ray!** — [official audio and source artwork](https://www.youtube.com/watch?v=ml9TqzvJLCg), [official release and streaming links](https://hangov3r.band.link/pojari), [artist channel](https://www.youtube.com/channel/UC5x2GKvVvMUvCp7bKIzY23Q).

The official upload credits lyrics to **Чистякова-Ионова Лидия Александровна** and music to **Чистякова-Ионова Лидия Александровна / Багиров Гейдар Анвер Оглы**. The photograph's individual creator has not been independently identified. The 3000×3000 artwork is a higher-resolution copy of the same photograph used in the upload, found through the official release page. [Input manifest and hashes](source.json).

Added lyric presentation, English adaptation and motion design: **Ael / Lyrics workflow**, assisted by **OpenAI Codex (GPT-6 Astra)**. Covers were created with the built-in image-generation tool using the official artwork as a reference; its model version was not exposed. Exact prompts and selected generated originals are retained. The film itself uses the original photograph.

We are not taking credit for the original music, lyrics, recording or artwork. The repository's [scoped CC BY 4.0 license](https://github.com/ael-dev3/lyrics/blob/main/LICENSE.md) applies only to contributions we have authority to license; it does not cover those third-party works, source-derived covers or the complete films. Source links establish provenance, not endorsement or rights clearance.

## Timing and translation

The supplied Russian text is the lyric authority. Original spelling, including “растаят”, is retained. The English text conveys meaning rather than pronunciation or a singable adaptation. “Опавшей от скуки листвой” keeps the lyric's unusual image of leaves falling out of boredom.

1. Source Opus audio is decoded once at 48 kHz; independent 16 kHz analysis inputs are derived without changing timeline origin.
2. Demucs separates a vocal analysis stem. Full-track attention alignment drifted across the instrumental section and was rejected.
3. Thirty-five bounded phrases are aligned independently using MMS-FA CTC and Whisper/stable-ts on both separated vocals and the original mix. Three verse-tail windows are refined independently.
4. Source samples are selected from the bounded CTC path, with candidate attention timings retained. Short particles and ambiguous contacts share explicit highlight groups.
5. The final chorus's last two phrases use the second chorus +48.000 s only after independent signed-waveform correlation (0.810 and 0.753) and bounded attention onset checks support that transform. The first chorus did not pass the same comparison and is not transferred.
6. The handoff around 119.8 s is shortened to the vocal decay supported by the stem spectrogram and both attention observations. Three remaining small overlaps are clamped to the incoming source cue and recorded.

English segments refer directly to source-token indices. For example, “the chill” highlights with “нотки холода” even though English sentence order differs. The bridge at **99.30–111.14 s** holds “Пожар / Fire”, with emphasis driven by the isolated vocal RMS envelope; individual echo copies are not presented as separately measured word boundaries.

[Candidate evidence and decisions](analysis/alignment-decisions.json) · [Repeated-vocal correlation](analysis/repeated-vocal-correlation.json) · [Timing checks](evidence/timing-checks.json) · [Handoff spectrogram](evidence/chorus3-handoff-spectrum.png).

**Review limits:** Frame quantization has a measured maximum error of 8.1875 ms at 60 fps. This is a display-placement property, not a claim that inferred acoustic boundaries are accurate to 8 ms. Reverb, attention-model drift, short particles and the chopped bridge retain uncertainty. Visual frames, model comparisons, waveform correlation and spectrogram evidence were reviewed; this record does not claim a native-listener or human audition of every word. The bridge and the transferred final-chorus phrases are the main checkpoints for a future listening review.

## Visual and audio design

The design takes the earlier workflow's fixed bilingual reading positions and measured spectrum, with the LOOP study's restrained, image-dominant approach. This track uses its own colors: charcoal `#101814`, stone cream `#e8e4d9`, copper `#f3a66b`, sage `#9caf9f` and muted green `#708277`. The original photograph retains its natural full-color detail.

- Russian text uses bundled Oswald; English uses Space Grotesk. English semantic segments remain stationary. Every cue is checked in active and inactive states in both aspect ratios: **144 browser layout states** total.
- The 64 logarithmic bands cover 20 Hz–20 kHz. Stereo power is measured using zero-phase, forward/backward prewarped biquads and centered RMS windows. A fixed −60 to 0 dBFS display scale keeps measurements comparable over time. Low-frequency time support is longer; zero group delay does not imply instantaneous frequency measurement.
- Decorative copper particles, the contour line and the slow camera transform use separate artistic controls. They are not frequency measurements, and do not alter the measured bars.
- The initial AAC test peaked above digital full scale. The locked delivery applies **−3.2 dB linear gain** and one 320 kb/s AAC encode. Final loudness is **−10.3 LUFS integrated**, with **−0.9 dBTP** measured true peak. No limiting, time stretching or inserted silence was used. Nine independent correlation windows show no measured source-to-delivery delay.

[Spectrum calibration](analysis/manifest.json) · [DSP checks](evidence/dsp-checks.log) · [Artistic control manifest](analysis/motion-manifest.json) · [Audio timing check](evidence/audio-timing-check.json).

## Verification

[Readable delivery report](evidence/final-verification.md) · [YouTube checks](evidence/youtube-verification.json) · [TikTok checks](evidence/tiktok-verification.json). Checks include full strict decoding, all 9,001 frames per movie, AAC packet/timestamp identity, square pixels, BT.709 tags, fast-start layout and selected final decoded frames.

## Covers

The TikTok cover follows the repository default: **1200 pixels wide and 1600 pixels tall**. The observed upload interface calls its tall preview “4:3”; this project records the actual 3:4 width:height orientation explicitly.

![TikTok profile-size check](evidence/profile-150x200.png)

The complete title and artist were checked at 150×200, 300×400 and with 5% removed from every edge. The YouTube cover was checked at 320×180. These are local crop simulations, not a claim of live platform preview testing.

[Exact image-generation prompts](analysis/cover-prompts.json) · [Cover verification](evidence/cover-verification.json) · [Crop stress check](evidence/crop-stress-300x400.png).

## Reproduction

Use Node.js 24+, FFmpeg/FFprobe with libx264, and the pinned dependencies. Put them on PATH. The complete production archive supplies the source audio, artwork and model observations; the Git source snapshot may omit large media. Installed dependencies, model weights, decoded PCM, temporary frame caches and lossless intermediate movies are excluded from the archive because they can be regenerated.

```sh
npm ci
npm run typecheck
node scripts/check.ts
node scripts/dsp-test.ts
node scripts/layout.ts
node scripts/render.ts --preview
node scripts/render-all.ts
node scripts/verify.ts
node scripts/captions.ts
```

`render-all.ts` renders two independent segments per aspect ratio at twice the final dimensions, using PNG frames and lossless H.264 4:4:4. It joins those segments without re-encoding, then downsamples once with Lanczos to the 1080p H.264 High delivery at CRF 14 / slow. Both final movies copy the locked AAC packets. Public cadence is 60 fps throughout. This project uses focused 60 fps timing evidence and one final technical gate instead of reproducing the historical Tanisea project's separate full-length 120 fps proof and duplicated release matrix.

To regenerate analysis rather than use the retained data:

```sh
ffmpeg -i source/soundtrack.opus -ar 48000 -ac 2 -f f32le analysis/audio.f32
ffmpeg -i public/soundtrack.m4a -af atrim=end_sample=7200648 -ar 48000 -ac 2 -f f32le analysis/audio-delivery.f32
node scripts/analyze.ts
node scripts/motion.ts
node scripts/audio-check.ts
```

To recreate the 16 kHz model inputs from the retained original mix and vocal stem:

```sh
ffmpeg -i source/soundtrack.opus -ar 16000 -ac 1 analysis/audio16.wav
ffmpeg -i analysis/stems/htdemucs/soundtrack/vocals.wav -ar 16000 -ac 1 analysis/vocals16.wav
ffmpeg -i analysis/vocals16.wav -f f32le analysis/vocals.f32
node scripts/align-models.ts whisper audio16 analysis/windows.json
node scripts/align-models.ts whisper vocals16 analysis/windows.json
node scripts/align-models.ts mms vocals16 analysis/windows.json
node scripts/align-models.ts whisper vocals16 analysis/windows-tail.json -tail
node scripts/align-models.ts mms vocals16 analysis/windows-tail.json -tail
node scripts/build-cues.ts
node scripts/check.ts
```

Model inference can vary between runtimes; retained observations and finalized cues are the release authority. Re-running inference is an analysis experiment that requires review before replacing those cues.

The optional alignment bridge calls pretrained Python model APIs from TypeScript. Install the packages recorded in SOFTWARE.md, set `ALIGN_PYTHON` to that environment's Python executable, provide 16 kHz mono mix/vocal WAV files, and run `align-models.ts` with the desired mode, audio name, window file and optional output suffix. MMS internal token normalization is confined to inference; only the supplied Cyrillic lyrics and English meanings enter the production data.

All timing selection, semantics, DSP, animation, rendering, packaging and verification are authored in TypeScript. [Software and model record](SOFTWARE.md).
