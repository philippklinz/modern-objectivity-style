'use strict';
const assert=require('node:assert/strict');
async function checkColourLab({page,base,ready,language}){
 await page.goto(base+'/examples/colour.html?lang='+language);await ready(language);
 for(const palette of ['signal','cobalt','violet','copper','carmine','olive']){
  await page.locator(`[data-palette="${palette}"]`).click();
  for(const mode of ['light','dark']){
   await page.locator('#colour-mode').selectOption(mode);
   assert.equal(await page.locator('#colour-matrix [data-pass="false"]').count(),0,palette+'/'+mode);
   const accent=await page.locator('#colour-hex').inputValue();
   assert.ok((await page.locator('#colour-css').inputValue()).includes(accent));
  }
 }
 await page.locator('#colour-mode').selectOption('light');await page.locator('#colour-hex').fill('#FFFF00');
 assert.ok(await page.locator('#colour-matrix [data-pass="false"]').count()>0,'Weak accent is reported');
 await page.locator('#colour-adjust').click();assert.equal(await page.locator('#colour-matrix [data-pass="false"]').count(),0);
 const light=await page.locator('#colour-hex').inputValue();
 await page.locator('#colour-mode').selectOption('dark');await page.locator('#colour-hex').fill('#C5A5F5');
 await page.locator('#colour-mode').selectOption('light');assert.equal(await page.locator('#colour-hex').inputValue(),light);
 await page.locator('#colour-run').click();const sample=await page.locator('#colour-sample-number').textContent();
 await page.locator('#mo-language').selectOption(language==='de'?'en':'de');await ready(language==='de'?'en':'de');
 assert.equal(await page.locator('#colour-hex').inputValue(),light);assert.equal(await page.locator('#colour-sample-number').textContent(),sample);
 const url=page.url();await page.reload();await ready(language==='de'?'en':'de');assert.equal(await page.locator('#colour-hex').inputValue(),light);assert.equal(page.url(),url);
 await page.locator('#colour-hex').fill('#BAD');assert.equal(await page.locator('#colour-hex').getAttribute('aria-invalid'),'true');
 await page.locator('#colour-reset').click();assert.equal(await page.locator('#colour-hex').getAttribute('aria-invalid'),null);
 await page.locator('#colour-foreground').fill('#000000');await page.locator('#colour-background').fill('#ffffff');
 assert.ok((await page.locator('.colour-checker-ratio').textContent()).startsWith('21'));
 const downloadPromise=page.waitForEvent('download');await page.locator('#colour-download').click();const download=await downloadPromise;
 const fs=require('node:fs/promises');assert.equal(await fs.readFile(await download.path(),'utf8'),await page.locator('#colour-css').inputValue());
}
module.exports={checkColourLab};
