"""Bind approved facts into untrusted model layouts and emit standalone pages."""
import copy
import json
import re
from typing import Any
from urllib.parse import quote

import tinycss2
from bs4 import BeautifulSoup, Comment, Doctype, NavigableString, Tag

PAGE_TYPES = ("home", "catalog", "detail", "about", "contact")
LANGUAGES = ("en", "de", "fr", "es", "pt", "it")
EXTRA_PAGE = re.compile(r"extra-[a-z][a-z0-9]*(?:-[a-z0-9]+)*$")
LABEL_ROWS = {
    "en": ["Home", "Collection", "Our company", "Contact", "View product", "Your name", "Email address", "Company", "Your message", "Send inquiry", "Sending…", "Your inquiry has been saved. Thank you.", "Unable to save your inquiry. Please try again.", "Material", "Dimensions", "Navigation", "All products"],
    "de": ["Startseite", "Kollektion", "Unser Unternehmen", "Kontakt", "Produkt ansehen", "Ihr Name", "E-Mail-Adresse", "Unternehmen", "Ihre Nachricht", "Anfrage senden", "Wird gesendet…", "Ihre Anfrage wurde gespeichert. Vielen Dank.", "Ihre Anfrage konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.", "Material", "Abmessungen", "Navigation", "Alle Produkte"],
    "fr": ["Accueil", "Collection", "Notre entreprise", "Contact", "Voir le produit", "Votre nom", "Adresse e-mail", "Entreprise", "Votre message", "Envoyer une demande", "Envoi en cours…", "Votre demande a été enregistrée. Merci.", "Impossible d’enregistrer votre demande. Veuillez réessayer.", "Matériau", "Dimensions", "Navigation", "Tous les produits"],
    "es": ["Inicio", "Colección", "Nuestra empresa", "Contacto", "Ver producto", "Su nombre", "Correo electrónico", "Empresa", "Su mensaje", "Enviar consulta", "Enviando…", "Su consulta se ha guardado. Gracias.", "No se pudo guardar su consulta. Inténtelo de nuevo.", "Material", "Dimensiones", "Navegación", "Todos los productos"],
    "pt": ["Início", "Coleção", "A nossa empresa", "Contacto", "Ver produto", "O seu nome", "Endereço de e-mail", "Empresa", "A sua mensagem", "Enviar consulta", "A enviar…", "A sua consulta foi guardada. Obrigado.", "Não foi possível guardar a sua consulta. Tente novamente.", "Material", "Dimensões", "Navegação", "Todos os produtos"],
    "it": ["Home", "Collezione", "La nostra azienda", "Contatti", "Vedi prodotto", "Il suo nome", "Indirizzo e-mail", "Azienda", "Il suo messaggio", "Invia richiesta", "Invio in corso…", "La sua richiesta è stata salvata. Grazie.", "Impossibile salvare la richiesta. Riprovi.", "Materiale", "Dimensioni", "Navigazione", "Tutti i prodotti"],
}
LABEL_KEYS = ("home", "catalog", "about", "contact", "detail", "name", "email", "company", "message", "send", "sending", "sent", "failed", "material", "dimensions", "menu", "allProducts")
LABELS: dict[str, dict[str, str]] = {lang: dict(zip(LABEL_KEYS, row)) for lang, row in LABEL_ROWS.items()}
ALLOWED_TAGS = set("html head body title style header footer main section article aside nav div span p h1 h2 h3 h4 h5 h6 a img ul ol li dl dt dd table thead tbody tr th td strong b em i small blockquote br hr figure figcaption button label".split())
DROP_TAGS = set("script iframe object embed link meta base svg math video audio source track canvas template noscript form input textarea select option".split())
HOOKS = {"company.name", "company.description", "company.email", "company.contactName", "company.logo", "copy.headline", "copy.subtitle", "copy.about", "copy.cta", "product.name", "product.description", "product.material", "product.dimensions", "product.image", "product.gallery", "product.tagline", "product.sellingPoints", "product.applications"} | {f"ui.{name}" for name in LABEL_KEYS}
REQUIRED = {"home": {"company.name", "copy.headline"}, "catalog": {"product.name", "product.image"}, "detail": {"product.name", "product.description", "product.image", "product.material", "product.dimensions"}, "about": {"copy.about"}, "contact": set()}


class OutputValidationError(ValueError):
    """Only fixed, safe messages from this assembler may cross the API boundary."""


def planned_page_specs(draft: dict[str, Any]) -> list[dict[str, Any]] | None:
    consultation = draft.get("consultation")
    if consultation is None:
        return None
    if not isinstance(consultation, dict):
        raise ValueError("Invalid consultation")
    brief = consultation.get("brief")
    if brief is None:
        return None
    if not isinstance(brief, dict) or not isinstance(brief.get("pages"), list):
        raise ValueError("Invalid approved site brief")
    return brief["pages"]


def planned_pages(draft: dict[str, Any]) -> tuple[str, ...]:
    pages = planned_page_specs(draft)
    return PAGE_TYPES if pages is None else tuple(page["id"] for page in pages)


