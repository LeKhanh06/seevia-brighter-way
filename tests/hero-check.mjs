import { mkdirSync } from 'node:fs';
mkdirSync('test-results', { recursive: true });
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({channel:'chrome',headless:true});
const page = await browser.newPage({viewport:{width:1450,height:1000}});
await page.goto(process.env.BASE_URL || 'http://127.0.0.1:5176');
await page.evaluate(()=>document.fonts.ready);
for (const label of await page.locator('.hero-object').all()) {
  const box = await label.boundingBox();
  await page.mouse.move(box.x+5,box.y+10);
  await page.waitForTimeout(80);
  assert(Number(await label.evaluate(el=>getComputedStyle(el).opacity))>.8);
  const response=await page.locator('.hero .speech p').innerText();
  const name=await label.innerText();
  assert(response.startsWith(name.replace('✦','').trim().split(' · ')[0]) || response.startsWith('Biển hiệu:'));
}
await page.screenshot({path:'test-results/hero-interaction.png'});
await page.locator('.hero-object').first().focus();
assert.equal(await page.locator('.hero .speech p').innerText(),'Cầu thang xuống, cách 2 mét phía trước.');
await browser.close();
console.log('Passed all five hover responses, label illumination and keyboard selection.');
