import asyncio
import copy
import json

import pytest

import builder
from assembler import OutputValidationError, assemble_page
from page_cache import PageCacheError, load_page_cache, save_page_cache
from renderer import RenderResult
from test_design_assets import design_image


@pytest.fixture
def recovery(payload, pages, monkeypatch, tmp_path):
    payload['designImages']['detail'] = design_image()
    plan = {'crops': [], 'labels': [], 'cardCounts': [], 'composition': '', 'layout': {'pageType': 'detail', 'collections': [], 'forms': []}}
    payload['_visualPlans'] = {'detail': plan}
    monkeypatch.setenv('OPENAI_API_KEY', 'test-only')
    monkeypatch.setattr(builder, 'resolve_model', lambda value: object())
    renders = []
    async def inspect(page, html, *args):
        renders.append(html)
        return RenderResult(metrics=[{'cards': 0, 'collections': [], 'scenes': 0, 'forms': 0, 'collectionLayouts': [], 'formLayouts': []}])
    monkeypatch.setattr(builder, 'inspect_page', inspect)
    monkeypatch.setattr(builder, 'prepare_page_plan', lambda *args: pytest.fail('A matching cache must not re-plan'))
    return payload, pages['detail'], plan, renders, tmp_path


def test_matching_page_is_reassembled_and_checked_without_a_model(recovery, monkeypatch):
    payload, html, plan, renders, directory = recovery
    save_page_cache(payload, 'detail', html, plan)
    monkeypatch.setattr(builder, 'create_agent', lambda *args: pytest.fail('No model for cache hit'))
    original = copy.deepcopy(payload)
    payload['id'] = 'next-job'
    payload['draft']['siteDesign'] = {'build': {'jobId': 'next-job'}}
    assert asyncio.run(builder.build_page(payload, 'detail')) == html
    assert len(renders) == 1
    assert assemble_page(payload['draft'], 'detail', html, payload['designImages'])
    evidence = json.loads((directory / 'evidence/next-job/detail-selected.json').read_text())
    assert evidence['issues'] == [] and evidence['selection']['candidate'] == 'cached'
    assert evidence['selection']['sourceJobId'] == original['id']
    assert not (directory / 'evidence/next-job/detail-initial.json').exists()


@pytest.mark.parametrize('invalid', ['unknown-binding', 'unbound-copy', 'corrupt-json'])
def test_invalid_cached_page_never_falls_back_to_paid_generation(recovery, monkeypatch, invalid):
    payload, html, plan, renders, directory = recovery
    if invalid == 'unknown-binding': html = html.replace('</main>', '<span data-wr-bind="unknown.field"></span></main>')
    elif invalid == 'unbound-copy': html = html.replace('</main>', '<p>Unapproved claim</p></main>')
    save_page_cache(payload, 'detail', html, plan)
    if invalid == 'corrupt-json': next((directory / 'page-cache').glob('*.json')).write_text('{')
    monkeypatch.setattr(builder, 'create_agent', lambda *args: pytest.fail('Invalid cache cannot trigger a model'))
    with pytest.raises(PageCacheError): asyncio.run(builder.build_page(payload, 'detail'))
    assert not (directory / 'evidence/test-job-1/detail-selected.json').exists()
    reused = directory / 'evidence/test-job-1/detail-reused.json'
    if reused.exists():
        assert 'failed current' in json.loads(reused.read_text())['selection']['reason']


def test_reviewed_success_is_saved_before_a_later_build_can_fail(recovery, monkeypatch):
    payload, html, plan, renders, directory = recovery
    calls = []
    class Model:
        async def run(self, model, messages):
            calls.append(messages)
            return html
    monkeypatch.setattr(builder, 'create_agent', lambda *args: Model())
    assert asyncio.run(builder.build_page(payload, 'detail')) == html
    record = load_page_cache(payload, 'detail')
    assert record is not None and record['html'] == html
    assert len(calls) == 2 and len(renders) == 2
    monkeypatch.setattr(builder, 'create_agent', lambda *args: pytest.fail('Accepted result must survive another job'))
    assert asyncio.run(builder.build_page({**payload, 'id': 'new-build'}, 'detail')) == html
    assert len(renders) == 3


