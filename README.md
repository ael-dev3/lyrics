<div align="center">
  <img src="assets/tanisea-vnext-hero.png" width="760" alt="Lossless hero frame from the Tanisea precision-synced English lyric film">
  <h1>Tanisea — Precision-Synced English Lyric Film</h1>
  <p><strong>Sample-indexed Russian vocal alignment, semantic English focus, and verified frame-bounded rendering.</strong></p>
  <p>
    <a href="https://github.com/ael-dev3/lyrics/releases/download/v2.0.0/Tanisea-Lyric-Film-Production-Master-vNext.mp4">Production master</a>
    ·
    <a href="https://github.com/ael-dev3/lyrics/releases/download/v2.0.0/Tanisea-Lyric-Film-Sync-Proof-120fps.mp4">120 fps sync proof</a>
    ·
    <a href="projects/tanisea-lyric-film">Source project</a>
    ·
    <a href="audits/tanisea-final-qa-vnext.md">Final QA</a>
  </p>
  <p>
    <code>1080 × 1080</code>
    <code>60 fps</code>
    <code>153 seconds</code>
    <code>HEVC 10-bit</code>
    <code>AAC 44.1 kHz</code>
  </p>
</div>

## What this release demonstrates

Tanisea is a complete 9,180-frame Remotion lyric film built against a locked 153-second soundtrack. Russian vocal boundaries are stored as integer sample indices. Each reviewed source group activates the English phrase carrying the same meaning, including backward activation where source and translation order differ.

The public composition keeps diagnostics out of the picture. A separate 120 fps proof exposes source tokens, target segments, sample indices, confidence, uncertainty, and frame error for inspection.

The implementation includes:

- 24 reviewed vocal lines, 102 source tokens, 74 English segments, and 74 semantic cues;
- a deterministic 64-band audio feature package with one record per 60 fps frame;
- semantic focus that supports forward, backward, repeated, and simultaneous targets;
- a bottom spectrum with at least 96 px of measured core travel and a distinct transient cap of up to 18 px;
- a clean upper field, mobile-safe lyric geometry, persistent frame chrome, and a native original-title outro;
- 4:4:4 reference rendering followed by one controlled 1080×1080 delivery conversion;
- packet-identical AAC audio in the production master and synchronization proof.

## Measured synchronization bounds

Public characterization: **sample-indexed alignment with frame-bounded rendering**.

| Measure | Verified result |
| --- | --- |
| Timing authority | Integer sample indices at 44,100 Hz |
| Maximum reviewed token uncertainty | 882 samples / 20.000 ms |
| Maximum 60 fps cue-boundary frame error | 8.321995 ms, within the 8.334 ms bound |
| Maximum 120 fps cue-boundary frame error | 4.002268 ms, within the 4.167 ms bound |
| Public cadence | 60 fps / 9,180 frames |
| Proof cadence | 120 fps / 18,360 frames |

The [reviewed alignment report](audits/tanisea-word-alignment-v3.md) lists every token and semantic cue with source samples, uncertainty, evidence methods, and signed frame error. The [machine-readable alignment](projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json) is the render authority.

## Release files

| Artifact | Purpose |
| --- | --- |
| [Production master](https://github.com/ael-dev3/lyrics/releases/download/v2.0.0/Tanisea-Lyric-Film-Production-Master-vNext.mp4) | 1080×1080, 60 fps, 10-bit HEVC `hvc1`, original AAC |
| [Synchronization proof](https://github.com/ael-dev3/lyrics/releases/download/v2.0.0/Tanisea-Lyric-Film-Sync-Proof-120fps.mp4) | 1080×1080, 120 fps diagnostic render, original AAC |
| [Source archive](https://github.com/ael-dev3/lyrics/releases/download/v2.0.0/Tanisea-Lyric-Film-Source-vNext.zip) | Tracked Remotion project files at the release source revision |
| [Alignment JSON](https://github.com/ael-dev3/lyrics/releases/download/v2.0.0/tanisea-word-alignment-v3.json) | Reviewed sample-indexed timing and semantic mapping |
| [QA JSON](https://github.com/ael-dev3/lyrics/releases/download/v2.0.0/tanisea-final-qa-vnext.json) | Machine-readable build, media, layout, and repeatability evidence |
| [Checksums](https://github.com/ael-dev3/lyrics/releases/download/v2.0.0/CHECKSUMS.sha256) | SHA-256 values for the release package |

## Build the source

Requirements: Node.js 20 or newer, npm, FFmpeg, FFprobe, and the Chromium runtime supported by Remotion.

```sh
cd projects/tanisea-lyric-film
npm ci
npm run features
npm run check
```

Open the composition or render the 2× reference:

```sh
npm run dev
npm run render
```

Delivery and QA commands are documented in the [project README](projects/tanisea-lyric-film/README.md). The [implementation report](docs/precision-sync-vnext-implementation.md) connects the data model, render architecture, media outputs, and verification evidence.

## Repository map

```text
assets/                              lossless repository hero
audits/tanisea-word-alignment-v3.md reviewed timing evidence
audits/tanisea-final-qa-vnext.*     final human- and machine-readable QA
docs/precision-sync-vnext-implementation.md
projects/tanisea-lyric-film/
  alignment/                         render-authoritative sample data
  public/                            locked media, fonts, audio features
  scripts/                           generation, render, encode, and QA tools
  src/                               Remotion compositions and visual system
  tests/                             timing, layout, media, and release gates
```

## QA status

The release gate covers strict typechecking, 1,000+ assertions, browser-measured layout, composition discovery, full media decode, codec and colour metadata, AAC packet identity, selected encoded frames, generated QA media, and two independent executions of the final matrix. Publication evidence and immutable asset URLs are recorded in the [final QA report](audits/tanisea-final-qa-vnext.md).

## Media and rights

The soundtrack, artwork, names, fonts, and other included media remain subject to their respective rights and licences. Confirm the necessary rights before redistribution or commercial use. Playfair is included under the SIL Open Font License in `projects/tanisea-lyric-film/public/Playfair-OFL.txt`.
