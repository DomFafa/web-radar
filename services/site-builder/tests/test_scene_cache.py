import base64
import copy
import importlib
import io
import json
import stat
from concurrent.futures import ThreadPoolExecutor

import pytest
from PIL import Image


def module():
    return importlib.import_module('scene_cache')


def asset(color='red', format='WEBP'):
    output = io.BytesIO()
    Image.new('RGB', (120, 80), color).save(output, format=format)
    return 'data:image/' + format.lower() + ';base64,' + base64.b64encode(output.getvalue()).decode()


@pytest.fixture
def cached_scene(payload, monkeypatch, tmp_path):
    payload['referenceAssets'] = {'original': asset()}
    payload['draft']['siteDesign'] = {'status': 'building'}
    monkeypatch.setenv('SITE_BUILDER_DB', str(tmp_path / 'data/builds.sqlite3'))
    monkeypatch.setenv('IMAGE_MODEL', 'gpt-image-2.5-sunburst')
    monkeypatch.setenv('IMAGE_API_BASE_URL', 'https://images.example/v1')
    monkeypatch.setenv('IMAGE_API_KEY', 'secret-must-not-appear')
    plan = {'crops': [{'kind': 'logo', 'box': [0, 0, 30, 30]}, {'kind': 'scene', 'box': [400, 80, 500, 400]}, {'kind': 'scene', 'box': [0, 700, 400, 250]}], 'labels': [{'id': 'new-label'}], 'layout': {'pageType': 'home'}, 'catalogGroups': [{'productIds': ['second']}]}
    generated = {'home-1': asset(), 'home-2': asset('blue')}
    return payload, plan, generated, tmp_path / 'data/scene-cache'


def test_miss_does_not_create_storage(cached_scene):
    payload, _, _, directory = cached_scene
    assert module().load_scene_cache(payload, 'home') is None
    assert not directory.exists()


def test_same_design_new_job_and_html_metadata_reuse_private_verified_scenes(cached_scene, monkeypatch):
    payload, plan, generated, directory = cached_scene
    module().save_scene_cache(payload, 'home', plan, generated)
    file = next(directory.glob('*.json'))
    assert stat.S_IMODE(directory.stat().st_mode) == 0o700
    assert stat.S_IMODE(file.stat().st_mode) == 0o600
    assert 'secret-must-not-appear' not in file.read_text()
    next_payload = copy.deepcopy(payload)
    next_payload['id'] = 'another-job'
    next_payload['draft']['siteDesign'] = {'status': 'done', 'revision': 99}
    monkeypatch.setenv('IMAGE_API_KEY', 'rotated-key')
    record = module().load_scene_cache(next_payload, 'home')
    assert record is not None and record['sourceJobId'] == payload['id']
    assert [row['box'] for row in record['scenes']] == [row['box'] for row in plan['crops'][1:]]
    assert [row['dataUrl'] for row in record['scenes']] == list(generated.values())


@pytest.mark.parametrize('change', ['design', 'reference', 'product', 'condition', 'copy', 'draft-extra', 'model', 'base', 'page'])
def test_any_generation_input_change_misses(cached_scene, monkeypatch, change):
    payload, plan, generated, _ = cached_scene
    module().save_scene_cache(payload, 'home', plan, generated)
    changed = copy.deepcopy(payload)
    page = 'home'
    if change == 'design': changed['designImages']['home'] = asset('green')
    elif change == 'reference': changed['referenceAssets']['extra-unused-reference'] = asset('green')
    elif change == 'product': changed['draft']['products'][0]['name'] += ' changed'
    elif change == 'condition': changed['draft']['products'][0]['source']['conditions']['keep'] += ' unchanged labels'
    elif change == 'copy': changed['draft']['copy']['en']['headline'] += ' new'
    elif change == 'draft-extra': changed['draft']['futureConstraint'] = {'mustKeep': False}
    elif change == 'model': monkeypatch.setenv('IMAGE_MODEL', 'different-model')
    elif change == 'base': monkeypatch.setenv('IMAGE_API_BASE_URL', 'https://other.example/v1')
    else: page = 'catalog'
    assert module().load_scene_cache(changed, page) is None


def test_merge_reindexes_only_scenes_and_preserves_current_plan(cached_scene):
    payload, plan, generated, _ = cached_scene
    module().save_scene_cache(payload, 'home', plan, generated)
    record = module().load_scene_cache(payload, 'home')
    current = {**plan, 'composition': 'new page observations', 'crops': [{'kind': 'icon', 'box': [5, 5, 20, 20]}, {'kind': 'scene', 'box': [0, 0, 100, 100]}, {'kind': 'logo', 'box': [30, 0, 20, 20]}]}
    untouched = copy.deepcopy(current)
    merged, assets = module().merge_cached_scenes(current, record)
    assert current == untouched
    assert merged['crops'] == [{'kind': 'scene', 'box': row['box']} for row in plan['crops'][1:]] + [current['crops'][0], current['crops'][2]]
    assert {key: value for key, value in merged.items() if key != 'crops'} == {key: value for key, value in current.items() if key != 'crops'}
    assert assets == {'home-0': generated['home-1'], 'home-1': generated['home-2']}
    merged['crops'][0]['box'][0] = 123
    assert record['scenes'][0]['box'][0] == 400


