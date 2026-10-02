# Cue-final body and line-legibility review — Кометы

**All 27 final-word/cue releases were rechecked. No new phonetic endpoint change is securely established. Longer neutral line visibility is supported by the source-shaped decay; passive decay does not extend full-strength word focus.**

Historical v4 cue-final review baseline: `f9bdac802a56019eda3c21c8c4a78619506ac296db2a06999f55770c0dba4fc2`, bound by [the archived v4 inputs](preview-inputs-v4.json). The numerical observations below and the signal-review JSON describe that baseline; they are not a new review of later onset revisions. Source: `af518bcde332f296dfc7982ebd7d8724c80c722decf5a32dfe3b00ef86107bf6`. Original zero and the 44,100 Hz sample clock are retained. Every cue end equaled its last source word end in that baseline; no mismatched cue bound was found.

## Findings

- V3 shortened close-gap line visibility to a midpoint and could leave a blank before the next vocal. For KOM-020, the line vanished at 179.675 s, only 10 ms after its selected word end, before the upper body uncertainty and the next consonant at 179.705 s.
- Longer gaps also contain voice-shaped decay after the line disappears: птица through roughly 34.1–34.6 s, лето through 109.6–110.05 s, and final огонь through 201.7–202.3 s. These intervals support reading lifetime, not a new direct-phonation claim.
- Close cues should preserve the neutral previous line until the next actual acoustic onset, then replace it atomically. Long gaps use the upper reviewed decay edge below; a later approximately 0.50 s fade is a renderer choice only where at least 0.42 s of room remains before the next reading lead.
- Filtered radio tail attribution remains low confidence. The final faded check ends with the source near 249.960 s; residual one-unit PCM quantization is not an audible new word or a supported post-250 s tail.

## All-cue numerical review

Seconds below are rounded for readability. Exact selected samples and per-cue uncertainty, reasons and method limits are retained in [the public signal-review JSON](cue-tail-signal-review.json). “Body retained” means fresh inspection did not justify a more precise replacement. The neutral hold can continue after the phonetic body, without keeping its word highlighted.

