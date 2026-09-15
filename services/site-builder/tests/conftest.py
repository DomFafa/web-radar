import base64
import copy
import io

import pytest
from PIL import Image


@pytest.fixture(autouse=True)
def isolated_builder_storage(monkeypatch, tmp_path):
    monkeypatch.setenv('SITE_BUILDER_DB', str(tmp_path / 'builds.sqlite3'))


@pytest.fixture
def draft():
    return {
        "company": {"name": "Acme <&>", "email": "sales@example.test", "description": "Approved company", "logoAssetId": "00000000-0000-4000-8000-000000000001"},
        "products": [
            {"id": "a/b ?", "name": "Block <One>", "description": "Approved first", "material": "Wood", "dimensions": "10 cm", "imageAssetId": "00000000-0000-4000-8000-000000000002", "translations": {"de": {"name": "Baustein Eins", "description": "Erstes Produkt"}}, "source": {"conditions": {"keep": "round corners"}}},
            {"id": "second", "name": "Block Two", "description": "Approved second", "material": "Cork", "dimensions": "20 cm", "imageAssetId": "00000000-0000-4000-8000-000000000003", "translations": {"de": {"name": "Baustein Zwei", "description": "Zweites Produkt"}}},
        ],
        "languages": ["en", "de"], "primaryProductId": "a/b ?",
        "copy": {"en": {"headline": "Build <together>", "subtitle": "Approved subtitle", "about": "Approved about", "cta": "Explore"}, "de": {"headline": "Zusammen bauen", "subtitle": "Untertitel", "about": "Über uns", "cta": "Entdecken"}},
    }


@pytest.fixture
def pages():
    card = '<article data-wr-product><img data-wr-bind="product.image"><h2 data-wr-bind="product.name"></h2><p data-wr-bind="product.description"></p><a data-wr-page="detail">Fake link</a></article>'
    contents = {
        "home": '<h1 data-wr-bind="copy.headline"></h1><p data-wr-bind="copy.subtitle"></p>',
        "catalog": f'<section data-wr-products>{card}</section>',
        "detail": '<h1 data-wr-bind="product.name"></h1><p data-wr-bind="product.description"></p><img data-wr-bind="product.image"><span data-wr-bind="product.material"></span><span data-wr-bind="product.dimensions"></span>',
        "about": '<p data-wr-bind="copy.about"></p>',
        "contact": '<div data-wr-form></div>',
    }
    return {page: f'<!doctype html><html><head><style>body{{color:#123}} .grid{{display:grid}}</style></head><body><header><b data-wr-bind="company.name"></b><img data-wr-bind="company.logo"></header><main>{body}</main></body></html>' for page, body in contents.items()}


@pytest.fixture
def payload(draft):
    out = io.BytesIO()
    Image.new("RGB", (2, 2), "white").save(out, format="PNG")
    data_url = "data:image/png;base64," + base64.b64encode(out.getvalue()).decode()
    return {"id": "test-job-1", "draft": draft, "designImages": {p: data_url for p in ("home", "catalog", "detail", "about", "contact")}}


@pytest.fixture
def guided_draft(draft):
    result = copy.deepcopy(draft)
    titles = {
        "home": {"en": "Welcome", "de": "Willkommen"},
        "catalog": {"en": "Collection", "de": "Kollektion"},
        "detail": {"en": "Product", "de": "Produkt"},
        "about": {"en": "Our story", "de": "Unsere Geschichte"},
        "contact": {"en": "Contact", "de": "Kontakt"},
    }
    planned = [
        {
            "id": page,
            "label": page,
            "purpose": f"Approved {page} purpose",
            "content": {
                lang: {"title": title, "sections": []}
                for lang, title in localized.items()
            },
        }
        for page, localized in titles.items()
    ]
    planned.append({
        "id": "extra-care-guide",
        "label": "保养指南",
        "purpose": "Explain approved care facts",
        "content": {
            "en": {
                "title": "Care guide",
                "sections": [
                    {"heading": "Daily care", "body": "Wipe with a dry cloth."},
                    {"heading": "Storage", "body": "Store in a dry place."},
                ],
            },
            "de": {
                "title": "Pflegehinweise",
                "sections": [
                    {"heading": "Tägliche Pflege", "body": "Mit einem trockenen Tuch abwischen."},
                    {"heading": "Aufbewahrung", "body": "Trocken lagern."},
                ],
            },
        },
    })
    result["consultation"] = {
        "revision": 2,
        "answers": [],
        "confirmed": True,
        "brief": {
            "summary": "Approved summary",
            "audience": "Approved buyers",
            "goal": "Explain the real collection",
            "visualDirection": "Warm editorial photography",
            "layout": "Clear sections with generous spacing",
            "brandColor": "#123456",
            "keep": ["Keep product geometry and branding"],
            "avoid": ["Avoid unsupported certification claims"],
            "pages": planned,
            "copy": copy.deepcopy(result["copy"]),
            "productTranslations": {
                product["id"]: {
                    lang: {
                        "name": product.get("translations", {}).get(lang, {}).get("name", product["name"]),
                        "description": product.get("translations", {}).get(lang, {}).get("description", product["description"]),
                    }
                    for lang in result["languages"]
                }
                for product in result["products"]
            },
        },
    }
    return result


@pytest.fixture
def guided_payload(guided_draft, payload):
    payload["draft"] = guided_draft
    payload["designImages"]["extra-care-guide"] = payload["designImages"]["home"]
    return payload
