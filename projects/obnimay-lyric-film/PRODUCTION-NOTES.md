# Обнимай — exact production record

## Delivery and accepted inputs

The corrected `obnimay-preview-v2` is delivered as two 200.600 s films: YouTube 1920×1080 and TikTok 1080×1920, both 60 fps. The 13-file Desktop kit includes the two films, a 1280×720 YouTube thumbnail, a portrait 1200×1600 TikTok profile cover, publishing copy, three optional subtitle editions, a delivery manifest and checksums. [The kit record](evidence/upload-kit.json), [copied-file verification](evidence/desktop-delivery.json) and [checksums](publishing-kit/CHECKSUMS.sha256) identify the exact files. Platform uploading and public media releases are separate actions.

The owner attested comprehensive review and explicitly authorized the exact corrected preview. [Acceptance](evidence/owner-acceptance.json) records full-song normal-speed, uncertain-word/held-ending reduced-speed, and both-language/both-layout scope. No itemized playback telemetry was supplied, and the assistant does not claim direct audio audition. This attestation is distinct from model evidence and encoded technical verification; remaining processed-word uncertainty is retained.

| Frozen input | SHA-256 |
| --- | --- |
| Original source MP4 | `9a4d5f5c42b131d46eab42d072f64733ccb50a0bea97a995b757d3b00e5708e0` |
| Complete v2 timeline | `279b8cf9786bf1c3af90c980482acec37550c77791efaf4566caa5a1d244eb8f` |
| Approved scene inputs | `f2d2128fd075b6970b188b32947686e328b1685bb1def3a5f4770b4bb0bc02b3` |

Scene identity includes the model, scene, player, preview HTML, measured audio, artwork reference, visual contract and font. Those approved files were unchanged during production. The frozen visual contract retains its preview-stage metadata; delivery status belongs to the separate acceptance, production and final-file records. New encoder, verifier and packaging tools do not revise the accepted artistic scene.

## Preparation, coverage and meaning

Read [TIMING](TIMING.md), [the coverage correction](source/coverage-review.json) and [selected boundaries](source/selected-boundaries.json) before changing any lyric. Supplied repetitions are editorial input, not evidence that a repeat is performed. Unconstrained recognition on the original mix and diagnostic vocal estimate checks coverage; text-conditioned Whisper and MMS CTC propose boundaries. The diagnostic stem has matching sample count and zero detected fixed offset in six cross-correlation crops. Models, attacks and waveform similarity cannot independently establish words or replace listening judgment.

The corrected inventory contains **41 cues, 144 Russian events and 165 English tokens**, including four separately positioned Вся / All backing candidates. Five unsupported supplied call candidates are withheld. The known **71–81 s lyric-free interval** is enforced in the builder, 601-frame model regression and final decoded reading-area checks. Additional withheld ambiguity is not labelled proof that every vocal-like sound is absent.

Three supported later calls keep independent source renewals, not timestamps copied from another repeat:

| Cue | Обнимай / Hold | меня / me | Lexical release |
| --- | --- | --- | --- |
| OBN-036 | 158.601 s | 160.940 s | 161.880 s |
| OBN-037 | 164.981 s | 167.360 s | 168.460 s |
| OBN-038 | 171.444 s | 173.640 s | 174.400 s |

The later-call correction changes only those selected handoffs/releases and removes unsupported cues. Other 38 cues and English meanings remain unchanged from the frozen baseline. Do not shift an invented lyric onto a nearby beat merely to make the map pass.

**Hold me** conveys a sustained comforting embrace here. The literal **hug me** is also valid; the chosen idiom does not mean physical restraint and does not invent an event. Reordered English pronouns remain on their own Russian object events. Grammatical completions share their true source event: do you hear ↔ слышишь, I run ↔ бегу, with concrete ↔ бетоном, my own ↔ свою. Multiword meanings use the union of their actual source intervals, never an enclosing range that fills unrelated gaps. [The correspondence ledger](source/correspondence-ledger.json) preserves every token's rationale.

