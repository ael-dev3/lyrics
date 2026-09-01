# First-act precision and calm visualizer implementation

## Scope

Version `v2.1.0` responds to two review findings: the first vocal act needed more exact highlighting and handoff timing, and the bottom spectrum needed to feel calmer and easier to watch. The approved V1/C2 timing design, reviewed alignment samples, soundtrack, lyric geometry, and second-act presentation remain unchanged.

## First-act timing

C1 now uses a presentation-only `precision` focus profile. A target is inactive before its nearest cue frame, fully emphasized on that contact frame, and inactive at the cue's exclusive end. There is no post-cue focus tail. C1 line handoffs that would otherwise cover the next vocal contact are shortened to that contact; their fade begins after the outgoing vocal and lasts no more than 50 ms.

The change fixes the visible envelope rather than rewriting evidence. The shortest cue, `C1-04-C01`, remains exactly 2,646 samples / 60 ms in the reviewed alignment. V1 and C2 continue to use the original `cinematic` three-frame attack and two-frame release, including the approved later-act overlap.

C1 also uses stronger inactive/active separation, a tighter 14 px glow, and a 4 px underline. Text, target positions, and line geometry are stationary.

## Calmer spectrum

The 64-band spectrum now uses a symmetric `[1, 2, 3, 2, 1]` kernel across both neighboring frames and neighboring frequency bands. Impact uses the same temporal kernel. Clamp-to-edge handling keeps the first and last frames/bands deterministic, and the symmetric temporal window avoids phase delay.

Only the spectrum rail consumes smoothed values. Background, atmosphere, lyric motion, and authored emotional features continue to use the raw deterministic feature frame. The rail renders 7 px rounded bars with more air, lower-contrast guides and caps, and a continuous ember–teal–mint progression. Its measured 96 px core travel, 18 px maximum transient cap, 64 bands, safe-area footprint, and lyric clearance are preserved.

## Verification

The timing tests cover every C1 cue at both 60 and 120 fps, including before-contact, contact, last-active, exclusive-end, and incoming-line handoff states. A later C2 contact remains locked to the cinematic behavior. Spectrum tests cover constant preservation, centered impulse response, clamped edges, bounded integer output, reduced spatial roughness, and complete 64-band/64-cap markup.

Browser measurement reports at least 36 px between lyrics and the maximum spectrum extent, no spectrum clipping, and 11 px of lower-chrome clearance. Composition discovery reports exactly 9,180 public frames and 18,360 proof frames on the shared 153-second timeline.

Fresh media verification produced:

| Artifact | Result | SHA-256 |
| --- | --- | --- |
| 2160×2160 ProRes 4444 reference | 9,180 frames, BT.709, strict full decode, 28,720,493,293 bytes | `56a3670a0ed5737699292893dcc15c5f07bac1a16f8fbbece6b326367adbb37b` |
| 1080×1080 HEVC Main 10 production master | 9,180 frames, `hvc1`, original AAC, strict full decode, 19,534,813 bytes | `41c8bb4f0474e43ff308165a01c5ed4a8940cdc1063ca230bb40f9c89395058b` |
| 1080×1080 H.264 synchronization proof | 18,360 frames, `avc1`, original AAC, strict full decode, 163,501,905 bytes | `bc52d6b934294f3d8b9388f860b98e922c0975ff15047155ff29f2a688d14fed` |
| 2160×2160 lossless hero at 38.43 seconds | Extracted from the verified reference, 4,116,580 bytes | `7ebbbf4792aba1ad75c71d044d261d1d4b8e94b540c911c04e353022c4e28ee3` |

Both public MP4 files contain 6,591 AAC packets whose packet-stream SHA-256 is `9d2cc3b8f0bd51b1fe0e990cc0d6d5cbb52a76e1b872b56ada849915b3856b24`, identical to the locked soundtrack.

The final repeated-run evidence and publication record are maintained in [`audits/tanisea-final-qa-vnext.md`](../audits/tanisea-final-qa-vnext.md). Supplemental generated artifacts are inventoried in [`docs/workflow-evidence.md`](workflow-evidence.md).
