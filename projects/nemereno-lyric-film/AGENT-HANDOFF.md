# Agent handoff · немерено approved v4.3

## Current state

The approved and rendered edition is `nemereno-rebuild-v4.3`; the complete preview remains on port 4340. It replaces the rejected mirrored extensions with exactly one uniformly scaled source crop per format. The complete seated figure remains visible. A restrained 24-band muted-ivory spectrum occupies a fixed margin beneath the equal Literata 500 lyric blocks. Preserve the quiet source picture and reserved duet geometry.

**Production is complete.** The owner explicitly attested full normal-speed listening, uncertain words and held endings at reduced speed, and both layouts, and authorized this exact render and handoff. Both films and the 17-file Desktop kit pass their final checks. Do not render again to update text documentation. Any changed scene/timeline needs its own identity and review; approval is not transferable to another revision or song.

## Inputs and authority

| File | Role |
| --- | --- |
| `source/recording.json` | Exact recording, aspect, duration and source SHA-256. |
| `source/acoustic-phrases.json` | Supplied Russian and acoustic phrase ownership; typography is separate from timed words. |
| `scripts/rebuild-editorial.py` | Authored display fragments and explicit semantic templates. |
| `source/lyrics-editorial.json` / `source/semantic-map.json` | Generated complete wording and per-token meaning links. |
| `source/word-boundaries-v3.json` | Canonical selected source-sample boundaries with comparison, rationale and uncertainty. |
| `source/cue-holds-v3.json` | Neutral reading holds; never a replacement for lexical release. |
| `scripts/build-timeline.py` | Joins boundaries and meaning links; checks coverage and builds stable event IDs. |
| `public/timeline.json` / `source/correspondence-ledger.json` | Executable 46 cues / 267 Russian events / 338 English tokens and audit ledger. |
| `source/acoustic-provenance.json` | Materials, model scopes, source-clock check and observation limits. |
| `public/audio-features.json` | Measured music response, independent of lyric times. |
| `src/scene.ts` / `public/visual-contract.json` | Current visual contract and implementation. |
| `source/REVIEW.json` | Current identity-bound human listening attestation and explicit render approval. Regeneration invalidates stale approval. |
| `public/preview-identity.json` | Exact source/timeline/scene hashes of the approved edition. |
| `evidence/final-*-verification.json` | Independent encoded decode, timing, audio, scene and glyph checks. |
| `evidence/production-render-receipts.json` | Exact renderer and authorization-adapter identities. |
| `evidence/upload-kit.json` / `evidence/desktop-delivery.json` | Final inventory and checksum-verified Desktop handoff. |

Original `public/source.mp4`, `public/artwork-reference.png`, `analysis/` and full movies are excluded from the public Git tree. Recover them from the authenticated unpublished recovery assets. The native reference must come from this exact source. Literata and its OFL license are bundled together. Never put private home paths or review quotations in public documentation. Frozen `public/visual-contract.json` has preview-era lifecycle labels; preserve it byte-for-byte. The review and delivery receipts are the current lifecycle authority.

## Reproduce existing preview

With Node dependencies and exact media available:

```sh
python3 scripts/rebuild-editorial.py
python3 scripts/build-timeline.py
npm run check
npm run verify-preview
npm run identity
PORT=4340 npm run preview
```

This uses retained canonical boundaries and does not rerun acoustic models. Open the complete preview from the beginning. Compare its canvas identity attributes against `public/preview-identity.json`. Local diagnostics do not substitute for the complete user preview.

## Optional acoustic regeneration

The private analysis environment needs stable-ts, Whisper, TorchAudio MMS_FA, uroman, scipy, numpy and soundfile. Internal tokenizer romanization is not a displayed pronunciation layer. Run `scripts/acoustic-rebuild.py` for bounded source/stem observations. `scripts/acoustic/mms-observations.py --help` describes the adapter; its plan is `source/acoustic-crop-plan-v3.json`. `scripts/acoustic/compare-boundaries.py` collects observations. `scripts/acoustic/select-boundaries-v3.py` records selected proposals. `signal-panels-v3.py` and `draw-signals-v3.mjs` expose bounded diagnostics locally.

