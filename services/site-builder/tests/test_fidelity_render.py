import asyncio
import base64
import copy
import io

from bs4 import BeautifulSoup
from PIL import Image


def test_trusted_crops_survive_private_render_without_network(draft):
    from design_assets import materialize_visuals
    from renderer import render_document
    out = io.BytesIO()
    Image.new('RGB', (1000, 800), 'red').save(out, 'PNG')
    design = 'data:image/png;base64,' + base64.b64encode(out.getvalue()).decode()
    soup = BeautifulSoup('<html><head></head><body><img data-wr-crop="home:500,0,500,400" data-wr-asset-kind="scene"></body></html>', 'html.parser')
    materialize_visuals(soup, {'home': design})
    rendered = BeautifulSoup(render_document(str(soup), draft, {}), 'html.parser')
    assert rendered.img is not None and str(rendered.img.get('src', '')).startswith('data:image/webp;base64,')


def test_render_matches_reference_width_and_reports_inflated_page(draft):
    from assembler import assemble_page
    from renderer import inspect_page
    out = io.BytesIO()
    Image.new('RGB', (1536, 1024), 'white').save(out, 'PNG')
    design = 'data:image/png;base64,' + base64.b64encode(out.getvalue()).decode()
    html = assemble_page(draft, 'contact', '<html><head><style>body{margin:0}main{min-height:1800px}</style></head><body><nav data-wr-nav></nav><main><h1 data-wr-bind="ui.contact"></h1><div data-wr-form></div></main></body></html>')['en/contact/index.html']
    result = asyncio.run(inspect_page('contact', html, draft, {}, design))
    assert [item['width'] for item in result.metrics] == [1536, 390]
    assert any('page height' in issue for issue in result.issues)
    for shot, metrics in zip(result.screenshots, result.metrics):
        with Image.open(io.BytesIO(base64.b64decode(shot.split(',')[1]))) as image:
            assert image.height == min(5000, metrics['height'])


def test_render_rejects_second_crop_of_photographic_scene(draft, pages):
    from assembler import assemble_page
    from renderer import inspect_page
    from test_design_assets import design_image
    html = pages['home'].replace('</main>', '<img style="width:300px;height:300px;object-fit:cover" data-wr-crop="home:500,125,500,375" data-wr-asset-kind="scene"></main>')
    files = assemble_page(draft, 'home', html, {'home':design_image()})
    result = asyncio.run(inspect_page('home', files['en/index.html'], draft, {}))
    assert any('scene: CSS crops' in issue for issue in result.issues)


def test_asset_aspect_check_uses_image_content_box(draft, pages):
    from assembler import assemble_page
    from renderer import inspect_page
    from test_design_assets import design_image
    html = pages['home'].replace('</main>', '<img style="width:300px;height:auto;padding:30px;border:2px solid red" data-wr-crop="home:500,125,500,375" data-wr-asset-kind="scene"></main>')
    files = assemble_page(draft, 'home', html, {'home':design_image()})
    result = asyncio.run(inspect_page('home', files['en/index.html'], draft, {}))
    assert not any('CSS distorts' in issue or 'CSS crops' in issue for issue in result.issues)


def test_catalog_metrics_read_bound_product_links_and_section_placement(guided_draft, pages):
    import json
    from assembler import assemble_page
    from renderer import inspect_page
    from test_bindings import collection
    planned = next(page for page in guided_draft['consultation']['brief']['pages'] if page['id'] == 'catalog')
    for content in planned['content'].values():
        content['sections'] = [
            {'heading': 'Cork', 'body': 'Cork products'},
            {'heading': 'Wood', 'body': 'Wood products'},
        ]
    body = '<h1 data-wr-bind="ui.catalog"></h1>'
    for index, ids in enumerate((['second'], ['a/b ?'])):
        body += f'<h2 data-wr-bind="section.{index}.heading"></h2><p data-wr-bind="section.{index}.body"></p>' + collection(ids)
    template = str(BeautifulSoup(pages['catalog'], 'html.parser'))
    soup = BeautifulSoup(template, 'html.parser')
    assert soup.main is not None
    soup.main.clear()
    soup.main.append(BeautifulSoup(body, 'html.parser'))
    html = assemble_page(guided_draft, 'catalog', str(soup))['en/products/index.html']
    # A stale selection attribute must not conceal actual assembler-bound membership.
    bound = BeautifulSoup(html, 'html.parser')
    for listing in bound.select('[data-wr-products]'):
        listing['data-wr-product-ids'] = json.dumps(['forged'])
    result = asyncio.run(inspect_page('catalog', str(bound), guided_draft, {}))
    assert len(result.metrics) == 2
    for metric in result.metrics:
        assert metric['collectionGroups'] == [
            {'sectionIndex': 0, 'productIds': ['second']},
            {'sectionIndex': 1, 'productIds': ['a/b ?']},
        ]


def test_layout_metrics_distinguish_compact_columns_descriptions_and_form_rows(draft):
    from assembler import assemble_page
    from renderer import inspect_page
    from test_bindings import CARD
    original = draft['products'][0]
    draft['products'] = [dict(copy.deepcopy(original), id=f'item-{index}', name=f'Item {index}') for index in range(8)]
    draft['primaryProductId'] = 'item-0'
    draft['languages'] = ['en']
    slots = ''.join(f'<span data-wr-field="{name}"></span>' for name in ('name', 'email', 'company', 'productId', 'message', 'submit'))
    long_card = CARD.replace('</article>', '<p data-wr-bind="product.description"></p></article>')
    template = f'''<html><head><style>
      body{{margin:0}}main{{padding:16px}}article{{min-width:0}}article img{{display:block;width:100%;height:80px;object-fit:contain}}
      .compact{{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:8px}}
      .expanded{{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}}
      .inquiry{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}}
      .inquiry [data-wr-field="message"],.inquiry [data-wr-field="submit"]{{grid-column:1/-1}}
      @media(max-width:600px){{.compact,.expanded{{grid-template-columns:repeat(2,minmax(0,1fr))}}.inquiry{{grid-template-columns:1fr}}}}
      </style></head><body><nav data-wr-nav></nav><main><h1 data-wr-bind="ui.catalog"></h1>
      <section class="compact" data-wr-products>{CARD}</section>
      <section class="expanded" data-wr-products>{long_card}</section>
      <div class="inquiry" data-wr-form>{slots}</div></main></body></html>'''
    html = assemble_page(draft, 'catalog', template)['en/products/index.html']
    result = asyncio.run(inspect_page('catalog', html, draft, {}))
    assert result.issues == []
    desktop, mobile = result.metrics
    assert desktop['collectionLayouts'] == [
        {'columns': 8, 'rows': 1, 'descriptionCount': 0},
        {'columns': 4, 'rows': 2, 'descriptionCount': 8},
    ]
    assert mobile['collectionLayouts'] == [
        {'columns': 2, 'rows': 4, 'descriptionCount': 0},
        {'columns': 2, 'rows': 4, 'descriptionCount': 8},
    ]
    assert desktop['formLayouts'] == [{'columns': 2}]
    assert mobile['formLayouts'] == [{'columns': 1}]
