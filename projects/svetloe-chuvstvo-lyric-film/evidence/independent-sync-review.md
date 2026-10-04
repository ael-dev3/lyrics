# Independent source-signal synchronization review

This pass reviews the original recording and its clock-verified vocal estimate. It proposes boundaries for **all 35 cue-final words**, plus four connected first-verse entrances, against the immutable initial mixed-audio MMS observation. The [proposal ledger](../source/independent-timing-review.json) retains integer samples, ranges, baseline values, observations and authored reading-window suggestions. The coordinator owns the canonical timeline and reconciles these proposals with the primary pass.

Source SHA-256: `9563b2098827fcf2ee18e0f1b573ded5f5e147be3faf258b5f2507162690a655`. Initial baseline SHA-256: `62d4e080bce8a8780c1f969505116e01677ab85529c6e6907ec5088d59bae922`. Both views use the unchanged 44,100 Hz source clock. The estimated vocal has the same sample count and zero measured lag, as established by the primary acquisition record.

**This is signal review, not a listening attestation.** No actual normal-speed or reduced-speed listening is claimed by this reviewer. Dense plot hops and exact sample storage do not establish unique millisecond phonetic boundaries. Waveform, spectrum and the separated estimate are complementary observations of the same recording. Existing MMS crop/stem variants remain correlated model evidence, not additional independent votes.

## Signal views

Nine independently annotated wide ending panels cover every occurrence, including the following phrase where present. Six targeted original/stem spectral views reopen the most consequential endpoints: `SV-001`, `SV-003`, `SV-009`, `SV-020`, `SV-030` and `SV-035`. Diagnostic plots and their generator are retained under `analysis/independent-sync/`; they are local analysis assets rather than rendered lyric-film evidence.

The spectral view uses the original left channel with a 1,024-sample Hann window, approximately **23.22 ms support**, and an 88-sample hop, approximately **1.995 ms**. The power view uses the mean of both channels' powers with 10 ms support, avoiding cancellation from averaging stereo waveforms. The estimated-vocal plot can contain accompaniment, reflected voice and separation artifacts. No amplitude threshold alone determines a word release.

## Material findings

The largest miss is the held `свет` in `SV-030`: both sparse model paths stop near 120 seconds, while changing harmonic body continues through approximately 123.5 seconds. The strong register lasts to about 122.03 seconds, followed by a softer changed body. The proposed exclusive focus end is **123.600 s**, preserving the softer trajectory. Its disappearance interval is **123.450–123.700 s**, but quieter/backing phonation versus reflected voice remains uncertain: the broader possible lexical ownership is **122.020–123.700 s**, with a competing strong-body endpoint near **122.030 s**. The stem alone cannot prove fresh singing throughout that weaker passage. Lower reflected decay follows; the complete neutral line may remain readable through 125.000 seconds and clear at 125.500 seconds. Focus and readability are separate decisions.

`SV-014` similarly has direct/terminal body beyond its 57.174-second mixed-audio core, approximately through 58.4–58.5 seconds. `SV-020` ends at the crop boundary in the baseline; its falling final glide extends through approximately 92.6 seconds. Several `искусство` cores stop inside the last vowel. Each occurrence has its own endpoint rather than a copied tail allowance.

The first `красив` mixed-audio endpoint overlaps the following `Всё`. Its main voiced body declines near 8.43 seconds. Weak later noise at 8.62–8.81 seconds could be breath or terminal frication, so that ambiguity remains explicitly unresolved. The 8.490-second candidate is not a claim that every later noise sample is silence.

An initially tempting strong-vowel-only cut for `стать` near 22.64 seconds was rejected after widening the view: quiet lower body and a late coda-like burst near 23.03–23.09 seconds remain. The proposed endpoint is 23.100 seconds, with uncertainty. This illustrates why removing a weak tail merely because the strongest harmonics stopped would recreate the earlier workflow's premature-ending failure.

## All cue-final endpoint proposals

These points are **independent candidates**, not approved canonical timing. Seconds below are readable labels; the ledger's integer samples are the unrounded storage. Intervals are qualitative source-ownership ranges, not calibrated statistical confidence.

