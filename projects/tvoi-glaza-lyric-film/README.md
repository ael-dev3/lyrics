# POLNALYUBVI — Твои глаза / Your Eyes

A Russian / English lyric film using the Lyrics production workflow in general. Original animation and recording are retained. Both languages receive equal serif typography, stable positions and color-only word/meaning emphasis.

**The project owner completed review, reported no mistakes and authorized full rendering.** Frozen timings and translations are retained. Detailed listening telemetry was not supplied; the review record distinguishes this user attestation from measured technical checks.

## Delivery

- Landscape: 1920×1080, 60 fps.
- Portrait: 1080×1920, 60 fps.
- 10,094 frames / 168.233333 s of video; original AAC soundtrack / 168.228571 s.
- HEVC Main 10, hvc1, BT.709; original AAC packets and timestamps copied unchanged.
- 26 cues; all 154 Russian tokens and 195 English words receive their complete mapped emphasis.
- English meaning can highlight in a different reading order from Russian. Grammatical completions share their source event; they receive no invented timestamps.

See [final verification](evidence/final-verification.md), [review record](evidence/cross-language-sync-review.md), `evidence/frame-audit.json` and the per-format `.verification.json` reports for acceptance and technical evidence. Numerical checks do not claim mathematically perfect acoustic alignment.

## Render from frozen inputs

With Node.js 24+, FFmpeg/FFprobe (libx265) and the original media listed in `source/input-manifest.json`:

    npm ci
    npm run check
    node scripts/audit-frames.ts
    node scripts/geometry.ts
    npm run sync:gate
    npm run render -- --format landscape
    npm run render -- --format portrait

Every production entry point checks the current review and hashes. Production captures PNG frames at 2× into eight contiguous ProRes 4444 segments, checks resumable segment identities, downsamples once and encodes the final HEVC video. The audio is never normalized, retimed or re-encoded. The last source picture is held for the short audio tail.

The decoded-focus audit also checks the actual color of every visible Russian and English word in every delivery frame. Final verification checks all decoded video timestamps against the exact 60 fps clock, frame count, dimensions, pixel aspect, codec/range/color, full strict decode and all original AAC packet payloads, timestamps and durations. Source video is 2560×1440 at 30 fps; 2× rendering improves added typography, not the source animation's temporal or spatial detail.

## Review and diagnostics

    node_modules/.bin/esbuild src/review-client.ts --bundle --format=esm --outfile=review/client.js
    node scripts/review-server.ts

Open http://127.0.0.1:4317. The player uses the actual recording with the same scene, layout and source clock as production. It exposes waveform/spectrogram views, independent timing candidates and editable proposals. Save notes before reloading. Proposals do not overwrite source data or approve a new production revision.

    node scripts/render.ts --diagnostic --format landscape --start 57 --duration 14
    node scripts/render.ts --diagnostic --format portrait --start 57 --duration 14

Historical SYNC-DRAFT clips are short diagnostics, separate from final masters.

## Analysis and evidence

Set `ALIGN_PYTHON` to an environment containing the recorded model dependencies only when rebuilding analysis. Embedded Python bridges invoke pretrained models; authored DSP, mapping, layout, focus, render and QA code is TypeScript. Rendering uses frozen inference artifacts and needs no models or fresh inference. A model rerun requires renewed review and is not assumed byte-identical.

- `source/input-manifest.json`: media identity, clocks, toolchain and hashes.
- `source/text-and-mapping.json`: complete bilingual correspondence ledger.
- `analysis/boundary-ledger.json`: selected boundaries and independent candidates.
- `evidence/translation-review.md`: full English meaning and grammatical expansions.
- `evidence/cross-language-sync-review.{md,json}`: user sign-off and frozen hashes.
- `evidence/geometry-check.json`: 1,540 focus-boundary states / 698 stable word boxes.
- `evidence/frame-audit.json`: every delivery frame, visibility and target coverage.
- `publishing/captions/`: Russian, English and bilingual line-level SRT files. The film's word emphasis is encoded in the source JSON and render, since SRT does not carry that behavior.

Media delivery is local. Third-party recording and animation are not licensed for redistribution by this project's source license.

## Original creators

[Official recording and animation](https://www.youtube.com/watch?v=qC4sCCmvoXU): music and lyrics by Марина Демещенко / POLNALYUBVI; animation by Юлия Чайковская / ORAMAI; backgrounds and illustrations by Алина Чайковская / FINITO (FINITOLINA). Credits come from the official upload description.

Added translation, lyric presentation and production by Ael, assisted by OpenAI Codex. The contribution follows the Lyrics workflow in general. No particular song is attributed as design inspiration.
