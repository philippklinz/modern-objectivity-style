/* Development-only browser checks. GPL-2.0-only. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright');
const {loadCatalogues} = require('./check.cjs');
const {languages, catalogues} = loadCatalogues();

async function main() {
  const root = __dirname;
  const mime = {'.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html'};
  const server = http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
      const content = await fs.readFile(file);
      response.writeHead(200, {'Content-Type': `${mime[path.extname(file)] || 'text/plain'}; charset=utf-8`}).end(content);
    } catch (_) { response.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({headless: true, ...(process.env.MO_BROWSER_EXECUTABLE ? {executablePath: process.env.MO_BROWSER_EXECUTABLE} : {})});
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [], external = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (!request.url().startsWith(base)) external.push(request.url()); });
    const ready = async (target = page, code = 'en') => target.waitForFunction(code => {
      const scope = document.querySelector('#localized-demo');
      return scope?.lang === code && scope.getAttribute('aria-busy') === 'false';
    }, code);
    const change = async code => { await page.selectOption('#language', code); await ready(page, code); };
    const range = async (id, value, target = page) => target.locator('#' + id).evaluate((input, value) => {
      input.value = value; input.dispatchEvent(new Event('input', {bubbles: true}));
    }, String(value));
    await page.goto(base + '/index.html?keep=1#localized-demo'); await ready();
    await range('count', 13); await range('interval', 0.75);
    let checks = 0;
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({width, height: 900});
      for (const {code} of languages) {
        await change(code);
        assert.equal(await page.locator('#count').inputValue(), '13');
        assert.equal(await page.locator('#interval').inputValue(), '0.75');
        assert.equal(await page.locator('#duration').getAttribute('data-value'), '9.75');
        assert.equal(await page.locator('#demo-title').textContent(), catalogues[code].messages.title);
        assert.equal(await page.locator('html').getAttribute('lang'), 'en', 'The guide remains English');
        assert.equal(await page.locator('#diagram-bars rect').count(), 13);
        assert.ok((await page.locator('#diagram-title').textContent()).includes('13'));
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${code} overflow at ${width}px`);
        const url = new URL(page.url());
        assert.equal(url.searchParams.get('lang'), code);
        assert.equal(url.searchParams.get('keep'), '1');
        assert.equal(url.hash, '#localized-demo');
        checks++;
      }
    }
    await change('pl');
    for (const [count, text] of [[1,'1 próbka'],[2,'2 próbki'],[5,'5 próbek'],[22,'22 próbki']]) {
      await range('count', count); assert.equal(await page.locator('#summary').textContent(), text);
    }
    await range('count', 0); assert.equal(await page.locator('#duration').getAttribute('data-value'), '0');
    assert.equal(await page.locator('#diagram-bars rect').count(), 0);
    await page.locator('#count').focus(); await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#count').inputValue(), '1');
    await change('de'); await change('el');
    await page.goBack(); await ready(page, 'de');
    await page.goForward(); await ready(page, 'el');
    assert.equal(await page.locator('#count').inputValue(), '1');
    await page.locator('#reset').click();
    assert.equal(await page.locator('#duration').getAttribute('data-value'), '1.5');
    assert.equal(await page.locator('#localized-demo').getAttribute('lang'), 'el');
    assert.equal(await page.evaluate(() => localStorage.length), 0);
    assert.equal((await context.cookies()).length, 0);
    assert.deepEqual(external, []);
    assert.deepEqual(errors, []);

    const sourceFailure = await context.newPage();
    await sourceFailure.route('**/locales/en.js', route => route.abort());
    await sourceFailure.goto(base); await ready(sourceFailure);
    assert.equal(await sourceFailure.locator('#count').isDisabled(), true);
    assert.ok((await sourceFailure.locator('#language-status').textContent()).includes('could not start'));
    await sourceFailure.close();

    const failure = await context.newPage();
    await failure.route('**/locales/de.js', route => route.abort());
    await failure.goto(base + '/index.html?lang=de'); await ready(failure);
    assert.equal(await failure.locator('#language-status').getAttribute('data-fallback'), 'true');
    await range('count', 17, failure);
    await failure.unroute('**/locales/de.js');
    await failure.selectOption('#language', 'de'); await ready(failure, 'de');
    assert.equal(await failure.locator('#count').inputValue(), '17', 'Retry preserves state');
    await failure.close();

    const invalid = await context.newPage();
    await invalid.route('**/locales/de.js', route => route.fulfill({contentType: 'text/javascript', body: 'MOCatalogues.de = {status:"available",sourceRevision:"outdated",messages:{}};'}));
    await invalid.goto(base + '/index.html?lang=de'); await ready(invalid);
    assert.equal(await invalid.locator('#language-status').getAttribute('data-fallback'), 'true');
    await invalid.goto(base + '/index.html?lang=../../unknown'); await ready(invalid);
    assert.equal(await invalid.locator('#localized-demo').getAttribute('lang'), 'en');
    assert.equal(await invalid.locator('#language-status').getAttribute('data-fallback'), 'true');
    await invalid.close();

    const rapid = await context.newPage();
    await rapid.route('**/locales/de.js', async route => { await new Promise(resolve => setTimeout(resolve, 250)); await route.continue(); });
    await rapid.goto(base); await ready(rapid);
    await rapid.selectOption('#language', 'de'); await rapid.selectOption('#language', 'pl'); await ready(rapid, 'pl');
    await rapid.waitForTimeout(400);
    assert.equal(await rapid.locator('#localized-demo').getAttribute('lang'), 'pl', 'Late load must not override latest choice');
    await rapid.close();

    const offline = await context.newPage();
    await offline.goto(pathToFileURL(path.join(root, 'index.html')).href + '?lang=bg'); await ready(offline, 'bg');
    await range('count', 19, offline); await offline.selectOption('#language', 'ga'); await ready(offline, 'ga');
    assert.equal(await offline.locator('#count').inputValue(), '19');
    assert.ok((await offline.locator('#share-link').getAttribute('href')).includes('lang=ga'));
    await offline.close();

    const noScriptContext = await browser.newContext({javaScriptEnabled: false});
    const noScript = await noScriptContext.newPage();
    await noScript.goto(base);
    assert.equal(await noScript.locator('#demo-title').textContent(), 'Sampling plan');
    assert.equal(await noScript.locator('#count').isDisabled(), true);
    assert.equal(await noScript.locator('noscript').isVisible(), true);
    await noScriptContext.close();

    if (process.env.MO_I18N_SCREENSHOT_DIR) {
      await fs.mkdir(process.env.MO_I18N_SCREENSHOT_DIR, {recursive: true});
      for (const [code,width] of [['de',1280],['el',390]]) {
        await page.setViewportSize({width,height:900}); await change(code);
        await page.screenshot({path:path.join(process.env.MO_I18N_SCREENSHOT_DIR,`${code}-${width}.png`),fullPage:true});
      }
    }
    console.log(`${checks} locale/viewport checks passed; state, plurals, keyboard, history, failed/invalid packs, retry, races, no-JS and file:// checked.`);
    await context.close();
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
