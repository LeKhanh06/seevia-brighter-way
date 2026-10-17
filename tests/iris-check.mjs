import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({reducedMotion:'reduce'});
await page.goto(process.env.BASE_URL || 'http://127.0.0.1:5176');
await page.evaluate(()=>document.fonts.ready);
for(const width of [1440,820,390]) {await page.setViewportSize({width,height:900}); await page.screenshot({path:`test-results/hyper-sky-${width}.png`,fullPage:true});}
function lum(h){const v=h.match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722;}
for(const [fg,bg] of [['14213d','f7faff'],['b51765','f7faff'],['505f75','f7faff'],['f7c6de','14213d'],['14213d','f7c6de'],['14213d','b5f44a'],['14213d','c9f879'],['090b12','e72b88'],['38bdf8','14213d']]){const a=lum(fg),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(ratio>=4.5);console.log(`${fg}/${bg}: ${ratio.toFixed(2)}:1`);}
await page.emulateMedia({reducedMotion:'no-preference'});
assert.equal(await page.locator('.radar-trail').evaluate(el=>getComputedStyle(el).animationName),'radar-glide');
await page.emulateMedia({reducedMotion:'reduce'});
assert.equal(await page.locator('.radar-trail').evaluate(el=>getComputedStyle(el).animationName),'none');
await browser.close();console.log('PASS: palette contrast pairs, responsive screenshots, original radar motion preferences.');
