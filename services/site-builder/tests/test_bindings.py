"""Approved layout contracts at the trusted assembly boundary."""
import json
from pathlib import Path

import pytest
from bs4 import BeautifulSoup, Tag
from playwright.sync_api import sync_playwright

from assembler import LABELS, OutputValidationError, assemble_page


CARD = '<article data-wr-product><h2 data-wr-bind="product.name"></h2><a data-wr-page="detail"><img data-wr-bind="product.image"></a></article>'
SLOTTED_FORM = '''<section class="inquiry-layout" style="display:grid;grid-template-columns:1fr 1fr;gap:24px" data-wr-form>
  <div class="name-row"><label data-wr-bind="ui.name"></label><span data-wr-field="name" class="name-input" style="border-radius:18px" onclick="alert(1)" maxlength="9999"></span></div>
  <label class="email-row"><span data-wr-bind="ui.email"></span><span data-wr-field="email" class="email-input"></span></label>
  <div class="company-row"><label data-wr-bind="ui.company"></label><span data-wr-field="company"></span></div>
  <div class="product-row"><label data-wr-bind="ui.catalog"></label><span data-wr-field="productId"></span></div>
  <div class="message-row"><label data-wr-bind="ui.message"></label><span data-wr-field="message"></span></div>
  <div class="submit-row"><span data-wr-field="submit" class="send-button" style="background:rgb(18, 52, 86)"></span><span>Invented guarantee</span></div>
</section>'''


def collection(ids=None):
    soup = BeautifulSoup(f'<section data-wr-products>{CARD}</section>', 'html.parser')
    listing = soup.select_one('[data-wr-products]')
    assert listing is not None
    if ids is not None:
        listing['data-wr-product-ids'] = json.dumps(ids)
    return str(soup)


def with_main(pages, page, body):
    soup = BeautifulSoup(pages[page], 'html.parser')
    assert soup.main is not None
    soup.main.clear()
    soup.main.append(BeautifulSoup(body, 'html.parser'))
    return str(soup)


def test_compact_cards_allow_omitted_description_with_all_products_default(draft, pages):
    html = assemble_page(draft, 'catalog', with_main(pages, 'catalog', collection()))['en/products/index.html']
    soup = BeautifulSoup(html, 'html.parser')
    assert [node.get_text() for node in soup.select('[data-wr-product] h2')] == ['Block <One>', 'Block Two']
    assert soup.select('[data-wr-bind="product.description"]') == []


def test_explicit_collections_preserve_exact_ids_order_translations_and_catalog_coverage(draft, pages):
    body = collection(['second']) + collection(['a/b ?', 'second'])
    html = assemble_page(draft, 'catalog', with_main(pages, 'catalog', body))['de/products/index.html']
    soup = BeautifulSoup(html, 'html.parser')
    assert [[node.get_text() for node in listing.select('h2')] for listing in soup.select('[data-wr-products]')] == [
        ['Baustein Zwei'], ['Baustein Eins', 'Baustein Zwei'],
    ]
    assert [a['data-wr-product-id'] for a in soup.select('[data-wr-product] a')] == ['second', 'a/b ?', 'second']
    assert soup.select('[data-wr-product] a')[1]['href'] == '/de/products/a%2Fb%20%3F/'


@pytest.mark.parametrize('raw_ids', ['[]', '["missing"]', '["second", "second"]', '{}', 'null', '"second"', '[1]', '[["second"]]', 'bad JSON'])
def test_rejects_malformed_or_unapproved_collection_selection(draft, pages, raw_ids):
    soup = BeautifulSoup(collection().replace('</article>', '<p data-wr-bind="product.description"></p></article>'), 'html.parser')
    listing = soup.select_one('[data-wr-products]')
    assert listing is not None
    listing['data-wr-product-ids'] = raw_ids
    with pytest.raises(OutputValidationError, match='[Pp]roduct'):
        assemble_page(draft, 'catalog', with_main(pages, 'catalog', str(soup)))


def test_catalog_cannot_drop_a_product_but_other_pages_can_select_recommendations(draft, pages):
    with pytest.raises(OutputValidationError, match='[Cc]atalog'):
        assemble_page(draft, 'catalog', with_main(pages, 'catalog', collection(['second'])))
    html = pages['about'].replace('</main>', collection(['second']) + '</main>')
    soup = BeautifulSoup(assemble_page(draft, 'about', html)['en/about/index.html'], 'html.parser')
    assert len(soup.select('[data-wr-product]')) == 1


@pytest.mark.parametrize('markup', [
    f'<div data-wr-product-ids="[]">{collection()}</div>',
    f'<section data-wr-products><div>{CARD}</div></section>',
    f'<section data-wr-products>{CARD}{CARD}</section>',
    f'<section data-wr-products>{collection()}</section>',
    f'<section data-wr-products data-wr-product>{CARD}</section>',
])
def test_rejects_malformed_collection_structure(draft, pages, markup):
    with pytest.raises(OutputValidationError):
        assemble_page(draft, 'catalog', with_main(pages, 'catalog', markup))


