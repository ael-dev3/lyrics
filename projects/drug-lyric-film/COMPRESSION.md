# TikTok alternate below 10 MB

The full 1080×1920, 60 fps portrait delivery remains the quality master. A separate size-limited copy contains the complete recording at 720×1280, 30 fps, H.264/YUV420P and stereo AAC. No lyric map, scene, Desktop kit or master movie is modified.

The delivered alternate is **9,902,066 bytes (9.902066 decimal MB)** with SHA-256 `50f1430a908c8a88fd402bdda37b3f2682bed993d4a4c5bfb2ba778409dd33f0`. [Verification](evidence/compression-verification.json) records the exact input, codec options, stream properties and 4,503 checked frame timestamps.

## Reproduction

From a copy of the original upload kit, use FFmpeg 8.1.2 with libx264. The first pass measures the complete picture before the bitrate-constrained encode. Use a fresh output location and preserve the original kit.

```sh
mkdir -p compression
ffmpeg -nostdin -hide_banner -loglevel warning \
  -i TikTok/Drug-REDCHINAWAVE-TikTok-1080x1920-60fps.mp4 \
  -map 0:v:0 -vf 'fps=30,scale=720:1280:flags=lanczos,setsar=1' \
  -c:v libx264 -preset slow -b:v 450k -pix_fmt yuv420p \
  -pass 1 -passlogfile compression/x264 -an -f null /dev/null
ffmpeg -nostdin -n -hide_banner -loglevel warning \
  -i TikTok/Drug-REDCHINAWAVE-TikTok-1080x1920-60fps.mp4 \
  -map 0:v:0 -map 0:a:0 \
  -vf 'fps=30,scale=720:1280:flags=lanczos,setsar=1' \
  -c:v libx264 -preset slow -b:v 450k -pix_fmt yuv420p \
  -pass 2 -passlogfile compression/x264 \
  -c:a aac -b:a 64k -ac 2 -movflags +faststart -map_metadata -1 \
  compression/Drug-REDCHINAWAVE-TikTok-Under-10MB.mp4
```

Measure the actual output size against **10,000,000 bytes**. Two-pass bitrate estimates still need a final size check; do not use a file-size truncation flag that could cut off the ending. Verify complete strict decoding, stream starts, duration, aspect ratio, frame timestamps and a readable lyric frame before copying. Other FFmpeg/x264 versions may produce different bytes or size.

## Verification and limits

The complete encoded audio and video decode successfully. All 4,503 picture timestamps follow `n / 30`, both streams start at zero, and the Desktop copy matches the checked SHA-256. The 150.1-second picture covers the complete 150.07-second AAC soundtrack with a brief final-frame hold. The 86.2-second comparison keeps readable животное / animal focus and the artwork/city.

The alternate trades resolution, frame cadence and AAC bitrate for the upload-size limit. AAC is re-encoded; the master films' original-audio packet identity does not apply to this file. Word states follow the 33.333 ms output-frame grid. No new per-word listening attestation is inferred from compression checks.
