import asyncio

import pytest

import builder
from assembler import OutputValidationError, assemble, assemble_page
from renderer import RenderResult


@pytest.fixture
def wrong_detail(guided_payload, pages):
    payload = guided_payload
    payload['draft']['consultation']['brief']['pages'] = [p for p in payload['draft']['consultation']['brief']['pages'] if not p['id'].startswith('extra-')]
    detail = next(p for p in payload['draft']['consultation']['brief']['pages'] if p['id'] == 'detail')
    for lang in payload['draft']['languages']:
        detail['content'][lang]['sections'] = [{'heading': 'Approved detail', 'body': 'Approved paragraph'}]
    html = pages['detail'].replace('</main>', '<p data-wr-bind="section.0.body"></p><h2 data-wr-bind="section.0.heading"></h2></main>')
    return payload, html


def test_wrong_content_order_retains_strict_failure_and_real_mobile_feedback(wrong_detail, monkeypatch, tmp_path):
    payload, html = wrong_detail
    # The normal responsive max-width correctly clamps width alone. A genuine
    # oversized min-width reproduces content that cannot shrink on mobile.
    html = html.replace('</style>', 'main{min-width:1500px}img{width:200px;height:200px}</style>')
    monkeypatch.setenv('SITE_BUILDER_DB', str(tmp_path / 'builds.sqlite3'))
    with pytest.raises(OutputValidationError, match='exactly once in approved order') as failure:
        assemble_page(payload['draft'], 'detail', html, payload['designImages'])
    assert 'Expected: ["section.0.heading", "section.0.body"]' in str(failure.value)
    assert 'Observed: ["section.0.body", "section.0.heading"]' in str(failure.value)
    result = asyncio.run(builder.assess_page('detail', html, payload))
    assert any('exactly once in approved order' in issue for issue in result.issues)
    assert any('390px' in issue and 'outside' in issue for issue in result.issues)
    assert len(result.screenshots) == 2 and len(result.metrics) == 2
    with pytest.raises(OutputValidationError, match='exactly once in approved order'):
        assemble_page(payload['draft'], 'detail', html, payload['designImages'])


@pytest.mark.parametrize('fix_order', [False, True], ids=['retained-order-rejected', 'corrected-order-accepted'])
def test_build_page_cannot_accept_wrong_order_even_when_render_checks_pass(wrong_detail, pages, monkeypatch, tmp_path, fix_order):
    payload, wrong_html = wrong_detail
    corrected = wrong_html.replace('<p data-wr-bind="section.0.body"></p><h2 data-wr-bind="section.0.heading"></h2>', '<h2 data-wr-bind="section.0.heading"></h2><p data-wr-bind="section.0.body"></p>')
    monkeypatch.setenv('OPENAI_API_KEY', 'fake-local-boundary-only')
    monkeypatch.setenv('SITE_BUILDER_DB', str(tmp_path / 'builds.sqlite3'))
    monkeypatch.setattr(builder, 'resolve_model', lambda value: object())
    payload['_visualPlans'] = {'detail': None}
    calls = []
    class Boundary:
        async def run(self, model, messages):
            calls.append(messages)
            if len(calls) == 2:
                feedback = messages[-1]['content']
                assert 'exactly once in approved order' in feedback[0]['text']
                assert len([part for part in feedback if part['type'] == 'image_url']) == 2
            return corrected if len(calls) == 2 and fix_order else wrong_html
    monkeypatch.setattr(builder, 'create_agent', lambda *args: Boundary())
    async def clean_render(*args):
        return RenderResult(screenshots=[payload['designImages']['detail']] * 2, metrics=[{'width': 1536}, {'width': 390}])
    # Keep the real assembler, assess_page, issue propagation and final gate;
    # only model/render I/O is replaced to isolate the content-order contract.
    monkeypatch.setattr(builder, 'inspect_page', clean_render)
    if fix_order:
        html = asyncio.run(builder.build_page(payload, 'detail'))
        assert html == corrected
        assert assemble_page(payload['draft'], 'detail', html, payload['designImages'])
        assert assemble(payload['draft'], {**pages, 'detail': html}, payload['designImages'])
    else:
        with pytest.raises(OutputValidationError, match='detail failed render checks.*exactly once in approved order'):
            asyncio.run(builder.build_page(payload, 'detail'))
        with pytest.raises(OutputValidationError, match='exactly once in approved order'):
            assemble(payload['draft'], {**pages, 'detail': wrong_html}, payload['designImages'])
    assert len(calls) == 2