| Cue | Word | Baseline end (s) | Candidate end (s) | Plausible interval (s) |
| --- | --- | ---: | ---: | --- |
| SV-001 | красив | 9.010 | 8.490 | 8.405–8.550; later frication/breath unresolved |
| SV-002 | сил | 15.820 | 15.840 | 15.760–15.900 |
| SV-003 | стать | 22.949 | 23.100 | 22.960–23.150 |
| SV-004 | стал | 29.888 | 29.900 | 29.860–29.940 |
| SV-005 | чувство | 33.679 | 33.720 | 33.680–33.760 |
| SV-006 | чувство | 37.400 | 37.420 | 37.390–37.460 |
| SV-007 | искусство | 39.179 | 39.420 | 39.380–39.460 |
| SV-008 | искусство | 41.009 | 41.150 | 41.110–41.200 |
| SV-009 | свет | 43.977 | 43.650 | 43.520–43.830 |
| SV-010 | чувство | 48.479 | 48.535 | 48.490–48.570 |
| SV-011 | чувство | 51.989 | 52.150 | 52.080–52.210 |
| SV-012 | искусство | 53.908 | 54.100 | 54.050–54.150 |
| SV-013 | искусство | 55.697 | 55.950 | 55.880–56.000 |
| SV-014 | свет | 57.174 | 58.460 | 58.380–58.550 |
| SV-015 | беде | 67.349 | 67.650 | 67.560–67.720 |
| SV-016 | те | 74.769 | 75.040 | 74.990–75.090 |
| SV-017 | рос | 78.639 | 78.700 | 78.630–78.760 |
| SV-018 | слёз | 82.510 | 82.550 | 82.490–82.610 |
| SV-019 | стеной | 86.249 | 86.280 | 86.220–86.330 |
| SV-020 | покой | 92.500 | 92.635 | 92.590–92.670 |
| SV-021 | чувство | 96.288 | 96.330 | 96.290–96.370 |
| SV-022 | чувство | 100.119 | 100.150 | 100.110–100.200 |
| SV-023 | искусство | 101.798 | 101.850 | 101.800–101.900 |
| SV-024 | искусство | 103.717 | 103.955 | 103.920–104.000 |
| SV-025 | свет | 105.645 | 105.780 | 105.630–105.810 |
| SV-026 | чувство | 111.169 | 111.210 | 111.170–111.260 |
| SV-027 | чувство | 114.919 | 115.150 | 115.100–115.200 |
| SV-028 | искусство | 116.598 | 116.660 | 116.620–116.710 |
| SV-029 | искусство | 118.487 | 118.550 | 118.500–118.600 |
| SV-030 | свет | 120.154 | 123.600 | 122.020–123.700; soft trajectory disappears 123.450–123.700 |
| SV-031 | чувство | 155.379 | 155.400 | 155.360–155.450 |
| SV-032 | чувство | 159.239 | 159.260 | 159.220–159.300 |
| SV-033 | искусство | 160.887 | 160.920 | 160.870–160.980 |
| SV-034 | искусство | 162.736 | 162.760 | 162.710–162.810 |
| SV-035 | свет | 164.867 | 165.025 | 164.990–165.090 |

## Connected entrances and paired ownership

The first verse has several quiet openings before strong character cores. The independently proposed `я` in `SV-002` begins at 11.875 seconds, and `иду` at 12.385 seconds, with the preceding releases paired to those exact handoffs. Initial s-like frication of `сил` begins around 14.455 seconds, before its 14.598-second vowel core. The quiet beginning of `Жить` is proposed at 16.325 seconds, before its 16.401-second core; unrelated earlier accompaniment does not establish an entrance.

The independent `иду` point differs by 20 ms from the primary 12.365-second proposal, and `сил` and `Жить` differ by 10 ms from the primary proposals. Their plausible intervals overlap. These differences are retained rather than presented as unanimous sample agreement. The `в` after the second `Мир`, and the first `Самое` near its crop boundary, remain wider ownership checks. A validator's non-overlap rule must not manufacture physical certainty.

## Reading and completion limits

Adjacent cues should remain neutral and fully readable through the next **reviewed** vocal entrance when there is insufficient room for a gentle fade. Their baseline neighbor times are only references; the coordinator must use final selected onsets. Do not introduce a midpoint blank, compress an exit into a few milliseconds, or lengthen bright focus solely to keep a line readable.

Long-gap proposals separate focus from neutral hold: `SV-009` hold/clear at 44.350/44.850 seconds, `SV-014` at 59.100/59.600, `SV-030` at 125.000/125.500, and `SV-035` at 166.000/166.500. These are authored readability candidates, not new acoustic observations or approved production settings.

Before production, resolve uncertain coda/breath ownership with actual audio at reduced speed and inspect the complete bilingual preview in both layouts. Verify the loaded timeline identity, first-active-frame opacity, immediate source-clock focus, paused redraw and line clearing. This pass does not certify those browser checks, full-song listening, render approval or final-file parity.
