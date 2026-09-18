# Local source preparation

The committed project includes artwork, fonts, timing candidates and measured features. The original music, raw decoded PCM, separated audio and model weights remain local.

Use the [official acoustic recording](https://www.youtube.com/watch?v=p3E731cu_nE). The audited download used YouTube formats 137+140. With FFmpeg and yt-dlp already installed, run these commands from the project directory:

```sh
yt-dlp -f 137+140 --merge-output-format mp4 -o public/source.mp4 'https://www.youtube.com/watch?v=p3E731cu_nE'
ffmpeg -v error -i public/source.mp4 -map 0:a:0 -c:a copy public/soundtrack.m4a
ffmpeg -v error -i public/soundtrack.m4a -f f32le -acodec pcm_f32le -ar 44100 -ac 2 analysis/audio-delivery.f32
ffmpeg -v error -i public/soundtrack.m4a -ar 48000 -ac 2 -c:a pcm_f32le analysis/mix48.wav
ffmpeg -v error -i public/soundtrack.m4a -ar 16000 -ac 1 -c:a pcm_f32le analysis/mix16.wav
```

Do not silently replace the recording if those source formats become unavailable. The expected soundtrack has 8,712,192 decoded stereo samples at 44,100 Hz. Container changes can change a file hash even when AAC is identical; compare packet timestamps/payloads and decoded samples against [audio identity](../evidence/source-audio-identity.json) before refreshing hashes. Changed music requires feature regeneration and a new timing review.

## Rebuild analysis when required

Set `ALIGN_PYTHON` to a Python environment containing compatible torch, torchaudio with MMS_FA, stable-ts/stable_whisper, Demucs, soundfile, numpy and uroman. The model bridge expects pretrained weights to be available locally; model versions and retained outputs are part of the evidence, not guarantees of bit-identical inference on other hardware.

```sh
node scripts/infer.ts separate
ffmpeg -v error -i analysis/vocals16.wav -f f32le -acodec pcm_f32le analysis/vocals16.f32
node scripts/infer.ts windows vocals analysis/coverage-windows.json small
node scripts/align.ts mms vocals analysis/line-windows.json -lines
node scripts/align.ts whisper vocals analysis/line-windows.json -lines
node scripts/align.ts mms vocals analysis/section-windows.json -sections
node scripts/align.ts mms mix analysis/section-windows.json -sections
node scripts/build-cues.ts
npm run features
npm run lunar:features
node scripts/acoustic-review.ts
npm run layout
npm run check
npm run preview:freeze
```

The cue builder applies documented candidate adjustments. Regeneration is not acoustic approval. Revisit adjustments if inputs or model candidates change. `mix48.wav` is an inference input; the visual spectrum and transient extraction use original 44,100 Hz stereo PCM, with its rate checked against the source manifest.

For layout-only changes with unchanged audio, the committed feature JSON is sufficient. Rebuild the browser bundle and preview identity, then repeat affected visual and playback checks.
