#!/usr/bin/env python3
"""Wrap dark chart screenshots in a Looker Studio-style component card header.
Layout: [Data Studio bars glyph] Title ............ kebab  (?)  [Viz logo]"""
import json, os, glob, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = "/sessions/kind-peaceful-cerf/mnt/Viz.io/vizstudio"
SRC = "/tmp/orig"
OUT = "/tmp/framed"
LOGO = f"{ROOT}/public/logo-256.png"
FONT = "/tmp/Roboto.ttf"

S = 2
HEADER_H = 52 * S
PAD_L = 18 * S
RADIUS = 10 * S
BORDER = (218, 220, 224, 255)
TITLE_COL = (32, 33, 36, 255)
ICON_COL = (95, 99, 104, 255)
BLUE = (66, 133, 244, 255)
DIV = (232, 234, 237, 255)

os.makedirs(OUT, exist_ok=True)

font = ImageFont.truetype(FONT, 17 * S)
try:
    font.set_variation_by_axes([500])
except Exception:
    pass
qfont = ImageFont.truetype(FONT, 12 * S)
try:
    qfont.set_variation_by_axes([600])
except Exception:
    pass

logo = Image.open(LOGO).convert("RGBA")
logo = logo.resize((26 * S, 26 * S), Image.LANCZOS)

charts = json.load(open(f"{ROOT}/src/data/charts.json"))
charts = charts["charts"] if isinstance(charts, dict) else charts
names = {c["id"]: c["name"] for c in charts}

AA = 4

def draw_datastudio_logo(d, cx, cy):
    """Looker Studio community-viz glyph: three linked nodes."""
    GRAY = (128, 134, 139, 255)
    LINK = (158, 166, 174, 255)
    # node centers (CSS px offsets, scaled)
    A = (cx - 6 * S, cy + 6 * S)   # bottom-left, filled blue
    B = (cx + 6 * S, cy - 5 * S)   # top-right, outlined blue
    C = (cx - 5 * S, cy - 6 * S)   # top-left, outlined gray (small)
    lw = int(1.6 * S)
    d.line([A, B], fill=LINK, width=lw)
    d.line([C, B], fill=LINK, width=lw)
    rA, rB, rC = int(3.8 * S), int(4.4 * S), int(2.8 * S)
    d.ellipse([A[0]-rA, A[1]-rA, A[0]+rA, A[1]+rA], fill=BLUE)
    d.ellipse([B[0]-rB, B[1]-rB, B[0]+rB, B[1]+rB], fill=(255,255,255,255), outline=BLUE, width=int(1.8 * S))
    d.ellipse([C[0]-rC, C[1]-rC, C[0]+rC, C[1]+rC], fill=(255,255,255,255), outline=GRAY, width=int(1.6 * S))

def draw_icons(d, card, w):
    cy = HEADER_H // 2
    lx = w - 18 * S - logo.size[0]
    card.paste(logo, (lx, (HEADER_H - logo.size[1]) // 2), logo)
    x2 = lx - 22 * S
    r = 9 * S
    d.ellipse([x2 - r, cy - r, x2 + r, cy + r], outline=ICON_COL, width=int(1.5 * S))
    tb = d.textbbox((0, 0), "?", font=qfont)
    d.text((x2 - (tb[2]-tb[0])/2 - tb[0], cy - (tb[3]-tb[1])/2 - tb[1]), "?", font=qfont, fill=ICON_COL)
    x3 = x2 - 32 * S
    dr = int(1.8 * S)
    for dy in (-6 * S, 0, 6 * S):
        d.ellipse([x3 - dr, cy + dy - dr, x3 + dr, cy + dy + dr], fill=ICON_COL)

def frame(src_path, title, out_path):
    shot = Image.open(src_path).convert("RGB")
    w, h = shot.size
    H = HEADER_H + h
    card = Image.new("RGBA", (w, H), (255, 255, 255, 255))
    card.paste(shot, (0, HEADER_H))
    d = ImageDraw.Draw(card)
    d.rectangle([0, HEADER_H - S, w, HEADER_H - 1], fill=DIV)
    glyph_w = 23 * S
    draw_datastudio_logo(d, PAD_L + glyph_w // 2, HEADER_H // 2)
    tx = PAD_L + glyph_w + 12 * S
    tb = d.textbbox((0, 0), title, font=font)
    d.text((tx, (HEADER_H - (tb[3] - tb[1])) / 2 - tb[1]), title, font=font, fill=TITLE_COL)
    draw_icons(d, card, w)
    mask = Image.new("L", (w * AA, H * AA), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([0, 0, w * AA - 1, H * AA - 1], radius=RADIUS * AA, fill=255)
    mask = mask.resize((w, H), Image.LANCZOS)
    out = Image.new("RGBA", (w, H), (0, 0, 0, 0))
    out.paste(card, (0, 0), mask)
    bd = ImageDraw.Draw(out)
    bd.rounded_rectangle([0, 0, w - 1, H - 1], radius=RADIUS, outline=BORDER, width=S)
    out.save(out_path, "PNG")
    out.save(out_path.replace(".png", ".webp"), "WEBP", quality=90)

if __name__ == "__main__":
    only = sys.argv[1:] or None
    files = sorted(glob.glob(f"{SRC}/datastudio-*-vizstudio.png"))
    done, missing = 0, []
    for f in files:
        cid = os.path.basename(f)[len("datastudio-"):-len("-vizstudio.png")]
        if only and cid not in only:
            continue
        name = names.get(cid)
        if not name:
            missing.append(cid)
            name = cid
        frame(f, name, f"{OUT}/{os.path.basename(f)}")
        done += 1
    print(f"framed {done}; no-name ids: {missing}")
