# Software and fonts

The package manifest and lockfile pin the JavaScript toolchain. Authored production code is TypeScript. Remotion / React render the scene with Chromium; FFmpeg and FFprobe encode and verify media. ProRes 4444 uses VideoToolbox where available, otherwise the software encoder. The delivery uses libx265 and stream-copied AAC.

Cormorant Garamond Semibold is bundled with its original SIL Open Font License in `public/`. Font source: https://github.com/CatharsisFonts/Cormorant

Model-based analysis uses Demucs htdemucs, stable-ts / Whisper large-v3-turbo, Torch / Torchaudio MMS forced alignment and uroman. Model licenses and software terms remain with their respective projects. Model artifacts are frozen for rendering; model weights and environments are not bundled.

The portrait publishing cover used the built-in image-generation tool. Its exact prompt and selected original are retained under `publishing/cover-source/`; no undisclosed model version is claimed. FFmpeg performs only deterministic size/format normalization and profile-size review exports.

Original music, lyrics, recording, animation and media-derived artwork remain third-party material. See the repository's scoped LICENSE.md and source credits.
