#!/usr/bin/env python3
"""Generate source-clocked flame dynamics from the locked mix and cached vocals.

Requires installed NumPy and ffmpeg/ffprobe. This does not classify screaming.
Measurements and the intentionally nonlinear artistic mapping are documented
separately; neither alters lyric timestamps or media playback.
"""
from __future__ import annotations

import argparse
from fractions import Fraction
import hashlib
import json
import math
from pathlib import Path
import subprocess

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
FPS = 60
WINDOW = 2048
FLOOR_DB = -100.0


def digest(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def probe(path):
    return json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-select_streams', 'a:0', '-show_entries',
        'stream=sample_rate,channels,time_base,duration_ts,start_time', '-of', 'json', str(path)
    ]))['streams'][0]


def decode(path, channels):
    raw = subprocess.check_output([
        'ffmpeg', '-v', 'error', '-i', str(path), '-map', '0:a:0', '-vn',
        '-c:a', 'pcm_f32le', '-f', 'f32le', 'pipe:1'
    ])
    return np.frombuffer(raw, dtype='<f4').reshape(-1, channels)


def db(power):
    return 10 * np.log10(np.maximum(power, 10 ** (FLOOR_DB / 10)))


def percentile_scale(values, mask, low, high):
    lo, hi = np.percentile(values[mask], [low, high])
    return np.clip((values - lo) / max(hi - lo, 1e-8), 0, 1), [float(lo), float(hi)]


