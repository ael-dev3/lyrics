# Acoustic proposal status

This pass supplies the complete **preview candidate**, not an approved listening log.
No normal-speed or reduced-speed human listening attestation is made here. No song
production render was performed by this contributor.

## Fixed recording and clock

- Original source SHA256: `9563b2098827fcf2ee18e0f1b573ded5f5e147be3faf258b5f2507162690a655`.
- Native decoded audio: 44,100 Hz, stereo, 7,796,160 samples, 176.783673469 s.
- Original video: square, 25 fps, 4,419 frames, 176.76 s. Container/AAC duration
  reports differ slightly from decoded sample extent; neither warrants a clock shift.
- HTDemucs vocal and accompaniment estimates keep the same decoded extent. Five
  broad original/reconstructed and original/vocal correlation windows peak at zero
  lag. Separation is an access aid, never replacement source audio.

## Discovery before conditioning

The full unprompted large-v3-turbo pass omitted most of the first verse and
hallucinated subtitle-credit text in the later instrumental section. Its output
could not establish complete inventory. Bounded unprompted small-model views of
the opening original and aligned vocal estimate recovered the supplied first
verse; a bounded ending view recovered the last hook separately. No timestamp
was borrowed from a previous refrain or another song.

The selected inventory contains **35 performed cue occurrences and 175 source
word events**. All `самое` repeats and the two `огромной` occurrences are separate
events. `когда-то` remains one lexical compound. Targeted river-line small and
turbo passes both retained the short `и`, while confusing the preceding initial
consonant; neither established a defensible replacement for supplied `парник`.

## Placement and ownership

The first complete mixed-audio MMS candidate is frozen in
`analysis/acoustic-pass/mms-mix-frozen-baseline.json` (SHA256
`62d4e080bce8a8780c1f969505116e01677ab85529c6e6907ec5088d59bae922`).
MMS original/stem observations and Whisper phrase attention are preserved as
competing placements. MMS variants are correlated and must not count as separate
model-family votes.

Every occurrence has an original/estimate waveform and spectral panel. Narrow
panels inspect connected first-verse words, the first `Самое` in several cycles,
and the final `на то кем я стал` chain. Selected onsets assign quiet consonant
leads instead of waiting for the bright vowel core. Neighboring releases are
paired when the sung body is connected; genuine quiet gaps remain unhighlighted.

Attention sometimes assigns the last syllable of `котором` to the next `я` or
the held `ри` of `смотри` to `на`. The local source structure rejects those early
placements. Conversely, the first `Самое` of SV-010 has a sustained s-like prefix
around 44.85 s before its 45.07 s sparse core. These decisions are local and do
not justify a universal anticipation offset.

All 35 cue-final body/release proposals were independently reviewed in
`source/independent-timing-review.json`, then reconciled with the primary panels.
The first `красив` must stop before the following `Всё`; its 9.010 s sparse end
crosses the next onset. Sparse ends also cut several `искусство` vowels and the
held `свет` at SV-014. Bright lexical focus and neutral reading holds are separate.

## Material limits

- Quiet first-verse function words and the `котором → я` transition retain
  qualitative ownership ranges.
- SV-004 `на / то / кем / я / стал` contains genuine brief closures and requires
  listening judgment alongside the narrow panel; early attention edges were rejected.
- SV-016 has uncertain connected `ветхой` and first-syllable `рядом` ownership.
- Supplied `парник и` remains selected pending actual articulation judgment.
- Late coda/breath/reflected material affects `красив`, `стать`, several `свет`
  releases, and the final quiet pulse in SV-035.
- SV-030 has secure strong high-register body to about **122.03 s**. A softer
  changed voice-shaped trajectory disappears around **123.45–123.70 s**, but fresh
  quiet/backing phonation versus reflected voice remains unresolved by signal views.
  Preview focus ends at **123.60 s**, with broader possible lexical ownership
  **122.02–123.70 s** retained. Neutral readability to 125.0 s and a fade to
  125.5 s are authored holds, not additional direct singing.

Integer native sample storage, ~1.995 ms plot hops, and 23.22 ms spectral support
do not establish unique physical or perceptual millisecond boundaries. Preserved
model scores are uncalibrated character confidence, not timing-certainty probabilities.

## Handoff

`source/russian-timing-proposals.json` contains all events, evidence references,
qualitative ranges, separate reading-hold proposals and compact listening priorities.
`source/selected-word-decisions.json` preserves the before/after sparse baseline for all
175 events. The local `analysis/acoustic-pass/selected-structural-checks.json` verifies source identity, source-token
coverage, positive native-sample spans, IDs, event order and repeated-word inventory.

The coordinator must review the actual complete preview, translation contributors,
both layouts and playback/source-clock behavior. Owner listening still needs the
full recording at normal speed and uncertain words/held endings at reduced speed.
This acoustic contributor did not edit the canonical timeline, scene or player and
did not perform Git/remote mutations.
