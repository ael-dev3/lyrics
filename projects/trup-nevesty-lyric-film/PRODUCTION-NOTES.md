# Production decisions

## Use the recording’s materials

The official recording holds a painting of a pale skeletal bridal hand, golden wedding ring, dusty rose guitar, six chalk strings, gray veil beads and slate cloth. All 205 one-second-cadence source-picture samples have a maximum mean channel difference of 0.527 on a 0–255 scale. This supports intentional held artwork; the player still decodes actual original frames.

The lyric’s forest, earth and door are absent from this painting. Effects therefore inhabit the visible guitar, veil and ring. The hand, texture and soundtrack remain intact. A few meaningful material responses protect the reading experience.

## Scene contract

| Layer | Material and clock behavior |
| --- | --- |
| Guitar visualizer | Six fitted string paths; four consecutive spectral bands per string; endpoints fixed; a hand polygon occludes response behind the fingers. Artistic energy mapping, not literal pitch extraction. |
| Measurements | Original stereo mean power; 24 logarithmic bands, 40–10,000 Hz; 2,048-point Hann FFT at 22.05 kHz; 50 measurements/second. RMS window 40 ms; transient observation window 20 ms. |
| Response | Per-string artistic percentile range (10th/97th), quiet-signal gate, 55 ms attack, 180 ms release. Source-time interpolation makes paused seeks deterministic. Wave displacement bounded to 8.4 original-picture pixels. |
| String texture | Broken companion strokes and soft gold bloom follow painted chalk; base strings stay visible; the response is hidden behind the hand. |
| Veil | Twenty-three existing sampled beads receive slow, low-amplitude glints: about 8.85-second phase periods with small musical modulation. |
| Ring | Glint clipped to the real ellipse at (556, 784), with slow drift. Additional gold applies only during **колечко / обручальное** ownership. |
| Reading | Stationary Alegreya weight 600; ivory `#f0eee8`, gold `#f1cd82`. Russian/English share size, weight, shadow and contrast. Wide starts at 64 px; portrait at 72 px; long blocks shrink both together to a 54 px floor. |
| Framing | Wide 1920×1080 centers the complete source at (420, 0); portrait 1080×1920 at (0, 420). Broad edge-color gradients extend slate/rose without duplicating the subject. |

A feathered reading shade occupies upper negative space. Active glyphs keep their position; shadows reset for each token. The opening title leaves before the first vocal. Balanced wrapping avoids stranded English pronouns.

## Language and timing

The supplied sheet is preserved separately. Standard accents, punctuation and **Отчего** improve reading. Recording-supported **нету** is documented with uncertainty. English keeps natural word order and complete grammatical focus: “a ring,” “will open,” “my chest,” “there’s no,” and adjective copulas follow their source meanings. Only irreducible constructions use contributor unions; real gaps remain unlit.

The three choruses preserve beats / breaks / no heart, gentle / certain death and our / your / my place. Every occurrence has its own selected timing. Gold lexical focus and neutral full-line reading persistence remain separate.

## Preparation errors caught

- Conditioned alignment assigned crop starts to first words. Those artificial onsets were rejected and selected against original/vocal panels and physical MMS character centers.
- Several closing crops stopped before held vowels ended. Wider crops were reanalyzed; rejected observations remain preserved in private analysis.
- Crop-duration/output-frame ratios would stretch CTC timing. Actual encoder stride and receptive-field centers supplied physical observation times.
- Thin stretched picture strips produced distracting streaks. Broad color averaging removed them while preserving the full subject.
- Greedy wrapping stranded a final English pronoun. Balanced wrapping fixed it without treating English as smaller secondary text.
- A gate test depended on the real pending review file. Fixture tests now test incomplete scope and stale identities without failing when a future legitimate approval is recorded.

## Reusable lessons

