# One-prompt starting point for cinematic lyric films

Use this guide to turn a recording and lyric reference into a complete, coherent preview with fewer preventable corrections. It joins the repository's existing timing, visual, review and delivery practices; it does not promise perfect alignment from one model or waive human review.

**Start with [AGENTS.md](../AGENTS.md), [preview before render](preview-before-render.md), [cinematic presentation](cinematic-lyric-workflow.md), [production preferences](track-workflow-preferences-and-known-issues.md), and [bilingual mapping](bilingual-lyric-workflow.md) when applicable.** The [If The Sun Burns Out Tonight handoff](../projects/if-the-sun-burns-out-tonight-lyric-film/AGENT-HANDOFF.md) is a concrete implementation; its [lessons](../projects/if-the-sun-burns-out-tonight-lyric-film/PRODUCTION-LESSONS.md) include exact targets, formulas, timings and limitations. Copy the method, then choose the new song's own visual language.

## A concise prompt for the next song

> Apply this repository's current workflow to [source URL] using the supplied lyrics below. Build the complete recording as a playable preview first, with [languages] and the original source aspect plus a deliberate 9:16 composition. Preserve every intended picture layer and the original soundtrack. Audit all performed words, repeats and the ending; use independent timing evidence and retain uncertainty. Keep word or meaning focus precise and glyph positions stable. Choose a new song-specific palette, measured visualizer and a few restrained word/phrase effects that match the lyrics, sound and imagery. Match reactive graphics to the picture's light, material and composition; keep glare and reflections subordinate to the subject and reading. Scale intensity to the actual arrangement. Compare complete previews with a simpler treatment at normal speed and realistic player sizes. Review every cue, effect boundary, seek/recovery path and both layouts. Show the complete preview from the beginning; do not render the full film until the current preview is approved. After authorization, render and verify both formats, prepare a new Desktop posting kit with platform copy and thumbnails, and finish the documented GitHub handoff through verified merge. [Lyrics]

Omit unneeded languages or formats instead of inventing them. Where the user has already approved the current preview and requested production, use that authorization within its stated scope. The prompt is a starting brief; any genuine unresolved source, lyric or approval issue remains explicit.

## Agent quickstart

1. **Inspect before copying.** Read the current rules, nearest relevant project and its failure lessons. Check repository state and available local media. Historical exports and old style choices are references, not defaults.
2. **Freeze the source contract.** Probe the actual audio/video, record hashes, duration, start times, codec priming, sample rate, frame cadence and original dimensions. Preserve supplied text separately. Record fonts and artwork provenance.
3. **Build the complete lyric map.** Audit audible coverage across the whole recording, including intro, gaps, repeated/backing phrases and outro. Separate acoustic candidates, chosen word events, semantic mappings and line visibility. Use stable IDs.
4. **Make a song-specific visual brief.** Choose the image treatment, palette, reading area, spectrum form and intensity. Use the [scene-integration guide](scene-integrated-visuals.md) to assign each layer a role, match the scene's visual conditions and plan a simpler comparison. Preserve the source frame when that best serves the footage; do not force 1920×1080 onto a wider source by habit. Compose portrait separately.
5. **Implement one clock and complete preview.** The original soundtrack is the authority. Derive lyrics, footage, analysis lookup and decoration from source time. Provide start, seek, reduced speed, both layouts and recoverable picture loading. Keep all intended visuals present.
6. **Review and freeze.** Inspect the full preview with audio, uncertain passages slowly, every repeated performance, every target effect and the ending. Record actual evidence scope and current input hashes; keep technical playback, listening, creative acceptance and production permission distinct.
7. **Render only the approved identity.** Enforce the current review/authorization gate before full capture or encoding. Prove the renderer matches the complete preview before running full length. Verify final encoded bytes, then assemble the requested kit and finish source integration.

## Match effects to meaning and sound

An effect earns its place when its absence makes a meaningful lyric or musical change harder to feel. It should leave the text readable and the source image coherent. Start with a small vocabulary of effects; the film need not illustrate every noun.

