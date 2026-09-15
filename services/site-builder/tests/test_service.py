import asyncio
import copy
import importlib.util
import sqlite3
import time

import pytest
from bs4 import BeautifulSoup
from fastapi.testclient import TestClient


def modules():
    # An assertion gives an intentional RED before the implementation exists.
    assert importlib.util.find_spec("assembler"), "DOM assembler is not implemented"
    assert importlib.util.find_spec("app"), "Persistent build service is not implemented"
    import assembler
    import app
    return assembler, app


def wait_result(client, job_id="test-job-1"):
    for _ in range(200):
        response = client.get(f"/v1/builds/{job_id}", headers={"Authorization": "Bearer shared-test-key"})
        if response.json()["state"] != "pending":
            return response.json()
        time.sleep(.01)
    pytest.fail("Job did not finish")


def test_exact_facts_routes_languages_assets_and_trusted_form(draft, pages):
    assembler, _ = modules()
    files = assembler.assemble(draft, pages)
    assert set(files) == {f"{lang}/{path}" for lang in ("en", "de") for path in ("index.html", "products/index.html", "products/a%2Fb%20%3F/index.html", "products/second/index.html", "about/index.html", "contact/index.html")}
    catalog = BeautifulSoup(files["de/products/index.html"], "html.parser")
    assert [n.get_text() for n in catalog.select('[data-wr-bind="product.name"]')] == ["Baustein Eins", "Baustein Zwei"]
    detail_link = catalog.select_one('[data-wr-page="detail"]')
    assert detail_link is not None
    assert detail_link["href"] == "/de/products/a%2Fb%20%3F/"
    assert detail_link["data-wr-product-id"] == "a/b ?"
    assert 'Block &lt;One&gt;' in files["en/products/a%2Fb%20%3F/index.html"]
    assert "__WR_ASSET_00000000-0000-4000-8000-000000000002__" in str(catalog)
    form = BeautifulSoup(files["en/contact/index.html"], "html.parser")
    assert {str(n.get("name")) for n in form.select("input,textarea,select")} >= {"name", "email", "company", "message", "productId"}
    inquiry_form = form.select_one("form")
    assert inquiry_form is not None and inquiry_form["action"] == "__WR_INQUIRY__"
    assert len(form.select('script[data-wr-trusted]')) == 1
    assert "round corners" not in "".join(files.values())


def test_sanitizes_model_html_and_rejects_missing_page_contract(draft, pages):
    assembler, _ = modules()
    pages["home"] = pages["home"].replace("</main>", '<script>secret()</script><img src="https://evil.test/x"><iframe src="file:///etc/passwd"></iframe><a href="javascript:alert(1)" onclick="fetch(1)">invented fact</a><style>@import "https://evil.test/x";p{background:u\\72l(https://evil.test/secret)}</style><form action="https://evil.test"><input></form></main>')
    result = assembler.assemble(draft, pages)["en/index.html"]
    assert all(term not in result for term in ("evil.test", "secret()", "onclick", "javascript:", "invented fact", "iframe"))
    assert len(BeautifulSoup(result, "html.parser").select("script")) == 1
    with pytest.raises(ValueError):
        assembler.assemble(draft, {k: v for k, v in pages.items() if k != "about"})
    pages["detail"] = "<html><body>Screenshot-only imitation<img src='data:image/png;base64,AA=='></body></html>"
    with pytest.raises(ValueError):
        assembler.assemble(draft, pages)


def test_auth_idempotency_conflict_and_persistent_success(tmp_path, payload, pages):
    assembler, app = modules()
    calls = []
    async def generate(request):
        calls.append(request)
        return assembler.assemble(request["draft"], pages)
    db = tmp_path / "jobs.sqlite"
    with TestClient(app.create_app(db_path=db, key="shared-test-key", build=generate)) as client:
        assert client.post("/v1/builds", json=payload).status_code == 401
        auth = {"Authorization": "Bearer shared-test-key"}
        assert client.post("/v1/builds", json=payload, headers=auth).status_code == 202
        assert client.post("/v1/builds", json=payload, headers=auth).status_code == 202
        changed = copy.deepcopy(payload)
        changed["draft"]["company"]["name"] = "Changed"
        assert client.post("/v1/builds", json=changed, headers=auth).status_code == 409
        result = wait_result(client)
        assert result["state"] == "succeeded" and "en/index.html" in result["files"]
        assert len(calls) == 1
    with TestClient(app.create_app(db_path=db, key="shared-test-key", build=generate)) as client:
        assert wait_result(client) == result
        assert len(calls) == 1


