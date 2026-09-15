import asyncio
import copy
import json
from types import SimpleNamespace

import pytest

from assembler import OutputValidationError
from test_design_assets import design_image
from visual_plan import check_visual_plan, plan_visuals, validate_visual_plan


@pytest.fixture
def catalog_draft(guided_draft):
    page = next(page for page in guided_draft['consultation']['brief']['pages'] if page['id'] == 'catalog')
    for content in page['content'].values():
        content['sections'] = [
            {'heading': 'Our materials', 'body': 'Browse the approved products below.'},
            {'heading': 'Wooden blocks', 'body': 'Blocks made from wood.'},
            {'heading': 'Cork blocks', 'body': 'Blocks made from cork.'},
        ]
    return guided_draft


def grouped_plan():
    return {
        'labels': [], 'crops': [], 'cardCounts': [2, 2], 'composition': 'Two compact material groups.',
        'layout': {'pageType': 'catalog', 'collections': [{'columns': 2, 'descriptions': False}, {'columns': 2, 'descriptions': False}], 'forms': []},
        'catalogGroups': [
            {'sectionIndex': 1, 'productIds': ['a/b ?']},
            {'sectionIndex': 2, 'productIds': ['second']},
        ],
    }


@pytest.fixture
def single_row_catalog(catalog_draft):
    template = catalog_draft['products'][0]
    catalog_draft['products'] = [{**copy.deepcopy(template), 'id': f'product-{index}'} for index in range(8)]
    catalog_draft['primaryProductId'] = 'product-0'
    plan = {**grouped_plan(), 'cardCounts': [2, 2, 3],
            'composition': 'Three compact product groups arranged beside each other.',
            'layout': {'pageType': 'catalog', 'collections': [{'columns': count, 'descriptions': False} for count in [2, 2, 3]], 'forms': []},
            'catalogGroups': [
                {'sectionIndex': 0, 'productIds': ['product-0', 'product-1']},
                {'sectionIndex': 1, 'productIds': ['product-2', 'product-3']},
                {'sectionIndex': 2, 'productIds': ['product-4', 'product-5', 'product-6', 'product-7']},
            ]}
    return catalog_draft, plan


def test_single_row_catalog_keeps_all_eight_products_in_one_row(single_row_catalog):
    draft, raw = single_row_catalog
    before = copy.deepcopy(raw)
    plan = validate_visual_plan('catalog', design_image(), raw, draft)
    assert [item['columns'] for item in plan['layout']['collections']] == [2, 2, 4]
    assert plan['cardCounts'] == [2, 2, 3]
    assert plan['catalogGroups'] == raw['catalogGroups']
    assert all(item['descriptions'] is False for item in plan['layout']['collections'])
    assert raw == before
    metrics = {'width': 1536, 'cards': 8, 'scenes': 0, 'collections': [2, 2, 4],
               'collectionGroups': plan['catalogGroups'], 'forms': 0, 'formLayouts': [],
               'collectionLayouts': [{'columns': count, 'rows': 1, 'descriptionCount': 0} for count in [2, 2, 4]]}
    assert not check_visual_plan(plan, [metrics])
    wrapped = copy.deepcopy(metrics)
    wrapped['collectionLayouts'][2].update(columns=3, rows=2)
    assert any('collection 3 requires 4 columns' in issue for issue in check_visual_plan(plan, [wrapped]))
    mobile = {**metrics, 'width': 390, 'collectionLayouts': [{'columns': 1, 'descriptionCount': 0} for _ in range(3)]}
    assert not check_visual_plan(plan, [mobile])


@pytest.mark.parametrize('observed_counts', [[2, 2, 6], [7], [2, 2, 2]])
def test_catalog_keeps_columns_when_multirow_or_observed_alignment_is_uncertain(single_row_catalog, observed_counts):
    draft, raw = single_row_catalog
    raw['cardCounts'] = observed_counts
    plan = validate_visual_plan('catalog', design_image(), raw, draft)
    assert plan['layout'] == raw['layout']
    assert plan['cardCounts'] == observed_counts


