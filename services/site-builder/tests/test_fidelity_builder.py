import asyncio
import copy

import pytest


def layout(page='home', counts=()):
    return {'pageType': page, 'collections': [{'columns': count, 'descriptions': False} for count in counts], 'forms': []}


def metrics(counts):
    return {'cards': sum(counts), 'collections': list(counts), 'scenes': 0,
            'collectionLayouts': [{'columns': count, 'rows': 1, 'descriptionCount': 0} for count in counts], 'forms': 0, 'formLayouts': []}


def test_structurally_passing_pages_still_receive_visual_review(payload, pages, monkeypatch):
    import builder
    from renderer import RenderResult
    monkeypatch.setenv('OPENAI_API_KEY', 'test-only')
    monkeypatch.setattr(builder, 'resolve_model', lambda value: object())
    monkeypatch.setattr(builder, 'assess_page', lambda *args: asyncio.sleep(0, result=RenderResult(screenshots=['data:image/png;base64,actual-render'])))
    calls = []
    page_names = iter(pages)
    class Model:
        def __init__(self, page): self.page = page
        async def run(self, model, messages):
            calls.append((self.page, messages))
            return pages[self.page]
    monkeypatch.setattr(builder, 'create_agent', lambda *args: Model(next(page_names)))
    asyncio.run(builder.build_site(payload))
    assert len(calls) == 10
    for page in pages:
        page_calls = [messages for name, messages in calls if name == page]
        assert len(page_calls) == 2 and 'actual-render' in str(page_calls[1][-1])


def test_shared_home_chrome_is_reused_without_replacing_page_content():
    from builder import reuse_home_chrome
    from bs4 import BeautifulSoup
    home = '<html data-wr-font="rounded"><head><style data-wr-shared>.wr-header{color:blue}.wr-footer{padding:1rem}</style></head><body><header class="wr-header"><nav data-wr-nav></nav></header><main>home</main><footer class="wr-footer"><span data-wr-bind="company.name"></span></footer></body></html>'
    detail = '<html><head><style>.detail{display:grid}</style></head><body><header>drift</header><main class="detail"><h1 data-wr-bind="product.name"></h1></main><footer>drift</footer></body></html>'
    result = BeautifulSoup(reuse_home_chrome(home, detail), 'html.parser')
    assert result.select_one('header.wr-header nav[data-wr-nav]')
    assert result.select_one('footer.wr-footer [data-wr-bind="company.name"]')
    assert result.select_one('main.detail h1[data-wr-bind="product.name"]')
    assert '.detail{display:grid}' in str(result.head)
    assert result.html is not None and result.html['data-wr-font'] == 'rounded'


def test_asset_handoff_requires_detected_scene_instead_of_duplicate_cards():
    from visual_plan import check_visual_plan, visual_asset_markup
    plan = {'labels': [], 'crops': [{'kind': 'scene', 'box': [450, 60, 550, 400]}], 'cardCounts': [8], 'composition': 'Photographic hero followed by one compact row.', 'layout': layout(counts=[8])}
    markup = visual_asset_markup('home', plan)
    assert 'data-wr-crop="home:450,60,550,400"' in markup
    assert check_visual_plan(plan, [{**metrics([8]), 'cards':16}]) == [
        'Approved photographic scene is missing; use the supplied crop asset, not a product-card wall or CSS replacement.',
        'Approved design has 8 product cards, but the bound page contains 16; preserve the number of collections and cards.',
    ]


def test_single_language_site_has_no_redundant_language_switcher(draft, pages):
    from assembler import assemble_page
    from bs4 import BeautifulSoup
    draft['languages'] = ['en']
    html = assemble_page(draft, 'home', pages['home'])['en/index.html']
    assert BeautifulSoup(html, 'html.parser').select_one('[data-wr-languages]') is None