def test_invalid_images_sizes_and_secret_safe_failure(tmp_path, payload):
    _, app = modules()
    async def broken(request):
        raise RuntimeError("provider key sk-secret-do-not-expose")
    auth = {"Authorization": "Bearer shared-test-key"}
    with TestClient(app.create_app(db_path=tmp_path / "jobs.db", key="shared-test-key", build=broken)) as client:
        for value in ("file:///tmp/image.png", "https://example.test/image.png", "data:image/png;base64,YmFk"):
            invalid = copy.deepcopy(payload)
            invalid["designImages"]["home"] = value
            assert client.post("/v1/builds", json=invalid, headers=auth).status_code == 422
        assert client.post("/v1/builds", content=b"{}", headers={**auth, "Content-Length": str(70 * 1024 * 1024 + 1)}).status_code == 413
        assert client.post("/v1/builds", json=payload, headers=auth).status_code == 202
        result = wait_result(client)
        assert result["state"] == "failed" and "sk-secret" not in str(result)
        assert client.post("/v1/builds", json=payload, headers=auth).status_code == 202
        assert wait_result(client) == result


def test_restart_recovers_queued_but_does_not_retry_interrupted_spend(tmp_path, payload, pages):
    assembler, app = modules()
    db = tmp_path / "restart.db"
    async def generate(request):
        return assembler.assemble(request["draft"], pages)
    # Seed durable accepted jobs through the same repository used by HTTP.
    store = app.JobStore(db)
    store.accept(payload)
    interrupted = copy.deepcopy(payload)
    interrupted["id"] = "interrupted"
    store.accept(interrupted)
    with sqlite3.connect(db) as connection:
        connection.execute("UPDATE jobs SET state='running' WHERE id='interrupted'")
    with TestClient(app.create_app(db_path=db, key="shared-test-key", build=generate)) as client:
        assert wait_result(client)["state"] == "succeeded"
        failed = wait_result(client, "interrupted")
        assert failed["state"] == "failed" and "interrupted" in failed["message"].lower()


def test_bounded_concurrency_and_output_limit(tmp_path, payload):
    _, app = modules()
    active = 0
    maximum = 0
    async def oversized(request):
        nonlocal active, maximum
        active += 1
        maximum = max(maximum, active)
        await asyncio.sleep(.02)
        active -= 1
        return {"en/index.html": "x" * (8 * 1024 * 1024 + 1)}
    with TestClient(app.create_app(db_path=tmp_path / "jobs.db", key="shared-test-key", build=oversized)) as client:
        for job_id in ("test-job-1", "second"):
            body = {**payload, "id": job_id}
            assert client.post("/v1/builds", json=body, headers={"Authorization": "Bearer shared-test-key"}).status_code == 202
        assert wait_result(client)["state"] == "failed"
        assert wait_result(client, "second")["state"] == "failed"
        assert maximum == 1


def test_rejects_binding_into_css_or_nonleaf_nodes(draft, pages):
    assembler, _ = modules()
    draft["company"]["name"] = "</style><script>alert(1)</script>"
    pages["home"] = pages["home"].replace("<style>", '<style data-wr-bind="company.name">')
    with pytest.raises(ValueError):
        assembler.assemble(draft, pages)


def test_css_generated_claims_and_forged_product_links_do_not_survive(draft, pages):
    assembler, _ = modules()
    pages["home"] = pages["home"].replace("</main>", '<style>p::after{content:"Made up certification"}</style><a data-wr-page="home" data-wr-product-id="unapproved">bad</a></main>')
    html = assembler.assemble(draft, pages)["en/index.html"]
    assert "Made up certification" not in html
    assert "unapproved" not in html


