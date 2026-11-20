from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT.parent / "vibe_images"
OUT = ROOT / "public" / "images"

for d in (OUT / "genres", OUT / "covers"):
    d.mkdir(parents=True, exist_ok=True)


def find(name):
    matches = sorted(SRC.glob(f"{name}_*.png"))
    if not matches:
        raise SystemExit(f"missing {name}")
    return matches[-1]


def save(src, size, dest, quality=84):
    img = Image.open(src).convert("RGB")
    tw, th = size
    scale = max(tw / img.width, th / img.height)
    img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    left = (img.width - tw) // 2
    top = (img.height - th) // 2
    img = img.crop((left, top, left + tw, top + th))
    img.save(dest, "JPEG", quality=quality, optimize=True, progressive=True)
    print(dest.relative_to(ROOT), img.size)


save(find("vyra-hero"), (1100, 1375), OUT / "hero.jpg", 88)

for genre in ["afrobeats", "hiphop", "pop", "rock", "rnb", "edm", "jazz", "classical"]:
    save(find(f"vyra-genre-{genre}"), (900, 675), OUT / "genres" / f"{genre}.jpg", 82)

for i in range(1, 6):
    save(find(f"vyra-cover-{i}"), (800, 800), OUT / "covers" / f"artist-{i}.jpg", 84)

sheet = Image.open(find("vyra-cover-sheet")).convert("RGB")
cell = sheet.width / 3
inset = 12
names = ["chrome-ribbon", "orb", "glass-bloom", "waveform", "vortex", "planet", "coils", "sphere", "peaks"]
for idx, name in enumerate(names):
    row, col = divmod(idx, 3)
    left = round(col * cell) + inset
    top = round(row * cell) + inset
    tile = sheet.crop((left, top, round(left + cell - inset * 2), round(top + cell - inset * 2)))
    tile = tile.resize((620, 620), Image.LANCZOS)
    tile.save(OUT / "covers" / f"{name}.jpg", "JPEG", quality=86, optimize=True, progressive=True)
    print(f"covers/{name}.jpg", tile.size)

print("done")
