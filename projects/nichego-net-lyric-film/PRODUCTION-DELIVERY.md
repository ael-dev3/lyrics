# Approved silver v1.1 production

## Frozen scope

The owner accepted the complete current silver preview, then explicitly directed rendering, Desktop delivery and GitHub integration. [The current authorization](source/PRODUCTION-AUTHORIZATION.json) binds that decision to `nichego-net-v1.1-preview` and its exact source, timeline and scene hashes. Production changes only the capture/encoding and delivery adapters; source, text, translations, word intervals, exposure, crops and filament remain unchanged.

The standardized full normal-speed, uncertain/reduced-speed and both-layout listening fields remain unlogged in [REVIEW.json](source/REVIEW.json). They are not inferred from general acceptance. The strict standardized gate still rejects incomplete listening evidence. A separately tested owner scope authorizes this exact accepted preview and rejects missing approval, changed identities and unauthorized records. No assistant direct-listening claim or millisecond perceptual guarantee is made. This decision does not authorize changed inputs or another song.

## Production profile

| Item | Value |
| --- | --- |
| Original picture | AV1, 1080×1080, 25 fps; all 4,874 decoded pictures |
| Original sound | Opus stereo; 9,360,624 decoded frames at 48 kHz, 195.013 s |
| YouTube | H.264, 1920×1080, 60 fps, 16:9 |
| TikTok | H.264, 1080×1920, 60 fps, 9:16 |
| Output extent | 11,701 pictures, 195.016667 s |
| Native picture mapping | `min(4873, floor(outputFrame * 5 / 12))` |
| Word clock | `outputFrame / 60`; start-inclusive, end-exclusive source samples |
| Picture encoding | libx264 medium, CRF 17, GOP 120, four encoder threads |
| Color | Limited-range BT.709 YUV420P; square pixels |
| Upload audio | Apple AudioToolbox AAC LC, quality 2, 320 kb/s, 48 kHz stereo |

The renderer calls the same scene code as the accepted preview. Frame buffers pass serially through encoder callbacks; later painting cannot overwrite an unconsumed buffer. The last actual source picture holds through the original audio tail. Less than one 60 fps frame lies beyond the full original recording; no black ending or image extension is introduced.

AAC is an upload-compatible lossy conversion, not a packet-identical copy of the Opus source. No musical edit, volume filter, normalization or time shift is applied. The checked result has **zero selected lag samples** in a ±24 sample search, correlation **0.999877**, gain **0.997366** and waveform SNR **36.00 dB**. Its 720 surplus decoded padding frames lie outside the declared source extent. The final valid packet duration is bounded to 9,360,624 source samples. Production copies that checked AAC into both movies without encoding it again. These measurements describe codec fidelity and timing, not independent word-boundary audition.

## Final-file verification

Both finished files passed:

- Every one of 11,701 picture timestamps, expected duration, codec, dimensions, pixel format and color metadata.
- Strict full audio/video decoding and a complete black-interval scan with no detected black interval.
- Original-source comparison at **624 selected encoded frames per format**, using 521 exact native source pictures.
- **5,076 actual decoded glyph-state checks per format**. All **307 Russian/English tokens** have both focused and neutral evidence; all 307 deliberately delayed timing controls reject the wrong state.
- **121 sampled lyric-free reading frames per format**, including the opening and instrumental gaps.
- The same exact source, timeline and scene identities before and after rendering and verification.

Maximum sampled full-scene mean RGB error is 0.600 levels in wide and 1.794 in portrait. The corresponding fractions of channels differing by more than 24 levels are below 0.00012. These bounded encoded-frame comparisons verify agreement with the approved scene, not every possible acoustic judgment. [Landscape](evidence/final-landscape-verification.json) and [portrait](evidence/final-portrait-verification.json) receipts preserve the full methods and limits.

## Upload kit and covers

The kit contains the two full films; dedicated 1280×720 YouTube and 1200×1600 portrait TikTok covers; platform titles/descriptions; 39-cue Russian, English and bilingual SRTs; and a Farcaster copy of the wide movie with its cover and **one combined caption/disclosure/source-credit file**. AI-assisted editing, translation, synchronization, design and caption roles are disclosed without attributing the original music or vocals to AI.

Cover text is composed in code over a crop of the real source photograph. The full title, artist and mask subject were checked at wide 320×180 and portrait 150×200 / 300×400, including a 5% edge-crop simulation. The tall artist baseline was raised before acceptance to retain the lower safe margin. These are local visual checks, not platform upload previews.

`DELIVERY.json` and `CHECKSUMS.sha256` bind all 17 kit files. The Desktop-copy receipt independently hashes copied payloads and the checksum manifest. Public Git stores compact source, notes and evidence. Original media, retained analysis and final films use an authenticated unpublished recovery set, documented separately once download-and-restore verification completes. No platform upload or social post is performed by preparing the kit.

## Reproduction

```sh
npm ci
python3 scripts/prepare-source.py '/path/to/exact/original.mp4'
npm run build
npm run identity
npm run check
npm run test:gate
npm run prepare:audio
npm run render:production -- --format landscape
npm run render:production -- --format portrait
npm run verify:final -- --format landscape
npm run verify:final -- --format portrait
npm run covers
npm run publishing
npm run finalize
```

The original media and frozen authorization must be restored before reproduction. Native AudioToolbox requires macOS codec-service access. Inspect covers before marking their visual review passed and finalizing. Refuse replacement of an existing Desktop delivery; bind a newly commissioned revision to its own review and approval.

For acquisition, transcription disagreement, held-vowel selection, complete bilingual meaning and material-bound visual decisions, read [PRODUCTION-NOTES.md](PRODUCTION-NOTES.md). Preserve model uncertainty and unlogged listening scope when resuming this edition.
