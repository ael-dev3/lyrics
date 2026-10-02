# Eagle entrance near180 seconds: leading quiet vowel

Propose the coupled словно → орёл handoff at **180.350s**, source sample **7,953,435**, 200ms before the existing 180.550s selection. Plausible connected-vowel ownership is **180.315–180.435s**, with medium-low confidence. The held final release stays **182.970s**, sample **8,068,977**.

Frozen baseline timing SHA256: `460511f8a64907c3d15b691283a997848f7f5431ab329f0f00a90a0100ddf538`. Original source SHA256: `af518bcde332f296dfc7982ebd7d8724c80c722decf5a32dfe3b00ef86107bf6`. Source clock: 44100Hz, offset 0. `KOM-021-s02` source index 1 is zero-based.

| Edge | Before | Proposed | Change |
| --- | --- | --- | --- |
| `KOM-021-s02` onset |180.550s / 7,962,255|180.350s / 7,953,435|−8,820 samples / −200ms|
| `KOM-021-s01` release |180.550s / 7,962,255|180.350s / 7,953,435|−8,820 samples / −200ms|
| `KOM-021-s02` final release |182.970s / 8,068,977|182.970s / 8,068,977|0|

## Source-supported leading transition

The original mix and clock-verified estimated vocal show attenuation near 180.22, followed by renewed connected voice. A changed, descending quiet harmonic body develops around 180.33–180.43, ahead of the stronger region around 180.55 and later consonant sequence around 180.71. Select 180.350 within the leading portion of that changed body. The prior attenuation alone is not the selected lexical boundary: it can still belong to the preceding word’s nasal/final-vowel transition.

The preceding final vowel and following reduced initial vowel remain connected. No silence or abrupt new voiced attack separates them. This proposal assigns their shared ownership by the original trajectory, with the stem supporting identity; it does not certify a single isolated phoneme edge. An independent targeted signal review also selected 180.350 with the same 180.315–180.435 range.

## Cached competing phone paths

| Context / input / path | Prior final-vowel core | Initial-vowel core | Later consonant core | Later stressed-vowel core |
| --- | --- | --- | --- | --- |
| four-word context / original mix / orthographic baseline | 180.786840 | 180.987107 | 181.147320 | 181.207400 |
| four-word context / original mix / acoustic reduced initial vowel | 181.207400 | 181.728093 | 182.168680 | 182.589240 |
| four-word context / estimated vocal / orthographic baseline | 180.386307 | 180.566547 | 180.706733 | 180.826893 |
| four-word context / estimated vocal / acoustic reduced initial vowel | 180.386307 | 180.406333 | 180.706733 | 180.826893 |
| restricted two-word context / original mix / orthographic baseline | 181.209885 | 181.731379 | 182.172644 | 182.272931 |
| restricted two-word context / original mix / acoustic reduced initial vowel | 181.209885 | 181.731379 | 182.172644 | 182.272931 |
| restricted two-word context / estimated vocal / orthographic baseline | 180.367471 | 180.568046 | 180.708448 | 180.808736 |
| restricted two-word context / estimated vocal / acoustic reduced initial vowel | 180.367471 | 180.568046 | 180.708448 | 180.808736 |

The four-word estimated-vocal reduced-initial path puts the stronger opening-vowel core at 180.406333, after the leading quiet body. Its ordinary spelling instead assigns that body to the preceding final vowel at 180.386307 and starts the new word at 180.566547. Restricted stem paths similarly put preceding nasal/final-vowel cores at 180.307299/180.367471, then the opening core at 180.568046. These are competing adjacent-vowel allocations, not proof that the quiet prefix belongs to the preceding word.

Original-mix paths put opening cores at 180.987107 or 181.728–181.731 and later consonants at 181.147–182.173. Their context-dependent displacement rejects them as leading-entry proof. Retain their disagreement rather than selecting a majority or the earliest model core. The full cached [phone-path record](eagle-phone-path-review.json) preserves scores, contexts and additional alternatives; its paths share one MMS family and are not independent model votes.

## Comparison and limits

The [original/stem comparison](eagle-180-entry-comparison.png) marks the proposed shared boundary and ownership range, the former selection, the stronger 180.406 vowel core and the later 180.707 consonant core. Both analysis inputs contain 11,469,824 source-aligned samples at 44100Hz; measured clock lag is zero. Spectra use 1024-sample Hann support (23.2ms) with 88-sample steps (2.0ms); waveform RMS uses 5ms support. These measurements show local body changes, not formal formant estimation or automatic lexical detection.

The original mixed recording is authoritative. Estimated vocal separation is noncausal and can smear boundaries or leak accompaniment. The 120ms range is qualitative ownership uncertainty, not a calibrated confidence interval or millisecond acoustic accuracy. This report records signal inspection and cached model comparison; it does not claim human listening attestation.

This is a frozen evidence proposal. Only the onset and preceding release change together. The held final release and all separate neutral-line holds remain unchanged. No source timing or renderer edits, new model runs, downloads, full-song render or remote operations were performed.
