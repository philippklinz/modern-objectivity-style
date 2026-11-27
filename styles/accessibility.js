/* Native controls, recoverable errors and opt-in movement. GPL-2.0-only. */
(() => {
  'use strict';
  const $=name=>document.getElementById('a11y-'+name);
  const t=(key,values)=>window.MOSite.t('a11y.'+key,values);
  const dialog=$('dialog'),preference=matchMedia('(prefers-reduced-motion: reduce)'),track=document.querySelector('.a11y-track');
  let submitted=false,success=false,position=0;
  function feedback(){
    const invalid=submitted&&Array.from($('name').value.trim()).length<2;
    $('name').setAttribute('aria-invalid',String(invalid));
    $('error').hidden=!invalid;$('error').textContent=invalid?t('error'):'';
    $('status').textContent=success?t('success'):'';
    return !invalid;
  }
  function motion(){
    track.dataset.reduce=String(preference.matches||$('reduce').checked);
    $('preference').textContent=t(preference.matches?'reduced':'standard');
    track.dataset.step=String(position);$('position').textContent=t('position',{position:window.MOSite.number(position+1)});
  }
  function checklist(){
    const checks=[...document.querySelectorAll('[data-a11y-check]')];
    $('progress').textContent=t('progress',{count:window.MOSite.number(checks.filter(c=>c.checked).length),total:window.MOSite.number(checks.length)});
  }
  $('open').addEventListener('click',()=>dialog.showModal());
  dialog.addEventListener('keydown',event=>{
    if(event.key!=='Tab')return;
    if(event.shiftKey&&document.activeElement===$('keep')){event.preventDefault();$('close').focus();}
    else if(!event.shiftKey&&document.activeElement===$('close')){event.preventDefault();$('keep').focus();}
  });
  $('form').addEventListener('submit',event=>{event.preventDefault();submitted=true;success=false;if(feedback()){success=true;feedback();}else $('name').focus();});
  $('name').addEventListener('input',()=>{success=false;if(submitted)feedback();});
  $('move').addEventListener('click',()=>{position=(position+1)%3;motion();});
  $('reduce').addEventListener('change',motion);preference.addEventListener('change',motion);
  document.querySelectorAll('[data-a11y-check]').forEach(input=>input.addEventListener('change',checklist));
  $('reset').addEventListener('click',()=>{document.querySelectorAll('[data-a11y-check]').forEach(input=>input.checked=false);checklist();});
  window.addEventListener('mo:language',()=>{feedback();motion();checklist();});
  for(const id of ['open','submit','move','reset'])$(id).disabled=false;
  feedback();motion();checklist();
})();
