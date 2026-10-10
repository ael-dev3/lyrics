# Approved production and delivery

## Frozen edition

The owner accepted the complete `drug-preview-v2-natural-city` preview after the животное / animal correction and explicitly directed local production, a Desktop posting kit and GitHub source integration. [PRODUCTION-AUTHORIZATION.json](source/PRODUCTION-AUTHORIZATION.json) binds that direction to the source, timeline and scene hashes. It covers this exact composition.

The record distinguishes owner acceptance from a standardized listening checklist. Granular normal-speed, reduced-speed and format listening fields were not separately logged and remain unasserted in [REVIEW.json](source/REVIEW.json). The project-specific authorization checks the accepted current inputs; the stricter shared synchronization gate still rejects an incomplete checklist. Negative tests reject changed source, scene, timeline or revision and missing explicit rendering direction. No assistant listening attestation is claimed.

## Production adapter

`scripts/render-production.ts` uses the unchanged `initializeScene` / `paintScene` functions, bundled Oswald Medium, canonical hair/reference mask, selected sample intervals and original measured audio features. Node 24 and the native Canvas library rasterize the accepted scene. FFmpeg decodes the actual original pictures and encodes H.264 with copied AAC audio. No browser screenshot is substituted for the full recording.

| Item | Selected value |
| --- | --- |
| Original source picture | 1920×1080, 30 fps, 4,500 pictures; complete central 1080×1080 illustration |
| YouTube | 1920×1080, 60 fps, square pixels |
| TikTok | 1080×1920, 60 fps, square pixels |
| Output pictures | 9,005 per format; 150.083333 s |
| Native picture selection | `min(4499, floor(outputFrame / 2))`; final picture retained through the original AAC tail |
| Lyric clock | `outputFrame / 60`; start-inclusive and end-exclusive source samples at 44.1 kHz |
| Picture encoding | libx264, medium preset, CRF 17, six encoder threads, GOP 120, MP4 fast start |
| Color | Full RGB converted explicitly to limited-range BT.709 YUV420P |
| Audio | Original AAC packets; no trimming, filtering or reencoding |

The original soundtrack lasts 150.070567 s. The output covers it with less than one extra 60 fps frame of video, without stretching or shortening the audio. Lexical timing remains at source-sample precision; its visible encoded state follows the 16.667 ms output-frame grid. Technical checks do not establish uniquely exact perceptual milliseconds.

The YouTube edition is deliberately 16:9 for a standard-video upload. [YouTube's current guidance](https://support.google.com/youtube/answer/15424877?hl=en), checked 10 October 2026, recommends a wider ratio such as 16:9 when a standard video is wanted. Local geometry does not establish completed platform classification.

## Verification before delivery

`scripts/verify-final.ts` independently inspects both finished files:

1. Probe actual codec, dimensions, square pixels, color/range, zero stream starts and frame count. Check every decoded picture timestamp against `n / 60`.
2. Strictly decode the full video and audio, with decoding errors treated as failures. Detect unintended full-frame black intervals.
3. Compare all original AAC packet payload hashes, timestamps, durations and side data with each output. Independently compare decoded floating-point PCM hashes.
4. Select frames around every source-word entrance, event middle, held release and exclusive end, plus the intro, filtered passages, instrumental tail and last picture. Compare decoded complete scenes with the shared painter using bounded codec tolerances.
5. Inspect opaque glyph interiors against independently computed source-sample and target-contributor expectations. Every Russian and English token must appear focused and neutral. Deliberately delayed 100 ms expectations must fail where they disagree with the encoded state.

These finite glyph/scene checks complement full-file decoding and audio identity. They do not turn a model proposal or accepted preview into an independent listening log. The weak filtered echo at 111.212–111.820 s retains its selected interpretation and original model uncertainty.

## Posting kit

The kit contains two complete films, two covers, three posting-text files, three optional SRT files, a README, delivery manifest and checksum list. The YouTube thumbnail is 1920×1080; the TikTok profile cover is 1200×1600 portrait. Both adapt the original illustration with the same typography and palette. Local 320×180 wide, 150×200 / 300×400 portrait and 5% crop checks protect the full title, artist and face.

`scripts/finalize-delivery.ts` verifies the rendered movie hashes and identity before copying them into the kit, then hashes every deliverable. The Desktop handoff is checked again against that inventory. Public Git holds editable production code, references/features, text and mappings, covers, copy, captions, technical reports and decoded final-film stills. Original source and full movies remain local and ignored. Platform uploading and public media release are separate actions.

## Reproduce this approved edition

Supply the hash-matching `public/source.mp4`, then:

```sh
npm ci
npm run check
npm run render:gate
npm run render -- --format landscape --plan
npm run render -- --format landscape --production
npm run render -- --format portrait --production
npm run verify:final -- --format landscape
npm run verify:final -- --format portrait
npm run kit
npm run finalize
```

Rendering refuses an existing movie or partial output. Preserve prior deliveries and receipts before preparing a replacement. A changed scene, timing map or recording requires renewed applicable review and authorization; these commands do not authorize another song.
