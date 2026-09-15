import base64
import io

import pytest
from bs4 import BeautifulSoup
from PIL import Image, ImageDraw


def image_url(image):
    out = io.BytesIO()
    image.save(out, 'PNG')
    return 'data:image/png;base64,' + base64.b64encode(out.getvalue()).decode()


def cropped_asset(image, box, kind='logo'):
    from design_assets import materialize_visuals
    x, y, width, height = box
    soup = BeautifulSoup(f'<img data-wr-crop="home:{x},{y},{width},{height}" data-wr-asset-kind="{kind}">', 'html.parser')
    materialize_visuals(soup, {'home': image_url(image)})
    assert soup.img is not None
    raw = base64.b64decode(str(soup.img['src']).split(',')[1])
    return raw, Image.open(io.BytesIO(raw))


@pytest.mark.parametrize('edge', ['left', 'top', 'right', 'bottom'])
def test_logo_recovers_connected_letter_strokes_crossing_each_crop_edge(edge):
    from design_assets import _complete_logo_box
    image = Image.new('RGB', (200, 100), '#fbfbfb')
    draw = ImageDraw.Draw(image)
    boxes = {'left': (46, 30, 65, 35), 'top': (75, 16, 80, 32), 'right': (138, 30, 154, 35)}
    if edge == 'bottom':
        # A g-like bowl plus connected descender crosses the original bottom.
        draw.ellipse((115, 29, 133, 47), outline='#123456', width=4)
        draw.line([(132, 36), (132, 56), (121, 59)], fill='#123456', width=4)
    else:
        draw.rectangle(boxes[edge], fill='#123456')
    original = (50, 20, 150, 50)
    expanded = _complete_logo_box(image, original)
    foreground = [(x, y) for y in range(image.height) for x in range(image.width) if image.getpixel((x, y)) != (251, 251, 251)]
    assert expanded != original
    assert all(expanded[0] <= x < expanded[2] and expanded[1] <= y < expanded[3] for x, y in foreground)
    assert all(abs(new - old) <= 15 for new, old in zip(expanded, original))


def test_complete_logo_and_scene_icon_pixels_remain_identical():
    image = Image.new('RGB', (1000, 1000), 'white')
    ImageDraw.Draw(image).rectangle((120, 115, 160, 135), fill='navy')
    box = (100, 100, 100, 50)
    expected = io.BytesIO()
    image.crop((100, 100, 200, 150)).save(expected, 'WEBP', quality=90, method=4)
    for kind in ('logo', 'scene', 'icon'):
        raw, _ = cropped_asset(image, box, kind)
        assert raw == expected.getvalue()


def test_unknown_logo_background_retains_original_crop_and_unconnected_ink_is_ignored():
    from design_assets import _complete_logo_box
    image = Image.new('RGB', (200, 100), 'white')
    draw = ImageDraw.Draw(image)
    draw.rectangle((115, 40, 120, 55), fill='navy')
    box = (50, 20, 150, 50)
    completed = _complete_logo_box(image, box)
    draw.rectangle((80, 53, 85, 63), fill='navy')
    assert _complete_logo_box(image, box) == completed
    image.putpixel((50, 20), (255, 0, 0))
    assert _complete_logo_box(image, box) == box


@pytest.mark.parametrize('first', ['logo', 'scene'])
def test_same_spec_keeps_logo_recovery_separate_from_scene_and_icon(first):
    from design_assets import materialize_visuals
    image = Image.new('RGB', (1000, 1000), 'white')
    ImageDraw.Draw(image).rectangle((120, 125, 125, 158), fill='navy')
    kinds = [first, 'scene' if first == 'logo' else 'logo', 'icon']
    soup = BeautifulSoup(''.join(f'<img data-wr-crop="home:100,100,100,50" data-wr-asset-kind="{kind}">' for kind in kinds), 'html.parser')
    materialize_visuals(soup, {'home': image_url(image)})
    expected = io.BytesIO()
    image.crop((100, 100, 200, 150)).save(expected, 'WEBP', quality=90, method=4)
    for node in soup.select('img'):
        raw = base64.b64decode(str(node['src']).split(',')[1])
        if node['data-wr-design-asset'] == 'logo':
            assert Image.open(io.BytesIO(raw)).height > 50
        else:
            assert raw == expected.getvalue()


def test_logo_recovery_clamps_source_edge_and_rejects_unfinished_bounded_strokes():
    from assembler import OutputValidationError
    from design_assets import _complete_logo_box
    image = Image.new('RGB', (100, 60), 'white')
    ImageDraw.Draw(image).rectangle((0, 22, 12, 26), fill='navy')
    assert _complete_logo_box(image, (4, 10, 80, 40))[0] == 0
    ImageDraw.Draw(image).rectangle((30, 25, 35, 59), fill='navy')
    with pytest.raises(OutputValidationError, match='logo.*recovery limit'):
        _complete_logo_box(image, (4, 10, 80, 40))


