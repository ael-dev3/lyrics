# Roi × Adore — rebuilt lyric film

The final design follows the source animation's blue palette. A full-height animated foreground and a softened animated background fill the frame. A feathered pale-blue backdrop protects the French lyric, its English translation, and Adore's separate English lyric. The first Tanisea workflow informs the stable typography, word-driven progress lines, split reactive motion line, frame details, and restrained instrument rail.

## Timing

The project contains 71 supported lyric cues: 49 French cues, each translated into English, and 22 English vocal cues. It uses bounded multilingual word alignment, a fresh pass on separated vocals, comparison against the earlier timing observations, and local dynamic time warping against clearer repeated performances where corroborated. Weak repeat matches are rejected. Low-confidence words remain grouped when evidence does not support separate highlights.

Translation units inherit the corresponding French word boundaries. English text stays in natural reading order; highlights may move backward when French grammar performs those concepts in another order. Highlight contact is instantaneous on the nearest 60 fps frame, with a one-frame residual release. Progress lines pause in measured inter-word gaps.

The 36.5 ms measured offset between the original Opus analysis and retained AAC master is accounted for in the lyric timeline. The animation receives a two-frame delay, the nearest 60 fps approximation to that offset. Audio-reactive measurements use the final AAC directly.

## Measured spectrum and expressive motion

The 64 bars use distinct stereo band-pass filters from 20 Hz to 20 kHz, with published edges and coefficients. Left and right channel powers are combined after filtering, so opposite-phase material is retained. Zero-phase forward/backward filtering avoids causal delay. Each band has frequency-dependent time support and a centered RMS window; low frequencies necessarily observe longer intervals.

Bar heights show a fixed −60 to 0 dBFS RMS scale. A full-scale centered sine is −3.0103 dBFS under this definition. There is no frequency boost, per-frame normalization, spatial smoothing, or artificial transient extension in the measured bars. Raw Float32 measurements and a source/checksum manifest are retained in the project. The 44.1 kHz AAC is decoded to a documented 48 kHz analysis derivative with FFmpeg; its presentation origin and duration are retained. Event sample indices refer to that analysis clock.

Motion is separate: centered 400 ms stereo power drives track-relative sustained pressure; a short-window detector supplies sample-indexed transient events; bass weight and high-frequency energy supply smaller independent effects. Transient motion reaches its apex on the nearest video frame. Exceptional line extension is rare, and these artistic controls never alter measured bar levels.

Calibration checks cover all 64 centers and 128 band edges, silence, centered tones, opposite-phase stereo, and single-channel power. Selected time-domain tone errors were below 0.03 dB; an independent FFmpeg biquad implementation also passed. Synthetic impulse timing is checked separately. This is a calibrated, explicitly scoped visualization—not a claim of laboratory certification or a complete psychoacoustic model.

