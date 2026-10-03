// Browser acceptance for the running, read-only Pawfect motion preview.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const out = resolve('artifacts/pawfect-motion');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const results = [];
const errors = [];
const origin = 'http://127.0.0.1:4211/';
const nextFrame = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
// Original preview cards also have a finite CSS reveal transition; settle it before measuring.
const finish = page => page.evaluate(() => document.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime)).forEach(animation => animation.finish()));
const scroll = async (page, y) => {
  await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y);
  await nextFrame(page);
};
const ready = async page => {
  await page.evaluate(async () => { document.querySelectorAll('img').forEach(image => image.loading = 'eager'); await Promise.all([...document.images].map(image => image.decode().catch(() => {}))); await document.fonts.ready; });
  await nextFrame(page);
};
const layout = page => page.evaluate(() => [...document.querySelectorAll('.pg-section,.pg-service,.pg-gallery figure,h1,h2,.pg-button')].map(el => ({
  tag: el.tagName, text: el.textContent, top: el.offsetTop, left: el.offsetLeft, width: el.offsetWidth, height: el.offsetHeight,
})));
// Observe the browser's real animations, including entrances that finish before image decoding.
const observeEntrances = context => context.addInitScript(() => {
  window.pawfectEntranceHistory = [];
  const animate = Element.prototype.animate;
  Element.prototype.animate = function (...args) {
    const animation = animate.apply(this, args);
    window.pawfectEntranceHistory.push({ target: this, animation, observedAt: performance.now() });
    return animation;
  };
});
const entranceSamples = (page, selector) => page.evaluate(selector => {
  const latest = new Map();
  for (const item of window.pawfectEntranceHistory) {
    if (item.animation.id === 'pawfect-scroll-enter' && item.target.matches(selector)) latest.set(item.target, item);
  }
  return [...latest].map(([target, { animation, observedAt }]) => {
    const frames = animation.effect.getKeyframes();
    const timing = animation.effect.getTiming();
    const pose = frame => {
      const parts = String(frame.translate || '0 0').split(/\s+/);
      const pixels = (value, size) => parseFloat(value || '0') * (String(value).endsWith('%') ? size / 100 : 1);
      const matrix = new DOMMatrix(frame.transform && frame.transform !== 'none' ? frame.transform : undefined);
      const rotation = String(frame.rotate || '0deg');
      const angle = parseFloat(rotation.split(/\s+/).at(-1)) * (rotation.endsWith('rad') ? 180 / Math.PI : rotation.endsWith('turn') ? 360 : 1);
      return { x: pixels(parts[0], target.offsetWidth) + matrix.m41, y: pixels(parts[1], target.offsetHeight) + matrix.m42, angle: angle + Math.atan2(matrix.b, matrix.a) * 180 / Math.PI };
    };
    return {
      selector: target.className || target.tagName, width: target.offsetWidth, height: target.offsetHeight,
      first: pose(frames[0]), last: pose(frames.at(-1)), delay: Number(timing.delay), duration: Number(timing.duration), observedAt,
      trajectory: frames.map(({ offset, translate, rotate, transform, scale, opacity, filter, clipPath }) => ({ offset, translate, rotate, transform, scale, opacity, filter, clipPath })),
    };
  });
}, selector);
const hasStagger = samples => samples.length > 1 && new Set(samples.map(sample => sample.delay)).size > 1;

