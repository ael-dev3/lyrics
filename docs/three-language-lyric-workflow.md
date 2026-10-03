# Coherent three-language lyric films

Use this workflow when the performance switches languages while two reader languages remain present. The [призрак preview](../projects/prizrak-lyric-film/README.md) implements Russian/English for Russian singing and Japanese/Russian/English for Japanese singing. It combines the existing timing, semantic focus, source integration and complete-preview rules; its visual colors and acoustic times are song-specific.

## Establish the actual performed inventory

Preserve the supplied sheet separately. Audit the entire recording, including instrumental lead-ins, quiet backing samples, inter-language transitions and the ending. Use unprompted bounded recognition per plausible language and original audio before conditioning any aligner on text. Language-locked hallucinations, stock outro captions, page ads and an unperformed stanza do not become lyrics merely because a model gives them timestamps.

For classical or inflected language, consult primary lexical/editorial sources. Create original natural translations and document contextual choices. Do not guess a modern interpretation from phonetic-looking syllables. Preserve classical negation, counterfactual, comparison and exclamation correctly; an elided subject does not justify inventing an addressee.

## Keep source words and translated meanings separate

Maintain one source-clock event inventory. Translation tokens reference source contributors; they do not receive fictional syllable timing. Use individual source words where justified. Merge a continuous inflected word when splitting its stem/auxiliaries would fragment a single translated verb meaning. Keep separately performed negation, adversative or comparison words distinct when the recording supports that distinction.

Map the complete expansion: an English article belongs with its noun, a tense auxiliary with its source inflection, and an idiom with its true contributors. Contributor focus is an interval **union**; a broad envelope must not illuminate unrelated intervening sound. Keep reordered translation words stationary while their contributing source meaning is sung.

Check acoustic preprocessing in the actual language. In this project, default kanji romanization emitted Chinese readings even with a Japanese code. Correct contextual native kana inside the acoustic model, retain the transformed input and raw rejected evidence, and preserve original-script display. A configured language code is not proof that preprocessing chose the right reading. This internal normalization must not become an unsolicited pronunciation lane.

Audit grammatical meaning before choosing highlight groups. In the classical example, the complete counterfactual 寝なまし owns every word of **I should have slept / стоило бы уснуть**, while its adversative continuation remains separate. The reordered poem-30 fragments still form the comparison **nothing more sorrowful than dawn**; modern restrictive **only** would change their meaning. Leave observer gender and other unstated details unresolved or document a neutral paraphrase. Textual sources support these decisions but do not establish performed boundaries.

## Represent overlaps instead of clipping voices

A language switch can overlap a held previous word. Preserve both original event intervals and explicitly assign simultaneous voices. A short unchanged source/translation tail can accompany the new three-language block. Its release must not move the primary block. Validate its source word identity, inclusive start and exclusive end; never shorten the previous voice merely to satisfy a single-active-cue assumption.

For complete simultaneous phrases, use independent vocal tracks with separate stable reading regions and full translations. Put the Japanese-led block above the Russian-led pair when that distinguishes the arrangement clearly. Validate each voice's order separately and retain every prior vocal body. Keep the upper block fixed after the other voice ends. The [призрак overlap revision](../projects/prizrak-lyric-film/OVERLAP-REVISION.md) demonstrates this correction.

Masked backing voices need an explicit discovery pass. Mono/mid recognition may follow the louder foreground and omit a different language. Inspect original stereo channels and mid/side analysis alongside clock-verified vocal estimates; require unprompted lexical support and original-signal context before using forced timing. Do not invent an earlier repeat because a conditioned aligner can fit it.

Keep each analysis view identifiable. Stereo side `(left−right)/2` changes vocal balance, not the source clock or production mix. Verify derivative length and lag; retain original audio as authority when separation alters articulation. Widen crops when a quiet entrance falls at their edge. Reject a forced path that borrows the previous voice's consonant, and keep explicit onset/release ranges when a masked transition remains ambiguous. A small model hop is not equivalent to that much perceptual accuracy.

