# Findings for future live-recording previews

1. **Establish the performed inventory before alignment.** A studio lyric sheet and a live recording can differ in repeat count, shortened lines, vocalizations and spoken endings. Full-track recognition often collapses loops; bounded windows provide useful counterevidence. They still need listening review.
2. **Normalize spelling in a separate layer.** Keep both supplied references, the performed words and model candidates. Capitalization and accents should be reviewable editorial choices without changing acoustic boundaries. Rioplatense imperatives and verb accents need dialect-aware handling.
3. **Use one media clock.** A video element containing its original audio prevents independently started audio/video elements from drifting. Read its current time for the overlay at both normal and reduced speed. Report hardware latency and display-cadence limits separately.
4. **Inspect aligner failure modes.** Crop-edge pinning, detached low-confidence consonants and long vowel sustains can produce plausible-looking but wrong word spans. Keep raw alternatives and an explicit reason for each selection. A median is evidence handling, not proof.
5. **Preserve live footage's own movement.** Existing cuts, singers and instruments can provide sufficient animation. Add only a bounded measured spectrum and quiet reading support when they improve the experience.
6. **Review source credits in every format.** A soft portrait edge can obscure lower source lettering even with an uncropped image. Clear both decorative overlays and the edge mask before the original credits.
7. **Audit the displayed frame, not an unrounded sample.** A time just inside a cue can round onto the neighboring video frame. Geometry tests should verify the cue actually selected by that frame before asserting its word count or positions.
8. **Keep preview completion separate from listening signoff.** Full-recording playback, typed text coverage, technical tests, screenshots and a merged source PR do not constitute production authorization.

## Production findings

- Keep explicit human listening attestation separate from machine-observed telemetry. A confirmed full/slow/both-format review can complete the strict record without pretending individual checkbox events were observed. General acceptance alone is insufficient.
- Cached text-color reconstruction must include full descenders and isolate neighboring wrapped rows. Use whitespace boundaries between rows and verify the production pixels against the approved SVG before encoding.
- Opaque Canvas raw pixels can avoid an unnecessary ImageData copy. Verify byte equivalence and await the encoder write before mutating the canvas.
- Preserve source cadence with an explicit sample-and-hold rule, and verify every converted frame against the original source. A 60 fps graphics clock does not create new source-video detail.

- Treat requested encoder metadata as an input, not a verified result. Inspect actual bitstream and container color tags. If only tags are missing, a lossless metadata remux can correct them; prove that every native decoded pixel hash and timestamp is unchanged and retain both byte identities.
