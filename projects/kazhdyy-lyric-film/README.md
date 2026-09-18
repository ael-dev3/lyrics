# каждый, кто делал тебе больно

**забей, лерочка · Russian + English · verified full-recording v6 films · three-color animated treatment**

![Final bilingual frame with vermilion word focus and original source illustration](../../assets/kazhdyy-72-2.png)

*Decoded final landscape frame at 01:12.200. Music and source illustration from the original забей, лерочка / Spooky music upload. The illustrator is not identified in the verified source metadata.*

Ink, ivory and vermilion carry the original kitchen illustration and a measured 64-band spectrum. The approved v6 film keeps the artwork geometry still and adds fine static that shifts briefly inside its deepest shadows at detected vocal changes. The source eyes, bright paper and lyric areas are excluded. The visualizer is normal outside the designated windows, medium at 1:10–1:28 and 2:38–2:55, and strongest only at 2:55–3:10. Centered vocal energy shapes response inside those emphasis windows. Equal Russian and English text keeps fixed geometry and uses color-only focus. The presentation applies the Lyrics workflow in general.

## Delivery status

The complete approximately 3:33 recording is playable in 1920×1080 and 1080×1920 layouts. Thirty-two cues cover 220 Russian lexical words, one nonlexical event and 306 English tokens including punctuation. Both languages follow shared source meaning intervals; no separate English acoustic times are fabricated.

**Both full v6 films are rendered and verified:** 1920×1080 and 1080×1920, 60 fps, 12,798 frames / 213.300 seconds each, HEVC Main 10, CRF 17 and original AAC. Current preview acceptance and explicit render authorization preceded capture. Every final video timestamp, original audio packet and decoded PCM identity passed; 280,986 visible word-state checks found zero focus mismatches or ambiguous words.

[Final verification](evidence/final-verification.md) · [Delivery receipt](evidence/delivery-receipt.json) · [Checksums](evidence/delivery-checksums.sha256) · [Upload assets and covers](publishing/README.md) · [Production lessons](PRODUCTION-LESSONS.md)

Acoustic timings remain model-assisted. Overall owner acceptance of the unchanged v6 preview is separate from incomplete granular listening telemetry. The scoped authorization and its limits are recorded in the [synchronization review](evidence/sync-review.md); the default [preview-first workflow](../../docs/preview-before-render.md) and [cross-language gate](../../docs/cross-language-sync-gate.md) remain in force for future work.

