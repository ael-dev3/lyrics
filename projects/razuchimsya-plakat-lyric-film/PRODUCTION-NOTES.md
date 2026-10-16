# Разучимся плакать — process and decisions

## 1. Source and clock

The supplied original is 1080×1080 AV1 at 25 fps with stereo 48 kHz Opus. Its SHA-256 is `1a2efa9d95b57fe72ff56e8028a39793ef1a69e0d10a8ed47fbcf25885ed855c`; size 16,160,865 bytes. Video contains 5,676 frames through 227.040 s. Container/audio duration is 227.074 s; FFmpeg decodes 10,899,504 audio frames, or 227.073 s. The decoder handles 312-sample Opus pre-skip; applying another offset would misalign the words.

The first decoded source picture is the fixed crop/protection reference. Its pixels were compared exactly with the preparation reference. The preview still draws the actual native video at its current source time; the reference supports exact pixel and local illustration checks. Original source decoding and source identity are distinct from screenshot or model checks.

Demucs `htdemucs` supplies an estimated vocal for analysis only. It returns 44.1 kHz stems. Recombination cross-correlation found zero lag; rounded output length differs by one 44.1 kHz sample. Recombined stem RMS differs from the original by about 15.4%, so the stem is not treated as an amplitude-exact replacement or production soundtrack. Original stereo measurements drive the visualizer.

## 2. Performed coverage before alignment

The supplied timestamped reference was preserved unchanged in ignored analysis storage. Unprompted Whisper large-v3-turbo examined overlapping source and estimated-vocal crops. A small Whisper model provided targeted comparisons; these remain correlated family evidence. Ten shorter source crops resolved repeated-line coverage that the broad passes compressed or omitted.

The complete map contains four first-half and seven second-half «Насколько мне хочется жить» performances, plus the closing exclamation. Each has its own samples. Do not reduce the count to the broad ASR result or copy one repeat’s endpoints to the others. The final instrumental passage keeps the source picture and measured response while lyrics clear.

«Весенняя зряка» is not retained as a lyric. Source/stem recognition and the conditioned phonetic sequence support **слякоть**. The closing unstressed **Ну / Но** remains a listening-review point; the preview retains the supplied **Ну** and an English exclamation. No extra backing words or instrumental transcription tags are displayed.

## 3. Word and release proposals

TorchAudio MMS_FA provides a different model family: 20 ms encoder stride, 25 ms receptive field and first encoder center 12.46875 ms after crop start. Its character cores are observations, not certified physical boundaries. Public evidence keeps source words, scores and ranges; tokenizer preprocessing stays private and is never a pronunciation layer.

A conditioned stable-ts/Whisper pass covered the same 26 phrases. Its stretched openings produced zero-length/misassigned words and were rejected. Elsewhere it often assigns preceding silence to a crop’s first word or ends held vowels too soon. Weak forced final consonants can also fall in decay long after the main word. Neither alignment is promoted automatically.

The selected preview proposals in `scripts/build-timeline.py` synthesize the original/stem activity, bounded recognition and character paths. Every event has integer 48 kHz onset and exclusive-end samples in `evidence/timing-selections.json`. The point labels describe storage precision; they do not establish millisecond listening accuracy. Current uncertainties, particularly direct body versus reverb at held releases, remain pending listener judgment.

Lexical focus, neutral reading hold and fade are separate. A complete bilingual block stays opaque throughout its word events. Where a gentle fade has room, it follows the neutral hold; short gaps use a mutually exclusive handoff at the next vocal. The incoming first focused glyph is fully opaque. Paused playback repaints at the actual stopped media time.

### v1.1 held-release correction

A second source/stem pass inspected 34 separated held positions with 64 ms spectral windows and 5 ms plotting hops. It extended 29 focus ends, retained five and preserved every onset. The old cutoff sometimes occurred near full vocal level. The selected layer retains each reason and diagnostic value, applies once against the committed baseline and feeds the complete English meaning as well as Russian. [The full audit](HELD-RELEASE-REVIEW.md) distinguishes direct vocal, passive decay and neutral reading. A 5 ms view hop is not a physical-precision claim or a listening attestation.

## 4. Translation and meaning focus

Both languages use the same static Cormorant Garamond Semibold font, size, resting linen and brighter warm-gold focus. English receives equal reading space and event precision. Words stay in place; only their color changes.

Mappings favor individual words. Required completions share the corresponding source event: **the sun**, **how much**, **will arrive**, **to live**. Reordered English follows source ownership rather than fabricated English timestamps. Focus is the union of linked source intervals, not their enclosing span.

The extended shard construction stays one complete reading block with a semantic line break. Russian nominative **я** and later infinitive-subject dative **мне** describe the same speaker; the single English **I** responds separately to both. English **of crockery** follows **посуды**, while **shard** follows **осколок**. The source’s unusual syntax is preserved without inventing a new beloved or object.

