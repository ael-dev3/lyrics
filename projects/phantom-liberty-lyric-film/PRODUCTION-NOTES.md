# Phantom Liberty — production record

## Approved edition

The delivered edition uses `phantom-liberty-preview-v2`: sixty performed cues, 312 supplied English words and one separately identified wordless-vowel candidate. Lead and backing phrases retain independent event IDs and complete reading blocks. The recording, selected word samples, source imagery, measured features, font and scene are frozen in [the approved-input manifest](evidence/preview-inputs.json).

The owner reported completion of the current preview review and explicitly authorized production. [Owner acceptance](evidence/owner-review.json) and [render authorization](evidence/render-authorization.json) are separate records. No itemized listening log or playback telemetry was supplied; those fields remain unlogged. Model-based backing boundaries, ambiguous chorus-release ownership and lexical alternatives remain documented in the original [timing evidence](evidence/timing-review.json). Acceptance does not make those measurements exact, and no assistant listening attestation is asserted.

The recording manifest's `productionRenderApproved: false` is an acquisition-stage historical field. The current authorization lives in its separate, hash-bound record. Preview/build commands still cannot initiate encoding.

## Source and export clocks

The original source is unchanged: H.264 1920×1080 at 30000/1001 frames per second, 10,429 decoded pictures; AAC stereo at 44,100 Hz, 15,348,736 decoded samples. Source zero remains zero. The decoded stereo S16 identity is `5a576b2c92a52bf244d14d4fcccf330dd30e22c1340d3f0966ee9657048d6521`.

Both compositions use 60000/1001 output cadence, approximately 59.94 fps, with 20,862 frames. Output frame `n` paints the scene at `n × 1001 / 60000` seconds and uses original picture `min(10428, floor(n / 2))`. This repeats the original pictures without interpolation. The source soundtrack is stream-copied; it is never slowed, normalized, trimmed or reencoded.

The original audio extends about 62.93 milliseconds beyond its picture stream. Hold the final decoded picture through that tail. The complete output video lasts 348.0477 seconds, about 3.80 milliseconds beyond the original decoded audio because of the last full output-frame interval. Do not use `-shortest`, which can truncate the source tail. Original authored dark passages remain intact; they are distinct from missing or substituted pictures.

## Composition and rasterization

- Native YouTube: 1920×816, retaining the complete active source picture and removing only its baked top/bottom margins.
- TikTok: 1080×1920, retaining the complete sharp moving picture at 1080×459 over the approved dim, defocused live-source extension.
- Both use the same unchanged TypeScript scene and font as the browser. Words remain stationary, with pale warm focus and localized crimson diffusion. Separate reader blocks survive overlapping vocals.
- The supporting signal contains 78 stationary nonmirrored light filaments shaped by 24 measured stereo-power bands, absolute RMS and a bounded previous-row blend. Its palette, travel and quiet response stay separate from word timing.
- Production rasterization uses native canvas, followed by H.264 CRF 17, medium preset, square pixels, BT.709 limited-range YUV420P and fast-start MP4. Browser and native rasterizers can differ in antialiasing; shared scene code alone is not a claim of pixel-identical browser rendering.

The portrait producer caches the opaque, shaded picture between output frames that use the identical original decoder buffer. It still invokes the unchanged scene, forwards context state and paints lyrics and measured light afresh at each output time. Its strict checkpoint requires one full-frame clear, two source draws and three full-frame fills. A separate forty-frame comparison across introduction, overlapping voices, held words, different cuts and the final tail found byte-identical RGBA against ordinary painting. [Cache evidence](evidence/background-cache-equivalence.json). This bounded proof is supplemented by the final encoded-state checks; it is not a claim that a microbenchmark certifies every possible future scene.

The completed native master retains its original producer identity. The cached portrait producer records its own code hash and the hashes of the unchanged original painter producer and cache helper. Verification and packaging check those identities independently. An abandoned, incomplete portrait attempt is kept only in ignored diagnostic history; it is not a posting choice.

## Reproduce the verified pipeline

Acquire the exact local source named by [source/recording.json](source/recording.json), install the pinned dependencies, and restore the approved-input records. The gate rejects missing authorization, another revision, changed inputs or an incomplete performed-event inventory.

```sh
npm ci
npm run check
npm run build
node scripts/render-gate.ts
node scripts/render-production.ts --plan
node scripts/render-production.ts --production --format landscape
node scripts/render-portrait-cached.ts --production --format portrait
node scripts/verify-delivery.ts
```

