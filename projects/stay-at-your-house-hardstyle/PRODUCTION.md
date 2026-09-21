# Final production and delivery — v1

The accepted `trailer-preview-v5-action-sync` scene was rendered as full landscape and portrait films. The [human acceptance record](evidence/owner-acceptance-v5.json) confirms full normal-speed listening, uncertain-event reduced-speed checks and both layouts. Its input identity remains unchanged; model candidate flags remain historical evidence rather than a machine accuracy claim.

## Final files

Both files use H.264 at 60 fps, square pixels, limited-range Rec.709, fast-start MP4 and the unchanged original stereo AAC. The recording is **227.718095 seconds**; the 13,664-frame video duration is **227.733333 seconds**, less than one frame longer. There is no audio shift or retiming.

| Format | Dimensions | Bytes | Frames | Visible word states / wrong / ambiguous | Picture frames / failures |
| --- | --- | ---: | ---: | ---: | ---: |
| Landscape | 1920×1080 | 80,895,753 | 13,664 | 44,383 / 0 / 0 | 13,664 / 0 |
| Portrait | 1080×1920 | 64,412,553 | 13,664 | 44,383 / 0 / 0 | 13,664 / 0 |

For **each** film:

- All 9,807 original AAC packets retain payload bytes, PTS, DTS, sizes and durations. All 10,042,368 decoded samples retain the source PCM SHA-256.
- Complete strict decoding and every video timestamp pass; the maximum timestamp rounding error is below 0.001 ms.
- Every visible word in every decoded frame matches the frozen yellow/ivory focus state: 44,383 states, zero incorrect and zero ambiguous results.
- A source-image region is checked on all 13,664 frames, with all 66 cut/action checkpoints inspected against nearby expected frames. No critical event matched another frame better by the review margin.
- Thirteen native-resolution checkpoints pass pixel comparisons with the supplied encoder frames and were visually inspected across source artwork, trailer footage, lyric overlap, transitions and ending.
- Explicit pixel-aspect and complete color tags were normalized by stream-copy metadata passes. The complete decoded YUV stream is byte-identical before and after. No picture was re-encoded during normalization.

[Aggregate verification](evidence/final-verification.json) · [Landscape technical check](evidence/verification-landscape.json) · [Portrait technical check](evidence/verification-portrait.json) · [Landscape focus](evidence/focus-landscape.json) · [Portrait focus](evidence/focus-portrait.json) · [Landscape picture](evidence/picture-landscape.json) · [Portrait picture](evidence/picture-portrait.json)

The picture-region check detects missing, displaced and mistimed major image changes at reduced resolution; it does not certify every image pixel. The full-resolution checkpoint comparison and metadata equality checks are separate. Technical display checks do not replace the attested acoustic review.

## Posting kit

The new Desktop folder contains 12 verified files: two platform videos, two thumbnails, two titles, two descriptions, optional English SRT, a start guide, manifest and checksum list. The landscape thumbnail is 1920×1080; the dedicated TikTok profile cover is portrait 1200×1600. Full titles, remix credit and the focal face were inspected at small size and under a 5% portrait crop simulation. No actual platform upload preview is claimed.

[Posting materials](publishing/README.md) · [Cover review](evidence/cover-review.jpg) · [Cover identities](evidence/cover-assets.json) · [Local kit receipt](evidence/delivery-receipt.json) · [Desktop copy receipt](evidence/desktop-delivery-receipt.json) · [Checksums](evidence/delivery-checksums.sha256)

Every copied file matches the verified local kit. The manifest records the committed source revision, and later documentation commits preserve it in repository ancestry. Full media remain local; this handoff does not publish a video or create a public binary release.

## Reproduction and lessons

[Complete workflow](WORKFLOW.md) covers source locking, performed-lyric alignment, visual direction, distinct trailer edits, cut and movement timing, playback repair, reading-space protection, review gates, deterministic production, encoded checks, covers and delivery. [Production lessons](PRODUCTION-LESSONS.md) summarize decisions reusable on future songs. Commands and relative evidence paths are retained without private review quotations or local account paths.
