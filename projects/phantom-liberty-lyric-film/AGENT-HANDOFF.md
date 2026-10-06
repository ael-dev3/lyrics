# Agent handoff

## Current boundary

Preview stage only. No complete lyric-film render, publishing kit, platform upload or binary release is authorized. Full actual-audio review and explicit approval must cover the current loaded revision before production. Follow the repository’s preview-first and synchronization gates.

Current map: `phantom-liberty-preview-v2`, sixty cues and 313 displayed events. Start with `TIMING-METHOD.md` and `source/selected-words.json`; they separate selected numerical points from uncertainty. The added `PL-L031v` is a supplemental wordless-vowel candidate, not supplied lexical text. All 128 backing boundaries and sixteen chorus releases retain unresolved ownership; listening acceptance remains pending. Do not silently promote this preview into an accepted synchronization record.

The first provisional timing map is rejected. It used multilingual CTC character cores before original/stem word-body reconciliation, which produced late entrances, short focus intervals and unstable reduced-word ownership. Treat that map as diagnostic history; do not revive it, apply a global offset or copy its chorus timings into another occurrence.

## Read in this order

1. Repository `AGENTS.md`, connected-phoneme onset workflow, cinematic default and scene-integration guide.
2. This project’s recording identity, supplied text, performed phrase inventory and selected-word record.
3. Timing evidence and review status for the current revision.
4. Visual brief and portrait framing study.
5. Current browser diagnostics and shared-scene proof provenance.

## Identity and ownership

The official recording’s original zero is retained. AAC decodes to 15,348,736 stereo samples at44,100Hz; native picture cadence is30000/1001. The short audio/container tail exceeds the final picture PTS, so preserve the last decoded picture through that tail. One source video supplies both sound and picture; word repaint follows its currentTime while native decoded PTS stays independently visible.

Lead and backing phrases own different cues and word IDs. The repeated backing refrain has sixteen independently represented occurrences. Its text stays complete when the lead changes. Native English display tokens refer to their exact source word; punctuation is typography rather than a separate acoustic event.

Root reconciliation is the only writer of the canonical timeline. Model workers keep independent outputs and proposals; they do not edit the public timing map concurrently. Retain before/after samples, rejected alternatives, uncertainty and the original recording hash.

## Acoustic pitfalls caught here

- Unprompted recognition allocated the opening word across introductory silence and omitted the entire quiet backing lane. Recognition omissions do not establish silence.
- A forced text path cannot prove a supplied lyric variant. Preserve raw supplied wording separately, inspect actual phonemes and record unresolved variants.
- Sparse multilingual CTC character cores missed quiet first words and assigned reduced words or long vowels to implausible positions. A strong later character is not the sung onset.
- A phrase-end emission can be passive decay, another voice or another word. Do not turn every tail into a fixed-duration extension or fill every model gap.
- Model-frame indexing must use the encoder’s actual stride, receptive support and crop zero. Dividing crop duration by the emission count can stretch valid-convolution frames to the crop end and subtly misstate the clock.
- A trailing newline in a stable-ts alignment text file created a low-probability blank unit and costly retries. Pass normalized nonempty text, keep duration clipping disabled, and inspect the real token count.
- A vocal estimate is helpful only after its sample count and clock lag are verified against the unchanged source. Stereo side can expose backing words masked by the center lead; it is still an estimated observation rather than a new soundtrack.

## Composition and checks

Native wide preserves all horizontal content and removes only baked source margins. The rejected full-height mobile crop retained less than one quarter of the picture and clipped subjects. Portrait keeps the full sharp edit over a dim live source extension. Stable reader lanes and the stationary crimson filament response survive every cut.

Use the exact font, shared painter and current timeline in both browser and diagnostic stills. Check first-word full opacity, complete held focus, neutral reading holds, actual visible source motion, paused refresh, source comparison, seek recovery and the final audio tail. Bright focus must remain distinct at realistic phone size. Numerical/model/signal checks cannot substitute for an actual listening attestation.

```sh
npm ci
npm run check
npm run build
node scripts/proof-stills.ts
node scripts/preview-server.ts
```

Keep private source/analysis caches and machine-specific acoustic adapters local. Application, timeline, audio-feature, scene and QA producers use TypeScript. Native model-library experiments are separate local tools, not application modules or production timing authorities; record their implementation/checkpoint identity in retained evidence.

## Publication operations

Coordinate remote writes through one owner. Before push, pull-request creation/update or merge, inspect all current-UTC-day Actions runs, workflows, branches, actors and rerun attempts, including attempts of older runs. Account for duplicate events and downstream/generated workflows; report unknown monthly usage as unknown. Run proportional local checks first, preserve required checks/triggers and complete verified merges rather than leaving finished work in an open PR.
