# Pixel-perfect visual workflow

## Purpose and claim boundary

This is the visual engineering contract for future lyric-film renders. It covers the path from source assets to browser rasterization, motion, colour conversion, downsampling, encoding, and decoded-master inspection.

“Pixel perfect” has a precise internal meaning here:

- geometry, typography, colour, and motion are deterministic in a locked render environment;
- the reference raster contains no unintended scaling, fallback fonts, clipping, aliasing, banding, colour-space mistakes, or lossy intermediate frames;
- the compact delivery has no **visible unintended artifacts** at native size under the reference viewing conditions;
- every intentional blur, glow, grain, chromatic split, or texture is declared as design—not mistaken for a defect;
- the encoded delivery is measured against a high-quality reference and inspected at its worst frames.

Lossy HEVC or H.264 cannot be mathematically identical to uncompressed RGB. “No artifacts” therefore cannot honestly mean zero differing pixels in a compact file. The lossless PNG reference may be exact; the delivery passes when its differences remain below the project’s visual gates and no reviewer can see unintended degradation at `100%` native display size. Inspection at `200–400%` is diagnostic and must use nearest-neighbour display scaling so the viewer does not invent extra blur.

Research and case-study audit completed `2026-08-30`. Re-audit the toolchain when Remotion, Chromium, FFmpeg, the codec, or the target platform changes.

## The four grids

Pixel-perfect video must satisfy four different grids at once:

| Grid | vNext target | What can fail |
| --- | --- | --- |
| Layout | `1080×1080` logical CSS pixels | Fractional static geometry, clipping, font reflow, inconsistent safe areas. |
| Reference raster | `2160×2160` physical pixels from `--scale=2` | Soft text, undersized raster assets, fixed-resolution Canvas/WebGL, bad downsampling. |
| Delivery chroma | Usually 4:2:0 | Thin saturated red/teal marks bleed because one Cb and one Cr sample represent each `2×2` luma block. |
| Time | `60 fps`, one frame every `16.667 ms` | Shimmer, judder, unstable texture, duplicate frames, or motion that never settles cleanly. |

A shape can be sharp on the RGB reference grid and still fail the delivery chroma grid. Critical information therefore needs a solid luminance-defined core, not colour alone.

## Current Tanisea source audit

The current release remains a reproducible record of the first production. These findings define vNext work; they do not retroactively alter that source snapshot.

| Finding | Evidence | Consequence | vNext requirement |
| --- | --- | --- | --- |
| Browser-frame format is not pinned | The current [`render` script](../projects/tanisea-lyric-film/package.json) omits `--image-format`; Remotion 4 defaults to JPEG and the browser default quality is 80. | A lossy generation may be introduced before video encoding. | Every visual master uses `--image-format=png`. |
| Colour conversion is not pinned | The same script omits `--color-space`; in the installed Remotion `4.0.518` line, `default` maps to BT.601. | HD SDR colours may be converted with the wrong matrix. | Pin `--color-space=bt709` and verify tags plus decoded colour. |
| Artwork is under-resolved for the camera move | [`artwork.png`](../projects/tanisea-lyric-film/public/artwork.png) is `1080×1080`; [`Artwork`](../projects/tanisea-lyric-film/src/LyricFilm.tsx) can reach approximately `1.143×` scale. | The image needs about `1235×1235` pixels for one-source-pixel-per-final-pixel and about `2470×2470` to populate the 2× reference grid. Supersampling cannot recreate missing texture. | Replace from the original artwork at no less than `2700×2700`; prefer `3240×3240` for crop and motion headroom. |
| The Cyrillic title uses a system fallback | The outro requests `Georgia, 'Times New Roman', serif` instead of a bundled file. | Glyph design, kerning, line width, and fallback can differ by host. | Bundle and hash an approved Cyrillic-capable font and load its exact face before render. |
| Some details are intentionally chroma- and motion-sensitive | The source includes one-pixel borders and peak marks, subpixel dot texture, broad glow, and fractional motion. | 4:2:0 delivery may soften colour-only lines; moving subpixel texture may shimmer or consume bitrate. | Classify each effect as critical or decorative, keep critical cores at least two final pixels, and test the actual encoded motion. |
| Requested codec settings are not proof of delivered settings | A local Remotion HEVC validation requested `yuv420p10le`, but the decoded stream reported 8-bit `yuv420p`, `hev1`, and unspecified primaries/transfer. | A command can look correct while the bundled encoder or container writes a different result. | Use the validated external Main-10 path for final delivery and gate the actual file with `ffprobe`. |
| Deterministic particles are already correct | The source uses Remotion `random(seed)` rather than `Math.random()`. | Repeated renders can reproduce particle positions. | Preserve seeded randomness and add repeat-render frame hashes. |
| HTML and SVG dominate the current composition | Remotion can scale text and SVG through its render scale. | The existing layers can benefit from 2× rendering. | Any future Canvas/WebGL analyzer must explicitly scale its backing bitmap using `usePixelDensity()`. |

