# Production workflow — Люби меня, люби

The earlier production edition **`rose-paper-v1.0.0`** used the comprehensively reviewed **`preview-v2-rose-paper`** input identity. Its [delivery receipt](evidence/delivery-receipt.json) and final-file checks remain evidence for those v1 bytes.

The current **`preview-v3-duration-focus`** revision changes the English duration construction and paired display anchors in LM-002 and LM-013. It is a preview under review, with no replacement render or Desktop delivery. Earlier approval does not transfer to the changed inputs. Source preparation and technical checks remain supporting evidence, not listening telemetry.

## 1. Preserve the source clock

Use the [identified official recording](https://www.youtube.com/watch?v=DBGCHjBSNzo). Retain its original 44.1 kHz stereo AAC as `public/soundtrack.m4a`; a fast-start remux changes container placement without retiming the audio. Verify the extracted stream against the source before alignment. The [media manifest](source/media-manifest.json) records packet identity and source hashes.

The presented recording lasts **187.401995 seconds**. Decoding yields **8,265,152 samples per channel**, or 187.418413 seconds; those are different measured extents. Composition duration follows the presented recording. Word events use integer source-sample positions, while 60 fps display frames use nearest-frame conversion. Analysis copies and separated stems preserve time zero.

The album picture is static in the inspected source samples. Preserve the actual image and describe added visual motion as composition work, rather than implying source footage exists.

## 2. Resolve wording and meaning

Keep the supplied text separately from the performed sequence. Remove unrelated recommendation links. The map contains **33 cues, 147 Russian events and 169 English words**; each repeated occurrence has its own timing candidates. The earlier v1 map contained 167 English words; v3 revises the two duration lines without changing Russian wording. Targeted acoustic release/onset review is tracked separately from the translation change.

Use natural English order with explicit source correspondences. Preserve independently sung pronouns, negation and conjunctions. Complete expansions such as “out loud,” “fly away” and “am begging” share their source meaning event. Retain finer correspondence when natural English permits it: “Те / Those” and “же / same” each have their own sung event. Do not add unstated ownership to “the heart.” The case-based completion “with” begins with “жарким / with blazing”; “огнём / fire” retains its own following event. This avoids a detached preposition and backward highlight jump without changing the audio timing.

For LM-002 and LM-013, v3 selects **“Has loved, but not me, for years now.”** Map **Любит → Has loved**, **не → but not**, **меня → me**, and **уже → now**. Keep **который год** as the lexical basis of **for years**. Separately document the finer display anchors **который → for** and **год → years**: these stage the duration construction along its performed words, not assert that «который» literally means “for.” Use `sourceIds` for complete lexical coverage and the documented narrower `focusSourceIds` for these display anchors. Do not invent English acoustic timestamps or expand Russian highlighting merely because a target phrase has multiple lexical contributors. Natural English order places “now” last even though «уже» is sung before the duration phrase.

[Translation decisions and coverage](evidence/translation-review.md) retain the editorial rationale. `tests/semantic.test.ts` uses independently authored expectations and deliberately defective examples; reproducing a generated mapping alone would not establish correct meaning.

## 3. Keep acoustic candidates provisional

Compare bounded MMS alignments of the original mix and separated vocals, bounded Whisper observations and wider section candidates. Repeated performances retain independent windows; no copied chorus offsets or global correction are used. Store candidate disagreements and explicit selected exceptions in the boundary ledger.

Full and bounded transcription support the coverage audit but can omit verses, label sung material as music or invent ending credits. Waveforms and spectrograms support inspection; none of these observations is a listening attestation. The [timing record](evidence/timing-review.md) lists the current evidence, corrections and remaining review questions.

The v3 duration review exposed long neutral display gaps after «уже». Fresh unforced MMS observations from the original mix and vocal stem, plus [signal inspection](analysis/duration-focus-v3-signal.json), support held-vowel continuation rather than an earlier onset of the next word. Only four exclusive ends change: LM-002 «уже» to **11.880 s**, LM-013 «уже» to **79.120 s**, LM-002 «который» to **13.560 s**, and LM-013 «который» to **80.800 s**. All onsets, 143 other word intervals, and cue/visibility clocks remain unchanged. The extensions stop before the next word's closure/onset and preserve 32–57 ms gaps. Keep this acoustic evidence separate from lexical/display anchoring and from pending human review; see the [revision record](evidence/duration-focus-refinement.json).

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

Inspect a fresh load, seeking, normal and reduced-speed playback, both layouts and recovery at a known lyric moment. The preview includes the full 187.402-second recording and all intended layers. Saved notes are progress only. Complete review requires listening to the entire recording, reduced-speed checks of uncertainty and both bilingual layouts. The earlier attestation belongs to the v1 input identity. Review both changed duration passages and their transitions in v3; retain its pending status until current review and authorization are recorded.

### Still-reference provenance

`node scripts/preview-still.ts` generates landscape and portrait references at **33.200 seconds / frame 1992** from the shared scene. The local N-API canvas SVG rasterizer omits embedded raster images, so the script separately places the unchanged artwork PNG at the scene's exact dimensions, position and fixed −2° rotation. [The retained landscape reference](evidence/preview/landscape-33-2.png) illustrates the earlier composition and paired **жарким / with blazing** focus; it does not show the changed duration passages. These are rendered reference stills, not browser captures or decoded production frames; they cannot establish actual playback, browser pixel equality or audible synchronization. The README screenshot is separately identified as a decoded v1 delivery frame.

## 6. Enforce review before production

`npm run sync:gate` recomputes every declared project-relative file hash, rejects missing required inputs and prevents traversal outside the project. It also requires complete cue review and separate authorization bound to the same song, revision and hashes. Tests include changed scene bytes after a valid fixture freeze.

The v1 record had complete human-attested review flags and authorization for its inputs. The v3 wording and focus changes invalidate that approval for new production, even with the original soundtrack retained. Keep the new preview gate closed until its current review and explicit authorization are complete. The production renderer checks the gate before capture, retains the original AAC packets, and binds its own implementation to separate compositor and encoded-output evidence. A preview screenshot or passing test suite cannot replace these requirements.

Final verification checks the entire video clock and decode, original audio packet and PCM identity, visible word focus, picture presence, native-size composition and sampled encoded frames. Posting-kit construction requires the verified file hashes; the Desktop copy receives a separate complete-file hash check. See [production lessons](PRODUCTION-LESSONS.md) for the design and mapping decisions.
