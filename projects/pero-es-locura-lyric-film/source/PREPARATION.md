# Source preparation

The selected source is [Fémina — Pero es locura — Vivo en La Oreja Negra](https://www.youtube.com/watch?v=uvLVcEBIn-4), uploaded by FLAN Audiovisual. Production is credited to La Oreja Negra and realization to FLAN Audiovisual.

From the project directory, using yt-dlp, FFmpeg and Node with TypeScript support:

```sh
yt-dlp --js-runtimes node --no-playlist -f 137+140 --merge-output-format mp4 --write-info-json -o 'public/source.%(ext)s' 'https://www.youtube.com/watch?v=uvLVcEBIn-4'
ffmpeg -i public/source.mp4 -map 0:a:0 -c:a copy public/soundtrack.m4a
ffmpeg -i public/soundtrack.m4a -f f32le -acodec pcm_f32le -ar 44100 -ac 2 analysis/audio-delivery.f32
node scripts/prepare-source.ts
```

Keep the recording and raw metadata local. The preparation check compares all AAC packet payload hashes, timestamps, durations, sizes and side data before accepting the extracted soundtrack. The manifest distinguishes the presented audio duration from decoded codec padding. Source video is 24000/1001 fps; planned graphics are 60 fps without claiming new detail in the performance footage.

No gain, time offset or tempo change is applied. Preserve the final audio beyond the final picture. Both supplied Spanish references are retained alongside the performed sequence. Source preparation establishes recording identity; word accuracy has its own review.
