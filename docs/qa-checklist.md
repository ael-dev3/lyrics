# QA checklist

## Source lock

- [ ] Confirm the exact song, remix, and edit.
- [ ] Record soundtrack duration, sample rate, channels, and checksum.
- [ ] Confirm composition fps, dimensions, and total frame count.
- [ ] Confirm the lyric reference is for the exact soundtrack version.
- [ ] Record translation decisions and any artist-requested wording.

## TypeScript source

- [ ] The npm registry's stable `latest` TypeScript tag was checked at the planned upgrade point; beta, RC, `next`, and nightly channels were excluded from production.
- [ ] `package.json` and the lockfile exact-pin the same reviewed stable compiler version.
- [ ] Authored application, analysis, rendering, validation, and reusable component source uses `.ts` or `.tsx`, with no new `.js` or `.jsx` modules.
- [ ] Strict checking, checked indexed access, exact optional properties, isolated modules, and no emit remain enabled.
- [ ] No broad `any`, `@ts-ignore`, unchecked cast, or non-null assertion conceals uncertain timing, analysis, geometry, or manifest data.
- [ ] Imported JSON and generated artifacts pass runtime validation before typed production use.
- [ ] `npm ci` and `npm run typecheck` pass from the committed lockfile in a clean environment.
- [ ] Remotion discovers every expected composition from the `.ts` entry point.
- [ ] Timing, analysis, motion, and deterministic fixture suites still pass after a compiler upgrade.
- [ ] Representative intro, verse, chorus, analyzer, and outro renders remain visually and temporally equivalent unless an intentional change is documented.
- [ ] The release manifest records TypeScript, Node.js, npm, Remotion, Chromium, FFmpeg, and lockfile identity.
- [ ] The full [TypeScript-first workflow](typescript-first-workflow.md) has no blocking failure.

## Timing data

- [ ] Every line has a stable ID.
- [ ] Every cue is contained inside its line's vocal window.
- [ ] Cues are ordered and do not overlap accidentally.
- [ ] Continuous clear vocals do not have unexplained lyric gaps.
- [ ] Repeated choruses are timed independently; do not copy offsets blindly.
- [ ] Source-language word groups are mapped to English semantic groups.
- [ ] Cue events are chronological, while target display positions may be intentionally non-monotonic.
- [ ] Every cue target references an existing, stable semantic-group ID.
- [ ] Repeated, simultaneous, overlapping, and backward activations are marked intentionally.
- [ ] Low-confidence processed vocals are marked explicitly.
- [ ] Automatic transcription has been checked by a human listener.

## Animation timing

- [ ] The line is fully legible by vocal onset.
- [ ] Cue highlighting starts on the performed phrase.
- [ ] Non-linear cues use independent focus states rather than a reversible cumulative progress fill.
- [ ] Any line-duration indicator remains distinct from semantic word-group activation.
- [ ] Backward focus changes read as semantic emphasis, not a rewind or playback error.
- [ ] Segment positions remain stable while focus moves between them.
- [ ] The line remains legible through its final word.
- [ ] Entrance blur and motion do not create perceptual lag.
- [ ] Exit fades do not begin before `vocalEnd`.
- [ ] Break cards end before the next vocal begins.
- [ ] The outro starts on the first outro vocal or musical state change.

## Text and translation

- [ ] Spelling, punctuation, and contractions are final.
- [ ] English is grammatical when read without the source language.
- [ ] Natural English reading order is preserved even when semantic activation order differs.
- [ ] A fluent bilingual reviewer has approved every non-linear semantic mapping.
- [ ] Literal and poetic translations have been distinguished.
- [ ] Repeated lines use consistent wording unless a deliberate variation exists.
- [ ] Ambiguous translations have a note and owner for final approval.

## Scientific audio analysis

