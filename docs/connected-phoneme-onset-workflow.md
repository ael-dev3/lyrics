# Connected singing: phonetic onset and release workflow

Inspect the quiet beginning of each performed word before accepting an aligner’s strong character core. A sung word can begin while the voice continues from the preceding word, without silence or a new amplitude attack. Keep that lexical handoff separate from the word’s held ending, the complete line’s reading lifetime and the browser’s presentation cadence.

This guide develops the [source-clocked workflow](source-clocked-word-effects-workflow.md) using [Кометы’s production lessons](../projects/komety-lyric-film/PRODUCTION-LESSONS.md). It is a preparation and review method, not a guarantee of automatic transcription or millisecond perceptual accuracy. The [bilingual mapping](bilingual-lyric-workflow.md), [complete-preview requirement](preview-before-render.md) and [cross-language synchronization gate](cross-language-sync-gate.md) continue to apply.

## Small agent startup order

1. Read `AGENTS.md`, the source-clocked workflow, this guide and the nearest relevant project’s mistakes before copying its player or timing code. Current cinematic and bilingual rules take precedence over historical effects and cadence settings.
2. Freeze the exact recording, original zero, decoded sample count, native picture dimensions/cadence and editorial reference. Assign stable cue/word IDs and zero-based source indices. Name one owner for timing writes; independent reviewers save proposals against a frozen baseline.
3. Audit the complete recording and performed inventory before animating lyrics. Check prelude, instrumental gaps, all repeats, spoken passages, endcards and the audio tail. Retain supplied text separately from recording-supported additions.
4. Prepare original waveform/spectral evidence, bounded recognition and alignment. If a vocal estimate helps, record its model/checkpoint and measure its sample count and source-clock lag before using it.
5. Review both edges of every performed word, then meaning mappings, neutral reading windows and the actual loaded complete preview. Prioritize quiet connected entrances and held endings in the first review, rather than waiting for repeated preview corrections.

Parallel roles can own coverage/text, acoustic proposals, independent signal review and playback/composition. Give each an explicit file boundary. The coordinator reconciles disagreement and applies one reviewed change set; concurrent agents must not rewrite the same candidate.

## 1. Establish lexical coverage separately from alignment

Unprompted recognition asks what was performed. A forced or text-conditioned alignment asks where supplied words might fit. The latter cannot independently confirm a missing contraction, name or repeat.

Retain complete unprompted recognition, then independently inspect bounded gaps and speech passages when the complete result omits singing or invents words from subtitles, titles or accompaniment. Separate language-specific crops when the recording changes language. Log rejected lexical candidates and the reason for each recording addition or retained gap; an ASR omission is not proof of silence.

Repeated wording has separate occurrence IDs and separately measured boundaries. Transfer a repeat only when a measured audio relationship supports the same recorded clip. Retain the reference’s absolute uncertainty and inspect gain/fade exceptions. In Кометы, four late radio phrases match the earlier clip at **+79.120 s**; the final faded release is still chosen separately at **249.960 s**. This exception does not permit copying the sung refrains’ timestamps. See [the inventory and radio evidence](../projects/komety-lyric-film/evidence/translation-review.md).

## 2. Build comparisons that can expose a late core

Use a wide phrase view first. A crop beginning at the current model onset can exclude the quiet prefix under investigation. Include the preceding word’s last syllable, the candidate opening vowel/consonant and the following stressed vowel. Then inspect narrower original/stem panels on the unchanged source clock.

Compare these complementary observations:

- Original waveform and short-window energy, including low-amplitude consonants and attenuation/renewal.
- Original spectrogram: frication, nasal/voiced body, changing harmonic trajectories and consonant closures. A harmonic ridge is not by itself a formal formant estimate or a lexical label.
- A clock-verified estimated vocal, with accompaniment comparison where needed. Separation can smear edges, retain reverb and leak instruments.
- Bounded unprompted recognition and text-conditioned/model character paths. Keep scores, crop bounds, model family and competing allocations.
- Actual audio review at normal speed and reduced speed for uncertain passages, with both language lanes visible. Label the reviewer and real scope; signal plots and model outputs are not a listening attestation.

Waveform and spectrum describe the same recording. Multiple crops, stems or spelling variants of one aligner remain correlated model observations. Do not count them as independent votes. Document spectral window support and hop size: a 2 ms hop through a 23 ms window samples the view finely but does not establish a 2 ms physical boundary.