[Detailed three-pass review](evidence/sync-review.md) · [Picture timing and purpose](evidence/motion-review.md) · [Workflow study and lessons](evidence/workflow-study.md) · [Technical checks](evidence/technical-checks.json) · [Source and audio identity](source/input-manifest.json) · [Original upload](https://www.youtube.com/watch?v=3yDdoi1c7-8)

## Run locally

Use Node.js 24 or later. Install pinned dependencies with `npm ci`. The original media is excluded from GitHub: place the unchanged source upload in `public/review-source.mp4`, stream-copy its audio to `public/soundtrack.m4a`, and extract the original illustration at 15 seconds to `public/artwork.png`. Compare hashes with `source/input-manifest.json`; a different acquisition invalidates the frozen review identity.

```sh
npm run check
npm run review:build
npm run preview
```

Open `http://127.0.0.1:4319/`. Playback uses the original recording, including intro, interlude and tail. Select 16:9 or 9:16; use Timing review for per-word inspection and 0.75× / 0.5× playback. Saved local proposals are revision-bound and do not approve rendering. `Start Preview.command` launches the already-built local preview without reinstalling packages.

The unchanged stream-copied AAC plays in an audio element whose clock drives the picture. Artwork and filters stay mounted throughout playback; only changing attributes and cue text are updated. The hidden inspector does no spectrogram drawing until opened. Browser frame cadence and device latency remain distinct from the composition's 60 fps timeline.

## Reproduce analysis and checks

The committed cues and measured JSON allow preview reconstruction without rerunning models. Regenerating alignments additionally requires the locked source audio decoded to the PCM paths used in `scripts/infer.ts` / `scripts/align.ts`, compatible pretrained-model dependencies and `ALIGN_PYTHON` pointing to that environment. Python is used only as a bridge to those libraries; authored pipeline, timing, display and QA logic is TypeScript.

The deterministic refinement chain is `prepare-text.ts`, `build-cues.ts`, `refine-releases.ts`, then `layout.ts`. `refine-releases.ts` always starts from `analysis/core-cues.json`, so releases and the nonlexical cue cannot accumulate on reruns. `analysis/boundary-ledger.json` retains independent candidates; `evidence/semantic-ledger.json` records every full translated span. After an intentional revision, update evidence and freeze the reviewed inputs with `npm run preview:freeze` before rebuilding the browser bundle. This invalidates earlier review notes when hashes change.

Visualizer response is separate from lyric alignment. Decode the existing stereo vocal stem to 44.1 kHz Float32 `analysis/vocals44.f32`, then run `node scripts/vocal-features.ts`. The [vocal-energy manifest](analysis/vocal-energy-manifest.json) records the source identity, 32.018 ms centered RMS window, calibration and bounded display formula. Full-mix spectral measurements are unchanged. Regenerating a model stem can change the input identity.

`npm run geometry:build` prepares the browser audit at `/review/geometry.html`. `npm run stills` produces only selected diagnostic PNGs through one-frame Remotion compositions. `npm run render` and `npm run sync:gate` refuse incomplete or stale review and missing approval. The production adapter captures the same scene at 2×, downsamples once and encodes verified segments. Build its verified artwork inventory with `node scripts/render-artwork-cache.ts landscape` and `node scripts/render-artwork-cache.ts portrait` first. It rasterizes each deterministic shadow state once and reuses identical panel pixels; the direct-versus-cached diagnostic is pixel-identical in both layouts. The current v6 authorization is recorded; another revision or changed inputs invalidate it.

After rendering, run the following for each format, then build the posting kit:

```sh
node scripts/assemble-delivery.ts landscape
node scripts/verify-production.ts output/Kazhdyy-landscape-1920x1080-60fps.mp4 landscape
node scripts/audit-decoded-focus.ts output/Kazhdyy-landscape-1920x1080-60fps.mp4 landscape
node scripts/extract-delivery-proofs.ts landscape
node scripts/package-posting-kit.ts
```

Repeat assembly and the three verification commands for `portrait` and its `1080x1920` filename before packaging. The kit script requires both complete technical and decoded-focus reports to match the final video hashes.

Shadow changes are reproduced with `node scripts/shadow-features.ts`, using the existing vocal spectrogram and energy map. The [shadow manifest](analysis/shadow-manifest.json) records event selection, source hashes and limitations. These acoustic changes do not identify speakers or supply word timing.

## Palette and motion

| Role | Value |
| --- | --- |
| Ink | `#101116` |
| Ivory | `#F2E9D8` |
| Vermilion | `#FF6454` |
| Lyric typography, both languages | Oswald Medium, 78 px landscape / 82 px portrait |
| Focus | Stable geometry, source-linked color changes, exclusive ends |
| Spectrum | 64 measured bands; artistic display `clamp((dB + 64) / 55)^1.35` |
| Bar heights | Normal: 3–39 px; medium: up to 111 px; strongest: up to 297 px |
| Picture response | Fixed transform throughout all 12,798 frames in both formats |

Three base colors describe the authored palette; antialiasing, opacity and gradients create intermediate raster values. The source is a static illustration. The spectrum and shadow-grain changes are authored motion driven by separate measurements; the illustration geometry remains still. Font licenses are included. Artist recording, lyrics and illustration rights are excluded from the repository contribution license. Full media and listening notes stay local.