The current PNG artwork reports RGB BT.709 metadata and its SHA-256 begins `762d64a0…`. The two bundled font hashes are stable, but the system fallback prevents the complete composition from being host-independent.

### Local validation evidence

The proposed command path was exercised against Remotion `4.0.518` and system FFmpeg `8.1.2` on `2026-08-30`:

- scale-2 PNG rendering produced exact `2160×2160` frames;
- frames `0000` and `3540` were rendered in two independent runs and were byte-identical, with SHA-256 `0048bd03c60ca7708d318c82fb54698ac27bc8e2f8da11aab35204cc0cb8eea7` and `3c37a7d8400ce0dc21530891f7a19cebd3eb2e77bf4b3d42d4db551d8f8ead2a` respectively;
- the documented FFmpeg Lanczos/accurate-rounding/full-chroma filter parsed and produced `1080×1080` `yuv420p10le` output;
- ProRes 4444 decoded as `yuv444p12le`; the lossless metadata pass completed BT.709 matrix, transfer, and primaries;
- the external x265 validation decoded as `hvc1`, `yuv420p10le`, limited range, BT.709 matrix, transfer, and primaries;
- the direct Remotion HEVC test did **not** meet that final contract, which is why probing and the external delivery stage are mandatory.

These hashes prove same-environment repeatability for those frames only. They do not excuse the host-font fallback or replace full-frame, cross-machine, and decoded-master QA.

All renderer, analysis, validation, and component source follows the repository's [TypeScript-first workflow](typescript-first-workflow.md). The strict typecheck must pass before visual-reference rendering, and the exact compiler version belongs in the same frozen toolchain manifest as Remotion, Chromium, and FFmpeg.

## Target render contract

Freeze this manifest before animation approval:

| Property | Required value |
| --- | --- |
| Logical composition | `1080×1080`, square pixels, progressive |
| Frame cadence | `60/1 fps` for vNext |
| Reference raster | `2160×2160` PNG-derived frames, SDR |
| Working/delivery colour | BT.709 primaries, BT.709 transfer, BT.709 matrix; explicit conversion and tags |
| Reference chroma | 4:4:4 where a video mezzanine is used |
| Compact delivery | HEVC Main 10, `yuv420p10le`, `hvc1`, original audio stream copied where no audio edit is needed |
| Compatibility delivery | H.264, `yuv420p`, BT.709, tested independently |
| Critical stroke | At least `2` final luma pixels, with luminance contrast |
| Typography | Bundled exact files, declared existing weights, no synthetic face, render blocked until loaded |
| Randomness | Seeded and deterministic |
| Source identity | SHA-256 for every raster, vector, font, audio, analysis, and configuration artifact |

Ten-bit delivery preserves more precision through colour conversion and encoding, but it cannot invent colour precision absent from an 8-bit source. The 4:4:4 reference remains the authority for edge and chroma diagnosis.

## 1. Lock assets before layout

Create a visual manifest containing:

