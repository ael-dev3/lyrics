# Production workflow

## 0. Lock the typed toolchain

All authored application, analysis, rendering, validation, and reusable workflow code uses strict TypeScript: `.ts` for data and logic, `.tsx` for React/Remotion components, and no new `.js` or `.jsx` source. Verify the npm registry's stable `latest` tag, exact-pin that compiler in the project and lockfile, and run the local compiler rather than a global installation.

For the current project, the verified stable baseline on 2026-08-30 is TypeScript `7.0.2`. Follow the [TypeScript-first workflow](typescript-first-workflow.md) for project structure, strict settings, typed production-data rules, required commands, controlled upgrades, and exceptions.

Typechecking is a blocking pre-render gate, but it does not replace runtime schema validation, lyric review, audio-reference fixtures, motion QA, or decoded-video inspection.

## 1. Define the deliverable before animating

Record the following in a small production manifest:

- exact track title and version;
- source-language lyric reference and translation owner;
- soundtrack filename, duration, sample rate, and checksum;
- frame rate, dimensions, duration in frames, and delivery codec;
- typography, artwork, safe areas, and platform constraints;
- whether uncertain vocal edits should show lyrics, a refrain, or a title state.

For a fixed-duration composition:

```text
durationInFrames = round(audioDurationSeconds * fps)
```

Do not trim the soundtrack to make a composition fit. Make the composition match the locked soundtrack.

Useful inspection command:

```sh
ffprobe -v error \
  -show_entries format=duration,size,bit_rate \
  -show_entries stream=codec_name,codec_type,sample_rate,channels \
  -of json soundtrack.m4a
```

## 2. Establish lyric authority

Use this evidence order:

1. lyrics supplied by the artist, label, or publisher;
2. a published lyric listing for the exact remix or edit;
3. a human transcription by a fluent listener;
4. automatic transcription as a timing assistant only.

Never use a lyric page for the original song when the soundtrack is a remix without first checking structure. Remixes can omit verses, stretch words, repeat fragments, or reorder sections.

Create a source-language line list first. Create the English translation in a separate field. This prevents a poetic translation from being mistaken for a literal word-for-word timing map.

For bilingual karaoke, align English **semantic groups** to the corresponding performed source-language phrase. Do not force every English word onto a Russian syllable when the grammar differs.

Do not assume those English groups must activate from left to right. When natural English and source-language performance order differ, keep the English sentence in natural reading order and let chronological source cues target semantic groups in any display position. A target may move backwards, repeat, or activate alongside another target when the meaning requires it.

Use an independent focus treatment—not a reversible cumulative progress fill—so a backward target reads as semantic emphasis rather than a playback error. See the [first-project retrospective and semantic-highlighting proposal](first-project-retrospective.md) for the data model, interaction rules, and validation requirements.

A general line-duration bar may remain monotonic because it measures elapsed line time. Do not reverse that bar; non-linear behavior belongs only to the semantic word-group focus.

## 3. Build a reference transcription

Automatic recognition is useful for locating candidate boundaries, especially when it produces token timestamps. It is not a final lyric authority.

Recommended process:

1. Convert the locked audio to uncompressed mono or stereo WAV without changing its start time.
2. Run the strongest available multilingual model in the performed language.
3. Give the model the verified source-language lines as context when supported.
4. Export full JSON with token or word timestamps.
5. Mark low-confidence regions caused by distortion, chops, reverb, or overlapping vocals.
6. Confirm every section boundary by listening at normal speed and around `0.5×` speed.

Example:

```sh
ffmpeg -i soundtrack.m4a -ar 48000 soundtrack.wav

whisper-cli \
  -m ggml-large-v3-turbo.bin \
  -f soundtrack.wav \
  -l ru \
  -sow \
  -ojf \
  -of timing-reference
```

Model timestamps can be coarse at segment edges. Word attacks, phrase endings, and repeated loops still require human confirmation.

## 4. Separate vocal and visual timing

The timing model should not use one `start` and `end` pair for every purpose. Store at least:

```ts
const lyricLine = {
  id: 'V1-01',
  section: 'verse',
  text: 'Night in the silence freezes helplessly;',
  measurements: {
    timecodedLyricOnset: 64.09,
    waveformAttackOnset: 64.03,
  },
  vocalStart: 64.06,
  vocalEnd: 67.13,
  visualInStart: 63.82,
  visualInComplete: 64.01,
  visualOutStart: 67.13,
  visualOutEnd: 67.18,
  confidence: 'two-audit consensus',
  cues: [
    {text: 'Night', vocalStart: 64.06, vocalEnd: 64.83},
    {text: 'in', vocalStart: 64.83, vocalEnd: 65.10},
    {text: 'the silence', vocalStart: 65.10, vocalEnd: 66.02},
    {text: 'freezes', vocalStart: 66.02, vocalEnd: 66.55},
    {text: 'helplessly;', vocalStart: 66.55, vocalEnd: 67.13}
  ]
} as const;
```

