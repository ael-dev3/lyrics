# Leave It On — publishing kit

This folder contains channel-specific copy and three covers for the 16:9 YouTube and 9:16 TikTok film editions. [KIT-MANIFEST.json](KIT-MANIFEST.json) identifies the eight files intended for the delivery folder by byte count and SHA-256. The `review-*.png` files and cover generators are internal QA/source materials, excluded from that manifest. The kit prepares posts; it is not evidence of a YouTube or TikTok publication.

| Final asset | Intended use | Dimensions |
| --- | --- | ---: |
| [YouTube thumbnail](Leave-It-On-Warpkeep-YouTube-Thumbnail-1920x1080.jpg) | 16:9 video cover | 1920 × 1080 |
| [TikTok profile cover](Leave-It-On-Warpkeep-TikTok-Cover-Profile-1200x1600.jpg) | Repo-standard 3:4 portrait profile cover | 1200 × 1600 |
| [TikTok vertical cover](Leave-It-On-Warpkeep-TikTok-Cover-Vertical-1080x1920.jpg) | Full-frame 9:16 companion | 1080 × 1920 |

The YouTube copy is [title](YouTube-Title.txt), [description](YouTube-Description.txt) and [tags](YouTube-Tags.txt). The TikTok copy is [title](TikTok-Title.txt) and [caption](TikTok-Caption.txt). The song master has no independently verified public performer credit in the supplied metadata, so the copy credits the recording as the project master and names Ael for the lyric-film production rather than inventing an artist. “Warpkeep” on the cover identifies the game world.

## Cover provenance

The covers are compositions of **actual browser scene captures** plus title typography. No generated replacement scenery, character, mountain sign or castle was added. The captures were saved from the approved `preview-v2-pr375` scene at source times with `?format=landscape|portrait&cinema=1&capture=1`, which uses the same original audio clock and PR375 assets as the film preview. The cover source frames are local intermediate evidence, rather than final-film decoded frames.

| Cover | Browser capture | Capture SHA-256 | Selection |
| --- | --- | --- | --- |
| YouTube | `evidence/preview-landscape-266.000.png` | `eb6e1545585079ff9aae8b76ed6ebcaa97df27cbe2f371d2923003dbd4acccf3` | Quiet closing image, clean left sky for the title |
| TikTok profile | `evidence/preview-portrait-205.000.png` | `d27a82c3994c896b7de6c19b38eaaa10e9c76266ba75fa02c906696edb37344a` | Instrumental view, visible guardian rune visualizer and mountain-sign margins |
| TikTok vertical | `evidence/preview-portrait-266.000.png` | `78ed4ce8e71daccceed630a28b5a50147874eeeea04e66085a6c2a2e7331c3aa` | Closing guardian and castle view with an open foreground for the title |

The 3:4 profile frame uses a 1080 × 1440 region beginning 120 px below the top of the native 1080 × 1920 portrait frame, then scales to 1200 × 1600 **without stretching**. A bounded dark gradient supports the song title over the lower scene. The fixed WARPKEEP mountain sign and the Warplet remain source-frame content. Headline outlines come from this project's [Space Grotesk font](../public/fonts/SpaceGrotesk.ttf) at weight 700 (font SHA-256 `acad6de1fc93436f5c0f1f4137751ef04f1aea3063e7036535970ffcfbd79f72`); its OFL notice remains in `public/fonts/`. The [outline helper](create-type-paths.py) generated [type-paths.json](type-paths.json), and [build-covers.cjs](build-covers.cjs) composites those SVG paths over unchanged scene pixels with `sharp`. The underlying model and game asset identity are unchanged.

To rebuild on a machine with the three local captures present and `sharp` installed in Node resolution:

```sh
node publishing-kit/build-covers.cjs
```

If `sharp` is installed in a separate shared runtime, set `NODE_PATH` to its `node_modules` directory for this CommonJS script. Regenerating outline data additionally needs Python `fontTools`; ordinary cover rebuilds use the checked-in outlines.

## Visual and file checks

Each JPEG was viewed at native size. The YouTube cover was also checked at [320 × 180](review-youtube-320x180.png). The profile cover was checked at [300 × 400](review-tiktok-300x400.png), [150 × 200](review-tiktok-150x200.png) and after a conservative [5% trim on every edge](review-tiktok-trim-300x400.png). The complete song title, WARPKEEP landmark and guardian remain visible in those local checks. All final covers are RGB JPEGs with square pixels, no embedded EXIF rotation and no player UI, watermark or letterboxing. The vertical companion was viewed at native size. These local checks do not claim a platform upload preview.

The profile-cover geometry follows the repository's [TikTok cover workflow](../../../docs/tiktok-cover-workflow.md). This is an established project convention for the observed profile crop, not a claim that every TikTok client exposes a separate image upload. [YouTube's current thumbnail guidance](https://support.google.com/youtube/answer/72431?hl=en) recommends a 16:9 image as large as practical; 1920 × 1080 preserves this source frame's native resolution without invented pixels. [TikTok's current Studio guidance](https://support.tiktok.com/en/using-tiktok/creating-videos/creator-tools-on-tiktok) supports selecting a cover when preparing a video post. No title, description or cover in this kit represents an already-posted video.

The current project [source and production notes](../README.md) record the master audio, PR375 scene sources, timing evidence and media-rights boundary. The covers combine project-owned layout with the source game art and are not standalone open-licensed Warpkeep assets.
