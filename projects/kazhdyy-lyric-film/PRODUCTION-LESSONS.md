# Production lessons

## Arrangement controls the visual hierarchy

The spectrum's normal, medium and strongest sections are an explicit artistic score. A local vocal peak does not override those boundaries. Keep raw frequency measurements separate from the artistic height budget, and verify every boundary frame so emphasis cannot spill into adjacent quiet material.

The accepted schedule is medium at 1:10–1:28 and 2:38–2:55, strongest at 2:55–3:10, and normal elsewhere. Transitions occur inside those intervals. The original illustration geometry and equal bilingual reading positions stay fixed.

## Give shadow movement a narrow purpose

Brief grain changes inside broad dark interiors create vocal contact without shifting the picture. Detect spectral changes from the vocal analysis, space events, show only a few deterministic grain states, then hold. Exclude colored landmarks and erode the source-dark mask to protect edges. Preserve the source palette and keep this decorative map independent of lyric meaning and timing.

The current map has 384 acoustic events and 1,153 unique grain states including the initial state. These are signal-derived artistic events, not speaker labels or recognized phonemes. Stem leakage and uncertain acoustic word boundaries remain distinct limitations.

## Preserve the reviewed pixels while making rendering practical

Repeated SVG turbulence and masking are expensive at the 2× capture resolution. The production adapter rasterizes only the artwork panel once per unique state, then uses the approved persistent painter for spectrum geometry, bilingual focus, title visibility and ending opacity.

The comparison is stronger than a visual impression: direct and cached 120-frame ProRes diagnostics are byte-identical in both layouts. Their decoded pixels have zero difference in every channel. The pipeline verifies cache recipe and file hashes before each video segment. Small 24-state preparation batches bound retained filter surfaces; completed image hashes support safe resume. Hardware acceleration must be compared before adoption; the tested alternative changed pixels and was rejected.

This is a representation change within the production adapter. It does not alter the approved preview's source audio, typography, layout, word samples, semantic spans, palette or dynamics.

For long local runs, keep the host awake for the lifetime of the renderer and verify that frame progress remains continuous. Idle-sleep prevention alone did not prevent brief maintenance wakes followed by sleep in this run. A temporary full-wake assertion restored continuous rendering. Browser failures and artwork-request timeouts were recovered by restarting only the owned render processes and resuming segments whose recipe, frame range and file hashes still matched. A bounded watchdog prevents an error from leaving the pipeline silently stalled. An unfinished capture is never accepted merely because its output file exists; final verification still covers the assembled film.

The project wrapper for POSIX hosts is `node scripts/resume-production.ts landscape` (or `portrait`). Run only one supervisor per format at a time. It enforces the same authorization, allows at most eight attempts per invocation, preserves its attempt history, and terminates only the process group it created. On macOS, a temporary `caffeinate -disu -t 10800` wrapper can protect a three-hour work period; verify continuous progress and use a duration appropriate to the job. Do not change permanent power settings as part of the film workflow. Run final verification after successful assembly regardless of how many attempts were needed.

## Verify the actual delivery

Segment container durations are not a reliable master clock. Two portrait segments reported 13.333000 seconds for 800 frames at 60 fps, instead of the exact 13.333333… interval. Default concatenation inherited that rounding, and the full-frame timestamp check rejected the assembly at frame 1599. `scripts/assemble-delivery.ts` supplies durations from differences of rounded global frame boundaries, avoiding both millisecond metadata rounding and accumulated per-segment rounding. It stream-copies all 12,798 encoded video packets and checks that their payloads remain identical. The original AAC is copied independently. Run this assembly stage for both formats before final verification; no picture re-encoding or audio retiming is involved.

Check every final video timestamp and frame count, metadata and strict decode. Compare every original AAC packet payload and timestamp plus the complete decoded PCM identity. Decode the video and inspect the expected state of every displayed Russian and English word, using bundled-font glyph interiors and the actual colors.

A deliberately incorrect 100 ms diagnostic offset produced 92 highlight mismatches, confirming that the decoded-focus check can detect a timing error. Passing the correct offset proves agreement with the approved event map; it does not measure acoustic truth or complete an unknown listening checklist.

Use decoded final-film frames for README illustrations, and keep promotional cover adaptations separate. Preserve the cover prompts, selected originals, export dimensions, small-size review and local crop checks. Verify every file again after copying the final upload kit to its destination.

## Approval and identity

Production follows explicit approval of `preview-v6-shadow-static`. Earlier approvals belong to their own revisions. The authorization binds unchanged preview hashes and the production adapter; overall acceptance remains separate from incomplete per-cue actual-audio telemetry. The default preview-first and full synchronization-review requirements remain unchanged for future work.