## Fit one coherent reading block

Use the same intended prominence across scripts: shared fitted size, optically balanced font weight, equal focus luminance and isolated per-glyph glow. Japanese joins naturally without inserted Western spaces. Reflow complete translations; do not shrink only English, remove a language or fabricate acoustic gaps to fit a layout.

Landscape source framing and portrait reading composition can differ while timing stays identical. Protect source faces, practical light, hands, captions and credits. Inspect the real three-language passage at realistic small-player scale, including dense translations and the overlap. Active/neutral recognition is a perceptual check distinct from token timing or computed color contrast.

A measured spectrum should have a stable supporting/environmental role suited to the actual footage. Do not claim a physical installation or reflection without tracking/material evidence. Existing source snow, camera motion and flashes already carry visual energy; extra decorations should earn their place.

For simultaneous full phrases, center upper and lower regions on a common reading axis when it suits the picture, and separate them vertically. Keep each region's geometry after the other voice ends. Recheck the complete five-lane arrangement at phone size; do not solve a collision by shrinking one reader language, moving a held word or clipping a source event. A continuous symmetric shade can preserve contrast without a hard panel edge. These are composition choices to evaluate, not fixed positions for every recording.

## Verify and hand off the complete preview

Bind current source, timeline, mappings, measured features, fonts, scene and player by hash. Separate source audio time from decoded picture PTS. Repaint focus at display cadence over held source frames; pause must commit actual stopped focus. Check real video motion after fresh load, seeking, format switches, slow playback and recovery. Timestamp Enter must not accidentally activate Play on key release.

Maintain separate word-body release, neutral complete-line reading hold and decorative tails. First active voice is fully visible; no synthetic line fade clips sustained words. Review every independent repeat and low-energy suffix against the original mix, with explicit uncertain bounds rather than a global offset or unsupported millisecond claims.

Deliver a full playable preview, both formats, screenshot provenance, reproduction steps and remaining listening questions. Passing technical/semantic checks is not complete actual listening review. Current-input normal/reduced-speed and both-format review plus explicit render authorization remain required by [preview-before-render](preview-before-render.md) and the [cross-language gate](cross-language-sync-gate.md). Preview source publication and a merged PR do not authorize production or platform uploads.

## Preserve scheduling and prove the delivered films

Probe source picture cadence and complete audio extent separately. Derive output frame count by rounding up the preserved audio extent; hold the actual final source image through any shorter picture extent. For the [призрак clock](../projects/prizrak-lyric-film/source/production-clock.json), native 25 fps becomes 60 fps with rational picture ownership and 735 original 44.1 kHz samples per output frame. Those constants belong to that source. Avoid motion interpolation, duplicate AAC priming compensation, audio truncation and lyric offsets introduced to hide cadence differences.

Test inclusive source starts and exclusive releases using integer sample arithmetic. A tightly bounded floating-point correction may make an exact rational output time represent its intended sample; it must not become a global anticipation setting. Exercise fragmented and truncated decoder streams before a long render.

After authorized encoding, inspect actual delivered bytes in both layouts. Keep technical stream checks distinct from decoded scene/glyph checks: verify every frame PTS and unchanged AAC payload/PCM, source-equivalent dark intervals and final-picture ownership, then test complete all-language focus at onset/release, held words, real gaps, overlap and cue fades. An independent integer-sample oracle should not call the same timing helper it is checking. Sparse glyph masks and lossy-codec color tolerances need documented limits and scene comparisons.

Bind both films to the current approved inputs, renderer, verifier and source clock. A report covering one layout remains partial. Do not package until both complete reports pass and identify the same film hashes; verify staged copies and reproducible archives before cleanup. Keep machine evidence, owner-attested listening scope, render authorization, encoded verification and delivered-copy proof separately named. None substitutes for another.

The [призрак production lessons](../projects/prizrak-lyric-film/PRODUCTION-LESSONS.md) summarize the inventory, preprocessing, classical semantics, independent vocal regions and clock failures this first pass should proactively check.
