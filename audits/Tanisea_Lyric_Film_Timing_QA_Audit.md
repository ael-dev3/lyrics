# Tanisea — “I'll Scream to the Whole World”
## Timing / animation / lyric QA audit

**Audited file:** `Tanisea - I'll Scream to the Whole World [English Lyric Film - Production Master].mp4`  
**Duration:** 153.00 s  
**Video:** 1080×1080, 30 fps, HEVC  
**Audio:** AAC, 44.1 kHz stereo  
**Detected musical pulse:** ~152 BPM  
**Audit sampling:** visual state checked at 0.25 s intervals, with closer frame inspection around lyric changes; audio phrase attacks checked against waveform / onset strength / spectrogram.  
**Timing precision:** treat the offsets below as approximately **±0.10–0.15 s**, not sample-accurate forced alignment.

---

# Executive verdict

The film is **already well synchronized overall**. The main problem is not random bad timing. It is a more specific pattern:

1. The **first chorus is mostly tight**, although several lyrics become fully readable 0.3–0.5 s after the vocal attack because the blur-in begins too close to the sung onset.
2. The **verse starts tight, then drifts early across lines 5–7**, reaching roughly 0.7 s early before snapping back into sync on the final line.
3. The **second chorus contains the largest objective misses**, especially **“And raise the ocean” (~1.17 s late)** and **“I'll pass through / as a wave of fire” (~0.86 s late)**.
4. The karaoke-style **internal word/chunk highlighting is often better synchronized than the lyric-card entrances themselves**. Preserve that idea.
5. The likely root cause is **timing by chained durations rather than absolute audio anchors**. Small duration errors accumulate, then later manual corrections reset the drift.

### Overall timing score

- **First chorus:** ~9/10
- **Verse:** ~8.5/10
- **Second chorus:** ~7.5–8/10
- **Whole film synchronization:** ~8.5/10

The biggest gain next time is not more animation. It is a stricter timing pipeline.

---

# How to read the tables

**Audio onset** = prominent attack / phrase start visible in the audio analysis.  
**Readable visual onset** = first sampled moment where the main English lyric is substantially sharp and readable, rather than still being a blurred transition.  
**Offset** = visual onset minus audio onset.

- `+` = visual becomes readable **late**
- `−` = visual becomes readable **early**
- under ~0.20 s = effectively tight
- ~0.20–0.35 s = minor
- ~0.35–0.60 s = noticeable
- over ~0.60 s = clear mismatch

The blur animation usually starts ~0.25 s before the listed readable onset. That softens some small positive offsets, but it does **not** explain the large second-chorus misses.

---

# 1. First chorus — 00:24 to 00:50

| Lyric | Audio onset | Readable visual onset | Offset | Assessment |
|---|---:|---:|---:|---|
| And I'll erase the horizon | 00:24.18 | 00:24.50 | **+0.32 s** | Minor late-readable feel; blur begins close to the actual vocal attack |
| And split it in half | 00:27.24 | 00:27.75 | **+0.51 s** | **Noticeably late** at the beginning of the line |
| I'll fold the peaks / of every mountain | 00:30.43 | 00:30.50 | **+0.07 s** | Excellent |
| And raise the ocean | 00:33.63 | 00:33.50 | **−0.13 s** | Excellent |
| I'll scream to / the whole world | 00:37.00 | 00:37.00 | **~0.00 s** | Excellent; use this as a reference implementation |
| Let the earth tremble | 00:40.03 | 00:40.50 | **+0.47 s** | Noticeably late-readable; animation starts around 00:40.25 |
| And through the walls / of apartments | 00:43.24 | 00:43.50 | **+0.26 s** | Minor |
| I'll pass through / as a wave of fire | 00:46.44 | 00:46.75 | **+0.31 s** | Minor |

## First-chorus details

### 00:24.18–00:24.50 — opening lyric
The vocal phrase begins around 24.18 s. The lyric is still entering / blurred around 24.25 s and becomes clearly readable around 24.50 s. The viewer hears the first words before receiving a fully sharp lyric.

**Better:** begin the blur around **23.95–24.00** and hit the fully sharp state at **24.18**.

