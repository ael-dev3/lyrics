# Held releases — v1.1 preview correction

The first preview passed display tests while several focus endpoints still cut into strong sustained vocals. This revision extends **29 endings**, retains **five** reviewed endings, and preserves **all 118 word starts**. Russian and the complete linked English meaning share each selected release.

## Evidence and limits

The unchanged original mix and estimated vocal were examined at every one of the 34 separated held positions. Nine contact sheets show the original/stem spectrograms and amplitude traces. A **64 ms Hann window** and **5 ms plotting hop** expose sustained harmonics and their decline; that hop does not imply 5 ms acoustic precision. Pitch/harmonicity and relative −10/−20 dB markers support inspection. They are not automatic endpoints: accompaniment, separation leakage and reverb can remain tonal.

The [correction layer](source/held-release-corrections-v1.1.json) retains each old endpoint, selected integer 48 kHz endpoint, diagnostic values and selection reason. It applies once against the fixed v1 baseline, commit `5b13bdda90fdc37b88ef49c3208cd97f3b5a084e`, timeline SHA-256 `58a433c0b02dcb4a843700e46e22088d050b524fbe6351de46aa950607a3b8df`. The builder does not extend its own revised output again. [The comparison](evidence/held-release-comparison.json) verifies the unchanged starts and source bytes.

Lexical release remains separate from neutral reading. The closing **жить / to live** now focuses until **205.880 s**; the whole neutral line remains opaque until **207.180 s** and clears by **207.830 s**. Focus does not simply follow every remaining echo. The same separation applies to internal held words in the two spaced opening phrases.

These are source/stem signal selections for preview review. No new full-recording human listening attestation or production approval is claimed. Complete listener review remains pending for the current identity.

## Per-occurrence decisions

Times below are seconds in the unchanged original recording, with exclusive focus ends. Storage precision is distinct from evidence certainty.

