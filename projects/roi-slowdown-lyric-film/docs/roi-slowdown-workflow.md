# Exact next-song workflow

This is the reusable checklist for making the next dual-vocal lyric film correctly on the first render.

## Source lock

1. Query all YouTube formats before downloading.
2. Prefer the best true 60-fps stream at or below the target dimensions. If the only 1080p stream is an upscaled derivative, record that fact and keep the native stream available for comparison.
3. Download video, audio, metadata, and thumbnail into a source-only directory.
4. Record SHA-256, codec, dimensions, frame rate, audio sample rate, channel layout, frame count, and duration before any edit.
5. Never replace the source with an edited or normalized file.

## Two-song alignment

1. Decode the exact mixed audio once to a stable analysis format.
2. Run a general transcription and one forced pass per language. Treat transcripts as onset suggestions, not final truth.
3. Build two independent timing lanes. A line belongs to exactly one song, even when both songs are audible at the same time.
4. Mark section anchors first, then line starts and releases. Use waveform and spectrogram views to correct consonant attacks, phrase releases, repeated lines, and transitions.
5. Convert reviewed seconds to integer sample indices at the locked sample rate. Store line and word intervals, confidence, evidence, and source hash.
6. Check for same-lane overlap, reversed intervals, out-of-source samples, and missing evidence. Cross-lane overlap is allowed and expected.
7. Review at both 60 fps and 120 fps. The 120-fps proof is diagnostic only and must not change the public composition.

## Visual and render gates

1. Keep the two lanes stable and labeled throughout the piece.
2. Use one continuous, low-amplitude rail per lane. Avoid particle fields, jitter, dense bars, round caps, and competing markers.
3. Render a few representative frames before the full render: opening, first overlap, mid-song overlap, repeated chorus, and final release.
4. Render the 1920×1080 60-fps master with the locked source audio.
5. Render the 1920×1080 120-fps sync proof from the same timing authority.
6. Probe both outputs and strict-decode video and audio from beginning to end.
7. Inspect dimensions, cadence, frame count, duration, audio presence, pixel format, colour metadata, and fast-start metadata.
8. Generate a machine-readable QA report and SHA-256 checksums.
9. Copy to Desktop only after hashes are recorded and verified.
10. Publish the source metadata, alignment, workflow, QA, proof, master, and checksums with unambiguous Song 1/Song 2 names.

## Failure policy

If a line cannot be separated confidently from the mix, lower its confidence and preserve the evidence note. Do not silently invent a global offset or call a transcript “sample accurate.” Re-run the affected language pass or perform a local waveform review, then update only the affected line intervals.
