# Source, software and reproduction

## Source media

Immediate source: **Never Get Used To People — Life Letters (Long Version)**, uploaded by Never Get Used To People on 7 December 2018. [Video](https://www.youtube.com/watch?v=7hUbvIJ0Hnw) · [Channel](https://www.youtube.com/channel/UCANqV7iysTLkbv5GsGizQ3g) · [Artist links](https://linktr.ee/ngutp).

The archive includes extracted VP9 picture (`source/visuals.mp4`) and Opus audio (`source/audio-original.opus`), the H.264 render proxy (`public/footage-1080p.mp4`) and locked AAC (`public/soundtrack.m4a`). The original MKV and alternate AAC are not included. [Stream identity](evidence/source-integrity.json) records unchanged extracted payloads; [asset hashes](evidence/assets-manifest.json) identify files. The old MKV path in the historical receipt describes its production input, not a required archive path.

Original music, lyrics, recording and video remain the original creators' work. No independent rights clearance or complete underlying footage attribution is asserted.

## Render runtime and fonts

Observed versions: Node.js **24.20.0**, FFmpeg **8.1.2**, Remotion **4.0.518**, React **19.2.8**, TypeScript **7.0.2**. Use `npm ci` with the included lockfile. `private: true` prevents accidental npm publication. Remotion, FFmpeg and its enabled components, React and TypeScript retain their applicable upstream licences.

**Oswald Medium** and **Cormorant Garamond Semibold** are bundled locally with their SIL Open Font License texts in `public/`.

## Optional acoustic reruns

Stored cues and signal data suffice for rendering. Optional model reruns require downloads and may not reproduce observations bit for bit. Set `ALIGN_PYTHON` to the appropriate interpreter; otherwise the bridge uses `python3` from PATH. TypeScript orchestrates the workflow; inline Python bridges pretrained audio libraries.

| Package | Observed analysis version |
| --- | --- |
| torch | 2.13.0 |
| torchaudio | 2.11.0 |
| demucs | 4.1.0 |
| stable-ts | 2.19.1 |
| openai-whisper | 20250625 |
| soundfile | 0.13.1 |
| numpy | 2.5.2 |
| uroman | 1.3.1.1 |

This records the analysis environment, not a tested clean-install Python lock. Use a compatible torch/torchaudio build for the target platform. Optional model bridges were not rerun for publication; stored observations were preserved.

Models: HTDemucs `htdemucs`, Whisper `large-v3-turbo` and `large-v3`, torchaudio `MMS_FA`. Full large-v3 weights had SHA-256 `e5b1a55b89c1367dacf97e3e19bfd829a01529dbfdeefa8caeb59b3f1b81dadb`. Weights are not redistributed. Raw recognition includes rejected hallucinations and is not a replacement lyric sheet.

Prepare waveform inputs and rerun selected alignments:

```sh
ffmpeg -i source/audio-original.opus -ar 48000 -ac 2 -c:a pcm_f32le analysis/mix48.wav
ffmpeg -i source/audio-original.opus -ar 16000 -ac 1 -c:a pcm_f32le analysis/mix16.wav
node scripts/infer.ts separate
node scripts/align.ts mms vocals analysis/windows-continuous.json -continuous
node scripts/align.ts mms mix analysis/windows-boundary-refine.json -boundaries
node scripts/align.ts mms vocals analysis/windows-final-refine.json -final-refine
```

The bridge expects required model files in their caches; full large-v3 uses `models/`. Retained window JSON files specify bounded recognition experiments. The final cue builders include explicit editorial decisions beyond raw aligner output.

Regenerate spectrum and vocal motion:

```sh
ffmpeg -i public/soundtrack.m4a -map 0:a:0 -c:a pcm_f32le -f f32le analysis/audio-delivery.f32
node scripts/analyze.ts
ffmpeg -i analysis/vocals16.wav -c:a pcm_f32le -f f32le analysis/vocals16.f32
node scripts/vocal-features.ts
```

Keep the locked soundtrack unchanged to reproduce the delivered movie. Re-encoding audio or regenerating vocal separation creates new inputs needing fresh checks.
