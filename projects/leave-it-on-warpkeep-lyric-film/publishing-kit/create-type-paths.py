#!/usr/bin/env python3
"""Outline the cover headline from the project's licensed Space Grotesk font.

This is an authoring helper. The checked-in type-paths.json lets the cover
builder run without a fontTools installation.
"""

import json
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont


ROOT = Path(__file__).resolve().parent
FONT_PATH = ROOT.parent / "public/fonts/SpaceGrotesk.ttf"
OUT = ROOT / "type-paths.json"
CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789•— "

font = TTFont(FONT_PATH)
if "fvar" in font:
    instantiateVariableFont(font, {"wght": 700}, inplace=True)
cmap = font.getBestCmap()
glyphset = font.getGlyphSet()
metrics = font["hmtx"].metrics
glyphs = {}
for char in CHARS:
    name = cmap.get(ord(char))
    if not name:
        raise SystemExit(f"Missing cover glyph {char!r}")
    pen = SVGPathPen(glyphset)
    glyphset[name].draw(pen)
    glyphs[char] = {"advance": metrics[name][0], "path": pen.getCommands()}

OUT.write_text(
    json.dumps({"font": "Space Grotesk", "weight": 700,
                "unitsPerEm": font["head"].unitsPerEm, "glyphs": glyphs},
               ensure_ascii=False, separators=(",", ":")) + "\n"
)
print(OUT)
