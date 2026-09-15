import importlib.util


def module():
    assert importlib.util.find_spec("builder"), "Vision adapter is not implemented"
    import builder
    return builder


def test_prompt_uses_actual_image_and_binding_contract(payload):
    builder = module()
    messages = builder.messages_for("detail", payload["draft"], payload["designImages"]["detail"])
    assert messages[1]["content"][1] == {"type": "image_url", "image_url": {"url": payload["designImages"]["detail"]}}
    system = messages[0]["content"]
    facts = messages[1]["content"][0]["text"]
    assert "data-wr-bind" in system and "product.dimensions" in system
    assert "round corners" in facts and "Block <One>" in facts
    assert "api_key" not in facts.lower()


def test_real_vendor_import_and_disabled_unsafe_tools():
    import asyncio
    builder = module()
    asyncio.run(builder.initialize_vendor())
    from preview_screenshot import is_screenshot_preview_available
    from llm import get_openai_api_name
    assert is_screenshot_preview_available() is False
    assert get_openai_api_name(builder.resolve_model("gpt-5.5")) == "gpt-5.5"
    from agent.tools.types import ToolCall
    agent = builder.create_agent("test-only-key", None)
    result = asyncio.run(agent.tool_runtime.execute(ToolCall(id="test", name="save_assets", arguments={"image_urls": ["https://example.test/private"]})))
    assert result.ok is False
    result = asyncio.run(agent.tool_runtime.execute(ToolCall(id="test2", name="create_file", arguments={"path": "index.html", "content": "<html><body>test</body></html>"})))
    assert result.ok is True and "<body>test</body>" in agent.file_state.content


def test_layout_context_uses_longest_real_bindings_and_page_specific_title(payload):
    import json
    builder = module()
    payload["draft"]["copy"]["de"]["subtitle"] = "Long translated sentence " * 12
    payload["draft"]["copy"]["en"]["about"] = ""
    payload["draft"]["copy"]["de"]["about"] = ""
    messages = builder.messages_for("about", payload["draft"], payload["designImages"]["about"])
    facts = json.loads(messages[1]["content"][0]["text"].split("\n", 1)[1])
    layout = facts["layoutContext"]
    assert layout["pageTitleBinding"] == "ui.about"
    assert layout["longestFinalText"]["copy.subtitle"] == "Long translated sentence " * 12
    assert "copy.about" in layout["emptyOptionalBindings"]
    assert layout["productImagesPerProduct"] == 1
    assert layout["requiredBindings"] == ["copy.about"]
    assert builder.layout_context("detail", payload["draft"])["pageTitleBinding"] == "product.name"
    assert builder.layout_context("home", payload["draft"])["pageTitleBinding"] == "copy.headline"


def ready_visual_pages(pages):
    result = dict(pages)
    for page in result:
        result[page] = result[page].replace("</style>", 'img{width:100%;height:180px;object-fit:contain}</style>')
    result["home"] = result["home"].replace("</main>", '<img data-wr-bind="product.image"></main>')
    result["catalog"] = result["catalog"].replace("<main>", '<main><h1 data-wr-bind="ui.catalog"></h1>')
    result["about"] = result["about"].replace("<main>", '<main><h1 data-wr-bind="ui.about"></h1><img data-wr-bind="product.image">')
    result["contact"] = result["contact"].replace("<main>", '<main><h1 data-wr-bind="ui.contact"></h1>')
    return result


def test_visual_review_runs_once_per_page_with_actual_render_feedback(payload, pages, monkeypatch):
    import asyncio
    builder = module()
    monkeypatch.setenv("OPENAI_API_KEY", "test-only")
    monkeypatch.setattr(builder, "resolve_model", lambda value: object())
    final_pages = ready_visual_pages(pages)
    calls = {}
    repair_messages = []
    page_names = iter(("home", "catalog", "detail", "about", "contact"))
    class ModelBoundary:
        def __init__(self, page):
            self.page = page
        async def run(self, model, messages):
            calls[self.page] = calls.get(self.page, 0) + 1
            if self.page == "home" and calls[self.page] == 1:
                return final_pages[self.page].replace('img{width:', 'img{display:none;width:')
            if calls[self.page] == 2:
                repair_messages.append(messages)
            return final_pages[self.page]
    monkeypatch.setattr(builder, "create_agent", lambda *args: ModelBoundary(next(page_names)))
    result = asyncio.run(builder.build_site(payload))
    assert calls == {"home": 2, "catalog": 2, "detail": 2, "about": 2, "contact": 2}
    assert "en/index.html" in result
    feedback = repair_messages[0][-1]["content"]
    assert "hidden" in feedback[0]["text"].lower()
    assert len([part for part in feedback if part["type"] == "image_url"]) == 2


