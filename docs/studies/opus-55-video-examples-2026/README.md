# Five Opus 5.5-associated video examples: frame study

Studied on **27 September 2026** for the Lyrics visual-production workflow. The five [source posts](sources.json) present distinct completed works. Four use the same AI-risk song, “Upping My P(Doom),” while the fifth uses a different song and an Evangelion-inspired interface world. That shared-song group makes the visual differences unusually clear: a theater cartoon, editorial anime, pixel RPG, and technical-noir treatment each assign the same ideas to different types of scenery and text surface.

**Main production lesson:** sustained visual variety needs a small, consistent set of anchors. These works use recurring characters, meters, colors, interface borders, stage layouts or typography rules. Lyrics can become props, charts, forms, dialogue, warnings and animated signs, but the primary phrase still needs to read at normal speed and phone size. The detailed [comparative study](COMPARATIVE-STUDY.md) separates these observations from production recommendations.

This is a reference study, not a request to reproduce third-party scenes or a replacement for our [cinematic lyric default](../../cinematic-lyric-workflow.md), [bilingual timing gate](../../cross-language-sync-gate.md), or [complete-preview gate](../../preview-before-render.md).

## Source works and evidence

| Primary X post | Saved media | Decoded frames | Codex visual sampling | Detailed chapter | Per-frame data |
| --- | --- | ---: | --- | --- | --- |
| [NotinReality](https://x.com/other__reality/status/2102514581684052169) | 1280×720, 24 fps, 156.629 s | 3,758 | One-second sequence, overview sheets, neighboring checks | [Theater cartoon](videos/notinreality.md) | [CSV](data/notinreality-frame-index.csv) · [chart](data/notinreality-frame-activity.svg) |
| [Donald Jewkes](https://x.com/donaldjewkes/status/2102801274173587569) | 1920×1080, 30 fps, 141.568 s | 4,245 | One-second sequence and overview sheets | [Editorial anime](videos/donald-jewkes.md) | [CSV](data/donald-jewkes-frame-index.csv) · [chart](data/donald-jewkes-frame-activity.svg) |
| [_mexicat](https://x.com/_mexicat/status/2103108369569726802) | 1280×720, 60 fps, 156.711 s | 9,399 | Four-second samples and selected larger stills | [Technical noir](videos/mexicat.md) | [CSV](data/mexicat-frame-index.csv) · [chart](data/mexicat-frame-activity.svg) |
| [Pleometric](https://x.com/pleometric/status/2103082510607610023) | 1920×1080, 30 fps, 156.693 s | 4,699 | Four-second samples and selected larger stills | [Pixel RPG / idol](videos/pleometric.md) | [CSV](data/pleometric-frame-index.csv) · [chart](data/pleometric-frame-activity.svg) |
| [Luis Bizarro](https://x.com/LuisBizarro/status/2104111432149164474) | 1920×1080, 60 fps, 184.448 s | 11,064 | One-second sequence and selected native-resolution stills | [Neon Overdrive](videos/luis-bizarro.md) | [CSV](data/luis-bizarro-frame-index.csv) · [chart](data/luis-bizarro-frame-activity.svg) |

The table describes the saved X renditions, not necessarily each creator's original master. The complete **1.4 GB local study folder** preserves those five MP4s, 33,165 numbered preview frames, 224 labeled contact sheets, a keyboard/slider frame viewer for each clip, larger selected stills, post metadata and all original analysis notes. The source media and stills are **not committed to this repository**. This repository retains the analytical text, all per-frame numerical records, checksums, source relationships and the processing script. The local deliverable is titled `Opus-5.5-Video-Study` in the task's outputs folder.

An additional [IterIntellectus X video download](ITER-INTELLECTUS-DOWNLOAD.md) was delivered separately to the Desktop. It is recorded here for completeness, but it is **not** one of the five primary works and did not receive this visual study.

## What was actually inspected

1. The five primary MP4s were downloaded at the highest listed X rendition available to the study and retained unchanged in the local archive. SHA-256 hashes, media IDs, stream properties and post relationships are in [`sources.json`](sources.json) and [`frame-study-manifest.json`](frame-study-manifest.json).
2. FFprobe enumerated every decoded video frame and its presentation timestamp. FFmpeg produced one compact, 320-pixel-wide JPEG preview for each decoded frame, with no frame-rate conversion. The [processing script](build_frame_study.py) then wrote one CSV row per frame, made chronological 150-frame contact sheets, and calculated frame-to-frame preview measurements. The five CSV files here represent **all 33,165 decoded frames**.
3. Codex reviewed ordered temporal samples across each complete runtime, plus selected larger or neighboring frames. Individual chapter introductions state the sampling interval and limitations. **Every frame was decoded and indexed; not every full-resolution frame was visually reviewed or described.** The local viewer and contact sheets make each frame available for follow-up inspection.
4. The original audio tracks were retained with the local MP4s, but this pass did not independently transcribe the songs, align sung words to frames, verify subtitle highlight timing, or establish whether an apparent spectrum or waveform was driven by audio data. Visual relationships in the chapters are approximate.

Two MP4 headers report one extra frame beyond what FFprobe/FFmpeg actually decoded: Donald reports 4,246 versus 4,245 decoded; Pleometric reports 4,700 versus 4,699. The CSV and image counts follow the decoded frames. Both counts remain in the manifest.

### Reading the per-frame CSVs

Each row has a zero-based `frame`, source `timestamp_seconds`, optional packet duration, keyframe flag, picture type, and an image name that resolves inside the **local** archive. It also has four descriptive measurements on a 96×54 proxy: normalized brightness, saturation, edge energy and mean absolute RGB change from the previous frame. These measures find candidate changes, but a peak can be a cut, flash, graphic update or rapid camera/object motion. They cannot identify a lyric cue, prove a beat, or establish visual quality. The SVG charts plot that last metric, clipped near its 99th-percentile range for legibility.

## Relationships and attribution

X's extractor returned quoted or embedded videos as extra playlist items. Pleometric's post includes Donald's video; Luis Bizarro's post includes _mexicat's video; Donald's extraction also surfaces NotinReality's earlier video. They are provenance relationships, **not extra original videos** in this five-work corpus. Where retained locally, those quoted media files are labeled as quotes. The primary works are counted and analyzed once.

The posts and some closing cards claim or discuss **Opus 5.5** use. They provide evidence of what creators said, not independent access to prompt logs, model traces, project repositories, asset histories or elapsed build times. “Opus 5.5-associated” is the appropriate scope label. No claim is made that the model produced every asset or that a particular on-screen number is factual. The videos' source imagery, characters, music, lyrics and screenshots remain third-party works outside this repository's [CC BY scope](../../../LICENSE.md). This update contains original analysis, derived measurements and code, with source links for attribution; it does not offer the videos for redistribution.

## Reproducing the frame-processing outputs

The checked-in [`build_frame_study.py`](build_frame_study.py) is the processing script used for the local archive. It requires Python 3 with Pillow, FFmpeg and FFprobe. The recorded run used Python 3.9.6, Pillow 11.3.0 and FFmpeg/FFprobe 8.1.2. The download extractor was yt-dlp 2025.10.14. Tool versions are the observed environment, not a guarantee of identical results from future X transcodes.

Place the script in a **separate study directory**, with independently obtained primary source files named exactly as below, then run it there. Run it outside this Git checkout because it creates tens of thousands of JPEGs and contact sheets.

```text
study-directory/
  build_frame_study.py
  other__reality-2102514581684052169/source.mp4
  donaldjewkes-2102801274173587569/source.mp4
  mexicat-2103108369569726802/source.mp4
  pleometric-2103082510607610023/source.mp4
  luisbizarro-2104111432149164474/source.mp4
```

```sh
python3 -m pip install Pillow
cd /path/to/study-directory
python3 build_frame_study.py
```

The script verifies that the number of emitted previews matches the number of frames FFprobe decoded and writes a new manifest with source hashes. Compare those hashes with [`sources.json`](sources.json) before treating a regenerated CSV as the same run. Quoted X playlist items should be identified separately rather than silently appended to the primary corpus. The script does not download MP4s or recreate the curated post metadata, larger selected stills, written analyses, or visual index page.

## Applying the observations to Lyrics

- Give a new film one visual grammar and a few returning anchors before building many lyric-specific events. Decide which concepts become staged objects and which belong in existing surfaces such as signs, meters, forms, dialogue or architecture. The [comparison](COMPARATIVE-STUDY.md) shows four treatments of the same words and why the chosen container changes their tone.
- Maintain one large, normal-speed reading path. Small in-world labels can reward a paused viewer, but the sung phrase, active word and necessary translation must remain legible at phone size. Do not copy the reference videos' denser captions or microtext into a bilingual film without the current [equal-emphasis standard](../../bilingual-lyric-workflow.md).
- Track lyric timing, picture cuts, visual state and decorative audio response as separate data. The visual study identifies candidate relationships; the [source-clocked workflow](../../source-clocked-word-effects-workflow.md) and [cross-language review gate](../../cross-language-sync-gate.md) remain the requirements for our own song.
- Review held text and recurring motifs across scene changes. Use the full preview, source audio, frame viewer and final encoded files to check transitions and continuity; contact sheets and pixel-change charts do not prove sound-picture synchronization.

**AI disclosure:** OpenAI Codex performed the source collection, extraction, frame measurement, visual sampling, comparative reasoning, writing and code. The inspection scopes above distinguish automated processing, samples visually reviewed by Codex, source claims and inferred production lessons.
