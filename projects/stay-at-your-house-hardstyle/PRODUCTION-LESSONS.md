# Production lessons — hardstyle trailer edition

## Let the source world supply the motion

For a track tied closely to a specific animated world, recognizable character movement, environments and physical action can provide a stronger visual connection than unrelated procedural geometry. Use an early style preview to evaluate that relationship before expanding asset production. A technically successful animation is not automatically an appropriate musical treatment.

## Edit to sections before adding more effects

Keep the vocal sections readable and reserve the largest picture change and spectrum travel for the electronic peaks. Selected footage should have a reason for its placement: movement at the entrance, scale during the peak, a visual release when the arrangement relaxes. Prefer short authored cuts and modest source retiming over long overlapping dissolves or arbitrary flashing.

Cut placement, lyric focus and spectrum measurements are separate decisions sharing one audio clock. Do not use bass attacks as inferred word onsets. Preview source motion at normal and reduced speed after seeking; time counters alone do not establish a moving picture.

## Give repeated drops a new visual development

A second musical peak needs its own progression. Reordering mostly identical footage can feel repetitive even when every cut lands on the grid. Audit source-time overlap, select distinct actions and vary shot duration according to the local arrangement. When a drop begins beneath the last sung lines, let closeups hold the emotional context before escalating into physical action. Reserve a quieter image for the musical release.

Review encoded clip heads and tails, not only source thumbnails: frame rounding can leak a neighboring shot or a promotional card into an otherwise clean selection. Bound retiming to retained source frames and compare encoded endpoints with the source. Check portrait crops throughout motion; a centered crop can show a weapon or empty ground while losing the character. Preserve an accepted section exactly when revising its counterpart.

## Measure both cut timing and action timing

A correct BPM does not establish the phase of the beat. Compare the edit grid with measured attacks over both drops. Record the detector, its resolution and residuals, and keep the distinction between signal evidence and listening. For this recording, refining the grid phase removed roughly 67 ms of systematic cut delay.

A cut on a beat can still contain movement that lands between beats. Select a limited set of meaningful movement frames and map those onto pulses inside the shot. Use the first retained source-frame timestamp after trimming, not merely the requested seek time. Choose output-frame rounding deliberately, then inspect the encoded pixels: source cadence, trim rounding and the FPS filter can otherwise move an accent early.

## Verify action onsets and reading space separately

Identify meaningful source events with the preceding and following frames. A brightness peak alone can be late relative to a flash onset; a body pose can be the intended movement accent even without a flash. Retiming can support more than one event within a shot, provided the source and output knots remain ordered. Use measured eighth-note attacks for repeated bursts when the arrangement supports them. Verify the first matching encoded frame, not just the edit formula.

Track actual browser appearances of cuts and movement accents, resetting measurements after each seek. Distinguish encoded placement, software presentation delay and physical audio/display latency. Good averages can conceal a late critical cut, and browser results are observations rather than an absolute device guarantee.

High-energy spectrum bars need a glyph-clearance audit over every lyric-visible frame. Geometry tests for words alone miss bars rising into descenders. Reserve the reading space with smooth approach/release outside cue visibility, preserving the spectrum shape and full instrumental reach.

## Select the picture by its timestamp

A video element's moving playback clock does not prove which frame was painted. Decode ahead, preserve actual decoded-frame timestamps and select a cached frame against the music clock. Keep the cache bounded and close released frames. Seek and recovery paths need separate checks, including repeated same-position seeks, quick transport changes and returning from the second edit to the first. A paused compositor may not emit another frame callback for an unchanged frame; capture the actual decoded frame after seeking as well. Preserve its native timestamp rather than assigning the requested seek time; see the [WebCodecs constructor specification](https://w3c.github.io/webcodecs/#videoframe-constructors).

Keep native-video lead correction separate from picture selection. Do not chase tiny clock differences with repeated visible seeks. Compare screenshots as well as timing telemetry, and document device/display latency as outside the browser timestamp measurement.

## Protect crops and short events

Portrait needs its own shot framing. Check moving characters through the shot, not only a centered first frame. Fade image edges continuously into reading areas, preserve complete phrases and reduce title clutter during action.

Short word candidates can disappear when rounded to the output frame grid. Reject conflicting candidate combinations that collapse a positive acoustic span, preserve valid source endpoints and audit the resulting visible frame count. Do not lengthen every short word arbitrarily.

Window edges can attract alignment failures, especially before a verse following a long electronic passage. Compare bounded and wider-context results, inspect obvious gap-spanning words and preserve uncertainty. More models do not replace listening, and raw CTC scores do not certify timing.

## Keep the preview boundary explicit

Silent footage edits and still images are preparatory assets. They do not authorize a full-song encode. Keep listening completion and current-revision render authorization separately bound to the actual media, timing and presentation hashes. Public notes should describe editorial decisions and evidence limits without personal quotations or private review details.

## Preserve the reviewed scene through deterministic output

A real-time preview has scheduling jitter; a final file should be composed at exact output frame times. Decode each prepared footage asset in order and supply the corresponding frame to the same reviewed drawing function. Bind renderer code separately from approved presentation inputs, preserve original audio packets and verify the encoded result. Check every timestamp and word state, image presence through both edits, and native-resolution checkpoints. Keep human acoustic review distinct from these software checks.

A complete handoff includes platform-specific videos, readable dedicated covers, credit-bearing upload copy, optional captions and a checksum-verified destination folder. The [full workflow](WORKFLOW.md) records the commands and evidence boundary.

Check explicit pixel-aspect metadata even when the dimensions look correct. If only an H.264 header field is missing, a stream-copy metadata correction can preserve the encoded image quality. Verify the complete decoded pixel stream before and after, then bind final verification receipts to the delivered container hash. Do not silently transfer proof identities without that equality evidence.