Use retained model evidence before launching another broad sweep. When competing paths already show unstable ownership, additional same-family variants may redistribute the vowels without resolving them. A targeted original/stem review can decide which plausible interval needs reopening while keeping the model disagreement intact.

## 3. Resolve connected lexical ownership

An onset is the beginning of the performed word, including its quiet initial consonant or vowel. Sparse CTC character emission can favor a stronger later vowel or consonant. For example, the obvious closure inside огонь may belong to its internal consonant, after its initial vowel has already begun.

Inspect the whole articulatory sequence: the preceding nasal/final vowel, quiet changed body, internal consonant and stressed vowel. A changed pitch or harmonic shape can support an earlier ownership interval even when voice is continuous. It cannot identify a word automatically. Compare competing allocations and preserve a broad interval when adjacent reduced vowels have no unique physical division.

Select an individually justified point inside that interval. Do not choose the earliest energy, strongest vowel, obvious closure or model core by default. An early renewal may still belong to the preceding word. Perceptual feedback warrants reopening an uncertain ownership decision; it does not eliminate the need for the original signal or certify exact milliseconds.

When the voice truly hands from one word to the next, revise the preceding release and next onset together. If inspection supports a real pause, consonant closure or separately continuing voice, record it instead. Do not fill every gap, clamp every release to the next start, or change evidence to satisfy a validator. A real overlapping performance needs an explicit representation/review decision.

### Corrected examples from one recording

These are historical selections for Кометы, not offsets for another recording. The selected sample is canonical; rounded seconds are a display label.

| Event | Previous onset → selected | Selected source sample | Plausible ownership range | What the late choice missed |
| --- | --- | ---: | --- | --- |
| `KOM-007-s04`, огонь | 63.073 → 62.160 s | 2,741,256 | 62.110–62.240 s | Quiet opening vowel before the g-like closure; 62.425 was rejected as that internal closure. |
| `KOM-013-s02`, орёл | 132.650 → 132.304988662 s, displayed 132.305 | 5,834,650 | 132.270–132.360 s | Changed descending body before renewed/stronger vowel cores. |
| `KOM-013-s04`, орёл | 135.850 → 135.700 s | 5,984,370 | 135.650–135.750 s | Quiet changed body after attenuation at 135.60–135.66. |
| `KOM-015-s04`, огонь | 149.650 → 149.480 s | 6,592,068 | 149.430–149.550 s | Changed quiet body at 149.44–149.50; 149.300 risks preceding consonant ownership. |
| `KOM-021-s04`, орёл | 184.090 → 183.700 s | 8,101,170 | 183.665–183.805 s | Leading body at 183.69–183.71, before the 183.731 character core. |
| `KOM-021-s02`, орёл | 180.550 → 180.350 s | 7,953,435 | 180.315–180.435 s | Quiet descending body before the stronger 180.406 core. |

