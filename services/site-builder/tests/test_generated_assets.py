import asyncio
import base64
import copy
import importlib.util
import io
import json
from email.parser import BytesParser
from email.policy import default
from typing import Any

import httpx
import pytest
from PIL import Image

HTTP_CLIENT = httpx.AsyncClient


def module():
    assert importlib.util.find_spec('generated_assets'), 'Standalone photographic asset generation is not implemented'
    import generated_assets
    return generated_assets


def image_bytes(size=(1000, 800), format='PNG'):
    output = io.BytesIO()
    Image.new('RGB', size, '#9b6f51').save(output, format=format)
    return output.getvalue()


def data_url(raw=None, mime='png'):
    return f'data:image/{mime};base64,' + base64.b64encode(raw or image_bytes()).decode()


@pytest.fixture
def scene(payload, monkeypatch, tmp_path):
    payload['designImages']['home'] = data_url()
    payload['referenceAssets'] = {
        product['imageAssetId']: data_url(image_bytes((80, 120)))
        for product in payload['draft']['products']
    }
    monkeypatch.setenv('SITE_BUILDER_DB', str(tmp_path / 'builds.sqlite3'))
    monkeypatch.setenv('IMAGE_API_KEY', 'image-only-secret')
    monkeypatch.setenv('IMAGE_API_BASE_URL', 'https://images.example/v1')
    monkeypatch.setenv('IMAGE_MODEL', 'gpt-image-2.5-sunburst')
    monkeypatch.delenv('PROVIDER_MEDIA_ORIGINS', raising=False)
    async def vision(stage, *args, **kwargs):
        return composition(1) if stage == 'composition' else review(1)
    monkeypatch.setattr(module(), '_vision_json', vision, raising=False)
    return payload, {'crops': [{'kind': 'scene', 'box': [500, 125, 500, 375]}], 'composition': 'Warm product photography.'}


def fake_http(monkeypatch, handler):
    monkeypatch.setattr(module().httpx, 'AsyncClient', lambda **kwargs: HTTP_CLIENT(transport=httpx.MockTransport(handler), **kwargs))


def success_response(raw=None):
    return httpx.Response(200, json={'data': [{'b64_json': base64.b64encode(raw or image_bytes((1500, 900))).decode()}]})


def composition(count):
    return {'objects': [{'kind': 'primary_product', 'referenceImage': 2, 'description': f'Bottle {index + 1} with its real lid and label', 'position': f'Position {index + 1} from left'} for index in range(count)], 'composition': 'Physical bottles stand side by side on a tabletop.', 'packaging': 'One retail box behind the bottles; its printed bottle does not count as a physical bottle.'}


def review(count, *, identity=True, layout=True, complete=True, ui=False, issues=None):
    return {'objects': composition(count)['objects'], 'matchesIdentity': identity, 'matchesComposition': layout, 'completeProducts': complete, 'hasWebsiteText': ui, 'issues': issues or []}


def test_three_product_audit_has_no_conflicting_example_count(scene, monkeypatch):
    payload, _ = scene
    instructions = []
    async def vision(stage, prompt, *args):
        instructions.append(prompt)
        return composition(3) if stage == 'composition' else review(3)
    monkeypatch.setattr(module(), '_vision_json', vision)
    originals = module()._originals(payload)
    source = image_bytes()
    photos = [data_url(raw, mime) for _, raw, mime in originals]
    observed = asyncio.run(module()._inspect_composition(source, originals, photos))
    assert observed['physicalProductCount'] == 3
    assert all('four real bottles' not in text.lower() and 'four primary_product' not in text.lower() for text in instructions)


def test_no_scene_needs_neither_provider_nor_private_storage(monkeypatch, tmp_path):
    for key in ('IMAGE_API_KEY', 'IMAGE_API_BASE_URL', 'IMAGE_MODEL'):
        monkeypatch.delenv(key, raising=False)
    monkeypatch.setenv('SITE_BUILDER_DB', str(tmp_path / 'builds.sqlite3'))
    for plan in (None, {'crops': []}, {'crops': [{'kind': 'logo', 'box': [0, 0, 100, 100]}]}):
        assert asyncio.run(module().generate_scene_assets({}, 'home', plan)) == {}
    assert not list(tmp_path.iterdir())