const visitAll = async (page, reverse = false) => {
  const height = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const points = Array.from({ length: Math.ceil(height / 550) + 1 }, (_, index) => Math.min(index * 550, height));
  if (reverse) points.reverse();
  for (const top of points) { await scroll(page, top); await finish(page); }
};
const entranceCounts = page => page.evaluate(() => {
  const counts = new Map();
  for (const { target, animation } of window.pawfectEntranceHistory) if (animation.id === 'pawfect-scroll-enter') counts.set(target, (counts.get(target) || 0) + 1);
  return { total: [...counts.values()].reduce((sum, count) => sum + count, 0), duplicateTargets: [...counts].filter(([, count]) => count > 1).map(([target, count]) => ({ tag: target.tagName, className: target.className, count })) };
});
const settledTransforms = page => page.evaluate(() => {
  const targets = new Set(window.pawfectEntranceHistory.filter(item => item.animation.id === 'pawfect-scroll-enter').map(item => item.target));
  document.querySelectorAll('.pg-portrait,.pg-orbit,.pg-photo-tag,.pg-gallery img').forEach(el => targets.add(el));
  return [...targets].map(el => { const style = getComputedStyle(el); return { transform: style.transform, translate: style.translate, rotate: style.rotate, scale: style.scale }; });
});
const focusDuringEntrance = async page => {
  const found = await page.evaluate(() => {
    const focusable = [...document.querySelectorAll('a[href],button:not([disabled]),input:not([type="hidden"]):not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex="0"]')].filter(el => el.getBoundingClientRect().width && el.getBoundingClientRect().height);
    for (const { target, animation } of window.pawfectEntranceHistory) {
      if (animation.id !== 'pawfect-scroll-enter' || animation.playState !== 'running') continue;
      const index = focusable.findIndex(el => target.contains(el));
      if (index <= 0) continue;
      window.pawfectFocusCandidate = focusable[index];
      focusable[index - 1].focus();
      return true;
    }
    return false;
  });
  if (!found) return false;
  await page.keyboard.press('Tab');
  await nextFrame(page);
  const focusState = await page.evaluate(() => {
    const focused = window.pawfectFocusCandidate;
    if (document.activeElement !== focused) return { readable: false, reason: 'Unexpected tab destination', expected: focused?.outerHTML, actual: document.activeElement?.outerHTML };
    for (let el = focused; el; el = el.parentElement) {
      const style = getComputedStyle(el);
      if (Number(style.opacity) < .99 || style.visibility === 'hidden') return { readable: false, reason: 'Focused control is hidden', tag: el.tagName, className: el.className, opacity: style.opacity, visibility: style.visibility };
      if (el.getAnimations().some(animation => animation.id === 'pawfect-scroll-enter' && animation.playState === 'running')) return { readable: false, reason: 'Focused ancestor is still entering', className: el.className };
    }
    const rect = focused.getBoundingClientRect();
    return { readable: rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight, reason: 'Focused control viewport bounds', top: rect.top, bottom: rect.bottom };
  });
  assert.ok(focusState.readable, `Keyboard focus must be readable at ${page.url()}: ${JSON.stringify(focusState)}`);
  return true;
};
const visiblePose = (page, selector) => page.locator(selector).evaluate(el => {
  let opacity = 1, hidden = false;
  for (let node = el; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    opacity *= Number(style.opacity);
    hidden ||= style.visibility === 'hidden' || style.display === 'none';
  }
  return { opacity, hidden, top: el.getBoundingClientRect().top, entrances: el.getAnimations().filter(animation => animation.id === 'pawfect-scroll-enter').length };
});
const verifyNoFlash = async () => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(origin);
  await ready(page);
  const selector = '.pg-gallery-section .pg-section-title h2';
  const top = await page.locator(selector).evaluate(el => { let top = 0; for (let node = el; node; node = node.offsetParent) top += node.offsetTop; return top; });
  await scroll(page, top - 900 * .94);
  const waiting = await visiblePose(page, selector);
  await scroll(page, top - 900 * .86);
  const entering = await visiblePose(page, selector);
  const cold = await context.newPage();
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  let requested;
  const requestSeen = new Promise(resolve => { requested = resolve; });
  await cold.route('**/pawfect-motion.js', async route => { requested(); await gate; await route.continue(); });
  let coldPending;
  try {
    await cold.goto(origin, { waitUntil: 'commit' });
    await requestSeen;
    await cold.locator('.pg-hero h1').waitFor({ state: 'attached' });
    await cold.waitForTimeout(400); // Simulate a slow external motion bundle before its code can execute.
    coldPending = await visiblePose(cold, '.pg-hero h1');
  } finally {
    release();
    await cold.waitForLoadState('load');
  }
  const late = await context.newPage();
  let releaseLate;
  const lateGate = new Promise(resolve => { releaseLate = resolve; });
  await late.route('**/pawfect-motion.js', async route => { await lateGate; await route.continue(); });
  let lateBefore, lateAfter, lateAnimations;
  try {
    await late.goto(origin, { waitUntil: 'commit' });
    await late.locator('.pg-hero h1').waitFor({ state: 'attached' });
    await late.waitForFunction(() => {
      let opacity = 1;
      for (let node = document.querySelector('.pg-hero h1'); node; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (style.visibility === 'hidden' || style.display === 'none') return false;
        opacity *= Number(style.opacity);
      }
      return opacity >= .99;
    }, undefined, { timeout: 3000 });
    lateBefore = await visiblePose(late, '.pg-hero h1');
  } finally {
    releaseLate();
    await late.waitForLoadState('load');
  }
  await nextFrame(late);
  lateAfter = await visiblePose(late, '.pg-hero h1');
  lateAnimations = await late.evaluate(() => document.getAnimations().filter(animation => animation.id === 'pawfect-scroll-enter').length);
  await context.close();
  const withoutJsContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const withoutJsPage = await withoutJsContext.newPage();
  await withoutJsPage.goto(origin);
  const withoutJs = await visiblePose(withoutJsPage, '.pg-hero h1');
  await withoutJsContext.close();
  const checks = { waiting, entering, coldPending, lateBefore, lateAfter, lateAnimations, withoutJs };
  await writeFile(resolve(out, 'flash-report.json'), JSON.stringify(checks, null, 2) + '\n');
  assert.ok((waiting.hidden || waiting.opacity < .05) && (coldPending.hidden || coldPending.opacity < .05), `Pending content must not paint its settled pose before entrance: ${JSON.stringify(checks)}`);
  assert.ok(entering.entrances > 0, 'The pending section actually starts its entrance when scrolled into the trigger area');
  assert.ok(!lateBefore.hidden && lateBefore.opacity >= .99 && !lateAfter.hidden && lateAfter.opacity >= .99 && lateAnimations === 0, 'Slow-script fallback reveals content and a late runtime never hides or replays it');
  assert.ok(!withoutJs.hidden && withoutJs.opacity >= .99, 'Without JavaScript the original content remains readable');
  return checks;
};

