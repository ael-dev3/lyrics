# Кометы — workflow implementation study

## Scope and evidence

This is a local preparation study for the complete recording identified by YouTube ID `76BmuIf0duw`. It records reusable implementation decisions from the current repository. It is not listening approval, a claim of completed acoustic review, or production authorization. Source-specific visual recommendations remain provisional until the actual source picture is inspected.

The current task is the preview stage. No full lyric-film capture, encoding, public media release or platform posting is authorized by this record.

## Current rules read

- `AGENTS.md`
- `docs/preview-before-render.md`
- `docs/cinematic-lyric-workflow.md`
- `docs/source-clocked-word-effects-workflow.md`
- `docs/scene-integrated-visuals.md`
- `docs/track-workflow-preferences-and-known-issues.md`
- `docs/bilingual-lyric-workflow.md`
- `docs/cross-language-sync-gate.md`
- Current README and relevant implementation files in `must-have-been-a-dream-lyric-film`, `take-me-there-lyric-film`, `vedmy-lyric-film`, `la-lune-acoustic-lyric-film`, and `lyubi-menya-lyubi-lyric-film`
- Editorial lessons in `pero-es-locura-lyric-film/PRODUCTION-LESSONS.md` and selective motion lessons in `kazhdyy-lyric-film/PRODUCTION-LESSONS.md`

Current cinematic rules supersede historical typography defaults: stable glyph positions, readable active and inactive text, color/luminance focus, equal bilingual prominence. Word underlines, pills, boxes and bouncing lettering are not defaults. Earlier artworks, palette choices, motion tiers and named-word effects are recording-specific references.

## Reusable implementation map

Paths below are relative to the repository root.

| Need | Existing module | Reuse boundary |
| --- | --- | --- |
| Complete source-video player | `projects/must-have-been-a-dream-lyric-film/src/player.ts` | One native video owns soundtrack and decoded picture. Includes seek, restart, cue navigation, layout switching, reduced speeds, source comparison, snapshot download, recoverable load/draw errors and Restore preview. Replace the song identity, dimensions, source-frame rate, seek tolerance and frame-index arithmetic. |
| Byte-range local server | `projects/must-have-been-a-dream-lyric-film/scripts/preview-server.ts` | Supports GET/HEAD, exact ranges, no-store and public-asset allowlisting. Do not expose analysis/source directories or reuse its port/title silently. |
| Canvas source composition | `projects/take-me-there-lyric-film/src/scene.ts` | Draws each decoded source frame, then measured environmental light and text. Its reusable separation is geometry / feature lookup / picture-light masks / lettering / primary visualizer. Do not copy the previous song's 28-shot map, colors, region masks or output footprints. |
| Stable primary visualizer | `projects/take-me-there-lyric-film/src/scene.ts`, `fixedSpectrum`, `reserveSpectrum`, `spectrum` | Fixed footprint per format while lyric positions may respond to shot negative space. Protect its maximum reach and a reading gap. Secondary source-light masks have independent envelopes. Use this pattern only if the current picture benefits from an explicit spectrum. |
| Source-owned visualizer without a bar graph | `projects/must-have-been-a-dream-lyric-film/src/scene.ts` | Measured response can inhabit filmed lamps, glints and sung lettering. Its masks, source-derived bridges and active-picture y-range are specific to that official video and cannot be transferred. |
| Timeline validation and stable display slots | `projects/take-me-there-lyric-film/src/model.ts` | Positive source intervals, unique IDs, cue containment and exclusive-end word states. Its repeated-THERE display-slot rule is track-specific. |
| Bilingual data and semantic focus | `projects/vedmy-lyric-film/src/schema.ts`, `src/focus.ts`, `src/layout-types.ts` | Acoustic source events are separate from target words, lexical source IDs and optional complete display groups. `activeTargets` follows participating source intervals; `activeDisplaySource` gives paired phrase focus to both languages. Preserve all group rationales and use individual correspondences where defensible. |
| Efficient stable SVG updates | `projects/vedmy-lyric-film/src/preview-painter.ts`; `projects/lyubi-menya-lyubi-lyric-film/src/preview-painter.ts` | Update word fill and measured paths without recreating glyph geometry each frame. Lyubi keeps its mounted artwork shell through cue changes. For a moving-video canvas composition, adopt the stable geometry/focus principle rather than replacing source playback with this SVG shell. |
| Measurement preparation | `projects/must-have-been-a-dream-lyric-film/scripts/analyze-audio.ts` | Stereo mean-power measurement, source-frame-clock rows, RMS, positive short-window rise and 24 log spectral bands. Parameters must be calibrated and documented for the new recording. Centered windows and transients are display measurements, not word-onset evidence. |
| Hash-bound production boundary | `projects/must-have-been-a-dream-lyric-film/scripts/render-gate.ts` | Keep separate song/revision, input identity, complete actual-audio/format review and explicit production authorization. Replace fixed cue counts and song inputs. Include bilingual meaning-map review for this edition; the English-only implementation alone is insufficient. |