def test_missing_translation_and_traversal_product_id_rejected(draft, pages):
    assembler, _ = modules()
    draft["products"][0]["translations"].pop("de")
    with pytest.raises(ValueError):
        assembler.assemble(draft, pages)
    draft["languages"] = ["en"]
    draft["products"][0]["id"] = ".."
    draft["primaryProductId"] = ".."
    with pytest.raises(ValueError):
        assembler.assemble(draft, pages)


def test_failed_output_reports_safe_binding_diagnosis(tmp_path, payload, pages):
    assembler, app = modules()
    pages["detail"] = pages["detail"].replace('data-wr-bind="product.dimensions"', '')
    async def incomplete(request):
        return assembler.assemble(request["draft"], pages)
    with TestClient(app.create_app(db_path=tmp_path / "jobs.db", key="shared-test-key", build=incomplete)) as client:
        client.post("/v1/builds", json=payload, headers={"Authorization": "Bearer shared-test-key"})
        result = wait_result(client)
        assert result["state"] == "failed"
        assert "detail" in result["message"] and "binding" in result["message"]


@pytest.mark.parametrize("asset_id", ["result-00000000-0000-4000-8000-000000000002", "asset_a-123", "a" * 200])
def test_accepts_worker_opaque_asset_ids_and_binds_tokens(draft, pages, asset_id):
    assembler, _ = modules()
    draft["products"][0]["imageAssetId"] = asset_id
    files = assembler.assemble(draft, pages)
    assert f"__WR_ASSET_{asset_id}__" in files["en/products/index.html"]


@pytest.mark.parametrize("asset_id", ["../asset", "a/b", "a\\b", "asset\" onerror=\"alert(1)", "_asset", "a" * 201, "asset.svg", ""])
def test_rejects_unsafe_or_overlong_asset_token_ids(draft, pages, asset_id):
    assembler, _ = modules()
    draft["products"][0]["imageAssetId"] = asset_id
    with pytest.raises(ValueError):
        assembler.assemble(draft, pages)


def test_removes_unbound_text_before_and_after_document(draft, pages):
    assembler, _ = modules()
    pages["home"] = "UNAPPROVED LEADING CLAIM" + pages["home"] + "UNAPPROVED TRAILING CLAIM"
    html = assembler.assemble(draft, pages)["en/index.html"]
    assert "UNAPPROVED" not in html
    assert "Build &lt;together&gt;" in html


@pytest.mark.parametrize("invalid_card", [
    "<article data-wr-product></article>",
    '<article data-wr-product><h2 data-wr-bind="product.name"></h2><img data-wr-bind="product.image"><p data-wr-bind="product.description"></p></article>',
    '<article data-wr-product><img data-wr-bind="product.image"><p data-wr-bind="product.description"></p><a data-wr-page="detail"></a></article>',
    '<article data-wr-product><h2 data-wr-bind="product.name"></h2><p data-wr-bind="product.description"></p><a data-wr-page="detail"></a></article>',
    '<article data-wr-product><section data-wr-products><article data-wr-product><h2 data-wr-bind="product.name"></h2><img data-wr-bind="product.image"><p data-wr-bind="product.description"></p><a data-wr-page="detail"></a></article></section></article>',
])
def test_rejects_incomplete_or_nested_card_even_when_global_hooks_exist(draft, pages, invalid_card):
    assembler, _ = modules()
    soup = BeautifulSoup(pages["catalog"], "html.parser")
    listing = soup.select_one("[data-wr-products]")
    assert listing is not None
    listing.clear()
    listing.append(BeautifulSoup(invalid_card, "html.parser"))
    assert soup.body is not None
    soup.body.append(BeautifulSoup('<h2 data-wr-bind="product.name"></h2><img data-wr-bind="product.image"><p data-wr-bind="product.description"></p><a data-wr-page="detail"></a>', "html.parser"))
    pages["catalog"] = str(soup)
    with pytest.raises(ValueError):
        assembler.assemble(draft, pages)