def page_spec(draft: dict[str, Any], page: str) -> dict[str, Any] | None:
    pages = planned_page_specs(draft)
    if pages is None:
        return None
    return next((candidate for candidate in pages if candidate["id"] == page), None)


def page_content(draft: dict[str, Any], page: str, lang: str) -> dict[str, Any] | None:
    planned = page_spec(draft, page)
    return None if planned is None else planned["content"][lang]


def content_bindings(draft: dict[str, Any], page: str) -> list[str]:
    content = page_content(draft, page, draft["languages"][0])
    if content is None:
        return []
    bindings = ["page.title"] if page.startswith("extra-") else []
    for index in range(len(content["sections"])):
        bindings.extend((f"section.{index}.heading", f"section.{index}.body"))
    return bindings


def required_bindings(draft: dict[str, Any], page: str) -> set[str]:
    if page not in planned_pages(draft):
        raise OutputValidationError("Unknown page type")
    required = REQUIRED.get(page, set()) | set(content_bindings(draft, page))
    if page == "detail":
        if any(len(product.get("gallery", [])) > 1 for product in draft["products"]):
            required = required | {"product.gallery"}
        for field in ("tagline", "sellingPoints", "applications"):
            if any(product.get(field) for product in draft["products"]):
                required = required | {f"product.{field}"}
    return required


def page_title_binding(page: str) -> str:
    return {
        "home": "copy.headline", "catalog": "ui.catalog", "detail": "product.name",
        "about": "ui.about", "contact": "ui.contact",
    }.get(page, "page.title")


def page_title(draft: dict[str, Any], page: str, lang: str) -> str:
    content = page_content(draft, page, lang)
    return content["title"] if content is not None else LABELS[lang][page]


def validate_page_plan(draft: dict[str, Any], languages: list[str]) -> None:
    pages = planned_page_specs(draft)
    if pages is None:
        return
    if not 5 <= len(pages) <= 8:
        raise ValueError("Between five and eight planned pages are required")
    ids: list[str] = []
    for page in pages:
        if not isinstance(page, dict):
            raise ValueError("Invalid planned page")
        page_id = page.get("id")
        if not isinstance(page_id, str) or (page_id not in PAGE_TYPES and (len(page_id) > 50 or EXTRA_PAGE.fullmatch(page_id) is None)):
            raise ValueError("Invalid planned page ID")
        ids.append(page_id)
        if not isinstance(page.get("label"), str) or not page["label"].strip() or len(page["label"]) > 300:
            raise ValueError("Invalid planned page label")
        if not isinstance(page.get("purpose"), str) or not page["purpose"].strip() or len(page["purpose"]) > 4000:
            raise ValueError("Invalid planned page purpose")
        content = page.get("content")
        if not isinstance(content, dict) or any(lang not in LANGUAGES for lang in content):
            raise ValueError("Invalid planned page languages")
        for lang in languages:
            localized = content.get(lang)
            if not isinstance(localized, dict) or not isinstance(localized.get("title"), str) or not localized["title"].strip() or len(localized["title"]) > 300:
                raise ValueError("Missing approved page content")
            sections = localized.get("sections")
            if not isinstance(sections, list) or len(sections) > 8 or (page_id.startswith("extra-") and not sections):
                raise ValueError("Invalid approved page sections")
            for section in sections:
                if not isinstance(section, dict):
                    raise ValueError("Invalid approved page section")
                for key, limit in (("heading", 300), ("body", 4000)):
                    value = section.get(key)
                    if not isinstance(value, str) or not value.strip() or len(value) > limit:
                        raise ValueError("Invalid approved page section")
        if len({len(content[lang]["sections"]) for lang in languages}) != 1:
            raise ValueError("Approved page sections must match across languages")
    if len(set(ids)) != len(ids) or any(page not in ids for page in PAGE_TYPES):
        raise ValueError("The five base page types are required exactly once")


