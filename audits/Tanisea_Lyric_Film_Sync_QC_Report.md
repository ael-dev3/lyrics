# Tanisea — “I’ll Scream to the Whole World”
## Lyric-film synchronization and production QC report

**Reviewed file:** `Tanisea-Lyric-Film-Production-Master.mp4`  
**Runtime:** 02:33.000  
**Format reviewed:** 1080×1080, 30 fps, HEVC video, AAC 44.1 kHz audio  
**Timing precision:** approximately ±0.10 s. At 30 fps, 0.10 s is 3 frames.

---

## How the timings below were measured

- The **audio cue** is the vocal onset from the time-coded lyric track for **Танисия — “Закричу на весь мир (ksviety Remix)”**, cross-checked against the embedded audio waveform/onset envelope.
- The **visual cue** is the first frame where the incoming main lyric is reasonably legible—not the first faint or blurred pixel of its entrance animation.
- A negative delta means the lyric becomes legible **before** it is sung. A positive delta means it becomes legible **after** the vocal has started.
- A mild anticipatory lead of roughly **0.10–0.20 s** is useful. More than about **0.30 s** starts to feel detached; **0.50 s or more** is plainly noticeable.

## Executive summary

There is **no global audio/video offset**. Both streams start at `00:00.000` and are exactly `153.000 s` long. The reactive spectrum at the bottom is also correctly synchronized; its strongest match to the embedded audio occurs at **zero-frame lag**.

The actual problem is **individual cue inconsistency**, not a muxing problem. Some lyric animations anticipate the singer, while others arrive late. The reviewed cue range runs from about **0.74 s early** to **0.95 s late**, so shifting the entire lyric layer cannot fix it.

The most serious mismatch is the second **“And raise the ocean”** at `01:40.95`: the singer starts the line almost one second before the correct text becomes readable. The clearest early cue is **“Some spoke; others stayed silent”** at `01:23.14`, which becomes readable about 0.74 s before the vocal.

The English lyric order is correct and no line is missing from this remix. The wording is broadly faithful, but several phrases are too literal or unnatural in English, which also makes them unnecessarily long and harder to animate.

---

# 1. Highest-priority timing corrections

| Audio time | Lyric | What currently happens | Recommended correction |
|---:|---|---|---|
| **01:40.95** | **And raise the ocean** | Previous lyric remains through roughly `01:41.40`; the new line is not legible until about `01:41.90`. **~0.95 s late / 29 frames.** | Move the whole incoming cue about **0.95–1.00 s earlier**. Start blur near `01:40.65`; make it sharp by `01:40.90–01:40.95`. |
| **01:23.14** | **Some spoke; others stayed silent** | New line is already legible around `01:22.40`, while the singer is still finishing the prior line. **~0.74 s early / 22 frames.** | Move the cue **0.60–0.70 s later**. A useful target is first legibility around `01:23.00–01:23.05`. |
| **00:33.87** | **And raise the ocean** | New line becomes legible near `00:33.30`. The preceding mountain line is removed too soon. **~0.57 s early / 17 frames.** | Move it **0.45–0.55 s later**. Keep only a short blurred anticipation before the vocal. |
| **01:19.94** | **My hands shook from the weight of years** | New line is legible around `01:19.40`. **~0.54 s early / 16 frames.** | Move it about **0.45–0.50 s later**. |
| **01:53.98** | **I’ll pass through as a wave of fire** | The old line remains after the vocal begins; incoming text is not clearly legible until about `01:54.50`. **~0.52 s late / 16 frames.** | Move the transition **0.50–0.60 s earlier**. |
| **01:04.09** | **Night in the silence freezes helplessly** | The interlude plate disappears, but the lyric is still blank/blurred at the vocal onset. It is legible around `01:04.40` and fully sharp around `01:04.60`. | Begin the lyric entrance around `01:03.80–01:03.90`; make it sharp by `01:04.05`. |
| **00:40.23** | **Let the earth tremble** | Outgoing title fades away before the new one is ready. There is a visible empty interval; new text is legible around `00:40.53`. **~0.30 s late.** | Start the incoming card about **0.30–0.40 s earlier** and overlap the outgoing/incoming animations slightly. |
| **01:50.70** | **And through the walls of apartments** | Same empty-gap problem as `00:40.23`; new text is legible around `01:51.00`. **~0.30 s late.** | Move entrance about **0.30–0.40 s earlier**. |

## Important repeated-chorus inconsistency

The same lyric lines do not use the same relative timing in the two choruses:

| Lyric | First occurrence | Second occurrence | Difference between repetitions |
|---|---:|---:|---:|
| And I’ll erase the horizon | `-0.20 s` | `-0.20 s` | `0.00 s` |
| And split it in half | `0.00 s` | `-0.20 s` | `0.20 s` |
| I’ll fold the peaks of every mountain | `-0.30 s` | `-0.30 s` | `0.00 s` |
| **And raise the ocean** | **`-0.57 s`** | **`+0.95 s`** | **1.52 s swing** |
| I’ll scream to the whole world | `-0.30 s` | `0.00 s` | `0.30 s` |
| Let the earth tremble | `+0.30 s` | `-0.20 s` | `0.50 s` |
| And through the walls of apartments | `-0.20 s` | `+0.30 s` | `0.50 s` |
| I’ll pass through as a wave of fire | `-0.10 s` | `+0.52 s` | `0.62 s` |

The repeated chorus should be built from **one approved marker/cue stack**. Duplicate the timing exactly and only change layout or styling. The `1.52 s` timing swing on “And raise the ocean” is the strongest sign that the repeated section was not tied to one shared timing map.

---

# 2. Full lyric-cue audit

**Legend:**  
`Keep` = within a useful/acceptable window.  
`Nudge` = noticeable but not destructive.  
`Fix` = clearly early/late or creates a blank interval.

| # | Audio cue | On-screen lyric | First legible visual | Delta | Verdict and note |
|---:|---:|---|---:|---:|---|
| 1 | `00:24.40` | And I’ll erase the horizon | `00:24.20` | `-0.20 s` / `-6 f` | **Keep.** Good anticipation. |
| 2 | `00:27.58` | And split it in half | `00:27.58` | `0.00 s` / `0 f` | **Keep.** Entrance blur starts earlier but the line is readable on cue. |
| 3 | `00:30.68` | I’ll fold the peaks of every mountain | `00:30.38` | `-0.30 s` / `-9 f` | **Nudge later** by roughly `0.15–0.20 s`. |
| 4 | `00:33.87` | And raise the ocean | `00:33.30` | `-0.57 s` / `-17 f` | **Fix.** Preceding line is removed too early. |
| 5 | `00:37.05` | I’ll scream to the whole world | `00:36.75` | `-0.30 s` / `-9 f` | **Nudge later** by about `0.15–0.20 s`. The larger chorus hit can still begin early, but the text should sharpen closer to the vocal. |
| 6 | `00:40.23` | Let the earth tremble | `00:40.53` | `+0.30 s` / `+9 f` | **Fix.** Visible blank gap at the vocal onset. |
| 7 | `00:43.56` | And through the walls of apartments | `00:43.36` | `-0.20 s` / `-6 f` | **Keep.** Useful anticipation. |
| 8 | `00:46.71` | I’ll pass through as a wave of fire | `00:46.61` | `-0.10 s` / `-3 f` | **Keep.** |
| 9 | `01:04.09` | Night in the silence freezes helplessly | `01:04.40` | `+0.31 s` / `+9 f` | **Fix.** It does not fully settle until roughly `01:04.60`, about 15 frames late. |
| 10 | `01:07.14` | The sky sagged a silent ceiling | `01:06.84` | `-0.30 s` / `-9 f` | **Nudge later** by around `0.15–0.20 s`. |
| 11 | `01:10.42` | I remember what happened and questions gnaw at me | `01:10.32` | `-0.10 s` / `-3 f` | **Keep.** Timing is good; wording/line length is the bigger issue. |
| 12 | `01:13.56` | Who am I? Where from? And where is my home? | `01:13.46` | `-0.10 s` / `-3 f` | **Keep.** Timing is good; wording is awkward. |
| 13 | `01:16.81` | My essence walked along the edge | `01:16.41` | `-0.40 s` / `-12 f` | **Nudge later** by roughly `0.25–0.30 s`. |
| 14 | `01:19.94` | My hands shook from the weight of years | `01:19.40` | `-0.54 s` / `-16 f` | **Fix.** Prior lyric loses its ending. |
| 15 | `01:23.14` | Some spoke; others stayed silent | `01:22.40` | `-0.74 s` / `-22 f` | **Fix.** Most obvious early verse cue. |
| 16 | `01:26.36` | And someone behind my back couldn’t hold back laughter | `01:26.26` | `-0.10 s` / `-3 f` | **Keep.** The line itself is too long, but the cue is close. |
| 17 | `01:31.55` | And I’ll erase the horizon | `01:31.35` | `-0.20 s` / `-6 f` | **Keep.** |
| 18 | `01:34.87` | And split it in half | `01:34.67` | `-0.20 s` / `-6 f` | **Keep.** |
| 19 | `01:37.83` | I’ll fold the peaks of every mountain | `01:37.53` | `-0.30 s` / `-9 f` | **Nudge later** by roughly `0.15–0.20 s`. |
| 20 | `01:40.95` | And raise the ocean | `01:41.90` | `+0.95 s` / `+29 f` | **Critical fix.** Nearly one-third of the sung phrase passes under the wrong/blank visual state. |
| 21 | `01:44.31` | I’ll scream to the whole world | `01:44.31` | `0.00 s` / `0 f` | **Keep.** |
| 22 | `01:47.49` | Let the earth tremble | `01:47.29` | `-0.20 s` / `-6 f` | **Keep.** |
| 23 | `01:50.70` | And through the walls of apartments | `01:51.00` | `+0.30 s` / `+9 f` | **Fix.** Blank/blur covers the first syllables. |
| 24 | `01:53.98` | I’ll pass through as a wave of fire | `01:54.50` | `+0.52 s` / `+16 f` | **Fix.** Final lyric arrives clearly late. |