| Cue / final word | V3 body end | Fresh body-end range | V3 line gone | Candidate decay-end range | Proposed neutral hold until | Rule / confidence |
| --- | --- | --- | --- | --- | --- | --- |
| KOM-001 / кометы | 15.215 | 15.180–15.270 | 15.368 | 15.360–15.510 | 15.541 | next-vocal handoff; medium |
| KOM-002 / планетой | 19.316 | 19.200–19.620 | 20.016 | 20.350–20.800 | 20.800 | decay upper edge; low |
| KOM-003 / птица | 33.245 | 33.150–33.450 | 33.945 | 34.100–34.600 | 34.600 | decay upper edge; medium-low |
| KOM-004 / землёй | 43.800 | 43.720–43.900 | 44.011 | 44.100–44.350 | 44.243 | next-vocal handoff; medium-low |
| KOM-005 / орёл | 51.200 | 51.030–51.380 | 51.418 | 51.500–51.750 | 51.655 | next-vocal handoff; low |
| KOM-006 / землёй | 57.730 | 57.640–57.820 | 57.797 | 57.820–58.000 | 57.885 | next-vocal handoff; medium-low |
| KOM-007 / огонь | 65.450 | 65.250–65.650 | 66.150 | 66.800–67.500 | 67.500 | decay upper edge; low |
| KOM-008 / любить | 102.535 | 102.505–102.565 | 102.608 | 102.610–102.685 | 102.700 | next-vocal handoff; medium-low |
| KOM-009 / лето | 108.450 | 108.350–108.650 | 109.150 | 109.600–110.050 | 110.050 | decay upper edge; medium-low |
| KOM-010 / птицу | 118.430 | 118.370–118.490 | 118.917 | 118.800–119.040 | 119.040 | decay upper edge; medium-low |
| KOM-011 / разбиться | 122.500 | 122.390–122.650 | 123.200 | 123.700–124.300 | 124.300 | decay upper edge; medium-low |
| KOM-012 / землёй | 131.505 | 131.420–131.600 | 131.595 | 131.640–131.850 | 131.705 | next-vocal handoff; medium-low |
| KOM-013 / орёл | 138.650 | 138.420–138.820 | 138.850 | 138.950–139.150 | 139.070 | next-vocal handoff; low |
| KOM-014 / землёй | 145.125 | 145.040–145.215 | 145.205 | 145.250–145.450 | 145.305 | next-vocal handoff; medium-low |
| KOM-015 / огонь | 152.330 | 152.180–152.500 | 153.030 | 153.500–154.150 | 154.150 | decay upper edge; low |
| KOM-016 / Serenity. | 160.280 | 160.150–160.310 | 160.891 | 160.500–160.850 | 160.850 | decay upper edge; low |
| KOM-017 / surface. | 164.218 | 164.100–164.280 | 164.918 | 164.450–164.850 | 164.850 | decay upper edge; low |
| KOM-018 / me? | 166.500 | 166.400–166.640 | 167.200 | 166.650–166.950 | 166.950 | decay upper edge; low |
| KOM-019 / me? | 171.040 | 170.980–171.180 | 171.740 | 171.180–171.550 | 171.550 | decay upper edge; low |
| KOM-020 / землёй | 179.665 | 179.600–179.735 | 179.675 | 179.760–179.980 | 179.705 | next-vocal handoff; medium-low |
| KOM-021 / орёл | 186.765 | 186.640–186.890 | 186.905 | 186.970–187.200 | 187.065 | next-vocal handoff; low |
| KOM-022 / землёй | 193.260 | 193.160–193.340 | 193.308 | 193.340–193.550 | 193.375 | next-vocal handoff; medium-low |
| KOM-023 / огонь | 200.350 | 200.180–200.480 | 201.050 | 201.700–202.300 | 202.300 | decay upper edge; low |
| KOM-024 / Serenity. | 239.400 | 239.270–239.430 | 240.011 | 239.620–239.970 | 239.970 | decay upper edge; low |
| KOM-025 / surface. | 243.338 | 243.220–243.400 | 244.038 | 243.570–243.970 | 243.970 | decay upper edge; low |
| KOM-026 / me? | 245.620 | 245.520–245.760 | 246.320 | 245.770–246.070 | 246.070 | decay upper edge; low |
| KOM-027 / me? | 249.960 | 249.945–249.975 | 250.660 | 249.945–249.975 | 249.975 | decay upper edge; medium |

## Per-cue observations

**KOM-001 — кометы:** Final vowel harmonics lose their changing strong body near 15.20–15.25. A much weaker voice-shaped remnant persists through roughly 15.4; the new consonant/body at 15.54 is the next phrase. Existing body end remains within the observed transition; do not transfer the tail into full-strength focus.

**KOM-002 — планетой:** The vowel/sonorant region weakens over 19.2–19.6. Original and estimated-vocal bands continue as softer largely stationary decay toward 20.5–20.8, before a separate breath/noise and the next phrase. Some low bands also occur in accompaniment. Constant pitch alone cannot prove reverb; the body split is broad and should receive listening review rather than an automatic new phonetic endpoint.

**KOM-003 — птица:** The changing strong final-vowel body weakens around 33.1–33.4. Original and estimated vocal still contain coherent, gradually falling voice-shaped bands after the v3 disappearance at 33.945. Meaningful candidate decay persists into roughly 34.1–34.6. Much later largely stationary low bands blend with music and do not prove continuing phonation.

**KOM-004 — землёй:** The terminal glide/soft body weakens around 43.7–43.9, with related original/stem harmonics continuing toward 44.2. The v3 line is gone at 44.011 before the next initial frication at 44.243. Decay merges with the next phrase; its absolute ending cannot be isolated.

**KOM-005 — орёл:** After strong held body has declined, softer sonorant/voice-shaped bands remain in the original and stem through roughly 51.5–51.7. The v3 line vanishes at 51.418 before the next consonant at 51.655. Soft direct sonorant versus reverb remains unresolved; no new phonetic endpoint is inferred.

