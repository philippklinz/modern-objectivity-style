'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root, 'styles/fonts/manifest.js'), 'utf8'), context);
const manifest = context.MOFontManifest;
assert.equal(manifest.files.length, 80);
const provenance = JSON.parse(fs.readFileSync(path.join(root, 'styles/fonts/liberation/PROVENANCE.json'), 'utf8'));
assert.equal(manifest.commit, provenance.commit);
for (const directory of ['styles/fonts/liberation', 'starter/fonts/liberation', 'patterns/i18n/fonts/liberation']) {
  for (const [name, entry] of Object.entries(provenance.files)) {
    const data = fs.readFileSync(path.join(root, directory, name));
    assert.equal(data.length, entry.bytes, directory + '/' + name);
    assert.equal(hash(data), entry.sha256, directory + '/' + name);
  }
  for (const name of ['LICENSE', 'AUTHORS', 'LICENSE-Sans-Narrow.txt', 'COPYING-Sans-Narrow', 'PROVENANCE.json']) assert.ok(fs.existsSync(path.join(root, directory, name)), name);
  for (const css of fs.readdirSync(path.join(root, directory)).filter(name => name.endsWith('.css'))) {
    const source = fs.readFileSync(path.join(root, directory, css), 'utf8');
    for (const match of source.matchAll(/(?:url\(['"]?|@import\s+['"])([^)'";]+)/g)) assert.ok(fs.existsSync(path.join(root, directory, match[1])), match[1]);
  }
}
for (const file of manifest.files) {
  const data = fs.readFileSync(path.join(root, 'styles/fonts/liberation', file.file));
  assert.equal(data.subarray(0, 4).toString(), 'wOF2', file.file);
  assert.equal(hash(data), file.sha256, file.file);
  assert.equal(data.length, file.bytes, file.file);
  assert.ok(file.coverage.length > 0, file.file);
  const css = fs.readFileSync(path.join(root, 'styles/fonts/liberation', 'Liberation' + file.family + 'Web.css'), 'utf8');
  const declaration = css.split('\n').find(line => line.includes("url('" + file.file + "')"));
  assert.ok(declaration.includes('unicode-range:' + file.unicodeRange), file.file);
  assert.ok(declaration.includes('font-display:swap'), file.file);
}
for (const file of ['styles/modern-objectivity.css', 'starter/modern-objectivity.css', 'patterns/i18n/modern-objectivity.css']) {
  const css = fs.readFileSync(path.join(root, file), 'utf8');
  assert.ok(css.startsWith('@import url("fonts/liberation/LiberationFontsWeb.css");'));
  for (const name of ['Sans', 'Serif', 'Mono']) assert.ok(css.includes('"Liberation ' + name + ' Web"'));
}
console.log('80 pinned WOFF2 files and declared character ranges verified in all three local distributions.');
