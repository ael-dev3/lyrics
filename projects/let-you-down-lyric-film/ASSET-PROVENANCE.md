# Let You Down — asset provenance

| Asset | Origin | In Git? |
| --- | --- | --- |
| `public/source.mp4` | Official upload [BnnbP7pCIvQ](https://www.youtube.com/watch?v=BnnbP7pCIvQ) on the Cyberpunk 2077 / CD PROJEKT RED channel, streams `137+140` merged by yt-dlp without retiming. Identity in [evidence/source-identity.json](evidence/source-identity.json). | No (local, ignored) |
| `source/lyrics.local.txt` | Lyric text supplied by the project owner for this commission. Its normalized SHA-256 is the text identity in every timeline and gate record. | **Never**; the repository holds no lyric text |
| `analysis/stems/*.wav` | HTDemucs estimate from the locked source (analysis only; [analysis/stem-estimate.json](analysis/stem-estimate.json)) | No |
| `public/audio-features.*`, `public/picture-tones.json`, `public/picture-palette.json` | Measured from the locked source by [scripts/analyze-audio.ts](scripts/analyze-audio.ts), [scripts/measure-tones.ts](scripts/measure-tones.ts) and [scripts/measure-palette.ts](scripts/measure-palette.ts) | Yes (derived numbers) |
| `public/fonts/Rajdhani-Bold.ttf` | Rajdhani Bold by Indian Type Foundry, SIL Open Font License 1.1 ([Rajdhani-OFL.txt](public/fonts/Rajdhani-OFL.txt)), downloaded with the owner's approval for `preview-v2` from the Google Fonts repository ([`ofl/rajdhani/Rajdhani-Bold.ttf`](https://github.com/google/fonts/raw/main/ofl/rajdhani/Rajdhani-Bold.ttf), licence from `ofl/rajdhani/OFL.txt`). SHA-256 is one of the gated inputs in [evidence/preview-identity.json](evidence/preview-identity.json) | Yes |
| `publishing/*.jpg` covers | Source frame 1572 (65.565 s) plus Rajdhani title/artist typography in the film's neon halo; no generated imagery, no lyric text ([evidence/cover-assets.json](evidence/cover-assets.json)) | Yes |
| `evidence/preview-*-27.000.jpg` | Native-renderer `preview-v2` frames at 27.000 s (before the first vocal): source picture, measured neon light and spectrum only | Yes |

## Rights and credits

- **Song:** Dawid Podsiadło — *Let You Down*, the ending theme of the Netflix series *Cyberpunk: Edgerunners*. The music video's closing credits list music by Dawid Podsiadło and Magdalena Laskowska, lyrics by Dawid Podsiadło and producer Akira Yamaoka.
- **Music video:** directed by Ilya Kuvshinov, produced by STUDIO MASSKET (per the official upload description); CD PROJEKT RED.

The music, lyrics, recording and animation remain with their respective rights holders and are excluded from this repository's CC BY 4.0 licence. This edition adds lyric presentation, measured light, a spectrum and word effects. It does not claim authorship of the source work, and no endorsement is implied.

The finished films contain the full original video and the lyric text. They are not published by this repository: rendering, captioning and any platform upload are separate, owner-run steps.
