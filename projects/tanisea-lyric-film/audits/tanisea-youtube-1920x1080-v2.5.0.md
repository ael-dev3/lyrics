# Native 16:9 delivery audit — v2.5.0

Status: **passed**

This report covers the regular-YouTube `1920×1080`, 60 fps delivery. The
public square master remains separate and unchanged.

| Field | Value |
| --- | --- |
| Render source commit | `2c2d2a23f0b5687918c9d48580459be23cdc05bd` |
| Verification workflow commit | `2e7a3592d2afb0426ee703353f89ac440c12663b` |
| Composition | `LyricFilmYouTube` |
| Duration | 153 seconds |
| Cadence | 60 fps, 9,180 frames |
| Geometry | 1920×1080, implicit square pixels / 16:9 display geometry |
| Video matrix/range | BT.709 / limited range |

## Verified artifacts

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `output/Tanisea-Lyric-Film-YouTube-1920x1080-Reference.mov` | 12,769,610,053 | `315cf66102ca4b85dfea9c87a6aa0379808a925e7f2827412f6cdd17e2d5931b` |
| `output/Tanisea-Lyric-Film-YouTube-1920x1080-Final.mp4` | 48,355,793 | `ec93e9d5578881de045e2e8fb1038caa862bfc32192d95fd7fa805f090697c4e` |

The audit performs a counted frame scan, verifies codecs/container tags,
geometry, cadence, duration, colour matrix/range, and performs a strict full
decode of both artifacts. The optional `LyricFilmYouTubeSyncProof` was not
rendered for this delivery; its reproducible diagnostic workflow remains in
the project source and can be run with `npm run youtube:proof` followed by
`npm run youtube:verify`.

The machine-readable companion is
`audits/tanisea-youtube-1920x1080-v2.5.0.json`.
