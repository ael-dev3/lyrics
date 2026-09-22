# Preview workflow — Люби меня, люби

The current edition, **`preview-v2-rose-paper`**, is **preview-only**. Source preparation, inferred timings and technical checks do not establish completed listening or authorize production.

## 1. Preserve the source clock

Use the [identified official recording](https://www.youtube.com/watch?v=DBGCHjBSNzo). Retain its original 44.1 kHz stereo AAC as `public/soundtrack.m4a`; a fast-start remux changes container placement without retiming the audio. Verify the extracted stream against the source before alignment. The [media manifest](source/media-manifest.json) records packet identity and source hashes.

The presented recording lasts **187.401995 seconds**. Decoding yields **8,265,152 samples per channel**, or 187.418413 seconds; those are different measured extents. Composition duration follows the presented recording. Word events use integer source-sample positions, while 60 fps display frames use nearest-frame conversion. Analysis copies and separated stems preserve time zero.

The album picture is static in the inspected source samples. Preserve the actual image and describe added visual motion as composition work, rather than implying source footage exists.

## 2. Resolve wording and meaning

Keep the supplied text separately from the performed sequence. Remove unrelated recommendation links. The current map has **33 cues, 147 Russian events and 167 English words**; each repeated occurrence has its own timing candidates.

Use natural English order with explicit source correspondences. Preserve independently sung pronouns, negation and conjunctions. Complete expansions such as “out loud,” “fly away” and “am begging” share their source meaning event. Document irreducible constructions, including “the same” and “year after year,” and use the union of participating source intervals rather than filling gaps between them. Do not add unstated ownership to “the heart.”

[Translation decisions and coverage](evidence/translation-review.md) retain the editorial rationale. `tests/semantic.test.ts` uses independently authored expectations and deliberately defective examples; reproducing a generated mapping alone would not establish correct meaning.

## 3. Keep acoustic candidates provisional

Compare bounded MMS alignments of the original mix and separated vocals, bounded Whisper observations and wider section candidates. Repeated performances retain independent windows; no copied chorus offsets or global correction are used. Store candidate disagreements and explicit selected exceptions in the boundary ledger.

Full and bounded transcription support the coverage audit but can omit verses, label sung material as music or invent ending credits. Waveforms and spectrograms support inspection; none of these observations is a listening attestation. The [timing record](evidence/timing-review.md) lists the current evidence, corrections and remaining review questions.

After the documented model inputs exist:

```sh
node scripts/build-cues.ts
node scripts/acoustic-review.ts
node scripts/timing-diagnostics.ts
npm run features
npm run layout
npm run check
```

`ALIGN_PYTHON` selects the model environment for `scripts/infer.ts` and `scripts/align.ts`. Exact inference commands and required analysis artifacts are documented in the timing record. Regenerate from the original candidates; do not repeatedly extend already modified boundaries.

## 4. Compose around the current artwork

Present the unchanged album image as a print with a pale sleeve edge and a soft offset shadow on warm rose paper. Its −2° rotation is fixed; the portrait does not shake, blink or rock with the music. The fine paper texture is stationary. Dark ink carries resting text and berry color carries current meaning.

Russian and English share Oswald Medium, active/rest colors and perceived emphasis. Each cue has fixed word geometry; longer lines reflow without shrinking English alone. Font measurement and SVG rendering use the same kerning setting.

Replace separate bars with one smooth ribbon driven by the locked soundtrack's 64 measured frequency bands. The display takes each feature attack immediately and applies an exponential release with a five-frame time constant, approximately **83 ms at 60 fps**, over the preceding 15 frames. Weighted neighboring bands smooth its spatial contour. A fixed sinusoidal profile and tapered ends create the ribbon shape; they are artistic geometry, not reconstructed sound pressure or vocal pitch.

Only the scene's frame-index transform is causal: it uses the current and preceding feature frames. The underlying measurements use forward/backward zero-phase filtering and centered RMS windows, whose frequency-dependent support includes nearby future audio samples. The overall display is therefore not a strictly causal meter, and its visible attack does not establish an exact acoustic transient onset. Keep this distinction separate from the word-event map and listening review.

Raw measurements remain separate from artistic height limits and smoothing. Lyric focus, line visibility and decorative response share one clock but retain distinct roles. Keep the artwork and spectrum shell persistent during lyric handoffs. Rebuild the shell only when the format changes, and confirm that the actual SVG image loads. The client preloader alone cannot prove picture presence. Check the complete print, long lines and maximum ribbon reach in both layouts at native and mobile sizes.

## 5. Freeze and inspect the complete preview

```sh
npm run review:build
node scripts/freeze-preview.ts
REVIEW_PORT=4324 node scripts/review-server.ts
```

The manifest binds the soundtrack, artwork, font, spectrum, cues, layout, focus/schema code, scene, painter, review client, HTML and compiled bundle. Build the bundle before freezing; the client fetches the identity at load time, avoiding a circular embedded hash. Changed input identities archive prior notes and invalidate affected review flags.

Inspect a fresh load, seeking, normal and reduced-speed playback, both layouts and recovery at a known lyric moment. The preview includes the full 187.402-second recording and all intended layers. Saved notes are progress only. Complete review requires listening to the entire recording, reduced-speed checks of uncertainty and both bilingual layouts; no such attestation is recorded yet.

### Still-reference provenance

`node scripts/preview-still.ts` generates landscape and portrait references at **33.200 seconds / frame 1992** from the shared scene. The local N-API canvas SVG rasterizer omits embedded raster images, so the script separately places the unchanged artwork PNG at the scene's exact dimensions, position and fixed −2° rotation. [The landscape reference](evidence/preview/landscape-33-2.png) illustrates the current composition and paired **жарким / blazing** focus. These are rendered reference stills, not browser captures or decoded production frames; they cannot establish actual playback, browser pixel equality or audible synchronization.

## 6. Keep production closed

`npm run sync:gate` recomputes every declared project-relative file hash, rejects missing required inputs and prevents traversal outside the project. It also requires complete cue review and separate authorization bound to the same song, revision and hashes. Tests include changed scene bytes after a valid fixture freeze.

The current record retains pending listening/layout flags and `approved: false`. `npm run render` checks the same gate and has no encoder or capture implementation. A future production pass needs explicit approval of the reviewed revision, completed synchronization evidence and independent final-file verification. A preview screenshot or passing test suite cannot replace those steps.
