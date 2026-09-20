# BALKON — Ведьмы

**Russian + English · steady autumn preview v5 · listening review pending · no full render**

![Original bonfire photograph, falling leaves and equal Russian–English focus](../../assets/vedmy-preview-v4-94-55.png)

*Selected native 1920×1080 browser-rendered preview still at 01:34.550, from the shared scene. This is not a decoded final video. Music and original release photograph: BALKON; the available release metadata does not identify the photographer.*

The complete **3:21.134** recording accompanies the original woodland photograph, one warm autumn palette, drifting veined leaves and a compact 64-band spectrum. Stable Russian and English text receives equal size, weight and complete meaning-linked highlighting. Both 1920×1080 and 1080×1920 layouts run at a 60 fps scene clock driven by the actual soundtrack.

## Review status

This is a complete playable preview, including the instrumental opening, all four chorus performances and the outro. Its 54 cues contain 218 Russian words and 281 English words. Original AAC packet payloads, decoded stereo PCM and analysis PCM match exactly. Automated word-state and browser geometry checks are recorded under `evidence/`.

**Acoustic timing remains provisional.** Seven alignment configurations across MMS and Whisper provide candidates, including full large-v3 and expanded-context passes; one short negation uses a documented stable original-mix candidate, and eight sustained vowel endings additionally use documented vocal energy and periodicity. Model agreement, a good still and automated timing checks do not establish perceptually exact synchronization. Full normal/slow actual-audio review remains pending, particularly held vowels, short prepositions, final releases and the unusual wording in VE-028. The [review record](evidence/cross-language-sync-review.json) is bound to the exact preview inputs. The production command fails closed until complete current-revision review and explicit render approval are recorded.

## Open the local preview

With the local media available, run `npm ci` and `npm run preview`, or use `Start Preview.command`. The player opens at **http://127.0.0.1:4322/**. Play the recording, switch between 16:9 and 9:16, seek freely, or enter Timing review for individual word candidates, vocal waveform/spectrogram and proposed boundary edits. Reload preview restores the full picture and media surface while retaining position, format and local review notes.

The original release uses a still photograph. The added leaves are the moving picture layer; the original artwork is never substituted by a lyrics-only diagnostic. Artwork failure and audio failure have visible recovery messages.

## Reproduction

The exact TypeScript compiler is pinned to 7.0.2 and dependencies are locked. Node 24 or later runs authored `.ts` tooling. FFmpeg and a local Python environment containing the existing PyTorch, torchaudio MMS_FA, uroman, stable-whisper and Demucs models are needed for audio analysis. Python is used only as a bridge to those models.

1. Obtain the linked 1080-square release with its AAC audio as `public/source.mp4`. The local source is excluded from Git. Save a source frame to `public/artwork.png` and stream-copy the audio to `public/soundtrack.m4a` using `-c:a copy -movflags +faststart` so browser metadata loads promptly.
2. Decode untouched stereo 44.1 kHz Float32 to `analysis/audio-delivery.f32`; prepare 48 kHz stereo and 16 kHz mono WAV model inputs. Preserve the [source clock and hashes](source/media-manifest.json).
3. Run `npm run features`. `ALIGN_PYTHON` selects the local model environment for `scripts/infer.ts` and `scripts/align.ts`. Text, mappings and independent section/line windows are in `source/`. Mixed/stem MMS, bounded Whisper, full large-v3 section alignment and extended MMS windows remain separate from the adopted cue map. Use `source/extended-sections.json` for the context-sensitivity pass; `source/timing-corrections.json` records selected exceptions. Full large-v3 weights live in ignored `models/`.
4. Run `node scripts/build-cues.ts`, `node scripts/held-vowels.ts`, then `node scripts/build-cues.ts`, `npm run layout` and `node scripts/nature-motion.ts`. The held-vowel tool always references the original model candidate, so it does not repeatedly extend already-adjusted words.
5. Run `node scripts/alignment-audit.ts`, `npm run check`, `node scripts/verify-source.ts` and `npm run preview:freeze`. Build `src/geometry-audit.ts` with esbuild to `review/geometry.js` and open `/review/geometry.html` for actual-browser glyph checks.
6. `node scripts/stills.ts` captures selected diagnostic stills only. `npm run render` is a guarded entry point, not a production encoder for this preview edition. A verified capture/encoding adapter is prepared only after the render gate has been satisfied.

Public source excludes full audio/video, model WAVs, machine paths and private review progress. Original artist rights are not transferred by this repository's code license. Cormorant Garamond is bundled with its SIL Open Font License.

[Original release](https://www.youtube.com/watch?v=VZfNfjhc8E8) · [Design lessons](PRODUCTION-LESSONS.md) · [Three-pass review](evidence/three-pass-review.md) · [Timing notes](evidence/sync-review.md) · [Preview-before-render policy](../../docs/preview-before-render.md)
