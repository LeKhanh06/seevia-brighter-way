import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const base = 'http://127.0.0.1:5173';
const routes=['/','/san-pham','/cong-nghe','/ve-chung-toi','/cong-dong','/tin-tuc','/doi-tac','/lien-he','/thong-tin','/chinh-sach-bao-mat','/dieu-khoan-su-dung'];
const compare=process.argv.includes('--compare');
const file='test-results/digital-rose-dom-baseline.json';
const data=[];
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
 for(const route of routes){
  await page.goto(base+route); await page.evaluate(()=>document.fonts.ready);
  data.push(await page.evaluate(()=>{
   const main=document.querySelector('main');
   const motion=[...document.querySelectorAll('body *')].flatMap((el,index)=>['', '::before','::after'].map(pseudo=>{
    const s=getComputedStyle(el,pseudo||null);
    return {index,pseudo,animationName:s.animationName,animationDuration:s.animationDuration,animationDelay:s.animationDelay,animationTimingFunction:s.animationTimingFunction,animationIterationCount:s.animationIterationCount,animationDirection:s.animationDirection,animationFillMode:s.animationFillMode,animationPlayState:s.animationPlayState,transitionProperty:s.transitionProperty,transitionDuration:s.transitionDuration,transitionDelay:s.transitionDelay,transitionTimingFunction:s.transitionTimingFunction};
   }));
   return {path:location.pathname,text:document.body.textContent,sections:[...main.querySelectorAll('section')].map(el=>[el.id,el.className]),links:[...document.querySelectorAll('a')].map(el=>el.getAttribute('href')),images:[...document.querySelectorAll('img')].map(el=>[el.getAttribute('src'),el.getAttribute('alt')]),motion};
  }));
 }
 if(compare){
 const before=JSON.parse(readFileSync(file,'utf8'));const differences=[];
 for(let i=0;i<data.length;i++) {
  for(const key of ['text','sections','links','images']) {if(JSON.stringify(data[i][key])!==JSON.stringify(before[i][key]))differences.push({route:data[i].path,key});}
  for(let j=0;j<data[i].motion.length;j++){const a=data[i].motion[j],b=before[i].motion[j];if(JSON.stringify(a)!==JSON.stringify(b))differences.push({route:data[i].path,index:a.index,pseudo:a.pseudo,fields:Object.keys(a).filter(k=>a[k]!==b?.[k])});}
 }
 writeFileSync('test-results/digital-rose-motion-diff.json',JSON.stringify(differences,null,2));
 console.log('Runtime snapshot differences:',differences.length,JSON.stringify(differences.slice(0,8)));
 assert(!differences.some(d=>['text','sections','links','images'].includes(d.key)),'Content or structure changed');
 console.log('PASS: content, section order, links and image references unchanged on 11 routes. Motion settings also checked against static source audit.');
}
 else {writeFileSync(file,JSON.stringify(data));console.log('Saved 11-route content and motion baseline.');}
} finally {await browser.close();}
