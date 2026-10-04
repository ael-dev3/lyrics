# Start here — Светлое чувство

Continue the current complete preview. Read the repository `AGENTS.md`, [preview gate](../../docs/preview-before-render.md), [connected singing guide](../../docs/connected-phoneme-onset-workflow.md), [bilingual mapping](../../docs/bilingual-lyric-workflow.md) and [scene integration](../../docs/scene-integrated-visuals.md) first. This recording's shadow theatre and window lighting are intentional; do not import another song's palette, geometry or timing offsets.

## Source and timing authority

- Exact recording SHA-256: `9563b2098827fcf2ee18e0f1b573ded5f5e147be3faf258b5f2507162690a655`.
- Native picture: 1080×1080, 25 fps, 4,419 frames, 176.760 seconds.
- Original zero retained. Decoded stereo audio: 44.1 kHz, 7,796,160 samples, 176.783673469 seconds. Container audio and picture extents differ slightly; retain the final decoded picture through the short audio tail.
- Russian lexical samples in `source/russian-timing-proposals.json` feed `public/timeline.json`. Every sung occurrence has a separate ID. Do not copy refrain times, advance all words, or use sparse character endpoints as complete held vowels.
- Supplied reference wording is retained in `source/english-editorial-draft.json`; performance coverage is checked separately. The late closing reprise must survive the long instrumental passage. Automatic recognition omitted parts of the opening and invented a late subtitle credit; neither omission nor invention is authoritative.
- English uses exact contributor unions. “Grew up,” implied copulas, articles and inflected meanings must all activate. Each separately sung самое / огромной repetition remains independent, even when a display hyphen joins its written form.
- Keep lexical focus, neutral reading hold, line fade and picture cadence separate. `sourceActive` repairs only floating-point representation at exact integer samples. Incoming voice is fully visible at its selected start; pause commits the real stopped source time.

## Scene contract

`src/scene.ts` paints the actual source frame first. The square stays unchanged in size and aspect. Portrait places it at y400–1480; reflected unoccupied top-edge material continues the pale screen, and defocused floor material fills below. No second figure, missing layer, black replacement or crop is permitted.

Both languages use Noto Serif 500 at the same size, weight and pigment strength. Native phrases fit two single rows in the source's empty upper strip; portrait uses a larger shared size with up to four rows and a protected top margin. Ink rests at `#282720`, active words turn rust `#ab3810`. Geometry stays fixed. The original printed title remains visible.

Ten polygons in `public/window-anchors.json` follow photographed paper-house openings. Their inward feather and canonical-source luminance mask preserve the dark paper and crossbars. There is no blurred outer glow. Twenty-four 40 Hz–10 kHz logarithmic measured power bands are grouped across ten windows. The authored exposure curve is `clamp((groupDb+50)/34)^1.25`; multiplying quiet panes by warm pigment and screening stronger panes makes a bounded light response. This is an environmental visualizer, not a calibrated amplitude meter. FFT/RMS windows are documented in the feature file and never determine word timing.

## Review and production boundary

`npm run prepare` rebuilds the timeline and served JavaScript bundle, freezes all required complete-preview hashes and resets listening/render approval to pending. Run `npm run check`, shared-scene stills and real-browser picture/focus/seek/layout/slow/recovery checks after any change. Inspect every phrase in both formats at realistic phone width, especially the long cottage/memory clauses, distinct repeated words and final held light.

Signal comparisons and passing code checks are not a listening attestation. Record the actual reviewer and scope before marking full synchronization complete. The current production command refuses missing, stale or incomplete evidence before capture. Export implementation and renderer parity are a later approved stage; do not use preparation or preview to encode a hidden full film.

Publish source/workflow only after local validation and diff review. Before each push, PR operation, merge or other potential Actions trigger, inspect all workflows and every current UTC-day run/attempt across branches and actors; estimate resulting runs/minutes, coordinate one remote writer and preserve unknown monthly usage as unknown. Never alter triggers/checks to fit a budget. Verify and merge completed source changes under the current approval policy. This does not authorize original-media releases or platform posting.
