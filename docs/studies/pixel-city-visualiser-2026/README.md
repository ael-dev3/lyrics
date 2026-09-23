# Pixel city visualiser reference study

This is a reference study for future city-at-night lyric films. It records visual structure, pacing, technical choices that transfer to our Remotion workflow, and items that still need testing against an actual song. It is not a tracing sheet or a request to reproduce either source.

## Sources and observation scope

- [SpikeRiser's “Claude 5.5 pixelart” post](https://x.com/SpikeRiser/status/2102581008654594124). The public post contains a 16:9 video of roughly 3:30; the in-browser player reports 1920×1080.
- [procedural-film repository](https://github.com/kuhnhomeuk-cell/procedural-film), including its [procedural-film guide](https://github.com/kuhnhomeuk-cell/procedural-film/tree/main/skills/procedural-film), [finished example](https://github.com/kuhnhomeuk-cell/procedural-film/tree/main/examples/butterfly-life), frame contact sheet, art bible, storyboard, deterministic canvas helpers and render checks. The inspected checkout was at `ec29e23`.

The X clip was reviewed in its browser player across the full duration using seekable frames: denser checkpoints near the opening, representative points through the long central hold, and the transition close to the end. The main scene holds the same broad pixel-city grammar for much of the clip. Viewpoints reveal different combinations of rooms and signs; the camera drift is restrained, with a neighboring building section entering near the end. Small light and weather details continue within the held composition. This method identifies scene and motion patterns, but it is not an exhaustive inspection of every encoded frame or every individual rain pixel. No post frames were copied into this repository.

The GitHub example is also reviewed through its labelled 24-frame contact sheet and the matching storyboard and scene source. Its frames make shot progression legible at a glance, and its source exposes how the pictures are scheduled and drawn.

## Frame and layer readout

### Night-city post

The sampled frames show a wide, dark, pixelated city facade organized into stacked horizontal strips. The skyline and roofline sit behind repeated window grids. Storefronts occupy clear bands within the building; illuminated signboards name different uses such as a clinic, arcade, café, laundry, sleep, tattoo, band and karaoke spaces. One large lit sign or shop should read first, while the many smaller window lights supply the texture around it.

The lower rooms have distinct interior colors and activity rather than a single flat wall of windows. Tiny person, desk, bed, appliance and counter silhouettes suggest a life continuing indoors. A narrow road or ledge anchors the bottom of the view; a small warm-colored vehicle and scattered road lights provide scale and a moving point of interest. The upper floors stay much darker, so the brightest shop strips carry the eye.

The palette is predominantly deep blue-violet and near-black, with muted blue structural edges. Cyan, lavender and magenta separate signs and window groups; small amber or pale yellow lights punctuate the facade. Individual lights sit inside the architecture, so the image still reads as one place instead of a floating audio display over a wallpaper background.

Across the sampled sequence, changes are mostly gradual: small differences in lit windows, signs, weather and the section of facade in view. The scene does not need a new camera move on every beat. Its repeated verticals, repeated floors, and recurring marquee bands keep it legible while the details give a viewer somewhere to look on a longer hold. A persistent city loop or gently drifting world is the useful lesson; the exact timing of a screenshot is not a verified edit point.

Fine rain is a natural extension for our films, but the sampled views alone do not establish the exact rain simulation or audio mapping used by the post. Treat the rain and the building-integrated visualisers proposed below as our own, testable design.

### Procedural-film repository

The repository describes an all-JavaScript canvas film, with a self-contained HTML player and MP4 exports. Its butterfly example has 17 short shots over about 32 seconds, at 24 fps on a beat grid. It uses a warm hand-inked illustration plate alternating with a cool navy blueprint plate. That butterfly look is deliberately different from the violet pixel-city reference.

The transferable value is its scene construction and review discipline:

- A style bible names frame rules, palette roles, shape proportions, texture and mistakes before scenes are drawn.
- A storyboard gives each shot a duration, job, layer order, visual action and sound cue. The cut times add up to the full runtime.
- Each scene is a deterministic drawing from an explicit time input. Random layouts use a stable seed; static geometry can be cached; frame order does not change the picture.
- The whole film is viewed as a contact sheet, then each shot is checked on its own frames. A test renders frames in different orders and compares pixel hashes.
- Audio cues and picture events share a written timeline. A visually attractive contact sheet does not, by itself, establish sync.

Its illustrative linework, faux paper grain, blueprint grids, Web Audio music engine and sub-150 ms per-frame target are properties of that example, not requirements for our lyric films. Keep our locked song audio, Remotion timing, English/original-language typography, preview gate and delivery checks. If code from this public repository is ever reused, preserve its MIT attribution and license notices; the recommendations here paraphrase its ideas and contain no copied code.

## Rules worth carrying into a future city film

1. **Make the building the visualiser.** Put bars, meters and musical glow inside windows, signs, shop counters, stairwells and rooftop hardware. Give each element a plausible physical location and a small frequency or cue range. Do not place a giant decorative analyzer over the lyrics just because there is spare screen space.
2. **Give every floor a reason to be there.** Design a few different room archetypes, then vary occupancy, silhouette, window light and store identity. Use larger sign bands as landmarks and smaller windows as a repeating texture. Avoid a uniformly populated checkerboard.
3. **Keep the weather in depth.** Separate distant short marks, mid-distance falling drops and a few near-lens streaks. Fix each stream's seed and derive position from source time. Clip drops behind roofs and walls, keep them out of dry interiors, and let them become visible on glass or wet ledges only where they can plausibly land. Use sparse pavement glints or short reflections under real light sources instead of filling the road with random sparkles.
4. **Move the view slowly.** Treat the city as a reusable map. A few reviewed pans between neighborhoods or a carefully looped drift can add discovery; small light states and rain can carry longer holds. Avoid camera shake and fast pans that make signs, lyrics or pixel clusters shimmer.
5. **Let energy change through the rooms.** At a reviewed musical lift, more selected windows may wake, signs can brighten briefly, and embedded bars can expand. Keep doors, window frames and lyric placement stable. Build an intensity curve from the actual arrangement so a quiet song is not forced into a maximum-energy city.
6. **Keep rain independent of beat events.** Rain is continuous environmental motion. Let only deliberate accents such as a sign ignition, one bright drop strike or an exceptional window burst respond to a documented musical cue. A new drop does not need to land on every kick.
7. **Give text its own calm area.** Preserve the established bilingual equality and safe-area rules. Use a darker roof, sky gap, blank facade band or light local backing behind lyric lines. Do not shrink English or let rain, glowing pixels or a passing sign compete with word highlighting.
8. **Build the portrait and landscape compositions deliberately.** A wide facade can scroll, but a 9:16 view should become a vertical stack of neighboring floors or a closer street canyon. Keep the city world consistent while composing separate camera windows, signs, rain masks and lyric-safe areas for 16:9 and 9:16. Never make the tall version by cropping the middle out of the landscape master.

## Open questions for the first song-specific prototype

- Which parts of the arrangement should affect which rooms, signs and embedded meters?
- Does the song want a continuous slow city drift, a fixed facade with a few match-cut rooms, or both at different sections?
- What pixel-cell size remains crisp after the actual 1080 export and platform transcode in each aspect ratio?
- Can both lyric languages stay equal and readable against the brightest sign and rain frames?
- Does any drop, reflection, glow or window animation distract from the song or appear unrelated to the sound?

Answer these in the song's own art bible and storyboard. This study sets up the options; it does not prescribe the next song's palette, cut rate, rain density or peak moments.