def test_visual_plan_converts_pixel_corners_to_normalized_crop():
    from test_design_assets import design_image
    from visual_plan import validate_visual_plan, visual_asset_previews
    plan = validate_visual_plan('home', design_image(), {
        'labels': [], 'crops': [{'kind': 'scene', 'box': [500, 100, 1000, 400]}],
        'cardCounts': [8], 'composition': 'One photographic hero.', 'layout': layout(counts=[8]),
    })
    assert plan['crops'][0]['box'] == [500, 125, 500, 375]
    previews = visual_asset_previews('home', design_image(), plan)
    assert 'home:500,125,500,375' in previews[0]['text']
    assert previews[1]['image_url']['url'].startswith('data:image/webp;base64,')


@pytest.mark.parametrize('box', [[500,100,500,400], [0,0,1001,400], [100,400,500,100]])
def test_visual_plan_rejects_invalid_pixel_corners(box):
    from assembler import OutputValidationError
    from test_design_assets import design_image
    from visual_plan import validate_visual_plan
    with pytest.raises(OutputValidationError):
        validate_visual_plan('home', design_image(), {'labels': [], 'crops':[{'kind':'scene','box':box}], 'cardCounts':[], 'composition':'', 'layout': layout()})


@pytest.mark.parametrize('value', ['accepted-original-value', ['accepted-original-value']])
def test_condition_names_cannot_clobber_product_assignments_or_mutate_draft(draft, value):
    from builder import grouped_conditions
    draft['products'][0]['source']['conditions']['productIds'] = value
    before = copy.deepcopy(draft)
    groups = grouped_conditions(draft)
    matching = [group for group in groups if group['name'] == 'productIds']
    assert matching == [{'productIds':[draft['products'][0]['id']], 'name':'productIds', 'value':value}]
    assert draft == before


def test_visual_review_preserves_separate_collection_counts():
    from visual_plan import check_visual_plan
    plan = {'labels': [], 'crops':[], 'cardCounts':[4,4], 'composition':'', 'layout': layout(counts=[4,4])}
    assert check_visual_plan(plan, [metrics([8])])
    assert not check_visual_plan(plan, [metrics([4,4])])


def test_incomplete_catalog_membership_stops_before_html_generation(payload, monkeypatch):
    import builder
    from assembler import OutputValidationError
    from test_design_assets import design_image
    from test_catalog_plan import mock_planner
    asyncio.run(builder.initialize_vendor())
    from llm import Llm
    payload['designImages']['catalog'] = design_image()
    monkeypatch.setenv('OPENAI_API_KEY', 'test-only')
    monkeypatch.setattr(builder, 'resolve_model', lambda value: Llm.GPT_5_5_LOW)
    mock_planner(monkeypatch, [{'labels': [], 'crops': [], 'cardCounts': [1], 'composition': '', 'layout': layout('catalog', [1]), 'catalogGroups': [{'sectionIndex': None, 'productIds': ['second']}]}])
    monkeypatch.setattr(builder, 'create_agent', lambda *args: pytest.fail('Invalid plan must fail before spending on HTML'))
    with pytest.raises(OutputValidationError, match='complete collection'):
        asyncio.run(builder.build_page(payload, 'catalog'))


def test_photographic_plan_is_reviewed_with_actual_extracted_pixels(monkeypatch):
    import json
    from types import SimpleNamespace
    import visual_plan
    from test_design_assets import design_image
    calls = []
    plans = iter([
        {'labels': [], 'crops':[{'kind':'scene','box':[450,100,1000,400]}], 'cardCounts':[8], 'composition':'Proposal', 'layout': layout(counts=[8])},
        {'labels': [], 'crops':[{'kind':'scene','box':[500,100,1000,400]}], 'cardCounts':[8], 'composition':'Clean scene', 'layout': layout(counts=[8])},
    ])
    class Client:
        def __init__(self,**kwargs): self.responses=self
        async def __aenter__(self): return self
        async def __aexit__(self,*args): pass
        async def create(self,**kwargs):
            calls.append(kwargs)
            return SimpleNamespace(status='completed',output_text=json.dumps(next(plans)))
    monkeypatch.setattr(visual_plan,'AsyncOpenAI',Client)
    plan=asyncio.run(visual_plan.plan_visuals('home',design_image(),'gpt-5.5','test-only',None))
    assert plan is not None
    assert plan['crops'][0]['box']==[500,125,500,375]
    assert len(calls)==2
    images=[part for part in calls[1]['input'][0]['content'] if part['type']=='input_image']
    assert len(images)==2 and images[1]['image_url'].startswith('data:image/webp;base64,')


