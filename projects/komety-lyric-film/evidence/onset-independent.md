# Independent onset inspection: Кометы

**Result:** The baseline has several genuine late starts, but the evidence supports individual corrections rather than a uniform lead. Fourteen first-verse/refrain onset proposals are retained below; an additional later «Лети» proposal is recorded at the end. Five refrain fricatives precede their MMS markers by about 46–91 ms. The larger outlier is the opening vowel of «Из»: its selected marker lies near the end of the held vowel.

**Scope and limits:** This inspected all 35 words in KOM-001 through KOM-007 (first verse and first refrain, original source clock 6.5–65 seconds), plus three later entries requested for follow-up inspection. It is waveform/spectrogram inspection by a model, not human listening. No human listening attestation, rendering approval, or completed synchronization gate is claimed. No timing source or player code was edited.

**Inputs:** Original `public/source.mp4`, source identity `af518bcde332f296dfc7982ebd7d8724c80c722decf5a32dfe3b00ef86107bf6`, decoded to unshifted 44100 Hz stereo through 66 seconds in `analysis/onset-independent/original-stereo-0-66.wav`. The baseline timing snapshot is `analysis/onset-independent/selected-before.json`, SHA-256 bd988f7e558ad5e1f3b2b9143fbb48701a8ad5d8daa34877c9ce4686f502dad0. Baseline MMS/Whisper candidates remain in `analysis/acoustic/`.

**Method:** Inspect the original mid waveform, mid spectrum, four band envelopes, and mid/side ratio. The ratio indicates spatial position only and does not isolate vocals. Broad views use 1024-sample Hann windows and 88-sample hops (~23.2 ms windows, ~2.0 ms hops). Close views use 512-sample Hann windows and 44-sample hops (~11.6 ms windows, ~1.0 ms hops). The hop is not the uncertainty of a physical onset. The proposed decimal times are encodable sample-grid choices within the reported intervals, not claims of millisecond perceptual precision.

The shared HTDemucs vocal estimate was used only to corroborate which original-mix feature belongs to a new vocal consonant or vowel. `analysis/acoustic/stem-clock.json` reports equal original/stem sample count 11469824 at 44100 Hz and zero best lag over 7–14.8 seconds (local correlation 0.560). No offset was applied. A separated stem can leak accompaniment or distort faint edges, so a stem-only event was not adopted.

## Onset proposals

| Word ID / text | Before (s) | Proposed (s) | Observed interval (s) | Basis / confidence |
| --- | ---: | ---: | --- | --- |
| KOM-001-s04 будет | 9.687234 | 9.610 | 9.595–9.625 | New low voiced entry after the preceding final frication has collapsed. medium-high; [zoom-01.png](onset-plots/zoom-01.png). |
| KOM-001-s05 ярче | 10.609342 | 10.460 | 10.445–10.475 | New periodic body starts after the preceding terminal stop burst; MMS initial symbol sits inside the sustained vowel. medium-high; [zoom-02.png](onset-plots/zoom-02.png). |
| KOM-001-s06 светить, | 12.112766 | 12.065 | 12.055–12.075 | New high-band frication precedes the later voiced body; same edge visible in the original mix. medium-high; [zoom-02.png](onset-plots/zoom-02.png). |
| KOM-001-s07 чем | 13.596122 | 13.565 | 13.555–13.580 | Abrupt new consonant burst/frication following an attenuated interval. medium-high; [zoom-02.png](onset-plots/zoom-02.png). |
| KOM-001-s08 кометы | 14.217551 | 14.195 | 14.185–14.210 | New release burst before the vowel; MMS marker falls in the burst tail. medium-high; [zoom-02.png](onset-plots/zoom-02.png). |
| KOM-003-s01 Из | 21.901678 | 21.325 | 21.300–21.355 | Quiet new voiced/harmonic entry grows into the held initial vowel; MMS begins near the vowel end. Earlier isolated high-band material around 21.00 is ambiguous. medium; [iz-entry.png](onset-plots/iz-entry.png). |
| KOM-003-s08 Юности | 29.813651 | 29.715 | 29.700–29.735 | Quiet new periodic/harmonic entry after a clear attenuation, before stronger later core. medium-high; [youth-entry.png](onset-plots/youth-entry.png). |
| KOM-004-s03 землёй | 41.608345 | 41.555 | 41.540–41.575 | New high-band consonant component after the preceding voiced word; original accompaniment and preceding stop create ambiguity. medium; [zoom-06.png](onset-plots/zoom-06.png). |
| KOM-005-s01 Словно | 44.322834 | 44.243 | 44.235–44.255 | New sustained high-band frication begins well before the MMS first-symbol event, followed by voiced entry around 44.43. medium-high; [zoom-07.png](onset-plots/zoom-07.png). |
| KOM-005-s03 словно | 47.812540 | 47.735 | 47.725–47.745 | New high-band frication, followed by distinct harmonic vowel entry around 47.89. medium-high; [zoom-07.png](onset-plots/zoom-07.png). |
| KOM-006-s01 Свети | 51.701224 | 51.655 | 51.645–51.670 | New high-band frication around 51.65, before a voiced vowel around 51.79. medium-high; [zoom-08.png](onset-plots/zoom-08.png). |
| KOM-006-s03 землёй | 55.286236 | 55.250 | 55.230–55.270 | New high-band consonant component, before the later harmonic body; overlapping accompaniment limits precision. medium; [zoom-08.png](onset-plots/zoom-08.png). |
| KOM-007-s01 Словно | 57.940816 | 57.885 | 57.875–57.900 | New sustained frication begins before the MMS symbol; subsequent vowel body starts around 58.06. medium-high; [zoom-08.png](onset-plots/zoom-08.png). |
| KOM-007-s03 словно | 61.429116 | 61.338 | 61.325–61.350 | New frication starts near 61.33, before later voiced onset; original mix also contains the edge. medium-high; [zoom-09.png](onset-plots/zoom-09.png). |

