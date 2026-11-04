import { createRequire } from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const bundled=process.env.BUNDLED_NODE_MODULES;
if(!bundled)throw Error('Set BUNDLED_NODE_MODULES to the bundled Node modules directory.');
const require=createRequire(bundled+'/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
fs.mkdirSync('qa',{recursive:true});
const report=[];
try{
for(const width of [1440,768,390]){
 const context=await browser.newContext({viewport:{width,height:1000},permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const bad=[];page.on('response',r=>{if(r.url().startsWith('http://localhost:4175')&&r.status()>=400)bad.push(r.url())});
 await page.goto('http://localhost:4175',{waitUntil:'networkidle'});
 await page.locator('[data-hero]').evaluate(el=>el.classList.add('is-ready'));
 await page.waitForFunction(()=>document.querySelectorAll('.cell').length>300);
 await page.waitForFunction(()=>Number(getComputedStyle(document.querySelector('.intro')).opacity)<0.01);
 await page.waitForTimeout(800);
 assert.equal(await page.locator('.case').count(),6);
 assert.equal(await page.locator('.portrait img').evaluate(el=>el.naturalWidth>0),true);
 const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
 assert(overflow.scroll<=overflow.width+1,`Overflow at ${width}: ${JSON.stringify(overflow)}`);
 await page.screenshot({path:`qa/desktop-${width}.png`});
 await page.locator('#projects').scrollIntoViewIfNeeded();
 await page.locator('.case').first().waitFor({state:'visible'});
 await page.locator('.project-details summary').first().click();assert(await page.locator('.project-details').first().evaluate(el=>el.open));
 await page.screenshot({path:`qa/projects-${width}.png`});
 await page.locator('.skill').first().click();assert.equal(await page.locator('.skill').first().getAttribute('aria-pressed'),'true');
 await page.locator('[data-motion]').click();assert.equal(await page.locator('[data-motion]').getAttribute('aria-pressed'),'true');
 assert.equal(await page.locator('.system-node i').first().evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
 await page.locator('[data-motion]').click();
 await page.locator('[data-range="90"]').click();assert.equal(await page.locator('[data-range="90"]').getAttribute('aria-pressed'),'true');
 await page.locator('.cell').last().focus();await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('.cell[aria-selected="true"]').count(),1);
 await page.locator('[data-copy]').click();await page.waitForFunction(()=>document.querySelector('[data-copy-status]').textContent.length>0);assert.match(await page.locator('[data-copy-status]').textContent(),/Email address copied/);
 if(width<961){await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(800);await page.locator('[data-menu-toggle]').click();assert.equal(await page.locator('[data-menu-toggle]').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('[data-menu-toggle]').getAttribute('aria-expanded'),'false')}
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);
 report.push({width,projects:6,overflow:false,errors,failedLocalRequests:bad,details:true,skills:true,motionToggle:true,heatmapRange:true});await context.close();
}
const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const page=await context.newPage();await page.goto('http://localhost:4175',{waitUntil:'networkidle'});const animations=await page.locator('.system-node i').first().evaluate(el=>getComputedStyle(el).animationName);assert.equal(animations,'none');report.push({reducedMotion:true});await context.close();
const offline=await browser.newContext();const offlinePage=await offline.newPage();await offlinePage.route('**/data/contributions.json',route=>route.fulfill({status:503,body:'Unavailable'}));await offlinePage.goto('http://localhost:4175',{waitUntil:'networkidle'});assert.match(await offlinePage.locator('[data-heatmap-source]').innerText(),/temporarily unavailable/);assert.equal(await offlinePage.locator('.cell').count(),0);await offline.close();report.push({missingSnapshotHandled:true});
fs.writeFileSync('qa/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close()}
