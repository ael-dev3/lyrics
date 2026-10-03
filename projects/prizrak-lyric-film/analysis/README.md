# Analysis scope

The original unchanged recording is the authority. Saved Whisper/CTC outputs are candidate discovery evidence, not canonical captions. `public/timeline.json` and `evidence/timing-decisions.json` are the selected preview schedule.

- `independent-audio`: unprompted inventory, Russian original/stem CTC candidates, source/stem clock identity and reproducible analysis scripts. Old Japanese kanji CTC paths in this directory are **rejected**: default normalization selected Chinese readings.
- `japanese-ctc`: corrected contextual native-kana internal acoustic candidates, including widened failed-crop evidence. Even corrected forced paths may borrow a previous voice or miss low-energy prefixes/tails.
- `whisper-*-candidates.json`: source-conditioned attention proposals, separate from unprompted discovery. Early whole-crop words are not automatically accepted.
- Raw media, estimated stems, panels and source contact sheets stay local/ignored. Selected metadata/proposal/evidence remains small and public; no personal machine paths or private conversation text is needed.

Scripts require an existing suitable Python audio environment (stable-whisper, torch/torchaudio MMS, uroman, Demucs and plotting libraries). Models/checkpoints and parameters are identified in the saved evidence; no installation or new paid service is part of ordinary preview startup. Script hashes bind the recorded acquisition runs. No model output is a human listening attestation.
