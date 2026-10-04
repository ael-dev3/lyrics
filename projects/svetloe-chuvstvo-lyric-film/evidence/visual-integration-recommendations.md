# Светлое чувство — integration recommendations

**Design proposal for a complete playable preview.** The [source study](source-visual-study.md) establishes the actual square shadow-theatre artwork. These recommendations are not a record of implementation, listening acceptance or a production authorization. Read the final scene/visual brief and browser evidence for the treatment actually built and reviewed.

## One coherent idea: illuminate the existing theatre

Keep the paper woman, raised hand, bird, stars, curtain edges and worn photograph exactly in place. Let the houses' **ten existing lit openings** carry measured music response. Put stable Russian and English reading in a clear part of the same composition, with ink and candle colours borrowed from the picture. The theatre remains the scene; musical light and readable words give it a new temporal life.

| Layer | Intended role | Relative attention during singing |
| --- | --- | --- |
| Original square artwork | Principal scene and artist identity | Protect the silhouette and bird gesture |
| Russian and English lyrics | Stable central reading focus | Equal optical size, weight and active/neutral salience |
| House-window response | Environmental visualizer using actual cutouts | Clearly visible measured movement, subordinate to active words and the central subject |
| Local light spill | Optional narrow softness adjacent to a lit opening | Subordinate to the source window; retain only if the small-player A/B comparison improves integration |
| Portrait surround | Source-derived cloth or floor atmosphere outside the full sharp square | No second readable silhouette, invented building or black placeholder |

Do not add a detached spectrum strip, a new stage, procedural city, geometric ring, rain, falling leaves, camera shake or travelling particle motif. The source's theatrical stars are paper, not an astronomical sky. The paper bird does not need fake flight. A small number of scene-owned changes is more coherent than illustrating every lyric noun.

## Fixed window geometry; independent musical response

Use the native mask centres in the source study only as initial guides. Trace the actual interior shapes on the canonical 1-second source reference. Prepare masks before the first playable frame; repeated source-pixel readback at a later musical entrance can stall playback. Retain source grain and the black window divisions. The canonical reference is an analysis/mask asset, not a replacement for the source media element.

- Bind each pane to documented, source-clocked frequency-band power; ten visual hosts may aggregate the measured bands. Ten panes do not imply ten independently measured values unless the feature generator actually supplies them.
- Keep all window locations, silhouettes, width and maximum reach fixed in each composition. Musical response changes interior light, not house placement or scale.
- Compare **interior luminance modulation** with **bounded lower-to-upper light fill within a pane**. The second option can make the measured response easier to see without creating a separate bar; it remains a compositing interpretation, not a claim that the photographed houses contain real music lamps.
- Choose a useful whole-track dynamic range. Preserve quiet/strong differences rather than locally normalizing every quiet passage to maximum brightness. Keep absolute silence a legitimate no-added-light state.
- Smoothing should tame flicker while retaining clear musical attacks. Store raw measurements separately from display exponent, RMS weighting, brightness cap and any section envelope. Do not label a spectrum-window transient as a sung word or millisecond beat.
- Window fill should feather inward. Any external soft spill must remain small, masked away from black paper edges, the person and text. A complete glowing outline or detached mirror strip would change the paper material.
- Where musical light is invisible at narrow-player size, first improve the useful pane contrast and response range. Do not compensate with unrelated particles or global exposure pumping.

Candidate warm light pigment: **#f2cb89**. This is an initial authored choice, not an accepted palette or an exact simulated lamp temperature. Keep source exposure and original window texture in the composite. Avoid matching the brightest word by making every window permanently white.

The existing openings have relatively small phone footprints. In a 360px-wide view, source objects are one-third their native dimensions. Correct band lookup alone does not prove that viewers recognize the response; it needs an actual moving A/B comparison at 360px and at approximately270px width.

## Typography should feel like theatre lettering while reading easily

Both languages use the same typeface or optically matched weights, shared intended size and full active/neutral strength. Russian words receive independent acoustic events; English articles, auxiliaries and other necessary grammatical expansions receive the corresponding event's complete meaning focus. Reordered meanings can light non-linearly while the words stay fixed. No invented English phonetic timestamps, bouncing letters, underlines, boxes, pills or cumulative karaoke fill.

