# Tanisea English lyric film — 60 fps vNext source

This directory contains the reproducible Remotion source for the 153-second “Закричу на весь мир (ksviety Remix)” English lyric film. The composition is rebuilt from source as one continuous piece; the outro is not an image placed over an earlier export.

## Quick start

Requirements:

- Node.js 20 or newer;
- npm;
- FFmpeg and FFprobe;
- a Chromium-compatible environment supported by Remotion.

Install, regenerate deterministic audio features, and validate:

```sh
npm ci
npm run features
npm run check
```

Open Remotion Studio:

```sh
npm run dev
```

Render the muted 4:4:4 reference master:

```sh
npm run render
```

The final compact delivery is encoded from that reference and muxed with the original AAC stream without gain, normalization, or audio re-encoding.

Encode and verify the default local delivery path:

```sh
npm run encode
npm run platform
npm run verify
```

The archival master retains the source AAC packet-for-packet. `platform` copies the verified video and makes a separate high-bitrate AAC version with a transparent `4 dB` reduction, targeting approximately `−10 LUFS` and no more than `−1 dBTP`. The scripts accept explicit paths after `--`; use `npm run verify -- --platform-safe path.mp4` for the platform copy.

## Composition

| Property | Value |
| --- | --- |
| Composition ID | `LyricFilmVNext` |
| Dimensions | 1080×1080 |
| Frame rate | 60 fps |
| Duration | 9,180 frames / 153.000 seconds |
| Audio | `public/soundtrack.m4a`, stereo AAC, 44.1 kHz |
| Entry point | `src/index.ts` |
| Main composition | `src/LyricFilm.tsx` |
| Timing source | `src/timed-lyrics.ts` |
| Feature reader | `src/audio-features.ts` |
| Feature generator | `scripts/generate-audio-features.ts` |
| Compiler | TypeScript `7.0.2`, strict and exact-pinned |

## QC-derived timing contract

Both external reports are preserved byte-for-byte: the [synchronization/production QC report](../../audits/Tanisea_Lyric_Film_Sync_QC_Report.md) and the independent [timing/animation/lyric QA audit](../../audits/Tanisea_Lyric_Film_Timing_QA_Audit.md). Their implemented reconciliation is available as [JSON](../../audits/tanisea-vnext-qc-implementation.json) and [Markdown](../../audits/tanisea-vnext-qc-implementation.md).

The implementation stores both 24-onset measurements and uses their rounded midpoint:

- entrance motion begins `240 ms` before the vocal;
- the main lyric is fully legible `50 ms` / three frames before onset;
- active semantic highlighting begins on the measured onset;
- outgoing text completes its final fade by the next onset;
- repeated choruses share one normalized semantic marker stack;
- the reconciled verse entrance is `01:04.06`;
- the original Russian title begins its transition at `01:58.20`.

Runtime assertions make timing failures render-blocking. They verify segment/cue parity, cue bounds, target IDs, adjacent handoffs, and repeated-chorus marker consistency.

## Editorial precedence

The report's optional natural-English edits were applied except where the user had explicitly approved wording. These three lines remain verbatim:

- `Night in the silence freezes helplessly;`
- `I'll fold the peaks of every mountain`
- `And raise the ocean`

The literal English title remains primary. The naturalized title appears only as a small translation under the original Russian outro title.

## Audio-feature package

`npm run features` decodes the locked soundtrack and generates:

- `public/audio-features.bin` — 9,180 fixed-size records, one per rendered frame;
- `public/audio-features.manifest.json` — source checksum, analysis settings, percentiles, authored accents, event counts, line-width statistics, schema, and artifact checksum.

Each record contains 64 logarithmic stereo-combined bands, sustained pressure, transient impact, low-end weight, brightness, human-authored emotional emphasis, rare hero state, line reach, momentary dBFS, and sample peak dBFS. The spectral range is 20 Hz–20 kHz with a Hann window and documented 80 dB display range.

The visualization claim is intentionally precise: **millisecond-resolved analysis with frame-accurate 60 fps visualization**. The video updates every `16.667 ms`; it does not pretend to display at 1 kHz.

## Visual architecture

The film is one composition with persistent layers:

1. locked soundtrack;
2. native-grid artwork and section-sensitive colour response;
3. deterministic particles and scan texture;
4. clean pressure/impact/emotion motion lines;
5. intro, interlude, lyric, or four-stage original-title outro state;
6. calibrated-looking 64-band instrument rail with frequency labels and dBFS readouts;
7. frame chrome and 60 fps timecode;
8. exact final fade.

Critical lyrics were moved 50 px upward for mobile-safe readability. Inactive words use brighter luminance and a consistent dark shadow. The interlude develops halfway through, and the instrumental outro progresses through Russian title, English translation, restrained separation, and artist/remix end card.

## Pixel and font controls

- Artwork is held at its native 1080×1080 raster without the earlier under-resolved zoom.
- Space Grotesk, Bebas Neue, and Cyrillic-capable Playfair are bundled and loaded through a render delay.
- Synthetic font styles are disabled.
- Geometry is rounded to the final pixel grid where practical.
- PNG browser frames, explicit BT.709 metadata, and a 4:4:4 ProRes reference precede the optimized delivery encode.
- The final delivery uses 10-bit HEVC with the `hvc1` compatibility tag and `faststart`; the original AAC is stream-copied.

## TypeScript source contract

All authored source and analysis code uses `.ts` or `.tsx`. `npm run typecheck` is a blocking no-emit gate, and `npm run check` combines strict typechecking with Remotion composition discovery. Future work follows the repository's [TypeScript-first workflow](../../docs/typescript-first-workflow.md).

## Supporting specifications

- [QC report implementation record](../../audits/tanisea-vnext-qc-implementation.md)
- [Scientific audio-visualization target](../../docs/scientific-audio-visualization.md)
- [Pixel-perfect visual workflow](../../docs/pixel-perfect-visual-workflow.md)
- [Clean emotional audio-reactive motion](../../docs/emotional-audio-reactive-motion.md)
- [Production workflow](../../docs/production-workflow.md)
- [QA checklist](../../docs/qa-checklist.md)

## Media and rights

The included soundtrack, artwork, fonts, names, and other media remain subject to their respective rights and licences. They are included for this project and its continued production work; verify rights before unrelated redistribution or commercial reuse. Playfair is bundled under the SIL Open Font License in `public/Playfair-OFL.txt`.