Existing local preview ports are 4320 (La Lune), 4322 (Ведьмы), 4324 (Люби меня, люби), 4328 (TAKE ME THERE), and 4329 (Must Have Been A Dream). A new preview should use a verified free port, document the actual URL, and start from zero. The existing server accepts a `PORT` environment variable; the review-server family uses `REVIEW_PORT`. Keep its lifetime independent of the setup shell and record a restart command.

### Actual bundled font coverage

A read-only inspection of the fonts' Unicode `cmap` tables checked all 33 Russian letters in uppercase/lowercase, including Ё/ё, plus basic English letters. This is glyph coverage evidence, not an optical typography comparison.

| Bundled font | Russian and Latin coverage | Additional note |
| --- | --- | --- |
| `projects/vedmy-lyric-film/public/fonts/CormorantGaramond-Semibold.ttf` | Complete tested coverage | Static semibold face; viable serif candidate if the inspected imagery supports it |
| `projects/lyubi-menya-lyubi-lyric-film/public/fonts/Oswald-Medium.ttf` | Complete tested coverage | Static medium face; viable compact sans candidate |
| `projects/la-lune-acoustic-lyric-film/public/fonts/SpaceGrotesk.ttf` | Latin only; every tested Russian letter absent | Variable `wght` axis. Copying the English canvas font would produce Russian fallback |
| `projects/must-have-been-a-dream-lyric-film/public/ArchivoBlack-Regular.ttf` | Latin only; every tested Russian letter absent | Do not adopt this face as the bilingual font |

Bundle the selected face with its existing license and explicitly await font loading before measuring either lane. Inspect actual Cyrillic and Latin rendered geometry at the same font size, weight and player sizes.

## Recommended preview architecture

1. Probe and hash the chosen source video and soundtrack. Record dimensions, active-picture bounds if there is an encoded matte, native frame cadence, audio/video start times, audio priming and the audio tail. Freeze the selected upload rather than silently substituting another recording.
2. Keep one native video as playback authority when the upload has moving picture. Paint its decoded frame from `requestVideoFrameCallback.mediaTime`; derive lyrics, features, shot changes and deterministic effects from the same source clock. Adapt callback/seek tolerances to the probed cadence. An audio-only preparation copy may support alignment; it is not a second playback clock.
3. Keep source acoustic word events, line reading windows, translation links, complete display groups, picture intervals and decorative envelopes separately identifiable. Do not evenly divide a lyric line or use transient peaks as sung-word boundaries.
4. Reserve complete phrase geometry before word focus. Cache measured glyph positions after the fonts resolve. Stable positions and weight remain fixed during focus; translations reflow at equal perceived size and contrast. The scene can use a quiet font with Russian and Latin coverage, but the actual selected font must be checked for both scripts rather than assumed from another project.
5. Preserve full source composition in landscape where practical. Compose portrait independently around subjects, protected source lettering, bilingual reading and platform clearances. A successful crop must be checked through each materially different shot.
6. Provide the complete duration with real source media, all intended graphics, seeking, normal/reduced speed, both layouts, restart and an always-available visual recovery control. Recovery must retain time, speed, layout and notes. A lyrics-only diagnostic can be additional evidence, never a replacement for the complete preview.
7. Measure media-clock health separately from visible composition. On fresh load, seek, playing, pause/resume, format switches and recovery, inspect a known nonblack source frame and advancing source motion in both layouts. Inspect the ending and short audio-only tail. A decoded-size probe or advancing slider does not establish visible video.
8. Freeze the current preview identity and record preparation tests and unresolved listening questions truthfully. Leave production authorization closed until this exact preview is reviewed and explicitly authorized.