def test_form_limits_match_public_inquiry_contract(draft, pages):
    assembler, _ = modules()
    soup = BeautifulSoup(assembler.assemble(draft, pages)["en/contact/index.html"], "html.parser")
    assert {str(field.get("name")): str(field.get("maxlength")) for field in soup.select("input,textarea")} == {"name": "120", "email": "254", "company": "200", "message": "5000"}


def test_detail_facts_cannot_be_satisfied_only_by_related_product_cards(draft, pages):
    assembler, _ = modules()
    pages["detail"] = pages["catalog"].replace('</article>', '<span data-wr-bind="product.material"></span><span data-wr-bind="product.dimensions"></span></article>')
    with pytest.raises(ValueError):
        assembler.assemble(draft, pages)


def test_rejects_expanded_page_at_worker_one_megabyte_limit(draft, pages):
    assembler, _ = modules()
    # Bound content is retained, so this exercises the actual expanded file boundary.
    draft["copy"]["en"]["headline"] = "x" * (1024 * 1024)
    with pytest.raises(ValueError):
        assembler.assemble(draft, pages)


def test_nested_navigation_placeholder_replaces_outer_navigation_once(draft, pages):
    assembler, _ = modules()
    pages["about"] = pages["about"].replace("</header>", '<nav class="original-navigation"><span data-wr-nav></span><a data-wr-page="home">Home</a><a data-wr-page="catalog">Collection</a><a data-wr-page="about">About</a><a data-wr-page="contact">Contact</a><span data-wr-languages></span></nav><a class="separate-cta" data-wr-page="contact" data-wr-bind="copy.cta"></a></header>')
    soup = BeautifulSoup(assembler.assemble(draft, pages)["en/about/index.html"], "html.parser")
    nav = soup.select_one("[data-wr-nav]")
    assert nav is not None and nav.name == "nav"
    assert nav.get("class") == ["original-navigation"]
    assert len(soup.select("[data-wr-nav]")) == 1
    assert [n.get("data-wr-page") for n in nav.select(":scope > a")] == ["home", "catalog", "about", "contact"]
    assert len(nav.select("a")) == 6  # Four pages plus two selected languages.
    assert soup.select_one(".separate-cta") is not None


def test_empty_css_content_keeps_shapes_but_removes_generated_words():
    assembler, _ = modules()
    css = assembler.safe_css('.mail::before{content:"";background:red;width:10px}.note::after{content:"Invented certification";height:2px}')
    assert 'content:""' in css and "background:red" in css
    assert "Invented certification" not in css


def test_raw_page_does_not_exceed_decimal_worker_budget(draft, pages):
    assembler, _ = modules()
    draft["copy"]["en"]["headline"] = "x" * 1_000_001
    with pytest.raises(ValueError):
        assembler.assemble(draft, pages)


@pytest.mark.parametrize("image_markup", [
    '<img data-wr-bind="product.image">',
    '<div class="visual-card"><span class="image-frame"><img data-wr-bind="product.image"></span><span class="decoration"></span></div>',
])
def test_catalog_image_only_links_preserve_every_product_image(draft, pages, image_markup):
    assembler, _ = modules()
    soup = BeautifulSoup(pages["catalog"], "html.parser")
    card = soup.select_one("[data-wr-product]")
    assert card is not None
    card.clear()
    card.append(BeautifulSoup(f'<a class="product-image-link" data-wr-page="detail">{image_markup}</a><h2 data-wr-bind="product.name"></h2><p data-wr-bind="product.description"></p>', "html.parser"))
    pages["catalog"] = str(soup)
    files = assembler.assemble(draft, pages)
    for language in ("en", "de"):
        catalog = BeautifulSoup(files[f"{language}/products/index.html"], "html.parser")
        cards = catalog.select("[data-wr-product]")
        assert len(cards) == 2
        for item, product in zip(cards, draft["products"]):
            link = item.select_one("a.product-image-link")
            assert link is not None
            image = link.select_one("img")
            assert image is not None
            assert image["src"] == f"__WR_ASSET_{product['imageAssetId']}__"
            assert link["data-wr-product-id"] == product["id"]
            assert link["aria-label"] == ("View product" if language == "en" else "Produkt ansehen")
            if "visual-card" in image_markup:
                assert link.select_one(".visual-card .image-frame img") is not None
                assert link.select_one(".decoration") is not None


