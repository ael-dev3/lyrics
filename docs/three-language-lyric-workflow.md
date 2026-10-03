# Coherent three-language lyric films

Use this workflow when the performance switches languages while two reader languages remain present. The [призрак preview](../projects/prizrak-lyric-film/README.md) implements Russian/English for Russian singing and Japanese/Russian/English for Japanese singing. It combines the existing timing, semantic focus, source integration and complete-preview rules; its visual colors and acoustic times are song-specific.

## Establish the actual performed inventory

Preserve the supplied sheet separately. Audit the entire recording, including instrumental lead-ins, quiet backing samples, inter-language transitions and the ending. Use unprompted bounded recognition per plausible language and original audio before conditioning any aligner on text. Language-locked hallucinations, stock outro captions, page ads and an unperformed stanza do not become lyrics merely because a model gives them timestamps.

For classical or inflected language, consult primary lexical/editorial sources. Create original natural translations and document contextual choices. Do not guess a modern interpretation from phonetic-looking syllables. Preserve classical negation, counterfactual, comparison and exclamation correctly; an elided subject does not justify inventing an addressee.

## Keep source words and translated meanings separate

Maintain one source-clock event inventory. Translation tokens reference source contributors; they do not receive fictional syllable timing. Use individual source words where justified. Merge a continuous inflected word when splitting its stem/auxiliaries would fragment a single translated verb meaning. Keep separately performed negation, adversative or comparison words distinct when the recording supports that distinction.

Map the complete expansion: an English article belongs with its noun, a tense auxiliary with its source inflection, and an idiom with its true contributors. Contributor focus is an interval **union**; a broad envelope must not illuminate unrelated intervening sound. Keep reordered translation words stationary while their contributing source meaning is sung.

Check acoustic preprocessing in the actual language. In this project, default kanji romanization emitted Chinese readings even with a Japanese code. Correct contextual native readings inside the acoustic model, retain raw rejected evidence, and preserve original-script display. This internal normalization must not become an unsolicited pronunciation lane.

## Represent overlaps instead of clipping voices

A language switch can overlap a held previous word. Preserve both original event intervals and explicitly assign simultaneous voices. A short unchanged source/translation tail can accompany the new three-language block. Its release must not move the primary block. Validate its source word identity, inclusive start and exclusive end; never shorten the previous voice merely to satisfy a single-active-cue assumption.

## Fit one coherent reading block

Use the same intended prominence across scripts: shared fitted size, optically balanced font weight, equal focus luminance and isolated per-glyph glow. Japanese joins naturally without inserted Western spaces. Reflow complete translations; do not shrink only English, remove a language or fabricate acoustic gaps to fit a layout.

Landscape source framing and portrait reading composition can differ while timing stays identical. Protect source faces, practical light, hands, captions and credits. Inspect the real three-language passage at realistic small-player scale, including dense translations and the overlap. Active/neutral recognition is a perceptual check distinct from token timing or computed color contrast.

A measured spectrum should have a stable supporting/environmental role suited to the actual footage. Do not claim a physical installation or reflection without tracking/material evidence. Existing source snow, camera motion and flashes already carry visual energy; extra decorations should earn their place.

## Verify and hand off the complete preview

Bind current source, timeline, mappings, measured features, fonts, scene and player by hash. Separate source audio time from decoded picture PTS. Repaint focus at display cadence over held source frames; pause must commit actual stopped focus. Check real video motion after fresh load, seeking, format switches, slow playback and recovery. Timestamp Enter must not accidentally activate Play on key release.

Maintain separate word-body release, neutral complete-line reading hold and decorative tails. First active voice is fully visible; no synthetic line fade clips sustained words. Review every independent repeat and low-energy suffix against the original mix, with explicit uncertain bounds rather than a global offset or unsupported millisecond claims.

Deliver a full playable preview, both formats, screenshot provenance, reproduction steps and remaining listening questions. Passing technical/semantic checks is not complete actual listening review. Current-input normal/reduced-speed and both-format review plus explicit render authorization remain required by [preview-before-render](preview-before-render.md) and the [cross-language gate](cross-language-sync-gate.md). Preview source publication and a merged PR do not authorize production or platform uploads.
