# Кометы preview: agent handoff

Continue from the accepted `komety-preview-v10-first-final-eagle` preview and its [frozen input manifest](evidence/preview-inputs.json). Read [production lessons](PRODUCTION-LESSONS.md) before changing timing or copying this implementation. Acceptance of a preview is separate from the complete listening evidence and current-revision production authorization required by the [production gate](scripts/render-gate.ts); inspect the [current review record](evidence/cross-language-sync-review.md) rather than inferring permission from this document.

## Start here

1. Read repository [AGENTS.md](../../AGENTS.md), [source-clocked workflow](../../docs/source-clocked-word-effects-workflow.md), [connected-phoneme workflow](../../docs/connected-phoneme-onset-workflow.md), [bilingual mapping](../../docs/bilingual-lyric-workflow.md) and [preview/render boundary](../../docs/preview-before-render.md).
2. Check local state and the frozen input identities. Preserve existing work, source zero and the current evidence history. Name one writer for source timing; independent agents own separate proposals.
3. Recover the complete preview using the exact original media and bundled font. Verify loaded timeline revision and source word samples before interpreting a display difference.
4. Review only the newly requested scope against original audio, then recheck affected bilingual focus, neighboring releases, line visibility and both formats. Retain uncertainty and prior identities.

No remote action is needed to restart or review this local project. Before any proposed push/PR/merge/dispatch/rerun or trigger change, the coordinator must inspect all current-UTC-day run/attempt history across workflows, branches and actors, account for queued/running/completed work and downstream/duplicate events, and estimate runner minutes under the current approval policy. Unknown usage remains unknown; preserve required checks and durable local work.

## Locked recording and performed inventory

