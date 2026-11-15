import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
const base = process.env.BASE_URL || 'http://127.0.0.1:5176';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/tin-tuc`);
  assert.equal(await page.locator('.np-row').count(), 6);
  await page.locator('.np-filters button').nth(2).click();
  assert.equal(await page.locator('.np-row').count(), 2);
  await page.locator('.np-filters button').first().click();
  await page.locator('#news-search').fill('sao mai');
  assert.equal(await page.locator('.np-row').count(), 1);
  await page.locator('#news-search').fill('tieng viet');
  assert.equal(await page.locator('.np-row').count(), 1);
  await page.locator('#news-search').fill('no-matching-article-1234');
  assert.equal(await page.locator('.np-row').count(), 0);
  await page.locator('.np-empty button').click();
  assert.equal(await page.locator('.np-row').count(), 6);
  await page.locator('.np-filters button').last().click();
  assert.equal(await page.locator('.np-row').count(), 3);
  await page.locator('.np-row-copy h3 button').first().click();
  assert.equal(await page.locator('dialog').evaluate(element => element.open), true);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('dialog').open);
  await page.locator('.np-note-art').last().click();
  assert.equal(await page.locator('dialog').evaluate(element => element.open), true);
  await page.locator('.np-dialog-close').click();
  for (const width of [1440, 820, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  }
  await page.goto(base);
  await page.locator('.footer-main nav').nth(1).locator('button').nth(1).click();
  await page.waitForURL('**/tin-tuc');
  await page.locator('.np-filters button').first().focus();
  await page.keyboard.press('/');
  assert.equal(await page.locator('#news-search').evaluate(element => element === document.activeElement), true);
  assert.deepEqual(errors, []);
  console.log('News: filtering, accent-insensitive search, empty state, dialogs, keyboard, responsive layout and footer link passed.');
} finally { await browser.close(); }
