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
| Timeline | `node scripts/build-timeline.ts --revision preview-v3` | `npm run check` passes: binding, effect tags, no lyric words in data |
| Preview | `npm run preview` → http://127.0.0.1:4331/ | Picture moves after load, seek and format switch in both formats |
| Review | owner listens: complete 1×, uncertain words at 0.5×, both formats | Record `evidence/sync-review.json` honestly (see below) |
| Authorize | owner explicitly approves this revision | `evidence/render-authorization.json` binds the same hashes |
| Deliver (owner-run) | `npm run deliver` (try `-- --dry-run` first) | Renders each missing film under the gate, verifies both films and their word focus, re-hashes the Desktop kit, publishes the release and confirms its digests in `evidence/release-upload-verification.json` |
| Verify | inside `npm run deliver` | 0 verification failures and 0 focus mismatches; the negative control detects at least 95 % of shifts |
| Record | agent commits the delivery evidence and links the release | `final-verification.json`, `encoded-focus-*.json`, `delivery-receipt.json` and the release receipt are merged |

## Review and authorization records

Both files must carry `song: "BnnbP7pCIvQ"`, the timeline `revision`, the 16 `inputHashes` from `hashes()` in [scripts/render-gate.ts](scripts/render-gate.ts) and `lyricsSha256`. Hash them after the final `npm run build`.

The gate accepts one of two review records:

- **The default full review** (below).
- **The scoped owner-approved preview** used for `preview-v3`: `status: "owner-approved-preview"`, a stated `method`, the `acceptedRevision` with its 16 `acceptedInputHashes` and `acceptedTimingSha256`, and `ownerDirectedChanges`. Each directed change names its inputs and a description, and the timeline can never be a directed change. The gate refuses any other changed input or any timing difference. The authorization must carry `basis: "owner-approved-preview"` and the same `acceptedRevision`.

- `sync-review.json` needs `status`, `actualAudio`, `fullCoverage`, `wordTiming`, `lyricText` and `sourceMotion` all set to `"complete"`. It also needs `unresolved: []`, both formats, both speeds, and every cue ID.
- `render-authorization.json` needs `authorized: true`, `previewReviewed: true` and a `scope` string.

Record an owner's overall attestation as an attestation. Do not invent per-cue telemetry. Any change to timing, scene code, shots, fonts or the compiled client invalidates both records.

## Current state (released as let-you-down-v1.0.0)

The text is saved and bound (normalized SHA-256 in [evidence/preview-identity.json](evidence/preview-identity.json)). Alignment has run: 198 of 217 words are cross-model supported, and 71 are flagged for priority listening. `preview-v2` kept that timing and replaced the visual layer after the owner's `preview-v1` notes. The owner accepted `preview-v2` and asked for milder, smoother flames; `preview-v3` is that change alone (see the [review history](VISUAL-BRIEF.md#review-history)).

Production is authorized as a **scoped owner-approved preview** (see [preview before render](../../docs/preview-before-render.md#approval-belongs-to-this-song-and-revision)). [evidence/sync-review.json](evidence/sync-review.json) binds the accepted `preview-v2` identity, the owner-directed flame change and the unchanged timing identity. The granular listening fields stay `null`: no every-cue audit is claimed. [evidence/render-authorization.json](evidence/render-authorization.json) binds the same current hashes. `node scripts/render-gate.ts` passes. The owner ran `npm run deliver`, which rendered both films. Its first verification stopped on two checker false alarms. The portrait end logos and credits counted as black, and lit words in partial-ink scenes were compared with the untinted gradient. The fixed checkers ([#61](https://github.com/ael-dev3/lyrics/pull/61)) pass both films with 0 verification failures and 0 focus mismatches. The Desktop kit was then assembled, and the release was created as a draft holding the non-lyric files. The owner attached both films and published [let-you-down-v1.0.0](https://github.com/ael-dev3/lyrics/releases/tag/let-you-down-v1.0.0), and GitHub's digests match the kit. Posting to YouTube or TikTok is the owner's step.

Visual decisions from the owner's notes, to keep in later revisions:

- The visualiser is an instrument on the lyric column (wide, compact, crisp bars on a baseline, coloured like the focus), not light rising from the frame edge. Tall edge-to-edge tubes covered the picture, and a thin edge strip was also rejected.
- Lyrics use the video's own card style: white type in its pink/cyan neon. Keep other colours to the effects.
- Effects must vary between repeats and move continuously. Avoid stacked copies of a word and hard stripes that echo the spectrum.

## Known work before the review

- Priority flags cluster at line entrances after gaps and in the overlapping outro (3:14–3:52). Repair words locally, never with a global offset, through `analysis/timing-overrides.json` (one entry per word, with a reason and a source), then rebuild with a new `--revision`.
- Check the portrait crops on moving shots in motion. The authored pan at 72.8–78.5 s and the glide segments are the likeliest to need a tweak (edit `analysis/build_shots.py`, then rerun it and `scripts/measure-tones.ts`).
- Browser-to-native renderer parity has only been checked visually on placeholder stills. Compare browser and native frames at the same source times in both formats before production.
- Check the signal drop and flames in motion at 1× and 0.5× (the effects are seek-safe, so stepping frames in the preview shows the exact render).
