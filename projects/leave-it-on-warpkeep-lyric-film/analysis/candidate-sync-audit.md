# Leave It On: acoustic candidate and timing risk audit

**Status: candidate-only.** Read-only audit of `data/lyrics.json` against retained analysis on 2026-09-27. This audit did not include perceptual playback and does not complete the [mandatory actual-audio synchronization review](../../../docs/cross-language-sync-gate.md). User preview acceptance and render authorization are recorded separately by the production owner.

## Inputs and method

- Original source SHA-256: `376926ae77af41789ac620685dd15b5e1515e3777aece65e964463277e5cfe44` (`source/Leave It On.m4a`, kept local).
- Timed text SHA-256 at this audit: `3072715a12467155bb440f5d8874e126b3e5a4d91c9abdcbfd532ae17e5e6173`.
- Examined `data/lyrics.json`, `analysis/word-candidates.json`, both retained unforced Whisper outputs, and the earlier [source analysis](README.md).
- Reviewer role: automated structural and model-candidate audit. The available model interface cannot perceive audio; an attempted extracted clip was omitted by the tool because audio input is unsupported. No listening or reduced-speed adjudication is claimed.
- Five alignment candidates include mix/stem runs of related CTC model families plus Stable Whisper. They are hypotheses conditioned on supplied words. The two unforced Whisper passes help locate phrases but share a model family; neither proves wording or timing.

## Quantitative result

- **63 cues, 343 words**; all cue and word `requiresReview` flags remain true. L21–L24 are four supplied first-chorus entries excluded from the candidate map.
- **0 structural findings**: unique IDs, line/word containment, nonoverlapping display intervals, candidate provenance and 48 kHz sample-grid fields passed. `L44-W03` and `L47-W01` use explicit `next-word-measured-onset` ends to resolve candidate overlap.
- Candidate spread exceeds 25 ms for **342/343** words; 100 ms for **304**, 250 ms for **169**, and 500 ms for **90**. Median is **0.245 s** and maximum **4.996 s**. Disagreement can include aligner drift; these are not measured errors in the selected boundary.
- The last selected word ends at **268.651 s** and its display ends at **269.684 s**. Original media duration is **273.560 s**. Preserve the remaining playback tail.

## Priority listening risks

| Source region | Candidate evidence | Unresolved determination |
| --- | --- | --- |
| 7–18.8 s; L01–L02 | Initial breath and processed `on` have divergent boundaries. | Confirm each onset and the `on` release at normal and reduced speed. |
| 49.7–52.0 s; L09 | Supplied `look at yet` versus turbo ASR `get yet`. | Confirm performed wording; retain supplied text pending listening. |
| 84.7–101.5 s; L19–L26 | Two unforced Whisper passes recover two refrain pairs; embedded text lists four. | Confirm performed count and independent held-vowel releases. |
| 102.9–110.7 s; L27–L28 | Fantasy names and `starways grown` receive phonetic ASR variants, including `growing`. | Confirm wording rather than treating recognizer spelling as authority. |
| 119.2–126.8 s; L31–L32 | Embedded `Core` cue is early relative to acoustic candidates. | Confirm word contacts and releases; check semantic effect lifetime separately. |
| 135–138.4 s; L35 | Supplied `An empire` conflicts with turbo ASR `Power`. | Confirm performed lyric. |
| 161.5–175.7 s; L43–L46 | Second-chorus candidate drift reaches 4.453 s. | Review each repeated performance and release independently. |
| 178.8–183.6 s; L47–L48 | `Farcaster` is phonetically uncertain; embedded cue was early. | Confirm text and boundaries; L47-W01 has a measured-next-onset end. |
| 196.6–214 s; bridge gap | Turbo emits an isolated `you` near 204 s; focused small stem does not establish it. | Decide whether a sung word, echo or hallucination occurs. |
| 229.6–240.2 s; L59–L61 | Turbo emits processed `on` repetitions; focused small stem does not establish them. L60 spread reaches 4.996 s. | Distinguish sung rearticulation or backing from effects/reverb. |
| 242.6–273.6 s; L62–L67 | Supplied `window glows` / `You still there?` differ from unforced `window goes` / `You're still there`; small stem omits the river line. | Confirm each outro line, final release and complete tail. |

## Complete cue inventory

The rightmost value is the largest model-candidate spread among words in that cue, not a pass/fail or selected-boundary error. Every row needs actual-audio review and both-format focus review before it can be called synchronized.

