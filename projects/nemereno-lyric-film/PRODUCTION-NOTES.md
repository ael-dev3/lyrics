# Production notes · немерено v4.3

## Frame the real image

The source holds a square forest photograph. Every output now draws that original frame exactly once, using one crop and uniform scale. There is no reflected edge, stretched woodland, duplicated background, synthesized scenery or background blur. The entire seated figure stays visible in both formats.

The 16:9 crop is `[0,194,1080,607.5]` in source pixels. It removes upper empty forest and the lowest trunk while retaining the singer, feet, nearby fork and natural right-hand clearing. The 9:16 crop is `[168,0,607.5,1080]`; it retains full image height and the figure while trimming the outer sides. These are deliberate framing decisions, not aspect deformation. The complete source remains available in the muted Source reference control.

Earlier edge continuations created recognizable repeated branches, exposure seams and stretched bark. Treat that approach as rejected for this recording. Solve aspect-ratio conflicts through reviewed framing and reading placement; adding texture does not make an extension photographic. An independent full-frame pixel comparison now checks the silent preview composition against exactly one original-image crop in each format.

The actual MP4 remains the picture and audio source. The private reference image supports native still and exact-crop verification; it is never drawn as substitute scenery in the complete browser preview. The recording is static artwork, so its authored music response provides motion rather than a moving performer or camera.

## Restrained spectrum for a dense photograph

A densely textured, desaturated forest does not automatically benefit from a botanical visualizer. The branch experiment added an authored contour that competed with real wood and became hard to read at player size. Material-matched leaf illumination also added an unnecessary second source of attention. The current treatment uses a compact supporting spectrum in a stable reading margin. It preserves the forest's photographic texture and makes the music response easy to identify.

This applies the workflow's established restrained treatment: choose movement for the current arrangement, keep bar travel bounded and place clear cores in reserved space. The spectrum uses a subdued warm ivory `#d4d0c2`, distinct from lyric focus. Square-ended bars and a 1.4-pixel dark edge supply local contrast without implying emitted light or a physical object in the photograph. The feathered reading exposure is neutral rather than green-tinted.

Each of the 24 bars owns one original logarithmic band, 40–10000 Hz. Raw observations are 50 Hz and remain untouched. The artistic level transform is `clamp((dBFS + 70) / 52)^1.4`, multiplied by the RMS gate. There is no per-frame normalization. Five adjacent bands use weights `1,2,3,2,1`; a 50 ms attack and 240 ms release soften isolated jumps while retaining musical differences. The gate releases over 180 ms. Adjacent precomputed observations interpolate on the original song clock.

| Geometry | 16:9 | 9:16 |
| --- | ---: | ---: |
| Center x | 1465 | 540 |
| Reserved row width | 640 | 720 |
| Fixed baseline y | 1030 | 1882 |
| Individual bar width | 8 | 10 |
| Height floor / maximum | 2 / 46 | 2 / 42 |
| Maximum opacity | 0.76 | 0.76 |

The row remains below every current source and translated glyph, including duet holds. The actual bottommost glyph bounds are 900.52 pixels wide and 1813.58 pixels portrait. The full height envelope and small shadow are reserved independently of lyric content. Neither anchor nor width moves as cues change.

A 400 ms entrance and 1.72-second closing fade let the added graphic settle at the recording edges. Silent input has zero spectrum opacity and no independent idle movement. Exact source-time history makes direct seeking reproducible. The centered 92.88 ms FFT window, display envelope and interpolation do not certify an exact physical transient onset; selected acoustic word events and semantic focus remain separate and unchanged.

Real spectrum-region differences verify visibility and musical variation in both formats. All glyph boxes and the protected figure remain clear. Whole-frame comparisons with the graphic disabled verify a single undistorted original crop. These checks establish implementation properties; artistic fit is judged in the complete live preview at realistic player size.

## Typography and ownership

Literata 500 replaces the heavier display serif. It has a lighter editorial texture with readable Cyrillic/Latin forms. Both languages share identical weight, size, resting color, focus color and isolated glyph shadows. Warm ivory rest and a clear honey focus remain legible at normal player size. Focus is color only, with stable full-line positions.

Wide reading belongs to the photographed clearing on the right, outside the complete figure guard. Portrait solo reading sits in the real lower woodland. During overlapping voices, portrait places the countervoice in the upper foliage and the lead below the figure. Wide uses two separate blocks in the clearing. Their geometry is reserved for each complete cue before an incoming reveal; neither block jumps as another voice exits.