## Best target for the repaired cue system

At 30 fps, use this as a consistent rule:

- Begin the **blur/impact entrance** about **6–8 frames** (`0.20–0.27 s`) before the vocal.
- Make the words **clearly legible 1–3 frames before** the vocal.
- Start the active white karaoke state **on the consonant/vocal onset**.
- Do not begin the outgoing blur until the singer has finished the last meaningful syllable.
- Avoid a fully blank frame between lyric cards unless the music intentionally drops to silence.

---

# 3. Sound-to-animation observations

## What is already synchronized well

- **No stream offset:** audio and video both start at `00:00.000` and end at `02:33.000`.
- **Reactive frequency bars:** comparison of the drawn spectrum to the actual low/mid/high audio energy produced the strongest match at **0 frames of lag**. The overall energy correlation was approximately `0.81`, which is strong for a stylized visualizer. Keep this system as-is.
- **Intro title reveal:** the main title begins entering around `00:03.20`, directly on a musical accent around the same point.
- **Interlude plate:** the switch to `TANISEA — REMIX // 01` around `00:50.20` sits naturally on the musical break.
- **Final Russian title:** the transition begins around `01:58.20`, close to the outro accent. This is a good structural hit.
- **End fade:** picture and sound both resolve at the exact file end rather than leaving a stray audio or black-video tail.

## Where animation weakens the sound relationship

### 00:40.0–00:40.6
The outgoing chorus card becomes too faint before **“Let the earth tremble”** is ready. The vocal begins while the screen is mostly empty. This makes the music feel as if it has lost impact exactly where the lyric should land.

### 01:03.8–01:04.6
The interlude plate exits at the correct structural moment, but the first verse line is not ready. The singer starts at `01:04.09`; the lyric is still blurred/absent for the opening word and does not fully sharpen until roughly `01:04.60`.

### 01:40.9–01:42.0
The animation remains attached to the previous mountain line for almost a full second after **“And raise the ocean”** begins. This is the only cue that looks like a genuine edit/keyframe placement error rather than a small stylistic offset.

### 01:50.7–01:51.1 and 01:54.0–01:54.6
The last two chorus transitions arrive late. Because they are near the final vocal phrase, the errors are especially noticeable: the visual sequence feels as if it is slowing down while the track is still driving forward.

---

# 4. Lyric accuracy and natural-English notes

The English version follows the correct lyric order and is broadly faithful. Most changes below are **naturalization**, not corrections to a totally wrong translation. Shorter, more idiomatic lines will also improve font size, line breaks, and animation timing.

