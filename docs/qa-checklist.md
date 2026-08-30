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
- [ ] Low-confidence processed vocals are marked explicitly.
- [ ] Automatic transcription has been checked by a human listener.

## Animation timing

- [ ] The line is fully legible by vocal onset.
- [ ] Cue highlighting starts on the performed phrase.
- [ ] The line remains legible through its final word.
- [ ] Entrance blur and motion do not create perceptual lag.
- [ ] Exit fades do not begin before `vocalEnd`.
- [ ] Break cards end before the next vocal begins.
- [ ] The outro starts on the first outro vocal or musical state change.

## Text and translation

- [ ] Spelling, punctuation, and contractions are final.
- [ ] English is grammatical when read without the source language.
- [ ] Literal and poetic translations have been distinguished.
- [ ] Repeated lines use consistent wording unless a deliberate variation exists.
- [ ] Ambiguous translations have a note and owner for final approval.

## Visual system

- [ ] Artwork, particles, equalizer, frame chrome, and colour treatment continue across states.
- [ ] No replacement still or panel has been placed over a problematic section.
- [ ] Typography stays inside safe areas at full resolution.
- [ ] Long lines do not clip, collide, or create accidental widows.
- [ ] Motion remains readable on high-energy peaks.
- [ ] Random animation is seeded and deterministic.
- [ ] Final fade reaches the intended colour and opacity.

## Preview review

- [ ] Watch every reported line at normal speed.
- [ ] Watch every reported line around `0.5×` speed.
- [ ] Review `±1 s` around every line boundary.
- [ ] Review first-chorus and repeated-chorus timing separately.
- [ ] Review the last lyric-to-outro transition at dense frame intervals.
- [ ] Review a complete full-length playback, not only isolated clips.

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
