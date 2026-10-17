import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});const dir='test-results/optical-review';mkdirSync(dir,{recursive:true});
const routes=['/','/san-pham','/cong-nghe','/ve-chung-toi','/cong-dong','/tin-tuc','/doi-tac','/lien-he','/thong-tin','/chinh-sach-bao-mat','/dieu-khoan-su-dung'];
try{const page=await browser.newPage({reducedMotion:'reduce'});
 for(const route of routes){await page.goto('http://127.0.0.1:5173'+route);await page.evaluate(()=>document.fonts.ready);for(const width of [1440,390]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route+': '+width);await page.screenshot({path:`${dir}/${route==='/'?'home':route.slice(1)}-${width}.png`,fullPage:true});}}
 const states=[];await page.setViewportSize({width:1440,height:1000});
 for(const route of ['/','/san-pham','/doi-tac','/lien-he']){await page.goto('http://127.0.0.1:5173'+route);const buttons=page.locator('main :is(.button,.pt-action,.ct-action)');for(let i=0;i<Math.min(await buttons.count(),8);i++){const button=buttons.nth(i);await button.scrollIntoViewIfNeeded();await page.mouse.move(0,0);const normal=await button.evaluate(el=>({text:el.textContent,fg:getComputedStyle(el).color,bg:getComputedStyle(el).backgroundColor}));await button.hover();const hover=await button.evaluate(el=>({fg:getComputedStyle(el).color,bg:getComputedStyle(el).backgroundColor}));states.push({route,normal,hover});}}
 function luminance(rgb){const v=rgb.slice(0,3).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722;}
 const contrast=[];
 for(const record of states)for(const state of ['normal','hover']){
  const value=record[state];const fg=value.fg.match(/[\d.]+/g).map(Number),bg=value.bg.match(/[\d.]+/g).map(Number);
  if(bg.length===4 && bg[3]<1)continue;
  const a=luminance(fg),b=luminance(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  contrast.push({route:record.route,text:record.normal.text,state,ratio:ratio.toFixed(2)});
  assert(ratio>=4.5,record.route+' '+state+' '+record.normal.text+': '+ratio.toFixed(2));
 }
 for(const [fg,bg] of [['252b42','fafcff'],['536078','fafcff'],['3153c4','fafcff'],['252b42','c9d2e1'],['252b42','8ed8ff']]){
  const rgb=h=>h.match(/../g).map(x=>parseInt(x,16));const a=luminance(rgb(fg)),b=luminance(rgb(bg)),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(ratio>=4.5);contrast.push({fg,bg,ratio:ratio.toFixed(2)});
 }
 writeFileSync(`${dir}/button-states.json`,JSON.stringify(states,null,2));writeFileSync(`${dir}/contrast.json`,JSON.stringify(contrast,null,2));console.log('PASS: 11 routes at two widths, screenshots, '+contrast.length+' opaque button/palette contrast checks (normal and hover).');
}finally{await browser.close();}