| Current wording | Suggested lyric-film wording | Reason |
|---|---|---|
| **I’ll Scream to the Whole World** | **I’ll Scream for the Whole World to Hear** | Optional title naturalization. The current title is literal but slightly unnatural as an English idiom. Keep the current title if literal fidelity is the priority. |
| **And split it in half** | **And shatter it in two** | `Разобью` carries more force than “split.” The suggested version better matches the song’s aggression and rhythm. |
| **I’ll fold the peaks of every mountain** | **I’ll bend every mountain peak** | “Fold the peaks” sounds mechanically literal. The alternative is shorter and more natural. |
| **And through the walls of apartments** | **Through apartment walls** | The current standalone card feels like an incomplete English fragment and is unnecessarily long. |
| **I’ll pass through as a wave of fire** | **I’ll sweep through like a wave of fire** | More idiomatic and more forceful in English. |
| **Night in the silence freezes helplessly** | **Night freezes helplessly in the silence** | Natural English word order; same image and meaning. |
| **The sky sagged a silent ceiling** | **The sky hangs low, a silent ceiling** | The current phrase needs “like/as” or appositive punctuation. The suggestion is grammatical and more lyrical. |
| **I remember what happened and questions gnaw at me** | **I remember what happened; questions gnaw at me** | Same meaning, cleaner phrasing, and easier two-part highlighting. |
| **Who am I? Where from? And where is my home?** | **Who am I? Where am I from? Where is my home?** | “Where from?” is understandable but non-native English. |
| **My essence walked along the edge** | **My soul walked along the edge** | “My essence” is technically literal but stiff in English. “My soul” is a freer, more lyrical choice. |
| **And someone behind my back couldn’t hold back laughter** | **Behind my back, someone couldn’t hold back a laugh** | Shorter, more natural, and easier to display without shrinking the font. |

## Lines that are already strong

These do not need semantic rewriting:

- `And I’ll erase the horizon`
- `And raise the ocean`
- `I’ll scream to the whole world` — acceptable if retaining the literal title wording
- `Let the earth tremble`
- `My hands shook from the weight of years`
- `Some spoke; others stayed silent`

## Do not add extra lyrics

The full-length original song contains more verse text after **“couldn’t hold back laughter,”** but this 02:33 remix cuts directly back to the build. The time-coded lyric file for the remix jumps from `01:26.36` to `01:31.55`, so the film is correct not to insert **“The wound is fresh…”** or the later full-version verse.

The timed lyric track also ends immediately after the final fire line at approximately `01:54.08`. Therefore, the section after that is an instrumental outro; the long Russian title card is **not covering omitted vocals**.

---

# 5. Typography and readability notes

## Long lines become too small

The following lines are visibly denser than the rest and force a smaller text treatment:

- `01:10.42` — “I remember what happened and questions gnaw at me”
- `01:13.56` — “Who am I? Where from? And where is my home?”
- `01:26.36` — “And someone behind my back couldn’t hold back laughter”

Shortening the English wording will improve both visual consistency and the karaoke fill. Do not solve these only by shrinking the font.

## Line breaks should follow meaning

Prefer semantic breaks rather than whatever fits the box. For example:

```text
Who am I? Where am I from?
Where is my home?
```

is easier to read than leaving `home?` isolated after a long first row.

## Gray inactive words are sometimes too dim

The unsung gray words occasionally disappear into the dark-red hair/background, especially after compression or on a phone. Increase inactive-word luminance slightly, or add a subtle dark stroke/shadow to the entire line. The sung/unsung distinction should remain visible without making the inactive words look disabled.

## Entry blur lasts too long on some cues

The horizontal blur is aesthetically appropriate, but when it occupies `0.30–0.50 s`, the viewer loses the first word. Use the blur as a short pre-roll effect and make the line sharp at the vocal onset. A good maximum is roughly **4–6 frames** of strong blur, with the rest of the entrance already readable.

## Tiny preview text is mostly decorative

The very small upcoming-line text beneath the main lyric is difficult to read at mobile size and sometimes makes the bottom area look like two competing subtitles. Either:

- remove it and keep one clean active line, or
- enlarge it enough to be intentionally readable while keeping it lower-contrast than the current lyric.

## Mobile/platform safe area

The verse/build lyrics sit low in the square frame, close to the spectrum and likely social-platform overlays. For platform versions, move critical lyric text up roughly **40–60 px** and keep it inside the central safe area. The tiny corner labels can remain decorative, but they should not carry essential information.

---

# 6. Pacing and visual-development notes

## 00:04–00:24 intro

The opening title is strong, but it remains for roughly 11 seconds and then disappears around `00:16`, leaving about eight seconds with only the background/spectrum before the first lyric. This is visually under-filled.

A stronger sequence would be:

1. title reveal on the `00:03.2` accent;
2. artist/remix credit variation around the next 4- or 8-bar boundary;
3. slow crop or parallax change after the title exits;
4. first lyric pre-roll beginning around `00:24.15`.

## 00:50–01:04 interlude

`TANISEA — REMIX // 01` is a good section divider, but the plate is nearly unchanged for about 13 seconds. Keep the identity but add one restrained development: a crop shift, outlined-to-filled type change, slow parallax, or a secondary credit/title treatment halfway through.