The line should normally be fully legible by `vocalStart`. Cue highlighting begins at the performed phrase, not at the visual entrance.

Every `vocalStart` must be an absolute anchor against the locked soundtrack. Never compute line 7 by adding six preceding card durations; cumulative errors are exactly how a regular phrase grid can drift by `0.7–1.2 s`. It is acceptable to infer an exit from the next absolute onset, but never infer the next onset from the previous exit.

When independent audits use different onset definitions, store every measurement, method, and uncertainty. Reconcile them explicitly—by human review or a documented fusion rule—and retain the spread. Do not silently replace one table or report a midpoint as sample-accurate truth.

For non-linear bilingual mapping, keep visual segments in natural reading order and cue events in chronological performance order. Validate the cue timeline, but do not require target positions to increase. This supports source-to-translation mappings such as `B → A → C`, repeated activation, and one cue targeting several translated groups.

Likewise, do not start fading a line before its final performed word ends. Begin the exit at `vocalEnd`; crossfade with the incoming line only if the design calls for it.

### Timing tolerances

Use these as review thresholds, not as excuses to skip listening:

| Absolute drift | Classification | Action |
| ---: | --- | --- |
| `≤ 0.10 s` | pass | Accept unless a hard consonant exposes the offset. |
| `0.11–0.25 s` | minor | Tune when the word attack is visible. |
| `0.26–0.75 s` | noticeable | Correct before final delivery. |
| `> 0.75 s` | major | Treat as a blocking sync error. |

At 30 fps, one frame is `0.0333` seconds. Obvious vocal attacks should usually land within two frames. The scientific vNext target is 60 fps, where one frame is `0.016667` seconds; analysis events may retain sample-indexed timestamps even though their visible response is quantized to or interpolated across video frames.

## 5. Design the composition as one visual system

A robust Remotion composition can be split into persistent layers:

```text
Audio
Artwork / camera motion
Reactive halo and colour response
Atmosphere / deterministic particles
Intro, lyric, break, or outro content state
Audio equalizer
Frame chrome / metadata
Master fade
```

Keep global layers alive across state changes. A title outro should inherit the artwork motion, particles, halo, equalizer, colour treatment, and frame chrome. This makes it feel like the next state of the film rather than a card pasted over an export.

Treat visual fidelity as a source-to-decoder system, not as a final codec switch. The complete [pixel-perfect visual workflow](pixel-perfect-visual-workflow.md) defines asset-resolution preflight, deterministic fonts, 2× rasterization, BT.709 conversion, chroma-safe geometry, downsampling, codec candidates, frame differences, and the internal 10/10 rubric.

Use seeded randomness for particles so every render is deterministic. Drive reactive motion from the same audio file used by the rendered soundtrack.

```tsx
const audioData = useAudioData(staticFile('soundtrack.m4a'));
const spectrum = visualizeAudio({
  fps,
  frame,
  audioData,
  numberOfSamples: 256,
  smoothing: false,
  optimizeFor: 'accuracy'
});
```

Avoid excessive audio-driven displacement. Use energy for subtle scale, glow, line width, and contrast; retain stable typography and safe areas.

For cinematic motion, do not drive every property from one compressed FFT average. Use the separate [clean emotional audio-reactive motion specification](emotional-audio-reactive-motion.md): track-relative sustained pressure sets broad line reach, sample-indexed transients create short overreach with the visual apex on the sound, and reviewed editorial cues handle emotional importance that loudness cannot infer. Keep the solid line core sharp, reserve `900–920 px` title-rail reach for exceptional peaks, and let most active frames remain materially below maximum.

### Scientific instrument layer

The direct 512-sample visualization above describes the current artistic baseline, not the 10/10 scientific target. For a measurement-faithful instrument layer, precompute and validate multi-resolution stereo features before rendering:

- a calibrated 4,096-point periodic-Hann STFT for the spectrogram and spectral statistics;
- a separate 64-band variable-resolution logarithmic filter bank for scientifically distinct instrument bars;
- a separate short-window, sample-indexed transient detector;
- ITU-R BS.1770 / EBU Mode loudness and true-peak measurements;
- 64 unique bands with published frequency edges and explicit units;
- raw scientific features separated from compressed artistic animation controls;
- a manifest containing source checksums, parameters, versions, units, and artifact hashes.

The video may report event timestamps to the millisecond while rendering at 60 fps, but it must state the distinction as **millisecond-resolved analysis, frame-accurate visualization**. Follow the complete [scientific audio-visualization specification](scientific-audio-visualization.md), including its fixtures, numerical tolerances, independent cross-checks, display rules, and 10/10 acceptance rubric.

## 6. Choose the right content state

