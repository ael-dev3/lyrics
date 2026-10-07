# Agent handoff

## State

- Full bilingual preview: `trup-nevesty-preview-v1-acoustic`; 28 cues, 184 Russian events, 258 English tokens.
- Canonical `public/source.mp4` identity: `source/recording.json`. Preserve original picture and sound.
- Both formats keep the full illustration; the six strings are the visualizer, veil and ring are supporting material glints.
- Final **нету** variant is documented; the literal supplied sheet remains separately preserved.
- Nine tests and complete native proof stills pass. Real-browser transport/completeness checks pass. Full listening scope and render approval remain pending.
- No production MP4, Desktop kit, delivery verification or media release exists for this song.

Read root `AGENTS.md`, [README](README.md), [production decisions](PRODUCTION-NOTES.md), [timing method](TIMING-METHOD.md), and `source/REVIEW.json`. Shared [preview-first](../../docs/preview-before-render.md) and [cross-language review](../../docs/cross-language-sync-gate.md) requirements apply.

## Resume

With the locked original present: `npm ci`, `npm run check`, `npm run identity`, `npm run preview`. Default loopback port 4335; `PORT` changes it. The server verifies original/timeline/scene hashes, supports byte ranges and serves an explicit allowlist. Private extractor metadata and analysis are never routes.

Both formats, reduced speed, exact-second seeks, original reference, animation A/B and Restore preview already exist. Verify actual picture and visible glyphs. Deliberate source stillness is different from stalled decoding. The shared scene also drives `npm run proof`: 34 complete-picture stills and eight A/B stills, without encoding a production film.

## Inputs

`source/lyrics-editorial.json` owns translation/contributors; `public/timeline.json` owns selected samples and reading windows. `scripts/build-timeline.ts` uses raw private observations when available, otherwise committed observations with matching source/token identity; missing/stale evidence is a hard error. `scripts/prepare-reference.ts` needs private extractor metadata/native PCM and rewrites editorial inputs; use intentionally rather than overwriting a reviewed revision blindly.

`npm run features` rebuilds original-source music measurements. `scripts/prepare-material.ts` refits actual strings, hand occlusion, veil and ring from the canonical reference. Inspect any regenerated coordinates before accepting them. Source motion, ownership, grammar and decoration are separate contracts; global timing shifts are not corrections.

After timing, scene, font, reference, feature or transport edits, run `npm run identity` and rebuild. Identities appear on the canvas. Changed inputs clear active approval; unchanged inputs preserve it. Record future listener/owner evidence faithfully without public conversation quotations. `npm run render:gate` must pass before adding or starting any full encoder/capture.

## Next scope

Deliver the complete preview for review. Retain the original and private diagnostics while feedback is open. Production rendering, Desktop posting files, full media releases and cleanup need their relevant next authorization. Existing Desktop kits remain untouched.

Complete authorized source GitHub work through diff review, proportionate checks, PR verification and merge. Before each operation that can trigger Actions, inspect current UTC-day all-workflow/all-branch/all-actor runs and older rerun attempts, then estimate new runs/minutes under current user policy. Preserve required checks, never copy numeric permission thresholds into instructions, and do not leave a completed handoff in an open draft.
