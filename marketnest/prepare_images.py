"""Prepare polished, real image assets for the Marketnest frontend.

Source artwork lives in the workspace's `vibe_images` folder. This script crops,
lightly colour-grades and saves the images into `frontend/public/images` so the
UI no longer depends on the original SVG placeholder illustrations.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter
import math

ROOT = Path(__file__).resolve().parent
SRC = ROOT.parent / "vibe_images"
OUT = ROOT / "frontend" / "public" / "images"

PRODUCTS = OUT / "products"
SHOPS = OUT / "shops"
LOGOS = OUT / "logos"
AVATARS = OUT / "avatars"

for folder in (PRODUCTS, SHOPS, LOGOS, AVATARS):
    folder.mkdir(parents=True, exist_ok=True)


def find(name: str) -> Path:
    matches = sorted(SRC.glob(f"{name}_*.png"))
    if not matches:
        raise SystemExit(f"Missing source image: {name}")
    return matches[-1]


def grade(image: Image.Image) -> Image.Image:
    """A subtle cool, editorial grade to unify the generated artwork."""
    image = ImageEnhance.Color(image).enhance(0.94)
    image = ImageEnhance.Contrast(image).enhance(1.04)
    tint = Image.new("RGB", image.size, (15, 118, 110))
    return Image.blend(image, tint, 0.035)


def crop_to(image: Image.Image, size, box=None) -> Image.Image:
    image = image.convert("RGB")
    target_w, target_h = size
    if box is None:
        scale = max(target_w / image.width, target_h / image.height)
        image = image.resize(
            (round(image.width * scale), round(image.height * scale)), Image.LANCZOS
        )
        left = (image.width - target_w) // 2
        top = (image.height - target_h) // 2
        image = image.crop((left, top, left + target_w, top + target_h))
    else:
        image = image.crop(box).resize(size, Image.LANCZOS)
    return grade(image)


def save_photo(source: str, dest: Path, size, box=None, quality=86) -> None:
    image = crop_to(Image.open(find(source)), size, box)
    image.save(dest, "JPEG", quality=quality, optimize=True, progressive=True)


product_sources = {
    "stoneware-mug": "mug",
    "macrame-hanger": "macrame",
    "sourdough-loaf": "bread",
    "stoneware-bowl": "bowl",
    "potted-plant": "plant",
    "canvas-tote": "tote",
    "soy-candle": "candle",
    "gold-chain": "necklace",
    "soap-dish": "soap",
    "hibiscus-tea": "tea",
    "raw-honey": "honey",
    "coffee-beans": "coffee",
    "card-holder": "wallet",
}

for name, source in product_sources.items():
    save_photo(source, PRODUCTS / f"{name}.jpg", (900, 900))

# Three extra product shots reuse rich lifestyle artwork with tighter crops.
save_photo("cover-textile-studio", PRODUCTS / "linen-apron.jpg", (900, 900), (280, 120, 1180, 1020))
save_photo("bowl", PRODUCTS / "spoon-rest.jpg", (900, 900), (180, 260, 800, 880))
save_photo("cover-candle-studio", PRODUCTS / "gift-set.jpg", (900, 900), (260, 140, 1160, 1040))

shop_sources = {
    "shop-1": "cover-candle-studio",
    "shop-2": "cover-pottery-studio",
    "shop-3": "cover-textile-studio",
    "shop-4": "cover-honey-farm",
    "shop-5": "cover-plant-shop",
    "shop-6": "cover-coffee-bar",
}
for name, source in shop_sources.items():
    save_photo(source, SHOPS / f"{name}.jpg", (1600, 900), quality=88)

save_photo("hero-market", OUT / "hero-market.jpg", (1600, 1000), quality=88)

# Geometric shop marks — artwork, not initials, so businesses feel branded.
def gradient(size, c1, c2):
    image = Image.new("RGB", size)
    pixels = image.load()
    w, h = size
    for y in range(h):
        for x in range(w):
            t = (x + y) / (w + h)
            pixels[x, y] = tuple(round(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))
    return image


def make_logo(name, c1, c2, glyph, accent=(255, 255, 255)):
    size = 256
    image = gradient((size, size), c1, c2).convert("RGBA")
    overlay = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    white = accent + (255,)
    soft = accent + (70,)

    if glyph == "flame":
        draw.ellipse((78, 150, 178, 232), fill=soft)
        draw.polygon([(128, 44), (176, 136), (156, 190), (100, 190), (80, 136)], fill=white)
        draw.polygon([(128, 96), (150, 152), (106, 152)], fill=c2 + (255,))
    elif glyph == "bowl":
        draw.pieslice((48, 72, 208, 232), 0, 180, fill=white)
        draw.rounded_rectangle((108, 190, 148, 220), radius=10, fill=white)
        draw.arc((84, 92, 172, 170), 200, 340, fill=c2 + (255,), width=10)
    elif glyph == "weave":
        for i in range(3):
            y = 100 + i * 30
            draw.rounded_rectangle((58, y, 198, y + 14), radius=7, fill=white if i % 2 == 0 else soft)
        draw.rounded_rectangle((112, 58, 144, 200), radius=16, fill=soft)
    elif glyph == "drop":
        draw.polygon([(128, 40), (176, 130), (128, 210), (80, 130)], fill=white)
        draw.ellipse((104, 120, 152, 168), fill=c2 + (255,))
        draw.arc((40, 60, 120, 140), 300, 90, fill=soft, width=10)
    elif glyph == "leaf":
        draw.ellipse((70, 60, 186, 200), fill=soft)
        draw.polygon([(186, 70), (150, 190), (74, 196)], fill=white)
        draw.line((186, 70, 92, 190), fill=c2 + (255,), width=8)
    elif glyph == "cup":
        draw.rounded_rectangle((70, 108, 170, 196), radius=26, fill=white)
        draw.arc((152, 118, 208, 174), 270, 90, fill=white, width=14)
        draw.ellipse((88, 88, 152, 120), fill=soft)

    image = Image.alpha_composite(image, overlay).filter(ImageFilter.SMOOTH)
    image.convert("RGB").save(
        LOGOS / f"{name}.jpg", "JPEG", quality=92, optimize=True, progressive=True
    )


make_logo("logo-1", (15, 118, 110), (249, 115, 22), "flame")
make_logo("logo-2", (124, 58, 237), (245, 158, 11), "bowl", accent=(36, 32, 56))
make_logo("logo-3", (20, 184, 166), (99, 102, 241), "weave")
make_logo("logo-4", (245, 158, 11), (249, 115, 22), "drop", accent=(36, 32, 56))
make_logo("logo-5", (14, 116, 144), (20, 184, 166), "leaf")
make_logo("logo-6", (124, 58, 237), (236, 72, 153), "cup")

# Profile avatars. The customer portrait is reused from the workspace profile
# artwork; the vendor avatar is a tight crop of the pottery studio photo.
profile = ROOT.parent / "images" / "profile.png"
if profile.exists():
    save_photo_source = crop_to(Image.open(profile), (320, 320))
    save_photo_source.save(AVATARS / "customer.jpg", "JPEG", quality=90, optimize=True)
save_photo("cover-pottery-studio", AVATARS / "vendor.jpg", (320, 320), (420, 180, 740, 500))

print(f"Prepared images in {OUT}")
