# First-pass workflow for the next lyric film

This is the production order for reusing the Tanisea system on another song. It front-loads timing authority and a short style lock so preventable synchronization, layout, and rendering problems are found before the full-length render.

## 1. Freeze the input contract

Create an immutable input manifest before editing visuals. Record:

- source-audio filename, byte size, SHA-256, codec, sample rate, channels, and decoded sample count;
- any codec priming or leading-skip samples;
- authoritative public duration and frame counts at 60 and 120 fps;
- source and translated lyric text with stable line and token identifiers;
- artwork, font, and licence files with hashes;
- Node.js, npm, FFmpeg, FFprobe, Remotion, Chromium, and TypeScript versions.

Do not replace or normalize the soundtrack after timing begins. Decode once for analysis. Keep integer sample indices as the timing authority and derive seconds or frames only for display.

## 2. Build the alignment before animation

Use at least three independent observations for each vocal boundary:

1. waveform onset/offset inspection;
2. spectrogram inspection;
3. an external aligner or transcription observation.

Store every candidate and the selected boundary. Require manual review when candidate spread exceeds 25 ms. Each source token record must include:

- stable token ID and line ID;
- start and exclusive end sample;
- confidence and uncertainty in samples;
- evidence-method identifiers;
- review note when uncertainty crosses the threshold.

Validate that tokens are ordered, line bounds contain their tokens, intervals are positive, and all samples fit the retained decoded audio.

## 3. Map meaning, not English reading order

Keep English segments stationary. For every performed source group, map the English segment carrying the same meaning. Record:

- semantic cue ID;
- source token IDs;
- target English segment IDs;
- cue start and exclusive end sample;
- forward, backward, repeated, or simultaneous activation.

Review repeated choruses as independent performances. Never copy timestamps from the first chorus to the second. Pair repeated lines only for presentation-quality comparison.

## 4. Lock one presentation profile

Use the Tanisea cinematic defaults unless the new song's prototype demonstrates a specific reason to change them:

| Parameter | Default |
| --- | ---: |
| Public cadence | 60 fps |
| Proof cadence | 120 fps |
| Line entrance lead | 10,584 samples / 240 ms |
| Line settled before vocal | 2,205 samples / 50 ms |
| Lyric crossfade | 8,379 samples / 190 ms |
| Semantic release hold | 1,470 samples / 33.333 ms |
| Focus attack | 3 frames |
| Residual release | 2 frames |
| Inactive lyric opacity | 0.62 |
| Contact underline | 3 px |

Apply the same profile to repeated sections. Preserve explicit card/outro transitions as named milestones. If a long inter-line gap needs a hold, encode it as an explicit rule and test it; do not allow incidental blank or stacked frames.

## 5. Produce a short style lock

Before the complete composition, render one 10–15 second prototype containing:

- a quiet line;
- the fastest lyric handoff;
- a backward semantic activation;
- the densest/widest translated line;
- a spectrum peak;
- the transition into or out of a card.

Create a six-frame contact sheet and a boundary sheet at offsets `-1`, `0`, `+1`, and `+2` around each high-risk contact. Inspect the prototype at native size and at the intended mobile display size. Freeze typography, focus behavior, palette, safe area, and spectrum geometry after this pass.

## 6. Keep the visualizer calm by construction

Generate deterministic 64-band logarithmic analysis from 20 Hz to 20 kHz. Use one feature record per public frame and store the generator settings and hashes.

Tanisea defaults:

- symmetric `[1, 2, 3, 2, 1]` temporal and spatial smoothing;
- one flat-ended 4 px SVG line per band;
- 2–96 px measured travel;
- 0–18 px transient extension in the same line;
- 114 px maximum total travel;
- no separate cap, circle, or dot;
- restrained two-tone ember/teal palette;
- 36 px minimum lyric-to-spectrum clearance.

Test element count, geometry, palette, flat endings, and absence of separate impact elements in static markup. Measure peak geometry in Chromium rather than inferring it from CSS or SVG source.