| Event | Word | Previous end | Selected end | Decision and reason |
| --- | --- | ---: | ---: | --- |
| RZ-001-s00 | Может | 3.760 | 3.760 | Retained: the terminal stop and strong body have already ended; the remainder falls as passive decay. |
| RZ-001-s01 | только | 8.540 | 10.340 | The final o retains coherent vocal harmonics and near-body level long after 8.54; release falls around 10.3. |
| RZ-001-s02 | солнце | 15.120 | 16.240 | The final e remains strong through the old cutoff and continues into the 16.1–16.3 release transition. |
| RZ-001-s03 | знает | 22.040 | 22.040 | Retained: final consonant/body declines before the selected endpoint; later stationary remnant is not a new hold. |
| RZ-002-s03 | заря | 25.770 | 27.040 | The final vowel is still near full level at 25.77; changing harmonics continue toward the 26.9–27.1 release. |
| RZ-003-s03 | плакать | 33.080 | 33.840 | The decrescendo is part of the extended word. Coherent vowel/coda persists after the old cutoff toward 33.7–33.85. |
| RZ-004-s03 | февраля | 38.650 | 39.220 | The final ya continues after 38.65; carry focus through the changing weak body near 39.1–39.25. |
| RZ-005-s02 | слякоть | 44.820 | 46.000 | Strong o and final consonant continue past 44.82; the late CTC consonant is supported by the actual body/coda transition. |
| RZ-006-s04 | любить | 51.860 | 51.860 | Retained: direct body/coda ends in the existing transition; weaker post-release decay does not justify extending focus. |
| RZ-006-s08 | осколок | 57.650 | 58.200 | The final syllable remains near its reference level at 57.65; include the coda and release around 58.1–58.2. |
| RZ-007-s04 | дорог | 63.110 | 64.480 | The held final syllable remains strong at the old endpoint and continues toward the late consonant/body release around 64.4. |
| RZ-008-s03 | жить | 68.120 | 70.580 | Continuous changing i harmonics persist through 70.3–70.5. The early character path was not the sung-word release. |
| RZ-009-s03 | жить | 74.140 | 76.780 | Independent repeat: the held i remains strong through 76.5, followed by a distinct 76.6–76.8 release. |
| RZ-010-s03 | жить | 80.290 | 82.430 | Independent repeat: sustained i continues through 82.2, then weakens sharply around 82.3–82.45. |
| RZ-011-s03 | жить | 87.020 | 89.030 | Independent repeat: changing weak vowel continues toward 88.9–89.05; later quiet stationary remnant remains neutral. |
| RZ-012-s00 | Может | 94.090 | 94.680 | The second performance has a later soft release around 94.6–94.7; do not copy the first performance duration. |
| RZ-012-s01 | только | 98.900 | 101.100 | The final o is still full at 98.90 and continues with changing body through about 101.0. |
| RZ-012-s02 | небо | 105.080 | 106.860 | The final o continues through the old endpoint and weakens around the independently inspected 106.8 release. |
| RZ-012-s03 | видит | 110.640 | 112.520 | The held second syllable remains strong through 112.3–112.45; the sparse early consonant path did not define the end. |
| RZ-013-s03 | луна | 116.270 | 117.320 | The final a persists after 116.27 and transitions into weaker decay around 117.2–117.35. |
| RZ-014-s03 | верить | 123.200 | 124.040 | The held i and weak coda continue toward 124.0; later low-energy stationary tail is separate. |
| RZ-015-s03 | полна | 128.400 | 129.920 | The final a stays at body level after 128.4 and releases around 129.8–129.95. |
| RZ-016-s04 | доверить | 135.000 | 137.030 | The held i changes pitch late in the phrase and continues through roughly 136.9–137.05. |
| RZ-017-s04 | любить | 142.010 | 142.010 | Retained independently: the body and stop have ended around this point; do not lengthen a completed word for residual decay. |
| RZ-017-s08 | осколок | 147.930 | 148.860 | The repeated final syllable remains strong through 148.6–148.75 and releases around 148.8–148.9. |
| RZ-018-s04 | дорог | 153.620 | 154.820 | The repeated held syllable continues past 153.62 toward the late consonant around 154.7–154.85. |
| RZ-019-s03 | жить | 160.690 | 160.690 | Retained: the body/coda break is already at the selected endpoint; subsequent decay alone does not extend focus. |
| RZ-020-s03 | жить | 166.450 | 167.040 | Independent repeat: changing held i remains strong through 166.8–166.9; include its weak release near 167.0. |
| RZ-021-s03 | жить | 172.280 | 173.180 | Independent repeat: held i remains strong after 172.28 and releases around 173.05–173.2. |
| RZ-022-s03 | жить | 178.370 | 179.120 | Independent repeat: a late moving vowel/glide continues after 178.37 toward 179.0–179.15. |
| RZ-023-s03 | жить | 184.450 | 185.060 | Independent repeat: held i and weak coda continue toward 185.0–185.1. |
| RZ-024-s03 | жить | 190.420 | 191.560 | Independent repeat: near-body level continues through 191.3, with a weaker changing release to about 191.55. |
| RZ-025-s03 | жить | 196.470 | 197.460 | Independent repeat: sustained vowel continues well past 196.47 and releases around 197.3–197.5. |
| RZ-026-s05 | жить | 202.020 | 205.880 | The closing i is still strong at 202.02 and stays voiced for several more seconds; direct body/coda releases around 205.7–205.9, before the passive tail. |

## Regenerate diagnostic views

With the retained decoded analysis inputs and dependencies listed in the project README:

```sh
python scripts/acoustic/release-review.py
node scripts/acoustic/plot-release-review.ts
```

The script loads and hashes the exact committed baseline even on a fresh checkout. Private audio, numerical matrices and contact sheets remain in ignored `analysis/`; the selected public layer contains no local account paths. Running these diagnostics does not change accepted timing or certify listening review.

## Regression checks

The five independently selected late-body anchors are **10.000**, **33.500**, **69.500**, **111.800** and **205.200 s**. Each lies after its old focus cutoff, so the former timeline fails. Tests check actual painted Russian and complete English focus in both formats, as well as all other token states, semantic unions, boundary exclusivity and clear gaps. The actual browser also verifies loaded identity, selected late states and native-source transport. Those display checks cannot, by themselves, prove an acoustic endpoint.
