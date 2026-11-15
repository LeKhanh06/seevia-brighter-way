import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const dir='test-results/prism-review';mkdirSync(dir,{recursive:true});
function lum(h){const v=h.match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722;}
const result=[];
for(const [fg,bg] of [['3e3558','fcfaf4'],['60566d','fcfaf4'],['9c2350','fcfaf4'],['3e3558','8ed8ff'],['21172f','e94b87'],['3e3558','ddf36a']]){const a=lum(fg),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);result.push({fg,bg,ratio:ratio.toFixed(2)});assert(ratio>=4.5,JSON.stringify(result.at(-1)));}
try{
 const page=await browser.newPage({reducedMotion:'reduce'});
 for(const route of ['/','/san-pham','/cong-nghe','/ve-chung-toi','/cong-dong','/tin-tuc','/doi-tac','/lien-he']){
  await page.goto('http://127.0.0.1:5173'+route);await page.evaluate(()=>document.fonts.ready);
  for(const width of [1440,390]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:`${dir}/${route==='/'?'home':route.slice(1)}-${width}.png`,fullPage:route==='/'});}
 }
 writeFileSync(`${dir}/contrast.json`,JSON.stringify(result,null,2));console.log('PASS: six contrast pairs, eight page screenshot pairs, responsive overflow.');console.log(JSON.stringify(result));
}finally{await browser.close();}
