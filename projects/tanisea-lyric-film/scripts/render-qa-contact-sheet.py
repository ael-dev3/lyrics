#!/usr/bin/env python3
"""Render a labeled deterministic QA contact sheet without FFmpeg drawtext."""

from __future__ import annotations

import argparse
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError as error:  # pragma: no cover - exercised by the CLI host
    raise SystemExit(
        "The QA contact-sheet fallback requires Pillow. Install it for the active "
        "python3 interpreter, then rerun npm run qa:clips."
    ) from error


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Render a labeled QA contact or release sheet from PNG frames."
    )
    parser.add_argument("--output", required=True)
    parser.add_argument("--font", required=True)
    parser.add_argument("--columns", required=True, type=int)
    parser.add_argument("--cell-size", required=True, type=int)
    parser.add_argument("--label", action="append", required=True)
    parser.add_argument("--input", action="append", required=True)
    return parser.parse_args()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


def render() -> None:
    arguments = parse_arguments()
    output = Path(arguments.output)
    font_path = Path(arguments.font)
    inputs = [Path(value) for value in arguments.input]
    labels = list(arguments.label)
    columns = arguments.columns
    cell_size = arguments.cell_size

    require(columns > 0, "QA contact-sheet columns must be positive")
    require(cell_size > 0, "QA contact-sheet cell size must be positive")
    require(len(inputs) == len(labels), "QA contact-sheet inputs and labels must match")
    require(len(inputs) > 0, "QA contact-sheet requires at least one input")
    require(font_path.is_file(), f"QA contact-sheet font is missing: {font_path}")
    require(not output.exists(), f"Refusing to overwrite existing QA sheet: {output}")
    for input_path in inputs:
        require(input_path.is_file(), f"QA contact-sheet input is missing: {input_path}")

    rows = (len(inputs) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * cell_size, rows * cell_size), "black")
    label_font = ImageFont.truetype(str(font_path), 24)
    draw = ImageDraw.Draw(sheet, "RGBA")

    # The length contract was validated above; omit zip(strict=True) so the
    # fallback remains compatible with the system Python shipped on older macOS.
    for index, (input_path, label) in enumerate(zip(inputs, labels)):
        with Image.open(input_path) as source:
            cell = source.convert("RGB").resize(
                (cell_size, cell_size), Image.Resampling.LANCZOS
            )
        x = (index % columns) * cell_size
        y = (index // columns) * cell_size
        sheet.paste(cell, (x, y))

        left = x + 16
        bottom = y + cell_size - 16
        bounding_box = draw.textbbox((left, bottom), label, font=label_font, anchor="ls")
        draw.rounded_rectangle(
            (
                bounding_box[0] - 8,
                bounding_box[1] - 8,
                bounding_box[2] + 8,
                bounding_box[3] + 8,
            ),
            radius=3,
            fill=(0, 0, 0, 184),
        )
        draw.text(
            (left, bottom),
            label,
            font=label_font,
            fill=(255, 255, 255, 255),
            anchor="ls",
        )

    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix(f"{output.suffix}.tmp")
    try:
        sheet.save(temporary, format="PNG", optimize=False)
        temporary.replace(output)
    finally:
        if temporary.exists():
            temporary.unlink()


if __name__ == "__main__":
    render()