Do not replace canonical times with one model's raw output. Quiet prefixes, instrument leakage, repeated endings, printed dashes and overlapping singers caused concrete model failures. The side-channel transcript hallucinated unrelated text and was excluded. Source/stem versions of one model are correlated observations.

## Framing regression checks

Never restore mirrored or stretched picture extensions. `SOURCE_VIEWS` in `src/scene.ts` defines one native crop per format with equal horizontal/vertical scale. The figure guard must fit inside each crop. The whole-frame image test at the lyric-free bridge detects repeated edges, arbitrary fill and aspect distortion. Separate spectrum activity and sitter-protection checks detect an invisible graphic or spill. A new aspect ratio requires a new reviewed framing and reading layout.

## Reproduce and verify production

The source tree uses Node 24, FFmpeg 8.1.2 and locked npm dependencies. After recovering exact media, check the current identity before any regeneration. Rebuilding the existing canonical timeline should remain deterministic; do not run acoustic selection again merely to reopen the preview.

```sh
npm run test:gate
npm run check
npm run verify-preview
# Already delivered: do not rerun these just to change copy.
npm run render:production -- --format landscape
npm run render:production -- --format portrait
npm run verify:final -- --format landscape
npm run verify:final -- --format portrait
npm run covers
npm run publishing
npm run finalize
```

The strict renderer requires current complete listening evidence and explicit approval. There is no historical-song bypass. `test:gate` checks missing/stale identities, incomplete review scope and absent approval. Final verification tests every token in states that actually exist; continuous backing **А-а-а / Ah** uses clear/handoff checks rather than a nonexistent neutral state. See [production notes](PRODUCTION-NOTES.md) for thresholds and compression-aware glyph sampling.

`finalize` requires both passing film reports, unchanged output hashes and visually reviewed covers. It copies the existing movies, extracts 26 unmodified final-film JPEGs and seals the 17-file kit; it does not re-encode. Farcaster has one `Caption.txt` combining title, AI-assisted roles, human review and source credit. Preserve that file as the full post. Platform uploads are separate actions.

## Recovery archive procedure

First commit the finished project and public documentation. From this project, select new directories outside the project for archives, downloaded copies and fresh restore:

```sh
python3 scripts/archive-delivery.py --create /tmp/nemereno-backup
python3 scripts/archive-delivery.py --verify /tmp/nemereno-backup --restore-to /tmp/nemereno-restored
```

The source ZIP pins the commit and approved identity. Media recovery includes the original recording/reference, acoustic evidence and untracked build materials. The upload-kit ZIP contains the final three platform movies and all copy/covers. Identical render masters are stored once and restored as aliases. `BACKUP.json` inventories every project file, archive size/hash and every ZIP payload hash; `node_modules` is omitted because `package-lock.json` preserves dependencies. Unexpected symlinks fail instead of disappearing silently.

After the root Actions preflight, store these as **authenticated unpublished draft assets**, then download all archives and `BACKUP.json` to a fresh directory. Run `--verify` and a fresh `--restore-to` on the downloaded copies. A successful upload or local hash alone does not establish remote recoverability. Keep backup scope distinct from a public media release. Record remote asset IDs/hashes and the verified source commit without private local paths. Preserve that source commit in the final merge ancestry.

Before every push, PR action or merge, refresh the repository-wide UTC-day Actions history required by root `AGENTS.md`. Include all workflows/actors/statuses and old-run attempts; estimate resulting runs/minutes and report unknown monthly usage as unknown. Do not bypass protected checks or change triggers to fit a budget. Review locally, attach the PR, verify it and merge; do not leave completed work in an outstanding PR.

## Review priorities for a future changed edition

Check the full recording normally, uncertain words and held ends slowly, and both layouts. Prioritize the quiet duet at 160–181 seconds, independent title repeats, female pickup at 180.38, and final bloom releases. The 104–120.8 instrumental bridge must remain lyric-free. The first focused glyph must be fully opaque; neutral reading must not shorten a sung hold or extend lexical focus beyond release.

Verify actual browser picture, sound, clock progress, pause/seek refresh, both formats, stable duet rows and no console errors. Here the original photograph is static; the compact spectrum should vary with the source clock while the photographed forest stays steady.

These are regression priorities for changed editions, not missing review in the delivered v4.3. Owner acceptance, model uncertainty and encoded technical evidence remain separate records.
