#!/usr/bin/env python3
"""Verify lyric masters without retaining decoded media.

Example:
 python3 scripts/verify-delivery.py --input output/landscape.mp4 --format landscape --fps 60 --report evidence/landscape-verification.json
 python3 scripts/verify-delivery.py --input output/portrait.mp4 --format portrait --fps 60 --picture-rect 0,326,1080,460 --report evidence/portrait-verification.json

Exit0: checks passed;2: structural/audio/decode failure;3: potential introduced
black regions require inspection. Source-only reports document intended darkness.
All ffmpeg data is streamed; only a small moving window of tiny grayscale frames is buffered.
"""
import argparse, collections, datetime, fractions, hashlib, itertools, json, math, re, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIMENSIONS = {'landscape': (1920, 818), 'portrait': (1080, 1920)}
GRID_W, GRID_H, TILE_COLS, TILE_ROWS = 96, 48, 8, 4


def safe_path(path):
    resolved = Path(path).resolve()
    try: return str(resolved.relative_to(ROOT.resolve()))
    except ValueError: return resolved.name


def file_digest(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b''): digest.update(block)
    return digest.hexdigest()


def run(command):
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode:
        raise RuntimeError(f'Command failed ({result.returncode}): {command[0]}\n{result.stderr.decode(errors="replace")[-4000:]}')
    return result.stdout


def probe(path):
    info = json.loads(run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(path)]))
    if 'filename' in info.get('format', {}): info['format']['filename'] = safe_path(path)
    return info


def stream(info, kind):
    return next((s for s in info['streams'] if s['codec_type'] == kind), None)


def pcm_digest(path):
    # Keep original channel order and sample rate; metadata is checked separately.
    command = ['ffmpeg', '-v', 'error', '-xerror', '-i', str(path), '-map', '0:a:0', '-vn', '-c:a', 'pcm_f32le', '-f', 'f32le', 'pipe:1']
    digest = hashlib.sha256(); size = 0
    with tempfile.TemporaryFile() as err:
        proc = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=err)
        while True:
            block = proc.stdout.read(1024 * 1024)
            if not block: break
            digest.update(block); size += len(block)
        code = proc.wait(); err.seek(0); errors = err.read().decode(errors='replace')
    if code: raise RuntimeError('Audio decode failed: ' + errors[-4000:])
    return {'decodedFormat': 'pcm_f32le, native channels/rate', 'sha256': digest.hexdigest(), 'bytes': size}


def black_windows(path, picture_rect=None):
    filters = []
    if picture_rect:
        x, y, w, h = picture_rect; filters.append(f'crop={w}:{h}:{x}:{y}')
    filters.append('blackdetect=d=0.041:pic_th=0.98:pix_th=0.04')
    command = ['ffmpeg', '-hide_banner', '-nostats', '-loglevel', 'info', '-xerror', '-i', str(path), '-an', '-vf', ','.join(filters), '-f', 'null', '-']
    with tempfile.TemporaryFile() as log:
        result = subprocess.run(command, stdout=subprocess.DEVNULL, stderr=log); log.seek(0); text = log.read().decode(errors='replace')
    if result.returncode: raise RuntimeError('Black-window decode failed: ' + text[-4000:])
    pattern = r'black_start:([\d.]+)\s+black_end:([\d.]+)\s+black_duration:([\d.]+)'
    return [{'start': float(a), 'end': float(b), 'duration': float(c)} for a, b, c in re.findall(pattern, text)]


def decode_check(path):
    command = ['ffmpeg', '-v', 'error', '-xerror', '-err_detect', 'explode', '-i', str(path), '-map', '0:v:0', '-map', '0:a:0', '-f', 'null', '-']
    with tempfile.TemporaryFile() as log:
        r = subprocess.run(command, stdout=subprocess.DEVNULL, stderr=log); log.seek(0); text = log.read().decode(errors='replace')
    return {'passed': r.returncode == 0 and not text.strip(), 'exitCode': r.returncode, 'decoderMessages': text[-12000:].replace(str(Path(path).resolve()), safe_path(path)).replace(str(path), safe_path(path))}


