# Кометы: lessons from the accepted preview

The accepted review revision is `komety-preview-v10-first-final-eagle`. This record explains how its timing and presentation reached the current quality, including mistakes that survived earlier signal/model passes. Preview acceptance, a complete cross-language listening attestation and production authorization are distinct; consult the [current review](evidence/cross-language-sync-review.md) and input-bound production gate for their actual status. No final encoded film is certified by these lessons.

Use the [connected-phoneme workflow](../../docs/connected-phoneme-onset-workflow.md) for the reusable procedure and the [agent handoff](AGENT-HANDOFF.md) for this project’s files and restart order.

## 1. Strong characters were later than quiet word openings

The initial candidate used multilingual CTC character paths and bounded Whisper timing, then inspected original/stem signal panels. That found many quiet consonants and cropped held endings. It still over-weighted renewed or strong vowel bodies at several connected словно → орёл/огонь handoffs. Continuous harmonics were sometimes treated as insufficient evidence for a different onset, leaving a late character core in control of the whole word.

That criterion was too strict for this performance. Adjacent reduced vowels can remain voiced without silence. A quiet changed or descending body may already belong to the new word before its stronger opening-vowel core, internal consonant or stressed vowel. Repeated perceptual review exposed this systematic kind of error, but each occurrence needed its own physical ownership choice rather than the same advance.

| Event | Late selection → final selection | Canonical sample | Retained plausible range | Correction evidence |
| --- | --- | ---: | --- | --- |
| `KOM-007-s04`, second first-refrain огонь | 63.073 → **62.160 s** | 2,741,256 | 62.110–62.240 s | [Connected-word review](evidence/connected-word-review.md) |
| `KOM-013-s02`, first second-refrain орёл | 132.650 → **132.304988662 s**; display 132.305 | 5,834,650 | 132.270–132.360 s | [Eagle review](evidence/eagle-entry-review-v6.md) |
| `KOM-013-s04`, second second-refrain орёл | 135.850 → **135.700 s** | 5,984,370 | 135.650–135.750 s | [Targeted source review](evidence/eagle-136-entry-review.md) |
| `KOM-015-s04`, second second-refrain огонь | 149.650 → **149.480 s** | 6,592,068 | 149.430–149.550 s | [Fire source review](evidence/fire-150-entry-review.md) |
| `KOM-021-s04`, second final-refrain орёл | 184.090 → **183.700 s** | 8,101,170 | 183.665–183.805 s | [Final eagle source review](evidence/eagle-185-entry-review.md) |
| `KOM-021-s02`, first final-refrain орёл | 180.550 → **180.350 s** | 7,953,435 | 180.315–180.435 s | [First final eagle source review](evidence/eagle-180-entry-review.md) |

At 62 seconds, the conspicuous attenuation near 62.425 was provisionally considered the split. The character sequence and original/stem context instead support an internal g-like closure, after the quiet opening vowel. Retaining62.425 would still omit that prefix. At 149 seconds, moving as early as149.300 would risk the preceding v/n transition; the changed body149.44–149.50 supports149.480. Earlier is not automatically better.

The 183.700 selection deliberately precedes a stronger core near 183.731. An independent reviewer selected183.735 within183.685–183.805; the approximately 35 ms disagreement is preserved. Both lie in a broad source-supported ownership region. Point agreement at 180.350 also does not certify a unique isolated phoneme edge. These intervals are qualitative review uncertainty, not calibrated statistics.

**First-pass change:** inspect the full preceding nasal/final vowel → quiet opening → internal consonant → stressed-vowel sequence for every repeat before freezing. Do not restrict the crop to the existing onset or require a silence-separated attack. Save rejected competing paths and explain both changed and retained points. The two first-refrain eagle entries remain independently selected at 45.180 and 48.420 with broader uncertainty; no shared chorus offset was used.

More model variants did not settle this ownership automatically. Some original-mix paths attached the phones to a later syllable or occurrence; stem paths reassigned the same quiet body when context/spelling changed. The later targeted refinements reused cached paths and inspected the physical trajectory instead of repeating broad model sweeps. Preserve the rejected allocations as evidence of model failure rather than treating extra runs as precision votes.

