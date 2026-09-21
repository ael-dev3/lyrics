# Preview verification — trailer revision

Date: 21 September 2026. This record covers a playable preview, not a rendered film or completed listening review.

## Technical checks

- TypeScript check and three focused tests pass: missing/stale/incomplete production evidence is rejected; every montage frame resolves to one edit shot; trailer visibility stays inside its intended music sections.
- 45 cues / 284 source words / 568 word-layout states pass ordered interval, containment, layout bounds and 60 fps visibility checks. Fixed line wrapping is balanced to avoid a one-word final orphan.
- Full recording duration: 227.718095 seconds; 13,664 60 Hz measurement/presentation rows. The original AAC payload SHA-256 equals the preview soundtrack payload SHA-256: `18188bb5c93ed58db8c9aa12e29e00e3417a4ae2a13f6807fb079059ebdceb2f`.
- Both silent trailer assets pass complete strict FFmpeg decoding. They contain 1,608 and 2,064 frames respectively at 1920×1080 / 60 fps, with no audio stream. Their original animation cadence is retained through retiming and frame repetition, not invented optical-flow motion.
- Calling the production command with the preview evidence rejects before capture or encoding. No full-length lyric-film file was created.

## Actual browser picture

The in-app browser loaded the complete composition and media at port 4323. Successive screenshots showed different source poses/scenes during both drop sequences. Landscape playback was checked around 01:42 through 02:04. Portrait playback showed the second sequence around 02:59 through 03:28, including 0.75× and 0.5× review. The portrait framing was enlarged after the first check to remove unused space above the picture.

Seeking between chapters and switching aspect ratios preserved visible footage. Restore visuals at the second-drop entry retained the current position, portrait format and 0.5× speed, then resumed decoded motion. The final vocal returned to the original artwork and readable lyric lane. Beginning and ending were checked with the complete soundtrack duration present.

A sampled slow-playback check had audio time 206.254084 s and second-asset time 27.082070 s against its 179.216667 s music offset, about 45 ms apart. This is a single browser sample, not an exhaustive sync guarantee. The player corrects active-media drift beyond 65 ms and shares the soundtrack clock for lyrics and spectrum.

## Evidence limits

Browser observations establish visible moving-picture presence at sampled moments, not exhaustive frame accuracy or precise lyric perception. The cue map remains provisional, with 121 events flagged for reduced-speed review. Processed vocal coverage, held endings and final-word transcription require actual listening. Technical picture checks do not mark any listener checklist complete. Explicit full-song production approval remains absent.