@pytest.mark.parametrize('defect,expected', [('missing', 'Missing required detail data bindings: product.image'), ('unknown', 'Unknown data binding hook'), ('non-leaf', 'Text bindings require safe leaf elements')])
def test_diagnostic_order_mode_keeps_other_assembly_failures_strict(wrong_detail, monkeypatch, defect, expected):
    payload, html = wrong_detail
    if defect == 'missing':
        html = html.replace('<img data-wr-bind="product.image">', '')
    elif defect == 'unknown':
        html = html.replace('</main>', '<span data-wr-bind="unknown.field"></span></main>')
    else:
        html = html.replace('<h1 data-wr-bind="product.name"></h1>', '<h1 data-wr-bind="product.name"><span></span></h1>')
    async def forbidden_render(*args):
        pytest.fail('Other assembly guards must stop before browser rendering')
    monkeypatch.setattr(builder, 'inspect_page', forbidden_render)
    diagnostics = []
    with pytest.raises(OutputValidationError, match=expected):
        assemble_page(payload['draft'], 'detail', html, payload['designImages'], diagnostic_binding_issues=diagnostics)
    assert len(diagnostics) == 1 and diagnostics[0].startswith('Approved detail content bindings must appear exactly once in approved order')
    result = asyncio.run(builder.assess_page('detail', html, payload))
    assert result.issues == [diagnostics[0], expected]
    assert not result.screenshots and not result.metrics


@pytest.fixture
def missing_section_body(wrong_detail):
    payload, html = wrong_detail
    detail = next(page for page in payload['draft']['consultation']['brief']['pages'] if page['id'] == 'detail')
    for content in detail['content'].values():
        content['sections'].append({'heading': 'Second approved heading', 'body': 'Second approved paragraph'})
    html = html.replace('</main>', '<h2 data-wr-bind="section.1.heading"></h2></main>')
    return payload, html


def test_missing_section_body_names_exact_hook_and_keeps_real_diagnostic_render(missing_section_body, pages):
    payload, html = missing_section_body
    html = html.replace('</style>', 'main{min-width:1500px}img{width:200px;height:200px}</style>')
    with pytest.raises(OutputValidationError) as failure:
        assemble_page(payload['draft'], 'detail', html, payload['designImages'])
    assert 'section.1.body' in str(failure.value)
    with pytest.raises(OutputValidationError, match='section.1.body'):
        assemble(payload['draft'], {**pages, 'detail': html}, payload['designImages'])
    result = asyncio.run(builder.assess_page('detail', html, payload))
    assert 'Missing required detail data bindings: section.1.body' in result.issues
    assert any('390px' in issue and 'outside' in issue for issue in result.issues)
    assert len(result.screenshots) == len(result.metrics) == 2


def test_missing_section_body_remains_fatal_after_single_repair(missing_section_body, monkeypatch, tmp_path):
    payload, html = missing_section_body
    payload['_visualPlans'] = {'detail': None}
    monkeypatch.setenv('OPENAI_API_KEY', 'fake-local-boundary-only')
    monkeypatch.setenv('SITE_BUILDER_DB', str(tmp_path / 'builds.sqlite3'))
    monkeypatch.setattr(builder, 'resolve_model', lambda value: object())
    calls = []
    class Boundary:
        async def run(self, model, messages):
            calls.append(messages)
            if len(calls) == 2:
                assert 'Missing required detail data bindings: section.1.body' in messages[-1]['content'][0]['text']
                assert len([item for item in messages[-1]['content'] if item['type'] == 'image_url']) == 2
            return html
    monkeypatch.setattr(builder, 'create_agent', lambda *args: Boundary())
    async def clean_render(*args):
        return RenderResult(screenshots=[payload['designImages']['detail']] * 2)
    monkeypatch.setattr(builder, 'inspect_page', clean_render)
    with pytest.raises(OutputValidationError, match='detail failed render checks.*section.1.body'):
        asyncio.run(builder.build_page(payload, 'detail'))
    assert len(calls) == 2


@pytest.mark.parametrize('page', ['catalog', 'contact'])
def test_diagnostic_missing_content_never_defers_required_page_structure(guided_payload, pages, monkeypatch, page):
    payload = guided_payload
    planned = next(item for item in payload['draft']['consultation']['brief']['pages'] if item['id'] == page)
    for content in planned['content'].values():
        content['sections'] = [{'heading': 'Approved heading', 'body': 'Approved paragraph'}]
    html = pages[page].replace('data-wr-product>', 'data-wr-removed-product>') if page == 'catalog' else pages[page].replace('data-wr-form', 'data-wr-removed-form')
    async def forbidden_render(*args):
        pytest.fail('Required catalog card/contact form structure must remain strict')
    monkeypatch.setattr(builder, 'inspect_page', forbidden_render)
    diagnostics = []
    with pytest.raises(OutputValidationError, match=f'Missing required {page} data bindings'):
        assemble_page(payload['draft'], page, html, payload['designImages'], diagnostic_binding_issues=diagnostics)
    result = asyncio.run(builder.assess_page(page, html, payload))
    assert any('section.0.body' in issue for issue in result.issues)
    assert not result.screenshots and not result.metrics