**KOM-006 — землёй:** Original/stem terminal glide and related decay continue through the short handoff region around 57.8–57.9. The v3 line cuts at 57.7975, inside the prior body uncertainty, before new frication at 57.885. The next voiced body obscures the absolute end of the prior decay.

**KOM-007 — огонь:** Soft final consonant/vowel body and reflected voice-shaped harmonics decline gradually, with corresponding original/stem tonal decay still present after v3 disappearance at 66.150. A legibility tail through roughly 66.8–67.5 is supported; later stationary quiet bands are not selected as continued singing.

**KOM-008 — любить:** The terminal stop/frication weakens around 102.52–102.56. There is a short fading noisy remnant before the clearly new voiced За near 102.70. Keep the phrase readable through that small decay; the new vowel belongs to the next cue.

**KOM-009 — лето:** The terminal vowel has strong amplitude near 108.45 and declines over the following body-to-decay transition. Original/stem voice-shaped bands persist after v3 disappearance at 109.150, declining toward 109.6–110.05 before separate next-phrase noise. This supports a reading tail, not a new full-strength focus interval.

**KOM-010 — птицу:** Changing final-u harmonics/body weaken around 118.4–118.5. Softer related bands persist afterward and diminish near 118.8–119.0; the breath-like event near 119.1 and new Не near 119.425 are separate. Full-strength focus need not follow the whole quiet tail.

**KOM-011 — разбиться:** The final vowel/body weakens around 122.4–122.7. Coherent but progressively weaker related original/stem harmonics persist after the line is gone at 123.200, supporting legibility through roughly 123.7–124.3. Constant-pitch persistence alone cannot distinguish reflected energy from soft phonation.

**KOM-012 — землёй:** Original/stem soft glide and related harmonics persist near 131.6–131.7. The v3 line cuts at 131.595, within the prior body-end interval, before the next consonant at 131.705. Later old-tail energy is mixed with the new phrase and cannot receive an isolated lexical end.

**KOM-013 — орёл:** The terminal sonorant/body gradually weakens across 138.4–138.8, with related original/stem tail extending toward 139.0. The line disappears at 138.850 before the next initial consonant at 139.070. The exact direct-body/reverb split remains broad.

**KOM-014 — землёй:** Glide/soft body continues toward 145.1–145.2, followed by original-supported related harmonics around 145.3. The v3 line cuts at 145.205 inside the prior release interval, before new frication at 145.305. Tail continues into the next phrase and becomes inseparable there.

**KOM-015 — огонь:** Soft terminal consonant/vowel body declines around 152.2–152.5. Related harmonics remain in the original and stem after the v3 line is gone at 153.030, gradually diminishing into roughly 153.5–154.15. New musical low bands around 153.3 and stem leakage prevent treating all residual energy as phonation.

**KOM-016 — Serenity.:** The final filtered vowel/body falls near 160.2–160.3. A broader noisy remnant follows through roughly 160.5–160.8, with musical/static bands continuing farther. Whisper original/stem releases disagree (160.28/160.20) and MMS ends at 159.979; none establishes an audible-tail boundary. Retain the current body selection and keep possible decay/reading lifetime separate.

**KOM-017 — surface.:** Final consonant/noisy body merges into diffuse filtered residue around 164.1–164.3. Weaker noise persists later, but flat bands extending into 165+ also occur in accompaniment and do not prove more surface articulation. A quiet decay/reading window through about 164.6 is plausible, with broad uncertainty.

**KOM-018 — me?:** Filtered final me body is obscured around 166.4–166.6; original Whisper ends 166.50 and stem Whisper 166.62. Softer noisy vowel-shaped remnant continues shortly afterward. Flat harmonic persistence beginning about 167.05 coincides with accompaniment and is not evidence of a three-second word. Existing body selection lies within the fresh broad interval.

**KOM-019 — me?:** Weak final me body lies in a strongly musical/filter-noise mix; original/stem Whisper end 171.04/171.18 and very-low-score CTC is rejected. A residual vocal-shaped region can plausibly continue to 171.2–171.5, but the stable tones lasting to 173 are not independently attributable to speech. Keep current phonetic selection unless listening settles the split.

