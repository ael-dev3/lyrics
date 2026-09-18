# Preview v6: voice-linked shadow static

**Revision: `preview-v6-shadow-static`. The current preview was accepted and explicitly authorized for production on 17 September 2026.** Both full films are rendered and verified; see [final verification](final-verification.md). The accepted v3 identity and earlier diagnostic checks remain separate historical evidence.

## Visual hierarchy

The original illustration geometry stays completely still. Fine ivory noise shifts inside the darkest source regions; the spectrum carries the larger musical movement; Russian and English retain equal fixed word geometry and source-linked color emphasis. Ink, ivory and vermilion remain the only authored base colors.

| Time window | Strength | Maximum authored bar height |
| --- | --- | ---: |
| 0:00–1:10 | Normal | 39 px |
| 1:10–1:28 | Medium | 111 px |
| 1:28–2:38 | Normal | 39 px |
| 2:38–2:55 | Medium | 111 px |
| 2:55–3:10 | Strongest | 297 px |
| 3:10–end | Normal | 39 px |

The exact window starts are inclusive and ends exclusive. Smooth 300 ms transitions occur **inside** the designated windows. At 2:55, medium blends directly into strongest without a dip through normal size. At 3:10, travel is back to normal. No extra emphasis occurs before or after the specified ranges.

## Measured response within those limits

The original 64-band data remains unchanged. A separate vocal stem is measured as stereo RMS in a 32.018 ms centered window at each 60 fps frame. Calibration uses the 35th and 99.5th percentiles of eligible frames above −45 dBFS, followed by a power curve of 1.5. No causal smoothing, beat quantization, peak hold or lyric offset is added.

Normal travel is fixed at 36 px plus the 3 px minimum bar. Medium travel ranges from 90 to 108 px according to vocal energy, and strongest travel ranges from 170 to 294 px. Each measured band retains its own frequency shape within that common artistic budget. Outside the designated windows, vocal energy contributes no extra size.

This is an artistic display transform. A separated stem can contain instrumental leakage and reverberation; it is not a word-timing authority or an emotion score. Raw band measurements, original audio, lyric sample intervals, translation mappings and word layouts remain unchanged.

The [measurement manifest](../analysis/vocal-energy-manifest.json), [shared mapper](../src/visualizer.ts) and [full-timeline section checks](vocal-response-check.json) record the exact method. Observed peak heights are 38.26 px in normal material, 108.46 px in the first medium section, 107.99 px in the second medium section, and 297 px in the strongest section.

## Shadow texture

The 384 events come from local peaks in isolated-vocal spectral-shape change over 30 ms, with a smaller positive-level-change contribution. A −32 dBFS gate, percentile threshold and 240 ms event spacing prevent constant free-running noise. Each event produces three deterministic grain states over five frames, then holds until the next event. This is a musical texture map, not speaker recognition or a new lyric clock. Stem artifacts remain possible.

Only original pixels below 20% luminance enter the mask. Red source pixels are explicitly excluded, and three-pixel erosion protects the silhouette and hatch lines. An ivory layer at 20% opacity introduces no fourth base color. Picture position, scale, lyric geometry and exact v5 strength windows stay fixed. The [shadow manifest](../analysis/shadow-manifest.json) and [shadow checks](shadow-check.json) preserve the method and inspection limits.

## Verification

- Tests check the exact boundaries and every one of the 12,798 frames. All frames outside the selected windows use normal travel. The picture transform is identical throughout both formats.
- The live browser audit checks 3,086 focus/boundary states and 53,116 word boxes, including parity of artwork pose, shadow seed and all 64 spectrum paths with the static renderer. No mismatches, collisions or unsafe word placement were observed.
- Native stills cover quiet material, both medium sections, the strongest passage, dense bilingual text, intro and ending. The higher bars remain within the artwork panel and preserve the reading region.
- The [v6 cache comparison](artwork-cache-equivalence.json) records byte-identical direct and cached ProRes diagnostics in both layouts, with zero decoded pixel differences across 120 frames each. Both current encoded diagnostics passed all 2,040 visible-word checks per format. A deliberate 100 ms offset produced 92 focus mismatches, confirming that the decoded check detects timing errors.
- The [v4 audit](motion-review-v4.md) records historical adapter diagnostics. Full-length v6 verification checked 280,986 visible word states across both films with zero focus mismatches or ambiguous samples, plus all timestamps and original audio identity. Thirty decoded checkpoints support the [visual review](final-visual-review.json).

The actual-audio checklist remains incomplete. Overall preview approval and technical agreement with the event map do not fabricate listening telemetry. The browser's audio clock drives the scene; hardware latency and display cadence remain separate from frame-grid precision.

The [v5 audit](motion-review-v5.md) preserves the preceding section-only revision.

The [v3 audit](motion-review-v3.md) and its percussion event map remain historical. Neither picture pulses nor that attack map is consumed by the current scene.