English uses explicit source meanings rather than token positions or a synthetic syllable clock. Every token has an anchor, including grammatical completions and reordered auxiliaries. “Кончики пальцев” owns complete “the fingertips”; “деревом” supplies “into a tree”; “теплить” supplies “keep … warm”; “вынашивать” supplies “nurture it.” Negation in “не опустеет” and complete “God grant that it will be enough” remain represented. Both “Тихо” repetitions have independent focus. Printed dashes remain typography without acoustic duration.

## Timing rebuilt from competing evidence

The decoded mix and both Demucs estimates contain 9,036,224 stereo samples at 44.1 kHz. Recombining estimates at 65–77 seconds yields zero lag and 0.9976 correlation with the mix. This supports clock conservation, not exact vocal boundaries.

Bounded stable-ts/Whisper large-v3-turbo passes cover original mix and vocal estimate. Independent TorchAudio MMS_FA character alignment uses per-phrase and wider-context crops on both materials. Different model families provide comparison evidence; mix/stem passes of one model are correlated. Character cores use a 20 ms stride and 25 ms receptive field. Signal spectra use a 32 ms window and 2 ms hop. Dense sampling is not 2 ms physical certainty.

Comparison records retain previous intervals, observations, chosen samples, rationale and review priority. Sixty-four of 267 intervals changed. Quiet female countervoice ownership around 160–181 seconds showed substantial model disagreement. The owner subsequently attested full normal/reduced-speed and both-layout review of v4.3 and authorized production. That acceptance does not erase model uncertainty or turn signal inspection into listening.

Material repairs include:

- Quiet frication before the first vowel moved `Словами` to 0.575 seconds.
- Choruses previously allocated to instrumental energy now enter at 43.30 and 62.48 seconds.
- `Окрашены` moved from 29.98 to 29.34; an independent `Немерено` moved from 37.14 to 38.36.
- A major `хватит` error at 120.06–121.26 moved to 101.44–102.76. The instrumental bridge from 104 through 120.8 has neither neutral nor focused lyrics.
- Quiet female `Сколько` starts at 121.12. `Пока`, `ты` and `любовь` no longer have a false acoustic gap owned by a printed dash.
- Female pickup begins at 180.38 while the male closing fragment remains in a separate upper lane through 180.55.
- The two final `расцветёт` phrases retain separate 191–196 second events. A model jump placing the second repeat around 199 was rejected.

Stereo-difference recognition hallucinated unrelated subtitle credits. It was excluded from lyric authority. Mix/vocal/backing placements do not justify inventing text or treating forced placement as proof of performance.

Reading visibility stays independent of lexical release. Familiar/title/tree endings and final bloom/enough can settle in neutral color after the voice. The first selected word is fully opaque at onset. Adjacent phrases use an atomic handoff instead of fading through a new singer's first word. No global timing offset was introduced.

## Preview verification and listening acceptance

Typecheck and bundle pass. All 267 selected source events pass onset, final-half-sample, exclusive-release and first-word opacity checks. Sixty-nine independent semantic expectations pass. Actual glyph bounds pass for all 46 cues in both formats, including 34 duet boundary checks. Ten sitter-protection comparisons pass. Two whole-frame image comparisons confirm single undistorted original crops; activity checks confirm the compact spectrum is present and changes with the recording in both outputs.

These checks verify implementation against selected events. They do not certify the perceptual accuracy of every selected acoustic boundary. V4.3 reuses the rebuilt sample-indexed acoustic decisions without a global timing shift. Current-revision owner review covers the full normal-speed recording, uncertain words and held endings at reduced speed, and both layouts. The identity-bound [review record](source/REVIEW.json) separates that attestation from explicit render authorization.

Preview inspection covers actual source picture, clock progress, seek/pause refresh, both layouts, sound and reduced-speed transport. Future revisions still stop at the complete preview until their own listening evidence and production authorization exist. The frozen visual contract's old preview-status fields are retained to preserve the reviewed scene hash; the review record and final receipts are the lifecycle authority.

## Production on the source clock

`render-production.ts` paints the same `src/scene.ts` used by the browser. The original 25 fps source contains 5,122 pictures; output frame `n` selects `min(5121, floor(n * 5 / 12))`. The final original picture covers the 20 ms AAC tail. A frame at 60 fps is 16.667 ms: sample-indexed events select the next available display frame rather than implying a physical sub-frame image.

Both films contain 12,294 frames / 204.900 s. FFmpeg encodes H.264 CRF 17, yuv420p, limited BT.709, SAR 1:1, with original AAC copied. No picture, lyric, acoustic boundary or spectrum parameter changed during final verification. [Production receipts](evidence/production-render-receipts.json) bind the exact renderer, strict authorization adapter, reviewed identity and output hashes.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| YouTube 1920×1080 | 53,956,686 | `a42d2c97929ff8309996ae89651bca7478def15eceb2a93f1e4cbc915ea31566` |
| TikTok 1080×1920 | 52,256,983 | `7f89277337417740289ee41a998d9f62ea24f7b8da0fe0c58e0a69a93a6aa287` |

