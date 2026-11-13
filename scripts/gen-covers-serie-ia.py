#!/usr/bin/env python3
"""Gera capas 1200x630 no estilo do blog: fundo escuro, texto gradiente ciano->magenta, glow e halftone."""
import os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1200, 630
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "assets", "img")
OUT = os.path.abspath(OUT)

# Fontes do sistema (bold, geometricas)
FONT_TITLE = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_SUB   = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

CYAN = (0, 212, 255)
MAGENTA = (212, 0, 255)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make_background():
    """Gradiente vertical escuro + glows laterais + halftone + vinheta."""
    img = Image.new("RGB", (W, H), (5, 5, 16))
    d = ImageDraw.Draw(img)

    # gradiente vertical sutil (midnight -> black)
    for y in range(H):
        t = y / H
        c = lerp((8, 8, 24), (0, 0, 2), t)
        d.line([(0, y), (W, y)], fill=c)

    # glows: camada separada borrada
    glow = Image.new("RGB", (W, H), (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    # esquerda ciano
    gd.ellipse([-380, H // 2 - 300, 320, H // 2 + 300], fill=(0, 80, 120))
    # direita magenta
    gd.ellipse([W - 320, H // 2 - 300, W + 380, H // 2 + 300], fill=(90, 0, 110))
    glow = glow.filter(ImageFilter.GaussianBlur(150))
    img = Image.blend(img, glow, 0.55)

    # halftone nas bordas
    ht = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    hd = ImageDraw.Draw(ht)
    step = 14
    for y in range(0, H, step):
        for x in range(0, W, step):
            # densidade cai em direcao ao centro
            dl = x / W                      # 0 esq, 1 dir
            dist_left = x / (W * 0.42)
            dist_right = (W - x) / (W * 0.42)
            if dist_left < 1:
                alpha = int(70 * (1 - dist_left) ** 1.6)
                col = CYAN
            elif dist_right < 1:
                alpha = int(70 * (1 - dist_right) ** 1.6)
                col = MAGENTA
            else:
                continue
            if alpha <= 3:
                continue
            r = 2.2
            hd.ellipse([x - r, y - r, x + r, y + r], fill=col + (alpha,))
    hblur = ht.filter(ImageFilter.GaussianBlur(1.1))
    img = Image.alpha_composite(img.convert("RGBA"), hblur).convert("RGB")

    # vinheta
    vig = Image.new("L", (W, H), 0)
    vd = ImageDraw.Draw(vig)
    vd.ellipse([-W * 0.30, -H * 0.55, W * 1.30, H * 1.55], fill=255)
    vig = vig.filter(ImageFilter.GaussianBlur(180))
    black = Image.new("RGB", (W, H), (0, 0, 0))
    img = Image.composite(img, black, vig)

    return img


def gradient_text_mask(text, font, spacing=1):
    """Renderiza o texto como mascara e aplica gradiente horizontal."""
    tmp = Image.new("L", (W, H), 0)
    td = ImageDraw.Draw(tmp)
    bbox = td.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (W - tw) // 2 - bbox[0]
    y = (H - th) // 2 - bbox[1]
    td.text((x, y), text, font=font, fill=255)

    grad = Image.new("RGB", (W, H))
    px = grad.load()
    for i in range(W):
        c = lerp(CYAN, MAGENTA, i / (W - 1))
        for j in range(H):
            px[i, j] = c
    return tmp, grad


def wrap_text(text, font, max_w):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if font.getlength(test) <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def build(slug, title, subtitle, out_slug):
    img = make_background()

    # --- titulo principal (gradiente + glow) ---
    size = 84
    while size > 40:
        f = ImageFont.truetype(FONT_TITLE, size)
        lines = wrap_text(title, f, W - 200)
        if len(lines) <= 2:
            break
        size -= 4
    f = ImageFont.truetype(FONT_TITLE, size)
    lines = wrap_text(title, f, W - 200)
    line_h = int(size * 1.12)
    sub_f = ImageFont.truetype(FONT_SUB, 34)
    sub_lines = wrap_text(subtitle, sub_f, W - 240) if subtitle else []
    sub_h = int(34 * 1.35) * len(sub_lines)

    total_h = line_h * len(lines) + (34 if sub_lines else 0) + sub_h
    start_y = (H - total_h) // 2

    # camada do titulo
    tmask = Image.new("L", (W, H), 0)
    td = ImageDraw.Draw(tmask)
    y = start_y
    for ln in lines:
        bb = td.textbbox((0, 0), ln, font=f)
        x = (W - (bb[2] - bb[0])) // 2 - bb[0]
        td.text((x, y), ln, font=f, fill=255)
        y += line_h

    # gradiente
    grad = Image.new("RGB", (W, H))
    gp = grad.load()
    for i in range(W):
        c = lerp(CYAN, MAGENTA, i / (W - 1))
        for j in range(H):
            gp[i, j] = c

    # glow: desloca a mascara, borra, compoe
    glow = tmask.filter(ImageFilter.GaussianBlur(18))
    glow_rgb = Image.new("RGB", (W, H), (0, 0, 0))
    glow_rgb.paste(grad, (0, 0), glow)
    img = Image.composite(glow_rgb, img, glow.point(lambda v: int(v * 0.85)))

    # texto nitido
    img.paste(grad, (0, 0), tmask)

    # --- subtitulo branco ---
    if sub_lines:
        d = ImageDraw.Draw(img)
        y = start_y + line_h * len(lines) + 34
        for ln in sub_lines:
            bb = d.textbbox((0, 0), ln, font=sub_f)
            x = (W - (bb[2] - bb[0])) // 2 - bb[0]
            d.text((x, y), ln, font=sub_f, fill=(255, 255, 255))
            y += int(34 * 1.35)

    png = os.path.join(OUT, f"{out_slug}-1.png")
    img.save(png, "PNG", optimize=True)
    jpg = os.path.join(OUT, f"{out_slug}-1-og.jpg")
    img.save(jpg, "JPEG", quality=86, optimize=True, progressive=True)
    print(f"  ok  {os.path.basename(png)}  ({os.path.getsize(png)//1024}KB) + og.jpg ({os.path.getsize(jpg)//1024}KB)")


COVERS = [
    # (slug do arquivo destino, titulo, subtitulo)
    ("2026-11-11-ia-para-quem-nao-usa-parte-1",
     "Você já usa IA", "e não percebeu"),
    ("2026-11-11-ia-para-quem-nao-usa-parte-1-en",
     "You already use AI", "and didn't notice"),
    ("2026-11-12-ia-para-quem-nao-usa-parte-2",
     "Da tarefa ao processo", "IA na sua semana"),
    ("2026-11-12-ia-para-quem-nao-usa-parte-2-en",
     "From task to process", "AI in your week"),
    ("2026-11-13-ia-para-quem-nao-usa-parte-3",
     "Quem perde espaço", "com a IA"),
    ("2026-11-13-ia-para-quem-nao-usa-parte-3-en",
     "Who loses ground", "to AI"),
]

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    print("Gerando capas...")
    for slug, title, sub in COVERS:
        build(slug, title, sub, slug)
    print("Pronto.")