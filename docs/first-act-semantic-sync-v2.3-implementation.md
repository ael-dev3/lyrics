# First-act semantic resynchronization and cue rail implementation

## Scope

Version `v2.3.0` reworks the requested `00:40–00:50` passage and the horizontal lyric progress rail. The locked soundtrack, reviewed sample-indexed alignment, stationary English layout, approved two-tone spectrum, and V1/C2 presentation remain unchanged.

## Root cause and correction

Version 2.2 presented `C1-06` and `C1-07` in left-to-right English reading order. The performed Russian places the translated concepts in a different order, so that presentation inverted two audible semantic contacts. It also held the last `C1-08` target through the authored break instead of releasing at the reviewed vocal end.

Version 2.3 makes `C1-06`, `C1-07`, and `C1-08` presentation cues exactly mirror the reviewed semantic targets and exclusive end samples:

| Line | Sample-reviewed public focus sequence |
| --- | --- |
| `C1-06` | `Let` → `tremble` → `the earth` |
| `C1-07` | `Through` → `walls` → `apartment` |
| `C1-08` | `I'll sweep through` → `like a wave` → `of fire` |

The visible backward contacts are intentional: they follow the performed source meaning while the translated English words remain stationary. `C1-08 / of fire` now releases at sample `2,171,396` (`49.238005 s`) instead of remaining active to the break. The underlying alignment JSON was not changed.

## Contact-locked first-act handoffs

Encoded boundary review showed that the former 240 ms lyric entrance lead visibly stacked the incoming first-act line over the outgoing line before its vocal began. Every C1 entrance and internal handoff now uses a 368-sample lead—one 120 fps proof frame. At public cadence, the incoming line is absent or zero-opacity on the frame before contact and fully visible on the nearest contact frame. The outgoing line remains present through the preceding frame and is absent on contact. Later cinematic handoffs are unchanged.

## Cue-synchronous horizontal rail

The horizontal rail no longer interpolates across the broad vocal envelope. It advances through equal cue stages, moves only while a reviewed presentation cue is active, pauses during measured inter-word gaps, and reaches completion at the final exclusive cue end. This makes the rail's leading ember edge agree with the same sample-derived contacts that control word emphasis.

## Verification design

Regression coverage proves the corrected semantic targets at `42.0`, `44.2`, `46.0`, `46.6`, and `48.0` seconds; inactive release at `49.6` seconds; cue-stage progress and gap holds; exact C1 precontact/contact opacity at 60 and 120 fps; and preservation of all reviewed source cues.

Generated QA now adds a soundtrack-bearing `39.5–50.5 s` range at normal and pitch-preserved half speed. The contact authority expands to 19 high-risk cues, including every cue in `C1-06`, `C1-07`, and `C1-08`, with offsets `-1`, `0`, `+1`, and `+2` at both 60 and 120 fps. This produces 152 exact contact frames and 12 labeled contact sheets in the canonical QA-media package.

Final full-media hashes, repeated QA records, publication evidence, and the generated visual review are maintained in [`audits/tanisea-final-qa-vnext.md`](../audits/tanisea-final-qa-vnext.md) and the supplemental workflow evidence package.
