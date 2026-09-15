import asyncio
import json

import pytest

import builder
from assembler import OutputValidationError, assemble_page
from renderer import RenderResult


@pytest.fixture
def candidates(payload, pages, monkeypatch, tmp_path):
    initial = pages['detail'].replace('<main>', '<main id="initial">')
    reviewed = pages['detail'].replace('<main>', '<main id="reviewed">')
    payload['_visualPlans'] = {'detail': None}
    monkeypatch.setenv('OPENAI_API_KEY', 'fake-local-model-boundary')
    monkeypatch.setenv('SITE_BUILDER_DB', str(tmp_path / 'builds.sqlite3'))
    monkeypatch.setattr(builder, 'resolve_model', lambda value: object())
    state = {'html': [initial, reviewed], 'renderIssues': [[], []], 'planIssues': [[], []], 'modelCalls': [], 'renderCalls': [], 'planCalls': []}
    class Boundary:
        async def run(self, model, messages):
            index = len(state['modelCalls'])
            state['modelCalls'].append(messages)
            if state.get('modelError') and index == 1:
                raise state['modelError']
            return state['html'][index]
    monkeypatch.setattr(builder, 'create_agent', lambda *args: Boundary())
    async def inspect(page, html, *args):
        index = len(state['renderCalls'])
        state['renderCalls'].append(html)
        if state.get('renderError') and index == 1:
            raise state['renderError']
        return RenderResult(issues=list(state['renderIssues'][index]), screenshots=[payload['designImages']['detail']] * 2, metrics=[{'width': 1536}, {'width': 390}])
    monkeypatch.setattr(builder, 'inspect_page', inspect)
    def plan_checks(plan, metrics):
        index = len(state['planCalls'])
        state['planCalls'].append(metrics)
        return list(state['planIssues'][index])
    monkeypatch.setattr(builder, 'check_visual_plan', plan_checks)
    return payload, state, tmp_path / 'evidence/test-job-1'


@pytest.mark.parametrize('initial_issues,reviewed_issues,initial_plan_issues,selected', [
    ([], ['390px: page content extends outside the viewport'], [], 'initial'),
    (['Hidden product image'], ['390px: page content extends outside the viewport'], [], None),
    (['Hidden product image'], [], [], 'reviewed'),
    ([], [], [], 'reviewed'),
    ([], ['390px: page content extends outside the viewport'], ['Mobile collection requires 1 to 2 columns'], None),
], ids=['clean-to-bad-review', 'both-invalid', 'corrected-valid', 'both-valid', 'initial-plan-invalid'])
def test_selects_only_a_fully_valid_candidate_after_exactly_one_review(candidates, initial_issues, reviewed_issues, initial_plan_issues, selected):
    payload, state, evidence = candidates
    state['renderIssues'] = [initial_issues, reviewed_issues]
    state['planIssues'][0] = initial_plan_issues
    if selected is None:
        with pytest.raises(OutputValidationError, match='detail failed render checks after one visual review/repair'):
            asyncio.run(builder.build_page(payload, 'detail'))
        assert not (evidence / 'detail-selected.json').exists()
    else:
        html = asyncio.run(builder.build_page(payload, 'detail'))
        assert html == state['html'][0 if selected == 'initial' else 1]
        assert assemble_page(payload['draft'], 'detail', html, payload['designImages'])
        provenance = json.loads((evidence / 'detail-selected.json').read_text())
        assert provenance['selection']['candidate'] == selected
        assert provenance['selection']['reason']
        assert provenance['issues'] == []
        assert (evidence / 'detail-selected.html').read_text() == html
    assert len(state['modelCalls']) == len(state['renderCalls']) == len(state['planCalls']) == 2
    assert json.loads((evidence / 'detail-initial.json').read_text())['issues'] == [*initial_issues, *initial_plan_issues]
    assert json.loads((evidence / 'detail-reviewed.json').read_text())['issues'] == reviewed_issues
    feedback = state['modelCalls'][1][-1]['content']
    assert len([part for part in feedback if part['type'] == 'image_url']) == 2


@pytest.mark.parametrize('boundary,error', [('modelError', TimeoutError('provider uncertain')), ('modelError', RuntimeError('unknown provider failure')), ('renderError', RuntimeError('unknown renderer failure'))], ids=['timeout', 'provider-error', 'renderer-error'])
def test_uncertain_or_unknown_errors_never_select_initial(candidates, boundary, error):
    payload, state, evidence = candidates
    state[boundary] = error
    with pytest.raises(type(error), match=str(error)):
        asyncio.run(builder.build_page(payload, 'detail'))
    assert len(state['modelCalls']) == 2
    assert not (evidence / 'detail-selected.json').exists()


def test_unknown_binding_in_initial_never_becomes_an_acceptable_fallback(candidates):
    payload, state, evidence = candidates
    state['html'][0] = state['html'][0].replace('</main>', '<span data-wr-bind="unknown.field"></span></main>')
    # Unknown binding stops the first candidate before renderer I/O, so this
    # single render result belongs to the reviewed candidate.
    state['renderIssues'][0] = ['390px: page content extends outside the viewport']
    with pytest.raises(OutputValidationError, match='detail failed render checks'):
        asyncio.run(builder.build_page(payload, 'detail'))
    assert json.loads((evidence / 'detail-initial.json').read_text())['issues'] == ['Unknown data binding hook']
    assert len(state['modelCalls']) == 2 and len(state['renderCalls']) == 1
    assert not (evidence / 'detail-selected.json').exists()


def test_reviewed_visual_plan_failure_also_preserves_clean_initial(candidates):
    payload, state, evidence = candidates
    state['planIssues'][1] = ['Mobile collection requires 1 to 2 columns; rendered 8']
    assert asyncio.run(builder.build_page(payload, 'detail')) == state['html'][0]
    assert json.loads((evidence / 'detail-reviewed.json').read_text())['issues'] == state['planIssues'][1]
    assert json.loads((evidence / 'detail-selected.json').read_text())['selection']['candidate'] == 'initial'
    assert len(state['modelCalls']) == len(state['planCalls']) == 2