@pytest.mark.parametrize('corruption', ['json', 'hash', 'pixels', 'oversize', 'source-id', 'box', 'version', 'key', 'page'])
def test_corrupt_hit_is_explicit_failure_not_a_cache_miss(cached_scene, corruption):
    payload, plan, generated, directory = cached_scene
    module().save_scene_cache(payload, 'home', plan, generated)
    file = next(directory.glob('*.json'))
    record = json.loads(file.read_text())
    if corruption == 'json': file.write_text('{')
    else:
        if corruption == 'hash': record['scenes'][0]['sha256'] = '0' * 64
        elif corruption == 'pixels':
            import hashlib
            record['scenes'][0]['dataUrl'] = 'data:image/webp;base64,' + base64.b64encode(b'not image pixels').decode()
            record['scenes'][0]['sha256'] = hashlib.sha256(b'not image pixels').hexdigest()
        elif corruption == 'oversize': record['scenes'][0]['dataUrl'] = 'data:image/webp;base64,' + 'A' * 400000
        elif corruption == 'source-id': record['sourceJobId'] = '../private'
        elif corruption == 'box': record['scenes'][0]['box'] = [0, 0, 1001, 100]
        elif corruption == 'version': record['version'] = -1
        elif corruption == 'key': record['key'] = '0' * 64
        else: record['page'] = 'catalog'
        file.write_text(json.dumps(record))
    with pytest.raises(module().SceneCacheError, match='cache.*(invalid|corrupt|budget)'):
        module().load_scene_cache(payload, 'home')


def test_existing_valid_entry_is_not_overwritten_even_concurrently(cached_scene):
    payload, plan, generated, directory = cached_scene
    with ThreadPoolExecutor(max_workers=2) as pool:
        list(pool.map(lambda _: module().save_scene_cache(payload, 'home', plan, generated), range(2)))
    file = next(directory.glob('*.json'))
    original = file.read_bytes()
    module().save_scene_cache({**payload, 'id': 'second-job'}, 'home', plan, {key: asset('yellow') for key in generated})
    assert file.read_bytes() == original
    assert len(list(directory.iterdir())) == 1


@pytest.mark.parametrize('invalid', ['missing', 'extra', 'png', 'none'])
def test_only_complete_successful_scene_results_are_saved(cached_scene, invalid):
    payload, plan, generated, directory = cached_scene
    if invalid == 'missing': generated.pop('home-2')
    elif invalid == 'extra': generated['home-0'] = asset()
    elif invalid == 'png': generated['home-1'] = asset(format='PNG')
    else: generated = {}
    with pytest.raises(module().SceneCacheError):
        module().save_scene_cache(payload, 'home', plan, generated)
    assert not directory.exists()


def test_no_scenes_does_not_create_entry(cached_scene):
    payload, plan, _, directory = cached_scene
    plan['crops'] = [plan['crops'][0]]
    module().save_scene_cache(payload, 'home', plan, {})
    assert not directory.exists()


def test_version_change_misses_and_file_budget_corruption_never_does(cached_scene, monkeypatch):
    payload, plan, generated, _ = cached_scene
    module().save_scene_cache(payload, 'home', plan, generated)
    monkeypatch.setattr(module(), 'CACHE_VERSION', 2)
    assert module().load_scene_cache(payload, 'home') is None
    monkeypatch.setattr(module(), 'CACHE_VERSION', 1)
    monkeypatch.setattr(module(), 'MAX_CACHE_BYTES', 100)
    with pytest.raises(module().SceneCacheError, match='cache.*corrupt'):
        module().load_scene_cache(payload, 'home')


def test_merge_rejects_total_scene_and_fresh_crop_area_above_page_budget(cached_scene):
    payload, plan, generated, _ = cached_scene
    plan['crops'][1]['box'] = [0, 0, 900, 500]
    plan['crops'][2]['box'] = [0, 600, 600, 300]
    module().save_scene_cache(payload, 'home', plan, generated)
    record = module().load_scene_cache(payload, 'home')
    # The cached scene area is .63 and the fresh logo adds .04; each
    # source plan is valid, but their combined area exceeds .65.
    current = {**plan, 'crops': [{'kind': 'logo', 'box': [0, 0, 200, 200]}]}
    with pytest.raises(module().SceneCacheError, match='area budget'):
        module().merge_cached_scenes(current, record)
    assert module().load_scene_cache(payload, 'home') == record
    # Count identical boxes only once, including the exact .65 boundary.
    current['crops'] = [{'kind': kind, 'box': [0, 0, 200, 100]} for kind in ('logo', 'icon')]
    merged, assets = module().merge_cached_scenes(current, record)
    assert len(merged['crops']) == 4 and set(assets) == {'home-0', 'home-1'}
