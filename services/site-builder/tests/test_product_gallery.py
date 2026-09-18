import copy
import pytest
from bs4 import BeautifulSoup
from app import validate_request
from assembler import assemble
from builder import messages_for


def with_gallery(draft):
    product = draft['products'][0]
    product['gallery'] = [
        {'assetId': product['imageAssetId'], 'sourceImageId': 'original', 'kind': 'original', 'caption': 'Original'},
        {'assetId': 'gallery-detail', 'sourceImageId': 'detail', 'kind': 'detail', 'caption': 'Approved detail'},
    ]
    product['tagline'] = 'Designed for daily use'
    product['sellingPoints'] = ['Approved visible feature']
    product['applications'] = ['Everyday use']
    return product


def gallery_pages(pages):
    result = copy.deepcopy(pages)
    result['detail'] = result['detail'].replace('</main>', '<div data-wr-bind="product.gallery"></div><p data-wr-bind="product.tagline"></p><ul data-wr-bind="product.sellingPoints"></ul><ul data-wr-bind="product.applications"></ul></main>')
    return result


def test_accepts_only_approved_gallery_reference_assets(payload):
    with_gallery(payload['draft'])
    payload['referenceAssets'] = {'gallery-detail': payload['designImages']['home']}
    assert validate_request(payload) is payload
    payload['referenceAssets']['not-selected'] = payload['designImages']['home']
    with pytest.raises(ValueError, match='approved'):
        validate_request(payload)


def test_binds_saved_gallery_and_website_fields_without_repeating_primary(draft, pages):
    product = with_gallery(draft)
    files = assemble(draft, gallery_pages(pages))
    detail = BeautifulSoup(files['en/products/a%2Fb%20%3F/index.html'], 'html.parser')
    assert len(detail.select(f'img[src="__WR_ASSET_{product["imageAssetId"]}__"]')) == 1
    gallery = detail.select_one('[data-wr-bind="product.gallery"]')
    assert gallery is not None
    assert [image['src'] for image in gallery.select('img')] == ['__WR_ASSET_gallery-detail__']
    tagline = detail.select_one('[data-wr-bind="product.tagline"]')
    assert tagline is not None and tagline.get_text() == product['tagline']
    assert [node.get_text() for node in detail.select('[data-wr-bind="product.sellingPoints"] li')] == product['sellingPoints']
    second = BeautifulSoup(files['en/products/second/index.html'], 'html.parser')
    assert not second.select('[data-wr-bind="product.gallery"]')
    assert len(second.select('img[data-wr-bind="product.image"]')) == 1


def test_requires_gallery_binding_when_selected_images_exist(draft, pages):
    with_gallery(draft)
    with pytest.raises(ValueError, match='binding'):
        assemble(draft, pages)


def test_rejects_unbounded_or_invalid_gallery_ids(payload):
    product = with_gallery(payload['draft'])
    product['gallery'][1]['assetId'] = '../secret'
    with pytest.raises(ValueError, match='asset'):
        validate_request(payload)


def test_generation_contract_exposes_only_supplied_gallery_assets(payload):
    with_gallery(payload['draft'])
    messages = messages_for('detail', payload['draft'], payload['designImages']['detail'])
    text = str(messages)
    assert 'product.gallery' in text
    assert 'gallery-detail' in text
    assert 'product.tagline' in text


def test_gallery_references_do_not_change_scene_generation_primary_products(payload):
    from generated_assets import _originals
    product = with_gallery(payload['draft'])
    payload['referenceAssets'] = {product['imageAssetId']: payload['designImages']['home'], 'gallery-detail': payload['designImages']['home']}
    originals = _originals(payload)
    assert [entry[0]['id'] for entry in originals] == [product['id']]
