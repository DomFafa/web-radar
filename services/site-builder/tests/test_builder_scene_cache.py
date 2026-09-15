import asyncio
import base64
import copy
import io
import json

import pytest
from PIL import Image

import builder
import generated_assets
import scene_cache


@pytest.fixture
def prepared(payload, monkeypatch, tmp_path):
    monkeypatch.setenv('OPENAI_API_KEY', 'test-only')
    monkeypatch.setenv('SITE_BUILDER_DB', str(tmp_path / 'builds.sqlite3'))
    monkeypatch.setattr(builder, 'resolve_model', lambda _: object())
    plan = {'crops': [{'kind': 'logo', 'box': [0, 0, 20, 20]}, {'kind': 'scene', 'box': [400, 100, 500, 400]}]}
    payload['_visualPlans'] = {'home': plan}
    raw = io.BytesIO()
    Image.new('RGB', (120, 80), 'red').save(raw, 'WEBP')
    assets = {'home-1': 'data:image/webp;base64,' + base64.b64encode(raw.getvalue()).decode()}
    payload['designImages']['home'] = assets['home-1']
    class FailedHTML:
        async def run(self, *_):
            raise RuntimeError('HTML boundary failed')
    monkeypatch.setattr(builder, 'create_agent', lambda *_: FailedHTML())
    return payload, plan, assets


def test_accepted_scene_survives_html_failure_and_new_job_reuses_it(prepared, monkeypatch, tmp_path):
    payload, plan, assets = prepared
    calls = []
    async def generate(*args):
        calls.append(args)
        return assets
    monkeypatch.setattr(generated_assets, 'generate_scene_assets', generate)
    with pytest.raises(RuntimeError, match='HTML boundary failed'):
        asyncio.run(builder.build_page(payload, 'home'))
    record = scene_cache.load_scene_cache(payload, 'home')
    assert record is not None
    next_payload = copy.deepcopy(payload)
    next_payload['id'] = 'next-job'
    next_payload['_visualPlans']['home']['crops'][1]['box'] = [300, 100, 600, 400]
    next_payload.pop('_generatedAssets')
    with pytest.raises(RuntimeError, match='HTML boundary failed'):
        asyncio.run(builder.build_page(next_payload, 'home'))
    assert len(calls) == 1
    assert next_payload['_generatedAssets'] == {'home-0': assets['home-1']}
    assert next_payload['_visualPlans']['home']['crops'][1]['box'] == [300, 100, 600, 400]
    directory = tmp_path / 'evidence/next-job/assets/home-0'
    status = json.loads((directory / 'status.json').read_text())
    assert status['reused'] and status['fidelityAccepted'] and status['sourceJobId'] == payload['id']
    assert status['assetSha256'] == record['scenes'][0]['sha256']
    assert (directory / 'generated.webp').read_bytes() == base64.b64decode(assets['home-1'].split(',')[1])
    assert not (directory / 'attempt-v1').exists()


def test_rejected_generation_never_creates_accepted_cache(prepared, monkeypatch):
    payload, _, _ = prepared
    async def generate(*_):
        raise generated_assets.GeneratedAssetError('Scene rejected')
    monkeypatch.setattr(generated_assets, 'generate_scene_assets', generate)
    with pytest.raises(generated_assets.GeneratedAssetError, match='Scene rejected'):
        asyncio.run(builder.build_page(payload, 'home'))
    assert scene_cache.load_scene_cache(payload, 'home') is None
