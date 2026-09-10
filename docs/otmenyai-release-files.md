# Отменяй — release asset inventory

Release: [otmenyai-v1.0.0](https://github.com/ael-dev3/lyrics/releases/tag/otmenyai-v1.0.0), completed 10 September 2026. [Production notes](../projects/otmenyai-lyric-film/README.md) · [Original official audio](https://www.youtube.com/watch?v=U9SYUPV0QrA).

| File | Size | Contents |
| --- | ---: | --- |
| [REDCHINAWAVE-Otmenyai-Complete-Production.zip](https://github.com/ael-dev3/lyrics/releases/download/otmenyai-v1.0.0/REDCHINAWAVE-Otmenyai-Complete-Production.zip) | 164.93 MB | Editable project, original source, stems, observations, fonts, final features, delivery files and per-file manifest |
| [REDCHINAWAVE-Otmenyai-Lyric-Film-1080p60.mp4](https://github.com/ael-dev3/lyrics/releases/download/otmenyai-v1.0.0/REDCHINAWAVE-Otmenyai-Lyric-Film-1080p60.mp4) | 34.79 MB | Final verified 1920×1080 60 fps YouTube master |
| [REDCHINAWAVE-Otmenyai-Original-Source.mkv](https://github.com/ael-dev3/lyrics/releases/download/otmenyai-v1.0.0/REDCHINAWAVE-Otmenyai-Original-Source.mkv) | 14.42 MB | Downloaded source video/audio streams |
| [REDCHINAWAVE-Otmenyai-Verification.json](https://github.com/ael-dev3/lyrics/releases/download/otmenyai-v1.0.0/REDCHINAWAVE-Otmenyai-Verification.json) | 0.004 MB | Full decode, frame/codec/color checks, audio packet identity, source alignment and lyric-layout results |
| [REDCHINAWAVE-Otmenyai-YouTube-Description.txt](https://github.com/ael-dev3/lyrics/releases/download/otmenyai-v1.0.0/REDCHINAWAVE-Otmenyai-YouTube-Description.txt) | 0.001 MB | Short artist-focused title and description with Codex / GPT-6 Astra disclosure |
| [REDCHINAWAVE-Otmenyai-YouTube-Thumbnail.jpg](https://github.com/ael-dev3/lyrics/releases/download/otmenyai-v1.0.0/REDCHINAWAVE-Otmenyai-YouTube-Thumbnail.jpg) | 0.147 MB | 1280×720 upload-ready thumbnail |
| [REDCHINAWAVE-Otmenyai-YouTube-Thumbnail.png](https://github.com/ael-dev3/lyrics/releases/download/otmenyai-v1.0.0/REDCHINAWAVE-Otmenyai-YouTube-Thumbnail.png) | 1.72 MB | Original AI-assisted thumbnail image |
| [REDCHINAWAVE-Otmenyai.en.srt](https://github.com/ael-dev3/lyrics/releases/download/otmenyai-v1.0.0/REDCHINAWAVE-Otmenyai.en.srt) | 0.001 MB | 21 English translation cues |
| [REDCHINAWAVE-Otmenyai.ru.srt](https://github.com/ael-dev3/lyrics/releases/download/otmenyai-v1.0.0/REDCHINAWAVE-Otmenyai.ru.srt) | 0.001 MB | 21 Russian lyric cues |
| [CHECKSUMS.sha256](https://github.com/ael-dev3/lyrics/releases/download/otmenyai-v1.0.0/CHECKSUMS.sha256) | — | SHA-256 for all nine data assets |

## Archive contents and reproduction

The complete production archive contains 116 files, including its `MANIFEST.sha256`. It preserves the original `work/otmenyai`, `work/prygay-source` and `outputs` layout. The film, final thumbnail variants, short publishing copy and captions are included alongside the editable source. The standalone source video is byte-identical to the source inside the archive.

A fresh dependency installation, strict TypeScript, timing contracts, DSP calibration, all 42 browser lyric states and the packaged master verifier passed. See [package validation](../projects/otmenyai-lyric-film/evidence/package-validation.json). Packaging preserves the final composition, cues, artwork and feature data; only dependency declarations, notices, the encode wrapper and cache handling were added.

Installed dependencies, model weights, lossless render intermediates, review-frame caches and installer logs are excluded. Model observations include rejected experiments for provenance; the production notes identify the accepted timing path. Original extractor metadata is reduced to public provenance fields, without temporary media URLs or session headers. The metadata manifest distinguishes the archived subset from the original local metadata hash.

## Integrity

Download `CHECKSUMS.sha256` beside the release files and run `shasum -a 256 -c CHECKSUMS.sha256`. After extracting the ZIP, run `shasum -a 256 -c MANIFEST.sha256` from its `REDCHINAWAVE-Otmenyai-Production` directory.

Final master SHA-256: `70fd65b514c6a14de42d4d6bc0f7aa04a8d51e2a8fbd7b949e291e6bc2032ee0`.

The [machine-readable inventory](../projects/otmenyai-lyric-film/release-assets.json) records exact byte counts and hashes. GitHub upload verification is retained with the project release evidence.

## Credits and rights

Music and lyrics: REDCHINAWAVE. Artwork: sourced from its official upload; original illustrator unverified. Added lyric presentation and English adaptation: Ael, assisted by Codex with GPT-6 Astra; thumbnail adapted with a separate image tool.

The project’s scoped [CC BY 4.0 policy](../LICENSE.md) covers only contributions it has authority to license. Original media, lyrics, source imagery, fonts and software retain their rights. Mixed films and covers are not wholly CC-licensed assets. [Full credits](../CREDITS.md) · [AI disclosure](../AI-DISCLOSURE.md).
