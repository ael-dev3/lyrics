# Tanisea precision-sync vNext source

This directory contains the reproducible Remotion source, reviewed alignment data, deterministic audio features, render tools, and release gates for the 153-second Tanisea English lyric film, including the approved square master and a native 16:9 YouTube edition.

The public claim is **sample-indexed alignment with frame-bounded rendering**. Timing is stored against the locked 44.1 kHz soundtrack as integer sample indices and converted to the nearest video frame only at render time.

## Quick start

Requirements:

- Node.js 20 or newer;
- npm;
- FFmpeg and FFprobe;
- a Chromium-compatible environment supported by Remotion.

`npm run qa:clips` probes the local FFmpeg filter list before drawing labeled
contact and release sheets. It uses FFmpeg's `drawtext` filter when available.
If a valid FFmpeg build omits that optional filter, it automatically uses the
checked-in `scripts/render-qa-contact-sheet.py` compositor with Python 3 and
Pillow, plus the tracked `public/SpaceGrotesk.ttf` font. This fallback only
labels already-extracted QA frames; it never changes source timing or the
production/proof masters.

```sh
npm ci
npm run features
npm run check
npm run dev
```

`npm run features` regenerates the checked audio feature package. `npm run check` runs strict typechecking, the complete test suite, browser-measured lyric layout, and Remotion composition discovery.

## Compositions

| Composition                 | Dimensions | Cadence | Frames | Purpose                                      |
| --------------------------- | ---------: | ------: | -----: | -------------------------------------------- |
| `LyricFilmVNext`            |  1080×1080 |  60 fps |  9,180 | Approved square public master                |
| `LyricFilmSyncProof`        |  1080×1080 | 120 fps | 18,360 | Square diagnostic synchronization proof      |
| `LyricFilmYouTube`          |  1920×1080 |  60 fps |  9,180 | Native landscape regular-YouTube composition |
| `LyricFilmYouTubeSyncProof` |  1920×1080 | 120 fps | 18,360 | Landscape diagnostic synchronization proof   |

All four compositions use `src/index.ts` as their entry point and the same sample-indexed alignment authority. Each proof adds token, target, uncertainty, and signed frame-error overlays without changing its public design.

## Alignment data model

`alignment/tanisea-word-alignment-v3.json` is bound to the soundtrack SHA-256 and contains:

- 24 source lines;
- 102 Russian tokens with integer start/end samples, confidence, uncertainty, and evidence records;
- 74 stationary English target segments;
- 74 semantic cues that map one or more source tokens to one or more English targets;
- explicit activation direction for non-linear source/translation order;
- independently reviewed timing for each repeated chorus performance.

Runtime validation rejects non-integer samples, reversed or overlapping token intervals, cue events outside vocal windows, unknown IDs, missing evidence on lower-confidence boundaries, invalid repeated sections, and cadence errors outside the specified bounds.

The observed maximum semantic-cue boundary errors are `8.321995 ms` at 60 fps and `4.002268 ms` at 120 fps. The reviewed timing authority and complete tables are in the [alignment report](../../audits/tanisea-word-alignment-v3.md).

## Semantic focus

English words remain in fixed positions. The render computes focus from active semantic cues rather than rebuilding the line as progress text. This allows forward, backward, repeated, and simultaneous activation while keeping layout stationary.

The first build lines (`C1-01` through `C1-04`) retain the `precision` presentation profile. The complete repeated first-chorus window (`C1-05` through `C1-08`, including the `00:40–00:50` review range) uses an affine fit of the approved `C2-05`–`C2-08` word choreography: three-frame emphasis attack, two-frame focus release, cue-stage rail progression, and cinematic line handoffs all retain their relative C2 timing while being fitted to the C1 performance window. `cues` retain the independently reviewed C1 source samples and semantic targets; `presentationCues` are the explicitly derived visual schedule. The diagnostic proof and QA contact/release sheets report both clocks so the public timing transformation remains inspectable.

## Audio features and spectrum

`public/audio-features.bin` stores 9,180 fixed-size records generated from `public/soundtrack.m4a`. Each record includes 64 logarithmic bands, sustained pressure, transient impact, low-end weight, brightness, emotional emphasis, line reach, momentary dBFS, and sample peak dBFS. `public/audio-features.manifest.json` records generation settings and hashes.

