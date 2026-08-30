<div align="center">
  <img src="assets/tanisea-original-title.jpg" width="760" alt="Original Russian title frame from the Tanisea English lyric film">
  <h1>Lyrics Video Lab</h1>
  <p><strong>Source-first lyric films where translation, typography, motion, and music land as one complete piece.</strong></p>
  <p>
    <a href="https://github.com/ael-dev3/lyrics/releases/latest/download/Tanisea-Lyric-Film-Production-Master.mp4">Download the final master</a>
    ·
    <a href="projects/tanisea-lyric-film">Browse the source</a>
    ·
    <a href="audits/tanisea-ksviety-remix.md">Read the timing audit</a>
  </p>
  <p>
    <code>Remotion 4</code>
    <code>1080 × 1080</code>
    <code>30 fps</code>
    <code>153 seconds</code>
    <code>HEVC hvc1</code>
  </p>
</div>

## What we are building

This repository is a practical lab for making lyric videos feel like authored motion-design films—not subtitles placed over an image and not last-minute patches over an encoded export.

The goal is a repeatable production system that:

- begins with a locked soundtrack and verified lyric source;
- treats source-language transcription, English translation, and performance timing as separate layers;
- aligns English semantic groups to the words actually being performed;
- keeps lyric timing separate from animation entrance and exit timing;
- builds intros, verses, choruses, breaks, and outros inside one visual language;
- regenerates the complete film from source after every meaningful change;
- preserves source audio quality while delivering a compact final file;
- separates calibrated audio measurements from artistic audio-reactive motion;
- reports analysis resolution, video cadence, units, transforms, and uncertainty honestly;
- controls source resolution, font loading, raster scale, colour conversion, chroma, and codec artifacts through measurable visual gates;
- records remaining uncertainty honestly so the next render can improve.

## Current case study

### Tanisea — “Закричу на весь мир (ksviety Remix)”

The first project is a 153-second English lyric film rebuilt from its local Remotion source. The final section no longer uses unrelated or mismatched lyric animation: it resolves into the original Russian title while the same artwork, camera drift, particles, reactive halo, equalizer, frame chrome, and colour system continue underneath.

