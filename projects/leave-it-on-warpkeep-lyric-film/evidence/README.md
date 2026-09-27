# Preview revision 02 — visual and interaction record

Current scene: `preview-v2-pr375`, inspected on 2026-09-27 in the local in-app browser. This section records sampled browser and technical evidence; decoded final-film samples are identified separately below. Neither is a full listening review.

## Representative retained browser stills

| File | Source time | Composition | Observed content |
| --- | ---: | --- | --- |
| `preview-landscape-119.600.png` | 119.600 s | 1920 × 1080 | Core phrase, castle/guardian, measured ring and forecourt spectrum, neon magic, mountain sign and address |
| `preview-portrait-105.000.png` | 105.000 s | 1080 × 1920 | Long three-line Warpkeep/Hyperion phrase, complete guardian and mountain sign |

These are captures of the actual live Three.js composition and title canvas. The player temporarily renders at the format's target dimensions, saves a still, and restores the review size. Additional committed browser stills sample 67, 85.5, 136, 205 and 266 s in the two layouts; transient local captures under `output/` are excluded from the source archive.

## Completed technical and sampled checks

- 63 cues × onset/midpoint/end × two formats = **378 glyph-bounds samples; zero failures** after the final camera correction. Actual bundled-font glyph metrics include dark stroke padding; the audit checks texture clipping and projected bounds. Horizontal extrema were −0.86275 and +0.78210 in normalized device coordinates, inside the ±0.91 horizontal check. Vertical check is −0.80 to +0.85. This does not certify third-party app chrome or every intervening frame.
- Long phrases reserve all line geometry before focus changes. L27 automatically fits to three lines; focus remains color-only.
- Actual visible source-time camera/guardian, moving spectrum and environmental response observed during normal-speed wide playback from the first chorus into the following verse; portrait playback was observed around 136–156 s after recovery. The rendered picture changed along with the soundtrack clock.
- Both aspect controls were exercised; the source position remained on the same audio element. Seek navigation and fresh loads reconstructed the intended picture.
- Restore at 136.000 s retained the paused source position and one explicitly technical test note; the picture reappeared and playback resumed on request. The note also survived a subsequent page load. Separate regressions exercise repeated restore, initial loading, failure/retry and resuming playback only after scene readiness.
- Reduced-motion and environmental-response toggles changed state correctly; normal settings were restored.
- A click on the physical mountain sign opened `https://farcaster.xyz/~/channel/warpkeep`; the destination identified itself as the Warpkeep Channel on Farcaster. No social action was taken.
- Portrait playback reached the original WebM media end: `currentTime = duration = 273.568`, `ended = true`, `paused = true`; the visible scene remained present. The ending retains the lit keep and landscape; the same final source time was also inspected in wide format.
- `npm run check`: **20/20 tests pass**, including actual GLB pose reconstruction, source data contracts and negative production-gate cases.
- The local server was restarted with `npm run preview:start`; it returned a ready matching page and remained available after the launcher exited.

## Decoded final-film samples

The following stills are extracted from the final H.264 posting MP4s, after their full-file decode and metadata checks passed. They are distinct from the browser-preview captures above. The wide set is 1920 × 1080; the portrait set is 1080 × 1920.

| File | Source time | Observation |
| --- | ---: | --- |
| `final-landscape-119.600.png` | 119.600 s | Readable highlighted phrase, native castle/guardian/rune field, forecourt spectrum and mountain channel sign |
| `final-landscape-268.200.png` | 268.200 s | Final lyric phrase remains legible with its active word lit |
| `final-landscape-273.550.png` | 273.550 s | Last decoded frame retains the lit world and sign with no stale lyric or black frame |
| `final-portrait-105.000.png` | 105.000 s | Three-line lyric focus fits the portrait world view with the guardian, ring and mountain sign visible |
| `final-portrait-268.200.png` | 268.200 s | Final lyric phrase remains legible in 9:16 with its active word lit |
| `final-portrait-273.550.png` | 273.550 s | Last decoded portrait frame retains the lit world and clears the lyric |

The [production record](../PRODUCTION-NOTES.md) and [sanitized final verification data](final-verification.json) give both files' frame/audio checks and source-to-AAC sample comparisons. Ten encoded-frame samples were inspected in each format; selected frames establish visual condition only at their listed times.

The [publication receipt](release-upload-verification.json) separately verifies every published release asset against its Desktop copy and a fresh download. It does not expand the sampled visual or acoustic review above.

## Remaining synchronization audit

Complete independent actual-audio review of all 343 candidate words, repeated performances, disputed processed vocals/echoes and every onset/release remains open. A geometric pass, sampled motion check or input freeze does not close those items. The owner separately accepted this exact complete preview and authorized both renders, Desktop delivery and the lyrics-repository release. Both-format renderer parity and a short encoded proof were approved before full capture; the standard granular synchronization gate remains closed.