def packet_grid(path, fps, expected_frames):
    """Check display timestamps even when encoded packets are in B-frame order."""
    command = ['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_packets', '-show_entries', 'packet=pts_time', '-of', 'csv=p=0', str(path)]
    seen = bytearray(expected_frames); count = duplicates = outside = off_grid = 0; examples = []
    with tempfile.TemporaryFile() as err:
        proc = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=err, text=True)
        for line in proc.stdout:
            field = line.strip().split(',')[0]
            if not field: continue
            try: pts = float(field)
            except ValueError: continue
            count += 1; n = round(pts * fps)
            # MP4 time-base / decimal quantization allowance, not acoustic tolerance.
            if abs(pts - n / fps) > 0.0006:
                off_grid += 1
                if len(examples) < 8: examples.append({'pts': pts, 'reason': 'off expected constant frame grid'})
            if not 0 <= n < expected_frames:
                outside += 1
            elif seen[n]: duplicates += 1
            else: seen[n] = 1
        code = proc.wait(); err.seek(0); errors = err.read().decode(errors='replace')
    if code: raise RuntimeError('Timestamp probe failed: ' + errors[-2000:])
    missing = expected_frames - sum(seen)
    return {'passed': count == expected_frames and not any([duplicates, outside, off_grid, missing]), 'expectedFrames': expected_frames, 'packetCount': count, 'duplicateDisplayTimestamps': duplicates, 'outsideExpectedFrameIndices': outside, 'offGridTimestamps': off_grid, 'missingDisplayIndices': missing, 'examples': examples}


def gray_frames(path, fps=None, rect=None, max_frames=None, cover=None):
    filters = []
    if rect:
        x, y, w, h = rect; filters.append(f'crop={w}:{h}:{x}:{y}')
    if fps: filters.append(f'fps={fps:.12g}:round=up:start_time=0')
    if cover:
        width, height, zoom, blur, dim = cover
        # Equivalent centered cover crop before enlargement. Blur is scaled to the
        # tiny analysis grid; broad darkness thresholds tolerate this approximation.
        filters.append(f'crop=ih*{width}/{height}/{zoom}:ih/{zoom}:(iw-ow)/2:(ih-oh)/2')
    filters += [f'scale={GRID_W}:{GRID_H}:flags=area', 'format=gray']
    if cover:
        filters += [f'gblur=sigma={blur*GRID_W/width}:sigmaV={blur*GRID_H/height}', f'lut=y=val*{dim}']
    if fps: filters.append('tpad=stop_mode=clone:stop_duration=0.2')
    command = ['ffmpeg', '-v', 'error', '-xerror', '-i', str(path), '-an', '-vf', ','.join(filters), '-vsync', '0']
    if max_frames: command += ['-frames:v', str(max_frames)]
    command += ['-f', 'rawvideo', '-pix_fmt', 'gray', 'pipe:1']
    frame_bytes = GRID_W * GRID_H
    with tempfile.TemporaryFile() as err:
        proc = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=err)
        try:
            while True:
                data = proc.stdout.read(frame_bytes)
                if not data: break
                if len(data) != frame_bytes: raise RuntimeError('Truncated grayscale frame')
                yield data
            code = proc.wait(); err.seek(0); errors = err.read().decode(errors='replace')
            if code: raise RuntimeError('Grayscale decode failed: ' + errors[-4000:])
        finally:
            if proc.poll() is None: proc.terminate(); proc.wait()
            proc.stdout.close()


