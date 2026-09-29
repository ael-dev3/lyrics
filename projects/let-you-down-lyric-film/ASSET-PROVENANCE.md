# Let You Down — asset provenance

| Asset | Origin | In Git? |
| --- | --- | --- |
| `public/source.mp4` | Official upload [BnnbP7pCIvQ](https://www.youtube.com/watch?v=BnnbP7pCIvQ) on the Cyberpunk 2077 / CD PROJEKT RED channel, streams `137+140` merged by yt-dlp without retiming. Identity in [evidence/source-identity.json](evidence/source-identity.json). | No (local, ignored) |
| `source/lyrics.local.txt` | Lyric text supplied by the project owner for this commission. Its normalized SHA-256 is the text identity in every timeline and gate record. | **Never**; the repository holds no lyric text |
| `analysis/stems/*.wav` | HTDemucs estimate from the locked source (analysis only; [analysis/stem-estimate.json](analysis/stem-estimate.json)) | No |
| `public/audio-features.*`, `public/picture-tones.json` | Measured from the locked source by [scripts/analyze-audio.ts](scripts/analyze-audio.ts) and [scripts/measure-tones.ts](scripts/measure-tones.ts) | Yes (derived numbers) |
| `public/fonts/Oswald-Bold.ttf` | Oswald by Vernon Adams, Kalapi Gajjar and Cyreal, SIL Open Font License 1.1 ([Oswald-OFL.txt](public/fonts/Oswald-OFL.txt)); same file already used by earlier projects here | Yes |
| `public/fonts/SpaceGrotesk.ttf` | Space Grotesk, SIL OFL 1.1 ([SpaceGrotesk-OFL.txt](public/fonts/SpaceGrotesk-OFL.txt)); kept for the review page chrome only | Yes |
| `publishing/*.jpg` covers | Source frame 1572 (65.565 s) plus Oswald title/artist typography; no generated imagery, no lyric text ([evidence/cover-assets.json](evidence/cover-assets.json)) | Yes |
| `evidence/preview-*-27.000.jpg` | Native-renderer preview frames at 27.000 s (before the first vocal): source picture, measured neon light and spectrum only | Yes |

## Rights and credits

- **Song:** Dawid Podsiadło — *Let You Down*, the ending theme of the Netflix series *Cyberpunk: Edgerunners*. The music video's closing credits list music by Dawid Podsiadło and Magdalena Laskowska, lyrics by Dawid Podsiadło and producer Akira Yamaoka.
- **Music video:** directed by Ilya Kuvshinov, produced by STUDIO MASSKET (per the official upload description); CD PROJEKT RED.

The music, lyrics, recording and animation remain with their respective rights holders and are excluded from this repository's CC BY 4.0 licence. This edition adds lyric presentation, measured light and a spectrum. It does not claim authorship of the source work, and no endorsement is implied.

The finished films contain the full original video and the lyric text. They are not published by this repository: rendering, captioning and any platform upload are separate, owner-run steps.