def test_catalog_reconciliation_is_reusable_and_idempotent(single_row_catalog):
    from visual_plan import reconcile_catalog_layout
    draft, raw = single_row_catalog
    reconciled = reconcile_catalog_layout(raw)
    assert reconciled == validate_visual_plan('catalog', design_image(), raw, draft)
    assert reconcile_catalog_layout(reconciled) == reconciled


def mock_planner(monkeypatch, plans):
    import visual_plan
    calls = []
    responses = iter(plans)
    class Client:
        def __init__(self, **kwargs): self.responses = self
        async def __aenter__(self): return self
        async def __aexit__(self, *args): pass
        async def create(self, **kwargs):
            calls.append(kwargs)
            result = copy.deepcopy(next(responses))
            if 'catalogAssignments' in kwargs['text']['format']['schema']['properties'] and 'catalogGroups' in result:
                result['catalogAssignments'] = {identity: group['sectionIndex'] for group in result.pop('catalogGroups') for identity in group['productIds']}
            return SimpleNamespace(status='completed', output_text=json.dumps(result))
    monkeypatch.setattr(visual_plan, 'AsyncOpenAI', Client)
    return calls


def test_existing_planner_grounds_catalog_groups_without_an_extra_call(catalog_draft, monkeypatch):
    before = copy.deepcopy(catalog_draft)
    raw = grouped_plan()
    calls = mock_planner(monkeypatch, [raw])
    plan = asyncio.run(plan_visuals('catalog', design_image(), 'gpt-5.5', 'test-only', None, catalog_draft))
    expected = copy.deepcopy(raw)
    expected['layout']['collections'] = [{'columns': 1, 'descriptions': False}, {'columns': 1, 'descriptions': False}]
    assert plan == expected and catalog_draft == before
    assert len(calls) == 1
    instruction = calls[0]['input'][0]['content'][0]['text']
    for product in catalog_draft['products']:
        for key in ('id', 'name', 'description'):
            assert product[key] in instruction
    assert 'Wooden blocks' in instruction and 'Cork blocks' in instruction
    assert 'sectionIndex' in instruction and 'catalogAssignments' in calls[0]['text']['format']['schema']['required']
    alternatives = calls[0]['text']['format']['schema']['properties']['catalogAssignments']['anyOf']
    for alternative in alternatives:
        assert alternative['required'] == [product['id'] for product in catalog_draft['products']]
        assert set(alternative['properties']) == set(alternative['required'])
        assert alternative['additionalProperties'] is False


def test_catalog_assignment_groups_are_assembled_once_in_approved_order(catalog_draft):
    from visual_plan import catalog_groups_from_assignments
    assert catalog_groups_from_assignments({'second': 2, 'a/b ?': 1}, catalog_draft) == grouped_plan()['catalogGroups']
    assert catalog_groups_from_assignments({'second': None, 'a/b ?': None}, catalog_draft) == [{'sectionIndex': None, 'productIds': ['a/b ?', 'second']}]


@pytest.mark.parametrize('assignments', [{'second': 2}, {'a/b ?': 1, 'second': 2, 'invented': 1}, {'a/b ?': None, 'second': 2}, {'a/b ?': 99, 'second': 2}])
def test_catalog_assignments_reject_missing_unknown_or_mixed_membership(catalog_draft, assignments):
    from visual_plan import catalog_groups_from_assignments
    with pytest.raises(OutputValidationError, match='Catalog assignments'):
        catalog_groups_from_assignments(assignments, catalog_draft)


