# Let You Down — visual brief

The picture is the official music video: an anime netrunner story in magenta, violet and cyan neon. It cuts to white flashback memories, the film's own UI panels (dialogue boxes, a cyberdeck readout, Securicine files, an upload progress bar) and a burning finale. The film keeps that picture intact. The added layers borrow its light and its lettering: the video's own title and credit cards are white type inside a pink or cyan neon glow, so the lyrics use that look.

## Roles and attention order

| Layer | Role | During vocals |
| --- | --- | --- |
| Original picture | Principal subject; never replaced, stretched or regenerated | Protected: faces and authored lettering are not covered by added light |
| Lyrics | Reading layer with stable geometry | Second in attention; focus changes colour and light only |
| Neon light response | Environmental: the video's own tubes, signs and screens brighten with the music | Subordinate; bounded gain, off on protected shots |
| Neon spectrum | The lyric film's instrument, set under the lyric column | Restrained in verses, fuller in choruses; tubes and peak marks stay within 104 px of the baseline (landscape) or 122 px (portrait) |
| Word effects | Local lyric atmosphere on a few exact words | Brief; the glyphs never move |

## Composition

- **Landscape** shows the full 16:9 source frame. Lyrics normally sit in the lower band (box `x 200–1720, y 676–876`), with the spectrum below on the same column.
  - Four dialogue-box passages (five shots) move the lyrics to an upper band (`y 96–306`): 58.8–62.5 s, 85.7–87.8 s, 133.2–135.8 s and 138.7–144.6 s.
  - The upload-screen shots use a single low row (`y 900–978`) under the panel's "Upload in process…" line; there the spectrum drops to a 40 px strip on a lower baseline.
- **Portrait (1080×1920)** crops the moving frame around the subject in 79 shots. One shot pans between two authored centres, and short flash or dissolve segments glide between neighbouring centres. The 13 lettering shots (title card, credit cards, "Inspired by", dialogue boxes, hacking UI, Securicine files, upload screens, logos, Netflix card, credits) instead show the whole frame in a band at `y 430–1037`, over a heavily blurred, darkened fill made from the same frame. Their text is never cropped and never readable twice. Lyrics sit in `y 1180–1540` (crops) or `y 1108–1448` (full-frame fits), and the spectrum baseline is at `y 1768`.
- **Shot map:** 150 cut candidates (histogram change > 0.30 or mean-luma change > 0.07, merged within 3 frames) were reviewed on labelled sheets and merged into 92 shots. Every override is in [analysis/build_shots.py](analysis/build_shots.py).

## Type and focus

- **Rajdhani Bold** (OFL), upright and in the supplied case: a squarish, rounded technical sans close to the video's own card lettering. Sizes are 92 px in landscape (80 px in the low upload-screen row) and 102 px in portrait, with backing echoes at 0.64×. Glyph positions, size and weight never change with focus.
- **Rest states:** unsung words are lilac-white `#f4f0fb` at 82 % (backing 78 %), and sung words are white at 97 %. A violet-black shadow (0.16 em) and a 0.045 em dark stroke keep both readable.
- **Active word:** lit like the video's cards. A pink neon halo `#ff4d9d` (a wide bloom of 0.7–1.0 em that grows with measured vocal energy, plus a tight 0.3 em one) is added as light around the letters. In choruses and the outro a second, wider cyan bloom `#3fd6ec` joins it, the video's dual neon. The letters themselves turn white lit from below: white to `#ffc4e1` for the lead, white to `#b3f0ff` for backing echoes and the moon word (with a cyan halo), and a molten `#fff4d6 → #ffc15a → #ff6a3a` for the fire words (orange halo). A 160 ms onset strike lifts the halo by up to 50 % without moving the glyph. These fills are published as `FOCUS_FILL` in [src/scene.ts](src/scene.ts), and the encoded-focus verifier checks against the same specification.
- **White memory frames:** `public/picture-tones.json` measures the 80th-percentile luma under each reading zone for every source frame. Near-white zones switch the type to dark ink `#2c1a3c` with magenta focus `#d43f86` and a light edge. The curve is steep, so mid-bright frames never produce grey type, and brighter pictures that stay in neon mode receive stronger continuous shading. All smoothing is centred and precomputed (±3-frame max, then ±4-frame mean), so seeks and the renderer agree.
- **Line visibility:** each line leads in 0.42 s before its first sung word (fading in over 0.16 s) and hands off to the next at the midpoint of the gap (fading out over 0.20 s). There are no cue panels, underlines, boxes or bouncing glyphs.

## Measured light

- **Neon light response.** Each frame, the visible source region is sampled at 384×216 (216×384 for portrait crops). A pixel emits its own colour with weight `smoothstep(value 0.4→0.7) × smoothstep(saturation 0.3→0.6)`; dim or grey pixels (max channel < 100 or chroma < 40) never emit. Strength depends on hue family:
  - magenta and red: bands 0–11, 40–176 Hz;
  - violet and blue: bands 12–25, 176–993 Hz;
  - amber and green: bands 26–34, 0.99–3.0 kHz;
  - cyan: bands 35–47, 3.0–15 kHz.

  Each family uses a slow-release envelope over the measured bands, raised to the power 1.25 and scaled by 1.25 × the section tier. The emission is blurred, bloomed at half resolution and screen-blended (blurred layer 0.95, bloom 0.8, crisp layer 0.45). This is a display mapping, not a claim about which instrument lit which sign.
