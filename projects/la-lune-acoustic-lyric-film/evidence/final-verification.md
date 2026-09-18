# Final delivery verification

Both complete files preserve the accepted lunar design and original recording.

| Format | Dimensions | Frames at 60 fps | Decimal size | Decoded word states | Mismatches / ambiguous |
| --- | --- | --- | --- | --- | --- |
| landscape | 1920×1080 | 11,854 | 18.71 MB | 25,186 | 0 / 0 |
| portrait | 1080×1920 | 11,854 | 23.15 MB | 25,186 | 0 / 0 |

Every frame timestamp follows its global index divided by 60, within the 2 μs timestamp serialization tolerance; no duplicated or missing frame occurs at any segment join. Both files strictly decode and use HEVC Main 10 / hvc1, yuv420p10le, square pixels, BT.709 limited range and fast-start metadata. The video spans 197.5667 seconds, covering the complete 197.555374-second audio clock.

The 8,508 original AAC packet payloads, PTS, DTS, duration and size fields are identical in each delivery. Decoded audio remains 8,712,192 stereo samples at 44,100 Hz with PCM SHA-256 `7daaa85552f47cee9ce1f69b089b61ff1919387a53bb86d57f39d9f3a0ad4067`. There is no audio retiming, resampling or gain change.

The [full event audit](final-sync-audit.json) covers all 49 French and 56 English words; each delivery's decoded color checker verifies all 25,186 visible word states. A shifted diagnostic produces 292 detected errors. The [renderer comparison](raster-adoption.json) records bounded antialiasing differences from direct 2× SVG capture, followed by passing encoded diagnostics in both layouts.

## Artifact hashes

- La-Lune-landscape-1920x1080-60fps.mp4: `a38efe0e61a86eeb57793feaf0b9be2bfaea279ce1c0c8ae027cffa69743dca7`
- La-Lune-portrait-1080x1920-60fps.mp4: `295f9195460a33eec22bf79521466dd7a4627089690006d0023cbedf07b3ef86`

## Scope and limitations

These checks prove fidelity to the approved event map and recording. They do not establish perfect acoustic word boundaries. Overall preview acceptance and explicit render authorization remain separate from incomplete granular normal-speed, reduced-speed and audiovisual listening fields. Model candidates, source-word review flags and uncertainty remain preserved. See [production notes](../PRODUCTION-NOTES.md), [sync review](sync-review.json) and the [pre-production snapshot](review-before-production.json).

The 1254×1254 lunar source is supersampled with code-native vectors and text; this does not create additional lunar source detail. Full videos stay local. No platform upload or public binary release is part of this delivery.

## Reports and decoded image review

- Landscape: [technical report](La-Lune-landscape-1920x1080-60fps.mp4.verification.json), [decoded word colors](landscape-La-Lune-landscape-1920x1080-60fps.mp4.focus-verification.json), [visual review](landscape-visual-review.json).
- Portrait: [technical report](La-Lune-portrait-1080x1920-60fps.mp4.verification.json), [decoded word colors](portrait-La-Lune-portrait-1080x1920-60fps.mp4.focus-verification.json), [visual review](portrait-visual-review.json).

Fifteen decoded checkpoints per format were inspected, with frame 2808 additionally reviewed at native size. The representative README screenshot comes from that exact final landscape frame. All seven project regression tests, TypeScript, boundary/color checks and the scoped production gate passed before packaging. [Runtime isolation findings](runtime-memory-validation.json) document the sustained-export correction without changing the approved visual or timing inputs.
