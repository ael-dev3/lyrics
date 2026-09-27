# Must Have Been A Dream — posting plan

**Status:** both production films passed independent encoded-file verification. The posting copy and covers were locally reviewed. [The final verification](../evidence/final-verification.json) records the exact video identities; [the delivery receipt](../evidence/delivery-receipt.json) records the separately checked Desktop kit. Nothing here represents a platform upload.

The [selected official video](https://www.youtube.com/watch?v=AK6duyCPU50) is by Computer Kill. Its description credits a postmortē production, Rob Roy Taylor (director/editor), Tommy Melendez (producer/editor), Joseph Puccio (cinematography) and Isaac Barnes (VFX). These are source-video credits, not credits for the lyric treatment. The [production company](https://postmorte.com/) also identifies the official film and its director. The title follows [the artist's release listing](https://computerkillband.bandcamp.com/track/must-have-been-a-dream).

The four platform text files in this directory use that source identification and disclose the independent AI-assisted lyric edit. They do not claim that the original footage or soundtrack was created by this project.

## Covers from the original picture

The covers use exact frames from the locked source MP4. The source stores a 1920×672 active picture within a 1920×1080 black-matte frame; each cover crops the **active picture** to its needed ratio without stretching a person or preserving the encoded black bands.

| Upload choice | Selected source frame | Composition and exact output |
| --- | --- | --- |
| YouTube thumbnail | Frame **3448**, **143.810 s**, the red-jacket singer under the night overpass | Source-active crop `x=650.167..1844.833`, `y=204..876` (1194.667×672 = 16:9). The singer occupies the left and the complete title and artist sit in the dark open space at right. Export: 1920×1080 RGB JPEG, 209,508 bytes, SHA-256 `e663c17e9d982092a04f278529a5c0c9092408bb46a45a1dd136df9f501152fb`. |
| TikTok profile cover | Frame **600**, **25.025 s**, the red-hood singer against wet city lights | Source-active crop `x=900..1404`, `y=204..876` (504×672 = 3:4). The face fills the upper portion; the complete title and artist sit over the darker jacket. Export: 1200×1600 RGB JPEG, 211,001 bytes, SHA-256 `ed664f949f754cee61d855a15a987e64fe359bf76cf9cc24ac997e9220d06746`. |

These are the selected cover identities. Adjacent frames **3442–3452** and street frames **580, 590, 600, 610, 620** were compared before locking them. The covers retain the source's red, blue and night-light palette, use bundled Archivo Black and a restrained contrast field, and contain no generated replacement scenery. The YouTube singer is slightly motion-soft in the original frame; the source appearance is preserved. The source's title flash near 168 s was avoided because its large lettering is clipped at the wide source edges.

The repository files are `Computer-Kill-Must-Have-Been-A-Dream-YouTube-Thumbnail-1920x1080.jpg` and `Computer-Kill-Must-Have-Been-A-Dream-TikTok-Cover-Profile-1200x1600.jpg`. The Desktop kit presents them as `YouTube/thumbnail.jpg` and `TikTok/profile-cover.jpg`.

The full covers and local proofs at YouTube 320×180 and TikTok 300×400 and 150×200 were inspected. A centered 5% crop from each TikTok edge retained the complete title, artist and face. [Cover evidence](../evidence/cover-assets.json) records hashes, exact geometry and review limits. These local simulations do not establish how either platform will crop its actual upload interface.

## Optional English captions

The `.en.srt` and `.en.vtt` files contain 26 source-clocked lyric cues. Each subtitle opens at its first sung word and closes at its last word's end; these are whole-line captions for platform accessibility, separate from the video's native per-word highlighting. They were generated from the reviewed timeline on the same source clock as the final encoded audio. Whole-line subtitle reading remains a separate platform choice from the film's per-word focus.

## Local kit and GitHub handoff

The `Computer Kill — Must Have Been A Dream — Upload Kit` on Desktop has `YouTube/` and `TikTok/` subfolders. Each has its own full video, title or description text and selected cover (`thumbnail.jpg` at 1920×1080; `profile-cover.jpg` at 1200×1600). `START-HERE.md`, a relative delivery manifest, SHA-256 checksums and optional source-clocked SRTs support posting and independent byte checks. [The delivery receipt](../evidence/delivery-receipt.json) reports the checked copies. The original video and full exports stay out of public Git history.

For the source handoff, document final media identity, screenshot decoded from an identified **final** video, cover provenance, relevant timing/visual choices and limitations. Run project checks, review the final diff, open and attach the pull request, merge after checks pass, then verify the default branch contains the changes and no authorized work remains in an open pull request. The repository update is separate from posting videos to YouTube or TikTok.