Use a new output destination or preserve earlier editions; the renderer and packager refuse to overwrite existing films or kits. A new local source acquisition does not acquire production authorization. The recorded approval applies only to the exact input hashes above.

## Verification and handoff

The local implementation passes strict TypeScript checking and all seventeen tests. Both complete MP4s passed independent verification:

- 20,862 exact picture timestamps and durations per format, with original-picture correspondence sampled in a clean 32×6 luminance grid over every output frame; no substituted black frames were found.
- All 14,989 original AAC packets preserve payload, PTS/DTS, duration and priming. Decoded stereo identity and 15,348,736 samples match exactly.
- 944 sampled decoded scenes per format, including original cuts, simultaneous lyrics, quiet passages and the tail.
- 939 encoded glyph states per format: the first, middle and final active output frame for each of 313 events. Every tested glyph preferred the intended focus; 58 deliberately wrong adjacent-word targets per format were rejected.
- Maximum sampled scene-grid mean absolute RGB error was 1.719 native and 2.547 portrait; maximum glyph-core error was 4.272 and 4.956 respectively. These bounded lossy-image measurements do not establish new listening evidence.

[Final verification](evidence/final-verification.json), [encoded scene review](evidence/encoded-scene-review.json) and [actual decoded final-frame provenance](evidence/final-film-still.json) identify the exact delivered bytes. The native master is 159,388,844 bytes with SHA-256 `5c17f678a04cbdfc3a577636a355c3c3245d8d670c76fc4498200f6eb5bb2a6d`; portrait is 114,448,127 bytes with SHA-256 `a5b0b102db75da3a54457cf89acfc03b2cb95a09bd8b60e77087fa450c763b48`.

The production reports record decoded original/output picture counts, rational clock mapping, encoder arguments and input hashes. Independent encoded-file checks cover the soundtrack identity, full decode, timestamps, source-picture correspondence and word-focus samples in both layouts. Lossy image comparisons and shifted-word negative controls are technical evidence, not listening evidence. Final proofs must be decoded from the identified delivered MP4, rather than reconstructed from the scene.

Large frame selections need a balanced FFmpeg expression tree. The first native verification attempt used a long left-associated selection and exceeded the filter parser's practical depth. It produced no pass record. Replacing only that expression structure preserved the selected frames and all thresholds; the complete native scan then passed. Test large generated expressions before a long decode, and keep failures distinct from verification success.

The local upload kit includes separate platform videos, a YouTube title and description, TikTok copy, an actual-source YouTube thumbnail and a dedicated portrait 1200×1600 TikTok profile cover. Optional caption files stay separate from the films. All twenty checksummed payloads, including the kit manifest, passed after workspace staging and after the Desktop copy. The twenty-one-file kit includes its checksum list. [Delivery receipt](evidence/delivery-receipt.json) binds the relative filenames, bytes, producer checks and package manifest identity; [publishing assets](publishing/README.md) retain cover and caption provenance.

Repository publication contains source, workflow, selected timing, verification evidence, representative decoded frames and delivery checksums. Binary media release and platform posting are separate permissions. Original media and private acoustic caches remain local; this handoff does not assert remote binary recovery coverage.

## Lessons to apply to the next recording

1. Rebuild ownership when many words fail; a global offset cannot repair quiet consonants, syllable borrowing, held-body releases and simultaneous voices.
2. Audit uncovered gaps independently of forced text. Separate a wordless vocal from the preceding lexical event instead of extending that word into unrelated sound.
3. Keep every repeated backing phrase intact while the lead changes. A second voice needs its own stable block, not a truncated tail or shared exclusive cue.
4. Use actual model stride and source sample identity. Integer samples make playback deterministic; they do not prove millisecond perceptual accuracy.
5. Inspect complete moving previews in both layouts. Preserve subject identity before filling a portrait frame, and verify source motion after seeks and recovery.
6. Freeze the accepted scene. Production adds reproducible clock, encoding and verification tooling; it does not silently redesign the accepted picture.
7. Check encoded glyphs, not just timeline arrays. Include the first, middle and final active output frames and prove the comparison detects a shifted word.
8. Keep review acceptance, acoustic confidence, final-byte verification, local delivery and remote publication distinct. Record the strongest supported scope without inventing missing telemetry.
9. Optimize repeated picture work only with explicit equality evidence. Keep the accepted painter unchanged, bind every producer dependency and verify the actual encoded result after introducing a cache.
