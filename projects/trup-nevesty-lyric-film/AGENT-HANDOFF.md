# Agent handoff

## State

- Full bilingual preview: `trup-nevesty-preview-v1-acoustic`; 28 cues, 184 Russian events, 258 English tokens.
- Canonical `public/source.mp4` identity: `source/recording.json`. Preserve original picture and sound.
- Both formats keep the full illustration; the six strings are the visualizer, veil and ring are supporting material glints.
- Final **нету** variant is documented; the literal supplied sheet remains separately preserved.
- Eleven tests and real-browser transport/completeness checks pass. The owner accepted and directly authorized this exact preview; standardized full/slow/both-layout listening scope remains separately unattested.
- Both complete 60 fps films are verified: 12,318 frames, identical original AAC packets/PCM, no black gaps and complete bilingual decoded focus evidence.
- A 13-file Desktop kit is checksum-verified. Covers, copy, captions, hashes and final-frame stills are committed. Movies and raw source remain local/ignored; no platform upload or public media release is recorded.

Read root `AGENTS.md`, [README](README.md), [production decisions](PRODUCTION-NOTES.md), [timing method](TIMING-METHOD.md), and `source/REVIEW.json`. Shared [preview-first](../../docs/preview-before-render.md) and [cross-language review](../../docs/cross-language-sync-gate.md) requirements apply.

## Resume

With the locked original present: `npm ci`, `npm run check`, `npm run identity`, `npm run preview`. Default loopback port 4335; `PORT` changes it. The server verifies original/timeline/scene hashes, supports byte ranges and serves an explicit allowlist. Private extractor metadata and analysis are never routes.

Both formats, reduced speed, exact-second seeks, original reference, animation A/B and Restore preview already exist. Verify actual picture and visible glyphs. Deliberate source stillness is different from stalled decoding. The shared scene also drives `npm run proof`: 34 complete-picture stills and eight A/B stills, without encoding a production film.

## Inputs

`source/lyrics-editorial.json` owns translation/contributors; `public/timeline.json` owns selected samples and reading windows. `scripts/build-timeline.ts` uses raw private observations when available, otherwise committed observations with matching source/token identity; missing/stale evidence is a hard error. `scripts/prepare-reference.ts` needs private extractor metadata/native PCM and rewrites editorial inputs; use intentionally rather than overwriting a reviewed revision blindly.

`npm run features` rebuilds original-source music measurements. `scripts/prepare-material.ts` refits actual strings, hand occlusion, veil and ring from the canonical reference. Inspect any regenerated coordinates before accepting them. Source motion, ownership, grammar and decoration are separate contracts; global timing shifts are not corrections.

After timing, scene, font, reference, feature or transport edits, run `npm run identity` and rebuild. Changed inputs clear active approval; unchanged inputs preserve it. Record listener/owner evidence faithfully without public conversation quotations. `npm run render:gate` must pass before full capture. Its scoped current-song authorization checks exact source/timeline/scene/revision hashes; the stricter reusable listening gate stays unchanged and incomplete. Never copy this authorization to another song or infer completed listening from it.

## Production and verification

The README gives exact render/verify/kit commands. `scripts/render-production.ts` paints the unchanged shared scene against every actual native picture, streams to H.264 and copies original AAC. It refuses existing outputs and rechecks frozen identity before completion. Use fresh destinations for a new authorized edition.

`scripts/verify-final.ts` checks metadata, every frame timestamp, strict full decode, black gaps, AAC packets/PCM, then 695 selected scene frames and independent sample/contributor glyph expectations per format. All 442 tokens appear gold and neutral; delayed controls must fail. These are encoded-display checks, not listening certifications. `scripts/finalize-delivery.ts` requires passing identities/hashes, prepares posting copies, extracts exact final stills and writes delivery/checksum manifests.

TikTok cover is 1200×1600 portrait, reviewed at 150×200 and in a 5% crop simulation. Its corrected top margin is measured from actual glyph bounds. Do not substitute the landscape cover.

Retain original/private diagnostics for timing investigations. Existing Desktop kits stay untouched. Further full-media releases, platform uploads or cleanup require their relevant authorization; source handoff alone does not establish those scopes.

Complete authorized source GitHub work through diff review, proportionate checks, PR verification and merge. Before each operation that can trigger Actions, inspect current UTC-day all-workflow/all-branch/all-actor runs and older rerun attempts, then estimate new runs/minutes under current user policy. Preserve required checks, never copy numeric permission thresholds into instructions, and do not leave a completed handoff in an open draft.
