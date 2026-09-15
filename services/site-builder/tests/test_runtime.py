"""Browser acceptance for the trusted runtime; all HTTP is intercepted locally."""
import json
from pathlib import Path
from uuid import UUID

import pytest
from playwright.sync_api import sync_playwright

from assembler import assemble


@pytest.mark.parametrize("edited_retry", [False, True])
@pytest.mark.parametrize("form_kind", ["legacy", "slotted", "detail"])
def test_contact_runtime_sends_approved_product_and_keeps_only_identical_retry_id(draft, pages, edited_retry, form_kind):
    if form_kind != "legacy":
        slots = '<section data-wr-form>' + ''.join(
            f'<div><span data-wr-field="{name}"></span></div>'
            for name in ("name", "email", "company", "message", "productId", "submit")
        ) + '</section>'
        if form_kind == "detail":
            pages["detail"] = pages["detail"].replace('</main>', slots + '</main>')
        else:
            pages["contact"] = pages["contact"].replace('<div data-wr-form></div>', slots)
    output_path = "de/products/second/index.html" if form_kind == "detail" else "de/contact/index.html"
    html = assemble(draft, pages)[output_path].replace("__WR_INQUIRY__", "https://site.test/api/inquiries")
    with sync_playwright() as playwright:
        if not Path(playwright.chromium.executable_path).exists():
            pytest.skip("Install Playwright Chromium to run browser acceptance")
        browser = playwright.chromium.launch()
        page = browser.new_page(viewport={"width": 375, "height": 812})
        sent = []
        def respond(route):
            if route.request.url.startswith("https://site.test/api/inquiries"):
                sent.append(json.loads(route.request.post_data))
                route.fulfill(status=503 if len(sent) == 1 else 200, content_type="application/json", body='{}')
            elif route.request.resource_type == "document":
                route.fulfill(status=200, content_type="text/html", body=html)
            else:
                route.abort()
        page.route("**/*", respond)
        page.goto("https://site.test/de/products/second/" if form_kind == "detail" else "https://site.test/de/contact/?productId=second")
        page.locator('[name="name"]').fill("Buyer Name")
        page.locator('[name="email"]').fill("buyer@example.test")
        page.locator('[name="company"]').fill("Buyer company")
        page.locator('[name="message"]').fill("Please send a quotation")
        page.get_by_role("button", name="Anfrage senden").click()
        page.get_by_role("status").filter(has_text="Ihre Anfrage konnte").wait_for()
        if edited_retry:
            page.locator('[name="message"]').fill("Please quote another quantity")
        page.get_by_role("button", name="Anfrage senden").click()
        page.get_by_role("status").filter(has_text="Ihre Anfrage wurde").wait_for()
        assert len(sent) == 2
        if edited_retry:
            assert sent[0]["requestId"] != sent[1]["requestId"]
            assert sent[1]["message"] == "Please quote another quantity"
        else:
            assert sent[0] == sent[1]
        assert sent[0]["productId"] == "second"
        assert sent[0]["message"] == "Please send a quotation"
        assert str(UUID(sent[0]["requestId"])) == sent[0]["requestId"]
        assert page.locator('[name="message"]').input_value() == ""
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        browser.close()


def test_browser_does_not_render_unbound_document_siblings(draft, pages):
    pages["home"] = "UNAPPROVED LEADING CLAIM" + pages["home"] + "UNAPPROVED TRAILING CLAIM"
    html = assemble(draft, pages)["en/index.html"]
    with sync_playwright() as playwright:
        if not Path(playwright.chromium.executable_path).exists():
            pytest.skip("Install Playwright Chromium to run browser acceptance")
        browser = playwright.chromium.launch()
        page = browser.new_page()
        page.route("**/*", lambda route: route.abort())
        page.set_content(html)
        assert "UNAPPROVED" not in page.locator("body").inner_text()
        assert "Build <together>" in page.locator("body").inner_text()
        browser.close()
