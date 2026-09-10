# TikTok edition

**Current default:** use the portrait `Roi-Cover-Profile-3x4.jpg` for the tall profile preview labelled “4:3”. Its actual dimensions are 1200×1600. The landscape file below is an archived variant. Future tracks follow the [TikTok cover workflow](../../../docs/tiktok-cover-workflow.md).

Full-length 1080×1920, 60 fps H.264/AAC adaptation. The original animation sits above both timed lyric lanes and the spectrum. The final transparent 4K graphics frames are recomposed without changing cue timing; audio packets match the locked AAC master. Full decode and Desktop copy verification passed.

The video and publishing kit are available in [the release](https://github.com/ael-dev3/lyrics/releases/tag/roi-adore-rebuild-v1.0.0).

## Publishing files

- `Description.txt`: ready-to-paste caption and credits.
- `Roi-Cover-Profile-3x4.jpg`: default profile cover, 1200×1600 portrait, matching the shown tall profile preview.
- `Roi-Cover-Landscape-4x3.jpg`: archived 1600×1200 landscape variant; not the default profile upload.
- `Roi-x-Adore-TikTok-Cover.jpg`: earlier 9:16 cover, 1080×1920.
- `Roi-x-Adore-Cover-Original.png`: original generated portrait artwork.
- Prompt files preserve the AI-assisted cover creation and format corrections.
- `Verification.json`: final video metadata, audio identity and SHA-256.

## Reproduction

Scripts are archived with their original session-relative layout. Run from the extracted production archive root after generating `work/frames-v4` using the full production project's renderer. Place `tiktok-render.py` and `verify-tiktok.py` under `work/`. The render script uses FFmpeg, original animation, locked AAC and the rendered transparent frames. `--preview` makes a ten-second sample; omission renders the full timeline. Set the verifier's `<DELIVERY_DIRECTORY>` to the desired copy destination before running it. The script's first input is the lossless frame sequence, not the compressed landscape movie.

Video SHA-256: `498d704e134db351e0578f7c41dfc523bb2d2371f8169401c2821a053b32d132`.

## License, credits and AI disclosure

Project-owned workflow contributions are licensed under [CC BY 4.0](../../../LICENSE.md), subject to the stated scope and third-party exclusions. Source music, lyrics, artwork, animation, fonts and dependencies retain their original rights. Mixed films and covers are not wholly CC-licensed assets. See [creator credits](../../../CREDITS.md) and the [AI use disclosure](../../../AI-DISCLOSURE.md).
