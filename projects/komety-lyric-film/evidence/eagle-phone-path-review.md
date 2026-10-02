# Eagle opening vowel: phone-path sensitivity review

The proposed critical correction moves the coupled словно → орёл boundary from 132.650s to **132.305s**, within **132.270–132.360s**. It follows the quiet original/stem changed vowel body around 132.28–132.33, before the stronger vowel core near 132.507 and later consonant near 132.77–132.81. Continuous adjacent vowels do not provide a silence boundary; confidence is medium-low.

Baseline lexical candidate SHA256: `477764a615837642c1d15b520d7d9f7387a632c6554446f8bf68f071057ad9ed`. Original source clock: 44100 samples/second, offset 0. Source sample 5,834,650 encodes the selected boundary as 132.304988662s; the rounded display point is 132.305s. That storage precision does not narrow the physical uncertainty. No source timing or visibility edits are made by this review. The [durable numerical phone evidence](eagle-phone-path-review.json) stores source IDs/zero-based indices, crop clocks, character starts/ends/scores and explicit rejected paths.

## Evidence that 132.650 is late

Four-word original alignment using the acoustic reduced-initial-vowel sensitivity path places the prior nasal core at 132.207, terminal vowel at 132.247, opening vowel core at 132.507 and later consonant at 132.768. The estimated vocal’s standard and reduced-initial paths also give opening core 132.507, with later consonant 132.788. These paths place 132.650 after even the initial-character core. Source/stem plots show the quieter pitched-body trajectory changing earlier around 132.28–132.33. Pitched harmonic ridges are not formal formant estimates.

Two-word estimated-vocal paths expose the remaining ambiguity: standard spelling gives 132.692, while changing only the preceding terminal-vowel acoustic path gives 132.511. That is a context/ownership sensitivity, not independent agreement. The 132.305 selection follows the earlier physical trajectory rather than either sparse character core.

The [source/stem comparison figure](eagle-opening-revisit.png) separates the selected quiet trajectory, competing model core and later consonant.

## Repeat and path failures

The four-word first-refrain estimated-vocal paths skip the first phrase: the first assigned словно begins at 47.807, after the actual second словно entrance at 47.735. Those occurrence assignments are rejected. The second-refrain original standard four-word path puts the first eagle’s consonant at 135.233 in the next словно entrance; it fails noun-phone identity. The critical original two-word paths all move the opening core to 133.999, far after the physical changed body, and are rejected as onset proof.

Other paths remain competing observations. Some reduced-vowel tests move a core earlier; other contexts leave it later or shift it toward accompaniment. No earlier point is copied between repetitions, and paths are not counted as independent model votes. All six entrances receive a separate physical ownership review before final application.

The coordinating agent’s [six source-entry decisions](eagle-entry-decisions.json) record the reconciled critical change and five individual retentions with widened ownership ranges. Those retained points remain unresolved choices, not certified leading edges.

## Compact initial-character core matrix

| Source event | Input | Four-word standard / reduced initial core (s) | Two-word standard / reduced initial core (s) |
| --- | --- | --- | --- |
| KOM-005-s02 | original mix | 45.464 / 45.064 | 45.466 / 45.466 |
| KOM-005-s02 | estimated vocal | 48.387 (rejected) / 48.387 (rejected) | 45.185 / 45.185 |
| KOM-005-s04 | original mix | 49.048 / 49.048 | 49.039 / 48.417 |
| KOM-005-s04 | estimated vocal | 50.569 (rejected) / 50.549 (rejected) | 48.798 / 48.798 |
| KOM-013-s02 | original mix | 133.209 (rejected) / 132.507 | 133.999 (rejected) / 133.999 (rejected) |
| KOM-013-s02 | estimated vocal | 132.507 / 132.507 | 132.692 / 132.692 |
| KOM-013-s04 | original mix | 136.575 / 135.834 | 136.604 / 135.820 |
| KOM-013-s04 | estimated vocal | 136.275 / 136.275 | 135.800 / 135.800 |
| KOM-021-s02 | original mix | 180.987 / 181.728 | 181.731 / 181.731 |
| KOM-021-s02 | estimated vocal | 180.567 / 180.406 | 180.568 / 180.568 |
| KOM-021-s04 | original mix | 184.271 / 185.133 | 184.404 / 185.146 |
| KOM-021-s04 | estimated vocal | 183.951 / 183.731 | 184.103 / 184.103 |

## Method and scope

Analysis uses the original decoded stereo mix and a zero-lag estimated HTDemucs vocal stem with identical source length. Cached MMS_FA weights were reused; no new weight download or service was needed. Acoustic sensitivity paths are technical character-alignment hypotheses and do not change the supplied lyrics or create a pronunciation layer.

Full four-word and restricted two-word crops preserve the original clock. The evidence contains 24 whole-context path observations and 48 restricted path observations, expanded to 96 compact per-entrance comparisons. Every path’s source ID, crop, initial/terminal character boundaries and scores are retained. No final word release, neutral line hold, rendered media or remote state was changed.