def test_uses_dedicated_key_originals_and_ui_free_bounded_prompt(scene, monkeypatch, tmp_path):
    payload, plan = scene
    payload['draft']['products'][0]['description'] = 'Preserve the physical product dimensions and all printed labels. ' * 10000
    payload['draft']['copy']['en']['headline'] = 'WEBSITE_HEADLINE_MUST_NOT_BE_RASTERIZED'
    monkeypatch.setenv('OPENAI_API_KEY', 'text-secret-never-send')
    monkeypatch.setenv('TEXT_API_KEY', 'other-text-secret')
    requests = []

    def handler(request):
        requests.append(request)
        assert str(request.url) == 'https://images.example/v1/images/edits'
        assert request.headers['Authorization'] == 'Bearer image-only-secret'
        body = request.read()
        fields = list(BytesParser(policy=default).parsebytes(b'Content-Type: ' + request.headers['content-type'].encode() + b'\r\n\r\n' + body).iter_parts())
        values = {part.get_param('name', header='content-disposition'): part.get_payload(decode=True) for part in fields}
        prompt_bytes = values['prompt']
        assert isinstance(prompt_bytes, bytes)
        prompt = prompt_bytes.decode()
        assert len(prompt) <= 28000
        assert 'no website' in prompt.lower() and 'headlines' in prompt.lower() and 'buttons' in prompt.lower()
        assert 'physical packaging' in prompt.lower() and '5:3' in prompt
        assert 'WEBSITE_HEADLINE_MUST_NOT_BE_RASTERIZED' not in prompt
        assert values['model'] == b'gpt-image-2.5-sunburst' and values['n'] == b'1'
        assert values['size'] == b'1536x928'
        assert len([part for part in fields if part.get_param('name', header='content-disposition') == 'image[]']) == 3
        marker = tmp_path / 'evidence/test-job-1/assets/home-0/status.json'
        assert json.loads(marker.read_text())['state'] == 'submitted'
        return success_response()

    fake_http(monkeypatch, handler)
    result = asyncio.run(module().generate_scene_assets(payload, 'home', plan))
    assert list(result) == ['home-0'] and len(requests) == 1
    raw = base64.b64decode(result['home-0'].split(',')[1])
    with Image.open(io.BytesIO(raw)) as image:
        assert image.format == 'WEBP' and image.size == (1500, 900)
    assert len(raw) <= 220000
    directory = tmp_path / 'evidence/test-job-1/assets/home-0'
    status = json.loads((directory / 'status.json').read_text())
    assert status['state'] == 'completed' and len(status['fingerprint']) == 64
    assert (directory / 'source.webp').is_file() and (directory / 'prompt.txt').is_file()
    for path in directory.rglob('*'):
        assert path.stat().st_mode & 0o777 == (0o700 if path.is_dir() else 0o600)
        if path.is_file():
            assert b'image-only-secret' not in path.read_bytes() and b'text-secret' not in path.read_bytes()
    assert directory.stat().st_mode & 0o777 == 0o700


def test_missing_image_key_never_falls_back_to_text_key(scene, monkeypatch):
    payload, plan = scene
    monkeypatch.delenv('IMAGE_API_KEY')
    monkeypatch.setenv('OPENAI_API_KEY', 'text-secret')
    fake_http(monkeypatch, lambda request: pytest.fail('An image request must require its own key'))
    with pytest.raises(module().GeneratedAssetError, match='dedicated'):
        asyncio.run(module().generate_scene_assets(payload, 'home', plan))


def test_completed_asset_is_verified_and_reused_without_another_paid_request(scene, monkeypatch, tmp_path):
    payload, plan = scene
    requests = []
    fake_http(monkeypatch, lambda request: requests.append(request) or success_response())
    first = asyncio.run(module().generate_scene_assets(payload, 'home', plan))
    monkeypatch.delenv('IMAGE_API_KEY')
    assert asyncio.run(module().generate_scene_assets(payload, 'home', plan)) == first
    assert len(requests) == 1
    (tmp_path / 'evidence/test-job-1/assets/home-0/generated.webp').write_bytes(b'corrupted')
    with pytest.raises(module().GeneratedAssetError, match='saved|cached'):
        asyncio.run(module().generate_scene_assets(payload, 'home', plan))
    assert len(requests) == 1


@pytest.mark.parametrize('failure', ['timeout', 'http', 'invalid'])
def test_failed_or_uncertain_attempt_is_safe_and_never_repeated(scene, monkeypatch, tmp_path, failure):
    payload, plan = scene
    requests = []
    def handler(request):
        requests.append(request)
        if failure == 'timeout':
            raise httpx.ReadTimeout('upstream image-only-secret https://private.test/token')
        if failure == 'http':
            return httpx.Response(401, text='image-only-secret private upstream body')
        return httpx.Response(200, text='image-only-secret malformed response')
    fake_http(monkeypatch, handler)
    for _ in range(2):
        with pytest.raises(module().GeneratedAssetError) as captured:
            asyncio.run(module().generate_scene_assets(payload, 'home', plan))
        assert 'secret' not in str(captured.value) and 'private.test' not in str(captured.value)
    assert len(requests) == 1
    status = json.loads((tmp_path / 'evidence/test-job-1/assets/home-0/status.json').read_text())
    assert status['state'] == ('failed' if failure == 'http' else 'uncertain')


def test_submitted_marker_surviving_restart_blocks_repeat(scene, monkeypatch, tmp_path):
    payload, plan = scene
    fake_http(monkeypatch, lambda request: success_response())
    asyncio.run(module().generate_scene_assets(payload, 'home', plan))
    marker = tmp_path / 'evidence/test-job-1/assets/home-0/status.json'
    status = json.loads(marker.read_text())
    status['state'] = 'submitted'
    marker.write_text(json.dumps(status))
    fake_http(monkeypatch, lambda request: pytest.fail('Submitted generation must not be repeated after restart'))
    with pytest.raises(module().GeneratedAssetError, match='already|previous'):
        asyncio.run(module().generate_scene_assets(payload, 'home', plan))


