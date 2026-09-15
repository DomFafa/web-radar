import asyncio

import pytest
from bs4 import BeautifulSoup


def test_labels_bind_exact_approved_text_for_each_language(draft, pages):
    from assembler import assemble_page
    html = pages['home'].replace('</main>', '<span class="feature" data-wr-label="home-feature"></span></main>')
    labels = {'home-feature': {'en': 'Approved subtitle', 'de': 'Approved subtitle'}}
    files = assemble_page(draft, 'home', html, {}, {}, labels)
    for lang in draft['languages']:
        node = BeautifulSoup(files[f'{lang}/index.html'], 'html.parser').select_one('.feature')
        assert node is not None and node.get_text() == labels['home-feature'][lang]


@pytest.mark.parametrize('markup,labels', [
    ('<span data-wr-label="unknown"></span>', {}),
    ('<span data-wr-label="home-feature" data-wr-bind="company.name"></span>', {'home-feature': {'en': 'Approved'}}),
    ('<span data-wr-label="home-feature"><b>nested</b></span>', {'home-feature': {'en': 'Approved'}}),
])
def test_invalid_presentation_binding_is_rejected(draft, pages, markup, labels):
    from assembler import assemble_page, OutputValidationError
    with pytest.raises(OutputValidationError, match='presentation label'):
        assemble_page(draft, 'home', pages['home'].replace('</main>', markup + '</main>'), {}, {}, labels)


def test_visible_model_icons_and_unbound_labels_are_flagged_before_silent_removal(payload, pages, monkeypatch):
    import builder
    from renderer import RenderResult
    html = pages['home'].replace('</main>', '<span class="badge">♧</span><span>Hydration Tracking</span><svg><path/></svg></main>')
    monkeypatch.setattr(builder, 'inspect_page', lambda *args: asyncio.sleep(0, result=RenderResult()))
    result = asyncio.run(builder.assess_page('home', html, payload))
    assert any('unbound visible text' in issue for issue in result.issues)
    assert any('SVG' in issue for issue in result.issues)


def test_each_page_requires_its_own_planned_labels_including_hyphenated_ids(payload, pages, monkeypatch):
    import builder
    from renderer import RenderResult
    payload['_presentationLabels'] = {
        'home:feature-heading': {'en': 'Approved subtitle', 'de': 'Approved subtitle'},
        'about:company-heading': {'en': 'Approved subtitle', 'de': 'Approved subtitle'},
    }
    monkeypatch.setattr(builder, 'inspect_page', lambda *args: asyncio.sleep(0, result=RenderResult()))
    result = asyncio.run(builder.assess_page('home', pages['home'], payload))
    assert any('home:feature-heading' in issue for issue in result.issues)
    assert not any('about:company-heading' in issue for issue in result.issues)
    html = pages['home'].replace('</main>', '<span data-wr-label="home:feature-heading"></span></main>')
    result = asyncio.run(builder.assess_page('home', html, payload))
    assert not any('presentation label' in issue for issue in result.issues)


def test_plain_navigation_hook_text_is_replaced_by_its_trusted_label(payload, pages, monkeypatch):
    import builder
    from assembler import assemble_page, LABELS
    from renderer import RenderResult
    monkeypatch.setattr(builder, 'inspect_page', lambda *args: asyncio.sleep(0, result=RenderResult()))
    result = asyncio.run(builder.assess_page('catalog', pages['catalog'], payload))
    assert not any('unbound visible text' in issue for issue in result.issues)
    files = assemble_page(payload['draft'], 'catalog', pages['catalog'])
    link = BeautifulSoup(files['en/products/index.html'], 'html.parser').select_one('main a[data-wr-page="detail"]')
    assert link is not None and link.get_text(strip=True) == LABELS['en']['detail']


def test_unbound_feedback_identifies_the_actual_nodes_without_unbounded_html(payload, pages, monkeypatch):
    import builder
    from renderer import RenderResult
    markup = '<span class="req">*</span><h2>Materials and Specifications</h2>'
    markup += '<p>' + 'long claim ' * 1000 + '</p>'
    html = pages['detail'].replace('</main>', markup + '</main>')
    monkeypatch.setattr(builder, 'inspect_page', lambda *args: asyncio.sleep(0, result=RenderResult()))
    result = asyncio.run(builder.assess_page('detail', html, payload))
    issue = next(issue for issue in result.issues if 'unbound visible text' in issue)
    assert 'Materials and Specifications' in issue and '"text": "*"' in issue
    assert '"tag": "span"' in issue and '"class": "req"' in issue
    assert '3 total' in issue and len(issue) < 1500
    feedback = builder.repair_messages([], html, result)[-1]['content'][0]['text']
    assert 'remove the duplicate element' in feedback
