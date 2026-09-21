# Editorial lessons — hardstyle trailer preview

## Let the source world supply the motion

For a track tied closely to a specific animated world, recognizable character movement, environments and physical action can provide a stronger visual connection than unrelated procedural geometry. Use an early style preview to evaluate that relationship before expanding asset production. A technically successful animation is not automatically an appropriate musical treatment.

## Edit to sections before adding more effects

Keep the vocal sections readable and reserve the largest picture change and spectrum travel for the electronic peaks. Selected footage should have a reason for its placement: movement at the entrance, scale during the peak, a visual release when the arrangement relaxes. Prefer short authored cuts and modest source retiming over long overlapping dissolves or arbitrary flashing.

Cut placement, lyric focus and spectrum measurements are separate decisions sharing one audio clock. Do not use bass attacks as inferred word onsets. Preview source motion at normal and reduced speed after seeking; time counters alone do not establish a moving picture.

## Measure both cut timing and action timing

A correct BPM does not establish the phase of the beat. Compare the edit grid with measured attacks over both drops. Record the detector, its resolution and residuals, and keep the distinction between signal evidence and listening. For this recording, refining the grid phase removed roughly 67 ms of systematic cut delay.

A cut on a beat can still contain movement that lands between beats. Select a limited set of meaningful movement frames and map those onto pulses inside the shot. Use the first retained source-frame timestamp after trimming, not merely the requested seek time. Choose output-frame rounding deliberately, then inspect the encoded pixels: source cadence, trim rounding and the FPS filter can otherwise move an accent early.

## Select the picture by its timestamp

A video element's moving playback clock does not prove which frame was painted. Decode ahead, preserve actual decoded-frame timestamps and select a cached frame against the music clock. Keep the cache bounded and close released frames. Seek and recovery paths need separate checks, including repeated same-position seeks, quick transport changes and returning from the second edit to the first. A paused compositor may not emit another frame callback for an unchanged frame; capture the actual decoded frame after seeking as well. Preserve its native timestamp rather than assigning the requested seek time; see the [WebCodecs constructor specification](https://w3c.github.io/webcodecs/#videoframe-constructors).

Keep native-video lead correction separate from picture selection. Do not chase tiny clock differences with repeated visible seeks. Compare screenshots as well as timing telemetry, and document device/display latency as outside the browser timestamp measurement.

## Protect crops and short events

Portrait needs its own shot framing. Check moving characters through the shot, not only a centered first frame. Fade image edges continuously into reading areas, preserve complete phrases and reduce title clutter during action.

Short word candidates can disappear when rounded to the output frame grid. Reject conflicting candidate combinations that collapse a positive acoustic span, preserve valid source endpoints and audit the resulting visible frame count. Do not lengthen every short word arbitrarily.

Window edges can attract alignment failures, especially before a verse following a long electronic passage. Compare bounded and wider-context results, inspect obvious gap-spanning words and preserve uncertainty. More models do not replace listening, and raw CTC scores do not certify timing.

## Keep the preview boundary explicit

Silent footage edits and still images are preparatory assets. They do not authorize a full-song encode. Keep listening completion and current-revision render authorization separately bound to the actual media, timing and presentation hashes. Public notes should describe editorial decisions and evidence limits without personal quotations or private review details.
