# README song screenshots

Reviewed 16 September 2026. All ten featured songs in the main README have a representative film screenshot, and each song's project README has an associated image. Promotional covers and supplementary frames remain separate from the representative screenshot.

| Song | Representative image | Time | Edition / provenance |
| --- | --- | --- | --- |
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
