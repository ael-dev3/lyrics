# Leave It On — a signal becomes a place

Current revision: **`preview-v2-pr375`**. The film is built around the animated Warplet castle from [Warpkeep PR #375 at `75934520a8dc295c8b68d4c8c197785299e2ff0b`](https://github.com/ael-dev3/Warpkeep/tree/75934520a8dc295c8b68d4c8c197785299e2ff0b), with deliberate YouTube 16:9 and TikTok 9:16 compositions. This document distinguishes the current source implementation from earlier story proposals and pending review. Reading the code does not establish that the complete moving picture has passed visual or listening review.

## Current art direction

The castle and its separately rigged rooftop Warplet are the recurring subjects. The exact emblem remains on the original fabric. Guards, lamplighter, rabbit, birds, fires, foliage and landscape make the place feel occupied. The familiar light, threshold and river motifs return through the recording; electronic energy comes through lighting, the field and the measured visualizer without scaling the architecture to bass.

The current commissioned treatment places lyrics within the scene. This supersedes the supplied brief's fixed flat lyric region. The implementation is a **film-authored magical inscription above the forecourt**, supported by a faint same-text projection on the cobbles and small anchor stones. It is not text painted onto an original castle wall or woven into its cloth. The transparent lettering has no rectangular plaque behind it. The existing castle surfaces and emblem remain intact.

In `src/world-lyrics.js`, the inscription faces the camera and keeps a fixed world anchor through each phrase. Landscape uses `[3.8, 8.1, 21]` with a 27.5 m canvas width; portrait uses `[0.7, 7.2, 21]` with a 15.5 m width. Complete phrase geometry is cached before highlighting, with at most three rows and whole-phrase fitting where needed. The base font sizes are 175 atlas pixels in landscape and 225 in portrait; those atlas values are not output-pixel sizes. Only color and luminance change for the active word. Warm `#fff4ad` focus, pale-cyan `#c2dce7` inactive words and a dark contour protect the letters without an opaque panel. The projection shares the same text and focus state at much lower opacity. This is an intentionally staged fantasy installation, not an assertion that such a lyric display exists in gameplay.

The visible visualizer has two related placements: **48 stone-based resonators along the approach** and **48 radial rune segments around the guardian ward**. Both use the recording's actual 48-band, 25 Hz spectrum. A shared full-recording reference preserves the relative strength of quiet and loud passages; display-height shaping and chorus ceilings are artistic mappings. The radial segments are particularly useful where portrait framing reduces the visible approach. River response and practical-light emission provide smaller supporting motion. The exact music features, lyric focus, authored scene envelopes and story states remain separate on the source clock.

`src/magic-vfx.js` gives the electronic treatment three spatial owners. A continuous cyan seam follows the native arch at z8.84, with glyphs on its piers and a threshold circle in the paving. Thin cyan/violet ribbons and sparse gold light motes rise beside the towers; those particles stay behind z13, outside the defined lyric region. A coherent circular ward centered at `[0,16,-5]` sits behind the guardian. Its measured radial segments extend from radius 8.1 to at most 9.405 m, keeping the highest point below y25.405. Audio controls bounded emission and extension; phase and particle positions reconstruct from source time. Reduced motion freezes these particle routes and limits radial travel. The original castle geometry is never distorted by bass.

A permanent WARPKEEP landmark stands on the north mountain at z−58. Its title and address are real extruded letter meshes with steel masts, diagonal braces and stone footings derived from the terrain height. The title is 36 m wide and the address 32 m. The fixed world sign and the preview footer link to exactly [farcaster.xyz/~/channel/warpkeep](https://farcaster.xyz/~/channel/warpkeep). Its restrained cyan/gold/violet wash changes brightness, not scale, position or orientation. This new film staging is documented separately from the unchanged PR castle source.

A thematic field appears behind the native castle for selected Hyperion/Core events. The field must retain one center, continuous phase and aspect-correct geometry. The original crest is preserved rather than redrawn. The Warplet uses its authored Idle and Torch Salute clips, with `src/guardian-clock.js` reconstructing the actual rig from source time. Direct and nonsequential-seek pose tests inspect the selected GLB's bone matrices. Those tests do not by themselves prove a visually natural pose transition; that remains part of the moving-preview review.

## Picture and reading hierarchy

During vocals the complete inscription is the first read, the Warplet/castle relationship the second, and the resonators and atmosphere the third. The text should feel supported by the forecourt without covering the guardian, gate or the lyric's important detail. During confirmed instrumental room, the camera or environmental field may take prominence.

Use enough material light to recognize the source castle and its cloth. Controlled glow can give the words impact, but inactive text still needs contrast against the actual moving picture. Keep foreground rain, branches, sparks and resonator peaks clear of the complete phrase. Do not change letter position, weight or size for each sung word. The source-time focus must release even if a scene decoration continues.

The camera uses a section-based path around the same place. Its changes in height, distance and bounded viewing angle reveal depth while preserving the castle identity and the mountain sign's legibility. Portrait uses an independent camera adjustment and lyric width. Both formats need actual phone/player-size review: a composition that fits geometrically can still obscure the subject or reduce its letters to glare.

## Source-clocked sequence and meaning

The initial chapter boundaries below came from the embedded captions and remain editorial navigation candidates. The adopted acoustic candidate words in `data/lyrics.json` are the selector authority used by code; they remain pending complete listening review. No chapter boundary is evidence of an exact musical downbeat.

| Candidate chapter | Intended progression | Current source implementation / limit |
| --- | --- | --- |
| 0:00–0:24.495 | First contact | Establish the actual castle, its guardian and light from the beginning. The two opening lines use the forecourt inscription; the world does not begin as an empty black screen. |
| 0:24.495–0:59.362 | Somewhere to return to | Keep inhabited motion and material depth. The specific lamps event receives a bounded practical-light response. The same subjects remain identifiable as the camera moves. |
| 0:59.362–1:09.335 | Room for another | Move toward the gate relationship before the chorus. The exact rain target adds a local weather response. Reading remains anchored to the inscription. |
| 1:09.335–1:43.005 | Something that stays | Open the composition and give measured resonators more reach within their ceiling. Preserve the real castle while river and field detail move. The first chorus's compressed caption repetitions were re-examined in acoustic preparation; do not choreograph four picture jolts from the original unreviewed list. |
| 1:43.005–2:16.277 | Dreamed in stone | Selected Hyperion/Core events illuminate the field behind the familiar castle. Return visual priority to practical life and material light as the text returns to the forge/waiting imagery. |
| 2:16.277–2:55.452 | Work and recognition | Return to a learned castle/forecourt relationship with an adjusted camera view and fuller measured response. The current selected castle remains intact; the original proposal to assemble an added physical beam is not claimed as implemented. |
| 2:55.452–3:24.282 | Person to person | A changed camera distance and progressively connected light support the bridge. Keep full sentences on the inscription; no transaction panels, balances, feature claims or fabricated platform UI. |
| 3:24.282–3:34.149 | Possible instrumental expansion | This navigation span requires listening confirmation. The planned environmental expansion must preserve any actual vocals found here and must not turn a zero-duration subtitle hint into a verified musical boundary. |
| 3:34.149–4:14.840 | Final return | Return to the known composition. The current `door` semantic state increases illumination at the native gate through the changed final phrase. It does **not** animate newly hung door geometry. The earlier physical hanging proposal is an unimplemented option, not a completed payoff. Come closer again for the personal declaration. |
| 4:14.840–source end | Leave the light on | Return toward the opening camera relationship and retain the practical light through every closing line and the original tail. Keep the complete audio; no premature black card or automatic source fade. |

The earlier [26-segment story plan](data/story.json) is retained as a **provisional planning record**, not as a claim that all its proposed shots, gate construction and camera moves are implemented. The current camera knots and world treatment live in `src/scene.js` and `src/world-lyrics.js`; `src/core.js` owns semantic event selection. The original plan's 273.5735-second decoded-tail candidate is distinct from the master's declared 273.560 seconds and the current WebM stream copy's declared 273.568 seconds. The player uses the selected media element's presentation clock and duration, as documented in the source inspection.

## Exact effects and their lifetimes

| Effect | Selected IDs | Intended behavior |
| --- | --- | --- |
| Practical light | `L10-W05`, `L48-W06`, `L65-W03` | Lamps, bridge lights and closing window event; bounded decorative response after the acoustic interval |
| Rain | `L14-W07`, `L28-W07` | The two selected rain performances; no response to unrelated cue text |
| Core field | `L27-W02`, `L31-W02` | The selected Hyperion and Core words, with a separately bounded environmental tail |
| Gate illumination | `L58-W05` through `L58-W06` | Progress through “finally hung,” then preserve the completed light state; rewind reconstructs the earlier state |

The selectors use exact word IDs. A similarly spelled word in another cue must not inherit an effect. Decorative tails do not prolong acoustic highlighting. The tests exercise positive targets, unrelated similar wording, exclusive word release, neutral gaps and reconstruction after backward seeks. These tests establish behavior of the timing data and functions, not the acoustic truth of the candidate alignment.

## Review priorities

Inspect the opening, first chorus, 1:30–1:34 candidate region, Hyperion/Core passage, Farcaster entrance, final changed door phrase and every closing vocal in both formats at normal speed with sound. Compare the same passage with effects disabled. Review portrait at 390 px and 320 px and landscape downscaled without reflow. The whole phrase, active and inactive words, Warplet, original crest and gate relationship must survive.

Check that the inscription's physical support is convincing in motion and that the faint floor projection reads as projected light rather than a second competing subtitle. Check whether both measured visualizer placements respond clearly to this recording without overwhelming the voice. Inspect the ward behind the guardian and the mountain sign together, including their upper-frame clearance; verify that the sign's address remains a physical landmark and its exact link target works. Review camera movement and guardian clip transitions after forward, backward and repeated paused seeks; inspect pixels rather than relying on advancing time counters.

This record does not certify complete listening, creative acceptance, visible browser recovery, renderer parity or production authorization. The production gate remains closed while those required review/approval bindings are pending. Reference scope and provenance are recorded in [REFERENCES.md](REFERENCES.md) and [ASSETS.md](ASSETS.md).
