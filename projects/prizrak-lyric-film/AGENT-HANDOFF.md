# Agent quickstart — призрак

## Current state

`prizrak-preview-v2` is a complete **preview-only** scene. 38 cues, 156 source events, 87 language lanes. Original picture/soundtrack remain intact. No production authorization, final MP4, posting kit or media release exists for this song. Keep prior-track approvals separate.

## Read these first

1. [Project status and run commands](README.md), [TIMING.md](TIMING.md), [VISUAL-BRIEF.md](VISUAL-BRIEF.md).
2. `public/timeline.json`: selected source sample intervals, translations, semantic contributors, independent visibility windows and independent overlapping vocal tracks.
3. `source/japanese-overlap-selected.json`, `source/japanese-selected-editorial.json` and `source/russian-editorial.json`: selected mappings. `source/japanese-editorial.json` is earlier research/proposals, not a replacement timing authority.
4. `evidence/timing-decisions.json` and independent acoustic/editorial reports: selected points, uncertain ranges, rejected model failures and method limits.
5. [Three-language workflow](../../docs/three-language-lyric-workflow.md), [connected onsets](../../docs/connected-phoneme-onset-workflow.md), [preview-before-render](../../docs/preview-before-render.md), [cross-language gate](../../docs/cross-language-sync-gate.md).

## Invariants

- Original source SHA256, 44100 Hz audio zero and 25 fps picture PTS are bound separately. Never globally advance all words or replace currentTime with a wall clock.
- Source event samples drive focus. Translations use complete semantic unions; short English grammar and inflected verb expansions must not be left neutral accidentally.
- No Japanese phonetic/romanized display. Internal native-kana acoustic normalization fixes a model-input bug, not a new lyric layer.
- Preserve both voices from the new Japanese entrance around 212.34. `japanese-upper` and `lead` have independent full-cue ownership; per-track order validation rejects clipped bodies or colliding reading intervals. All 150 prior event samples remain unchanged.
- All lanes share a fitted type size; Japanese optical weight 600 balances RU/EN 500. Stable glyph positions, pale active color and a local halo must stay obvious on a small phone player.
- Landscape preserves the full source including its authored mattes and flashes. Portrait keeps all source edges in a sharp full-width picture; atmosphere is a dim defocused duplicate of that same frame.
- Japanese upper blocks remain fixed after the Russian voice ends. Full native/portrait picture is preserved. Credits stay untouched after added decorations clear at 242.65.
- Actual video motion and browser recovery must pass in both formats. A healthy clock alone does not prove visible picture. Enter on Seconds must leave paused playback paused; keep the seek field focused through key release.

## Changing this revision

Edit documented proposals/mappings and rebuild with `npm run timeline`; do not patch generated timestamps silently. Reconcile each changed quiet prefix/held tail with original audio and independent evidence. Re-run applicable checks after material changes, inspect the moving preview, refresh freeze hashes and invalidate stale review/approval. Never mark machine/signal checks as human listening.

Read [the v2 overlap correction](OVERLAP-REVISION.md) before changing the late arrangement. Embedded-v1 audit/screenshot records describe the historical single-cue/carry model; current freeze and overlap evidence supersede that presentation.

Priority listening: the new masked Japanese entrance and first-word handoff, both Japanese late-night held endings, quiet Russian `В` prefixes, the long `человек` handoff and the mixed closing entrance. The current low-energy Japanese body/room-decay distinction is explicitly provisional.

## Source and publication

Large media/stems remain locally excluded from Git. Do not remove the working source before the review is complete. Document neutral technical/artistic decisions, evidence and limits; omit private conversation wording, personal paths and ratings.

Complete authorized source handoff through verified merge, with no completed open PR left. The coordinator is the sole remote writer. Before each push, PR operation, merge or other Actions-triggering action, freshly inspect all current-UTC-day workflow runs across actors/branches/workflows, including queued/completed/rerun attempts; estimate the resulting runs and runner minutes under current policy. Unknown monthly usage stays unknown. Do not bypass required checks, alter triggers to fit a budget, or copy numeric permission grants into project memory.
