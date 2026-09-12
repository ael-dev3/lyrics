# Phrase windows

The 44 user-supplied lines were located by full-track Whisper large-v3-turbo attention alignment on the vocal stem. Each model search window extends 300 ms before and 220 ms after that phrase candidate. These margins permit independent CTC encoders to find the word contacts rather than inheriting attention starts, which can absorb preceding silence. Every repeated chorus is aligned on its own audio window; no word timestamps are copied from another occurrence.

The transcription-only pass was used for navigation and to identify possible gaps, never to replace the supplied wording. Its isolated 146.68 s lyric line is absent from the supplied text and full text-constrained alignment; it is not introduced into the lyric film.
