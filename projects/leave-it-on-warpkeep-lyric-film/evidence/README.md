# Preview revision 02 — visual and interaction record

Current scene: `preview-v2-pr375`, inspected on 2026-09-27 in the local in-app browser. This is sampled browser and technical evidence, not a full listening review or production encode.

## Retained current stills

| File | Source time | Composition | Observed content |
| --- | ---: | --- | --- |
| `preview-landscape-119.600.png` | 119.600 s | 1920 × 1080 | Core phrase, castle/guardian, measured ring and forecourt spectrum, neon magic, mountain sign and address |
| `preview-portrait-105.000.png` | 105.000 s | 1080 × 1920 | Long three-line Warpkeep/Hyperion phrase, complete guardian and mountain sign |

These are captures of the actual live Three.js composition and title canvas. The player temporarily renders at the format's target dimensions, saves a still, and restores the review size. Other local review captures are intermediate and excluded from source handoff.

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

## Pending

Complete actual-audio review of all 343 candidate words, independent repeated performances, disputed processed vocals/echoes, every onset/release and creative acceptance of both full compositions remain pending. A geometric pass, sampled motion check or input freeze does not close those items. Full production authorization and renderer/encoded-proof verification remain separate and closed.
