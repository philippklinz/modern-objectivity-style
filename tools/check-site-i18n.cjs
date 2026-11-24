'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const source=JSON.parse(fs.readFileSync(path.join(root,'i18n/source/en.json'),'utf8'));
const pages=JSON.parse(fs.readFileSync(path.join(root,'i18n/source/pages.json'),'utf8'));
const languageContext=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root,'patterns/i18n/languages.js'),'utf8'),languageContext);
const languages=languageContext.MOLanguages;
const {validate}=require('../patterns/i18n/i18n.js');
const {sourceRevision}=require('../patterns/i18n/check.cjs');
const vars=text=>[...new Set([...text.matchAll(/\{([a-zA-Z][\w]*)\}/g)].map(x=>x[1]))].sort().join(',');
const forms=value=>typeof value==='string'?[value]:Object.values(value.forms||{});
const slotShape=text=>{
 const stack=[],slots=[];
 for(const match of text.matchAll(/<(\/?)s(\d+)>/g)){
  const id=Number(match[2]);
  if(match[1]){if(stack.pop()!==id)throw new Error('unbalanced slot');}
  else {slots.push(`${id}:${stack.at(-1)??'root'}`);stack.push(id);}
 }
 if(stack.length)throw new Error('unclosed slot');
 return slots.sort().join(',');
};
function validateMessages(locale,messages){
 const issues=[];
 const code=languages.find(item=>item.code===locale).formatLocale;
 for(const [key,original] of Object.entries(source)){
  if(!Object.hasOwn(messages,key)){issues.push(`${key}: missing`);continue;}
  const value=messages[key];
  const check=validate({[key]:original},{status:'available',sourceRevision:'current',messages:{[key]:value}},code,'current');
  issues.push(...check);
  for(const candidate of forms(value)){
   if(typeof candidate!=='string')continue;
   try{if(slotShape(candidate)!==slotShape(forms(original)[0]))issues.push(`${key}: changed formatting slots`);}catch(error){issues.push(`${key}: ${error.message}`);}
  }
 }
 for(const key of Object.keys(messages))if(!Object.hasOwn(source,key))issues.push(`${key}: extra`);
 return issues;
}
function revisions(){
 return Object.fromEntries(Object.entries(pages).map(([module,info])=>{
  const messages=Object.fromEntries(info.keys.map(key=>[module==='pattern'?key.replace(/^pattern\./,''):key,source[key]]));
  return [module,sourceRevision(messages)];
 }));
}
function check({sourceOnly=false,compiled=true}={}){
 const errors=[],expected=revisions();
 const selected=sourceOnly?languages.filter(item=>item.code==='en'):languages;
 for(const {code,formatLocale} of selected){
  let messages;
  try{messages=code==='en'?source:JSON.parse(fs.readFileSync(path.join(root,`i18n/translations/${code}.json`),'utf8'));}
  catch(error){errors.push(`${code}: ${error.message}`);continue;}
  for(const issue of validateMessages(code,messages))errors.push(`${code}: ${issue}`);
  if(!compiled)continue;
  for(const [module,info] of Object.entries(pages)){
   const file=path.join(root,info.assetdir,code+'.js');
   try{
    const context=vm.createContext({});vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
    const pack=context.MOCatalogues[code];
    const original=Object.fromEntries(info.keys.map(key=>[module==='pattern'?key.replace(/^pattern\./,''):key,source[key]]));
    const translated=Object.fromEntries(info.keys.map(key=>[module==='pattern'?key.replace(/^pattern\./,''):key,messages[key]]));
    errors.push(...validate(original,pack,formatLocale,expected[module]).map(issue=>`${code}/${module}: ${issue}`));
    if(JSON.stringify(pack.messages)!==JSON.stringify(translated))errors.push(`${code}/${module}: compiled text differs from authoring catalogue`);
   }catch(error){errors.push(`${code}/${module}: ${error.message}`);}
  }
 }
 return {errors,languages:selected.length,pages:Object.keys(pages).length,keys:Object.keys(source).length};
}
module.exports={check,validateMessages,revisions,source,pages,languages,root};
if(require.main===module){
 if(process.argv.includes('--source-revisions'))console.log(JSON.stringify(revisions(),null,2));
 else{
  const result=check({sourceOnly:process.argv.includes('--source-only'),compiled:!process.argv.includes('--authoring-only')});
  if(result.errors.length){console.error(result.errors.join('\n'));process.exitCode=1;}
  else console.log(`${result.pages} complete pages × ${result.languages} languages; ${result.keys} source messages, slots, placeholders, plural forms and compiled revisions checked.`);
 }
}
