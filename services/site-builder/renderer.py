"""Network-isolated visual checks of sanitized, bound HTML only."""
import asyncio
import base64
import io
import os
import re
from dataclasses import dataclass, field
from typing import Any

from bs4 import BeautifulSoup
from PIL import Image
from playwright.async_api import async_playwright

from assembler import OutputValidationError, page_title_binding, required_bindings
from design_assets import image_size


@dataclass
class RenderResult:
    issues: list[str] = field(default_factory=list)
    screenshots: list[str] = field(default_factory=list)
    metrics: list[dict[str, Any]] = field(default_factory=list)


def render_document(html: str, draft: dict[str, Any], references: dict[str, str]) -> str:
    soup = BeautifulSoup(html, "html.parser")
    # The input has already passed assembler sanitation. Remove even the trusted form
    # runtime for this local render and impose a second network boundary via CSP.
    for script in soup.select("script"):
        script.decompose()
    primary = next(product for product in draft["products"] if product["id"] == draft["primaryProductId"])
    placeholder = references.get(primary.get("imageAssetId", ""))
    if not placeholder:
        buffer = io.BytesIO()
        Image.new("RGB", (512, 512), "#dddddd").save(buffer, "PNG")
        placeholder = "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode()
    for image in soup.select("img"):
        match = re.fullmatch(r"__WR_ASSET_([A-Za-z0-9][A-Za-z0-9_-]{0,199})__", str(image.get("src", "")))
        if match:
            image["src"] = references.get(match[1], placeholder)
            image["loading"] = "eager"
        elif image.get('data-wr-design-asset') in ('scene', 'logo', 'icon') and str(image.get('src', '')).startswith('data:image/webp;base64,'):
            image['loading'] = 'eager'
        else:
            image.attrs.pop("src", None)
        image.attrs.pop("srcset", None)
    if soup.head is not None:
        soup.head.insert(0, soup.new_tag("meta", attrs={"http-equiv": "Content-Security-Policy", "content": "default-src 'none'; img-src data:; font-src data:; style-src 'unsafe-inline'; form-action 'none'; base-uri 'none'"}))
    return str(soup)