def validate_draft(draft: Any) -> None:
    if not isinstance(draft, dict) or not isinstance(draft.get("company"), dict):
        raise ValueError("Invalid company")
    if not isinstance(draft["company"].get("name"), str) or not draft["company"]["name"].strip():
        raise ValueError("Company name is required")
    languages = draft.get("languages")
    if not isinstance(languages, list) or not 1 <= len(languages) <= 2 or len(set(languages)) != len(languages) or "en" not in languages or any(lang not in LANGUAGES for lang in languages):
        raise ValueError("English and at most one supported second language are required")
    products = draft.get("products")
    if not isinstance(products, list) or not products or len(products) > 100:
        raise ValueError("Between 1 and 100 products are required")
    ids = set()
    for product in products:
        if not isinstance(product, dict) or not isinstance(product.get("id"), str) or not product["id"] or len(product["id"]) > 200 or product["id"] in (".", "..") or product["id"] in ids:
            raise ValueError("Invalid or duplicate product ID")
        ids.add(product["id"])
        for field in ("name", "description", "material", "dimensions"):
            if not isinstance(product.get(field), str):
                raise ValueError("Product facts are required")
        gallery = product.get("gallery", [])
        if not isinstance(gallery, list) or len(gallery) > 11:
            raise ValueError("Invalid product gallery assets")
        gallery_ids = set()
        for image in gallery:
            if not isinstance(image, dict) or not isinstance(image.get("assetId"), str) or image["assetId"] in gallery_ids or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]{0,199}", image["assetId"]):
                raise ValueError("Invalid gallery asset token ID")
            gallery_ids.add(image["assetId"])
            if not isinstance(image.get("caption", ""), str) or len(image.get("caption", "")) > 1000:
                raise ValueError("Invalid gallery caption")
        if "tagline" in product and (not isinstance(product["tagline"], str) or len(product["tagline"]) > 160):
            raise ValueError("Invalid product tagline")
        for field in ("sellingPoints", "applications"):
            if field in product and (not isinstance(product[field], list) or len(product[field]) > 5 or any(not isinstance(value, str) or len(value) > 180 for value in product[field])):
                raise ValueError("Invalid product website fields")
        for lang in languages:
            if lang != "en":
                translation = product.get("translations", {}).get(lang, {})
                if any(not isinstance(translation.get(key), str) for key in ("name", "description")):
                    raise ValueError("Approved product translations are required")
    if draft.get("primaryProductId") not in ids:
        raise ValueError("Primary product must exist")
    for lang in languages:
        page_copy = draft.get("copy", {}).get(lang, {})
        if any(not isinstance(page_copy.get(key), str) for key in ("headline", "subtitle", "about", "cta")):
            raise ValueError("Approved language copy is required")
    validate_page_plan(draft, languages)
    for asset in [draft["company"].get("logoAssetId"), *(p.get("imageAssetId") for p in products)]:
        if asset is not None:
            if not isinstance(asset, str) or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]{0,199}", asset):
                raise ValueError("Invalid asset token ID")


def route(page: str, lang: str, product_id: str = "") -> str:
    if page in PAGE_TYPES:
        suffix = {"home": "", "catalog": "products/", "about": "about/", "contact": "contact/", "detail": f"products/{quote(product_id, safe='')}/"}[page]
    elif len(page) <= 50 and EXTRA_PAGE.fullmatch(page):
        suffix = f"{page}/"
    else:
        raise OutputValidationError("Unknown page type")
    return f"/{lang}/{suffix}"


def safe_css(css: str) -> str:
    """Reject network-bearing CSS, including escaped url() and nested at-rules."""
    def unsafe(tokens):
        for token in tokens:
            kind = getattr(token, "type", "")
            if kind in ("url", "error"):
                return True
            if kind == "string" and re.match(r"^(?:https?:|//|data:|file:)", token.value.strip(), re.I):
                return True
            if kind == "at-keyword" and token.value.lower() in ("import", "namespace", "font-face"):
                return True
            if kind == "function" and token.lower_name in ("url", "expression", "image-set", "-webkit-image-set", "src"):
                return True
            if kind == "ident" and token.value.lower() in ("behavior", "-moz-binding"):
                return True
            if unsafe(getattr(token, "content", [])) or unsafe(getattr(token, "arguments", [])):
                return True
        return False
    def remove_generated_text(tokens):
        result = []
        index = 0
        while index < len(tokens):
            token = tokens[index]
            lookahead = index + 1
            while lookahead < len(tokens) and tokens[lookahead].type in ("whitespace", "comment"):
                lookahead += 1
            if token.type == "ident" and token.value.lower() == "content" and lookahead < len(tokens) and tokens[lookahead].type == "literal" and tokens[lookahead].value == ":":
                end = lookahead + 1
                while end < len(tokens) and not (tokens[end].type == "literal" and tokens[end].value == ";"):
                    end += 1
                values = [part for part in tokens[lookahead + 1:end] if part.type not in ("whitespace", "comment")]
                if values and all(part.type == "string" and part.value == "" for part in values):
                    result.extend(tokens[index:end])
                    index = end
                    continue
                while index < len(tokens) and not (tokens[index].type == "literal" and tokens[index].value == ";"):
                    index += 1
                index += 1
                continue
            if hasattr(token, "content"):
                token.content = remove_generated_text(token.content)
            result.append(token)
            index += 1
        return result
    tokens = tinycss2.parse_component_value_list(css)
    return "" if unsafe(tokens) else tinycss2.serialize(remove_generated_text(tokens))


def is_breadcrumb_separator(text: NavigableString) -> bool:
    """Recognize only a standalone > between two trusted breadcrumb leaves."""
    span = text.parent
    if not isinstance(span, Tag) or span.name != 'span' or len(span.contents) != 1 or str(text).strip() != '>':
        return False
    for neighbor in (span.find_previous_sibling(), span.find_next_sibling()):
        if not isinstance(neighbor, Tag) or neighbor.name not in ('a', 'span') or neighbor.find(True) is not None:
            return False
        if not ((neighbor.name == 'a' and neighbor.get('data-wr-page') in PAGE_TYPES)
                or neighbor.get('data-wr-bind') in ('ui.home', 'ui.catalog', 'page.title', 'product.name')):
            return False
    return True


