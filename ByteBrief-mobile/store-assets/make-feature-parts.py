"""フィーチャーグラフィック（1024×500）の画像部品を作る。

各部品は 1024×500 の透明キャンバス上の最終位置に描くので、
Photoshop では重ねるだけで配置が決まる。文字は Photoshop 側のテキストレイヤーで入れる
（make-feature-psd.jsx）。座標を変えたときは、jsx 側の文字位置も合わせて直すこと。
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

W, H = 1024, 500
ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'layers'
SHOTS = ROOT / 'screenshots'
ICON = ROOT.parent / 'assets' / 'icon.png'

BG = (12, 16, 22)
PANEL = (17, 23, 32)

# レイアウト（jsx 側と共有する値）
PANEL_X = 578
BACK_PHONE = dict(x=596, y=110, screen_w=204)
FRONT_PHONE = dict(x=736, y=52, screen_w=240)
LOGO = dict(x=60, y=376, size=46)


def canvas() -> Image.Image:
    return Image.new('RGBA', (W, H), (0, 0, 0, 0))


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new('L', size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius, fill=255)
    return mask


def shadow(layer: Image.Image, box: tuple[int, int, int, int], radius: int,
           offset: tuple[int, int], blur: int, alpha: int) -> None:
    """box の形の柔らかい影を layer に描く"""
    sh = Image.new('L', (W, H), 0)
    x0, y0, x1, y1 = box
    ImageDraw.Draw(sh).rounded_rectangle(
        (x0 + offset[0], y0 + offset[1], x1 + offset[0], y1 + offset[1]), radius, fill=alpha)
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    black = Image.new('RGBA', (W, H), (0, 0, 0, 255))
    black.putalpha(sh)
    layer.alpha_composite(black)


def background() -> Image.Image:
    """濃紺の単色。印刷物のようなごく弱い粒子だけ乗せる"""
    img = Image.new('RGBA', (W, H), BG + (255,))
    noise = Image.effect_noise((W, H), 6).convert('L')
    grain = Image.new('RGBA', (W, H), (255, 255, 255, 0))
    grain.putalpha(noise.point(lambda v: max(0, v - 120) // 10))
    img.alpha_composite(grain)
    return img


def panel() -> Image.Image:
    """右側の少し明るい面。左端にだけ細い線を入れて面の境目をはっきりさせる"""
    layer = canvas()
    d = ImageDraw.Draw(layer)
    d.rectangle((PANEL_X, 0, W, H), fill=PANEL + (255,))
    d.line((PANEL_X, 0, PANEL_X, H), fill=(32, 40, 52, 255), width=1)
    return layer


def phone(shot: str, x: int, y: int, screen_w: int, dim: float = 0.0) -> Image.Image:
    """枠付きのスマホ。dim > 0 で奥側の端末として暗くする"""
    layer = canvas()
    src = Image.open(SHOTS / shot).convert('RGBA')
    screen_h = round(src.height * screen_w / src.width)
    screen = src.resize((screen_w, screen_h), Image.LANCZOS)
    if dim:
        screen = Image.blend(screen, Image.new('RGBA', screen.size, (0, 0, 0, 255)), dim)

    bezel = 7
    pw, ph = screen_w + bezel * 2, screen_h + bezel * 2
    radius = 32
    shadow(layer, (x, y, x + pw, y + ph), radius, (0, 20), 24, 170)

    body = Image.new('RGBA', (pw, ph), (5, 6, 8, 255))
    ImageDraw.Draw(body).rounded_rectangle((0, 0, pw - 1, ph - 1), radius, outline=(58, 64, 76, 255), width=1)
    body.paste(screen, (bezel, bezel), rounded_mask(screen.size, radius - bezel))
    layer.paste(body, (x, y), rounded_mask((pw, ph), radius))
    return layer


def logo_icon() -> Image.Image:
    x, y, size = LOGO['x'], LOGO['y'], LOGO['size']
    layer = canvas()
    icon = Image.open(ICON).convert('RGBA').resize((size, size), Image.LANCZOS)
    r = round(size * 0.24)
    layer.paste(icon, (x, y), rounded_mask(icon.size, r))
    ImageDraw.Draw(layer).rounded_rectangle((x, y, x + size - 1, y + size - 1), r, outline=(64, 72, 86, 255), width=1)
    return layer


if __name__ == '__main__':
    OUT.mkdir(exist_ok=True)
    background().save(OUT / 'v3-background.png')
    panel().save(OUT / 'v3-panel.png')
    phone('01-briefing.png', BACK_PHONE['x'], BACK_PHONE['y'], BACK_PHONE['screen_w'], dim=0.45).save(OUT / 'v3-phone-back.png')
    phone('02-feed-cloud.png', FRONT_PHONE['x'], FRONT_PHONE['y'], FRONT_PHONE['screen_w']).save(OUT / 'v3-phone-front.png')
    logo_icon().save(OUT / 'v3-logo-icon.png')
    print('ok')
