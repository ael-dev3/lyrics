# Танцы Минус — Половинка

[Release v1.0.0](https://github.com/ael-dev3/lyrics/releases/tag/polovinka-v1.0.0) · [YouTube film](https://github.com/ael-dev3/lyrics/releases/download/polovinka-v1.0.0/Polovinka-YouTube-1920x1080-60fps.mp4) · [TikTok film](https://github.com/ael-dev3/lyrics/releases/download/polovinka-v1.0.0/Polovinka-TikTok-1080x1920-60fps.mp4) · [Editable project](https://github.com/ael-dev3/lyrics/releases/download/polovinka-v1.0.0/Polovinka-Editable-Project.zip)

![Final landscape frame with the source performance and equal bilingual word focus](../../assets/polovinka-80.png)

*Decoded v1.0.0 film at 01:20.000. [Additional decoded frames](evidence/final-contact-youtube.jpg) retain the broader visual review.*

Russian and English lyric films built from the complete original recording: a dedicated 1920×1080 YouTube composition and a dedicated 1080×1920 TikTok composition, both delivered at 60 fps. Russian words and meaning-based English groups share the same acoustic timing. No pronunciation layer is included.

The design follows the source video's warm brick, black leather and turquoise palette. Both languages use the same Oswald Medium type, cream resting color and turquoise focus. Words remain stationary when highlighted. A 64-band measured spectrum follows the locked soundtrack. The original moving picture remains at its 25 fps cadence; graphics animate at 60 fps.

## Deliverables

| Item | Location |
| --- | --- |
| YouTube film | `output/Polovinka-YouTube-1920x1080-60fps.mp4` |
| TikTok film | `output/Polovinka-TikTok-1080x1920-60fps.mp4` |
| YouTube title and description | `publishing/YouTube-title.txt`, `publishing/YouTube-description.txt` |
| TikTok description | `publishing/TikTok-description.txt` |
| YouTube thumbnail | `publishing/Polovinka-YouTube-Thumbnail-1920x1080.jpg` |
| TikTok profile cover | `publishing/Polovinka-TikTok-Profile-1200x1600.jpg` |
| Russian / English / bilingual captions | `publishing/captions/` |

The TikTok profile cover is portrait **1200×1600**, 3:4 width:height. No separate TikTok title is supplied. The verified films, publishing kit and original editable archive are distributed with the v1.0.0 GitHub release. The archive preserves the original local delivery, including runtime media. No rights-holder correspondence is part of this project.

## Source and audio lock

Source: [Танцы минус — Половинка, StarPro](https://www.youtube.com/watch?v=hqBBM7ioil8). The uploader's description credits © 2013 Первое Музыкальное Издательство. This credit is reproduced as provenance, not as a permission statement.

The selected native picture is AV1 854×480 at 25 fps. YouTube also supplied a 1920×1080 rendition explicitly labelled AI-upscaled; that rendition is retained as source provenance but is not the runtime picture. `public/footage.mp4` is a high-quality H.264 proxy of the native picture. The 1080p delivery dimensions describe the finished composite, not native source detail. The portrait composition crops the source deliberately to preserve its central performer, with continuous shading into the lyric area.

The original Opus soundtrack decodes to **8,400,648 stereo samples at 48 kHz**, or **175.0135 s**. The production clock contains **10,501 frames at 60 fps**, or 175.016667 s. A constant **+2 dB** gain is the only signal-level edit before the 320 kb/s AAC delivery encode. No cuts, remixing, stretching, pitch shifting, compression or limiting are applied. Source loudness is −17.94 LUFS / −3.55 dBTP. The locked AAC measures **−15.95 LUFS / −1.52 dBTP**, with unchanged 7.70 LU loudness range. Codec padding is excluded from the feature-analysis signal; the AAC container rounds duration down by 24 source samples (0.5 ms).

`analysis/audio-identity.json` records nine correlation checkpoints from the intro through the tail. Every checkpoint peaks at zero sample lag. `analysis/manifest.json` binds the exact AAC, decoded PCM and spectral data by SHA-256. Final encoding stream-copies the locked AAC into both films.

## Timing and translation

`source/lyrics-supplied-ru.txt` preserves the supplied text. `source/phrases.json` contains the twelve source phrases and translation drafts. `src/cues.json` is the production timing and final English meaning map. All 75 Russian words are preserved; typographic dashes are displayed in the third stanza.

Demucs isolates the vocal reference without changing the delivered music. Independent MMS forced alignments of the original mix and isolated vocals establish estimated word boundaries. Full-track Whisper turbo transcriptions, bounded Whisper small transcriptions, time-compressed ending transcriptions and unforced acoustic event decoding cross-check the complete performance. The full-recording audit includes the intro, both inter-verse gaps, pauses before the closing words and the entire outro. No additional performed lyric passage was corroborated.

Several automatic outputs were rejected: missing first-verse lines, first words stretched over instrumental intros, pauses assigned to the following word, and invented closing text around 171.6 s. Both MMS signals place the final two words of each stanza near 37.9, 87.6 and 137.2 s. The mix/vocal onset difference has a median of 0 ms and a maximum of about 40 ms. This is consistency evidence, not a certificate of absolute accuracy. The audit is model-assisted; no human listening certification is claimed. Detailed evidence and limitations are retained in `analysis/vocal-coverage.json` and `analysis/alignment-comparison.json`.

Both language layers use the same word/meaning events. Natural English word order is retained even when a group must highlight before a group to its left, such as “I left half of myself with you.” The last line deliberately remains “You left me half of myself,” preserving the Russian lyric's unusual change in perspective.

Source timing is stored as 48 kHz sample indices. Presentation begins twelve frames before a phrase onset so the words have settled before singing. Focus starts on the first frame at or after its source event and releases at its exclusive end; quantization adds less than one 60 fps frame. Short gaps remain unhighlighted. English semantic groups may span more than one Russian word; they are translations, not a claim of separately sung English vocals.

## Rendering and verification

The reference pipeline captures at **2× resolution** to PNG, renders lossless H.264 4:4:4 segments, and performs one controlled Lanczos downsample into high-profile H.264 4:2:0, BT.709, CRF 14 delivery. The full-frame capture uses a shared frozen bundle; both formats use the same sample clock and AAC file. Browser decoder caches and worker counts are bounded. Each worker verifies frozen inputs before and after its render. The final frozen manifest is `evidence/render-inputs.json`. The English intro title fades out into the first lyric. A 16-frame replacement window (frames 768–783) supplies this opening transition in the retained lossless captures; both cut boundaries match the surrounding decoded pixels exactly. The final encoder is `scripts/encode-opening.ts`. Base-capture provenance, the previous component snapshot and replacement hashes are retained in `evidence/base-render-inputs.json`, `source/Film-base-render.tsx` and `evidence/opening-repair.json`. A fresh full render from the final source produces the corrected opening directly and uses the ordinary encoder.

The preflight checks complete Russian text coverage, non-overlapping source words, complete English meaning mappings, audio-feature identity, 351 focus-boundary assertions, spectral calibration, and all twelve phrases in active and inactive states in both aspect ratios. The layout report checks equal font size/weight, safe areas and invariant glyph positions. Short previews cover the second and third verses; decoded frames are reviewed at native and mobile sizes. The profile cover is reviewed at 150×200 and after removing 5% from each edge.

Both final films passed `evidence/delivery-verification.json`: each contains 10,501 frames at 60 fps, passes full audio/video decode, and preserves all 8,205 locked AAC packets exactly. Dimensions, every frame timestamp and BT.709 color tags also passed. Final decoded contact sheets cover all twelve phrases, intro, opening transition, final sung word and outro in each format; selected native-size frames were inspected too. `evidence/visual-review.json` records that review. Sampled visual inspection does not establish exhaustive pixel or acoustic accuracy.

## Reproduce

Normal rendering requires Node 24+, FFmpeg/FFprobe and the pinned npm dependencies. Python and model weights are unnecessary if using the included cue data and runtime media.

```sh
npm ci
npm run check
node scripts/render.ts --preview --start=62 --seconds=13
node scripts/render.ts --preview --portrait --start=111 --seconds=13
node scripts/render-all.ts --parts=8 --workers=2 --total-concurrency=6
npm run captions
npm run verify
```

The renderer needs permission to start a local HTTP server and Chrome. Production rendering uses significant CPU and disk space because its intermediate frames are supersampled and lossless. Intermediate captures are not required in the portable archive.

For a complete audio re-analysis, use `scripts/prepare-media.ts`, `scripts/infer.ts`, `scripts/align.ts`, `scripts/acoustic-audit.ts`, `scripts/build-cues.ts`, `scripts/analyze.ts` and `scripts/audio-check.ts`. `ALIGN_PYTHON` selects a Python environment with the versions recorded in `analysis/audio-runtime.txt`. Model downloads/cache setup are separate from rendering; weights and virtual environments are excluded from the portable project. Preserve the included locked AAC when reproducing the exact delivery checksums: new encoders may produce different AAC bytes even from the same source.

## Artwork and provenance

Both thumbnails were made with the built-in image generator using inspected frames from the source video. The portrait cover received a dedicated margin revision. They are AI-assisted editorial illustrations, not new photographs of the performer. Original generated PNGs are retained in `source/`; final JPEGs are dimension-normalized for delivery. Prompt specifications are in `source/artwork-prompts.md`. Fonts are bundled with their OFL license files.

Only source media, generated artwork, production code, lyric data and technical evidence belong to this project. Private conversation material is excluded from the delivery and portable archive.

## Publication packaging

The original 106,209,506-byte editable archive is preserved byte-for-byte from the verified local delivery. It contains 128 individually hashed files and passes independent extracted-file verification. The public Git tree contains code, fonts, cue data, artwork and audit reports; original media are provided in the release archive. The archive README describes the pre-publication local delivery. No private conversation or screenshots are included.

[Published-asset verification](evidence/release-upload-verification.json): all ten release assets matched the local byte counts and hashes after download; the published asset identities and digests were rechecked after release publication.