### 00:27.24–00:27.75 — “And split it in half”
This is the first clear timing soft spot. The vocal phrase attacks around 27.24 s, while the old line is still fading at ~27.25 and the new line is blurred around ~27.50. It is not sharply readable until ~27.75.

**Correction:** shift the whole card entrance roughly **0.4–0.5 s earlier**.

The internal second chunk is actually good: the visual transition toward **“in half”** occurs around 28.75 s, close to a strong audio event around 28.83 s.

### 00:33.50–00:35.25 — “And raise the ocean”
The main entry is good. The second semantic chunk (“the ocean”) visually completes slightly before the corresponding stronger audio accent around 35.2 s, but only by a few tenths. This is acceptable and feels intentional rather than broken.

### 00:37.00–00:38.50 — “I'll scream to / the whole world”
**Best synchronized sequence in the film.**

- Main readable entry: ~37.00 s
- Audio attack: ~37.00 s
- Second large chunk becomes emphasized around ~38.50 s
- Strong corresponding audio accent: ~38.43 s

This is the timing model to copy next time.

### 00:40.03–00:40.50 — “Let the earth tremble”
The visual starts its blur around 40.25 but becomes readable only around 40.50, after the phrase attack around 40.03.

**Correction:** move the transition earlier by ~0.3–0.45 s, or make the blur-to-sharp phase shorter.

---

# 2. Verse — 01:04 to 01:29

The verse exposes the clearest **cumulative scheduling drift**. The audio phrase attacks form an extremely regular ~3.2 s grid:

`64.03 → 67.22 → 70.43 → 73.62 → 76.84 → 80.03 → 83.22 → 86.43`

The visual schedule gradually moves ahead of it through the middle/end of the verse.

| Lyric | Audio onset | Readable visual onset | Offset | Assessment |
|---|---:|---:|---:|---|
| Night in the silence freezes helplessly | 01:04.03 | 01:04.25 | **+0.22 s** | Minor |
| The sky sagged a silent ceiling | 01:07.22 | 01:07.00 | **−0.22 s** | Minor early |
| I remember what happened and questions gnaw at me | 01:10.43 | 01:10.50 | **+0.07 s** | Excellent |
| Who am I? Where from? And where is my home? | 01:13.62 | 01:13.50 | **−0.12 s** | Excellent |
| My essence walked along the edge | 01:16.84 | 01:16.50 | **−0.34 s** | Slightly early |
| My hands shook from the weight of years | 01:20.03 | 01:19.50 | **−0.53 s** | **Noticeably early** |
| Some spoke; others stayed silent | 01:23.22 | 01:22.50 | **−0.72 s** | **Clear early mismatch** |
| And someone behind my back couldn't hold back laughter | 01:26.43 | 01:26.50 | **+0.08 s** | Re-synchronized / excellent |

## What happened here

Lines 1–4 are basically locked. Then the visual schedule begins to shorten relative to the song:

- line 5: ~0.34 s early
- line 6: ~0.53 s early
- line 7: ~0.72 s early
- line 8: corrected back to ~0.08 s late

That pattern is highly characteristic of **duration accumulation**. It looks as if each card was given a manually estimated duration and the errors stacked, rather than every card being anchored independently to an absolute audio timestamp.

### 01:19.25–01:20.03 — “My hands shook…”
The new card begins blurring around 79.25 s and is already readable around 79.50 s, while the next regular vocal phrase attack lands around 80.03 s.

**Correction:** move this card roughly **0.5 s later**.

### 01:22.25–01:23.22 — “Some spoke…”
This is the largest verse drift. The line is already entering around 82.25 and readable by 82.50, while the regular phrase grid places the vocal attack around 83.22.

**Correction:** move the card roughly **0.7 s later**.

### 01:26.25–01:26.50 — final verse line
The final line snaps almost perfectly back into alignment. This makes the preceding drift more noticeable because it confirms that the audio itself is not irregular; the visual timing was corrected.

---

# 3. Second chorus — 01:31 to 01:58

This is where the most important corrections are needed.