## 2. New ownership needed an explicit preceding release

Moving a new onset alone can leave the prior word highlighted through the new quiet vowel. The selected correction layers pair the relevant словно release with the new орёл/огонь start. Both language lanes use that same exclusive handoff. This is a local lexical assignment, not a presentation anticipation or global audio offset.

Other neighboring edges need different treatment. The early verse погас final frication releases around 9.545, followed by a real interval before будет around 9.610. The short ей body begins around 120.275 after дай and ends around 120.480 before разбиться; its old60 ms core was incomplete. Final long над transitions required preventing prior Лети/Свети vowel from being reassigned to the preposition. A release must be inspected independently, then reconciled with its neighbor; a validator’s non-overlap rule is not acoustic proof.

The [all-word ledger](evidence/timing-review.md) covers139 events, with 61 starts and 67 releases changed against the original preserved baseline. Later revisions refine already changed events, so unchanged totals do not mean no new work. Every retained event has a reason; retention is not perfection.

## 3. Short final cores had cropped performed vowels

Sparse final character emission also ended many words before their direct sung body. The full139-release pass widened phrase-tail panels and compared original mix, estimated vocal and accompaniment. Earth at 42.400 was extended to 43.800; the repeated eagle ending49.397 was extended to 51.200. These substantial changes came from continuing direct-body evidence, not a generic tail allowance.

Sustained vowels, terminal glides/consonants, breath and passive decay need separate judgments. A stem can retain reflected voice or leak music, and stationary harmonics alone do not prove continued phonation. The [independent held-word review](evidence/release-independent.md) and [release plots](evidence/release-plots/release-proposals.json) preserve ranges and retained cases. All 27 cue-final lexical endpoints stayed unchanged through the later connected-onset refinements.

**First-pass change:** inspect both edges of every word, all short pronouns/conjunctions/negation, all held refrain endings and every selected gap. Widen a final panel to the actual next phrase, not just a few milliseconds beyond the model core. Classify neutral gaps without declaring them all silence or automatically filling them.

## 4. Correct lexical ends still produced early line cuts

V3’s midpoint reading-window rule left20 ms with neither cue visible and compressed short exits into abrupt cuts. Original25 fps frames at 57.800,131.600,179.680,186.920 and 193.320 landed in these blanks. In one final fly phrase, the complete line disappeared only10 ms after the selected word end.

V4 separated the last word’s lexical release from `fullOpacityEnd` and `visibleEnd`. A fresh all 27-cue review supported longer neutral readability through voice-shaped decay without securely changing the lexical endpoints. Both complete language lanes now stay fully readable through the selected hold. A 0.42–0.50 s fade follows when enough room remains before the next reading lead; otherwise the outgoing neutral line survives until the next actual vocal entrance and is replaced atomically. The incoming line is already fully visible when its first word begins.

For the final огонь, focus ends at 200.350, the complete neutral line holds through 202.300 and clears at 202.800. For adjacent землёй/Словно, the old line hands off at the next vocal rather than reserving a midpoint blank. See [line-lifetime decisions](evidence/line-lifetime-review.md), [all-cue signal ranges](evidence/cue-tail-review.md) and [the comparison](evidence/cue-tail-comparison.png).

**First-pass change:** test actual-cadence frames in short cue gaps and inspect long-gap voice/decay tails. Do not use line opacity to conceal a bad word interval, or extend lexical focus solely to keep text readable. Treat body end, neutral hold, fade and decorative release as four named quantities.

## 5. Complete English grammar had to share source events

Russian and English have equal geometry, weight, resting contrast and focus strength. The mapping includes every necessary English completion: орёл → **an eagle**, землёй → **the Earth**, погас → **went dark**, родится → **will be born**. Independently sung не → **not** remains separate. Articles and auxiliaries have no invented acoustic timestamps.

