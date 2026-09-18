# Final v6 delivery verification

The explicitly approved `preview-v6-shadow-static` revision is delivered in two complete 60 fps films, each 213.300 seconds long. Both preserve the fixed source illustration, voice-linked shadow texture, exact section-based spectrum emphasis and equal Russian/English focus.

| Format | Dimensions | Decoded frames | Visible word states | Focus mismatches |
| --- | --- | ---: | ---: | ---: |
| [Landscape technical report](Kazhdyy-landscape-1920x1080-60fps.mp4.verification.json) | 1920×1080 | 12,798 | 140,493 | 0 |
| [Portrait technical report](Kazhdyy-portrait-1080x1920-60fps.mp4.verification.json) | 1080×1920 | 12,798 | 140,493 | 0 |

## Actual-file checks

- Every video presentation timestamp equals its frame index divided by 60; all 16 contiguous production segments assemble without missing or duplicate timeline positions.
- Final assembly supplies durations from exact global frame boundaries. This corrected rounded portrait segment metadata while retaining every encoded video packet payload. The [landscape](production/landscape-assembly.json) and [portrait](production/portrait-assembly.json) records preserve the original and final hashes and timing method.
- Both files pass strict full decode, HEVC Main 10 / hvc1, 10-bit 4:2:0, BT.709 limited range, square pixels and fast-start metadata checks. Capture uses 2× PNG-derived ProRes 4444, one Lanczos downsample and CRF 17 delivery.
- All 9,187 original AAC packets retain identical payloads, PTS, DTS, duration and size. The complete decoded PCM identity matches the source: 9,405,888 stereo samples at 44.1 kHz.
- 280,986 displayed Russian and English word states were checked across both complete decoded films, with zero mismatches and zero ambiguous glyph samples. The separate deliberately incorrect 100 ms diagnostic produced 92 mismatches.
- Fifteen native decoded checkpoints per format cover intro, dense text, held words, medium/strongest transitions and ending. The [visual review](final-visual-review.json) records inspected frames and scope. The README image comes from frame 4332 / 72.200 seconds of the final landscape film.
- The [delivery receipt](delivery-receipt.json) and [checksums](delivery-checksums.sha256) bind both videos, platform copy, cover files and captions to the frozen source commit. Covers are separate promotional adaptations.
- The [Desktop receipt](desktop-delivery-receipt.json) verifies all 14 files after copying to the final destination. The [ending inspection](final-ending-check.json) records the native-frame visual check and low-amplitude compression residuals.

## Scope

These checks establish delivery integrity and agreement with the approved event map. They do not measure the acoustic correctness of every model-assisted word boundary. Current preview acceptance and render authorization are recorded separately from incomplete granular listening telemetry in the [synchronization review](sync-review.md). Historical v3–v5 records remain unchanged. Full films and original media remain local; source integration does not imply a public media release or platform upload.
