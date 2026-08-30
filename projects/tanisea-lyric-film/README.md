# Tanisea English lyric film — source snapshot

This directory contains the reproducible Remotion source used for the 153-second production master of “Закричу на весь мир (ksviety Remix)”. It includes the composition, lyric timing data, artwork, fonts, locked soundtrack, and dependency lockfile.

## Quick start

Requirements:

- Node.js 20 or newer;
- npm;
- the lockfile-pinned TypeScript compiler (`7.0.2`, installed by `npm ci`);
- a Chromium-compatible environment supported by Remotion.

Install and open Remotion Studio:

```sh
npm ci
npm run dev
```

Validate the composition:

```sh
npm run check
```

Render the source snapshot:

```sh
npm run render
```

This command preserves the historical production snapshot. It is not the vNext pixel-perfect render path: it does not yet pin PNG browser frames or BT.709 and it does not create the required 2× 4:4:4 reference. Follow the repository's [pixel-perfect visual workflow](../../docs/pixel-perfect-visual-workflow.md) for a new master.

## Composition

| Property | Value |
| --- | --- |
| Composition ID | `LyricFilm` |
| Dimensions | 1080×1080 |
| Frame rate | 30 fps |
| Duration | 4,590 frames / 153 seconds |
| Audio | `public/soundtrack.m4a` |
| Entry point | `src/index.ts` |
| Main composition | `src/LyricFilm.tsx` |
| Timing source | `src/timed-lyrics.ts` |
| Compiler | TypeScript `7.0.2`, strict and exact-pinned |

## TypeScript source contract

All authored project modules use `.ts` or `.tsx`; the earlier JavaScript/JSX source has been migrated without intentionally changing timing, animation, audio, or visual output. `npm run typecheck` is a blocking pre-render gate, and `npm run check` combines strict typechecking with Remotion composition discovery.

Future source, analysis generators, cue validators, and reusable motion components must follow the repository's [TypeScript-first workflow](../../docs/typescript-first-workflow.md). Upgrade the exact compiler pin only after the documented strict checks, fixtures, and representative render comparisons pass.

## Visual architecture

The film is rendered as one composition with persistent layers:

1. locked soundtrack;
2. artwork and camera motion;
3. reactive halo and colour response;
4. deterministic particle atmosphere;
5. intro, break, lyric, or original-title content state;
6. spectrum equalizer;
7. frame chrome and timecode;
8. final master fade.

The outro is not an overlay on an encoded video. It runs inside the same live artwork, audio-reactive, atmospheric, and framing system as the rest of the film.

## Scientific visualization status

The checked-in 56-bar equalizer is a deterministic artistic visualization built from real FFT data. It is not a calibrated analyzer: it reads one stereo channel, uses a short unwindowed transform, applies non-linear gain and clipping, includes duplicate low-frequency band ranges, and has no frequency or level scale.

The current baseline is assessed at approximately **5/10 scientific fidelity**. Before calling a future version scientifically accurate, implement and pass the repository's [10/10 scientific audio-visualization specification](../../docs/scientific-audio-visualization.md). Its key distinction is **millisecond-resolved analysis with frame-accurate 60 fps visualization**, not a false claim of 1 ms video refresh.

The current cinematic response also compresses multiple audio behaviors into one `masterLevel`, while soundtrack energy adds only a small amount to the outro line width. The vNext [clean emotional audio-reactive motion specification](../../docs/emotional-audio-reactive-motion.md) separates sustained pressure, transient impact, low-end weight, and human emotional accents so lines remain restrained most of the time and reach much farther on exceptional musical peaks.

## Important timing status

This is the exact production-source snapshot from 2026-08-30, not the proposed vNext implementation. The subsequent audit identified timing regressions in the first verse and second chorus, plus a structural issue where lyric entrance/exit animation shares the vocal start/end values.

Before creating a new master:

1. read the [full timing audit](../../audits/tanisea-ksviety-remix.md);
2. apply the [machine-readable vNext cue map](../../audits/tanisea-ksviety-remix.json);
3. separate vocal timing from visual entrance and exit windows;
4. implement the [non-linear semantic-highlighting model](../../docs/first-project-retrospective.md) so source cues can target English meaning groups independently of display order;
5. implement and validate the [scientific audio-analysis and instrument-rail target](../../docs/scientific-audio-visualization.md);
6. generate and validate the [clean emotional audio-reactive motion envelope](../../docs/emotional-audio-reactive-motion.md);
7. replace the system Cyrillic fallback, recover sufficiently resolved artwork, and pass the [pixel-perfect visual contract](../../docs/pixel-perfect-visual-workflow.md);
8. preview and listen to the high-risk windows;
9. perform a complete real-time audiovisual review.

## Production export

The release master was rendered as high-quality HEVC and then remuxed with the untouched original AAC stream. See the repository's [production workflow](../../docs/production-workflow.md) for the overall sequence and the [pixel-perfect visual workflow](../../docs/pixel-perfect-visual-workflow.md) for the stricter vNext reference, colour, downsampling, and artifact gates.

## Media and rights

The included soundtrack, artwork, fonts, names, and other media remain subject to their respective rights and licences. They are included for this project and its continued production work; verify rights before any unrelated redistribution or commercial reuse.