@pytest.mark.parametrize('other_area', [0, 250000])
def test_expanded_logo_is_charged_to_actual_crop_and_page_area_budgets(other_area):
    from assembler import OutputValidationError
    from design_assets import materialize_visuals
    image = Image.new('RGB', (1000, 1000), 'white')
    height = 400 if other_area else 450
    ImageDraw.Draw(image).rectangle((100, height+90, 105, height+103), fill='navy')
    # Either the .45 region limit or the separate .65 aggregate limit would
    # be exceeded only after recovering the connected foreground pixels.
    html = f'<img data-wr-crop="home:0,100,1000,{height}" data-wr-asset-kind="logo">'
    if other_area:
        html = '<img data-wr-crop="home:0,600,1000,250" data-wr-asset-kind="scene">' + html
    with pytest.raises(OutputValidationError, match='(bounds|area)'):
        materialize_visuals(BeautifulSoup(html, 'html.parser'), {'home': image_url(image)})


def design_image():
    out = io.BytesIO()
    image = Image.new('RGB', (1000, 800), '#f0f0f0')
    image.paste('#d03030', (500, 100, 1000, 400))
    image.save(out, 'PNG')
    return 'data:image/png;base64,' + base64.b64encode(out.getvalue()).decode()


def test_materializes_only_selected_approved_visual_region():
    from design_assets import materialize_visuals
    soup = BeautifulSoup('<html><head></head><body><img data-wr-crop="home:500,125,500,375" data-wr-asset-kind="scene"></body></html>', 'html.parser')
    materialize_visuals(soup, {'home': design_image()})
    assert soup.img is not None
    source = str(soup.img['src'])
    with Image.open(io.BytesIO(base64.b64decode(source.split(',')[1]))) as image:
        assert image.size == (500, 300)
        pixel = image.getpixel((200, 100))
        assert isinstance(pixel, tuple) and pixel[0] > 180
    assert soup.img['data-wr-design-asset'] == 'scene'


@pytest.mark.parametrize('crop', ['home:0,0,1000,1000', 'home:-1,0,300,300', 'other:0,0,300,300', 'home:0,0,0,200', 'home:900,0,200,200'])
def test_rejects_whole_screenshot_or_invalid_crop(crop):
    from assembler import OutputValidationError
    from design_assets import materialize_visuals
    soup = BeautifulSoup(f'<img data-wr-crop="{crop}" data-wr-asset-kind="scene">', 'html.parser')
    with pytest.raises(OutputValidationError):
        materialize_visuals(soup, {'home': design_image()})


def test_rejects_tiling_design_into_whole_page():
    from assembler import OutputValidationError
    from design_assets import materialize_visuals
    soup = BeautifulSoup(''.join(f'<img data-wr-crop="home:{x},{y},500,400" data-wr-asset-kind="scene">' for x,y in [(0,0),(500,0),(0,400),(500,400)]), 'html.parser')
    with pytest.raises(OutputValidationError, match='area'):
        materialize_visuals(soup, {'home': design_image()})


def test_trusted_icons_and_optional_font_have_no_network_dependency():
    from design_assets import materialize_visuals
    soup = BeautifulSoup('<html data-wr-font="rounded"><head></head><body><span class="mail" data-wr-icon="mail"></span></body></html>', 'html.parser')
    materialize_visuals(soup, {})
    assert soup.select_one('.mail svg path')
    assert soup.style is not None and 'data:font/woff2;base64,' in str(soup.style.string)
    assert 'SIL OPEN FONT LICENSE' in str(soup.style.string)
    assert 'url(https://' not in str(soup)


@pytest.mark.parametrize('name', ['droplet', 'bottle', 'mountain', 'grid', 'box', 'document', 'handshake'])
def test_common_feature_icons_survive_assembly_as_fixed_vectors(draft, pages, name):
    from assembler import assemble_page
    html = pages['home'].replace('</main>', f'<span class="feature-icon" data-wr-icon="{name}"></span></main>')
    result = BeautifulSoup(assemble_page(draft, 'home', html)['en/index.html'], 'html.parser')
    icon = result.select_one('.feature-icon svg')
    assert icon is not None and icon.get('viewbox') == '0 0 24 24'
    assert icon.get('stroke') == 'currentColor' and icon.get('aria-hidden') == 'true'
    assert icon.select_one('path[d]') is not None


def test_model_cannot_supply_geometry_for_a_named_trusted_icon():
    from assembler import OutputValidationError
    from design_assets import materialize_visuals
    soup = BeautifulSoup('<span data-wr-icon="droplet"><svg><path d="M0 0h9999"/></svg></span>', 'html.parser')
    with pytest.raises(OutputValidationError, match='trusted icon'):
        materialize_visuals(soup, {})


