#!/usr/bin/env python3
"""Generates launcher icons and PWA icons from a single vector-style drawing.

Draws the shield emblem from the game's favicon at high resolution, then
downsamples so every platform size is sharp.
"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
S = 1024  # master size, downsampled for each target

BG = (13, 20, 38, 255)
GOLD = (232, 196, 106, 255)


def draw_icon(size: int, rounded: bool = True, pad_ratio: float = 0.0) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    if rounded:
        d.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * 0.22), fill=BG)
    else:
        d.rectangle([0, 0, size, size], fill=BG)

    # Soft glow behind the shield
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    cx, cy = size // 2, int(size * 0.46)
    for i in range(28, 0, -1):
        r = int(size * 0.46 * i / 28)
        a = int(3 + 10 * (i / 28) ** 2)
        gd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(232, 196, 106, a))
    img.alpha_composite(glow)

    pad = size * pad_ratio
    w = size - 2 * pad
    x0, y0 = pad, pad
    lw = max(2, int(w * 0.055))

    top = y0 + w * 0.16
    bot = y0 + w * 0.90
    mid = x0 + w * 0.5
    left = x0 + w * 0.17
    right = x0 + w * 0.83
    shoulder = y0 + w * 0.40

    shield = [
        (mid, top),
        (right, top + w * 0.09),
        (right, shoulder + w * 0.10),
        (right - w * 0.03, bot - w * 0.16),
        (mid, bot),
        (left + w * 0.03, bot - w * 0.16),
        (left, shoulder + w * 0.10),
        (left, top + w * 0.09),
    ]
    d.polygon(shield, outline=GOLD, width=lw)

    cross_top = top + w * 0.20
    cross_bot = bot - w * 0.20
    d.line([(mid, cross_top), (mid, cross_bot)], fill=GOLD, width=lw)
    arm_y = top + w * 0.40
    d.line([(mid - w * 0.17, arm_y), (mid + w * 0.17, arm_y)], fill=GOLD, width=lw)
    return img


def main() -> None:
    master = draw_icon(S)

    android_res = ROOT / "android/app/src/main/res"
    for folder, px in [("mipmap-mdpi", 48), ("mipmap-hdpi", 72), ("mipmap-xhdpi", 96),
                       ("mipmap-xxhdpi", 144), ("mipmap-xxxhdpi", 192)]:
        out = android_res / folder
        out.mkdir(parents=True, exist_ok=True)
        master.resize((px, px), Image.LANCZOS).save(out / "ic_launcher.png")
        draw_icon(px, rounded=True, pad_ratio=0.12).save(out / "ic_launcher_round.png")

    # Adaptive-icon foreground: transparent background, safe-zone padded
    fg = draw_icon(S, rounded=False, pad_ratio=0.26)
    px_data = fg.load()
    for y in range(S):
        for x in range(S):
            r, g, b, a = px_data[x, y]
            if (r, g, b) == (13, 20, 38):
                px_data[x, y] = (0, 0, 0, 0)
    for folder, px in [("mipmap-mdpi", 108), ("mipmap-hdpi", 162), ("mipmap-xhdpi", 216),
                       ("mipmap-xxhdpi", 324), ("mipmap-xxxhdpi", 432)]:
        out = android_res / folder
        out.mkdir(parents=True, exist_ok=True)
        fg.resize((px, px), Image.LANCZOS).save(out / "ic_launcher_foreground.png")

    icons = ROOT / "icons"
    icons.mkdir(exist_ok=True)
    master.resize((192, 192), Image.LANCZOS).save(icons / "icon-192.png")
    master.resize((512, 512), Image.LANCZOS).save(icons / "icon-512.png")
    draw_icon(512, rounded=False).save(icons / "icon-maskable-512.png")
    master.resize((180, 180), Image.LANCZOS).save(icons / "apple-touch-icon.png")
    master.resize((32, 32), Image.LANCZOS).save(icons / "favicon-32.png")

    print("icons generated")


if __name__ == "__main__":
    main()
