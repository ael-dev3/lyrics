#!/usr/bin/env python3
"""Assemble the verified 4:3/9:16 posting kit in a fresh local directory.

Both input films must have completed the project render/verification gate first.
This script does not render or certify word alignment; it checks the posting files,
copies their exact bytes, writes optional English captions and hashes the kit.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PUBLISHING = ROOT / "publishing"
TIMELINE = ROOT / "src/timeline.json"
SOURCE_MANIFEST = ROOT / "source/media-manifest.json"
YOUTUBE_VIDEO = "Mitski-Ill-Change-for-You-YouTube-4x3.mp4"
TIKTOK_VIDEO = "Mitski-Ill-Change-for-You-TikTok-9x16.mp4"
YOUTUBE_COVER = "Mitski-Ill-Change-for-You-YouTube-Thumbnail-1920x1080.jpg"
TIKTOK_COVER = "Mitski-Ill-Change-for-You-TikTok-Cover-Profile-1200x1600.jpg"


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def probe(path: Path) -> dict:
    output = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", str(path)]
    )
    return json.loads(output)


def check_video(path: Path, portrait: bool, expected_duration: float) -> dict:
    info = probe(path)
    video = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
    audio = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    if not video or not audio:
        raise SystemExit(f"Missing video/audio stream: {path}")
    width, height = int(video["width"]), int(video["height"])
    if portrait:
        if (width, height) != (1080, 1920):
            raise SystemExit(f"TikTok must be 1080x1920: {width}x{height}")
    elif width < 1440 or height < 1080 or width * 3 != height * 4:
        raise SystemExit(f"YouTube must be native 4:3 at least 1440x1080: {width}x{height}")
    rate = video.get("avg_frame_rate", "0/1")
    n, d = (int(x) for x in rate.split("/"))
    fps = n / d
    if not math.isclose(fps, 60, abs_tol=.02):
        raise SystemExit(f"Unexpected frame rate {rate} in {path}")
    duration = float(info["format"]["duration"])
    if abs(duration - expected_duration) > .20:
        raise SystemExit(f"Duration differs from locked source by more than 0.20s: {path}: {duration}")
    if video["codec_name"] != "h264" or audio["codec_name"] != "aac":
        raise SystemExit(f"Expected H.264/AAC in {path}")
    return {"width": width, "height": height, "fps": fps, "durationSeconds": duration,
            "videoCodec": video["codec_name"], "audioCodec": audio["codec_name"]}


def stamp(seconds: float, comma: bool) -> str:
    ms = round(seconds * 1000)
    hours, ms = divmod(ms, 3_600_000)
    minutes, ms = divmod(ms, 60_000)
    whole, ms = divmod(ms, 1000)
    return f"{hours:02d}:{minutes:02d}:{whole:02d}{',' if comma else '.'}{ms:03d}"


def captions() -> tuple[str, str, int]:
    timeline = json.loads(TIMELINE.read_text())
    lines = [line for section in timeline["sections"] for line in section["lines"]]
    if len(lines) != 25 or sum(len(line["words"]) for line in lines) != 118:
        raise SystemExit("Caption cue/word count differs from reviewed timeline")
    srt, vtt = [], ["WEBVTT", ""]
    previous_end = -1.0
    for index, line in enumerate(lines, 1):
        start = line["words"][0]["start"]
        end = line["words"][-1]["end"]
        if start < previous_end or end <= start:
            raise SystemExit(f"Overlapping or inverted caption cue: {line['id']}")
        previous_end = end
        wording = line["text"]
        srt.append(f"{index}\n{stamp(start, True)} --> {stamp(end, True)}\n{wording}\n")
        vtt.append(f"{stamp(start, False)} --> {stamp(end, False)}\n{wording}\n")
    return "\n".join(srt) + "\n", "\n".join(vtt) + "\n", len(lines)


def copy(src: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
    if digest(src) != digest(dst):
        raise SystemExit(f"Copy hash mismatch: {src} → {dst}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--youtube", type=Path, required=True, help="Verified native 4:3 full-length MP4")
    parser.add_argument("--tiktok", type=Path, required=True, help="Verified 1080x1920 full-length MP4")
    parser.add_argument("--dest", type=Path, required=True, help="Fresh local staging directory; Desktop copy is separate")
    args = parser.parse_args()
    if args.dest.exists():
        raise SystemExit(f"Refusing to replace an existing package: {args.dest}")
    source = json.loads(SOURCE_MANIFEST.read_text())
    duration = float(source["audio"]["durationSeconds"])
    youtube_info = check_video(args.youtube, False, duration)
    tiktok_info = check_video(args.tiktok, True, duration)
    srt, vtt, cue_count = captions()
    cover_data = json.loads((ROOT / "evidence/cover-assets.json").read_text())
    for item in cover_data["covers"]:
        path = PUBLISHING / item["file"]
        if digest(path) != item["sha256"]:
            raise SystemExit(f"Cover hash mismatch: {path}")
    dest = args.dest.resolve()
    dest.mkdir(parents=True)
    copied = {
        args.youtube: dest / "YouTube" / YOUTUBE_VIDEO,
        args.tiktok: dest / "TikTok" / TIKTOK_VIDEO,
        PUBLISHING / YOUTUBE_COVER: dest / "YouTube" / "thumbnail.jpg",
        PUBLISHING / TIKTOK_COVER: dest / "TikTok" / "profile-cover.jpg",
        PUBLISHING / "YouTube-Title.txt": dest / "YouTube" / "title.txt",
        PUBLISHING / "YouTube-Description.txt": dest / "YouTube" / "description.txt",
        PUBLISHING / "TikTok-Title.txt": dest / "TikTok" / "title.txt",
        PUBLISHING / "TikTok-Description.txt": dest / "TikTok" / "description.txt",
        PUBLISHING / "metadata.json": dest / "posting-metadata.json",
    }
    for src, target in copied.items():
        copy(src, target)
    (dest / "Captions").mkdir()
    (dest / "Captions/english.srt").write_text(srt)
    (dest / "Captions/english.vtt").write_text(vtt)
    copy(PUBLISHING / "START-HERE.md", dest / "START-HERE.md")
    manifest = {
        "edition": "I’ll Change for You — approved 2026-09-24 preview map",
        "sourceVideoSha256": source["sha256"],
        "timelineSha256": digest(TIMELINE),
        "sourceDurationSeconds": duration,
        "captions": {"language": "en", "cueCount": cue_count, "basis": "reviewed line windows; word focus is burned in"},
        "videos": {"youtube": youtube_info, "tiktok": tiktok_info},
        "files": [],
    }
    for file in sorted(dest.rglob("*")):
        if file.is_file():
            manifest["files"].append({"path": str(file.relative_to(dest)),
                                      "bytes": file.stat().st_size, "sha256": digest(file)})
    (dest / "Delivery-Manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    checksum_lines = [f"{digest(file)}  {file.relative_to(dest)}" for file in sorted(dest.rglob("*")) if file.is_file()]
    (dest / "SHA256SUMS.txt").write_text("\n".join(checksum_lines) + "\n")
    print(json.dumps({"package": str(dest), "postingFiles": len(manifest["files"]),
                      "checksumLines": len(checksum_lines), "totalBytes": sum(x["bytes"] for x in manifest["files"])}, indent=2))


if __name__ == "__main__":
    main()