The closing emphatic **как же** shares English **how**; both separately sung contributors remain active in the original language. The heart passage uses natural English body-part possession, with its mapping documented. These are grammatical decisions, not a license to group whole lines for convenience.

## 5. Composition and one continuous music line

- Landscape: one source crop `[0,300,1080,607.5]`, uniformly scaled to 1920×1080.
- Portrait: one source crop `[106,0,607.5,1080]`, uniformly scaled to 1080×1920. The full figure stays within the crop.
- Reading stays above the head. Portrait uses 832 px of centered reading width with 124 px side margins. Both languages retain the same 64 px Semibold setting; long thoughts reflow equally.
- A continuous elliptical carpet exposure shade fades to zero before the person. It is independent of lyric visibility and has no hard rectangular edge.
- One **warm-ivory continuous line** (`#ded3b7`) sits in reserved space below every lyric block. Its endpoints and width remain fixed. A small local dark shadow supplies contrast; no filled area, second rail, broad bloom, moving camera or fabricated material lighting is added.
- Original stereo power is measured at 50 Hz in 24 logarithmic bands. Its centered 2,048-sample / 22.05 kHz spectral window spans about 93 ms. Display range −61 to −20 dB, `[1,2,1]` neighboring-band smoothing, 60 ms attack and 280 ms release soften motion. The RMS activity gate and source-ending fade control visibility. These are artistic display settings, separate from word focus.
- Seventy-three control points interpolate the 24 measured bands. A fixed two-cycle spatial profile, tapered to zero at each endpoint, turns their levels into small vertical bends; quadratic smoothing joins them into one path. This adapts the [continuous ribbon lesson](../lyubi-menya-lyubi-lyric-film/PRODUCTION-LESSONS.md#a-continuous-ribbon-can-carry-restrained-musical-motion). It is an authored musical contour, neither a physical waveform nor a vocal-pitch trace. There is no independent idle oscillation.

| Geometry | Landscape | Portrait |
| --- | ---: | ---: |
| Center x / baseline y | 960 / 403 | 540 / 880 |
| Width | 620 | 650 |
| Maximum deviation in either direction | 20 | 26 |
| Stroke width | 3.4 | 4.4 |
| Maximum opacity | 0.88 | 0.88 |

The initial rust-pigment response blended into the bedspread and did not read clearly as a visualizer. A trial bar row made the response obvious but introduced too many sharp edges for the gentle recording. The adopted single line keeps a clear musical presence with less visual clutter. The old v1 evidence keeps its original revision; current browser stills show the new line.

Downscaled on/off differences confirm that the line contributes visible pixels at 480 px landscape and 320 px portrait. Numerical deltas alone do not establish artistic fit: the former pigment also produced measurable differences. Inspect the complete real browser at player size, both quietly and in stronger passages, with the original recording.

## 6. Display and transport verification

`npm run check` compares all source/target focus states in both formats, exact integer boundaries, semantic expansions and clear gaps. It tests the actual painted focus color, not only booleans. Glyph sampling uses actual ascent/descent so a neighboring line’s active descender cannot produce a false positive. Protected figure pixels sampled on a three-pixel grid match the uniformly cropped source exactly.

The real in-app browser decoded the 1080-square source, played with unmuted original audio, advanced native picture PTS separately from word time, sought into later repeats, switched layouts and played at half speed. Recovery retained time, format and sound state. Browser-exported canvas images document actual preview presentation. Full normal-speed and uncertain-word listening review is not claimed by those transport observations.

The owner subsequently accepted this exact v1.1 preview and directed production. Both full films and the upload kit now pass encoded-file and Desktop-copy checks. [The production record](PRODUCTION-DELIVERY.md) documents authorization scope, representative browser/native parity, complete native-picture coverage, the AAC correction, encoded glyph states and delivery. Owner acceptance, unlogged granular listening fields and technical verification remain separately identified.

## Reusable lessons

1. Repeated lyric coverage can disappear in broad ASR even when multiple runs agree. Recheck individual performances before alignment.
2. A model can produce confident-looking output for an unusable stretched-word path. Keep the disagreement and reject collapsed allocations.
3. A plausible material response may still be too hard to recognize. Compare a single continuous line when a gentle song and busy photo make individual bars feel cluttered. Choose the form by the recording, not an assumed engagement result.
4. Precompute measured display envelopes and use a fixed-weight font to remove avoidable seek stalls and cross-renderer weight ambiguity.
5. Passing glyph tests can conceal a wrong acoustic release. Add independent late-body anchors that fail the former cutoff, while keeping signal inspection and listening review distinct.
6. Frame-fit, semantic focus, actual painted glyphs, listening review and production approval answer different questions. Preserve each evidence scope.
