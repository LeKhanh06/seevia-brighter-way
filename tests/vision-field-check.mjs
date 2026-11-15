import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
const url = process.env.BASE_URL || 'http://127.0.0.1:5173/';
const responses = [
  'Cầu thang xuống, cách 2 mét phía trước.',
  'Xe máy đang tới từ bên phải, cách 4 mét.',
  'Chị Lan đứng phía trước, đang mỉm cười với bạn.',
  'Biển hiệu: Nhà thuốc An Khang, mở cửa đến 21 giờ.',
  'Cửa ra vào, bên trái, đang mở.',
];
await page.goto(url);
await page.evaluate(() => document.fonts.ready);
for (const width of [1440, 1100, 820, 390, 375, 320]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.waitForTimeout(150);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  const field = await page.locator('.vision-field').boundingBox();
  const tags = await page.locator('.vision-tag').all();
  for (const tag of tags) {
    const box = await tag.boundingBox();
    assert(box.x >= field.x && box.x + box.width <= field.x + field.width, `label clipped at ${width}`);
    assert(box.y >= field.y && box.y + box.height <= field.y + field.height, `label clipped vertically at ${width}`);
  }
  await page.locator('.vision-hero').screenshot({ path: `test-results/vision-field-${width}.png` });
}
await page.setViewportSize({ width: 1440, height: 1000 });
const points = page.locator('.vision-point');
for (let i = 0; i < responses.length; i++) {
  await points.nth(i).click();
  assert.equal(await page.locator('#hero-vision-response').innerText(), responses[i]);
  assert.equal(await page.locator('.vision-point[aria-pressed="true"]').count(), 1);
}
await points.first().focus();
await page.keyboard.press('ArrowRight');
assert(await points.nth(1).evaluate(el => el === document.activeElement));
await page.keyboard.press('End');
assert(await points.last().evaluate(el => el === document.activeElement));
await page.keyboard.press('Home');
assert(await points.first().evaluate(el => el === document.activeElement));
const field = page.locator('.vision-field');
const bounds = await field.boundingBox();
await page.mouse.move(bounds.x + 35, bounds.y + 35);
await page.waitForTimeout(100);
assert(Math.abs(parseFloat(await field.evaluate(el => el.style.getPropertyValue('--vision-x'))) - 35) < 2);
await page.emulateMedia({ reducedMotion: 'reduce' });
assert.equal(await page.locator('.vision-glow').evaluate(el => getComputedStyle(el).display), 'none');
await points.nth(2).click();
assert.equal(await page.locator('#hero-vision-response').innerText(), responses[2]);
const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const mobile = await touch.newPage();
await mobile.goto(url);
for (let i = 0; i < responses.length; i++) {
  await mobile.locator('.vision-point').nth(i).tap();
  assert.equal(await mobile.locator('#hero-vision-response').innerText(), responses[i]);
}
await browser.close();
console.log('PASS: 320–1440px, unclipped labels, five selections, keyboard arrows/Home/End, contained pointer light, reduced motion, touch selection.');