@pytest.mark.parametrize('field,value', [('id', '../escape'), ('page', '../home'), ('crop', [900, 0, 200, 300]), ('crop', [0, 0, 1000, 1000]), ('crop', [0, 0, True, 100])])
def test_rejects_unsafe_identifiers_and_out_of_bounds_crops_before_network(scene, monkeypatch, field, value):
    payload, plan = scene
    page = 'home'
    if field == 'id':
        payload['id'] = value
    elif field == 'page':
        page = value
    else:
        plan['crops'][0]['box'] = value
    fake_http(monkeypatch, lambda request: pytest.fail('Invalid input must not contact the provider'))
    with pytest.raises(module().GeneratedAssetError):
        asyncio.run(module().generate_scene_assets(payload, page, plan))


@pytest.mark.parametrize('bad', ['https://127.0.0.1/private.png', 'data:image/png;base64,YmFk', 'data:image/jpeg;base64,' + base64.b64encode(image_bytes()).decode()])
def test_original_reference_requires_valid_inline_pixels(scene, monkeypatch, bad):
    payload, plan = scene
    primary = payload['draft']['products'][0]['imageAssetId']
    payload['referenceAssets'][primary] = bad
    fake_http(monkeypatch, lambda request: pytest.fail('Invalid reference must not contact the provider'))
    with pytest.raises(module().GeneratedAssetError):
        asyncio.run(module().generate_scene_assets(payload, 'home', plan))


def test_unknown_reference_id_is_not_sent(scene, monkeypatch):
    payload, plan = scene
    payload['referenceAssets']['unapproved'] = data_url()
    fake_http(monkeypatch, lambda request: pytest.fail('Unapproved references must not be sent'))
    with pytest.raises(module().GeneratedAssetError):
        asyncio.run(module().generate_scene_assets(payload, 'home', plan))


@pytest.mark.parametrize('raw', [b'<svg>fake</svg>', image_bytes((6401, 6250))])
def test_invalid_or_oversized_generated_pixels_are_rejected(scene, monkeypatch, raw):
    payload, plan = scene
    fake_http(monkeypatch, lambda request: success_response(raw))
    with pytest.raises(module().GeneratedAssetError):
        asyncio.run(module().generate_scene_assets(payload, 'home', plan))


@pytest.mark.parametrize('url', ['http://media.example/out.png', 'https://user:pass@media.example/out.png', 'https://evil.example/out.png', 'https://127.0.0.1/out.png', 'https://[::1]/out.png'])
def test_provider_urls_cannot_fetch_private_or_unapproved_destinations(scene, monkeypatch, url):
    payload, plan = scene
    monkeypatch.setenv('PROVIDER_MEDIA_ORIGINS', 'https://media.example,https://127.0.0.1,https://[::1]')
    requests = []
    def handler(request):
        requests.append(request)
        assert request.method == 'POST', 'Unsafe result URL must never be downloaded'
        return httpx.Response(200, json={'data': [{'url': url}]})
    fake_http(monkeypatch, handler)
    with pytest.raises(module().GeneratedAssetError):
        asyncio.run(module().generate_scene_assets(payload, 'home', plan))
    assert len(requests) == 1


def test_allowlisted_hostname_resolving_to_private_ip_is_rejected(scene, monkeypatch):
    payload, plan = scene
    monkeypatch.setenv('PROVIDER_MEDIA_ORIGINS', 'https://media.example')
    monkeypatch.setattr(module().socket, 'getaddrinfo', lambda *args, **kwargs: [(2, 1, 6, '', ('127.0.0.1', 443))])
    def handler(request):
        assert request.method == 'POST'
        return httpx.Response(200, json={'data': [{'url': 'https://media.example/out.png'}]})
    fake_http(monkeypatch, handler)
    with pytest.raises(module().GeneratedAssetError):
        asyncio.run(module().generate_scene_assets(payload, 'home', plan))


def test_allowlisted_public_download_is_pinned_and_does_not_forward_provider_key(scene, monkeypatch):
    payload, plan = scene
    monkeypatch.setenv('PROVIDER_MEDIA_ORIGINS', 'https://media.example')
    monkeypatch.setattr(module().socket, 'getaddrinfo', lambda *args, **kwargs: [(2, 1, 6, '', ('93.184.216.34', 443))])
    def handler(request):
        if request.method == 'POST':
            return httpx.Response(200, json={'data': [{'url': 'https://media.example/out.png?signature=private'}]})
        assert request.url.host == '93.184.216.34' and request.headers['host'] == 'media.example'
        assert request.extensions['sni_hostname'] == 'media.example'
        assert 'authorization' not in request.headers
        return httpx.Response(200, content=image_bytes((900, 1500)), headers={'Content-Type': 'image/png'})
    fake_http(monkeypatch, handler)
    result = asyncio.run(module().generate_scene_assets(payload, 'home', plan))
    with Image.open(io.BytesIO(base64.b64decode(result['home-0'].split(',')[1]))) as image:
        assert abs(image.width / image.height - 0.6) < 0.002