```json
{
  "canvas": {"width": 1080, "height": 1080, "fps": 60, "renderScale": 2},
  "color": {"primaries": "bt709", "transfer": "bt709", "matrix": "bt709"},
  "assets": [
    {
      "path": "public/artwork.png",
      "sha256": "...",
      "pixels": [3240, 3240],
      "profile": "bt709",
      "maxDisplayedScale": 1.15
    }
  ],
  "fonts": [
    {"path": "public/Display-Cyrillic.woff2", "sha256": "...", "weight": 700}
  ],
  "toolchain": {
    "typescript": "exact stable version",
    "remotion": "exact version",
    "chromium": "exact revision",
    "ffmpeg": "exact version and build configuration"
  }
}
```

For each raster asset, calculate the required native footprint:

```text
minimum final-detail width = maximum on-screen width × maximum scale
minimum 2× reference width = minimum final-detail width × 2
```

Use the second value when the raster is expected to remain fully detailed in the 2× reference. An intentionally soft background may be exempted, but the exemption and intended blur must be recorded.

Asset rules:

- prefer SVG or HTML for geometric marks, grids, icons, and line art;
- use lossless PNG for browser-frame intermediates and transparent raster elements;
- preserve an original lossy photograph if that is the only authority, but never repeatedly decode and re-save it;
- do not enlarge a raster silently; stop preflight when it is below its declared maximum footprint;
- inspect transparent edges over black, white, teal, and magenta to expose matte fringes;
- record embedded colour profiles and convert once through a controlled path;
- keep filenames immutable after the manifest is frozen.

## 2. Make typography deterministic

Typography is geometry. A fallback font changes timing perception, wrapping, and alignment as well as appearance.

- Bundle every font used by the composition, including Cyrillic, punctuation, numerals, and symbols.
- Load local faces with `@remotion/fonts`, or use `FontFace` with `delayRender()`/`continueRender()`; do not begin capture while a face is unresolved.
- Use only weights and styles that exist in the file. Set `font-synthesis: none` so the browser cannot fabricate bold, italic, or small-caps faces.
- Do not rely on `Georgia`, `Arial`, `serif`, or another host font in production.
- Keep numeric instrumentation on `font-variant-numeric: tabular-nums` and allocate a fixed-width field so values do not move neighbouring elements.
- Freeze `font-size`, `line-height`, `letter-spacing`, `font-weight`, language, and line-breaking decisions.
- Render a glyph proof containing the longest English line, full Russian title, digits, minus sign, decimal point, apostrophe, multiplication sign, and all unit labels.
- Fail if `document.fonts.check()` is false for any production face or if a fallback glyph appears.

Keep a sharp text layer and a separate glow duplicate behind it. A blur or opacity filter on a parent element also affects its text and can erase the crisp core.

## 3. Align static geometry to the final grid

Author coordinates in final-output pixels even though the reference is rendered at 2×.

- Use integer `left`, `top`, `width`, and `height` for static axis-aligned CSS rectangles and dividers.
- For centred SVG strokes, start with even final-pixel stroke widths on integer coordinates. If an odd-width stroke is unavoidable, test a half-pixel centre at final scale. `shape-rendering` is only a browser hint, not proof of correct rasterization.
- Let diagonals and curves use geometric antialiasing; do not apply `crispEdges` globally.
- Keep critical indicators at least two final pixels thick. One-pixel marks may be decorative but cannot be the only carrier of a value or state.
- Allow fractional coordinates during motion when they improve smoothness, but make important resting states settle on their declared final-grid coordinates.
- Avoid animating layout measurements. Compute stable boxes once and animate transforms or opacity inside them.
- Check every static landing frame at both 2160 and downsampled 1080 resolution.

At 2×, a two-final-pixel core becomes four reference pixels. Glow, shadow, or chromatic fringe sits outside that core and never substitutes for it.

## 4. Treat SVG, Canvas, and WebGL differently

Remotion increases browser device scale for text, HTML, and SVG. A Canvas or WebGL element has its own fixed backing bitmap and does not become more detailed automatically.