def frame_stats(data, tile_rows=TILE_ROWS):
    tiles = []; tw, th = GRID_W // TILE_COLS, GRID_H // tile_rows
    for ty in range(tile_rows):
        for tx in range(TILE_COLS):
            total = 0
            for row in range(ty * th, (ty + 1) * th):
                left = row * GRID_W + tx * tw; total += sum(data[left:left + tw])
            tiles.append(total / (tw * th))
    return {'mean': sum(data) / len(data), 'blackFraction': sum(v < 10 for v in data) / len(data), 'tiles': tiles}


def matched_darkness(source, master, fps, count, rect, source_fps, source_cover=None, tile_rows=TILE_ROWS, only_tiles=None):
    guard = max(1, math.ceil(fps / source_fps)); buffer = collections.deque(); checked = 0
    source_count = master_count = 0; active = {}; windows = []; maximum_dropped_tiles = 0
    total_suspect_windows = 0; window_limit = 2000
    def flush(key, item):
        nonlocal total_suspect_windows
        total_suspect_windows += 1
        if len(windows) >= window_limit: return
        windows.append({'kind': key[0], 'tile': key[1], 'start': item['start'] / fps, 'end': (item['last'] + 1) / fps, 'frames': item['last'] - item['start'] + 1, 'lowestMasterMean': round(item['minimum'], 3), 'highestSourceMean': round(item['sourceMaximum'], 3)})
    def inspect(index):
        nonlocal checked, maximum_dropped_tiles
        n, src, dst = buffer[index]; nearby = [x[1] for x in buffer if abs(x[0] - n) <= guard]
        hits = {}
        # Guard adjacent source frames to avoid false positives at source cut/fade edges.
        if source_cover is None and dst['blackFraction'] >= .98 and dst['mean'] < 6 and min(s['mean'] for s in nearby) > 22:
            hits[('whole-picture', None)] = (dst['mean'], src['mean'])
        tiles = []
        for k, value in enumerate(dst['tiles']):
            if only_tiles is not None and k not in only_tiles: continue
            source_min = min(s['tiles'][k] for s in nearby)
            if value < (4 if source_cover else 5) and source_min > (22 if source_cover else 28) and value / source_min < .13:
                tiles.append(k); hits[('picture-tile', k)] = (value, src['tiles'][k])
        maximum_dropped_tiles = max(maximum_dropped_tiles, len(tiles))
        for key in list(active):
            if key not in hits: flush(key, active.pop(key))
        for key, (value, source_value) in hits.items():
            if key not in active: active[key] = {'start': n, 'last': n, 'minimum': value, 'sourceMaximum': source_value}
            else:
                active[key]['last'] = n; active[key]['minimum'] = min(active[key]['minimum'], value); active[key]['sourceMaximum'] = max(active[key]['sourceMaximum'], source_value)
        checked += 1
    src_iter = gray_frames(source, fps=fps, max_frames=count, cover=source_cover)
    dst_iter = gray_frames(master, rect=rect)
    sentinel = object()
    for n, (src, dst) in enumerate(itertools.zip_longest(src_iter, dst_iter, fillvalue=sentinel)):
        if src is not sentinel: source_count += 1
        if dst is not sentinel: master_count += 1
        if src is sentinel or dst is sentinel: continue
        buffer.append((n, frame_stats(src, tile_rows), frame_stats(dst, tile_rows)))
        if n == guard:
            inspect(0)
        elif n > guard:
            inspect(len(buffer) - 1 - guard)
        if len(buffer) > 2 * guard + 1: buffer.popleft()
    if buffer:
        final_n = buffer[-1][0]
        for i, (n, _, _) in enumerate(buffer):
            if n > final_n - guard: inspect(i)
    for key, item in active.items(): flush(key, item)
    return {'passed': source_count == master_count == checked == count and not windows, 'sourceFpsResampling': 'round=up', 'sourceComparedFrames': source_count, 'masterDecodedFrames': master_count, 'pairedFramesInspected': checked, 'grid': [GRID_W, GRID_H], 'tileGrid': [TILE_COLS, tile_rows], 'examinedTiles': sorted(only_tiles) if only_tiles is not None else list(range(TILE_COLS*tile_rows)), 'sourceCoverTransform': source_cover, 'sourceEdgeGuardFrames': guard, 'foregroundRect': rect, 'suspectedIntroducedDarkRegions': windows, 'totalSuspectWindows': total_suspect_windows, 'diagnosticWindowLimit': window_limit, 'omittedDiagnosticWindows': max(0,total_suspect_windows-window_limit), 'maximumSimultaneousSuspectTiles': maximum_dropped_tiles, 'limits': 'Coarse matched-time luminance screening detects empty picture frames and substantial dark regions. It cannot certify all visual detail or exclude tiny spots, normal scene changes, subtle corruption, or deliberate shading. Suspects require inspection; no thresholds alter the delivered media.'}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--input', type=Path); ap.add_argument('--source', type=Path, default=ROOT / 'public/source.mp4')
    ap.add_argument('--format', choices=DIMENSIONS); ap.add_argument('--fps', type=float, default=60)
    ap.add_argument('--expected-frames', type=int); ap.add_argument('--picture-rect', help='x,y,width,height in master pixels')
    ap.add_argument('--report', type=Path); ap.add_argument('--source-only', action='store_true')
    args = ap.parse_args()
    if not args.source_only and (not args.input or not args.format): ap.error('--input and --format are required unless --source-only')
    if not 0 < args.fps <= 240: ap.error('--fps must be in (0,240]')
    source = probe(args.source); sv, sa = stream(source, 'video'), stream(source, 'audio')
    duration = max(float(sv['duration']), float(sa['duration'])); expected = args.expected_frames or math.ceil(duration * args.fps - 1e-9)
    report = {'schema': 'lyric-delivery-verification-v1', 'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'source': safe_path(args.source), 'sourceSha256': file_digest(args.source), 'sourceDuration': duration, 'sourceVideoDuration': float(sv['duration']), 'sourceAudioDuration': float(sa['duration']), 'sourceBlackWindows': black_windows(args.source), 'limits': 'Machine verification supplements visual/listening review. Shared source black frames are intentional source content for this comparison, not proof of an artistic decision.'}
    if args.source_only:
        report['sourceAudioPcm'] = pcm_digest(args.source); report['sourceProbe'] = source; report['status'] = 'source-reference-recorded'; code = 0
    else:
        master = probe(args.input); mv, ma = stream(master, 'video'), stream(master, 'audio')
        if not mv or not ma: raise RuntimeError('Master must contain video and audio')
        rect = tuple(map(int, args.picture_rect.split(','))) if args.picture_rect else ((0, 326, 1080, 460) if args.format == 'portrait' else (0, 0, 1920, 818))
        if len(rect) != 4 or min(rect) < 0 or rect[2] <= 0 or rect[3] <= 0 or rect[0] + rect[2] > int(mv['width']) or rect[1] + rect[3] > int(mv['height']): ap.error('--picture-rect falls outside master')
        actual_fps = float(fractions.Fraction(mv['avg_frame_rate'])); tolerance = 1 / args.fps + .002
        metadata = {'dimensions': [mv['width'], mv['height']], 'expectedDimensions': list(DIMENSIONS[args.format]), 'fps': actual_fps, 'expectedFps': args.fps, 'videoStart': float(mv.get('start_time', 0)), 'audioStart': float(ma.get('start_time', 0)), 'videoDuration': float(mv['duration']), 'audioDuration': float(ma['duration']), 'containerDuration': float(master['format']['duration']), 'audioRate': int(ma['sample_rate']), 'audioChannels': int(ma['channels']), 'audioCodec': ma['codec_name'], 'pixelFormat': mv.get('pix_fmt')}
        checks = {'dimensions': tuple(metadata['dimensions']) == DIMENSIONS[args.format], 'fps': abs(actual_fps - args.fps) < .0001, 'sourceAudioProperties': ma['sample_rate'] == sa['sample_rate'] and ma['channels'] == sa['channels'], 'startsAtSourceZero': abs(metadata['videoStart']) < .0001 and abs(metadata['audioStart']) < 1 / int(sa['sample_rate']), 'completeVideoDuration': abs(metadata['videoDuration'] - expected / args.fps) <= .0001 and metadata['videoDuration'] + tolerance >= duration, 'completeAudioDuration': abs(metadata['audioDuration'] - float(sa['duration'])) <= 1 / int(sa['sample_rate']) + .000001}
        print('Checking decoded soundtrack identity...', file=sys.stderr, flush=True)
        spcm, mpcm = pcm_digest(args.source), pcm_digest(args.input); checks['decodedSoundtrackIdentical'] = spcm['sha256'] == mpcm['sha256'] and spcm['bytes'] == mpcm['bytes']
        print('Checking complete decode and presentation timestamps...', file=sys.stderr, flush=True)
        decoding = decode_check(args.input); grid = packet_grid(args.input, args.fps, expected); checks['decode'] = decoding['passed']; checks['frameGrid'] = grid['passed']
        print('Comparing every master picture frame against matching source time...', file=sys.stderr, flush=True)
        darkness = matched_darkness(args.source, args.input, args.fps, expected, rect, float(fractions.Fraction(sv['avg_frame_rate'])))
        fill_check = None
        if args.format == 'portrait':
            print('Checking portrait outer fill against dimmed, blurred source cover...', file=sys.stderr, flush=True)
            width, height = DIMENSIONS['portrait']; tile_rows = 12
            # Inspect only tiles wholly outside the clear foreground picture.
            x, y, w, h = rect; outer_tiles = set()
            for ty in range(tile_rows):
                for tx in range(TILE_COLS):
                    left, right = tx*width/TILE_COLS, (tx+1)*width/TILE_COLS
                    top, bottom = ty*height/tile_rows, (ty+1)*height/tile_rows
                    if right <= x or left >= x+w or bottom <= y or top >= y+h:
                        outer_tiles.add(ty*TILE_COLS+tx)
            fill_check = matched_darkness(args.source, args.input, args.fps, expected, None, float(fractions.Fraction(sv['avg_frame_rate'])), source_cover=(width,height,1.1232,28,.68), tile_rows=tile_rows, only_tiles=outer_tiles)
            fill_check['limits'] += ' Expected cover uses centered crop enlarged112.32%, approximate scaled Gaussian blur equivalent to28 output pixels, and0.68 luma multiplier. Foreground-intersecting tiles are excluded; variable final shade is tolerated. Near-zero patches are flagged only when the expected dimmed fill remains bright.'
        report.update({'input': safe_path(args.input), 'inputSha256': file_digest(args.input), 'format': args.format, 'metadata': metadata, 'checks': checks, 'sourceAudioPcm': spcm, 'masterAudioPcm': mpcm, 'decode': decoding, 'presentationGrid': grid, 'masterFullFrameBlackWindows': black_windows(args.input), 'matchedPictureDarkness': darkness, 'portraitOuterFillDarkness': fill_check})
        hard_pass = all(checks.values()) and darkness['masterDecodedFrames'] == expected
        visual_pass = darkness['passed'] and (fill_check is None or fill_check['passed'])
        report['status'] = 'failed' if not hard_pass else ('review-required' if not visual_pass else 'passed')
        code = 2 if not hard_pass else (3 if not visual_pass else 0)
    output = json.dumps(report, indent=2) + '\n'
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True); args.report.write_text(output); print(f'{report["status"]}: {args.report}', flush=True)
    else: print(output)
    return code


if __name__ == '__main__':
    try: sys.exit(main())
    except (RuntimeError, KeyError, ValueError) as exc:
        print(f'Verification error: {exc}', file=sys.stderr); sys.exit(2)
