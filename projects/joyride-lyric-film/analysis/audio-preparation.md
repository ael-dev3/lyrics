# Audio preparation and timing authority

The source Opus track was extracted from `source/original.mkv` with packet copy. Its decoded stereo soundtrack contains **7,144,968 samples at 48,000 Hz**, or **148.8535 seconds**. No timestamp shift, trim at the beginning, silence insertion, speed change, or phase realignment was applied.

`audio.f32` is the original stereo interleaved 48 kHz PCM. `audio-mono.f32` is the mono analysis copy. The 16 kHz mix and vocal WAV files are model inputs, and their time zero is the same source time zero. Demucs `htdemucs` separation was used only for alignment evidence; the delivery soundtrack remains the original full mix. Resampling the separated stem produced one extra terminal sample, removed from the 48 kHz mono analysis copy with an end-only sample trim. It does not move any audio contact.

The 60 fps delivery requires 8,932 video frames. Its extra 13.167 ms of picture beyond the decoded soundtrack is a final-frame duration effect, not inserted audio.

## Locked delivery and feature regeneration

The original PCM files above are analysis references. Final spectrum and motion use **`audio-delivery.f32` decoded from the locked AAC**, rather than the louder original PCM. The AAC is encoded once from the source Opus with a fixed −3.8 dB gain. The decoded analysis copy is trimmed only at its end to the original sample count; no contact moves. Eleven waveform checks verify zero sample shift between source and delivery.

The commands below record the original acquisition-stage encode. For ordinary reproduction or feature regeneration, **keep the archived AAC unchanged** and use `node scripts/prepare-analysis.ts` followed by `npm run features`; do not repeat the AAC encode.

```sh
ffmpeg -y -i source/soundtrack.opus -af volume=-3.8dB -c:a aac -b:a 320k -ar 48000 -ac 2 -movflags +faststart public/soundtrack.m4a
ffmpeg -y -i public/soundtrack.m4a -af atrim=end_sample=7144968 -ar 48000 -ac 2 -f f32le analysis/audio-delivery.f32
node scripts/analyze.ts
node scripts/motion.ts
```

For source comparison PCM, decode `source/soundtrack.opus` as 48 kHz stereo `f32le` to `analysis/audio.f32`. The full archive retains the time-aligned 16 kHz model inputs and the stereo Demucs stems. Large raw PCM buffers are reproducible intermediates and are excluded from the archive.

Measured locked AAC: −11.20 LUFS integrated, −1.94 dBTP, 2.10 LU loudness range. FFmpeg's loudness measurement report contains hypothetical normalization output fields; these are not the delivered sound. The actual soundtrack only receives the fixed gain above. Both final movies packet-copy this same AAC file.
