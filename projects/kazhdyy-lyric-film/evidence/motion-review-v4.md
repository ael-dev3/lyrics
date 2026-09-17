# Preview v4: still artwork and stronger vocal response

**Revision: `preview-v4-vocal-response`. Corrected preview ready; current-revision full rendering remains pending.** The earlier v3 approval and pre-render review are retained separately. Only short diagnostic encodes have been made.

## Final visual roles

- The original illustration remains completely still. Its transform is identical across all 12,798 frames in both formats. No picture pulse, camera drift, extra eye overlay, orbiting contour, artificial steam or palette inversion remains.
- The 64 measured spectrum bands carry all musical movement. A separate vocal-energy control increases their travel during strong singing in every section. This is an artistic gain applied after measurement; full-mix spectral data is unchanged.
- Russian and English keep equal, fixed word geometry and source-linked color emphasis. Vocal intensity never changes lyric times, position or size.
- The palette remains ink, ivory and vermilion. The artist divider, static picture boundary, title cards and ending fade serve hierarchy and transitions.

## Vocal measurement and display

The existing Demucs vocal stem is measured as stereo RMS in a **32.018 ms centered window** at each 60 fps frame. There is no causal smoothing, peak hold, beat quantization or lyric-time offset. Calibration uses the 35th and 99.5th percentiles of frames above −45 dBFS, followed by a power curve of 1.5. The stem can contain instrumental leakage or reverberation; it is not a perceptual emotion detector or a word-timing authority.

Each band retains its measured frequency shape. Its travel budget is `44 + 50 × chorus + 200 × vocalDrive`, with a 3 px minimum and 297 px hard ceiling after the band display transform. Quiet vocals contribute no added reach. Loud vocals can expand the bars outside a chorus; section labels no longer impose a low ceiling on strong verse singing.

| Measured window | Previous peak height at that frame | Revised peak height |
| --- | ---: | ---: |
| Strong verse vocal, 43.750 s | 37.34 px | 235.75 px |
| First chorus, 73.283 s | 108.46 px | 290.09 px |
| Second verse ending, 139.683 s | 37.39 px | 236.10 px |
| Last chorus, 185.750 s | 111 px | 297 px |

These are geometry comparisons on the same soundtrack frame, not claims of acoustic boundary accuracy. The [measurement manifest](../analysis/vocal-energy-manifest.json), [per-frame vocal values](../public/vocal-energy.json), [shared mapper](../src/visualizer.ts) and [response checks](vocal-response-check.json) make the transformation reproducible.

## Verification and scope

The native stills cover quiet and strong passages, dense bilingual lines and both formats. Taller bars remain in the artwork panel and preserve the fixed reading region. The browser audit checks 3,086 states / 53,116 word boxes, including static-scene parity for all 64 bar paths, word focus and artwork pose. No mismatches or layout failures were observed.

Two 120-frame production diagnostics use 2× PNG capture, ProRes 4444, one Lanczos downsample and HEVC Main 10 encoding. Both pass strict decoding and a glyph-interior audit of all 2,040 visible Russian/English word states, with zero ambiguous states or focus mismatches. Full-render verification is still pending.

Artwork/filter nodes remain mounted during browser playback and hidden inspector drawing is deferred. Playback follows the unchanged original AAC's media clock. The historical [v3 playback observations](playback-diagnostics.json) describe that implementation's measured limits; they do not certify v4 cadence or device latency. The actual-audio review fields remain incomplete. No synthetic listening completion is recorded.

The [v3 purpose audit](motion-review-v3.md) is retained as historical evidence. Its attack map is no longer consumed by the scene.
