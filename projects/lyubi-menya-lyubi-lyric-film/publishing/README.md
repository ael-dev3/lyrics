# Posting assets

Гречка — **Люби меня, люби**, Russian lyrics with an English meaning-based translation.

The current publishing set is **`rose-paper-v1.1.0`**, paired with the corrected **`preview-v3-duration-focus`**. Its 33 caption cues contain 147 Russian and 169 English words, including “Has loved, but not me, for years now.” The earlier v1.0.0 kit reflects the previous wording and focus; use the corrected captions with the matching v1.1.0 films.

Both v1.1.0 films passed complete media and decoded-focus verification. The new **Posting Kit v1.1** Desktop folder contains 14 files, all matched to the [current delivery receipt](../evidence/delivery-receipt.json) and [Desktop copy record](../evidence/desktop-delivery-receipt.json). The [archived v1.0.0 receipt](../evidence/releases/rose-paper-v1.0.0/delivery-receipt.json) identifies the earlier delivery.

- **YouTube:** use `YouTube-Title.txt`, `YouTube-Description.txt` and `Lyubi-Menya-Lyubi-YouTube-Thumbnail-1920x1080.jpg` with the landscape film.
- **TikTok:** use `TikTok-Title.txt`, `TikTok-Description.txt` and `Lyubi-Menya-Lyubi-TikTok-Cover-Profile-1200x1600.jpg` with the vertical film. The cover is **1200×1600 portrait**, 3:4 width:height.
- **Optional captions:** `captions/` contains Russian, English and bilingual UTF-8 SRT files. Each contains all 33 lyric cues and follows the film's displayed line windows. These are line-level captions; the film already contains word highlighting, so enabled player captions can duplicate the visible text.

Both covers use the unchanged original album image, the approved rose-paper palette and Oswald Medium. Typography and composition are drawn in code; no generated replacement imagery is used. Native JPEG proofs, mobile-size previews and a centered crop removing 5% from each edge are in [`evidence/covers/`](../evidence/covers/). These are local simulations, not platform-upload previews.

The reviewed covers, titles and descriptions are reused unchanged from v1.0.0. Captions are regenerated from the corrected cue text and existing displayed-line clocks; their current cue and file hashes are recorded separately.

Rebuild from the project directory:

```sh
node scripts/covers.ts
node scripts/captions.ts
```

The verified kit was assembled with `python3 scripts/build-posting-kit.py --source-commit d2394d583a89634077cd69020396279da2194eb6 --edition rose-paper-v1.1.0`. The default destination is `output/posting-kit-v1.1.0`; reproducing it requires a new destination or preservation of the existing kit first. The assembler rejects an existing destination and stale video, cue, caption or cover evidence. The source commit identifies the reviewed inputs and actual renderer.

[Cover identities and review](../evidence/cover-assets.json) · [Caption identities](../evidence/caption-assets.json)

Performance/recording: Гречка. Album: **Звёзды только ночью**. [Original recording](https://www.youtube.com/watch?v=DBGCHjBSNzo). Original music, lyrics and artwork remain credited to their respective creators; they are not included in the repository contribution license. Publishing copy discloses AI-assisted translation and lyric presentation. No platform upload is performed by preparing these assets.
