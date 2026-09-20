# Final autumn delivery verification

The complete **preview-v5-autumn-sync** was authorized for production after explicit human attestation of the full recording at normal speed, uncertain words and held endings at reduced speed, and both layouts. The [review record](cross-language-sync-review.json) binds that attestation to the frozen input hashes. Automated tests are supporting evidence, not a substitute for listening.

## Exact delivery files

| Check | Landscape | Portrait |
| --- | --- | --- |
| Dimensions | 1920×1080 | 1080×1920 |
| Decoded frames | 12,069 | 12,069 |
| Frame rate | 60 fps | 60 fps |
| File bytes | 53,004,015 | 47,451,421 |
| Visible word states checked | 60,417 | 60,417 |
| Highlight mismatches / ambiguous states | 0 / 0 | 0 / 0 |
| Source-picture frames checked | 12,069 | 12,069 |
| Picture failures | 0 | 0 |

Both films are HEVC Main10 (`hvc1`, `yuv420p10le`), limited-range Rec.709 with explicit matrix, primaries and transfer tags, square pixels and fast-start MP4. Video starts at zero; every frame timestamp equals its index divided by 60 within the verifier's 2-microsecond representation tolerance. The 201.150-second picture includes the last frame covering the original 201.133991-second audio presentation.

All **8,664 AAC packets** retain identical payloads, PTS, DTS, durations and sizes. Decoding preserves **8,870,336 stereo sample frames** at 44.1 kHz; codec padding accounts for the difference between decoded sample length and presented audio duration. The decoded Float32 PCM SHA-256 remains `3366495af9cf08ccdf0b7ad53b44d6da6fdecb161b70cd55484575b87103b667`. Strict full-file decoding passed.

- [Landscape technical report](Vedmy-landscape-1920x1080-60fps.mp4.verification.json)
- [Portrait technical report](Vedmy-portrait-1080x1920-60fps.mp4.verification.json)
- [Landscape focus audit](landscape-Vedmy-landscape-1920x1080-60fps.mp4.focus-verification.json)
- [Portrait focus audit](portrait-Vedmy-portrait-1080x1920-60fps.mp4.focus-verification.json)
- [Landscape picture audit](landscape-decoded-picture.json) / [portrait picture audit](portrait-decoded-picture.json)

## Picture and focus evidence

The production renderer preserves lossless 2× Chromium text and image layers, with deterministic falling-leaf geometry. Fourteen direct-scene comparisons and encoded diagnostic checks support [renderer adoption](raster-adoption.json). Sparse vector-edge antialiasing differences are recorded; this is visual equivalence, not a claim of bit-identical rasterization across engines.

The final word audit classifies eroded glyph-interior colors for every visible Russian and English word in every decoded frame. It checks the displayed focus against the frozen meaning map. A deliberate six-frame offset in the portrait diagnostic produced 389 mismatches and 119 ambiguous states, confirming the checker detects misalignment. That negative-control failure is intentional and separate from the passing final audits.

The picture audit compares the central photographed region in every frame at 96×96 against the approved shaded artwork. Maximum mean channel error was 4.885/255 in landscape and 4.870/255 in portrait, below the preselected 8/255 threshold. This catches missing, black or displaced imagery; it is not an all-pixel artwork-identity test. Leaf positions and encoding account for bounded variation.

Fifteen decoded checkpoints per layout cover 0–201.133 seconds, including the short negation, independently focused recipient in a discontinuous idiom, repeated refrains, final lyric and instrumental ending. All thirty were inspected as contact sheets; native checks include the representative 94.550-second frame, the 117.833-second recipient focus and the final 182.350-second portrait lyric. Text is legible, both languages remain equally prominent, and the original picture is present. The [landscape](landscape-decoded-stills.json) and [portrait](portrait-decoded-stills.json) inventories retain each selected frame's hash.

VideoToolbox omitted some color metadata during capture. A stream-copy metadata remux added the explicit Rec.709 tags without re-encoding. Every native 10-bit frame hash and timestamp was compared before and after, and remained identical: [landscape](production/landscape-color-metadata.json), [portrait](production/portrait-color-metadata.json).

## Handoff and limits

The [posting manifest](delivery-receipt.json) records exact final hashes and production source commit `6d8b7c4df46804bae25e675d0fa83ad82a7720ee`. Preserve that commit in ancestry when integrating the documentation and receipt commit. The [Desktop receipt](desktop-delivery-receipt.json) verifies all fourteen copied files, including separate covers, platform copy, optional captions and checksums. Covers passed native metadata and local small-display/crop review; no platform upload test is claimed.

The tests establish that the delivered files preserve the approved timeline, complete focus states and source audio. They do not measure speaker/display hardware latency or establish physically exact acoustic boundaries. Model disagreement remains available as preparation evidence, while completion of the requested listening review is explicitly attributed to the human attestation. No unresolved meaning, timing or presentation defect is recorded for this approved edition.
