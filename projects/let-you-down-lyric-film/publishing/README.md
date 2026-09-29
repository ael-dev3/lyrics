# Let You Down — posting assets

Titles, descriptions and covers for the YouTube and TikTok kit. The films themselves, and the optional caption tracks, contain the lyric text and are generated locally; they are never committed. No platform upload is represented here.

| Asset | Composition | Size | SHA-256 |
| --- | --- | --- | --- |
| [YouTube thumbnail](Dawid-Podsiadlo-Let-You-Down-YouTube-Thumbnail-1920x1080.jpg) | Source frame 1572 (65.565 s), full frame; title stacked in the dark left third, artist beneath | 1920×1080 | `c1968dafd734d938e9d624d2b5d599c13c3cb60cb113ab296f83463b94a09c17` |
| [TikTok profile cover](Dawid-Podsiadlo-Let-You-Down-TikTok-Cover-Profile-1200x1600.jpg) | Same frame, centred crop `(x=555, y=0, 810×1080)` scaled to **portrait 1200×1600 (3:4)**; title and artist over a lower shade | 1200×1600 | `2aa05f8aceaffa159e4d40750ff7602c14ef692e79f6e976732c17c2a64ff27e` |

Both covers use the film's Oswald Bold lettering with its forward lean and neon glow: title in Edgerunners yellow, artist in white with cyan light. They carry the title and artist only, with no lyric text and no generated imagery. The TikTok cover was checked at [150×200](../evidence/covers/tiktok-150x200.png), at [300×400](../evidence/covers/tiktok-300x400.png), and with a [5 % centred crop](../evidence/covers/tiktok-center-crop-5percent-150x200.png). The YouTube thumbnail was checked at [320×180](../evidence/covers/youtube-320x180.png). The title and artist stayed legible in all four checks. These are local checks, not platform upload previews.

The copy files are [YouTube title](YouTube-Title.txt), [YouTube description](YouTube-Description.txt), [TikTok title](TikTok-Title.txt) and [TikTok description](TikTok-Description.txt). They credit the artist, the song's writers as listed in the video's own end credits, the video's director and studio, and the original upload. They describe the film as an independent, AI-assisted lyric edit that is not an official release.

`node scripts/make-captions.ts` writes optional English SRT/VTT tracks here from the local lyric file and the reviewed timeline; Git ignores them.
