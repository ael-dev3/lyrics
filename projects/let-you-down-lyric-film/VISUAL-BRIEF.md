# Let You Down — visual brief

The picture is the official music video: an anime netrunner story in magenta, violet and cyan neon. It cuts to white flashback memories, the film's own UI panels (dialogue boxes, a cyberdeck readout, Securicine files, an upload progress bar) and a burning finale. The film keeps that picture intact. The added layers borrow its light and its interface language rather than bringing in new scenery.

## Roles and attention order

| Layer | Role | During vocals |
| --- | --- | --- |
| Original picture | Principal subject; never replaced, stretched or regenerated | Protected: faces and authored lettering are not covered by added light |
| Lyrics | Reading layer with stable geometry | Second in attention; colour-only focus |
| Neon light response | Environmental: the video's own tubes, signs and screens brighten with the music | Subordinate; bounded gain, off on protected shots |
| Cyberdeck spectrum | Supporting screen-space graphic at a fixed anchor | Restrained in verses, fuller in choruses |
| Word effects | Local lyric atmosphere on a few exact words | Brief; the glyphs never move |

## Composition

- **Landscape** shows the full 16:9 source frame. Lyrics normally sit in the lower band (box `x 200–1720, y 752–966`), above the spectrum.
  - Four dialogue-box passages (five shots) move the lyrics to an upper band: 58.8–62.5 s, 85.7–87.8 s, 133.2–135.8 s and 138.7–144.6 s.
  - The upload-screen shots use a single low row (`y 900–986`) under the panel's "Upload in process…" line.
- **Portrait (1080×1920)** crops the moving frame around the subject in 79 shots. One shot pans between two authored centres, and short flash or dissolve segments glide between neighbouring centres. The 13 lettering shots (title card, credit cards, "Inspired by", dialogue boxes, hacking UI, Securicine files, upload screens, logos, Netflix card, credits) instead show the whole frame in a band at `y 430–1037`, over a heavily blurred, darkened fill made from the same frame. Their text is never cropped and never readable twice. Lyrics sit around `y ≈ 1370`, and the spectrum baseline is at `y 1768`.
- **Shot map:** 150 cut candidates (histogram change > 0.30 or mean-luma change > 0.07, merged within 3 frames) were reviewed on labelled sheets and merged into 92 shots. Every override is in [analysis/build_shots.py](analysis/build_shots.py).

## Type and focus

- **Oswald Bold uppercase** (OFL), with a forward lean of 0.13 shear that matches the video's slanted interface lettering. Glyph positions, size and weight never change with focus.
- **Rest states:** unsung words are lilac-white `#e4e2f3` at 80 %, and sung words are white at 96 %. A dark stroke (0.075 em) and soft shadow keep both readable.
- **Active word:** a neon tube lights. The fill runs from a white core to the section colour, with a glow that scales with measured vocal energy. A 140 ms strike at the onset adds brief extra glow without moving the glyph.
  - Verses and pre-choruses: **cyan** `#2ee6ff`, answering the film's magenta light.
  - Choruses and the outro lead: **Edgerunners yellow** `#fcee0a`.
  - Backing echoes in the outro: cyan, on their own smaller lane (0.62×) under the lead.
- **White memory frames:** `public/picture-tones.json` measures the 80th-percentile luma under each reading zone for every source frame. Near-white zones switch the type to dark ink `#231a36` with magenta focus `#c8126c` and a light edge; the curve is steep, so mid-bright frames never produce grey type. Brighter pictures that stay in neon mode receive stronger continuous shading. All smoothing is centred and precomputed (±3-frame max, then ±4-frame mean), so seeks and the renderer agree.
- **Line visibility:** each line leads in 0.42 s before its first sung word and hands off to the next at the midpoint of the gap. There are no cue panels, underlines, boxes or bouncing glyphs.

## Measured light

- **Neon light response.** Each frame, the visible source region is sampled at 384×216 (216×384 for portrait crops). A pixel emits its own colour with weight `smoothstep(value 0.45→0.75) × smoothstep(saturation 0.35→0.65)`; dim or grey pixels (max channel < 110 or chroma < 45) never emit. Strength depends on hue family:
  - magenta and red: bands 0–11, 40–176 Hz;
  - violet and blue: bands 12–25, 176–993 Hz;
  - amber and green: bands 26–34, 0.99–3.0 kHz;
  - cyan: bands 35–47, 3.0–15 kHz.

  Each family uses a slow-release envelope over the measured bands, raised to the power 1.6, and scaled by the section tier. The emission is blurred once and screen-blended (blurred layer at 0.9, crisp layer at 0.42). This is a display mapping, not a claim about which instrument lit which sign.
- **Spectrum.** 48 bands measured on a log scale from 40 Hz to 15 kHz, drawn as square-ended bars. Colour runs magenta → violet → cyan across frequency, with white caps and a hairline rail with end ticks.
  - Landscape anchor `x 600, width 720, baseline 1044, travel 54 px`; portrait anchor `x 180, width 720, baseline 1768, travel 66 px`.
  - Height = `2 + travel × (0.35 + 0.65 × tier) × band^1.25`. Opacity runs 0.58–0.92 with energy.
  - One half-scale blurred bloom layer is screen-blended. The bloom is dimmed on white memory frames.
- **Section tiers** (from the reviewed line ranges in [src/song.ts](src/song.ts)): intro 0.55, verse 1 0.46, verse 2 0.64, pre-chorus 0.62/0.74, chorus 0.84–0.97, outro 0.9, instrumental drop 1.0, tail 0.5. Tiers glide over 0.7 s and fade out by 232.55 s, before the finale's white flash, the logos and the silent credits.

## Word effects

| Effect | Trigger (ID + expected word) | Lifetime | Negative case |
| --- | --- | --- | --- |
| Neon strike | `L02-W01`, `L02-W04` (neon) | Pink neon-tube glow; two dips in the first 130 ms, inside the word's own focus interval | Any other verse word keeps cyan focus |
| Moonlight | `L07-W06` (moon) | Silver focus instead of cyan | — |
| Flame | `L17-W06`, `L18-W01` (flames), `L19-W06` (burn) | Warm body light, one bezier tongue per ~0.19 em of word width (at least 4) and 16 embers rising from the cap line. Height and heat scale with measured vocal energy. The flame cools ≤ 0.45 s after the word | Other verse-2 words, including the same line's other words |
| Signal drop | The hook's final word (down) in chorus 1–3 and outro lines | Cyan/magenta afterimages slide 0.42 em down and fade within 0.42 s, with slice jitter in the first 120 ms. The real glyph stays put | The same word inside verse 2 (`L18-W04`) is excluded by section |

All effect motion derives from source time and seeded per-word constants (no `Math.random`, no wall-clock integration), so a seek reconstructs the same frame.

## Reviewed during development

Diagnostic stills in both formats were compared at 39–41 s (intro to verse), 84–95 s (upper-zone dialogue shot and white memory frames), 125–128 s (flame words), 160 s (white), 202 s (upload screen, bottom zone) and 228 s (bright pink floating shot). The review led to four changes:

- The ink switch became steeper, with brightness-adaptive shading, after grey type appeared on pink frames.
- The fit-mode fill became blurrier and darker after the upload text read twice.
- The portrait lyric band moved down to `y ≈ 1370`.
- The flames moved in front of the readability shadow after they read too faintly.

These are development observations, not the listening or final visual review.