def test_catalog_planning_keeps_all_retained_conditions_and_approved_keep_avoid(catalog_draft, monkeypatch):
    for product in catalog_draft['products']:
        product['name'] = 'Sample block'
        product['description'] = 'Approved sample.'
    catalog_draft['products'][0]['source']['conditions'] = {
        'audience': 'Indoor use', 'shared': ['keep the finish', 'keep the pack'],
        'productIds': 'Retained condition with a reserved-looking name', 'source': 'Old research',
    }
    catalog_draft['products'][1]['source'] = {'conditions': {
        'audience': 'Outdoor use', 'shared': ['keep the finish', 'keep the pack'],
        'shape': {'ends': 'round'},
    }}
    before = copy.deepcopy(catalog_draft)
    calls = mock_planner(monkeypatch, [grouped_plan()])
    asyncio.run(plan_visuals('catalog', design_image(), 'gpt-5.5', 'test-only', None, catalog_draft))
    instruction = calls[0]['input'][0]['content'][0]['text']
    facts = json.loads(instruction.split('Approved catalog facts (JSON):\n', 1)[1])
    expected = [
        [product['id'], name, value]
        for product in catalog_draft['products']
        for name, value in product.get('source', {}).get('conditions', {}).items() if name != 'source'
    ]
    actual = [
        [product_id, group['name'], group['value']]
        for group in facts.get('productSourceConditions', []) for product_id in group['productIds']
    ]
    assert sorted(map(json.dumps, actual)) == sorted(map(json.dumps, expected))
    brief = catalog_draft['consultation']['brief']
    assert facts['approvedKeep'] == brief['keep']
    assert facts['approvedAvoid'] == brief['avoid']
    assert catalog_draft == before and len(calls) == 1


def test_catalog_groups_preserve_original_product_order(catalog_draft):
    raw = {**grouped_plan(), 'catalogGroups': [{'sectionIndex': 1, 'productIds': ['second', 'a/b ?']}]}
    with pytest.raises(OutputValidationError, match='product order'):
        validate_visual_plan('catalog', design_image(), raw, catalog_draft)


@pytest.mark.parametrize('groups', [
    [],
    [{'sectionIndex': 1, 'productIds': []}],
    [{'sectionIndex': 1, 'productIds': ['unknown', 'second']}],
    [{'sectionIndex': 1, 'productIds': ['a/b ?', 'a/b ?', 'second']}],
    [{'sectionIndex': 1, 'productIds': ['a/b ?']}],
    [{'sectionIndex': 1, 'productIds': ['a/b ?']}, {'sectionIndex': 2, 'productIds': ['a/b ?', 'second']}],
    [{'sectionIndex': 1, 'productIds': ['a/b ?']}, {'sectionIndex': 1, 'productIds': ['second']}],
    [{'sectionIndex': 2, 'productIds': ['second']}, {'sectionIndex': 1, 'productIds': ['a/b ?']}],
    [{'sectionIndex': 3, 'productIds': ['a/b ?', 'second']}],
    [{'sectionIndex': True, 'productIds': ['a/b ?', 'second']}],
    [{'sectionIndex': None, 'productIds': ['a/b ?']}, {'sectionIndex': 2, 'productIds': ['second']}],
    [{'sectionIndex': 1, 'productIds': 'a/b ?'}],
    [{'sectionIndex': 1, 'productIds': [['a/b ?'], 'second']}],
    [{'sectionIndex': 1, 'productIds': ['a/b ?', 'second'], 'heading': 'Invented'}],
])
def test_catalog_plan_rejects_invalid_or_incomplete_assignments(catalog_draft, groups):
    raw = {**grouped_plan(), 'catalogGroups': groups}
    with pytest.raises(OutputValidationError, match='Catalog'):
        validate_visual_plan('catalog', design_image(), raw, catalog_draft)


