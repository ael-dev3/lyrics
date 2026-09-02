# Original upload vs English lyric film

Snapshot date: **2026-09-02**

This document records the stable creative, technical, and attribution differences between the official source upload and the fan-made English lyric film. Live view, like, watcher, and recommendation counts are intentionally excluded because they change continuously.

## Source presentations

- Official source upload: [Tanisea & ksviety — Закричу на весь мир (Remix)](https://www.youtube.com/watch?v=dYraLlQzjAA)
- English lyric film: [Tanisea & ksviety — Закричу на весь мир (Remix) | English Lyric Film](https://www.youtube.com/watch?v=ZWBaldEgepk)

The official upload is the recording presented with static square artwork centered in the YouTube player. Visual checks at `00:02` and `00:50` show the same artwork, black side fields, no on-screen lyrics, and no available caption track.

The English lyric film retains the source recording and foundational artwork while adding a native landscape composition, English lyric adaptation, sample-indexed highlighting, cinematic line handoffs, audio-reactive spectrum, transitions, frame chrome, and a controlled outro. The YouTube delivery preserves the source timeline and musical content; it applies the documented 4 dB platform-safety attenuation and AAC delivery encode.

## Viewer-facing comparison

| Area | Official upload | English lyric film |
| --- | --- | --- |
| Primary purpose | Official audio distribution | English-language audiovisual interpretation |
| Geometry | Square artwork inside a 16:9 player | Native `1920×1080` landscape composition |
| Artwork behavior | One static centered image | Staged artwork integrated into an animated visual system |
| Lyrics | No embedded lyric presentation | 74 English target segments with semantic highlighting |
| Vocal synchronization | No lyric synchronization layer | Integer-sample timing converted to frame-bounded presentation |
| Typography | None | Kinetic lyric hierarchy, focus states, and line handoffs |
| Audio visualization | None | Deterministic 64-band lower spectrum |
| Section choreography | None | Build, verse, chorus, transition, and outro treatments |
| Diagnostics | None | Separate optional 120 fps synchronization proofs |
| Public duration | Approximately 2:33 | 153 seconds |

The film is therefore not a cosmetic reskin of the official upload. It is a separately authored visual and linguistic layer built around the unchanged song structure.

## Measurable project scope

### Alignment and translation model

- 24 reviewed vocal lines;
- 102 Russian source tokens with integer start/end sample indices;
- 74 stationary English target segments;
- 74 semantic cues connecting source groups to equivalent English meaning;
- timing authority at 44,100 Hz;
- maximum reviewed token uncertainty of 882 samples / 20.000 ms;
- explicit support for forward, backward, repeated, and simultaneous target activation.

### Composition and rendering

| Composition | Geometry | Cadence | Frames | Role |
| --- | ---: | ---: | ---: | --- |
| `LyricFilmVNext` | `1080×1080` | 60 fps | 9,180 | Square public master |
| `LyricFilmSyncProof` | `1080×1080` | 120 fps | 18,360 | Square diagnostic proof |
| `LyricFilmYouTube` | `1920×1080` | 60 fps | 9,180 | Native landscape delivery |
| `LyricFilmYouTubeSyncProof` | `1920×1080` | 120 fps | 18,360 | Landscape diagnostic proof |

The public 60 fps film contains 9,180 timed frames rather than repeating a single visual throughout the soundtrack. Both aspect ratios share the same alignment authority while retaining independent presentation geometry.

### Repository and verification footprint

At this snapshot, `projects/tanisea-lyric-film` contains 80 tracked files:

- 23 render, encode, alignment, packaging, and QA scripts;
- 21 automated test files;
- 19 source modules and components;
- 8 tracked public media, font, and feature assets;
- 2 audit files and 2 alignment records;
- 5 project-level configuration and documentation files.

The release gate exercises more than 1,000 assertions and includes strict typechecking, browser-measured layout, composition discovery, alignment validation, full media decode, exact frame counts, codec and colour metadata, audio checks, selected-frame review, checksums, and reproducibility evidence.

### Verified v2.5.0 landscape artifacts

| Artifact | Size | SHA-256 |
| --- | ---: | --- |
| 1920×1080 ProRes 4444 reference | 12,769,610,053 bytes | `315cf66102ca4b85dfea9c87a6aa0379808a925e7f2827412f6cdd17e2d5931b` |
| 1920×1080 H.264/AAC YouTube delivery | 48,355,793 bytes | `ec93e9d5578881de045e2e8fb1038caa862bfc32192d95fd7fa805f090697c4e` |

The verified delivery is `1920×1080`, 60 fps, 9,180 frames, 153 seconds, BT.709, limited range, and implicit square-pixel 16:9 geometry.

## Contribution and rights boundary

| Layer | Attribution |
| --- | --- |
| Recording, performance, composition, and source remix | Tanisea, ksviety, and their respective rights holders |
| Foundational illustration/artwork | Its original creator and respective rights holder |
| English lyric adaptation and semantic presentation | Lyric-film project contribution |
| Word/phrase alignment and repeated-section timing model | Lyric-film project contribution |
| Visual direction, typography, motion, spectrum, and aspect-ratio compositions | Lyric-film project contribution |
| Render, proof, audit, packaging, and reproducibility system | Lyric-film project contribution |

“Remix” is part of the source recording’s official title. This project does not claim to have produced or altered the musical remix.

In creative and technical terms, the result is a substantial audiovisual transformation of the official upload experience. In musical terms, it intentionally adds no new composition or performance. It remains a derivative fan work: the new visual and linguistic authorship does not transfer ownership of the recording, composition, performance, or foundational artwork, and public availability does not itself grant redistribution permission.

## Known future refinement

The checkpoint around `00:47` remains slightly below the reference-quality lyric-highlighting standard demonstrated by `01:46–01:56`. It is a localized future refinement, not a request to replace the accepted v2.5.0 delivery. The exact preview-first review method is recorded in [Reproducible lyric-film workflow and production preferences](track-workflow-preferences-and-known-issues.md).

## Reproducibility records

- [Source project and commands](../projects/tanisea-lyric-film/README.md)
- [Native 16:9 implementation record](youtube-16x9-v2.5.0-implementation.md)
- [Native 16:9 delivery audit](../projects/tanisea-lyric-film/audits/tanisea-youtube-1920x1080-v2.5.0.md)
- [Alignment implementation and measured uncertainty](precision-sync-vnext-implementation.md)
- [Sanitized workflow and production preferences](track-workflow-preferences-and-known-issues.md)

Together, these records distinguish the artists’ original musical work from the lyric film’s visual, linguistic, timing, and engineering contribution without overstating ownership or reproducing private project conversation.
