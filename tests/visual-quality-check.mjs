import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const routes = ['/', '/san-pham', '/cong-nghe', '/ve-chung-toi', '/cong-dong', '/tin-tuc', '/doi-tac', '/lien-he', '/thong-tin', '/chinh-sach-bao-mat', '/dieu-khoan-su-dung'];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  for (const route of routes) {
    await page.goto('http://127.0.0.1:5173' + route);
    await page.evaluate(() => document.fonts.ready);
    for (const [width, height] of [[320, 844], [375, 844], [768, 1024], [1024, 768], [844, 390]]) {
      await page.setViewportSize({ width, height });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${route} overflows at ${width}`);
      const heading = page.locator('h1');
      assert(await heading.isVisible(), `${route}: heading hidden`);
    }
    // Compare identical DOM states: scroll-driven class assignment varies with layout.
    // Temporarily disable only this pass's stylesheet, then compare all motion properties.
    const sameMotion = await page.evaluate(() => {
      const sheet = [...document.querySelectorAll('style')].find(el => el.dataset.viteDevId?.endsWith('/visual-quality.css'));
      if (!sheet) throw new Error('Quality stylesheet missing');
      const snapshot = () => [...document.querySelectorAll('body *')].flatMap(el => ['', '::before', '::after'].map(pseudo => {
        const s = getComputedStyle(el, pseudo || null);
        return [s.animation, s.transition];
      }));
      const after = snapshot();
      sheet.media = 'not all';
      const before = snapshot();
      sheet.media = '';
      return JSON.stringify(before) === JSON.stringify(after);
    });
    assert(sameMotion, `${route}: motion declarations changed`);
  }
  console.log('PASS: 11 routes × 5 small/tablet/landscape viewports; no horizontal overflow; visible headings; identical animation/transition declarations on unchanged DOM.');
} finally { await browser.close(); }
