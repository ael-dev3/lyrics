# First-pass workflow for the next lyric film

**Preview before render:** follow [the mandatory preview-first workflow](preview-before-render.md). Deliver a playable review preview before full production. Complete synchronization review and obtain explicit render approval for the current song and reviewed revision before capture or encoding. A preview-only request stops at review delivery; passing tests, positive feedback, saved review notes, a merged PR or approval of an earlier song do not authorize rendering.

**Mandatory for future multilingual productions:** pass the [complete cross-language synchronization gate](cross-language-sync-gate.md) before starting full-length production rendering. Review the entire recording in all languages, including complete translated highlight spans. Diagnostic previews are review evidence, not permission to skip unfinished synchronization.

This is the production order for reusing the Tanisea system on another song. It front-loads timing authority and a short style lock so preventable synchronization, layout, and rendering problems are found before the full-length render.

Use the [current cinematic lyric standard](cinematic-lyric-workflow.md): stable color-only focus with precise timing. Earlier underline treatments are historical references and are not the default for new films.

For future bilingual films, apply the [equal-emphasis workflow](bilingual-lyric-workflow.md) before adopting historical visual defaults. English must match the original language's perceived size, weight, color strength, highlighting and timing precision.

For timing preparation, read the [connected-phoneme onset/release workflow](connected-phoneme-onset-workflow.md) and [Кометы’s mistakes and corrections](../projects/komety-lyric-film/PRODUCTION-LESSONS.md). Quiet vowel ownership, held direct-body release, complete translated expansions, neutral line lifetime and loaded-preview identity require separate first-pass checks. The Tanisea frame/profile values below are historical presentation references; they do not override current source-clocked, color-only contact or authorize a full production render.

## 1. Freeze the input contract

When the delivery includes TikTok, apply the established [profile-cover specification and review](tiktok-cover-workflow.md): a dedicated 1200×1600 portrait cover, title and concise artist-focused description. Do not repeat the landscape interpretation of the upload interface's “4:3” label.

Create an immutable input manifest before editing visuals. Record:

- source-audio filename, byte size, SHA-256, codec, sample rate, channels, and decoded sample count;
- any codec priming or leading-skip samples;
- original decoded extent and native picture cadence/PTS, plus planned public/proof frame counts where applicable;
- source and translated lyric text with stable line and token identifiers;
- artwork, font, and licence files with hashes;
- Node.js, npm, FFmpeg, FFprobe, Remotion, Chromium, and TypeScript versions.

Do not replace or normalize the soundtrack after timing begins. Decode once for analysis. Keep integer sample indices as the timing authority and derive seconds or frames only for display.

## 2. Build the alignment before animation

Use complementary observations for each vocal boundary:

1. waveform onset/offset inspection;
2. spectrogram inspection;
3. a bounded aligner or transcription observation, retaining independent model-family comparison where available.

Waveform and spectrum describe the same signal, and several crops or spelling variants of one recognizer are not independent votes. Store every candidate and selected boundary. Require explicit source/audio review when candidate spread exceeds 25 ms; smaller spreads are not a certificate. Inspect quiet connected prefixes and held endings even when models agree. Each source token record must include:

- stable token ID and line ID;
- start and exclusive end sample;
- confidence and uncertainty in samples;
- evidence-method identifiers;
- review note when uncertainty crosses the threshold.

Validate that tokens are ordered, line bounds contain their tokens, intervals are positive, and all samples fit the retained decoded audio.

