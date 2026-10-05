// Фото блюд с подписями из Яндекс.Еды.
import { chromium } from 'playwright-core'; import fs from 'node:fs'; import path from 'node:path';
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const ctx=await chromium.launchPersistentContext(path.resolve('..','leadgen','.browser-profile'),{channel:'chrome',headless:false,viewport:{width:1400,height:950},locale:'ru-RU'});
const page=ctx.pages()[0]||await ctx.newPage();
const items=new Map();
await page.goto('https://eda.yandex.ru/kazan/r/foshnaya',{waitUntil:'domcontentloaded',timeout:90000}); await sleep(8000);
for(let i=0;i<14;i++){
  const r=await page.evaluate(()=>{const o=[];for(const im of document.querySelectorAll('img')){const s=im.currentSrc||im.src;if(!/avatars|eda\.yandex|yastatic/.test(s))continue;const c=im.closest('li,article,[class*="Card"],[class*="card"],[class*="item"]');o.push([s,(c?c.innerText:im.alt||'').slice(0,200)]);}
   for(const e of document.querySelectorAll('[style*="background-image"]')){const m=e.style.backgroundImage.match(/url\("?([^")]+)"?\)/);if(m){const c=e.closest('li,article,[class*="Card"],[class*="card"]');o.push([m[1],(c?c.innerText:'').slice(0,200)]);}}
   return o;});
  r.forEach(([s,t])=>items.set(s,t)); await page.mouse.wheel(0,900); await sleep(900);
}
fs.writeFileSync('raw/eda-items.json',JSON.stringify([...items],null,1)); fs.writeFileSync('raw/eda.txt',await page.evaluate(()=>document.body.innerText));
console.log('items',items.size); await ctx.close();
