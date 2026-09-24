#!/usr/bin/env python3
"""Independent checks for the two completed lyric-film files.

Run after production encoding. This verifies stream identity, clock coverage,
decodability, unexpected black frames, and whether the original moving image
survives throughout both compositions. Contact sheets are review aids for
lyric/word parity; they do not claim to prove acoustic synchronization.
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import math
import re
import statistics
import subprocess
from pathlib import Path


PROJECT = Path(__file__).resolve().parents[1]
MANIFEST = PROJECT / "source" / "media-manifest.json"
SOURCE = PROJECT / "public" / "source.mp4"
TIMELINE = PROJECT / "src" / "timeline.json"
OUTPUT = PROJECT / "output"
BLACK_PATTERN = re.compile(r"black_start:([0-9.]+) black_end:([0-9.]+) black_duration:([0-9.]+)")
STREAM_HASH_PATTERN = re.compile(r"^0,a,SHA256=([0-9a-f]{64})$", re.MULTILINE)
WIDTH, HEIGHT = 64, 32
PIXELS = WIDTH * HEIGHT
PICTURE_SAMPLES_PER_SECOND = 2


def command(args: list[str], *, binary: bool = False) -> str | bytes:
    result = subprocess.run(args, capture_output=True, check=False)
    if result.returncode:
        error = result.stderr.decode("utf-8", "replace")[-2500:]
        raise RuntimeError(f"{' '.join(args[:5])} failed ({result.returncode}): {error}")
    return result.stdout if binary else result.stdout.decode("utf-8", "replace")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def report_path(path: Path) -> str:
    """Keep local account and checkout paths out of public evidence."""
    try:
        return path.resolve().relative_to(PROJECT).as_posix()
    except ValueError:
        return path.name


def probe(path: Path) -> dict:
    return json.loads(command([
        "ffprobe", "-v", "error", "-show_entries",
        "format=duration,size:stream=index,codec_type,codec_name,pix_fmt,width,height,"
        "sample_aspect_ratio,r_frame_rate,avg_frame_rate,start_time,duration,"
        "nb_frames,sample_rate,channels", "-of", "json", str(path),
    ]))


def stream(probe_data: dict, kind: str) -> dict:
    matches = [item for item in probe_data["streams"] if item["codec_type"] == kind]
    if len(matches) != 1:
        raise AssertionError(f"expected exactly one {kind} stream; got {len(matches)}")
    return matches[0]


def audio_hash(path: Path) -> str:
    text = command([
        "ffmpeg", "-v", "error", "-i", str(path), "-map", "0:a:0",
        "-c:a", "copy", "-f", "streamhash", "-hash", "SHA256", "-",
    ])
    match = STREAM_HASH_PATTERN.search(text)
    if not match:
        raise AssertionError(f"AAC stream hash absent for {path}: {text[:300]}")
    return match.group(1)


def packet_times(path: Path) -> list[float]:
    text = command([
        "ffprobe", "-v", "error", "-select_streams", "a:0",
        "-show_entries", "packet=pts_time", "-of", "csv=p=0", str(path),
    ])
    return [float(line) for line in text.splitlines() if line.strip()]


def black_intervals(path: Path) -> list[list[float]]:
    result = subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "info", "-xerror",
        "-i", str(path), "-an",
        "-vf", "blackdetect=d=0.08:pix_th=0.02:pic_th=0.98",
        "-f", "null", "-",
    ], capture_output=True, text=True, check=False)
    if result.returncode:
        raise RuntimeError(f"black-frame decode failed for {path}: {result.stderr[-2000:]}")
    return [[float(a), float(b)] for a, b, _ in BLACK_PATTERN.findall(result.stderr)]


def gray_picture_samples(path: Path, crop: str, *, source_clock: bool = False) -> list[bytes]:
    # Sample exact 60 fps frame indices 0,30,60... from both paths. Applying a
    # separate `fps=2` filter to a variable-frame-rate source and a CFR render
    # can choose different sides of a cut despite identical production frames.
    prefix = "fps=60:round=up," if source_clock else ""
    data = command([
        "ffmpeg", "-v", "error", "-xerror", "-i", str(path),
        "-an", "-vf", f"{prefix}select=not(mod(n\\,30)),crop={crop},scale={WIDTH}:{HEIGHT}:flags=area,format=gray",
        "-fps_mode", "passthrough", "-f", "rawvideo", "-pix_fmt", "gray", "-",
    ], binary=True)
    if len(data) % PIXELS:
        raise AssertionError(f"incomplete decoded gray picture samples from {path}")
    return [data[offset:offset + PIXELS] for offset in range(0, len(data), PIXELS)]


def correlation(a: bytes, b: bytes) -> tuple[float, float, float]:
    n = len(a)
    ma = sum(a) / n
    mb = sum(b) / n
    va = sum((x - ma) ** 2 for x in a)
    vb = sum((y - mb) ** 2 for y in b)
    if not va or not vb:
        return 0.0, ma, math.sqrt(va / n)
    cov = sum((x - ma) * (y - mb) for x, y in zip(a, b))
    return cov / math.sqrt(va * vb), ma, math.sqrt(va / n)


def image_continuity(source: list[bytes], rendered: list[bytes]) -> dict:
    if abs(len(source) - len(rendered)) > 1:
        raise AssertionError(f"sampled source/output lengths diverge: {len(source)}, {len(rendered)}")
    reviewed = []
    for frame_index, (base, frame) in enumerate(zip(source, rendered)):
        score, mean, deviation = correlation(base, frame)
        if mean < 12 or deviation < 8:
            continue  # source is almost black or almost uniform: correlation is undefined
        reviewed.append({"timeSeconds": frame_index / PICTURE_SAMPLES_PER_SECOND,
                         "correlation": round(score, 4)})
    if len(reviewed) < 100:
        raise AssertionError(f"too few source scenes were testable: {len(reviewed)}")
    low = [item for item in reviewed if item["correlation"] < 0.70]
    median = statistics.median(item["correlation"] for item in reviewed)
    sustained_low = any(
        current["timeSeconds"] - previous["timeSeconds"] <= 1 / PICTURE_SAMPLES_PER_SECOND + 1e-6
        for previous, current in zip(low, low[1:])
    )
    if median < 0.88 or len(low) > max(4, math.ceil(len(reviewed) * 0.02)) or sustained_low:
        raise AssertionError(
            f"source picture continuity failed: median r={median:.3f}; "
            f"{len(low)}/{len(reviewed)} low-similarity samples; first={low[:8]}"
        )
    return {
        "testableSamples": len(reviewed), "sampleRateHz": PICTURE_SAMPLES_PER_SECOND,
        "medianCorrelation": round(median, 4), "lowSimilaritySamples": low,
        "method": "Central unobstructed picture region, 2 Hz, grayscale Pearson correlation."
    }


def optional_contact_sheets(files: dict[str, Path], target: Path) -> list[str]:
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError as error:
        raise RuntimeError("Pillow is required for --contact-dir") from error
    target.mkdir(parents=True, exist_ok=True)
    timeline = json.loads(TIMELINE.read_text())
    words = [word for section in timeline["sections"] for line in section["lines"] for word in line["words"]]
    # Gaps, fast onsets, held endings and final source fade are all represented.
    times = [0.8, 8.7, 14.0, 45.0, 61.3, 62.1, 65.15,
             103.1, 129.6, 153.5, 174.35, 190.0, 193.2]
    paths = []
    for layout, path in files.items():
        cell_width, cell_height = (400, 380) if layout == "original-4x3" else (300, 570)
        sheet = Image.new("RGB", (cell_width * 4, cell_height * math.ceil(len(times) / 4)), "#171317")
        pen = ImageDraw.Draw(sheet)
        font = ImageFont.load_default()
        for index, time in enumerate(times):
            encoded = command([
                "ffmpeg", "-v", "error", "-ss", f"{time:.4f}", "-i", str(path),
                "-frames:v", "1", "-vf", f"scale={cell_width - 12}:-2",
                "-f", "image2pipe", "-vcodec", "png", "-",
            ], binary=True)
            with Image.open(io.BytesIO(encoded)) as image:
                image = image.convert("RGB")
                image.thumbnail((cell_width - 12, cell_height - 42))
                x = (index % 4) * cell_width + (cell_width - image.width) // 2
                y = (index // 4) * cell_height + 28
                sheet.paste(image, (x, y))
            active = next((word for word in words if word["start"] <= time < word["end"]), None)
            name = active["text"] if active else "no active word"
            label = f"{time:06.2f}s | expected: {name}"
            pen.text(((index % 4) * cell_width + 8, (index // 4) * cell_height + 7), label, fill="#f5e5db", font=font)
        destination = target / f"{layout}-review.png"
        sheet.save(destination)
        paths.append(report_path(destination))
    return paths


def reference_frame_parity(files: dict[str, Path], reference_dir: Path) -> dict:
    """Compare native renderer stills and the exact indexed encoded frames.

    The reference stills must be exported by the same production composition
    before video compression. This catches different lyric/ink states, missing
    overlays and an off-by-one frame in the encoded files. A separate visual
    comparison with the live browser preview is still required.
    """
    try:
        from PIL import Image, ImageChops
    except ImportError as error:
        raise RuntimeError("Pillow is required for --reference-dir") from error

    def mean_difference(a: Image.Image, b: Image.Image) -> float:
        channels = ImageChops.difference(a, b).histogram()
        pixels = a.width * a.height * 3
        return sum((index % 256) * count for index, count in enumerate(channels)) / pixels

    result = {}
    for layout, path in files.items():
        metadata = probe(path)
        video = stream(metadata, "video")
        fps_parts = [int(part) for part in video["avg_frame_rate"].split("/")]
        fps = fps_parts[0] / fps_parts[1]
        image_dir = reference_dir / layout
        stills = sorted(image_dir.glob("frame-*.png"))
        if not stills:
            raise AssertionError(f"no production reference stills in {image_dir}")
        samples = []
        for still in stills:
            match = re.fullmatch(r"frame-(\d+)\.png", still.name)
            if not match:
                continue
            frame_index = int(match.group(1))
            encoded = command([
                "ffmpeg", "-v", "error", "-xerror", "-ss", f"{frame_index / fps:.9f}",
                "-i", str(path), "-frames:v", "1",
                "-f", "image2pipe", "-vcodec", "png", "-",
            ], binary=True)
            with Image.open(still) as saved, Image.open(io.BytesIO(encoded)) as decoded:
                saved_rgb, decoded_rgb = saved.convert("RGB"), decoded.convert("RGB")
                if saved_rgb.size != decoded_rgb.size:
                    raise AssertionError(f"{layout} reference/output dimensions differ at frame {frame_index}")
                whole_mae = mean_difference(saved_rgb, decoded_rgb)
                w, h = saved_rgb.size
                box = ((round(w*.05), round(h*.69), round(w*.95), round(h*.95))
                       if layout == "original-4x3"
                       else (round(w*.06), round(h*.67), round(w*.94), round(h*.84)))
                lyric_mae = mean_difference(saved_rgb.crop(box), decoded_rgb.crop(box))
                if whole_mae > 15 or lyric_mae > 19:
                    # Rare demux seeking rounding should not make a good frame
                    # look wrong. Confirm a failing seek with exact frame select.
                    exact = command([
                        "ffmpeg", "-v", "error", "-xerror", "-i", str(path),
                        "-vf", f"select=eq(n\\,{frame_index})", "-frames:v", "1",
                        "-f", "image2pipe", "-vcodec", "png", "-",
                    ], binary=True)
                    with Image.open(io.BytesIO(exact)) as selected:
                        selected_rgb = selected.convert("RGB")
                        whole_mae = mean_difference(saved_rgb, selected_rgb)
                        lyric_mae = mean_difference(saved_rgb.crop(box), selected_rgb.crop(box))
                    if whole_mae > 15 or lyric_mae > 19:
                        raise AssertionError(
                            f"{layout} frame {frame_index} differs from its unencoded still: "
                            f"whole MAE={whole_mae:.2f}, lyric-zone MAE={lyric_mae:.2f}"
                        )
                samples.append({
                    "frame": frame_index, "timeSeconds": round(frame_index / fps, 6),
                    "wholeRgbMae": round(whole_mae, 3),
                    "lyricZoneRgbMae": round(lyric_mae, 3),
                    "referenceSha256": sha256(still),
                })
        if not samples:
            raise AssertionError(f"no indexed PNG reference frames in {image_dir}")
        result[layout] = samples
    return result


def verify(source: Path, files: dict[str, Path], sheet_dir: Path | None, reference_dir: Path | None) -> dict:
    manifest = json.loads(MANIFEST.read_text())
    if sha256(source) != manifest["sha256"]:
        raise AssertionError("local source does not match the locked source manifest")
    original = probe(source)
    original_audio = stream(original, "audio")
    source_duration = float(original_audio["duration"])
    baseline_black = black_intervals(source)
    baseline_hash = audio_hash(source)
    baseline_packets = packet_times(source)
    source_pictures = gray_picture_samples(source, "864:432:288:162", source_clock=True)
    report = {
        "schema": "ill-change-for-you-render-qa/v1",
        "sourceSha256": manifest["sha256"],
        "sourceAudioPacketSha256": baseline_hash,
        "sourceAudioPackets": len(baseline_packets),
        "sourceIntentionalBlackIntervals": baseline_black,
        "outputs": {},
        "limits": [
            "Picture continuity compares unobstructed central image regions at 2 Hz; inspect contact sheets and full files for local defects.",
            "Expected-word labels on contact sheets come from the approved timing map; they are not OCR or acoustic listening proof.",
        ],
    }
    for layout, path in files.items():
        if not path.is_file() or path.stat().st_size < 1_000_000:
            raise AssertionError(f"missing or implausibly short {layout} render: {path}")
        info = probe(path)
        video, audio = stream(info, "video"), stream(info, "audio")
        expected_size = (1440, 1080) if layout == "original-4x3" else (1080, 1920)
        if (int(video["width"]), int(video["height"])) != expected_size:
            raise AssertionError(f"{layout} size is not {expected_size}: {video['width']}x{video['height']}")
        if video["codec_name"] != "h264" or video["pix_fmt"] != "yuv420p":
            raise AssertionError(f"{layout} is not H.264 yuv420p")
        numerator, denominator = map(int, video["avg_frame_rate"].split("/"))
        fps = numerator / denominator
        if not 59.95 <= fps <= 60.05:
            raise AssertionError(f"{layout} unexpected frame rate: {fps}")
        if audio["codec_name"] != "aac" or int(audio["sample_rate"]) != 44100 or int(audio["channels"]) != 2:
            raise AssertionError(f"{layout} audio is not source-format stereo AAC 44.1 kHz")
        if abs(float(audio.get("start_time", 0))) > 0.002 or abs(float(video.get("start_time", 0))) > 1 / fps:
            raise AssertionError(f"{layout} has a stream-start offset")
        if abs(float(audio["duration"]) - source_duration) > 0.002:
            raise AssertionError(f"{layout} audio does not reach the exact source ending")
        video_duration = float(video["duration"])
        if not source_duration - 1 / fps <= video_duration <= source_duration + 2 / fps:
            raise AssertionError(f"{layout} picture does not cover the soundtrack ending")
        frame_count = int(video["nb_frames"])
        if not math.floor(source_duration * fps) - 1 <= frame_count <= math.ceil(source_duration * fps) + 2:
            raise AssertionError(f"{layout} missing or excessive video frames: {frame_count}")
        current_hash = audio_hash(path)
        if current_hash != baseline_hash:
            raise AssertionError(f"{layout} AAC packet content differs from source")
        current_packets = packet_times(path)
        if len(current_packets) != len(baseline_packets):
            raise AssertionError(f"{layout} audio packet count differs from source")
        largest_shift = max(abs(a - b) for a, b in zip(current_packets, baseline_packets))
        if largest_shift > 0.002:
            raise AssertionError(f"{layout} audio packet timestamps shifted by {largest_shift:.6f}s")
        output_black = black_intervals(path)
        unexpected_black = [
            interval for interval in output_black
            if not any(interval[0] >= base[0] - 0.13 and interval[1] <= base[1] + 0.15 for base in baseline_black)
        ]
        if unexpected_black:
            raise AssertionError(f"{layout} introduced black-frame gaps: {unexpected_black}")
        crop = "864:432:288:162" if layout == "original-4x3" else "648:324:216:410"
        continuity = image_continuity(source_pictures, gray_picture_samples(path, crop))
        report["outputs"][layout] = {
            "path": report_path(path), "sha256": sha256(path), "sizeBytes": path.stat().st_size,
            "width": expected_size[0], "height": expected_size[1],
            "fps": fps, "frameCount": frame_count,
            "videoDurationSeconds": video_duration, "audioDurationSeconds": float(audio["duration"]),
            "audioPacketSha256": current_hash, "audioPacketCount": len(current_packets),
            "maximumAudioPacketTimestampShiftSeconds": largest_shift,
            "blackIntervals": output_black, "sourcePictureContinuity": continuity,
        }
    if sheet_dir:
        report["contactSheets"] = optional_contact_sheets(files, sheet_dir)
    if reference_dir:
        report["encodedFrameParity"] = reference_frame_parity(files, reference_dir)
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=SOURCE)
    parser.add_argument("--original", type=Path, default=OUTPUT / "Ill-Change-for-You-original-4x3.mp4")
    parser.add_argument("--portrait", type=Path, default=OUTPUT / "Ill-Change-for-You-portrait-9x16.mp4")
    parser.add_argument("--report", type=Path)
    parser.add_argument("--contact-dir", type=Path)
    parser.add_argument("--reference-dir", type=Path,
                        help="Directory with <layout>/frame-XXXXXX.png unencoded composition stills")
    args = parser.parse_args()
    files = {"original-4x3": args.original, "portrait-9x16": args.portrait}
    report = verify(args.source, files, args.contact_dir, args.reference_dir)
    printed = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(printed)
    print(printed)


if __name__ == "__main__":
    main()
