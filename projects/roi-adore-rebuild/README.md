# Roi × Adore — accepted 1080p60 rebuild

This is the production source and evidence snapshot for the light-blue rebuild completed on 9 September 2026. The earlier `../roi-slowdown-lyric-film` project and `roi-slowdown-v1.0.1` release remain historical baselines.

![Final encoded frame at 02:05.800](../../assets/roi-adore-rebuild-125-8.png)

Read the [complete production record](../../docs/roi-adore-rebuild.md) for the creative decisions, synchronization process, calibration, rendering corrections, QA, delivery identity, and limitations.

## What is preserved

| Location | Contents |
| --- | --- |
| `src/Film.tsx` | Final blue/light composition, semantic focus, lyric lanes, animation treatment, spectrum and motion |
| `src/cues.json` | Render-authoritative 71 cues, timed highlight units and French translation segments |
| `src/LayoutAudit.tsx` | Browser geometry checks for all cues and focus states |
| `scripts/reconcile.ts`, `translate.ts`, `warp.ts` | Word-boundary reconciliation, translation mapping, repeated-performance comparison |
| `scripts/dsp.ts`, `analyze.ts` | Stereo filter bank and measured feature generation |
| `scripts/dsp-test.ts`, `independent-calibration.ts` | Analytical and independent numerical calibration |
| `scripts/motion.ts` | Separate expressive controls and transient events |
| `scripts/render-cached.ts`, `encode-cached.ts` | Final cached-scrim, lossless-frame, single-downsample production path |
| `scripts/verify-delivery.ts` | Actual final-file verification with audio-derived endpoint handling |
| `analysis/` | Raw Float32 band measurements, coefficients, hashes, calibration, events and onset audit |
| `evidence/` | Reconciliation, semantic mapping, layout log, cached-layer comparison, timing checks and delivery verification |

## Reproduction scope

This is an **archival production snapshot**, not a new one-command build package. The scripts retain their original session-relative input/output layout. Absolute session paths have been replaced by `<SESSION_ROOT>` and `<DELIVERY_DIRECTORY>`; restore appropriate paths before execution. Earlier exploratory scripts are retained for provenance; `render-cached.ts` → `encode-cached.ts` → `verify-delivery.ts` is the final path. The older `finish-cached.ts` expected all 22,763 rendered frames and was superseded by the audio-duration-aware verifier after the one-frame endpoint trim was understood.

The production environment used Node.js 24.20.0, Remotion 4.0.518, React 19.2.8, TypeScript 7.0.2, FFmpeg/FFprobe, and Remotion Chromium. Demucs and stable-whisper/Whisper supplied library-based vocal separation and alignment observations; authored reconciliation, visual rendering and DSP used TypeScript.

The [complete production archive](https://github.com/ael-dev3/lyrics/releases/download/roi-adore-rebuild-v1.0.0/Roi-x-Adore-Complete-Production.zip) now supplies the locked animation and AAC soundtrack, fonts, poster, generated features, alignment observations, analysis PCM, vocal stems, original reference audio and a dependency lock. It retains the `work/film` relative layout and supplies corrected npm commands in its README; the original session package is retained separately. Packaged typechecking and timing checks passed. `analysis/manifest.json` records soundtrack and PCM hashes, filter coefficients and clocks. Installed dependencies, downloadable models and regenerable frame caches are excluded.

The [final film](https://github.com/ael-dev3/lyrics/releases/download/roi-adore-rebuild-v1.0.0/Roi-x-Adore-Lyric-Film-Rebuilt-1080p60.mp4), [untouched source video](https://github.com/ael-dev3/lyrics/releases/download/roi-adore-rebuild-v1.0.0/roi-x-did-i-tell-u-that-i-miss-u-source.mkv), and [checksums](https://github.com/ael-dev3/lyrics/releases/download/roi-adore-rebuild-v1.0.0/CHECKSUMS.sha256) are separate release assets. See the [release inventory](../../docs/roi-adore-release-files.md).

## Verify the delivered movie

The exact delivered filename and SHA-256 are in [final-verification.json](evidence/final-verification.json). Full decode passed, AAC packets matched the locked master, and the Desktop copy matched the final hash. Actual video duration is 379.366667 s at 60 fps (22,762 frames); AAC duration is 379.367619 s.

The timing report measures frame quantization, not ground-truth vocal accuracy. Dense overlaps retain uncertainty; some highlights intentionally group words. See the production record for the full interpretation.

## License, credits and AI disclosure

Project-owned workflow contributions are licensed under [CC BY 4.0](../../LICENSE.md), subject to the stated scope and third-party exclusions. Source music, lyrics, artwork, animation, fonts and dependencies retain their original rights. Mixed films and covers are not wholly CC-licensed assets. See [creator credits](../../CREDITS.md) and the [AI use disclosure](../../AI-DISCLOSURE.md).
