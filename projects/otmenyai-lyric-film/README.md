# REDCHINAWAVE — Отменяй

Released landscape Russian/English lyric film, completed on 10 September 2026. **1920×1080 · 60 fps · 2:10.453 · H.264 High / stereo AAC · BT.709.**

[Film and production downloads](https://github.com/ael-dev3/lyrics/releases/tag/otmenyai-v1.0.0) · [Original official audio](https://www.youtube.com/watch?v=U9SYUPV0QrA) · [Software credits](SOFTWARE.md)

![Final encoded frame at 00:13.950](evidence/final-13.95.png)

## Inputs and credits

- Music, lyrics and artwork source: [REDCHINAWAVE — Отменяй, official audio](https://www.youtube.com/watch?v=U9SYUPV0QrA), album Отменяй (2022).
- Artist: [REDCHINAWAVE](https://linktr.ee/redchinawave).
- The artwork is adapted from the official upload. Its original illustrator has not been independently identified; no authorship claim is made.
- The source's visual is treated as artwork, with new continuous camera and audio-reactive graphic motion authored at 60 fps. This is not a claim that the original illustration contains native 60 fps animation.
- The palette has four base colors: `#e10508`, `#030303`, `#c2c2c2`, `#5c5c5c`. The base artwork is classified into those four colors. Antialiasing, scrims, downsampling and video compression naturally introduce intermediate shades.

## Alignment and translation

The user-supplied Russian text matches the official upload description, including its spelling of «Социально». It is preserved rather than silently changed to the grammatically expected adjective ending.

21 lines and 71 source words are represented by 50 timed highlight units. Short prepositions, the compound describing social rock bottom, and the first three words of the last stanza line are grouped where independent word contacts would suggest more certainty than the evidence supports. English segments reference these exact same source groups. The English segment meaning “anymore” activates before “home,” following the Russian performance rather than English reading order.

The English wording is an idiomatic translation. The phrase about the social bottom is condensed to “Rock bottom is already close”; the wording preserves the descent metaphor but does not repeat “social” explicitly. The taxi line is translated as the natural English instruction to cancel the taxi. No English vocal is present in the source.

Timing evidence:

1. Demucs `htdemucs` vocal isolation, used for analysis only.
2. Stable-whisper large-v3-turbo forced alignment, independently windowed for each of four stanzas and the final repeated line. The original full-file pass drifted into instrumental gaps and was rejected.
3. A second stable-whisper pass on the original mix.
4. Independent TorchAudio MMS-FA CTC alignment with uroman normalization.
5. Waveform and spectrogram inspection, with a repeat-correlation check on the opening phrase as supporting evidence. Later stanza timings are independently measured, not copied offsets.

MMS corrected the final line from an invalid crop-edge onset at 121.75 s to approximately 122.792 s. Probability-based Whisper refinement collapsed some words to about 17 ms and was rejected. An attempted whisper.cpp DTW export returned unavailable timestamps and was also excluded.

`analysis/alignment-evidence.json` retains candidates, model scores, selections and reviewed disagreements. Model agreement and sample-index storage are not ground-truth vocal accuracy. Soft consonants and sustained musical vowels retain uncertainty. The numerical frame-placement bound is documented separately from acoustic uncertainty.

## Design and motion

The original face dominates the right side; fixed Russian and English reading regions occupy the left. A narrow red contact underline and fill identify the active Russian group. English changes from medium to light gray for the corresponding meaning. Glyph geometry does not change on activation.

Line entrances adapt to the available inter-line gap, so no outgoing word is hidden to make room for an incoming phrase. A fixed 240 ms lead previously truncated eight line tails in this track. The current display-window function preserves the complete vocal interval and shortens the lead when needed. Instrumental sections use a title state; short breathing gaps avoid title flashes.

The 64-band stereo filter bank uses the existing calibrated zero-phase DSP implementation. Measured band levels use a fixed −60 to 0 dBFS display scale, with no per-frame normalization or arbitrary band boosts. Separately derived artistic motion controls drive camera pressure and red graphic movement. The expressive curve is decorative; the bars carry the measured frequency-band display.

The LOOP study informs stable typography and image-dominant composition. The source track's own red/black artwork determines the visual identity.

## Render and verification

1. Exact bundled Cyrillic Oswald and Latin Space Grotesk fonts are loaded before frame capture.
2. Strict TypeScript, timing checks and DSP calibration pass.
3. All 21 cues are inspected in two browser highlight states: 42 successful layout checks, no overflow or glyph movement.
4. A 15-second prototype is rendered and decoded for presentation review.
5. PNG browser captures at 3840×2160 feed a lossless H.264 4:4:4 private intermediate.
6. A single Lanczos downsample produces 1920×1080 H.264 High, CRF14, slow preset, BT.709 with fast-start MP4 metadata.
7. The original Opus is converted once to AAC 320 kb/s for MP4 compatibility. Its packets are then copied unchanged into the final file. No normalization, separation or remix is applied to the delivered soundtrack.
8. The final video receives a full strict decode, frame count, codec/color checks, AAC packet identity checks and a waveform alignment check against the downloaded source.

See `evidence/timing-checks.json`, `evidence/layout-checks.json`, `analysis/calibration.json` and `evidence/delivery-verification.json` for actual results. Do not treat this file as a replacement for those measured reports.

## Reproduction

Use the complete production ZIP from the release for a self-contained set of inputs. The Git directory is a source/evidence snapshot: audio, original video, analysis PCM and stems live in the release archive.

The production environment used Node 24.20.0, React 19.2.8, Remotion 4.0.518, TypeScript 7.0.2 and FFmpeg 8.1.2. Run commands from the archive’s `work/otmenyai` directory. `package-lock.json` pins dependencies. Node 24 and FFmpeg/ffprobe with libx264 must be installed; the Remotion renderer may download its Chromium runtime on first use.

```sh
npm ci
npm run typecheck
node scripts/check.ts
node scripts/dsp-test.ts
node scripts/layout.ts
node scripts/render.ts --preview
node scripts/render.ts
npm run encode
npm run verify
```

The archive preserves the sibling `../prygay-source` directory and `../../outputs` delivery layout. It includes the downloaded source video, original/extracted audio, decoded analysis PCM, vocal stems, alignment windows and observations, fonts with notices, final features, publishing assets, master and captions. Downloadable model weights, installed dependencies, the lossless 4K intermediate and regenerable frame caches are excluded. The verifier rebuilds the AAC PCM cache when needed. The exact original encode commands are recorded in `analysis/encode-command.txt`; `scripts/encode.ts` wraps the same two-step encode and metadata fix.

No alignment model needs to run to reproduce the saved film. The final cues and features are supplied. Re-running separation or the speech models is an optional new analysis pass, and may produce different observations. Both accepted and rejected observations are retained in `../prygay-source`; see the alignment notes above before using them.

Public source metadata is retained as a documented subset; temporary stream URLs and extractor session data are omitted. The sanitized metadata hash and original local metadata hash are distinguished in the input manifest.

The saved `src/cues.json` is the finalized timing asset. To regenerate it from the saved model observations, use `npm run cues`, which runs both the provisional importer and the reviewed reconciliation step, followed by the timing check. Running the importer alone does not reproduce the final timing. `analysis/input-manifest.json` records hashes of the actual source and render inputs.

## AI and rights

OpenAI Codex with **GPT-6 Astra** assisted implementation, translation drafting, alignment, analysis and documentation under Ael's direction. A separate built-in image-generation tool assisted thumbnail adaptation; its underlying model version was not exposed. The thumbnail used the built-in image-generation tool with the source still as a visual reference; its exact prompt is in `analysis/thumbnail-prompt.txt`. No claim is made about the source artist's own use of AI.

Our authored workflow contributions fall under the Lyrics repository's scoped CC BY 4.0 policy. Music, lyrics, source artwork, fonts and third-party dependencies retain their own rights; mixed final videos and promotional images are not wholly CC-licensed assets. We do not take credit for the original creators' work. No endorsement is implied.

## Packaging changes and verification

The archive adds direct renderer/bundler dependency pins, a lockfile, font notices and an encode wrapper. The verifier regenerates its decoded AAC cache. These packaging changes do not change the delivered movie, finalized cues, composition or feature data. The packaged checks are recorded in `evidence/package-validation.json`.

Final master SHA-256: `70fd65b514c6a14de42d4d6bc0f7aa04a8d51e2a8fbd7b949e291e6bc2032ee0`. Source-video and archive hashes appear in the release’s `CHECKSUMS.sha256`. The full archive has a per-file `MANIFEST.sha256`.
