# Preview decisions and reusable lessons

## Recording and coverage

The selected upload is **REDCHINAWAVE — Друг [official audio]**, 1920×1080 at 30 fps with 4,500 native pictures. Its actual illustration is the entire 1080×1080 center, at x=420, y=0; only encoded pillarboxes are excluded. The 44.1 kHz AAC soundtrack starts at zero. Container duration is 150.070567 s, about 70.6 ms beyond the picture. Keep the final decoded picture through that short tail.

Original media, reference artwork, feature data and timeline share an explicit source hash. The browser's hidden source video supplies both sound and picture. Native picture PTS stays separate from finer `video.currentTime` word selection; display-cadence paints avoid waiting for the next 30 fps picture. Seek recovery refuses stale pictures and does not extrapolate over buffering. There is no silent source-picture fallback or shortened preview.

The supplied eight verse lines occur twice. The filtered passages retain five repeats after the first verse and ten after the second, for 93 Russian events across 22 cues. Opening and closing instrumentals remain part of the complete preview. Recognition hallucinations over instrumental passages are excluded.

## Timing decisions and limits

1. Decode unchanged original audio. Generate an HTDemucs vocal estimate at 44.1 kHz with identical input/output sample counts, fixed seed 0, shifts=1 and overlap=0.25. The estimate has zero declared clock offset and is diagnostic only.
2. Compare unprompted Whisper coverage with independently bounded crops. Retain conditioned large-v3-turbo paths and MMS forced-alignment observations for original and estimated vocals. Both are proposals: conditioning does not prove the text is sung.
3. Inspect original/stem waveform and harmonic context with 64 ms STFT windows and 4 ms hops. Select word starts and lexical/held ends occurrence by occurrence. The first quiet `Я` starts near 8.12 s; its second occurrence near 68.08 s. Neither crop-start silence nor late model cores sets the onset automatically.
4. Check filtered fragments with normalized relative similarity. Broad MMS allocations into 46–51 s and 115–125 s were rejected. A roughly 60-second section separation does not justify copying all boundaries: measured similarity was imperfect and each occurrence retains its own selection.
5. Store start-inclusive/end-exclusive 44.1 kHz sample indices. Preserve true fractional playback samples; repair only floating-point multiplication error at exact integer endpoints. No global anticipation shift or extra highlight hold is added.
6. Keep whole-line reading life separate from word focus. A line holds at full opacity through the selected final event. Use 420–500 ms fades where there is room; an adjoining vocal replaces the old neutral line without squeezing a fade into a tiny gap.

[Selected boundaries](source/selected-boundaries.json) and [competing observations](source/acoustic-observations.json) retain their uncertainty. The last low-level chopped candidate at **111.212–111.820 s** especially needs reduced-speed listening. This preparation did not establish an agent human-listening log, perceptually exact milliseconds or uniquely certain echo ownership. Current owner listening and render approval remain pending.

## Translation and word focus

Russian words retain separate source events. Natural English can move focus backward in sentence order; do not invent a left-to-right translation clock. Examples:

| Russian event/construction | Complete English meaning | Decision |
| --- | --- | --- |
| Будешь | you'll be | Shared grammatical expansion; теперь / Now remains independent |
| вместо | substitute for | Complete prepositional meaning, without an invented timing for `for` |
| хочется | I want to | Complete desire construction; touch/feel remain separate |
| это + ты | you're | Union of independently measured identification events; release over any gap |
| красивее | prettier than | Comparative morphology includes `than` |
| больного | a sick person's | Complete singular possessive, distinct from хрипов / wheezing |
| detached больного | someone sick | Singular person; not an invented plural noun or new verb |

Adjacent English tokens with identical membership wrap together. Russian and English use the same 54 px wide / 58 px portrait type, reduced only when a complete cue needs it. Neutral `#aaa1a1` and focused `#fff0d7` remain identical between languages. Focus changes color without bounce, badges, word movement or blurred halos.

## Illustration, architecture and motion

The first skyline was too close to a row of lit spectrum marks; the first raven routes also read as parallel travel. The revised scene gives the architecture enough fixed structure to remain recognizable in quiet intervals and lets individual birds turn through the sky.

- **Building depth:** three overlapping distances, irregular footprints and street gaps, perspective side faces, stepped/gabled/tank/antenna roof profiles, window frames and sparse floor ledges. Smaller distant details and darker foreground faces create depth without a blur filter. These structures never grow or shift with music.
- **Window response:** 24 measured 40–10,000 Hz bands from original stereo mean-square power. Raw analysis uses 2,048-sample FFTs at 22.05 kHz, 50 Hz feature rows, 40 ms RMS and 20 ms transient windows. Display response uses a symmetric five-row weighted envelope, about 80 ms of support. This transforms display only; lyric boundaries and raw features remain intact.
- **Occupied windows:** deterministic varied occupancy. Each building combines its assigned band with its neighbors (0.58 / 0.27 / 0.15); activity changes light intensity in real window rectangles. Band assignment is distributed rather than making a left-to-right meter. No row-height threshold produces equalizer bars.
- **Raven routes:** three independent Catmull-Rom curves with different altitude changes, depth scales (0.32 / 0.48 / 0.65) and direction. Position uses integrated source-time wind, so seeks reconstruct the same frame. Tangents drive banking; slower independent cycles alternate gliding with articulated asymmetric wingbeats. Protected face and reading areas stay clear.
- **Feathers and print:** five sparse feathers drift along swaying paths only in the empty wide sky. A low-opacity red print mask touches dark hair interiors, preserving skin, eyes and silhouette. A bounded red ink offset on the filtered word adds texture while letter bodies remain still.
- **Crisp finish:** remove blurred word halos; retain a small dark outline/offset for readability. Source illustration, architectural contours and typography stay sharp. Soft source-edge alpha blending joins the wide extension without replacing the picture.

Wide output geometry preserves the full square at the left, with equal bilingual type on the continued red-to-charcoal sky. Portrait preserves the full square above a larger centered reading area and layered lower city. Review mobile focus contrast at reduced size as well as native dimensions.

A small fixed empty-sky patch (x=485, y=85, 30×30 in the square) supplies the decoded red once for each source object. This handles small browser/FFmpeg color-conversion differences at the artwork/extension join. Prewarm and cache it before revealing the scene; do not chase exposure or repeatedly read back the GPU while playing. Hair masks still use the canonical reference, rather than changing with a seek.

## Evidence and production boundary

Five contracts cover complete correspondence, exact inclusive/exclusive state, grammar expansions, filtered coverage, reading handoff and negative production gates. Native proof checks every cue in both formats and writes explicitly labelled stills. Actual browser checks separately confirm the loaded identity, original picture, finer word clock, playback, seeks, format/speed changes, animation comparison and recovery.

A representative browser still is preview evidence. It is not an encoded final frame or an acoustic review. Future production must use the same frozen scene/timeline/reference/font/features, record current listening scope and render authorization, then verify complete decode, source/audio identity, all PTS, no source gaps and encoded glyph states. Only then prepare the Desktop upload kit and update final-frame README evidence.
