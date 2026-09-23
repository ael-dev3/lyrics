#!/usr/bin/env python3
"""Build deterministic, source-clocked spectral measurements for the preview.

Requires ffmpeg, ffprobe and NumPy. No browser audio processing or display gain
is involved. Run from any directory; paths resolve relative to this script.
"""

from __future__ import annotations

import hashlib
import json
import math
from fractions import Fraction
from pathlib import Path
import subprocess

import numpy as np


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/source.mp4"
MANIFEST = ROOT / "source/media-manifest.json"
FPS = 60
BANDS = 64
FFT_SIZE = 4096
MIN_HZ = 20.0
MAX_HZ = 16000.0
FLOOR_DB = -96.0
CEILING_DB = 0.0
DB_STEP = 0.01


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_json(path: Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def main() -> None:
    manifest = json.loads(MANIFEST.read_text())
    source_sha = sha256(SOURCE)
    assert source_sha == manifest["sha256"], "Source identity differs from locked manifest"
    probe = json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries",
        "stream=sample_rate,channels,time_base,start_pts,start_time,duration_ts,duration",
        "-of", "json", str(SOURCE),
    ]))["streams"][0]
    sample_rate = int(probe["sample_rate"])
    channels = int(probe["channels"])
    assert Fraction(probe["start_time"]) == 0, "Explicit offset mapping is needed for this source"
    assert MAX_HZ < sample_rate / 2
    exact_samples = Fraction(probe["duration_ts"]) * Fraction(probe["time_base"]) * sample_rate
    assert exact_samples.denominator == 1
    sample_count = int(exact_samples)
    duration = sample_count / sample_rate

    # AAC edit-list priming is handled by ffmpeg's demuxer/decoder. Trim decoded
    # final packet padding to the stream's declared duration in source samples.
    raw = subprocess.check_output([
        "ffmpeg", "-v", "error", "-i", str(SOURCE), "-map", "0:a:0", "-vn",
        "-c:a", "pcm_f32le", "-f", "f32le", "pipe:1",
    ])
    decoded = np.frombuffer(raw, dtype="<f4").reshape(-1, channels)
    assert len(decoded) >= sample_count, "Decoder produced fewer samples than the locked stream"
    decoded_sample_count = len(decoded)
    pcm = decoded[:sample_count]
    assert np.all(np.isfinite(pcm))

    window = np.hanning(FFT_SIZE).astype(np.float64)
    window_square_sum = float(np.square(window).sum())
    hz_per_bin = sample_rate / FFT_SIZE
    frequencies = np.fft.rfftfreq(FFT_SIZE, 1 / sample_rate)
    bin_left = np.maximum(0, frequencies - hz_per_bin / 2)
    bin_right = np.minimum(sample_rate / 2, frequencies + hz_per_bin / 2)
    edges = np.geomspace(MIN_HZ, MAX_HZ, BANDS + 1)
    # Fractional frequency-cell coverage integrates every band, including those
    # narrower than one FFT bin. Such low bands share resolution; this does not
    # claim 64 independent narrow frequency estimates at low frequencies.
    weights = np.maximum(0, np.minimum(edges[1:, None], bin_right[None, :])
                         - np.maximum(edges[:-1, None], bin_left[None, :])) / hz_per_bin
    assert np.all(weights.sum(axis=1) > 0), "An analysis band has no frequency coverage"
    one_sided = np.full(len(frequencies), 2.0)
    one_sided[[0, -1]] = 1.0
    weighted_bands = weights * one_sided[None, :] / (FFT_SIZE * window_square_sum)

    # Frame i is centered on round(i * sample_rate / FPS), without accumulating
    # floating-point increments. This source has exactly 735 samples per frame.
    frame_count = math.ceil(Fraction(sample_count * FPS, sample_rate)) + 1
    centers = np.array([(i * sample_rate * 2 + FPS) // (2 * FPS)
                        for i in range(frame_count)], dtype=np.int64)
    half = FFT_SIZE // 2
    padded = np.pad(pcm, ((half, half + sample_rate // FPS + 1), (0, 0)))

    def measure_frames(indices: np.ndarray, silence: bool = False) -> np.ndarray:
        blocks = np.stack([padded[centers[i]:centers[i] + FFT_SIZE] for i in indices])
        if silence:
            blocks = np.zeros_like(blocks)
        spectra = np.fft.rfft(blocks.astype(np.float64) * window[None, :, None], axis=1)
        # Average channel powers, not channel samples: a stereo anti-phase signal
        # must still register instead of disappearing through mono cancellation.
        power = np.mean(np.square(np.abs(spectra)), axis=2)
        band_power = power @ weighted_bands.T
        db = 10 * np.log10(np.maximum(band_power, 10 ** (FLOOR_DB / 10)))
        encoded = np.rint((np.clip(db, FLOOR_DB, CEILING_DB) - FLOOR_DB) / DB_STEP).astype("<u2")
        encoded[centers[indices] >= sample_count] = 0
        return encoded

    features = np.empty((frame_count, BANDS), dtype="<u2")
    for start in range(0, frame_count, 256):
        indices = np.arange(start, min(start + 256, frame_count))
        features[indices] = measure_frames(indices)

    # Independent seeks recalculate windows in a different order, without filter
    # state. Include boundaries and the preview's existing review landmarks.
    rng = np.random.default_rng(20260923)
    seeks = np.unique(np.r_[0, 1, frame_count - 2, frame_count - 1,
                           np.rint(np.array([8.3, 33.2, 55.2, 77.9, 109, 179.15, 220]) * FPS).astype(int),
                           rng.integers(0, frame_count, 512)])
    for indices in (seeks, seeks[::-1], seeks[::2]):
        assert np.array_equal(measure_frames(indices), features[indices]), "Seek order changed measurements"
    assert np.count_nonzero(measure_frames(np.array([0, frame_count // 2]), silence=True)) == 0
    assert features[-1].max() == 0
    assert np.all(features.max(axis=0) > 0), "A source band never rose above the measurement floor"
    assert np.all(features.std(axis=0) > 0), "A source band is constant"
    assert np.all(np.percentile(features[:-1], 95, axis=0) > 2600), "A source band has no useful content above -70 dBFS"

    binary = ROOT / "public/audio-features.bin"
    binary.write_bytes(features.tobytes(order="C"))
    assert binary.stat().st_size == frame_count * BANDS * 2
    assert np.array_equal(np.frombuffer(binary.read_bytes(), dtype="<u2").reshape(features.shape), features)
    db_features = FLOOR_DB + features.astype(np.float64) * DB_STEP
    band_stats = []
    for band in range(BANDS):
        db = db_features[:-1, band]
        band_stats.append({
            "band": band,
            "lowerHz": round(float(edges[band]), 6),
            "upperHz": round(float(edges[band + 1]), 6),
            "centerHz": round(float(math.sqrt(edges[band] * edges[band + 1])), 6),
            "contributingFftBins": int(np.count_nonzero(weights[band])),
            "floorFraction": round(float(np.mean(features[:-1, band] == 0)), 6),
            "dbfsP10": round(float(np.percentile(db, 10)), 2),
            "dbfsMedian": round(float(np.median(db)), 2),
            "dbfsP95": round(float(np.percentile(db, 95)), 2),
            "dbfsP99": round(float(np.percentile(db, 99)), 2),
            "dbfsMaximum": round(float(db.max()), 2),
        })
    metadata = {
        "schema": "lyric-film/audio-band-measurements/v1",
        "source": {
            "path": "source.mp4", "sha256": source_sha,
            "audioStream": "0:a:0", "sampleRate": sample_rate, "channels": channels,
            "startSeconds": 0, "sampleCount": sample_count, "durationSeconds": duration,
            "decodedSamplesBeforeTrimmingPacketPadding": decoded_sample_count,
        },
        "data": {
            "path": "audio-features.bin", "sha256": sha256(binary),
            "byteLength": binary.stat().st_size, "frameCount": frame_count, "bandCount": BANDS,
            "layout": "row-major [frame][band]", "dtype": "uint16", "byteOrder": "little-endian",
            "dbfsOffset": FLOOR_DB, "dbfsStep": DB_STEP, "zeroMeans": "at or below -96 dBFS",
            "decode": "bandDbfs = dbfsOffset + uint16Value * dbfsStep",
        },
        "clock": {
            "framesPerSecond": FPS, "firstFrameSeconds": 0,
            "frameTime": "frameIndex / framesPerSecond",
            "centerSample": "round(frameIndex * sampleRate / framesPerSecond)",
            "lastFrameSeconds": (frame_count - 1) / FPS,
            "playbackClock": "source video.currentTime; audio and picture remain on the same video element",
            "lookup": "Interpolate rows floor(t * 60) and ceil(t * 60). Clamp indices. Return floor outside 0 <= t < durationSeconds.",
            "zeroLatencyOffsetSeconds": 0,
        },
        "analysis": {
            "quantity": "Hann-window-weighted RMS band power, averaged across channel powers; dBFS relative to sample amplitude 1",
            "fftSize": FFT_SIZE, "window": "symmetric Hann", "windowSampleRange": "[centerSample - 2048, centerSample + 2048)",
            "windowDurationSeconds": FFT_SIZE / sample_rate, "boundaryPadding": "zero outside source samples",
            "frequencySpacing": "logarithmic", "minimumHz": MIN_HZ, "maximumHz": MAX_HZ,
            "frequencyRangeReason": "This AAC source effectively cuts off at 16 kHz. A preliminary 20 Hz–20 kHz analysis left its top two bands at the -96 dBFS floor for 99.19% and 99.99% of frames. The selected range keeps all 64 bands within source content.",
            "fftBinHz": hz_per_bin, "integration": "fractional overlap of each log band with FFT-bin frequency cells",
            "resolutionCaveat": "Low bands narrower than 10.766602 Hz share FFT bins; all bands have nonzero coverage, but low bands are correlated, not independent narrow filters.",
            "smoothing": "No temporal smoothing or artistic gain. Time-centered windows give symmetric temporal support around the requested media time.",
            "displayTransform": "None. Display gain, dynamic-range mapping, color and geometric easing belong exclusively to the player.",
            "floorDbfs": FLOOR_DB, "ceilingDbfs": CEILING_DB, "quantizationDb": DB_STEP,
        },
        "bands": band_stats,
        "generator": {
            "script": "scripts/analyze-audio.py", "scriptSha256": sha256(Path(__file__)),
            "numpyVersion": np.__version__,
            "ffmpegVersion": subprocess.check_output(["ffmpeg", "-version"], text=True).splitlines()[0],
            "determinism": "Same locked source and decoder/tool versions give identical bytes; no random values are used in measurement generation.",
        },
    }
    write_json(ROOT / "public/audio-features.json", metadata)
    audit = {
        "status": "pass", "sourceSha256": source_sha, "featuresSha256": sha256(binary),
        "checks": {
            "lockedSourceMatchesManifest": True,
            "all64BandsHaveFrequencyCoverage": True,
            "all64BandsVaryOnThisRecording": True,
            "all64BandsRiseAboveFloorOnThisRecording": True,
            "all64BandsHaveP95AboveMinus70Dbfs": True,
            "independentWindowSeekOrdering": True,
            "seekFramesCheckedInBothDirections": len(seeks),
            "syntheticSilenceIsExactlyFloor": True,
            "terminalFrameIsExactlyFloor": True,
            "coversFullDeclaredAudioDuration": centers[-1].item() >= sample_count,
            "binaryRoundTripIsExact": True,
        },
        "summary": {
            "frameCount": frame_count, "bandCount": BANDS, "byteLength": binary.stat().st_size,
            "durationSeconds": duration, "lastFrameSeconds": (frame_count - 1) / FPS,
            "fftBinHz": hz_per_bin, "windowDurationMilliseconds": FFT_SIZE / sample_rate * 1000,
            "globalMaximumDbfs": round(float(db_features.max()), 2),
            "silentFloorFractionAcrossAllBandFrames": round(float(np.mean(features == 0)), 6),
            "bandsNarrowerThanOneFftBin": int(np.count_nonzero(np.diff(edges) < hz_per_bin)),
            "packetPaddingSamplesDiscarded": decoded_sample_count - sample_count,
        },
        "limits": [
            "This measures audio energy; it does not identify beats, lyrics, syllables or vocal identity.",
            "A time-centered 92.88 ms window has 46.44 ms of support on either side; it introduces no causal playback delay, but cannot distinguish events below that analysis resolution.",
            "Display smoothing can add visual lag; use source-time deterministic lookup rather than stateful smoothing after seeking.",
        ],
    }
    write_json(ROOT / "evidence/audio-features-audit.json", audit)
    print(json.dumps(audit["summary"], indent=2))
    print(f"PASS: {len(seeks)} independently recomputed seeks; 64 useful bands; exact silence and binary round trip.")


if __name__ == "__main__":
    main()
