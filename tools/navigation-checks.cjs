/* Navigation regression checks shared with the complete browser suite. GPL-2.0-only. */
'use strict';
const assert=require('node:assert/strict');

async function checkPageNavigation(page,file,expectedOrder){
 const current=page.locator('.mo-site-nav a[aria-current="page"]');
 assert.equal(await current.count(),1,file+': one current page in the site menu');
 assert.equal(await current.getAttribute('data-mo-destination'),file);
 assert.equal((await current.innerText()).trim(),(await page.locator('.mo-breadcrumb [aria-current="page"]').innerText()).trim(),file+': location agrees with the menu');
 const order=await page.locator('.mo-site-nav a').evaluateAll(links=>links.map(a=>a.dataset.moDestination));
 if(expectedOrder)assert.deepEqual(order,expectedOrder,file+': same menu and order');
 assert.equal(await page.locator('.mo-site-footer .mo-page-sequence').count(),1,file+': page sequence available');
 const brokenTargets=await page.locator('[data-mo-toc]').evaluateAll(links=>links.filter(a=>!document.getElementById(a.dataset.moToc)).map(a=>a.href));
 assert.deepEqual(brokenTargets,[],file+': every section link has a target');
 assert.equal(await page.locator('.mo-site-nav .mo-external-label').count(),0,file+': internal links have no external badge');
 assert.ok(!/[↗←→]/.test(await page.locator('.mo-site-nav').innerText()),file+': consistent internal link styling');
 return order;
}

async function checkNavigationJourney({browser,page,base,ready,language}){
 await page.setViewportSize({width:1280,height:900});
 await page.goto(base+'/examples/typography.html?lang='+language);await ready(language);
 if(await page.locator('html').getAttribute('data-theme')!=='dark')await page.locator('[data-theme-toggle]').click();
 await page.locator('.mo-back-link').click();await ready(language);
 assert.equal(new URL(page.url()).pathname,'/navigation.html');
 assert.equal(new URL(page.url()).hash,'#foundations');
 await page.locator('.mo-directory a[data-mo-destination="examples/lab-console.html"]').click();await ready(language);
 assert.equal(new URL(page.url()).pathname,'/examples/lab-console.html');
 await page.locator('.mo-page-sequence a[rel="next"]').click();await ready(language);
 assert.equal(new URL(page.url()).pathname,'/examples/experiment.html');
 await page.locator('.mo-page-sequence a[rel="prev"]').click();await ready(language);
 assert.equal(new URL(page.url()).pathname,'/examples/lab-console.html');
 for(const destination of ['patterns/i18n/index.html','starter/index.html','docs/03-principles.html']){
  const target=page.locator(`.mo-site-nav a[data-mo-destination="${destination}"]`);
  await target.evaluate(a=>{a.closest('details').open=true;});
  await target.click();await ready(language);
  assert.equal(new URL(page.url()).pathname,'/'+destination);
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark','Theme survives each page change');
  assert.equal(await page.locator('.mo-site-nav a[aria-current="page"]').getAttribute('data-mo-destination'),destination);
 }
 await page.locator('[data-theme-toggle]').click();
 await page.setViewportSize({width:390,height:844});
 const menu=page.locator('#mo-site-menu'),toggle=page.locator('#mo-site-menu > summary');
 assert.equal(await menu.evaluate(node=>node.open),false,'Mobile starts with a compact menu');
 await toggle.focus();await page.keyboard.press('Enter');
 assert.equal(await menu.evaluate(node=>node.open),true,'Keyboard opens the mobile menu');
 await page.keyboard.press('Escape');
 assert.equal(await menu.evaluate(node=>node.open),false,'Escape closes the menu');
 assert.equal(await toggle.evaluate(node=>document.activeElement===node),true);
 await toggle.click();
 const fonts=page.locator('.mo-site-nav a[data-mo-destination="examples/typography.html"]');
 await fonts.evaluate(a=>{a.closest('details').open=true;});await fonts.click();await ready(language);
 assert.equal(await menu.evaluate(node=>node.open),false,'Page change returns to a compact menu');
 assert.equal(await page.locator('.mo-page-outline').evaluate(node=>node.open),false);
 await page.locator('.mo-page-outline > summary').click();
 const section=page.locator('[data-mo-toc]').nth(1),id=await section.getAttribute('data-mo-toc');
 await section.click();
 assert.equal(new URL(page.url()).hash,'#'+id,'On this page moves to the requested section');
 await page.locator('.mo-skip-link').focus();await page.keyboard.press('Enter');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'main-content','Skip link reaches the content');
 // Keep the no-script journey deterministic while fragment links scroll the page.
 const context=await browser.newContext({javaScriptEnabled:false,reducedMotion:'reduce'}),plain=await context.newPage();
 try{
  await plain.goto(base+'/examples/typography.html');
  await plain.locator('.mo-back-link').click();
  assert.equal(new URL(plain.url()).hash,'#foundations');
  await plain.locator('.mo-directory a[data-mo-destination="examples/lab-console.html"]').click();
  assert.equal(new URL(plain.url()).pathname,'/examples/lab-console.html','Navigation works without JavaScript');
 }finally{await context.close();}
}
module.exports={checkPageNavigation,checkNavigationJourney};