Two viable source-native reading regions should be tested before choosing one:

| Region | Candidate treatment | Main limitation |
| --- | --- | --- |
| Pale top strip, y0–145 | Two centred, short RU/EN rows; approximately54–58px initial shared native size; charcoal ink neutral **#302b25**, russet emphasis **#b5572c** | Full bilingual wrapping will cross the curtain line. Segment source phrases at justified real clause boundaries rather than shrinking English or covering the stars. Ensure active focus changes luminance as well as hue and keeps sufficient contrast against pale cloth. |
| Dark floor, y900–1080 | Two equal short rows; about58px initial shared native size; taupe neutral **#b8aa90**, candle emphasis **#ffedbf** | It has only about180–190px after preserving the original title. Four wrapped rows cannot fit at that size without changing composition. Dense cues need another reviewed solution. |

These numbers are proposal starting points, not fit guarantees. The complete transcript and actual measured glyph boxes determine the choice. Avoid moving one active phrase between regions to chase an animation. If a genuine composition change is necessary, place it at a deliberate cue boundary and preserve held-word ownership.

The source title around y858–872 should remain readable. The central silhouette cannot serve as an unlimited dark subtitle panel: putting long text across the face, hand or bird weakens the source gesture. Contrast treatment should blend continuously into the photograph and remain independent of cue visibility. It must not become a rectangular caption panel.

Use per-glyph isolated shadow/outline state. Set the current token's shadow before drawing its outline and body; a prior active glyph must not lend its glow to the following neutral word. Onset colour must be immediate at the selected source sample, with no easing ramp. Full-line opacity, neutral reading hold and fade remain separate from word focus. Closely adjoining phrases should hand off atomically rather than introduce a midpoint blank.

## Portrait composition

Retain the complete sharp 1080×1080 square. Keep both house groups, the bird and original title; never silently take a centre crop that removes the left visualizer. A portrait extension can use defocused samples of the **empty** source cloth/floor, or another deliberately restrained source-derived continuation. Exclude a duplicated readable woman, bird, stars or source title from the surround.

The 1080×1920 stage provides room to give the pair more readable vertical space. Compose portrait independently rather than stretching the native text host. Reserve a fixed house-light footprint, source window and reading region together before fitting the longest translation. Use a clearly stronger active/neutral distinction at phone size; the documented prior portrait issue shows that mathematically correct palette states can still be too dim to follow.

The projection is a new presentation of the original square artwork, not evidence that the photograph was captured vertically. The preview should make the original source picture obvious on first load, every seek and recovery.

## Keep atmosphere separate from acoustic meaning

The song's bright feeling and memory-of-home language relate naturally to cloth, warm window light and a modest theatre. Their emotional relation is art direction, not an objective measurement. Begin with window response and colour-only word focus; no additional meaning animation is required merely to make this edition different.

If the composed preview supports one further local effect, consider a **small, bounded candle-light softening** around the actual word/meaning for bright light, selected by exact stable event IDs. It must not move the glyph, widen its acoustic interval, flash the backdrop, brighten unrelated occurrences or obscure neighbouring words. Compare enabled/disabled at normal speed and ordinary player size. Omit it if the light already reads through focus and windows.

All pane response, source-derived surround, optional light and decay use the original media's source time. A paused seek reconstructs the same frame; no wall-clock sway or accumulated particles are needed. Keep native picture PTS distinct from the finer word clock. A still source image is expected, but broken loading or a missing compositor layer is not.

## Acceptance work before preview handoff

