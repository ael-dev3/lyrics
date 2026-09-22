# Bilingual lyric workflow: equal emphasis

**Preview before render:** follow [the mandatory preview-first workflow](preview-before-render.md). Deliver a playable review preview before full production. Complete synchronization review and obtain explicit render approval for the current song and reviewed revision before capture or encoding. A preview-only request stops at review delivery; passing tests, positive feedback, saved review notes, a merged PR or approval of an earlier song do not authorize rendering.

**Mandatory before production rendering:** complete the [cross-language sync gate](cross-language-sync-gate.md) for the entire recording and every displayed language. This is separate from style approval and file-integrity tests.

See the [cinematic lyric presentation guide](cinematic-lyric-workflow.md) for the current visual default, an implemented reference and review requirements.

**Default for future productions, recorded after Пожары v1.0.0:** original-language and English lyrics are equally prominent parts of the film. Give English equal perceived size, weight, color strength, highlighting and synchronization precision. This requirement takes precedence over smaller or dimmer translation treatments in earlier project examples.

This is a forward-looking production standard. It does not change published movies, finalized timing data or release archives. The [Пожары production record](../projects/pozhary-lyric-film/README.md) documents the completed implementation and its limitations.

The visual default is a cinematic treatment with stable glyph positions and **color-only word or semantic-group emphasis** in both languages. Karaoke underlines, word boxes or pills, and bouncing glyphs require an explicit request. This change preserves precise synchronization and equal bilingual prominence. The current Midnight Love revision adopts the same general visual default; other published films are not retroactively changed by this standard.

## Equal treatment in the composition

| Dimension | Required treatment |
| --- | --- |
| Size and weight | Start with the same font size and weight for both languages. If different fonts need optical adjustment, match visible letter height and stroke strength and record the adjustment. English must not read as a smaller caption. |
| Color and contrast | Use the same active accent, inactive text color and opacity by default, drawn from the current track's palette. Both active and inactive lyrics must stay readable over the actual artwork at native and mobile size. Any language-specific hues must provide comparable contrast and prominence; use luminance as well as hue to distinguish focus. |
| Highlighting | Apply the same color-only word/group focus, attack, release and visual intensity with stable glyph positions. Do not use karaoke underlines, word boxes or pills, or bouncing glyphs unless explicitly requested. English must receive the same visible emphasis as the original language. |
| Synchronization | Drive both languages from the same sample-indexed source events. English semantic groups activate with the corresponding performed meaning and receive the same onset, handoff and release scrutiny. |
| Reading area | Give both languages enough stable space to read comfortably. Keep both visible for the relevant passage and protected from artwork, effects and platform overlays. |
| Long lines | Rephrase only when meaning is preserved; otherwise reflow, split at semantic boundaries or rebalance the composition. Do not solve overflow by shrinking or dimming English alone. |

Equal prominence does not require an identical number of words or a forced word-for-word translation. Keep English in natural reading order and map its words or short phrases to source-token groups. When grammar differs, focus may move backward or activate several words together. Avoid invented English syllable timings: the source performance remains the timing authority.

Keep translation lyrics separate from small metadata labels such as artist names or language tags. Both lyric lanes belong to the sharp, high-priority text layer.

## Translation and word correspondence audit

