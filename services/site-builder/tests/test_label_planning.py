import asyncio
import json
from types import SimpleNamespace

import pytest

from assembler import OutputValidationError
from test_design_assets import design_image


def planned_labels(monkeypatch, draft, selection):
    import visual_plan
    import presentation_labels
    choices = {'en': {'q-en': 'Approved subtitle'}, 'de': {'q-de': 'Untertitel'}}
    monkeypatch.setattr(presentation_labels, 'presentation_label_candidates', lambda draft, lang: choices[lang], raising=False)
    calls = []
    class Client:
        def __init__(self, **kwargs): self.responses = self
        async def __aenter__(self): return self
        async def __aexit__(self, *args): pass
        async def create(self, **kwargs):
            calls.append(kwargs)
            return SimpleNamespace(status='completed', output_text=json.dumps({
                'labels': [{'id': 'feature-heading', 'sourceIds': selection}],
                'crops': [], 'cardCounts': [], 'composition': 'An approved feature caption.',
                'layout': {'pageType': 'home', 'collections': [], 'forms': []},
            }))
    monkeypatch.setattr(visual_plan, 'AsyncOpenAI', Client)
    return asyncio.run(visual_plan.plan_visuals('home', design_image(), 'test-model', 'test-key', None, draft, generate_scenes=True)), calls


def test_planner_selects_only_system_approved_localized_label_ids(monkeypatch, draft):
    result, calls = planned_labels(monkeypatch, draft, {'en': 'q-en', 'de': 'q-de'})
    assert result is not None
    assert result['labels'] == [{'id': 'feature-heading', 'text': {'en': 'Approved subtitle', 'de': 'Untertitel'}}]
    assert len(calls) == 1
    schema = calls[0]['text']['format']['schema']['properties']['labels']['items']['properties']
    assert set(schema) == {'id', 'sourceIds'}
    assert schema['sourceIds']['properties']['en']['enum'] == ['q-en']
    assert schema['sourceIds']['properties']['de']['enum'] == ['q-de']
    prompt = calls[0]['input'][0]['content'][0]['text']
    assert 'Approved subtitle' in prompt and 'Untertitel' in prompt


@pytest.mark.parametrize('selection', [
    {'en': 'Unsupported slogan', 'de': 'q-de'},
    {'en': 'q-de', 'de': 'q-en'},
    {'en': 'q-en'},
])
def test_planner_rejects_unknown_or_wrong_language_label_ids(monkeypatch, draft, selection):
    with pytest.raises(OutputValidationError, match='label selection'):
        planned_labels(monkeypatch, draft, selection)
