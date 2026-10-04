"""Stamp public/icon-512.png into Android mipmap launcher icons.

Exits 0 (keeping the default Capacitor icon) when the file is missing.
Run from the repo root after `npx cap add android && npx cap sync android`.
"""
import os
import sys

SRC = os.path.join("public", "icon-512.png")
RES = os.path.join("android", "app", "src", "main", "res")
SIZES = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}


def main() -> int:
    if not os.path.isfile(SRC):
        print("No public/icon-512.png, keeping default icon")
        return 0
    try:
        from PIL import Image
    except ImportError:
        print("pillow not installed, keeping default icon")
        return 0
    img = Image.open(SRC)
    if "A" in img.getbands():
        bbox = img.getchannel("A").getbbox()
        if bbox:
            img = img.crop(bbox)
    else:
        bbox = img.convert("L").point(lambda p: 0 if p > 245 else 255).getbbox()
        if bbox:
            img = img.crop(bbox)
    img = img.resize((512, 512), Image.LANCZOS).convert("RGB")
    n = 0
    for root, _, files in os.walk(RES):
        size = next((v for k, v in SIZES.items() if k in os.path.basename(root)), None)
        if not size:
            continue
        for f in files:
            if f.startswith("ic_launcher") and f.endswith(".png"):
                img.resize((size, size), Image.LANCZOS).save(os.path.join(root, f))
                n += 1
    print(f"icon applied to {n} files")
    return 0


if __name__ == "__main__":
    sys.exit(main())
