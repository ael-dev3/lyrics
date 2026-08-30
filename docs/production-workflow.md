# Production workflow

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

```js
{
  id: 'V1-01',
  section: 'verse',
  text: 'Night in the silence freezes helplessly;',
  vocalStart: 60.09,
  vocalEnd: 67.0,
  visualInStart: 59.77,
  visualInComplete: 60.09,
  visualOutStart: 67.0,
  visualOutEnd: 67.24,
  confidence: 'high',
  cues: [
    {text: 'Night', vocalStart: 60.09, vocalEnd: 61.8},
    {text: 'in', vocalStart: 61.8, vocalEnd: 62.25},
    {text: 'the silence', vocalStart: 62.25, vocalEnd: 65.0},
    {text: 'freezes', vocalStart: 65.0, vocalEnd: 65.99},
    {text: 'helplessly;', vocalStart: 65.99, vocalEnd: 67.0}
  ]
}
```

The line should normally be fully legible by `vocalStart`. Cue highlighting begins at the performed phrase, not at the visual entrance.

Likewise, do not start fading a line before its final performed word ends. Begin the exit at `vocalEnd`; crossfade with the incoming line only if the design calls for it.

### Timing tolerances

Use these as review thresholds, not as excuses to skip listening:

| Absolute drift | Classification | Action |
| ---: | --- | --- |
| `≤ 0.10 s` | pass | Accept unless a hard consonant exposes the offset. |
| `0.11–0.25 s` | minor | Tune when the word attack is visible. |
| `0.26–0.75 s` | noticeable | Correct before final delivery. |
| `> 0.75 s` | major | Treat as a blocking sync error. |

At 30 fps, one frame is `0.0333` seconds. Obvious vocal attacks should usually land within two frames.

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

Use seeded randomness for particles so every render is deterministic. Drive reactive motion from the same audio file used by the rendered soundtrack.

```jsx
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

## 6. Choose the right content state

Use normal lyrics while the vocal phrase is clear and verified. Use an integrated title or refrain state when the audio becomes:

- a chopped one-word loop;
- time-stretched beyond reliable word timing;
- layered with multiple incompatible phrases;
- too unclear to support an honest translation.

The transition should begin at the first frame of the changed vocal state. Do not leave the prior lyric on screen merely to cover an animation entrance.

For the Tanisea case, the clean final chorus ends around `116.00`, and a repeated title phrase begins around `116.05`. The title outro should therefore begin at `116.05`, with its visual entrance pre-rolling slightly so the title is legible on the first repeat.

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
npx remotion render src/index.jsx LyricFilm preview.mp4 \
  --frames=2730-3599 \
  --codec=h264 \
  --crf=18 \
  --audio-codec=aac \
  --audio-bitrate=192k \
  --pixel-format=yuv420p
```

## 8. Render from source

Validate the composition before the production render:

```sh
npx remotion compositions src/index.jsx
```

For broad compatibility, use H.264. For a smaller Mac- and modern-device-friendly delivery, use HEVC and tag the stream as `hvc1` during the final mux.

High-quality compact render:

```sh
npx remotion render src/index.jsx LyricFilm render-hevc.mp4 \
  --codec=h265 \
  --crf=18 \
  --audio-codec=aac \
  --audio-bitrate=192k \
  --pixel-format=yuv420p
```

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
- full decode without errors;
- visual inspection of every high-risk window;
- source-audio identity when copied without re-encoding;
- final file checksum recorded with the audit.

```sh
ffprobe -v error -count_frames \
  -show_entries stream=codec_name,codec_tag_string,width,height,r_frame_rate,duration,nb_read_frames \
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
- no edit is a patch over a previously encoded video;
- the final full-length file passes technical and audiovisual QA.