def test_repair_loop_fails_explicitly_after_one_unsuccessful_edit(payload, pages, monkeypatch):
    import asyncio
    import pytest
    from assembler import OutputValidationError
    builder = module()
    monkeypatch.setenv("OPENAI_API_KEY", "test-only")
    monkeypatch.setattr(builder, "resolve_model", lambda value: object())
    calls = []
    class BrokenBoundary:
        async def run(self, model, messages):
            calls.append(messages)
            return pages["home"]  # Deliberately never contains a primary product image.
    monkeypatch.setattr(builder, "create_agent", lambda *args: BrokenBoundary())
    with pytest.raises(OutputValidationError, match="home.*repair"):
        asyncio.run(builder.build_site(payload))
    assert len(calls) == 2


def test_extra_page_prompt_contains_approved_brief_page_and_grounding_contract(guided_payload):
    import json
    builder = module()
    messages = builder.messages_for(
        "extra-care-guide",
        guided_payload["draft"],
        guided_payload["designImages"]["extra-care-guide"],
    )
    facts = json.loads(messages[1]["content"][0]["text"].split("\n", 1)[1])
    assert facts["approvedBrief"] == guided_payload["draft"]["consultation"]["brief"]
    assert facts["approvedPage"]["id"] == "extra-care-guide"
    assert facts["approvedPage"]["content"]["de"]["sections"][1]["body"] == "Trocken lagern."
    assert facts["keepReferenceChange"]["keep"] == ["Keep product geometry and branding"]
    assert facts["keepReferenceChange"]["change"]["avoid"] == ["Avoid unsupported certification claims"]
    assert facts["layoutContext"]["pageTitleBinding"] == "page.title"
    assert facts["layoutContext"]["requiredBindings"] == [
        "page.title", "section.0.body", "section.0.heading", "section.1.body", "section.1.heading",
    ]
    system = messages[0]["content"]
    assert 'data-wr-bind="page.title"' in system
    assert 'data-wr-bind="section.0.heading"' in system


def test_guided_base_prompt_requires_approved_sections_with_final_text(guided_payload):
    import json
    builder = module()
    home = guided_payload["draft"]["consultation"]["brief"]["pages"][0]
    home["content"]["en"]["sections"] = [
        {"heading": "Built for play", "body": "Approved homepage story."},
    ]
    home["content"]["de"]["sections"] = [
        {"heading": "Zum Spielen gemacht", "body": "Freigegebene Startseitengeschichte."},
    ]
    messages = builder.messages_for(
        "home", guided_payload["draft"], guided_payload["designImages"]["home"],
    )
    facts = json.loads(messages[1]["content"][0]["text"].split("\n", 1)[1])
    assert facts["layoutContext"]["requiredBindings"] == [
        "company.name", "copy.headline", "section.0.body", "section.0.heading",
    ]
    assert facts["layoutContext"]["longestFinalText"]["section.0.body"] == (
        "Freigegebene Startseitengeschichte."
    )
    system = messages[0]["content"]
    assert 'data-wr-bind="section.0.heading" then data-wr-bind="section.0.body"' in system


def test_builder_iterates_the_exact_guided_page_plan(guided_payload, pages, monkeypatch):
    import asyncio
    import builder
    from renderer import RenderResult
    monkeypatch.setenv("OPENAI_API_KEY", "test-only")
    monkeypatch.setattr(builder, "resolve_model", lambda value: object())
    pages["extra-care-guide"] = '''<!doctype html><html><head><style></style></head><body><main>
      <h1 data-wr-bind="page.title"></h1><h2 data-wr-bind="section.0.heading"></h2>
      <p data-wr-bind="section.0.body"></p><h2 data-wr-bind="section.1.heading"></h2>
      <p data-wr-bind="section.1.body"></p></main></body></html>'''
    requested = []
    page_names = iter(("home", "catalog", "detail", "about", "contact", "extra-care-guide"))
    class ModelBoundary:
        def __init__(self, page):
            self.page = page
        async def run(self, model, messages):
            requested.append(self.page)
            return pages[self.page]
    monkeypatch.setattr(builder, "create_agent", lambda *args: ModelBoundary(next(page_names)))
    monkeypatch.setattr(builder, "assess_page", lambda *args: asyncio.sleep(0, result=RenderResult()))
    result = asyncio.run(builder.build_site(guided_payload))
    assert requested[:2] == ['home', 'home']
    assert sorted(requested) == sorted(page for page in ("home", "catalog", "detail", "about", "contact", "extra-care-guide") for _ in range(2))
    assert "de/extra-care-guide/index.html" in result
