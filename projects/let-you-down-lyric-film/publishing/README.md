# Let You Down — posting assets

Titles, descriptions and covers for the YouTube and TikTok kit, published with both films in [let-you-down-v1.0.0](https://github.com/ael-dev3/lyrics/releases/tag/let-you-down-v1.0.0). The films themselves, and the optional caption tracks, contain the lyric text and are generated locally; they are never committed. No platform upload is represented here.

| Asset | Composition | Size | SHA-256 |
| --- | --- | --- | --- |
| [YouTube thumbnail](Dawid-Podsiadlo-Let-You-Down-YouTube-Thumbnail-1920x1080.jpg) | Source frame 1572 (65.565 s), full frame; title stacked in the dark left third, artist beneath | 1920×1080 | `36fb1f6f6d85956bf7ec185c94f4008b28bc2ac617fe9cb2986a4962e9df752b` |
| [TikTok profile cover](Dawid-Podsiadlo-Let-You-Down-TikTok-Cover-Profile-1200x1600.jpg) | Same frame, centred crop `(x=555, y=0, 810×1080)` scaled to **portrait 1200×1600 (3:4)**; title and artist over a lower shade | 1200×1600 | `0384e8a33e3aa5c82f80ed85e2690ff0c4362cf13864680b18cb25d274fbd7ae` |

Both covers use the film's lyric lettering: upright Rajdhani Bold in white, lit from below inside the video's neon glow, with the title in pink light and the artist in cyan. They carry the title and artist only, with no lyric text and no generated imagery. The TikTok cover was checked at [150×200](../evidence/covers/tiktok-150x200.png), at [300×400](../evidence/covers/tiktok-300x400.png), and with a [5 % centred crop](../evidence/covers/tiktok-center-crop-5percent-150x200.png). The YouTube thumbnail was checked at [320×180](../evidence/covers/youtube-320x180.png). The title and artist stayed legible in all four checks. These are local checks, not platform upload previews.

The copy files are [YouTube title](YouTube-Title.txt), [YouTube description](YouTube-Description.txt), [TikTok title](TikTok-Title.txt) and [TikTok description](TikTok-Description.txt). They credit the artist, the song's writers as listed in the video's own end credits, the video's director and studio, and the original upload. They describe the film as an independent, AI-assisted lyric edit that is not an official release.

`node scripts/make-captions.ts` writes optional English SRT/VTT tracks here from the local lyric file and the reviewed timeline; Git ignores them.
