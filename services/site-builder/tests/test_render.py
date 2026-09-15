import asyncio
import importlib.util

import pytest
from bs4 import BeautifulSoup


def renderer():
    assert importlib.util.find_spec("renderer"), "Isolated render validation is not implemented"
    import renderer
    return renderer


def catalog_html(extra_css="", overlay=""):
    return f'''<!doctype html><html><head><style>
body{{margin:0;font-family:Arial}}main{{padding:16px}}.cards{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}}article{{min-width:0}}.photo{{display:block;position:relative}}.photo img{{display:block;width:100%;height:180px;object-fit:contain}}{extra_css}
</style></head><body><nav data-wr-nav></nav><main><h1 data-wr-bind="ui.catalog"></h1><section class="cards" data-wr-products><article data-wr-product><a class="photo" data-wr-page="detail"><img data-wr-bind="product.image">{overlay}</a><h2 data-wr-bind="product.name"></h2><p data-wr-bind="product.description"></p></article></section></main></body></html>'''


def inspect(draft, payload, template):
    module = renderer()
    import assembler
    assert hasattr(assembler, "assemble_page"), "Representative-page assembly is not implemented"
    files = assembler.assemble_page(draft, "catalog", template)
    return asyncio.run(module.inspect_page("catalog", files["en/products/index.html"], draft, {draft["products"][0]["imageAssetId"]: payload["designImages"]["home"]}))


def test_actual_image_links_and_nested_cards_pass_isolated_render(draft, payload):
    result = inspect(draft, payload, catalog_html())
    assert result.issues == []
    assert len(result.screenshots) == 2
    assert all(image.startswith("data:image/png;base64,") for image in result.screenshots)


def test_visible_noninteractive_images_are_not_reported_as_occluded(draft, payload):
    result = inspect(draft, payload, catalog_html(".photo img{pointer-events:none}"))
    assert result.issues == []


def test_large_brand_link_and_padded_cta_are_not_vertical_navigation(draft, payload):
    template = catalog_html('header{display:flex;align-items:center;justify-content:space-between;padding:16px}.brand-name{font-size:52px;line-height:1.2}.cta{font-size:16px;line-height:16px;padding:16px}')
    template = template.replace('<body>', '<body><header><a class="brand" data-wr-page="home"><span class="brand-name" data-wr-bind="company.name"></span></a><a class="cta" data-wr-page="contact" data-wr-bind="copy.cta"></a></header>')
    result = inspect(draft, payload, template)
    assert result.issues == []


@pytest.mark.parametrize("css,overlay,wanted", [
    (".photo img{display:none}", "", "image is hidden"),
    (".mask{position:absolute;inset:0;background:red;z-index:2}", '<span class="mask"></span>', "image is obscured"),
    (".mask{position:absolute;inset:0;background:red;z-index:2;pointer-events:none}", '<span class="mask"></span>', "image is obscured"),
    ("nav>a{width:12px;word-break:break-all}", "", "navigation"),
])
def test_render_detects_hidden_images_occlusion_and_vertical_navigation(draft, payload, css, overlay, wanted):
    result = inspect(draft, payload, catalog_html(css, overlay))
    assert any(wanted in issue.lower() for issue in result.issues)


def test_transparent_noninteractive_layout_overlay_does_not_obscure_image(draft, payload):
    result = inspect(draft, payload, catalog_html('.mask{position:absolute;inset:0;background:transparent;z-index:2;pointer-events:none}', '<span class="mask"></span>'))
    assert result.issues == []


@pytest.mark.parametrize('fit,position,side,padding', [
    ('contain', 'right bottom', 'left', False),
    ('contain', 'right bottom', 'left', True),
    ('contain', 'left top', 'right', True),
    ('contain', '75% 25%', 'left', True),
    ('scale-down', 'right bottom', 'left', True),
    ('scale-down', '20px 30px', 'right', True),
])
def test_letterbox_overlay_does_not_shift_sampling_outside_painted_image(draft, payload, fit, position, side, padding):
    import base64
    import io
    from PIL import Image
    output = io.BytesIO()
    Image.new('RGB', (120, 80), '#456789').save(output, 'PNG')
    payload['designImages']['home'] = 'data:image/png;base64,' + base64.b64encode(output.getvalue()).decode()
    insets = 'padding:12px 20px;border:4px solid transparent;box-sizing:border-box;' if padding else ''
    css = f'.photo img{{object-fit:{fit};object-position:{position};{insets}}}'
    # This pointer-active layout box overlaps only the desktop letterbox. It
    # must not be exempted merely for being transparent; sample the bitmap.
    css += f'.mask{{position:absolute;{side}:0;top:0;bottom:0;width:30%;z-index:2;background:transparent}}'
    css += '@media(max-width:600px){.mask{display:none}}'
    result = inspect(draft, payload, catalog_html(css, '<span class="mask"></span>'))
    assert result.issues == []