def test_limits_originals_to_eight_with_primary_reference_first(scene, monkeypatch):
    payload, plan = scene
    product = payload['draft']['products'][0]
    payload['draft']['products'] = [{**copy.deepcopy(product), 'id': f'product-{i}', 'imageAssetId': f'asset-{i}', 'name': f'Physical product {i}'} for i in range(10)]
    payload['draft']['primaryProductId'] = 'product-9'
    payload['referenceAssets'] = {f'asset-{i}': data_url(image_bytes((80 + i, 120))) for i in range(10)}
    def handler(request):
        fields = list(BytesParser(policy=default).parsebytes(b'Content-Type: ' + request.headers['content-type'].encode() + b'\r\n\r\n' + request.read()).iter_parts())
        references = [part.get_payload(decode=True) for part in fields if part.get_param('name', header='content-disposition') == 'image[]']
        assert len(references) == 9
        assert references[1] == image_bytes((89, 120))
        return success_response()
    fake_http(monkeypatch, handler)
    assert 'home-0' in asyncio.run(module().generate_scene_assets(payload, 'home', plan))


def test_request_and_streaming_response_byte_limits_are_enforced(scene, monkeypatch):
    payload, plan = scene
    monkeypatch.setattr(module(), 'MAX_REQUEST_BYTES', 100)
    fake_http(monkeypatch, lambda request: pytest.fail('Oversized input must not submit a paid request'))
    with pytest.raises(module().GeneratedAssetError, match='budget'):
        asyncio.run(module().generate_scene_assets(payload, 'home', plan))
    monkeypatch.setattr(module(), 'MAX_REQUEST_BYTES', 45 * 1024 * 1024)
    monkeypatch.setattr(module(), 'MAX_RESPONSE_BYTES', 100)
    fake_http(monkeypatch, lambda request: success_response())
    with pytest.raises(module().GeneratedAssetError, match='size limit'):
        asyncio.run(module().generate_scene_assets(payload, 'home', plan))


def test_changed_inputs_and_corrupt_status_never_generate_again(scene, monkeypatch, tmp_path):
    payload, plan = scene
    fake_http(monkeypatch, lambda request: success_response())
    asyncio.run(module().generate_scene_assets(payload, 'home', plan))
    fake_http(monkeypatch, lambda request: pytest.fail('Existing attempt must not be replaced with a paid request'))
    changed = {**plan, 'composition': 'Changed photographic arrangement'}
    with pytest.raises(module().GeneratedAssetError, match='different'):
        asyncio.run(module().generate_scene_assets(payload, 'home', changed))
    marker = tmp_path / 'evidence/test-job-1/assets/home-0/status.json'
    marker.write_text('[]')
    with pytest.raises(module().GeneratedAssetError, match='saved'):
        asyncio.run(module().generate_scene_assets(payload, 'home', plan))


def test_concurrent_calls_cannot_repeat_a_paid_scene_attempt(scene, monkeypatch):
    payload, plan = scene
    requests = []
    async def handler(request):
        requests.append(request)
        await asyncio.sleep(.02)
        return success_response()
    fake_http(monkeypatch, handler)
    async def run():
        return await asyncio.gather(*(module().generate_scene_assets(payload, 'home', plan) for _ in range(2)), return_exceptions=True)
    results = asyncio.run(run())
    assert len(requests) == 1
    assert sum(isinstance(result, dict) for result in results) == 1
    assert sum(isinstance(result, module().GeneratedAssetError) for result in results) == 1


@pytest.mark.parametrize('format', ['PNG', 'JPEG', 'WEBP'])
def test_supported_formats_are_normalized_without_cropping(scene, monkeypatch, format):
    payload, plan = scene
    fake_http(monkeypatch, lambda request: success_response(image_bytes((2000, 800), format)))
    result = asyncio.run(module().generate_scene_assets(payload, 'home', plan))
    with Image.open(io.BytesIO(base64.b64decode(result['home-0'].split(',')[1]))) as image:
        assert image.format == 'WEBP'
        assert abs(image.width / image.height - 2.5) < .002


def test_media_redirect_does_not_follow_private_location(scene, monkeypatch):
    payload, plan = scene
    monkeypatch.setenv('PROVIDER_MEDIA_ORIGINS', 'https://media.example')
    monkeypatch.setattr(module().socket, 'getaddrinfo', lambda *args, **kwargs: [(2, 1, 6, '', ('93.184.216.34', 443))])
    requests = []
    def handler(request):
        requests.append(request)
        assert request.url.host != '127.0.0.1'
        if request.method == 'POST':
            return httpx.Response(200, json={'data': [{'url': 'https://media.example/out.png'}]})
        return httpx.Response(302, headers={'Location': 'https://127.0.0.1/private'})
    fake_http(monkeypatch, handler)
    with pytest.raises(module().GeneratedAssetError):
        asyncio.run(module().generate_scene_assets(payload, 'home', plan))
    assert len(requests) == 2