def sanitize(html: str) -> BeautifulSoup:
    if not isinstance(html, str) or len(html.encode()) > 2 * 1024 * 1024:
        raise OutputValidationError("Invalid page output")
    soup = BeautifulSoup(html, "html.parser")
    if soup.html is None or soup.body is None or soup.select_one("main") is None:
        raise OutputValidationError("A complete semantic HTML document is required")
    for node in list(soup.find_all(string=lambda text: isinstance(text, Comment))):
        node.extract()
    for node in list(soup.find_all(True)):
        if not node.name or node.parent is None:
            continue
        if node.name in DROP_TAGS:
            node.decompose()
            continue
        if node.name not in ALLOWED_TAGS:
            node.unwrap()
            continue
        attrs = {}
        for key, value in node.attrs.items():
            if key in {"class", "id", "data-wr-bind", "data-wr-products", "data-wr-product", "data-wr-product-ids", "data-wr-page", "data-wr-form", "data-wr-field", "data-wr-nav", "data-wr-languages", "data-wr-crop", "data-wr-asset-kind", "data-wr-scene", "data-wr-label", "data-wr-icon", "data-wr-font", "data-wr-shared"}:
                attrs[key] = value
            elif key == "style":
                attrs[key] = safe_css(str(value))
        node.attrs = attrs
        if node.name == "style":
            node.string = safe_css(node.get_text())
        elif node.name == "img" and node.get("data-wr-bind") not in ("company.logo", "product.image") and not node.has_attr('data-wr-crop') and not node.has_attr('data-wr-scene'):
            node.decompose()
    # Model text is never a source of company/product claims or translations.
    for text in list(soup.find_all(string=True)):
        if text.parent and text.parent.name != "style" and not is_breadcrumb_separator(text):
            text.replace_with("")
    soup.insert(0, Doctype("html"))
    return soup


def collection_products(listing: Tag, draft: dict[str, Any]) -> list[dict[str, Any]]:
    if not listing.has_attr("data-wr-product-ids"):
        return draft["products"]
    try:
        ids = json.loads(str(listing["data-wr-product-ids"]))
    except (ValueError, RecursionError):
        raise OutputValidationError("Product collection requires a JSON array of approved product IDs") from None
    products = {product["id"]: product for product in draft["products"]}
    if not isinstance(ids, list) or not ids or any(not isinstance(product_id, str) or product_id not in products for product_id in ids) or len(set(ids)) != len(ids):
        raise OutputValidationError("Product collection requires unique approved product IDs")
    return [products[product_id] for product_id in ids]


def validate_product_cards(template: BeautifulSoup, draft: dict[str, Any], page: str) -> None:
    """Every card represents a real product; compact layouts may omit descriptions."""
    for node in template.select("[data-wr-product-ids]"):
        if not node.has_attr("data-wr-products"):
            raise OutputValidationError("Product selection requires a product collection")
    for card in template.select("[data-wr-product]"):
        parent = card.parent
        if not isinstance(parent, Tag) or not parent.has_attr("data-wr-products"):
            raise OutputValidationError("Product cards must be direct children of a product collection")
    included_ids = set()
    for listing in template.select("[data-wr-products]"):
        cards = listing.select("[data-wr-product]")
        if listing.find_parent(attrs={"data-wr-products": True}) is not None or listing.find_parent(attrs={"data-wr-product": True}) is not None or len(cards) != 1:
            raise OutputValidationError("Product collections require one non-nested card template")
        card = cards[0]
        if card.select_one('[data-wr-bind="product.name"]') is None or card.select_one('img[data-wr-bind="product.image"]') is None or card.select_one('a[data-wr-page="detail"]') is None:
            raise OutputValidationError("Product card is missing name, image or detail navigation bindings")
        included_ids.update(product["id"] for product in collection_products(listing, draft))
    if page == "catalog" and included_ids != {product["id"] for product in draft["products"]}:
        raise OutputValidationError("Catalog collections must include every approved product")


