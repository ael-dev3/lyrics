# Reference study and motion storyboard

## Source and method

The visual reference is [SpikeRiser's X post](https://x.com/SpikeRiser/status/2102888874858959029), archived in the task workspace as `work/source/2102887158373629952.mp4`. It is a locked 960 × 540 shot at 30 fps with 247.199 s of picture and 247.253 s of AAC audio. FFmpeg decoded **7,415** video frames although container metadata advertises 7,416. A script measured regional luminance, color proxies, and inter-frame change on every decoded frame; I viewed 1 fps contact sheets across the full duration, selected 2 fps crops, and short consecutive-frame sequences. The deeper scan, CSVs, contact sheets, and vehicle traces remain as local working evidence outside this project repository. These methods do **not** establish a manual inspection of every frame or a semantic object detection for every pixel.

The camera stays fixed. The main visual choreography repeats every **927 frames / 30.900 s** for about eight cycles. Its repeated pattern is strong, but rain/noise differs: regional series at lag 927 correlate 0.998 for sky luminance, 0.991 for upper-sky cyan count, and 0.819 for road near-black count. This is a visual loop; no musical beat or lyric alignment follows from the repetition.

## Native-frame map

| Source region | Appearance and depth |
| --- | --- |
| y 36–96 | Black overhead wires and small red/amber lamps, in front of the sky. |
| x 150–810, y 0–315 | Burgundy/indigo sky between converging roof wedges; circular vortex centered near (480, 205), radius about 100 px before flashes. Dense fine rain and cloud texture. |
| x 0–150 and 805–960 | Tall near towers with small window grids. Upper-left billboard x 15–140, y 65–190 switches red RAMEN and violet cola-like ad. Right tower has cyan/pink vertical sign. |
| y 240–315 | Distant cyan roofs; flickering hot-pink HOTEL near x 610–690, y 267–300; smaller green noodle/sleep sign fragments. |
| y 312–355 | Dark elevated rail and long white-windowed train with magenta lower line, behind storefronts. |
| y 355–452 | Narrow shop row with varied awnings, lightboxes, signs, warm interiors, and tiny figures. The white ramen lightbox near x 400–500 is a strong anchor. |
| y 454–540 | Wet two-lane road with yellow, teal, and gray cars, puddle bars, light smears, and tire spray. |
| y 414–540 | Large near-camera umbrella walkers. Opaque black and cyan wireframe canopies hide shops, cars, and reflections as they pass. |

The detail is built from small discrete marks: windows, sign flicker, rain streaks, rim lights, traffic highlights, and broken puddle reflections. Near-black/navy and dusty violet occupy most of the frame; cyan, magenta, amber, acid green, and cream-white are sparse focal lights. The source's suspended sky ticker is atmospheric text, separate from the later ship.

## One 30.9 s source cycle

Add `30.900 × k` seconds for cycle `k = 0…7`, stopping at the picture end. These are reference events, not instructions to stamp the source frames into our film.

| Time within cycle | Observed beat |
| ---: | --- |
| 0–3.3 s | Train windows already crossing, street traffic, small umbrellas; left billboard in red ramen state. |
| ≈3.4–7.7 s | Opaque black umbrella walker left → right at near-camera scale. Torso x≈70 at 4 s, 340 at 5 s, 590 at 6 s, 850 at 7 s: about 250–280 px/s. |
| 6.50–7.03 s | First short white-violet ring/sky flash; sky mean luminance rises from roughly 30 to 91 around 6.70 s. |
| ≈10–14 s | Small dark/amber suspended sky ticker drifts through; fragments include transit and monsoon words. |
| ≈13.9–14.7 s | Airship streaks right → left in upper sky. See pass table below. |
| ≈17.5–21.5 s | Cyan wireframe umbrella walker right → left, torso x≈850 at 18.5 s, 560 at 19.5 s, 270 at 20.5 s: about 270–290 px/s. |
| 20.93–21.33 s | Second short ring/sky flash. |
| 21.4–30.9 s | Traffic, train, tiny walkers, sign flicker, rain, and puddle marks continue into reset. |

The left billboard changes roughly every 10.3 s: red at sampled seconds 0–2, 10–13, 21–23; violet at 3–9, 14–20, 24–30 in cycle one. The resulting sign rhythm is shorter than the main 30.9 s choreography.

## Motion paths and scale

**Airship.** The source craft is a dark 285 px body with cyan underside, violet dome, and red tail light, layered in front of the ring and behind side towers. Its open-sky path occupies y≈110–160 with a slight upward drift and travels right → left at roughly 1,000 px/s. One 0.2 s sequence: x≈800–959 at 75.7 s; 586–869 at 75.9; 480–763 at 76.0; 302–585 at 76.2; 150–371 at 76.4; it disappears behind the left tower near 76.6–76.7. Approximate open-sky pass windows are **13.9–14.7, 44.8–45.6, 75.7–76.5, 106.6–107.4, 137.5–138.3, 168.4–169.2, 199.3–200.1, and 230.2–231.0 s**. Ends are ±0.1–0.2 s depending on tower occlusion. Our generated airship is a distinct design. A lyric phrase lasting several seconds needs a slower or longer readable display pass than the source's ~0.8 s streak.

**Train.** The source set is about 540 px long, y≈313–343, left → right at roughly 160 px/s; white windows and a thin magenta lower stripe sit behind storefronts. Substantial bright-window passes recur about every **15.45 s**: 0–7 (already moving at clip start), 14.4–22.8, 29.8–38.0, then at roughly 15.45 s intervals through 246.2–247.2, which is cut off. One sampled pass enters near 14 s, spans x≈190–730 at 18 s, and leaves near 22 s. The full interval list and threshold method remain in the local working evidence.

**Road.** Rear-lane yellow taxis at y≈462–480 run right → left around 80–85 px/s; one moves x≈459–497 at 0 s, 303–341 at 2 s, 140–177 at 4 s. Near-lane taxis at y≈488–505 run left → right around 125 px/s; one moves x≈374–426 at 0 s, 629–681 at 2 s, 878–930 at 4 s. Others overlap with teal/white cars and rain. The road is rarely empty enough for freestanding lyric text.

**Walkers and flashes.** The two large umbrella variants are several times the scale of the distant figures. Their detected dark-pixel cores in the first cycle are 3.73–6.43 s and 18.00–20.53 s; canopies remain visible outside these threshold intervals. Paired sky flashes have detected cores 6.50–7.03 and 20.93–21.33 s. Both motions and flashes recur close to +30.9 s, with small timing/threshold differences in later cycles.

## V3 adaptation against this soundtrack

This is the **new** film's implemented choreography, not an assertion that the source video tells this lyric story. All cue text and timing remain provisional in `src/word-cues.json` and `TRANSCRIPTION.md`. The 18 cue hosts in `src/city-choreography.ts` are five shop phrases, five moving train phrases, seven building-ad phrases, and one airship word. The four-car train is one recurring service on the existing viaduct; the airship makes several ambient flights, but only `CH-03` carries a lyric. Portrait shop cues have the individual words across native shop fascia **and** a full-line municipal-board relay for legibility.

| Audio time | Implemented lyric surface and picture beat |
| ---: | --- |
| 0–47.77 s | Establish the original city, dense rain, opposing taxis, rail service, umbrellas, ring, tower-panel spectrum, and sparse hover traffic. Ambient sign text carries the architecture before the first mapped word. |
| 47.77–65.22 s | `V1-01`, `V1-03`, `V1-04` flow through adjacent shop fascia; `V1-02` uses the civic building ad. Portrait relays each shop line on the civic board while its individual shop words remain visible. |
| 69.04–88.48 s | `V1-05`, `V1-06`, `V1-08` run on the passing train LED. `V1-07` moves to a left tower ad in landscape or the civic board in portrait. |
| 93.76–103.21 s | `CH-01` splits its repeated words between side neon and civic board; `CH-02` occupies the civic board. Weather and the 12-band architectural response continue. |
| 105.46–107.03 s | `CH-03` gives “Lightning” to the airship LED at ordinary skyline scale, with a brief source-clocked bolt. Other ship flights retain ambient service text. |
| 109.92–129.14 s | `CH-04` travels on the rail display; `CH-05` splits between side neon and civic board; `CH-06` uses the civic board with falling light accents. |
| 129.14–163.79 s | Instrumental city life: train, taxis, gait-cycled pedestrians, hover traffic, rain, and measured lighting, without invented sung words. |
| 163.79–173.29 s | `V2-01` and `V2-02` return to the shop row, with source-clocked steam and taxi emphasis. |
| 173.3–183.2 s | Camera approaches the amber cat apartment from 173.3 to 175.1 s, holds to 180.5 s, then releases by 183.2 s. `V2-03` (175.34–179.01 s) appears in a built-in board beside the enlarged window, where the shutter reveals the cat and its light warms on “yellow.” The current peak zoom is 2.2× landscape and 1.72× portrait. |
| 181.08–186.94 s | `V2-04` runs on the same rail service as the camera returns to the viaduct. |
| 186.94–247.253 s | Instrumental tail retains environmental motion and measured spectrum; no additional lyric text is inferred. |

Canvas evaluates up to 1,410 rain-streak candidates per landscape frame or 1,050 per portrait frame across near and far layers, with lyric surfaces protected from foreground streaks. A gait module moves the small and near umbrella pedestrians; five small hover cars cross the open sky canyon. Twelve measured spectrum bands fill the two vertical building panels and a short strip under the civic board. The generated art, native sign layouts, cars, and cat window are original to this film; the cat and hover cars are new editorial elements, not verified semantic events in the reference.

Selected v3 stills were checked in both layouts, including the cat shot. They establish visual composition at those times, not gait smoothness, word timing by ear, or whole-film continuity. The current word map is unverified and the film has not passed a full sync review.