- Preserve meaning conservatively. Do not fill an unstated love object with a guessed addressee, add an unstated possessive, remove an explicit conjunction, or omit negation, degree, repetition or emphasis merely to make a line smoother. Necessary English grammatical completions must be distinguished from new content.
- Prefer individual correspondences for pronouns, verbs, nouns, conjunctions, negators and prepositions. For example, Russian «что я любила» maps to **that / I / loved**, with three independent source events and no added object. Reordered English keeps natural reading order while each word follows its own source token.
- Use an English multi-word expression when a single Russian word encodes that meaning, such as a tense-marked verb or a phrasal-verb equivalent. Use a group spanning multiple Russian source words only when a compound, idiom or grammatical construction prevents a defensible finer correspondence. Record the reason for every exception; group size is not a rendering or effort optimization.
- Highlight the smallest **semantically complete** translated span. Necessary articles, pronouns, auxiliaries or elliptical completions that belong to that meaning may share the source word’s focus window. Do not leave them neutral merely because they lack a separate source token, and do not invent separate acoustic times for them. In the selected translation, «Остыла» covers **I have grown cold** and «прости» covers **forgive me**. Neutral words need a positive editorial reason. This replaces the blanket neutral-grammar rule that left gaps in Прости за любовь v1.2.
- When an English preposition expresses case morphology rather than a separately sung source word, anchor it to a defensible point in the construction. In «жарким огнём», both words carry instrumental case: **жарким / with blazing**, then **огнём / fire**, provides a natural forward handoff. Preserve the separate adjective and noun events; do not invent a preposition timestamp or leave necessary grammar permanently neutral.
- Before grouping a construction, consider whether equally natural wording preserves a finer correspondence. For «Те же», **Those same** retains the demonstrative and permits **Те / Those**, then **же / same**. Recheck the wider glyph layout; do not rewrite meaning merely to force left-to-right highlights.
- Phrase focus follows the union of the participating source-word intervals, not their enclosing start/end span. Release focus during gaps; do not hold it over an unrelated source word or interpolate invented English word timings.
- Review every source word and every target-language word in a ledger showing the correspondence, full target span, relation, rationale and actual timing. Inspect rendered focus states in every delivery format, including short pronouns, reversed word order, negation, conjunctions, all phrase exceptions and the final vocal.
- Add semantic regression expectations for easy individual matches **and complete meaning spans**, alongside every-frame source-window checks. Test both under-highlighting and over-highlighting. A high count of one-word matches or few phrase groups is not a quality target; interval consistency alone cannot prove translation quality or the adequacy of the chosen mapping.
- Keep interpretive ambiguity explicit. Do not describe a chosen parse as author-certified or a model/still audit as human listening. Use a short corrected preview before committing to the full export.

## Production sequence

1. **Lock inputs and provenance.** Record the exact recording, decoded sample count, artwork, supplied lyrics, creator links and hashes. Inspect whether source imagery is animated or static. Use official higher-resolution artwork when available; describe newly authored motion accurately.
2. **Prepare independent timing evidence.** Retain the original mix, derive analysis inputs without moving timeline zero, and use an isolated vocal stem where helpful. Align bounded phrases with independent model observations, then examine uncertain onsets and releases against waveform and spectrogram evidence. Save candidates, selections and uncertainty.
3. **Resolve repetitions and difficult passages.** Review repeated performances independently. Transfer timing only when measured audio similarity and independent boundary evidence support a documented transform. Use explicit groups for ambiguous short words or chopped vocals; do not claim separately measured echoes without evidence.
4. **Map English meaning.** Give source tokens and English segments stable identifiers. Link each translated segment to its performed source group, including reordered, repeated or simultaneous activation. Validate text coverage, positive intervals, bounds, exclusive cue ends and semantic targets.
5. **Lock delivery audio and features.** Preserve timing through the final audio encode; measure loudness and true peak and record any gain. Generate final spectrum features from the locked delivery soundtrack. Keep calibrated frequency measurements separate from expressive particles, camera movement and decorative motion.
6. **Compose both languages as peers.** Use the equal-treatment table above in each requested aspect ratio. Preserve the song's artwork and palette. Build a dedicated landscape and vertical composition when both are requested; reuse timing and audio, not a cropped lyric layout.
7. **Review a short style preview.** Include quiet lyrics, the fastest handoff, the longest English line, a reordered semantic group, an uncertain passage and a bright/busy artwork moment. Use more than one short clip if needed. Inspect both languages at native and intended mobile size, then review timing with audio. Record which checks were performed and which remain uncertain.
8. **Pass the full cross-language sync gate, then render.** Complete the [sync review](cross-language-sync-gate.md), resolve all known meaning/highlight/timing defects, and freeze the reviewed input hashes. A style preview alone does not pass this gate. Freeze fonts and source data, check all active/inactive lyric states, then render a high-quality reference and controlled final downsample/encode. Verify full decoding, frame cadence, dimensions, duration, color metadata and soundtrack identity across editions. Inspect selected decoded frames, including joins, handoffs and the outro.
9. **Package and document.** Include finalized cues, translation mappings, source manifests, reproducible commands, software/model attribution, review evidence, covers, concise artist-focused publishing copy and checksums. Follow the [TikTok profile-cover default](tiktok-cover-workflow.md) when applicable. Exclude pronunciation material and private build data. Copy to the requested handoff location and verify published assets against local hashes when publication is in scope.

