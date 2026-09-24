# Final-file verification — I'll Change for You

The approved acoustic revision was rendered in the original 4:3 frame and the
9:16 composition. The owner separately confirmed a full normal-speed listening
review, reduced-speed review of uncertain words and held endings, and both
layouts. This record covers the produced **bytes**, not a new listening claim.

| Check | Original 4:3 | Portrait 9:16 |
| --- | --- | --- |
| Final MP4 SHA-256 | `4b3076311ccdf60e9996a602bb26d9670f3f5672d45125545bd8f0e85ba8bc04` | `ca45673173f7af3886e66a8a18c22f12276f6f587c0b283b4d1a3140eba12f64` |
| Picture | 1440×1080 H.264, 60 fps, 11,788 frames | 1080×1920 H.264, 60 fps, 11,788 frames |
| Video / audio duration | 196.466667 / 196.464036 s | 196.466667 / 196.464036 s |
| Original AAC identity | All 8,461 packets match source hash and timestamps | All 8,461 packets match source hash and timestamps |
| Source-picture continuity | 382 testable samples at 2 Hz; median correlation 0.9999; zero low-similarity samples | 382 samples; median 0.9994; zero low-similarity samples |
| Encoded-frame parity | 9 of 9 selected frames match their unencoded production stills; maximum lyric-zone RGB mean absolute error 1.494/255 | 9 of 9; maximum lyric-zone error 2.419/255 |

The source AAC packet SHA-256 is
`6516db46bd617517348d3ebc11b1d4a3f3ebc729f95b59219f6dcf31651170ef`.
Every packet presentation timestamp in each final file matches the locked
source. The final video frame covers the roughly 60 ms audio tail after the
last original video frame.

Full-file black detection found only **0–0.35 s** and **193.00–196.45 s** in
the 4:3 file, and **0–0.35 s** and **192.867–196.45 s** in portrait. The locked
source itself is black at **0–0.334 s** and **192.859–196.363 s**. There are no
new black gaps in the source picture. Complete FFmpeg decode with strict error
handling passed for both masters.

The encoded-frame parity set samples the two formats at 45, 61.3, 62.1,
103.1, 129.6, 153.5, 174.35, 190 and 193.2 s. The stills confirm the
unhighlighted pause before the first **For**, the following **For** focus,
held **be** and **all**, the second **again**, the closing **you**, and the
unvoiced source fade. Visual comparison with the live approved preview at
62.1, 103.1 and 153.5 s found the same source shot, text placement and focus.
The corrected portrait background matches the preview's restrained dark fill;
an earlier bright diagnostic was discarded before production.

The contact sheets at
[original 4:3](final-contact-sheets/original-4x3-review.png) and
[portrait 9:16](final-contact-sheets/portrait-9x16-review.png) also include
an early dark scene, the readable 45 s room scene, and both ending states.
They were inspected at sheet and native-frame size. The exact decoded 4:3
frame 2700 at 45 s is the [README image](../../../assets/ill-change-for-you-final-45.png),
SHA-256 `fbc8f42166c872ab8c47255e8b092d0aabe181c0d607842953d24c69055ab410`.

The machine-readable [verification report](final-verification.json) contains
dimensions, hashes, sample scores and per-frame parity values. With the exact
local source, both final MP4s and the renderer dependencies in place,
recreate the local reference stills and report from the project directory:

```sh
npm run render:parity-stills
python3 scripts/verify-render.py \
  --report evidence/final-verification.json \
  --contact-dir evidence/final-contact-sheets \
  --reference-dir output/qa-reference
```

The frame scan checks geometry, coverage and encoded visual parity. It does not
infer phoneme boundaries from audio or replace the owner's listening review.