1. Inspect the complete composition at native square size, 360px-wide native player, 360×640 portrait and a smaller approximately270×480 portrait player. Check the longest clause, short repeated words, muted sections, strongest arrangement and final held light words.
2. Verify every Russian and English cue fits with equal optical prominence, full active-frame opacity and no source-title/subject obstruction. Check inactive text as well as the highlight.
3. Compare windows enabled/disabled at the same quiet and strong source times. Record useful visual prominence separately from measured feature identity and acoustic timing. Keep the simpler version if extra spill harms paper texture.
4. Inspect window borders, round/arched openings and mullions at native and narrow size. Review whether fills read as existing theatre light rather than unrelated rectangular bars.
5. Test first load, start, pause, arbitrary seek, reduced speed, layout switch and recovery. Record actual loaded scene/timeline/source hashes; a rebuilt file or query string is insufficient identity evidence.
6. Review all vocal onsets, complete held endings and every repeated performance against actual audio. Source screenshots, model paths and numerical samples must not be labelled human listening. Confirm line lifetime independently from word release.
7. Save a representative **complete browser-preview** screenshot with source attribution and correct timestamp. Do not label it a decoded final film.
8. Stop at the full-recording playable preview. Full production, Desktop files and media publication require the current edition's completed applicable review and explicit authorization.

## Reusable method carried forward

The [scene-integration guide](../../../docs/scene-integrated-visuals.md) provides role, lighting and A/B review requirements. [Source-clocked word effects](../../../docs/source-clocked-word-effects-workflow.md) separates measured features, word focus and decorative life. [По камушку](../../po-kamushku-lyric-film/PRODUCTION-LESSONS.md) contributes canonical material masks, cache preparation, first-active-frame opacity and glyph isolation; [Кометы](../../komety-lyric-film/PRODUCTION-LESSONS.md) contributes connected onset/held ending and line-lifetime prevention; [призрак](../../prizrak-lyric-film/PRODUCTION-LESSONS.md) contributes equal optical emphasis, source-clock and final-byte distinction. These are technical/editorial methods, not song-specific visual inspiration to copy.

Public records should describe the selected treatment and uncertainty neutrally, without personal quotations, ratings, private account paths or review transcripts. Remote work belongs to the coordinator and the current conservative Actions policy: inspect all current-UTC-day workflows/branches/actors/runs and older rerun attempts before any trigger-capable operation, estimate chains and runner minutes, report unknown usage as unknown and preserve required checks. No remote operation or production render was part of this study.

## Independent first shared-scene review

This subsequent check inspected the actual scene implementation, anchor polygons and canonical 1-second source image, then made **synthetic visual diagnostics** through the shared scene. It is narrower than an all-cue composed-preview review: the diagnostic uses a short `Мир, в котором я рос / The world I grew up in` fixture with explicitly synthetic lexical intervals. Its feature values are frozen to two measured source rows for a controlled quiet/strong comparison. It must not be used as canonical timing, listening attestation, a browser screenshot or final encoded-film evidence.

Reviewed implementation identities:

| Input | SHA-256 |
| --- | --- |
| Scene after the border-preservation correction | `8866dcfd61b73b7e30c8cf34a897f792bf7139b74442a8fd3e33fea8dbb22f68` |
| Reading model / initial palette | `e40e8cc12c25fb8ff8134bac974d4b6bb4bf0f8e8ad55cf848732b3eaf99df36` |
| Ten window-anchor polygons | `b96f1d0f7a91d4a2f251ebae3380781dc5f83dc802c0e944a1d859f46b9f3b48` |
| Source-clocked features | `4a01a2996164c72af621cc952edd6546aa3827a6a6e0b11c95544dd687009ed4` |
| Canonical source reference | `c6f7f5aca2cfa8c7c80b0b2812b1df6c5af577dbccf58708197da66e4f787da9` |

### Window masks and paper material

All ten polygons follow the source's existing rectangular, round or arched openings. An independent reconstruction of the inward feather and luminance selection found **zero nonzero mask pixels with source luminance ≤0.30** in every opening. The base multiply/screen passes therefore avoid the darkest paper frames and mullions; the central woman, bird, roof outlines and title are outside the hosts.

The first code version added an unmasked `blur(3px)` pass, whose comment claimed it stayed inside the window. That claim was unsupported: an approximate Gaussian diagnostic found light on otherwise excluded paper and especially on narrow mullions. The coordinator removed that outer blurred-emission pass. The reviewed scene above retains the existing soft source edges without a new halo or neon outline. This correction was a material/compositing issue, not an acoustic sample change. Exact Canvas blur differs from the independent Gaussian approximation; the diagnostic quantified a failure mechanism rather than final pixels.

