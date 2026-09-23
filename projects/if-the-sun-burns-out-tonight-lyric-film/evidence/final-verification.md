# Final production verification

The accepted `word-atmosphere-v5` preview is bound to [render authorization](render-authorization.json) and the [proven production adapter](production-adoption.json). The recording contains 44 lyric lines and 254 individually timed words.

## Evidence roles

- Human review: current complete preview accepted; the earlier targeted listening passages were also accepted. This is reviewer attestation, not invented per-cue telemetry. Earlier acoustic candidate uncertainty remains recorded.
- Logic and source checks: 44 tests pass, including required approval/adoption failures. See [final checks](final-checks.json).
- Production proof: exact font face, frozen browser word geometry and all effect classes were checked. A native shadow omission was repaired before production; see [still review](production-still-review.json).
- Final MP4 checks: results are recorded separately for each actual output hash after complete encoding.

## Scope of the picture check

The landscape composition retains the original 1920×818 dimensions with no added letterbox. Portrait retains the full panorama at 1080×460 over source-derived moving fill. Every final frame is compared with the matching source time for near-black dropouts and substantial dark regions. The source itself has one near-black frame at 209.416667–209.458333 seconds. The scan distinguishes that source imagery from newly introduced blanks; it cannot rule out every tiny pixel defect.

Word-focus checks inspect decoded glyph pixels at every word midpoint and additional neutral gaps, independently of the renderer's focus selector. They verify the display of the selected timeline, not absolute acoustic correctness or every individual boundary frame.

## Completed results

| Check | Landscape | Portrait |
| --- | --- | --- |
| Dimensions | 1920×818 | 1080×1920 |
| Frames / frame rate | 14,056 / 60 fps | 14,056 / 60 fps |
| Complete strict decode and frame grid | PASS | PASS |
| Decoded audio identical to source | PASS | PASS |
| Source-picture and outer-fill dropout scan | PASS | PASS |
| Word midpoints / sampled frames | 254 / 399 | 254 / 399 |
| Glyph checks / suspects / ambiguities | 2,169 / 0 / 0 | 2,169 / 0 / 0 |

- **Landscape SHA-256:** `7e1afd73d28edf7546e412ac54879ba9e5e4fe3d34d2618fd21da45ced7d8bd2`. [Technical report](landscape-verification.json), [encoded focus report](landscape-word-focus-audit.json).
- **Portrait SHA-256:** `cdb8d01c01a16451a993aeef6b1a6286153d0738769ccc609efc3caf1fd5cf0a`. [Technical report](portrait-verification.json), [encoded focus report](portrait-word-focus-audit.json).

[Final visual review](final-visual-review.json) covers ten exact decoded frames. [Delivery receipt](delivery-receipt.json) binds the 13-file kit and verified Desktop copy. Full soundtrack/video files remain local; no platform post or public full-media release was made.
