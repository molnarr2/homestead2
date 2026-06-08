#!/usr/bin/env python3
"""
Generate professional Apple App Store screenshots (1242x2688).

v2: Device bezel, bolder typography, immersive bottom-crop layout.

Usage:
    python3 generate_appstore_v2.py
    python3 generate_appstore_v2.py --only animals
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
import argparse

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_DIR = os.path.join(SCRIPT_DIR, "dump1", "work")
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "appstorev2")

WIDTH = 1242
HEIGHT = 2688

# ── Layout constants ─────────────────────────────────────────────────────
PHONE_WIDTH_RATIO = 0.82
BEZEL_THICKNESS = 6
BEZEL_COLOR = (60, 50, 40)
BEZEL_RADIUS = 50
INNER_RADIUS = 44

# How far the phone extends past the bottom edge (creates the immersive look)
BOTTOM_OVERFLOW = 80

# ── Colors ───────────────────────────────────────────────────────────────
BG_TOP = (248, 241, 232)
BG_BOTTOM = (230, 215, 195)
TEXT_PRIMARY = (55, 35, 15)
TEXT_SECONDARY = (130, 100, 70)

# ── Fonts ────────────────────────────────────────────────────────────────
FONT_HEADLINE = ("/System/Library/Fonts/Avenir Next.ttc", 8)   # Heavy
FONT_SUBHEAD = ("/System/Library/Fonts/Avenir Next.ttc", 5)    # Medium
HEADLINE_SIZE = 82
SUBHEAD_SIZE = 42

# ── Screenshot config ────────────────────────────────────────────────────
SCREENSHOTS = [
    {
        "key": "animals",
        "file": "IMG_8335.PNG",
        "headline": "Manage Your\nAnimals",
        "subheadline": "Groups, breeds & photos at a glance",
    },
    {
        "key": "groups",
        "file": "IMG_8336.PNG",
        "headline": "Organize Into\nGroups",
        "subheadline": "Manage herds, flocks & pens easily",
    },
    {
        "key": "animal_detail",
        "file": "IMG_8337.PNG",
        "headline": "Complete\nProfiles",
        "subheadline": "Timeline, health, breeding & care in one place",
    },
    {
        "key": "health",
        "file": "IMG_8338.PNG",
        "headline": "Health\nTracking",
        "subheadline": "Vaccinations, medications & vet visits",
    },
    {
        "key": "export",
        "file": "IMG_8339.PNG",
        "headline": "Export\nRecords",
        "subheadline": "Share health, breeding & care reports",
    },
    {
        "key": "home",
        "file": "IMG_8340.PNG",
        "headline": "Your\nHomestead",
        "subheadline": "Overdue tasks, births & withdrawals at a glance",
    },
    {
        "key": "customize",
        "file": "IMG_8341.PNG",
        "headline": "Fully\nCustomizable",
        "subheadline": "Breeds & care templates for every species",
    },
    {
        "key": "production",
        "file": "IMG_8342.PNG",
        "headline": "Track\nProduction",
        "subheadline": "Eggs, milk, fiber, honey & more",
    },
    {
        "key": "care",
        "file": "IMG_8343.PNG",
        "headline": "Schedule\nCare",
        "subheadline": "Never miss a feeding or treatment",
    },
]


def create_gradient(width, height, top_color, bottom_color):
    img = Image.new("RGB", (width, height), top_color)
    draw = ImageDraw.Draw(img)
    for y in range(height):
        t = y / height
        t = t * t  # ease-in for a subtler transition
        r = int(top_color[0] + (bottom_color[0] - top_color[0]) * t)
        g = int(top_color[1] + (bottom_color[1] - top_color[1]) * t)
        b = int(top_color[2] + (bottom_color[2] - top_color[2]) * t)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    return img


def make_rounded_mask(size, radius):
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([(0, 0), (size[0] - 1, size[1] - 1)], radius=radius, fill=255)
    return mask


def create_device_frame(screenshot_img, frame_w):
    """Wrap a screenshot in a thin bezel with rounded corners."""
    sw, sh = screenshot_img.size
    outer_w = sw + BEZEL_THICKNESS * 2
    outer_h = sh + BEZEL_THICKNESS * 2

    # Create bezel (outer rounded rect)
    frame = Image.new("RGBA", (outer_w, outer_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame)
    draw.rounded_rectangle(
        [(0, 0), (outer_w - 1, outer_h - 1)],
        radius=BEZEL_RADIUS,
        fill=BEZEL_COLOR,
    )

    # Cut inner area and paste screenshot
    inner_mask = make_rounded_mask((sw, sh), INNER_RADIUS)
    screenshot_rgba = screenshot_img.convert("RGBA")
    frame.paste(screenshot_rgba, (BEZEL_THICKNESS, BEZEL_THICKNESS), inner_mask)

    return frame


def create_shadow(size, radius, blur_radius=40, opacity=80):
    """Create a standalone shadow image."""
    padding = blur_radius * 3
    shadow_canvas = Image.new("RGBA", (size[0] + padding * 2, size[1] + padding * 2), (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow_canvas)
    draw.rounded_rectangle(
        [(padding, padding), (padding + size[0], padding + size[1])],
        radius=radius,
        fill=(0, 0, 0, opacity),
    )
    shadow_canvas = shadow_canvas.filter(ImageFilter.GaussianBlur(blur_radius))
    return shadow_canvas, padding


def draw_multiline_centered(draw, text, x_center, y_top, font, fill, line_spacing=10):
    """Draw multiline text centered horizontally, return total height."""
    lines = text.split("\n")
    total_h = 0
    line_heights = []
    line_widths = []
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        line_widths.append(w)
        line_heights.append(h)
        total_h += h
    total_h += line_spacing * (len(lines) - 1)

    y = y_top
    for i, line in enumerate(lines):
        x = x_center - line_widths[i] // 2
        draw.text((x, y), line, fill=fill, font=font)
        y += line_heights[i] + line_spacing

    return total_h


def generate_screenshot(config):
    input_path = os.path.join(INPUT_DIR, config["file"])
    if not os.path.exists(input_path):
        print(f"  SKIP: {config['file']} not found")
        return

    screenshot = Image.open(input_path)

    # Crop status bar (extra margin to eliminate icon artifacts)
    status_bar_h = int(110 * (screenshot.width / 1170))
    screenshot = screenshot.crop((0, status_bar_h, screenshot.width, screenshot.height))

    # Scale screenshot
    phone_w = int(WIDTH * PHONE_WIDTH_RATIO)
    scale = phone_w / screenshot.width
    phone_h = int(screenshot.height * scale)
    screenshot = screenshot.resize((phone_w, phone_h), Image.LANCZOS)

    # Wrap in device bezel
    framed = create_device_frame(screenshot, phone_w)
    fw, fh = framed.size

    # Create canvas
    canvas = create_gradient(WIDTH, HEIGHT, BG_TOP, BG_BOTTOM).convert("RGBA")

    # Load fonts
    font_headline = ImageFont.truetype(FONT_HEADLINE[0], HEADLINE_SIZE, index=FONT_HEADLINE[1])
    font_subhead = ImageFont.truetype(FONT_SUBHEAD[0], SUBHEAD_SIZE, index=FONT_SUBHEAD[1])

    # Layout: text at top, phone fills remaining space and overflows bottom
    text_top = 130
    draw = ImageDraw.Draw(canvas)

    headline_h = draw_multiline_centered(
        draw, config["headline"], WIDTH // 2, text_top, font_headline, TEXT_PRIMARY, line_spacing=8
    )

    sub_y = text_top + headline_h + 24
    bbox = draw.textbbox((0, 0), config["subheadline"], font=font_subhead)
    sub_w = bbox[2] - bbox[0]
    draw.text(((WIDTH - sub_w) // 2, sub_y), config["subheadline"], fill=TEXT_SECONDARY, font=font_subhead)
    sub_h = bbox[3] - bbox[1]

    # Phone position: start after text, extend past bottom
    phone_top = sub_y + sub_h + 60
    phone_x = (WIDTH - fw) // 2

    # If the phone would be too short to reach the bottom, push it up
    visible_h = HEIGHT - phone_top + BOTTOM_OVERFLOW
    if fh < visible_h:
        phone_top = HEIGHT - fh + BOTTOM_OVERFLOW

    # Shadow
    shadow_img, shadow_pad = create_shadow((fw, fh), BEZEL_RADIUS, blur_radius=50, opacity=50)
    shadow_x = phone_x - shadow_pad + 8
    shadow_y = phone_top - shadow_pad + 12
    canvas.paste(
        shadow_img,
        (shadow_x, shadow_y),
        shadow_img,
    )

    # Paste framed phone
    canvas.paste(framed, (phone_x, phone_top), framed)

    # Crop to final size (removes overflow)
    final = canvas.crop((0, 0, WIDTH, HEIGHT))

    output_path = os.path.join(OUTPUT_DIR, f"{config['key']}.png")
    final.convert("RGB").save(output_path, "PNG", quality=95)
    print(f"  OK: {output_path}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", help="Generate only this key")
    args = parser.parse_args()

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    targets = SCREENSHOTS
    if args.only:
        targets = [s for s in SCREENSHOTS if s["key"] == args.only]
        if not targets:
            print(f"Unknown key: {args.only}")
            print(f"Available: {', '.join(s['key'] for s in SCREENSHOTS)}")
            return

    print(f"Generating {len(targets)} App Store v2 screenshot(s)...")
    for config in targets:
        generate_screenshot(config)
    print("Done.")


if __name__ == "__main__":
    main()