def test_failed_candidates_are_never_cached(recovery, monkeypatch):
    payload, html, plan, renders, directory = recovery
    html = html.replace('</main>', '<p>Unapproved claim</p></main>')
    class Model:
        async def run(self, *args): return html
    monkeypatch.setattr(builder, 'create_agent', lambda *args: Model())
    with pytest.raises(OutputValidationError, match='failed render checks'):
        asyncio.run(builder.build_page(payload, 'detail'))
    assert load_page_cache(payload, 'detail') is None
    assert not (directory / 'page-cache').exists()


def test_cached_page_cannot_regenerate_missing_accepted_scenes(recovery, monkeypatch):
    import generated_assets
    payload, html, plan, renders, directory = recovery
    plan['crops'] = [{'kind': 'scene', 'box': [400, 100, 500, 400]}]
    save_page_cache(payload, 'detail', html, plan)
    monkeypatch.setattr(generated_assets, 'generate_scene_assets', lambda *args: pytest.fail('Missing cache must not spend on images'))
    with pytest.raises(PageCacheError, match='scene assets are missing'):
        asyncio.run(builder.build_page(payload, 'detail'))


def test_full_warm_build_skips_planning_and_models_but_checks_every_page(payload, pages, monkeypatch):
    payload['designImages'] = {page: design_image() for page in pages}
    home = pages['home'].replace('<header>', '<header class="wr-header">').replace('</head>', '<style data-wr-shared></style></head>').replace('</body>', '<footer class="wr-footer"><span data-wr-bind="company.name"></span></footer></body>')
    pages = {**pages, 'home': home}
    for page, html in pages.items():
        columns = [2] if page == 'catalog' else []
        plan = {'crops': [], 'labels': [], 'cardCounts': columns, 'composition': '', 'layout': {'pageType': page, 'collections': [{'columns': value, 'descriptions': True} for value in columns], 'forms': []}}
        save_page_cache(payload, page, html, plan, home if page != 'home' else None)
    monkeypatch.setenv('OPENAI_API_KEY', 'test-only')
    monkeypatch.setattr(builder, 'resolve_model', lambda value: object())
    monkeypatch.setattr(builder, 'prepare_page_plan', lambda *args: pytest.fail('No fresh planning for complete matching cache'))
    monkeypatch.setattr(builder, 'create_agent', lambda *args: pytest.fail('No HTML model for complete matching cache'))
    inspected = []
    async def inspect(page, *args):
        inspected.append(page)
        cards = 2 if page == 'catalog' else 0
        return RenderResult(metrics=[{'cards': cards, 'collections': [cards] if cards else [], 'scenes': 0, 'forms': 0, 'collectionLayouts': [{'columns': 2, 'rows': 1, 'descriptionCount': 2}] if cards else [], 'formLayouts': []}])
    monkeypatch.setattr(builder, 'inspect_page', inspect)
    files = asyncio.run(builder.build_site({**payload, 'id': 'warm-build'}))
    assert len(files) == 12 and set(inspected) == set(pages) and len(inspected) == 5


def test_invalid_cached_home_stops_before_any_missing_page_planning(payload, pages, monkeypatch):
    payload['designImages'] = {page: design_image() for page in pages}
    invalid_home = pages['home'].replace('</main>', '<p>Unapproved claim</p></main>')
    plan = {'crops': [], 'labels': [], 'cardCounts': [], 'layout': {'pageType': 'home', 'collections': [], 'forms': []}}
    save_page_cache(payload, 'home', invalid_home, plan)
    monkeypatch.setenv('OPENAI_API_KEY', 'test-only')
    monkeypatch.setattr(builder, 'resolve_model', lambda value: object())
    monkeypatch.setattr(builder, 'inspect_page', lambda *args: asyncio.sleep(0, result=RenderResult()))
    monkeypatch.setattr(builder, 'prepare_page_plan', lambda *args: pytest.fail('Invalid cache must stop before paid missing-page planning'))
    monkeypatch.setattr(builder, 'create_agent', lambda *args: pytest.fail('Invalid cache must stop before a model'))
    with pytest.raises(PageCacheError, match='no longer passes current checks'):
        asyncio.run(builder.build_site(payload))