| Cue | Candidate vocal span (s) | Words | Max spread (s) | Performed-text candidate |
| --- | ---: | ---: | ---: | --- |
| L01 | 7.604–8.490 | 3 | 0.624 | You still there? |
| L02 | 16.204–17.130 | 3 | 0.905 | Leave it on. |
| L03 | 24.561–27.207 | 8 | 0.601 | I found your name at half past two, |
| L04 | 28.811–31.818 | 7 | 1.431 | with half a world between our rooms. |
| L05 | 33.081–36.008 | 7 | 0.481 | We'd spent our days inside a feed |
| L06 | 37.392–40.159 | 6 | 1.392 | that had a price for everything. |
| L07 | 41.141–43.720 | 7 | 1.268 | You showed me where the river bends, |
| L08 | 45.411–47.777 | 6 | 1.711 | the timber stacked beside the wall. |
| L09 | 49.681–52.026 | 7 | 0.982 | There wasn't much to look at yet. |
| L10 | 53.990–56.495 | 7 | 1.884 | We stayed until the lamps came on. |
| L11 | 59.361–61.605 | 7 | 0.361 | You left a gap beside the gate. |
| L12 | 61.705–63.609 | 7 | 0.245 | I asked what you were saving for. |
| L13 | 63.649–65.793 | 7 | 0.160 | You said, "We haven't met them yet," |
| L14 | 65.834–68.639 | 7 | 0.719 | and went on working in the rain. |
| L15 | 69.220–71.266 | 5 | 0.745 | Let them sell another future. |
| L16 | 71.366–73.540 | 6 | 2.386 | We're still working on this one. |
| L17 | 77.801–80.028 | 6 | 0.461 | There's a light across the water |
| L18 | 80.089–82.015 | 6 | 1.284 | and a door we haven't hung. |
| L19 | 84.741–88.511 | 3 | 1.631 | Something that stays |
| L20 | 88.551–90.476 | 5 | 1.691 | when the feed moves on. |
| L25 | 93.281–97.030 | 3 | 1.570 | Something that stays |
| L26 | 97.070–99.014 | 5 | 1.630 | when the feed moves on. |
| L27 | 102.981–106.369 | 5 | 0.544 | Warpkeep—Hyperion dreamed in stone, |
| L28 | 106.449–110.700 | 7 | 0.575 | the starways grown through root and rain. |
| L29 | 110.810–114.134 | 6 | 0.443 | A river threads a thousand doors; |
| L30 | 114.194–117.999 | 6 | 0.969 | the old tombs let tomorrow in. |
| L31 | 119.160–122.529 | 5 | 1.252 | The Core keeps dreaming underneath, |
| L32 | 123.491–126.819 | 7 | 0.315 | where no one hears the turning gears. |
| L33 | 127.200–130.247 | 6 | 1.027 | Above it, someone lights the forge. |
| L34 | 131.189–135.659 | 5 | 1.420 | Above it, someone's waiting here. |
| L35 | 136.501–138.344 | 6 | 0.441 | An empire is a distant thing. |
| L36 | 138.405–140.529 | 7 | 0.227 | The work is close enough to touch. |
| L37 | 140.589–142.673 | 6 | 0.232 | You put another beam in place. |
| L38 | 142.693–144.717 | 6 | 1.199 | For once, that feels like enough. |
| L39 | 146.060–148.206 | 5 | 0.585 | Let them sell another future. |
| L40 | 148.206–150.271 | 6 | 2.436 | We're still working on this one. |
| L41 | 154.621–156.848 | 6 | 0.582 | There's a light across the water |
| L42 | 156.908–158.473 | 6 | 1.906 | and a door we haven't hung. |
| L43 | 161.541–165.290 | 3 | 4.453 | Something that stays |
| L44 | 165.290–167.540 | 5 | 2.827 | when the feed moves on. |
| L45 | 170.041–173.790 | 3 | 4.453 | Something that stays |
| L46 | 173.811–175.655 | 5 | 3.295 | when the feed moves on. |
| L47 | 178.781–181.511 | 6 | 0.388 | On Farcaster, I bought your song. |
| L48 | 181.551–183.639 | 7 | 0.359 | You said it kept the lights on. |
| L49 | 183.841–185.865 | 6 | 0.322 | A hundred little trades like that— |
| L50 | 185.865–187.850 | 6 | 0.215 | a street where nothing stood before. |
| L51 | 187.870–189.995 | 5 | 0.473 | Let companies keep their signs. |
| L52 | 190.035–191.979 | 7 | 0.339 | We'll keep the names we answer to. |
| L53 | 192.581–194.246 | 7 | 0.321 | I don't need to own your world. |
| L54 | 194.307–196.634 | 8 | 0.486 | I need a way to get to you. |
| L55 | 214.001–216.146 | 5 | 0.305 | Let them sell another future. |
| L56 | 216.166–218.131 | 6 | 0.289 | We're still working on this one. |
| L57 | 222.650–224.794 | 6 | 0.320 | There's a light across the water |
| L58 | 224.854–227.297 | 6 | 1.042 | and a door we've finally hung. |
| L59 | 229.621–231.565 | 3 | 4.876 | Something that stays |
| L60 | 233.490–235.560 | 5 | 4.996 | when the feed moves on. |
| L61 | 238.162–240.115 | 3 | 1.192 | Something that stays. |
| L62 | 242.644–243.875 | 3 | 0.679 | I'm still here. |
| L63 | 246.583–247.471 | 3 | 0.390 | Leave it on. |
| L64 | 254.824–256.153 | 3 | 0.710 | The river runs. |
| L65 | 259.082–260.453 | 3 | 0.449 | The window glows. |
| L66 | 263.542–265.017 | 3 | 0.545 | You still there? |
| L67 | 267.884–268.651 | 3 | 0.484 | I'm still here. |

## Interpretation

The structural result supports this map as a reproducible preview candidate. It does not resolve performed-text disputes, sung boundaries, processed repeats or the final release. Granular synchronization fields should remain incomplete until a reviewer with actual audio access records the full and reduced-speed checks. User acceptance and a scoped production decision remain separate from synchronization completeness.