Do not equate a sparse strong grapheme core with the first phonetic entry. Inspect the preceding final vowel/nasal transition, quiet opening, internal consonant and stressed vowel in original-clock context. Connected singing needs no silence-separated attack. Record an explicit prior-release/new-onset handoff when supported, retain real gaps and per-occurrence uncertainty, and reject universal anticipation or copied chorus timing. Follow [the ownership procedure](connected-phoneme-onset-workflow.md#3-resolve-connected-lexical-ownership).

Separate a recognizer's phonetic core from the audible release of a held vowel. Inspect the tail in the original mix and vocal stem; stem RMS can include reverberation or separation leakage. Keep automatic extension limits, spectral overrides and uncertainty visible, and never treat a fixed extension cap as proof of a release. Recompute refinements from an unchanged core draft so repeated runs cannot extend the same word again. Review each repeated phrase independently, and apply the selected source release to its complete translated meaning.

## 3. Map meaning, not English reading order

Keep English segments stationary. For every performed source group, map the English segment carrying the same meaning. Record:

- semantic cue ID;
- source token IDs;
- target English segment IDs;
- cue start and exclusive end sample;
- forward, backward, repeated, or simultaneous activation.

Both languages use those same source events for focus onset, handoff and release. English receives equivalent emphasis at word or semantic-group level, including when its natural word order differs.

Review repeated choruses as independent performances. Never copy timestamps from the first chorus to the second. Pair repeated lines only for presentation-quality comparison.

## 4. Lock one presentation profile

The timing values below are starting references from Tanisea, not universal settings. Confirm them against the new recording and derive sample counts from its actual sample rate; the listed sample counts use 44.1 kHz. Apply the current cinematic treatment and verify that any attack or release animation preserves the selected vocal contact:

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
| Inactive lyric contrast | Choose from the track palette; both active and inactive words remain readable at native and mobile size |
| Focus treatment | Color and luminance only; stable glyph positions |
| Contact underline | None unless explicitly requested |

Apply the same profile to repeated sections. Preserve explicit card/outro transitions as named milestones. If a long inter-line gap needs a hold, encode it as an explicit rule and test it; do not allow incidental blank or stacked frames.

Keep word focus’s immediate source contact separate from the complete line’s neutral full-opacity hold and fade. Select the hold from reviewed voice/decay support; if a gentle fade cannot fit, replace the outgoing line atomically at the next actual vocal instead of cutting at a gap midpoint or compressing a fade. Historical focus-attack/residual-release frame counts must not delay onset or extend lexical ownership. See [held-body and line-lifetime review](connected-phoneme-onset-workflow.md#4-audit-held-releases-independently).

Apply typography, active/inactive color roles and focus strength equally to both lyric languages. Reflow long translations or rebalance the layout instead of reducing English alone. Historical font sizes and subtitle styling do not override the current equal-emphasis requirement.

## 5. Produce a short style lock

Before the complete composition, render one 10–15 second prototype containing:

- a quiet line;
- the fastest lyric handoff;
- a backward semantic activation;
- the densest/widest translated line;
- a spectrum peak;
- the transition into or out of a card.

Create a six-frame contact sheet and a boundary sheet at offsets `-1`, `0`, `+1`, and `+2` around each high-risk contact. Inspect the prototype at native size and at the intended mobile display size. Freeze typography, focus behavior, palette, safe area, and spectrum geometry after this pass.

Pass the [bilingual style-preview acceptance gate](bilingual-lyric-workflow.md#style-preview-acceptance-gate) in each requested aspect ratio before freezing the profile. Check perceived size and weight, active/inactive contrast, equivalent highlight behavior and shared semantic timing for both languages.

## 6. Keep the visualizer calm by construction

Generate deterministic 64-band logarithmic analysis from 20 Hz to 20 kHz. Use one feature record per public frame and store the generator settings and hashes.

Choose intensity from the current song's arrangement and picture. For gentle material, begin with the [restrained Твои глаза approach](../projects/tvoi-glaza-lyric-film/PRODUCTION-LESSONS.md#the-restrained-visualizer): compact bars, modest travel, subdued opacity and stable bilingual focus. Record the actual measurement-to-height mapping, geometry and fade. Confirm the selected approach with audio in both formats before freezing it.

Historical Tanisea profile, available when its larger motion suits the new track:

- symmetric `[1, 2, 3, 2, 1]` temporal and spatial smoothing;
- one flat-ended 4 px SVG line per band;
- 2–96 px measured travel;
- 0–18 px transient extension in the same line;
- 114 px maximum total travel;
- no separate cap, circle, or dot;
- restrained two-tone ember/teal palette;
- 36 px minimum lyric-to-spectrum clearance.

Test element count, geometry, palette, flat endings, and absence of separate impact elements in static markup. Measure peak geometry in Chromium rather than inferring it from CSS or SVG source.

Keep all artistic smoothing, nonlinear scaling and transient extension separate from the raw measured artifact. Label a calibrated instrument with its true scale; describe an unlabeled decorative spectrum as an artistic display of measured bands. The historical travel ranges above do not set a minimum for future songs.

## 7. Write the failure tests first

Before changing production behavior, add tests that fail for the old implementation. The minimum timing suite must prove:

- source identity and clock are unchanged, and any explicitly reviewed sample corrections match their selected layer;
- frame conversion uses nearest-frame rounding;
- 60 fps boundary error is at most half a frame;
- 120 fps boundary error is at most half a frame;
- incoming lines settle before contact;
- reviewed outgoing/incoming handoffs have no unintended blank or ghosted text, including atomic replacement when a gentle fade cannot fit;
- lexical focus follows selected exclusive source bounds; decorative attack/release does not delay or extend word ownership;
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

Reload and verify the timeline actually loaded in memory, its source hash, selected samples and both languages’ active words. Track native picture PTS separately from the source word clock: a 25 fps picture may be held while word focus repaints at display cadence. Inspect actual moving picture, seek/recovery and both layouts; neither a rebuilt file nor advancing audio proves the complete preview is current. See [runtime identity checks](connected-phoneme-onset-workflow.md#6-prove-the-loaded-preview-and-measure-presentation-separately).

Verify that every diagnostic still actually uses its requested timestamp. With a pre-resolved Remotion composition, update its resolved `props` as well as the renderer's `inputProps`; otherwise a retained default can silently produce the same frame under different filenames. Inspect visibly distinct source moments before trusting a contact sheet. For text collision checks, distinguish a font's em box from visible ink: combine browser horizontal bounds with actual glyph ascent/descent, then inspect the image at native and mobile size.

## 10. Build final media once

The [cross-language sync review](cross-language-sync-gate.md) must be complete and refer to the exact current audio, lyrics, mappings, timing and presentation behavior. Wire this check into every production render entry point for a new project; missing, incomplete or stale evidence must stop capture.

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

POSIX shells:

```sh
TANISEA_QA_RUN=run-1 npm run qa:run
TANISEA_QA_RUN=run-2 npm run qa:run
```

PowerShell:

```powershell
$env:TANISEA_QA_RUN = 'run-1'; npm run qa:run
$env:TANISEA_QA_RUN = 'run-2'; npm run qa:run
Remove-Item Env:TANISEA_QA_RUN
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
