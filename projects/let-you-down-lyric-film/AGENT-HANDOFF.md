# Let You Down — agent handoff

Read [AGENTS.md](../../AGENTS.md), [preview before render](../../docs/preview-before-render.md) and this project's [README](README.md) first. This file is the resume path.

## Standing decisions for this project

1. **No lyric text in the repository, ever.**
   - The text lives in the git-ignored `source/lyrics.local.txt`.
   - Committed data uses word IDs and the text's normalized SHA-256.
   - Public images use lorem-ipsum placeholders or lyric-free moments.
   - `npm run check` fails if a committed data file appears to contain lyric words.
2. **The official music video is the picture.** Do not replace or regenerate scenery. Protected shots (`protect: true` in [src/shots.ts](src/shots.ts)) receive no added light.
3. **The rendered film and captions contain the lyric text.** They stay local in `renders/` and `publishing/*.srt|vtt`. Publication and platform upload are owner actions, not part of the source handoff.

## Resume sequence

| Step | Command | Done when |
| --- | --- | --- |
| Source | `yt-dlp -f '137+140' …` then `node scripts/check.ts --local-media` | SHA-256 `c384e814…010c` matches |
| Text | owner saves `source/lyrics.local.txt` | `npm run check` binds the text (after timing exists) |
| Stems | `python analysis/separate_stems.py` | `analysis/stem-estimate.json` hash matches, or is re-recorded |
| Candidates | `python analysis/align_candidates.py` | `analysis/word-candidates.json` has 0 failures; read `uncoveredVocalEnergy` |
| Selection | `python analysis/select_timing.py` | Review the `summary.priority` count and bases |
| Timeline | `node scripts/build-timeline.ts --revision preview-v2` | `npm run check` passes: binding, effect tags, no lyric words in data |
| Preview | `npm run preview` → http://127.0.0.1:4331/ | Picture moves after load, seek and format switch in both formats |
| Review | owner listens: complete 1×, uncertain words at 0.5×, both formats | Record `evidence/sync-review.json` honestly (see below) |
| Authorize | owner explicitly approves this revision | `evidence/render-authorization.json` binds the same hashes |
| Render | `node scripts/render-gate.ts`, then `npm run render:production -- --format …` | Receipts written next to each MP4 |
| Verify | `node scripts/verify-final.ts`, `node scripts/verify-word-focus.ts --format …` | 0 failures; the negative control detects every shift |
| Kit | `node scripts/make-captions.ts`, `node scripts/package-delivery.ts` | Desktop kit re-hashed; `evidence/delivery-receipt.json` |

## Review and authorization records

Both files must carry `song: "BnnbP7pCIvQ"`, the timeline `revision`, the 16 `inputHashes` from `hashes()` in [scripts/render-gate.ts](scripts/render-gate.ts) and `lyricsSha256`. Hash them after the final `npm run build`.

- `sync-review.json` needs `status`, `actualAudio`, `fullCoverage`, `wordTiming`, `lyricText` and `sourceMotion` all set to `"complete"`. It also needs `unresolved: []`, both formats, both speeds, and every cue ID.
- `render-authorization.json` needs `authorized: true`, `previewReviewed: true` and a `scope` string.

Record an owner's overall attestation as an attestation. Do not invent per-cue telemetry. Any change to timing, scene code, shots, fonts or the compiled client invalidates both records.

## Current state (preview-v2)

The text is saved and bound (normalized SHA-256 in [evidence/preview-identity.json](evidence/preview-identity.json)). Alignment has run: 198 of 217 words are cross-model supported, and 71 are flagged for priority listening. `preview-v2` keeps that timing and replaces the visual layer after the owner's `preview-v1` notes (see the [review history](VISUAL-BRIEF.md#review-history)). The next step is the owner's visual and listening review of the complete preview in a visible browser.

Visual decisions from the owner's notes, to keep in later revisions:

- The visualiser is an instrument on the lyric column (wide, compact, crisp bars on a baseline, coloured like the focus), not light rising from the frame edge. Tall edge-to-edge tubes covered the picture; a thin edge strip read as the weakest visualiser in the repository.
- Lyrics use the video's own card style: white type in its pink/cyan neon. Keep other colours to the effects.
- Effects must vary between repeats and move continuously. Avoid stacked copies of a word and hard stripes that echo the spectrum.

## Known work before the review

- Priority flags cluster at line entrances after gaps and in the overlapping outro (3:14–3:52). Repair words locally, never with a global offset, through `analysis/timing-overrides.json` (one entry per word, with a reason and a source), then rebuild with a new `--revision`.
- Check the portrait crops on moving shots in motion. The authored pan at 72.8–78.5 s and the glide segments are the likeliest to need a tweak (edit `analysis/build_shots.py`, then rerun it and `scripts/measure-tones.ts`).
- Browser-to-native renderer parity has only been checked visually on placeholder stills. Compare browser and native frames at the same source times in both formats before production.
- Check the signal drop and flames in motion at 1× and 0.5× (the effects are seek-safe, so stepping frames in the preview shows the exact render).