The window display groups the 24 measured bands into ten pane responses. It sums assigned linear powers before converting back to dB, then applies its bounded nonlinear display mapping. The current implementation does **not** use the RMS or transient field for an additional effect. The two comparison rows are the tenth and ninetieth percentiles of mean pane response across the interior recording range: **165.04 s, mean response 0.206820**, and **46.92 s, mean response 0.743107**. They are useful display-range samples, not a human judgment of the quietest or most intense sung phrase.

### Reading and source preservation

The native scene draws the complete 1080×1080 source at its original aspect. The portrait scene places that complete sharp square at **x0, y400, width1080, height1080**, without cropping either house, the raised hand or source title. The surrounding area samples empty upper cloth and lower floor rather than making a second readable woman or bird.

The inspected short fixture gives the two languages identical font, weight, palette and size. Native size 54px yields a nominal reading block **y12–159.42**; portrait size 72px yields **y86.72–283.28**, safely above the sharp source window. Both languages remain clear at **360px and 270px native widths**, and at **360×640 /270×480 portrait**. The short fixture's actual glyphs stay in central pale negative space and do not cover the face, bird, houses or authored title. This does not certify every longer source/translation chunk; the coordinator's complete semantic-chunk proofs must still check those independently.

Initial neutral ink `#51483c` and rust focus `#a33e12` have a nominal luminance ratio of about **1.38984:1** between themselves. That number alone does not establish perceptual prominence against the source. In the inspected narrow-player fixture, the rust source word and complete English expansion were visibly distinct and equally readable. Retain that real-size comparison rather than automatically maximizing brightness solely from a code-level ratio. Rapid short-word changes and the complete recording still need actual playback review.

The source-derived portrait extensions show a slight texture/exposure join at **y400 and y1480** and visibly stretched lower floor grain. No black placeholder, missing picture or duplicated subject was found in these diagnostics. A narrow blend confined to the external fill is an optional composition polish; preserve every sharp source edge and avoid treating this proposal as a required acoustic correction.

### Evidence retained and unfinished checks

Scratch diagnostics are under `analysis/visual-study/`: the source/mask overlay, independent mask report, native/portrait quiet/strong stills at full and narrow sizes, and the synthetic composition identity record. Their headers explicitly limit them to visual inspection. They are neither production films nor proof that the final output encoder matches the browser.

This pass establishes a credible source-owned window treatment and readable short bilingual geometry. All-cue fit, normal-speed pane motion, rapid word salience, actual browser font resolution, transport/recovery, complete onset/release listening and current-revision review remain separate checks. No source-code, timeline, Git or remote mutation was made by the independent reviewer.

## Canonical composed-still QA — 4 October 2026

The later **`svetloe-chuvstvo-v1-source-informed-preview`** review uses the real selected timeline and source times, superseding the synthetic fixture for composition coverage. Inspected all **46 native and 46 portrait** contact-sheet cells at their authored 360px tile width, plus representative separate native 360px / portrait 360×640 stills covering the opening and repeated feeling phrases. These are shared-scene stills, not browser captures, encoded-film samples or listening evidence.

| Reviewed canonical input | SHA-256 |
| --- | --- |
| Scene | `0386cab3bd4fa1c42036aaf17bb4146010acdffd384d5bf5db24e70579072604` |
| Reading model / strengthened palette | `5f37f80220f14565f48ad48638394d837243caa827ea7e10cf03f2c20cfa8582` |
| Real selected timeline | `b66faf257a6432478f0e44253e62e2b23612da290125f3d863d41972054b4d71` |
| Layout ledger | `bd4a168271ae44a394341c324c6bd7fd080fdece6ed3561f38f3da16d54afa67` |
| Native all-cue contact sheet | `0d9e5d4aa7274f5ea8c3d1019608945314bc6e61bbc46f6a51a76ae4ec7b48a1` |
| Portrait all-cue contact sheet | `32728926507bbe7487ac6cc5471d3875a0e9163dba670a5512d8bed68762ab2a` |