Identify actual surfaces before selecting animated nouns from the lyric sheet. Fit paths against both visible sides of an occluder; extrapolating a short segment can drift at the far edge. Keep musical energy, sung ownership, translated meaning, reading holds and decorative movement separate. Compare full animation on/off at realistic sizes; portrait active words need clear contrast.

Expose exact source, timeline and visual identities in the loaded preview. Changed inputs invalidate older approval. Technical checks support listening judgment rather than certifying perception.

## Accepted production identity

The owner accepted the complete `trup-nevesty-preview-v1-acoustic` scene and directly requested production, a Desktop kit and source handoff. Production preserves that scene and timing. `source/PRODUCTION-AUTHORIZATION.json` locks source, timeline, scene and revision hashes; stale identities block capture. `source/REVIEW.json` retains pending standardized listening scope. The reusable strict gate is unchanged. Current-song authorization is neither a full-listening attestation nor future-song permission.

## Actual movie clock and encoding

The original contains 5,131 pictures at 25 fps, ending at 205.240 seconds, and 9,053,184 decoded stereo samples at 44.1 kHz, ending at 205.287619 seconds. Each output contains 12,318 frames on an exact 60 fps grid, ending at 205.300 seconds. The last picture persists through the AAC tail; `-shortest` is absent so sound cannot be truncated.

Picture selection is `min(5130, floor(outputFrame * 5 / 12))`. Every native picture is decoded and held for two or three output frames without interpolation. Lyric and material animation use `outputFrame / 60`, matching the preview's independent fractional clock. Deliberate source stillness and decoded picture correspondence remain separate observations.

RGBA scenes stream directly to FFmpeg without a large raw-frame cache. H.264 uses medium CRF 17, six threads, 120-frame GOP, BT.709 limited-range YUV420P, square pixels and MP4 fast-start. Original AAC packets are copied without filtering, trimming or reencoding. The renderer refuses existing completed/partial files and rechecks source, timeline, scene, approval and renderer identity before successful atomic completion.

## Final-file checks

`scripts/verify-final.ts` checks each completed film's dimensions, codecs, color/range, pixels, zero start, all 12,318 timestamps and strict full video/audio decode. Near-black scanning finds no missing-picture interval. All 8,841 original AAC packets match payload hashes, timing and side data; decoded PCM SHA-256 stays `0bb2bd2a139191c0bb91932943335a0ab97de261b2a4acf80bd3e6c3caf6a00c`.

Each format supplies 695 decoded frames around every selected entrance/release and event middle, plus opening, instrumental and closing samples. Scene comparisons allow bounded codec differences against the held canonical reference. Independent integer-sample/contributor logic supplies expected gold/ivory glyph states. All 442 tokens appear in both states; 11,269 state checks pass per film, with at least 99.49% matching opaque interior pixels at the weakest checked token. Sixty-three deliberately delayed 100 ms controls are detected per format. Finite scene checks complement full decoding; they do not establish independent listening or millisecond acoustic exactness.

README images are exact MP4 frame 5,712 at 95.200 seconds and portrait frame 7,014 at 116.900 seconds. `evidence/final-stills.json` identifies the actual encoded files and source-picture mapping; preview stills remain separately labelled.

## Covers and handoff

Code-composed covers preserve the official illustration and approved palette: YouTube 1280×720; TikTok 1200×1600 portrait. Alegreya 600 titles/artist are reviewed at 320×180 and 150×200. The initial TikTok title clipped in the 5% crop simulation; baselines of 230 px for title and 320 px for artist preserve full lettering. Actual title ascent must fit a 7% top margin. This poster correction leaves the accepted film untouched.

The 13-file kit contains two MP4s, two covers, three copy files, three optional SRTs, README, delivery inventory and checksums. Finalization verifies film identities before copying, then hashes the complete kit. The new Desktop folder is rehashed after copying. Public Git records covers/copy/captions and delivery evidence; original/production movies remain ignored. No platform upload or public media release is recorded.
