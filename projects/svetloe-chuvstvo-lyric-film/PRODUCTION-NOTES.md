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

## YouTube aspect correction — 5 October 2026

The original 176.800-second square delivery falls within YouTube's square/tall, up-to-three-minute Shorts criteria. A landscape thumbnail does not change video classification. Check the desired platform delivery before deciding to keep a source-native ratio. [Official policy](https://support.google.com/youtube/answer/15424877?hl=en) · [Reusable preflight](../../docs/youtube-standard-video-workflow.md).

The current YouTube upload is 1920×1080 with square pixels. The already approved square film remains sharp and complete at x420–1499; its typography, highlights, source-picture cadence and window response retain their original geometry and clock. Side wings reflect only the original photograph's outer 24 columns, excluding subjects, source lettering and the right-edge scratch. Horizontal extension initially exaggerated grain into streaks; a 24-pixel blur softens this expanded material, and a 48-pixel smoothstep blend retains its inner edge. The central picture is never blurred or stretched. Full and 640×360 proofs passed editorial and independent aspect review before encoding.

This is a directly requested delivery-aspect correction of an approved master. Its [authority record](evidence/youtube-wide-authority.json) binds the exact parent, adapter, material and proof hashes without modifying the parent's complete preview/listening/render statuses. It does not authorize an unrelated redesign or claim that an aspect diagnostic supplies fresh full-song listening evidence.

```sh
node scripts/youtube-wide.ts proof
# Inspect proofs and bind the scoped authority before encoding.
node scripts/youtube-wide.ts render
node scripts/finalize-youtube-color.ts
node scripts/youtube-wide.ts verify
node scripts/youtube-wide.ts stage
```

The adapter overlays the master at its original size on the wider material canvas, exports all 10,608 frames at 60 fps using H.264 CRF16 and copies AAC without shortening or filtering it. The new verification independently checks every frame PTS, dimensions, square pixels, zero rotation, limited BT.709 tags, exact original AAC packet clock/payload/priming, decoded PCM identity and complete decode. It compares the center of every decoded wide frame with the corresponding approved master using SSIM, including every highlight and the tail; lossy encoding changes picture bytes. No old 534-frame master evidence is relabelled as wide verification.

The first encoded candidate carried the PNG background's sRGB transfer tag even though BT.709 encoder options were supplied. The verifier rejected it. A separate `finalize-youtube-color.ts` stream-copy remux explicitly sets H.264 color primaries, transfer and matrix to BT.709 with limited range. This changes metadata without reencoding picture or audio; both intermediate and final hashes are retained in [the correction record](evidence/youtube-wide-color-correction.json). All final-file verification runs on the finalized bytes. Keep the strict color check and this explicit step; matching appearance alone does not prove correct signal metadata.

The original kit remains immutable in project staging. The corrected kit archives the old square master and previous guide/manifest/checksums, preserves TikTok/covers/copy/captions, and names one current YouTube upload. Desktop replacement first checks prior files and new-path collisions, preserves unknown additions and verifies all copied hashes. Historical inventories explicitly retain their former root-path scope. These are local delivery checks; no platform upload or observed YouTube classification is claimed.

The finalized 30,649,276-byte film passed all 10,608 frame timestamps and central-scene comparisons. Minimum SSIM is 0.995937 and mean is 0.997944 against the approved square master; the threshold is 0.985. All 7,615 AAC packets and 7,796,160 decoded stereo samples remain identical. Full decoding found no black frames; square pixels, zero rotation, limited BT.709 and fast start pass. The corrected Desktop kit's 28 managed files match staging checksums. The new file SHA-256 is `22cb0214d3fc417a772cd3e5a04537b89f3e53617ac3d1baa5270902b8c8eb51`. [Verification](evidence/youtube-wide-verification.json) · [Delivery receipt](evidence/youtube-wide-delivery.json).
