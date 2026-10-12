# Production record and reusable lessons

## Accepted inputs

The supplied transcript became the editorial starting point, checked against the uncut original recording with unconstrained coverage, bounded original/vocal conditioned observations, narrow uncertain-word passes and signal support. Source text corrections, rejected alternatives and uncertainty remain distinct. Translation was written for meaning and readable natural order; all 306 English tokens receive the complete meaning focus of 228 Russian events.

The complete moving-source preview ran before production. Actual browser canvases at 50.2s wide and 253.9s portrait show current hashes, actual source PTS and loaded Alegreya. Reduced-speed transport advances both clocks and recovery retains the source time, format, mute state and effect selection. Owner acceptance/direct production direction is scoped to the unchanged current v1. Standardized listening fields remain unattested; the separate local owner-directed path does not relax the shared future-song gate.

## Exact export

```sh
npm run check
npm run render:gate
npm run render:landscape
npm run render:portrait
npm run verify:landscape
npm run verify:portrait
npm run covers
npm run publishing
# inspect native and profile-size covers; record the actual inspection
npm run finalize
node scripts/deliver-desktop.ts --destination <new-Desktop-folder>
```

Both films use the shared Canvas scene at exact output times `n/60`. All 6,489 original1080-square pictures are decoded. Frame selection is `min(6488,floor(n×5/12))`; all source pictures appear.15,576 output frames cover259.600s. The last real picture covers the original31.995 ms audio tail. Source picture selection and word samples are separate clocks; no blanket subtitle offset, interpolation or audio retiming is applied.

FFmpeg: rawRGBA at 60 fps; libx264 medium, CRF 17,6 threads, GOP 120, yuv420p limited-rangeBT.709, square pixels, 60000 video timescale, faststart. Original AAC packets are copied. Source/timeline/scene/producer hashes are frozen before capture and rechecked afterwards; existing output is never overwritten.

## Final evidence

| Check | Wide | Portrait |
| --- | --- | --- |
| Complete output frames | 15,576 | 15,576 |
| Strict full video/audio decode | Pass | Pass |
| Every-frame timestamp | Pass | Pass |
| Original AAC packets | 11,182 identical | 11,182 identical |
| Decoded source PCM | Identical | Identical |
| Black intervals | None | None |
| Selected scene comparisons | 1,223 | 1,223 |
| Actual selected native source pictures | 1,049 | 1,049 |
| Glyph states checked | 8,591 | 8,591 |
| All 534 tokens focused and neutral | Pass | Pass |
| Deliberately100 ms delayed controls | 534 | 534 |
| Sampled empty reading frames | 381 | 381 |
| Minimum correct glyph classification | 99.84% | 99.67% |

Every selected encoded output is compared with its exact original decoded picture and shared scene. This catches artwork changes, missing source picture, incorrect effect time or shifted glyph rendering. Glyph classification uses opaque letter interiors and tests both false-positive and missing focus. A small display sample cannot certify the optimal perceived acoustic onset; the scope remains technical.

Native final JPEGs are extracted by exact zero-based FFmpeg frame selection, without repaint/crop. Covers use the same original wolf, paper and serif in dedicated1280×720 and 1200×1600 compositions;150×200 portrait, 320×180 wide and 5% crop proofs were inspected. Posting copy credits the verified source channel without inventing composer/illustrator claims. The 13-file kit and Desktop copy match every SHA-256.

## Lessons for a future prompt

1. Establish performed coverage before alignment. Pasted timestamps are coarse; forced paths can turn preceding guitar or old vowels into new words.
2. Combine quiet entrances and complete held bodies. Character cores can start late and stop several seconds before a vowel ends. Attention can start too early. Neither endpoint is automatically truth.
3. Give repeats their own identity. The four third-chorus escape renewals and the two final racing renewals each need fresh event ownership.
4. Keep necessary grammar inside the meaning event: `I'll run away`, `I bite`, negatives and clock hands. Preserve unstated objects; inspect every English token, not just source count.
5. Let existing printed material be the spectrum. Knots, leaves and berries can change pigment smoothly while the wolf stays fixed. A new geometric bar train or moving outline would weaken this illustration's printed character.
6. Protect portrait focus at small size. Use clear dark rust on pale paper and equal language weight; do not copy dim highlight strength from a dark cinematic scene.
7. Separate lexical release, neutral reading hold and fade. The final word remains focused through 255.594s, readable without active color through 255.834s, and clears at 256.334s.
8. Preserve the short source audio tail deliberately. Output duration must cover the sound, with a real last picture rather than black.
9. Verify final bytes as well as data. Every token active/neutral and a deliberately delayed control catch a renderer that ignores correct timing data.
10. Keep reviewer roles and evidence honest. Current-song owner direction, model hypotheses, browser clock checks and encoded tests are separate; no inherited authorization or fabricated listening telemetry.

These are reusable decisions. Palette, mask rectangles, intensity, selected words and precise intervals belong to this recording, not a universal preset. Public documentation preserves the method without personal review quotations, ratings or local account details.
