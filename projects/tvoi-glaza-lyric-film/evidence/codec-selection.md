# Delivery codec selection

The actual portrait composition at 15–17 seconds was captured at 2× and compared using Lanczos and spline downsampling, each with HEVC Main 10 CRF 15, 17 and 19. Each candidate contains the same 120 frames. Metrics compare equal dimensions and pixel formats against each kernel's own downsampled 4:4:4 reference; they measure compression error, not the kernel's objective superiority.

Selected: Lanczos, libx265 medium, CRF 17, hvc1, explicit limited-range BT.709 VUI and container metadata. No sharpening. The original AAC is copied without processing.

For the selected candidate, full-frame SSIM is 0.998886 and the separately masked bilingual lyric region averages 54.255777 dB PSNR. The lowest correctly frame-paired lyric-region score is 52.499535 dB. Both metric inputs are normalized to an exact 1/60 timebase and frame-number PTS; millisecond Matroska timestamps otherwise caused a false onset mismatch. The sample's detailed logs and decoded crops are retained. Whole-frame scores are not used to hide local text defects.

The selected decoded frame and worst lyric-region crops are checked for counter closure, merged punctuation, ringing and thin-stroke damage. The final film also receives independent whole-file frame-clock, strict-decode, audio-packet and selected decoded-picture checks.
