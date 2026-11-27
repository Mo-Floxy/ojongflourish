from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import math, wave, struct

SRC = Path("vibe_images")
ROOT = Path("marketnest")
PRODUCTS = ROOT / "backend/media/seed/products"
COVERS = ROOT / "backend/media/seed/covers"
LOGOS = ROOT / "backend/media/seed/logos"
HERO = ROOT / "frontend/public/images"
SOUNDS = ROOT / "frontend/public/sounds"
for d in (PRODUCTS, COVERS, LOGOS, HERO, SOUNDS):
    d.mkdir(parents=True, exist_ok=True)

def find(name):
    matches = sorted(SRC.glob(f"{name}_*.png"))
    if not matches:
        raise SystemExit(f"missing {name}")
    return matches[-1]

def save_cover(name, size, dest, quality=84):
    img = Image.open(find(name)).convert("RGB")
    tw, th = size
    scale = max(tw / img.width, th / img.height)
    img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    left = (img.width - tw) // 2
    top = (img.height - th) // 2
    img = img.crop((left, top, left + tw, top + th))
    img.save(dest, "JPEG", quality=quality, optimize=True, progressive=True)

products = ["candle", "honey", "coffee", "mug", "tote", "plant", "macrame", "wallet", "tea", "necklace", "soap", "bread", "bowl"]
for name in products:
    save_cover(name, (900, 900), PRODUCTS / f"{name}.jpg")

covers = {
    "cover-candle-studio": "ember-oak.jpg",
    "cover-coffee-bar": "third-wave.jpg",
    "cover-plant-shop": "green-nook.jpg",
    "cover-pottery-studio": "clay-co.jpg",
    "cover-textile-studio": "loom-line.jpg",
    "cover-honey-farm": "honey-harvest.jpg",
}
for src, dest in covers.items():
    save_cover(src, (1600, 900), COVERS / dest)

save_cover("hero-market", (1600, 1000), HERO / "hero-market.jpg", quality=88)

# ---- geometric brand marks (artwork, not initials) -------------------------
def gradient(size, c1, c2):
    w, h = size
    base = Image.new("RGB", size)
    px = base.load()
    for y in range(h):
        for x in range(w):
            t = (x + y) / (w + h)
            px[x, y] = tuple(round(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))
    return base

def shade(img, factor):
    return img.point(lambda v: max(0, min(255, int(v * factor))))

def logo(name, c1, c2, glyph, accent=(255, 255, 255)):
    size = 256
    img = gradient((size, size), c1, c2).convert("RGBA")
    overlay = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    white = accent + (255,)
    soft = accent + (70,)
    if glyph == "flame":
        d.ellipse((78, 150, 178, 232), fill=soft)
        d.polygon([(128, 44), (176, 136), (156, 190), (100, 190), (80, 136)], fill=white)
        d.polygon([(128, 96), (150, 152), (106, 152)], fill=c2 + (255,))
    elif glyph == "cup":
        d.rounded_rectangle((70, 108, 170, 196), radius=26, fill=white)
        d.arc((152, 118, 208, 174), 270, 90, fill=white, width=14)
        d.ellipse((88, 88, 152, 120), fill=soft)
        for x in (104, 128, 152):
            d.arc((x - 14, 44, x + 14, 96), 100, 260, fill=white, width=8)
    elif glyph == "leaf":
        d.ellipse((70, 60, 186, 200), fill=soft)
        d.polygon([(186, 70), (150, 190), (74, 196)], fill=white)
        d.line((186, 70, 92, 190), fill=c2 + (255,), width=8)
    elif glyph == "bowl":
        d.pieslice((48, 72, 208, 232), 0, 180, fill=white)
        d.rounded_rectangle((108, 190, 148, 220), radius=10, fill=white)
        d.arc((84, 92, 172, 170), 200, 340, fill=c2 + (255,), width=10)
    elif glyph == "weave":
        for i in range(3):
            y = 100 + i * 30
            d.rounded_rectangle((58, y, 198, y + 14), radius=7, fill=white if i % 2 == 0 else soft)
        d.rounded_rectangle((112, 58, 144, 200), radius=16, fill=soft)
    elif glyph == "drop":
        d.polygon([(128, 40), (176, 130), (128, 210), (80, 130)], fill=white)
        d.ellipse((104, 120, 152, 168), fill=c2 + (255,))
        d.arc((40, 60, 120, 140), 300, 90, fill=soft, width=10)
    img = Image.alpha_composite(img, overlay).filter(ImageFilter.SMOOTH)
    img.convert("RGB").save(LOGOS / f"{name}.jpg", "JPEG", quality=90)

logo("ember-oak", (84, 37, 168), (255, 107, 107), "flame")
logo("third-wave", (32, 30, 56), (32, 191, 169), "cup")
logo("green-nook", (32, 191, 169), (124, 58, 237), "leaf")
logo("clay-co", (124, 58, 237), (255, 200, 87), "bowl", accent=(36, 32, 56))
logo("loom-line", (255, 107, 107), (84, 37, 168), "weave")
logo("honey-harvest", (255, 200, 87), (255, 107, 107), "drop", accent=(36, 32, 56))

# ---- soft UI sounds (original, generated here) ----------------------------
RATE = 44100

def envelope(i, n, attack=0.008, release=0.55):
    t = i / RATE
    a = min(1.0, t / attack) if attack else 1.0
    r = min(1.0, (n - i) / (n * release)) if release else 1.0
    return a * r

def tone(freq, ms, amp=0.22, sweep=0.0, harmonics=(1.0,), release=0.55):
    n = int(RATE * ms / 1000)
    samples = []
    for i in range(n):
        t = i / RATE
        f = freq * (1 + sweep * (i / n))
        value = sum(h * math.sin(2 * math.pi * f * (k + 1) * t) for k, h in enumerate(harmonics)) / sum(harmonics)
        samples.append(value * amp * envelope(i, n, release=release))
    return samples

def write_wav(name, samples):
    with wave.open(str(SOUNDS / name), "wb") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(RATE)
        f.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, s)) * 32767)) for s in samples))

write_wav("click.wav", tone(1180, 45, 0.13, harmonics=(1.0, 0.35), release=0.9))
write_wav("pop.wav", tone(420, 90, 0.18, sweep=0.9, harmonics=(1.0, 0.3), release=0.8))
write_wav("success.wav", tone(660, 110, 0.16, release=0.7) + tone(880, 160, 0.16, release=0.8))
write_wav("notify.wav", tone(988, 260, 0.14, harmonics=(1.0, 0.5, 0.22), release=0.95))
write_wav("toggle.wav", tone(520, 70, 0.10, sweep=0.6, harmonics=(0.6, 1.0), release=0.9))
print("done")
