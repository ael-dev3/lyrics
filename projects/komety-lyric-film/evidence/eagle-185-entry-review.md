# Eagle entrance near185 seconds: leading quiet vowel

The selected coupled словно → орёл handoff moves from **184.090s to 183.700s**, 390ms earlier. The plausible ownership range is **183.665–183.805s**, with medium-low confidence. The held final release remains **186.764989s**, source sample 8,236,336.

Baseline lexical candidate SHA256: `d7b9fd3e5d2bb7d8e25c6575e565194578e3aacbc7bc8061064930cfe7c666fb`. Source SHA256: `af518bcde332f296dfc7982ebd7d8724c80c722decf5a32dfe3b00ef86107bf6`. Original source clock: 44100 samples/second, offset 0. Source index 3 is zero-based.

| Edge | Before | Selected | Sample change |
| --- | --- | --- | --- |
| `KOM-021-s04` onset |184.090s / 8,118,369|183.700s / 8,101,170|−17,199 / −390ms|
| `KOM-021-s03` release |184.090s / 8,118,369|183.700s / 8,101,170|−17,199 / −390ms|
| `KOM-021-s04` final release |186.764988662s / 8,236,336|186.764988662s / 8,236,336|0|

## Leading body before the vowel core

Original mix and estimated vocal show prior attenuation/nasal-like narrowing around 183.53–183.61, followed by a lower connected body. A further changed quiet trajectory develops over roughly 183.69–183.80; its leading descent is already developing around 183.69–183.71. Select 183.700 within that leading portion instead of waiting for the stronger reduced-vowel character core near 183.731 or the later consonant/vowel sequence near 184.11–184.32. The preceding word receives an explicit paired release at the same selected point.

An independent later-body comparison proposed 183.735011338 (source sample 8,102,714), within 183.685–183.805. It remains a plausible alternative, about 35ms after the selected point. The 183.700 selection retains more of the leading quiet trajectory and precedes the stronger character core. The range includes both source observations; this is a connected lexical ownership choice, not a certified isolated phoneme edge.

## Competing cached phone ownership

| Context / input / path | Prior final-vowel core | Initial-vowel core | Later consonant core | Later stressed-vowel core |
| --- | --- | --- | --- | --- |
| four-word context / original mix / orthographic baseline | 183.690707 | 184.271480 | 184.531827 | 184.611933 |
| four-word context / original mix / acoustic reduced initial vowel | 184.611933 | 185.132627 | 185.973747 | 186.053853 |
| four-word context / estimated vocal / orthographic baseline | 183.730760 | 183.951053 | 184.111267 | 184.191373 |
| four-word context / estimated vocal / acoustic reduced initial vowel | 183.610600 | 183.730760 | 184.111267 | 184.191373 |
| restricted two-word context / original mix / orthographic baseline | 183.702222 | 184.403990 | 184.524293 | 184.604495 |
| restricted two-word context / original mix / acoustic reduced initial vowel | 184.604495 | 185.145859 | 185.947879 | 186.068182 |
| restricted two-word context / estimated vocal / orthographic baseline | 183.722273 | 184.103232 | 184.203485 | 184.323788 |
| restricted two-word context / estimated vocal / acoustic reduced initial vowel | 183.722273 | 184.103232 | 184.203485 | 184.323788 |

The whole estimated-vocal reduced-initial path places prior nasal/final-vowel cores at 183.571/183.611, then a stronger initial-vowel core 183.731 and later consonant/stressed-vowel cores 184.111/184.191. Ordinary and restricted paths can assign the same quiet body to the preceding terminal vowel near 183.722/183.731, then place the new word near the later consonant sequence. Those allocations expose ownership ambiguity; sparse cores do not measure the quiet leading entry.

Whole-original standard spelling misassigns the preceding word’s entry to 181.648, before its actual 183.020 fricative entrance. Other original paths shift the new initial core toward 184.404 or 185.146. These inconsistent phone/occurrence allocations are rejected as leading-entry proof. The cached [complete phone-path evidence](eagle-phone-path-review.json) retains character times/scores and competing paths; multiple paths from the same MMS family are not independent model votes.

## Original/stem comparison and limits

The [waveform and spectrum comparison](eagle-185-entry-comparison.png) separates the proposed leading ownership interval, old selection, stronger reduced-vowel core and later consonant core. Source and stem have the same 11469824 samples at 44100Hz and measured zero clock lag. Spectra use 1024-sample Hann support (23.2ms), 88-sample steps (2.0ms); waveform RMS uses 5ms windows. Harmonic/body changes are not formal formant estimates or automatic word detectors.

Original mixed audio remains authoritative. Estimated vocal separation is noncausal and may smear edges or leak accompaniment. The 140ms range is qualitative ownership uncertainty, not a calibrated statistical interval or millisecond physical precision. No human listening attestation is claimed.

Only this onset and preceding release are proposed. The final held release and neutral line visibility remain separate. Existing cached paths were inspected; no source timing or renderer edit, new model run, download, full-song render or remote operation was performed.
