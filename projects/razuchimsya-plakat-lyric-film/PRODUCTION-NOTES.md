# Разучимся плакать — process and decisions

## 1. Source and clock

The supplied original is 1080×1080 AV1 at 25 fps with stereo 48 kHz Opus. Its SHA-256 is `1a2efa9d95b57fe72ff56e8028a39793ef1a69e0d10a8ed47fbcf25885ed855c`; size 16,160,865 bytes. Video contains 5,676 frames through 227.040 s. Container/audio duration is 227.074 s; FFmpeg decodes 10,899,504 audio frames, or 227.073 s. The decoder handles 312-sample Opus pre-skip; applying another offset would misalign the words.

The first decoded source picture is the fixed material-mask reference. Its pixels were compared exactly with the preparation reference. The preview still draws the actual native video at its current source time; the reference only defines the receiving pigment. Original source decoding and source identity are distinct from screenshot or model checks.

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

## 4. Translation and meaning focus

Both languages use the same static Cormorant Garamond Semibold font, size, resting linen and brighter warm-gold focus. English receives equal reading space and event precision. Words stay in place; only their color changes.

Mappings favor individual words. Required completions share the corresponding source event: **the sun**, **how much**, **will arrive**, **to live**. Reordered English follows source ownership rather than fabricated English timestamps. Focus is the union of linked source intervals, not their enclosing span.

The extended shard construction stays one complete reading block with a semantic line break. Russian nominative **я** and later infinitive-subject dative **мне** describe the same speaker; the single English **I** responds separately to both. English **of crockery** follows **посуды**, while **shard** follows **осколок**. The source’s unusual syntax is preserved without inventing a new beloved or object.

The closing emphatic **как же** shares English **how**; both separately sung contributors remain active in the original language. The heart passage uses natural English body-part possession, with its mapping documented. These are grammatical decisions, not a license to group whole lines for convenience.

## 5. Composition and measured embroidery

- Landscape: one source crop `[0,300,1080,607.5]`, uniformly scaled to 1920×1080.
- Portrait: one source crop `[106,0,607.5,1080]`, uniformly scaled to 1080×1920. The full figure stays within the crop.
- Reading stays above the head. Portrait uses 832 px of centered reading width, leaving 124 px side margins. Longer thoughts reflow at the same size in both languages.
- A continuous elliptical carpet exposure shade fades to zero before the person. It is independent of lyric visibility and has no hard rectangular edge.
- Twenty-four receiving masks occupy actual rust pigment at source rectangle `[12,854,632,45]`. They exclude the pale cloth, skin, wall, furniture and floor. Every mask is prepared before the first preview frame.
- Original stereo power is measured at 50 Hz in 24 logarithmic bands. Its centered 2,048-sample / 22.05 kHz spectral window spans about 93 ms; this musical display does not certify a word or beat onset. Fixed display range −61 to −20 dB, three-band spatial smoothing and 65 ms attack / 300 ms release produce restrained exposure changes. Maximum screen-blend opacity is 0.72. These are artistic display settings, not measured vocal boundaries.
- Anchors and silhouettes never move. No artificial branch, window, floating object, reflected strip, added scenery or simulated beat is needed. The receiving cloth’s own texture carries the motion.

The material response is intended to support the voice. Technical anchoring and correct power lookup do not establish creative acceptance with sound; that remains part of complete-preview review.

## 6. Display and transport verification

`npm run check` compares all source/target focus states in both formats, exact integer boundaries, semantic expansions and clear gaps. It tests the actual painted focus color, not only booleans. Glyph sampling uses actual ascent/descent so a neighboring line’s active descender cannot produce a false positive. Protected figure pixels sampled on a three-pixel grid match the uniformly cropped source exactly.

The real in-app browser decoded the 1080-square source, played with unmuted original audio, advanced native picture PTS separately from word time, sought into later repeats, switched layouts and played at half speed. Recovery retained time, format and sound state. Browser-exported canvas images document actual preview presentation. Full normal-speed and uncertain-word listening review is not claimed by those transport observations.

No full film or platform upload kit has been created. Keep the current identity pending until the owner reviews and explicitly approves production. Future capture must compare browser/native glyphs and current source frames, preserve the original audio tail with a final-picture hold, validate decoded output and prepare separate covers/copy under the repository workflow.

## Reusable lessons

1. Repeated lyric coverage can disappear in broad ASR even when multiple runs agree. Recheck individual performances before alignment.
2. A model can produce confident-looking output for an unusable stretched-word path. Keep the disagreement and reject collapsed allocations.
3. Existing textile pigment can host musical response without changing the photographed object’s silhouette or introducing new scenery.
4. Precompute masks and use a fixed-weight font to remove avoidable seek stalls and cross-renderer weight ambiguity.
5. Frame-fit, semantic focus, actual painted glyphs, listening review and production approval answer different questions. Preserve each evidence scope.