## Required preceding release correction

Advancing «будет» requires a separate correction to the preceding «погас» release. Its strong final frication occupies approximately 9.448–9.532 seconds and collapses by about 9.542 seconds. The subsequent weak tail is followed by the new voiced «будет» entry near 9.605 seconds. Proposed lexical release: **9.545 seconds**, interval 9.530–9.560, medium-high confidence. The baseline release 9.687234 includes an attenuated gap and reaches into the new word. This proposed release comes from the final-frication edge; it is not a clamp to the new onset. See [zoom-01.png](onset-plots/zoom-01.png).

## Starts for which this inspection does not justify an advance

«Тот» has its obvious release burst near 6.916 seconds; the baseline 6.901 is already early. The joined final-stop/initial-stop cluster in «Тот, кто» does not yield a secure earlier independent «кто» boundary. «погас» has a release around 8.31; adopting Whisper 8.06 would begin during the preceding «кто». The first three opening starts should therefore be retained within uncertainty.

KOM-002 «Пролетающие / над / планетой» and the remaining KOM-003 entries do not gain a secure earlier boundary from these plots. Several selected markers precede the obvious release or vowel body already. For «не» and «родится», adjacent voiced material makes a tight phoneme boundary uncertain; their absence from the change table is not an attestation that the current boundary is perceptually optimal.

«Лети» 37.821746 is close to the faint initial entry (~37.82–37.84). Both refrain «над» entries and all «орёл / огонь» vowel starts have continuous strong harmonics with no sufficiently distinct independent break in the original mix. Their MMS scores are weak in these cues, so these starts require the main acoustic alignment/review rather than a speculative shift from spectral energy alone. Wider retained diagnostics: [eagle-first.png](onset-plots/eagle-first.png), [eagle-second.png](onset-plots/eagle-second.png), [fire-first.png](onset-plots/fire-first.png), [fire-second.png](onset-plots/fire-second.png).

## Review correction and next integration step

The first broad plot initially suggested some 200–300 ms advances. Close original/stem inspection rejected that inference for «погас», «светить», and «чем»: much of the earlier energy belongs to the preceding word. The retained changes above use the individually identified new edge. In particular, the isolated faint high-band feature around 21.00–21.13 is not sufficient evidence for the «Из» onset; the new sustained vocal shape near 21.31–21.34 is the retained proposal.

Integrate only corroborated proposals, preserve separate lexical releases, and review disputed vowel transitions against the original source. Keep source onset, visual focus onset, and any animation ramp as separate quantities. This report makes no claim about the player’s eventual visible highlight latency. Machine-readable proposals: [proposals.json](onset-plots/proposals.json).

All operations were local inspection and owned evidence creation. No GitHub Actions dispatch, rerun, push, pull-request mutation, merge, trigger change, or publication was performed.

## Additional later-entry checks

Additional narrow diagnostics use the complete original mono decode `analysis/acoustic/mix44100.wav` and the same unshifted HTDemucs vocal estimate. These checks are not transferred from another repetition.

- **KOM-012-s01 «Лети»: 125.384127 → 125.275 seconds**, observed interval 125.255–125.300, medium confidence. A quiet new periodic/harmonic entry near 125.27 precedes the stronger body around 125.34–125.43. The original mix shows the same low-band growth. See [fly-second-entry.png](onset-plots/fly-second-entry.png).
- **KOM-020-s01 «Лети»: retain 173.362585 seconds within uncertainty.** Its marker is already before the clear new vocal harmonics around 173.40–173.42; the original drum event near 173.35 hides any faint initial consonant. The stem MMS 173.543 marker is inside the stronger body. Neither adopting that later core nor independently advancing the current point is supported. See [fly-third-entry.png](onset-plots/fly-third-entry.png).
- **KOM-008 «будет / снова»: disputed joint boundary.** The preceding vowel body continues to approximately 99.967 seconds. A continuous terminal-stop-to-fricative noise interval begins near 99.974 and persists to about 100.15. A start at 99.940 is rejected because it lies inside the preceding vowel. A joint lexical split near **100.000**, interval **99.985–100.020**, is plausible with medium-low confidence, but there is no independently distinct final-stop release and initial-fricative onset in this view. Any integration must explicitly review/select both word edges together. The current separate markers are previous release 100.031383 and next onset 100.071519. See [snova-cross-edge.png](onset-plots/snova-cross-edge.png).

The additional «Лети» point is a proposal; the disputed «будет / снова» split is a hypothesis, preserved separately in `proposals.json`. Neither is a human listening attestation.
