# Прости за любовь — v1.2 delivery record

**Артем Пора Домой & Jahmal TGK · Russian + English · YouTube and TikTok**

| Status | Meaning |
| --- | --- |
| Delivery: **accepted with known highlighting gaps** | Accepted on 15 September 2026; the existing song is sufficient for use and is preserved as delivered. |
| Cross-language sync: **known gaps remain** | Some English meaning spans are only partly highlighted. This edition does not satisfy the next-song synchronization baseline. |
| Publication: **documentation only in this update** | Videos and archives were delivered locally. This record does not create a GitHub binary release or upload to a video platform. |
| Next action: **improve the next song before rendering** | Complete the [mandatory cross-language sync gate](../../docs/cross-language-sync-gate.md); no additional render of this edition is requested. |

[Known issues and resolution criteria](KNOWN-ISSUES.md) · [Structured project status](status.json) · [Technical delivery evidence](evidence/delivery-verification.json)

## What this edition contains

Full-song landscape 1920×1080 and portrait 1080×1920 films at 60 fps, Russian and English lyrics with equal typography, stable color-only highlights, night-tram artwork and a measured 64-band spectrum. There is no pronunciation layer. The local handoff includes both films, covers, publishing copy, captions, documentation and editable/publishing archives.

Version 1.2 removes the unsupported object after “loved” and restores individual **that / I / loved** correspondences. Its reviewed map preserves all 190 Russian words and their existing sample timings. The complete source-word review improved precision, but the rule that left all unmatched English grammar neutral was too restrictive: it missed complete English spans in the [reported examples](KNOWN-ISSUES.md).

## Evidence and its limits

Both exports passed full decoding, all 12,693 frame timestamps and exact preservation of all 9,917 locked AAC packets. Each video lasts 211.55 seconds; the source signal is 211.5335 seconds. The existing recording and timing were preserved.

The [historical translation check](evidence/translation-checks.json) passed 3,020,934 frame-to-map comparisons, but those tests only establish consistency with the selected mapping. They do not prove that the mapping highlights enough English. Its counts of 52 unhighlighted grammar units and three multi-source expressions are **not future quality targets**. The subsequent accepted-with-issues status takes precedence over any suggestion that these passing checks certify perfect synchronization.

The acoustic review was model-assisted; no human listening review or author-certified interpretation of the ambiguous chorus grammar is claimed. Future productions require the complete audiovisual and actual-audio review described in the new gate before production rendering.

## Exact accepted files

| Local delivery filename | SHA-256 |
| --- | --- |
| `Prosti-YouTube-1920x1080-60fps.mp4` | `aaba91e18a8f90663c476c12f9a7b11cbc2a403fdddb8707c71043c38be612f4` |
| `Prosti-TikTok-1080x1920-60fps.mp4` | `d23de97d57b0eb6fa27bf56bbf3ceacf38a7a83f511e8141a675d01bebb3d39b` |
| `Prosti-Editable-Project.zip` | `5cf5aaa06026439d5973ec17aa0bef3b9c70b42c69ea9c586a65436c9c269c90` |

These identify the accepted v1.2 artifacts. Their archived reports retain their original scope; this follow-up does not rewrite binaries or silently change historical evidence. The previous v1.1 delivery was preserved separately during the local update.

## Source and documentation scope

[Original release](https://www.youtube.com/watch?v=wfFhw_eu1BI), provided through ONErpm; ℗ А+/ФОРМАНТА/Monolit. Music and original lyrics remain the work of their creators. Translation, generated artwork and added lyric presentation belong to this fan-made edition and do not imply endorsement.

This directory records status, known issues and selected technical evidence. The full editable project remains in the delivered archive; this is not a standalone source checkout. Feedback is documented in text with cue references. Private screenshots, conversation content and personal local paths are excluded.
