/* Sampling-plan demo: state is independent of language. GPL-2.0-only. */
(() => {
  'use strict';
  const base = new URL('.', document.currentScript.src);
  const $ = id => document.getElementById(id);
  const scope = $('localized-demo');
  const select = $('language');
  const state = {count: 6, interval: 0.25};
  let i18n;
  try {
    i18n = MOI18n.create({languages: MOLanguages, sourceLocale: 'en', catalogues: MOCatalogues});
  } catch (_) {
    $('language-status').textContent = 'The interactive example could not start. Reload the page to try again.';
    scope.setAttribute('aria-busy', 'false');
    return; // Keep the readable English baseline and disabled controls.
  }
  const pending = new Map();
  let generation = 0;

  for (const {code, name} of MOLanguages) {
    const option = document.createElement('option');
    option.value = code; option.textContent = name; option.lang = code;
    select.append(option);
  }
  function load(code) {
    if (!MOLanguages.some(item => item.code === code)) return Promise.resolve();
    if (Object.prototype.hasOwnProperty.call(MOCatalogues, code)) return Promise.resolve();
    if (pending.has(code)) return pending.get(code);
    const request = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const fail = () => { clearTimeout(timer); script.remove(); pending.delete(code); reject(new Error('Language pack unavailable')); };
      const timer = setTimeout(fail, 8000);
      // code is an exact allowlisted tag. Paths never come from arbitrary URL input.
      script.src = new URL(`locales/${code}.js`, base).href;
      script.onload = () => { clearTimeout(timer); resolve(); };
      script.onerror = fail;
      document.head.append(script);
    });
    pending.set(code, request);
    return request;
  }
  function render() {
    i18n.apply(scope);
    $('count-value').textContent = i18n.number(state.count);
    $('interval-value').textContent = i18n.number(state.interval, {minimumFractionDigits: 2});
    $('summary').textContent = i18n.text('samples', {count: state.count});
    const duration = state.count * state.interval;
    const value = i18n.number(duration, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    $('duration').textContent = `${value} s`;
    $('duration').dataset.value = String(duration);
    $('diagram-title').textContent = i18n.text('diagram', {count: state.count, duration: value});
    $('diagram-end').textContent = `${value} s`;
    const bars = $('diagram-bars'); bars.replaceChildren();
    for (let index = 0; index < state.count; index++) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', String(16 + index * 568 / state.count));
      rect.setAttribute('y', String(82 - state.interval * 26));
      rect.setAttribute('width', String(568 / state.count - 4));
      rect.setAttribute('height', String(state.interval * 26));
      rect.setAttribute('rx', '2'); bars.append(rect);
    }
    const link = new URL(location.href); link.searchParams.set('lang', i18n.locale);
    $('share-link').href = link.href;
  }
  async function choose(code, updateURL = false) {
    const ticket = ++generation;
    scope.setAttribute('aria-busy', 'true');
    try { await load(code); } catch (_) { /* A whole-module source fallback follows. */ }
    if (ticket !== generation) return;
    const result = i18n.select(code);
    select.value = i18n.locale;
    render();
    const name = MOLanguages.find(item => item.code === i18n.locale).name;
    $('language-status').textContent = i18n.text(result.fallback ? 'unavailable' : 'selected', {language: name});
    $('language-status').dataset.fallback = String(result.fallback);
    scope.setAttribute('aria-busy', 'false');
    if (updateURL) {
      const url = new URL(location.href); url.searchParams.set('lang', i18n.locale);
      // Some file:// browsers restrict History. The share link still has the locale.
      try { history.pushState(null, '', url); } catch (_) {}
    }
  }
  $('count').addEventListener('input', event => { state.count = Number(event.target.value); render(); });
  $('interval').addEventListener('input', event => { state.interval = Number(event.target.value); render(); });
  $('reset').addEventListener('click', () => {
    state.count = 6; state.interval = 0.25;
    $('count').value = state.count; $('interval').value = state.interval; render();
  });
  select.addEventListener('change', () => choose(select.value, true));
  window.addEventListener('popstate', () => choose(new URL(location.href).searchParams.get('lang') || 'en'));
  scope.querySelectorAll('input, select, button').forEach(control => { control.disabled = false; });
  render();
  choose(new URL(location.href).searchParams.get('lang') || 'en');
})();
