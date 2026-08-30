# Lyric video production notes

This repository documents a source-first workflow for building polished, audio-synchronised lyric films. The reference case is the 153-second English lyric film for Tanisea's “Закричу на весь мир (ksviety Remix)”.

The repository intentionally excludes copyrighted audio, video, artwork, and fonts. It records process, timing evidence, quality controls, and the exact changes recommended for a future render.

## Documentation

- [Production workflow](docs/production-workflow.md) — from soundtrack lock and translation through Remotion animation, previews, rendering, and delivery.
- [QA checklist](docs/qa-checklist.md) — repeatable editorial, visual, audio, and technical checks.
- [Tanisea timing audit](audits/tanisea-ksviety-remix.md) — the complete review of the current production master.
- [Machine-readable Tanisea audit](audits/tanisea-ksviety-remix.json) — current and recommended timings for later implementation.

## Non-negotiable rules

1. Work from the animation source. Do not repair an encoded master by placing a still, panel, or replacement clip over it.
2. Lock the exact soundtrack before any timing work. A different edit, remix, or leading offset invalidates every cue.
3. Keep performed-word timing separate from visual entrance and exit timing.
4. Treat transcription, translation, and timing as three different review passes.
5. Use automatic speech recognition only to propose boundaries. Confirm them against a verified lyric source and human listening.
6. When a processed or repeated vocal is not reliably intelligible, transition into an intentional title state built from the same visual system.
7. Render the whole composition after source changes and preserve the original compressed audio when possible.

## Current case-study status

The production master is visually coherent and technically valid, but this deeper audit found remaining sync regressions worth correcting in a vNext render:

- the first verse vocal starts at about `60.09`, while the lyric and break-card handoff currently wait until `64.08`;
- several second-chorus lines are between `0.25` and `1.53` seconds late;
- the last clear chorus line remains on screen until `118.00`, although the repeated title vocal begins at about `116.05`;
- the lyric component's `0.32`-second opacity fade and `0.50`-second motion/blur entrance begin at the vocal onset, creating additional perceived lag even when timing data is correct.

The proposed restoration and architecture fix are fully specified in the [audit](audits/tanisea-ksviety-remix.md).
