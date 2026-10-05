import { chromium } from 'playwright-core'; import fs from 'node:fs'; import path from 'node:path';
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const ctx=await chromium.launchPersistentContext(path.resolve('..','leadgen','.browser-profile'),{channel:'chrome',headless:false,viewport:{width:1280,height:900},locale:'ru-RU'});
const page=ctx.pages()[0]||await ctx.newPage();
const imgs=new Set(); let texts=new Set();
await page.goto('https://m.vk.com/phoshnaya',{waitUntil:'domcontentloaded',timeout:60000}); await sleep(6000);
for(let i=0;i<40;i++){
 const r=await page.evaluate(()=>{const o=[];for(const i of document.querySelectorAll('img'))o.push(i.currentSrc||i.src);for(const e of document.querySelectorAll('[style*="background-image"]')){const m=e.style.backgroundImage.match(/url\("?([^")]+)"?\)/);if(m)o.push(m[1])}
  for(const b of document.querySelectorAll('button,span,a')){if(/^(Показать ещё|Показать полностью|ещё)$/i.test((b.innerText||'').trim())){try{b.click()}catch{}}}
  return {o,t:[...document.querySelectorAll('[class*="wall_post_text"],[class*="PostText"],[data-testid*="post"]')].map(e=>e.innerText)}});
 r.o.filter(s=>/userapi\.com/.test(s)).forEach(s=>imgs.add(s)); r.t.forEach(t=>texts.add(t));
 await page.mouse.wheel(0,1400); await sleep(900);
 if(i%10===9)console.log('…',imgs.size,texts.size);
}
fs.writeFileSync('raw/vk-imgs.json',JSON.stringify([...imgs],null,1)); fs.writeFileSync('raw/vk-text.txt',[...texts].join('\n\n=====\n\n')+'\n\n#### BODY\n'+await page.evaluate(()=>document.body.innerText));
console.log('imgs',imgs.size,'texts',texts.size); await ctx.close();
