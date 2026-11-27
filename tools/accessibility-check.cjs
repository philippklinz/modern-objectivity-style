/* Author-side accessibility regression checks, not a WCAG certification. GPL-2.0-only. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const {pages,languages,root}=require('./check-site-i18n.cjs');
const {checkAccessibilityLab}=require('./accessibility-browser-checks.cjs');
const {contrast}=require('../styles/colour-model.js');
(async()=>{
 const server=http.createServer(async(req,res)=>{try{let p=new URL(req.url,'http://local').pathname;if(p.endsWith('/'))p+='index.html';const f=path.resolve(root,'.'+decodeURIComponent(p));if(!f.startsWith(root+path.sep))throw Error();const data=await fs.readFile(f),mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2'}[path.extname(f)]||'text/plain';res.writeHead(200,{'Content-Type':mime}).end(data);}catch{res.writeHead(404).end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 const report={standard:'WCAG 2.2 A/AA automated rules and axe best practices',engine:require('axe-core/package.json').version,states:[],layout:[],limitations:['Automated rules do not establish conformance.','No actual screen-reader speech or testing with disabled participants.','Zoom is checked through equivalent 320 CSS pixel reflow and independent text enlargement; native browser zoom remains a manual check.']};
 try{
  browser=await chromium.launch({headless:true,...(process.env.MO_BROWSER_EXECUTABLE?{executablePath:process.env.MO_BROWSER_EXECUTABLE}:{})});report.browser=browser.version();
  const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'}),page=await context.newPage();
  const base='http://127.0.0.1:'+server.address().port,axe=await fs.readFile(require.resolve('axe-core/axe.min.js'),'utf8');
  const ready=code=>page.waitForFunction(code=>document.documentElement.lang===code&&(document.querySelector('#mo-language-bar')?.getAttribute('aria-busy')==='false'||document.querySelector('#localized-demo')?.getAttribute('aria-busy')==='false'),code);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const scan=async meta=>{
  await page.addScriptTag({content:axe});
  const result=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice']}});return {violations:r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),review:r.incomplete.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))};});
  report.states.push({...meta,...result});
  };
  for(const {page:file} of Object.values(pages)){
   const codes=file==='examples/accessibility.html'?languages.map(l=>l.code):['en','de'];
   for(const language of codes){
    await page.goto(base+'/'+file+'?lang='+language);await ready(language);await page.evaluate(()=>document.fonts.ready);
    for(const theme of ['light','dark']){
     await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
     await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
     await scan({file,language,theme});
    }
   }
   await page.setViewportSize({width:320,height:900});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const fits=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);report.layout.push({file,width:320,fits});
   await page.setViewportSize({width:1280,height:900});
   // Independent text enlargement and WCAG text-spacing overrides.
   const style=await page.addStyleTag({content:'html{font-size:200%!important}body{font-size:30px!important;line-height:1.5!important}*{letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}'});
   report.layout.push({file,textSize:'200%',textSpacing:true,fits:await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)});
   await style.evaluate(n=>n.remove());
  }
  await checkAccessibilityLab({page,base,ready});
  for(const theme of ['light','dark']){
   await page.goto(base+'/examples/accessibility.html?lang=de');await ready('de');
   await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   await page.locator('#a11y-submit').click();await scan({file:'examples/accessibility.html',language:'de',theme,state:'invalid form'});
   await page.locator('#a11y-name').fill('Sample');await page.locator('#a11y-submit').click();await scan({file:'examples/accessibility.html',language:'de',theme,state:'success status'});
   await page.locator('#a11y-open').click();await scan({file:'examples/accessibility.html',language:'de',theme,state:'open dialog'});await page.keyboard.press('Escape');
  }
  // Essential boundaries and focus colours need manual-rule coverage beyond axe.
  for(const [foreground,background] of [['#006f87','#e3eded'],['#81d8ff','#0b1d23'],['#667e85','#edf3f3'],['#76969d','#162f35']])assert.ok(contrast(foreground,background)>=3,foreground+' / '+background);
  report.interactions='Passed: keyboard dialog entry/trap/return, error focus and relationships, live status, language retention, motion preference precedence, checklist and forced-colour focus.';
  const violations=report.states.filter(s=>s.violations.length),layout=report.layout.filter(s=>!s.fits);
  assert.deepEqual(errors,[],'Uncaught page errors');assert.deepEqual(violations,[],'Automated accessibility findings');assert.deepEqual(layout,[],'Reflow or enlarged-text overflow');
  console.log(`${report.states.length} page/language/theme states: no axe violations; ${report.layout.length} reflow/text-spacing checks and keyboard journeys passed. Manual review remains necessary.`);
  await context.close();
 }finally{if(process.env.MO_A11Y_REPORT){await fs.mkdir(path.dirname(process.env.MO_A11Y_REPORT),{recursive:true});await fs.writeFile(process.env.MO_A11Y_REPORT,JSON.stringify(report,null,2)+'\n');}if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
