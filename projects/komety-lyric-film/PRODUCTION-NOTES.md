# Кометы — approved v10 production and delivery

## Exact preview contract

The completed bilingual listening review and render authorization refer to `komety-preview-v10-first-final-eagle`, all 27 cue IDs and all 17 hashes in [preview-inputs.json](evidence/preview-inputs.json). The [owner review](evidence/sync-review.json) attests full-recording normal-speed listening, uncertain entrances/held endings at reduced speed and both native-wide and portrait layouts. [Authorization](evidence/production-authorization.json) is separate. Historical signal-analysis records retain their original listening fields; they are not retroactively converted into human listening logs.

No timing, translation, font, source framing or scene input changes during delivery. Read [production lessons](PRODUCTION-LESSONS.md) for the earlier failures and their first-pass prevention; [agent handoff](AGENT-HANDOFF.md) gives the startup order and file map.

## Streaming picture and word clocks

The production renderer uses the preview's `paintScene`, model, font and approved portrait surface factory. Original source frames decode sequentially into bounded RGBA buffers; rendered frames stream directly to FFmpeg. Large intermediate image sequences are unnecessary.

For output frame `n`, paint at `n / 60` seconds and use original source frame `min(6500, floor(n * 5 / 12))`. Original pictures keep their 25 fps ownership; word focus and musical response are evaluated at 60 fps. No picture interpolation, soundtrack offset, global anticipation or color-attack delay is added. On this 44.1 kHz source, output frame `n` corresponds exactly to audio sample `n * 735`.

Both formats contain 15,606 frames. Native wide is 1920×796, retaining the original whole picture without new letterboxing. Portrait is 1080×1920 with the unchanged 78-span framing plan. The last original picture is held through the 46.712 ms soundtrack tail. Total CFR picture duration is 260.100 s, leaving 13.288 ms of picture beyond the original decoded audio extent; the audio is neither padded nor shortened.

The original stereo AAC is copied without filtering, normalization or reencoding. Explicit BT.709 conversion, square pixels, H.264 and faststart provide ordinary upload compatibility. The renderer verifies the current production gate before capture and checks frozen identity again before finalizing an output. Existing outputs are preserved rather than silently overwritten.

## Commands

From the project folder, with the exact original source available:

```sh
npm ci
npm run check
node scripts/verify-render-clock.ts
node scripts/render-production.ts --check-gate
node scripts/render-production.ts --plan
npm run render:production -- --format landscape
npm run render:production -- --format portrait
```

`--check-gate` is read-only. `npm run check` uses that mode, so an authorized preview does not accidentally launch a full render during validation. Pure clock checks cover the 25→60 cadence, final-picture hold and fragmented/truncated decode buffers. Production always requires an explicit format. Each format is an independent bounded job; two authorized hosts may run concurrently when memory and disk headroom permit. Source/workflow publication does not launch rendering.

Final verification commands and concrete byte identities are recorded with the completed delivery evidence. Numerical and encoded checks prove execution of the selected timing; they do not replace acoustic review or certify a uniquely measurable lexical boundary in connected singing.

## Export defects caught before delivery

An early export failed the encoded gate and was quarantined. Its RGB-to-YUV conversion had the intended BT.709 matrix and limited range, but primaries/transfer tags were absent. Explicit final-frame color parameters must survive into the encoded H.264 metadata; never infer them solely from the filter command.

An independent integer-sample glyph audit also caught an exclusive release still gold at frame 2628 (43.800 s). JavaScript computed `43.8 * 44100` just below sample 1,931,580, leaving the old event active for one extra output frame. The production host now represents frame time on the correct side of that mathematical integer sample, within floating-point precision. Exhaustive tests found eight former wrong word states across five frames; 1,028 host times required normalization, at most 5.68×10⁻¹⁴ s. This is numerical normalization of the exact `n * 735` clock, not an audible offset or a change to the approved word event. Exhaustive frame/sample tests and an independent decoded focus oracle must verify it; shared helper agreement alone would miss the defect.