def test_link_labels_only_fill_empty_links_and_preserve_decorative_content(draft, pages):
    assembler, _ = modules()
    pages["home"] = pages["home"].replace('</main>', '<a id="empty-link" data-wr-page="catalog"></a><a id="visual-link" data-wr-page="catalog"><span class="visual-icon"></span></a></main>')
    soup = BeautifulSoup(assembler.assemble(draft, pages)["en/index.html"], "html.parser")
    empty = soup.select_one("#empty-link")
    visual = soup.select_one("#visual-link")
    assert empty is not None and empty.get_text() == "Collection"
    assert visual is not None and visual.select_one(".visual-icon") is not None
    assert visual["aria-label"] == "Collection"


def test_optional_reference_assets_accept_only_original_image_data_urls(payload):
    _, app = modules()
    primary = payload["draft"]["products"][0]["imageAssetId"]
    payload["referenceAssets"] = {primary: payload["designImages"]["home"]}
    assert app.validate_request(payload)["referenceAssets"][primary].startswith("data:image/png;")
    payload["referenceAssets"][primary] = "https://private.test/image.png"
    with pytest.raises(ValueError):
        app.validate_request(payload)


def extra_page_html():
    return '''<!doctype html><html><head><style>body{color:#123}</style></head><body>
    <header><b data-wr-bind="company.name"></b><nav data-wr-nav></nav></header>
    <main><h1 data-wr-bind="page.title"></h1>
    <section><h2 data-wr-bind="section.0.heading"></h2><p data-wr-bind="section.0.body"></p></section>
    <section><h2 data-wr-bind="section.1.heading"></h2><p data-wr-bind="section.1.body"></p></section>
    <p>Invented lifetime warranty</p></main></body></html>'''


def test_guided_extra_page_emits_every_language_route_and_only_approved_content(guided_draft, pages):
    assembler, _ = modules()
    pages["extra-care-guide"] = extra_page_html()
    files = assembler.assemble(guided_draft, pages)
    assert "en/extra-care-guide/index.html" in files
    assert "de/extra-care-guide/index.html" in files
    english = BeautifulSoup(files["en/extra-care-guide/index.html"], "html.parser")
    german = BeautifulSoup(files["de/extra-care-guide/index.html"], "html.parser")
    english_title = english.select_one('h1[data-wr-bind="page.title"]')
    german_title = german.select_one('h1[data-wr-bind="page.title"]')
    assert english_title is not None and english_title.get_text() == "Care guide"
    assert [node.get_text() for node in english.select('[data-wr-bind^="section."]')] == [
        "Daily care", "Wipe with a dry cloth.", "Storage", "Store in a dry place.",
    ]
    assert "Invented lifetime warranty" not in str(english)
    assert german_title is not None and german_title.get_text() == "Pflegehinweise"
    assert [node.get_text() for node in german.select('[data-wr-nav] > a')] == [
        "Startseite", "Kollektion", "Unser Unternehmen", "Kontakt", "Pflegehinweise",
    ]
    current = german.select_one('[data-wr-nav] > a[aria-current="page"]')
    assert current is not None and current["href"] == "/de/extra-care-guide/"
    english_language_link = german.select_one('[data-wr-languages] a[lang="en"]')
    assert english_language_link is not None and english_language_link["href"] == "/en/extra-care-guide/"


