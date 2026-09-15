# Твои глаза — production lessons

Recorded 16 September 2026. This is a production retrospective for the verified Russian / English edition of **POLNALYUBVI — Твои глаза / Your Eyes**. It records reusable decisions and measured outcomes in neutral editorial language. The edition applies the Lyrics workflow in general.

## Creative result: restraint as a finished choice

The accepted composition establishes a successful restrained treatment for a gentle, contemplative arrangement. Original animation carries the atmosphere; equal serif lyric rows carry the meaning; a small pale-gold spectrum supplies a quiet connection to the music. The composition leaves room for the voice and illustrated scene throughout the song.

The useful lesson is to select visual intensity for the recording. A calm song can remain expressive with modest bar travel and subdued opacity. More forceful material may support greater reach or transient accents. Those choices belong to the arrangement and picture, while precise timing and readable bilingual text remain consistent production standards.

Treat this as an implemented option for future gentle tracks. Its colors, fonts and numeric settings are specific to this composition. Establish the next song's own palette and motion range in a short audiovisual style review, then preserve the selected treatment through the render.

## The restrained visualizer

The authoritative implementation is [sceneSvg](src/scene.ts), with the frozen [band analysis](analysis/manifest.json) and [composition](src/Film.tsx). The bars display 64 distinct stereo bands from 20 Hz to 20 kHz. Their height is an artistic transform of measured dBFS RMS values.

| Setting | Landscape | Portrait |
| --- | ---: | ---: |
| Delivery raster | 1920×1080 | 1080×1920 |
| Band count | 64 | 64 |
| Bar width / horizontal step | 6 / 12 px | 8 / 13 px |
| Baseline, measured from the top | 1053 px | 1660 px |
| Height floor | 2 px | 2 px |
| Additional height range | 0–22 px | 0–40 px |
| Total height cap | 24 px | 42 px |
| Height cap as fraction of frame height | 2.22% | 2.19% |
| Maximum group opacity | 0.60 | 0.60 |
| Bar color | Pale gold `#ffe3a0` | Pale gold `#ffe3a0` |
| Added graphics cadence | 60 fps | 60 fps |

For a band value `d` and time `t = frame / 60`, the actual renderer uses:

```text
u = clamp((d + 65) / 60, 0, 1)
height = 2 + u^1.5 × (landscape ? 22 : 40)
opacity = 0.60 × clamp((161 - t) / 1.2, 0, 1)
```

The height mapping reaches its floor at or below −65 dBFS and its cap at or above −5 dBFS. The exponent compresses low and intermediate visual travel. The renderer adds no transient extension, peak hold, spatial smoothing or per-frame renormalization. The measurement pipeline has its own frequency-dependent filtering and centered RMS windows, documented in the analysis manifest; those are distinct from artistic animation smoothing.

The spectrum remains at full configured opacity through 159.8 s and fades to zero at 161 s, together with the added title. This lets the original ending and credits finish. Source picture, line visibility, word emphasis and this decorative fade use separate controls on the shared clock.

**Manifest clarification:** the frozen analysis manifest's `display` sentence says “Fixed -60 to 0 dBFS scale.” That sentence does not describe the delivered bar-height mapping. The formula above, read from the frozen renderer, is the actual −65 to −5 dBFS nonlinear display transform. Raw Float32 measurements remain unchanged, and the presentation JSON rounds them to 0.01 dB. This decorative spectrum has no calibrated axis; its pixel height should not be read as a linear meter. Preserve the historical analysis identity and use this clarification when reproducing or adapting the film.

For future projects, store measurement units and display transforms in separate manifest fields. Verify the description against the renderer before freezing production inputs.

## Typography and source picture

- Both languages use bundled Cormorant Garamond Semibold, weight 600: 64 px in landscape and 78 px in portrait. Long lines reflow within the composition while the languages retain equal size and weight.
- Inactive words are blue-silver `#b8c8d8`; current meanings are pale gold `#ffe3a0`. Focus changes color with stable glyph positions. The original animation and serif text provide the principal visual character.
- Landscape retains the complete source frame beneath continuous shading. Portrait reserves a 1080×608 source-picture region beginning at y=208, with a vertical edge fade and dedicated reading space. Each format uses its own layout on the same soundtrack.
- The 2560×1440 source animation retains its 30 fps cadence. Added graphics run at 60 fps. Supersampling improves the added text and graphics; it does not create additional source-animation detail or source frames.

## Synchronization and meaning

All 26 cues, 154 Russian tokens and 195 English words receive complete mapped emphasis. Natural English order can differ from Russian order. Necessary articles, auxiliaries and other grammatical completions share their source event. Multi-source target meanings follow the union of the relevant intervals, preserving gaps between them.

Repeated choruses retain independently measured timings. The source clock is the first presented decoded sample of the original 44.1 kHz recording. A separate 48 kHz analysis copy supplies the stereo spectrum; delivery audio remains the original AAC stream.