| Lyric | Audio onset | Readable visual onset | Offset | Assessment |
|---|---:|---:|---:|---|
| And I'll erase the horizon | 01:31.37 | 01:31.50 | **+0.13 s** | Excellent |
| And split it in half | 01:34.42 | 01:34.75 | **+0.33 s** | Minor |
| I'll fold the peaks / of every mountain | 01:37.64 | 01:37.50 | **−0.14 s** | Excellent |
| And raise the ocean | 01:40.83 | 01:42.00 | **+1.17 s** | **Major mismatch** |
| I'll scream to / the whole world | 01:44.20 | 01:44.50 | **+0.30 s** | Minor |
| Let the earth tremble | 01:47.24 | 01:47.50 | **+0.26 s** | Minor |
| And through the walls / of apartments | 01:50.43 | 01:51.00 | **+0.57 s** | **Noticeably late** |
| I'll pass through / as a wave of fire | 01:53.64 | 01:54.50 | **+0.86 s** | **Major late mismatch** |

## 01:40.83–01:42.00 — biggest timing error in the film
The audio has already moved into **“And raise the ocean”** around 100.83 s, but visually **“I'll fold the peaks…”** is still on screen through ~101.25. The new line only begins transitioning around ~101.75 and becomes readable around 102.00.

This creates approximately **one full second where the viewer is reading the previous lyric while hearing the next phrase**.

**Correction:** move the “And raise the ocean” card roughly **0.9–1.2 s earlier**.

This is the single highest-priority timing fix.

## 01:50.43–01:51.00 — “And through the walls…”
The line is roughly half a second late. The blur entrance partly masks the error, but because the second chorus is already drifting, the delay becomes perceptible.

**Correction:** ~0.4–0.6 s earlier.

## 01:53.64–01:54.50 — “I'll pass through / as a wave of fire”
The final chorus line becomes clearly readable nearly 0.9 s after the audio phrase begins.

**Correction:** shift the card ~0.7–0.9 s earlier.

Because this is the climactic final lyric before the Russian title card, it is worth making this one frame-perfect.

---

# 4. Blur / focus animation is creating “false lateness”

The blur-in language looks good aesthetically, but it often consumes the first **~0.25 s** of a phrase. That means an animation can technically start near the vocal onset while the lyric remains unreadable until afterward.

For a lyric film, the important timestamp is not **when the animation begins**. It is **when the words become readable**.

## Better rule

For each phrase:

- **T − 0.18 s:** begin blur / movement
- **T:** text reaches sharp, stable, readable state
- **T + internal lyric timing:** highlight semantic chunks / words
- **phrase end + 0.10–0.20 s:** begin exit

Do not begin the blur at T. Finish it at T.

The current **“I'll scream to / the whole world” at 37.0 s** is the closest thing to this ideal.

---

# 5. Internal word / chunk highlighting: mostly a success

This is one of the strongest ideas in the video. The English words do not need to match Russian syllables one-for-one; they need to match **semantic vocal chunks**.

Good examples:

### 00:24–00:26 — “And I'll erase / the horizon”
The second chunk visually completes around ~25.75 s, close to a prominent audio event around ~25.62 s. This feels natural.

### 00:27–00:29 — “And split it / in half”
Although the card itself enters late, the transition toward **“in half”** around ~28.75 is very close to an audio accent at ~28.83.

### 00:37–00:39 — “I'll scream to / the whole world”
Best example. The large second chunk lands almost directly on the corresponding musical/vocal accent (~38.43 s).

## Recommendation

Keep chunk-based karaoke timing, but author the chunk timings from the **Russian delivery**, not from equal divisions of the English sentence.

The unit should be:

> Russian sung phrase / stress → corresponding English meaning chunk → visual emphasis

not:

> English word count ÷ line duration

---

# 6. Intro pacing — good art-film pacing, weak social-feed pacing

### 00:03–00:15
The main English title builds and holds well.

### ~00:15–00:24
The title leaves and there is roughly a long stretch with the illustration / interface but no major textual focal point before the first lyric arrives.

For a viewer who already chose to watch a lyric film, this is atmospheric. For X / social feeds, it is expensive dead time.