def test_detail_still_requires_full_description_outside_recommendations(draft, pages):
    html = pages['detail'].replace('data-wr-bind="product.description"', '')
    html = html.replace('</main>', collection() + '</main>')
    with pytest.raises(OutputValidationError, match='detail'):
        assemble_page(draft, 'detail', html)


def test_base_navigation_uses_short_trusted_labels_and_extra_page_title(guided_draft, pages):
    html = assemble_page(guided_draft, 'home', pages['home'])['de/index.html']
    soup = BeautifulSoup(html, 'html.parser')
    nav = soup.select_one('[data-wr-nav]')
    assert nav is not None
    assert [a.get_text() for a in nav.select(':scope > a')] == ['Startseite', 'Kollektion', 'Unser Unternehmen', 'Kontakt', 'Pflegehinweise']
    current = nav.select_one('[aria-current="page"]')
    english_link = nav.select_one('[data-wr-languages] [lang="en"]')
    assert current is not None and current['href'] == '/de/'
    assert english_link is not None and english_link['href'] == '/en/'


@pytest.mark.parametrize('page,path,title', [('home', 'index.html', 'Willkommen'), ('catalog', 'products/index.html', 'Kollektion'), ('detail', 'products/second/index.html', 'Produkt'), ('about', 'about/index.html', 'Unsere Geschichte'), ('contact', 'contact/index.html', 'Kontakt')])
def test_approved_base_title_is_optional_and_localized(guided_draft, pages, page, path, title):
    assert assemble_page(guided_draft, page, pages[page])
    html = pages[page].replace('<main>', '<main><h1 class="approved-title" data-wr-bind="page.title"></h1>')
    soup = BeautifulSoup(assemble_page(guided_draft, page, html)[f'de/{path}'], 'html.parser')
    heading = soup.select_one('.approved-title')
    assert heading is not None and heading.get_text() == title


@pytest.mark.parametrize('mutation', ['duplicate-title', 'title-in-list', 'duplicate-section', 'reordered-section'])
def test_base_optional_title_keeps_multiplicity_and_section_order_strict(guided_draft, pages, mutation):
    home = guided_draft['consultation']['brief']['pages'][0]
    for lang in guided_draft['languages']:
        home['content'][lang]['sections'] = [{'heading': 'Approved heading', 'body': 'Approved body'}]
    title = '<h2 data-wr-bind="page.title"></h2>'
    sections = '<h2 data-wr-bind="section.0.heading"></h2><p data-wr-bind="section.0.body"></p>'
    if mutation == 'duplicate-title':
        title *= 2
    elif mutation == 'title-in-list':
        title = collection().replace('</article>', title + '</article>')
    elif mutation == 'duplicate-section':
        sections += '<p data-wr-bind="section.0.body"></p>'
    else:
        sections = '<p data-wr-bind="section.0.body"></p><h2 data-wr-bind="section.0.heading"></h2>'
    html = pages['home'].replace('</main>', title + sections + '</main>')
    with pytest.raises(OutputValidationError):
        assemble_page(guided_draft, 'home', html)


def test_title_without_approved_page_content_is_rejected(draft, pages):
    html = pages['home'].replace('</main>', '<h2 data-wr-bind="page.title"></h2></main>')
    with pytest.raises(OutputValidationError):
        assemble_page(draft, 'home', html)


def test_slotted_form_preserves_layout_with_trusted_controls_and_accessible_labels(draft, pages):
    html = assemble_page(draft, 'contact', with_main(pages, 'contact', SLOTTED_FORM))['de/contact/index.html']
    soup = BeautifulSoup(html, 'html.parser')
    form = soup.select_one('form[data-wr-inquiry]')
    assert form is not None and form.get('class') == ['inquiry-layout']
    assert 'grid-template-columns:1fr 1fr' in form['style']
    assert form['action'] == '__WR_INQUIRY__' and form['method'] == 'post'
    assert len(form.select('.name-row, .email-row, .company-row, .product-row, .message-row, .submit-row')) == 6
    fields = {str(field['name']): field for field in form.select('input,textarea,select')}
    assert set(fields) == {'name', 'email', 'company', 'message', 'productId'}
    assert fields['name']['class'] == ['name-input'] and fields['name']['style'] == 'border-radius:18px'
    assert fields['name']['type'] == 'text' and fields['email']['type'] == 'email'
    assert fields['message'].name == 'textarea' and fields['productId'].name == 'select'
    assert {name: field.get('maxlength') for name, field in fields.items() if name != 'productId'} == {'name': '120', 'email': '254', 'company': '200', 'message': '5000'}
    assert {name for name, field in fields.items() if field.has_attr('required')} == {'name', 'email', 'message'}
    for name, field in fields.items():
        label = form.find('label', attrs={'for': field['id']})
        assert label is not None and label.get_text(strip=True) == LABELS['de']['catalog' if name == 'productId' else name]
    button = form.select_one('button[type="submit"]')
    assert button is not None
    assert button['class'] == ['send-button'] and button.get_text() == 'Anfrage senden'
    assert button['style'] == 'background:rgb(18, 52, 86)'
    status = form.select_one('[role="status"]')
    assert status is not None
    assert status['aria-live'] == 'polite' and form['aria-describedby'] == status['id']
    assert all(term not in html for term in ['Invented guarantee', 'onclick', '9999'])


