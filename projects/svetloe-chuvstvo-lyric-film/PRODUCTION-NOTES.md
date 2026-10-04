# Светлое чувство — production method

## Approved edition

The production uses `svetloe-chuvstvo-v3-soft-window-light`, accepted after the complete current preview review. The owner’s listening completion and render authorization are bound to the exact eleven-asset identity in `evidence/review-status.json`. Preparation resets these statuses; a later visual, word or mapping revision needs a fresh complete review. Source acquisition metadata retains its historical preview-stage label; current authorization comes from the review record.

## Source and performance

The exact original upload is a 1080×1080, 25 fps paper shadow-theatre recording. All 4,419 native pictures are decoded; the canonical one-second PNG is used only for material masks. The soundtrack remains the original stereo AAC. Its decoded 44.1 kHz duration is 7,796,160 samples, slightly longer than the picture and container audio presentation. Preserve the final native picture through this tail.

The performed sequence has 35 independently timed occurrences, 175 Russian events and 223 English words across 46 reading cues. Full coverage includes the late sung reprise after the long instrumental passage. Recognition omitted opening material and hallucinated late subtitle credits; full-recording coverage, source/stem signals and independent review took precedence. Supplied reference text, selected event samples, decision ranges and reading holds remain separate records.

Quiet connected consonants and vowel bodies were inspected individually rather than applying one track-wide timing shift. Every repeated самое and огромной has its own event. The final bright-light carry has a documented body-versus-reflection uncertainty; the chosen word focus, neutral reading hold and fade are distinct. Owner acceptance does not turn a signal estimate into millisecond acoustic ground truth.

## Translation and focus

Original and English lanes have equal serif size, weight, color strength and stable positions. Rust color-only focus is immediate at the selected source event; glyphs do not bounce or change width. English uses exact contributor unions, including articles, implied copulas, inflection and irreducible constructions. Necessary grammatical words receive focus without inventing separate English audio events. Gaps stay unhighlighted.

The cottage contrast reads “those next to me won’t be the same.” Individual next/to/me follows рядом/со/мной; won’t combines the future and negation, be follows будут, and те supplies the recast subject plus identity complement. This avoids a compressed “others” display while preserving the unnamed people. No Russian timing or reading lifetime changed for this correction.

## Source-owned light

Stable ink occupies the empty top cloth. The original woman, bird, stars, curtains, house borders and printed title remain visible. Ten existing window interiors host 24 measured 40 Hz–10 kHz frequency bands. A three-pixel inward feather and canonical-source luminance mask protect paper mullions and grain. An early external blur was removed after it spilled across the dark material; no new halo remains.

The raw exposure display sums assigned linear powers, converts back to dB and maps `clamp((groupDb+50)/34)^1.25`. The current display caches a centered Gaussian envelope with 80 ms sigma and ±200 ms support at 25 fps, then interpolates on source time. The upper-left low-bass pane uses half-strength multiply and screen modulation. This solves abrupt, disproportionate pane response through a display change, leaving raw measurements and word timing intact. No frame-history easing or wall-clock animation is used.

Native delivery keeps the complete 1080 square. Portrait keeps the sharp square at y400–1480, reflects only empty upper cloth and softly continues the empty floor. Both layouts preserve all source edges and equal bilingual prominence; the dense cottage clause is reflowed rather than shrinking English alone.

## Encoding and verification

```sh
npm run check
node scripts/render-production.ts --plan
node scripts/render-production.ts --production --format both
node scripts/verify-final.ts
node scripts/verify-decoded-scene.ts
node scripts/make-captions.ts
node scripts/make-covers.ts
node scripts/package-delivery.ts
```

Do not run preparation after approval merely to start an export: it intentionally rebuilds the preview identity and clears review state. Restore the exact source and run the documented checks instead.

Each of 10,608 output frames uses source sample `n×735`, time `n/60`, and native picture `min(4418, floor(n×5/12))`. The last native picture occupies output frames 10,604–10,607. The 60 fps video extent is 176.800 seconds; the final frame covers the final 15 decoded audio samples, and the video’s small CFR remainder is intentional. The encoder uses H.264 CRF17, medium preset, limited-range BT.709 YUV420P, square pixels and fast-start MP4. AAC is stream-copied without filtering, trimming, `shortest` truncation or reencoding.

The complete-file verifier checks every decoded frame PTS and protected source-picture region, strict full decode, original AAC payload/PTS/DTS/priming side data, decoded PCM bytes/sample count, dimensions, color tags and black intervals. The separate scene verifier decodes first/mid/last active frames for every Russian word plus opening, light and ending samples, then compares corresponding original-source shared-scene pixels using bounded lossy-codec tolerances. Expected semantic focus is recorded for review; approximate image agreement is not OCR or independent listening.

The local upload kit contains both films, dedicated covers, YouTube title/description, TikTok description, optional separate cue-level SRT/VTT and checksums. YouTube’s thumbnail is 1280×720. TikTok’s profile cover is portrait 1200×1600, reviewed at 150×200 and with five-percent edge-crop simulations. These are local cover checks, not a platform upload test. Verify every copied Desktop file against its staged hash before calling delivery complete.

## Portable prevention checklist

- Audit vocals across the entire recording, including a reprise after an instrumental passage.
- Inspect every quiet onset and every repeated held ending; separate source estimates from reading life.
- Preserve complete English grammatical focus and real silent gaps.
- Use source-compatible material masks and reject spill across borders.
- Inspect response steps per environmental host; one isolated bass cell can dominate a gentle scene.
- Cache bounded light on source time so seeking and playback speed cannot change it.
- Freeze the actual served bundle alongside source data, font and picture identity.
- Verify original decoded pictures and audio in the encoded files, then verify the copied posting kit.
- Keep public records neutral and reproducible, without personal quotations or local account paths.

## Finished v3 evidence

Both complete films passed 10,608-frame timing and protected-picture checks. Their 7,615 AAC packets, priming side data and 7,796,160 decoded stereo samples match the source. Each format’s 534 selected decoded frames passed shared-scene checks, with maximum complete-image mean RGB error 2.305 and reading-region mean error 3.375 codes. Full decode found no unexpected black intervals. All 21 Desktop kit files match staging hashes. [Full reports](evidence/production-verification.json) · [Scene comparisons](evidence/decoded-scene-verification.json) · [Delivery](evidence/delivery-receipt.json).

A verification implementation initially attempted one long flat sum of hundreds of FFmpeg `select` terms; the expression parser rejected it. The scene checker uses a balanced expression tree for a bounded parse depth. This was a diagnostic-only correction; approved scene pixels, timing, renderer and finished MP4 bytes were unchanged. Child diagnostics are collected when an early EOF appears, so a filter error is not misreported merely as missing pictures.
