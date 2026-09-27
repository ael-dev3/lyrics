# Hegemony emblem and native castle banners — provenance

- **Deposit date:** 2026-09-27
- **Release tag:** [`hegemony-emblem-2026-09-27`](https://github.com/ael-dev3/Warpkeep-Assets/releases/tag/hegemony-emblem-2026-09-27)
- **Authority:** Ael supplied the new emblem, asked that it be documented in the
  Warpkeep and Warpkeep-Assets repositories and applied in the menu, and had
  previously requested uploading the Warplet castle model to Warpkeep-Assets.
- **Status:** PNG and castle-only GLB are published archive attachments. This
  record does not assert that Alpha 0.4 is live.

## Supplied emblem

The source attachment was named `ChatGPT Image Sep 27, 2026, 04_44_09 PM.png`.
That filename indicates a ChatGPT image, but no specific generation model or
service version was independently verified. The archive preserves the exact
1,486,312-byte, 1254×1254, 8-bit RGBA PNG, including its existing `caBX`
ancillary chunk. Its SHA-256 is
`26e8664b1db0acf3e6db443caf46ef13e45fe9de794749e431b7c2e3d6fb8774`.
No crop, repaint, background removal or metadata stripping was applied.

The design has a gold sword over a luminous violet circular center, gold
crescent-like wings and two stars. It is the **new Hegemony menu emblem**.
The [July 2026 opaque pixel-art reference](hegemony-emblem-2026-07-14.md)
remains in its original release as historical material; its bytes and claims
are not rewritten.

## Castle derivative

The companion castle-only GLB derives from the exact Warplet's Watch v2 model
in [`warplets-watch-castle-2026-09-14`](warplets-watch-castle-2026-09-14.md).
The game's `derive-warplet-castle-base.py` removes the guardian portion while
retaining the castle geometry. `texture-hegemony-banners.py` adds UVs to the
**eight existing violet cloth banner panels**, composites the new emblem onto
their opaque fabric and embeds the resulting texture in the GLB. No separate
plaque, button, or emblem mesh was appended. The original base binary remains
an unchanged prefix of the derivative; the nine castle nodes, eight other
meshes and banner indices remain unchanged. The guardian is a separate skinned
model in the proposed menu, not part of this castle-only attachment.

The exact derivative is 4,977,796 bytes, SHA-256
`c55f2c6c610e4aacddde58e485156c85629dd0a2eab88fad65652c317ae59088`.
The archive's bounded verifier checked the exact local attachment bytes and
GLB header before publication. A separate structural inspection checked
JSON/BIN chunk bounds, nine nodes/meshes, one embedded texture and absence of
skin/animation.
This is not a claim of Khronos semantic validation or device performance.

## Distribution boundary

Ael requested the repository deposit and menu integration. The exact PNG and
castle-only GLB are public archive attachments. No separate open-license,
trademark or canonical-identity grant is asserted. The castle derivative retains the
Warplet's Watch source boundary; this record does not grant rights in the
Warplet character, generation tools or services, third-party references or
unrelated Warpkeep assets.
