# Precision sync vNext implementation

## Delivered result

The Tanisea vNext release is a 153-second English lyric film whose visual focus is driven by reviewed Russian vocal boundaries. The implementation replaces line-level timing with a sample-indexed token and semantic-cue model, renders a clean 60 fps public composition, and provides a separate 120 fps diagnostic proof.

Public characterization: **sample-indexed alignment with frame-bounded rendering**.

## Source authority

The locked soundtrack is stereo AAC at 44,100 Hz. A deterministic decode policy removes the decoder delay, preserves the defined tail, and addresses every timing boundary as an integer sample index.

| Authority | SHA-256 |
| --- | --- |
| Locked soundtrack | `93084f293d491da1519732f3fa3cf6416c783d04e8ca18b5569c7608a8d4540d` |
| Reviewed alignment JSON | `06fe6c8d6ad4db5131ab4f9ab98be91ea87064fdeea58017c6b8c21ed8530f0b` |
| Audio feature binary | `c9453f8c6fb3de3f16e691b51b4155c5db7e313f5aac1cc7942904754d29b7cf` |

The alignment manifest contains 24 lines, 102 source tokens, 74 stationary English segments, and 74 semantic cues. Every token stores selected start/end samples, confidence, uncertainty, and evidence. The maximum resolved token uncertainty is 882 samples, or 20.000 ms.

Candidate boundaries were compared with the locked mix and a zero-lag vocal stem using waveform and spectrogram evidence. Each token boundary was reviewed, substitutions in recognition output were retained only as evidence notes, and repeated chorus performances were timed independently.

The complete evidence table is published in [tanisea-word-alignment-v3.md](../audits/tanisea-word-alignment-v3.md); the render reads [tanisea-word-alignment-v3.json](../projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json).

## Frame-bounded rendering

For a sample index `s`, sample rate `r`, and video cadence `f`, the renderer selects the nearest frame:

```text
frame = round((s / r) × f)
```

Every token and semantic cue is checked at both public and proof cadences. Across all semantic cue boundaries:

| Cadence | Required maximum | Observed maximum |
| ---: | ---: | ---: |
| 60 fps | 8.334 ms | 8.321995 ms |
| 120 fps | 4.167 ms | 4.002268 ms |

These values are display-quantization bounds. Per-token uncertainty remains explicit in the alignment data and proof overlay.

## Semantic translation mapping

The English line is segmented into stable target spans. Each source-token group activates the target span carrying the corresponding meaning. The mapping can progress forward, jump backward, repeat a target, or activate several targets together.

This model handles source/translation word-order differences without moving text or forcing a false left-to-right progression. The renderer combines all active cue contributions per target, so overlapping mappings remain deterministic. Runtime validation requires valid source and target IDs, bounded cue intervals, documented confidence, and the expected non-linear sequences.

## Public and proof compositions

`LyricFilmVNext` renders the public 1080×1080 composition at 60 fps for 9,180 frames. It includes:

- native-grid artwork and deterministic texture;
- persistent frame chrome and section labels;
- stationary English lyrics with sample-driven semantic focus;
- a clean upper field with no diagnostic equalizer;
- a 64-band bottom spectrum;
- an original-title outro built inside the same visual system;
- an exact final fade.

`LyricFilmSyncProof` renders 18,360 frames at 120 fps. It uses the same timing authority while adding the active Russian token, English target ID, sample index, confidence, uncertainty, and signed frame error.

## Spectrum architecture

The feature generator creates one fixed-size record for each public frame from the locked soundtrack. The 64 logarithmic bands use a documented 20 Hz–20 kHz analysis range. Additional fields describe sustained pressure, transient impact, low-end weight, brightness, emotional emphasis, line reach, momentary dBFS, and sample peak dBFS.

The visual rail keeps measured magnitude and transient emphasis distinct. The measured core reaches at least 96 px at the verified peak. A lighter cap adds no more than 18 px and never changes the core value. Browser measurements verify the lyric-to-cap gap, safe-area containment, symmetry, and peak geometry.

## Media outputs

| Artifact | Technical result | SHA-256 |
| --- | --- | --- |
| 2× reference | 2160×2160, 60 fps, ProRes 4444, 12-bit 4:4:4, BT.709 | `5f16d78bc0132c89b0b38713a629b1cfef1b080990140d69f9a34ccd453d176d` |
| Production master | 1080×1080, 60 fps, 9,180 frames, 10-bit HEVC `hvc1`, AAC | `dfbafb175e26320640b583956bf34dc730f1ce9a19f26666bf97cd8208767b86` |
| Synchronization proof | 1080×1080, 120 fps, 18,360 frames, H.264, AAC | `0897bef71187fe01174b095447f9209951e2baf4cf6b6f65aa9619e775ae8310` |

The reference passes strict full decode. The production master and proof have an exact 153-second timeline and carry the same 6,591 AAC packets as the locked source stream.

## Verification system

The repository gates cover five layers:

1. source contracts: strict TypeScript, schema checks, hashes, and composition discovery;
2. timing contracts: sample geometry, token/cue validity, uncertainty, semantic mapping, and cadence bounds;
3. visual contracts: component behavior, browser-measured layout, spectrum geometry, public/proof separation, and selected encoded frames;
4. media contracts: dimensions, cadence, frame count, codec, pixel format, colour metadata, full decode, fast-start layout, audio packets, and timeline identity;
5. repeatability contracts: two complete QA executions with matching source, tools, artifacts, media probes, and independently extracted frame hashes.

The final evidence includes 129 generated QA artifacts plus a manifest. The two authoritative runs execute ten commands each and report no unexplained drift. Criteria and artifact references are recorded in [tanisea-final-qa-vnext.md](../audits/tanisea-final-qa-vnext.md) and [tanisea-final-qa-vnext.json](../audits/tanisea-final-qa-vnext.json).

## Reproduction

```sh
cd projects/tanisea-lyric-film
npm ci
npm run features
npm run alignment:verify
npm run check
npm run render
npm run encode
npm run proof
npm run qa:clips
npm run qa:run
```

Generated media and QA working files remain outside source control. The release source archive contains only tracked project files. Release checksums bind the production master, proof, lossless hero, source archive, alignment JSON, and final QA JSON.

## Boundaries of the claim

The alignment identifies reviewed audible token boundaries with stated uncertainty. The public and proof videos display those boundaries at finite frame cadences. The production master is therefore described by its sample-indexed authority and measured frame bounds; it does not claim that a rendered frame can reproduce sub-frame temporal detail.
