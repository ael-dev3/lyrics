# Word timing method

## Keep the recording fixed

The original video supplies both sound and picture. Its 44,100 Hz soundtrack zero is unchanged; native picture PTS uses 30000/1001 fps. Selected word edges are integer soundtrack samples. Model-frame spacing, analysis-window support, uncertainty, browser repaint cadence and the native picture cadence remain separate quantities. Integer samples make playback deterministic; they do not establish perceptually exact milliseconds.

## Rebuild ownership before choosing an edge

The first map used sparse multilingual CTC character cores and is rejected. A later strong character can miss the quieter start of the same word; a final character can precede the end of a sung vowel. Adding one common offset or extending every word would preserve the ownership errors.

The replacement combines several observations:

1. Retain the supplied text separately, identify every performed occurrence and give lead and backing words independent IDs.
2. Decode the unchanged original. Compare it with an estimated vocal component only after checking component sample counts and gross clock lag against the original.
3. Retain unprompted recognition, bounded forced alignment, multilingual character paths and English-specific character paths as proposals. A forced path cannot verify a lyric variant, and a recognition omission cannot establish silence.
4. Include neighboring phrases in English alignment. A target-only crop can assign an opening “I” to the preceding “Tonight,” or allocate an opening word across introductory silence. Context reduces this error without turning a model core into an onset.
5. Inspect the original and vocal estimate around quiet entrances, word renewals, short grammar words and sustained ends. Select each occurrence independently; retain alternatives and uncertainty ranges.
6. Audit all phrase-final bodies separately. Distinguish directly sung continuation from reverberation, instruments, another voice and a new wordless vowel. Broad discovery crops are search windows, not release limits.
7. Reconcile one canonical selected-word record, then build the display timeline from it. Display words never receive separately invented times.

Stereo side can expose the backing refrain masked by a centered lead. It can also cancel useful vocal material. A peak-gain variant or a low-scoring forced path is only another observation; it cannot manufacture an audible word. Backing occurrences retain their own source evidence rather than a blind copy of another chorus.

## Clock and tool traps

- CTC frame positions use the model's physical encoder stride, receptive support and crop zero. Dividing the crop duration by the emission count can subtly stretch valid-convolution frames toward the crop end.
- Normalized nonempty alignment text avoids a trailing-newline blank unit and misleading low-probability retries.
- Estimated vocals can contain instruments and decay. Verified sample count and zero lag establish a useful clock relationship, not perfect source separation or lexical ownership.
- A crop boundary is not a word boundary. Retain a complete held body beyond an earlier discovery crop when the unchanged recording supports it.
- The opening “Found out,” closing “I found out,” two “You have to play” occurrences and two “You can't escape” occurrences are distinct performances. The outro changes “Pleasures and rage combined” to “Pleasures are long forgotten.”
- The supplied punctuation after “iron” is markup. A music-tail recognition hallucination is not a new lyric.

## Presentation verification

Each English token points to its own source event. Focus includes the selected first sample and excludes the release sample. Every vocal body has full opacity; neutral reading holds and fades cannot shorten or prolong lexical focus. Lead and backing phrases remain complete in independent stationary blocks when their bodies overlap.

The browser repaints focus from the single video's currentTime at display cadence while recording the actual decoded picture PTS separately. Seek, pause, slow playback, layout changes, recovery and the short final audio tail require complete-picture checks. A progressing clock is not proof of visible video motion.

Shared-scene stills and interval/layout checks prove bounded properties of the selected map and painter. They do not prove that the chosen edge is audibly correct. Full normal-speed listening, reduced-speed review of uncertain words and held endings, both-format review and explicit approval of the current revision remain separate production requirements.

## Retained evidence

Portable source identities, selected events, uncertainty, decisions, measured features and current preview diagnostics belong in the project. Raw audio, model tensors, signed source metadata and machine-specific model adapters stay in ignored local analysis. Public application, scene, timeline, feature and QA producers use TypeScript; native model-library experiments are separate local analysis tools. Do not claim that a cleaned checkout can reproduce a private acoustic experiment without the identified models and adapters.
