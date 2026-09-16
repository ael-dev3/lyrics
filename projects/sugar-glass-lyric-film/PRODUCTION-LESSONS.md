# Sugar Glass production notes

## Approval and identity

The English-only **preview-v2-english** was accepted and full landscape/portrait rendering was explicitly authorized on 16 September 2026. The original preview identity and incomplete detailed listening record are preserved in `evidence/approved-preview-identity.json` and `evidence/pre-render-review.json`.

This is an **owner-approved preview**, not a new claim that every listening checklist item was recorded. Granular normal-speed, slow-speed and format review fields remain null. The supplied-wording questions and acoustic-model spread remain documented. Final technical verification establishes delivery integrity and displayed highlight behavior against the accepted event map; it cannot establish acoustic truth.

The production gate binds this scoped acceptance to the song, preview revision, authorization ID and current input hashes. Missing authorization, changed inputs, another revision, an incomplete cue inventory or confirmed blocking defects are rejected. The repository's default full review requirement remains in place for future work; this record does not create a general approval shortcut.

## A single language leaves useful compositional room

The English-only treatment uses large, stable verse lines, stronger chorus scale and oversized refrain lines. Backing declarations retain their own lane. The extra space supports a broader, reflective spectrum without changing word positions or their timing.

The visualizer follows the current recording's arrangement: the chorus and post-chorus expand, while the bridge and ending recede. Preserve this distinction between measured audio, artistic display transforms and lyric events. A more expressive visualizer should not require synthetic beats, per-frame normalization or moving individual words.

The design applies the Lyrics workflow in general and the current source imagery. No particular earlier song is presented as its design inspiration.

## Production adapter

- Capture each format at 2× using PNG frames and ProRes 4444 references. Twelve contiguous frame ranges bound temporary storage and permit verified restarts.
- Retain the complete 13,881-frame, 60 fps timeline. Source footage keeps its original 25 fps cadence. It is not interpolated into new photographic detail.
- The source picture ends slightly before the audio. Clamp its clock to 231.266667 seconds, within the final 25 fps picture interval, for the remaining four output frames. This reproduces the browser's last-picture hold without seeking beyond the file.
- Downsample once with Lanczos, then encode HEVC Main 10, medium preset, CRF 17, BT.709 limited range and `hvc1` tagging. Copy original AAC packets into the delivery container.
- Hash every capture segment and record its global frame range. Cache reuse requires the same input fingerprint, range and file hash. Do not resume from an unverified partial segment.
- Freeze the approved scene, lyrics, layout, font, raw spectrum and audio while rendering. Documentation and verification code can be completed separately.

## Verification boundaries

Short landscape and portrait diagnostics exercise native-size glyph interiors and independent vocal lanes before full capture. Final verification must cover both complete files: strict decoding, frame timestamps/count, stream metadata, fast-start structure, source audio packet identity and decoded word colors.

The decoded-focus audit uses the bundled font to select glyph-interior pixels. Median red-minus-blue separates warm active words from neutral inactive words. Inspect mismatches; do not adjust the threshold merely to obtain a pass. This method checks emitted color states against the event map, including gaps and simultaneous lead/backing cues. Listening remains a separate form of evidence.

Inspect representative decoded final frames and both sides of every segment join. Include the title transition, large refrain, long chorus lines, backing overlaps, final vocal and complete tail. Derive README screenshots from identified final bytes after verification, and retain preview screenshots as historical evidence.

## Handoff

Publish source, neutral decisions, small visual evidence and delivery checksums to the repository. Keep full media local unless publication is separately authorized. Verify the diff and checks, merge the completed pull request, then verify the default branch and remaining open pull requests.
