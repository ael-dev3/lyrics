# Source audio features

`public/audio-features.json` contains measured visualizer input from `public/source.mp4`. Rebuild it from the project root with:

```sh
node scripts/analyze-audio.ts
```

The analyzer requires Node 24, `ffmpeg` and `ffprobe`; it has no npm dependencies. It hashes the original MP4, decodes its first audio stream to 22,050 Hz stereo float PCM, and computes features on the **24000/1001 fps source video clock**. Source hash: `8a37587959dcfef6b9a91d84498d819cd782fc2b78f2edb923cbb63c1fdc19a5`. The recording yields 5,660,160 decoded samples (256.696599 s), 6,153 picture frames, and 6,155 feature rows. The two final feature rows retain the audio tail beyond the last picture frame.

## JSON layout and lookup

`schemaVersion` is 1. `analysis` records the decode settings, support windows, frame rate and frame count. `encoding.bandEdgesHz` has 25 ascending edges for 24 logarithmic bands from 40 to 10,000 Hz. `rows` is a compact array of 6,155 arrays, each with **26 unsigned 8-bit integer values**:

```text
[rms, transient, band0, band1, …, band23]
```

At source time `t` seconds, look up `frame = clamp(floor(t * 24000 / 1001), 0, rows.length - 1)`. This is a source-clock lookup; it has no dependency on browser elapsed time, play speed, aspect ratio, or seek history. Linear interpolation with the next row is optional for display only. The source picture ends before the audio does, so the preview can hold its final picture through the last audio feature rows.

`rms` and each band decode to `-96 + value * 96 / 255` dBFS. Zero clamps power at or below -96 dBFS. RMS is the mean power of the two original channels in a centered 40 ms window. Each band is stereo mean-square power in its frequency interval, from a centered 4,096-sample Hann FFT (185.76 ms); the Hann power loss is compensated. The bands sum **power**, rather than averaged bin magnitudes. Excluded frequencies below 40 Hz and above 10 kHz mean band power need not equal broadband RMS. The 185.76 ms spectral support intentionally smooths the visualizer and cannot locate a sharp event to a single frame.

`transient` decodes to `value * 18 / 255` dB of positive rise, capped at 18 dB. Within each source frame interval, the analyzer checks 20 ms RMS and high-frequency-sensitive first-difference power every 5 ms, comparing each with a window 20 ms earlier. It keeps the strongest positive rise after a -50 dBFS RMS gate. This is an attack-strength display proxy; it does not assert beat, syllable, cut, or word timestamps. The first and last analysis windows clip to the available decoded audio, and FFT samples outside the recording are zero-padded.

## Energy guide from the measured rows

The bins below are fixed clock intervals, **not inferred song sections**. dBFS figures are decoded from the quantized RMS row; transient P90 is the decoded positive-rise proxy. Creative tiers should be chosen after viewing and listening to the source picture and recording.

| Source interval | RMS median | RMS P90 | Transient P90 | Objective impression |
| --- | ---: | ---: | ---: | --- |
| 0–16 s | -15.1 dBFS | -7.9 dBFS | 3.7 dB | Lower opening level |
| 16–32 s | -8.7 | -6.8 | 11.9 | Stronger short rises |
| 32–64 s | -4.9 | -3.0 | 6.4 | Loud body |
| 64–96 s | -3.8 | -3.0 | 3.0 | Loud, steadier |
| 96–160 s | -4.1 | -3.0 | 4.9 | Loud body |
| 160–192 s | -4.5 | -3.4 | 7.0 | More short rises |
| 192–240 s | -4.1 | -3.4 | 2.9 | Loud, steadier |
| 240–256.697 s | -33.9 | -15.8 | 3.7 | Extended level decline |

Keep visual display curves separate from these measurements. For example, a renderer may map RMS from -30 to -3 dBFS into a restrained height range and attenuate glow on the 240 s onward decline; neither changes the acoustic values or lyric timing.