## Better next time

Either:

1. keep the title alive until closer to the first vocal,
2. use the empty period for source / artist / remix / translation context,
3. gradually dismantle the title in beat-synchronized pieces, or
4. create a separate **15–25 s discovery cut** that starts near the first chorus and links to the full film.

Do **not** necessarily shorten the full art version if you like the pacing. Make a social cut and a full cut.

---

# 7. Outro pacing — 01:58 to 02:33

The Russian title card **“ЗАКРИЧУ НА ВЕСЬ МИР”** arrives around 118.25 s and then remains the dominant central element for most of the remaining ~35 s while the audio continues energetically before fading.

The waveform still moves, so the screen is not literally static, but the hierarchy is static for a long time.

## Better next time

During a long instrumental outro, introduce very subtle 8-bar changes rather than a new flashy animation:

- 1–2% slow scale / camera drift on the art
- slight title tracking changes
- title opacity breathing only on major musical accents
- tiny metadata swaps (artist / remix / translation credit)
- one controlled color-temperature or grain transition
- let the title eventually disappear so the illustration owns the final few seconds

Keep it restrained. The current aesthetic would be damaged by random motion everywhere.

---

# 8. Audio master / encode issue

Measured from the supplied production master:

- **Integrated loudness:** approximately **−6.0 LUFS**
- **True peak:** approximately **+2.5 dBTP**
- **Loudness range:** ~9.6 LU

That is extremely hot for a social-video master. A positive true peak means the decoded AAC signal produces inter-sample overs above 0 dBFS, increasing the chance of distortion after another platform transcode.

## Better output target

For a social upload copy:

- ceiling: **−1.0 dBTP** (or −1.5 dBTP if you want extra transcode safety)
- do not add any more gain
- if you control mastering, something around **−9 to −12 LUFS integrated** is already very loud; there is little benefit in pushing a lyric film to −6 LUFS

Keep the untouched/source audio separately if provenance matters. Make a platform-safe encode as the delivery file.

---

# 9. English lyric / translation notes

These are not “wrong” so much as places where literal translation fights natural English rhythm. For future English-facing films, consider optimizing for **meaning + cadence**, not literal syntax.

### “Night in the silence freezes helplessly;”
Understandable, but stiff. The semicolon also implies a grammatical continuation that the next line does not really provide.

Possible direction:

- “Night freezes helplessly in the silence”
- “Night lies frozen in the silence”

### “The sky sagged a silent ceiling”
Poetic idea is clear, but English wants a connector.

Possible direction:

- “The sky sagged like a silent ceiling”
- “The sky hung low, a silent ceiling”

### “Who am I? Where from? And where is my home?”
“Where from?” is compressed / stylized English. It can work lyrically, but normal English is “Where am I from?” If cadence is the priority, the current version is defensible.

### “My essence walked along the edge”
This sounds machine-translated in English because “essence” rarely behaves as an acting subject.

Possible direction:

- “My being walked along the edge”
- “My soul walked along the edge” (more interpretive)
- “I walked along the edge” (least literal, most natural)

### “And someone behind my back couldn't hold back laughter”
Accurate idea, but very long relative to the Russian delivery and visually dense.

Possible direction:

- “Behind my back, someone couldn't hold back a laugh”
- “Behind my back, someone laughed” (much more compressed)

### “And through the walls of apartments / I'll pass through as a wave of fire”
The literal structure is awkward in English and repeats “through.” This is one of the strongest candidates for cadence-first localization.

Possible direction:

> “Through apartment walls / I'll sweep like a wave of fire”

That is shorter, cleaner, more singable/readable, and easier to synchronize visually.

---

# 10. Typography / mobile readability

The main lyric sizes generally survive the square format well. The weakest elements for mobile are the very small metadata / next-line preview text.

## Keep

- strong white vs muted-grey karaoke contrast
- centered chorus typography vs left-aligned verse typography
- limited color palette
- waveform as a continuous technical motif
- large central chorus cards for emotional peaks

## Improve

