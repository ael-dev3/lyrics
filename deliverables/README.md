# Tanisea vNext delivery

`Tanisea-Lyric-Film-vNext-60fps-Final.mp4` is the exact platform-safe MP4 supplied with this source snapshot. It was copied from the local Desktop export without re-encoding.

## Provenance

- Source project: [`projects/tanisea-lyric-film`](../projects/tanisea-lyric-film)
- Composition: `LyricFilmVNext`, 1080×1080, 60 fps, 9,180 frames, 153 seconds
- Video: HEVC Main 10, `hvc1`, `yuv420p10le`, BT.709, fast-start MP4
- Audio: stereo AAC, 44.1 kHz, 256 kbps platform-safe encode
- Platform audio treatment: 4 dB attenuation, bounded to the authoritative 153-second timeline
- Full-file SHA-256: see [`SHA256SUMS`](SHA256SUMS)

The authored source, timing data, bundled artwork/fonts/soundtrack, deterministic audio-feature artifact, render settings, delivery encoders, verifier, QC reports, and end-to-end workflow documentation are all kept in the repository. Build dependencies and generated render intermediates remain ignored; they can be recreated with the commands below.

## Reproduce and verify

```sh
cd projects/tanisea-lyric-film
npm ci
npm run features
npm run check
npm run render
npm run encode
npm run platform
npm run verify -- --platform-safe output/Tanisea-Lyric-Film-vNext-60fps-Final.mp4
```

`render` creates the high-quality 2× visual reference. `encode` makes the archival HEVC master while stream-copying the locked AAC soundtrack; `platform` copies the video and creates the platform-safe AAC track; `verify` checks codecs, dimensions, cadence, frame count, duration, color metadata, loudness, fast-start layout, and full decode.

The included media and fonts remain subject to their respective rights and licences.
