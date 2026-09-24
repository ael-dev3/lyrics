# Reference study and motion storyboard

## Source and method

The visual reference is [SpikeRiser's X post](https://x.com/SpikeRiser/status/2102888874858959029), archived locally as `work/source/2102887158373629952.mp4`. It is a locked 960 × 540 shot at 30 fps with 247.199 s of picture and 247.253 s of AAC audio. FFmpeg decoded **7,415** video frames although container metadata advertises 7,416. A script measured regional luminance, color proxies, and inter-frame change on every decoded frame; I viewed 1 fps contact sheets across the full duration, selected 2 fps crops, and short consecutive-frame sequences. The deeper scan, CSVs, contact sheets, and vehicle traces live in [`work/reference-study`](../../../reference-study/REFERENCE.md). These methods do **not** establish a manual inspection of every frame or a semantic object detection for every pixel.

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

**Train.** The source set is about 540 px long, y≈313–343, left → right at roughly 160 px/s; white windows and a thin magenta lower stripe sit behind storefronts. Substantial bright-window passes recur about every **15.45 s**: 0–7 (already moving at clip start), 14.4–22.8, 29.8–38.0, then at roughly 15.45 s intervals through 246.2–247.2, which is cut off. One sampled pass enters near 14 s, spans x≈190–730 at 18 s, and leaves near 22 s. The full interval list and threshold method are in [`airship-vehicles.md`](../../../reference-study/airship-vehicles.md).

**Road.** Rear-lane yellow taxis at y≈462–480 run right → left around 80–85 px/s; one moves x≈459–497 at 0 s, 303–341 at 2 s, 140–177 at 4 s. Near-lane taxis at y≈488–505 run left → right around 125 px/s; one moves x≈374–426 at 0 s, 629–681 at 2 s, 878–930 at 4 s. Others overlap with teal/white cars and rain. The road is rarely empty enough for freestanding lyric text.

**Walkers and flashes.** The two large umbrella variants are several times the scale of the distant figures. Their detected dark-pixel cores in the first cycle are 3.73–6.43 s and 18.00–20.53 s; canopies remain visible outside these threshold intervals. Paired sky flashes have detected cores 6.50–7.03 and 20.93–21.33 s. Both motions and flashes recur close to +30.9 s, with small timing/threshold differences in later cycles.

## Adaptation storyboard against this soundtrack

This is the editorial plan for the **new** art, not an assertion that the source video tells the same lyric story. All cue text and timing remain provisional in `src/word-cues.json` and `TRANSCRIPTION.md`.

| Audio time | Intended picture beat and lyric host |
| ---: | --- |
| 0–47.77 s | Establish the independent city art, rain, opposed traffic, rail passes, umbrellas, ring, shop and tower spectrum. Let architecture carry ambient signs before the first mapped word. |
| 47.77–88.48 s | First verse cues V1-01…V1-08: introduce lyrics on shop/tower lightboxes, with selected wider phrases on rail or airship displays. Preserve normal traffic and front-to-back occlusion. |
| 88.48–93.76 s | Short breathing space: lyric light falls back to environmental signage and measured spectrum. |
| 93.76–129.14 s | Chorus cues CH-01…CH-06: use larger built-in displays and the sky/airship as the visual center. Brief lightning can punctuate the 105.46–107.03 cue, but its timing must be composed to the audio rather than borrowed mechanically from the source loop. |
| 129.14–163.79 s | Instrumental passage: maintain life in the city and avoid invented sung words. Let train, taxi, pedestrian, and weather rhythms carry the shot. |
| 163.79–186.94 s | Second verse cues V2-01…V2-04: reveal steam, taxi halos, a cat in an amber window, and a last axis-train pass while native signs display each line. These objects are lyric-driven additions, not confirmed semantic events in the reference video. |
| 186.94–247.253 s | Instrumental/outro treatment pending full listening of the tail. Keep environmental motion and measured spectrum; add no unsourced text. |

The image assets supply original dense architecture; Canvas supplies deterministic source-clocked movement, in-world lyric text, and 12-band shop/tower light response. Inspect both landscape and portrait previews at actual viewing size. The current word map is unverified and the film has not passed a full sync review.
