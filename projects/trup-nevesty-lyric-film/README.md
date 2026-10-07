# Труп невесты — complete bilingual preview

**Green Apelsin · Russian / English · 16:9 and 9:16 · preview only**

![Complete original illustration with equal Russian and English word focus](evidence/preview-landscape-95.200.png)

*Shared-scene native preview still at 01:35.200. Original picture and soundtrack: [Green Apelsin’s recording](https://www.youtube.com/watch?v=1CT57xZoYVg). [Still provenance](evidence/preview-stills.json). This is neither a production MP4 frame nor listening evidence.*

The original square illustration remains complete. Six measured musical responses animate its actual guitar strings, clipped behind the bridal hand. Existing veil beads shimmer slowly and the wedding ring receives a small, localized glint. Equal bilingual text sits on the artwork’s dark upper cloth; slate and dusty rose extensions preserve the entire illustration in landscape and portrait.

Twenty-eight performed lines contain 184 Russian word events and 258 English tokens. Each Russian entrance and release was selected separately against original/vocal acoustic panels and complementary model-family observations. English follows complete corresponding meanings on the same events. Refrains retain their changing heart, death and place wording. The final sung **нету** differs from the supplied **нет**; the evidence and its limitations remain explicit.

## Open the full preview

Prepared local preview: <http://127.0.0.1:4335/>. Play starts the unchanged original soundtrack. Controls include both formats, reduced speed, exact-second seeks, all 28 cues, animation A/B, original-picture comparison and complete-preview recovery.

From this project directory, with the matching original file in `public/source.mp4`:

```sh
npm ci
npm run check
npm run identity
npm run preview
```

`PORT` selects another loopback port. Node 22.18+ with native TypeScript stripping is needed; development used Node 24. FFmpeg and FFprobe rebuild analysis and reference assets. The locked source is in [recording.json](source/recording.json): YouTube rendition `137+140`, H.264/AAC, 1080×1080 at 25 fps, original 44.1 kHz stereo. A later download must match the SHA-256 or begin a new source/timing revision; similar duration is insufficient.

The MP4, extractor metadata, stems, model caches, diagnostic audio and compiled client stay local and ignored. Public source includes selected samples, sanitized observations with hashes, translations, material anchors, features, font and proof stills. It recreates the selected preview with the matching original; raw analysis is needed to investigate or revise acoustic evidence. No full media release is recorded.

## Review status

Type checking, nine source/semantic/layout/material/review-gate tests, 34 complete-scene stills and eight A/B stills pass. Both formats were checked in the real browser for original-picture availability, fractional word time, advancing native picture PTS, paused seeks, normal/reduced-speed transport, source comparison, the last picture through the AAC tail and recovery. This establishes preview behavior, not perceptual synchronization certification.

**Full normal-speed listening, uncertain words/held endings at reduced speed, both-language review in both formats and current-revision render approval remain pending.** [REVIEW.json](source/REVIEW.json) records that honestly. `npm run render:gate` currently exits 1. No production encoder exists in this preview project.

[Production decisions](PRODUCTION-NOTES.md) · [Timing method and priorities](TIMING-METHOD.md) · [Agent handoff](AGENT-HANDOFF.md) · [Shared preview-first workflow](../../docs/preview-before-render.md)
