# Tanisea precision-sync vNext source

This directory contains the reproducible Remotion source, reviewed alignment data, deterministic audio features, render tools, and release gates for the 153-second Tanisea English lyric film.

The public claim is **sample-indexed alignment with frame-bounded rendering**. Timing is stored against the locked 44.1 kHz soundtrack as integer sample indices and converted to the nearest video frame only at render time.

## Quick start

Requirements:

- Node.js 20 or newer;
- npm;
- FFmpeg and FFprobe;
- a Chromium-compatible environment supported by Remotion.

```sh
npm ci
npm run features
npm run check
npm run dev
```

`npm run features` regenerates the checked audio feature package. `npm run check` runs strict typechecking, the complete test suite, browser-measured lyric layout, and Remotion composition discovery.

## Compositions

| Composition | Dimensions | Cadence | Frames | Purpose |
| --- | ---: | ---: | ---: | --- |
| `LyricFilmVNext` | 1080×1080 | 60 fps | 9,180 | Clean public master |
| `LyricFilmSyncProof` | 1080×1080 | 120 fps | 18,360 | Diagnostic synchronization proof |

Both compositions use `src/index.ts` as their entry point and the same sample-indexed alignment authority. The proof adds token, target, uncertainty, and signed frame-error overlays without changing the public design.

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

The first vocal act uses a `precision` presentation profile: its target is inactive before the nearest cue frame, fully emphasized on contact, and inactive at the exclusive cue end. C1 handoffs that would cover the next contact are shortened to that contact without changing the reviewed sample authority. V1 and C2 retain the approved `cinematic` three-frame attack and two-frame release. The same cue samples and profile rules drive the 120 fps proof.

## Audio features and spectrum

`public/audio-features.bin` stores 9,180 fixed-size records generated from `public/soundtrack.m4a`. Each record includes 64 logarithmic bands, sustained pressure, transient impact, low-end weight, brightness, emotional emphasis, line reach, momentary dBFS, and sample peak dBFS. `public/audio-features.manifest.json` records generation settings and hashes.

The public spectrum separates measurement from emphasis:

- a symmetric `[1, 2, 3, 2, 1]` kernel smooths adjacent frames and bands without phase delay;
- 7 px rounded bars, a continuous ember–teal–mint palette, and softer chrome reduce visual chatter;
- the measured core has at least 96 px of travel at the verified peak;
- the lighter transient cap extends the display by at most 18 px;
- the cap does not alter the measured magnitude;
- browser geometry checks preserve at least 36 px between lyrics and the maximum cap;
- all 64 measured bands and 64 caps remain inside the public safe area.

## Commands

| Command | Function |
| --- | --- |
| `npm run dev` | Open Remotion Studio |
| `npm run features` | Regenerate deterministic audio features |
| `npm run alignment:prepare` | Prepare decoded audio and alignment input artifacts |
| `npm run alignment:import` | Import reviewed external evidence into the alignment manifest |
| `npm run alignment:verify` | Verify token, cue, uncertainty, and cadence contracts |
| `npm run layout:verify` | Measure lyric/spectrum layout in Chromium |
| `npm run render` | Render and normalize the muted 2160×2160 4:4:4 reference |
| `npm run encode` | Downsample once, encode 10-bit HEVC, and copy original AAC |
| `npm run proof` | Render and verify the 120 fps proof |
| `npm run verify` | Full-decode and inspect a delivery artifact |
| `npm run qa:clips` | Generate deterministic contact sheets, clips, and selected frames |
| `npm run qa:run` | Execute and record the complete release matrix |
| `npm run qa:publish` | Finalize criterion 11 from verified remote release evidence |
| `npm run check` | Run source, test, layout, and composition gates |

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
npm run qa:run
```

The reference is 2160×2160 ProRes 4444 in BT.709. The public master is encoded from that reference as 1080×1080, 60 fps, 10-bit HEVC with the `hvc1` tag and `faststart`. The proof is 1080×1080 H.264 at 120 fps. Both final MP4 files copy the locked AAC packets without gain, normalization, or audio re-encoding.

Delivery verification checks container duration, dimensions, cadence, frame count, codec, pixel format, colour metadata, strict full decode, `moov` placement, audio stream geometry, packet identity, and exact timeline geometry.

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

See the [final QA report](../../audits/tanisea-final-qa-vnext.md), [v2.1 implementation report](../../docs/first-act-precision-v2.1-implementation.md), [full-system implementation report](../../docs/precision-sync-vnext-implementation.md), and [workflow evidence guide](../../docs/workflow-evidence.md). The supplemental release archive preserves the generated alignment provenance, both canonical QA runs, QA media, and final visual-review artifacts that remain excluded from source control.

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