def prompt_facts(request) -> dict[str, Any]:
    fields = list(BytesParser(policy=default).parsebytes(b'Content-Type: ' + request.headers['content-type'].encode() + b'\r\n\r\n' + request.read()).iter_parts())
    prompt_part = next(part for part in fields if part.get_param('name', header='content-disposition') == 'prompt')
    raw = prompt_part.get_payload(decode=True)
    assert isinstance(raw, bytes)
    prompt = raw.decode()
    assert len(prompt) <= 28000
    facts = json.loads(prompt.split('Approved factual data (JSON):\n', 1)[1])
    if facts.get('encoding') == 'repeated-text-v1':
        marker, fragments = facts['marker'], facts['fragments']
        def decode(value: Any) -> Any:
            if isinstance(value, dict):
                if set(value) == {marker}:
                    return ''.join(fragments[item] if type(item) is int else item for item in value[marker])
                return {key: decode(item) for key, item in value.items()}
            if isinstance(value, list):
                return [decode(item) for item in value]
            return value
        facts = decode(facts['value'])
    return facts


def test_preserves_full_facts_keep_avoid_composition_and_condition_associations(scene, monkeypatch):
    payload, plan = scene
    first, second = payload['draft']['products']
    first['description'] = 'Physical geometry details ' * 30 + 'EXACT_FINAL_DESCRIPTION'
    shared = {'keep': ['All 5 bottles', 'Never remove packaging labels'], 'allow': False, 'quantity': 5}
    first['source']['conditions'] = {'approved': shared, 'unique': 'first-only finish', 'source': 'raw-history-excluded'}
    second['source'] = {'conditions': {'approved': copy.deepcopy(shared), 'unique': 'second-only finish'}}
    payload['draft']['consultation'] = {'brief': {'keep': [f'Complete kept condition {i} ' + 'x' * 260 for i in range(14)], 'avoid': ['No unsupported logos ' + 'y' * 300]}}
    plan['composition'] = 'Original approved composition ' * 145 + 'FINAL_COMPOSITION_EDGE'
    assert module()._source_context(plan, module()._originals(payload), payload['draft'])['composition'] == plan['composition']
    def handler(request):
        facts = prompt_facts(request)
        assert [row['id'] for row in facts['products']] == ['a/b ?', 'second']
        assert [row['name'] for row in facts['products']] == [first['name'], second['name']]
        assert facts['products'][0]['description'] == first['description']
        assert facts['keep'] == payload['draft']['consultation']['brief']['keep']
        assert facts['avoid'] == payload['draft']['consultation']['brief']['avoid']
        assert 'composition' not in facts
        assert facts['sceneComposition']['composition'] == composition(1)['composition']
        assert facts['sourceConditions'] == [
            {'name': 'approved', 'value': shared, 'productIndices': [0, 1], 'referenceImages': [2, 3]},
            {'name': 'unique', 'value': 'first-only finish', 'productIndices': [0], 'referenceImages': [2]},
            {'name': 'unique', 'value': 'second-only finish', 'productIndices': [1], 'referenceImages': [3]},
        ]
        return success_response()
    fake_http(monkeypatch, handler)
    assert 'home-0' in asyncio.run(module().generate_scene_assets(payload, 'home', plan))


def test_lossless_dictionary_reconstructs_long_shared_source_and_marker_collisions(scene, monkeypatch):
    payload, plan = scene
    repeated = 'Preserve every original physical packaging label, product count, and accepted handle geometry.\n'
    shared = {'textParts': 'Existing source key must not be mistaken for an encoding marker.', 'requirements': repeated * 650 + 'Unique final prohibition: do not add a lid.'}
    for product in payload['draft']['products']:
        product['source'] = {'conditions': {'accepted': copy.deepcopy(shared)}}
    def handler(request):
        facts = prompt_facts(request)
        group = facts['sourceConditions'][0]
        assert group['name'] == 'accepted' and group['value'] == shared
        assert group['referenceImages'] == [2, 3] and group['productIndices'] == [0, 1]
        return success_response()
    fake_http(monkeypatch, handler)
    assert 'home-0' in asyncio.run(module().generate_scene_assets(payload, 'home', plan))


@pytest.mark.parametrize('condition', ['z' * 29000, '🧴' * 14000])
def test_uncompressible_accepted_conditions_fail_before_any_paid_request(scene, monkeypatch, tmp_path, condition):
    payload, plan = scene
    payload['draft']['products'][0]['source'] = {'conditions': {'keep': 'Exact unique accepted requirement ' + condition + ' final negation must survive'}}
    fake_http(monkeypatch, lambda request: pytest.fail('Over-budget exact facts must fail before image or text provider calls'))
    with pytest.raises(module().GeneratedAssetError, match='prompt budget'):
        asyncio.run(module().generate_scene_assets(payload, 'home', plan))
    assert not (tmp_path / 'evidence').exists()


