/*
Modern Objectivity sample interactions (GPL-2.0-only).
The CSS is independent of this script. This file only makes demonstrations interactive.
*/
(() => {
  "use strict";
  let updateThemeButtons = () => {};
  // Copied components can still use this helper without the full guide shell.
  if (!window.MONavigation) {
    const root = document.documentElement;
    let stored = null;
    try { stored = localStorage.getItem("mo-theme"); } catch (_) {}
    const initial = stored === "dark" || stored === "light" ? stored : "light";
    root.setAttribute("data-theme", initial);
    updateThemeButtons = () => document.querySelectorAll("[data-theme-toggle]").forEach(btn => {
      const dark = root.getAttribute("data-theme") === "dark";
      btn.setAttribute("aria-pressed", String(dark));
      btn.textContent = window.MOSite.t(dark ? "theme.light" : "theme.dark");
    });
    document.addEventListener("click", e => {
      const btn = e.target.closest("[data-theme-toggle]");
      if (btn) {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try { localStorage.setItem("mo-theme", next); } catch (_) {}
        updateThemeButtons();
      }
    });
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", updateThemeButtons);
    else updateThemeButtons();

  }

  let toastTimer, currentToast = null;
  function renderToast() {
    const node = document.querySelector("#mo-global-toast");
    if (node && currentToast) node.textContent = window.MOSite.t(currentToast.key, currentToast.params);
  }
  function toast(key, params = {}) {
    let node = document.querySelector("#mo-global-toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "mo-global-toast";
      node.className = "mo-toast";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      document.body.append(node);
    }
    currentToast = {key, params: {...params}, timestamp: new Date()};
    renderToast();
    node.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { node.hidden = true; }, 3500);
  }
  window.MODemo = { toast };
  document.addEventListener("click", e => {
    const el = e.target.closest("[data-toast]");
    if (el) toast(el.getAttribute("data-toast"));
  });
  window.addEventListener("mo:language", () => {
    updateThemeButtons();
    renderToast();
  });

  document.querySelectorAll("[role=tablist]").forEach(tabs => {
    const buttons = [...tabs.querySelectorAll("[role=tab]")];
    if (!buttons.length) return;
    function activate(btn, focus = false) {
      buttons.forEach(b => {
        const selected = b === btn;
        b.setAttribute("aria-selected", String(selected));
        b.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(b.getAttribute("aria-controls"));
        if (panel) panel.hidden = !selected;
      });
      if (focus) btn.focus();
    }
    buttons.forEach((b,i) => {
      b.addEventListener("click", () => activate(b));
      b.addEventListener("keydown", e => {
        const offset = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!offset) return;
        e.preventDefault();
        activate(buttons[(i + offset + buttons.length) % buttons.length], true);
      });
    });
  });
})();
