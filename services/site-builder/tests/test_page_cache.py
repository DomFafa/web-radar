import copy
import hashlib
import importlib
import json
import stat
from concurrent.futures import ThreadPoolExecutor

import pytest


def module():
    return importlib.import_module('page_cache')


@pytest.fixture
def cached_page(payload, pages, monkeypatch, tmp_path):
    payload['referenceAssets'] = {'original': 'approved-image-reference'}
    payload['draft']['siteDesign'] = {'status': 'building'}
    monkeypatch.setenv('SITE_BUILDER_DB', str(tmp_path / 'data/builds.sqlite3'))
    monkeypatch.setenv('SITE_BUILDER_MODEL', 'gpt-5.5')
    monkeypatch.setenv('OPENAI_BASE_URL', 'https://text.example/v1')
    monkeypatch.setenv('IMAGE_MODEL', 'gpt-image-2.5-sunburst')
    monkeypatch.setenv('IMAGE_API_BASE_URL', 'https://images.example/v1')
    monkeypatch.setenv('OPENAI_API_KEY', 'text-secret-never-persist')
    monkeypatch.setenv('IMAGE_API_KEY', 'image-secret-never-persist')
    plan = {'crops': [{'kind': 'scene', 'box': [400, 80, 500, 400]}], 'layout': {'pageType': 'catalog'}, 'labels': [{'id': 'approved', 'text': {'en': 'Approved'}}]}
    return payload, pages['catalog'], plan, pages['home'], tmp_path / 'data/page-cache'


def test_absent_cache_is_a_read_only_miss(cached_page):
    payload, _, _, home, directory = cached_page
    assert module().load_page_cache(payload, 'catalog', home) is None
    assert not directory.exists()


@pytest.mark.parametrize('plan_is_none', [False, True])
def test_private_exact_record_roundtrip_ignores_job_metadata_and_api_keys(cached_page, monkeypatch, plan_is_none):
    payload, html, plan, home, directory = cached_page
    plan = None if plan_is_none else plan
    module().save_page_cache(payload, 'catalog', html, plan, home)
    file = next(directory.glob('*.json'))
    assert stat.S_IMODE(directory.stat().st_mode) == 0o700
    assert stat.S_IMODE(file.stat().st_mode) == 0o600
    assert 'text-secret-never-persist' not in file.read_text() and 'image-secret-never-persist' not in file.read_text()
    changed = copy.deepcopy(payload)
    changed['id'] = 'next-job'
    changed['draft']['siteDesign'] = {'status': 'done', 'revision': 999}
    changed['_generatedAssets'] = {'catalog-0': 'internal-only'}
    monkeypatch.setenv('OPENAI_API_KEY', 'rotated-text-key')
    monkeypatch.setenv('IMAGE_API_KEY', 'rotated-image-key')
    record = module().load_page_cache(changed, 'catalog', home)
    assert record is not None
    assert set(record) == {'version', 'key', 'page', 'sourceJobId', 'html', 'htmlSha256', 'plan', 'planSha256'}
    assert record['sourceJobId'] == payload['id'] and record['page'] == 'catalog'
    assert record['html'] == html and record['plan'] == plan
    assert record['htmlSha256'] == hashlib.sha256(html.encode()).hexdigest()
    assert record['planSha256'] == hashlib.sha256(json.dumps(plan, sort_keys=True, ensure_ascii=False, separators=(',', ':'), allow_nan=False).encode()).hexdigest()


@pytest.mark.parametrize('change', ['current-design', 'other-design', 'reference', 'product', 'condition', 'copy', 'draft-extra', 'text-model', 'text-reasoning', 'text-base', 'image-model', 'image-base', 'home', 'page', 'version'])
def test_any_relevant_input_change_invalidates_cache(cached_page, monkeypatch, change):
    payload, html, plan, home, _ = cached_page
    module().save_page_cache(payload, 'catalog', html, plan, home)
    changed = copy.deepcopy(payload)
    page = 'catalog'
    if change == 'current-design': changed['designImages']['catalog'] += 'changed'
    elif change == 'other-design': changed['designImages']['about'] += 'changed'
    elif change == 'reference': changed['referenceAssets']['new-unselected'] = 'new original'
    elif change == 'product': changed['draft']['products'][0]['name'] += ' changed'
    elif change == 'condition': changed['draft']['products'][0]['source']['conditions']['keep'] += ' and lid'
    elif change == 'copy': changed['draft']['copy']['en']['headline'] += ' changed'
    elif change == 'draft-extra': changed['draft']['newConstraint'] = {'exact': False}
    elif change == 'text-model': monkeypatch.setenv('SITE_BUILDER_MODEL', 'gpt-5.4')
    elif change == 'text-reasoning': monkeypatch.setenv('SITE_BUILDER_MODEL', 'gpt-5.5 (high thinking)')
    elif change == 'text-base': monkeypatch.setenv('OPENAI_BASE_URL', 'https://other.example/v1')
    elif change == 'image-model': monkeypatch.setenv('IMAGE_MODEL', 'other-model')
    elif change == 'image-base': monkeypatch.setenv('IMAGE_API_BASE_URL', 'https://other.example/v1')
    elif change == 'home': home += '\n'
    elif change == 'page': page = 'about'
    else: monkeypatch.setattr(module(), 'CACHE_VERSION', 2)
    assert module().load_page_cache(changed, page, home) is None