def test_catalog_counts_follow_facts_and_memberships_must_match(catalog_draft):
    plan = grouped_plan()
    good = {'cards': 2, 'scenes': 0, 'collections': [1, 1], 'collectionGroups': plan['catalogGroups'],
            'collectionLayouts': [{'columns': 1, 'descriptionCount': 0}, {'columns': 1, 'descriptionCount': 0}], 'forms': 0, 'formLayouts': []}
    assert not check_visual_plan(plan, [good])
    swapped = copy.deepcopy(good)
    swapped['collectionGroups'][0]['productIds'] = ['second']
    swapped['collectionGroups'][1]['productIds'] = ['a/b ?']
    assert any('membership' in issue for issue in check_visual_plan(plan, [swapped]))
    misplaced = copy.deepcopy(good)
    misplaced['collectionGroups'][0]['sectionIndex'] = 0
    assert any('section' in issue for issue in check_visual_plan(plan, [misplaced]))
    assert check_visual_plan(plan, [{**good, 'cards': 4, 'collections': [2, 2]}])


@pytest.mark.parametrize('guided', [False, True])
def test_ungrouped_catalog_keeps_one_complete_collection(draft, guided_draft, guided):
    selected = guided_draft if guided else draft
    groups = [{'sectionIndex': None, 'productIds': [product['id'] for product in selected['products']]}]
    raw = {**grouped_plan(), 'catalogGroups': groups, 'layout': {'pageType': 'catalog', 'collections': [{'columns': 2, 'descriptions': False}], 'forms': []}}
    plan = validate_visual_plan('catalog', design_image(), raw, selected)
    assert not check_visual_plan(plan, [{'cards': 2, 'scenes': 0, 'collections': [2], 'collectionGroups': groups,
                                       'collectionLayouts': [{'columns': 2, 'descriptionCount': 0}], 'forms': 0, 'formLayouts': []}])
    with pytest.raises(OutputValidationError, match='Catalog'):
        validate_visual_plan('catalog', design_image(), grouped_plan(), selected)


def test_scene_review_preserves_catalog_assignments_and_original_logo_icon(catalog_draft, monkeypatch):
    raw = grouped_plan()
    raw['crops'] = [
        {'kind': 'logo', 'box': [0, 0, 200, 60]},
        {'kind': 'scene', 'box': [500, 100, 1000, 400]},
        {'kind': 'icon', 'box': [300, 0, 330, 30]},
    ]
    reviewed = {'labels': [], 'crops': [
        {'kind': 'logo', 'box': [0, 0, 150, 40]},
        {'kind': 'scene', 'box': [500, 100, 1000, 450]},
    ], 'cardCounts': [99], 'composition': 'Reviewed scene.',
        'layout': {'pageType': 'catalog', 'collections': [{'columns': 8, 'descriptions': True}], 'forms': [{'columns': 2}]}}
    calls = mock_planner(monkeypatch, [raw, reviewed])
    plan = asyncio.run(plan_visuals('catalog', design_image(), 'gpt-5.5', 'test-only', None, catalog_draft))
    assert plan is not None
    expected = validate_visual_plan('catalog', design_image(), raw, catalog_draft)
    assert plan['catalogGroups'] == expected['catalogGroups']
    assert plan['cardCounts'] == raw['cardCounts']
    assert plan['layout'] == expected['layout']
    assert [crop for crop in plan['crops'] if crop['kind'] != 'scene'] == [crop for crop in expected['crops'] if crop['kind'] != 'scene']
    assert [crop for crop in plan['crops'] if crop['kind'] == 'scene'] == [{'kind': 'scene', 'box': [500, 125, 500, 437]}]
    assert len(calls) == 2


def test_scene_only_review_cannot_recrop_or_remove_original_brand_assets(monkeypatch):
    raw = {'labels': [], 'crops': [
        {'kind': 'logo', 'box': [0, 0, 200, 60]},
        {'kind': 'scene', 'box': [500, 100, 1000, 400]},
        {'kind': 'icon', 'box': [300, 0, 330, 30]},
    ], 'cardCounts': [], 'composition': 'Original brand assets.',
        'layout': {'pageType': 'home', 'collections': [], 'forms': []}}
    reviewed = {**raw, 'labels': [], 'crops': [
        {'kind': 'logo', 'box': [0, 0, 150, 40]},
        {'kind': 'scene', 'box': [500, 100, 1000, 450]},
    ]}
    mock_planner(monkeypatch, [raw, reviewed])
    plan = asyncio.run(plan_visuals('home', design_image(), 'gpt-5.5', 'test-only', None))
    assert plan is not None
    expected = validate_visual_plan('home', design_image(), raw)
    assert [crop for crop in plan['crops'] if crop['kind'] != 'scene'] == [crop for crop in expected['crops'] if crop['kind'] != 'scene']


