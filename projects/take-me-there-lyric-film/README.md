# excape. — TAKE ME THERE

**Status: full-length source-video preview, with provisional lyric text and word timing.** Revision `source-integrated-preview-v2` contains 37 cues and 225 individually identified word events across the 134.931-second recording. Genuine listening review and current render authorization remain pending. No final film has been rendered.

Source: [TAKE ME THERE](https://www.youtube.com/watch?v=CPznmfSbAiE), uploaded by excape.

![Source-integrated preview at 97.300 seconds](evidence/preview-landscape.png)

*Canvas still saved from the browser at 97.300 s. The original video supplies the city and car; the preview adds word focus, the fixed lower spectrum and measured response in existing lights. This is review evidence, not a final render or listening approval. [Portrait example](evidence/preview-portrait.png).*

## Intended picture and sound

The film uses the **actual moving source video and original soundtrack**. One native video element owns their clock; the canvas draws its decoded frame and the lyric/environment layers. Landscape preserves the full 1920×1080 frame. Portrait uses shot-specific framing of that same moving picture, with recomposed lyrics; it is a crop and needs independent composition review.

Large Space Grotesk lettering uses the shot's cool-blue or rose light. A prominent spectrum holds one fixed screen position and size in each format: 48 luminous shafts interpolate the 24 measured frequency bands. Its palette blends with source-shot colors over 0.5 seconds while its geometry stays stable across cuts. Existing windows, stars and wet reflections supply secondary environmental response. [VISUAL-BRIEF.md](VISUAL-BRIEF.md) and the [visualizer contract](evidence/visualizer-contract.json) record exact geometry, display mapping and review limits.

The preview provides play/pause, restart, numeric and slider seeking, cue jumps, 1×/0.75×/0.5× speeds, layout switching and source-picture recovery. Recovery retains position, speed, format and playback intent. Review status and errors belong outside the film.

## Run and resume

Install FFmpeg and ffprobe for source verification and audio analysis. Use Node.js with native TypeScript support; development uses Node 24.20.0. Dependencies, including TypeScript 7.0.2, are pinned in the lockfile. From the repository root:

```sh
cd projects/take-me-there-lyric-film
npm ci
npm run build
npm run check
npm run preview
```

Open [the local preview](http://127.0.0.1:4328/). `npm run preview` rebuilds the browser bundle and starts the server at `127.0.0.1:4328`. Stop the existing server with Ctrl-C before restarting it on the same port. After code edits, rebuild and use the preview's recovery control. The ordinary initial load is paused at zero.

Useful review links:

- [Opening hook, landscape](http://127.0.0.1:4328/?t=0.492&format=landscape&speed=1)
- [Second verse, portrait at reduced speed](http://127.0.0.1:4328/?t=62.922&format=portrait&speed=0.75)
- [Ambiguous first word, reduced speed](http://127.0.0.1:4328/?t=77.9&format=landscape&speed=0.5)
- [Uncertain late lead, reduced speed](http://127.0.0.1:4328/?t=117.65&format=landscape&speed=0.5)
- [Closing phrases, portrait](http://127.0.0.1:4328/?t=121.2&format=portrait&speed=0.75)

### Restore local media

The playback input is `public/source.mp4`. Restore that file with the identity below; do not trim, retime or substitute another upload. An optional `soundtrack.m4a` analysis copy is not the playback master. Verify the source before rebuilding timing or musical response:

```sh
shasum -a 256 public/source.mp4
ffprobe -v error -show_entries stream=codec_name,width,height,avg_frame_rate,sample_rate,channels,start_time,duration -show_entries format=duration -of json public/source.mp4
```

The preview server supports media byte ranges and serves public assets plus the review entry/bundle. Source code and transcript-analysis directories are not exposed through it.

## Lyrics and timing evidence

The attached recording and supplied transcript establish the analysis inputs. Independent unprompted recognition on the mix and separated vocals supplies lexical comparison evidence. Bounded forced alignment supplies candidate word spans, while waveform correspondence checks repeated phrase restarts. See [the transcription study](analysis/transcription-pass-a/README.md), [timing decisions](evidence/timing-decisions.json) and [review priorities](evidence/timing-review-priorities.json).

- Each of the 225 selected word events has its own ID, interval and evidence label.
- Ordinary phrases highlight separate words. Repeated hook echoes relight a stable word slot while retaining separate event IDs and intervening rests.
- Reading visibility has a short cue lead/release; it does not extend the active-word interval.
- The feature-driven visualizer does not set word times. The map is not made by evenly dividing phrase duration.
- Draft text and SRT files remain provisional exports, not verified subtitles.

The event count includes uncertain echo candidates and does not prove performed coverage. The decision log retains omitted or conflicting candidates rather than silently presenting a forced-alignment result as certainty.

A previously omitted three-word lead at approximately 44.288–45.870 seconds has been restored as its own cue. Its inclusion improves coverage; it still requires the same listening review as the other selected intervals.

The subsequent phonetic audit corrected an early FAR highlight near19 seconds, linked article/ROOM boundaries, two ANYWHERE onsets, short pronouns and WITH transitions, and the calibrated THERE onset in measured repeated leads. It compares MMS with a separate English CTC model and explicitly retracts earlier Whisper-only onset assumptions. The timing tests scan all225 events on the source60fps grid; this proves focus visibility and exclusivity, not acoustic perfection.

### Outstanding listening review

1. Resolve **“Leave” versus “Live”** around 78.18 seconds. The supplied spelling is retained; low-confidence recognizer agreement does not settle the sung vowel.
2. Check the opening phrase's inner word boundaries, held endings and each hook's echo count. Local alignment can fit different repetition hypotheses into the same window.
3. Review the “anywhere” substitution, chopped pairs, late echoes and uncertain lead around 117.65–121.20 seconds.
4. Check all three closing phrases, especially individual word releases. Targeted recognition and recurrence corroborate their text, not a completed listening attestation.
5. Review every cue against the original mixed recording at normal speed, uncertain words at reduced speed, and both layouts. Check the moving picture after fresh load, seek, restart, layout change and recovery.

Structural tests, fit checks and screenshots establish different facts from listening and visual acceptance. No complete listening-review record is claimed here.

## Reproduction and edit map

| Task | Source or command | Output / boundary |
| --- | --- | --- |
| Source composition, masks and lettering | `src/scene.ts` | Draws source frames and measured effects; does not replace footage |
| Shot regions and portrait framing | `src/shots.ts` | 28 manually sampled source intervals; approximate dissolve handoffs |
| Word validation and display slots | `src/model.ts` | Keeps acoustic intervals separate from reading geometry |
| Media clock and recovery | `src/player.ts`, `review/index.html` | Complete review player |
| Rebuild selected word map | `node scripts/build-timeline.ts` | Timeline, decision log and draft text/SRT; requires recorded alignment/recurrence JSON |
| Recompute recurrence evidence | `node scripts/repetition-audit.ts` | Requires the vocal-stem analysis input |
| Recompute musical response | `npm run features` | Reads original MP4; writes feature data and audit |
| Build browser bundle | `npm run build` | Generated `review/client.js` |
| Validate project | `npm run check` | Type checking, model/gate tests and project checks; no listening approval |
| Inspect production gate | `npm run render:production` | Expected to reject missing review/approval; no final encoder is implemented |

Musical response uses RMS level, positive spectral flux and 24 logarithmic bands at 60 Hz. The full-recording data use source-specific display calibration, with upper saturation near 0.51% per series. The centered analysis window spans about 92.88 ms; these are light-response features, not syllable-onset evidence. See [the feature audit](evidence/audio-features-audit.json).

Keep the primary spectrum's anchor independent of shot-specific lyric placement. Reserve its full height plus the reading gap before fitting lyrics. A cut may change the source picture or lyric host; it must not move, resize or fade out the primary spectrum. Secondary source-light masks retain their own conservative cut envelope.

## Future-agent handoff

Read this file, the [visual brief](VISUAL-BRIEF.md), [source integration plan](evidence/source-integration-plan.md), timeline review fields and timing priorities. Preserve the commissioned source picture unless a later request explicitly changes the project to original artwork. Techniques from Rainline or another authored scene do not themselves authorize replacing footage.

Resolve the listening questions before changing review status. Check the exact revised complete preview, then obtain current render authorization. `scripts/render-gate.ts` checks cue coverage, both formats, normal/reduced listening, unresolved defects, revision identity and input hashes. Changed code, media, text or timing makes earlier evidence stale. Even a passing gate does not encode the song: implement and prove renderer parity before production.

## Source identity

| Property | Value |
| --- | --- |
| YouTube ID | `CPznmfSbAiE` |
| Prepared formats | `299+140`, stream-copy merge |
| Source bytes | 83,654,237 |
| SHA-256 | `954ce98a308937e81a167ab740381cd46195abbad3279f3bc57319fa48bbd73c` |
| Video | H.264, 1920×1080, 60 fps, start 0, duration 134.883333 s |
| Audio | AAC, 44,100 Hz stereo, start 0, duration 134.931156 s |

The upload also offers a 2160p edition; the prepared source is 1080p. Do not describe the local reference or authored canvases as a 4K master. Song/source-video credit is excape.; no unidentified animation creator is inferred.
