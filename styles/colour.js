/* Local, URL-restorable colour workbench. GPL-2.0-only. */
(() => {
 'use strict';
 const C=window.MOColour,$=id=>document.getElementById('colour-'+id),t=key=>window.MOSite.t('colour.'+key),params=new URL(location.href).searchParams;
 let palette=Object.hasOwn(C.palettes,params.get('palette'))?params.get('palette'):'signal';
 let mode=params.get('mode')==='dark'?'dark':'light',sample=0;
 let accents={light:C.palettes[palette][0],dark:C.palettes[palette][1]};
 for(const m of ['light','dark'])if(C.valid(params.get('accent-'+m)||''))accents[m]=params.get('accent-'+m).toUpperCase();
 const nf=(n,digits=2)=>window.MOSite.number(n,{minimumFractionDigits:digits,maximumFractionDigits:digits});
 function announce(key){$('status').textContent=t(key);}
 async function copy(text){let ok=false;try{if(navigator.clipboard){await navigator.clipboard.writeText(text);ok=true;}}catch{}if(!ok){const area=document.createElement('textarea');area.value=text;area.style.cssText='position:fixed;left:-9999px';document.body.append(area);const focused=document.activeElement;area.select();try{ok=document.execCommand('copy');}catch{}area.remove();focused?.focus();}announce(ok?'copied':'copyFailed');}
 function remember(){const u=new URL(location.href);u.searchParams.set('palette',palette);u.searchParams.set('mode',mode);for(const m of ['light','dark'])u.searchParams.set('accent-'+m,accents[m]);history.replaceState(null,'',u);}
 function result(ratio,threshold,label){const node=document.createElement('span');node.className='colour-result';node.dataset.pass=String(ratio>=threshold);node.textContent=(ratio>=threshold?'✓ ':'× ')+t(ratio>=threshold?'pass':'fail')+(label?' · '+label:'');return node;}
 function checker(){const a=$('foreground').value,b=$('background').value,r=C.contrast(a,b);$('checker-sample').style.color=a;$('checker-sample').style.background=b;const ratio=document.createElement('strong');ratio.className='colour-checker-ratio';ratio.textContent=nf(r)+' : 1';$('checker-report').replaceChildren(ratio,...[['normal',4.5],['large',3],['ui',3]].map(([key,target])=>result(r,target,t(key))));}
 function render(syncSliders=true){
  const accent=accents[mode],tokens=C.tokens(accent,mode),stage=C.stages[mode];
  $('mode').value=mode;$('picker').value=accent;
  if($('hex').getAttribute('aria-invalid')!=='true')$('hex').value=accent;
  if(syncSliders)C.hsl(accent).forEach((v,i)=>$( ['hue','saturation','lightness'][i]).value=Math.round(v));
  for(const name of ['hue','saturation','lightness'])$(name+'-value').textContent=nf(Number($(name).value),0)+(name==='hue'?'°':'%');
  const custom=accents.light!==C.palettes[palette][0]||accents.dark!==C.palettes[palette][1];
  $('current').textContent=t(palette)+(custom?' · '+t('custom'):'');
  for(const button of document.querySelectorAll('[data-palette]'))button.setAttribute('aria-pressed',String(button.dataset.palette===palette&&!custom));
  const preview=$('preview');preview.dataset.theme=mode;
  for(const [key,value] of Object.entries({...stage,accent,hover:tokens.hover,ink:tokens.ink,'hover-ink':tokens.hoverInk}))preview.style.setProperty('--preview-'+key,value);
  const roles=[['accent',tokens.accent],['hover',tokens.hover],['soft',tokens.soft],['ink',tokens.ink],['focus',tokens.focus]];
  // Reuse buttons so keyboard focus survives input and language changes.
  if(!$('roles').children.length)for(const [key] of roles){const button=document.createElement('button');button.className='colour-role';button.dataset.role=key;button.innerHTML='<span class="colour-role-chip" aria-hidden="true"></span><strong></strong><code></code>';button.addEventListener('click',()=>copy(button.dataset.value));$('roles').append(button);}
  for(const [i,[key,value]] of roles.entries()){const button=$('roles').children[i];button.dataset.value=value;button.style.setProperty('--chip',value);button.querySelector('strong').textContent=t(key);button.querySelector('code').textContent=value;}
  const rows=[['accentSurface',accent,stage.surface,4.5],['accentCanvas',accent,stage.canvas,4.5],['buttonText',tokens.ink,accent,4.5],['hoverText',tokens.hoverInk,tokens.hover,4.5],['focusSurface',accent,stage.surface,3],['focusCanvas',accent,stage.canvas,3]];
  $('matrix').replaceChildren(...rows.map(([key,a,b,target])=>{const row=document.createElement('tr'),label=document.createElement('th'),ratio=document.createElement('td'),outcome=document.createElement('td');label.scope='row';label.textContent=t(key);ratio.textContent=nf(C.contrast(a,b))+' : 1';outcome.append(result(C.contrast(a,b),target));row.append(label,ratio,outcome);return row;}));
  $('css').value=C.css(accents);checker();showSample();
 }
 function setAccent(value,sync=true){accents[mode]=value.toUpperCase();$('hex').removeAttribute('aria-invalid');$('status').textContent='';render(sync);remember();}
 document.querySelectorAll('[data-palette]').forEach(button=>button.addEventListener('click',()=>{palette=button.dataset.palette;accents={light:C.palettes[palette][0],dark:C.palettes[palette][1]};$('hex').removeAttribute('aria-invalid');render();remember();}));
 $('mode').addEventListener('change',()=>{mode=$('mode').value;$('hex').removeAttribute('aria-invalid');render();remember();});
 $('picker').addEventListener('input',()=>setAccent($('picker').value));
 $('hex').addEventListener('input',()=>{const value=$('hex').value.trim();if(C.valid(value))setAccent(value);else{$('hex').setAttribute('aria-invalid','true');announce('invalid');}});
 for(const key of ['hue','saturation','lightness'])$(key).addEventListener('input',()=>setAccent(C.fromHsl(...['hue','saturation','lightness'].map(name=>Number($(name).value))),false));
 $('adjust').addEventListener('click',()=>setAccent(C.adjust(accents[mode],mode)));
 $('reset').addEventListener('click',()=>{accents={light:C.palettes[palette][0],dark:C.palettes[palette][1]};$('hex').removeAttribute('aria-invalid');render();remember();});
 function showSample(){document.querySelectorAll('.colour-demo-chart span').forEach((bar,i)=>bar.dataset.current=String(i===sample));$('sample-number').textContent=String(sample+1).padStart(2,'0')+' / 06';const rows=$('samples').tBodies[0].rows;for(let i=0;i<rows.length;i++){rows[i].style.background=i===sample?C.tokens(accents[mode],mode).soft:'';rows[i].setAttribute('aria-current',String(i===sample));}}
 $('run').addEventListener('click',()=>{sample=(sample+1)%6;showSample();});
 for(const name of ['foreground','background'])$(name).addEventListener('input',checker);
 $('swap').addEventListener('click',()=>{const a=$('foreground').value;$('foreground').value=$('background').value;$('background').value=a;checker();});
 $('use-accent').addEventListener('click',()=>{$('foreground').value=accents[mode];$('background').value=C.stages[mode].surface;checker();});
 $('copy').addEventListener('click',()=>copy($('css').value));
 $('share').addEventListener('click',()=>{remember();copy(location.href);});
 $('download').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([$('css').value],{type:'text/css;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='modern-objectivity-'+palette+'.css';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 window.addEventListener('mo:language',()=>{render();if($('hex').getAttribute('aria-invalid')==='true')announce('invalid');else $('status').textContent='';});
 render();
})();