The filter design follows the [W3C Audio EQ Cookbook](https://www.w3.org/TR/audio-eq-cookbook/). Independent DSP checks use [FFmpeg filters](https://ffmpeg.org/ffmpeg-filters.html).

## Delivery and limits

The static translucent backdrop is cached once; moving graphics are rendered separately and combined at 4K. The cached-layer reference comparison passed (SSIM 0.999981 against the former combined raster on a blue background). Graphics are rendered to lossless 3840×2160 RGBA PNG frames, composited with the animation, and downsampled once to 1920×1080 at 60 fps. The final HEVC Main 10 file uses hvc1 and explicit BT.709 metadata. Original AAC packets are preserved. Streaming frame delivery was checked against the ordinary encode path; a selected decoded frame was pixel-identical.

The browser layout audit covers all 71 cues at two focus states. Final verification records actual dimensions, cadence, color metadata, complete decoding, frame count, AAC identity, and the Desktop-copy checksum.

Nearest-frame rounding is bounded by 8.333 ms; this does not establish the accuracy of inferred vocal boundaries. Review is computational and visual, without human listening certification in this session. Dense overlapping vocals retain uncertainty. Unsupported French intro/late fragments use an unhighlighted title state rather than an invented transcription.

The source is YouTube's AI-upscaled 1080p60 derivative of a 720p60 source. Supersampling improves new text and graphics, not missing source detail. The sharp animated foreground is enlarged proportionally; its original colors and motion are retained.


## Production record — 9 September 2026

### Starting point and design decisions

The source is [roi x did i tell u that i miss u](https://www.youtube.com/watch?v=11tjwUK2adU). The downloaded repository master was `roi-slowdown-v1.0.1`; its SHA-256 was `0c5120ae5d36e874cb8cc726a5a7f21872290479dd73fee91baef412bc011aa3`. The new edition uses the display name **Roi × Adore** to distinguish the two vocal sources and the rebuild from that historical release.

The first Tanisea film supplied the design discipline: stable lyric geometry, semantic translation focus, word-driven progress, square-ended spectrum bars, fine frame details, and independently controlled sustained and transient motion. Its warm, dark palette was not suitable for this animation. Intermediate darker and panel-heavy treatments were superseded by a light blue composition, a full-height animated foreground on the right, softened animated background, and feathered pale scrims under the text. Strong blue/cyan contact states improve contrast without obscuring the animation. Playfair translations sit under uppercase French; Adore has a separate English lane. Twenty-four deterministic particles, a split motion line, subtle corners, and title states complete the picture.

### Alignment, reconciliation, and translation

1. Clean the supplied lyrics; remove copied page navigation and annotation markup.
2. Extract source audio and compare it with the retained AAC master. Five waveform windows supported a 36.5 ms offset; apply that offset to source-derived cues.
3. Separate vocals with Demucs and perform bounded French and English alignment. Fresh `large-v3-turbo` passes produced 49 French and 22 English cue observations.
4. Compare previous and fresh word boundaries. Use probability and boundary agreement rather than allocating syllables by character count.
5. Compare clearer repetitions through local dynamic time warping on 32 log-frequency vocal bands, using a 10 ms hop. Gate repeat transfer by similarity and agreement; retain grouped highlights where words cannot be independently supported.
6. Reject a later onset-refinement pass where proposed trims could remove initial syllables. Its observations and rejection rationale are retained in the onset audit.
7. Map natural English translation concepts to French source words. Translation highlights inherit source intervals, including backward movement where word order differs. Do not independently stretch the translation across the whole line.
8. Audit all 71 cues in two browser focus states. Verify stable glyph positions, lyric bounds, cue containment, and absence of within-lane overlap.

The final authority has **504 highlight units and 1,008 boundaries**. Maximum measured nearest-frame quantization error is **8.1667 ms**. This is a rendering error bound, not measured linguistic accuracy. Phrase groups remain deliberate in ambiguous overlap. Unsupported French fragments use title states rather than invented words.

### Scientific rail and expressive controls

The earlier basic analysis risked opposite-phase cancellation through mono aggregation, repeated low-frequency bins, and excessive dependence on one energy control. The rebuilt rail uses distinct stereo band filters and combines power after filtering. Artistic motion has a separate feature package, leaving calibrated bar heights untouched.

All 64 center gains and 128 composite −3 dB edges passed analytical checks within 0.001 dB. Selected time-domain sine errors reached at most 0.022388 dB; a separate FFmpeg float64 implementation reached at most 0.014711 dB in its four checked bands. Silence, opposite-phase stereo, and the expected 3.0103 dB single-channel power difference passed. Synthetic impulse timing was checked separately.

Sustained motion uses centered 400 ms power with track-relative percentiles and 75 ms attack / 320 ms release. The transient detector uses short-window power novelty, local peak refinement, and 180 ms event exclusion; 1,342 events were retained. Motion apex is quantized to the nearest frame, with short anticipation and decay. Bass weight and high-frequency energy supply separate smaller controls. These are expressive mappings, not a claim that emotion is scientifically measured.

### Rendering and corrections

The production path rendered 22,763 lossless 3840×2160 RGBA graphics frames. Static translucent scrims were cached once and combined with changing graphics, substantially reducing per-frame raster work and storage. The comparison against the former combined raster on blue measured SSIM 0.999981. Original animation is composited beneath the graphics, then the result is downsampled once with Lanczos.

A cached image initially inherited a 25 fps timebase. Explicit `settb=1/60,setpts=N` fixed the short test's frame loss. A separate preview issue let the remaining soundtrack continue after a short video segment; explicit preview duration fixed the frozen-image tail. The final full-length file was checked independently rather than inferring correctness from previews.

The shortest-stream export contains **22,762 decoded frames**: one terminal near-white graphics frame was omitted to match the AAC ending. Video duration is **379.366667 s**, audio duration **379.367619 s**, a difference of **0.952 ms**. This expected endpoint behavior is recorded in the final verifier; it is not an unexplained dropped frame during playback.

### Final delivery and evidence

| Property | Result |
| --- | --- |
| File | `Roi-x-Adore-Lyric-Film-Rebuilt-1080p60.mp4` |
| Resolution / cadence | 1920×1080 / 60 fps |
| Video | HEVC Main 10, `hvc1`, `yuv420p10le` |
| Colour | BT.709 primaries, transfer and matrix; limited range |
| Audio | Retained stereo AAC, 44.1 kHz; packet-identical to locked AAC master |
| Full decode | Passed; 22,762 frames |
| SHA-256 | `1230e17c3a6b0470dbb3d496dd840f3f73ae7885ca40ca010b02031e090424b4` |
| Delivery | Desktop copy verified by SHA-256 |

Selected decoded final frames were inspected at 125.8 s, 239 s, and the closing fade at 379.3 s. The finished film was accepted by the requester. Computational/visual verification does not certify every inferred word onset by human listening.

The [source and evidence snapshot](../projects/roi-adore-rebuild/README.md) preserves the final composition, cues, translation mapping, DSP implementation, calibration, reconciliation, onset audit, and final delivery report. The full movie and source media are not newly published by this documentation update. Historical release links in the root README point to the earlier edition, not this rebuild.

## Screenshots from the final encoded file

![Both songs active with French-to-English semantic highlights at 02:05.800](../assets/roi-adore-rebuild-125-8.png)

**02:05.800:** French and its translation share semantic timing while the English vocal has an independent highlight. The original animation fills the right side and the scientific rail remains readable below.

![English lyric focus with the French lane in its title state at 03:59](../assets/roi-adore-rebuild-239.png)

**03:59.000:** the English lane stays active while French holds a title state. This captures the brighter animation, clean negative space, and independent motion/spectrum behavior.

## Lessons for the next song

- Lock the exact delivery soundtrack before alignment and feature extraction; record every resampling clock and measured offset.
- Treat repeated performances as supporting evidence, not automatic timing copies.
- Map translation meaning to source spans; keep typography fixed while focus changes.
- Separate measured spectral values from expressive motion controls and validate stereo behavior.
- Choose palette and composition from the source artwork. Preserve animation scale and legibility together through feathered scrims.
- Cache static graphics, but explicitly specify every image timebase and preview duration.
- Verify the full final encode, audio packet identity, actual endpoint frame count, and copied-file hash.
