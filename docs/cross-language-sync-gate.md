# Mandatory cross-language synchronization gate

**Preview before render:** follow [the mandatory preview-first workflow](preview-before-render.md). Deliver a playable review preview before full production. Complete synchronization review and obtain explicit render approval for the current song and reviewed revision before capture or encoding. A preview-only request stops at review delivery; passing tests, positive feedback, saved review notes, a merged PR or approval of an earlier song do not authorize rendering.

**Applies to the next song and every future multilingual production. Full-length production rendering must not begin until synchronization across all displayed languages has been thoroughly reviewed and completed.** This gate covers meaning, highlight coverage and acoustic timing. Passing interval tests or inspecting a few attractive frames is insufficient.

Use the [review template](templates/cross-language-sync-review.md) as the project’s `evidence/cross-language-sync-review.md`. Diagnostic playback, short sync proofs and frame sheets are allowed to complete the review; they are not production delivery renders. Complete translation and source-to-target mapping before generating those proofs.

## 1. Finalize meaning and the complete highlighted span

Review every line in every language before approving its timing map. Preserve tense, subject, negation, degree, repetition and stated objects. Do not supply a guessed addressee to make a lyric smoother. For example, «что я любила» supports **that / I / loved**, with no added “you.”

Prefer individual word matches where they convey the full meaning. Use the smallest semantically complete target span when grammar, morphology or an idiom requires several translated words. Necessary grammatical completions can share a source event; absence of a separate source token does not automatically mean the English word must remain neutral.

| Source event | Required treatment in the selected translation | Failure to catch |
| --- | --- | --- |
| «что» / «я» / «любила» | Separate **that** / **I** / **loved** highlights | Highlighting the whole clause when individual matches work, or adding “you” |
| «Остыла» | **I have grown cold** as one complete translated event | Highlighting only “grown cold,” leaving “I have” behind |
| «прости» | **forgive me** together when that is the adopted English apology | Highlighting only “forgive,” leaving its elliptical English object behind |
| Reordered explicit possessive and noun | Keep **my** and **heart** individually linked to their corresponding source words | Grouping them merely to avoid backward focus |

These examples specify highlighting for an already reviewed translation. They do not certify ambiguous Russian punctuation or authorize new objects in other lines. If the wording is wrong, correct it first; broader highlighting does not repair an inaccurate translation.

Maintain a ledger of **every source event and every target word**: stable IDs, target language, mapped source IDs, selected start/exclusive-end intervals, full target span and rationale. Review target-language coverage as well as source coverage, so omitted English parts cannot hide behind a complete Russian-word count. Record why any displayed word intentionally remains neutral. The number of one-word matches or phrase exceptions is not a quality score.

## 2. Finish synchronization across the whole recording

Review the intro, every verse, every repetition, fast passages, gaps, overlapping/chopped vocals, final sung words and the outro. Compare the source lane with each translation, and check that all language lanes present the corresponding meaning together.

Use actual-audio playback for the complete recording at normal speed. Recheck every uncertain or fast event at reduced speed and around its onset, handoff and release. Record the real review method and reviewer role. Model alignments, spectrograms, source-window assertions and still images support the review; they cannot be described as completed listening. If actual-audio review cannot be performed, leave that part incomplete and do not start production rendering.

A human reviewer may explicitly attest that the complete recording, uncertain-event reduced-speed checks and all delivery layouts have been reviewed. Record the reviewer role, exact scope and frozen input identity. Such an attestation is review evidence; do not invent automated playback telemetry or infer those checks from general praise or render approval alone.

All languages use the same locked audio timeline. Keep natural target-language reading order while allowing backward, repeated or simultaneous focus. A grammatical expansion shares its source event’s interval; do not invent separate English syllable times. Multi-source groups use their participating intervals, with any perceptual hold explicitly justified and checked against neighboring words.

## 3. Review audiovisual proofs in every delivery format

After the text and map are complete, inspect every cue in every requested format, at native and intended mobile size. Include all word-focus states and targeted onset, handoff and exclusive-end frames. Check the proofs with audio, including repeats and the final vocal. Verify both **under-highlighting** and **over-highlighting**: the full translated meaning must light up, and unrelated words must not.

Keep type size, weight, active/rest contrast and focus strength comparable across languages. Reflow long lines without weakening a language’s emphasis. A passing geometry check does not establish semantic completeness or audible synchronization.

Keep acoustic events, line visibility, semantic focus, picture cuts and decorative envelopes separately identifiable on the same audio clock. Include a cut beneath held text, a repeated phrase with independently checked release, and the previous/entry/next frames of each uncertain transition. Preserve complete line geometry across focus changes. Review effects at native cadence: the [Moon study](studies/moyka-moon-2026/README.md) demonstrates how one-frame alternation can be concealed by screenshots or mistaken for extra lyric events. Model disagreement must trigger audio review, not an automatic global offset.

## 4. Close the gate before production rendering

Record all of the following in the project review:

- The complete cue inventory, languages, formats and evidence paths, with no unreviewed rows.
- Translation and full-target-span review, actual-audio review and audiovisual proof review all complete.
- No unresolved lyric omissions, meaning errors, incomplete target highlights or known onset/handoff/release defects. Record unavoidable interpretive uncertainty separately with the selected reading and basis; do not hide fixable defects as “uncertainty.”
- Semantic regression expectations covering both fine matches and complete grammatical expansions, alongside timing, coverage and layout checks.
- SHA-256 identities for the reviewed audio, text, mappings, timing data and focus/presentation behavior.

Every **new project’s production render entry point must check this review before capture** and refuse missing, incomplete or stale evidence. A change to any reviewed input invalidates the relevant review; redo affected checks and refresh the record before rendering. This document establishes the required workflow and integration contract; historical render scripts are not retroactively rewritten by this documentation update.

## Acceptance and known issues are separate

Keep three distinct project fields: delivery acceptance, synchronization status and publication status. **Accepted with known issues** means the existing edition can be used while its defects remain documented. It does not mean the synchronization gate passed, and it does not waive the gate for another song.

[Прости за любовь v1.2](../projects/prosti-za-lyubov-lyric-film/README.md) is accepted with known highlighting gaps and is preserved as delivered. Its [two reported examples](../projects/prosti-za-lyubov-lyric-film/KNOWN-ISSUES.md) inform the next song’s review. The 52 neutral grammar units and three multi-source groups in its old audit are historical counts, not targets to copy.
