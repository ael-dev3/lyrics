# La Lune posting kit

The kit contains separate YouTube and TikTok folders. Each has its complete film, cover, title and description. `Captions/` contains optional French, English and bilingual SRT files; the films already contain burned-in word highlighting.

| Platform | Video | Cover |
| --- | --- | --- |
| YouTube | Landscape 1920×1080, 60 fps | [1920×1080 thumbnail](La-Lune-YouTube-Thumbnail-1920x1080.jpg) |
| TikTok | Portrait 1080×1920, 60 fps | [Portrait 1200×1600 profile cover](La-Lune-TikTok-Cover-Profile-1200x1600.jpg) |

[YouTube title](YouTube-Title.txt) · [YouTube description](YouTube-Description.txt) · [TikTok title](TikTok-Title.txt) · [TikTok description](TikTok-Description.txt)

The covers use the approved AI-assisted Moon illustration with dedicated code-native poster layouts in [CoverRoot.tsx](../src/CoverRoot.tsx). Text is set with the bundled Space Grotesk font. The cover export script verifies dimensions; local review covers small sizes and a conservative centered crop. [Cover identity and review](../evidence/cover-assets.json) records the files and limits. The source-art prompt is preserved in [artwork provenance](../source/moon-artwork-prompt.md).

The package script requires both final videos to pass technical and decoded-word checks before copying. Checksums cover every posting file. Desktop-copy verification is recorded separately so the built package retains its original identity. Original music and recording belong to L’Impératrice / microqlima; posting copy includes the source link and AI-art disclosure. No platform upload is performed by this handoff.
