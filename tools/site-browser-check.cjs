/* Read-only browser regression suite for all published guide pages. GPL-2.0-only. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const http=require('node:http');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const {pages,languages,root}=require('./check-site-i18n.cjs');
const sourceOnly=process.argv.includes('--source-only');
async function main(){
 const server=http.createServer(async(req,res)=>{
  try{
   let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   if(pathname.endsWith('/'))pathname+='index.html';
   const file=path.resolve(root,'.'+pathname);
   if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
   const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
   res.writeHead(200,{'Content-Type':`${types[path.extname(file)]||'text/plain'}; charset=utf-8`}).end(await fs.readFile(file));
  }catch(_){res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.MO_BROWSER_EXECUTABLE?{executablePath:process.env.MO_BROWSER_EXECUTABLE}:{})});
  const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage();
  const errors=[],badRequests=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.status()>=400&&!response.url().endsWith('favicon.ico'))badRequests.push(response.url()+':'+response.status());});
  const ready=async(code='en')=>page.waitForFunction(code=>document.documentElement.lang===code&&(
   document.querySelector('#mo-language-bar')?.getAttribute('aria-busy')==='false'||document.querySelector('#localized-demo')?.getAttribute('aria-busy')==='false'),code);
  const change=async code=>{await page.locator('#mo-language,#language').selectOption(code);await ready(code);};
  const selected=sourceOnly?languages.filter(item=>item.code==='en'):languages;
  let combinations=0; const layoutIssues=[];
  for(const [module,info] of Object.entries(pages)){
   await page.setViewportSize({width:1280,height:900});
   await page.goto(base+'/'+info.page+'?keep=1');await ready();
   for(const {code} of selected){
    await change(code);
    for(const width of [390,1280]){
     await page.setViewportSize({width,height:900});
     await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
     if(!await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)){
      const overflow=await page.evaluate(()=>[...document.body.querySelectorAll('*')].filter(node=>{const r=node.getBoundingClientRect();return r.width&&r.right>innerWidth+1;}).slice(0,12).map(node=>({tag:node.tagName,id:node.id,class:node.className,left:Math.round(node.getBoundingClientRect().left),width:Math.round(node.getBoundingClientRect().width),text:node.textContent.slice(0,60)})));
      const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:innerWidth,body:document.body.scrollWidth}));
      layoutIssues.push(`${module}/${code}: overflow at ${width}: ${JSON.stringify(dimensions)} ${JSON.stringify(overflow)}`);
      if(process.env.MO_I18N_SCREENSHOT_DIR){await fs.mkdir(process.env.MO_I18N_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.MO_I18N_SCREENSHOT_DIR,`overflow-${module}-${code}-${width}.png`),fullPage:true});}
     }
     assert.equal(await page.locator('html').getAttribute('lang'),code);
     assert.equal(new URL(page.url()).searchParams.get('keep'),'1');
     const rawSlots=await page.locator('body').innerText();
     assert.ok(!/<\/?s\d+>/.test(rawSlots),`${module}/${code}: exposed formatting slot`);
     combinations++;
    }
   }
  }
  assert.deepEqual(layoutIssues,[],'Page layout issues');
  assert.deepEqual(errors,[],'Uncaught page errors');assert.deepEqual(badRequests,[],'Missing local assets');
  const target=sourceOnly?'en':'de';
  await page.goto(base+'/examples/lab-console.html');await ready();
  await page.locator('#target').selectOption('10');
  await page.locator('#generate').click();
  await page.locator('#filter').fill('S-004');
  await page.locator('#record-body button').click();
  const selectedValue=await page.locator('#inspect dd').nth(0).textContent();
  const logCount=await page.locator('#log li').count();
  const logTimes=await page.locator('#log time').evaluateAll(nodes=>nodes.map(node=>node.dateTime));
  await change(target);
  assert.equal(await page.locator('#filter').inputValue(),'S-004');
  assert.equal(await page.locator('#record-body tr').count(),1);
  assert.equal(await page.locator('#inspect dd').nth(0).textContent(),selectedValue);
  assert.equal(await page.locator('#count').textContent(),'22');
  assert.equal(await page.locator('#log li').count(),logCount);
  assert.deepEqual(await page.locator('#log time').evaluateAll(nodes=>nodes.map(node=>node.dateTime)),logTimes);
  const download=page.waitForEvent('download');await page.locator('#download').click();
  const csv=await fs.readFile(await (await download).path(),'utf8');
  assert.ok(csv.startsWith('sample_id,temperature_c,source\n'));
  assert.equal(csv.trim().split('\n').length,23);
  await page.goto(base+'/examples/experiment.html');await ready();
  await page.locator('#single-step').click();await page.locator('#amplitude').press('ArrowRight');
  const wave=await page.locator('#wave').getAttribute('d'),amplitude=await page.locator('#amplitude').inputValue();
  await change(target);
  assert.equal(await page.locator('#wave').getAttribute('d'),wave);
  assert.equal(await page.locator('#amplitude').inputValue(),amplitude);
  assert.equal(await page.locator('#toggle-play').getAttribute('aria-pressed'),'false');
  await page.goto(base+'/starter/index.html');await ready();
  await page.locator('#name').fill('My retained experiment <42>');await page.locator('#save-settings').click();
  await page.locator('#record').click();
  await page.locator('#record').click();
  await page.locator('#search').fill('OBS-002');
  const rows=await page.locator('#table tbody tr').count();
  await change(target);
  assert.ok((await page.locator('.mo-content h1').textContent()).includes('My retained experiment <42>'));
  assert.equal(await page.locator('#name').inputValue(),'My retained experiment <42>');
  assert.equal(await page.locator('#table tbody tr').count(),rows);
  assert.equal(await page.locator('#stat-count').textContent(),'2');
  assert.equal(await page.locator('#search').inputValue(),'OBS-002');
  await page.goto(base+'/docs/03-principles.html?lang='+target);await ready(target);
  const handbookLink=await page.locator('a').filter({hasText:/Modern Objectivity/}).first().getAttribute('href');
  assert.ok(handbookLink.includes('lang='+target),'Documentation navigation preserves locale');
  if(!sourceOnly){
   await change('pl');await page.goBack();await ready(target);await page.goForward();await ready('pl');
   await page.route('**/i18n/pages/index/fr.js',route=>route.abort());
   await page.goto(base+'/index.html?lang=fr');await ready('en');
   assert.equal(await page.locator('.mo-language-status').getAttribute('data-fallback'),'true');
   await page.unroute('**/i18n/pages/index/fr.js');
   await change('fr');
  }
  await page.goto(pathToFileURL(path.join(root,'starter/index.html')).href+'?lang='+target);await ready(target);
  assert.equal(await page.locator('#mo-language').inputValue(),target);
  await page.goto(pathToFileURL(path.join(root,'patterns/i18n/index.html')).href+'?lang='+target);await ready(target);
  assert.equal(await page.locator('html').getAttribute('lang'),target);
  if(process.env.MO_I18N_SCREENSHOT_DIR){
   await fs.mkdir(process.env.MO_I18N_SCREENSHOT_DIR,{recursive:true});
   for(const [file,width,code] of [['index.html',1280,target],['docs/10-multilingual-access.html',390,sourceOnly?'en':'el'],['examples/lab-console.html',1280,target]]){
    await page.setViewportSize({width,height:900});await page.goto(base+'/'+file+'?lang='+code);await ready(code);
    await page.screenshot({path:path.join(process.env.MO_I18N_SCREENSHOT_DIR,file.replaceAll('/','-')+'-'+width+'.png'),fullPage:true});
   }
  }
  assert.deepEqual(errors,[]);
  console.log(`${combinations} page/language/viewport combinations checked; console data, filters, inspection, logs, CSV, wave state, user names, language links, history, fallback and file:// verified.`);
  await context.close();
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
