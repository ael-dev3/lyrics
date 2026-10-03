# призрак — source-native multilingual preview brief

**Preview only.** Preserve the selected [original music video](https://www.youtube.com/watch?v=Psp5vt8BwoY), its soundtrack, complete narrative and source optical effects. The design applies the repository’s established reading, timing, integration and recovery lessons as one coherent treatment. It does not introduce a new setting or inherit an earlier song’s render approval.

[Source study and exact identity](evidence/source-visual-study.md) · [Cinematic default](../../docs/cinematic-lyric-workflow.md) · [Scene integration](../../docs/scene-integrated-visuals.md) · [Current preferences](../../docs/track-workflow-preferences-and-known-issues.md)

## Visual roles

| Layer | Current role | Attention during vocals |
| --- | --- | --- |
| Actual source video | Principal moving picture: winter narrative, performance, sketchbook, practical light and optical transitions | Preserve faces, hands, instruments, drawings, orb and authored lettering |
| Lyrics | Stable foreground reading layer, composed with the source palette | Full cue stays readable; source-linked active meanings are immediately distinguishable |
| Primary spectrum | Fixed supporting graphic with pale practical-light color and bounded bloom | Clearly visible without covering the reading lanes or becoming a new physical object |
| Portrait atmospheric fill | Dim defocused enlargement of the same moving source frame | Background only; never a second readable copy of the performer or credits |
| Original credit card | Preserved source content | Added title and spectrum clear before its appearance |

No camera shake, falling leaves, new snow, procedural scenery, traveling spectrum, unrelated 3D objects or invented building masks are commissioned. Snow, handheld motion, scratches and flashes already belong to the original video. Their existence is not evidence of an audio-reactive algorithm, and the preview does not retime them.

## Native and portrait composition

The native format retains the full **1920×1080** decoded frame. Normal source matte bands remain authored image content; bright transitions are not cropped to a permanent active-picture rectangle. Most lyric geometry is reserved in the lower part of the image, on a continuous soft shade that does not switch on as a cue-shaped panel. The closing Japanese passage uses a separate upper reading region to preserve the tunnel figure. The title occupies the existing upper matte when present. The spectrum stays near the lower matte, with modest reach into its adjacent lower picture area.

The **1080×1920** portrait composition fits the complete sharp video at `x0, y214`, size `1080×607.5`. All horizontal source content survives, including ensemble shots, the sketchbook, face close-ups, the orb/figure spacing and the full credit card. Extra portrait space uses a dim blurred source-derived fill; it is atmosphere, not newly authored footage. The text has a dedicated lower reading area centered near y1280. The spectrum retains a fixed baseline at y1748, below the reading area and above the bottom platform region.

| Property | Native 16:9 | Portrait 9:16 |
| --- | --- | --- |
| Reading width | 1600 px, centered | 880 px, centered |
| Shared initial type size, two lanes | 74 px | 76 px |
| Shared initial type size, three lanes | 64 px | 72 px |
| Complete reading height budget | 430 px | 610 px |
| Normal reading placement | Complete block ends at y945 | Complete block centered at y1280 |
| Closing Japanese placement | Complete block ends at y610 | Complete block centered at y1355 |
| Spectrum anchor | x260, width1400, baseline1050 | x100, width880, baseline1748 |
| Maximum authored bar travel | 68 px | 110 px |

These are implemented initial parameters, not accepted final proof. A 360×640 three-lane synthetic geometry proof exposed lighter Japanese strokes; Japanese weight 600 corrects that optical imbalance while Russian/English retain 500. Actual browser/real-cue comparison remains required. Long cues reflow all language lanes at one shared size. If that cannot preserve readability, split presentation at a real phrase boundary with explicit timing rather than shrinking English alone, hiding Japanese, removing words or stretching acoustic intervals. Inspect actual phone-size results before freezing. Portrait preserves source content by fitting it, rather than claiming a blind center crop is complete.

### Closing voice overlap

The current canonical preview represents Japanese entering at 221.8s while the final Russian `ночь` continues through 222.24s. It preserves the previous word's exact selected samples in an explicitly linked carry, with Russian `ночь` and English `night` on two brief rows above the new three-language passage. This representation does not add listening attestation to the selected acoustic estimates. The carrier uses the primary block's full type size, script weights and focus palette; it is not a tiny annotation. Its visibility ends at the original source-word release, with no artificial early fade.

A decoded source frame at 221.92s places the bright tunnel figure near the lower center, around y730–810. Both closing Japanese cues therefore keep their complete native block above that subject, ending at y610. Their shade occupies y100–650 rather than dimming the figure below. The portrait primary block remains below the complete source picture, centered at y1355, reserving space above it for the carry. These positions are attached to both closing cues, not toggled by whether the carried word is currently active. The main glyphs do not move when `ночь / night` clears. Layout validation rejects a carry that cannot fit at the same size while preserving the source margin; it never solves the overlap by shrinking one language or clipping its release.

## Three-language reading contract

- Russian performances show **Russian and English**. Japanese performances show **Japanese, Russian translation and English translation** in that order. The Japanese lane is present only where it corresponds to performed Japanese, with no permanent blank space or pronunciation row.
- Use **Noto Serif** for Russian/English and **Noto Serif JP** for Japanese, Latin/Cyrillic weight500 and Japanese optical weight 600; both are OFL. Japanese lexical units join without inserted Western spaces. Their segmentation and particles require language/editorial review rather than a forced one-character-per-beat sweep.
- All lanes receive equal intended prominence: fixed glyph geometry, the same rest/focus roles and source-linked semantic timing. Shared nominal font size is only a starting point; measure optical weight/size at realistic display scale rather than assuming two scripts look identical because their CSS pixels match.
- Neutral text is `#a3b6ac`; active text is pale ivory `#f5ffe9`, with a localized mint halo. Nominal active/rest luminance contrast is approximately2.07:1 before shadows/compositing. That calculation describes chosen pigment contrast; it does not prove focus recognition over the moving picture.
- A dark glyph outline keeps neutral words legible over snow and practical-light flares. Current-glyph shadow state is assigned before both outline and fill, preventing the previous token’s glow from leaking into the next one.
- No bouncing/scaling glyphs, karaoke underlines, boxes, pills or cumulative fill. The active source event changes color/light immediately at its selected inclusive start and clears at its exclusive end. A semantic translation expansion uses the union of its true contributors; unrelated gaps and intervening words stay neutral.
- Entire cue visibility is distinct from word focus. Every active-voice frame is fully opaque. A neutral reading lead or independently reviewed final hold can remain outside the acoustic event, followed by a gentle fade when the actual gap allows it. An atomic handoff has no synthetic entrance fade or midpoint blackout.

The [latest portrait visibility issue](../po-kamushku-lyric-film/KNOWN-ISSUES.md) motivates the stronger luminance split and localized focus light. Review all three lanes at native size, 360×640 portrait and a smaller approximately270×480 player under ordinary brightness. Include a quiet long word, rapid handoff, dense translation, the Japanese passage and brightest source flare. Correct mathematical focus and glyph-palette matching cannot substitute for that perceptual check.

## Fixed measured spectrum

The first treatment is a **48-column** supporting spectrum. It interpolates **24 measured logarithmic bands** from40Hz to10kHz; interpolation does not create48 independent frequency measurements. Column positions, width, baseline and maximum reach stay fixed in each format through all source cuts. Its silver/green light borrows the source practical-light palette rather than changing hue whenever the shot changes.

Current feature input contains original-clock 25Hz rows of RMS, a rise observation and24 band powers. It averages stereo power, with a4096-sample Hann spectrum at22,050Hz (approximately185.76ms support) and40ms RMS windows. These are measured music features, not millisecond sung-word or beat markers. The current spectrum uses RMS and band power; it does not describe the stored rise field as an additional live effect.

```text
bandDb = -96 + encodedBand * 96 / 255
level = clamp((bandDb + 60) / 48)
rmsWeight = clamp((rmsDb + 42) / 30)
height = 2 + maxTravel * level^1.55 * (.42 + .58*rmsWeight)
           * (.62 + .38*sin(pi*(column + .5)/48))
```

The source’s whole-track band distribution has median approximately−35.01dBFS, 90th percentile−21.08dBFS and99th percentile−14.68dBFS. Those observations informed a bounded display range without per-shot or quiet-section max-normalization. Bar fill grades from a pale cap through source-compatible green into a soft darker base. One small local bloom provides depth; there is no claimed physical reflection, detached mirror strip or independently traveling bright marker. Quiet and forceful musical passages must retain visibly different reach.

The title and spectrum enter over0.1–0.7s and clear over241.9–242.65s, before the original credit card near243s. The native readability shade also clears during that ending interval so the source credit card remains unmodified. These are display envelopes, not lyric timings or claims about a musical beat. Lyrics follow their own complete performed inventory and reviewed holds; a decorative exit must never truncate a remaining vocal.

## Clock, recovery and acceptance checks

One original media element supplies soundtrack, source time and decoded picture. Read that actual time for word focus and feature lookup; retain native picture PTS separately. A25fps held picture can coexist with finer display-cadence focus. No wall-clock particles, global anticipation, hidden audio processing graph or layout-specific lyric offset is introduced.

Before presenting the completed preview:

1. Verify locked source/feature identities and loaded revision, not only a query parameter or visible badge. Warm fonts and static layout work before playback.
2. Confirm the complete moving picture after first load, paused seeks, restart, reduced speed, format changes and recovery. Advancing audio/slider is not picture evidence.
3. Inspect every cue in every displayed language, including first active frame, exclusive end, complete grammatical expansion, repeat and held final word. Keep acoustic ownership, display focus and line lifetime separate.
4. Review source faces/hands/credits, neutral contrast, focus salience, spectrum strength, reserved reading gap and blurred portrait fill at actual playback cadence and phone sizes.
5. Compare one quiet and one strong passage with the spectrum enabled/disabled. Tune useful musical response without making the source’s orb, snow, scratches or camera motion compete with reading.
6. Record actual visual, technical, semantic and listening scopes separately. Source inspection and synthetic layout proofs do not complete listening or production authorization.

The current handoff stops at the full-recording preview. Full rendering, Desktop kits and media publication require the current song’s completed applicable review and explicit authorization. Remote source work remains with the coordinator, who must freshly inspect all-workflow/all-branch/all-actor current-UTC-day runs and rerun attempts before any Actions-triggering operation, estimate resulting runs/minutes and apply the current policy. Unknown monthly usage remains unknown; do not bypass checks or reuse another song’s permission.

## Current v2 overlap presentation

The earlier short-tail closing treatment above is historical v1. [Preview v2](OVERLAP-REVISION.md) uses a full independent Japanese-led block above the Russian-led foreground from the newly recovered backing pair. Both native blocks share the picture's center axis, with upper placement at y105; portrait reserves two centered reading regions below the unchanged full source window. Both voices use equal 64px type in concurrent passages, and the Japanese region remains fixed after Russian ends. The spectrum anchor is unchanged.
