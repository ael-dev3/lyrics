# Bilingual lyric workflow: equal emphasis

**Default for future productions, recorded after Пожары v1.0.0:** original-language and English lyrics are equally prominent parts of the film. Give English equal perceived size, weight, color strength, highlighting and synchronization precision. This requirement takes precedence over smaller or dimmer translation treatments in earlier project examples.

This is a forward-looking production standard. It does not change published movies, finalized timing data or release archives. The [Пожары production record](../projects/pozhary-lyric-film/README.md) documents the completed implementation and its limitations.

## Equal treatment in the composition

| Dimension | Required treatment |
| --- | --- |
| Size and weight | Start with the same font size and weight for both languages. If different fonts need optical adjustment, match visible letter height and stroke strength and record the adjustment. English must not read as a smaller caption. |
| Color and contrast | Use the same active accent, inactive text color and opacity by default, drawn from the current track's palette. Any language-specific hues must provide comparable contrast and prominence over the actual artwork. |
| Highlighting | Apply the same focus treatment, including underline or other emphasis, attack, release and visual intensity. A strong original-language highlight must not become a faint color change in English. |
| Synchronization | Drive both languages from the same sample-indexed source events. English semantic groups activate with the corresponding performed meaning and receive the same onset, handoff and release scrutiny. |
| Reading area | Give both languages enough stable space to read comfortably. Keep both visible for the relevant passage and protected from artwork, effects and platform overlays. |
| Long lines | Rephrase only when meaning is preserved; otherwise reflow, split at semantic boundaries or rebalance the composition. Do not solve overflow by shrinking or dimming English alone. |

Equal prominence does not require an identical number of words or a forced word-for-word translation. Keep English in natural reading order and map its words or short phrases to source-token groups. When grammar differs, focus may move backward or activate several words together. Avoid invented English syllable timings: the source performance remains the timing authority.

Keep translation lyrics separate from small metadata labels such as artist names or language tags. Both lyric lanes belong to the sharp, high-priority text layer.

## Production sequence

1. **Lock inputs and provenance.** Record the exact recording, decoded sample count, artwork, supplied lyrics, creator links and hashes. Inspect whether source imagery is animated or static. Use official higher-resolution artwork when available; describe newly authored motion accurately.
2. **Prepare independent timing evidence.** Retain the original mix, derive analysis inputs without moving timeline zero, and use an isolated vocal stem where helpful. Align bounded phrases with independent model observations, then examine uncertain onsets and releases against waveform and spectrogram evidence. Save candidates, selections and uncertainty.
3. **Resolve repetitions and difficult passages.** Review repeated performances independently. Transfer timing only when measured audio similarity and independent boundary evidence support a documented transform. Use explicit groups for ambiguous short words or chopped vocals; do not claim separately measured echoes without evidence.
4. **Map English meaning.** Give source tokens and English segments stable identifiers. Link each translated segment to its performed source group, including reordered, repeated or simultaneous activation. Validate text coverage, positive intervals, bounds, exclusive cue ends and semantic targets.
5. **Lock delivery audio and features.** Preserve timing through the final audio encode; measure loudness and true peak and record any gain. Generate final spectrum features from the locked delivery soundtrack. Keep calibrated frequency measurements separate from expressive particles, camera movement and decorative motion.
6. **Compose both languages as peers.** Use the equal-treatment table above in each requested aspect ratio. Preserve the song's artwork and palette. Build a dedicated landscape and vertical composition when both are requested; reuse timing and audio, not a cropped lyric layout.
7. **Review a short style preview.** Include quiet lyrics, the fastest handoff, the longest English line, a reordered semantic group, an uncertain passage and a bright/busy artwork moment. Use more than one short clip if needed. Inspect both languages at native and intended mobile size, then review timing with audio. Record which checks were performed and which remain uncertain.
8. **Render and inspect final media.** Freeze fonts and source data, check all active/inactive lyric states, then render a high-quality reference and controlled final downsample/encode. Verify full decoding, frame cadence, dimensions, duration, color metadata and soundtrack identity across editions. Inspect selected decoded frames, including joins, handoffs and the outro.
9. **Package and document.** Include finalized cues, translation mappings, source manifests, reproducible commands, software/model attribution, review evidence, covers, concise artist-focused publishing copy and checksums. Follow the [TikTok profile-cover default](tiktok-cover-workflow.md) when applicable. Exclude pronunciation material and private build data. Copy to the requested handoff location and verify published assets against local hashes when publication is in scope.

## Style-preview acceptance gate

Record these checks separately for every delivery aspect ratio before the full render:

- Both languages look equally large and strong at native resolution and at the intended mobile display size; record the review dimensions and any optical font adjustment.
- Active and inactive English text remains as legible as the original language over the brightest and darkest sampled artwork states.
- Both languages receive equivalent word/group emphasis. Inspect onset, handoff and exclusive-end frames, including the frame immediately before and after each high-risk boundary.
- English follows the performed meaning without a separate delay, premature fade or cumulative timing drift. A reordered phrase keeps its natural reading order and stable glyph positions.
- The longest translation fits at equal prominence without clipping, collisions, abrupt reflow or English-only font reduction.
- Spectrum, particles and camera motion do not obscure either language. Both lanes retain their reading areas through entrances, holds and exits.

Save a paired-language contact sheet and a short preview with audio, plus a brief result for each check. Technical geometry checks support visual and listening review; they do not establish equal perceived prominence or acoustic accuracy on their own. At 60 fps, nearest-frame placement can be within about 8.33 ms while the underlying inferred vocal boundary remains less certain.

## Lessons carried forward from Пожары

The completed film provides a reproducible reference for bounded alignment, source-linked English meanings, separate measured and expressive visuals, dedicated aspect ratios, 2× rendering and verification of downloaded release bytes. Its [timing record](../projects/pozhary-lyric-film/README.md#timing-and-translation) also documents rejected alignment drift, evidence for a repeated-section transfer and the uncertainty of a chopped bridge.

The released design uses large Oswald Russian lyrics and smaller Space Grotesk English translations, with a stronger Russian focus treatment. The next production must keep the timing discipline while replacing that hierarchy with equal bilingual emphasis. Existing screenshots illustrate the historical treatment; they are not the typography target for future English lyrics.

Use the [general production workflow](production-workflow.md) for the broader pipeline, the [first-pass workflow](first-pass-song-workflow.md) for prototype and timing checks, and each project's own commands to reproduce a particular release. Exact palettes, audio gain, model choices and encode settings are track-specific decisions rather than universal presets.