## Translation and word coverage

For the Russian verses and choruses, English should receive equal prominence and source-linked meaning focus. Necessary articles, auxiliaries and phrasal completions share the source event that supplies them; they do not get invented independent vocal timestamps. Reordered translation may highlight out of reading order while remaining geometrically stable.

Inspect every source and target word in a correspondence ledger. Check complete target expressions in both directions: a grammatical completion must not remain neutral, but an independently sung pronoun, negation or degree word must not be swallowed merely to simplify highlighting. Groups follow the union of participating source intervals, releasing in gaps and during unrelated words. Repeated choruses require independent performance evidence; identical text does not establish identical timing.

The spoken English transmission is part of the performed inventory. Audit its exact wording, repetitions, onset and final release against this upload. A bilingual edition needs an explicit editorial decision for that passage; do not silently show two copies of the English line, change source wording to fit the supplied transcript, or omit it because it is spoken. Record any translation lane's correspondence without inventing phonetic timing in the translated language.

Useful regression lessons:

- Complete **te quiero / I love you** focus must include both meanings, while preserving independent subjects and negation.
- Instrumental-case grammatical additions can share a sung adjective event, followed by an independently sung noun event; grouping the whole construction is not automatically necessary.
- A duration idiom may have separate source words and fine display anchors despite a phrase-level lexical meaning. Label display anchors accurately rather than presenting them as literal translations.
- Check short function words, conjunctions, repeats, held vowels and the final spoken material, not only prominent nouns and verbs.
- Renderer agreement proves correspondence with a specification; it cannot make an incorrect meaning map or premature onset correct.

## Visual integration and intensity

The actual source picture must determine the visual brief. Inspect intimate, dark, bright, busy, peak, transition and ending passages before choosing palettes or masks. Assign the visualizer a supporting graphic or a physically supported environmental role, and record attention order per section.

For contemplative passages, compact measured response and bounded emission are appropriate starting points. Reserve impact for independently identified arrangement peaks; a larger loudness value does not alone justify stronger camera movement, particles, glow and text effects simultaneously. Keep raw features intact while separately tuning height, bloom, material, reflections and section limits.

An in-scene response needs a real receiver, source-compatible light and material, perspective/motion tracking, and sensible occlusion. A stable screen-space graphic is more honest when no reliable physical anchor exists. Omit unexplained mirrored spectrum strips, repeated foreground ornaments and scenery effects whose absence improves reading or the original subject. Compare any retained effect with a simpler treatment at ordinary speed and native/mobile player sizes in both formats.

La Lune's catalogue stars, oversized Moon, radial spectrum and steady silver palette belong to its authored lunar scene. They are not automatic choices for a recording whose lyrics mention comets. Falling leaves and autumn colors in Ведьмы likewise came from woodland imagery. The new song should acquire its own visual grammar from its inspected source rather than accumulate those previous motifs.

## Review and future delivery boundary

Keep four statuses separate: preview available, synchronization complete, production authorized, production verified. Required actual-audio listening includes the whole recording at normal speed, uncertain boundaries and held endings at reduced speed, and all delivery layouts. Machine observations, waveform checks, screenshots and automated playback must not be labeled completed listening.

Before eventual production, bind source media, text, mappings, timing, feature data, fonts, scene/player code and compiled assets. Test that missing, stale or wrong-song authorization fails before capture. Validate renderer parity at matching source times, including actual variable-font weight, clipped/glowing lettering, source crop edges and the ending. When audio outlasts video, hold the last decoded picture through the original tail rather than shorten audio.

Future final-file checks must cover strict full decode, complete frame timestamps/cadence, dimensions/aspect and color metadata, original audio packets/priming and decoded PCM, source-picture continuity, word/gap states, effects and the ending. Decode representative film frames from verified bytes for documentation. Promotional thumbnails are separate assets; the established TikTok profile cover is 1200×1600 portrait, reviewed at 150×200.