@pytest.mark.parametrize('new_box', [[50, 500, 250, 750], [900, 300, 1000, 750]])
def test_scene_review_rejects_new_product_photos_outside_proposed_scenes(monkeypatch, new_box):
    raw = {'labels': [], 'crops': [{'kind': 'scene', 'box': [500, 100, 1000, 400]}], 'cardCounts': [2], 'composition': 'Hero above original product cards.',
           'layout': {'pageType': 'home', 'collections': [{'columns': 2, 'descriptions': False}], 'forms': []}}
    reviewed = {**raw, 'labels': [], 'crops': [*raw['crops'], {'kind': 'scene', 'box': new_box}]}
    mock_planner(monkeypatch, [raw, reviewed])
    with pytest.raises(OutputValidationError, match='originally proposed scene'):
        asyncio.run(plan_visuals('home', design_image(), 'gpt-5.5', 'test-only', None))


def test_scene_review_can_split_original_scene_and_adjust_backdrop_margins(monkeypatch):
    raw = {'labels': [], 'crops': [{'kind': 'scene', 'box': [400, 100, 1000, 500]}], 'cardCounts': [], 'composition': 'Scene wraps around live copy.',
           'layout': {'pageType': 'home', 'collections': [], 'forms': []}}
    reviewed = {**raw, 'labels': [], 'crops': [
        {'kind': 'scene', 'box': [650, 100, 1000, 520]},
        {'kind': 'scene', 'box': [380, 350, 650, 500]},
    ]}
    mock_planner(monkeypatch, [raw, reviewed])
    result = asyncio.run(plan_visuals('home', design_image(), 'gpt-5.5', 'test-only', None))
    assert result == validate_visual_plan('home', design_image(), reviewed)


def test_builder_hands_canonical_groups_to_generation_and_repair(payload, single_row_catalog, monkeypatch):
    import builder
    from renderer import RenderResult
    asyncio.run(builder.initialize_vendor())
    from llm import Llm
    catalog_draft, raw = single_row_catalog
    payload['draft'] = catalog_draft
    payload['designImages']['catalog'] = design_image()
    before = copy.deepcopy(payload)
    calls = mock_planner(monkeypatch, [raw])
    messages = []
    class Agent:
        async def run(self, model, prompt):
            messages.append(prompt)
            return '<html><body><main>local stub</main></body></html>'
    monkeypatch.setenv('OPENAI_API_KEY', 'test-only')
    monkeypatch.setattr(builder, 'resolve_model', lambda value: Llm.GPT_5_5_LOW)
    monkeypatch.setattr(builder, 'create_agent', lambda *args: Agent())
    metrics = {'cards': 8, 'scenes': 0, 'collections': [2, 2, 4], 'collectionGroups': raw['catalogGroups'],
               'collectionLayouts': [{'columns': count, 'descriptionCount': 0} for count in [2, 2, 4]], 'forms': 0, 'formLayouts': []}
    monkeypatch.setattr(builder, 'assess_page', lambda *args: asyncio.sleep(0, result=RenderResult(metrics=[metrics])))
    asyncio.run(builder.build_page(payload, 'catalog'))
    assert len(calls) == 1 and len(messages) == 2
    assert payload == before
    for prompt in messages:
        text = json.dumps(prompt)
        assert 'catalogGroups' in text and 'sectionIndex' in text
        assert 'factual' in text.lower() and 'cardCounts' in text
        assert '2:2:4' in text and 'single row' in text
        assert 'live HTML overlay' in text and 'normalized scene box' in text
        assert 'adapting row counts' not in text
