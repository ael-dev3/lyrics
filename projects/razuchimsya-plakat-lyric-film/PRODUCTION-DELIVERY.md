# Approved v1.1 production

## Frozen scope

The owner reported completed review and accepted the current single-line preview, then explicitly directed rendering, Desktop delivery and GitHub integration. [The authorization](source/PRODUCTION-AUTHORIZATION.json) binds this instruction to `razuchimsya-plakat-v1.1-preview` and its exact source, timeline and scene hashes. No lyric event, translation, graphic, crop or preview renderer changed for production.

Owner acceptance remains separate from a standardized speed/layout listening log. Those granular fields remain unasserted in [REVIEW.json](source/REVIEW.json); no assistant listening telemetry is invented. The strict checklist test still rejects incomplete evidence. The project-specific current-preview authorization checks explicit ownership, production scope, acceptance and every frozen hash. Missing, stale and unauthorized records fail negative tests. This record authorizes this edition alone.

## Rendering the approved scene

| Item | Value |
| --- | --- |
| Source | 1080×1080 AV1, 25 fps, all 5,676 native decoded pictures |
| YouTube | 1920×1080, 60 fps, H.264, 16:9 |
| TikTok | 1080×1920, 60 fps, H.264, 9:16 |
| Output extent | 13,625 pictures; 227.083333 s |
| Original picture selection | `min(5675, floor(outputFrame * 5 / 12))` |
| Word clock | `outputFrame / 60`, start-inclusive / end-exclusive 48 kHz events |
| Picture encoding | libx264, medium, CRF 17, GOP 120, four encoder threads |
| Color | Explicit limited-range BT.709 YUV420P, square pixels |
| Text | Approved static Cormorant Garamond Semibold 600 |
| Audio | Apple AudioToolbox AAC LC, 320 kb/s, stereo 48 kHz |

The production adapter uses the unchanged `initializeScene` / `paintScene` implementation, original measured response data and the actual native source pictures. Native-canvas buffers are written serially through encoder callbacks so painting cannot overwrite an unconsumed frame. The last original picture covers the short original audio tail; the film adds less than one 60 fps frame beyond the recording.

Native shared-scene frames at 33.500 s and 205.200 s were compared with the actual approved browser exports. The finite full-frame RGB error is about 2.10–2.30 levels, mostly rasterizer/scaling differences. This verifies representative compositor parity; it is separate from acoustic review and final encoding.

## Audio export correction

The source contains Opus, so upload-compatible AAC requires lossy encoding. The first native-FFmpeg AAC export showed about 5% amplitude attenuation and 22.93 dB waveform SNR. It was rejected by the selected audio checks. Increasing its bitrate did not solve the level error.

Apple AudioToolbox, quality 2 at 320 kb/s, provides a closer result: correlation about **0.999606**, gain **0.994308**, waveform SNR **30.91 dB**, and **zero selected lag samples**. These numerical comparisons describe codec fidelity, not an acoustic listening certificate. No normalization, volume filter, musical edit or time shift was applied. The decoder can retain 912 surplus AAC padding samples outside the declared source extent.

AudioToolbox requires the native macOS codec service; it was unavailable inside the restricted sandbox. The successful host encode is retained in the recovery set. `prepare-upload-audio.ts` bounds the final packet's valid duration to the exact **10,899,504 decoded source samples** (227.073 s), excluding surplus codec padding without dropping any original audio sample.

The corrected audio was remuxed into the existing films. Every H.264 packet payload, PTS, DTS and duration remained identical in each of the **13,625 video packets per format**. [The remux record](evidence/audio-remux-video-identity.json) and render receipts retain the original video-adapter hash and the final audio/container adapter chain. The normal renderer now copies the validated prepared AAC track directly for future reproduction.

## Verification and posting kit

The final-file verifier checks every picture timestamp, a strict full audio/video decode, unintended black intervals, native-picture/shared-scene correspondence, and actual decoded Russian/English glyph states. It selects onset, middle, held-release and exclusive-end frames for every source event, plus all existing readable target states and lyric-free gaps. Deliberately delayed expectations must fail where they disagree with the delivered colors. Finite encoded checks establish display agreement with the approved map, not independently exact perceptual milliseconds.

The upload kit includes both films, dedicated YouTube and tall TikTok covers, titles/descriptions, optional Russian/English/bilingual SRTs, and a Farcaster copy with one combined title/disclosure/source-credit file. The original photograph and focal subject remain intact. Cover typography is composed in code; local 320×180 wide, 150×200 / 300×400 tall and 5% crop proofs retain the full title and artist. These are local crop checks, not a claim about an actual platform upload.

The final delivery and Desktop-copy receipts identify exact bytes. Full original media, editable production source, retained analysis and the upload kit are backed up in [a verified authenticated unpublished recovery set](RELEASE-BACKUP.md), independently downloaded and restored. Public Git receives code, neutral process notes and verification evidence. No social-media upload or public media release is implied by creating the kit.

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

Use the authenticated recovery files for the frozen authorization and original media. A fresh `prepare:audio` run on macOS needs native codec-service access. Do not overwrite accepted movie paths or substitute a changed preview. Inspect the generated covers and verify final file hashes before copying a new kit.
