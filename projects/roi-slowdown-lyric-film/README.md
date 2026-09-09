> **Newer completed edition:** see the [Roi × Adore rebuild](../roi-adore-rebuild/README.md) and [production record](../../docs/roi-adore-rebuild.md) for the light-blue film, French translations, refined timing, and calibrated spectrum. This project documents the historical v1.0.1 release.

# Roi × Slow Down dual-song lyric film

This project applies the repository’s precision lyric-film workflow to the YouTube mix `roi x did i tell u that i miss u` (`11tjwUK2adU`). It preserves the downloaded source as a separate provenance artifact and renders a clean 1920×1080 public master at 60 fps with two clearly separated lyric lanes:

- Song 1: `Roi` — French, warm rail;
- Song 2: `Slow down / Did I tell you that I miss you?` — English, cool rail.

The selected YouTube stream is the highest available 1080p60 option (`303-sr`, AI-upscaled). YouTube’s native maximum for this video was 720p60. The locked source is 379.437 seconds, with 22,763 video frames at 60 fps.

## Reproduce the workflow

Requirements: Node.js 20+, npm, FFmpeg/FFprobe, Python 3.13+, and a Chromium-compatible Remotion environment.

```powershell
npm ci
python -m pip install --user yt-dlp faster-whisper

# 1. Acquire and fingerprint the source; keep the source separate from the master.
python -m yt_dlp --no-playlist --write-info-json --write-thumbnail `
  --merge-output-format mp4 `
  --ffmpeg-location node_modules/@remotion/compositor-win32-x64-msvc `
  --output work/source/roi-slowdown-source.%(ext)s `
  -f "303-sr+140" "https://youtu.be/11tjwUK2adU"

# 2. Decode the exact mixed audio and run both language passes.
$ff = (Resolve-Path node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe).Path
& $ff -y -i work/source/roi-slowdown-source.mp4 -vn -ac 1 -ar 16000 -c:a pcm_s16le work/roi-slowdown-mono-16k.wav
python work/transcribe_whisper.py work/roi-slowdown-mono-16k.wav work/whisper-transcript.json small auto
python work/transcribe_whisper.py work/roi-slowdown-mono-16k.wav work/whisper-fr.json small fr
python work/transcribe_whisper.py work/roi-slowdown-mono-16k.wav work/whisper-en.json small en

# 3. Keep lyric text in src/lyrics.ts; review every onset/offset against both
#    language transcripts and waveform/spectrogram evidence, then export samples.
npm run alignment:verify

# 4. Run source/build/layout gates.
npm run typecheck
npm run test:run
npm run compositions

# 5. Render the clean public master and separate 120-fps diagnostic proof.
npm run render:master
npm run render:proof

# 6. Full-decode both outputs, write the machine QA report, and hash artifacts.
npm run verify:media -- output/Roi-x-Slow-Down-Lyric-Film-1080p60.mp4
npm run verify:media -- output/Roi-x-Slow-Down-Sync-Proof-120fps.mp4
npm run qa:report
npm run package:checksums
```

## Timing authority

`alignment/roi-slowdown-dual-song-v1.json` is generated from `src/lyrics.ts`. It stores integer sample indices against the locked source hash at 44,100 Hz. Word cues are lane-local, so overlapping vocals never compete for one global “current lyric.” The evidence note and confidence are retained on every line; low-confidence boundaries are intentionally visible in the report instead of being presented as measured fact.

The workflow uses a multi-anchor process for future songs: acquire the best source, decode once, transcribe each language separately, mark section anchors, correct each line against waveform/spectrogram evidence, convert seconds to integer samples only once, render, then inspect both public and proof frames. Do not shift a whole song with an unverified global offset.

## Visual system

The background preserves the source 16:9 picture without stretching. The public overlay uses stable upper/lower lanes, warm/cool identity, fixed positions, word-level emphasis, and two smooth SVG rails. The visualizer has no particles, dots, caps, or bar swarm; its motion is bounded and continuous so simultaneous lyrics remain easy to read.

## Outputs

| Artifact | Purpose |
| --- | --- |
| `output/Roi-x-Slow-Down-Lyric-Film-1080p60.mp4` | Clean public master, 1920×1080, 60 fps, source audio retained through the composition |
| `output/Roi-x-Slow-Down-Sync-Proof-120fps.mp4` | Diagnostic proof with sample intervals and frame metadata |
| `alignment/roi-slowdown-dual-song-v1.json` | Song 1/Song 2 sample-indexed timing authority |
| `work/release/roi-slowdown-release-qa.json` | Machine-readable release evidence |
| `work/release/CHECKSUMS.sha256` | Artifact hashes |
| `work/whisper-transcript.json`, `work/whisper-fr.json`, `work/whisper-en.json` | Automatic and forced-language transcription evidence |

The final master and source are copied to the Desktop only after strict media verification. Release assets are published from the repository root README with Song 1/Song 2 labels.

## License, credits and AI disclosure

Project-owned workflow contributions are licensed under [CC BY 4.0](../../LICENSE.md), subject to the stated scope and third-party exclusions. Source music, lyrics, artwork, animation, fonts and dependencies retain their original rights. Mixed films and covers are not wholly CC-licensed assets. See [creator credits](../../CREDITS.md) and the [AI use disclosure](../../AI-DISCLOSURE.md).