CHECK_LAYOUT = r"""({pageType,titleBinding,contentBindings}) => {
  const issues = [];
  const visible = element => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    for (let node = element; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) < .1) return false;
      if (node !== element) {
        const clipX = ['hidden','clip'].includes(style.overflowX);
        const clipY = ['hidden','clip'].includes(style.overflowY);
        if (clipX || clipY) {
          // Compare actual ancestor padding boxes, not the viewport: long pages remain visible.
          const parentRect = node.getBoundingClientRect();
          const left = parentRect.left + node.clientLeft, top = parentRect.top + node.clientTop;
          const right = left + node.clientWidth, bottom = top + node.clientHeight;
          // Ignore tiny border/subpixel differences, but reject partially clipped required content.
          if ((clipX && (rect.left < left-2 || rect.right > right+2)) ||
              (clipY && (rect.top < top-2 || rect.bottom > bottom+2))) return false;
        }
      }
    }
    return rect.width >= 4 && rect.height >= 4;
  };
  const paintedImageRect = image => {
    const rect = image.getBoundingClientRect(), style = getComputedStyle(image);
    if (!['contain','scale-down'].includes(style.objectFit) || style.transform !== 'none') return rect;
    const insetLeft = parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft);
    const insetTop = parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop);
    const contentWidth = rect.width - insetLeft - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight);
    const contentHeight = rect.height - insetTop - parseFloat(style.borderBottomWidth) - parseFloat(style.paddingBottom);
    if (contentWidth <= 0 || contentHeight <= 0 || !image.naturalHeight) return rect;
    const scale = Math.min(contentWidth/image.naturalWidth, contentHeight/image.naturalHeight, style.objectFit === 'scale-down' ? 1 : Infinity);
    const width = image.naturalWidth*scale, height = image.naturalHeight*scale;
    // Computed keyword positions become percentages. Leave complex calc/edge
    // offsets and positions that crop the bitmap on the existing element check.
    const positions = style.objectPosition.trim().split(/\s+/);
    if (positions.length !== 2) return rect;
    const offset = (value, space) => {
      const match = value.match(/^(-?(?:\d+(?:\.\d*)?|\.\d+))(%|px)$/);
      if (!match) return null;
      const amount = Number(match[1]);
      const pixels = match[2] === '%' ? space*amount/100 : amount;
      return pixels >= 0 && pixels <= space ? pixels : null;
    };
    const x = offset(positions[0], Math.max(0,contentWidth-width));
    const y = offset(positions[1], Math.max(0,contentHeight-height));
    if (x === null || y === null) return rect;
    const left = rect.left + insetLeft + x, top = rect.top + insetTop + y;
    return {left, top, right:left+width, bottom:top+height, width, height};
  };
  const imageCheck = (image, label) => {
    if (!image) { issues.push(label + ': required image is missing'); return; }
    if (!visible(image) || image.getBoundingClientRect().width < 32 || image.getBoundingClientRect().height < 32) {
      issues.push(label + ': image is hidden or has insufficient dimensions'); return;
    }
    if (!image.complete || image.naturalWidth === 0) { issues.push(label + ': image did not load'); return; }
    image.scrollIntoView({block:'center', inline:'center'});
    const rect = paintedImageRect(image);
    const left = Math.max(0, rect.left), right = Math.min(innerWidth, rect.right);
    const top = Math.max(0, rect.top), bottom = Math.min(innerHeight, rect.bottom);
    if (right - left < 24 || bottom - top < 24) { issues.push(label + ': image is outside the visible layout'); return; }
    let clear = 0;
    const overrides = [];
    const participate = element => {
      overrides.push([element,element.style.getPropertyValue('pointer-events'),element.style.getPropertyPriority('pointer-events')]);
      element.style.setProperty('pointer-events','auto','important');
    };
    participate(image);
    // Hit testing normally ignores pointer-transparent paint. Include intersecting
    // painted boxes temporarily, but leave empty transparent layout wrappers alone.
    for (const element of document.querySelectorAll('*')) {
      if (element === image || !element.style) continue;
      const style = getComputedStyle(element);
      if (style.pointerEvents !== 'none') continue;
      const box = element.getBoundingClientRect();
      if (box.right <= left || box.left >= right || box.bottom <= top || box.top >= bottom || !visible(element)) continue;
      const color = style.backgroundColor;
      let alpha = color === 'transparent' ? 0 : 1;
      if (color.startsWith('rgba(') || color.includes('/')) {
        const match = color.match(/(?:,|\/)\s*([\d.]+)\s*\)$/);
        if (match) alpha = Number(match[1]);
      }
      let opacity = 1;
      for (let node = element; node; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity);
      const painted = alpha * opacity >= .5 || (opacity >= .5 && (style.backgroundImage !== 'none' || (element.tagName === 'IMG' && element.naturalWidth > 0)));
      if (painted) participate(element);
    }
    try {
      for (const x of [.2,.5,.8]) for (const y of [.2,.5,.8]) {
        if (document.elementFromPoint(left + (right-left)*x, top + (bottom-top)*y) === image) clear++;
      }
    } finally {
      for (const [element,value,priority] of overrides.reverse()) {
        if (value) element.style.setProperty('pointer-events',value,priority);
        else element.style.removeProperty('pointer-events');
      }
    }
    if (clear < 7) issues.push(label + ': image is obscured by another element (' + clear + '/9 clear samples)');
  };
  const primaryImages = [...document.querySelectorAll('img[data-wr-bind="product.image"],img[data-wr-design-asset="scene"]')].filter(image => !image.closest('[data-wr-products]') && (pageType !== 'detail' || image.matches('[data-wr-bind="product.image"]')));
  for (const image of document.querySelectorAll('img[data-wr-design-asset]')) {
    if (!visible(image) || !image.naturalWidth || !image.naturalHeight) continue;
    const box = image.getBoundingClientRect();
    const style = getComputedStyle(image), fit = style.objectFit;
    const width = box.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth);
    const height = box.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth);
    const ratio = (width / height) / (image.naturalWidth / image.naturalHeight);
    if (fit === 'cover' && Math.min(ratio, 1/ratio) < .95) issues.push(image.dataset.wrDesignAsset + ': CSS crops the approved asset again; use object-fit:contain and its natural aspect ratio');
    if (fit === 'fill' && Math.abs(ratio-1) > .05) issues.push(image.dataset.wrDesignAsset + ': CSS distorts the approved asset aspect ratio');
  }
  if (['home','about','detail'].includes(pageType)) {
    if (!primaryImages.length) issues.push(pageType + ': required primary product image outside the collection is missing; use the real img binding, not CSS product drawings');
    else imageCheck(primaryImages[0], pageType + ' primary product');
  }
  const cards = [...document.querySelectorAll('[data-wr-product]')];
  if (pageType === 'catalog' && !cards.length) issues.push('catalog: product cards are missing');
  for (const [index,card] of cards.entries()) {
    imageCheck(card.querySelector('img[data-wr-bind="product.image"]'), 'card ' + (index+1));
    for (const binding of ['product.name','product.description']) {
      const element = card.querySelector('[data-wr-bind="'+binding+'"]');
      if (element && element.textContent.trim() && !visible(element)) issues.push('card '+(index+1)+': '+binding+' is hidden');
    }
  }
  const titleSelector = 'h1[data-wr-bind="'+titleBinding+'"],h1[data-wr-bind="page.title"]' + (pageType === 'about' ? ',h1[data-wr-bind="copy.headline"]' : '');
  const title = [...document.querySelectorAll(titleSelector)].find(element => !element.closest('[data-wr-products]'));
  if (!title || !title.textContent.trim() || !visible(title)) issues.push(pageType + ': principal title is missing or hidden');
  for (const binding of contentBindings) {
    const element = [...document.querySelectorAll('[data-wr-bind="'+binding+'"]')].find(element => !element.closest('[data-wr-products]'));
    if (!element || !element.textContent.trim() || !visible(element)) issues.push(pageType + ': approved content is missing or hidden: ' + binding);
  }
  for (const binding of pageType === 'detail' ? ['product.description'] : ['copy.subtitle','copy.about']) {
    const elements = [...document.querySelectorAll('[data-wr-bind="'+binding+'"]')].filter(element => !element.closest('[data-wr-products]') && !element.closest('header'));
    if (elements.some(element => element.textContent.trim()) && !elements.some(element => element.textContent.trim() && visible(element))) issues.push(pageType + ': main '+binding+' is hidden');
  }
  scrollTo(0,0);
  const forms = [...document.querySelectorAll('form[data-wr-inquiry]')];
  for (const label of document.querySelectorAll('[data-wr-label]')) {
    if (!label.textContent.trim() || !visible(label)) issues.push('presentation label is empty or hidden: '+label.getAttribute('data-wr-label'));
  }
  if (pageType === 'contact' && !forms.length) issues.push('contact: inquiry form is missing');
  for (const form of forms) {
    if (!visible(form)) issues.push('contact: inquiry form is missing or hidden');
    for (const selector of ['[name="name"]','[name="email"]','[name="company"]','[name="message"]','button[type="submit"]']) {
      if (!visible(form?.querySelector(selector))) issues.push('contact: a required form field or submit button is missing or hidden');
    }
  }
  const nav = document.querySelector('[data-wr-nav]');
  if (!visible(nav)) issues.push('navigation is missing or hidden');
  const links = [...document.querySelectorAll('[data-wr-nav] a, header>a[data-wr-page]')];
  for (const link of links) {
    // Brand marks can intentionally use large nested type; they are not menu labels.
    if (!link.closest('[data-wr-nav]') && (link.matches('[data-wr-bind="company.name"]') || link.querySelector('[data-wr-bind="company.name"],img[data-wr-bind="company.logo"]'))) continue;
    const rect = link.getBoundingClientRect();
    if (!visible(link) || rect.left < -2 || rect.right > innerWidth+2) issues.push('navigation link is hidden or outside the viewport');
    const containingHeader = link.closest('[data-wr-nav]')?.closest('header');
    if (containingHeader) {
      const headerRect = containingHeader.getBoundingClientRect();
      if (rect.top < headerRect.top-2 || rect.bottom > headerRect.bottom+2 || rect.left < headerRect.left-2 || rect.right > headerRect.right+2) issues.push('navigation link extends outside its containing header');
    }
    const lineTops = [];
    const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if (!walker.currentNode.textContent.trim()) continue;
      const range = document.createRange(); range.selectNodeContents(walker.currentNode);
      for (const textRect of range.getClientRects()) {
        if (textRect.width && textRect.height && !lineTops.some(top => Math.abs(top-textRect.top)<3)) lineTops.push(textRect.top);
      }
    }
    if (lineTops.length > 2 || getComputedStyle(link).writingMode.startsWith('vertical')) issues.push('navigation or header CTA is squeezed into vertical text');
  }
  if (document.documentElement.scrollWidth > innerWidth+1) issues.push('page content extends outside the viewport');
  return [...new Set(issues)];
}"""