## 01:59–02:31 instrumental outro

The final Russian title is fully formed around `01:59` and remains essentially unchanged until the fade begins around `02:31`. That is roughly **32 seconds**, over one-fifth of the film.

The outro does not need more lyrics, but it does need visual progression. Suggested four-stage treatment:

- **Stage 1:** Russian title reveal.
- **Stage 2:** add the English title as a smaller translation or swap hierarchy.
- **Stage 3:** change crop/scale and let the title partially deconstruct with the spectrum.
- **Stage 4:** artist/remix end card, then fade.

## Single-image fatigue

The illustration, palette, frame, scanlines, and spectrum form a coherent identity, but the same crop dominates the full 2:33. Preserve the artwork while varying presentation by section:

- verse: slow restrained push-in;
- build: stronger directional move or parallax;
- chorus: brief impact zoom/glitch followed by a stable reading state;
- interlude: alternate crop or negative-space composition;
- outro: gradual pull-back/deconstruction.

The goal is not constant motion. It is to make every structural change in the song produce a corresponding visual change.

## Language hierarchy at the end

The film is labeled `EN LYRIC FILM`, but the longest final title plate is Russian-only. This can be intentional branding, but an English-speaking viewer may read it as a language switch. Add a small **“I’ll Scream for the Whole World to Hear”** subtitle beneath the Russian title, or briefly alternate Russian and English versions.

---

# 7. Audio/export notes

## Loudness and true peak

The embedded audio measures approximately:

- **Integrated loudness:** `-6.0 LUFS`
- **Decoded sample peak:** `0.0 dBFS`
- **Estimated true peak:** about `+2.5 dBTP`

This is an extremely hot master. Do not add any gain in the video project. For a separate platform-delivery encode, leave true-peak headroom—commonly around **-1 dBTP**—to reduce the risk of harshness during AAC/platform transcoding. Keep the untouched label/source master separately if it must remain bit-for-bit or level-identical.

## Codec delivery

The production file uses HEVC, which is efficient and appropriate as a master, but an additional **H.264 High Profile, 1080×1080, 30 fps** distribution copy will generally be easier for social platforms, browsers, and client review systems to ingest.

---

# 8. Better workflow for the next lyric film

1. **Lock the final audio first.** Never retime lyric graphics against a temporary mix.
2. **Build a cue sheet before styling.** Put a marker at every vocal phrase onset and, for karaoke, every important word/syllable.
3. **Make a plain timing pass.** Use sharp white text with no blur, scaling, or glitch. Verify every line at normal speed.
4. **Set one timing rule:** entrance effect starts 6–8 frames early; words are legible by the onset; active fill begins on the onset.
5. **Duplicate repeated sections from the same marker stack.** Do not manually rebuild the second chorus.
6. **Add animation only after timing approval.** Effects must wrap around the cue, not move the readable cue.
7. **Use semantic lyric chunks.** Shorten translations before shrinking the type.
8. **QC in three passes:** full speed for feel, half speed for cue accuracy, and phone-size playback for readability.
9. **Render a timecoded review copy.** A burned-in timecode makes feedback such as “move this 8 frames earlier” unambiguous.
10. **Check audio true peak after export.** Video encoding should not make an already-hot master louder.

---

# 9. Recommended repair order for this exact film

1. Repair `01:40.95` **“And raise the ocean.”**
2. Repair `01:23.14` **“Some spoke; others stayed silent.”**
3. Repair `00:33.87` **“And raise the ocean.”**
4. Repair `01:19.94` **“My hands shook from the weight of years.”**
5. Repair `01:53.98` **“I’ll pass through as a wave of fire.”**
6. Repair the verse entrance at `01:04.09`.
7. Remove the blank gaps at `00:40.23` and `01:50.70`.
8. Apply the smaller 0.30–0.40 s nudges listed in the full cue table.
9. Naturalize/shorten the long English lines.
10. Add visual progression to the 32-second outro.

---

## Final assessment

The film already has a strong visual identity, accurate stream sync, a genuinely responsive spectrum, and good differentiation between build/verse and chorus typography. The main weakness is not the concept—it is the lack of one disciplined cue system. Fixing the eight highlighted cue errors, reusing one chorus timing map, and shortening the awkward English lines would produce the largest improvement without redesigning the project.

**Most important principle for the next version:** let the animation begin before the lyric, but make the words sharp exactly when the singer begins them.
