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
| Canvas motion | Separate source-time layers for dense near/far rain, ring light, lightning, one recurring rail consist, taxis, five distant hover cars, umbrella walkers with a gait cycle, cat, steam, and lyric/spectrum surfaces. Keep their depth order legible. |

The generated backdrops provide density, perspective, and warm/cool window texture. Canvas adds repeatable motion and the readable typography. The aircraft and vehicles need coherent paths and occlusion, with rain in front of near objects. Do not paste the source video or trace its buildings. Avoid static figures baked into the moving foreground.

## Composition and hierarchy

**Landscape:** Put the sky ring high and central; dense towers and overhead cables frame it. Rail crosses the lower middle; shop and tower signs sit below and beside the sky; traffic and umbrella walkers occupy the wet bottom third. The lyric host must remain readable when a train, walker, or airship crosses it.

**Portrait:** Retain the ring and street in one tall view, with the lyric host in a central safe area. Give vehicles shorter visible paths and preserve a clear vertical route for the airship. Treat portrait as its own composition and check at phone size.

The palette centers on ink violet, blue/cyan rain, magenta display light, amber windows and headlights, with brief white-violet lightning. Signs have stable dark fields behind words; reflections may repeat color, but must not duplicate full legible lyrics. Window light and signage should make the city feel occupied even before the first voice enters.

## Lyric language

`src/word-cues.json` currently maps **18 provisional cues / 76 words** from 47.77–186.94 s. Each word has source-time entry/exit data and `requiresReview: true`. The audio has no supplied lyric sheet or confirmed song/artist credit. See `TRANSCRIPTION.md` for uncertain words and listening notes. Do not describe the text as final or fully verified.

Use the project's 5 × 7 pixel lettering. Keep words stably placed on native surfaces. The active word changes color or brightness in place; inactive words stay readable. There is no floating karaoke strip. The current 18-cue route uses **five shop-row phrases, five rail-car LED phrases, seven building-ad phrases, and one airship LED word** (`CH-03`, “Lightning”). Shop phrases flow across adjacent fascia signs; portrait also repeats the whole line on the municipal board for phone-size reading. Other airship flights carry ambient service text. Train words travel on one coherent, recurring consist on the existing viaduct. This is the implemented host map, not a rule to enlarge the ship for every chorus line. If a phrase exceeds its host, change its layout rather than shrinking it to illegibility.

The reference's signs are environmental detail; our readable words are editorially timed to the soundtrack. The source's ~30.9 s street loop is a motion reference, not a lyric clock. Use the locked source time for word cues, environmental events, and spectrum playback; a seek to the same time should reproduce the same picture. Do not claim frame-perfect vocal alignment until reviewed by listening to the finished film.

## Music as architecture

The visualizer occupies the two vertical tower light panels, six bands in each, with a 12-cell response strip under the municipal board. The **12 fixed bands** are measured from the locked soundtrack. `evidence/spectrum-analysis.json` documents the 48 kHz stereo analysis: 40 Hz–12 kHz bands, centered RMS of filtered left/right power, fixed per-band 96th-percentile ceilings, 34 dB display range, contrast exponent 1.4, and 0–12 lit cells. These values drive brightness, not word detection. Keep enough unlit structure visible for the panels to read as architecture during quiet music.

## Motion and story

Keep one continuous city shot with slow, source-clocked camera pushes toward lyric hosts, returning to the full district between lines. Layer overlapping passes: one train service along the existing elevated track, opposed taxi lanes, small hover cars behind the towers, umbrella walkers with source-time gait, sustained rain, occasional airship flights, and brief ring/lightning events. The verified fixed-camera source timing and scale are in [REFERENCE-STUDY.md](REFERENCE-STUDY.md). Here, the first verse moves among shop fascia, building ads, and the train. The chorus uses building ads, one brief “Lightning” airship display, and the same rail service. The second verse brings steam, taxi halos, and a larger amber apartment window containing the cat into focus; the full cat line stays on adjacent built-in signage. The cat camera approaches from 173.3–175.1 s, holds to 180.5 s, and returns toward the rail by 183.2 s. The instrumental tail retains weather and street life without adding unsourced words. These are choices in the new artwork, not source-video events.

## Review boundary

Preview both formats with audio. Review each word's text and timing by ear, every host transition for readability, the train/vehicle depth order, and the 12-band response. Keep this as a preview until the explicit render approval and full synchronization review required by the repository workflow. No final render or approval is implied by this art bible.