- **Picture palette.** [scripts/measure-palette.ts](scripts/measure-palette.ts) records, for every source frame, the two dominant hues of its vivid pixels (saturation > 0.5, value > 0.55, 36 bins, the second at least 60° from the first) and how much vivid light the frame holds, smoothed over ±6 frames (`public/picture-palette.json`). Effects that should take a shot's own colours read it; frames with little vivid light fall back to the film's pink and cyan.
- **Neon spectrum.** The 48 measured bands (log scale, 40 Hz–15 kHz) mirror about the centre, bass in the middle and highs toward both sides, as thin neon tubes on a baseline under the lyric column. The design follows the repository's strongest earlier instruments (a wide, compact row of crisp bars on a baseline, coloured like the lyric focus) and draws it in this video's tube light.
  - Landscape: `x 200–1720`, baseline 1040, travel 92 px, 80 tubes 6 px wide. Upload-screen shots: baseline 1058, travel 40 px. Portrait: `x 64–1016`, baseline 1768, travel 110 px, 56 tubes.
  - Height = `3 + travel × (0.5 + 0.5 × tier) × level^1.7 × edge`, where `edge` tapers the outer 20 % of the row to 25 %.
  - Colour runs pink `#ff4fa3` at the centre through violet `#c45cff` to cyan `#46d9f0` at the edges, deeper at each tube's base and hotter toward its tip, with a white-hot core line. One shared bloom (tubes drawn 2.2× wide in a small buffer, blurred once) is screen-blended at 0.5.
  - Peak marks hold for 0.23 s, then fall at 0.66 of full scale per second; the hold track is precomputed over the whole recording, so it is seek-safe.
  - A faint reflection (35 % of the tube's height, 26 % opacity) sits under a hairline baseline that fades at both ends, like neon on a wet street.
  - On white memory frames the tubes turn to ink (`#c83a7e → #7a4fc4 → #4a6fc0`) and the bloom switches off.
- **Section tiers** (from the reviewed line ranges in [src/song.ts](src/song.ts)): intro 0.55, verse 1 0.46, verse 2 0.64, pre-chorus 0.62/0.74, chorus 0.84–0.97, outro 0.9, instrumental drop 1.0, tail 0.5. Tiers glide over 0.7 s and fade out by 232.55 s, before the finale's white flash, the logos and the silent credits.

## Word effects

| Effect | Trigger (ID + expected word) | Lifetime | Negative case |
| --- | --- | --- | --- |
| Neon strike | `L02-W01`, `L02-W04` (neon) | The halo strikes like a tube: full, 25 %, 110 %, 45 %, then steady within the first 150 ms of the word | Any other verse word lights steadily |
| Moonlight | `L07-W06` (moon) | Cyan halo and cool white fill instead of pink | — |
| Flame | `L17-W06`, `L18-W01` (flames), `L19-W06` (burn) | Molten fill and a low, calm flame of soft additive particles (190 per second while sung, gently thinned by measured vocal energy, rising 1.15–1.6 em/s). Tongues root about every 0.5 em (at least three), lean in one slowly turning wind and flicker slowly (3.2–5.4 rad/s) and independently; a burning elliptical edge runs along the cap line and casts soft warm light; 7 sparks drift above. The flame swells in over 0.2 s and cools over 0.7 s after the word | Other verse-2 words, including the same line's other words |
| Signal drop | The hook's final word (down) in chorus 1–3 and outro lines | The word's neon runs down like rain on glass. Droplets form on the letters' lower edges, hang for 0.12–0.40 s, then fall under gravity (1.8–3.2 em/s²) with a little wind. Each is stretched by its own speed (a 1/13 s shutter) and cools from the word's white-pink into the shot's own neon pair. Soft light spills under the letters while the note is held. Emission follows the held note and vocal energy (14 drops per second at the first chorus, 26 at the last outro line), and the drops stop above the spectrum. Drip pattern, wind, pace and colour order differ at each of the 14 occurrences; the last is the heaviest, slowest fall. On white frames the drops are soft violet ink | The same word inside verse 2 (`L18-W04`) is excluded by section |

All effect motion derives from source time and seeded per-word constants (no `Math.random`, no wall-clock integration), so a seek reconstructs the same frame.

## Review history

**preview-v1 → preview-v2** answers the owner's preview-v1 notes:

- **Visualiser.** The owner asked for a spectrum that feels part of the video. v1's compact 720 px spectrum first became a full-width row of tall neon tubes rising from the frame edge, which covered too much of the picture. A thin strip hugging the edge was also rejected. The design was then taken from the repository's strongest earlier instruments: a wide row aligned with the lyric column, thin crisp bars on a baseline, coloured like the lyric focus. Here it is drawn in the video's own neon, with peak marks and a wet-street reflection.
- **Flames.** The owner asked for a more natural fire, so bezier tongues were replaced by a particle flame.
- **Signal drop.** The owner asked for smoother, less repetitive motion, so stacked afterimages were replaced by the droplet effect. A stem-streak version was tried and rejected because it read as a barcode echoing the spectrum.
- **Lyric colours.** The owner asked for colours closer to the video. Forward-leaning Oswald in cyan/yellow became upright Rajdhani in the video's own card style: white lettering in its pink and cyan neon.

**preview-v2 → preview-v3.** The owner accepted preview-v2 and asked for milder, smoother flame and burn animation before production. Only the flame parameters changed (lower and calmer tongues, slower flicker and wind, a gentler swell-in and cool-down, dimmer light, fewer sparks; see Word effects). Timing and every other presentation input are identical to the accepted preview.

Diagnostic stills and placeholder proof clips in both formats were reviewed at the intro (27 s), the neon words (43 s), the moon (68 s), white memory frames (93 s), drops (93–99 s, 184 s, 228–230 s), flames (129–139 s, before and after the preview-v3 change), the upload screen and the overlapping outro (203–211 s). These are development observations, not a listening review.