- [Official recording](https://www.youtube.com/watch?v=76BmuIf0duw), source SHA256 `af518bcde332f296dfc7982ebd7d8724c80c722decf5a32dfe3b00ef86107bf6`.
- Native 1920×796 square-pixel picture at 25 fps,6, 501 frames. Original stereo 44.1 kHz audio decodes to 11,469,824 samples / 260.086712 s, offset 0. Hold the last decoded picture across the approximately 47 ms audio-only tail.
- [Manifest](source/manifest.json) records source and creator provenance. Exact media belongs at `public/source.mp4`; large source media, stems, models and reproducible analysis caches are excluded from Git. Do not replace the recording or normalize the soundtrack after alignment.
- [Editorial inventory](source/lyrics-editorial.json):24 supplied lines,14 templates,27 performed cues,139 source events and 157 target tokens. Source indices are zero-based. Russian singing receives English translation; English radio receives Russian translation.
- Three sung refrain performances have independent timings. Four late radio cues are recording additions, not changes to the reference sheet. Measured repeated-clip identity supports+79.120 s timing transfer; final faded release249.960 is selected separately. Endcards remain original and still permit captions through the last radio word.

## Timing and evidence map

| File or record | Role |
| --- | --- |
| [Current candidate](source/timing-candidate.json) | All 139 source onset/release samples, individual reasons, candidates, uncertainty and review scope. Canonical integers govern seconds. |
| [Current ledger](evidence/timing-review.md) | Public before/after 139-word review;61 starts/67 releases changed against the preserved initial baseline. Historical ledgers remain bound to their revisions. |
| [V5 layer](source/onset-corrections-v5.json) | Individual connected vowels/sonorants, including62.160 fire and explicit prior-release changes. |
| [V6 layer](source/onset-corrections-v6.json) |132.304988662 eagle, display 132.305; sample 5,834,650. |
| [V7 layer](source/onset-corrections-v7.json) |135.700 eagle; sample 5,984,370. |
| [V8 layer](source/onset-corrections-v8.json) |149.480 fire; sample 6,592,068. |
| [V9 layer](source/onset-corrections-v9.json) |183.700 eagle; sample 8,101,170; independent183.735 comparison retained. |
| [V10 layer](source/onset-corrections-v10.json) |180.350 eagle; sample 7,953,435. |
| [Cached eagle paths](evidence/eagle-phone-path-review.json) | Competing model contexts/allocations and rejected paths; same-family variants are not independent votes. |
| [Line visibility](source/line-visibility.json) / [tail review](evidence/cue-tail-review.md) | Separate all 27 final lexical releases, neutral full-opacity holds and decay uncertainty. |
| [Translation review](evidence/translation-review.md) | Complete grammar expansions, reordered focus and union-of-source-event exceptions. |
| [Browser checks](evidence/browser-preview-checks.md) / [technical checks](evidence/technical-checks.json) | Loaded identity, runtime/visual observations and local structural/regression checks; not encoded-file or complete-listening certification. |

All six corrected quiet entrances pair the preceding release where connected ownership supports it. Their stronger character cores must not replace their first supported quiet bodies. First-refrain eagle selections45.180/48.420 retain individual broader uncertainty. Do not infer a constant onset advance from these examples.

The zero-lag estimated-vocal comparison supports the original mix, not a substitute source. [Stem provenance](evidence/stem-clock.json) and [the ledger methods](evidence/timing-review.md#method-and-limits) record its clock/model limits. All acoustic values remain model/signal estimates unless a separately recorded listening scope attests otherwise.

## Rebuild and recover the preview

From this project directory, with Node24+ and ffmpeg/ffprobe available:

```sh
npm ci
npm run features
npm run prepare
npm run check
npm run preview
```

`features` is needed when preparing missing/stale measured features, not for every isolated word correction. `prepare` validates source/editorial membership, compiles the current timeline and freezes input hashes. `check` covers typechecking, timing validation, independent semantic/connected-word fixtures and both-format scene/line-hold checks. `preview` builds the client and starts the range-capable local server, normally at `http://127.0.0.1:4331/`.

The player has restart, cue navigation, exact seek,1×/0.75×/0.5×, native wide/9:16, source comparison and Restore preview. Recovery retains transport/layout state. Verify actual moving picture after load, seek and switching both layouts; advancing audio is insufficient.

One native video owns audio and decoded picture. Word repaint uses its current time at display cadence; native25 fps picture PTS is tracked separately. Read canvas `timelineRevision`, `sourceSha256`, `sourceWordEvents`, `activeSourceWords`, `activeTargetWords`, `wordTime`, `sourceTime`, `sourceFrame`, `lyricOpacity` and hold/clear diagnostics. Confirm the actual in-memory samples after reload; a title/query parameter or disk hash alone cannot establish which timeline an older open page uses.

## Safe scope for a later timing refinement

Freeze the current baseline and save proposals with word ID, before/selected samples, paired prior edge if applicable, source interval, confidence, alternatives and linked original/stem evidence. Inspect quiet prefixes before strong cores, and held releases beyond final characters. Preserve genuine gaps. Keep source/translation focus distinct from neutral readability and decorative envelopes.

[The apply script](scripts/apply-reviewed-handoffs.py) requires the exact baseline hash and old samples, applies an explicit layer once, recomputes cue bounds and refuses to rebind line holds when final lexical endpoints changed. Archived layers are historical; **do not reapply them to the current candidate**. After an authorized new correction, prepare/check/build, reload, verify loaded samples and affected bilingual before/after states, refresh the current identity and retain the former evidence.

Useful regression points are62.300,132.400,135.760,149.560,183.800 and 180.450. At each, the corrected noun and its complete translation own focus while the preceding словно/like is neutral. Inspect both sides as well: a regression must reject early stealing of the prior word, not only catch lateness.

## Current delivery boundary

The composition retains the original native wide picture,78 source-reviewed portrait framing spans, equal Cormorant Garamond Semibold lyric lanes and a restrained measured bow-light ribbon. Source picture, framing, meaning mappings, sample events and line holds form separate inputs; retain their reviewed identity when work continues.

The current [production entry point](scripts/render-production.ts) implements the approved shared scene and checks complete current-input review/authorization before capture. Its exact native/portrait output files passed both technical and decoded-scene verification, as recorded below. Do not mistake historical shared-scene proof stills or preview acceptance for those encoded-file results. A new edition must retain the gate and receive its own required parity/delivery checks. Public media release and remote source publication have separate scope and operational preflight.

## Completed v10 delivery

The exact current owner review and authorization records are complete. Native 1920×796 and portrait 1080×1920 60 fps films passed [technical verification](evidence/final-verification.json) and [decoded source-picture/bilingual focus verification](evidence/encoded-scene-verification.json). The [18-file local upload-kit receipt](evidence/delivery-receipt.json) binds the delivered files. See [production commands, numerical host fixes and thin-glyph audit method](PRODUCTION-NOTES.md).

Read-only gate checks do not render: use `node scripts/render-production.ts --check-gate`. Production requires an explicit format; verification requires both formats for complete status, and packaging rejects stale source, scene, renderer, verifier, cover or film identities. Large original source/finished movies stay local and excluded from Git. A new acoustic/editorial/presentation revision still needs its relevant fresh review and explicit authorization.
