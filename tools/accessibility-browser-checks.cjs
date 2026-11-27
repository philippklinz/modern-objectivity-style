/* Interaction checks for the accessibility examples. GPL-2.0-only. */
'use strict';
const assert=require('node:assert/strict');
async function checkAccessibilityLab({page,base,ready}){
 await page.goto(base+'/examples/accessibility.html?lang=en');await ready('en');
 await page.locator('#a11y-open').focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('#a11y-dialog').evaluate(d=>d.open),true);
 assert.equal(await page.evaluate(()=>document.activeElement.id),'a11y-keep');
 await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'a11y-close');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'a11y-keep');
 await page.keyboard.press('Escape');assert.equal(await page.locator('#a11y-dialog').evaluate(d=>d.open),false);
 assert.equal(await page.evaluate(()=>document.activeElement.id),'a11y-open');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'a11y-name');
 await page.keyboard.press('Tab');await page.keyboard.press('Enter');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'a11y-name');
 assert.equal(await page.locator('#a11y-name').getAttribute('aria-invalid'),'true');
 assert.equal(await page.locator('#a11y-error').isVisible(),true);
 assert.ok((await page.locator('#a11y-name').getAttribute('aria-describedby')).split(' ').includes('a11y-error'));
 await page.locator('#a11y-name').fill('A');await page.locator('#mo-language').selectOption('de');await ready('de');
 assert.equal(await page.locator('#a11y-name').inputValue(),'A');assert.match(await page.locator('#a11y-error').innerText(),/zwei/);
 await page.locator('#a11y-name').fill('Sample <42>');await page.locator('#a11y-submit').click();
 assert.equal(await page.locator('#a11y-name').getAttribute('aria-invalid'),'false');assert.ok(await page.locator('#a11y-status').innerText());
 await page.locator('[data-a11y-check]').first().check();await page.locator('#a11y-keep').evaluate(n=>n.checked=true);
 await page.locator('#mo-language').selectOption('en');await ready('en');
 assert.equal(await page.locator('#a11y-name').inputValue(),'Sample <42>');assert.equal(await page.locator('[data-a11y-check]').first().isChecked(),true);
 assert.match(await page.locator('#a11y-progress').innerText(),/^1 of 8/);
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#a11y-reduce').uncheck();await page.locator('#a11y-move').click();
 assert.equal(await page.locator('.a11y-track').getAttribute('data-reduce'),'true');
 assert.equal(await page.locator('.a11y-track span').evaluate(n=>getComputedStyle(n).transitionDuration),'0s');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('#a11y-reduce').check();
 assert.equal(await page.locator('.a11y-track').getAttribute('data-reduce'),'true');await page.locator('#a11y-reduce').uncheck();
 assert.equal(await page.locator('.a11y-track').getAttribute('data-reduce'),'false');
 await page.locator('#a11y-reset').click();assert.match(await page.locator('#a11y-progress').innerText(),/^0 of 8/);
 await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});await page.locator('#a11y-open').focus();
 await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
 assert.notEqual(await page.locator('#a11y-open').evaluate(n=>getComputedStyle(n).outlineStyle),'none');
 await page.emulateMedia({forcedColors:'none'});
}
module.exports={checkAccessibilityLab};