| Deliverable | Purpose | Link |
| --- | --- | --- |
| Production master | Compact, full-length HEVC delivery with the untouched original AAC soundtrack | [Download MP4](https://github.com/ael-dev3/lyrics/releases/latest/download/Tanisea-Lyric-Film-Production-Master.mp4) |
| Source-reference export | The earlier synced H.264 render used for visual and timing comparison | [Download MP4](https://github.com/ael-dev3/lyrics/releases/latest/download/Tanisea-Lyric-Film-Source-Reference.mp4) |
| Reproducible source archive | Remotion project, artwork, fonts, soundtrack, package lock, and timing data | [Download ZIP](https://github.com/ael-dev3/lyrics/releases/latest/download/Tanisea-Lyric-Film-Source-v1.0.0.zip) |
| Browsable source | The same project files directly in the repository | [Open project](projects/tanisea-lyric-film) |

### What changed in the production rebuild

- Recovered and rebuilt the complete animation from the original Remotion project.
- Removed the late wild-chant sequence that did not correspond cleanly to the performed words.
- Designed a native original-title outro rather than covering the old export with a replacement image.
- Retained live artwork motion, deterministic particles, spectrum-driven animation, and frame chrome through the ending.
- Rendered all 4,590 frames as one continuous composition.
- Delivered a 66.2 MB HEVC master with `hvc1`, `faststart`, and the original AAC stream copied bit-for-bit.
- Audited every displayed line and stored a machine-readable cue map for the next timing pass.

## Production model

```mermaid
flowchart LR
    A[Locked soundtrack] --> B[Verified source lyrics]
    A --> M[Calibrated audio feature package]
    M --> N[Scientific reference tests]
    B --> C[English translation]
    A --> D[Word and phrase timing]
    C --> E[Semantic cue map]
    D --> E
    E --> F[Remotion composition]
    N --> F
    A --> F
    F --> G[Section previews]
    G --> H[Timing and visual QA]
    H -->|revise| E
    H -->|approve| I[Full source render]
    I --> J[Original-audio remux]
    J --> K[Production master]
    K --> L[Full decode, data, and checksum audit]
```

The important distinction is between **vocal time** and **visual time**. A lyric can have the correct timestamp and still feel late if its blur and opacity animation only begins when the singer starts. The line should normally be fully legible at vocal onset, while word-group highlighting remains locked to the performance.

## Audit status and vNext

The current production master is visually coherent and technically verified. A deeper timing audit also found specific sync debt that should be addressed in the next source render:

- the first verse vocal begins around `60.09`, while the current break-card handoff waits until `64.08`;
- several second-chorus lines drift between `0.25` and `1.53` seconds late;
- the final clear chorus line remains until `118.00`, although the repeated title vocal begins around `116.05`;
- the current lyric component adds `0.32–0.50` seconds of perceived entrance lag through its visual envelope.

Nothing is hidden behind “close enough.” The [human-readable audit](audits/tanisea-ksviety-remix.md) explains every line, and the [machine-readable audit](audits/tanisea-ksviety-remix.json) contains the restored vNext cue windows.

### Honest first-project assessment

The audited result scores **8/10 overall as a first project of this type**. Art direction, technical mastering, and reproducibility are already strong; lyric synchronization and bilingual editorial alignment are the limiting areas. Because synchronization is a core function of a lyric film, the major first-verse and second-chorus misses prevent the higher-scoring production strengths from making this a 10/10 master.

The [full retrospective and semantic-highlighting proposal](docs/first-project-retrospective.md) records the scorecard, improvement order, and a vNext design that allows English meaning groups to activate forwards, backwards, repeatedly, or simultaneously when Russian and English phrase order differs.

### 10/10 scientific audio target

The current equalizer is truthfully audio-reactive but not a calibrated analyzer; its scientific fidelity is assessed at approximately **5/10**. The vNext goal is a documented **10/10 internal engineering target**: stereo, windowed and calibrated spectral analysis; sample-indexed transient events; ITU/EBU loudness and true peak; published units and band edges; deterministic artifacts; reference-signal tests; and a sharper 60 fps instrument display.

The approved claim is **“millisecond-resolved analysis with frame-accurate visualization.”** At the proposed 60 fps, the image updates every `16.667 ms`; stored events may be reported to 1 ms without pretending the video itself refreshes every millisecond. The [scientific audio-visualization specification](docs/scientific-audio-visualization.md) defines the architecture, visual language, numerical tolerances, references, and pass/fail rubric.

### 10/10 pixel-perfect visual target

The vNext visual contract now controls the entire raster-to-delivery path: sufficiently resolved assets, bundled font coverage, final-grid geometry, 2× PNG rendering, explicit BT.709 conversion, 4:4:4 reference frames, 4:2:0 stress tests, one documented downsample, a codec-quality ladder, decoded-frame comparisons, and temporal artifact review.

The current source audit exposed four specific blockers before a new master can claim 10/10 visual quality: the render script permits JPEG intermediates, Remotion 4 colour conversion is not explicitly pinned to BT.709, the zoomed 1080px artwork is under-resolved for a 2× reference, and the Russian title uses a host-dependent system font. The [pixel-perfect visual workflow](docs/pixel-perfect-visual-workflow.md) records the evidence, fixes, commands, preflight card, acceptance rubric, and blocking failures.

## Repository map

```text
assets/
  tanisea-original-title.jpg       README hero captured from the final master
audits/
  tanisea-ksviety-remix.md         complete timing and translation review
  tanisea-ksviety-remix.json       machine-readable current/recommended cue map
docs/
  first-project-retrospective.md    scorecard and non-linear highlighting design
  pixel-perfect-visual-workflow.md  deterministic raster, colour, chroma, and artifact contract
  production-workflow.md           end-to-end production method
  qa-checklist.md                  editorial, audiovisual, and delivery QA
  scientific-audio-visualization.md 10/10 measurement and display target
projects/
  tanisea-lyric-film/              reproducible Remotion source snapshot
```

## Run the source project

```sh
cd projects/tanisea-lyric-film
npm ci
npm run dev
```

Validate and render:

```sh
npx remotion compositions src/index.jsx
npm run render
```

The checked-in `npm run render` command reproduces today's production source snapshot; it is not the vNext pixel-perfect master path. Before making a vNext master, apply the timing recommendations, refactor visual entrance/exit windows away from vocal cue boundaries, and follow the [2× PNG/BT.709 reference and decoded-delivery workflow](docs/pixel-perfect-visual-workflow.md).

## Working principles

1. Work from animation source—not from a previously encoded video.
2. Lock the exact soundtrack before timing anything.
3. Verify the exact remix structure; do not assume repeated choruses share timing.
4. Use automatic speech recognition as evidence, never as the final authority.
5. Align translated meaning in semantic groups rather than forcing false one-to-one word timing or artificial left-to-right progress.
6. Keep calibrated measurements separate from documented artistic transforms.
7. Make every section feel native to the same design system.
8. Prefer an honest title state over invented lyrics when the vocal becomes unclear or heavily processed.
9. Review the actual audiovisual clip; contact sheets alone cannot prove sync.
10. Compare the decoded delivery to a locked high-quality visual reference; the Studio preview cannot prove encoded quality.
11. Re-render the entire composition and verify the delivered master end to end.

## Documentation

| Document | What it answers |
| --- | --- |
| [First-project retrospective](docs/first-project-retrospective.md) | How strong was the first result, what prevents a 10/10 score, and how should non-linear bilingual highlighting work? |
| [Scientific audio target](docs/scientific-audio-visualization.md) | What would make the audio visualization scientifically defensible, testable, sharp, and worthy of the internal 10/10 target? |
| [Pixel-perfect visual workflow](docs/pixel-perfect-visual-workflow.md) | How do we preserve sharp geometry, deterministic type, BT.709 colour, gradients, chroma, motion, and decoded codec quality without visual artifacts? |
| [Production workflow](docs/production-workflow.md) | How do we take a soundtrack from lyric authority through timing, animation, rendering, and delivery? |
| [QA checklist](docs/qa-checklist.md) | What must pass before a lyric film is production-ready? |
| [Tanisea timing audit](audits/tanisea-ksviety-remix.md) | Where does the current film still differ from the performed audio or source meaning? |
| [Tanisea cue data](audits/tanisea-ksviety-remix.json) | What exact timestamps should a future implementation restore? |

## Roadmap

- [x] Recover the original local source project.
- [x] Rebuild the ending inside the native visual system.
- [x] Preserve the original soundtrack in the compact master.
- [x] Audit all 24 displayed lines.
- [x] Publish source, reference export, production master, and documentation.
- [x] Define the 10/10 scientific audio-visualization contract and verification rubric.
- [x] Define the 10/10 pixel-perfect visual contract, current-source risk audit, and artifact gates.
- [ ] Separate vocal windows from visual animation windows.
- [ ] Restore the audited vNext cue map.
- [ ] Implement semantic cue targets that support intentional backward, repeated, and simultaneous activation.
- [ ] Complete a fluent Russian/English editorial approval pass.
- [ ] Build the deterministic multi-resolution stereo analysis pipeline and fixture suite.
- [ ] Replace the artistic 56-bar baseline with a calibrated 64-band, 60 fps instrument rail.
- [ ] Validate loudness, true peak, spectrum, stereo behavior, event timing, and rendered values independently.
- [ ] Replace the host-dependent Cyrillic title font and recover artwork at `2700×2700` minimum.
- [ ] Pin PNG intermediates and BT.709, then build the 2× preflight card and repeat-frame hash tests.
- [ ] Complete a downsampling bake-off, codec ladder, decoded-frame diff, and temporal artifact audit.
- [ ] Render and publish the vNext production master.

## Media and rights

The case-study media and project assets are provided for this production and its continued improvement. Music, artwork, fonts, artist names, and other third-party materials remain subject to their respective rights and licences. Verify redistribution and commercial-use rights before reusing the assets outside this project.