def bind(container: Tag, draft: dict[str, Any], lang: str, product: dict[str, Any], page: str) -> None:
    translated = product.get("translations", {}).get(lang, {})
    values = {f"company.{key}": value for key, value in draft["company"].items()}
    values.update({f"copy.{key}": value for key, value in draft["copy"][lang].items()})
    values.update({f"product.{key}": value for key, value in product.items()})
    values.update({f"product.{key}": value for key, value in translated.items() if key in ("name", "description")})
    values.update({f"ui.{key}": value for key, value in LABELS[lang].items()})
    content = page_content(draft, page, lang)
    dynamic_hooks = set(content_bindings(draft, page))
    if content is not None:
        dynamic_hooks.add("page.title")
        values["page.title"] = content["title"]
        for index, section in enumerate(content["sections"]):
            values[f"section.{index}.heading"] = section["heading"]
            values[f"section.{index}.body"] = section["body"]
    nodes = ([container] if container.has_attr("data-wr-bind") else []) + list(container.select("[data-wr-bind]"))
    for node in nodes:
        hook = str(node.get("data-wr-bind"))
        if hook not in HOOKS | dynamic_hooks:
            raise OutputValidationError("Unknown data binding hook")
        if node.name in ("style", "html", "head", "body") or node.find(True) is not None:
            raise OutputValidationError("Text bindings require safe leaf elements")
        if hook == 'product.gallery':
            if node.name not in ('div', 'section'):
                raise OutputValidationError("Gallery bindings require an empty div or section")
            images = [image for image in product.get('gallery', []) if image['assetId'] != product.get('imageAssetId')]
            if not images:
                node.decompose()
                continue
            for image in images:
                node.append(Tag(name='img', attrs={'src': f"__WR_ASSET_{image['assetId']}__", 'alt': image.get('caption') or str(values['product.name']), 'loading': 'lazy', 'style': 'max-width:100%;height:auto;object-fit:contain'}))
        elif hook in ('product.sellingPoints', 'product.applications'):
            if node.name not in ('ul', 'ol'):
                raise OutputValidationError("Product list bindings require an empty list")
            entries = product.get(hook.split('.')[1], []) if lang == 'en' else []
            if not entries:
                node.decompose()
                continue
            for entry in entries:
                child = Tag(name='li')
                child.string = entry
                node.append(child)
        elif hook == 'product.tagline' and lang != 'en':
            node.decompose()
        elif hook == 'company.name' and node.name == 'img'  and node.get('data-wr-design-asset') == 'logo':
            node['alt'] = draft['company']['name']
        elif hook in ("company.logo", "product.image"):
            if node.name != "img":
                raise OutputValidationError("Image bindings must use img elements")
            asset_id = draft["company"].get("logoAssetId") if hook == "company.logo" else product.get("imageAssetId")
            if not asset_id:
                node.decompose()
                continue
            node["src"] = f"__WR_ASSET_{asset_id}__"
            node["alt"] = str(draft["company"]["name"] if hook == "company.logo" else values["product.name"])
            node["loading"] = "lazy"
        else:
            node.string = str(values.get(hook, ""))
    for anchor in container.select("a[data-wr-page]"):
        destination = str(anchor.get("data-wr-page"))
        if destination not in planned_pages(draft):
            raise OutputValidationError("Unknown page navigation hook")
        anchor["data-wr-lang"] = lang
        anchor["href"] = route(destination, lang, product["id"])
        if destination in ("detail", "contact"):
            anchor["data-wr-product-id"] = product["id"]
            if destination == "contact":
                anchor["href"] = route(destination, lang) + "?productId=" + quote(product["id"], safe="")
        if not anchor.get_text(strip=True):
            label = page_title(draft, destination, lang) if destination.startswith("extra-") else LABELS[lang][destination]
            anchor["aria-label"] = label
            if anchor.find(True) is None:
                anchor.append(label)


def navigation(soup: BeautifulSoup, draft: dict[str, Any], lang: str, page: str, product: dict[str, Any]) -> None:
    nav = soup.select_one("[data-wr-nav]")
    if nav is not None and nav.name != "nav":
        enclosing_nav = nav.find_parent("nav")
        if enclosing_nav is not None:
            nav = enclosing_nav
    if nav is None:
        nav = soup.new_tag("nav", attrs={"data-wr-nav": "", "class": "wr-navigation"})
        assert soup.body is not None
        soup.body.insert(0, nav)
    nav.clear()
    nav["data-wr-nav"] = ""
    for duplicate in soup.select("[data-wr-nav]"):
        if duplicate is not nav:
            duplicate.decompose()
    nav["aria-label"] = LABELS[lang]["menu"]
    for destination in (candidate for candidate in planned_pages(draft) if candidate != "detail"):
        anchor = soup.new_tag("a", href=route(destination, lang), attrs={"data-wr-page": destination, "data-wr-lang": lang})
        anchor.string = page_title(draft, destination, lang) if destination.startswith("extra-") else LABELS[lang][destination]
        if destination == page:
            anchor["aria-current"] = "page"
        nav.append(anchor)
    languages = soup.select_one("[data-wr-languages]")
    if len(draft['languages']) == 1:
        if languages is not None:
            languages.decompose()
        normalize_header_navigation(soup, nav)
        return
    if languages is None:
        languages = soup.new_tag("span", attrs={"data-wr-languages": ""})
        nav.append(languages)
    languages.clear()
    for target in draft["languages"]:
        anchor = soup.new_tag("a", href=route(page, target, product["id"]), attrs={"data-wr-page": page, "data-wr-lang": target, "lang": target})
        if page == "detail":
            anchor["data-wr-product-id"] = product["id"]
        anchor.string = target.upper()
        languages.append(anchor)
    normalize_header_navigation(soup, nav)


def normalize_header_navigation(soup: BeautifulSoup, nav: Tag) -> None:
    """Repair the observed duplicate-tagline header contract without restyling pages."""
    header = nav.find_parent("header")
    if header is None:
        return
    duplicates = header.select('[data-wr-bind="copy.subtitle"]')
    # Preserve the only occurrence if a malformed template omitted its body copy.
    body_copy = any(node.find_parent("header") is not header for node in soup.select('[data-wr-bind="copy.subtitle"]'))
    if not duplicates or not body_copy:
        return
    for duplicate in duplicates:
        duplicate.decompose()
    header["style"] = str(header.get("style", "")).rstrip(";") + ";height:auto;flex-wrap:wrap;align-items:center"
    row: Tag = nav
    while row is not header:
        row["style"] = str(row.get("style", "")).rstrip(";") + ";position:static;inset:auto;transform:none;width:auto;height:auto;min-width:0;max-width:100%;overflow:visible;flex-wrap:wrap"
        if row.parent is header:
            row["style"] += ";flex:1 1 26rem"
            break
        if not isinstance(row.parent, Tag):
            break
        row = row.parent
    for anchor in nav.select("a"):
        anchor["style"] = str(anchor.get("style", "")).rstrip(";") + ";flex-shrink:0;white-space:nowrap"
    for anchor in header.select("a[data-wr-page]"):
        if anchor.find_parent(attrs={"data-wr-nav": True}) is None:
            anchor["style"] = str(anchor.get("style", "")).rstrip(";") + ";flex-shrink:0"


