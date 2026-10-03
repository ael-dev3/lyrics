# Independent vocal tracks — preview v2

The late arrangement contains a Japanese poem-30 fragment pair beneath the Russian foreground before the previously selected closing pairs. The initial mono/mid discovery pass followed the louder Russian voice and omitted this layer. The corrected inventory contains **38 cues and 156 source events**: 106 Russian words and 50 Japanese units.

## Acoustic selection

The newly represented pair is `憂きものはなし / 暁ばかり`, selected at 212.34–221.06 seconds. Unprompted estimated-vocal stereo-side recognition supplies a coherent fragment; corrected native-kana side CTC and original/estimated side panels provide independent boundary candidates. Mono candidates that follow Russian and tightly cropped stock sentences are rejected. A forced-only hypothesis before this pair does not establish an additional performance.

The first `憂き / もの` transition remains masked. A broad forced pass borrowed preceding articulation and placed the nasal too early. Narrower observations support a selected 213.70-second handoff, with a broad 213.32–213.92 listening range. The new opening has a 212.20–212.60 review range; held releases also remain proposals. This improves performed coverage without claiming perceptually exact hearing from models.

See [selected source events](source/japanese-overlap-selected.json), [independent acoustic evidence](evidence/overlap-acoustic-v2.json) and [current timing decisions](evidence/timing-decisions.json). The unchanged original soundtrack remains authoritative; a stereo-side signal or separated vocal estimate is an analysis aid.

## Presentation

Three late Japanese pairs own an independent `japanese-upper` track. The complete Russian cue continues on the lead track. Both use the same original clock, separate lexical event intervals and complete Russian/English meaning mappings. The old short-tail reassignment is unnecessary: the original Russian last night remains in its complete cue through 222.24 seconds.

- Native 16:9: Japanese-led Japanese/Russian/English block at the top, biased right to protect the left-side face; Russian-led Russian/English pair below. Both use 64-pixel fitted type during the overlap. Upper native region starts at y105, with a 1280-pixel reading width centered at x1200.
- Portrait: the complete sharp source window stays fixed at y214–821.5. The Japanese-led block sits above the Russian-led block in the reading area, at y863.5–1296.14. The Russian pair ends at y1605; the densest simultaneous cue leaves 54.14 pixels between blocks. All five language lanes use 64-pixel type with script-specific optical weights.
- The Japanese block keeps its coordinates and size after the Russian voice ends. No mid-word relocation, clipped body, borrowed highlight or moving visualizer separates the tracks. Source picture, soundtrack and spectrum anchor remain unchanged.

## Verification and status

The regression comparison retains every one of the 150 previously selected vocal bodies. Per-track validation allows genuine simultaneous voices while rejecting reading collisions within a voice. Actual-source geometry proofs check equal concurrent sizes and block separation; browser diagnostics expose both vocal tracks independently.

The current frozen preview and production gate identify v2. Reports and screenshots explicitly labelled v1 remain historical evidence of the earlier inventory and tail treatment; they do not verify this revision. Full listening review and explicit current-input production authorization remain pending. No full song render is performed for this correction.

## Reusable lesson

Audit masked backing voices separately from the lead. Absence in a mono or language-locked recognition result is not proof of silence. Try original stereo channels and mid/side analysis, retain source-clock identity and cross-check with unprompted discovery before forced alignment. When voices overlap for complete phrases, reserve separate stable reading blocks with their own translations; do not squeeze a full second voice into a brief carry mechanism.
