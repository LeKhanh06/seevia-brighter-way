import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
const base = process.env.BASE_URL || 'http://127.0.0.1:5176';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const code of [200, 429, 502]) {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    await page.route('**/api/contact/status', route => route.fulfill({ json: { available: true } }));
    let sends = 0, payload;
    await page.route('**/api/contact', async route => {
      sends++; payload = route.request().postDataJSON();
      await route.fulfill({ status: code, json: { ok: code === 200 } });
    });
    await page.goto(base + '/lien-he');
    await page.locator('#contact-name').fill('Người gửi');
    await page.locator('#contact-email').fill('visitor@example.org');
    await page.locator('#contact-message').fill('Một lời nhắn kiểm tra, không gửi thật.');
    await page.locator('.ct-form button[type=submit]').click();
    assert.equal(sends, 0, 'Review must not send');
    await page.locator('.ct-send').click();
    await page.waitForFunction(() => document.querySelector('.ct-dialog [role=status]').textContent.length > 0);
    assert.equal(sends, 1);
    assert.equal(payload.name, 'Người gửi');
    assert.equal(payload.email, 'visitor@example.org');
    assert.equal(payload.to, undefined);
    assert.equal(await page.locator('#contact-message').inputValue(), payload.message);
    if (code === 200) assert.equal(await page.locator('.ct-send').isDisabled(), true);
    else assert.equal(await page.locator('.ct-send').isEnabled(), true);
    await page.locator('.ct-close').click();
    await page.locator('.header-tools button[lang=en]').click();
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    await page.locator('.ct-form button[type=submit]').click();
    assert.equal(await page.locator('.ct-send').innerText(), 'Send message');
    await page.close();
  }
  console.log('PASS: explicit sending after review, required identity, fixed server recipient, success/error/rate-limit states, retained message, English UI. No real email sent.');
} finally { await browser.close(); }