## 7. Write the failure tests first

Before changing production behavior, add tests that fail for the old implementation. The minimum timing suite must prove:

- literal vocal and cue samples are unchanged;
- frame conversion uses nearest-frame rounding;
- 60 fps boundary error is at most half a frame;
- 120 fps boundary error is at most half a frame;
- incoming lines settle before contact;
- required outgoing/incoming overlap exists at high-risk handoffs;
- focus attack and residual release states match at contact offsets;
- repeated sections use the same presentation profile;
- semantic targets follow the performed source order;
- exclusive cue ends release correctly;
- glyph rectangles do not move while focus changes.

Run only the new tests and capture the expected failure. Implement the smallest production change, rerun the focused tests, then run the complete check.

## 8. Run the development gate

From the project directory:

```sh
npm ci
npm run features
npm run alignment:verify
npm run check
```

`npm run check` must pass strict typechecking, the complete test suite, browser layout verification, and both composition definitions. Treat fixture-generated corrupt-media warnings as expected only when the tests explicitly assert those failures.

## 9. Render targeted review evidence

For each repeated or high-risk passage, render matched-duration public clips with soundtrack. Generate:

- relative-time comparison sheet;
- semantically aligned contact sheet;
- contact frames at `-1`, `0`, `+1`, and `+2` for 60 and 120 fps;
- exclusive-end frames at the same offsets;
- spectrum peak still;
- README screenshot from a representative revised frame.

Compare presentation behavior, not copied timestamps. Different performances keep their independent sample cues.

## 10. Build final media once

Use the tested source revision for every final artifact:

```sh
npm run render
npm run encode
npm run proof
npm run verify
```

The reference render is muted 2160×2160 4:4:4 10-bit ProRes. Normalize its timeline, downsample once to the 1080×1080 10-bit HEVC production master, and stream-copy the locked AAC. Render the 120 fps proof from the same source and stream-copy the same AAC packets.

Do not use a review MP4 as an intermediate for final encoding.

## 11. Execute the release matrix twice

Run the canonical matrix in two empty immutable run directories:

```sh
npm run qa:run -- --run-id=run-1
npm run qa:run -- --run-id=run-2
```

Both runs must verify:

- alignment authority and uncertainty bounds;
- typecheck, tests, layout, and compositions;
- reference, production master, and proof metadata;
- full strict decode;
- frame count, duration, colour, pixel format, and fast-start layout;
- AAC packet identity between source, master, and proof;
- selected encoded frames;
- generated QA clips, stills, contact frames, release frames, and manifests;
- exact run-to-run comparison with no unexplained drift.

## 12. Package from a committed source revision

Create the source archive from the release source commit, not from an uncommitted working directory. Package these release assets:

- production master;
- 120 fps synchronization proof;
- README screenshot;
- tracked source archive;
- alignment JSON and human-readable alignment report;
- final QA JSON and Markdown;
- core checksum file;
- workflow evidence archive;
- workflow evidence manifest;
- workflow checksum file.

The workflow archive should contain alignment provenance, both QA runs and logs, QA media, final visual-review files, publication records, and the exact workflow documents. Exclude dependencies, caches, models, decoded intermediates, replaceable runtime downloads, superseded review attempts, and downloaded release copies.

## 13. Verify publication from remote bytes

After upload:

1. download every release asset from its immutable release URL;
2. compare byte size and SHA-256 with the local package;
3. run the checksum files against the downloads;
4. verify the release tag resolves to the intended source commit;
5. verify README links and the screenshot render publicly;
6. record the URLs, sizes, hashes, and matched-after-download result in the final QA report;
7. scan the workflow archive for absolute paths, credentials, unsafe entries, and private build narration.

Only then update the public workflow index.

## Definition of done

The next song is release-ready when all sample authority is reviewed, the style-lock prototype covers the highest-risk behavior, focused and full tests pass, paired visual evidence has no unresolved discrepancy, final media strictly decodes, two complete QA runs match, and every remote release byte matches its checksum.