Use normal lyrics while the vocal phrase is clear and verified. Use an integrated title or refrain state when the audio becomes:

- a chopped one-word loop;
- time-stretched beyond reliable word timing;
- layered with multiple incompatible phrases;
- too unclear to support an honest translation.

The transition should begin at the first frame of the changed vocal state. Do not leave the prior lyric on screen merely to cover an animation entrance.

For the Tanisea case, independent audits place the final fire-line attack between `113.64` and `113.98`, while the structural original-title transition lands around `118.20–118.25`. The vNext lyric resolves by `118.08` and the integrated title entrance begins just before `118.20`; no unrelated lyric animation is invented over the instrumental outro.

## 7. Preview the difficult windows

Before a full render, make short source-rendered previews around:

- every section transition;
- all user-reported lyric lines;
- the first and second chorus, which may use different edits;
- the last clear lyric to outro handoff;
- the final fade.

Render dense frame contacts at `2–4 fps` for animation continuity, but also watch and listen to the actual clips. Contact sheets cannot prove audio sync by themselves.

Example Remotion preview:

```sh
npx remotion render src/index.ts LyricFilm preview.mp4 \
  --frames=2730-3599 \
  --codec=h264 \
  --crf=18 \
  --audio-codec=aac \
  --audio-bitrate=192k \
  --image-format=png \
  --color-space=bt709 \
  --pixel-format=yuv420p
```

## 8. Render from source

Validate the composition before the production render:

```sh
npm run check
```

For broad compatibility, use H.264. For a smaller Mac- and modern-device-friendly delivery, use HEVC and tag the stream as `hvc1` during the final mux. In either case, pin PNG browser frames and BT.709; otherwise the render may introduce a lossy JPEG generation and the wrong implicit colour conversion before codec compression.

Direct high-quality compact review render:

```sh
npx remotion render src/index.ts LyricFilm render-hevc.mp4 \
  --codec=h265 \
  --crf=18 \
  --audio-codec=aac \
  --audio-bitrate=192k \
  --image-format=png \
  --color-space=bt709 \
  --pixel-format=yuv420p
```

This direct render is an 8-bit review baseline, not the complete 10/10 path. The visual master must first render a 2× 4:4:4 reference, choose a downsampling kernel using the project test card, encode through the validated external Main-10 path, compare a codec ladder to that reference, and inspect decoded worst frames. Use the commands and gates in the [pixel-perfect visual workflow](pixel-perfect-visual-workflow.md). Always probe the resulting stream; requested CLI settings are not evidence of the decoded pixel format or complete colour metadata.

If the source soundtrack is already AAC, re-encoding it at a higher bitrate does not restore quality. Replace the temporary render audio with the original compressed stream:

```sh
ffmpeg \
  -i render-hevc.mp4 \
  -i soundtrack.m4a \
  -map 0:v:0 \
  -map 1:a:0 \
  -c copy \
  -tag:v hvc1 \
  -movflags +faststart \
  -shortest \
  production-master.mp4
```

## 9. Verify the delivered file

The final file—not only previews—must pass:

- expected duration and frame count;
- expected dimensions and frame rate;
- expected pixel format, sample aspect ratio, BT.709 primaries, transfer, matrix, range, and chroma location;
- full decode without errors;
- matching hashes for repeated selected reference-frame renders;
- decoded-delivery comparison against the frozen visual reference;
- visual inspection of every high-risk window;
- source-audio identity when copied without re-encoding;
- final file checksum recorded with the audit.

```sh
ffprobe -v error -count_frames \
  -show_entries stream=codec_name,codec_tag_string,pix_fmt,width,height,sample_aspect_ratio,r_frame_rate,duration,nb_read_frames,color_range,color_space,color_transfer,color_primaries,chroma_location \
  -show_entries format=duration,size \
  -of json production-master.mp4

ffmpeg -v error -i production-master.mp4 -f null -

ffmpeg -v error -i soundtrack.m4a -map 0:a:0 -c copy -f md5 -
ffmpeg -v error -i production-master.mp4 -map 0:a:0 -c copy -f md5 -
```

## 10. Definition of done

A lyric film is production-ready only when:

- each displayed line matches the performed meaning;
- visual entrances are complete by vocal onset;
- active semantic groups track the corresponding source-language phrase;
- the final word is not faded or replaced early;
- unclear vocals use an intentional non-literal state;
- all animation states share one art direction;
- every displayed audio measurement has a defined unit, algorithm, time window, and verified source;
- raw measurements remain separate from artistic motion envelopes;
- visual masters use lossless browser-frame intermediates and an explicit BT.709 path;
- bundled fonts, source resolution, final-grid geometry, chroma safety, and repeat-render determinism pass preflight;
- the decoded delivery has no unintended visible artifacts against the frozen visual reference;
- no edit is a patch over a previously encoded video;
- the final full-length file passes technical and audiovisual QA.