- [ ] The analyzed soundtrack checksum matches the composition soundtrack.
- [ ] Decode sample count, sample rate, channel layout, and time-zero alignment are recorded.
- [ ] Both stereo channels are retained and tested; no channel is silently discarded.
- [ ] Spectrum analysis uses the declared FFT length, periodic window, hop, scaling, and timestamp convention.
- [ ] Transient timing uses a separate short-window or sample-indexed path rather than claiming long-window STFT precision.
- [ ] Every visible frequency band has a unique and published filter response, range, effective bandwidth, and timing support.
- [ ] Low-frequency band group delay and longer time support are compensated and never described as millisecond transient sensitivity.
- [ ] Every visible quantity has the correct unit and documented calculation.
- [ ] Scientific values contain no undocumented gain, compression, weighting, smoothing, clipping, or peak hold.
- [ ] Artistic animation controls are stored separately from calibrated measurements.
- [ ] Sample peak, true peak, LUFS, and LRA names are used only for their defined measurements.
- [ ] Loudness and true peak pass the applicable ITU-R BS.1770 / EBU Tech 3341 reference checks.
- [ ] Synthetic impulses pass the `±1 ms` onset-timing target.
- [ ] Synthetic bin-centred tones pass the frequency and `±0.25 dB` magnitude targets.
- [ ] Instrument-band test tones match the published filter responses without duplicated low-band behavior.
- [ ] Left-only, right-only, centred, anti-phase, and decorrelated stereo fixtures pass.
- [ ] A second implementation independently confirms selected spectral and loudness results.
- [ ] Analysis reruns produce byte-identical feature artifacts and matching checksums.
- [ ] The manifest records source identity, versions, parameters, units, uncertainty, and artifact hashes.

## Visual system

- [ ] Artwork, particles, equalizer, frame chrome, and colour treatment continue across states.
- [ ] No replacement still or panel has been placed over a problematic section.
- [ ] Typography stays inside safe areas at full resolution.
- [ ] Long lines do not clip, collide, or create accidental widows.
- [ ] Motion remains readable on high-energy peaks.
- [ ] Scientific scales, ticks, units, and values remain readable against every artwork state.
- [ ] Bars use crisp solid cores; glow and bloom do not obscure measured height.
- [ ] Critical marks remain at least two output pixels thick and retain luminance contrast after 4:2:0 encoding.
- [ ] Waveforms preserve per-pixel extrema and spectrograms use a fixed, labelled dB colour scale.
- [ ] Numerical fields use stable tabular spacing and do not jump horizontally.
- [ ] The display states analysis resolution and video cadence without implying a 1 ms visual refresh.
- [ ] Compact lyric-state data does not enter the lyric safe area.
- [ ] Expanded intro, break, and outro data remains subordinate to the authored composition.
- [ ] Random animation is seeded and deterministic.
- [ ] Final fade reaches the intended colour and opacity.

## Emotional audio-reactive motion

- [ ] Sustained pressure, transient impact, low-end weight, spectral brightness, and editorial emotion are separate controls.
- [ ] Artistic controls are derived from the frozen scientific feature package without modifying its raw values.
- [ ] Loudness and transient normalization use frozen track-relative percentiles rather than per-frame or per-line renormalization.
- [ ] The transient line-reach apex lands within half a 60fps frame of the stored event or reviewed emotional apex.
- [ ] Sustained loudness has documented attack/release and does not create fake repeated transients.
- [ ] Quiet passages remain visibly calmer than builds and choruses.
- [ ] At least `98%` of active frames remain below hero reach.
- [ ] Only reviewed exceptional events enter the `900–920 px` title-rail range.
- [ ] Line width is hard-capped, quantized symmetrically, and never crosses the safe frame or collides with text.
- [ ] The solid line core remains `2–4` final pixels; glow is a separate subordinate layer.
- [ ] Bass adds bounded weight rather than moving lyrics or scientific labels.
- [ ] Dense beats do not produce one-frame chatter or make every kick a maximum-width event.
- [ ] Every manual emotional accent has an owner, reason, bounded intensity, target, and reviewed timing.
- [ ] Two motion-envelope generations are byte-identical and their manifest hashes match.
- [ ] Silence, crescendo, impulse, sustained-loud, repeated-kick, bass-only, high-transient, clipped, and quiet-manual-accent fixtures pass.
- [ ] The first chorus, second build, repeated chorus, and title outro have been reviewed with audio at normal speed.
- [ ] The full [clean emotional audio-reactive motion specification](emotional-audio-reactive-motion.md) has no blocking failure.

