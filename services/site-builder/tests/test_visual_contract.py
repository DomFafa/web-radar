import asyncio
import copy

import pytest

from assembler import OutputValidationError
from test_catalog_plan import mock_planner
from test_design_assets import design_image
from visual_plan import check_visual_plan, plan_visuals, validate_visual_plan


def home_plan():
    return {
        'labels': [], 'crops': [], 'cardCounts': [8], 'composition': 'One row of compact product cards.',
        'layout': {'pageType': 'home', 'collections': [{'columns': 8, 'descriptions': False}], 'forms': []},
    }


def home_metrics():
    return {
        'width': 1440, 'cards': 8, 'scenes': 0, 'collections': [8],
        'collectionLayouts': [{'columns': 8, 'rows': 1, 'descriptionCount': 0}],
        'forms': 0, 'formLayouts': [],
    }


@pytest.mark.parametrize('mutation', [
    'missing-layout', 'extra-layout-key', 'missing-page-type', 'unknown-page-type',
    'missing-collections', 'collection-count', 'empty-columns', 'boolean-columns',
    'large-columns', 'numeric-descriptions', 'extra-collection-key', 'missing-forms',
    'boolean-form-columns', 'zero-form-columns', 'extra-form-key',
])
def test_invalid_layout_contract_is_rejected(mutation):
    plan = home_plan()
    layout = plan['layout']
    if mutation == 'missing-layout': del plan['layout']
    elif mutation == 'extra-layout-key': layout['height'] = 1024
    elif mutation == 'missing-page-type': del layout['pageType']
    elif mutation == 'unknown-page-type': layout['pageType'] = 'news'
    elif mutation == 'missing-collections': del layout['collections']
    elif mutation == 'collection-count': layout['collections'] = []
    elif mutation == 'empty-columns': layout['collections'][0]['columns'] = 0
    elif mutation == 'boolean-columns': layout['collections'][0]['columns'] = True
    elif mutation == 'large-columns': layout['collections'][0]['columns'] = 101
    elif mutation == 'numeric-descriptions': layout['collections'][0]['descriptions'] = 1
    elif mutation == 'extra-collection-key': layout['collections'][0]['rows'] = 1
    elif mutation == 'missing-forms': del layout['forms']
    elif mutation == 'boolean-form-columns': layout['forms'] = [{'columns': True}]
    elif mutation == 'zero-form-columns': layout['forms'] = [{'columns': 0}]
    else: layout['forms'] = [{'columns': 2, 'cta': True}]
    with pytest.raises(OutputValidationError, match='[Ll]ayout|[Pp]lan'):
        validate_visual_plan('home', design_image(), plan)


def test_layout_schema_is_required_in_real_planning_and_uses_approved_purpose(guided_draft, monkeypatch):
    calls = mock_planner(monkeypatch, [home_plan()])
    result = asyncio.run(plan_visuals('home', design_image(), 'gpt-5.5', 'test-only', None, guided_draft))
    assert result == home_plan()
    schema = calls[0]['text']['format']['schema']
    assert 'layout' in schema['required']
    assert schema['properties']['layout']['additionalProperties'] is False
    instruction = calls[0]['input'][0]['content'][0]['text']
    assert 'Approved home purpose' in instruction
    assert 'actual page type' in instruction.lower()


def test_wrong_about_screenshot_is_rejected_before_crop_review(guided_draft, monkeypatch):
    plan = home_plan()
    plan['layout']['pageType'] = 'catalog'
    plan['crops'] = [{'kind': 'scene', 'box': [500, 100, 1000, 400]}]
    calls = mock_planner(monkeypatch, [plan])
    with pytest.raises(OutputValidationError, match='about.*catalog|catalog.*about'):
        asyncio.run(plan_visuals('about', design_image(), 'gpt-5.5', 'test-only', None, guided_draft))
    assert len(calls) == 1


def test_extra_page_uses_extra_type_and_standalone_scenes_skip_only_crop_review(monkeypatch):
    plan = home_plan()
    plan['layout']['pageType'] = 'extra'
    plan['crops'] = [{'kind': 'scene', 'box': [500, 100, 1000, 400]}]
    calls = mock_planner(monkeypatch, [plan])
    result = asyncio.run(plan_visuals('extra-care-guide', design_image(), 'gpt-5.5', 'test-only', None, generate_scenes=True))
    assert result == validate_visual_plan('extra-care-guide', design_image(), plan)
    assert len(calls) == 1


def test_standalone_scenes_do_not_bypass_invalid_layout(monkeypatch):
    plan = home_plan()
    del plan['layout']
    mock_planner(monkeypatch, [plan])
    with pytest.raises(OutputValidationError):
        asyncio.run(plan_visuals('home', design_image(), 'gpt-5.5', 'test-only', None, generate_scenes=True))


@pytest.mark.parametrize('columns,descriptions', [(4, 0), (8, 8), (4, 8)])
def test_desktop_compact_card_density_cannot_silently_change(columns, descriptions):
    good = home_metrics()
    assert check_visual_plan(home_plan(), [good]) == []
    actual = copy.deepcopy(good)
    actual['collectionLayouts'][0].update(columns=columns, descriptionCount=descriptions)
    issues = check_visual_plan(home_plan(), [actual])
    assert issues
    if columns == 4: assert any('columns' in issue for issue in issues)
    if descriptions: assert any('descriptions' in issue for issue in issues)


@pytest.mark.parametrize('page_type,columns', [('detail', 1), ('contact', 2)])
def test_designed_forms_must_exist_and_preserve_desktop_columns(page_type, columns):
    plan = home_plan()
    plan['layout'].update(pageType=page_type, forms=[{'columns': columns}])
    good = {**home_metrics(), 'forms': 1, 'formLayouts': [{'columns': columns}]}
    assert check_visual_plan(plan, [good]) == []
    assert any('form' in issue.lower() for issue in check_visual_plan(plan, [home_metrics()]))
    changed = {**good, 'formLayouts': [{'columns': columns + 1 if columns == 1 else 1}]}
    assert any('form' in issue.lower() and 'columns' in issue for issue in check_visual_plan(plan, [changed]))
    extra = {**good, 'forms': 2, 'formLayouts': good['formLayouts'] * 2}
    assert any('form' in issue.lower() for issue in check_visual_plan(plan, [extra]))


def test_mobile_allows_one_or_two_card_columns_and_requires_single_column_forms():
    plan = home_plan()
    plan['layout']['forms'] = [{'columns': 2}]
    desktop = {**home_metrics(), 'forms': 1, 'formLayouts': [{'columns': 2}]}
    for columns in (1, 2):
        mobile = copy.deepcopy(desktop)
        mobile['width'] = 390
        mobile['collectionLayouts'][0]['columns'] = columns
        mobile['formLayouts'][0]['columns'] = 1
        assert check_visual_plan(plan, [desktop, mobile]) == []
    mobile['collectionLayouts'][0]['columns'] = 3
    mobile['formLayouts'][0]['columns'] = 2
    issues = check_visual_plan(plan, [desktop, mobile])
    assert any('mobile' in issue.lower() and 'collection' in issue.lower() for issue in issues)
    assert any('mobile' in issue.lower() and 'form' in issue.lower() for issue in issues)


def test_missing_render_layout_measurements_cannot_pass():
    metrics = home_metrics()
    del metrics['collectionLayouts']
    del metrics['formLayouts']
    assert check_visual_plan(home_plan(), [metrics])