@pytest.mark.parametrize('mutation', ['missing', 'duplicate', 'unknown', 'outside', 'nested-form', 'nonempty-legacy', 'non-span', 'nested-slot', 'bound-slot'])
def test_rejects_invalid_field_slots(draft, pages, mutation):
    html = SLOTTED_FORM
    if mutation == 'missing':
        html = html.replace('data-wr-field="company"', '')
    elif mutation == 'duplicate':
        html = html.replace('data-wr-field="company"', 'data-wr-field="email"')
    elif mutation == 'unknown':
        html = html.replace('data-wr-field="company"', 'data-wr-field="telephone"')
    elif mutation == 'outside':
        html += '<span data-wr-field="name"></span>'
    elif mutation == 'nested-form':
        html = html.replace('<div class="name-row">', '<div class="name-row" data-wr-form>')
    elif mutation == 'nonempty-legacy':
        html = '<div data-wr-form><span data-wr-bind="ui.name"></span></div>'
    elif mutation == 'non-span':
        html = html.replace('<span data-wr-field="company"></span>', '<div data-wr-field="company"></div>')
    elif mutation == 'nested-slot':
        html = html.replace('<span data-wr-field="company"></span>', '<span data-wr-field="company"><i></i></span>')
    else:
        html = html.replace('data-wr-field="company"', 'data-wr-field="company" data-wr-bind="ui.company"')
    with pytest.raises(OutputValidationError, match='[Ff]orm|[Ff]ield'):
        assemble_page(draft, 'contact', with_main(pages, 'contact', html))


@pytest.mark.parametrize('page', ['detail', 'about'])
def test_forms_supported_on_other_pages_with_current_detail_product_preselected(draft, pages, page):
    html = pages[page].replace('</main>', SLOTTED_FORM + '</main>')
    outputs = assemble_page(draft, page, html)
    for path, output in outputs.items():
        soup = BeautifulSoup(output, 'html.parser')
        selected = soup.select('[name="productId"] option[selected]')
        if page == 'detail':
            assert len(selected) == 1
            assert selected[0]['value'] == ('second' if '/second/' in path else 'a/b ?')
        else:
            assert selected == []


def test_multiple_forms_get_unique_accessible_control_and_status_ids(draft, pages):
    html = assemble_page(draft, 'contact', with_main(pages, 'contact', SLOTTED_FORM * 2))['en/contact/index.html']
    soup = BeautifulSoup(html, 'html.parser')
    ids = [node['id'] for node in soup.select('form [id]')]
    assert len(ids) == len(set(ids))
    assert len(soup.select('form')) == 2
    assert all(form.find(id=form['aria-describedby']) for form in soup.select('form'))


def test_flat_slotted_form_associates_each_bound_label_with_its_control(draft, pages):
    slots = ''.join(
        f'<label data-wr-bind="ui.{label}"></label><span data-wr-field="{name}"></span>'
        for name, label in [('name', 'name'), ('email', 'email'), ('company', 'company'), ('message', 'message'), ('productId', 'catalog')]
    ) + '<span data-wr-field="submit"></span>'
    html = with_main(pages, 'contact', f'<div data-wr-form>{slots}</div>')
    soup = BeautifulSoup(assemble_page(draft, 'contact', html)['en/contact/index.html'], 'html.parser')
    for label in soup.select('form label'):
        assert label.has_attr('for')
        field = soup.find(id=label['for'])
        assert isinstance(field, Tag) and field['aria-label'] == label.get_text()


def test_slotted_form_rejects_model_buttons_that_would_become_submit_controls(draft, pages):
    html = SLOTTED_FORM.replace('</section>', '<button data-wr-bind="ui.send"></button></section>')
    with pytest.raises(OutputValidationError, match='[Ff]orm'):
        assemble_page(draft, 'contact', with_main(pages, 'contact', html))