def test_model_alias_and_base_trailing_slash_normalize_without_losing_reasoning(cached_page, monkeypatch):
    payload, html, plan, home, _ = cached_page
    module().save_page_cache(payload, 'catalog', html, plan, home)
    monkeypatch.setenv('SITE_BUILDER_MODEL', ' gpt-5.5 (low thinking) ')
    monkeypatch.setenv('OPENAI_BASE_URL', ' https://text.example/v1/ ')
    monkeypatch.setenv('IMAGE_API_BASE_URL', ' https://images.example/v1/ ')
    assert module().load_page_cache(payload, 'catalog', home) is not None


def test_home_has_no_dependency_on_its_own_html(cached_page):
    payload, _, plan, home, _ = cached_page
    module().save_page_cache(payload, 'home', home, plan)
    assert module().load_page_cache(payload, 'home', 'irrelevant inner-page-only home parameter') is not None


@pytest.mark.parametrize('corruption', ['json', 'html-hash', 'plan-hash', 'schema', 'source-id', 'page', 'key', 'version', 'plan-type', 'oversize'])
def test_corrupt_existing_cache_never_becomes_a_paid_miss(cached_page, corruption):
    payload, html, plan, home, directory = cached_page
    module().save_page_cache(payload, 'catalog', html, plan, home)
    file = next(directory.glob('*.json'))
    record = json.loads(file.read_text())
    if corruption == 'json': file.write_bytes(b'\xff')
    elif corruption == 'oversize': file.write_bytes(b'x' * (module().MAX_CACHE_BYTES + 1))
    else:
        if corruption == 'html-hash': record['html'] += 'tampered'
        elif corruption == 'plan-hash': record['plan']['crops'][0]['box'][0] = 100
        elif corruption == 'schema': record['extra'] = True
        elif corruption == 'source-id': record['sourceJobId'] = '../outside'
        elif corruption == 'page': record['page'] = 'detail'
        elif corruption == 'key': record['key'] = '0' * 64
        elif corruption == 'version': record['version'] = -1
        else: record['plan'] = []
        file.write_text(json.dumps(record))
    with pytest.raises(module().PageCacheError, match='Page cache.*(invalid|corrupt|budget)'):
        module().load_page_cache(payload, 'catalog', home)
    with pytest.raises(module().PageCacheError):
        module().save_page_cache(payload, 'catalog', html, plan, home)


@pytest.mark.parametrize('dangling', [False, True])
def test_symlink_cache_entry_is_never_read_or_treated_as_absent(cached_page, dangling):
    payload, html, plan, home, directory = cached_page
    module().save_page_cache(payload, 'catalog', html, plan, home)
    file = next(directory.glob('*.json'))
    target = directory.parent / 'other.json'
    file.rename(target)
    if dangling: target.unlink()
    file.symlink_to(target)
    with pytest.raises(module().PageCacheError, match='Page cache.*corrupt'):
        module().load_page_cache(payload, 'catalog', home)


@pytest.mark.parametrize('bad', ['html-type', 'html-size', 'plan-type', 'plan-size', 'plan-nan'])
def test_invalid_or_oversized_values_are_rejected_before_storage(cached_page, bad):
    payload, html, plan, home, directory = cached_page
    if bad == 'html-type': html = None
    elif bad == 'html-size': html = '🧴' * (module().MAX_HTML_BYTES // 4 + 1)
    elif bad == 'plan-type': plan = []
    elif bad == 'plan-size': plan = {'large': 'x' * module().MAX_PLAN_BYTES}
    else: plan = {'invalid': float('nan')}
    with pytest.raises(module().PageCacheError):
        module().save_page_cache(payload, 'catalog', html, plan, home)
    assert not directory.exists()


def test_atomic_concurrent_first_writer_is_never_overwritten(cached_page):
    payload, html, plan, home, directory = cached_page
    with ThreadPoolExecutor(max_workers=2) as pool:
        list(pool.map(lambda _: module().save_page_cache(payload, 'catalog', html, plan, home), range(2)))
    file = next(directory.glob('*.json'))
    original = file.read_bytes()
    module().save_page_cache({**payload, 'id': 'new-job'}, 'catalog', html + '\n', {**plan, 'updated': True}, home)
    assert file.read_bytes() == original
    assert len(list(directory.iterdir())) == 1