Starts are inclusive and ends exclusive on integer 44.1 kHz samples. Reading visibility is separate: lines reach full opacity by the first word and remain fully readable through selected held endings. Neutral holds are approximately 0.10 s, 0.18 s for calls and 0.20 s for light endings; a 0.50 s fade uses available room. Adjacent vocal lines hand off atomically. A held neutral line never implies continued word focus. The final becomes / становится and light / свет retain their real internal pause.

## Original-picture integration

The human embrace in the original release photograph remains central. Four real carnations contain six texture-bound light sectors each. The [visual brief](VISUAL-BRIEF.md) records exact polygons, typography and both-format geometry; [the scene](src/scene.ts) is the implementation.

- Raw original-mix measurement: 50 rows/s, stereo RMS plus 24 logarithmic bands from 40 to 10,000 Hz; spectral window 2,048 samples at 22,050 Hz, RMS window 40 ms.
- Display transform: `clamp((bandDb + 64) / 52)^2.7`, bounded RMS weighting, centered seven-row Gaussian (sigma 1.25), linear interpolation and adjacent-band weights 0.64/0.23/0.13. Decorative ±60 ms smoothing never changes lyric onsets.
- Petal masks follow source luminance and cool pigment, feather nine pixels inward and retain silhouettes. Source face, arms, dress, stems and small ivory flowers are protected. Stable geometry changes light, not the visualizer's position.
- Cool light RGB (168,207,215), warm (248,222,169), screen compositing. Authored warmth windows are 43.5–70.8, 131.5–159 and 182.7–198.8 s, with 3.1 s entrance and about 2 s release. These values belong to this recording.
- A bounded 0.045 light lift follows only an active selected свет event. Typography remains stationary, with focus `#ffe5ab` and neutral `#c4cbc4`; Noto Serif weight 500 and equal language size. Per-glyph shadow state is reset before outline and fill.
- The complete 1080-square stays left in the landscape and top in portrait. Actual floral-edge material continues into the reading space. There is no duplicated human figure, separate floating spectrum or cue-shaped black panel.

The source artwork is intentionally still, but a renderer must still decode all original pictures. A material reference constructs masks and extensions; it must not silently replace the original source video in the complete preview or export.

## Renderer and clocks

[The renderer](scripts/render-production.ts) checks the current local approval before capture, requires explicit `--production`, refuses existing final/partial files and checks frozen input and producer hashes again before promotion. It uses the same `paintScene` function as the accepted preview, with the exact font and material reference.

The source has **5,015 pictures at 25 fps**. The final film has **12,036 pictures at 60 fps**. Output picture `n` uses original picture `min(5014, floor(n*5/12))`; a separate test checks the 300 Hz common clock (`5n` output ticks, `12k` native ticks), complete picture coverage and 2/3 output repeats. Output audio position is `n*735` original samples. No section offset or artificial vocal anticipation is applied. Display resolution is one 60 fps frame (16.667 ms), separate from sample-exact storage and acoustic uncertainty.

Export is libx264, preset medium, CRF 17, six encoder threads, GOP 120, YUV420P, square pixels, limited BT.709 with explicit matrix/transfer/primaries, MP4 video timebase 1/60000 and fast-start. Original AAC is copied directly, without gain, filtering, trimming or reencoding. [Producer receipts](evidence/production-render-receipts.json) bind adapter hashes, final hashes and frame counts.

```sh
npm run check
npm run render:gate
node scripts/render-production.ts --format landscape --plan
node scripts/render-production.ts --format portrait --plan
# Only after current exact-revision listening review and explicit approval:
npm run render:landscape
npm run render:portrait
npm run verify:landscape
npm run verify:portrait
npm run covers
npm run publishing
# Inspect cover proofs and record that review before finalizing.
npm run finalize
node scripts/deliver-desktop.ts --destination <new-Desktop-upload-folder>
```

Use Node 24, the package lock and FFmpeg/ffprobe 8.1.2. Restore the exact source identity first. Regenerating preview identity resets local review; a public acceptance record is not permission to fabricate it after restoration or for changed inputs. `scripts/initialize.ts` and initial timing authoring are preparation tools, not commands to overwrite accepted editorial selections during startup.