def test_guided_base_page_preserves_approved_localized_sections_and_legacy_facts(guided_draft, pages):
    assembler, _ = modules()
    home = guided_draft["consultation"]["brief"]["pages"][0]
    home["content"]["en"]["sections"] = [
        {"heading": "Built for play", "body": "Approved homepage story."},
    ]
    home["content"]["de"]["sections"] = [
        {"heading": "Zum Spielen gemacht", "body": "Freigegebene Startseitengeschichte."},
    ]
    pages["extra-care-guide"] = extra_page_html()
    pages["home"] = pages["home"].replace(
        "</main>",
        '<section><h2 data-wr-bind="section.0.heading"></h2>'
        '<p data-wr-bind="section.0.body"></p></section></main>',
    )
    files = assembler.assemble(guided_draft, pages)
    english = BeautifulSoup(files["en/index.html"], "html.parser")
    german = BeautifulSoup(files["de/index.html"], "html.parser")
    headline = english.select_one('[data-wr-bind="copy.headline"]')
    assert headline is not None and headline.get_text() == "Build <together>"
    assert [node.get_text() for node in english.select('[data-wr-bind^="section."]')] == [
        "Built for play", "Approved homepage story.",
    ]
    assert [node.get_text() for node in german.select('[data-wr-bind^="section."]')] == [
        "Zum Spielen gemacht", "Freigegebene Startseitengeschichte.",
    ]


@pytest.mark.parametrize("mutation", ["duplicate", "reordered"])
def test_planned_content_bindings_require_exactly_once_in_approved_order(guided_draft, pages, mutation):
    assembler, _ = modules()
    html = extra_page_html()
    if mutation == "duplicate":
        html = html.replace(
            "</main>",
            '<p data-wr-bind="section.0.body"></p></main>',
        )
    else:
        html = html.replace(
            '<h2 data-wr-bind="section.0.heading"></h2><p data-wr-bind="section.0.body"></p>',
            '<p data-wr-bind="section.0.body"></p><h2 data-wr-bind="section.0.heading"></h2>',
        )
    pages["extra-care-guide"] = html
    with pytest.raises(ValueError, match="approved order"):
        assembler.assemble(guided_draft, pages)


@pytest.mark.parametrize("mutation", [
    "duplicate",
    "missing-base",
    "unsafe-extra",
    "too-many-extras",
    "missing-language",
    "missing-section-body",
    "mismatched-sections",
    "mismatched-base-sections",
])
def test_guided_page_plan_rejects_invalid_ids_languages_and_content(guided_draft, mutation):
    assembler, _ = modules()
    plan = guided_draft["consultation"]["brief"]["pages"]
    if mutation == "duplicate":
        plan[-1]["id"] = "home"
    elif mutation == "missing-base":
        plan[:] = [page for page in plan if page["id"] != "contact"]
    elif mutation == "unsafe-extra":
        plan[-1]["id"] = "extra-../claims"
    elif mutation == "too-many-extras":
        for slug in ("shipping", "materials", "faq"):
            extra = copy.deepcopy(plan[-1])
            extra["id"] = f"extra-{slug}"
            plan.append(extra)
    elif mutation == "missing-language":
        plan[-1]["content"].pop("de")
    elif mutation == "missing-section-body":
        plan[-1]["content"]["de"]["sections"][0].pop("body")
    elif mutation == "mismatched-sections":
        plan[-1]["content"]["de"]["sections"].pop()
    else:
        plan[0]["content"]["en"]["sections"] = [
            {"heading": "Home section", "body": "Approved home section."},
        ]
        plan[0]["content"]["de"]["sections"].clear()
    with pytest.raises(ValueError):
        assembler.validate_draft(guided_draft)


def test_guided_request_requires_exact_planned_design_images(guided_payload):
    _, app = modules()
    assert set(app.validate_request(guided_payload)["designImages"]) == {
        "home", "catalog", "detail", "about", "contact", "extra-care-guide",
    }
    guided_payload["designImages"].pop("extra-care-guide")
    with pytest.raises(ValueError):
        app.validate_request(guided_payload)
    guided_payload["designImages"]["extra-care-guide"] = guided_payload["designImages"]["home"]
    guided_payload["designImages"]["extra-unplanned"] = guided_payload["designImages"]["home"]
    with pytest.raises(ValueError):
        app.validate_request(guided_payload)


def test_extra_page_requires_every_planned_text_binding(guided_draft, pages):
    assembler, _ = modules()
    pages["extra-care-guide"] = extra_page_html().replace(' data-wr-bind="section.1.body"', '')
    with pytest.raises(ValueError, match="extra-care-guide.*binding"):
        assembler.assemble(guided_draft, pages)