- make secondary / upcoming lyric text slightly larger or remove it when it becomes too small to contribute
- ensure grey inactive words remain readable after aggressive H.264/X compression
- reduce blur duration rather than increasing blur strength
- use fewer tiny labels if the final delivery target is a phone screen

---

# 11. The likely root cause: relative durations instead of absolute anchors

The timing pattern strongly suggests something like:

```text
line_1 starts
wait N seconds
line_2 starts
wait N seconds
line_3 starts
...
```

That is fragile. A 150–200 ms error per line becomes a visible mismatch after several lines.

## Better architecture for the next Codex-built lyric film

Create a timing manifest where **every lyric line and every emphasis event is anchored to an absolute timestamp**.

Example:

```json
{
  "section": "verse_1",
  "events": [
    {
      "text": "My hands shook from the weight of years",
      "audio_onset": 80.028,
      "enter_start": 79.848,
      "readable_at": 80.028,
      "exit_start": 82.950
    },
    {
      "text": "Some spoke; others stayed silent",
      "audio_onset": 83.220,
      "enter_start": 83.040,
      "readable_at": 83.220,
      "exit_start": 86.150
    }
  ]
}
```

Never derive `line_7.start` from `line_6.start + line_6.duration` if you can avoid it.

---

# 12. Recommended QA pipeline for next time

## Phase A — audio mapping

1. Extract WAV from the exact final music file.
2. Detect BPM / beat grid.
3. Mark every **vocal phrase onset manually** while viewing waveform + spectrogram.
4. Mark important internal accents / semantic chunk changes.
5. Store all anchors as absolute seconds.

## Phase B — translation

1. Translate for meaning first.
2. Rewrite for natural English.
3. Break each line into chunks that correspond to the Russian vocal stresses.
4. Keep English screen density low enough to read at phone size.

## Phase C — animation timing

For each lyric onset `T`:

```text
T - 0.18 s   begin entrance / blur
T            fully readable + first highlight
T + ...      internal chunk highlights
T + tail     remain readable briefly
phrase end   exit
```

## Phase D — automated visual QA

Have Codex generate:

- a 4 fps contact sheet with burned-in timecode
- an audio onset list
- a table of planned lyric onsets vs detected / manually verified audio anchors
- warnings for any offset > 0.30 s
- a debug render where lyric-event timestamps are visible

## Phase E — final encode QA

Check:

- true peak ≤ −1 dBTP
- no clipping after AAC/H.264 encode
- mobile-size readability
- first 3 seconds visually meaningful
- first vocal lyric already sharp on its sung onset
- repeated choruses use the same trusted timing template unless the remix actually changes the vocal timing

---

# 13. Priority fixes if you ever revise this exact film

In order:

1. **01:40.83–01:42.00 — “And raise the ocean”**: move ~0.9–1.2 s earlier.
2. **01:53.64–01:54.50 — “I'll pass through / as a wave of fire”**: move ~0.7–0.9 s earlier.
3. **01:22.50 — “Some spoke; others stayed silent”**: move ~0.6–0.7 s later.
4. **01:50.43–01:51.00 — “And through the walls / of apartments”**: move ~0.4–0.6 s earlier.
5. **01:19.50 — “My hands shook from the weight of years”**: move ~0.4–0.5 s later.
6. **00:27.24–00:27.75 — “And split it in half”**: make the lyric readable ~0.4 s earlier.
7. **00:40.03–00:40.50 — “Let the earth tremble”**: make it readable ~0.3–0.4 s earlier.
8. Create a platform-safe audio master with a **≤ −1 dBTP** ceiling.

Everything else is refinement rather than repair.

---

# Final takeaway

The important lesson from this film is **not** “sync everything more aggressively.” Much of it is already excellent.

The lesson is:

> **Anchor every lyric to the audio independently, make the text reach sharp focus on the vocal onset, and let the animation happen around the anchor rather than replacing the anchor.**

The visual system itself is strong. The best next version should preserve the same restraint, waveform language, chorus/verse hierarchy, and semantic karaoke highlighting, while replacing hand-timed cumulative durations with a deterministic timing manifest.

The film does not need more effects. It needs **more exact temporal authorship**.
