"""Python mirror of src/lyrics.ts (normalization, tokenization and word IDs).

The lyric text is user-supplied in source/lyrics.local.txt and never committed.
Analysis outputs refer to words only by ID (L01-W03) and to the text only by the
SHA-256 of its normalized form. tests/lyrics.test.ts checks both implementations
against the same fixtures.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
# LYD_LYRICS overrides the text path (used only for code smoke tests on
# synthetic fixture text; production analysis reads source/lyrics.local.txt).
import os  # noqa: E402
LYRICS = Path(os.environ["LYD_LYRICS"]) if os.environ.get("LYD_LYRICS") else ROOT / "source" / "lyrics.local.txt"


@dataclass
class Token:
    id: str
    index: int
    display: str
    norm: str
    voice: str  # "lead" | "backing"


@dataclass
class Line:
    id: str
    index: int
    stanza: int
    tokens: list[Token] = field(default_factory=list)


def line_id(line: int) -> str:
    return f"L{line:02d}"


def word_id(line: int, token: int) -> str:
    return f"L{line:02d}-W{token:02d}"


def normalize_lyrics(text: str) -> str:
    text = text.lstrip("﻿").replace("\r\n", "\n").replace("\r", "\n")
    out: list[str] = []
    for raw in text.split("\n"):
        line = re.sub(r"[\t ]+", " ", raw).strip()
        if not line:
            if out and out[-1] != "":
                out.append("")
            continue
        out.append(line)
    while out and out[-1] == "":
        out.pop()
    if not out:
        raise ValueError("The lyric file is empty")
    return "\n".join(out) + "\n"


def normalize_word(display: str) -> str:
    s = re.sub("[‘’ʼ`]", "'", display.lower())
    s = re.sub(r"[^a-z0-9']", "", s)
    return s.strip("'")


def parse_lyrics(text: str) -> tuple[str, list[Line]]:
    normalized = normalize_lyrics(text)
    lines: list[Line] = []
    stanza = 1
    for raw in normalized.split("\n"):
        if raw == "":
            if lines:
                stanza += 1
            continue
        index = len(lines) + 1
        line = Line(line_id(index), index, stanza)
        depth = 0
        for piece in raw.split(" "):
            opens, closes = piece.count("("), piece.count(")")
            voice = "backing" if depth > 0 or piece.startswith("(") else "lead"
            depth = max(0, depth + opens - closes)
            norm = normalize_word(piece)
            if not norm:
                if line.tokens:
                    line.tokens[-1].display += f" {piece}"
                continue
            k = len(line.tokens) + 1
            line.tokens.append(Token(word_id(index, k), k, piece, norm, voice))
        if not line.tokens:
            raise ValueError(f"Line {index} has no singable word")
        lines.append(line)
    # Collapse the stanza counter for consecutive blank lines already handled.
    return normalized, lines


def load() -> tuple[str, str, list[Line]]:
    """Returns (sha256 of normalized text, normalized text, lines)."""
    if not LYRICS.exists():
        raise SystemExit(
            "source/lyrics.local.txt is missing. Save the supplied lyric text there "
            "(UTF-8, one sung line per line, parentheses for backing vocals).")
    normalized, lines = parse_lyrics(LYRICS.read_text(encoding="utf-8"))
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest(), normalized, lines


def shape(lines: list[Line]) -> dict:
    """Text-free structure: counts and character lengths only."""
    return {
        "lines": len(lines),
        "tokens": sum(len(l.tokens) for l in lines),
        "tokensPerLine": [len(l.tokens) for l in lines],
        "stanzaPerLine": [l.stanza for l in lines],
        "voices": {t.id: t.voice for l in lines for t in l.tokens},
        "chars": {t.id: len(t.display) for l in lines for t in l.tokens},
    }


if __name__ == "__main__":
    # Fixture mode for the cross-implementation test: read stdin, print IDs,
    # norms and voices as JSON. Used only with synthetic fixture text.
    normalized, lines = parse_lyrics(sys.stdin.buffer.read().decode("utf-8"))
    json.dump({"sha256": hashlib.sha256(normalized.encode()).hexdigest(),
               "lines": [{"id": l.id, "stanza": l.stanza, "tokens": [[t.id, t.norm, t.voice, t.display] for t in l.tokens]} for l in lines]},
              sys.stdout)
