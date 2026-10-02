# Fire entrance near150 seconds: quiet-prefix review

The proposed coupled словно → огонь handoff moves from **149.650s to 149.480s**, 170ms earlier. The plausible ownership range is **149.430–149.550s**, with medium-low confidence. The final held release remains **152.330s**.

Baseline lexical candidate SHA256: `0b4e37fd99c1cf6a7363a4428cf0131a3f7fdca3230e490a9296ee1f7abccab9`. Source SHA256: `af518bcde332f296dfc7982ebd7d8724c80c722decf5a32dfe3b00ef86107bf6`. Original source clock: 44100 samples/second, offset 0. Source index 3 is zero-based.

| Edge | Before | Proposed | Sample change |
| --- | --- | --- | --- |
| `KOM-015-s04` onset |149.650s / 6,599,565|149.480s / 6,592,068|−7,497 / −170ms|
| `KOM-015-s03` release |149.650s / 6,599,565|149.480s / 6,592,068|−7,497 / −170ms|
| `KOM-015-s04` final release |152.330s / 6,717,753|152.330s / 6,717,753|0|

## Earlier connected vowel ownership

Original mix and estimated vocal show marked attenuation/narrowing around 149.28–149.34, followed by oral/voiced renewal near 149.35. That first renewal can belong to the preceding consonant/final-vowel sequence. A following descending, changed connected body develops around 149.44–149.50. Select 149.480 for the shared lexical handoff within that later trajectory, before the stronger initial-vowel core around 149.696. The previous 149.650 split falls within the quiet opening prefix.

A 149.300 alternative would risk capturing the preceding /vn/ transition and is rejected. The attenuation around 149.82–149.87 is later within the word, consistent with an internal consonant closure; it does not define the opening vowel. Exact adjacent-vowel ownership remains uncertain, so the 120ms range is retained rather than claiming an isolated edge.

## Cached competing phone paths

| Model input/context | Prior nasal core | Prior final-vowel core | Initial-vowel core | Internal consonant core | Stressed-vowel core |
| --- | --- | --- | --- | --- | --- |
| Original whole phrase | 149.832888 | 149.913102 | 150.073529 | 150.193850 | 150.274064 |
| Original Mix restricted | 149.514550 | 149.594974 | 150.037302 | 150.157937 | 150.258466 |
| Estimated Vocal restricted | 149.414021 | 149.454233 | 149.695503 | 149.836243 | 149.956878 |

The estimated-vocal restricted path supplies useful vowel-before-consonant ordering, but its sparse initial-vowel core is not the quiet leading boundary. The original restricted/whole paths put the prior final vowel and new vowel substantially later; they follow stronger later body and cannot veto the earlier physical trajectory. These paths share the MMS family and are not independent votes.

- Conditioned Whisper, original mix: new-word start 149.890s. Unprompted crop returned “Своя любовь”; that wrong lexical result is rejected as confirmation.
- Conditioned Whisper, estimated vocal: new-word start 149.630s. Unprompted crop returned “Слава Богу!”; that wrong lexical result is rejected as confirmation.

## Source comparison and limits

The [original/stem comparison](fire-150-entry-comparison.png) marks the proposed ownership range, previous selection, stronger stem vowel core and later internal-consonant core. Source and stem have the same 11469824 samples at 44100Hz; their measured clock lag is zero. Spectra use 1024-sample Hann support (23.2ms), 88-sample steps (2.0ms); waveform RMS uses 5ms windows. Harmonic ridges are body observations, not formal formant estimates.

Original mixed audio remains authoritative. Estimated vocal separation is noncausal and may smear edges or leak accompaniment. The point is a plausible connected-vowel ownership choice, not a statistically calibrated interval, millisecond physical certification or human listening attestation. Source 44100 sample encoding preserves the clock without narrowing that uncertainty.

Only this onset and paired previous release are proposed. Final held-body release and neutral line visibility stay separate. Existing cached paths were read; no new model run, download, production render, source timing edit or remote operation was performed.