def test_home_requires_visible_real_image_outside_collection(draft, payload, pages):
    module = renderer()
    import assembler
    # A valid text-only home with CSS product drawings cannot pass visual acceptance.
    html = assembler.assemble_page(draft, "home", pages["home"])["en/index.html"]
    result = asyncio.run(module.inspect_page("home", html, draft, {}))
    assert any("outside" in issue.lower() and "image" in issue.lower() for issue in result.issues)


def test_about_can_preserve_approved_headline_as_principal_title(draft, payload):
    import assembler
    template = '<html><head></head><body><nav data-wr-nav></nav><main><h1 data-wr-bind="copy.headline"></h1><p data-wr-bind="copy.about"></p><img style="width:200px;height:200px;object-fit:contain" data-wr-bind="product.image"></main></body></html>'
    html = assembler.assemble_page(draft, 'about', template)['en/about/index.html']
    assets = {draft['products'][0]['imageAssetId']: payload['designImages']['about']}
    result = asyncio.run(renderer().inspect_page('about', html, draft, assets))
    assert result.issues == []


def inspect_about_sections(guided_draft, payload, extra_css):
    import assembler
    plan = next(page for page in guided_draft['consultation']['brief']['pages'] if page['id'] == 'about')
    for language in guided_draft['languages']:
        plan['content'][language]['sections'] = [
            {'heading': f'Approved feature {index + 1}', 'body': f'Complete approved feature description {index + 1}.'}
            for index in range(3)
        ]
    sections = ''.join(
        f'<section class="feature"><h2 data-wr-bind="section.{index}.heading"></h2><p data-wr-bind="section.{index}.body"></p></section>'
        for index in range(3)
    )
    template = f'''<html><head><style>
      body{{margin:0;font-family:Arial}}main{{padding:16px;overflow:hidden}}
      .features{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}}
      .feature h2,.feature p{{margin:0;line-height:24px}}{extra_css}
      </style></head><body><nav data-wr-nav></nav><main>
      <h1 data-wr-bind="copy.headline"></h1><p data-wr-bind="copy.about"></p>
      <img style="width:200px;height:200px;object-fit:contain" data-wr-bind="product.image">
      <div class="features">{sections}</div></main></body></html>'''
    html = assembler.assemble_page(guided_draft, 'about', template)['en/about/index.html']
    assets = {guided_draft['products'][0]['imageAssetId']: payload['designImages']['about']}
    return asyncio.run(renderer().inspect_page('about', html, guided_draft, assets))


@pytest.mark.parametrize('overflow', ['hidden', 'clip'])
def test_mobile_approved_sections_clipped_by_main_overflow_are_rejected(guided_draft, payload, overflow):
    result = inspect_about_sections(guided_draft, payload, f'''
      main{{overflow:{overflow}}}
      @media(max-width:600px){{.features{{grid-template-columns:repeat(3,280px)}}}}
    ''')
    assert not any(issue.startswith('1440px:') for issue in result.issues)
    for index in (1, 2):
        for field in ('heading', 'body'):
            assert f'390px: about: approved content is missing or hidden: section.{index}.{field}' in result.issues
    assert not any('section.0.' in issue for issue in result.issues)


@pytest.mark.parametrize('overflow', ['hidden', 'clip'])
def test_required_text_partially_or_fully_clipped_vertically_is_rejected(guided_draft, payload, overflow):
    result = inspect_about_sections(guided_draft, payload, f'.features{{height:18px;overflow:{overflow}}}')
    for field in ('heading', 'body'):
        assert any(f'approved content is missing or hidden: section.0.{field}' in issue for issue in result.issues)


def test_below_fold_content_in_long_auto_height_overflow_container_remains_visible(guided_draft, payload):
    result = inspect_about_sections(guided_draft, payload, '.features{margin-top:1500px;grid-template-columns:1fr}')
    assert result.issues == []
    assert all(metric['height'] > 1500 for metric in result.metrics)


def test_clipping_boundary_allows_one_pixel_border_rounding(guided_draft, payload):
    result = inspect_about_sections(guided_draft, payload, '.features{border:1px solid #333;overflow:hidden}.feature{transform:translateX(-1px)}')
    assert result.issues == []


def test_hidden_contact_form_cannot_pass_visual_acceptance(draft):
    module = renderer()
    import assembler
    template = '<html><head><style>.form-slot{display:none}</style></head><body><nav data-wr-nav></nav><main><h1 data-wr-bind="ui.contact"></h1><div class="form-slot" data-wr-form></div></main></body></html>'
    html = assembler.assemble_page(draft, "contact", template)["en/contact/index.html"]
    result = asyncio.run(module.inspect_page("contact", html, draft, {}))
    assert any("form" in issue.lower() and "hidden" in issue.lower() for issue in result.issues)