- Give every SVG a stable `viewBox`; avoid scaling a nested raster beyond its native dimensions.
- Use `shape-rendering="geometricPrecision"` selectively for measured geometry and inspect the result. Do not assume a hint makes it correct.
- For Canvas/WebGL, obtain the render scale with `usePixelDensity()` and multiply the backing width and height while keeping CSS dimensions on the logical grid.
- Reset the Canvas transform before applying pixel density so repeated renders do not compound scaling.
- Draw the scientific analyzer from frozen data; never let frame order or asynchronous state alter the bitmap.
- Add a 2×/1× comparison fixture for every custom renderer. The downsampled 2× result should improve edge stability, not change layout.

## 5. Separate sharp information from atmosphere

Use three explicit layer classes:

1. **Core:** lyrics, title, numbers, ticks, waveform extrema, bar height, frame geometry.
2. **Support:** local scrims, shadows, quiet grid, outlines, secondary labels.
3. **Atmosphere:** bloom, particles, grain, chromatic split, lens texture, decorative one-pixel marks.

Rules:

- never put core information inside a blurred parent;
- keep glow on a duplicate layer behind the core;
- cap bloom so adjacent letters and measured bars do not merge;
- document blend mode, opacity, filter order, and colour for each atmospheric effect;
- use seeded, spatially stable noise unless temporal motion is itself intentional;
- do not use animated noise as an automatic banding cure—it can shimmer and substantially increase bitrate;
- test every blend and alpha edge over the brightest and darkest real artwork frames.

For gradients, declare the intended interpolation behaviour and freeze the Chromium version. CSS colour interpolation can produce materially different paths depending on its interpolation colour space. Use a test wedge to choose the gradient, then validate the decoded output for banding and hue shifts rather than trusting the source declaration alone.

Audio-driven line expansion follows the [clean emotional audio-reactive motion specification](emotional-audio-reactive-motion.md). Its changing endpoints must retain the same solid core, even-pixel symmetry, safe-frame cap, 4:2:0 resilience, and temporal artifact gates as every other critical mark.

## 6. Design for 4:2:0, not only RGB

Compact video normally shares one Cb and one Cr sample across each `2×2` group of luma pixels. Saturated, colour-only detail is therefore less stable than luminance detail.

- Give thin teal, red, or magenta marks a bright or dark luma core.
- Keep critical coloured marks at least two final pixels wide and avoid alternating saturated colours at one-pixel frequency.
- Inspect the luma plane and the decoded RGB result; a design that exists only in chroma is not robust.
- Test small red text, teal text, diagonals, one/two/three-pixel strokes, and colour transitions through the exact delivery pixel format.
- Preserve a 4:4:4 reference so chroma loss can be separated from browser rasterization and codec quantization.
- Never approve colour from an untagged player screenshot.

## 7. Make motion frame-driven and repeatable

- Derive all animation from `useCurrentFrame()` and the composition fps.
- Use Remotion `random(seed)` for particles and dither; never use `Math.random()`, wall-clock time, network state, or unordered asynchronous results.
- Render at 60 fps for vNext and audit motion one frame at a time as well as at normal speed.
- Keep lyric and measurement cores unblurred. Apply motion blur only to artwork or decorative layers after a side-by-side test proves it helps.
- Test slow movement of thin lines for shimmer and fast movement for strobing.
- Keep final resting transforms at exactly `scale(1)` when no intentional scale remains; avoid leaving type at a fractional transformed scale.
- Verify the first frame, every transition boundary, every peak-motion frame, and the final settled frame.

Motion review must use the encoded clip. A still image cannot reveal temporal shimmer, flicker, duplicate frames, or unstable grain.

## 8. Build a visual preflight card

Add a short composition that uses the same renderer, colour pipeline, downsampler, and codec as the film. It must contain both static and moving tests:

| Fixture | Defect it exposes |
| --- | --- |
| Black-to-dark-wine and teal-to-black ramps | Banding, crushed blacks, colour conversion. |
| One-, two-, and three-pixel white/teal/red lines | Chroma loss and line disappearance. |
| Horizontal, vertical, diagonal, and circular geometry | Aliasing and downsample ringing. |
| Small English/Cyrillic type at every production weight | Fallback, synthesis, soft edges, chroma bleed. |
| Alpha shapes over four backgrounds | Dark/bright matte fringe and halo contamination. |
| Checkerboard and Siemens-star-style detail | Scaling kernel, moiré, oversharpening. |
| Slowly translating line and subpixel dot field | Temporal shimmer and unstable rasterization. |
| Fast title move with and without decorative blur | Strobing and motion-blur trade-off. |
| Frozen scientific rail with exact expected values | Data-to-pixel geometry and numerical stability. |