## Remote operations

This study performed no remote mutations. Before any future push, pull-request action, merge, dispatch, rerun or trigger edit that could start Actions, the coordinating assistant must inspect all current-UTC-day workflow runs and attempts using read-only access, including queued/in-progress/completed runs and attempts of older runs, all branches and actors, duplicate push/PR events, downstream chains, schedules and generated workflows. Estimate resulting runs and runner minutes, coordinate agents, and follow the current approval policy. Unknown monthly usage remains unknown; do not expand billing permissions. Retain durable local work if publication is blocked.

## Source-specific frame study

The preparation contact sheet `evidence/source-contact.jpg` and actual `source/probe.json` were inspected. Additional read-only source decoding examined full original frames at 0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 215, 225, 235, 245, 252 and 258 seconds. These are still-frame composition observations; they do not establish motion continuity, scene-cut boundaries or audio synchronization.

| Source property | Inspected value |
| --- | --- |
| Official title | POLNALYUBVI — Кометы (Official Music Video) |
| Video | 1920×796, square pixels, 25 fps, 6,501 frames, 260.040 s, H.264 |
| Native aspect | 480:199, approximately 2.412:1 |
| Audio | Original 44.1 kHz stereo AAC, start zero, 260.086712 s |
| Color | BT.709, limited range, `yuv420p` |
| Tail | Audio continues approximately 46.7 ms beyond the picture-stream extent |

The footage supplies dark emerald woods, daisies and a pale dress, twilight clouds, a silver/gold-rimmed mirror, a bow and luminous bowstring, blue-lit night trunks, a bright warm orb, and the return to sunset. The authorial visual story already relates forest, flight and light. Preserve it; the lyric's celestial vocabulary is not a reason to create another space background.

### Proposed visual brief

This is a design proposal from the inspected source frames, not a completed artistic or listening review.

- **Picture:** use the native 1920×796 source aspect for landscape. Do not insert 16:9 mattes, stretch to 1920×1080 or crop the original wide picture merely to fit an older project. The source frame remains the principal visual material.
- **Typography:** consider the bundled Cormorant Garamond Semibold, which has actual Russian/Latin coverage, for equal mixed-case Russian and English. Warm ivory resting text and restrained pale gold/amber focus echo the dress, mirror rim and orb. Dark source-compatible stroke/shadow may protect text, but avoid opaque caption panels or heavy gray veils over the forest. Optical comparison still needs the actual layout in both formats.
- **Primary visualizer:** a single fixed, low, softly curved bow-light ribbon can echo the existing bowstring. It should have a narrow cream core, bounded local bloom and frequency-shaped modulation around a stable baseline; use 24 measured bands mapped to a smooth ribbon rather than a symmetrical jaw-like fan or a moving foreground ornament. Describe it as a supporting screen-space graphic, not as a tracked physical bow. Reserve its reach and the text gap in both layouts. A simpler compact spectrum remains a comparison option if the ribbon reads as extraneous.
- **Response:** quiet forest/verse material gets compact measured travel and low emission. Reviewed chorus/arrangement peaks may receive greater reach, with the strongest tier reserved for the actual musical climax. Measure the arrangement before selecting windows; still imagery and lyric meaning do not determine energy tiers. Keep an absolute quiet gate and enough unsaturated headroom that loud material remains visibly distinct.
- **Secondary integration:** where shot review identifies a real luminous bowstring, existing light beam, mirror glint or orb, use a bounded mask of source-bright pixels and the same measured clock. Keep source texture and edge softness. The orb is already bright; added bloom must not clip it to a featureless white disk or cover the singer. Forest trunks and dress are not arbitrary equalizer bars. A mask follows moving picture or is explicitly shot-specific; a fixed polygon alone is not physical tracking.
- **Effects vocabulary:** begin with light contact, stable meaning focus and the bow-line spectrum. Omit imported comet trails, catalogue stars, synthetic rain, falling leaves, animated side branches and whole-picture tint shifts. The source's natural foliage, dancer and cuts already supply movement. Any extra layer needs an enabled/disabled comparison at ordinary speed.
- **Hierarchy:** performer and full bilingual lyric first, the main measured ribbon second, source-light atmosphere third. During instrumentals the picture may regain the center; do not add a decorative transition over every cut or make a color change redefine word timing.