@pytest.mark.parametrize("wrapped", [True, False])
def test_real_header_pattern_removes_only_duplicate_tagline_and_keeps_navigation_inside(draft, payload, wrapped):
    module = renderer()
    import assembler
    draft["copy"]["en"]["subtitle"] = "Dreamy pond-night slow-rising foam squishy sets with soft pastel characters and paperboard packaging concepts."
    nav = '<nav class="nav" data-wr-nav></nav>'
    if wrapped:
        nav = '<div class="navwrap">' + nav + '</div>'
    header = '<header><a class="brand" data-wr-page="home"><div class="brand-name" data-wr-bind="company.name"></div><div class="tag" data-wr-bind="copy.subtitle"></div></a>' + nav + '<a class="head-cta" data-wr-page="contact" data-wr-bind="copy.cta"></a></header>'
    css = '''header{height:86px;padding:16px 42px 10px;display:flex;align-items:flex-start;gap:34px;position:relative}.brand{min-width:245px}.brand-name{font-size:45px;line-height:.86}.tag{font-size:9px;letter-spacing:7px;white-space:nowrap}.navwrap{flex:1;display:flex;align-items:center;justify-content:center;min-width:0;padding-top:8px}nav[data-wr-nav]{gap:46px;min-width:0;align-items:center}nav[data-wr-nav] a{white-space:nowrap}.head-cta{background:#32634e;color:white;border-radius:28px;padding:16px 28px}@media(max-width:600px){header{padding:18px}.brand{min-width:0;width:100%}.navwrap{order:3;width:100%;overflow:auto}}'''
    template = catalog_html(css).replace('<nav data-wr-nav></nav>', header).replace('<main>', '<main><p data-wr-bind="copy.subtitle"></p>')
    html = assembler.assemble_page(draft, "catalog", template)["en/products/index.html"]
    soup = BeautifulSoup(html, "html.parser")
    assert soup.select_one('header [data-wr-bind="copy.subtitle"]') is None
    subtitle = soup.select_one('main [data-wr-bind="copy.subtitle"]')
    assert subtitle is not None and subtitle.get_text() == draft["copy"]["en"]["subtitle"]
    brand = soup.select_one('header .brand-name')
    cta = soup.select_one('header .head-cta')
    assert brand is not None and brand.get_text() == draft["company"]["name"]
    assert cta is not None and cta.get_text() == draft["copy"]["en"]["cta"]
    assert len(soup.select('header [data-wr-nav] > a')) == 4
    result = asyncio.run(module.inspect_page("catalog", html, draft, {}))
    assert result.issues == []


def test_navigation_extending_above_containing_header_is_rejected(draft):
    module = renderer()
    import assembler
    template = catalog_html().replace('<nav data-wr-nav></nav>', '<header><nav data-wr-nav></nav></header>')
    soup = BeautifulSoup(assembler.assemble_page(draft, "catalog", template)["en/products/index.html"], "html.parser")
    header = soup.select_one("header")
    nav = soup.select_one("[data-wr-nav]")
    assert header is not None and nav is not None
    header["style"] = "height:20px;padding:0;position:relative"
    nav["style"] = "position:relative;top:-12px;padding:0"
    result = asyncio.run(module.inspect_page("catalog", str(soup), draft, {}))
    assert any("outside" in issue.lower() and "header" in issue.lower() for issue in result.issues)


def test_shared_designed_header_does_not_gain_legacy_nav_padding(draft, payload):
    draft['languages'] = ['en']
    css = '.wr-header{height:58px;display:grid;align-items:center}.wr-header nav{justify-content:center}.wr-header nav a{padding:19px 4px 16px}'
    template = catalog_html(css).replace('<nav data-wr-nav></nav>', '<header class="wr-header"><nav data-wr-nav></nav></header>')
    result = inspect(draft,payload,template)
    assert not any('containing header' in issue for issue in result.issues)


def test_partial_opaque_image_coverage_is_rejected(draft, payload):
    # The square bitmap is centered and 180px wide on desktop. Cover 54px of
    # its actual left edge, not 30% of the wider element's empty letterbox.
    result = inspect(draft, payload, catalog_html('.mask{position:absolute;left:calc(50% - 90px);top:0;height:180px;width:54px;background:red;pointer-events:none}', '<span class="mask"></span>'))
    assert any(issue.startswith('1440px:') and '6/9 clear samples' in issue for issue in result.issues)
    assert any(issue.startswith('390px:') and '6/9 clear samples' in issue for issue in result.issues)


def test_two_pixel_document_overflow_is_rejected(draft, payload):
    result = inspect(draft, payload, catalog_html('body::after{content:"";position:absolute;left:100%;top:0;width:2px;height:2px;background:red}'))
    assert any("page content extends outside" in issue for issue in result.issues)