Encode this card before a full film. A failed card blocks the render even when the Studio preview looks clean.

## 9. Render a lossless reference path

### Selected-frame preflight

Render risk frames twice from the locked environment:

```sh
mkdir -p qa

npx remotion render src/index.ts LyricFilm qa/reference-a \
  --frames=0,1200,2999,3540,4200,4589 \
  --sequence \
  --image-format=png \
  --scale=2 \
  --color-space=bt709 \
  --overwrite=false

npx remotion render src/index.ts LyricFilm qa/reference-b \
  --frames=0,1200,2999,3540,4200,4589 \
  --sequence \
  --image-format=png \
  --scale=2 \
  --color-space=bt709 \
  --overwrite=false
```

SHA-256 hashes for corresponding PNGs must match. If they do not, stop and find the non-deterministic layer before encoding.

### Full 2× visual reference

Use high-bit-depth 4:4:4 ProRes as a practical video mezzanine while retaining selected authoritative PNG frames:

```sh
npx remotion render src/index.ts LyricFilm qa/visual-reference-2160-raw.mov \
  --codec=prores \
  --prores-profile=4444 \
  --pixel-format=yuv444p10le \
  --image-format=png \
  --scale=2 \
  --color-space=bt709 \
  --muted \
  --overwrite=false

ffmpeg \
  -i qa/visual-reference-2160-raw.mov \
  -map 0:v:0 \
  -c copy \
  -color_primaries bt709 \
  -color_trc bt709 \
  -colorspace bt709 \
  qa/visual-reference-2160.mov
```

PNG is required because Remotion otherwise defaults to JPEG browser screenshots. BT.709 is required because this project is HD SDR and the Remotion 4 default is not the desired matrix. In the validated local path, ProRes 4444 decoded as `yuv444p12le`; that is expected high-bit-depth 4:4:4 output. The stream-copy pass is required because the first local ProRes test carried the BT.709 matrix but left primaries and transfer unspecified. No pixels are re-encoded during that metadata pass.

The exact visual-reference commands, package lock, Chromium revision, FFmpeg build, probed stream fields, and output checksum belong in the release manifest. Requested flags are never accepted as proof of the resulting file.

## 10. Downsample once, then make a codec ladder

Downsample the 2× 4:4:4 reference to 1080 exactly once. Do not resize in the browser, resize again in an editor, and then resize a third time at upload.

There is no universal best kernel for every graphic. Test at least:

- Lanczos for maximum retained detail, while checking high-contrast edges for ringing;
- a spline or Mitchell-style kernel for slightly softer edges with less ringing.

The installed FFmpeg build supports `scale` with accurate rounding and full-chroma interpolation. A candidate—not an automatic winner—is:

```sh
ffmpeg \
  -i qa/visual-reference-2160.mov \
  -i public/soundtrack.m4a \
  -filter_complex \
    "[0:v]scale=1080:1080:flags=lanczos+accurate_rnd+full_chroma_inp+full_chroma_int,format=yuv420p10le[v]" \
  -map "[v]" \
  -map 1:a:0 \
  -c:v libx265 \
  -preset slow \
  -crf 16 \
  -x265-params "colorprim=bt709:transfer=bt709:colormatrix=bt709:range=limited" \
  -color_primaries bt709 \
  -color_trc bt709 \
  -colorspace bt709 \
  -color_range tv \
  -tag:v hvc1 \
  -c:a copy \
  -movflags +faststart \
  -shortest \
  qa/delivery-crf16.mp4
```

Build at least three candidates around the expected quality point, for example CRF `14`, `16`, and `18`. File size is selected only after the worst decoded frames pass. Do not use average bitrate as a proxy for visual quality and do not add sharpening unless the preflight card proves a measured benefit without halos.

