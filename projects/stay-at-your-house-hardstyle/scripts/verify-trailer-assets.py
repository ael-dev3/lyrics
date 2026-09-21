"""Verify encoded picture anchors against source pixels; requires NumPy + FFmpeg."""
import hashlib
import json
import subprocess
import numpy as np


def probe(path, *args):
    return json.loads(subprocess.check_output(['ffprobe', '-v', 'error', *args, '-of', 'json', path]))


def decode(path, start, count):
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-ss', str(start), '-i', path,
                                  '-an', '-frames:v', str(count), '-vf', 'scale=160:90,format=gray',
                                  '-f', 'rawvideo', '-'])
    return np.frombuffer(raw, np.uint8).reshape(-1, 90, 160).astype(float)


def sha(path):
    with open(path, 'rb') as f:
        return hashlib.file_digest(f, 'sha256').hexdigest()


edit = json.load(open('source/trailer-edit.json'))
source = 'public/trailer.mp4'
times = np.array([float(f['best_effort_timestamp_time']) for f in
                  probe(source, '-select_streams', 'v:0', '-show_entries', 'frame=best_effort_timestamp_time')['frames']])
report = {'scope': 'Silent footage assets only. Pixel comparisons of selected source motion frames; not acoustic lyric accuracy or end-to-end device latency.',
          'method': 'FFmpeg strict decode; 160x90 grayscale reference compared with edited frames. Near-match span has MSE within 0.3 grayscale squared units of the minimum to allow inter-frame encoding variation.',
          'trimEndpointMethod': 'Compare each bounded clip first/final output frame with its retained source frame at 160x90 grayscale. Upward FPS rounding defines the last visible source tick. Per-endpoint MSE must be below 16 grayscale squared units.',
          'editSha256': sha('source/trailer-edit.json'), 'sourceSha256': sha(source), 'assets': [], 'accents': [], 'trimEndpoints': []}
references = {}
for montage in edit['montages']:
    path = 'public/' + montage['id'] + '.mp4'
    subprocess.check_call(['ffmpeg', '-v', 'error', '-xerror', '-i', path, '-f', 'null', '-'])
    streams = probe(path, '-show_entries', 'stream=codec_type,width,height,r_frame_rate,nb_frames,duration')['streams']
    assert len(streams) == 1 and streams[0]['codec_type'] == 'video'
    stream = streams[0]
    assert stream['width'] == 1920 and stream['height'] == 1080 and stream['r_frame_rate'] == '60/1'
    assert int(stream['nb_frames']) == montage['frames']
    output_times = np.array([float(f['best_effort_timestamp_time']) for f in probe(path, '-select_streams', 'v:0', '-show_entries', 'frame=best_effort_timestamp_time')['frames']])
    grid_error_ms = float(np.max(abs(output_times - np.arange(montage['frames']) / 60)) * 1000)
    assert grid_error_ms < .001, (path, grid_error_ms)
    report['assets'].append({'path': path, 'sha256': sha(path), 'strictDecode': 'passed', 'timestampGridMaxErrorMs': round(grid_error_ms, 6), **stream})
    # Frame-address the decoded stream. A decimal timestamp seek near a cut can
    # round into the following shot and cannot establish the final frame's pixels.
    bounded_frames = decode(path, 0, montage['frames'])
    for shot in montage['shots']:
        actual_first = times[np.searchsorted(times, shot['sourceIn'])]
        assert abs(actual_first - shot['sourceFirstFrame']) < 1e-6
        accents = shot.get('accents', [shot['accent']] if 'accent' in shot else [])
        if montage.get('strictSourceBounds'):
            # With upward FPS rounding, a source frame mapped after the final
            # output tick is outside the asset even when it precedes sourceOut.
            final_anchor_time = accents[-1]['sourceTime'] if accents else actual_first
            final_anchor_frame = accents[-1]['frame'] if accents else 0
            last_source_tick = final_anchor_time + (shot['sourceOut'] - final_anchor_time) * (shot['frames'] - 1 - final_anchor_frame) / (shot['frames'] - final_anchor_frame)
            actual_last = times[np.searchsorted(times, last_source_tick, side='right') - 1]
            endpoints = []
            for label, reference_time, output_frame in [
                ('first', actual_first, shot['startFrame']),
                ('last', actual_last, shot['startFrame'] + shot['frames'] - 1),
            ]:
                reference = decode(source, float(reference_time) - .0005, 1)[0]
                encoded = bounded_frames[output_frame]
                mse = float(((reference - encoded) ** 2).mean())
                assert mse < 16, (montage['id'], shot['name'], label, mse)
                endpoints.append({'endpoint': label, 'sourceTime': float(reference_time),
                                  'outputFrame': output_frame, 'mse': round(mse, 4)})
            report['trimEndpoints'].append({'montage': montage['id'], 'shot': shot['name'], 'comparisons': endpoints})
        for accent in accents:
            source_time = accent['sourceTime']
            assert min(abs(times - source_time)) < 1e-6
            if source_time not in references:
                references[source_time] = decode(source, source_time - .0005, 1)[0]
            # Decode a small neighborhood by exact output-frame address, avoiding seek rounding.
            target = shot['startFrame'] + accent['frame']
            start = target - 6
            frames = bounded_frames[start:start + 14]
            mse = ((frames - references[source_time]) ** 2).mean(axis=(1, 2))
            matched = np.where(mse < mse.min() + .3)[0] + start
            first = int(matched[0])
            assert first == target, (montage['id'], shot['name'], first, target)
            report['accents'].append({'montage': montage['id'], 'shot': shot['name'], 'basis': accent['basis'], 'sourceTime': source_time,
                                     'targetFrame': target, 'firstNearMatchFrame': first,
                                     'nearMatchFrames': matched.tolist(), 'minimumMSE': round(float(mse.min()), 4),
                                     'musicTime': round(montage['songStart'] + target / 60, 6)})
report['status'] = 'passed'
with open('evidence/trailer-asset-verification.json', 'w') as f:
    json.dump(report, f, indent=2)
    f.write('\n')
print('Verified', len(report['assets']), 'silent assets and', len(report['accents']), 'motion accents and', len(report['trimEndpoints']) * 2, 'trim endpoints.')