The [review record](evidence/cross-language-sync-review.md) preserves the overall review attestation and rendering authorization, with unavailable per-cue, speed and format telemetry explicitly left unclaimed. Independent aligner disagreement remains visible in the boundary ledger. The render gate verifies review status, complete mapping and frozen input hashes before capture.

Reusable lessons:

1. Audit the whole recording, including intro, gaps, repetitions and the tail beyond supplied text. Investigate transcription omissions and hallucinations against the actual recording.
2. Highlight complete translated meanings. Additional grammatical words may share a source event without receiving fabricated acoustic timestamps.
3. Keep semantic coverage, acoustic confidence, audiovisual review and file integrity as separate evidence categories.
4. At 60 fps, the measured maximum rounding difference of 8.322 ms describes display quantization. It does not establish exact acoustic boundaries.

## Rendering and verification lessons

| Finding | Reusable action | Evidence |
| --- | --- | --- |
| Software ProRes encoding was the capture bottleneck; completed PNG sequences were recoverable. | Preserve captures, verify frame counts and segment identity before adopting a hardware-encoded reference, and keep the frozen scene and source clock intact. | [Capture and reference encoding](evidence/render-performance.md) |
| A compositor cache experiment changed pixels by up to 2/255 without demonstrating a throughput gain. | Require both image equivalence and measured speed benefit before adopting an optimization. The experiment was excluded from production. | [Performance record](evidence/render-performance.md) |
| Millisecond container timestamps caused a false onset mismatch in codec comparisons. | Pair equal frames on an exact 1/60 timebase before interpreting quality scores or difference images. Inspect lyric regions separately from whole-frame metrics. | [Codec selection](evidence/codec-selection.md) |
| HEVC inherited unspecified sample aspect ratio from its reference input. | Set SAR 1:1 before encoding and validate container and bitstream metadata. A metadata-only repair must prove every decoded video byte and all audio packets unchanged. | [Square-pixel correction](evidence/metadata-correction.md) |
| Correct source-state logic alone cannot prove correct encoded highlighting. | Sample eroded glyph interiors in decoded frames and compare every visible word with the frozen event map. Include a deliberate timing error to verify checker sensitivity. | [Decoded-focus method](evidence/decoded-focus-method.md) |
| The original picture ends about 62 ms before the original soundtrack. | Hold the last source picture through the remaining audio without truncating or retiming the recording. Verify credits and the final decoded frame. | [Review record](evidence/cross-language-sync-review.md#technical-change-after-review) |

The final route used 2× PNG capture, eight contiguous ProRes 4444 segments per format, one Lanczos downsample, and HEVC Main 10 at CRF 17 with explicit BT.709, limited range, square pixels and `hvc1`. Original audio packets, timestamps and durations were copied unchanged.

### Verified scope

- Both films: 10,094 frames each, 20,188 decoded frame timestamps checked in total, strict full-file decode and explicit media metadata.
- Bilingual focus: 247,136 visible word states checked across both films, with zero mismatches and zero ambiguous states. A deliberate one-frame offset produced ten detected mismatches in the calibration sample.
- Geometry: 1,540 focus-boundary states and 698 stable word boxes checked across both formats.
- Audio: all 7,245 original AAC packets preserved in each film, including payloads, timestamps and durations.
- Codec sample: full-frame SSIM 0.998886; lyric-region mean PSNR 54.256 dB and minimum 52.500 dB. These are sample results, not whole-film scores.
- Editable archive: fresh extraction of 248 files, with all 247 inventoried payload hashes verified and no missing, unexpected or symlink entries.

Selected decoded pictures cover the intro, dense text, transitions, reference joins, closing line, original credits and tail. These checks establish the recorded technical properties. Actual acoustic judgments retain their documented review method and uncertainty. See [final verification](evidence/final-verification.md) and the [immutable delivery receipt](evidence/delivery-receipt.json).

## Posting handoff and documentation

The posting handoff contains a separate final film and thumbnail for each platform, a YouTube title and description, and a TikTok description. Each destination copy is checked against its source bytes. The [inventory](publishing/README.md) and [dated addendum](evidence/posting-handoff-addendum.json) record the exact files and hashes without local account paths.

The dedicated YouTube thumbnail is a 3840×2160 JPEG recomposed from the existing portrait cover. The built-in image generator produced 1672×941 pixels; a Lanczos resize produced the delivery raster. Native generated detail is therefore lower than the delivered dimensions. Title, artist and face were checked at 320×180. The TikTok profile cover remains 1200×1600, a 3:4 width:height composition, with 150×200 legibility checked. Both use the same film identity; the generator's model version was not exposed.

Record additions after packaging in a separate receipt. The original publishing ZIP and editable archive keep their original checksums and source commit. Documentation commits may advance while the exact archived production source remains `c031f9fd77debb73d953eddb6747692b65013d98`.

Public documentation preserves reproducible creative decisions, attribution, prompts and technical evidence. Private conversation, personal ratings and direct feedback quotations are excluded. Source-derived media remain local in this delivery; publishing source documentation does not imply a platform upload or a grant of rights over the original recording and animation.
