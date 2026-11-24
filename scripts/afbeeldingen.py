"""Maakt geoptimaliseerde webversies (AVIF + WebP, en één JPEG/PNG-terugval) van alle beelden in data/afbeeldingen.json.

Gebruik (vanuit de projectmap):  python scripts/afbeeldingen.py          # alleen ontbrekende bestanden
                                 python scripts/afbeeldingen.py --alles  # alles opnieuw

- Originelen worden alleen gelezen, nooit aangepast.
- 'bron' is relatief aan de hoofdmap 'Dé Wieëtsjaf' (één map boven het project),
  of relatief aan het project als het pad met './' begint.
- Schrijft data/afbeeldingen.generated.json met afmetingen (voor width/height in de HTML, tegen layoutverschuiving).
Vereist: Python 3.11+, Pillow 11+ (met AVIF- en WebP-ondersteuning).
"""
import json, sys, pathlib, unicodedata
from PIL import Image, ImageOps, features

PROJECT = pathlib.Path(__file__).resolve().parent.parent
HOOFDMAP = PROJECT.parent
OUT = PROJECT / "assets" / "images"
REG = PROJECT / "data" / "afbeeldingen.json"
GEN = PROJECT / "data" / "afbeeldingen.generated.json"

AVIF_Q, WEBP_Q, JPG_Q = 52, 74, 78


def _nfc(s: str) -> str:
    return unicodedata.normalize("NFC", s)


def bronpad(p: str) -> pathlib.Path:
    """Zoekt het bronbestand op; ongevoelig voor Unicode-schrijfwijze (é als één teken of als e + accent)."""
    basis = PROJECT if p.startswith("./") else HOOFDMAP
    rel = p[2:] if p.startswith("./") else p
    direct = basis / rel
    if direct.exists():
        return direct
    huidig = basis
    for deel in pathlib.PurePosixPath(rel).parts:
        kandidaat = huidig / deel
        if not kandidaat.exists() and huidig.is_dir():
            match = [c for c in huidig.iterdir() if _nfc(c.name) == _nfc(deel)]
            kandidaat = match[0] if match else kandidaat
        huidig = kandidaat
    return huidig


def main() -> None:
    alles = "--alles" in sys.argv
    if not features.check("avif"):
        sys.exit("Pillow mist AVIF-ondersteuning. Installeer Pillow 11+ (pip install -U pillow).")
    reg = json.loads(REG.read_text(encoding="utf-8"))["items"]
    OUT.mkdir(parents=True, exist_ok=True)
    gen = {}
    for key, item in reg.items():
        if item.get("alias"):
            continue
        src = bronpad(item["bron"])
        if not src.exists():
            print(f"!! ontbreekt: {key} -> {src}")
            continue
        im = Image.open(src)
        im = ImageOps.exif_transpose(im)
        transparant = item.get("transparant", False)
        im = im.convert("RGBA" if transparant else "RGB")
        u = item.get("uitsnede")
        if u:
            w, h = im.size
            im = im.crop((int(w * u.get("x0", 0)), int(h * u.get("y0", 0)), int(w * u.get("x1", 1)), int(h * u.get("y1", 1))))
        varianten = []
        for bw in item["breedtes"]:
            bw = min(bw, im.width)
            bh = round(im.height * bw / im.width)
            klein = im if bw == im.width else im.resize((bw, bh), Image.LANCZOS)
            for ext, kw in (("avif", {"quality": AVIF_Q, "speed": 4}), ("webp", {"quality": WEBP_Q, "method": 6})):
                doel = OUT / f"{key}-{bw}.{ext}"
                if alles or not doel.exists():
                    klein.save(doel, **kw)
            varianten.append({"w": bw, "h": bh})
        # terugval voor zeer oude browsers: kleinste breedte als JPEG (of PNG bij transparantie)
        kleinste = varianten[0]
        fb_ext = "png" if transparant else "jpg"
        fb = OUT / f"{key}-{kleinste['w']}.{fb_ext}"
        if alles or not fb.exists():
            k = im.resize((kleinste["w"], kleinste["h"]), Image.LANCZOS)
            if transparant:
                k.save(fb, optimize=True)
            else:
                k.save(fb, quality=JPG_Q, optimize=True, progressive=True)
        gen[key] = {"varianten": varianten, "fallback": fb.name, "ratio": round(im.width / im.height, 4)}
        print(f"ok {key}: {[v['w'] for v in varianten]}")
    for key, item in reg.items():
        if item.get("alias") and item["alias"] in gen:
            gen[key] = {**gen[item["alias"]], "alias": item["alias"]}
    GEN.write_text(json.dumps(gen, indent=1, ensure_ascii=False), encoding="utf-8")
    totaal = sum(p.stat().st_size for p in OUT.iterdir())
    print(f"\n{len(gen)} beelden, {len(list(OUT.iterdir()))} bestanden, {totaal/1024:.0f} kB in assets/images")


if __name__ == "__main__":
    main()