RUNTIME = r"""(() => {
  for (const form of document.querySelectorAll('form[data-wr-inquiry]')) {
    const status = form.querySelector('[role="status"]');
    const select = form.elements.namedItem('productId');
    const selected = new URLSearchParams(location.search).get('productId');
    if (selected && [...select.options].some(o => o.value === selected)) select.value = selected;
    let requestId = crypto.randomUUID();
    let previousPayload = null;
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const endpoint = form.getAttribute('action');
      if (!endpoint || endpoint.includes('__WR_')) { status.textContent = form.dataset.failed; return; }
      const button = form.querySelector('button[type="submit"]');
      if (button.disabled) return;
      const data = new FormData(form);
      const payload = {};
      for (const name of ['name','email','company','message','productId']) {
        const value = data.get(name);
        if (typeof value === 'string' && value) payload[name] = value;
      }
      const serializedFields = JSON.stringify(payload);
      if (previousPayload !== null && previousPayload !== serializedFields) requestId = crypto.randomUUID();
      previousPayload = serializedFields;
      payload.requestId = requestId;
      button.disabled = true;
      status.textContent = form.dataset.sending;
      try {
        const response = await fetch(endpoint, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
        if (!response.ok) throw new Error('Inquiry rejected');
        status.textContent = form.dataset.sent;
        form.reset(); requestId = crypto.randomUUID(); previousPayload = null;
      } catch { status.textContent = form.dataset.failed; }
      finally { button.disabled = false; }
    });
  }
})();"""
RESPONSIVE = """:where(img){max-width:100%;height:auto}*,*::before,*::after{box-sizing:border-box}:where(body){overflow-wrap:anywhere}:where([data-wr-nav]){display:flex;flex-wrap:wrap;align-items:center;gap:1rem;padding:1rem}:where(.wr-header [data-wr-nav]){padding:0}:where([data-wr-languages]){display:inline-flex;gap:.75rem;margin-inline-start:auto}:where(form[data-wr-legacy-form]){display:grid;gap:1rem;max-width:44rem}:where(form[data-wr-legacy-form] label){display:grid;gap:.4rem}:where(form[data-wr-inquiry] input,form[data-wr-inquiry] textarea,form[data-wr-inquiry] select){font:inherit;max-width:100%;min-width:0;padding:.7rem;border:1px solid #bbb;border-radius:.3rem}:where(form[data-wr-inquiry] button){font:inherit;padding:.8rem;cursor:pointer}@media(max-width:640px){:where([data-wr-nav]){gap:.7rem;font-size:.9rem}:where(main){max-width:100%}}"""
FORM_FIELDS = ("name", "email", "company", "message", "productId", "submit")
FORM_RUNTIME_PROPERTIES = {"elements", "querySelector", "addEventListener", "reportValidity", "reset", "getAttribute", "dataset"}


def validate_form_slots(template: BeautifulSoup) -> None:
    for slot in template.select("[data-wr-field]"):
        if slot.find_parent(attrs={"data-wr-form": True}) is None:
            raise OutputValidationError("Field slots require a form placeholder")
        if slot.find_parent(attrs={"data-wr-products": True}) is not None or slot.find_parent(attrs={"data-wr-product": True}) is not None:
            raise OutputValidationError("Field slots cannot appear inside product collections or cards")
    for placeholder in template.select("[data-wr-form]"):
        if placeholder.name not in ("div", "section"):
            raise OutputValidationError("Contact form requires a div or section placeholder")
        if placeholder.find_parent(attrs={"data-wr-form": True}) is not None or placeholder.find_parent(attrs={"data-wr-products": True}) is not None:
            raise OutputValidationError("Form placeholders cannot be nested or repeated inside product collections")
        slots = placeholder.select("[data-wr-field]")
        if not slots:
            if placeholder.find(True) is not None:
                raise OutputValidationError("Form layouts require all six field slots")
            continue
        names = [str(slot.get("data-wr-field")) for slot in slots]
        if len(names) != len(FORM_FIELDS) or set(names) != set(FORM_FIELDS):
            raise OutputValidationError("Form layouts require each of the six field slots exactly once")
        if placeholder.select_one("button") is not None:
            raise OutputValidationError("Form controls must use trusted field slots")
        for slot in slots:
            if slot.name != "span" or slot.find(True) is not None or any(key.startswith("data-wr-") and key != "data-wr-field" for key in slot.attrs):
                raise OutputValidationError("Field slots require plain span leaf placeholders")