def test_all_fixed_feature_icons_have_visible_browser_geometry(draft, pages):
    from pathlib import Path
    from playwright.sync_api import sync_playwright
    from assembler import assemble_page
    from design_assets import ICON_PATHS
    icons = ''.join(f'<span style="font-size:32px;color:#123456" data-wr-icon="{name}"></span>' for name in ICON_PATHS)
    html = assemble_page(draft, 'home', pages['home'].replace('</main>', icons + '</main>'))['en/index.html']
    with sync_playwright() as playwright:
        if not Path(playwright.chromium.executable_path).exists():
            pytest.skip('Install Playwright Chromium to run browser acceptance')
        browser = playwright.chromium.launch()
        page = browser.new_page()
        page.route('**/*', lambda route: route.abort())
        page.set_content(html)
        geometry = page.locator('[data-wr-icon] svg path').evaluate_all('(paths) => paths.map(path => ({width:path.getBBox().width,height:path.getBBox().height,stroke:getComputedStyle(path).stroke}))')
        assert len(geometry) == len(ICON_PATHS)
        assert all(item['width'] >= 4 and item['height'] >= 4 and item['stroke'] == 'rgb(18, 52, 86)' for item in geometry)
        browser.close()


def test_render_reference_contract_accepts_every_approved_product(payload):
    from app import validate_request
    payload['referenceAssets'] = {product['imageAssetId']: design_image() for product in payload['draft']['products']}
    payload['referenceAssets'][payload['draft']['company']['logoAssetId']] = design_image()
    assert len(validate_request(payload)['referenceAssets']) == 3


def test_assembler_binds_trusted_visuals_but_drops_forged_media(draft, pages):
    from assembler import assemble_page
    html = pages['home'].replace('<html>', '<html data-wr-font="rounded">').replace('</main>', '<img data-wr-crop="home:500,125,500,375" data-wr-asset-kind="scene"><img src="https://untrusted.test/a.png"><span data-wr-icon="mail"></span></main>')
    result = assemble_page(draft, 'home', html, {'home': design_image()})['en/index.html']
    assert 'data:image/webp;base64,' in result
    assert 'data:font/woff2;base64,' in result
    assert 'untrusted.test' not in result


def test_approved_wordmark_binds_company_name_as_alt_without_duplicate_text(draft, pages):
    from assembler import assemble_page
    html = pages['home'].replace('<b data-wr-bind="company.name"></b>', '<img data-wr-bind="company.name" data-wr-crop="home:500,125,300,50" data-wr-asset-kind="logo">')
    result = BeautifulSoup(assemble_page(draft, 'home', html, {'home': design_image()})['en/index.html'], 'html.parser')
    logo = result.select_one('img[data-wr-design-asset="logo"]')
    assert logo is not None and logo['alt'] == draft['company']['name']
    assert not logo.get_text()


def test_generated_scene_is_bound_from_server_assets_without_model_urls(draft, pages):
    from assembler import assemble_page
    out = io.BytesIO()
    Image.new('RGB', (600, 400), '#456789').save(out, 'WEBP')
    scene = 'data:image/webp;base64,' + base64.b64encode(out.getvalue()).decode()
    html = pages['home'].replace('</main>', '<img class="hero-scene" data-wr-scene="home-0" src="https://forged.test/scene.png"></main>')
    result = BeautifulSoup(assemble_page(draft, 'home', html, {}, {'home-0': scene})['en/index.html'], 'html.parser')
    image = result.select_one('.hero-scene')
    assert image is not None and image['src'] == scene
    assert image['data-wr-design-asset'] == 'scene'
    assert image['data-wr-generated-asset'] == 'home-0'
    assert 'forged.test' not in str(result)


@pytest.mark.parametrize('markup,assets', [
    ('<img data-wr-scene="missing">', {}),
    ('<div data-wr-scene="home-0"></div>', {'home-0': design_image()}),
    ('<img data-wr-scene="home-0">', {'home-0': 'https://forged.test/a.webp'}),
    ('<img data-wr-scene="home-0" data-wr-bind="product.image">', {'home-0': 'data:image/webp;base64,AAAA'}),
    ('<img data-wr-scene="home-0" data-wr-crop="home:0,0,200,200">', {'home-0': 'data:image/webp;base64,AAAA'}),
])
def test_generated_scene_cannot_bypass_trusted_asset_registry(markup, assets):
    from assembler import OutputValidationError
    from design_assets import materialize_visuals
    with pytest.raises(OutputValidationError, match='generated scene'):
        materialize_visuals(BeautifulSoup(markup, 'html.parser'), {}, assets)
