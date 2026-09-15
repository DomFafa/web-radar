"""Local assets from approved designs; never execute model SVG or fetch model URLs."""
import base64
import io
import re
from functools import lru_cache
from pathlib import Path
from typing import cast

from bs4 import BeautifulSoup
from PIL import Image


# Fixed geometry is trusted code. Model input selects a name, never an SVG body.
ICON_PATHS = {
    'mail': 'M3 5h18v14H3z M3 6l9 7 9-7',
    'arrow': 'M4 12h16 M14 6l6 6-6 6',
    'cart': 'M2 3h3l3 13h11l3-10H6 M9 21h.01 M18 21h.01',
    'users': 'M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M2 21v-3a6 6 0 0 1 12 0v3 M17 4a4 4 0 0 1 0 8 M18 15a5 5 0 0 1 4 5v1',
    'check': 'M4 12l5 5L20 6',
    'heart': 'M12 21S2 14 2 7a5 5 0 0 1 10-1A5 5 0 0 1 22 7c0 7-10 14-10 14z',
    'droplet': 'M12 2C10 6 5 10 5 15a7 7 0 0 0 14 0c0-5-5-9-7-13z M8 15a4 4 0 0 0 4 4',
    'bottle': 'M9 2h6v4H9z M9 6v3l-2 3v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-8l-2-3V6 M7 13h10 M7 18h10',
    'mountain': 'M2 21 9 6l4 7 3-5 6 13z M6 12l3 2 2-3 M14 12l2 2 2-2',
    'grid': 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
    'box': 'M3 7l9-5 9 5v10l-9 5-9-5z M3 7l9 5 9-5 M12 12v10 M7.5 4.5l9 5',
    'document': 'M6 2h8l4 4v16H6z M14 2v5h4 M9 11h6 M9 15h6 M9 19h4',
    'handshake': 'M2 7l3-2 4 2 3-1 4 1 3-2 3 2-3 9-2-1 M5 5l3 10 M16 7l-4 4-3-2-2 3 7 7a2 2 0 0 0 3-3l-4-4 M8 15l-1 1 4 4a2 2 0 0 0 3-1 M19 5l-3 9',
}


@lru_cache(maxsize=1)
def rounded_font_css() -> str:
    assets = Path(__file__).parent / 'assets'
    encoded = base64.b64encode((assets / 'nunito-latin.woff2').read_bytes()).decode()
    license_text = (assets / 'OFL-Nunito.txt').read_text().replace('*/', '* /')
    return '/* Nunito font license\n' + license_text + '\n*/\n@font-face{font-family:"WR Rounded";font-style:normal;font-weight:400 900;font-display:swap;src:url(data:font/woff2;base64,' + encoded + ') format("woff2")}'


def image_size(data_url: str) -> tuple[int, int]:
    with Image.open(io.BytesIO(base64.b64decode(data_url.split(',', 1)[1], validate=True))) as image:
        return image.size