Each row has an explicit paired preceding release in [the selected correction layers](../projects/komety-lyric-film/AGENT-HANDOFF.md#timing-and-evidence-map). The 183.700 selection and independent **183.735** proposal differ by approximately **35 ms** within overlapping ownership ranges. Keep that disagreement; do not rewrite it as unanimous sample agreement. Other occurrences retained their individual selections and uncertainty. No global anticipation or chorus-wide advance was used.

## 4. Audit held releases independently

Follow the original direct vocal beyond the final emitted character. Inspect the changing sustained vowel, glide and final consonant through the next phrase or a sufficiently wide pause. Distinguish that body from a breath, a new word, accompaniment and weaker passive decay. A stem tone continuing for seconds is not automatically more singing.

Audit short conjunctions, pronouns and negation as well as long nouns. A 60 ms model core may lie inside a longer vowel/glide, with an earlier coupled handoff from the prior word. Review every selected blank gap: classify the supported body/closure/decay relationship and retain ambiguity rather than declaring all neutral intervals silence.

Retain separate fields for lexical end and the complete line’s full-opacity hold. For Кометы’s final fire, lexical focus ends at **200.350 s**, while the complete neutral line remains readable through **202.300 s** and fades to **202.800 s**. Adjacent earth/shine phrases hand off at the next actual vocal instead. [All 27 tail decisions](../projects/komety-lyric-film/evidence/cue-tail-review.md) describe this distinction.

```text
wordActive = time * sampleRate >= word.startSample
          && time * sampleRate < word.endSample

targetActive = any referenced source event is wordActive
               # union of events, never the enclosing span

reviewedHold = max(lastLexicalEnd, selectedNeutralTailHold)
if a reviewed gentle fade fits before the next reading lead:
    fullOpacityEnd = reviewedHold
    visibleEnd = reviewedHold + selectedFadeDuration
else:
    handoff = nextActualVocalStart or recordingEnd
    fullOpacityEnd = handoff
    visibleEnd = handoff
    replace the outgoing neutral cue atomically at that point
```

Кометы’s 0.42–0.50 s fade and 0.22 s reading lead are authored settings. Choose them for the next composition rather than treating them as acoustic constants. Never squeeze a fade into a tiny gap, reserve a midpoint blackout, or extend bright lexical focus solely to make the line remain readable.

## 5. Complete both languages’ meaning

An article, auxiliary or phrasal completion may share one source event. Орёл activates both **an eagle**; родится activates **will be born**, while independently sung не activates **not**. Neither an arbitrary one-to-one target rule nor invented translation timestamps preserves that meaning.

Preserve lexical contributors separately from display anchors when grammar requires it. Use the union of participating source intervals: radio **a … message** must not keep the translated noun active through the intervening adjective. Test complete expansions, negation, pronouns, reordered meanings and both repetitions with independent semantic expectations. Keep glyph geometry fixed and both languages equally prominent.

## 6. Prove the loaded preview and measure presentation separately

For a moving-video source, one native media element supplies soundtrack and decoded picture. Use its `currentTime` for word focus at display cadence. Record decoded picture PTS separately through `requestVideoFrameCallback`; a 25 fps picture may remain held for 40 ms while finer word events change. `requestAnimationFrame` is a repaint opportunity, not a second audio clock. Do not extrapolate focus through buffering or unresolved seeks.

Before attributing a defect to acoustics, inspect active samples, word clock, native picture PTS, paint cost and actual visibility. Check that the scene adds no onset easing or anticipatory offset. Conversely, a fast painter and correct clock cannot repair a late lexical boundary.

Bind the review to the timeline actually loaded in memory. Expose revision, source hash, source event samples, active source/target words, word clock, picture PTS and line opacity/hold through diagnostics. A query parameter, page title, rebuilt file or badge alone does not establish loaded identity. Reload after preparation, then verify one before/after focus state in each layout and real moving picture after seek/recovery. Saved shared-scene stills, browser observations and encoded-frame parity are separate evidence scopes.

For a fixed-rate encoded output, derive the verification sample mathematically from integer frame number and sample rate. At 60 fps and 44.1 kHz, it is exactly `n * 735`. Floating seconds can land a fraction below an exact exclusive end and retain one unwanted highlight frame. Test frame-aligned boundaries with an independent integer oracle, correct only numerical representation in the production host, and retain the approved sample events. See [the export defect record](../projects/komety-lyric-film/PRODUCTION-NOTES.md#export-defects-caught-before-delivery).

## Review record and completion checklist

Every event needs stable IDs, before/selected onset and exclusive-end samples, changed/retained decisions, original/stem/model observations, rejected alternatives, qualitative uncertainty, model provenance and evidence links. A retained point means reviewed without sufficient evidence to replace it, not certified perfect. Preserve the frozen baseline hash, use one writer and apply an explicit layer once. Recompute seconds from canonical integer samples; do not repeatedly round a rounded label, shift a whole chorus, or extend already refined tails again.

- [ ] Whole-recording inventory covers prelude, gaps, repeats, speech, endcards and tail; supplied text remains identifiable.
- [ ] All word starts and releases have individual reviewed or unresolved reasons, including connected quiet vowels and short grammar words.
- [ ] All repeated entrances were inspected separately; any timing transfer has measured clip identity and fade exceptions.
- [ ] Paired releases preserve ownership without mechanically filling real gaps or clipping supported overlap.
- [ ] Held direct body, passive decay, lexical focus and complete-line reading windows are separate.
- [ ] Complete translated expansions follow source events in both directions; unrelated words/gaps remain neutral.
- [ ] Actual loaded samples/revision and both-format motion, focus, line exits, seeking and recovery were checked.
- [ ] Numerical/signal evidence, actual listening scope, preview acceptance and production authorization remain distinct.

Before full production, complete the existing synchronization and authorization gates for the current identity and verify renderer parity. This workflow front-loads known failure checks; it does not replace listening or promise the next recording has identical phonetic structure. Retain durable work locally when publication is unavailable. Before an operation that may trigger GitHub Actions, coordinate under the current approval policy, inspect all current UTC-day workflows/runs/attempts across branches and actors, and estimate resulting runs and runner minutes; unavailable usage remains unknown.
