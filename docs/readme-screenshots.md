# README song screenshots

Updated 18 September 2026. All thirteen featured songs in the main README have a representative screenshot with its edition and preview/final status, and each song's project README has an associated image. Promotional covers and supplementary frames remain separate from the representative screenshot.

| Song | Representative image | Time | Edition / provenance |
| --- | --- | --- | --- |
| La Lune (version acoustique) | [Lunar scene and equal French / English focus](../assets/la-lune-acoustic-celestial-v3-46-8.png) | 00:46.800 | Verified Celestial v3 final landscape film |
| каждый, кто делал тебе больно | [Source illustration, shadow texture and equal bilingual focus](../assets/kazhdyy-72-2.png) | 01:12.200 | Verified final v6 landscape film |
| Sugar Glass | [Mirror performance, large English focus and spectrum](../assets/sugar-glass-90.png) | 01:30.000 | Verified final English-only landscape film |
| Твои глаза | [Original animation and bilingual focus](../assets/tvoi-glaza-63-4.png) | 01:03.400 | Verified final local landscape film |
| Прости за любовь | [Night-tram scene and bilingual lyrics](../assets/prosti-v1-2-52-4.png) | 00:52.400 | Accepted v1.2; known highlighting gaps preserved |
| Половинка | [Original performance and turquoise focus](../assets/polovinka-80.png) | 01:20.000 | Final v1.0.0 landscape film |
| Life Letters | [Full wide composition and language layers](../assets/life-letters-63-8.png) | 01:03.800 | Existing v1.0.0 decoded-frame evidence |
| Joyride | [Source performance, flame and coral focus](../assets/joyride-120.png) | 02:00.000 | Existing v1.0.0 decoded-frame evidence |
| midnight love | [Silhouette, flame and pale-gold focus](../assets/midnight-love-44.png) | 00:44.000 | Existing v1.1.0 decoded-frame evidence |
| Пожары | [Original photograph and bilingual treatment](../assets/pozhary-16-2.png) | 00:16.200 | Existing v1.0.0 decoded-frame evidence |
| Отменяй | [Source illustration and red lyric focus](../assets/otmenyai-13-95.png) | 00:13.950 | Existing v1.0.0 decoded-frame evidence |
| Roi × Adore | [Independent vocal lanes and source animation](../assets/roi-adore-rebuild-125-8.png) | 02:05.800 | Existing rebuilt v1.0.0 final-frame reference |
| Tanisea | [Square composition and English focus](../assets/tanisea-vnext-hero.png) | 00:48.000 | Historical square vNext reference; time visible in frame |

The [structured inventory](../assets/readme-screenshots.json) records image dimensions, hashes, project associations and selection reasons. Original-creator credits remain with the song entries and project documentation.

## Selection and verification

The three newly extracted images came from final files whose SHA-256 matched their delivery records. Candidate frames were compared at reduced size, then the selections inspected at native 1920×1080. The Половинка selection replaces a motion-blurred frame while preserving the archival source's natural softness. The Прости за любовь image comes from the exact accepted v1.2 artifact; it does not imply that its known highlighting gaps were corrected.

Frames were extracted by zero-based index on each film's 60 fps timeline:

```sh
ffmpeg -v error -i INPUT.mp4 -vf "select=eq(n\,FRAME)" \
  -frames:v 1 -fps_mode vfr -compression_level 8 OUTPUT.png
```

The selected frame indices are 3804, 3144 and 4800 for Твои глаза, Прости за любовь and Половинка respectively. Their complete compositions are preserved without cropping, recoloring, replaced text or generated imagery.

Existing screenshots were inspected and retained when the subject, lyric treatment and composition remained suitable. Five are byte-identical to their project evidence images; Roi × Adore shares the asset already cited by its production record. Tanisea remains explicitly labelled as a historical vNext design reference: this pass did not re-establish its exact source-master identity. Screenshot review documents visual presentation, not acoustic synchronization or a new approval of historical timing.

## Sugar Glass final frame

The current English-only entry is frame 5400 at 90.000 seconds, decoded from the verified final landscape file at native 1920×1080 as an RGB PNG. Both READMEs and the inventory identify the final film and its SHA-256. The mirror composition, large active word and reflective spectrum remain fully visible. The earlier browser screenshot is retained as preview history. Screenshot selection documents presentation, not acoustic certainty.

Check the actual image encoding before choosing the filename extension or reading dimensions. Native browser screenshots can return JPEG bytes even when a caller supplies a PNG filename. Use an image decoder or `ffprobe` to verify the encoding and dimensions, then verify the inventory byte count and SHA-256. Preserve the captured bytes rather than re-encoding solely to fit an assumed extension.

## каждый, кто делал тебе больно final frame

Frame 4332 at 72.200 seconds is decoded from the checksum-verified v6 landscape film at native 1920×1080. The complete source illustration, subtle shadow texture, medium spectrum and corresponding столе / the table emphasis remain visible. Both READMEs use the same image; the inventory records its final source identity. The preceding diagnostic preview image is retained as history. Promotional cover adaptations are separate assets.

## La Lune final celestial frame

Frame 2808 at 46.800 seconds is decoded from the checksum-verified final landscape file at native 1920×1080. It shows the complete generated Moon, radial spectrum and equal French/English soudain / suddenly focus. Both READMEs share this unmodified full-frame image; the inventory records the final video identity. The preceding v2 diagnostic and final stills are retained as history. Screenshot selection documents visual presentation, not acoustic certainty.
