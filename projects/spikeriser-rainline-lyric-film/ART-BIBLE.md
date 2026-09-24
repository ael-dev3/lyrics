# Art bible — Rainline / Glass District

## Intent and source

Build an original pixel-art lyric film around the soundtrack in [SpikeRiser's X video](https://x.com/SpikeRiser/status/2102888874858959029). The source is a fixed-camera, rainy cyberpunk city with a cylindrical sky, elevated train, taxis, umbrella walkers, neon signs, lightning, and a brief airship pass. This film keeps that layered urban grammar and recurring motion, while its city, vehicles, signage, lettering, and color decisions are new artwork. The measured observations and limits are in [REFERENCE-STUDY.md](REFERENCE-STUDY.md).

The city is a place that can sing: lyric words appear on surfaces that already belong to its architecture. A shop sign, tower panel, passing train display, and airship LED face take turns carrying the line. Rain and traffic continue through pauses. The sky ring supplies the large visual motif without becoming a subtitle backdrop.

## Picture format and artwork

| Element | Treatment |
| --- | --- |
| Output | Landscape 1920 × 1080 and portrait 1080 × 1920, 60 fps, 247.253 s. Both are composed, not cropped versions of one another. |
| Pixel grid | Current Canvas working coordinates are 640 × 360 and 360 × 640, enlarged 3× with nearest-neighbor sampling. Verify against the implementation before final render. |
| Landscape city | `public/city-landscape.png` (1672 × 941): original generated deep city, ring sky, rail, shop fronts, blank sign locations, and wet street. |
| Portrait city | `public/city-portrait.png` (941 × 1672): independently composed vertical version with ring, rail, tower stack, shops, and street. |
| Airship | `public/city-airship.png` (2172 × 724, transparent): original elongated craft with a large blank LED panel. It is animated as a separate foreground layer. |
| Train | `public/city-train.png` (2172 × 724, transparent): original navy transit car with warm windows and a blank LED side panel for moving lyric lines. |
| Sprite atlas | `public/city-sprites.png` (1254 × 1254, transparent): four separate elements in a 2 × 2 atlas—yellow taxi, amber cat window, violet umbrella walker, teal umbrella walker. |
| Canvas motion | Separate source-time layers for rain, clouds/ring light, lightning, train, taxis, umbrellas/pedestrians, cat, steam, and lyric/spectrum surfaces. Keep their depth order legible. |

The generated backdrops provide density, perspective, and warm/cool window texture. Canvas adds repeatable motion and the readable typography. The aircraft and vehicles need coherent paths and occlusion, with rain in front of near objects. Do not paste the source video or trace its buildings. Avoid static figures baked into the moving foreground.

## Composition and hierarchy

**Landscape:** Put the sky ring high and central; dense towers and overhead cables frame it. Rail crosses the lower middle; shop and tower signs sit below and beside the sky; traffic and umbrella walkers occupy the wet bottom third. The lyric host must remain readable when a train, walker, or airship crosses it.

**Portrait:** Retain the ring and street in one tall view, with the lyric host in a central safe area. Give vehicles shorter visible paths and preserve a clear vertical route for the airship. Treat portrait as its own composition and check at phone size.

The palette centers on ink violet, blue/cyan rain, magenta display light, amber windows and headlights, with brief white-violet lightning. Signs have stable dark fields behind words; reflections may repeat color, but must not duplicate full legible lyrics. Window light and signage should make the city feel occupied even before the first voice enters.

## Lyric language

`src/word-cues.json` currently maps **18 provisional cues / 76 words** from 47.77–186.94 s. Each word has source-time entry/exit data and `requiresReview: true`. The audio has no supplied lyric sheet or confirmed song/artist credit. See `TRANSCRIPTION.md` for uncertain words and listening notes. Do not describe the text as final or fully verified.

Use the project's 5 × 7 pixel lettering. Keep the full line stably placed on a native surface. The active word changes color or brightness in place; inactive words stay readable. No bouncing, underlines, or karaoke strip below the art. Route the phrase to a host that fits: short words on shop or tower signs, longer chorus lines on the airship LED panel or other wide built-in display. When a moving host crosses a line, keep perspective, occlusion, and screen time coherent. If a phrase exceeds its host, change the host or layout rather than shrinking it to illegibility.

The reference's signs are environmental detail; our readable words are editorially timed to the soundtrack. The source's ~30.9 s street loop is a motion reference, not a lyric clock. Use the locked source time for word cues, environmental events, and spectrum playback; a seek to the same time should reproduce the same picture. Do not claim frame-perfect vocal alignment until reviewed by listening to the finished film.

## Music as architecture

The visualizer occupies shop windows and tower light cells, with **12 fixed bands** measured from the locked soundtrack. `evidence/spectrum-analysis.json` documents the 48 kHz stereo analysis: 40 Hz–12 kHz bands, centered RMS of filtered left/right power, fixed per-band 96th-percentile ceilings, 34 dB display range, contrast exponent 1.4, and 0–12 lit cells. These values drive brightness, not word detection. Keep enough unlit structure visible for the panels to read as architecture during quiet music. The visualizer should have the source's energy without turning the city into a generic equalizer screen.

## Motion and story

Keep one continuous city shot with slow, source-clocked camera pushes toward lyric hosts, returning to the full district between lines. Layer overlapping passes: train along the elevated track, opposing near/rear taxi lanes, alternating umbrella silhouettes, intermittent right-to-left airship, rain throughout, and brief ring/lightning events. The verified fixed-camera source timing and scale are in [REFERENCE-STUDY.md](REFERENCE-STUDY.md). In this film, schedule motion against its own 247.253 s soundtrack: establish the city before 47.77 s; route the first verse through local signs and rail; open the chorus into sky/airship panels; give the second verse visible steam, taxi halos, a lit cat window, and a last train; let the instrumental tail breathe. These are storyboard intentions, not claims that the original video encoded those lyric moments.

## Review boundary

Preview both formats with audio. Review each word's text and timing by ear, every host transition for readability, the train/vehicle depth order, and the 12-band response. Keep this as a preview until the explicit render approval and full synchronization review required by the repository workflow. No final render or approval is implied by this art bible.