## Style-preview acceptance gate

Record these checks separately for every delivery aspect ratio before the full render:

- Both languages look equally large and strong at native resolution and at the intended mobile display size; record the review dimensions and any optical font adjustment.
- Active and inactive English text remains as legible as the original language over the brightest and darkest sampled artwork states.
- Both languages receive equivalent word/group emphasis. Inspect onset, handoff and exclusive-end frames, including the frame immediately before and after each high-risk boundary.
- Focus uses color and luminance with stable glyph positions; neither language introduces karaoke underlines, word boxes or pills, or bouncing glyphs without an explicit request. Check that removing these decorations leaves both active and inactive text readable.
- English follows the performed meaning without a separate delay, premature fade or cumulative timing drift. A reordered phrase keeps its natural reading order and stable glyph positions.
- The longest translation fits at equal prominence without clipping, collisions, abrupt reflow or English-only font reduction.
- Spectrum, particles and camera motion do not obscure either language. Both lanes retain their reading areas through entrances, holds and exits.

Save a paired-language contact sheet and a short preview with audio, plus a brief result for each check. Technical geometry checks support visual and listening review; they do not establish equal perceived prominence or acoustic accuracy on their own. At 60 fps, nearest-frame placement can be within about 8.33 ms while the underlying inferred vocal boundary remains less certain.

## Lessons carried forward from Пожары

The completed film provides a reproducible reference for bounded alignment, source-linked English meanings, separate measured and expressive visuals, dedicated aspect ratios, 2× rendering and verification of downloaded release bytes. Its [timing record](../projects/pozhary-lyric-film/README.md#timing-and-translation) also documents rejected alignment drift, evidence for a repeated-section transfer and the uncertainty of a chopped bridge.

The released design uses large Oswald Russian lyrics and smaller Space Grotesk English translations, with a stronger Russian focus treatment. The next production must keep the timing discipline while replacing that hierarchy with equal bilingual emphasis. Existing screenshots illustrate the historical treatment; they are not the typography target for future English lyrics.

Use the [general production workflow](production-workflow.md) for the broader pipeline, the [first-pass workflow](first-pass-song-workflow.md) for prototype and timing checks, and each project's own commands to reproduce a particular release. Exact palettes, audio gain, model choices and encode settings are track-specific decisions rather than universal presets.

## Check complete display meaning independently of lexical links

A correct word-to-word map and a perfect renderer comparison can still yield an incomplete highlighted phrase. The [Pero es locura correction](../projects/pero-es-locura-lyric-film/SEMANTIC-FOCUS-V2.md) found that “you” released during “love,” and audited all performed repeats plus related short-object, auxiliary and possession constructions.

Keep lexical correspondence explicit. When a complete display phrase is specifically required, record it separately with its rationale and exact source-word membership. Use the union of those source intervals, never the enclosing span: an intervening word or gap must not inherit focus. This scoped presentation choice does not replace the default of individual correspondence or justify grouping whole lines. Review whether subjects, negation, degree and reordered words still retain their own events.

Tests need independent semantic expectations, including examples that fail the previous mapping. Renderer agreement, acoustic review, and complete translated meaning are separate checks. When a correction follows delivery, preserve the original edition, identify its known issue, reopen affected review and bind future final-file evidence to the new revision.


### Audit paired focus in both directions

When complete phrase focus is selected, the corresponding original-language words must receive the same display emphasis. Completing only the translation can leave a source clitic neutral. Include subjects encoded by verb inflection, while retaining independent focus for explicitly spoken subjects, negation and degree. The [paired bilingual correction](../projects/pero-es-locura-lyric-film/PAIRED-FOCUS-V3.md) checks this distinction across repeated source events.

Keep acoustic activation separate from display grouping and verify every consumer uses the correct one. Geometry and font-color checks should be accompanied by semantic tests that reject one-sided phrases. Check late spoken material over the actual picture: reading shade may need a separate envelope from title/spectrum decoration so it stays readable and still clears before original credits.
