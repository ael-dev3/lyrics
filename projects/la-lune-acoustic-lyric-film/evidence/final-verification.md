# Celestial v3 final verification

Both complete neutral-silver films preserve the earlier accepted timing and original recording.

| Format | Dimensions | Frames at 60 fps | Decimal size | Decoded word states | Mismatches / ambiguous |
| --- | --- | --- | --- | --- | --- |
| landscape | 1920×1080 | 11,854 | 16.36 MB | 25,186 | 0 / 0 |
| portrait | 1080×1920 | 11,854 | 20.01 MB | 25,186 | 0 / 0 |

Every video timestamp follows its global frame index at 60 fps within the 2 μs serialization tolerance. Both films strictly decode as HEVC Main 10 / hvc1, yuv420p10le, square pixels and BT.709 limited range, with fast-start metadata. No frame is missing or duplicated at segment joins. The 197.5667-second video covers the entire 197.555374-second recording.

All 8,508 original AAC packet payloads, PTS, DTS, duration and size fields match in each delivery. Both decoded tracks have 8,712,192 stereo samples at 44,100 Hz and PCM SHA-256 `7daaa85552f47cee9ce1f69b089b61ff1919387a53bb86d57f39d9f3a0ad4067`. Audio is neither retimed, resampled nor gain-adjusted.

The [event audit](final-sync-audit.json) covers all 49 French and 56 English words. Every decoded visible word state matches the frozen source/meaning map. The deliberately shifted diagnostic detects 292 errors, confirming that the classifier can reject an offset. [Renderer comparisons](raster-adoption.json) report the small supersampled antialiasing differences separately from exact native preview-adapter parity. All 69 cache layers per format were freshly captured for the neutral palette, and every v3 film segment was rerendered.

## Illumination and stars

The [source audit](celestial-audit.json) verifies constant Moon/halo opacity over all 11,854 frames, neutral palette, star projection and bounded independent scintillation. The [encoded Moon audit](encoded-moon-illumination.json) samples 321 central-surface regions per film from 30–190 seconds: maximum per-channel temporal range 0/255, maximum RGB channel separation 0/255. Intro reveal and final fade are intentionally excluded.

## Final file hashes

- La-Lune-Celestial-v3-landscape-1920x1080-60fps.mp4: `89e2422006381cbf76868a607bb230b2b5856e87a1173b1cc20977989b866254`
- La-Lune-Celestial-v3-portrait-1080x1920-60fps.mp4: `73f9402627288ae317e5545126abdf51413f048fb848a9416abaee047170e534`

## Scope and limits

These tests establish fidelity to the preserved timing map and recording, not perfect acoustic boundaries. The [current authorization](render-authorization.json) records an owner-directed visual correction and replacement delivery; the subsequent [explicit preview acceptance](owner-acceptance-v3.json) is recorded separately. Granular listening fields and model-assisted uncertainty remain visible in [the review](sync-review.json). [V2 evidence](history/v2/README.md) remains historical.

The catalogue star pattern uses J2000 coordinates; the oversized Moon is artistic, with no dated ephemeris or horizon claim. Twinkling and monochrome colors are display choices. The original 1254×1254 Moon is supersampled alongside vectors and text without inventing source detail. Full films remain local; no video-platform upload or public binary release was performed.

The [final three-pass recheck](final-three-pass-review.json) reconfirms these same file hashes and all 14 Desktop assets after explicit preview acceptance.
