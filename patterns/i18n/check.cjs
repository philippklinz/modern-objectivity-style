/* Author-side checks only; the published site does not run Node. GPL-2.0-only. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const {validate} = require('./i18n.js');

function loadCatalogues() {
  const context = vm.createContext({Intl});
  const run = file => vm.runInContext(fs.readFileSync(path.join(__dirname, file), 'utf8'), context, {filename: file});
  run('languages.js');
  for (const language of context.MOLanguages) run(`locales/${language.code}.js`);
  return {languages: context.MOLanguages, catalogues: context.MOCatalogues};
}
function canonical(value) {
  if (!value || typeof value !== 'object') return JSON.stringify(value);
  return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}';
}
function sourceRevision(messages) {
  return crypto.createHash('sha256').update(canonical(messages)).digest('hex');
}
function check() {
  const {languages, catalogues} = loadCatalogues();
  const target = ['bg','hr','cs','da','nl','en','et','fi','fr','de','el','hu','ga','it','lv','lt','mt','pl','pt','ro','sk','sl','es','sv'];
  const codes = languages.map(language => language.code);
  const errors = [];
  if (codes.length !== 24 || new Set(codes).size !== 24 || target.some(code => !codes.includes(code))) errors.push('Expected exactly the 24 EU language tags');
  const source = catalogues.en.messages;
  const revision = sourceRevision(source);
  for (const language of languages) {
    const pack = catalogues[language.code];
    for (const issue of validate(source, pack, language.formatLocale || language.code, revision)) errors.push(`${language.code}: ${issue}`);
    if (!pack.review) errors.push(`${language.code}: missing review disclosure`);
  }
  return {errors, revision, languages: codes.length, messages: Object.keys(source).length};
}
module.exports = {loadCatalogues, sourceRevision, check};
if (require.main === module) {
  const result = check();
  if (process.argv.includes('--source-revision')) console.log(result.revision);
  else if (result.errors.length) {
    console.error(result.errors.join('\n'));
    console.error('Review changed source messages before updating a translation’s sourceRevision. This command never updates translations.');
    process.exitCode = 1;
  } else console.log(`${result.languages} catalogues × ${result.messages} message keys checked. Structural coverage and source freshness; independent language review is separate.`);
}
