# призрак — production lessons

This edition uses the original music video and soundtrack, with Russian/English reading during Russian vocals and Japanese/Russian/English during Japanese vocals. The accepted centered v2 inventory contains **38 cues, 156 source events** (106 Russian words and 50 Japanese units), and **423 language tokens**. Its palette, geometry and exact times are recording-specific; the prevention rules below are reusable.

[Timing and inventory](TIMING.md) · [Overlap correction](OVERLAP-REVISION.md) · [Production process](PRODUCTION-NOTES.md) · [Shared three-language workflow](../../docs/three-language-lyric-workflow.md)

## 1. Discover every voice before aligning supplied text

The first mono/mid pass followed the louder Russian foreground and missed a Japanese backing pair at **212.34–221.06s**. Unprompted recognition of a clock-verified estimated-vocal stereo side, contextual Japanese CTC and original-signal panels supported the additional occurrence. Stereo side `(left−right)/2` exposes a different balance; it is an analysis aid, never a replacement soundtrack. A mono transcript's omission is not proof of silence.

Audit the entire recording in plausible languages, including quiet lead-ins, backing passages and the ending. Separate unprompted discovery from text-conditioned timing. Reject stock outro sentences, instrumental labels and forced-only repeats rather than averaging them into the inventory. Verify derivative sample count and zero lag against the original clock. Separation may preserve timing while changing the sound.

The masked first handoff needed a wider uncertainty range: a broad forced path borrowed preceding articulation, while narrower evidence supported the selected **213.70s** transition. Retain both rejected candidates and uncertainty. A fine numerical hop does not make a consonant perceptually exact. [Independent overlap evidence](evidence/overlap-acoustic-v2.md).

## 2. Normalize for the actual language; keep original script on screen

Default kanji romanization produced Chinese readings despite a Japanese language code. Contextual native kana corrected the acoustic-model input. Keep that internal preprocessing separate from the original Japanese display; it is not a pronunciation row. Record the transformed text, model identity and rejected path so another agent can reproduce the correction.

Institutional poem texts establish spelling, attribution and grammar, not performed repeats or timing. Poem 59's **寝なまし** is counterfactual regret; perfective な is not negation. **傾く** describes the lowering moon, and **かな** is exclamatory. Poem 30's reordered fragments retain comparative **ばかり**: nothing more sorrowful than dawn, rather than two unrelated statements about no sorrow and only dawn. Do not append an unperformed upper stanza. [Editorial sources and limits](evidence/editorial-research.md).

## 3. Illuminate complete meaning without flattening source words

One inflected **寝なまし** event owns every token in **I should have slept / стоило бы уснуть**. Keep its following adversative separate. English articles, tense auxiliaries and necessary grammatical completions must share their true source contributors; they receive no invented target-language timestamps. Independently sung words and repeated nights retain separate events.

Contributor focus is an interval **union**, not an enclosing envelope. Reordered translations remain stationary and respect actual gaps. Preserve counterfactuals, comparison, negation and unstated objects. The Russian moon translation uses a documented gender-neutral perceptual paraphrase; the selected **my hair** is a contextual inference, not an explicit Russian possessive. Meaning checks must review those choices rather than treating index coverage alone as fidelity.

## 4. Give simultaneous phrases stable independent regions

The recovered backing pair needs its complete Japanese/Russian/English block above the complete Russian/English foreground. A short carried-word mechanism cannot represent a whole second phrase. Preserve all earlier vocal bodies; this revision added six Japanese events while retaining the original 150 events unchanged.

Center both blocks on one reading axis and distinguish voices through vertical space. Keep the upper block's coordinates and fitted size after the foreground ends. Avoid a mid-word relocation or a clipped lower-voice release. Recheck all five lanes together in native and portrait layouts. Continuous symmetric shading provides contrast without introducing a hard panel edge. [Selected-overlap audit](evidence/overlap-selected-audit-v2.md).

Shared nominal size alone does not ensure equal prominence across scripts. Japanese weight600 balances Russian/English weight500 in this film. Check active/rest contrast, isolated glyph shadows and dense translations at realistic phone size. Model diagnostics and calculated luminance do not prove that readers can see the focus. Preserve the full sharp source picture, its faces and credits; keep the spectrum fixed and supportive.

## 5. Preserve the exact source clock through export

This source has **6,376 pictures at 25 fps**, but its complete original AAC decodes to **11,249,664 samples at 44.1 kHz**. Audio ends at 255.0944217687s, slightly after the 255.04s picture extent. The verified 60 fps exports contain **15,306 frames** and holds the final source image through the audio tail and the remainder of the final output frame.

Use `min(6375, floor(n×5/12))` for source-picture ownership and `n×735` for the output frame's source sample. Do not motion-interpolate, trim audio to the picture duration, add another priming compensation, or change lyric timing to reconcile cadences. A narrowly bounded floating-point normalization prevents exact frame samples from rounding below themselves; it is numerical scheduling repair, not anticipation of the voice. Validate fragmented raw-frame streams and reject truncated output. [Clock contract](source/production-clock.json) · [Independent scheduling check](scripts/verify-render-clock.ts).

## 6. Keep acceptance records and delivered-byte proof separate

Machine inventory, semantic audits, browser recovery checks and source-clock tests do not attest listening. Current-input owner confirmation of full normal-speed review, uncertain edges at reduced speed and both layouts is a separate record from render approval. Those confirmations do not retroactively turn signal reports into human listening logs or establish perfect perceptual timing.

After encoding, verify both actual films: frame count and every PTS, unchanged AAC packets and decoded PCM, source-equivalent dark intervals, final-picture hold, and decoded scene/glyph focus. Check every language token in active and neutral states with an independent integer-sample oracle, including overlaps, cue fades and sparse glyphs. Palette checks require lossy-codec tolerance and full-scene comparisons; they do not prove every source pixel at every frame or acoustic correctness.

Bind approval inputs, renderer, verifier, clock manifest and film hashes. A single-format report is partial. Require two-format passed technical and decoded-scene reports before packaging; then verify copied assets and archives independently. Source integration in Git does not back up excluded original media. This lessons document records method and acceptance boundaries. The [combined technical report](evidence/final-verification.json), [combined decoded-scene report](evidence/decoded-scene-verification.json) and [Desktop receipt](evidence/desktop-delivery-receipt.json) establish completed delivery; a source/model audit is separate from listening attestation.

Remote publication remains subject to the current GitHub Actions policy: the coordinator checks all workflows, branches, actors and current-UTC-day runs, including older rerun attempts, before each triggering operation and estimates resulting runs/minutes. Unknown usage remains unknown; do not bypass checks or alter triggers to fit a budget.
