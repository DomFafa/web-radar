import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin = 'http://127.0.0.1:8788';
assert.equal((await (await fetch(origin + '/api/config')).json()).testMode, true);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
const steps = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
await mkdir('artifacts/preview-browser', { recursive: true });
try {
  await page.goto(origin);
  await page.getByRole('button', { name: '项目创建者', exact: true }).click();
  await page
    .locator('.project-card')
    .filter({ hasText: 'Browser Studio acceptance' })
    .first()
    .click();
  await page.getByRole('button', { name: '整站预览', exact: true }).click();
  const frame = page.frameLocator('iframe');
  await expect(frame.locator('html')).toHaveAttribute('lang', 'en');
  const video = frame.locator('video');
  await expect
    .poll(() => video.evaluate((v) => Number.isFinite(v.duration) && v.duration > 10))
    .toBe(true);
  await expect
    .poll(() => frame.locator('.poster').evaluate((v) => v.naturalWidth))
    .toBeGreaterThan(0);
  await expect.poll(() => video.evaluate((v) => v.currentTime)).toBeGreaterThan(0);
  await frame.locator('#video-toggle').click();
  await expect.poll(() => video.evaluate((v) => v.paused)).toBe(true);
  await frame.locator('#video-toggle').click();
  await expect.poll(() => video.evaluate((v) => v.paused)).toBe(false);
  steps.push('opaque sandbox images and 12s video load; playback, pause and resume work');
  await page.screenshot({ path: 'artifacts/preview-browser/home.png', fullPage: true });
  await frame.locator('header [data-wr-lang="de"]').click();
  await expect(frame.locator('html')).toHaveAttribute('lang', 'de');
  await frame.locator('header [data-wr-page="catalog"]').click();
  await frame.locator('[data-wr-page="detail"]').first().click();
  await expect(frame.locator('section.detail h1')).toBeVisible();
  steps.push('in-preview German switch and catalog-to-product navigation work');
  await page.screenshot({ path: 'artifacts/preview-browser/detail.png', fullPage: true });
  await frame.locator('header [data-wr-page="contact"]').click();
  await expect(frame.locator('form button')).toBeDisabled();
  steps.push('preview inquiry cannot submit');
  await page.getByLabel('预览页面').selectOption('home');
  await expect(frame.locator('video')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => frame.locator('video').evaluate((v) => v.paused)).toBe(true);
  steps.push('reduced motion pauses video');
  assert.deepEqual(errors, []);
  assert.equal(await page.locator('iframe').getAttribute('sandbox'), 'allow-scripts');
  await writeFile(
    'artifacts/preview-browser/result.json',
    JSON.stringify(
      {
        at: new Date().toISOString(),
        mode: 'actual local authenticated media; opaque sandbox',
        steps,
        errors,
      },
      null,
      2,
    ),
  );
  console.log(steps.join('\n'));
} catch (error) {
  await page
    .screenshot({ path: 'artifacts/preview-browser/failure.png', fullPage: true })
    .catch(() => {});
  await writeFile(
    'artifacts/preview-browser/failure.json',
    JSON.stringify({ error: String(error), steps, errors }, null, 2),
  );
  throw error;
} finally {
  await browser.close();
}