The public spectrum separates measurement from emphasis:

- a symmetric `[1, 2, 3, 2, 1]` kernel smooths adjacent frames and bands without phase delay;
- 7 px square-ended spectrum lines, a restrained ember/teal split with no neutral interpolation, and softer chrome reduce visual chatter;
- the measured core has at least 96 px of travel at the verified peak;
- the lighter transient cap extends the display by at most 18 px;
- the cap does not alter the measured magnitude;
- browser geometry checks preserve at least 36 px between lyrics and the maximum cap;
- all 64 measured bands and 64 caps remain inside the public safe area.

The 16:9 edition increases the lower rail to 1,712 px and 9 px square-ended
lines, while retaining the same 64 authoritative feature bands and no
phase-delaying visual smoothing.

## Commands

| Command                     | Function                                                          |
| --------------------------- | ----------------------------------------------------------------- |
| `npm run dev`               | Open Remotion Studio                                              |
| `npm run features`          | Regenerate deterministic audio features                           |
| `npm run alignment:prepare` | Prepare decoded audio and alignment input artifacts               |
| `npm run alignment:import`  | Import reviewed external evidence into the alignment manifest     |
| `npm run alignment:verify`  | Verify token, cue, uncertainty, and cadence contracts             |
| `npm run layout:verify`     | Measure lyric/spectrum layout in Chromium                         |
| `npm run render`            | Render and normalize the muted 2160×2160 4:4:4 reference          |
| `npm run encode`            | Downsample once, encode 10-bit HEVC, and copy original AAC        |
| `npm run proof`             | Render and verify the 120 fps proof                               |
| `npm run youtube:reference` | Render the muted 1920×1080 ProRes 4444 YouTube reference          |
| `npm run youtube:encode`    | Encode the 1920×1080 H.264/AAC YouTube upload delivery            |
| `npm run youtube:render`    | Run the 16:9 reference and delivery stages                        |
| `npm run youtube:proof`     | Render and remux the 1920×1080 120 fps sync proof                 |
| `npm run youtube:verify:delivery` | Strictly verify the 16:9 master and upload delivery          |
| `npm run youtube:verify`    | Strictly verify master, delivery, and optional 120 fps proof      |
| `npm run verify`            | Full-decode and inspect a delivery artifact                       |
| `npm run qa:clips`          | Generate deterministic contact sheets, clips, and selected frames |
| `npm run qa:run`            | Execute one named release-matrix run (`TANISEA_QA_RUN=run-1|run-2`) |
| `npm run qa:publish`        | Finalize criterion 11 from verified remote release evidence       |
| `npm run workflow:package`  | Build the sanitized supplemental workflow archive                 |
| `npm run check`             | Run source, test, layout, and composition gates                   |

Scripts that accept artifact paths take them after `--`. Their defaults target the checked project layout and `output/`.

## Render and delivery pipeline

```sh
npm run render
npm run encode
npm run proof
npm run verify -- --kind reference
npm run verify -- --kind public
npm run verify -- --kind proof
npm run qa:clips
TANISEA_QA_RUN=run-1 npm run qa:run
TANISEA_QA_RUN=run-2 npm run qa:run
```

The reference is 2160×2160 ProRes 4444 in BT.709. The public master is encoded from that reference as 1080×1080, 60 fps, 10-bit HEVC with the `hvc1` tag and `faststart`. The proof is 1080×1080 H.264 at 120 fps. Both final MP4 files copy the locked AAC packets without gain, normalization, or audio re-encoding.

The landscape pipeline is deliberately independent so it cannot silently alter
the square release:

```sh
npm run youtube:reference
npm run youtube:encode
npm run youtube:verify:delivery
```

It renders a muted 1920×1080 ProRes 4444 reference, encodes a 60 fps H.264/AVC
upload delivery with 4 dB platform-safety attenuation, and verifies the two
delivery artifacts with a full decode. The optional 120 fps diagnostic proof
can be rendered and included in a fuller audit with `npm run youtube:proof`
followed by `npm run youtube:verify`; it remuxes the original AAC packet stream.
The detailed implementation record is in the
[v2.5.0 landscape implementation note](../../docs/youtube-16x9-v2.5.0-implementation.md).