### Portrait framing observations

A 9:16 cover crop of the full 796-pixel source height retains only about 447.75 pixels of its 1920-pixel width. It is therefore a new composition, not preservation of the whole source frame. Choose centers by shot, keep head/hand/bow/orb landmarks, and review intervening motion before adopting these suggestions:

| Inspected passage | Provisional portrait decision |
| --- | --- |
| Seated performer among daisies at 20 s | Near center; protect the face and dress. Avoid covering the central body with both languages if the upper/lower negative space can carry them. |
| Wide moving performer at 40 s | Subject is right of center. A static central crop would lose the actor; use a measured shot-specific center or preserve a wider scene. |
| Hand/forest detail at 60 s | The hand enters toward the right. This needs motion review; a central crop can omit the reason for the shot. |
| Hand and mirror reflection at 80 s | Preserve the interaction rather than treating the reflection as expendable background. Wider framing may be clearer than a very narrow crop. |
| Upright face at 100 s | Initial crop center near normalized x=0.62; keep eyes, mouth and gold facial detail. |
| Reclined face at 120–140 s | Initial center near x=0.55, independently checked for each shot and camera angle; do not put the lyric over eyes or mouth. |
| Bow and dress at 160 s | A crop that preserves the face can still lose the bowstring. Check the frame's intended action and use a wider view where necessary. |
| Profile/bow close-ups at 180–200 s | Initial center near x=0.55. Keep hand/string and face priorities separate from the lyric host. |
| Performer with orb at 215 s | Performer is left of the orb; a narrow cover crop cannot retain both well. Prefer a wider/full-scene treatment or a deliberate fit inset at this passage rather than cutting away the paired motif. |
| Performer holding orb at 225 s | Near x=0.50; protect face and orb together, and keep added emission below the original bright subject. |

These centers are observations of exact stills, not tracked trajectories or adopted crop intervals. Portrait lyric layout must be reflowed at equal prominence, not scaled from the wide frame or projected blindly into whatever remains of a landscape host.

### Preserve the opening and original ending

The zero-second frame is genuinely black. Do not diagnose an intentional opening as media failure, and do not silently replace it with a poster; establish preview health using later known nonblack moments. The 245-second frame contains the full-width `POLNALYUBVI.COM` website card over the sunset. The 252- and 258-second frames contain the original album and platform cards on an intentionally black ground.

Retain these authored cards with their complete lettering. Clear the spectrum and atmospheric decoration before original endcards, while keeping performed speech captioned for its actual source intervals. The recording inventory subsequently identified a second complete radio passage around **235.92–249.960 s**, over the original creator-credit, website and album material. A decorative cutoff must not truncate that audible text or its bilingual meaning focus.

The current reading plan separates this passage from the embedded source typography: landscape uses equally prominent 36 px bilingual lettering, with reading rows around y=725/780 below the creator logo; portrait keeps the original card full-width and places its reading rows below it around y=1470/1600. Those coordinates describe the current presentation plan, not completed collision or listening approval. Check the entire late passage against each changing original card and both layouts. Caption visibility and word focus retain their own source clocks and must not be reset by a source-credit transition.

In portrait, preserve the full card in a deliberate fit treatment instead of a narrow crop that exposes fragments of a website, album title or platform credits. The black source-designed ground is intentional, not a missing-video artifact; distinguish it from accidental black compositor intervals in documentation and tests. Avoid a blurred duplicate of readable source credits. Clear performed text only after its justified final reading/focus interval; leave the remaining original ending intact.

The current preview remains under timing refinement. A reported onset lag has prompted main and independent leading-edge audits. No completed acoustic approval, perfect timing claim or production authorization follows from this frame/framing study.

The original audio tail must remain intact. The browser should hold the final decoded source picture through it. Any eventual native-25-fps output would need 6,503 presentation frames to cover the 260.086712-second sound, retaining the final picture for the tail. The eventual renderer must derive this from the actual audio duration and validate its timestamps; no full film render is authorized at this stage.
