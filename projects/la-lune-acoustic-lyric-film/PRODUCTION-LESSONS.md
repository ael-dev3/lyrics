# Lessons from the lunar acoustic edition

## Build the visual identity around this recording

A single large lunar subject, cold silver colors and centered sans-serif lyrics form a distinct identity for the acoustic arrangement. The composition works in both aspect ratios without copying another film's panel layout or importing its intensity schedule. Shared workflow knowledge should transfer through source verification, translation discipline and review tools; the visual concept can start afresh.

## Give motion a musical purpose

The scene uses a gradual introductory reveal, restrained vocal-responsive moonlight, a compact radial spectrum and short instrumental ripples. Each has a separate driver and bounded range. Fixed stars and a steady lunar disc support the mood. A long instrumental outro can remain visually complete with the subject, measured response and title; it does not need invented lyric events or repeated camera gestures.

The instrumental ripple's exclusion window must account for its full lifetime. A 400 ms lead guard allowed the faint tail of a 650 ms ripple to reach a vocal entrance. An 800 ms guard resolves this, and an all-frame regression test now checks that the ripple is absent during lexical passages. Check effect tails, not merely trigger timestamps.

## Separate evidence from authority

Bounded original-mix and isolated-vocal alignments can disagree even when most words align closely. Window-edge starts, soft consonants and held vowels are common causes. A third model is useful for finding disagreements; it is not a vote that automatically replaces the selected event. Preserve alternative candidates and uncertainty, and avoid a blanket time shift.

English grammatical completions should share the source event they express. Reordered adjectives retain their own word links; a multi-source expression follows the union of its participating events. A complete all-frame audit checks the expanded target meaning as well as the source lane.

## Verify the actual encoded colors

The prior warm-color classifier does not apply to a cold lunar palette. Here the checker compares median RGB values inside eroded glyph masks with the frozen pearl-active and blue-inactive colors. It fails ambiguous samples rather than silently omitting them. A shifted-timeline negative control demonstrates error detection before using the method on full deliveries.

## Protect the audio clock across segment joins

Feature extraction uses the recording's actual 44.1 kHz sample rate. Rendering uses global 60 fps frame indices. Segment concat durations come from differences of rounded global boundaries, and final verification checks every frame timestamp plus original AAC packets and decoded PCM. These are distinct checks: a matching video duration alone cannot establish synchronization.

## Keep acceptance records honest

Record the accepted revision and explicit production instruction without publishing personal feedback. Preserve unknown granular listening fields. The owner-approved production record and technical verification do not assert that every acoustic boundary was heard and certified by the agent.

## Cache expensive artwork without weakening validation

A mostly fixed scene can retain Chromium-rasterized artwork and text in a small lossless layer inventory while recomputing the measured animation on each global frame. This avoids rerasterizing the Moon and every glyph thousands of times. Validate the alternative renderer against the approved scene at full supersampled resolution; report small antialiasing differences numerically rather than calling it pixel-identical. Compare encoded lyric colors too, and bind every layer hash and source input before production. Do not reuse this optimization for a scene whose moving masks, transforms or blending are absent from the cache model.

Native canvas buffers do not necessarily trigger JavaScript heap collection promptly. Periodic collection improved speed but was insufficient for the full run. Long exports require a fresh process per completed segment and a single full-resolution worker under constrained memory, even when a short diagnostic is fast. Verify sustained resident memory and retain per-segment hashes so interruption does not invalidate completed work. This runtime safeguard changes resource reclamation, not frame data.