## Final verification and covers

Both films pass all 12,036 presentation timestamps, strict complete audio/video decode and full-frame black-interval detection. **All 8,641 AAC packets**, their timestamps/side data and the decoded float PCM are identical to the original source. Decoded PCM SHA-256 is `e9061ebf78ca53c00e0a1745c691f3a0230f12ee520a26bb6abd56a8e8591253`.

Per format, 1,101 selected decoded scenes and 4,462 opaque glyph states pass. Every one of the 309 source/target tokens is seen focused and neutral; 309 deliberate 100 ms delayed-state controls are rejected. The verifier checks **every visible lead and backing block**, rather than only the first visible cue. Focus expectations use independent integer `n*735` arithmetic. Opaque glyph interiors exclude shadow/chroma-edge contamination. Minimum matching fraction is 99.32% landscape and 99.66% portrait.

All 601 frames from 71 through 81 s have no model reading cue and their actual encoded reading regions match the empty shared scene. Maximum reading-area mean RGB error is 0.512/255 landscape and 1.699/255 portrait; no sampled channels differ by more than 24. Full-scene comparison uses the original first picture for output frames 0–2 and original picture 1,000 thereafter because this recording is deliberately static; that finite comparison is not a moving-shot correspondence proof.

[Landscape verification](evidence/final-landscape-verification.json) and [portrait verification](evidence/final-portrait-verification.json) are technical records, not millisecond acoustic certification. [Twenty-four complete decoded stills](evidence/final-stills.json) cover intro, verse, refrain, empty break, later call and tail. [Visible review](evidence/final-visual-review.json) records native frames, contact sheets and a 360×640 phone simulation; owner listening remains separate.

Covers are code-native recompositions of the original photograph and approved typography, with no generated replacement artwork. The YouTube thumbnail is 1280×720, 236,483 bytes; the TikTok profile cover is **portrait 1200×1600**, 483,683 bytes, 3:4 width:height. Actual file dimensions and JPEG metadata are checked. Full title, artist and face were inspected at 150×200, 300×400, 320×180 and a 5% centered-crop simulation. No real platform upload preview is claimed. [Cover evidence](evidence/cover-assets.json).

Optional Russian, English and bilingual SRTs have 45 non-overlapping subtitle intervals each: the extra boundaries represent four separately retained backing overlaps, not new performed lyrics. The film itself supplies word highlighting. Checksums include every kit file except the checksum file itself; Desktop delivery compares every copied hash and refuses existing folders.

## Reuse without repeating the failure

1. Establish performed coverage before forced alignment. Keep withheld candidates separate and enforce known lyric-free windows against both visible neutral lines and active focus.
2. Review repeated filtered calls independently on the original mix. Do not transfer a broad model overhang or pasted count into actual word ownership.
3. Select idiomatic translation for the scene and singer while retaining per-word meaning correspondence. Translation elegance never justifies unrelated focus spans.
4. Place response inside existing meaningful material and protect the human subject. Measure raw audio separately from the bounded display transform.
5. Freeze the accepted scene before production. Export the same picture, audio, reading lifetime, word colors and lane geometry as the full review preview.
6. Inspect all simultaneously visible vocal lanes in the final encoded film. Selected-frame verification must cover every token in both focused and neutral states, and retain negative controls.
7. Keep owner review, model uncertainty, preview proof, decoded final frames and complete-file verification distinct. Technical agreement cannot invent listening evidence.
8. Make final screenshots from the actual encoded film and record frame number, PTS and file hash. Package platform-specific covers/copy and verify the copied Desktop files.

Before each GitHub push, PR creation/update or merge, inspect all Actions history for the current UTC day, including older rerun attempts, every workflow/actor/branch, duplicate events and downstream services. Monthly usage unavailable through the existing read-only evidence remains **unknown**. Preserve checks/triggers; verify and merge authorized source work. Original media, diagnostic stems/model caches, local account paths and private review dialogue remain excluded from public source.
