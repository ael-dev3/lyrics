# First-act precision and calm visualizer design

## Objective

Create a `v2.1.0` revision that makes the first vocal act (`C1`, 24.194–49.238 seconds) feel visibly tighter while preserving the approved second act (`V1` and `C2`). Make the bottom spectrum calmer and easier to watch throughout the film without weakening its measured audio response.

## Evidence and root cause

The reviewed alignment remains sample-indexed and frame-bounded. No evidence indicates that the stored C1 sample boundaries should be replaced.

The visible focus envelope is the timing problem. Every cue currently spends three rendered frames reaching full emphasis and remains fully emphasized on the exclusive end frame before fading for another frame. C1-04-C01 lasts only 2,646 samples / 60 ms / four public frames, so 75% of its visible lifetime is attack ramp. The residual emphasis then survives beyond the reviewed cue. Later C2 cues are at least 200 ms, so the same envelope is much less noticeable there.

The spectrum receives 64 raw per-frame band bytes and raw impact directly. It has no temporal or neighboring-band smoothing, uses hard frequency color blocks, and renders crisp-edged 9 px bars. The result is accurate but visually busy, especially in dense first-act passages.

## Chosen approach

Keep the reviewed alignment authority unchanged. Add a presentation-only focus profile to each lyric line:

- C1 lines use `precision`: full emphasis on the nearest cue-start frame, no emphasis before that frame, contact and emphasis both end on the exclusive cue-end frame, and no post-cue tail.
- V1 and C2 lines use `cinematic`: retain the existing three-frame attack and two-frame release exactly.
- C1 inactive text receives slightly lower luminance and its active state uses a tighter, less diffuse glow, making the active segment easier to identify without changing layout or text positions.

Add a dedicated visualizer smoothing stage:

- temporal kernel: symmetric five-frame weights `[1, 2, 3, 2, 1]`;
- spatial kernel: symmetric five-band weights `[1, 2, 3, 2, 1]`;
- edge handling: clamp to the first or last available frame/band;
- impact uses the same temporal kernel;
- output remains 64 integer byte bands, so the existing measured 96 px core and 18 px maximum impact cap remain valid;
- symmetric temporal weighting avoids phase delay at transients.

Render the smoothed values as 7 px rounded bars with more space, lower baseline/tick contrast, softer impact caps, and a continuous ember–teal–mint progression. Background, atmosphere, lyric geometry, audio, and the second-act focus profile remain unchanged.

## Components and data flow

1. `timed-lyrics.ts` derives a `focusProfile` from the reviewed line ID.
2. `LyricDisplay.tsx` passes that profile to `getSegmentFocusState` and selects profile-specific visual contrast.
3. `focus-state.ts` computes either the existing cinematic envelope or the exact precision envelope from the same reviewed cue samples.
4. `spectrum-smoothing.ts` reads neighboring deterministic feature frames and returns smoothed bands and impact.
5. `LyricFilm.tsx` computes one smoothed spectrum state per feature frame and passes it only to `SpectrumRail`; all other visual layers retain the raw feature frame.
6. `SpectrumRail.tsx` renders the calmer geometry without changing the safe-area footprint or measured maximum travel.

## Verification

- Tests prove every C1 cue is inactive one frame before contact, fully emphasized on contact, and inactive at its exclusive end.
- Existing V1/C2 cinematic focus snapshots remain byte-for-byte equivalent.
- Smoothing tests prove constant signals are preserved, impulses remain centered, edge access is clamped, integer bounds remain 0–255, and spatial roughness falls on alternating-band input.
- Markup tests prove 64 measured bars and 64 impact caps remain present with rounded 7 px geometry.
- QA media adds C1-04 contact frames and public/proof contact sheets because it contains the shortest reviewed cue.
- The full typecheck, test suite, browser layout verifier, composition discovery, media decode, codec/colour checks, AAC packet identity, and repeated release QA must pass.
- A fresh production master and 120 fps proof are published under `v2.1.0`; `v2.0.0` remains unchanged.

## Public claims

The timing claim remains “sample-indexed alignment with frame-bounded rendering.” The v2.1 notes additionally describe C1 as using an immediate-contact presentation profile and the spectrum as zero-phase temporally and spatially smoothed. No claim is made that video frames can represent sub-frame visual changes.