Natural English order can move focus backward, as in brighter/shine or the birth sentence’s subject/predicate. Береги activates both **keep** and **safe** without activating the intervening bird noun. Radio **a … message** and **the … surface** use the union of actual contributing source intervals, releasing during the intervening adjective. Enclosing a phrase would over-highlight; leaving grammar neutral would under-highlight.

The [translation review](evidence/translation-review.md) and independent semantic fixtures check complete expansions, negation, pronouns, reordered meanings and every repeat. Their text-authored expectations reject both incomplete and overly broad mapping. Renderer agreement alone cannot establish editorial correctness.

## 6. Full recording coverage exceeded the supplied sheet

The 24 supplied lines define23 supplied-sequence cues and 14 templates. The recording additionally repeats the complete radio transmission near the end, giving27 cues,139 source events and 157 target tokens. Four late occurrences have separate IDs and empty supplied-line membership; the reference sheet remains intact. The last spoken word ends249.960, after the final sung lyric200.350.

Complete unprompted recognition omitted singing and invented subtitle/end-title content. Bounded Russian/English coverage and signal checks were necessary; conditioned alignment did not establish lexical truth. Tight unprompted English recognition supports We’re and the captain/ship names. Filtered radio and the faded final question retain explicit uncertainty.

All four radio phrases correlate with the primary clip at exact+79.120 s. This measured sample relationship permits transferring reviewed relative boundaries, with the original uncertainty. The final fade is an exception: transferring250.160 would extend into digital silence, so249.960 is selected independently. Sung repeats have no equivalent proven clip identity and remain separately measured.

**First-pass change:** audit the intro, every large gap, spoken inserts, endcards and full tail before declaring coverage complete. Source typography or a decorative end transition must not cut off captions that still belong to the recording.

## 7. The source clock and the loaded revision were separate checks

The original video supplies both soundtrack and decoded picture:1920×796 at 25 fps,44.1 kHz,11,469,824 decoded samples, source offset 0. Word focus uses fractional playback samples with exclusive ends and immediate color change. Display-cadence `requestAnimationFrame` reads the video’s current time; `requestVideoFrameCallback` separately records native picture PTS. A held40 ms picture frame need not hold the previous word’s focus. The 47 ms audio tail keeps the final decoded picture.

Source/current-time comparison, paint measurements and scene inspection found no added onset ramp or constant clock error explaining the later quiet vowels. Adjusting an offset would have damaged correct words. The recording-specific ownership needed correction instead.

An older open preview can still show old samples after local files are rebuilt. The timeline revision badge now comes from loaded scene identity, while canvas diagnostics expose source hash, actual event samples, active source/target words, word clock, picture PTS and reading-window opacity. Before/after browser checks verify those loaded values in both layouts. Shared-scene stills support composition checks; they are not exported browser screenshots or final encoded parity proof.

**First-pass change:** prove loaded identity and runtime behavior before blaming acoustics. Then reload and verify corrected bilingual states, actual picture movement, seeking, format switching and recovery. An advancing slider or successful decode-size probe does not prove moving picture visibility.

## 8. What to preserve for the next production step

Keep the original source and zero, editorial inventory, individual word IDs, selected samples, all 27 final releases, neutral holds and correction history. The [frozen input manifest](evidence/preview-inputs.json) binds the current preview; [browser observations](evidence/browser-preview-checks.md) and [technical checks](evidence/technical-checks.json) have distinct scopes. Cached model variants remain correlated evidence. Sample storage is exact, but the perceptual boundary is still an estimate.

No full-song render, final-file renderer parity or publication is established by preview acceptance alone. At the preview-stage freeze, the production command checked identity and review/authorization before capture and then reported that capture was unconfigured. An authorized production continuation must preserve those checks while configuring and verifying its renderer. Consult the current gate and command for that continuation’s status; do not manufacture listening telemetry from these analyses.

For remote work, retain the repository’s conservative Actions policy: coordinator preflight covers all current-UTC-day workflows, actors, branches, queued/running/completed runs and rerun attempts, plus expected chains and runner minutes. Unknown usage remains unknown. Preserve checks and durable local work; no remote mutation or Actions trigger was part of these preview refinements.