Thin 36 px endcard letters need font-scale-aware pixel masks. A one-pixel erosion can leave too few fill pixels, while unaligned opaque edge pixels can share YUV420 chroma with the background. The verifier uses only fully opaque, chroma-aligned 2×2 cells for those sparse cases, retaining the same gold/neutral distance thresholds. Native before/during/after crops and exact token point counts must accompany tiny cases; do not lower color criteria just to pass a word. Source-picture parity and the independent integer-sample oracle provide separate supporting checks.

Failed outputs never enter the kit. Both formats are rerendered and verified from the unchanged approved inputs after these host fixes. This is a delivery implementation repair, not a new visual or acoustic selection.

## Posting assets and public handoff

[Posting assets](publishing/README.md) include dedicated source-derived covers, titles/descriptions and optional Russian/English SRT/VTT. Each caption file has all 27 cue-level reading windows, including the second radio transmission. Word focus is baked into the films.

The packaging command requires both encoded verification and cover acceptance before copying files:

```sh
node scripts/package-delivery.ts --dest "$DELIVERY_DIR"
```

Use an authorized new absolute destination. The script refuses an existing folder, checks the exact approved inputs, verifies each copied SHA-256 and writes a manifest, checksum list and neutral repository delivery receipt. The Desktop folder and personal filesystem paths are not embedded in public evidence; only its label is recorded.

Full source video, analysis audio, model caches and rendered films remain excluded from Git. Public documentation includes the reproducible compositor/timing maps, review provenance, covers, representative verified stills and delivery identities. No platform posting or public full-media release is implied. Before any GitHub operation that may start Actions, follow the current repository approval policy and UTC-day history preflight; batch one coherent source/documentation handoff, verify it, merge it and confirm the default branch contains the intended source.

## Completed verification

Both files passed [complete encoded technical verification](evidence/final-verification.json), with 15,606 decoded frames, exact 60 fps timestamps, all 11,201 original AAC packet payloads/timestamps/side data and identical 11,469,824-sample decoded stereo PCM. BT.709 range/matrix/primaries/transfer, square pixels and faststart pass. No new source-black interval was found.

[Decoded scene verification](evidence/encoded-scene-verification.json) checks 1,066 output frames per format against 733 selected original pictures, every source/translation token focused and neutral (11,137 glyph checks per format), all 27 reading tails and every framing boundary. Maximum mean RGB differences are 1.42659 native-wide / 2.52013 portrait; minimum glyph matching fractions are 0.91016 / 0.93037, above the unchanged 0.90 criterion. The native film uses 17 explicitly recorded thin-token masks; portrait needs none. [Sparse-token measurements](evidence/thin-glyph-native-review.json) and [native neutral/gold/neutral contact](evidence/final-thin-glyph-contact.png) retain the small-word proof; these contact crops were visually inspected.

The [exhaustive clock record](evidence/renderer-clock-verification.json) binds the numerical/stream tests to current code and timing. These execution checks accompany the independently recorded owner listening scope; they do not replace it.

```sh
node scripts/verify-final.ts --landscape renders/KOMETY-landscape-1920x796-60fps.mp4 --portrait renders/KOMETY-portrait-1080x1920-60fps.mp4
node scripts/verify-decoded-scene.ts --landscape renders/KOMETY-landscape-1920x796-60fps.mp4 --portrait renders/KOMETY-portrait-1080x1920-60fps.mp4
```

Both-format runs produce complete reports; one-format runs are explicitly partial. Verifiers snapshot film/code identity before inspection and assert it remains unchanged afterward. Packaging matches both reports against every approved input and current renderer/verifier hashes, and each cover against its accepted source/revision/maker/JPEG identity. All 18 upload-kit files were copied and checked; the [receipt](evidence/delivery-receipt.json) identifies the result. The independent checksum command also passed for every manifest entry. Only rejected initial export media was removed; accepted films and the Desktop kit remain intact.
