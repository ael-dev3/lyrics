# Decoded highlight verification

The source-state tests prove the event logic. The additional decoded-pixel check independently checks what survives capture and compression.

`scripts/audit-decoded-focus.ts` constructs eroded glyph-interior masks from the bundled font and frozen word positions. For each visible Russian and English word in every decoded delivery frame, it reads up to 32 interior pixel samples. Median red-minus-blue separates pale-gold focus from the blue-silver resting text. Samples that are unexpectedly dark are explicitly ambiguous, not silently accepted. Observed states are compared with the source-clock event map at that frame.

The calibration uses the actual 15–17 s portrait HEVC candidate: 120 frames and 1,740 visible word states, with zero mismatches and zero ambiguous states. A deliberate one-frame oracle offset produced ten detected mismatches, confirming that the checker catches brief onset and release errors. This includes the simultaneous Russian “тихий” and English “a quiet” onset. The source capture, ProRes and HEVC all retain that onset.

This test can expose lost brief words, wrong focus, stale raster frames and compression that obscures the active color. It does not establish whether a sung word's chosen acoustic boundary is correct; that remains the reviewed timing authority. Final reports record their full decoded-frame and word-state counts.

## Negative control

A deliberate +1 frame shift of the expected timeline produced ten detected word-state mismatches in the same two-second sample, including the Russian word, its English article and its English adjective at onset and release. The control is retained as an expected-failure fixture, separately labelled from positive delivery verification.
