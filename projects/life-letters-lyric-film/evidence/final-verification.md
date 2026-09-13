# Life Letters v1.0.0 — final verification

The final MP4 passed complete decoded-frame cadence, format, color, start-time and locked-audio checks. Six decoded phone-size frames were visually reviewed. These checks are distinct from acoustic and linguistic confidence.

| Check | Observed result |
| --- | --- |
| File | `LIFE-LETTERS-RU-ES-AR-LANDSCAPE.mp4`, 207,774,117 bytes |
| SHA-256 | `cf9326f71a612ba07fa016ea1000dee2c355c47f8b485527c5905ddb43897899` |
| Picture | 2348×1080, H.264 High level 5.1, yuv420p, 60 fps |
| Color | Limited-range BT.709 matrix, transfer and primaries |
| Complete frame decode | 15,692 frames; maximum reported deviation from 60 fps timestamps: approximately 0.333 microseconds |
| Duration | Video 261.533333 s; audio 261.526 s |
| Stream starts | Both zero |
| Audio | AAC LC stereo 48 kHz; compressed and decoded hashes match the locked soundtrack |
| MP4 layout | Fast start: `moov` precedes `mdat` |
| Text geometry | Maximum measured width 971.278 px inside 984 px lanes; browser bounds also checked during render |
| Phone-size review | 874×402 frames at 22.2, 63.8, 76.7, 230.95, 240 and 260 seconds |

[Machine-readable QA](final-qa.json) · [Audio identity](audio-identity.json) · [Cue and coverage audit](composition-audit.json) · [File hash](delivery-sha256.json).

Reviewed frames showed legible Russian, Spanish and pronunciation, without visible overlap or clipping. Held-vowel and phonetic accents aligned visually. Complete source closing credits were unobscured. This is sampled visual evidence, not every-frame visual review or a physical iPhone test.

Encoded cadence does **not** measure lyric alignment error. Audio identity establishes preservation of the locked soundtrack, not exact perceptual word boundaries. Translation, phonetic respelling and difficult processed-vocal boundaries remain AI-assisted decisions without independent native-listener ground truth.

Publication makes interpreter paths portable and updates packaging and documentation. The film, final cues, translations, pronunciation dictionary, fonts, spectrum and locked media remain the verified render inputs. The archive comes from a committed revision; a later publication receipt records fresh-download comparisons for every asset.
