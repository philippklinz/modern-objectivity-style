'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {create} = require('./i18n.js');
const {loadCatalogues, sourceRevision, check} = require('./check.cjs');
const setup = () => { const data = loadCatalogues(); return {...data, i18n: create({...data, sourceLocale: 'en'})}; };

test('all 24 catalogues match the source, placeholders and locale plural categories', () => {
  assert.deepEqual(check().errors, []);
  const {i18n, languages} = setup();
  for (const {code} of languages) {
    assert.equal(i18n.select(code).fallback, false, code);
    for (const count of [0,1,2,3,5,7,11,21,22,101,1.5,1000000]) {
      const text = i18n.text('samples', {count});
      assert.ok(text && !text.includes('{count}'), `${code} count ${count}`);
    }
  }
});

test('plural selection and numeric formatting use the active locale', () => {
  const {i18n} = setup();
  i18n.select('pl');
  assert.equal(i18n.text('samples', {count: 1}), '1 próbka');
  assert.equal(i18n.text('samples', {count: 2}), '2 próbki');
  assert.equal(i18n.text('samples', {count: 5}), '5 próbek');
  assert.equal(i18n.text('samples', {count: 22}), '22 próbki');
  i18n.select('de'); assert.equal(i18n.number(1.5, {minimumFractionDigits: 2}), '1,50');
  i18n.select('pt'); assert.equal(i18n.text('samples', {count: 0}), '0 amostras');
  i18n.select('sl'); assert.equal(i18n.text('samples', {count: 2}), '2 vzorca');
});

test('missing, stale, draft, malformed and unsupported catalogues fall back as a whole', () => {
  const mutations = [
    data => { delete data.catalogues.de; },
    data => { delete data.catalogues.de.messages.modelNote; },
    data => { data.catalogues.de.sourceRevision = 'old'; },
    data => { data.catalogues.de.status = 'draft'; },
    data => { data.catalogues.de.messages.selected = 'Missing placeholder'; },
    data => { delete data.catalogues.de.messages.samples.forms.other; }
  ];
  for (const mutate of mutations) {
    const data = loadCatalogues(); mutate(data);
    const i18n = create({...data, sourceLocale: 'en'});
    assert.equal(i18n.select('de').fallback, true);
    assert.equal(i18n.locale, 'en');
    assert.equal(i18n.text('title'), 'Sampling plan');
  }
  const {i18n} = setup();
  for (const code of ['../../de', 'de-DE', 'constructor', '<script>', 'xx']) assert.equal(i18n.select(code).fallback, true);
});

test('source fingerprint changes on source edits, regardless of key order', () => {
  const {catalogues} = setup();
  const source = catalogues.en.messages;
  const reversed = Object.fromEntries(Object.entries(source).reverse());
  assert.equal(sourceRevision(source), sourceRevision(reversed));
  assert.notEqual(sourceRevision(source), sourceRevision({...source, title: 'Revised source'}));
});

test('missing parameters fail explicitly and inserted values remain literal text', () => {
  const {i18n} = setup();
  assert.throws(() => i18n.text('selected'), /missing language/);
  assert.throws(() => i18n.text('samples', {count: '2'}), /numeric count/);
  assert.throws(() => i18n.text('unknown'), /Unknown message/);
  assert.equal(i18n.text('selected', {language: '<b>{count}</b>'}), 'Language: <b>{count}</b>. Your settings are unchanged.');
});