The [sanitized workflow and production-preference record](../../docs/track-workflow-preferences-and-known-issues.md) captures the preview-first review method, reference-window comparison, aspect-ratio rules, QA sequence, publication boundary, and the known future-refinement checkpoint around `00:47`.

Delivery verification checks container duration, dimensions, cadence, frame count, codec, pixel format, colour metadata, strict full decode, `moov` placement, audio stream geometry, packet identity, and exact timeline geometry.

## Release publication workflow

The two QA runs are intentionally separate and must start with no stale `work/qa/run-1`, `work/qa/run-2`, or tracked `audits/tanisea-final-qa-vnext.*` outputs. The first run records its full command ledger and QA media; the second reproduces it, compares every stable artifact, and writes the pre-publication audit.

Publish the six stable release assets (production master, sync proof, hero image, project source archive, alignment JSON, and alignment report), plus the two QA reports and `CHECKSUMS.sha256`. The source archive is a Git archive of `projects/tanisea-lyric-film` at the release source commit, so it contains the exact Remotion source, scripts, reviewed alignment, soundtrack, artwork, fonts, deterministic features, and tests used for the render.

After downloading those eight release files and checking their SHA-256 values against `CHECKSUMS.sha256`, record the verified release URL, source commit, asset sizes, and hashes in `work/release-publication.json`, then run:

```sh
npm run qa:publish
```

That command upgrades the final audit from `passed-prepublication` to `passed-publication`. The supplemental workflow archive then preserves the two QA records, command logs, generated contact/release media, visual-review artifacts, and manifest without duplicating the final media or source archive.

Create it only after `qa:publish` and after recording the release verification, with the immutable source revision that was used for the source archive:

```sh
TANISEA_RELEASE_SOURCE_COMMIT=<40-character-release-commit> npm run workflow:package
```

The packer refuses pre-existing output paths, rejects symlinks, uses repository-relative manifest paths, and replaces local checkout/home paths in text evidence before it creates the public ZIP.

## QA evidence

The release matrix verifies:

1. locked source identity;
2. complete build and test execution;
3. sample-indexed alignment authority;
4. measured uncertainty bounds;
5. reviewed semantic mapping;
6. non-linear and repeated-section behavior;
7. public and proof cadence;
8. clean public chrome and upper field;
9. lyric, spectrum, and safe-area layout;
10. repeated QA with no unexplained artifact drift;
11. publication assets, checksums, and documentation.

See the [final QA report](../../audits/tanisea-final-qa-vnext.md), [v2.5.0 landscape implementation note](../../docs/youtube-16x9-v2.5.0-implementation.md), [v2.4.1 correction record](../../docs/first-act-and-outro-polish-v2.4-implementation.md), [v2.4.0 historical baseline](../../docs/cinematic-parity-v2.4-implementation.md), [v2.3 implementation report](../../docs/first-act-semantic-sync-v2.3-implementation.md), [v2.2 implementation report](../../docs/first-act-polish-v2.2-implementation.md), [v2.1 implementation report](../../docs/first-act-precision-v2.1-implementation.md), [full-system implementation report](../../docs/precision-sync-vnext-implementation.md), and [workflow evidence guide](../../docs/workflow-evidence.md). The supplemental release archive preserves the generated alignment provenance, both canonical QA runs, QA media, and final visual-review artifacts that remain excluded from source control.

## Source layout

```text
alignment/    reviewed timing and semantic mapping
public/       soundtrack, artwork, fonts, and audio features
scripts/      generation, render, encode, verification, and QA tools
src/          compositions, timing adapters, and components
tests/        unit, integration, browser, media, and release gates
output/       generated local media; excluded from source control
work/         generated local evidence; excluded from source control
```

## Media and rights

The soundtrack, artwork, names, fonts, and other included media remain subject to their respective rights and licences. Confirm the necessary rights before redistribution or commercial use. Playfair is included under the SIL Open Font License in `public/Playfair-OFL.txt`.