| Design question | Required record or check |
| --- | --- |
| What triggers it? | Exact token, phrase/context, measured section boundary or reviewed source event; stable IDs and all occurrences |
| What should not trigger it? | Near matches, unrelated pronouns, similar words and repeated contexts with different meaning |
| What is its lifetime? | Source-time start, exclusive end, attack/release, any justified decorative tail; never change a lyric timestamp to accommodate the effect |
| What drives its strength? | Explicit section tier or measured features from the locked source, with units and artistic transforms kept separate |
| Where does it live? | Measured glyph/word box or scene region, maximum travel, crop, safe area, preceding/following line clearance |
| What happens after a seek? | Same picture and effect at the same source time, no accumulated particles, stale classes or wall-clock phase |
| How do effects combine? | Explicit layer order and combined styles; confirm one CSS rule does not erase another |
| Does it fit this song? | Compare enabled/disabled at normal speed, quiet/strong passages and mobile/native size; check scene lighting, focal hierarchy and small-size payoff before adding detail |

For example, the Sun project gives solar hooks measured fire, a literal “light” a beam, and “you” that same beam only within a specific five-word phrase. “Void” combines two existing treatments explicitly. These illustrate exact matching and composition; they do not prescribe fire, gold or purple for another recording.

### Preserve reading stability

- Keep glyph position, size and weight fixed during focus changes. Add color/luminance and local atmosphere around the text. Avoid bounce, shake, word separation, boxes or underlines unless commissioned.
- Reserve the entire line geometry before focus; use neutral pre-roll when space permits. Reflow long text rather than compressing acoustic intervals or shrinking one language.
- Measure actual glyph boxes after fonts/layout resolve. Recompute anchors after a format or size change. Bound flames, rays, wisps and flecks against other text rows and important picture regions.
- For clipped transparent text fills, apply readability shadows behind the rendered glyphs. Review bright source frames and small displays; code-level color values alone do not establish contrast.
- For translations, highlight the smallest complete meaning, including necessary grammatical completions. Allow natural reading order and backward source-linked focus. Do not leave part of a phrase neutral or widen a group merely for convenience.

### Preserve musical contact without false precision

- Repeated words do not guarantee repeated audio. Align each performance; transfer timing only when measured sample relationships support it. Keep correlation's relative-timing claim separate from absolute phonetic certainty.
- Retain candidate disagreement and rejected model failures. A positive interval, sample integer or passing test is not proof of the sung onset or held release.
- Recognition systems can assign the preceding silence or decaying vowel to the next word. Agreement between several crops or stems of one recognizer is useful comparison, but is not independent model-family corroboration. Before moving a word by hundreds of milliseconds, inspect a second acoustic model, the actual consonant/vowel evidence and source-aligned energy. Do not choose the earliest candidate automatically.
- Distinguish the direct sung body, its quiet decay and a separate repeated word. A vowel-shaped tail does not by itself justify a new word or a full-strength held highlight. Review linked boundaries together: lengthening a short article must not steal the next noun, and shifting a short preposition may require shortening the preceding word. Preserve genuine pauses.
- Use measured energy to drive artistic intensity, not to assert a singer's emotion or classify screaming. Estimated stems are useful analysis inputs, with their leakage and provenance documented.
- Precompute feature values and, for changing motion rates, their source-time integral. Lookup is deterministic under seeks and reduced playback speed. Avoid integration from browser elapsed time and avoid `time * changingRate` phase jumps.
- Document analysis-window support. A centered spectral window uses nearby samples on both sides; it can support a musical display without certifying a sharp beat or syllable boundary.
- Calibrate each track's useful frequency range and dynamic range. Respect quiet sections. Use measured peaks or reviewed energy tiers for stronger sections; do not keep every layer at maximum reach throughout the film.

## Complete-preview quality checklist