Both the x265 VUI parameters and container colour options are deliberate. In the validated local build, the generic FFmpeg colour options alone left decoded HEVC primaries and transfer unspecified; adding the x265 parameters produced `yuv420p10le`, `hvc1`, limited range, and complete BT.709 matrix/transfer/primaries metadata. Re-run this probe after any encoder upgrade.

If the local FFmpeg build gains `zscale` or `libplacebo`, it may be evaluated as another candidate; availability is not assumed. Record the chosen kernel, flags, chroma location, range, and conversion path.

## 11. Compare the decoded delivery to the reference

Objective scores support—not replace—visual review. PSNR, SSIM, or VMAF can miss a locally damaged lyric edge while reporting a strong full-frame average.

For every codec candidate:

1. Decode the whole file without errors.
2. Confirm exact frame count, dimensions, cadence, pixel format, sample aspect ratio, colour tags, and audio identity.
3. Extract the same high-risk frames from the delivery and reference.
4. Normalize both comparison paths to the same dimensions and pixel format.
5. Generate per-frame PSNR and SSIM logs plus RGB difference images.
6. Score critical-region masks for lyrics, title, frame chrome, and scientific data separately from the artwork-dominated full frame.
7. Confirm that every two-pixel test stroke remains continuous and that letter counters, punctuation, and adjacent bars neither close nor merge.
8. Sort by worst score, then inspect those frames at native size and nearest-neighbour zoom.
9. Inspect lyric edges, Cyrillic title, gradients, thin bars, particles, high-energy frames, fades, and transitions.
10. Watch temporal difference hotspots around motion; do not approve from isolated frames alone.

Example metadata gate:

```sh
ffprobe -v error -count_frames \
  -select_streams v:0 \
  -show_entries \
stream=codec_name,codec_tag_string,pix_fmt,width,height,sample_aspect_ratio,r_frame_rate,avg_frame_rate,nb_read_frames,color_range,color_space,color_transfer,color_primaries,chroma_location \
  -of json qa/delivery-crf16.mp4

ffmpeg -v error -i qa/delivery-crf16.mp4 -f null -
```

FFmpeg’s PSNR and SSIM filters require equal dimensions, pixel format, and frame count. The comparison script must fail rather than silently trim, repeat, rescale, or retime one input.

## 12. Acceptance gates

The internal 10/10 visual score requires every gate below. One blocking failure prevents the score regardless of average metrics.

| Category | Weight | Full-credit gate |
| --- | ---: | --- |
| Source assets | 10% | All assets hashed, profiled, licensed, and sufficiently resolved for their maximum footprint. |
| Typography | 10% | Every glyph comes from a bundled loaded face; no fallback, synthesis, reflow, or clipped line. |
| Geometry | 15% | Static cores align to the final grid; critical lines survive downsampling and 4:2:0. |
| Colour and gradients | 15% | BT.709 conversion and tags verified; no crushed range, banding, fringe, or unintended hue shift. |
| Motion | 10% | Deterministic 60 fps motion with no shimmer, flicker, duplicate-frame defect, or dirty landing state. |
| Effects and compositing | 10% | Core remains sharp; glow, grain, alpha, and blend modes are intentional and artifact-free. |
| Render integrity | 10% | PNG intermediates, locked toolchain, repeat-frame hashes, one downsample, full decode. |
| Encoded quality | 15% | No visible blocking, ringing, mosquito noise, chroma bleed, gradient breakup, or text softening at native size. |
| Reproducibility | 5% | Manifest, commands, versions, checksums, chosen kernel, and candidate results are published. |

### Blocking failures

- JPEG browser-frame intermediates in a visual master;
- implicit or missing colour-space conversion;
- system-font fallback or an unloaded production font;
- a raster asset enlarged beyond its approved footprint;
- critical information carried by a one-pixel colour-only mark;
- different hashes from repeated selected-frame renders in the same locked environment;
- clipped or reflowed lyric/title text;
- visible banding, ringing, aliasing, shimmer, blocking, mosquito noise, chroma bleed, alpha fringe, or dirty glow on a core element;
- frame-count mismatch, duplicate/drop defect, decode error, wrong colour tags, or altered source audio where stream copy was required.

