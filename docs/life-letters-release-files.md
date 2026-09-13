# Life Letters v1.0.0 — release files

[Release](https://github.com/ael-dev3/lyrics/releases/tag/life-letters-v1.0.0) · [Project and reproduction](../projects/life-letters-lyric-film/README.md) · [Final verification](../projects/life-letters-lyric-film/evidence/final-verification.md)

| Asset | Purpose |
| --- | --- |
| `LIFE-LETTERS-RU-ES-AR-LANDSCAPE.mp4` | Complete 2348×1080, 60 fps Russian / es-AR / pronunciation film |
| `Life-Letters-Editable.zip` | Committed project, original extracted streams, locked render media, fonts, observations and QA |
| `Pronunciacion-para-Argentina.md` | Spanish-friendly pronunciation key and phrase guide |
| `Life-Letters-ru.srt` | Russian captions |
| `Life-Letters-es.srt` | Argentinian Spanish meanings |
| `Life-Letters-phonetic.srt` | Pronunciation aid |
| `Life-Letters-three-layers.srt` | Combined captions |
| `Life-Letters-Final-QA.json` | Encoded-media checks and visual-review limits |
| `Life-Letters-Preview-63.8.png` | Frame decoded from the final movie, reduced to phone review size |
| `CHECKSUMS.sha256` | Sizes are recorded separately in the publication receipt; this file hashes the other nine assets |

The archive's `SOURCE-REVISION.txt` identifies its committed project tree. `PACKAGE-CHECKSUMS.sha256` covers its contents except itself. Runtime video/audio stay in release assets rather than ordinary Git history; model weights, dependencies, caches and redundant intermediate renders are excluded. The final film is a separate asset rather than duplicated inside the editable archive.

The release tag is fixed to the source commit. A later repository commit records the publication receipt after every asset is freshly downloaded and compared; the receipt is not retroactively inserted into the immutable archive.

[Downloaded-asset receipt](../projects/life-letters-lyric-film/evidence/release-upload-verification.json) · [Archive integrity and clean-extraction checks](../projects/life-letters-lyric-film/evidence/package-verification.json) · [Asset sizes, hashes and URLs](../projects/life-letters-lyric-film/release-assets.json).