def contact_form(soup: BeautifulSoup, draft: dict[str, Any], lang: str, selected_product_id: str = "") -> None:
    used_ids = {str(node["id"]) for node in soup.select("[id]")}

    def unique_id(base: str) -> str:
        value = base
        while value in used_ids:
            value += "-field"
        used_ids.add(value)
        return value

    for index, placeholder in enumerate(soup.select("[data-wr-form]"), 1):
        slots = {str(slot["data-wr-field"]): slot for slot in placeholder.select("[data-wr-field]")}
        labels = LABELS[lang]
        attrs = {"data-wr-inquiry": "", "action": "__WR_INQUIRY__", "method": "post", **{f"data-{k}": labels[k] for k in ("sending", "sent", "failed")}}
        if slots:
            # Named form descendants can shadow DOM methods/properties even via an img ID.
            # Remove only conflicting model IDs, before adding trusted control IDs and names.
            for node in placeholder.select("[id]"):
                if str(node["id"]) in FORM_RUNTIME_PROPERTIES:
                    del node["id"]
            # The authored wrapper is the form itself, so its grid/flex children retain their layout.
            form = placeholder
            form.name = "form"
            form.attrs.update(attrs)
        else:
            placeholder.clear()
            form = soup.new_tag("form", attrs={**attrs, "data-wr-legacy-form": ""})
            placeholder.append(form)
        for name in FORM_FIELDS:
            label_key = {"productId": "catalog", "submit": "send"}.get(name, name)
            field_id = unique_id(f"wr-inquiry-{index}-{name}")
            if name == "submit":
                field = soup.new_tag("button", attrs={"type": "submit", "id": field_id})
                field.string = labels["send"]
            elif name == "productId":
                field = soup.new_tag("select", attrs={"name": name, "id": field_id})
                option = soup.new_tag("option", value="")
                option.string = labels["allProducts"]
                field.append(option)
                for product in draft["products"]:
                    option = soup.new_tag("option", value=product["id"])
                    option.string = product.get("translations", {}).get(lang, {}).get("name", product["name"])
                    if product["id"] == selected_product_id:
                        option["selected"] = ""
                    field.append(option)
            else:
                field = soup.new_tag("textarea" if name == "message" else "input", attrs={"name": name, "id": field_id, "maxlength": {"name": "120", "email": "254", "company": "200", "message": "5000"}[name]})
                if name != "message":
                    field["type"] = "email" if name == "email" else "text"
                if name in ("name", "email", "message"):
                    field["required"] = ""
            if name in slots:
                slot = slots[name]
                # Keep the validated slot selector when its placeholder becomes a control.
                field["data-wr-field"] = name
                for key in ("class", "style"):
                    if key in slot.attrs:
                        field[key] = slot[key]
                label = slot.find_parent("label")
                if label is None and isinstance(slot.parent, Tag):
                    for candidate in slot.parent.find_all("label", recursive=False):
                        if candidate.get("data-wr-bind") == f"ui.{label_key}" or candidate.select_one(f'[data-wr-bind="ui.{label_key}"]') is not None:
                            label = candidate
                            break
                if isinstance(label, Tag) and name != "submit":
                    label["for"] = field_id
                slot.replace_with(field)
            elif name not in ("productId", "submit"):
                label = soup.new_tag("label", attrs={"for": field_id})
                label.append(labels[name])
                label.append(field)
                form.append(label)
            else:
                form.append(field)
            if name != "submit":
                field["aria-label"] = labels[label_key]
        status_id = unique_id(f"wr-inquiry-{index}-status")
        form["aria-describedby"] = status_id
        form.append(soup.new_tag("p", attrs={"id": status_id, "role": "status", "aria-live": "polite"}))


def assemble(draft: dict[str, Any], pages: dict[str, str], design_images: dict[str, str] | None = None, generated_assets: dict[str, str] | None = None, presentation_labels: dict[str, dict[str, str]] | None = None) -> dict[str, str]:
    validate_draft(draft)
    if set(pages) != set(planned_pages(draft)):
        raise OutputValidationError("Design page templates must exactly match the approved page plan")
    return _assemble_pages(draft, pages, design_images, generated_assets, presentation_labels)


def assemble_page(draft: dict[str, Any], page: str, html: str, design_images: dict[str, str] | None = None, generated_assets: dict[str, str] | None = None, presentation_labels: dict[str, dict[str, str]] | None = None, *, diagnostic_binding_issues: list[str] | None = None) -> dict[str, str]:
    validate_draft(draft)
    if page not in planned_pages(draft):
        raise OutputValidationError("Unknown page type")
    return _assemble_pages(draft, {page: html}, design_images, generated_assets, presentation_labels, diagnostic_binding_issues)