def _complete_logo_box(image: Image.Image, box: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    """Recover only edge-connected logo ink against an unambiguous background."""
    from assembler import OutputValidationError

    left, top, right, bottom = box
    margin = min(24, (min(right-left, bottom-top) + 1) // 2)
    window = (max(0, left-margin), max(0, top-margin), min(image.width, right+margin), min(image.height, bottom+margin))
    pixels = image.crop(window).convert('RGB').load()
    assert pixels is not None
    def color(x: int, y: int) -> tuple[int, int, int]:
        return cast(tuple[int, int, int], pixels[x-window[0], y-window[1]])
    corners = [color(x, y) for x, y in ((left, top), (right-1, top), (left, bottom-1), (right-1, bottom-1))]
    if any(max(pixel[channel] for pixel in corners) - min(pixel[channel] for pixel in corners) > 24 for channel in range(3)):
        return box
    background = tuple(sum(pixel[channel] for pixel in corners) // 4 for channel in range(3))
    def foreground(x: int, y: int) -> bool:
        return max(abs(value-base) for value, base in zip(color(x, y), background)) > 32
    edge = {(x, y) for x in range(left, right) for y in (top, bottom-1)} | {(x, y) for y in range(top, bottom) for x in (left, right-1)}
    pending = [point for point in edge if foreground(*point)]
    seen = set(pending)
    recovered = list(box)
    while pending:
        x, y = pending.pop()
        if ((x == window[0] and x > 0) or (x == window[2]-1 and x < image.width-1)
                or (y == window[1] and y > 0) or (y == window[3]-1 and y < image.height-1)):
            raise OutputValidationError('Approved logo reaches the bounded recovery limit; its complete crop must be reviewed.')
        recovered = [min(recovered[0], x), min(recovered[1], y), max(recovered[2], x+1), max(recovered[3], y+1)]
        for nx in range(x-1, x+2):
            for ny in range(y-1, y+2):
                # The interior is already retained. Visit only the narrow outer
                # band, so unrelated nearby text cannot expand the crop.
                if (left < nx < right-1 and top < ny < bottom-1) or (nx, ny) in seen:
                    continue
                if not (window[0] <= nx < window[2] and window[1] <= ny < window[3]):
                    continue
                seen.add((nx, ny))
                if foreground(nx, ny):
                    pending.append((nx, ny))
    return (max(window[0], recovered[0]-1) if recovered[0] < left else left,
            max(window[1], recovered[1]-1) if recovered[1] < top else top,
            min(window[2], recovered[2]+1) if recovered[2] > right else right,
            min(window[3], recovered[3]+1) if recovered[3] > bottom else bottom)


def materialize_visuals(soup: BeautifulSoup, designs: dict[str, str], generated_assets: dict[str, str] | None = None) -> None:
    # Import here to avoid a module cycle with the assembler's trusted post-sanitize call.
    from assembler import OutputValidationError

    for node in soup.select('[data-wr-scene]'):
        asset_id = str(node['data-wr-scene'])
        source = (generated_assets or {}).get(asset_id, '')
        if node.name != 'img' or node.has_attr('data-wr-bind') or node.has_attr('data-wr-crop') or node.find_parent(attrs={'data-wr-product': True}) or not re.fullmatch(r'[a-z][a-z0-9-]*', asset_id) or not source.startswith('data:image/webp;base64,') or len(source) > 300_000:
            raise OutputValidationError('Unknown or invalid generated scene asset')
        node['src'] = source
        node['alt'] = ''
        node['loading'] = 'eager'
        node['data-wr-design-asset'] = 'scene'
        node['data-wr-generated-asset'] = asset_id
        del node['data-wr-scene']

    crops: dict[tuple[str, str], str] = {}
    areas: dict[str, float] = {}
    for node in soup.select('[data-wr-crop]'):
        spec = str(node['data-wr-crop'])
        match = re.fullmatch(r'([a-z][a-z0-9-]*):(\d+),(\d+),(\d+),(\d+)', spec)
        kind = str(node.get('data-wr-asset-kind', ''))
        crop_key = (kind, spec)
        if node.name != 'img' or match is None or kind not in ('scene', 'logo', 'icon'):
            raise OutputValidationError('Invalid approved design crop')
        if node.has_attr('data-wr-bind') and not (kind == 'logo' and node.get('data-wr-bind') == 'company.name'):
            raise OutputValidationError('Approved design crop cannot also bind a different image or text')
        source = match[1]
        x, y, w, h = map(int, match.groups()[1:])
        area = w * h / 1_000_000
        if source not in designs or not w or not h or x+w > 1000 or y+h > 1000 or area > .45:
            raise OutputValidationError('Approved design crop is outside bounds or covers too much of the page')
        if crop_key not in crops:
            if areas.get(source, 0) + area > .65 or len(crops) >= 12:
                raise OutputValidationError('Approved design crop area/count exceeds the visual asset budget')
            with Image.open(io.BytesIO(base64.b64decode(designs[source].split(',', 1)[1], validate=True))) as image:
                width, height = image.size
                box = (round(x*width/1000), round(y*height/1000), round((x+w)*width/1000), round((y+h)*height/1000))
                if box[2]-box[0] < 2 or box[3]-box[1] < 2:
                    raise OutputValidationError('Approved design crop has insufficient pixels')
                if kind == 'logo':
                    complete = _complete_logo_box(image, box)
                    if complete != box:
                        box = complete
                        area = (box[2]-box[0]) * (box[3]-box[1]) / (width*height)
                        if area > .45 or areas.get(source, 0) + area > .65:
                            raise OutputValidationError('Completed logo crop area exceeds the visual asset budget')
                areas[source] = areas.get(source, 0) + area
                cropped = image.crop(box).convert('RGB')
                cropped.thumbnail((1536, 1024))
                out = io.BytesIO()
                cropped.save(out, 'WEBP', quality=90, method=4)
                if out.tell() > 220_000:
                    raise OutputValidationError('Approved visual asset exceeds its size budget')
                crops[crop_key] = 'data:image/webp;base64,' + base64.b64encode(out.getvalue()).decode()
        node['src'] = crops[crop_key]
        node['alt'] = ''  # Decorative scene; product cards and detail photos supply factual alt text.
        node['data-wr-design-asset'] = kind
        node['loading'] = 'eager'
        del node['data-wr-crop']
        del node['data-wr-asset-kind']
    for node in soup.select('[data-wr-icon]'):
        name = str(node['data-wr-icon'])
        if node.name != 'span' or name not in ICON_PATHS or node.find(True):
            raise OutputValidationError('Unknown or invalid trusted icon')
        node.clear()
        svg = BeautifulSoup('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path/></svg>', 'html.parser')
        assert svg.path is not None
        svg.path['d'] = ICON_PATHS[name]
        node.append(svg)
    if soup.html and soup.html.get('data-wr-font') == 'rounded':
        if soup.head is None:
            soup.html.insert(0, soup.new_tag('head'))
        style = soup.new_tag('style', attrs={'data-wr-trusted': 'font-v1'})
        style.string = rounded_font_css()
        assert soup.head is not None
        soup.head.append(style)