def test_shared_original_image_preserves_each_product_variant_condition(scene, monkeypatch):
    payload, plan = scene
    first, second = payload['draft']['products']
    second['imageAssetId'] = first['imageAssetId']
    payload['referenceAssets'] = {first['imageAssetId']: payload['referenceAssets'][first['imageAssetId']]}
    second['source'] = {'conditions': {'keep': 'Two separate lids'}}
    def handler(request):
        facts = prompt_facts(request)
        assert [(row['id'], row['referenceImage']) for row in facts['products']] == [('a/b ?', 2), ('second', 2)]
        assert facts['sourceConditions'][-1] == {'name': 'keep', 'value': 'Two separate lids', 'productIndices': [1], 'referenceImages': [2]}
        return success_response()
    fake_http(monkeypatch, handler)
    assert 'home-0' in asyncio.run(module().generate_scene_assets(payload, 'home', plan))


def test_two_pages_generate_independently_under_global_builder_concurrency(scene, monkeypatch, tmp_path):
    payload, plan = scene
    payload['designImages']['about'] = payload['designImages']['home']
    calls = []
    async def handler(request):
        calls.append(request)
        await asyncio.sleep(.02)
        return success_response()
    fake_http(monkeypatch, handler)
    async def run():
        return await asyncio.gather(*(module().generate_scene_assets(payload, page, plan) for page in ('home', 'about')))
    result = asyncio.run(run())
    assert list(result[0]) == ['home-0'] and list(result[1]) == ['about-0']
    assert len(calls) == 2
    for page in ('home', 'about'):
        status = json.loads((tmp_path / f'evidence/test-job-1/assets/{page}-0/status.json').read_text())
        assert status['state'] == 'completed'




def test_correct_scene_passes_one_image_attempt_and_cache_skips_all_audits(scene, monkeypatch, tmp_path):
    payload, plan = scene
    audits, requests = [], []
    async def vision(stage, instructions, images, schema):
        audits.append(stage)
        return composition(3) if stage == 'composition' else review(3)
    monkeypatch.setattr(module(), '_vision_json', vision, raising=False)
    fake_http(monkeypatch, lambda request: requests.append(request) or success_response())
    result = asyncio.run(module().generate_scene_assets(payload, 'home', plan))
    assert audits == ['composition'] and len(requests) == 1
    monkeypatch.delenv('IMAGE_API_KEY')
    monkeypatch.delenv('OPENAI_API_KEY', raising=False)
    assert asyncio.run(module().generate_scene_assets(payload, 'home', plan)) == result
    assert audits == ['composition'] and len(requests) == 1


def test_uncertain_image_never_triggers_semantic_correction(scene, monkeypatch):
    payload, plan = scene
    audits, requests = [], []
    async def vision(stage, instructions, images, schema):
        audits.append(stage)
        return composition(3)
    monkeypatch.setattr(module(), '_vision_json', vision, raising=False)
    def handler(request):
        requests.append(request)
        raise httpx.ReadTimeout('private-image-key-do-not-log')
    fake_http(monkeypatch, handler)
    with pytest.raises(module().GeneratedAssetError):
        asyncio.run(module().generate_scene_assets(payload, 'home', plan))
    assert audits == ['composition'] and len(requests) == 1






def test_product_shot_layout_is_scoped_without_losing_exact_conditions(scene, monkeypatch):
    payload, plan = scene
    condition = 'Commercial product render, clean white background. One sales version. No extra products. Composition: Bottle centered beside one box.'
    payload['draft']['products'][0]['source']['conditions']['imagePrompt'] = condition
    def handler(request):
        facts = prompt_facts(request)
        assert next(group['value'] for group in facts['sourceConditions'] if group['name'] == 'imagePrompt') == condition
        text = request.read().decode(errors='ignore')
        assert 'original product shot' in text.lower()
        assert 'not global scene count/layout/background' in text.lower()
        assert 'printed' in text.lower()
        return success_response()
    fake_http(monkeypatch, handler)
    assert 'home-0' in asyncio.run(module().generate_scene_assets(payload, 'home', plan))


def test_invalid_composition_audit_stops_before_image_spend(scene, monkeypatch):
    payload, plan = scene
    async def vision(stage, instructions, images, schema):
        return {**composition(3), 'physicalProductCount': 1}
    monkeypatch.setattr(module(), '_vision_json', vision, raising=False)
    fake_http(monkeypatch, lambda request: pytest.fail('Contradictory source-count audit must not spend on image generation'))
    with pytest.raises(module().GeneratedAssetError, match='composition'):
        asyncio.run(module().generate_scene_assets(payload, 'home', plan))




def test_vision_boundary_uses_builder_responses_config_and_dedicated_text_key(monkeypatch):
    monkeypatch.setenv('OPENAI_API_KEY', 'builder-text-key')
    monkeypatch.setenv('OPENAI_BASE_URL', 'https://builder.example/v1')
    monkeypatch.setenv('SITE_BUILDER_MODEL', 'gpt-5.5 (xhigh thinking)')
    monkeypatch.setenv('IMAGE_API_KEY', 'image-only-key')
    requests = []
    images = [data_url(), data_url(image_bytes((80, 120)))]
    def handler(request):
        requests.append(request)
        assert str(request.url) == 'https://builder.example/v1/responses'
        assert request.headers['authorization'] == 'Bearer builder-text-key'
        body = json.loads(request.read())
        assert body['model'] == 'gpt-5.5' and body['store'] is False
        assert body['text']['format']['strict'] is True
        assert 0 < body['max_output_tokens'] <= 3000
        assert body['reasoning'] == {'effort': 'low'}
        assert [part['image_url'] for part in body['input'][0]['content'] if part['type'] == 'input_image'] == images
        assert request.extensions['timeout']['read'] <= 45
        return httpx.Response(200, json={'status': 'completed', 'output': [{'type': 'message', 'content': [{'type': 'output_text', 'text': json.dumps(composition(3))}]}]})
    fake_http(monkeypatch, handler)
    result = asyncio.run(module()._vision_json('composition', 'Count actual physical bottles.', images, module().COMPOSITION_SCHEMA))
    assert result == composition(3) and len(requests) == 1