def asym_smooth(values, attack=.07, release=.18):
    out = np.empty(len(values), dtype=np.float64)
    value = 0.0
    for i, target in enumerate(values):
        tau = attack if target > value else release
        value += (1 - math.exp(-1 / (FPS * tau))) * (target - value)
        out[i] = value
    return out


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--vocals', type=Path, default=Path('/tmp/sun-burns-independent-audit/vocals.wav'))
    args = parser.parse_args()
    source = ROOT / 'public/source.mp4'
    timeline_path = ROOT / 'src/timeline.json'
    timeline = json.loads(timeline_path.read_text())
    source_hash = digest(source)
    assert source_hash == json.loads((ROOT / 'source/media-manifest.json').read_text())['sha256']
    mix_probe, vocal_probe = probe(source), probe(args.vocals)
    sr = int(mix_probe['sample_rate'])
    count = int(Fraction(mix_probe['duration_ts']) * Fraction(mix_probe['time_base']) * sr)
    assert sr == 44100 and int(vocal_probe['sample_rate']) == sr
    assert Fraction(mix_probe.get('start_time', '0')) == 0
    assert Fraction(vocal_probe.get('start_time', '0')) == 0
    assert int(Fraction(vocal_probe['duration_ts']) * Fraction(vocal_probe['time_base']) * sr) == count
    mix = decode(source, int(mix_probe['channels']))[:count]
    vocal = decode(args.vocals, int(vocal_probe['channels']))
    assert len(vocal) == len(mix) == count
    assert np.all(np.isfinite(mix)) and np.all(np.isfinite(vocal))
    cached_mix = args.vocals.with_name('mix44.wav')
    cached_mix_verified = False
    if cached_mix.exists():
        previous_mix = decode(cached_mix, int(mix_probe['channels']))
        assert np.array_equal(previous_mix, mix), 'Vocal separation input differs from the locked source samples'
        cached_mix_verified = True
    duration = count / sr
    frame_count = math.ceil(count * FPS / sr) + 1
    centers = np.rint(np.arange(frame_count) * sr / FPS).astype(np.int64)
    times = np.arange(frame_count) / FPS
    window = np.hanning(WINDOW)
    window_energy = np.square(window).sum()
    frequencies = np.fft.rfftfreq(WINDOW, 1 / sr)
    highmid_mask = (frequencies >= 1500) & (frequencies < 6500)
    voice_band_mask = (frequencies >= 150) & (frequencies < 8000)
    mix_power = np.empty(frame_count)
    vocal_power = np.empty(frame_count)
    highmid_power = np.empty(frame_count)
    highmid_ratio = np.empty(frame_count)
    flatness = np.empty(frame_count)

    for audio, rms_output, is_vocal in [(mix, mix_power, False), (vocal, vocal_power, True)]:
        padded = np.pad(audio, ((WINDOW // 2, WINDOW // 2 + sr // FPS + 1), (0, 0)))
        for start in range(0, frame_count, 256):
            indices = np.arange(start, min(start + 256, frame_count))
            blocks = np.stack([padded[centers[i]:centers[i] + WINDOW] for i in indices])
            weighted = blocks.astype(np.float64) * window[None, :, None]
            rms_output[indices] = np.mean(np.sum(weighted ** 2, axis=1) / window_energy, axis=1)
            if is_vocal:
                spectrum = np.mean(np.abs(np.fft.rfft(weighted, axis=1)) ** 2, axis=2)
                spectrum[:, 1:-1] *= 2 / (WINDOW * window_energy)
                spectrum[:, [0, -1]] /= WINDOW * window_energy
                high = spectrum[:, highmid_mask]
                highmid_power[indices] = high.sum(axis=1)
                highmid_ratio[indices] = high.sum(axis=1) / np.maximum(spectrum[:, voice_band_mask].sum(axis=1), 1e-12)
                flatness[indices] = np.exp(np.mean(np.log(np.maximum(high, 1e-14)), axis=1)) / np.maximum(high.mean(axis=1), 1e-14)

    for values in (mix_power, vocal_power, highmid_power, highmid_ratio, flatness):
        values[centers >= count] = 0
    mix_db, vocal_db, highmid_db = db(mix_power), db(vocal_power), db(highmid_power)
    lines = [line for section in timeline['sections'] for line in section['lines']]
    sung = np.zeros(frame_count, dtype=bool)
    for line in lines:
        for word in line['words']:
            sung |= (times >= word['start']) & (times < word['end'])
    active = sung & (vocal_db > -65)
    assert active.sum() > FPS * 60

    vocal_level, vocal_range = percentile_scale(vocal_db, active, 15, 97)
    mix_level, mix_range = percentile_scale(mix_db, active, 15, 97)
    highmid_level, highmid_range = percentile_scale(highmid_db, active, 20, 97)
    roughness, rough_range = percentile_scale(flatness, active, 20, 95)
    # Gate the roughness contribution with vocal level: breath/noise and stem
    # leakage must not become forceful flames solely because they are broadband.
    force = np.clip(.78 * vocal_level + .14 * highmid_level + .08 * mix_level
                    + .10 * roughness * vocal_level ** 2, 0, 1)
    raw_drive = force ** 2.2
    presence = np.clip((vocal_db + 65) / 18, 0, 1)
    raw_drive *= presence
    drive = asym_smooth(raw_drive)
    # A separately smoothed high-frequency energy/flatness proxy is useful for
    # changing curl, not for claiming the singer is semantically screaming.
    roughness_output = asym_smooth(roughness * vocal_level * presence)
    rate = .45 + 2.35 * drive ** .78
    phase = np.zeros(frame_count)
    phase[1:] = np.cumsum((rate[1:] + rate[:-1]) * .5 / FPS)
    assert np.all((drive >= 0) & (drive <= 1))
    assert np.all((rate >= .45) & (rate <= 2.8))
    assert np.all(np.diff(phase) > 0)
    assert np.max(np.abs(np.diff(phase) * FPS - (rate[1:] + rate[:-1]) * .5)) < 1e-10

    hooks = []
    for line in lines:
        text = line['text'].lower()
        if 'sun burns out tonight' not in text and 'sun burnt out tonight' not in text:
            continue
        words = [w for w in line['words'] if w['text'].lower().strip(',.?!') in ('sun', 'burns', 'burnt', 'out', 'tonight')]
        start, end = words[0]['start'], words[-1]['end']
        indices = np.flatnonzero((times >= start) & (times < end))
        peak = indices[np.argmax(drive[indices])]
        hooks.append({
            'lineId': line['id'], 'text': line['text'], 'start': start, 'end': end,
            'mixDbfsMedian': round(float(np.median(mix_db[indices])), 2),
            'vocalDbfsMedian': round(float(np.median(vocal_db[indices])), 2),
            'vocalDbfsP95': round(float(np.percentile(vocal_db[indices], 95)), 2),
            'highMidRatioMedian': round(float(np.median(highmid_ratio[indices])), 4),
            'spectralFlatnessMedian': round(float(np.median(flatness[indices])), 4),
            'driveMedian': round(float(np.median(drive[indices])), 4),
            'drivePeak': round(float(drive[peak]), 4), 'peakTime': round(float(times[peak]), 6),
            'rateMedian': round(float(np.median(rate[indices])), 4),
            'ratePeak': round(float(rate[peak]), 4),
            'roughnessProxyMedian': round(float(np.median(roughness_output[indices])), 4),
        })
    assert len(hooks) == 12
    metadata = {
        'schema': 'lyric-film/fire-dynamics/v1', 'frameRate': FPS, 'frameCount': frame_count,
        'durationSeconds': duration, 'sourceSampleRate': sr, 'firstFrameSeconds': 0,
        'source': {'sha256': source_hash, 'sampleCount': count, 'audioStartSeconds': 0},
        'vocals': {'sha256': digest(args.vocals), 'sampleCount': count, 'offsetSeconds': 0,
                   'separationInputVerifiedAgainstSourceSamples': cached_mix_verified,
                   'provenance': 'Existing HTDemucs vocals cache; separation script uses shifts=0 and retains original sample count/timebase. No new separation or download.',
                   'caveat': 'An estimated stem contains separation artifacts/leakage; levels are not an isolated studio vocal master.'},
        'timelineSha256': digest(timeline_path),
        'measurement': {
            'window': '2048-sample centered symmetric Hann', 'windowSeconds': WINDOW / sr,
            'rms': 'Window-weighted stereo-channel power average, expressed in dBFS; no mono cancellation.',
            'centerSample': 'round(frameIndex * sourceSampleRate / frameRate)',
            'highMidHz': [1500, 6500], 'voiceReferenceHz': [150, 8000],
            'spectralFlatness': 'Geometric/arithmetic mean spectral power in 1.5–6.5 kHz.',
            'padding': 'Zero outside source samples', 'floorDbfs': FLOOR_DB,
        },
        'displayMapping': {
            'calibration': 'Track-relative percentiles within supplied sung-word windows, excluding vocal RMS below -65 dBFS.',
            'vocalDbfsP15P97': vocal_range, 'mixDbfsP15P97': mix_range,
            'highMidDbfsP20P97': highmid_range, 'flatnessP20P95': rough_range,
            'force': 'clamp(.78*vocalLevel + .14*highMidLevel + .08*mixLevel + .10*roughness*vocalLevel^2,0,1)',
            'rawDrive': 'force^2.2 * clamp((vocalDbfs + 65)/18,0,1)',
            'driveFloor': 0, 'attackSeconds': .07, 'releaseSeconds': .18,
            'smoothing': 'Source-time one-pole with separate attack/release constants; intentional envelope response, no media clock offset.',
            'rate': '.45 + 2.35 * drive^.78', 'rateRange': [.45, 2.8],
            'phase': 'Trapezoidal integral of rate over source seconds, beginning at zero. Lookup/interpolate this phase; never integrate browser elapsed time.',
            'lookup': 'Interpolate neighboring rows at video.currentTime * frameRate; use stored phase for animation, current media time for word focus.',
            'semanticLimit': 'Amplitude/high-mid/flatness proxy only; does not classify a scream, singer or emotional intent.',
        },
        'columns': ['mixDbfs', 'vocalDbfs', 'highMidDbfs', 'highMidRatio', 'roughness', 'drive', 'rate', 'phase'],
        'rows': np.column_stack([np.round(mix_db, 2), np.round(vocal_db, 2), np.round(highmid_db, 2),
                                 np.round(highmid_ratio, 4), np.round(roughness_output, 4),
                                 np.round(drive, 4), np.round(rate, 4), np.round(phase, 6)]).tolist(),
    }
    destination = ROOT / 'public/fire-dynamics.json'
    destination.write_text(json.dumps(metadata, ensure_ascii=False, separators=(',', ':')) + '\n')
    # Stored rows are stateless random-access values. Reordering seeks and
    # changing the preview rate must not change source-time interpolation.
    stored = np.array(json.loads(destination.read_text())['rows'])
    def lookup(t):
        position = np.clip(t * FPS, 0, frame_count - 1)
        left = int(position)
        right = min(left + 1, frame_count - 1)
        return stored[left] + (stored[right] - stored[left]) * (position - left)
    rng = np.random.default_rng(20260923)
    seek_times = rng.uniform(0, duration, 1024)
    sequential = np.stack([lookup(t) for t in seek_times])
    reversed_values = np.stack([lookup(t) for t in seek_times[::-1]])[::-1]
    assert np.array_equal(sequential, reversed_values)
    assert np.all(np.isfinite(stored))
    assert np.all(np.diff(stored[:, 7]) > 0)
    sorted_hooks = sorted(hooks, key=lambda h: h['driveMedian'])
    audit = {
        'status': 'pass', 'sourceSha256': source_hash, 'vocalsSha256': digest(args.vocals),
        'outputSha256': digest(destination), 'scriptSha256': digest(__file__),
        'checks': {'lockedSourceIdentity': True, 'mixAndVocalSampleCountsMatch': True,
                   'cachedSeparationInputMatchesLockedSourceSamples': cached_mix_verified,
                   'bothOffsetsZero': True, 'all12HooksMeasured': True,
                   'finiteBoundedDriveAndRate': True, 'phaseStrictlyIncreasing': True,
                   'phaseIntegralErrorLessThan1eMinus10': True, 'randomSeekOrderExact1024Times': True},
        'summary': {'frameCount': frame_count, 'byteLength': destination.stat().st_size,
                    'durationSeconds': duration, 'drivePercentilesOnSungWords': np.round(np.percentile(drive[active], [10, 50, 90, 99]), 4).tolist(),
                    'ratePercentilesOnSungWords': np.round(np.percentile(rate[active], [10, 50, 90, 99]), 4).tolist()},
        'hooks': hooks,
        'representatives': {'lowestMedianHook': sorted_hooks[0], 'middleMedianHook': sorted_hooks[len(sorted_hooks)//2], 'highestMedianHook': sorted_hooks[-1]},
        'interpretation': 'Higher estimated vocal level and high-mid/broadband content can support stronger fire. These measurements cannot establish whether a passage is screaming; perceptual labels still require listening. No loudness or roughness inference changes word boundaries.',
    }
    audit_path = ROOT / 'evidence/fire-dynamics-audit.json'
    audit_path.write_text(json.dumps(audit, indent=2, ensure_ascii=False) + '\n')
    print(json.dumps(audit['summary'], indent=2))
    for hook in hooks:
        print(f"{hook['lineId']} {hook['start']:7.3f}s vocal {hook['vocalDbfsMedian']:6.2f}dB drive {hook['driveMedian']:.3f}/{hook['drivePeak']:.3f} rate {hook['rateMedian']:.3f}/{hook['ratePeak']:.3f}")


if __name__ == '__main__':
    main()
