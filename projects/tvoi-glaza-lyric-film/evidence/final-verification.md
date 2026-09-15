# Твои глаза — final verification

POLNALYUBVI — Russian lyrics and English meaning. Both complete films retain the original recording and animation. The project owner reviewed the actual-recording composition and authorized rendering; additional technical checks are recorded below.

## Delivered films

| Format | Dimensions | Video frames | Visible word states checked | AAC packets preserved |
| --- | --- | ---: | ---: | ---: |
| landscape | 1920×1080, 60 fps | 10094 | 123,568 | 7,245 |
| portrait | 1080×1920, 60 fps | 10094 | 123,568 | 7,245 |

HEVC Main 10 / hvc1, yuv420p10le, square pixels and explicit limited-range BT.709. Capture used 2× PNG frames and ProRes 4444 references, followed by one native-resolution downsample and HEVC encoding. Original video remains 30 fps; the added graphics run at 60 fps.

## Passed checks

- Strict full-file decoding, complete frame inventories, and every decoded video timestamp against frame number / 60.
- Original 44.1 kHz stereo AAC format, timebase, packet payloads, packet timestamps and durations preserved exactly. No gain, tempo change, resampling or audio re-encode.
- All 154 Russian tokens and 195 English words have mapped emphasis; no zero-frame words, hidden active words, source-event overlaps or unhighlighted targets.
- Every visible word's decoded highlight color agrees with its expected source event, with zero mismatches and zero ambiguous states in both films. A deliberate one-frame offset was detected by the independent negative control.
- 1,540 boundary states / 698 word boxes checked for stable geometry across both formats.
- Eight continuous reference segments per format, with packet counts and SHA-256 identities verified.
- Selected decoded pictures inspected at intro, lyric transitions, reference joins, closing line, source credits and the final frame.

## Timing and quality limits

The video lasts 168.233333 seconds; the unmodified audio lasts 168.228571 seconds. The last video frame covers the fractional final audio duration. The original picture ends about 62 ms earlier and is explicitly held through that tail.

Display rounding differs from the frozen acoustic intervals by at most 8.322 ms (less than half a 60 fps frame). This is a display bound, not proof that model-estimated acoustic boundaries are exact. User sign-off is recorded without inventing granular listening telemetry or assistant listening. The source timing ledger retains independent aligner disagreements.

The selected real-composition codec sample scored full-frame SSIM 0.998886; its bilingual lyric region averaged 54.256 dB PSNR, with a minimum of 52.500 dB after exact frame pairing. Those sample scores support visual inspection; they are not represented as whole-film metrics.

## File identities

- landscape: SHA-256 `f065a205ac4b48118f34a10544a324c6e4f746ccb0c2297da1ba977a038fa42e`
- portrait: SHA-256 `663d5d4ff7aef993b709169c59d1f3a0e764d32769b12b4b65bb970c8c03aece`

## Credits and handoff

Music and lyrics: Марина Демещенко / POLNALYUBVI. Animation: Юлия Чайковская / ORAMAI. Backgrounds and illustrations: Алина Чайковская / FINITO, credited on screen as FINITOLINA. [Original song and animation](https://www.youtube.com/watch?v=qC4sCCmvoXU).

Added bilingual presentation and production by Ael with OpenAI Codex, following the Lyrics workflow in general. The publishing kit includes a 1200×1600 portrait cover made with the built-in imagegen tool, its exact prompt, selected original, captions and publishing copy. Third-party media are delivered locally or held in a draft release. Source code and structured audit evidence are provided separately.
