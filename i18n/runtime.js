/* Whole-page integration of the copyable MOI18n helper. GPL-2.0-only.
 * All catalogues are checked-in local files. Application models stay independent.
 */
(() => {
  'use strict';
  const config = MO_PAGE_DATA;
  const i18n = MOI18n.create({languages: MOLanguages, sourceLocale: 'en', catalogues: MOCatalogues});
  const requests = new Map(), dirtyInputs = new WeakSet();
  const sourceLinks = new WeakMap();
  let ticket = 0, selector, status, bar, booted = false;
  const formatLocale = () => MOLanguages.find(item => item.code === i18n.locale).formatLocale;
  const date = (value, options) => new Intl.DateTimeFormat(formatLocale(), options).format(value);
  const decode = text => text.replace(/&(?:amp|lt|gt|quot|#39|#\d+|#x[0-9a-f]+);/gi, entity => {
    const named = {'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'"};
    if (named[entity]) return named[entity];
    const value = entity[2].toLowerCase() === 'x' ? parseInt(entity.slice(3,-1),16) : Number(entity.slice(2,-1));
    return value > 0 && value <= 0x10ffff ? String.fromCodePoint(value) : entity;
  });
  function richText(text, slots) {
    const fragment = document.createDocumentFragment(), stack = [{node:fragment,slot:null}];
    const used = new Set();
    for (const token of text.split(/(<\/?s\d+>)/g)) {
      const tag = /^<(\/?)s(\d+)>$/.exec(token);
      if (!tag) {
        if (token.includes('<')) throw new Error('Only declared formatting slots are allowed');
        if (stack.at(-1).literal && token) throw new Error('Protected slot contents changed');
        stack.at(-1).node.append(document.createTextNode(decode(token)));
        continue;
      }
      const index = Number(tag[2]), slot = slots[index];
      if (!slot) throw new Error('Unknown formatting slot');
      if (tag[1]) {
        if (stack.length < 2 || stack.at(-1).slot !== index) throw new Error('Unbalanced formatting slot');
        stack.pop(); continue;
      }
      if (used.has(index)) throw new Error('Duplicate formatting slot');
      used.add(index);
      const node = document.createElement(slot.tag);
      for (const [name,value] of Object.entries(slot.attrs)) {
        if (/^on/i.test(name) || /^(?:javascript|data):/i.test(value) && ['href','src'].includes(name)) throw new Error('Unsafe source attribute');
        node.setAttribute(name,value);
      }
      if (Object.hasOwn(slot,'literal')) node.textContent = slot.literal;
      stack.at(-1).node.append(node);
      stack.push({node,slot:index,literal:Object.hasOwn(slot,'literal')});
    }
    if (stack.length !== 1 || used.size !== slots.length) throw new Error('Missing formatting slot');
    return fragment;
  }
  function localLinks() {
    for (const anchor of document.querySelectorAll('a[href]')) {
      if (!sourceLinks.has(anchor)) sourceLinks.set(anchor,anchor.getAttribute('href'));
      const original = sourceLinks.get(anchor);
      if (!original || original.startsWith('#') || /^(mailto:|tel:)/i.test(original)) continue;
      const url = new URL(original, location.href);
      if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) continue;
      url.searchParams.set('lang',i18n.locale);
      anchor.href = url.href;
    }
  }
  function apply() {
    // Build rich fragments first, then commit all text changes together.
    const edits = [];
    for (const node of document.querySelectorAll('[data-mo-key]')) {
      const key = node.dataset.moKey, text = i18n.text(key), slots = config.bindings[key]?.slots || [];
      edits.push([node,slots.length ? richText(text,slots) : document.createTextNode(text)]);
    }
    for (const [node,content] of edits) node.replaceChildren(content);
    for (const name of ['aria-label','placeholder','title','content','value']) {
      for (const node of document.querySelectorAll(`[data-mo-attr-${name}]`)) {
        const value = i18n.text(node.getAttribute(`data-mo-attr-${name}`));
        if (name === 'value') {
          if (!dirtyInputs.has(node) && !node.hasAttribute('data-mo-preserve-value')) { node.value = value; node.defaultValue = value; }
        } else node.setAttribute(name,value);
      }
    }
    document.documentElement.lang = i18n.locale;
    bar.querySelector('label span').textContent = i18n.text('site.language');
    selector.value = i18n.locale;
    localLinks();
    window.dispatchEvent(new CustomEvent('mo:language',{detail:{locale:i18n.locale}}));
  }
  function load(code) {
    if (!MOLanguages.some(item => item.code === code) || Object.hasOwn(MOCatalogues,code)) return Promise.resolve();
    if (requests.has(code)) return requests.get(code);
    const request = new Promise((resolve,reject) => {
      const script = document.createElement('script');
      const fail = () => { clearTimeout(timeout); script.remove(); requests.delete(code); reject(new Error('Catalogue unavailable')); };
      const timeout = setTimeout(fail,8000);
      script.src = new URL(config.catalogueBase+code+'.js',location.href).href;
      script.onload = () => { clearTimeout(timeout); resolve(); }; script.onerror = fail;
      document.head.append(script);
    });
    requests.set(code,request); return request;
  }
  async function choose(code, updateURL=false) {
    const request = ++ticket;
    bar.setAttribute('aria-busy','true');
    status.textContent = i18n.text('site.loading');
    try { await load(code); } catch (_) {}
    if (request !== ticket) return;
    let result = i18n.select(code);
    try { apply(); } catch (_) {
      i18n.select('en'); result={fallback:true}; apply();
    }
    const language = MOLanguages.find(item => item.code === i18n.locale).name;
    status.textContent = i18n.text(result.fallback ? 'site.fallback' : i18n.locale === 'en' ? 'site.english' : 'site.review', {language});
    status.dataset.fallback=String(result.fallback);
    bar.setAttribute('aria-busy','false');
    if (updateURL) {
      const url=new URL(location.href);url.searchParams.set('lang',i18n.locale);
      try { history.pushState(null,'',url); } catch (_) {}
    }
  }
  const api = {
    t: i18n.text, number: i18n.number, date,
    get locale() { return i18n.locale; },
    setLanguage: code => booted ? choose(code,true) : Promise.resolve(),
    // Read-only DOM/model checks can inspect the active language through the API.
    module: config.module
  };
  window.MOSite = Object.freeze(api);
  function boot() {
    booted=true;
    bar=document.createElement('div');bar.className='mo-language-bar';bar.id='mo-language-bar';
    const label=document.createElement('label'),caption=document.createElement('span');
    selector=document.createElement('select');selector.id='mo-language';selector.className='mo-select';label.htmlFor=selector.id;
    caption.textContent=i18n.text('site.language');label.append(caption,selector);
    for (const {code,name} of MOLanguages) { const option=document.createElement('option');option.value=code;option.lang=code;option.textContent=name;selector.append(option); }
    status=document.createElement('span');status.className='mo-language-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    bar.append(label,status);
    const stage=document.querySelector('.mo-main,.mo-handbook') || document.body;
    const actions=stage.querySelector(':scope > .mo-topbar > .mo-topbar-actions');
    (actions || stage).prepend(bar);
    for (const input of document.querySelectorAll('input[data-mo-attr-value]')) input.addEventListener('input',()=>dirtyInputs.add(input));
    selector.addEventListener('change',()=>choose(selector.value,true));
    window.addEventListener('popstate',()=>choose(new URL(location.href).searchParams.get('lang') || 'en'));
    choose(new URL(location.href).searchParams.get('lang') || 'en');
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
