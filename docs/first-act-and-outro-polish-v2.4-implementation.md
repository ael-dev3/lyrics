# C1 highlight-parity and outro polish v2.4.1

## Scope

Version `v2.4.1` responds to the approved visual review of the repeated chorus and the original-title outro. It supersedes the v2.4.0 C1 visual schedule while preserving the locked soundtrack, reviewed sample-indexed alignment, semantic cue order, artwork, typography, and delivery contracts.

## Repeated chorus parity

The `00:40–00:50` review range falls within the repeated first-chorus window (`C1-05` through `C1-08`), which matches the later chorus (`C2-05` through `C2-08`). The earlier window previously used an independently evolved C1 presentation schedule; the later window used the visually approved C2 choreography.

### Exact issue and root cause

The soundtrack, lyric text, reviewed word anchors, and semantic target order were already correct. The defect was solely in the **visible highlight choreography**: the first repeat used its own precision-profile attack, hold, release, and line-handoff schedule, while the later repeat used the approved cinematic schedule. Because this is a repeated musical phrase, the two highlight passes moved differently even though their words correspond. That made `00:40–00:50` feel out of step with the song compared with the approved `01:46–01:56` reference.

The correction deliberately does not alter the locked audio or the reviewed C1 cue table. At the locked 44,100 Hz sample rate, the full C1 presentation span is `1,631,876–2,171,396` and the approved C2 template span is `4,595,926–5,171,254`. For every C2 visual sample `s`, the public C1 visual schedule uses:

```text
round(1,631,876 + (s - 4,595,926) × 539,520 / 575,328)
```

This affine fit preserves every relative C2 word attack, focus release, inter-word gap, entrance, settle, and ordinary line handoff while landing that choreography over the earlier vocal window. The final `C1-08` exit is intentionally excluded from the fit because it must still hit the dedicated C1 break-card milestone.

The complete first-chorus window now uses the approved later-chorus choreography as its visual schedule. Every `C2-05`–`C2-08` cue and ordinary line-transition sample is affinely fitted from the later chorus's full vocal window to the matching C1 window. This preserves the relative word timing and line handoffs that were judged correct at `01:46–01:56`, while landing them over `00:40–00:50`.

The fitted schedule includes:

- three-frame emphasis attack;
- two-frame focus release;
- the C2 entrance lead, settle, and crossfade geometry after the same fit;
- the C2 cue-stage progression, including its inter-word gaps and non-linear semantic target order.

Only the visible presentation schedule changes. Both chorus performances retain their independent reviewed sample anchors, and the corrected `C1-05`–`C1-08` semantic target order remains unchanged in `cues`. `presentationCues` retain the C1 source cue IDs but use the fitted C2 start/end timing, which lets diagnostics and QA record the source and visible schedules separately. C1-08's exit remains tied to the dedicated break-card milestone rather than the later outro milestone.

## Square-ended spectrum lines

The public bottom spectrum no longer uses rounded rectangles or rounded impact caps. Each measured band and transient extension is rendered as a 7 px SVG line with `stroke-linecap="butt"`. This removes the small circular-looking caps visible at the top of the bars while preserving the 64-band geometry, 96 px measured travel, 18 px maximum transient extension, palette, and zero-phase smoothing.

The transient extension remains separate from the measured core and is omitted entirely when its height is zero, so quiet bands cannot create isolated dots.

## Outro readability

The original-title outro previously entered a deconstruction phase that increased the title flex gap from 17 px to 43 px, added letter spacing, and translated the two title groups in opposite directions. That treatment pulled `ЗАКРИЧУ` and `НА ВЕСЬ МИР` apart without improving comprehension.

The v2.4.1 outro replaces that motion with a restrained centered settle:

- the title gap remains 17 px;
- title letter spacing remains fixed at 0.5 px;
- both title groups stay centered with zero horizontal translation;
- the transition uses only a subtle 6 px upward settle and 2% scale reduction before the final end card.

The ending therefore keeps the original-title phrase visually cohesive while preserving the existing glow, translation, end card, and final fade.

## Verification

The source gates cover the new behavior directly:

- C1-05 through C1-08 are asserted as cinematic and retain their reviewed cue samples;
- C1-07 uses the cinematic one-third emphasis value on cue contact, matching the C2 profile;
- precision-only first-build handoffs retain their exact-contact contract;
- all measured and transient spectrum elements are square-ended SVG lines with no rounded caps or `rx` attributes;
- zero-height transient extensions produce no element;
- the outro test rejects the previous 43 px gap and opposite horizontal translations.

The full 120 fps proof is rendered at four concurrent workers with a 120-second per-frame ceiling, preventing an isolated browser-render stall from invalidating the diagnostic artifact.

The full render, delivery, synchronization-proof, layout, strict-decode, repeated-QA, publication, and checksum gates remain required for the v2.4.1 package.