try {
  const flashChecks = await verifyNoFlash();
  const manifest = await (await fetch(origin + '__manifest')).json();
  assert.equal(manifest.pages.length, 7, 'Use all seven captured production routes');
  assert.equal(manifest.images, 11, 'The accepted project still uses its original eleven image assets');
  const routes = ['home', ...manifest.pages.filter(page => page !== 'home')];
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'no-preference' });
    await observeEntrances(context);
    const page = await context.newPage();
    page.setDefaultTimeout(8000);
    page.on('pageerror', error => errors.push(error.message));
    const routeCombinations = new Map();
    let focusChecks = 0;
    for (const route of routes) {
      const [name, productId] = route.split(':');
      const params = new URLSearchParams({ page: name });
      if (productId) params.set('productId', productId);
      const url = origin + '?' + params;
      await page.goto(url + '&baseline=1');
      await ready(page);
      const before = await layout(page);
      const content = await page.locator('body').textContent();
      const images = await page.locator('img').evaluateAll(images => images.map(image => image.getAttribute('src')));
      await page.goto(url);
      await ready(page);
      assert.ok((await entranceCounts(page)).total > 0, `${route}: visible content has an entrance`);
      let homeChoreography;
      if (name === 'home') {
        const position = await page.locator('.pg-hero-art').evaluate(el => { let top = 0; for (let node = el; node; node = node.offsetParent) top += node.offsetTop; return top; });
        if (width <= 600) await scroll(page, Math.max(0, position - 450));
        const heroTitle = (await entranceSamples(page, '.pg-hero h1'))[0];
        const heroImage = (await entranceSamples(page, '.pg-hero-art,.pg-portrait'))[0];
        const heroBadges = await entranceSamples(page, '.pg-orbit,.pg-photo-tag');
        assert.ok(heroTitle && heroTitle.first.x - heroTitle.last.x < -Math.min(90, heroTitle.width * .25), 'Home headline visibly flies in from the left');
        assert.ok(heroImage && heroImage.first.x - heroImage.last.x > Math.min(90, heroImage.width * .25), 'Home image visibly flies in from the right');
        assert.ok(heroBadges.some(sample => Math.abs(sample.first.angle - sample.last.angle) >= 30), 'Home badge has a distinct spinning entrance');
        homeChoreography = { heroTitle, heroImage, heroBadges };
      }
      if (await focusDuringEntrance(page)) focusChecks++;
      await finish(page);
      await visitAll(page);
      const entered = await entranceCounts(page);
      assert.deepEqual(entered.duplicateTargets, [], `${route}: each element enters at most once while scrolling down`);
      const samples = await entranceSamples(page, '*');
      // Set comparison ignores text, selector names and repeated item counts: only real motion trajectories distinguish pages.
      const combination = JSON.stringify([...new Set(samples.map(sample => JSON.stringify(sample.trajectory)))].sort());
      routeCombinations.set(route, combination);
      assert.deepEqual(await layout(page), before, `${route}: animations preserve the original layout`);
      assert.equal(await page.locator('body').textContent(), content, `${route}: no text is rewritten`);
      assert.deepEqual(await page.locator('img').evaluateAll(images => images.map(image => image.getAttribute('src'))), images, `${route}: no image is replaced`);
      assert.equal(await page.locator('img[src]').evaluateAll(images => images.filter(image => !image.complete || !image.naturalWidth).length), 0, `${route}: original image resources load`);
      const stable = await settledTransforms(page);
      await visitAll(page, true);
      await visitAll(page);
      assert.deepEqual(await entranceCounts(page), entered, `${route}: no entrance replays on upward or repeated scrolling`);
      assert.deepEqual(await settledTransforms(page), stable, `${route}: settled elements have no ongoing parallax or drift`);
      await scroll(page, 0);
      assert.deepEqual(await settledTransforms(page), stable, `${route}: returning to the top leaves all settled poses unchanged`);
      assert.equal(await page.evaluate(() => document.getAnimations().filter(animation => animation.id === 'pawfect-scroll-enter' && animation.playState === 'running').length), 0, `${route}: no entrance keeps running after settlement`);

      if (name === 'home') {
        const cardEntrances = await entranceSamples(page, '.pg-service');
        const sectionTitles = await entranceSamples(page, '.pg-section-title h2');
        const galleryEntrances = await entranceSamples(page, '.pg-gallery figure img');
        assert.ok(cardEntrances.length && sectionTitles.length && galleryEntrances.length, 'Home cards, headings and gallery each receive entrances');
        assert.equal(new Set([cardEntrances[0], sectionTitles[0], galleryEntrances[0]].map(sample => JSON.stringify(sample.trajectory))).size, 3, 'Home uses three different later movement trajectories');
        if (width > 600) assert.ok(hasStagger(cardEntrances), 'Desktop home cards enter at staggered times');
        else assert.equal(cardEntrances.length, 3, 'All stacked mobile cards enter as they become visible');
        assert.ok(hasStagger(galleryEntrances), 'Home gallery images enter at staggered times');
        assert.ok(galleryEntrances.every(sample => sample.trajectory.some(frame => frame.clipPath && frame.clipPath !== 'none')), 'Home gallery images reveal through a mask');
        assert.equal((await entranceSamples(page, '.pg-gallery figure,.pg-gallery figcaption')).length, 0, 'Gallery captions remain stationary');
        assert.ok(galleryEntrances[0].duration > homeChoreography.heroTitle.duration, 'Gallery reveals are slower than the main headline entrance');
        homeChoreography = { ...homeChoreography, cardEntrances, sectionTitles, galleryEntrances };
        await page.locator('.pg-gallery').evaluate(el => el.scrollIntoView({ block: 'center' }));
        await nextFrame(page);
        assert.ok(await page.locator('.pg-gallery').evaluate(el => {
          const clip = el.getBoundingClientRect();
          return [...el.querySelectorAll('figure')].every(figure => { const box = figure.getBoundingClientRect(); return box.top >= clip.top - 1 && box.bottom <= clip.bottom + 1; });
        }), 'All settled gallery captions fit inside the existing scroller');
        if (width === 390) {
          await page.locator('.pg-gallery').evaluate(el => el.scrollLeft = 200);
          assert.ok(await page.locator('.pg-gallery').evaluate(el => el.scrollLeft > 0), 'Native horizontal gallery scrolling remains available');
        }
        await page.screenshot({ path: resolve(out, `gallery-${width}.png`) });
      }
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await nextFrame(page);
      assert.equal(await page.evaluate(() => document.getAnimations().filter(animation => animation.id === 'pawfect-scroll-enter').length), 0, `${route}: reduced motion cancels entrances`);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await nextFrame(page);
      await visitAll(page, true);
      await visitAll(page);
      assert.deepEqual(await entranceCounts(page), entered, `${route}: restoring motion preference never replays consumed entrances`);
      assert.deepEqual(await settledTransforms(page), stable, `${route}: preference toggle preserves settled poses`);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${route}: no horizontal page overflow`);
      results.push({ route, width, unchangedLayout: true, unchangedText: true, unchangedImages: true, onceOnly: true, noParallax: true, preferenceNoReplay: true, overflow: false, entrances: entered.total, choreography: homeChoreography, trajectories: samples });
    }
    assert.equal(new Set(routeCombinations.values()).size, routes.length, 'All seven routes have distinct effect combinations, including the three product details');
    assert.ok(focusChecks > 0, 'Keyboard readability is checked during a real active entrance');
    await page.goto(origin);
    await ready(page);
    assert.ok((await entranceCounts(page)).total > 0, 'A new page visit can play its entrances again');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await ready(page);
    assert.equal((await entranceCounts(page)).total, 0, 'Starting with reduced motion never creates an entrance');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await nextFrame(page);
    assert.equal((await entranceSamples(page, '.pg-hero h1')).length, 0, 'Content already visible under reduced motion does not replay when motion is enabled');
    await context.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(resolve(out, 'browser-report.json'), JSON.stringify({ passed: true, flashChecks, results, errors }, null, 2) + '\n');
  console.log(JSON.stringify({ passed: true, routes: 7, viewports: 2, cases: results.length, errors }));
} finally {
  await browser.close();
}
