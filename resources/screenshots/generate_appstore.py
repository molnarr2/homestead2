#!/usr/bin/env python3
"""
Generate Apple App Store screenshots (1242x2688) from raw device screenshots.

Usage:
    python3 generate_appstore.py                    # Process all in config
    python3 generate_appstore.py --only animals     # Process one by key
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
import argparse

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_DIR = os.path.join(SCRIPT_DIR, "dump1", "work")
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "appstore")

# Output dimensions (iPhone 6.5")
WIDTH = 1242
HEIGHT = 2688

# Layout
PHONE_SCALE = 0.72
CORNER_RADIUS = 40
SHADOW_OFFSET = 12
SHADOW_BLUR = 30

# Colors — warm earth tones matching the app
BG_TOP = (250, 244, 237)       # warm cream
BG_BOTTOM = (235, 220, 200)    # warm tan
TEXT_COLOR = (90, 60, 30)       # dark brown
ACCENT_COLOR = (180, 120, 60)  # app's brown accent
SHADOW_COLOR = (0, 0, 0, 60)

# Fonts
FONT_BOLD = "/System/Library/Fonts/SFNS.ttf"
FONT_REGULAR = "/System/Library/Fonts/SFNS.ttf"

# ── Screenshot config ────────────────────────────────────────────────────
# Each entry: key, filename, headline (line1), subheadline (line2)
SCREENSHOTS = [
    {
        "key": "animals",
        "file": "IMG_8335.PNG",
        "headline": "Manage Your Animals",
        "subheadline": "Groups, breeds & photos at a glance",
    },
    {
        "key": "groups",
        "file": "IMG_8336.PNG",
        "headline": "Organize Into Groups",
        "subheadline": "Manage herds, flocks & pens easily",
    },
    {
        "key": "animal_detail",
        "file": "IMG_8337.PNG",
        "headline": "Complete Profiles",
        "subheadline": "Timeline, health, breeding & care in one place",
    },
    {
        "key": "health",
        "file": "IMG_8338.PNG",
        "headline": "Health Tracking",
        "subheadline": "Vaccinations, medications & vet visits",
    },
    {
        "key": "export",
        "file": "IMG_8339.PNG",
        "headline": "Export Records",
        "subheadline": "Share health, breeding & care reports",
    },
    {
        "key": "home",
        "file": "IMG_8340.PNG",
        "headline": "Your Homestead",
        "subheadline": "Overdue tasks, births & withdrawals at a glance",
    },
    {
        "key": "customize",
        "file": "IMG_8341.PNG",
        "headline": "Fully Customizable",
        "subheadline": "Breeds & care templates for every species",
    },
    {
        "key": "production",
        "file": "IMG_8342.PNG",
        "headline": "Track Production",
        "subheadline": "Eggs, milk, fiber, honey & more",
    },
    {
        "key": "care",
        "file": "IMG_8343.PNG",
        "headline": "Schedule Care",
        "subheadline": "Never miss a feeding or treatment",
    },
]


def create_gradient(width, height, top_color, bottom_color):
    img = Image.new("RGB", (width, height), top_color)
    draw = ImageDraw.Draw(img)
    for y in range(height):
        ratio = y / height
        r = int(top_color[0] + (bottom_color[0] - top_color[0]) * ratio)
        g = int(top_color[1] + (bottom_color[1] - top_color[1]) * ratio)
        b = int(top_color[2] + (bottom_color[2] - top_color[2]) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    return img


def round_corners(img, radius):
    mask = Image.new("L", img.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([(0, 0), img.size], radius=radius, fill=255)
    result = Image.new("RGBA", img.size, (0, 0, 0, 0))
    result.paste(img, mask=mask)
    return result


def add_shadow(canvas, position, size, radius, offset, blur, color):
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    sx = position[0] + offset
    sy = position[1] + offset
    draw.rounded_rectangle(
        [(sx, sy), (sx + size[0], sy + size[1])],
        radius=radius,
        fill=color,
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    return Image.alpha_composite(canvas.convert("RGBA"), shadow)


def generate_screenshot(config):
    input_path = os.path.join(INPUT_DIR, config["file"])
    if not os.path.exists(input_path):
        print(f"  SKIP: {config['file']} not found")
        return

    screenshot = Image.open(input_path)

    # Crop off the status bar (extra margin to eliminate icon artifacts)
    status_bar_h = int(110 * (screenshot.width / 1170))
    screenshot = screenshot.crop((0, status_bar_h, screenshot.width, screenshot.height))

    # Scale screenshot to fit
    phone_w = int(WIDTH * PHONE_SCALE)
    scale = phone_w / screenshot.width
    phone_h = int(screenshot.height * scale)
    screenshot = screenshot.resize((phone_w, phone_h), Image.LANCZOS)

    # Round corners
    screenshot = round_corners(screenshot, CORNER_RADIUS)

    # Create canvas with gradient background
    canvas = create_gradient(WIDTH, HEIGHT, BG_TOP, BG_BOTTOM)

    # Load fonts
    try:
        font_headline = ImageFont.truetype(FONT_BOLD, 72)
        font_sub = ImageFont.truetype(FONT_REGULAR, 44)
    except Exception:
        font_headline = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    # Calculate layout — more breathing room
    text_area_top = 120
    headline_y = text_area_top
    sub_y = headline_y + 110

    # Center the phone vertically in the space below the text
    text_bottom = sub_y + 60
    available_h = HEIGHT - text_bottom
    phone_x = (WIDTH - phone_w) // 2

    if phone_h <= available_h:
        phone_y = text_bottom + (available_h - phone_h) // 2
    else:
        # Scale down to fit with padding
        pad = 40
        ratio = (available_h - pad * 2) / phone_h
        phone_w = int(phone_w * ratio)
        phone_h = int(phone_h * ratio)
        screenshot = screenshot.resize((phone_w, phone_h), Image.LANCZOS)
        screenshot = round_corners(screenshot, CORNER_RADIUS)
        phone_x = (WIDTH - phone_w) // 2
        phone_y = text_bottom + (available_h - phone_h) // 2

    # Add shadow behind phone
    canvas_rgba = add_shadow(
        canvas, (phone_x, phone_y), (phone_w, phone_h),
        CORNER_RADIUS, SHADOW_OFFSET, SHADOW_BLUR, SHADOW_COLOR
    )

    # Paste screenshot
    canvas_rgba.paste(screenshot, (phone_x, phone_y), screenshot)

    # Draw text
    draw = ImageDraw.Draw(canvas_rgba)

    # Headline — centered
    bbox = draw.textbbox((0, 0), config["headline"], font=font_headline)
    tw = bbox[2] - bbox[0]
    draw.text(
        ((WIDTH - tw) // 2, headline_y),
        config["headline"],
        fill=TEXT_COLOR,
        font=font_headline,
    )

    # Subheadline — centered, lighter color
    sub_color = (140, 110, 80)
    bbox = draw.textbbox((0, 0), config["subheadline"], font=font_sub)
    tw = bbox[2] - bbox[0]
    draw.text(
        ((WIDTH - tw) // 2, sub_y),
        config["subheadline"],
        fill=sub_color,
        font=font_sub,
    )

    # Accent line between headline and subheadline
    line_w = 80
    line_y = headline_y + 90
    draw.rounded_rectangle(
        [((WIDTH - line_w) // 2, line_y), ((WIDTH + line_w) // 2, line_y + 5)],
        radius=3,
        fill=ACCENT_COLOR,
    )

    # Save
    output_path = os.path.join(OUTPUT_DIR, f"{config['key']}.png")
    canvas_rgba.convert("RGB").save(output_path, "PNG", quality=95)
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

    print(f"Generating {len(targets)} App Store screenshot(s)...")
    for config in targets:
        generate_screenshot(config)
    print("Done.")


if __name__ == "__main__":
    main()
