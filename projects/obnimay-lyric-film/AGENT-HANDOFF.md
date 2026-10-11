# Continue Обнимай

## Current state

Complete original-picture preview, Russian / English, 16:9 and 9:16. No production render, upload kit or media release. Listening review and explicit current-revision render authorization are pending. The final English embrace wording is **Hold me**; retain the contextual rationale in the templates. Do not silently switch to a literal dictionary equivalent or alter Russian timings when editing English prose.

Read root `AGENTS.md`, the mandatory preview-first and cross-language review guides, then this project's [README](README.md), [TIMING](TIMING.md), [visual brief](VISUAL-BRIEF.md) and [review status](evidence/cross-language-sync-review.md). Browser and shared-scene evidence have technical/visual scopes only.

## Short startup

1. Restore the exact MP4 as `public/source.mp4`; check `source/recording.json` SHA-256. Original media, analysis and model caches remain excluded from Git.
2. Install with `npm ci` using Node 24. Run `npm run timeline`, `npm run identity`, `npm run check`, `npm run proof`, then `npm run preview` (default port 4338).
3. Show the **complete** preview. Verify actual picture, correct revision hashes, active Russian/English glyphs, playing/paused seeking, format switching, reduced speed and recovery. The source artwork is intentionally still; advancing native decoded PTS is separately required.
4. Review the full original sound at normal speed, uncertain words and held endings at reduced speed, and both-language/both-layout reading. Prioritize the processed calls at about 70–93 and 158–183 s, four faint Вся echoes, quiet opening and final held light.
5. Update selections from actual audio when warranted, preserving rejected alternatives and uncertainty. Change `source/selected-boundaries.json`, not a generated timeline or a global timing offset. Rebuild timeline, identity, checks and proofs. Changed scene/timing identities invalidate earlier review.

`scripts/initialize.ts` initializes recording metadata and editorial templates from preparation files. It is **not** an ordinary startup command: rerunning it can replace later editorial work. `scripts/author-timing.ts` creates the initial selection/compact observation record and refuses existing selections by default. Do not use `--replace` to erase reviewed corrections.

## Files to edit

| Purpose | Canonical file |
| --- | --- |
| Performed source events / holds | `source/selected-boundaries.json` |
| English prose and source-word correspondence | `source/editorial-templates.json` |
| Picture, petal masks, musical display and glyph layout | `src/scene.ts` |
| Source-event and reading-window rules | `src/model.ts` |
| Actual-video playback clock and controls | `src/player.ts` |
| Compact competing acoustic observations | `source/acoustic-observations.json` |

Keep template changes reproducible in `scripts/initialize.ts` when appropriate. Regenerate `public/timeline.json` and the correspondence ledger. Raw measurements in `public/audio-features.json` are distinct from artistic scaling/smoothing in the scene.

## Review identity and production gate

`npm run identity` binds revision, original MP4, timeline and scene inputs. It generates ignored `public/preview-identity.json` and local `source/REVIEW.json`; a changed identity resets review to pending. Record only completed actual checks or direct owner attestation, then obtain explicit production approval for that exact preview. Positive design feedback and test fixtures are not approval.

`npm run render:gate` currently fails by design. There is no full-film encoder in this preview-only project yet. After the required review and authorization, implement capture/encoding with the same scene, original audio, source aspect preservation, every-frame verification and native/phone checks. Follow the established Desktop-kit, platform-cover and final-source handoff guides; do not infer production authorization from a merged preview PR.

## GitHub and storage

Publish coherent source changes only after local checks and diff review. Before every push, PR creation/update or merge, inspect all Actions run history for the current UTC day, including queued/in-progress/completed runs and older rerun attempts, and account for all triggers and downstream services. Report unavailable monthly usage as unknown without expanding billing permissions. Do not change triggers or bypass checks to fit a budget. Complete authorized source work through verified merge.

No original MP4, diagnostic PCM/stems, raw emissions, local account paths, review conversation or personal quotations belong in the public source record. Do not delete this song's source while it is still required for live review. Future cleanup follows the repository's verified-backup rules and preserves Desktop deliverables.