- [ ] Entire original soundtrack, picture/artwork, lyrics, spectrum, intended animation and ending are present.
- [ ] Fresh load opens at the beginning with obvious play/restart, duration and recovery controls.
- [ ] A known nonblack source frame and actual motion are visible in each format after load, seek, pause/resume, format switch and recovery.
- [ ] Recovery retains source position, speed and review state. Missing data or media produces an actionable visible error.
- [ ] Foreground callback chains cancel on transport changes; native decoder drops and foreground presentation gaps are measured separately.
- [ ] Source aspect and portrait framing preserve the approved content; no accidental crop, caption extension, black dropout or frozen poster remains.
- [ ] Every performed word/repeat is accounted for; every displayed word has a justified focus event or intentional-neutral rationale.
- [ ] Every cue fits at native and mobile size. Active/rest contrast and bilingual emphasis remain readable over actual source extremes.
- [ ] Every effect is checked before onset, during contact, at release and after release, in both formats and reverse/nonsequential seeks.
- [ ] Phrase selectors have positive and negative cases. Combined effects coexist; short words retain a visible but bounded envelope.
- [ ] Quiet, strongest and wrapped-text passages preserve intensity hierarchy and clearances.
- [ ] Complete-preview A/B review at realistic player sizes confirms that spectrum emission/reflections support the scene and primary effects communicate without competing with text or subject. Record display sizes and the artistic decision separately from timing evidence.
- [ ] Complete normal-speed listening, uncertain-event reduced-speed review and requested layouts are documented with the actual reviewer/method; model or muted tests are never labeled listening.
- [ ] A representative screenshot is identified as a browser preview or a decoded final frame, with correct source attribution and timestamp.

An isolated diagnostic is useful when labeled and kept alongside the complete preview. It must never silently replace the review experience. Technical limitations should be repaired or clearly marked before handoff, not hidden by removing the affected visual layer.

## Approval, rendering and final verification

Freeze the complete input identity: source audio/video, lyrics, timing, semantic maps, feature data, fonts, scene/effect code, preview composition and relevant compiled assets. Record the renderer identity separately. A material change requires affected review and refreshed hashes; preserve earlier reports as historical evidence.

Production entry points must reject missing, incomplete or stale required review/authorization. Keep preview and full-render commands distinct. A complete current-scope reviewer attestation is evidence; do not invent granular logs or repeatedly ask for already-established permission. Resolve missing facts rather than silently weakening the gate.

For a new renderer or scene change, compare the approved browser and renderer at the same source times in each format. Include clipped text, glow, composed shadows, blur, spectrum peaks, source crop boundaries and the clean ending. Record the actual resolved font and environment; fallback fonts, ignored SVG attributes or different blur/blend semantics can alter the result while structural checks still pass. Validate short encoded proofs before expensive full-length work.

Check final files at three levels:

1. **Container and soundtrack:** full decoding, dimensions/aspect, duration, frame count/cadence and timestamps, color metadata, audio packets/priming or documented intentional processing, decoded PCM and checksums.
2. **Rendered content:** every-word focus where practical, empty-gap states, source-picture continuity, effect presence and cleanup, lyric clearance, bright/dark passages, original intro and ending. Use negative controls for automated image/focus checks to show that a known timing shift or missing layer is actually detected.
3. **Delivery identity:** decode representative stills from the verified bytes; assemble platform-specific videos, copy, covers and optional captions; rehash the copied files at their destination. Record any verification limitations plainly.

The default posting kit includes a YouTube title and description, a TikTok description, both requested video compositions, a YouTube thumbnail and a separate **1200×1600 portrait TikTok profile cover**, reviewed at 150×200. Covers are promotional assets, not substitutes for README film screenshots. Preserve prior deliveries when issuing a corrected edition.

## Leave a useful repository handoff

Keep the public record operational and neutral: exact source identity, timing methods and uncertainty, current visual/effect contract, reproduction commands, review scopes, final properties/checksums, screenshots, known limitations and reusable lessons. Omit private quotations, personal ratings, account paths, conversation transcripts and machine-specific temporary locations.

Review the final diff, run applicable checks, resolve blocking findings, merge authorized source changes and verify the default branch and relevant remaining pull requests. Preserve source commits referenced by immutable archives. Public binary publication and platform posting require their own authorization; source integration does not imply either.

For later storage cleanup, follow [storage and recovery](storage-and-recovery.md): verify remote coverage and an actual restore before deleting unique local inputs, retain reproducible commands and metadata, and honor protected Desktop kits. A hash list without downloaded-byte verification is not a tested recovery path.
