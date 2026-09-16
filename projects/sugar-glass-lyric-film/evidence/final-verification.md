# Sugar Glass — final delivery verification

Both complete English-only films reproduce the accepted preview-v2 composition and original soundtrack. Production followed explicit acceptance and render authorization. The review record preserves unavailable granular listening telemetry and the documented acoustic uncertainty.

## Verified deliveries

| Format | Dimensions | Frames | Decoded word states checked | Original AAC packets |
| --- | --- | ---: | ---: | ---: |
| landscape | 1920×1080, 60 fps | 13,881 | 73,026 | 9,963 |
| portrait | 1080×1920, 60 fps | 13,881 | 73,026 | 9,963 |

Both files use HEVC Main 10 / hvc1, 10-bit 4:2:0 pixels, square pixels and BT.709 limited-range metadata. Rendering captures 2× PNG frames into twelve ProRes 4444 segments per format, then applies one Lanczos downsample and a medium-preset CRF 17 encode. The source footage retains its 25 fps cadence; new graphics run at 60 fps.

## Checks passed

- Strict full-file decoding, complete frame inventory and every video timestamp against frame number / 60.
- Original 44.1 kHz stereo AAC payloads, PTS, DTS, packet durations and sizes retained exactly; no audio re-encode, gain or resampling. Decoded PCM SHA-256 and all 10,202,112 samples match the original.
- Every visible lead/backing word's decoded highlight agrees with the accepted event map, with zero mismatches and zero ambiguous states in both complete files. An intentionally shifted one-frame diagnostic produces 13 mismatches and four ambiguous states.
- All twelve reference segments have matching SHA-256 identities, complete packet inventories and contiguous global frame ranges.
- Representative final pictures and both sides of every capture join were inspected, including the opening title, large refrain, long lines, independent backing vocals, final lyric and complete tail.
- Fast-start MP4 structure places metadata before media data.

The paired 90-frame codec diagnostic scored full-frame SSIM 0.998144 and a lyric-region average PSNR of 53.549430 dB (minimum 52.023554 dB). These are sample measurements, not whole-film quality scores; [the diagnostic record](codec-diagnostic.json) records its exact scope.

## Timing and review limits

The 13,881-frame video lasts 231.35 seconds. Original audio lasts 231.340408163 seconds. The final video frame covers the fractional audio ending; the source picture is held within its last frame for the short remaining tail.

Display rounding differs from the frozen sample intervals by at most 8.321995 ms, below half a 60 fps frame. This is a display bound, not proof that acoustic boundaries are exact. Independent aligner disagreements, supplied wording and post-chorus questions remain in the [review record](sync-review.md). Overall preview acceptance is not represented as recorded per-cue listening.

## Identity and handoff

- landscape: SHA-256 `7a8f1bc0a45c23d5b3ceabdfdf2fe4f8ee852e7ea952656e35adac91f93f1d16`
- portrait: SHA-256 `bc6ccade6431e473b787888cb928b38a092b6a04f8948a3ff1db437fcfce49d1`

See the [structured receipt](delivery-receipt.json), [checksums](delivery-checksums.sha256), [production notes](../PRODUCTION-LESSONS.md) and [original source](https://www.youtube.com/watch?v=-NsQ8_WLq2s). Original music, lyrics, performance and mood video: Anya Nami. Added lyric presentation follows the Lyrics workflow in general with Codex assistance.

Full media stays local. This source handoff does not publish a new binary release or upload to a video platform.