### Reference viewing conditions

- inspect at `100%` pixel-for-pixel size on a calibrated or profiled SDR display;
- disable player enhancement, sharpening, HDR conversion, and frame interpolation;
- use a neutral dark surround;
- confirm in at least two independent software decoders;
- use nearest-neighbour scaling for diagnostic zooms;
- approve normal-speed playback first, then use slow playback and frame stepping to locate defects.

## Release evidence

Publish or archive with each approved master:

```text
qa/
  visual-manifest.json
  SHA256SUMS
  reference-frames/
  decoded-delivery-frames/
  difference-frames/
  psnr.log
  ssim.log
  codec-ladder.csv
  ffprobe.json
  decode.log
  review-notes.md
```

The repository need not store a multi-gigabyte mezzanine, but it must store enough exact evidence to reproduce it: source hashes, locked dependencies, commands, selected PNG hashes, comparison summaries, and the checksum of the released file.

## Implementation order for this project

1. Pass the strict TypeScript gate, then add the visual manifest and automated asset-resolution/font-coverage preflight.
2. Replace the system Cyrillic fallback with a bundled, approved face.
3. Recover artwork at `2700×2700` minimum, preferably `3240×3240`.
4. Pin PNG intermediates and BT.709 in all master render commands.
5. Build the visual preflight-card composition.
6. Convert vNext to 60 fps and add 2× support to any Canvas/WebGL layer.
7. Separate sharp core layers from glow and atmospheric effects.
8. Render repeatability fixtures and store selected-frame hashes.
9. Produce 4:4:4 reference, downsampling bake-off, and codec ladder.
10. Run decoded-frame, temporal, metadata, and full-playback QA before publishing.

## Primary references

- [Remotion Quality Guide](https://www.remotion.dev/docs/quality) — lossy encoding, PNG browser frames, scaling, CRF, and BT.709 guidance.
- [Remotion `renderMedia()`](https://www.remotion.dev/docs/renderer/render-media) — JPEG defaults, PNG recommendation, scale, pixel format, and colour-space behavior.
- [Remotion output scaling](https://www.remotion.dev/docs/scaling) — device-scale rendering and the Canvas/WebGL backing-bitmap limitation.
- [Remotion font loading](https://www.remotion.dev/docs/fonts) — local font loading and render blocking.
- [Remotion deterministic `random()`](https://www.remotion.dev/docs/random) — seeded values across multi-threaded renders.
- [Remotion renderer types](https://www.remotion.dev/docs/renderer/types) — supported 8/10-bit 4:2:0, 4:2:2, and 4:4:4 pixel formats.
- [Remotion ProRes rendering](https://www.remotion.dev/docs/prores) — profile and 4:4:4/10-bit options.
- [ITU-R BT.709-6](https://www.itu.int/dms_pubrec/itu-r/rec/bt/r-rec-bt.709-6-201506-i%21%21pdf-e.pdf) — HDTV image parameters.
- [Apple chroma-subsampled image conversion](https://developer.apple.com/documentation/accelerate/converting-chroma-subsampled-images) — 4:2:0 has one Cb and one Cr sample per four luma pixels.
- [W3C SVG 1.1 rendering properties](https://www.w3.org/TR/SVG11/painting.html#ShapeRenderingProperty) — `shape-rendering` is a rendering hint.
- [W3C CSS Fonts Level 4](https://www.w3.org/TR/css-fonts-4/#font-synthesis) — control of synthetic font faces.
- [W3C CSS Color Level 4](https://www.w3.org/TR/css-color-4/#interpolation) — colour interpolation and interpolation-space behavior.
- [FFmpeg scaler documentation](https://ffmpeg.org/ffmpeg-scaler.html) — resampling, accurate rounding, chroma interpolation, and dithering controls.
- [FFmpeg filter documentation](https://ffmpeg.org/ffmpeg-filters.html) — scaling alternatives plus PSNR, SSIM, and VMAF comparison filters.

These references define capabilities and signal behavior. The project-specific thresholds and acceptance gates above are our engineering policy and must be validated against the actual lyric film.
