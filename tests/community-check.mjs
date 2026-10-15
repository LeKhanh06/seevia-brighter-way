import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:5176';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const errors = [];
  const writes = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    if (['POST', 'PUT', 'PATCH'].includes(request.method())) writes.push(request.url());
  });
  await page.goto(`${base}/cong-dong`);
  await page.locator('.cp-filters button').nth(1).click();
  assert.equal(await page.locator('.cp-story').count(), 1);
  await page.locator('.cp-filters button').nth(2).focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('.cp-filters button').nth(2).getAttribute('aria-pressed'), 'true');
  await page.locator('.cp-filters button').first().click();
  assert.equal(await page.locator('.cp-story').count(), 3);
  assert.equal(await page.locator('main form, main details').count(), 0);
  assert.equal(await page.locator('.cp-action svg').count(), 6);
  for (const width of [1440, 820, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  }
  await page.goto(base);
  await page.locator('.footer-main nav').nth(1).locator('button').first().click();
  await page.waitForURL('**/cong-dong');
  assert.deepEqual(errors, []);
  console.log('Community: filters, keyboard, removed form/FAQ, consistent icons, responsive layout and footer link passed.');
} finally {
  await browser.close();
}
