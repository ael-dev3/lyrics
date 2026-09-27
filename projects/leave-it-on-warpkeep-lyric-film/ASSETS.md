# Current selection — Warpkeep PR #375

The current film direction explicitly uses [Warpkeep PR #375](https://github.com/ael-dev3/Warpkeep/pull/375), pinned at **`75934520a8dc295c8b68d4c8c197785299e2ff0b`** (`codex/verdant-title-menu`). This supersedes the earlier installed-castle selection preserved later in this document. The exact checked-out PR assets and landscape code are used as music-film source material. Neither the proposed menu nor this authored scene is represented as shipped gameplay.

The source checkout was read without modification. [`pr375/manifest.json`](source/asset-provenance/pr375/manifest.json) lists exact paths, full SHA-256 values, original source paths, mesh counts and animation names. All nine copied files match the hash prefixes in the original PR filenames. The castle's emblem is already woven into its eight native banner surfaces. It must remain part of that original material rather than becoming an added floating plaque.

| Current file | XYZ size / dimensions | Bytes |
| --- | --- | ---: |
| `assets/pr375/castle.glb` | 22.000 × 12.448 × 20.400 m | 4977796 |
| `assets/pr375/guardian.glb` | 8.624 × 9.506 × 4.772 m | 1836344 |
| `assets/pr375/hegemony-emblem.png` | 1254 × 1254 px | 1486312 |
| `assets/pr375/honor-guard.glb` | 1.411 × 2.280 × 0.652 m | 320440 |
| `assets/pr375/lamplighter.glb` | 1.277 × 2.396 × 0.614 m | 157472 |
| `assets/pr375/rabbit.glb` | 0.192 × 0.265 × 0.343 m | 86340 |
| `assets/pr375/brazier.glb` | 1.250 × 2.640 × 1.250 m | 98792 |
| `assets/pr375/tree.glb` | 4.598 × 6.592 × 2.539 m | 72128 |
| `assets/pr375/pine.glb` | 5.047 × 7.417 × 3.620 m | 26396 |

## PR scene integration contract

Castle coordinates are x −11..11, y 0..12.4475, z −9.9..10.5, with its front facing +Z. Keep its origin and source dimensions. The separate guardian attaches at **world y +12** with its original root and bone hierarchy preserved. Its authored rig root is y .2, seating it on the roof at y12.2. Do not bbox-center or separately scale it to compensate for camera framing. Its rest-mesh accessor bounds are 8.624 × 9.506 × 4.772 m; those are not an animated swept-volume measurement.

Guardian animations are `Warplet_Idle` (6 seconds) and `Warplet_Torch_Salute` (4 seconds). The former is a continuing rest state; the latter is an authored salute. Use a source-clocked mixer and deterministic authored event windows when adapting the menu's animation. The source menu's wall-clock elapsed accumulator and incremental crossfades need adaptation for seek reconstruction; copying them unchanged would not meet the lyric-film clock contract. There is no need to load or simulate player identity, admissions or account selection for this local film.

The exact landscape source is preserved as [`createMenuLandscape3D.ts`](source/asset-provenance/pr375/createMenuLandscape3D.ts). A semantics-preserving ESBuild type erasure is beside it as [`createMenuLandscape3D.js`](source/asset-provenance/pr375/createMenuLandscape3D.js), exporting `createMenuLandscape3D(scene, quality)` and importing `three`. It creates a 210 m square faceted landscape, north ridges, a winding river centered approximately x −23, procedural forest, rocks, wildflowers and a paved +Z approach. `update(sourceSeconds)` already reconstructs river heights directly from time. The source menu uses additional exact tree/pine GLBs and creature/worker assets listed above. Landscape geometry is authored code from the PR, not a generated background illustration.

Reference camera: landscape position [31.5,25.2,42], target [8,9,0], fov35; portrait [24,27,47], target [0,12.2,0], fov36. The film may adapt camera framing for lyric reading and the guardian, while retaining this recognizable castle/landscape rather than the superseded diorama. Source rendering uses ACES with exposure1.21, green fog, warm sun and cool fill. Materials include limestone, dark oak, patina teal roofs, gilt, violet banners and emissive lanterns. Preserve their relative identity under cinematic grading.

## Film-authored presentation additions

The unchanged PR375 castle and landscape are staged with original lyric-film code. `src/world-lyrics.js` supplies a transparent forecourt inscription and faint paving projection; these are authored magic, not a replacement banner texture. `src/magic-vfx.js` adds source-clocked gate seams, tower ribbons/motes and a circular guardian ward with 48 measured spectrum segments. Each original crest remains intact.

`src/mountain-sign.js` creates physical extruded WARPKEEP lettering and the exact `farcaster.xyz/~/channel/warpkeep` address at the north ridge. Its masts, braces and stone footings use the terrain height. The sign is a new film landmark, not an archived PR asset. Its click target and HTML alternative use exactly `https://farcaster.xyz/~/channel/warpkeep`. The embedded weight-700 glyph subset derives from the supplied Space Grotesk font (`acad6de1fc93436f5c0f1f4137751ef04f1aea3063e7036535970ffcfbd79f72`) under its included OFL1.1 notice; no remote font service is required during playback.

## Verified native surfaces and visual inspection

Two limited inspection stills were rendered from the exact castle GLB using Blender 5.2 and then viewed: [`front`](source/asset-provenance/pr375/castle-front-inspection.png) and [`three-quarter`](source/asset-provenance/pr375/castle-three-quarter-inspection.png). They establish the castle's actual geometry/material appearance and do not constitute the full-film render or encoded output review. These stills omit the guardian and landscape intentionally for geometry inspection. [`inspect_scene.py`](source/asset-provenance/pr375/inspect_scene.py) reproduces them.

The front facade has no broad blank rectangular billboard: the gateway, windows, round towers and narrow banners occupy it. Geometry measurements in [`facade-surfaces.json`](source/asset-provenance/pr375/facade-surfaces.json) identify a useful **short inscription lintel** at z8.275, x−2.66..2.66, y6.335..6.905 (5.32 × .57 m). A few words can occupy that strip; full phrases need more space and an authored projection surface or deliberate camera closeup. Do not paste a giant opaque lyric rectangle over the arch.

The front tower banners are 1.12 ×2 m at x±7.6, y4.59, z≈8.38; gate banners .88×1.75 m at x±2.15,y5.115,z≈8.63; upper keep banners1.03×1.66 m at x±1.65,y10.46,z≈3.72. Their original crest and cloth UVs remain intact. Their size is appropriate for identity and brief supporting inscriptions, not a complete multiword lyric paragraph. Source GLB has nine material-group meshes; a banner is not a detachable wall-sized billboard.

Native foreground paving starts at z10.7 and extends along +Z. An authored signal or projected lettering across that approach can be framed as part of the world, while requiring actual mobile-size legibility review. Full lyric reading geometry remains a film-layout responsibility; these surface measurements alone do not validate the final result.

The PR's source provenance and asset terms remain attached to these exact copies. The user's request selects these assets for this local film. It does not license arbitrary external media or authorize game deployment, player/account operations, public release of soundtrack/GLBs, or full production rendering without the separate required review.

---

# Earlier selection audit — superseded by PR #375

The following records describe the initial research kit. They are retained as provenance history and are **not the current castle or landscape direction**.

# Initial installed asset study

This is a staged music-film scene using authentic Warpkeep source assets. It is not a recording of gameplay, a game deployment, or a claim that every selected archived asset is active in Keep04. Files under `public/assets/warpkeep/` are exact byte copies for the requested local preview. No mesh, texture, rig, pivot, vertex color, material assignment, or image was repainted or rewritten.

## Selected source refs

- Warpkeep current `main`, verified with `git ls-remote` on 2026-09-27: [`786c0b2be6f2d2e7eb2de02ef3b6826c8907fc32`](https://github.com/ael-dev3/Warpkeep/tree/786c0b2be6f2d2e7eb2de02ef3b6826c8907fc32).
- Warpkeep-Assets current `main`, similarly verified: [`1e5c49e9819ea50cf4e03675bb05868f90f06fdc`](https://github.com/ael-dev3/Warpkeep-Assets/tree/1e5c49e9819ea50cf4e03675bb05868f90f06fdc).
- New Hegemony emblem: exact source image from the separate asset branch commit [`c86be67c93930d694baa100c1ff70c0f26a834f6`](https://github.com/ael-dev3/Warpkeep-Assets/tree/c86be67c93930d694baa100c1ff70c0f26a834f6), which records its public archive release and menu designation. This branch is not misrepresented as main.
- New Lantern Terrace castle research: PR #36 head [`56c119e3bf1ac56741b9be833c6f7cefbfe4670c`](https://github.com/ael-dev3/Warpkeep-Assets/tree/56c119e3bf1ac56741b9be833c6f7cefbfe4670c), remotely verified. Its provenance/manifest describe a small asymmetric teal great hall and offset drawbridge at 8.47 × 6.94 × 7.265 m. The named release ZIP returned HTTP 404 at inspection, so its geometry was **not downloaded, viewed, or selected**. The film uses the installed GameReady castle instead. The candidate records are preserved for reproducibility.

Machine-readable refs and hashes are in [source-refs.json](source/asset-provenance/source-refs.json), [selected-assets.json](source/asset-provenance/selected-assets.json), and [SHA256SUMS.txt](source/asset-provenance/SHA256SUMS.txt). Each selected GLB has a matching `*-inspection.json` with original nodes, material metadata, animations and bounds.

## Local files and measured sizes

Model measurements are Y-up XYZ sizes from glTF POSITION accessor extrema transformed through the authored node hierarchy. Normalized signed-int16 castle positions are correctly decoded before scale/translation. These are bounds inspection, not a claim of full Khronos validation or animated swept bounds.

| File in `public/assets/warpkeep/` | XYZ bounds / dimensions | Bytes |
| --- | --- | ---: |
| `city-mill.glb` | 9.300 × 7.123 × 7.500 m | 478,660 |
| `city-stoneworks.glb` | 9.000 × 5.390 × 7.200 m | 508,540 |
| `cobble-road-straight-4m.glb` | 4.000 × 0.140 × 2.400 m | 87,600 |
| `courtyard-linden-teardrop.glb` | 2.876 × 5.200 × 2.040 m | 164,384 |
| `ember-lamplighter.glb` | 1.277 × 2.396 × 0.614 m | 157,472 |
| `hegemony-castle.glb` | 13.339 × 14.062 × 9.957 m | 2,215,972 |
| `hegemony-emblem.png` | 1254 × 1254 px | 1,486,312 |
| `lumber-camp.glb` | 8.600 × 6.050 × 6.800 m | 532,928 |
| `palisade-gate-frame-6m.glb` | 6.000 × 5.000 × 1.300 m | 46,112 |
| `palisade-gate-leaf-left.glb` | 2.100 × 3.450 × 0.280 m | 22,860 |
| `palisade-gate-leaf-right.glb` | 2.100 × 3.450 × 0.280 m | 22,936 |
| `pruned-ornamental-three-tier.glb` | 2.788 × 4.700 × 2.738 m | 175,604 |
| `stone-pedestal-brazier.glb` | 1.250 × 2.640 × 1.250 m | 168,348 |
| `the-core-crest.png` | 512 × 512 px | 285,047 |
| `timber-bench.glb` | 3.080 × 2.148 × 0.957 m | 255,436 |
| `timber-post-lamp.glb` | 1.320 × 3.435 × 0.780 m | 267,500 |

The three building previews preserved under `source/asset-provenance/*-source-preview.png` were visually inspected. They show the installed Crownwheel Mill, Timberwright Yard and Royal Mason's Yard with the same pale stone, dark wood and oxidized teal roof family. The castle record illustration was also viewed as source reference; it is not used as a replacement for the actual GLB.

## Load and stage

Use Three.js `GLTFLoader`. Only `hegemony-castle.glb` needs `MeshoptDecoder` and has `EXT_texture_webp` / `KHR_mesh_quantization`; the other selected GLBs have no required extensions. Preserve source material assignments and embedded texture color spaces. Scene lighting, exposure, fog and bounded emissive accents may change without repainting the authored material family.

For generic building placement, attach the unchanged loaded root to a wrapper. Center XZ using its measured bounds and set the wrapper/root offset so minY reaches the ground. The castle is already almost centered and grounded (x ±6.66965; y 0–14.062; z −4.98358–4.97358), with its authored gate facing **+Z**. Clone ordinary static sources with `clone(true)`; clone the actor with `SkeletonUtils.clone` so rigs remain independent.

**Gate leaves retain their hinge pivots.** Do not apply generic centering to them. Left leaf extends x 0–2.1 and right extends x −2.1–0, both y 0–3.45 and z ±0.14. Frame spans x ±3, y 0–5 and z ±0.65. Parent each leaf at the corresponding opening jamb and animate the parent rotation deterministically from source time. The independent leaves permit an unfinished/finished threshold without deforming source meshes. The exact jamb clearance should be checked in the actual preview.

Ember Lamplighter is the actual balanced citizen GLB. Inspection confirms the rig hierarchy and clips: **Greet 1.5 s; Idle 2 s; Walk 1 s; Work 2 s**. Names, sampler/channel counts and max input times are recorded. These structural checks do not prove that Work depicts carpentry, that a walking route matches foot speed, or that a performance is lip-synced. Prefer an intimate held Idle/Work light-tending view after visual review. If walking is used, evaluate foot contact and route speed from visible motion; source-clock the mixer explicitly and reset clip state after arbitrary seeks.

## Visual identity

The pinned `keep04VisualProfile.ts` defines masonry `#d7d2ba`, timber `#514237`, roof teal `#397d7d`, warp violet `#8d6ac8`, near forest `#52694b`, distant haze `#71897f`, and ground `#7a8063`. The runtime scene uses warm key light, cool ambient light, a bounded moat surface and authored settlement spacing. The film adapts illumination and framing to night, while preserving that material family.

Current `loadKeep04Assets.ts` selects six buildings and two trees and selects **no population actors**. This film deliberately stages a smaller three-building set, two trees, archived runtime gate/lamp/bench/brazier/road pieces and one previously authorized Inner Keep citizen. The film stage does not claim those additional items currently load in Keep04.

## Emblems

`hegemony-emblem.png` is the exact 1254 px RGBA September 27 source: a gold sword with gold wings/stars and a violet circular interior. It is not a procedural redraw. `the-core-crest.png` is the exact safe-padded 512 px archived derivative; its provenance identifies The Core and records the disclosed Hyperion influence without licensing any external franchise imagery. The scene should use both sparingly. If adding a separate animated warp aperture, keep it circular with one center/continuous phase and place the intact crest in front; the original image is unchanged.

## Terms and distribution

The asset records authorize specific public archives and/or official Warpkeep runtime use; most are `LicenseRef-Warpkeep-Provenance-Required`, **not a blanket open-content license**. The current user request authorizes creation of this local Warpkeep lyric preview. These local copies do not expand those terms or establish ownership, trademark rights, general redistribution rights, or game deployment approval. Keep the selected media local under the project's ignore rules; source documentation may retain hashes and pinned URLs. Publishing the song, GLBs, release ZIP, or rendered film requires the separately applicable authorization and production review.

Original dated records are preserved in this folder for the Inner Keep static library, citizens, new Hegemony emblem and Core crest. No source game or asset checkout was modified.
