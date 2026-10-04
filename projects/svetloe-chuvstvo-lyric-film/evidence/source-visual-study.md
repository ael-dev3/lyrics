# Светлое чувство — source-picture study

**Scope: acquired source inspection and proposed preview art direction.** This study does not establish listening acceptance, exact vocal boundaries, creative approval, a full-film render or a final-file audit. The supplied [Settlers recording](https://www.youtube.com/watch?v=UANr7uyRZ3w) is the picture and soundtrack authority.

## Source identity and creator information

| Field | Acquired source |
| --- | --- |
| SHA-256 | `9563b2098827fcf2ee18e0f1b573ded5f5e147be3faf258b5f2507162690a655` |
| Source bytes | 5,645,314 |
| Picture | 1080×1080, square pixels, progressive H.264 / yuv420p, limited-range BT.709 |
| Native picture clock | 25 fps; 4,419 decoded frames; 176.760000 s extent; last picture PTS 176.720000 s |
| Soundtrack | Original stereo AAC, 44,100 Hz; container presentation extent 176.776009 s |
| Source zero | Both streams start at 0; preserve the measured codec/decoded-sample contract separately |
| Upload classification | Auto-generated music upload provided by ONErpm; it presents a photograph as the video picture |

The upload metadata names **Settlers** and **Шелпакова Яна Петровна**, credits lyricists **Судосьев Олег Павлович** and **Шелпакова Яна Петровна**, and identifies **Snegiri-music** as the phonogram owner. Its stated release date is **13 March 2026**; the upload-date field is **12 March 2026**. Those are separate source-supplied metadata fields, not a corrected release-date assertion. The metadata does not identify a photographer or grant a reuse licence. Preserve the artist imagery and credit the original upload without inventing an image creator.

The soundtrack's container extent is slightly longer than the picture. A later production adapter must preserve the complete audio and hold the last source picture through any tail; it must not truncate to 176.76 s or copy another recording's priming compensation. This study has not independently measured decoded PCM count.

## Inspection method and limits

- Inspected the lossless source reference decoded at **1 s** at native 1080×1080 resolution.
- Inspected **35 approximate five-second overview thumbnails** across the complete recording. The filter's sampling/rounding makes these overview discovery frames rather than a frame-exact source edit list.
- Inspected exact decoded source frames **0, 1125, 2250, 3375 and 4418**, corresponding to **0, 45, 90, 135 and 176.72 s**.
- Analyzed every one of the **4,419 decoded frames**, reduced to 160×160, with FFmpeg `signalstats`. Reduced-image YAVG ranges **111.302–111.310**, with median **111.306**. Successive YDIF has median **0**, maximum **0.218672**, and is nonzero on **491 frames**. These limited-luma observations describe the decoded image and compression drift, not physical camera motion or emotional intensity.
- Examined the source subject, cutout windows, backdrop, top margin, source lettering and floor at native size. The contact sheets and image measurements do not constitute listening or composed-preview checks.

The sampled composition is unchanged throughout: this is **still artwork**, rather than a film of a moving puppet performance. Small encoded pixel differences are not grounds to claim original character, bird, curtain or star animation. An advancing native picture PTS remains a useful transport check, while the deliberately authored musical response must provide obvious visible motion in the complete preview. Do not conceal the source artwork behind a black diagnostic view.

## What the artwork contains

The photograph shows a small shadow theatre. Pale muslin stretched between dark curtains carries black paper stars, a paper bird and house silhouettes. A seated central silhouette faces right and raises a hand toward the bird. The lower composition is dark wooden stage/floor. Fine grain, scuffs and a slender vertical scratch near the right edge are existing photographic texture. The modest source title **светлое чувство** appears around x456–624, y858–872 and should remain unobscured.

| Existing image region | Approximate native geometry | Implication |
| --- | --- | --- |
| Pale upper margin above the curtain line | y0–145, central width about x80–1000 | Two short equally sized reading rows can fit without covering the puppet scene; the curtain line limits available height |
| Central silhouette, face and raised hand | x380–700, y405–850 | Protect the human profile, fingertips and paper bird; no reading block or reactive mask should cover these landmarks |
| Left paired houses | x115–350, y527–845 | Six stable lit openings support material-owned audio response |
| Right cottage | x694–882, y559–835 | Four smaller lit openings support a second stable part of the same measured visualizer |
| Dark floor below the source title | y890–1080 | A possible alternate reading surface, but its approximately190px height cannot fit unrestricted bilingual four-row wrapping at large type |
| Existing stars, bird and curtains | Upper muslin and both sides | Their silhouettes are expressive already; adding sway, flashing stars or new particles would change the artwork's material story |

Window centres below are **manual visual estimates for initial mask construction**, not tracked vertices or accepted masks:

| Host | Approximate centre points in source pixels |
| --- | --- |
| Left house, left column | (167,607), (174,695), (180,789) |
| Left house, right column | (293,596), (300,694), (305,792) |
| Right cottage, upper pair | (758,695), (822,690) |
| Right cottage, lower pair | (752,780), (813,775) |

The right windows contain actual dark mullions. The upper-right opening of the left house is round; the other cutouts are not perfectly rectangular. A simple collection of bright rectangles would overwrite these features. Fit masks to the existing openings, feather inward and preserve the original bright-pixel texture and dark divisions. Every source-edge feature, including the right scratch, belongs to the acquired square composition.

## Picture-derived palette observations

Mean RGB values from selected boxes in the 1-second reference, intended as descriptive samples rather than colour-management calibration:

| Box / material | Mean RGB |
| --- | --- |
| Upper pale cloth, x250–830 / y15–130 | 212 / 219 / 212 |
| Backlit muslin, x560–770 / y270–390 | 166 / 150 / 128 |
| Dark floor, x710–1000 / y900–1040 | 51 / 45 / 42 |
| Left bright window, x147–183 / y580–626 | 190 / 177 / 154 |
| Central charcoal silhouette, x428–470 / y502–640 | 33 / 32 / 34 |

The source has cool off-white above and warm worn sepia within the theatre. The colour relationship supports charcoal ink, parchment, muted russet and candle light. It does not support inheriting another film's silver/mint palette, hard EDM neon, global hue cycling or a separate celestial background.

## Composition finding

The fixed photographed houses offer reliable environmental hosts because the source is static. A window-owned spectrum is therefore more plausible here than a detached bar rail or a falsely tracked sign. The entire source square should remain sharp and uncropped in the native composition. A deliberate portrait composition should retain both houses, the complete subject and paper bird; a blind centre crop would lose the left houses and undermine the visualizer.

These findings inform [the integration recommendations](visual-integration-recommendations.md). The masks, text fit, emitted brightness, real-time paint cost and actual phone-size focus remain composed-preview acceptance checks. Source inspection alone does not establish that the proposed treatment works.

## Repository method references

[Cinematic reading](../../../docs/cinematic-lyric-workflow.md) · [Scene integration](../../../docs/scene-integrated-visuals.md) · [Source-clocked effects](../../../docs/source-clocked-word-effects-workflow.md) · [Equal bilingual meaning focus](../../../docs/bilingual-lyric-workflow.md) · [Connected vocal edges](../../../docs/connected-phoneme-onset-workflow.md) · [Preview before render](../../../docs/preview-before-render.md).

The [material-response lessons](../../po-kamushku-lyric-film/PRODUCTION-LESSONS.md), [connected-onset and line-lifetime lessons](../../komety-lyric-film/PRODUCTION-LESSONS.md) and [simultaneous-language / final-byte lessons](../../prizrak-lyric-film/PRODUCTION-LESSONS.md) contribute method. Their source artwork, pigments, numerical geometry and acoustic intervals are not style presets for this recording.