The Farcaster movie is byte-identical to YouTube. Full strict decode, every-frame PTS, black detection, all 8,826 original AAC packets and decoded PCM conservation pass. The original/decoded PCM SHA-256 is `ae0673a8bd4b75a25fea6049af2b326ab90d2de2df4646a69dafe36cc9894516`.

## Verify the states that actually exist

The final checker compares 1,114 selected exact-source scenes per format, including reading transitions, duet overlaps and the instrumental bridge. Each film passes 14,952 decoded glyph-state checks covering 267 Russian and 338 English tokens, plus 201 sampled clear-reading frames. Deliberately delayed 100 ms controls must fail for all 605 tokens. [Wide](evidence/final-landscape-verification.json) and [portrait](evidence/final-portrait-verification.json) reports retain the thresholds, counts and method limits.

A generic checker initially assumed that every word had a fully opaque neutral state as well as a focused state. Continuous backing **А-а-а / Ah** stays focused for its complete visible lifetime, then hands off. Inventing a neutral state would change the approved film. The corrected checker enumerates states that exist at at least 95% cue opacity: 603 tokens have both states, while the continuous pair receives four separate decoded clear/handoff checks. Fades remain in complete-scene comparisons.

Thin Literata strokes and yuv420p can make antialiased edges ambiguous. Sample source-rendered glyph interiors, erode alpha with a 3×3 neighborhood, and intersect with complete aligned opaque 2×2 chroma cells; use a complete-cell fallback for tiny glyphs. Require at least 75% decisive pixels, 90% of those to favor the correct focus, and 90% of all samples to stay near the source-painted reference. Record ambiguous samples rather than silently counting them as correct or incorrect. All delayed controls remain mandatory. This calibration concerns compression/display discrimination; it is not evidence for new acoustic boundaries.

The minimum scene-match ratio is 0.9894 wide / 0.9574 portrait. Minimum decisive-pixel fraction is 0.8493 / 0.8510; minimum near-reference fraction is 0.9938 / 0.9574. Maximum whole-scene mean absolute error is 1.0333 / 2.3855 on the 0–255 scale. These finite scene samples do not inspect every picture perceptually; full decoding and PTS checks cover different properties.

## Covers, copy and complete handoff

The 17-file kit includes three movies, three dedicated covers, two platform titles/descriptions, one Farcaster post, three optional SRTs and root instructions/receipts. Covers use a single actual source crop with code-composed typography. There is no generated substitute photograph. Review includes native size, 320×180 wide previews and the portrait 1200×1600 cover at 150×200 with a 5% center-crop stress check.

Keep **title + AI assistance + original-source credit in one `Farcaster/Caption.txt`**. The current concise disclosure names translation, timing and visuals, alongside actual human direction/review. The rest is factual title and source credit; disclose text assistance too when adding an original descriptive caption. Do not describe the original recording as AI-generated. The supplied current notice requires disclosure without prescribing an exact phrase; this package does not assert a universal client limit or perform a platform post. [Reusable disclosure guide](../../docs/ai-disclosure-publishing.md).

The Desktop copy was verified before and after replacing the earlier separate Farcaster text files. Every final payload SHA-256 matches the project kit; Finder metadata stays outside the payload inventory. [Desktop receipt](evidence/desktop-delivery.json) contains no private home path. Archive creation, remote download and fresh restore are separate from this copy check; follow the [handoff](AGENT-HANDOFF.md) and preserve immutable source-commit ancestry when merging.

## Next-song checklist

1. Inspect the actual recording and source composition before choosing effects. Prefer one reviewed crop over repeated photographic extensions.
2. Establish performed coverage, independent vocal ownership and literal complete translation before alignment. Keep instrumental windows executable against neutral text too.
3. Compare independent acoustic evidence, quiet connected entrances and complete held endings. Preserve model failures and uncertain intervals without exporting hallucinations.
4. Link every translated token to complete source meaning; keep lexical release, neutral reading and picture motion independent on one clock.
5. Test the full intended visual stack in both browser layouts, including seek/pause recovery and overlapping voices. A static source picture is valid when it is the actual recording.
6. Bind normal/reduced-speed listening and render authorization to the exact identity; then render from the shared scene and preserve the source audio.
7. Verify actual encoded glyphs, existing focus states, deliberately wrong controls, complete decode and timestamps. Do not reshape approved lyrics to satisfy a faulty checker.
8. Deliver platform-specific covers/copy, one combined Farcaster caption, checksums and authenticated recovery. Review the diff, complete Actions preflight, verify remote recovery and merge the source PR.
