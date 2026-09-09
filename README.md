# Lyrics

Music films with synchronized lyrics, meaning-linked translations, and audio-reactive visuals. This repository contains the projects, production workflows, and verification evidence behind each edition.

[**Roi × Adore**](#roi--adore) · [**TikTok edition**](#tiktok-edition) · [**Tanisea**](#tanisea) · [**Build and workflow**](#build-and-workflow)

## Roi × Adore

**VIDEOCLUB — Roi × adore — Did I Tell U That I Miss U**

A blue-toned lyric film for two overlapping vocal tracks. French lyrics appear alongside their English translation, while the second song has an independent English lyric lane. Original animation, stable typography, and separate spectrum and expressive motion controls carry the design across landscape and vertical editions.

![Roi × Adore: French lyrics, English translation and independent English vocals over blue animation](assets/roi-adore-rebuild-125-8.png)

*Frame from the final landscape movie at 02:05.800.*

| Edition | Format | Duration | Video / audio |
| --- | --- | --- | --- |
| Landscape | 1920×1080 · 60 fps | 6:19 | HEVC Main 10 / AAC |
| Vertical | 1080×1920 · 60 fps | 6:19 | H.264 / AAC |

Both editions preserve the locked AAC packets and lyric timeline. The project includes 49 French cues with English translation, 22 English cues, and 504 timed highlight units. The visualizer measures 64 stereo frequency bands on a fixed dBFS RMS scale; expressive motion is controlled separately.

### Film and production downloads

| Download | Contents |
| --- | --- |
| [Landscape film](https://github.com/ael-dev3/lyrics/releases/download/roi-adore-rebuild-v1.0.0/Roi-x-Adore-Lyric-Film-Rebuilt-1080p60.mp4) | Final 1080p60 master |
| [Complete production archive · 1.27 GB](https://github.com/ael-dev3/lyrics/releases/download/roi-adore-rebuild-v1.0.0/Roi-x-Adore-Complete-Production.zip) | Editable project, media, fonts, stems, alignment inputs, analysis, dependency lock and setup instructions |
| [Original source video](https://github.com/ael-dev3/lyrics/releases/download/roi-adore-rebuild-v1.0.0/roi-x-did-i-tell-u-that-i-miss-u-source.mkv) | Untouched downloaded stream |
| [10-second preview](https://github.com/ael-dev3/lyrics/releases/download/roi-adore-rebuild-v1.0.0/Roi-x-Adore-Immersive-Review.mp4) | Short review of the visual treatment |
| [Verification](https://github.com/ael-dev3/lyrics/releases/download/roi-adore-rebuild-v1.0.0/Roi-x-Adore-Verification.json) · [Checksums](https://github.com/ael-dev3/lyrics/releases/download/roi-adore-rebuild-v1.0.0/CHECKSUMS.sha256) | Landscape delivery QA and original release asset hashes |

[Full release](https://github.com/ael-dev3/lyrics/releases/tag/roi-adore-rebuild-v1.0.0) · [Production record](docs/roi-adore-rebuild.md) · [Source and evidence](projects/roi-adore-rebuild/README.md) · [Asset inventory](docs/roi-adore-release-files.md) · [Original upload](https://www.youtube.com/watch?v=11tjwUK2adU)

<details>
<summary>Additional frame and verification details</summary>

![Independent English focus with the French lane in a title state](assets/roi-adore-rebuild-239.png)

*Final landscape movie at 03:59.000.*

- Full decoding passed for both editions: 22,762 delivered video frames each.
- AAC packet identity and delivered-file SHA-256 were verified.
- All 71 lyric cues were checked in two browser focus states.
- Maximum measured cue-boundary rounding error is 8.1667 ms at 60 fps. This describes frame placement, not the accuracy of inferred vocal boundaries; dense overlapping vocals retain uncertainty.
- The selected 1080p60 source is YouTube’s upscaled derivative of native 720p60 material.

The production archive includes a per-file manifest. Installed dependencies, downloadable model weights, regenerable frame caches and temporary encode trials are excluded. See the [production record](docs/roi-adore-rebuild.md) for calibration, rendering methods and limitations.

</details>

### TikTok edition

The vertical adaptation places animation above both lyric lanes, with the spectrum below and space around the content for platform controls. The publishing kit includes the caption, all cover variants, generation prompts, adaptation scripts and verification files.

| Download | Contents |
| --- | --- |
| [Vertical film](https://github.com/ael-dev3/lyrics/releases/download/roi-adore-rebuild-v1.0.0/Roi-x-Adore-TikTok-1080x1920-60fps.mp4) | Full-length 9:16 video at 60 fps |
| [Publishing kit](https://github.com/ael-dev3/lyrics/releases/download/roi-adore-rebuild-v1.0.0/Roi-x-Adore-TikTok-Publishing-Kit.zip) | Covers, caption, prompts, scripts and QA |
| [Landscape cover · 4:3](https://github.com/ael-dev3/lyrics/releases/download/roi-adore-rebuild-v1.0.0/Roi-Cover-Landscape-4x3.jpg) · [Portrait cover · 3:4](https://github.com/ael-dev3/lyrics/releases/download/roi-adore-rebuild-v1.0.0/Roi-Cover-Profile-3x4.jpg) | 1600×1200 and 1200×1600 alternatives |
| [Verification](https://github.com/ael-dev3/lyrics/releases/download/roi-adore-rebuild-v1.0.0/Roi-x-Adore-TikTok-Verification.json) · [TikTok checksums](https://github.com/ael-dev3/lyrics/releases/download/roi-adore-rebuild-v1.0.0/TIKTOK-CHECKSUMS.sha256) | Vertical delivery QA and TikTok asset hashes |

[Browse the TikTok material and reproduction notes](projects/roi-adore-rebuild/tiktok/README.md).

## Tanisea

**Tanisea & ksviety — Закричу на весь мир (Remix)**

The first lyric-film project pairs Russian vocals with meaning-linked English highlights. Its warm ember and teal design established the typography, timing and verification workflow used as a starting point for Roi × Adore.

<img src="assets/tanisea-vnext-hero.png" width="640" alt="Tanisea lyric-film design with English translation and an audio-reactive spectrum">

The published square edition runs for 153 seconds at 1080×1080 and 60 fps. Its source records Russian vocal timing as sample indices and maps English phrases to the corresponding meaning, including changes in word order. A separate 120 fps proof exposes timing evidence for inspection.

| Published download · v2.4.0 | Contents |
| --- | --- |
| [Production master](https://github.com/ael-dev3/lyrics/releases/download/v2.4.0/Tanisea-Lyric-Film-Production-Master-vNext.mp4) | Square HEVC Main 10 film with retained AAC |
| [120 fps sync proof](https://github.com/ael-dev3/lyrics/releases/download/v2.4.0/Tanisea-Lyric-Film-Sync-Proof-120fps.mp4) | Diagnostic timing render |
| [Source archive](https://github.com/ael-dev3/lyrics/releases/download/v2.4.0/Tanisea-Lyric-Film-Source-vNext.zip) | Source corresponding to the published edition |
| [Workflow evidence](https://github.com/ael-dev3/lyrics/releases/download/v2.4.0/Tanisea-Lyric-Film-Workflow-Evidence-vNext.zip) | Alignment, generated QA and production evidence |
| [QA report](https://github.com/ael-dev3/lyrics/releases/download/v2.4.0/tanisea-final-qa-vnext.md) · [Checksums](https://github.com/ael-dev3/lyrics/releases/download/v2.4.0/CHECKSUMS.sha256) | Published verification and asset hashes |

[Source project](projects/tanisea-lyric-film/README.md) · [Alignment report](audits/tanisea-word-alignment-v3.md) · [Original versus lyric-film comparison](docs/original-vs-lyric-film-comparison.md)

The repository also contains later chorus corrections and a landscape composition. These are distinct from the published v2.4.0 files above; see [release status and history](docs/release-status.md) before selecting a source revision or download.

## Build and workflow

Each project has its own setup instructions. Use the release source archive when reproducing a particular published movie.

| Project | Starting point |
| --- | --- |
| Roi × Adore | Download the complete production archive and follow its included README; the Git snapshot documents the source and evidence |
| TikTok adaptation | Follow the [vertical reproduction notes](projects/roi-adore-rebuild/tiktok/README.md) after preparing the production inputs |
| Tanisea | Follow the [project quick start](projects/tanisea-lyric-film/README.md#quick-start) for Node.js, FFmpeg and Remotion setup |

The reusable workflow covers soundtrack locking, lyric alignment, semantic translation, visual design, calibrated audio features, rendering and delivery verification:

- [Production workflow](docs/production-workflow.md)
- [First-pass song workflow](docs/first-pass-song-workflow.md)
- [Visual production workflow](docs/pixel-perfect-visual-workflow.md)
- [Scientific audio visualization](docs/scientific-audio-visualization.md)
- [Emotional audio-reactive motion](docs/emotional-audio-reactive-motion.md)
- [Production preferences and known issues](docs/track-workflow-preferences-and-known-issues.md)

## Repository structure

```text
assets/                          Film screenshots and artwork
projects/roi-adore-rebuild/       Roi × Adore source and evidence snapshot
  tiktok/                        Vertical adaptation and publishing material
projects/tanisea-lyric-film/      Tanisea Remotion project
projects/roi-slowdown-lyric-film/ Historical dual-song implementation
docs/                            Production guides and implementation records
audits/                          Timing and quality reports
deliverables/                    Earlier tracked delivery snapshot
```

## Release history

The Roi × Adore rebuild supersedes the earlier [Roi × Slow Down v1.0.1 edition](https://github.com/ael-dev3/lyrics/releases/tag/roi-slowdown-v1.0.1). Earlier source, timing evidence and downloads remain available for provenance.

[All published releases](https://github.com/ael-dev3/lyrics/releases) · [Release status and version notes](docs/release-status.md)

## Media and credits

Music, original animation, artwork and fonts remain subject to their respective rights and licences. Source attribution is included in the song records and publishing material. AI-assisted cover artwork and its generation prompts are identified in the TikTok publishing kit. Playfair’s licence is included in the [Tanisea font assets](projects/tanisea-lyric-film/public/Playfair-OFL.txt).