def _assemble_pages(draft: dict[str, Any], pages: dict[str, str], design_images: dict[str, str] | None = None, generated_assets: dict[str, str] | None = None, presentation_labels: dict[str, dict[str, str]] | None = None, diagnostic_binding_issues: list[str] | None = None) -> dict[str, str]:
    validate_draft(draft)
    primary = next(p for p in draft["products"] if p["id"] == draft["primaryProductId"])
    files: dict[str, str] = {}
    for page in pages:
        template = sanitize(pages[page])
        from design_assets import materialize_visuals
        materialize_visuals(template, design_images or {}, generated_assets)
        content_nodes = [
            node for node in template.select("[data-wr-bind]")
            if str(node.get("data-wr-bind")) == "page.title"
            or re.fullmatch(r"section\.\d+\.(?:heading|body)", str(node.get("data-wr-bind")))
        ]
        title_nodes = [node for node in content_nodes if node.get("data-wr-bind") == "page.title"]
        ordered_nodes = content_nodes if page.startswith("extra-") else [node for node in content_nodes if node.get("data-wr-bind") != "page.title"]
        expected_content = content_bindings(draft, page)
        observed_content = [str(node.get("data-wr-bind")) for node in ordered_nodes]
        if (
            observed_content != expected_content
            or len(title_nodes) > 1
            or (title_nodes and page_content(draft, page, draft["languages"][0]) is None)
            or any(node.find_parent(attrs={"data-wr-products": True}) is not None for node in content_nodes)
        ):
            issue = f"Approved {page} content bindings must appear exactly once in approved order. Expected: {json.dumps(expected_content)}; Observed: {json.dumps(observed_content)}"
            if diagnostic_binding_issues is None:
                raise OutputValidationError(issue)
            # A safe diagnostic render can expose layout issues in the same repair
            # pass. The binding violation remains fatal to page/build acceptance.
            diagnostic_binding_issues.append(issue)
        hooks = {
            str(node.get("data-wr-bind")) for node in template.select("[data-wr-bind]")
            if page == "catalog" or node.find_parent(attrs={"data-wr-products": True}) is None
        }
        required = required_bindings(draft, page)
        missing = sorted(required - hooks)
        missing_structure = []
        if page == "catalog" and template.select_one("[data-wr-products] [data-wr-product]") is None:
            missing_structure.append("data-wr-products > data-wr-product")
        if page == "contact" and template.select_one("[data-wr-form]") is None:
            missing_structure.append("data-wr-form")
        if missing or missing_structure:
            issue = f"Missing required {page} data bindings: {', '.join([*missing, *missing_structure])}"
            if diagnostic_binding_issues is None or missing_structure or not set(missing) <= set(expected_content):
                raise OutputValidationError(issue)
            # Only approved page-title/section text may be absent in diagnostic
            # renders. Product/image and structural requirements remain strict.
            diagnostic_binding_issues.append(issue)
        for node in template.select('[data-wr-label]'):
            value = (presentation_labels or {}).get(str(node['data-wr-label']))
            if node.find(True) or node.has_attr('data-wr-bind') or node.name in ('img', 'form', 'input', 'textarea', 'select') or not value or set(value) != set(draft['languages']):
                raise OutputValidationError('Unknown or invalid presentation label binding')
        validate_product_cards(template, draft, page)
        validate_form_slots(template)
        for lang in draft["languages"]:
            for product in draft["products"] if page == "detail" else [primary]:
                soup = copy.deepcopy(template)
                assert soup.html is not None and soup.body is not None
                # Bind fixed blocks first; product lists are cloned from their clean template below.
                lists = []
                for listing in soup.select("[data-wr-products]"):
                    card = listing.select_one("[data-wr-product]")
                    if card is None:
                        raise OutputValidationError("Product list lacks a card template")
                    lists.append((listing, copy.deepcopy(card), collection_products(listing, draft)))
                    listing.clear()
                bind(soup, draft, lang, product, page)
                for listing, card, selected_products in lists:
                    for item in selected_products:
                        clone = copy.deepcopy(card)
                        bind(clone, draft, lang, item, page)
                        listing.append(clone)
                navigation(soup, draft, lang, page, product)
                contact_form(soup, draft, lang, product["id"] if page == "detail" else "")
                for node in soup.select('[data-wr-label]'):
                    assert presentation_labels is not None
                    node.string = presentation_labels[str(node['data-wr-label'])][lang]
                soup.html["lang"] = lang
                if soup.head is None:
                    soup.html.insert(0, soup.new_tag("head"))
                assert soup.head is not None
                for title in soup.select("title"):
                    title.decompose()
                title = soup.new_tag("title")
                title.string = f"{product.get('translations', {}).get(lang, {}).get('name', product['name']) if page == 'detail' else page_title(draft, page, lang)} | {draft['company']['name']}"
                soup.head.append(title)
                soup.head.append(soup.new_tag("meta", charset="utf-8"))
                soup.head.append(soup.new_tag("meta", attrs={"name": "viewport", "content": "width=device-width, initial-scale=1"}))
                style = soup.new_tag("style")
                style.string = RESPONSIVE
                soup.head.insert(0, style)
                runtime = soup.new_tag("script", attrs={"data-wr-trusted": "inquiry-v1"})
                runtime.string = RUNTIME
                soup.body.append(runtime)
                output = str(soup)
                if len(output.encode()) > 1_000_000:
                    raise OutputValidationError("Expanded page exceeds limit")
                files[route(page, lang, product["id"]).lstrip("/") + "index.html"] = output
                if sum(len(v.encode()) for v in files.values()) > 8 * 1024 * 1024:
                    raise OutputValidationError("Expanded website exceeds limit")
    return files