**No still-composition blocker found.** Both language lanes remain readable with equal optical treatment, including the dense planet/cottage clauses, backward English focus and repeated hyphenated superlatives. No clipped reading row, source-title obstruction, subject/bird collision or missing artwork was seen. Native cues keep one Russian and one English row at a shared 50px or 54px. Portrait cues retain shared 72px with one or two rows per language. Their nominal block bottom is 393.28–478.96px; longer blocks enter only the original square's empty upper cloth, clear of curtains and the source subject. The complete sharp square remains at y400–1480 with all source edges.

The canonical neutral ink **#282720** and rust focus **#ab3810** increase their nominal mutual luminance ratio to approximately **2.35836:1**. The reviewed small stills show a clearer active-word distinction in both languages while keeping inactive reading strong. Window lighting remains in existing cutouts, with black paper/mullions and photographic detail visible. No detached spectrum, new sky, stone motif or ornamental particle layer was introduced. Reflected empty upper material and a defocused floor surround reduce the earlier extension joins without duplicating the woman, bird or source lettering.

The two unused black cells at the contact-sheet end are atlas padding, not source-video dropout. This review does not certify rapid word transitions, musical motion at normal speed, acoustic ownership, browser/renderer parity or final encoding. Those remain separate from the completed all-cue **still clarity and source integration** check. Earlier synthetic notes retain their historical identities rather than being relabelled as this canonical review.

## V3 source-time window-light refinement

The first complete preview exposed a display imbalance: the upper-left rectangle carries the two lowest frequency bands and can jump abruptly while neighboring panes remain more steadily lit. Its raw 25 fps response had a 95th-percentile adjacent-row change of 0.26005 and a largest change of 0.76286. These are normalized exposure-envelope differences, not decoded-pixel luminance or perceptual ratings.

V3 caches all ten pane envelopes through a centered Gaussian filter (80 ms sigma, ±200 ms support), then interpolates on the unchanged source clock. The largest upper-left response step falls to 0.18248 before its additional ×0.50 multiply/screen opacity modulation. The upper-left screen-alpha maximum step is consequently 0.08668, compared with 0.72472 in the original unfiltered full-strength display. The remaining panes also have smaller adjacent-row steps; [the complete measurements](window-light-review.json) retain their separate raw, smoothed and opacity domains.

The half-strength modulation applies to both compositing passes, rather than reducing the measurement itself. This brings the photographed original appearance closer while retaining the same warm pigment, opening geometry, inward masks and protected paper borders. The centered filter widens a visual accent around its source time; it adds no fixed causal delay, but it is an artistic smoothing envelope, not acoustic onset evidence. Raw features and all word intervals remain untouched. No brighter halo, new particle layer or structural animation is added.

Independent read-only review confirmed that the v3 timeline body exactly matches v2, all 11 runtime digests match, and picture/layout/mask/glyph geometry is unchanged. A unit fixture preserves constant exposure and the center of an isolated accent. Another 120 interpolation/revisit comparisons confirmed history-independent lighting. Do not infer subjective comfort or listening completion from these numerical checks.

The current real-browser check loaded v3, inspected the upper-left pane near its former sharpest transition at 151.20 seconds, played the closing reprise natively at normal speed, and played portrait from 46.92 to approximately108.99 seconds at normal speed. Portrait reduced-speed playback from149.00 seconds continued to the complete container end176.776009, retaining final native frame4418. Quiet ending165.04 and stronger arrangement46.92 were inspected in their complete compositions. The source remains the static photographed artwork, with authored window lighting; no puppet motion is claimed. Earlier full transport checks retain their v1 scope. These results support this visual refinement, not full actual-audio synchronization acceptance or encoded-film parity.

[Current native still](preview-v3-native-32.495.jpg) and [current portrait still](preview-v3-portrait-32.495.jpg) use the current shared scene at32.495 seconds with the canonical 1-second source photograph. They are explicitly not live-browser screenshots or final-film frames. Full current-edition listening review and production authorization remain pending.
