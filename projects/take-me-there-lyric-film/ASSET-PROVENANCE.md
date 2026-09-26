# Source and asset provenance

This edition composites within the supplied [excape. — TAKE ME THERE video](https://www.youtube.com/watch?v=CPznmfSbAiE). The complete moving source remains the picture; no generated scene, background replacement, additional character, or replacement soundtrack is included.

| Input | Identity and use |
| --- | --- |
| `public/source.mp4` | Local media, excluded from Git. SHA-256 `954ce98a308937e81a167ab740381cd46195abbad3279f3bc57319fa48bbd73c`. H.264, 1920×1080, 60 fps, 8,093 frames. AAC stereo, 44.1 kHz. One browser video element supplies both picture and audio. |
| `public/soundtrack.m4a` | Optional local stream-copy analysis convenience; not required by the player. The checker compares compressed packets and decoded PCM with the source when present. |
| `public/audio-features.json` / `.bin` | Source-derived 60 Hz measurements: broadband RMS, positive spectral flux and 24 logarithmic bands. Binary SHA is bound in metadata. Display normalization is explicitly separate from the raw measurements and lyric timings. |
| `public/fonts/SpaceGrotesk.ttf` | Space Grotesk, SIL Open Font License. Font and license reused from the repository's existing licensed copy; no remote font request during playback. |
| `public/source-poster.jpg` | Source-derived reference still. It is not a film render or a playback fallback. |
| `source/user-transcript.txt` | Supplied provisional transcript, retained as reference rather than treating its coarse timestamps as word boundaries. |
| `source/lyrics-preview-draft.*` | Reproducible candidate transcription and cue-level captions built from the selected word events. |

The visible spectrum uses a fixed screen-space light composition, with 48 columns interpolated from the 24 measured bands. Its color, soft emission and light spill are matched to the source palette; it is not presented as a tracked physical object. A separate environment compositor adds brightness only to existing source highlights inside the source-space regions in `src/shots.ts`. It does not synthesize windows or substitute another city. Selected bright source pixels retain their shape and color as the underlying video moves. Glyph placement is editorial composition; sky lettering is not represented as physically tracked signage.

## Timing evidence

Local Whisper large-v3-turbo runs on mix and separated vocals, bounded MMS alignments, repeated-sample correlation, and a separate Whisper small pass supplied comparison data. They are candidate observations, not listening approval. The small model frequently misrecognized the processed hook and is not authoritative. Forced alignments also depend on the supplied text and can allocate a plausible path to an incorrect echo count.

`evidence/timing-decisions.json` records selection decisions, including retracted early-onset assumptions and the subsequent comparison with independent English CTC consonant/vowel evidence. `evidence/timing-review-priorities.json` preserves unresolved articles, echo counts, late chopped vocals and the Leave/Live ambiguity. No tool pass is described as human hearing or as perfect synchronization.

## Reproduction

Restore the exact source locally and run `npm ci`, `npm run check`, then `npm run preview`. Source download packaging can change; verify the locked SHA before calling it identical. Analysis model weights, vocal stems, local source and runtime caches remain outside the Git handoff. The analysis scripts retain their model/environment prerequisites in `analysis/transcription-pass-a/README.md`.

## Preview images

`evidence/preview-landscape.png` (97.300 s, 1920×1080) and `evidence/preview-portrait.png` (74.050 s, 1080×1920) were exported through the complete browser preview after the fixed spectrum revision. They contain the original source frame, current lyrics and all intended response layers. They are preview evidence, not production-render frames.
