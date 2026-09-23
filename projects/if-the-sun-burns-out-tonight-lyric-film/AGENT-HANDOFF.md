# If The Sun Burns Out Tonight — agent handoff

## Start here

1. Read repository [AGENTS.md](../../AGENTS.md), the [preview-first rule](../../docs/preview-before-render.md), [production preferences](../../docs/track-workflow-preferences-and-known-issues.md) and the [source-clocked effects guide](../../docs/source-clocked-word-effects-workflow.md).
2. Read the [project overview](README.md), [exact effect contract](PRODUCTION-LESSONS.md#5-exact-word-effect-contract), [production commands](WORKFLOW.md), [timing audit](evidence/timing-audit-v6.md) and current review/authorization records. Do not confuse historical audit status with a newer review.
3. Confirm the locked original media is present and matches `source/media-manifest.json`. Git alone may not include the rights-sensitive video. Restore it from an authorized verified recovery/delivery source; another encode with the same song title is not an interchangeable timing input.
4. Run the existing preview and checks below. Inspect the actual browser picture and sound before changing code.

From the repository root:

```sh
cd projects/if-the-sun-burns-out-tonight-lyric-film
npm run check
npm run preview
```

Open <http://127.0.0.1:4325/>. Node.js runs the dependency-free preview modules; `ffprobe` must be available for the source checks. Native production additionally needs the locked canvas package and approved font face; follow [WORKFLOW.md](WORKFLOW.md). The preview command remains running in its terminal. The server binds only to loopback and supports media range requests; use `PORT=4326 npm run preview` only when the default port is occupied by unrelated work. Do not start duplicate servers on one port.

Useful complete-preview links:

- [Beginning / Original](http://127.0.0.1:4325/?t=0&format=landscape)
- [Quiet fire](http://127.0.0.1:4325/?t=32.5&format=landscape)
- [Light](http://127.0.0.1:4325/?t=44.15&format=landscape)
- [Short phrase-specific sunlight](http://127.0.0.1:4325/?t=102.9&format=portrait&speed=0.5)
- [Strong fire / portrait clearance](http://127.0.0.1:4325/?t=201&format=portrait)
- [Processed closing hooks](http://127.0.0.1:4325/?t=209.2&format=landscape&speed=0.75)

The page starts paused, offers Start, line selection, seeking, 1×/0.75×/0.5×, Original/9:16, sound and Sunfire controls, and Restore picture. `fire=off` is an A/B diagnostic for fire only. It does not mean all word effects are disabled. These URLs keep the entire recording available.

## Current contract

| Item | Value |
| --- | --- |
| Source | Official VALORANT video `x8jAY2CoOBg`, Grabbitz / Oli Sykes / Courtney LaPlante |
| Locked media SHA-256 | `d4f742d4197dbd30b07e2e5dbd0f648a5aec6e310162865c28f65f19a65ff5b5` |
| Duration | 234.266122 s audio; preserve complete source picture and ending |
| Source picture | 1920×818, 24 fps, 5,621 frames |
| Delivery compositions | Full source aspect 1920×818; separately composed portrait 1080×1920 |
| Lyric scope | English only, 44 lines / 254 individual word events |
| Timing revision | `preview-v6-audio-evidence`; selected samples/uncertainty preserved |
| Timeline SHA-256 | `b71c6ea2e7c39a56843cd51be74bae10c1dcf095f81025b9c7af8ffd7f9ccba4` |
| Visual direction | `word-atmosphere-v5`: gold depth spectrum plus exact word/phrase effects |
| Review status | Current preview accepted with an explicit production request; record the scope and current input hashes separately from earlier v6 targeted-review evidence |
| Delivery status | Both films and the 13-file Desktop kit verified; see [delivery receipt](evidence/delivery-receipt.json) and [final verification](evidence/final-verification.md) |

## Files and responsibilities

| File | Responsibility |
| --- | --- |
| `source/media-manifest.json` | Source identity, dimensions, rates and duration |
| `source/lyrics-supplied.txt` | Original supplied lyric reference, retained separately from timing decisions |
| `src/timeline.json` | Sections, lines, stable word IDs, selected seconds and 44.1 kHz sample indices |
| `evidence/alignment-v6.json` | Candidates, failures, uncertainty, prior values and chosen rationale |
| `src/preview-core.js` | Neutral line lead/tail, exclusive word focus, feature interpolation, guarded frame callbacks and settled pause refresh |
| `src/player.js` | Native media transport, full picture/canvas fallback, measured anchors, effect composition and layout changes |
| `review/index.html` | Full preview, source aspect, portrait fill, typography, fixed layers and controls |
| `src/spectrum-view.js` | Artistic depth display of the stored measurements |
| `src/fire-dynamics.js`, `public/fire-dynamics.json` | Validated source-time vocal drive, burn rate and integrated phase |
| `src/sunfire.js` | Bounded per-glyph solar fire and deterministic embers |
| `src/sunbeam.js` | Exact light/phrase selector, short-word envelope, feathered shafts |
| `src/frost.js`, `src/darkness.js`, `src/damage.js` | Stateless local word effects; Supernova and combined void are composed in player/CSS |
| `public/audio-features.json`, `public/audio-features.bin` | Source identity, measurement settings and 64-band 60 Hz values |
| `scripts/check-preview.mjs`, `scripts/*test.mjs` | Source/timeline checks and focused logic regressions; not a listening certificate |
| `scripts/render-gate.mjs`, `evidence/render-authorization.json`, `evidence/production-adoption.json` | Complete preview approval, exact input hashes and a separately proven native adapter |
| `scripts/production-scene.mjs`, `src/production-layout.json` | Shared effect functions composed with frozen browser word boxes and an explicitly selected native font face |
| `scripts/render-production.mjs` | Gated still/short diagnostic/full render modes; streams transparent overlays to FFmpeg over the full source picture |
| `evidence/*` | Revision-scoped technical and acoustic observations; inspect each scope before citing |

## Rebuild measurements only when needed

Normal preview work uses the committed measurements. Regeneration needs Python with NumPy, `ffmpeg`, `ffprobe` and the exact locked media:

```sh
python3 scripts/analyze-audio.py
python3 scripts/analyze-fire.py --vocals /path/to/time-matched-vocals.wav
npm run check
```

Replace the example stem path with an authorized local analysis input. The fire generator requires a 44.1 kHz zero-offset vocal stem with the original declared sample count, and validates a sibling `mix44.wav` against the locked decoded mix when available. The existing stem was estimated with HTDemucs, `shifts=0`; an equivalent label does not guarantee the same bytes. Regeneration updates data and audit identities and therefore requires affected review. Do not silently fall back to unrelated vocals, extrapolated timing or synthetic spectrum values.

## Fast review route

- Play a known nonblack section after a fresh load; seek forward/backward, pause/resume, switch formats and restore. Observe actual moving pixels, speed and position. Check the intro and closing card.
- Inspect every cue in both formats, with fixed glyph boxes and readable active/rest words at mobile size. Treat Original as 1920:818, never assumed 16:9.
- Check all targets in the [effect table](PRODUCTION-LESSONS.md#5-exact-word-effect-contract), including repeated occurrences, the short 200 ms “you”, first short “hurts”, wrapped fire and combined “void”. Compare onset, interior, exclusive end and the following gap. Check unrelated “you” stays unaffected.
- Listen to the full recording and uncertain/fast/held events at reduced speed. A current explicit reviewer attestation can establish its stated scope; do not invent per-cue telemetry or request the same authorization again when it already covers the work.
- Before rendering, verify that current approval, synchronization review and every required input hash agree. Tests and visual polish do not grant render permission. Material changes need affected review; preserve accepted timing unless a concrete defect warrants correction.

## Production continuation

Use the current package and [production entry points](WORKFLOW.md) added for this edition; do not borrow an older song's command without adapting its source shape, clock and gates. Preview preparation, production rendering and verification are distinct operations. The final renderer must reproduce the approved CSS/text/effect composition, source aspect and whole soundtrack. Freeze its resolved font and environment, compare same-time proofs in both formats, then inspect short encoded diagnostics before the full films. Current diagnostic MP4s are visual-only; their missing soundtrack cannot certify audio/video mux synchronization.

After rendering, verify actual decoded output: stream metadata, frame cadence/count, full decode, unchanged source audio, every-word focus including empty gaps, source-picture continuity, all effect classes and the clean ending. Extract README stills from the identified verified film and label their timestamp. Build the Desktop kit only from verified files, include two videos, separate platform thumbnails, YouTube title/description, TikTok description and checksums, then verify copied hashes. Use the established portrait **1200×1600** TikTok profile-cover size.

Finish authorized source/documentation work by reviewing, checking and merging the pull request, then verify the default branch and remaining open requests. Publishing rights-sensitive binary media or posting to platforms is a separate authorization. Preserve recovery coverage before later storage cleanup; leave protected Desktop kits untouched.
