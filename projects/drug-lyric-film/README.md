# Друг — REDCHINAWAVE

**Verified films · Russian / English · 16:9 and 9:16 · 60 fps · v2**

![Decoded final film with source illustration, paired animal focus and a layered city](evidence/final-youtube-26.200.jpg)

*Decoded YouTube frame 1,572 at 26.200 s, corresponding to original picture 786, with животное / animal focus. [Final still provenance](evidence/final-stills.json). Original music and illustration: [REDCHINAWAVE's official audio](https://www.youtube.com/watch?v=SXAReusgEC0).*

The original woman, ravens and city remain the center of the film. The source's red sky continues into an illustrated reading area. Three depths of fixed buildings use distinct rooftops, perspective sides, window frames and masonry. Measured music changes occupied-window light rather than moving the skyline. Three small ravens follow separate curved routes with turns, banks and varied glide/wingbeat phases. Crisp, stationary Russian and English text shares the same focus strength.

## Status

- The complete 150.071-second source plays with its original soundtrack and actual decoded picture. The square illustration is intentionally still; source decoding continues.
- Twenty-two cues contain 93 separately selected Russian events and 128 corresponding English tokens. Small grammar words retain their own source events; necessary English expansions share complete meaning spans.
- TypeScript checks, seven contract tests and all 44 cue layouts pass. The scene proof covers 442 glyph placements, 186 start/end visibility checks and 260 target-focus states across both layouts.
- The owner accepted the current complete preview after the translation correction and authorized this exact production. Granular listening fields remain separately unlogged in [REVIEW.json](source/REVIEW.json); [current authorization](source/PRODUCTION-AUTHORIZATION.json) records the scoped basis without an assistant listening claim.
- Both movies contain 9,005 pictures at 60 fps. Every PTS, strict complete decoding and original AAC packet/decoded PCM identity pass. No unintended full-frame black interval was found.
- Each format supplies 388 decoded scene frames and 4,043 glyph-state checks. All 221 Russian/English tokens appear focused and neutral; 221 deliberately delayed timing controls are detected. [Wide verification](evidence/final-landscape-verification.json) · [Portrait verification](evidence/final-portrait-verification.json).
- The weak final filtered repeat at **111.212–111.820 s** retains its selected interpretation and model uncertainty. Technical delivery checks do not resolve ambiguous acoustic ownership independently.

## Upload kit

The **REDCHINAWAVE — Друг — Upload Kit** Desktop folder contains 13 files: both complete videos, a 1920×1080 YouTube thumbnail, a 1200×1600 portrait TikTok cover, YouTube title/description, TikTok description, optional Russian/English/bilingual SRTs, README, delivery inventory and checksums. All delivered bytes match the prepared kit. [Desktop receipt](evidence/desktop-delivery.json) · [Posting files](publishing-kit/README.txt) · [Delivery inventory](publishing-kit/DELIVERY.json).

Public Git contains source, features, mapping/timing, covers, copy, captions and verification receipts. Original source and full movies remain local and ignored. No platform upload or public media release is recorded.

## Reproduce the complete preview

Use Node 24 or newer, FFmpeg/ffprobe and the exact source recording at `public/source.mp4`. [recording.json](source/recording.json) binds its SHA-256, complete duration and native picture. The source binary and private analysis media remain ignored.

```sh
npm ci
npm run check
npm run identity
npm run proof
npm run preview
```

The server uses `http://127.0.0.1:4337/`. Review controls include both formats, exact seeks, 1×/0.75×/0.5× speed, animation comparison, fullscreen, the untouched source reference and recovery. Reload after rebuilding the client; no hot reload is assumed.

`node scripts/build-timeline.ts` rebuilds the selected map without model downloads. `npm run features` recomputes raw source-audio measurements. Input changes invalidate the current review identity. Production commands and exact encoded checks are documented in [the approved delivery process](PRODUCTION-DELIVERY.md); stale or missing authorization blocks rendering.

## Read next

[Production decisions and lessons](PRODUCTION-NOTES.md) · [Production and verification](PRODUCTION-DELIVERY.md) · [Agent handoff](AGENT-HANDOFF.md) · [Timing selections](source/selected-boundaries.json) · [Competing acoustic observations](source/acoustic-observations.json) · [Translation correspondences](source/editorial-and-correspondence.json) · [Review scope](evidence/cross-language-sync-review.md) · [Native-library adapters](scripts/acoustic/README.md)

Typography: Oswald Medium, supplied with its [OFL license](public/fonts/Oswald-OFL.txt). Original music/artwork is credited to REDCHINAWAVE and the linked recording; no separate illustrator identity is inferred.
