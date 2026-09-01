# First-act phrase continuity and two-tone rail implementation

## Scope

Version `v2.2.0` addresses four first-act lyric states and the remaining neutral-looking region in the bottom spectrum. The locked soundtrack, reviewed sample-indexed alignment, stationary lyric geometry, and V1/C2 presentation behavior remain unchanged.

## Presentation timing

The runtime now distinguishes reviewed semantic evidence from public presentation. Every line retains its original `cues` from `alignment/tanisea-word-alignment-v3.json`. A separate `presentationCues` field is identical by default and is specialized only for these requested first-act lines:

| Line | Public focus order |
| --- | --- |
| `C1-01` | `And I'll erase` → `the horizon` |
| `C1-06` | `Let` → `the earth` → `tremble` |
| `C1-07` | `Through` → `apartment` → `walls` |
| `C1-08` | `I'll sweep through` → `like a wave` → `of fire` |

Each public interval begins on an existing reviewed cue onset. Consecutive targets meet without an inactive hole, and the final target holds to the next vocal contact or the authored break. This preserves measured timing authority while presenting the English translation in its natural reading order. The proof composition uses the same presentation intervals while continuing to display the reviewed source-token IDs, uncertainty, confidence, and sample metadata.

All C1 line handoffs are contact-bounded: the outgoing line is present on the frame before the next vocal onset and absent on the incoming contact frame at both 60 and 120 fps. V1 and C2 retain their existing cinematic cues and visual handoffs.

## Bottom spectrum

The 64-band geometry and symmetric zero-phase smoothing are unchanged. The measured core and transient cap now share the same per-band color. Bass bands use ember and the remaining bands use saturated teal. Removing the complementary continuous gradient prevents a grey midpoint; removing the pale high-frequency bar zone keeps low-amplitude bars chromatic. Mint remains limited to tiny labels.

The measured 96 px core travel, 18 px maximum cap, 64 measured bars, 64 caps, 36 px minimum lyric clearance, and lower-frame safe area remain verified.

## Verification

Regression coverage locks the four requested phrase states, every C1 handoff at both cadences, preservation of reviewed cue samples, selected second-act focus states, proof/public agreement, and the two-tone bar palette. The complete source check passes 1,188 tests across 20 files, strict typechecking, browser layout measurement, and composition discovery for 9,180 public frames and 18,360 proof frames.

Rendered review includes a soundtrack-bearing 23–51 second first-act clip, encoded boundary samples for all four phrases, the two-tone spectrum peak, and second-act control frames. Final full-media hashes, repeated QA records, and publication evidence are maintained in [`audits/tanisea-final-qa-vnext.md`](../audits/tanisea-final-qa-vnext.md); supplemental generated artifacts are inventoried in [`docs/workflow-evidence.md`](workflow-evidence.md).