def test_wrong_page_design_fails_preflight_before_any_conversion(payload, monkeypatch):
    import builder
    from assembler import OutputValidationError
    async def plan(payload, page):
        if page == 'about':
            raise OutputValidationError('About design is a catalog')
        return None
    monkeypatch.setattr(builder, 'prepare_page_plan', plan)
    monkeypatch.setattr(builder, 'build_page', lambda *args: pytest.fail('All page designs must pass preflight before conversion'))
    with pytest.raises(OutputValidationError, match='About design'):
        asyncio.run(builder.build_site(payload))


def test_inner_pages_run_at_most_two_at_once_after_home(payload, pages, monkeypatch):
    import builder
    active = maximum = 0
    home_done = False
    async def page(payload, name, home=None):
        nonlocal active, maximum, home_done
        if name != 'home':
            assert home_done and home == pages['home']
        active += 1
        maximum = max(maximum, active)
        await asyncio.sleep(0)
        active -= 1
        home_done = True
        return pages[name]
    monkeypatch.setattr(builder, 'build_page', page)
    result = asyncio.run(builder.build_site(payload))
    assert maximum == 2 and len(result) > 5


def test_prepared_scene_reaches_model_and_both_sanitized_reviews(payload, pages, monkeypatch, tmp_path):
    import base64
    import io
    import builder
    import generated_assets
    from assembler import assemble_page
    from renderer import RenderResult
    from PIL import Image
    out = io.BytesIO()
    Image.new('RGB', (600, 400), '#456789').save(out, 'WEBP')
    scene = 'data:image/webp;base64,' + base64.b64encode(out.getvalue()).decode()
    plan = {'labels': [], 'crops': [{'kind': 'scene', 'box': [450,60,550,400]}], 'cardCounts': [], 'composition': 'Photographic hero', 'layout': layout()}
    payload['_visualPlans'] = {'home': plan}
    monkeypatch.setenv('OPENAI_API_KEY', 'test-only')
    monkeypatch.setenv('SITE_BUILDER_DB', str(tmp_path / 'jobs.db'))
    monkeypatch.setattr(builder, 'resolve_model', lambda value: object())
    generations = []
    async def generate(*args):
        generations.append(args)
        return {'home-0': scene}
    monkeypatch.setattr(generated_assets, 'generate_scene_assets', generate)
    html = pages['home'].replace('</main>', '<img data-wr-scene="home-0"></main>')
    messages_seen = []
    class Model:
        async def run(self, model, messages):
            messages_seen.append(messages)
            return html
    monkeypatch.setattr(builder, 'create_agent', lambda *args: Model())
    reviewed = []
    async def review(page, html, payload):
        reviewed.append(assemble_page(payload['draft'], page, html, payload['designImages'], payload['_generatedAssets']))
        return RenderResult()
    monkeypatch.setattr(builder, 'assess_page', review)
    asyncio.run(builder.build_page(payload, 'home'))
    assert len(generations) == 1 and len(reviewed) == 2
    assert all(scene in output['en/index.html'] for output in reviewed)
    assert 'data-wr-scene="home-0"' in str(messages_seen[0]) and scene in str(messages_seen[0])


def test_legacy_scene_cannot_satisfy_prepared_asset_acceptance(payload, pages, monkeypatch):
    import builder
    from renderer import RenderResult
    from test_design_assets import design_image
    payload['designImages']['home'] = design_image()
    payload['_generatedAssets'] = {'home-0': 'data:image/webp;base64,prepared-scene'}
    html = pages['home'].replace('</main>', '<img data-wr-crop="home:500,125,500,375" data-wr-asset-kind="scene"></main>')
    monkeypatch.setattr(builder, 'inspect_page', lambda *args: asyncio.sleep(0, result=RenderResult()))
    result = asyncio.run(builder.assess_page('home', html, payload))
    assert any('prepared scene home-0' in issue for issue in result.issues)
