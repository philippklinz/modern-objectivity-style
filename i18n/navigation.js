/* Shared site orientation; the static links also work without JavaScript. GPL-2.0-only. */
(() => {
  'use strict';
  const root = document.documentElement;
  let translate = key => key, locale = 'en', ready = false;
  try { const saved = localStorage.getItem('mo-theme'); if (saved === 'light' || saved === 'dark') root.dataset.theme = saved; } catch (_) {}
  const canonical = 'https://philipp-klinz.net/modern-objectivity-style/';
  const sourcePage = root.dataset.moSitePage;
  function theme() {
    const dark = root.dataset.theme === 'dark';
    for (const button of document.querySelectorAll('[data-theme-toggle]')) {
      button.setAttribute('aria-pressed', String(dark));
      button.textContent = translate(dark ? 'theme.light' : 'theme.dark');
    }
  }
  function render({t, language}) {
    translate = t; locale = language;
    for (const element of document.querySelectorAll('[data-mo-nav]')) element.textContent = t(element.dataset.moNav);
    for (const element of document.querySelectorAll('[data-mo-nav-aria]')) element.setAttribute('aria-label', t(element.dataset.moNavAria));
    for (const element of document.querySelectorAll('[data-mo-nav-back]')) element.textContent = t('nav.back', {section: t(element.dataset.moNavBack)});
    for (const anchor of document.querySelectorAll('[data-mo-toc]')) {
      const heading = document.getElementById(anchor.dataset.moToc);
      if (heading) anchor.textContent = heading.textContent;
    }
    // A copied starter/pattern retains local assets and links back to the published guide.
    const standalone = location.protocol === 'file:' || !location.pathname.endsWith('/' + sourcePage);
    for (const anchor of document.querySelectorAll('[data-mo-destination]')) {
      const destination = anchor.dataset.moDestination;
      if (standalone && /^(starter|patterns\/i18n)\//.test(sourcePage)) {
        const folder = sourcePage.slice(0, sourcePage.lastIndexOf('/') + 1);
        if (!destination.startsWith(folder)) anchor.href = new URL(destination, canonical).href;
      }
      const url = new URL(anchor.href, location.href);
      url.searchParams.set('lang', locale); anchor.href = url.href;
    }
    for (const anchor of document.querySelectorAll('a[href]')) {
      const url = new URL(anchor.href, location.href);
      // The public guide's two hosts are the same site, including offline return links.
      const external = /^https?:$/.test(url.protocol) && url.origin !== location.origin &&
        !url.href.startsWith(canonical) && !url.href.startsWith('https://philippklinz.github.io/modern-objectivity-style/');
      let badge = anchor.querySelector('.mo-external-label');
      if (external && !badge) { badge = document.createElement('span'); badge.className = 'mo-external-label'; anchor.append(badge); }
      if (badge) { if (external) badge.textContent = t('nav.external'); else badge.remove(); }
    }
    theme();
  }
  function boot() {
    if (ready) return; ready = true;
    const menu = document.getElementById('mo-site-menu');
    const mobile = matchMedia('(max-width: 900px)');
    const compact = () => {
      menu.open = !mobile.matches;
      for (const outline of document.querySelectorAll('.mo-page-outline')) outline.open = !mobile.matches;
    };
    compact(); mobile.addEventListener('change', compact);
    menu.addEventListener('keydown', event => {
      if (event.key === 'Escape' && mobile.matches && menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
    });
    menu.addEventListener('click', event => { if (mobile.matches && event.target.closest('a')) menu.open = false; });
    document.addEventListener('click', event => {
      if (!event.target.closest('[data-theme-toggle]')) return;
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('mo-theme', root.dataset.theme); } catch (_) {}
      theme();
    });
    const toc = [...document.querySelectorAll('[data-mo-toc]')];
    const highlight = () => {
      let active = toc[0];
      for (const anchor of toc) {
        const target = document.getElementById(anchor.dataset.moToc);
        if (target && target.getBoundingClientRect().top <= 160) active = anchor;
      }
      for (const anchor of toc) {
        if (anchor === active) anchor.setAttribute('aria-current', 'location');
        else anchor.removeAttribute('aria-current');
      }
    };
    let frame = null;
    addEventListener('scroll', () => { if (frame === null) frame = requestAnimationFrame(() => { frame = null; highlight(); }); }, {passive: true});
    highlight();
    // Direct section URLs reveal the corresponding group without changing the page order.
    const reveal = () => {
      for (const anchor of menu.querySelectorAll('a[data-mo-destination]')) {
        const url = new URL(anchor.href, location.href);
        if (url.pathname === location.pathname && url.hash && url.hash === location.hash) {
          anchor.closest('details').open = true; anchor.setAttribute('aria-current', 'location');
        } else if (anchor.getAttribute('aria-current') === 'location') anchor.removeAttribute('aria-current');
      }
    };
    addEventListener('hashchange', reveal); reveal();
  }
  window.MONavigation = Object.freeze({render});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true}); else boot();
})();
