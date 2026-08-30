# QA checklist

## Source lock

- [ ] Confirm the exact song, remix, and edit.
- [ ] Record soundtrack duration, sample rate, channels, and checksum.
- [ ] Confirm composition fps, dimensions, and total frame count.
- [ ] Confirm the lyric reference is for the exact soundtrack version.
- [ ] Record translation decisions and any artist-requested wording.

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

## Technical delivery

- [ ] The final duration matches the locked audio.
- [ ] The decoded frame count matches `duration × fps`.
- [ ] Video dimensions, pixel format, frame rate, and codec are correct.
- [ ] HEVC delivery uses the `hvc1` tag when required for Apple compatibility.
- [ ] `faststart` metadata is enabled for progressive playback.
- [ ] The entire file decodes without errors.
- [ ] Copied source audio has a matching stream MD5.
- [ ] The final file checksum is recorded.
- [ ] The delivered copy matches the audited master byte-for-byte.