@pytest.mark.parametrize('failure', ['timeout', 'http', 'incomplete', 'invalid'])
def test_vision_boundary_errors_are_secret_safe_and_not_retried(monkeypatch, failure):
    monkeypatch.setenv('OPENAI_API_KEY', 'builder-text-secret')
    monkeypatch.setenv('OPENAI_BASE_URL', 'https://builder.example/v1')
    requests = []
    def handler(request):
        requests.append(request)
        if failure == 'timeout':
            raise httpx.ReadTimeout('builder-text-secret private upstream')
        if failure == 'http':
            return httpx.Response(503, text='builder-text-secret private upstream')
        if failure == 'incomplete':
            return httpx.Response(200, json={'status': 'incomplete', 'output': []})
        return httpx.Response(200, json={'status': 'completed', 'output': [{'type': 'message', 'content': [{'type': 'output_text', 'text': 'builder-text-secret invalid'}]}]})
    fake_http(monkeypatch, handler)
    with pytest.raises(module().GeneratedAssetError) as captured:
        asyncio.run(module()._vision_json('composition', 'Inspect.', [data_url()], module().COMPOSITION_SCHEMA))
    assert 'secret' not in str(captured.value) and len(requests) == 1


def test_audit_cannot_use_image_or_other_text_key_when_builder_key_is_missing(monkeypatch):
    monkeypatch.delenv('OPENAI_API_KEY', raising=False)
    monkeypatch.setenv('IMAGE_API_KEY', 'image-key')
    monkeypatch.setenv('TEXT_API_KEY', 'other-text-key')
    fake_http(monkeypatch, lambda request: pytest.fail('Audit must use the builder configured key'))
    with pytest.raises(module().GeneratedAssetError, match='OPENAI_API_KEY'):
        asyncio.run(module()._vision_json('composition', 'Inspect.', [data_url()], module().COMPOSITION_SCHEMA))




def test_catalog_real_four_bottles_box_and_print_cannot_become_five_products(scene, monkeypatch, tmp_path):
    payload, plan = scene
    # Frozen from catalog-0 production evidence: the old response claimed five,
    # but its fifth entry explicitly described packaging artwork, not a bottle.
    descriptions = [
        ('Tall brushed stainless bottle with black-and-blue sport lid, blue front latch and band, rear carry loop; black time markers down the front and senseng logo near base.', 'Front row, left of center, standing immediately to the right of the box; tallest visible bottle.'),
        ('Brushed stainless bottle with dark teal flip/handle lid and black square front button; plain front with small senseng logo near the base.', 'Front row center, slightly behind and to the right of the blue-lid bottle.'),
        ('Shorter brushed stainless active bottle with black screw lid, ribbed cap band and rounded black carry handle; small senseng logo near base.', 'Front row center-right, standing between the teal-handle bottle and lime-spout bottle.'),
        ('Short brushed stainless active bottle with black autospout lid, angled carry loop, and bright lime green raised spout/inner accent; senseng logo near base.', 'Front row far right, slightly shorter and set just right of the black-handle bottle.'),
    ]
    objects = [{'kind': 'primary_product', 'referenceImage': 2, 'description': description, 'position': position} for description, position in descriptions]
    objects += [
        {'kind': 'printed_product', 'referenceImage': None, 'description': 'Small printed-looking bottle image on the front of the packaging is not a physical product; excluded from count.', 'position': 'On box front only, not a real bottle in the scene.'},
        {'kind': 'packaging', 'referenceImage': None, 'description': 'One senseng retail box with a printed bottle and blue lower panels.', 'position': 'At far left behind the real bottles.'},
        {'kind': 'prop', 'referenceImage': None, 'description': 'Blurred green plant.', 'position': 'Background behind the right side of the scene.'},
    ]
    source = {'objects': objects, 'composition': 'Approved website crop shows four real stainless bottles arranged in a straight tabletop lineup, plus a retail box on the far left.', 'packaging': 'One tall white retail box with a printed bottle picture.'}
    audits, requests = [], []
    async def vision(stage, instructions, images, schema):
        audits.append(stage)
        assert 'physicalProductCount' not in schema['properties']
        return source if stage == 'composition' else {**review(4), 'objects': copy.deepcopy(objects)}
    monkeypatch.setattr(module(), '_vision_json', vision)
    def handler(request):
        requests.append(request)
        facts = prompt_facts(request)
        assert facts['sceneComposition']['physicalProductCount'] == 4
        assert facts['sceneComposition']['objects'] == objects
        assert b'exactly 4 physical primary products' in request.read()
        return success_response()
    fake_http(monkeypatch, handler)
    assert 'home-0' in asyncio.run(module().generate_scene_assets(payload, 'home', plan))
    assert audits == ['composition'] and len(requests) == 1
    directory = tmp_path / 'evidence/test-job-1/assets/home-0'
    saved_plan = json.loads((directory / 'composition.json').read_text())
    assert saved_plan['physicalProductCount'] == 4
    assert not (directory / 'attempt-v1/review.json').exists()


