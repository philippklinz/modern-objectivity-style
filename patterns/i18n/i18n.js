/* Small static localization reference. No network, storage or model code.
 * GPL-2.0-only. See README.md for the scope and limitations.
 */
(() => {
  'use strict';
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const variables = text => [...new Set([...text.matchAll(/\{([a-zA-Z][\w]*)\}/g)].map(m => m[1]))].sort().join(',');
  const forms = value => typeof value === 'string' ? [value] : Object.values(value.forms || {});

  // Reject an incomplete module as a whole; do not silently mix languages.
  function validate(source, pack, locale, revision) {
    const issues = [];
    if (!pack || !pack.messages) return ['catalogue missing'];
    if (pack.sourceRevision !== revision) issues.push('source revision changed');
    if (!['example', 'available'].includes(pack.status)) issues.push('catalogue is not published');
    for (const [key, original] of Object.entries(source)) {
      if (!own(pack.messages, key)) { issues.push(`${key}: missing`); continue; }
      const candidate = pack.messages[key];
      if (typeof original === 'string') {
        if (typeof candidate !== 'string') { issues.push(`${key}: expected text`); continue; }
      } else {
        if (!candidate || typeof candidate !== 'object' || candidate.plural !== original.plural || !candidate.forms) {
          issues.push(`${key}: expected plural message`); continue;
        }
        for (const category of new Intl.PluralRules(locale).resolvedOptions().pluralCategories) {
          if (!own(candidate.forms, category)) issues.push(`${key}: missing plural ${category}`);
        }
        if (!own(candidate.forms, 'other')) issues.push(`${key}: missing plural other`);
      }
      const expected = variables(forms(original)[0]);
      for (const text of forms(candidate)) {
        if (typeof text !== 'string' || !text.trim()) issues.push(`${key}: empty or invalid text`);
        else if (variables(text) !== expected) issues.push(`${key}: placeholder mismatch`);
      }
    }
    for (const key of Object.keys(pack.messages)) {
      if (!own(source, key)) issues.push(`${key}: unknown key`);
    }
    return issues;
  }

  function create({languages, sourceLocale, catalogues}) {
    const supported = new Set(languages.map(item => item.code));
    const formatLocale = code => languages.find(item => item.code === code).formatLocale || code;
    const source = catalogues[sourceLocale];
    if (!supported.has(sourceLocale) || !source) throw new Error('A supported source catalogue is required');
    const errors = validate(source.messages, source, formatLocale(sourceLocale), source.sourceRevision);
    if (errors.length) throw new Error(errors.join('; '));
    let locale = sourceLocale;
    const numberFormats = new Map();
    const pluralRules = new Map();
    function number(value, options = {}) {
      const key = locale + JSON.stringify(options);
      if (!numberFormats.has(key)) numberFormats.set(key, new Intl.NumberFormat(formatLocale(locale), options));
      return numberFormats.get(key).format(value);
    }
    function text(key, params = {}) {
      const messages = catalogues[locale].messages;
      if (!own(messages, key)) throw new Error(`Unknown message: ${key}`);
      let message = messages[key];
      if (typeof message !== 'string') {
        const count = params[message.plural];
        if (typeof count !== 'number' || !Number.isFinite(count)) throw new Error(`${key}: numeric ${message.plural} required`);
        if (!pluralRules.has(locale)) pluralRules.set(locale, new Intl.PluralRules(formatLocale(locale)));
        message = message.forms[pluralRules.get(locale).select(count)];
      }
      return message.replace(/\{([a-zA-Z][\w]*)\}/g, (_, name) => {
        if (!own(params, name)) throw new Error(`${key}: missing ${name}`);
        return typeof params[name] === 'number' ? number(params[name]) : String(params[name]);
      });
    }
    return Object.freeze({
      get locale() { return locale; },
      select(requested = sourceLocale) {
        const validCode = supported.has(requested);
        const issues = validCode ? validate(source.messages, catalogues[requested], formatLocale(requested), source.sourceRevision) : ['unsupported language'];
        locale = issues.length ? sourceLocale : requested;
        return {requested, locale, fallback: issues.length > 0, issues};
      },
      text,
      number,
      apply(root) {
        // Put these attributes on text leaves, never on a container of controls.
        const bindings = [
          ['data-i18n', null], ['data-i18n-aria-label', 'aria-label'],
          ['data-i18n-title', 'title'], ['data-i18n-placeholder', 'placeholder']
        ];
        for (const [binding, attribute] of bindings) {
          const nodes = [...root.querySelectorAll(`[${binding}]`)];
          if (root.hasAttribute(binding)) nodes.unshift(root);
          for (const node of nodes) {
            const value = text(node.getAttribute(binding));
            if (attribute) node.setAttribute(attribute, value);
            else node.textContent = value;
          }
        }
        root.lang = locale;
      }
    });
  }
  const api = Object.freeze({create, validate});
  globalThis.MOI18n = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