**KOM-020 — землёй:** The terminal glide/body declines around 179.6–179.7, and original/stem related harmonics remain near the following onset. V3 removes the line at 179.675, only 10 ms after its selected end and before the upper body interval. New frication at 179.705 overlaps the uncertainty; preserve the atomic handoff rather than invent a silent gap.

**KOM-021 — орёл:** The soft terminal sonorant/body declines over roughly 186.6–186.9. Related original/stem voice-shaped remnants continue toward 187.0, while v3 removes the line at 186.905 and the next consonant starts 187.065. The next voiced body limits independent late-tail attribution.

**KOM-022 — землёй:** The terminal glide/body continues around 193.2–193.3. V3 removes the line at 193.3075 before the upper prior body interval and before new frication at 193.375. Related original/stem remnants continue into the next phrase; their passive tail must not extend the phonetic focus.

**KOM-023 — огонь:** The softer terminal consonant/vowel body declines around 200.2–200.5. Original/stem voice-shaped bands remain after v3 disappearance at 201.050 and weaken into roughly 201.7–202.3. Low accompaniment and separation leakage remain, so this is a conservative line-legibility tail rather than a new singing-end claim.

**KOM-024 — Serenity.:** Fresh late original/stem/accompaniment panel matches the primary clip at measured +79.120 s, including the terminal body and candidate decay. The final filtered vowel/body falls near 160.2–160.3. A broader noisy remnant follows through roughly 160.5–160.8, with musical/static bands continuing farther. Whisper original/stem releases disagree (160.28/160.20) and MMS ends at 159.979; none establishes an audible-tail boundary. Retain the current body selection and keep possible decay/reading lifetime separate.

**KOM-025 — surface.:** Fresh late original/stem/accompaniment panel matches the primary clip at measured +79.120 s, including the terminal body and candidate decay. Final consonant/noisy body merges into diffuse filtered residue around 164.1–164.3. Weaker noise persists later, but flat bands extending into 165+ also occur in accompaniment and do not prove more surface articulation. A quiet decay/reading window through about 164.6 is plausible, with broad uncertainty.

**KOM-026 — me?:** Fresh late original/stem/accompaniment panel matches the primary clip at measured +79.120 s, including the terminal body and candidate decay. Filtered final me body is obscured around 166.4–166.6; original Whisper ends 166.50 and stem Whisper 166.62. Softer noisy vowel-shaped remnant continues shortly afterward. Flat harmonic persistence beginning about 167.05 coincides with accompaniment and is not evidence of a three-second word. Existing body selection lies within the fresh broad interval.

**KOM-027 — me?:** The entire source is faded/cut at this endpoint. Original stereo RMS collapses at 249.95–249.96; residual ±1 PCM quantization ends 250.009 and exact-zero PCM follows. The source obscures the natural word release. There is no supported audible post-250 tail; any longer neutral line lifetime is a reading choice, not a phonetic/audible extension.

## Evidence and limits

The [representative original/stem spectral comparison](cue-tail-comparison.png) overlays the selected phonetic body, v3 disappearance and proposed neutral hold. It includes the original mix so an isolated stem is not the only visual evidence. The public table and JSON preserve all 27 numerical observations independently of private raw analysis.

Fresh wide spectra use 1,024-sample Hann windows and 88-sample hops: approximately 23.2 ms support and 2.0 ms hops. Original/stem/accompaniment RMS traces use 40 ms windows and 10 ms hops. The clock-verified estimated stem retains zero observed lag and the same 11,469,824 samples; it can contain reverb or accompaniment leakage. Source-shaped spectral persistence is not a listening attestation of audibility, and constant-pitch direct voice remains hard to separate from reflected decay.

Both radio occurrences were checked in their original-source panels. The first three late final-word regions correspond to their earlier clips at the measured +79.120 s shift; the source-faded last check is assessed separately. No additional lexical repeat or word was invented.

Local proposal checks cover all 27 cue IDs, source/editorial/frozen-v3 identity, positive reading lifetime, unchanged word endpoints, sample conversion and following-vocal bounds. This review does not modify the timing candidate, create a full render, edit Desktop files, or trigger GitHub Actions.
