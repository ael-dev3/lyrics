# Posting assets

Гречка — **Люби меня, люби**, Russian lyrics with an English meaning-based translation.

- **YouTube:** use `YouTube-Title.txt`, `YouTube-Description.txt` and `Lyubi-Menya-Lyubi-YouTube-Thumbnail-1920x1080.jpg` with the landscape film.
- **TikTok:** use `TikTok-Title.txt`, `TikTok-Description.txt` and `Lyubi-Menya-Lyubi-TikTok-Cover-Profile-1200x1600.jpg` with the vertical film. The cover is **1200×1600 portrait**, 3:4 width:height.
- **Optional captions:** `captions/` contains Russian, English and bilingual UTF-8 SRT files. Each contains all 33 lyric cues and follows the film's displayed line windows. These are line-level captions; the film already contains word highlighting, so enabled player captions can duplicate the visible text.

Both covers use the unchanged original album image, the approved rose-paper palette and Oswald Medium. Typography and composition are drawn in code; no generated replacement imagery is used. Native JPEG proofs, mobile-size previews and a centered crop removing 5% from each edge are in [`evidence/covers/`](../evidence/covers/). These are local simulations, not platform-upload previews.

Rebuild from the project directory:

```sh
node scripts/covers.ts
node scripts/captions.ts
```

[Cover identities and review](../evidence/cover-assets.json) · [Caption identities](../evidence/caption-assets.json)

Performance/recording: Гречка. Album: **Звёзды только ночью**. [Original recording](https://www.youtube.com/watch?v=DBGCHjBSNzo). Original music, lyrics and artwork remain credited to their respective creators; they are not included in the repository contribution license. Publishing copy discloses AI-assisted translation and lyric presentation. No platform upload is performed by preparing these assets.
