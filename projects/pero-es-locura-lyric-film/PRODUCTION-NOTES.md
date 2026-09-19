# Historical v1 production and verification

This document preserves the original v1 implementation and results. See [current delivery and lessons](README.md) for the approved paired-focus edition. Historical values below are not current-render results.

## Approval and strict listening review

Production is bound to `preview-v1-live-capitalized`. The project owner accepted the available full-recording preview, authorized both renders and requested a Desktop posting kit and repository update. The owner explicitly confirmed actual-audio review, reduced-speed checks of uncertain events and both 16:9 and 9:16 layouts.

The strict gate is unchanged. No scoped waiver is used. Its completed rows are based on that explicit human attestation, supplemented by a separate editorial meaning review and technical evidence; they are not fabricated automated listening telemetry. The original pending preview record is retained in `evidence/history/`. Raw alignment disagreements and the original model `reviewRequired` flags remain provenance, not a claim that a machine independently heard every boundary.

## Frozen presentation

Recording, lyrics, accents, capitalization, performed sequence, source-word timing, meaning maps, palette, layout and scene are hash-identical to the accepted preview. The production adapter changes the capture mechanism only. Both languages remain equal in font size, weight and focus strength. Original stage motion and cuts supply the moving image.

At the end, source metadata and spectrum clear by 04:47, and the portrait mask becomes opaque to retain source credit text. The spoken closing tag stays independent of decorative fades. The last source picture holds through the remaining original audio.

## Capture and encode

1. Capture two lossless Chromium typography layers per cue—resting and active—plus title metadata, at twice delivery resolution with the bundled font.
2. Reconstruct current source-linked focus by selecting complete, nonoverlapping word regions. Vertical regions follow the midpoint between reading rows; descenders retain their full ink. Cache hashes bind each layer to the approved preview.
3. Decode the original source to RGBA at 60 fps using sample-and-hold. All 17,647 frame identities were compared against the original 24000/1001 fps cadence; the converter matches the source frame at or before each graphics timestamp. No interpolated motion is generated.
4. Composite the source, approved masks/shading, exact text and measured spectrum at 2×. Pass raw opaque pixels to FFmpeg and await each write before changing the canvas. Downsample once with Lanczos.
5. Encode HEVC Main10 using VideoToolbox at a 24 Mb/s target and 32 Mb/s maximum. The hardware diagnostic differs from the software x265 CRF17 reference by an average 53.294 dB PSNR; both pass decoded-word checks. Segment capture runs in isolated processes to bound memory. The capture receipt’s `elapsedSeconds` covers the final isolated worker, not total render wall time.
6. Concatenate verified video segments on the exact 60 fps clock and remux the untouched original AAC. Do not normalize, offset, resample or shorten the delivered audio.
7. Verify the actual color tags. VideoToolbox omitted transfer and primaries in this run despite explicit encoder options. A stream-copy HEVC metadata remux writes BT.709 into the bitstream and container. Compare every decoded native 10-bit frame hash and timestamp before/after; no pixels or sound are re-encoded. Keep the original capture checksum and the separate finalization receipt.

## Verification layers

- Strict review, exact approved preview hashes and explicit current-song authorization are checked before capture.
- 22 overlay proofs compare native composition with the approved Chromium SVG. Remaining differences are small gradient/edge quantization; full numeric results are retained.
- Dense bilingual encoded samples pass every visible-word classification. An intentionally shifted control confirms the checker detects wrong timing.
- Full-delivery verification checks dimensions, HEVC Main10/BT.709/range/pixel aspect, every frame timestamp, strict complete decode, fast-start layout, original AAC packet payloads/timestamps and decoded PCM identity.
- Full-delivery focus auditing classifies every visible source and translated word in every decoded frame. It certifies agreement with the approved map. Human acoustic review remains separately attributed.
- Decoded intro, repeated hook, dense verse, held note and ending frames receive visual inspection in both formats.

## Reproduction

Restore the locked local source and install the pinned dependencies. The repository excludes full media, generated caches and machine logs.

```sh
npm run check
npm run sync:gate
node --expose-gc scripts/raster-cache.ts landscape
node --expose-gc scripts/raster-cache.ts portrait
node scripts/raster-contract.ts --bind
node --expose-gc scripts/raster-proof.ts landscape
node --expose-gc scripts/raster-proof.ts portrait
node scripts/source-frame-audit.ts
node scripts/final-sync-audit.ts
node scripts/render.ts --diagnostic --format landscape --start 107.8 --frames 180
node scripts/render.ts --diagnostic --format portrait --start 188.5 --frames 180
node scripts/audit-decoded-focus.ts output/landscape-segments/diagnostic.mp4 landscape 6468
node scripts/audit-decoded-focus.ts output/portrait-segments/diagnostic.mp4 portrait 11310
# Expected failure: the deliberately wrong offset must detect mismatches.
node scripts/audit-decoded-focus.ts output/portrait-segments/diagnostic.mp4 portrait 11330 --negative-control
node scripts/adopt-raster.ts
npm run production:gate
npm run render -- --production --format landscape
npm run render -- --production --format portrait
node scripts/finalize-color.ts landscape
node scripts/finalize-color.ts portrait
node scripts/verify-production.ts output/Pero-es-locura-landscape-1920x1080-60fps.mp4 landscape
node scripts/verify-production.ts output/Pero-es-locura-portrait-1080x1920-60fps.mp4 portrait
node scripts/audit-decoded-focus.ts output/Pero-es-locura-landscape-1920x1080-60fps.mp4 landscape
node scripts/audit-decoded-focus.ts output/Pero-es-locura-portrait-1080x1920-60fps.mp4 portrait
node scripts/extract-delivery-proofs.ts landscape
node scripts/extract-delivery-proofs.ts portrait
# Inspect the decoded visual checkpoints in both formats before packaging.
npm run captions
npm run covers
node scripts/package-posting-kit.ts
```

The production contract includes adapter and audit hashes. A changed adapter requires affected proofs and a new binding; a changed approved scene or timing requires renewed relevant review. A cached segment is reused only after its range, complete fingerprint and encoded checksum match.

## Verified delivery results

| Film | Dimensions | Frames | Visible word states checked | Bytes |
| --- | --- | ---: | ---: | ---: |
| Landscape | 1920×1080 | 17,647 | 168,742 | 224,486,771 |
| Portrait | 1080×1920 | 17,647 | 168,742 | 209,376,167 |

Both formats have zero focus mismatches and zero ambiguous classifications. All 12,666 AAC packets and 12,969,984 decoded stereo sample frames match the original; every frame timestamp and strict full decode passes. Color finalization preserves every native decoded pixel hash and timestamp.

**Landscape:** [technical verification](evidence/Pero-es-locura-landscape-1920x1080-60fps.mp4.verification.json) · [decoded focus](evidence/landscape-Pero-es-locura-landscape-1920x1080-60fps.mp4.focus-verification.json) · [lossless color correction](evidence/production/landscape-color-metadata.json).

**Portrait:** [technical verification](evidence/Pero-es-locura-portrait-1080x1920-60fps.mp4.verification.json) · [decoded focus](evidence/portrait-Pero-es-locura-portrait-1080x1920-60fps.mp4.focus-verification.json) · [lossless color correction](evidence/production/portrait-color-metadata.json).
