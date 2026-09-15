import asyncio

import pytest
from bs4 import BeautifulSoup

import builder
from assembler import assemble, assemble_page, sanitize
from renderer import RenderResult


ACTUAL_BREADCRUMB = '<div aria-label="Breadcrumb" class="crumbs"><a data-wr-bind="ui.home" data-wr-page="home">Home</a><span>&gt;</span><a data-wr-bind="ui.catalog" data-wr-page="catalog">Collection</a><span>&gt;</span><span class="current" data-wr-bind="page.title">Product Detail</span></div>'


@pytest.fixture
def breadcrumb_page(guided_payload, pages, monkeypatch):
    guided_payload['draft']['consultation']['brief']['pages'] = [page for page in guided_payload['draft']['consultation']['brief']['pages'] if not page['id'].startswith('extra-')]
    async def clean_render(*args):
        return RenderResult()
    monkeypatch.setattr(builder, 'inspect_page', clean_render)
    return guided_payload, pages


def test_actual_encoded_breadcrumb_separators_survive_strict_binding_and_assessment(breadcrumb_page):
    payload, pages = breadcrumb_page
    html = pages['detail'].replace('<main>', '<main>' + ACTUAL_BREADCRUMB)
    assert [span.get_text() for span in sanitize(html).select('.crumbs > span:not([data-wr-bind])')] == ['>', '>']
    files = assemble_page(payload['draft'], 'detail', html, payload['designImages'])
    for output in files.values():
        soup = BeautifulSoup(output, 'html.parser')
        assert [span.get_text() for span in soup.select('.crumbs > span:not([data-wr-bind])')] == ['>', '>']
        assert all(str(anchor.get('href', '')).startswith(('/en/', '/de/')) for anchor in soup.select('.crumbs a'))
    assert assemble(payload['draft'], {**pages, 'detail': html}, payload['designImages'])
    assert asyncio.run(builder.assess_page('detail', html, payload)).issues == []


@pytest.mark.parametrize('left,right', [
    ('<a data-wr-page="home">Home</a>', '<a data-wr-page="catalog">Collection</a>'),
    ('<span data-wr-bind="ui.home"></span>', '<span data-wr-bind="product.name"></span>'),
])
def test_separator_rule_does_not_depend_on_class_or_css(breadcrumb_page, left, right):
    payload, pages = breadcrumb_page
    html = pages['detail'].replace('<main>', '<main><div>' + left + '<span> &gt; </span>' + right + '</div>')
    assert any(text.strip() == '>' for text in sanitize(html).find_all(string=True))
    assert asyncio.run(builder.assess_page('detail', html, payload)).issues == []


@pytest.mark.parametrize('fragment', [
    '<a data-wr-page="home">Home</a><span>&gt; Guaranteed</span><span data-wr-bind="product.name"></span>',
    '<a data-wr-page="home">Home</a><span>›</span><span data-wr-bind="product.name"></span>',
    '<a data-wr-page="home">Home</a><span>→</span><span data-wr-bind="product.name"></span>',
    '<a data-wr-page="home">Home</a><span>Certified</span><span data-wr-bind="product.name"></span>',
    '<a data-wr-page="home">Home</a><span><span>&gt;</span></span><span data-wr-bind="product.name"></span>',
    '<a data-wr-page="home">Home</a><div>&gt;</div><span data-wr-bind="product.name"></span>',
    '<span>Home</span><span>&gt;</span><span data-wr-bind="product.name"></span>',
    '<span data-wr-bind="product.description"></span><span>&gt;</span><span data-wr-bind="product.name"></span>',
    '<a data-wr-page="home">Home</a><span>&gt;</span><span>Unapproved product claim</span>',
    '<a data-wr-page="home">Home</a><span>&gt;</span>',
    '<span>&gt;</span><span data-wr-bind="product.name"></span>',
    '<span data-wr-page="home">Home</span><span>&gt;</span><span data-wr-bind="product.name"></span>',
    '<a data-wr-page="unknown-page">Home</a><span>&gt;</span><span data-wr-bind="product.name"></span>',
    '<span data-wr-bind="unknown.field"></span><span>&gt;</span><span data-wr-bind="product.name"></span>',
], ids=['mixed-claim', 'other-chevron', 'arrow-icon', 'claim', 'nested-span', 'wrong-tag', 'untrusted-left', 'unrelated-binding', 'untrusted-right', 'no-right', 'no-left', 'fake-nav-span', 'unknown-page', 'unknown-binding'])
def test_arbitrary_claims_symbols_and_unsupported_neighbors_remain_rejected(breadcrumb_page, fragment):
    payload, pages = breadcrumb_page
    html = pages['detail'].replace('<main>', '<main><div class="crumbs">' + fragment + '</div>')
    cleaned = sanitize(html).select_one('.crumbs')
    assert cleaned is not None and cleaned.get_text(strip=True) == ''
    result = asyncio.run(builder.assess_page('detail', html, payload))
    assert any('unbound visible text' in issue or 'Unknown' in issue for issue in result.issues)