@pytest.mark.parametrize('kind', ['bottle', '', None])
def test_ambiguous_object_kind_fails_before_image_spend(scene, monkeypatch, kind):
    payload, plan = scene
    async def vision(stage, instructions, images, schema):
        result = composition(1)
        result['objects'][0]['kind'] = kind
        return result
    monkeypatch.setattr(module(), '_vision_json', vision)
    fake_http(monkeypatch, lambda request: pytest.fail('Unclassified visual objects must not become a guessed product count'))
    with pytest.raises(module().GeneratedAssetError, match='composition'):
        asyncio.run(module().generate_scene_assets(payload, 'home', plan))


@pytest.mark.parametrize('source,expected', [((757, 357), '1536x720'), ((1500, 1000), '1536x1024'), ((1000, 1000), '1024x1024'), ((2000, 1000), '1536x768'), ((1000, 2000), '768x1536'), ((3000, 1000), '1536x512'), ((1000, 3000), '512x1536')])
def test_generation_size_preserves_source_aspect_within_existing_pixel_budget(source, expected):
    assert module()._generation_size(source) == expected


@pytest.mark.parametrize('source', [(10000, 2), (2, 10000), (2, 2), (3840, 1000), (1000, 3840), (756, 355), (641, 1000)])
def test_generation_size_obeys_image25_custom_dimension_limits(source):
    width, height = map(int, module()._generation_size(source).split('x'))
    assert width % 16 == height % 16 == 0
    assert max(width, height) <= 3840
    assert 1 / 3 <= width / height <= 3
    assert 655360 <= width * height <= 1536 * 1024


def test_scene_prompt_preserves_blank_background_and_source_packaging_edge(scene, monkeypatch):
    payload, plan = scene
    def handler(request):
        prompt = request.read().decode(errors='ignore').lower()
        assert 'original blank photographic regions' in prompt
        assert 'same existing background' in prompt
        assert 'partially cropped packaging' in prompt
        assert 'do not add new plants, pots or props' in prompt
        return success_response()
    fake_http(monkeypatch, handler)
    assert 'home-0' in asyncio.run(module().generate_scene_assets(payload, 'home', plan))












def test_valid_scene_delivers_without_paid_visual_review_or_redraw(scene, monkeypatch):
    payload, plan = scene
    audits, requests = [], []
    async def vision(stage, *args):
        audits.append(stage)
        assert stage == 'composition', 'Generated pixels belong to customer judgement'
        return composition(3)
    monkeypatch.setattr(module(), '_vision_json', vision)
    fake_http(monkeypatch, lambda request: requests.append(request) or success_response())
    result = asyncio.run(module().generate_scene_assets(payload, 'home', plan))
    assert 'home-0' in result and len(requests) == 1
    assert audits == ['composition']
    assert asyncio.run(module().generate_scene_assets(payload, 'home', plan)) == result
    assert len(requests) == 1


@pytest.mark.parametrize('corrupt', [False, True])
@pytest.mark.parametrize('later_failed', [False, True])
def test_historical_rejected_scene_recovers_verified_bytes_without_generation(scene, monkeypatch, tmp_path, corrupt, later_failed):
    payload, plan = scene
    fake_http(monkeypatch, lambda request: success_response())
    original = asyncio.run(module().generate_scene_assets(payload, 'home', plan))
    directory = tmp_path / 'evidence/test-job-1/assets/home-0'
    status = json.loads((directory / 'status.json').read_text())
    status.update(state='rejected', fidelityAccepted=False)
    (directory / 'status.json').write_text(json.dumps(status))
    (directory / 'generated.webp').unlink()
    if later_failed:
        status['state'] = 'failed'
        (directory / 'status.json').write_text(json.dumps(status))
        later = directory / 'attempt-v2'
        later.mkdir()
        (later / 'status.json').write_text(json.dumps({'fingerprint': status['fingerprint'], 'state': 'failed'}))
    if corrupt:
        (directory / 'attempt-v1/generated.webp').write_bytes(b'corrupt')
    fake_http(monkeypatch, lambda request: pytest.fail('A saved image must never be regenerated automatically'))
    if corrupt:
        with pytest.raises(module().GeneratedAssetError):
            asyncio.run(module().generate_scene_assets(payload, 'home', plan))
    else:
        assert asyncio.run(module().generate_scene_assets(payload, 'home', plan)) == original
        assert json.loads((directory / 'status.json').read_text())['deliveryPolicy'] == 'customer-choice'
