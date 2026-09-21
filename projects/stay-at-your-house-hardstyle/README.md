# I Really Want to Stay at Your House — Hardstyle

**English · full-recording preview · 16:9 and 9:16 · production not authorized**

![Stable yellow word focus beside Lucy](../../assets/stay-house-hardstyle-preview.png)

*Representative composition still at 01:04 using the same drawing function as the live preview. Source artwork: xiaocha81269, credited by the music upload. This is not a frame from a rendered full film.*

The complete 3:47.718 recording pairs fixed English lyrics with Edgerunners yellow **#FCEE0A**. Quiet sections retain the source illustration. Two silent edits of the official Netflix trailer replace it during the hard electronic sections; measured spectrum travel rises with the arrangement. The original music is the only soundtrack.

## Preview

Run `npm ci`, then `npm run preview`; open **http://127.0.0.1:4323/**. The local `Start Preview.command` reopens an existing server or starts one. The player supports normal, 0.75× and 0.5× playback, direct seeking, chapter jumps, both layouts and **Restore visuals**. A clean composition is available with `?clean=1`; `?t=102.7&format=portrait` opens a specific checkpoint. Review marks never grant render approval.

Local media preparation is required on a fresh clone. Source recordings and edited MP4 assets are not uploaded to the repository. The source URLs and selected identities are in `source/media-manifest.json` and `source/trailer-edit.json`.

1. Obtain the selected music upload as `public/source.mp4`; stream-copy its audio to `public/soundtrack.m4a`. The existing source artwork and locked timings are supplied.
2. Obtain the Netflix trailer as `public/trailer.mp4` (1920×1080, 24000/1001 fps for this edition).
3. Run `node scripts/build-trailer-assets.ts` to create the two **silent footage assets**, without rendering the song. This preserves the edit decision list, fixed output frame counts and source framing.
4. Run `npm run check`, `npm run review:build`, then `node scripts/review-server.ts`.

Node 24+, FFmpeg with libx264, npm dependencies and the included OFL fonts are required. Alignment reproduction additionally uses Demucs, torchaudio MMS and stable-whisper through `ALIGN_PYTHON`; it is not required merely to play the preview. `scripts/analyze.ts` consumes original decoded stereo float PCM in `analysis/audio-delivery.f32`; `scripts/motion.ts` derives presentation intensity from those measurements.

## Picture edit

![Official trailer footage during the first electronic drop](evidence/preview-trailer.png)

*Composition still at 01:52; animation from the [official Netflix trailer](https://www.youtube.com/watch?v=JtqIas3bYhg). Original Netflix identification remains in the source picture.*

- First asset: **01:42.417–02:09.217**, 1,608 frames.
- Second asset: **02:59.217–03:33.617**, 2,064 frames.
- Short dissolves make the trailer fully visible inside the selected intensity windows. Most cuts fall on 0.8/1.6/3.2-second groups of the observed approximately 150 BPM pulse. The edit does not claim a manually certified beat grid.
- Characters, speed trails, city scale and physical action carry the impact. Trailer dialogue, subtitles, promotional cards and added full-screen flashes are omitted from the selected edit. Short action shots receive shorter holds; atmospheric views can breathe.
- Portrait uses a shot-specific horizontal focal point and continuous bottom shading. Landscape opens the whole picture during instrumental drops. The remaining chorus lyrics retain fixed geometry and contrast during their overlap with the second edit.
- Abstract 3D assets are not loaded or required by this edition.

[Portrait composition](evidence/preview-portrait.png) · [Edit decision list](source/trailer-edit.json) · [Asset identities](evidence/trailer-assets.json)

## Lyrics and review limits

The original lyric sheet is preserved in `source/lyrics-supplied.txt`. This remix does not follow the entire original-song arrangement. The current preview contains **45 phrases / 284 word events**, independently aligned for repeated performances, across the full untouched recording.

Original-mix and isolated-vocal MMS candidates, wider-context candidates and independent Whisper alignment were compared. Wider context repaired several clipped first onsets; it also failed in part of the second chorus, so it is not adopted wholesale. Raw model scores are not treated as calibrated accuracy. Every candidate and final adopted interval is retained in `analysis/word-candidates.json`.

**Listening review remains pending.** In particular, inspect the processed vocal textures at 01:16–02:11, the held words around 02:30–02:38, chorus title-line endings and the final “no one” wording at 03:37–03:42. Inconsistent recognition of texture-heavy passages is not displayed as invented lyrics. The 121 flagged events are candidates for review, not proven errors. Structural interval tests and visible browser playback cannot establish exact acoustic accuracy or complete lexical coverage.

Production remains blocked by incomplete listening evidence and absent current-revision approval. `npm run render` refuses before capture or encoding. This preview edition has no full-film renderer and no final upload kit.

## Verification and credits

[Technical checks](evidence/structural-check.json) · [Browser review](evidence/preview-verification.md) · [Production gate](evidence/production-status.json) · [Reusable lessons](PRODUCTION-LESSONS.md)

- [Selected music upload](https://www.youtube.com/watch?v=tXFVl2Qb4zc): Laaemel. Its description links an Oblivion remix and credits the Samuel Kim / Lorien cover.
- Original song: Rosa Walton / Hallie Coggins. [Cover credited by the upload](https://www.youtube.com/watch?v=_AAdae7diOU).
- Artwork credit in the music upload: **xiaocha81269**; [linked artwork](https://wallhaven.cc/w/3lo8q3).
- Animation: **Cyberpunk: Edgerunners**, from the [official Netflix trailer](https://www.youtube.com/watch?v=JtqIas3bYhg). This fan lyric preview is not an official production or endorsement.
- Highlight color: `#FCEE0A`, verified in the stylesheet of the [official Edgerunners site](https://www.cyberpunk.net/en/edgerunners).
- Space Grotesk and Oswald fonts: included OFL notices in `public/`.

Music, lyrics, animation, characters, source artwork and fonts retain their respective ownership and licences. The repository's authored-code licence does not transfer rights to them.
