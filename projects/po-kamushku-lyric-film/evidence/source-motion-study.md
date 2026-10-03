# Source picture and environmental response study

## Source and scope

Original picture and soundtrack: [SETTLERS — По камушку](https://www.youtube.com/watch?v=oysjDP9Vqdg).

The acquired source is 1080 × 1080, square pixels, H.264 at 25 fps with 5,220 video frames (208.8 seconds), and 44.1 kHz stereo AAC. The source file SHA-256 is `f6572759f48f725497ad42b7c84cf12825824041897c47fdd36832a40ad30dd6`.

This document establishes the source's visual conditions and an authored receiving-surface plan. It is not a normal-speed listening review, a complete browser-motion test, a final rendered-media verification or render authorization.

## What the recording actually shows

The source is a visually static overhead portrait: a woman in white clothing lies curled on nearly black granular earth, enclosed by an irregular ring of existing stones. It is not a sequence of forest, window or room shots. The supplied lyric's window, dresser, boards and concrete are narrative imagery; adding objects of those kinds would invent a replacement environment.

Fourteen full-frame samples distributed through the recording show the same pose, framing and stone boundaries. All 5,220 decoded frames were fingerprinted. There are 525 distinct decoded YUV frame hashes, with repeated hashes rather than visibly changing composition. Nine grayscale samples at 0, 10, 30, 60, 90, 120, 150, 180 and 200 seconds were compared to the opening. Nonzero samples have average absolute differences of 0.56168–0.56665 values on a 0–255 scale; only 0.09302–0.10442% of pixels differ by more than eight values. These are consistent with small encoding differences in a static source picture, not evidence of meaningful camera or subject motion.

The complete framemd5 diagnostic SHA-256 was `45bd4858f74caa9851e8c548571e563b91cd159df9e7c44f61b7b1781da895d9`. The diagnostic can be reproduced locally with:

```sh
ffmpeg -v error -i public/source.mp4 -map 0:v:0 -an -f framemd5 analysis/source-frames.framemd5
```

Keep browser playback and source-frame diagnostics even for this source. A deliberately static picture must not be confused with a decoder that is stuck on one frame. Audio and source time must continue normally; authored musical response must change and reconstruct consistently after seeking.

## Actual receiving surfaces

[`public/stone-anchors.json`](../public/stone-anchors.json) contains 30 conservative polygons inside existing stone surfaces. It does not draw substitute stones, a new ring, bars or radial teeth. Native coordinates are in the original 1080-pixel square. The polygons cover 52,834 pixels, about 4.53% of the source image. Each stone has a stable ID, center, ellipse falloff, angle in radians, one of 24 source-analysis bands, an inferred light-facing normal and its sampled source mean color. All 24 bands appear; adjacent stones occasionally share a band because there are 30 receiving surfaces.

The source texture is the material. Clip local light response inside each polygon and retain the underlying stone photograph. The polygon is the conservative receiving mask; the soft edge follows inward distance to that polygon. The recorded radii normalize the qualitative directional illumination rather than defining an elliptical mask. A flat solid fill, moving mask, hard glowing outline or newly drawn rock would weaken the intended integration.

Upper-left light direction is a qualitative inference from the original artwork, not a measured three-dimensional reconstruction. A restrained warm-gray response can suggest light catching existing facets while keeping the source nearly monochromatic. Keep brightening bounded, retain dark detail, and keep the singer's white clothing brighter than the reactive stone faces. Do not add a neon perimeter or large spill into the surrounding black earth: the photograph does not provide an emissive object that explains it.

Only the existing surfaces change; their positions, silhouettes and scale remain fixed. The frequencies are a spatial artistic mapping, not a claim that stone location encodes an objective frequency or emotion. Source measurements, smoothing and source-time lookup remain distinct from brightness, color and reading-zone attenuation.

## Composition and hierarchy

The singer and cloth occupy approximately x342–682, y260–701. Protect this entire area. The ring spans roughly x110–925, y50–995. It is asymmetric and should remain that way.

The clean lower interior is only about y706–805. Its usable width narrows because stones intrude at the sides. It can support a short two-line reading state but cannot comfortably contain every long Russian line and its equally prominent English translation at a generous font size.

The native preview's larger bilingual block is therefore a deliberate foreground reading layer on the lower earth, rather than text claimed to be painted onto a single stone. A block around y775–1018 overlaps part of the actual bottom stone arc. A continuous soft earth shade and lower-arc response attenuation can protect reading without masking the woman. The tradeoff must be reviewed at realistic player size: do not darken the lower stones until the source ring disappears, and do not let relighting beneath text compete with the active word. The upper and side stones can carry the clearer musical response while the bottom remains quieter during lyrics.

For 1080 × 1920 portrait, preserve the entire 1080-pixel source square at y212–1292. This retains every stone and the full figure. Extra earth above and below may use dimmed, defocused crops of real edge texture; avoid a legible duplicated subject or stretched ring. Place equally sized Russian and English reading below the complete square, within the reviewed platform-safe region. This is an authored portrait composition, not a center crop of the square.

Attention order during vocals is the active phrase, the singer and the real stone response. During instrumental space, the receiving surfaces can become more prominent. A calm opening can remain nearly unlit; it should not be normalized upward to mimic the energetic chorus. The measured features naturally support this distinction. With the current authored display curve, sampled band-response maxima range from approximately 0.114 at 12 seconds to 1.0 at 54, 120 and 145 seconds; this is display behavior, not a separate emotional classification.

## Review questions for the complete preview

- At normal viewing size, can the stone response be seen clearly during stronger music while the original surfaces and figure remain recognizable?
- Does the nearly monochromatic picture retain its identity, without orange flashes or a synthetic glowing ring?
- Are both languages equally readable, with complete phrases and stable geometry?
- Does the native lower reading region preserve enough of the existing ring, and does portrait preserve the entire source square?
- Do fresh load, seeking and format switching preserve source identity and reconstruct the same musical state?
- Are tiny surface details useful at ordinary playback size? Remove decoration that only works in enlarged stills.

These are separate from acoustic onset/release checks and the listening gate. Do not use a static contact sheet or the receiving-surface study as proof of those checks.
