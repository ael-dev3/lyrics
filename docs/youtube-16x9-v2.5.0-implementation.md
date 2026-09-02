# Native 16:9 YouTube edition — v2.5.0

## Purpose

The square `v2.4.1` master remains the approved timing and visual baseline. This
revision adds a second, native `1920×1080` landscape composition for a regular
YouTube upload. It is not a stretched square raster, a letterboxed export, or a
crop that discards the illustration.

## Landscape composition

`LyricFilmYouTube` keeps the same locked 153-second soundtrack, integer-sample
alignment authority, `presentationCues`, semantic highlight states, and 60 fps
frame count as `LyricFilmVNext`. It recomposes the visual field around them:

- the original square illustration stays sharp in a right-side stage;
- a blurred, darkened full-bleed treatment carries colour and motion across the
  16:9 canvas without distorting the artwork;
- verses receive a protected dark left reading stage, while chorus statements
  use the wider central field;
- the spectrum becomes a native 1,712 px, 64-band lower rail with 9 px
  square-ended measured and impact lines;
- frame chrome uses a true `1920×1080` perimeter and the outro remains a
  centred, fixed-gap settle rather than spreading its words apart.

The related `LyricFilmYouTubeSyncProof` composition is `1920×1080` at 120 fps.
It overlays the existing source/presentation cue diagnostics without changing
the public visual composition or its timing.

## Reproducible delivery sequence

Run the commands from `projects/tanisea-lyric-film` on the tagged source
revision:

```sh
npm ci
npm run check
npm run alignment:verify
npm run youtube:reference
npm run youtube:encode
npm run youtube:verify:delivery
```

The 120 fps proof is available as an optional diagnostic rather than a
prerequisite for a regular upload delivery:

```sh
npm run youtube:proof
npm run youtube:verify
```

The commands deliberately keep the generated artifacts separate from the square
release outputs:

| Artifact | Role |
| --- | --- |
| `output/Tanisea-Lyric-Film-YouTube-1920x1080-Reference.mov` | Muted 1920×1080 ProRes 4444, 60 fps render authority |
| `output/Tanisea-Lyric-Film-YouTube-1920x1080-Final.mp4` | YouTube-ready 1920×1080 H.264/AVC, 60 fps MP4 |
| `output/Tanisea-Lyric-Film-YouTube-Sync-Proof-120fps.mp4` | 1920×1080 120 fps diagnostic proof with the locked AAC stream |
| `audits/tanisea-youtube-1920x1080-v2.5.0.json` | Strict-decode, frame-count, BT.709, geometry, and checksum report; includes proof-audio identity when the optional proof is present |

The final upload delivery applies the same 4 dB platform-safety attenuation as
the existing platform file and encodes AAC at 256 kb/s. The optional proof
remuxes the locked source AAC unchanged; when it is present, its audio packet
SHA-256 must equal the soundtrack before the fuller verifier emits an audit.

## Review points

Representative visual review frames are selected from the intro, the repaired
first chorus around `00:40`, a verse stage around `01:15`, and the fixed-gap
outro around `02:16`. Source tests independently assert:

- two exact `1920×1080` composition contracts at 60 and 120 fps;
- the unchanged square contracts;
- landscape lyric layout retains the same active timing state as the square
  version;
- the 1,712 px lower rail has 64 square-ended bands and remains inside the
  landscape safe area.

The generated final file is the asset intended for regular YouTube upload; it
does not imply permission to publish the copyrighted recording or lyric
adaptation. Written permission or an authorized Content ID policy change is
still required before making it public.
