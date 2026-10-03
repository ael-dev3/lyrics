# По камушку — exact production notes

Production continuation for **По камушку — Settlers**, frozen preview revision `po-kamushku-preview-v6-full-onset-visibility`.

**Both final films verified and the Desktop upload kit delivered.** Current-song authorization and the owner-attested completed listening review are separate from the historical signal audit. The complete encoded-file, decoded-scene, staging and Desktop-copy reports now record their actual results. Remote asset publication has its own receipt; a local delivery is not proof of a GitHub upload.

[Reusable lessons](PRODUCTION-LESSONS.md) · [Project overview](README.md) · [Handoff](AGENT-HANDOFF.md)

## 1. Locked source and runtime

| Item | Frozen value |
| --- | --- |
| Official recording | [По камушку · Settlers](https://www.youtube.com/watch?v=oysjDP9Vqdg) |
| Source acquisition | Video format 137 plus audio format 140, remuxed; exact archived bytes are authoritative |
| Source SHA-256 | `f6572759f48f725497ad42b7c84cf12825824041897c47fdd36832a40ad30dd6` |
| Source size | 5,884,882 bytes |
| Picture | H.264, 1080×1080, 25/1 fps, 5,220 frames, 208.800 s |
| Soundtrack | Original stereo AAC, 44,100 Hz, container extent 208.809002 s |
| Decoded analysis extent | 9,209,280 samples, 208.82721088435375 s |
| Original source offset | Zero |
| First AAC packet | PTS −1,600 at 44.1 kHz; decoder skip metadata specifies 1,600 priming samples |
| Font | Alegreya, requested weight 500; bundled variable face, SIL Open Font License 1.1 |
| Font SHA-256 | `ba5564634b93a8f8ba57b48cd4f1ae7417d2b4656fbac779028679b00de3cf12` |
| Node / npm | v24.20.0 / 11.19.0 |
| FFmpeg | 8.1.2 |
| Pinned project dependencies | esbuild 0.28.2, TypeScript 7.0.2, `@napi-rs/canvas` 0.1.100; exact dependency tree in package-lock |

The upload metadata credits Settlers, Шелпакова Яна Петровна and Судосьев Олег Павлович; ℗ Snegiri-music, released 2025-09-26, distributed to YouTube by ONErpm. It does not identify a separate artwork creator. Music, lyrics, source artwork and font retain their respective rights.

The small difference between decoded audio samples, AAC container extent and native picture duration is documented, not corrected with a lyric offset. Decoders honor source skip metadata. Do not trim the beginning or compensate for priming twice.

## 2. Files and authority

| File | Role |
| --- | --- |
| `source/manifest.json` | Source bytes, metadata, original picture/audio clocks, runtime and font identity |
| `source/lyrics-editorial.json` | Unchanged supplied reference, performed inventory, complete own English translation, semantic ownership and text-authored regression expectations |
| `source/timing-candidate.json` | Canonical integer 44.1 kHz word samples, selected/rejected observations, uncertainty and historical correction provenance |
| `source/independent-timing-review.json` | Separately preserved independent proposals; original rejected intro proposal remains historical evidence |
| `source/line-visibility.json` | Occurrence-specific neutral reading holds, separate from word focus |
| `public/timeline.json` | Generated complete renderer timeline; do not edit by hand |
| `public/audio-features.json` | Source-bound measured stereo powers and transient observations |
| `public/stone-anchors.json` | Fixed receiving polygons inside actual photographed stones and protected central region |
| `public/material-reference.png` | Frozen lossless source sample used only for deterministic material-mask calculation |
| `src/model.ts` | Sample focus, semantic interval unions and reading-window contracts |
| `src/scene.ts` | Shared scene, material masks, bounded relighting, equal bilingual layout and current glyph paint state |
| `src/player.ts` | Actual source-video clock, decoded picture PTS, display repaint, seeking/recovery and loaded-identity diagnostics |
| `evidence/preview-inputs.json` | Twelve frozen preview input hashes, cue inventory and loaded revision |
| `evidence/final-sync-audit.json` | Final v6 signal/display audit with its actual method, uncertainty and preview evidence scope |
| `evidence/sync-review.json` | Current supplied listening-review scope; separate from machine inspection |
| `evidence/production-authorization.json` | Current production authorization bound to frozen inputs |
| `evidence/cross-language-sync-review.md` | Human-readable review/authorization scope |
| `scripts/render-gate.ts` | Fail-closed production admission; current authorization must match inputs |
| `scripts/render-production.ts` | Source-frame decode and shared-scene production adapter |
| `scripts/verify-render-clock.ts` | Independent integer cadence, canonical sample focus, held final picture and raw-stream fragmentation checks |
| `scripts/verify-final.ts` | Complete encoded-file/source-audio/black-interval verification |
| `scripts/verify-decoded-scene.ts` | Decoded final-scene comparison against approved rendering |
| `scripts/make-covers.ts` / `scripts/make-captions.ts` | Source-art platform covers and optional separate cue-level caption sidecars |
| `scripts/package-delivery.ts` | Fail-closed, hash-verified local staging after both complete verification reports and cover review pass |
| `evidence/final-verification.json` | Passed complete encoded-file technical results for both films |
| `evidence/decoded-scene-verification.json` | Passed decoded scene and bilingual glyph checks for both films |

Private stems, model checkpoints, raw recognition outputs and scratch spectra support the review. They are not the soundtrack, ordinary source-history payloads, or a replacement for recorded listening scope. Public records use neutral process descriptions and relative repository paths; they contain no private quotations, ratings or account details.

## 3. Exact visual parameter sheet

| Quantity | Native square | Portrait |
| --- | --- | --- |
| Stage | 1080×1080 | 1080×1920 |
| Foreground source | Entire 1080×1080 square at y=0 | Entire square at y=212 |
| Reading width | 956 px | 864 px |
| Initial type size, ≤6 tokens in larger language lane | 61 px | 72 px |
| Initial type size, longer pair | 53 px | 65 px |
| Joint fitting floor | 43 px | 43 px |
| Maximum total rows | 4 | 6 |
| Pair bottom | y=1018 | y=1645 |
| Line leading / language gap | 1.13× / .38× chosen type size | Same |
| Subject protection | x=342–682, y=260–701 in source coordinates | Same protected source region after y offset |

Both lanes use Alegreya 500 with rest `#ece5db`, focus `#e0b797` and dark shadow `#080807`. Active shadow is warm and bounded; glyph shadow is assigned before outline and body. Outline width is 2.4 px. No token moves or changes width while focus changes.

Portrait fill uses empty upper/lower source soil at opacity .33 with 22 px blur; a 38 px edge feather softens the square's empty-soil perimeter. Native continuous reading shade begins at y=745; portrait shade begins at y=1290. It protects the reading surface without introducing a cue-shaped panel or obscuring the central subject. Credit type is 23 px at opacity .66.

Thirty stone polygons use original 1080-square coordinates, 24 fixed bands and 7 px inward feather. The mask takes source luminance to the .6 power, with bounded qualitative directional light. `stoneResponse` applies the exact formula in the [lessons](PRODUCTION-LESSONS.md#2-environmental-response-needs-real-receiving-surfaces). Final screen opacity is response×.92; lower native stones beneath the reading region receive .48 weighting while a cue is visible. Source texture stays present. Mask caches are prepared before the first complete frame reveal.

The canonical material reference is not a picture replacement. Preview draws the original video; production decodes all original frames. The spectrum's fixed stone placement follows the artwork, not an automatic physical claim that a rock resonates at its assigned frequency.

## 4. Measured features and their limits

`npm run features` invokes `scripts/analyze-audio.ts` on the exact source. It decodes stereo at 22,050 Hz without moving source zero, keeps channel powers separate before averaging, and produces 5,221 rows on the original 25 Hz timeline.

| Measurement | Value |
| --- | --- |
| Frequency bands | 24 logarithmic bands, 40–10,000 Hz |
| FFT | Centered 4,096-sample Hann, approximately 185.760 ms support |
| RMS window | 40 ms |
| Transient observation | Approximately 20.045 ms short window, 20 ms lag, 4.989 ms sampling step |
| Encoding | uint8 rows `[rms, transient, band0, …, band23]` |
| RMS/band decoding | `−96 + value * 96 / 255` dBFS mean-square power |
| Transient decoding | `value * 18 / 255` dB positive short-window rise |
| Row lookup | Linear interpolation by locked source time |

Band power accounts for the Hann normalization; low-frequency bands retain finite FFT resolution. Centered windows include neighboring samples and do not identify exact beats or words. The current stone effect uses RMS and band values. Transient measurements remain available evidence, not an additional hidden animation driver.

The final v6 audit rebuilt features byte-identically with SHA-256 `4ca1135db51abcc66fe914460b179423061b322d6c8e8df8dbd13c75721116a6`. This establishes reproducibility in the recorded runtime, not universal cross-version decoder identity.

## 5. Word, meaning and reading clocks

The source inventory contains 30 cues, 19 templates, 163 performed source events and 206 target tokens. The reference has 31 supplied lines; combining the fate/person construction into one coherent bilingual cue changes presentation grouping without removing performed words. All repeated run/carry words and all four pebble refrains have distinct occurrence IDs.

For a word at source time `t`, focus is active exactly when `startSample ≤ t*44100 < endSample`, with only machine-precision integer-boundary repair. A translated token activates if any of its documented contributing source events is active. This is the union of actual intervals; it is not the enclosing span between distant source words. Articles and auxiliaries receive no independent invented English clock.

Reading presentation allows 220 ms neutral incoming lead. Full-opacity neutral holds are individually authored from the source context. A 420–500 ms fade follows only when it fits before the next incoming reading lead. Otherwise the line survives to the next actual vocal and is replaced atomically. V6 makes an atomic incoming cue fully opaque at its exact first acoustic sample; it does not delay focus with a synthetic entrance fade.

Seconds below are rounded display values. Canonical integer samples and uncertainty in the JSON files are authoritative. The final-focus column includes the selected lexical ending of the cue; the three requested myself carries occur inside cues and are listed separately.

| Cue | First onset (s) | Last focus release (s) | Neutral full-opacity hold (s) |
| --- | ---: | ---: | ---: |
| PK-001 | 7.328 | 12.485 | 13.030 |
| PK-002 | 16.385 | 20.045 | 20.220 |
| PK-003 | 20.340 | 23.800 | 23.920 |
| PK-004 | 24.035 | 27.450 | 27.650 |
| PK-005 | 27.875 | 31.455 | 31.650 |
| PK-006 | 31.745 | 34.080 | 34.550 |
| PK-007 | 35.470 | 37.860 | 38.040 |
| PK-008 | 39.352 | 43.050 | 43.135 |
| PK-009 | 43.135 | 45.995 | 46.170 |
| PK-010 | 46.845 | 54.430 | 54.550 |
| PK-011 | 54.580 | 61.630 | 61.720 |
| PK-012 | 61.740 | 76.430 | 76.942 |
| PK-013 | 76.942 | 90.585 | 91.530 |
| PK-014 | 92.600 | 96.255 | 96.370 |
| PK-015 | 96.460 | 103.650 | 103.870 |
| PK-016 | 104.100 | 107.680 | 107.810 |
| PK-017 | 107.930 | 111.460 | 111.640 |
| PK-018 | 111.750 | 115.055 | 115.210 |
| PK-019 | 115.555 | 119.135 | 119.300 |
| PK-020 | 119.320 | 122.455 | 122.640 |
| PK-021 | 123.153 | 125.445 | 126.420 |
| PK-022 | 126.925 | 129.545 | 129.720 |
| PK-023 | 130.747 | 134.410 | 134.550 |
| PK-024 | 134.550 | 137.385 | 137.690 |
| PK-025 | 138.295 | 145.790 | 145.920 |
| PK-026 | 145.945 | 153.175 | 153.390 |
| PK-027 | 153.555 | 161.045 | 161.190 |
| PK-028 | 161.200 | 168.220 | 168.340 |
| PK-029 | 168.391 | 183.005 | 183.582 |
| PK-030 | 183.582 | 199.990 | 201.400 |

| Held event | Prior direct-body end sample | Selected focus end sample | Next из start sample |
| --- | ---: | ---: | ---: |
| PK-011 себя / myself | 2,563,754 | 2,574,778 | 2,578,086 |
| PK-026 себя / myself | 6,588,760 | 6,601,770 | 6,607,944 |
| PK-028 себя / myself | 7,251,363 | 7,268,562 | 7,280,469 |

These accepted bounded carries preserve 75, 140 and 270 ms gaps before the next source event. Their stored prior-body estimates are not overwritten. They do not imply a universal reverb allowance for other words.

## 6. Correction history and current freeze

| Stage | Result | Evidence to preserve |
| --- | --- | --- |
| Initial complete timing pass | Every proposed onset/release selected against original/stem context, competing large-v3-turbo and MMS observations; broad/crop-bound false allocations rejected | `evidence/acoustic-review.md`, timing candidate, independent proposals |
| V3 introduction | Removed the rejected provisional 6.127 s name in both languages; retained 7.328 s Яна and supplied reference | `evidence/intro-lexical-correction.json` |
| V4 middle myself | Bounded focus end 149.700 s; next из unchanged | `evidence/held-myself-tail-review.json` |
| V5 related myself occurrences | Independently selected focus ends 58.385 and 164.820 s; no uniform duration copy | `evidence/held-myself-repeat-review.json` |
| V6 final audit | Acoustic sample signature and neutral holds unchanged; full-opacity atomic entrances, stopped-clock redraw and per-glyph shadow state corrected | `evidence/final-sync-audit.json` |

The unchanged acoustic event signature is `8bbb2c63268523e4b1a36ca913fbae3e82624b0ae73dcce3fa611a3572fdb209`. Current candidate metadata and runtime hashes are frozen in `evidence/preview-inputs.json`; changing a bound file requires regeneration and review of the affected behavior. Historical evidence retains the exact revision and scope it actually examined.

The final technical round passed strict typing and 17 tests, checked 12,530 rational 60 fps frames, 2,581,180 translated-focus states, 9,592 fully opaque active-voice frames, all 30 exact cue entrances, 163 exclusive word-boundary checks and 1,187 independent target-ownership states. Original full-source decode passed. These checks establish model/display contracts and reproducible source identity; acoustic truth still depends on bounded source interpretation and listening judgment.

## 7. Reproduce the reviewed project

Run commands from this project directory with the recorded runtime and exact original media available at `public/source.mp4`.

```sh
npm ci
npm run features
npm run prepare
npm run check
npm run preview
```

`features` must regenerate the measured file from the exact source. `prepare` verifies editorial/source/visibility identities, derives both language lanes and writes the twelve-input manifest. `check` validates all source/semantic/display contracts and hashes. The complete preview must visibly show the original scene, measured stone response and both language lanes. Verify the loaded revision/hash, source picture PTS, active words and cue opacity; an old tab or URL parameter is insufficient.

Optional composition diagnostics:

```sh
node scripts/proof-stills.ts
```

These sampled shared-renderer stills support layout/material inspection. They are not browser captures, listening logs, or frames decoded from the final encoded movie. The oldest stored proof record remains explicitly historical; never relabel it as a newer audit.

Restore the exact source from a verified archival asset when available. Re-downloading the recording can select different formats or create different container bytes even when the title matches; verify the frozen SHA before admitting it. Do not regenerate source identity merely to accept a different acquisition.

## 8. Authorized production commands and exact sampling

The current listening-review and authorization records must match frozen v6 inputs before production starts. The gate must reject missing, incomplete or stale records; no command bypasses it.

```sh
node scripts/render-production.ts --check-gate
node scripts/render-production.ts --plan
node scripts/verify-render-clock.ts
node scripts/render-production.ts --production --format landscape
node scripts/render-production.ts --production --format portrait
```

Production uses the same `src/model.ts` and `src/scene.ts`, exact Alegreya bytes, canonical masks and timeline. Every original 25 fps frame is decoded as RGBA. For output frame index `n`, the original picture index is `min(5219, floor(n * 5 / 12))`; the new scene is evaluated at `n / 60`. This integer relation preserves original-frame selection while giving word/color/light changes a 60 fps cadence.

`sceneTimeForOutput` normalizes only a binary floating-point undershoot: mathematical time `n/60` must correspond to sample `n*735` and original cadence `floor(n*5/12)`. It advances to the next representable float only while those integer relationships undershoot. The clock audit records 996 normalized frame values, maximum change 2.842170943040401×10⁻¹⁴ s, and eight corrected raw sample-boundary comparisons. All 12,530 frames satisfy independent integer ownership checks; every non-final original frame appears two or three times, and the final source frame appears four times. This is software arithmetic, not a perceptual timing adjustment.

The encoder receives full-range RGBA at exact 60 fps, converts explicitly to limited-range BT.709 YUV420P, sets square pixels and matching BT.709 tags, and uses libx264 `medium`, CRF 17, six threads, a 120-frame GOP and video timescale 60,000. MP4 faststart is enabled. Audio is mapped from the source with stream copy; no audio filters, trim, re-encode or shortest-duration truncation are introduced. Outputs use a partial filename until complete source/output counts, successful child processes and unchanged approved hashes are verified. Existing outputs are never silently overwritten.

Expected main files:

- `Po-Kamushku-Settlers-YouTube-1080x1080-60fps.mp4`
- `Po-Kamushku-Settlers-TikTok-1080x1920-60fps.mp4`

The files are created under `renders/`. The expected output has 12,530 frames at exact 60/1 fps, giving 208.833333 s video. This covers the 208.82721088435375 s decoded sample extent. The original AAC stream is copied with its skip metadata and 208.809002 s container extent; the 24.331 ms final CFR difference uses the final source picture. Both films preserve source zero. Each `.mp4.json` render receipt records the actual adapter inputs and output result; neither expected filenames nor a successful gate prove completed encoding.

Gate-bound sampled production stills can be created with `--still --format landscape` or `--still --format portrait`, plus a valid `--frame N` in 0–12,529. They use exactly the same source-picture selection and scene clock. Their own status remains diagnostic, separate from the full encoded files.

### Final verification and delivery

The final reports passed for both actual encoded films. Each has 12,530 exact 60 fps frames, a complete strict decode, matching original AAC payload/PTS/DTS/duration/priming for all 8,995 packets, and identical decoded PCM across 9,209,280 stereo samples. No black interval was introduced. A protected source-picture region passes on every frame, and 829 complete scene samples per layout check every source word and target token in focused and neutral states, onset/handoff opacity, held endings, final neutral reading hold and clearing. Native SHA-256 is `d2d1ccd78f5ea065d00ff409595fd335dec9aa0fd5f645996f65479f10c3e22e`; portrait SHA-256 is `515aa2b0a2437f5185e9dbbaa644e23c8733d605856d4cc0d173a9813544f891`. The static original photograph is expected, and the mask reference never replaces its decoder.

Run the two complete-file audits on the completed render basenames:

```sh
node scripts/verify-final.ts \
  --landscape renders/Po-Kamushku-Settlers-YouTube-1080x1080-60fps.mp4 \
  --portrait renders/Po-Kamushku-Settlers-TikTok-1080x1920-60fps.mp4
node scripts/verify-decoded-scene.ts \
  --landscape renders/Po-Kamushku-Settlers-YouTube-1080x1080-60fps.mp4 \
  --portrait renders/Po-Kamushku-Settlers-TikTok-1080x1920-60fps.mp4
```

The first verifier requires completed render receipts, examines full decode and preserved audio, and compares any near-black output interval with authored source darkness. It does not grant a generic ending exemption. The second verifies the decoded complete scene and bilingual focus against the approved renderer; blackdetect alone cannot prove complete picture or glyph parity. Single-format reports stay explicitly partial. Both reports must pass for the current inputs and actual renderer/verifier hashes before packaging.

The publishing kit needs one verified film and appropriate cover per platform, complete YouTube title/description, TikTok caption, source credits and checksums. TikTok's profile-cover target is portrait 1200×1600 (3:4); inspect its full title/artist/subject at 150×200. Cover framing and publishing text are packaging choices, separate from the approved lyric timing and main-film layout.

The cover maker recomposes the original photograph and empty soil with approved Alegreya/ivory/clay typography. YouTube gets 1280×720 JPEG with the source square and title beside it; TikTok gets 1200×1600 JPEG with the complete circle/person above the title. Safe text boxes, no reliance on EXIF rotation, JPEG dimensions and the YouTube 2 MB limit are checked. Small proofs and a 5% TikTok center-crop simulation are local diagnostics, not an actual platform-upload preview. Record visual acceptance of the exact cover hashes before changing the generated cover manifest to passed; packaging rejects unreviewed covers.

From the project directory, use a new staging folder inside the project:

```sh
TASK_KIT_DIR="$PWD/delivery/Po-Kamushku-Upload-Kit"
node scripts/make-covers.ts --dest "$TASK_KIT_DIR"
node scripts/make-captions.ts --dest "$TASK_KIT_DIR"
```

Captions provide Russian and English SRT/VTT, thirty complete cues each. First timestamps are ceiling-quantized to milliseconds from the first original lexical sample; ends follow complete reviewed line visibility. These optional sidecars do not replace the burned-in word/meaning focus or reproduce its sample-level timing. Inspect covers and record their current acceptance, then finish staging:

```sh
node scripts/package-delivery.ts --dest "$TASK_KIT_DIR"
```

The packager admits both films only when complete final reports agree on hashes, input identity and current renderer/verifier code. It requires reviewed covers and four current caption files, copies posting text and verification records, writes `START-HERE.md`, `Delivery-Manifest.json` and `SHA256SUMS.txt`, then re-hashes every staged file. The staged receipt does not assert that a Desktop copy or public upload already exists. Copy the completed kit to the requested destination, verify its checksums there, and record that separate result.

Copy verification and GitHub upload verification compare actual bytes to the frozen local results. Original source, production inputs and media archives belong in checksum-bound archival assets where authorized, while the repository holds reusable code, neutral decisions and evidence. Large raw media, private stems and checkpoints do not enter ordinary Git history. Do not delete any local original or Desktop kit merely because an upload command returned successfully.

Remote operations remain coordinated: before each push, PR operation, merge or release action that can start Actions, inspect all workflows, branches, actors and current-UTC-day runs, including queued/completed/running states and reruns of older runs. Estimate event chains and runner minutes; unknown monthly usage stays unknown. Preserve required checks and current user approval policy. Merge verified authorized source work and verify the default branch; separately verify each authorized media asset and delivery receipt.

The completed project-staged package and fresh Desktop copy each contain 25 verified files. See `evidence/delivery-receipt.json` and `evidence/desktop-delivery-receipt.json`; these establish local delivery only. The final full-frame README image is decoded native frame 3495 at 58.250 seconds, with paired held себя/myself focus; `evidence/final-stills.json` records its exact provenance. Local TypeScript and all 27 meaningful tests pass.

## 9. Immutable source and upload archives

After committing the verified project and delivery records, create both recovery archives from that exact source commit:

```sh
TASK_SOURCE_COMMIT="$(git rev-parse HEAD)"
node scripts/archive-delivery.ts \
  --kit "$PWD/deliverables/Po-Kamushku-Settlers-Upload-Kit" \
  --dest "$PWD/archives/v1" \
  --commit "$TASK_SOURCE_COMMIT"
```

The source ZIP contains the committed project and applicable common guides, all twelve frozen inputs including the exact original MP4, four bound cover proofs, and both original rendering receipts. Dependencies, downloaded models, vocal stems, scratch captures and unrelated tracks are omitted. The upload ZIP contains all 25 verified handoff files. Both ZIPs include restore instructions and internal checksum inventories. Every ZIP entry is decompressed and hashed independently after creation; archive checksums exclude their own checksum file to avoid a recursive identity. The outer ZIP hashes are recorded in `evidence/archive-receipt.json`. Restoring the source and timing is reproducible; exact codec bytes across different machines or software builds are not guaranteed.

Publish the films, covers, copy, captions, upload ZIP and source ZIP in the versioned repository release. Verify all actual remote attachments through a fresh download and matching SHA-256, then record `evidence/release-upload-verification.json`. Source merge, release publication and platform posting are distinct outcomes. Inspect all repository Actions runs and rerun attempts for the current UTC day before each remote trigger-capable step, estimate resulting runs/minutes, and apply the current approval policy; never change triggers or bypass required checks to fit a budget. Preserve the archived source commit in default-branch ancestry.

## 10. Completed publication and recovery

Production source commit `e35a8440cae9e102e301309ff8f1546b33e981a1` was verified and merged through PR69 with a merge commit, preserving the source archive identity in the default branch. [Release v1.0.0](https://github.com/ael-dev3/lyrics/releases/tag/po-kamushku-v1.0.0) is public and contains 16 verified attachments. The upload ZIP has 27 entries including its own archive README/checksum file; the source ZIP has 100 entries, including all twelve approved inputs and the exact original MP4. The source ZIP is 9,856,852 bytes (SHA-256 `0639da7366b21fb44fd09e74664bc36b925876a980e37887759d99642410d79b`); the upload ZIP is 50,481,321 bytes (SHA-256 `c4d943def0b3e097487d054d270d019489ef4821b3f404fdee1ebcbbfa9ed0f6`).

The coordinator used `gh release create` with all verified attachments and `--draft --target` bound to that source commit, downloaded every draft attachment with `gh release download`, independently hashed all 16 files and all downloaded ZIP entries, then published with `gh release edit --draft=false`. Published inventory retained the same IDs/sizes/digests; each unauthenticated public asset URL returned HTTP 200. The exact command operands and resulting asset URLs/identities are recorded by `evidence/archive-receipt.json` and `evidence/release-upload-verification.json`. This separates local archive correctness, remote transport verification and actual public availability. The final receipt/documentation merge follows the production source merge; it does not regenerate or replace the published source ZIP.

All trigger-capable remote operations used fresh Actions-history preflights. The repository had zero workflows and zero total runs throughout, so each operation was estimated to create zero Actions runs/minutes. Monthly account usage remained unknown; no broader billing access, trigger change or required-check bypass was used.

## 11. Post-delivery portrait visibility note

The released TikTok highlighting is recorded as too subdued for reliable visual focus recognition. The current MP4s, timings, artwork, gates and release assets remain unchanged. [KNOWN-ISSUES.md](KNOWN-ISSUES.md) documents the accepted presentation limitation and future portrait emphasis checks. Technical correspondence to the approved colors is distinct from perceptual emphasis; future previews should explicitly check that distinction at ordinary brightness and realistic small-player size.
