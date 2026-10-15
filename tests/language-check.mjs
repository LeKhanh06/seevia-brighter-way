import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:5176';
const routes = {
  '/': 'Beyond sight.',
  '/san-pham': 'One pair of glasses,',
  '/cong-nghe': 'From what is seen,',
  '/ve-chung-toi': 'Technology begins',
  '/cong-dong': 'Every experience,',
  '/tin-tuc': 'New developments.',
  '/doi-tac': 'Connections that',
  '/lien-he': 'A simple hello.',
  '/chinh-sach-bao-mat': 'Privacy policy',
  '/dieu-khoan-su-dung': 'Terms of use',
  '/thong-tin': 'Using this website',
};
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  await page.route('**/api/contact/status', route => route.fulfill({ json: { available: false } }));
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base + '/lien-he');
  const original = await page.locator('h1').textContent();
  await page.locator('#contact-message').fill('Công nghệ');
  await page.locator('.header-tools button[lang=en]').click();
  await page.waitForFunction(() => document.querySelector('h1').textContent.includes('hello'));
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  assert.equal(await page.locator('#contact-message').inputValue(), 'Công nghệ');
  assert.equal(await page.locator('#contact-message').getAttribute('placeholder'), 'Hello SeeVia, I would like to share…');
  await page.locator('.ct-form button[type=submit]').click();
  assert.equal(await page.locator('.ct-message').innerText(), 'Công nghệ');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('.ct-dialog .ct-primary').click();
  const download = await downloadPromise;
  const contents = await readFile(await download.path(), 'utf8');
  assert.ok(contents.includes('A MESSAGE FOR SEEVIA'));
  assert.ok(contents.includes('Công nghệ'));
  assert.ok(contents.includes('Not sent to SeeVia'));
  await page.keyboard.press('Escape');
  await page.locator('.header-tools button[lang=vi]').click();
  await page.waitForFunction(() => document.documentElement.lang === 'vi');
  assert.equal(await page.locator('h1').textContent(), original);
  assert.equal(await page.locator('#contact-message').inputValue(), 'Công nghệ');
  await page.locator('.header-tools button[lang=en]').click();
  for (const [route, heading] of Object.entries(routes)) {
    await page.goto(base + route);
    assert.equal(await page.locator('html').getAttribute('lang'), 'en', route);
    assert.ok((await page.locator('main h1').innerText()).includes(heading), route);
    assert.ok(!(await page.title()).includes('Chính sách'), `${route}: translated title`);
    for (const width of [1440, 820, 390]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${route} overflow at ${width}`);
    }
  }
  await page.goto(base + '/tin-tuc');
  await page.locator('#news-search').fill('Vietnamese text reading');
  assert.equal(await page.locator('.np-row').count(), 1);
  await page.locator('.np-row-copy h3 button').click();
  assert.ok((await page.locator('dialog h2').innerText()).includes('Vietnamese'));
  await page.keyboard.press('Escape');
  await page.locator('#news-search').fill('tieng viet');
  assert.equal(await page.locator('.np-row').count(), 1);
  await page.goto(base + '/cong-nghe');
  await page.locator('.chat-scenarios button').first().click();
  assert.ok((await page.locator('.tech-chat').innerText()).includes('The notice says:'));
  await page.locator('.header-tools button[lang=vi]').click();
  await page.waitForFunction(() => document.documentElement.lang === 'vi');
  assert.ok((await page.locator('.tech-chat').innerText()).includes('Thông báo ghi:'));
  assert.deepEqual(errors, []);
  console.log('PASS: 11 bilingual pages, persistent language, desktop/tablet/mobile, draft preservation/download, bilingual search, dynamic dialog/chat, round-trip switching');
} finally { await browser.close(); }