async def inspect_page(page_type: str, html: str, draft: dict[str, Any], references: dict[str, str], design_image: str | None = None) -> RenderResult:
    return await asyncio.wait_for(_inspect(page_type, html, draft, references, design_image), timeout=40)


async def _inspect(page_type: str, html: str, draft: dict[str, Any], references: dict[str, str], design_image: str | None = None) -> RenderResult:
    result = RenderResult()
    document = render_document(html, draft, references)
    async with async_playwright() as playwright:
        try:
            browser = await playwright.chromium.launch(channel=os.environ.get("SITE_BUILDER_BROWSER_CHANNEL") or None)
        except Exception:
            raise OutputValidationError("Local Chromium is unavailable; install the service Playwright Chromium runtime") from None
        try:
            context = await browser.new_context(service_workers="block", java_script_enabled=False)
            await context.route("**/*", lambda route: route.abort())
            reference_width, reference_height = image_size(design_image) if design_image else (1440, 1000)
            # Tiny synthetic images are used in contract tests; not full design screenshots.
            if reference_width < 640:
                reference_width, reference_height = 1440, 1000
            for width in (min(reference_width, 2560), 390):
                page = await context.new_page()
                await page.set_viewport_size({"width": width, "height": min(reference_height, 1600)})
                await page.set_content(document, wait_until="load", timeout=15000)
                await page.evaluate('document.fonts.ready')
                content_bindings = sorted(binding for binding in required_bindings(draft, page_type) if binding.startswith("section."))
                issues = await page.evaluate(CHECK_LAYOUT, {
                    "pageType": page_type,
                    "titleBinding": page_title_binding(page_type),
                    "contentBindings": content_bindings,
                })
                result.issues.extend(f"{width}px: {issue}" for issue in issues)
                metrics = await page.evaluate('''() => {
                  const layout = elements => {
                    const rows = [];
                    const boxes = elements.map(element => element.getBoundingClientRect()).filter(box => box.width >= 4 && box.height >= 4).sort((a,b) => a.top-b.top || a.left-b.left);
                    for (const box of boxes) {
                      // Intersect vertical spans so center-aligned cards of different heights
                      // still belong to one row. Count the actual boxes, not declared CSS tracks.
                      const row = rows.find(row => Math.min(row.bottom,box.bottom)-Math.max(row.top,box.top) > 2);
                      if (row) { row.top = Math.max(row.top,box.top); row.bottom = Math.min(row.bottom,box.bottom); row.count++; }
                      else rows.push({top:box.top,bottom:box.bottom,count:1});
                    }
                    return {columns: Math.max(0,...rows.map(row => row.count)), rows: rows.length};
                  };
                  let sectionIndex = null;
                  const collectionGroups = [];
                  for (const node of document.querySelectorAll('[data-wr-bind], [data-wr-products]')) {
                    const section = /^section\\.(\\d+)\\.(heading|body)$/.exec(node.getAttribute('data-wr-bind') || '');
                    if (section && !node.closest('[data-wr-products]')) sectionIndex = Number(section[1]);
                    if (node.hasAttribute('data-wr-products')) collectionGroups.push({
                      sectionIndex,
                      productIds: [...node.querySelectorAll('[data-wr-product]')].map(card =>
                        card.querySelector('a[data-wr-page="detail"][data-wr-product-id]')?.getAttribute('data-wr-product-id') ?? null),
                    });
                  }
                  const collectionLayouts = [...document.querySelectorAll('[data-wr-products]')].map(node => ({
                    ...layout([...node.querySelectorAll('[data-wr-product]')]),
                    descriptionCount: [...node.querySelectorAll('[data-wr-bind="product.description"]')].filter(element => element.textContent.trim()).length,
                  }));
                  const formLayouts = [...document.querySelectorAll('form[data-wr-inquiry]')].map(node => ({
                    columns: layout([...node.querySelectorAll('input,textarea,select,button[type="submit"]')]).columns,
                  }));
                  return {width:innerWidth,height:document.documentElement.scrollHeight,cards:document.querySelectorAll('[data-wr-product]').length,collections:[...document.querySelectorAll('[data-wr-products]')].map(node=>node.querySelectorAll('[data-wr-product]').length),collectionGroups,collectionLayouts,scenes:document.querySelectorAll('[data-wr-design-asset="scene"]').length,forms:document.querySelectorAll('form[data-wr-inquiry]').length,formLayouts};
                }''')
                metrics['referenceHeight'] = reference_height
                result.metrics.append(metrics)
                if width != 390 and design_image and image_size(design_image)[0] >= 640 and metrics['height'] > reference_height * 1.35:
                    result.issues.append(f'{width}px: page height {metrics["height"]}px exceeds the complete approved design ({reference_height}px) by more than 35%; check added descriptions, repeated collections and footer rows')
                await page.evaluate("scrollTo(0,0)")
                # Limit screenshot height so malformed huge pages do not exhaust memory.
                height = min(5000, metrics['height'])
                png = await page.screenshot(type="png", full_page=True, clip={"x": 0, "y": 0, "width": width, "height": height}, timeout=15000)
                result.screenshots.append("data:image/png;base64," + base64.b64encode(png).decode())
                await page.close()
            await context.close()
        finally:
            await browser.close()
    return result
