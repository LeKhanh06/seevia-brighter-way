import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const base='http://127.0.0.1:5173';
const routes=['/','/san-pham','/cong-nghe','/ve-chung-toi','/cong-dong','/tin-tuc','/doi-tac','/lien-he','/thong-tin','/chinh-sach-bao-mat','/dieu-khoan-su-dung'];
const out='test-results/digital-rose-review';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[];const report=[];
try{
 const page=await browser.newPage({reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
 for(const route of routes){
  await page.goto(base+route);await page.evaluate(()=>document.fonts.ready);
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route+' '+width);
   await page.screenshot({path:`${out}/${route==='/'?'home':route.slice(1)}-${width}.png`,fullPage:route==='/'});
  }
 }
 await page.goto(base);
 await page.setViewportSize({width:1440,height:1000});
 function lum(rgb){const v=rgb.slice(0,3).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722;}
 for(const selector of ['.hero .button','.experience-copy p','.about .belief h2','.about .belief > div p','.ai-copy .button','.partnership .button-light','.simulation-toolbar button']){
  const values=await page.locator(selector).first().evaluate(el=>{
   const fg=getComputedStyle(el).color;let bg='';let source=el;
   while(source){const s=getComputedStyle(source);if(s.backgroundColor!=='rgba(0, 0, 0, 0)'){bg=s.backgroundColor;break;}source=source.parentElement;}
   return {fg,bg};
  });
  const fg=values.fg.match(/[\d.]+/g).map(Number);let bg=values.bg.match(/[\d.]+/g).map(Number);
  // Gradients are reviewed against their darkest named surface below.
  if(selector.startsWith('.experience'))bg=[22,184,243];
  if(selector.startsWith('.about'))bg=[245,54,134];
  if(selector.startsWith('.simulation'))bg=[18,43,73];
  const a=lum(fg),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  const minimum=selector.endsWith('h2')?3:4.5;
  report.push({selector,...values,ratio:Number(ratio.toFixed(2)),minimum});
  assert(ratio>=minimum,selector+': '+ratio);
 }
 assert.deepEqual(errors,[]);
 writeFileSync(`${out}/contrast.json`,JSON.stringify(report,null,2));console.log('PASS: 11 routes at 1440/390, runtime clean, seven selected rendered contrast pairings.');console.log(JSON.stringify(report));
}finally{await browser.close();}
