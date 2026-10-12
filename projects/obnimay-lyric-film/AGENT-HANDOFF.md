# Continue Обнимай

## Current state

Completed original-picture production, Russian / English, 16:9 and 9:16 at 60 fps, 200.600 s. Both encoded films and the 13-file Desktop upload kit are verified. The owner attested comprehensive listening review and separately authorized the exact corrected v2. No itemized per-cue playback telemetry or assistant direct audition is claimed. Original media stays local; no public media release or platform upload is recorded. The final English embrace wording is **Hold me**; retain the contextual rationale in the templates. Do not silently switch to a literal dictionary equivalent or alter Russian timings when editing English prose.

Read root `AGENTS.md`, the mandatory preview-first and cross-language review guides, then this project's [README](README.md), [TIMING](TIMING.md), [visual brief](VISUAL-BRIEF.md) and [review status](evidence/cross-language-sync-review.md). Read [PRODUCTION-NOTES](PRODUCTION-NOTES.md) for exact export commands, final identities and reuse lessons. Browser/shared-scene proof, encoded technical checks, owner acceptance and model uncertainty have separate scopes.

## Coverage correction

Read `source/coverage-review.json` before any timing work. The first two v1 calls overlapped a recording-reviewed lyric-free span at 71–81 s. Five supplied candidates are now withheld; three later original-recording-supported calls retain shorter provisional spans. Do not restore missing calls from pasted repetition counts or a forced path. The builder rejects withheld IDs and lyric-line intrusion into the known negative interval. ASR omissions alone do not prove silence; withheld ambiguity and an established lyric-free interval are distinct statuses.

## Short startup

1. Restore the exact MP4 as `public/source.mp4`; check `source/recording.json` SHA-256. Original media, analysis and model caches remain excluded from Git.
2. Install with `npm ci` using Node 24. Run `npm run check`, then `npm run preview` (default port 4338). Restore/generate the ignored preview identity when needed, but note that `npm run identity` also resets the local listening/approval record. Never run it casually on an accepted local revision. Canonical timeline authoring uses `npm run timeline`; changes require renewed identity/review.
3. Show the **complete** preview. Verify actual picture, correct revision hashes, active Russian/English glyphs, playing/paused seeking, format switching, reduced speed and recovery. The source artwork is intentionally still; advancing native decoded PTS is separately required.
4. Review the full original sound at normal speed, uncertain words and held endings at reduced speed, and both-language/both-layout reading. Prioritize the three retained processed calls at about 159–174 s, four faint Вся echoes, quiet opening and final held light.
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

`npm run render:gate` passed for this accepted local v2. The renderer checks the bound review before capture, requires explicit `--production`, refuses existing output and rechecks frozen inputs/producer hashes at completion. `render:landscape` and `render:portrait` share the exact scene and original audio. `verify:landscape` and `verify:portrait` inspect final MP4s independently, including all visible lead/backing blocks, all 601 gap frames, AAC/PCM identity and deliberately delayed focus controls. `covers`, `publishing` and `finalize` prepare the kit only after verified output. `scripts/deliver-desktop.ts --destination <new-folder>` verifies every copied file and refuses existing Desktop folders. Published acceptance is evidence for the existing delivery, not a portable permission to render another revision or fabricated local review. Do not infer production authorization from a merged source PR.

## GitHub and storage

Publish coherent source changes only after local checks and diff review. Before every push, PR creation/update or merge, inspect all Actions run history for the current UTC day, including queued/in-progress/completed runs and older rerun attempts, and account for all triggers and downstream services. Report unavailable monthly usage as unknown without expanding billing permissions. Do not change triggers or bypass checks to fit a budget. Complete authorized source work through verified merge.

No original MP4, diagnostic PCM/stems, raw emissions, local account paths, review conversation or personal quotations belong in the public source record. Do not delete this song's source while it is still required for live review. Future cleanup follows the repository's verified-backup rules and preserves Desktop deliverables.
