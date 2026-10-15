import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
const base = process.env.BASE_URL || 'http://127.0.0.1:5176';
const routes = ['/', '/san-pham', '/cong-nghe', '/ve-chung-toi', '/cong-dong', '/tin-tuc', '/doi-tac', '/lien-he', '/thong-tin', '/chinh-sach-bao-mat', '/dieu-khoan-su-dung'];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const links = new Set();
  for (const route of routes) {
    await page.goto(base + route);
    assert.equal(await page.locator('main h1').count(), 1, route);
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${route}: overflow ${width}`);
    }
    const internal = await page.locator('a[href]').evaluateAll(elements => elements.map(element => element.getAttribute('href')).filter(href => href.startsWith('/') || href.startsWith('#')));
    for (const href of internal) links.add(new URL(href, base + route).href);
    assert.equal(await page.locator('.site-motion-pending').count(), 0, `${route}: reduced motion`);
  }
  for (const href of links) {
    const url = new URL(href);
    assert.ok(routes.includes(url.pathname), href);
    if (url.hash) {
      await page.goto(href);
      assert.ok(await page.evaluate(id => !!document.getElementById(id), decodeURIComponent(url.hash.slice(1))), href);
    }
  }
  await page.goto(base + '/san-pham');
  await page.locator('main .button').first().click();
  assert.equal(new URL(page.url()).hash, '#design');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(base + '/doi-tac');
  assert.ok(await page.locator('.site-motion-target').count() > 0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => document.querySelectorAll('.site-motion-pending').length === 0);
  assert.equal(await page.locator('.site-motion-pending').count(), 0);
  assert.deepEqual(errors, []);
  console.log(`PASS: ${routes.length} routes, desktop/mobile, ${links.size} internal links, product anchor, motion preferences, no runtime errors`);
} finally { await browser.close(); }