@pytest.mark.parametrize('location', ['collection', 'card'])
def test_field_slots_cannot_be_expanded_or_discarded_inside_product_collections(draft, pages, location):
    slot = '<span data-wr-field="company"></span>'
    listing = collection().replace('</article>' if location == 'card' else '</section>', slot + ('</article>' if location == 'card' else '</section>'))
    html = SLOTTED_FORM.replace(slot, '').replace('</section>', listing + '</section>')
    with pytest.raises(OutputValidationError, match='Field slots.*product'):
        assemble_page(draft, 'contact', with_main(pages, 'contact', html))


@pytest.mark.parametrize('property_name', ['elements', 'querySelector', 'addEventListener', 'reportValidity', 'reset', 'getAttribute', 'dataset'])
def test_authored_image_ids_cannot_shadow_the_trusted_form_runtime(draft, pages, property_name):
    markup = SLOTTED_FORM.replace('</section>', f'<img data-wr-bind="company.logo" id="{property_name}"><div id="preserved-layout-id"></div></section>')
    html = assemble_page(draft, 'contact', with_main(pages, 'contact', markup))['en/contact/index.html'].replace('__WR_INQUIRY__', 'https://site.test/api/inquiries')
    with sync_playwright() as playwright:
        if not Path(playwright.chromium.executable_path).exists():
            pytest.skip('Install Playwright Chromium to run browser acceptance')
        browser = playwright.chromium.launch()
        page = browser.new_page()
        errors = []
        sent = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        def respond(route):
            if route.request.url == 'https://site.test/api/inquiries':
                sent.append(route.request.post_data_json)
                route.fulfill(status=200, content_type='application/json', body='{}')
            elif route.request.resource_type == 'document':
                route.fulfill(status=200, content_type='text/html', body=html)
            else:
                route.abort()
        page.route('**/*', respond)
        page.goto('https://site.test/en/contact/')
        assert errors == []
        assert page.locator('form').evaluate('(form) => form.elements instanceof HTMLFormControlsCollection')
        assert page.locator('form').evaluate('(form) => ["querySelector","addEventListener","reportValidity","reset","getAttribute"].every(name => typeof form[name] === "function")')
        assert page.locator('form').evaluate('(form) => form.dataset instanceof DOMStringMap')
        assert page.locator('#preserved-layout-id').count() == 1
        page.get_by_label('Your name', exact=True).fill('Buyer')
        page.get_by_label('Email address', exact=True).fill('buyer@example.test')
        page.get_by_label('Your message', exact=True).fill('Please quote the product')
        page.get_by_role('button', name='Send inquiry', exact=True).click()
        page.get_by_role('status').filter(has_text='Your inquiry has been saved').wait_for()
        assert len(sent) == 1 and sent[0]['message'] == 'Please quote the product'
        assert errors == []
        browser.close()


@pytest.mark.parametrize('selector_kind', ['class', 'field-slot'])
def test_model_css_controls_navigation_and_slotted_form_layout_in_browser(draft, pages, selector_kind):
    html = with_main(pages, 'contact', SLOTTED_FORM)
    name_selector = '.name-input' if selector_kind == 'class' else '[data-wr-field="name"]'
    submit_selector = '.send-button' if selector_kind == 'class' else '[data-wr-field="submit"]'
    html = html.replace('</style>', '.wr-navigation{gap:31px;padding:3px}.inquiry-layout label{display:block}' + name_selector + '{padding:2px}' + submit_selector + '{padding:5px;color:rgb(255,255,255)}</style>')
    html = assemble_page(draft, 'contact', html)['en/contact/index.html']
    with sync_playwright() as playwright:
        if not Path(playwright.chromium.executable_path).exists():
            pytest.skip('Install Playwright Chromium to run browser acceptance')
        browser = playwright.chromium.launch()
        page = browser.new_page(viewport={'width': 1200, 'height': 900})
        page.route('**/*', lambda route: route.abort())
        page.set_content(html)
        assert page.locator('[data-wr-nav]').evaluate('(node) => getComputedStyle(node).gap') == '31px'
        assert page.locator('form').evaluate('(node) => getComputedStyle(node).maxWidth') == 'none'
        name_box = page.locator('.name-row').bounding_box()
        email_box = page.locator('.email-row').bounding_box()
        assert name_box is not None and email_box is not None and name_box['y'] == email_box['y']
        assert page.locator('.name-input').evaluate('(node) => getComputedStyle(node).padding') == '2px'
        assert page.locator('.send-button').evaluate('(node) => getComputedStyle(node).backgroundColor') == 'rgb(18, 52, 86)'
        assert page.locator('.send-button').evaluate('(node) => getComputedStyle(node).padding') == '5px'
        assert page.locator('.send-button').evaluate('(node) => getComputedStyle(node).color') == 'rgb(255, 255, 255)'
        assert page.get_by_label('Your name', exact=True).count() == 1
        assert page.get_by_label('Email address', exact=True).count() == 1
        browser.close()