## Pixel-perfect visual pipeline

- [ ] The visual manifest records canvas, fps, render scale, colour contract, tool versions, and SHA-256 for every asset and font.
- [ ] Every raster has enough native pixels for its maximum on-screen size, maximum scale, and the 2× reference raster, or has a documented intentional-softness exemption.
- [ ] Every production glyph, including Cyrillic, punctuation, numerals, and units, comes from a bundled loaded font face.
- [ ] No system fallback or synthetic font weight/style is permitted; `font-synthesis: none` is active.
- [ ] Static core geometry aligns to the final-output grid and critical strokes are at least two final luma pixels.
- [ ] SVG uses stable view boxes; any Canvas/WebGL backing bitmap follows `usePixelDensity()` at 2×.
- [ ] Lyrics, titles, ticks, numbers, and measured marks have a sharp core separate from glow, blur, grain, or chromatic fringe.
- [ ] Alpha edges pass black, white, teal, and magenta background tests without matte fringe.
- [ ] Gradients pass the dark-ramp test without visible bands, crushed range, or unintended hue shifts.
- [ ] Thin red/teal marks and small text survive the exact 4:2:0 delivery path.
- [ ] Randomness and any dither/noise are seeded; two selected-frame render runs produce identical PNG hashes.
- [ ] Master browser frames use PNG, not JPEG, and colour conversion is explicitly pinned to BT.709.
- [ ] A 2× 4:4:4 visual reference is frozen before compact encoding.
- [ ] The selected downsampling kernel wins the project test-card bake-off without objectionable softness, aliasing, or ringing.
- [ ] A codec ladder is compared after decoding; the smallest candidate is selected only after the worst frames pass.
- [ ] PSNR/SSIM/VMAF are supporting evidence only; native-size visual and temporal review still pass.
- [ ] No blocking, mosquito noise, chroma bleed, banding, alpha fringe, dirty glow, shimmer, flicker, or duplicate/drop defect is visible.
- [ ] The full [pixel-perfect visual workflow](pixel-perfect-visual-workflow.md) has no blocking failure.

## Preview review

- [ ] Watch every reported line at normal speed.
- [ ] Watch every reported line around `0.5×` speed.
- [ ] Review `±1 s` around every line boundary.
- [ ] Review first-chorus and repeated-chorus timing separately.
- [ ] Review every backward, repeated, overlapping, or simultaneous cue at normal playback speed.
- [ ] Rewrite or restructure lines whose non-linear activation causes excessive visual travel.
- [ ] Review the last lyric-to-outro transition at dense frame intervals.
- [ ] Review a complete full-length playback, not only isolated clips.
- [ ] Compare selected rendered values against the frozen analysis artifact frame by frame.
- [ ] Inspect one-pixel grids, bars, and numerals in the final encoded master at native resolution.
- [ ] Watch the preflight card and high-risk clips in at least two independent decoders with enhancement and frame interpolation disabled.
- [ ] Inspect diagnostic zooms with nearest-neighbour scaling; do not judge sharpness through a smoothing viewer.

## Technical delivery

- [ ] The final duration matches the locked audio.
- [ ] The decoded frame count matches `duration × fps`.
- [ ] Video dimensions, pixel format, frame rate, and codec are correct.
- [ ] Sample aspect ratio, colour range, BT.709 primaries, transfer, matrix, and chroma location are correct and explicit.
- [ ] HEVC delivery uses the `hvc1` tag when required for Apple compatibility.
- [ ] `faststart` metadata is enabled for progressive playback.
- [ ] The entire file decodes without errors.
- [ ] Decoded frame count has no unexplained duplicate or dropped frame.
- [ ] Selected decoded frames and per-frame metric logs match the frozen visual-reference comparison run.
- [ ] Copied source audio has a matching stream MD5.
- [ ] The final file checksum is recorded.
- [ ] The delivered copy matches the audited master byte-for-byte.
