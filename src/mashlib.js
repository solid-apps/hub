// hub-mashlib — JSS-mashlib bootstrap for hub.
//
// JSS injects this single file into HTML responses on pod URLs. We
// hijack the body, build hub's shell DOM, inject hub's CSS, load
// xlogin, and hand off to the existing app.js entry point.

import shellCss from "../style.css";
import { readResourceHint, installCrumbUpdater, renderPathCrumbs } from "./nav.js";

function injectStyle(css) {
  const style = document.createElement("style");
  style.setAttribute("data-source", "hub-mashlib");
  style.textContent = css;
  document.head.appendChild(style);
}

function injectImportmap() {
  // External Preact panes (e.g. pilot's tracker-pane) expect these
  // bare specifiers to resolve. Inject once before any external pane
  // imports run.
  if (document.querySelector('script[type="importmap"][data-source="hub-mashlib"]')) return;
  const map = document.createElement("script");
  map.type = "importmap";
  map.setAttribute("data-source", "hub-mashlib");
  map.textContent = JSON.stringify({
    imports: {
      "preact":       "https://esm.sh/preact@10.19.0",
      "preact/hooks": "https://esm.sh/preact@10.19.0/hooks",
      "htm":          "https://esm.sh/htm@3.1.1"
    }
  });
  // Importmaps must precede module loads; insert as first <head> child.
  document.head.insertBefore(map, document.head.firstChild);
}

// Pinned to silence supply-chain risk — a breaking xlogin release
// otherwise breaks every solid-app at once. Bump deliberately.
const XLOGIN_VERSION = "0.0.12";

function loadXlogin() {
  if (window.xlogin || document.querySelector('script[src*="xlogin"]')) return Promise.resolve();
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = `https://unpkg.com/xlogin@${XLOGIN_VERSION}`;
    s.onload = () => resolve();
    s.onerror = () => resolve();  // continue without auth rather than block
    document.head.appendChild(s);
  });
}

// Data-island read now lives in nav.js's readResourceHint() so the
// standalone entry can share it. Stub left here for the docstring.

function buildShell() {
  // Replace whatever JSS rendered with hub's shell. Same DOM shape as
  // hub's index.html so app.js can find its expected ids by selector.
  const body = document.body;
  body.innerHTML = `
    <div class="shell">
      <header class="topbar">
        <div class="brand">
          <a href="https://github.com/solid-apps" class="brand-mark" title="solid-apps">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round">
              <path d="M10 13a5 5 0 0 1 0-7l3-3a5 5 0 0 1 7 7l-1.5 1.5"/>
              <path d="M14 11a5 5 0 0 1 0 7l-3 3a5 5 0 0 1-7-7l1.5-1.5"/>
            </svg>
          </a>
        </div>
        <div class="topbar-app-title" id="topbar-title"></div>
        <div class="topbar-actions">
          <button class="search-trigger" id="search-trigger" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span class="label">Search your pod</span>
            <span class="spacer"></span>
            <span class="kbd">⌘K</span>
          </button>
          <button class="icon-btn" id="theme-btn" title="Toggle theme (T)" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="theme-icon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </button>
          <span id="auth-pill"></span>
        </div>
      </header>
      <nav class="rail" id="rail"></nav>
      <aside class="sidebar" id="sidebar"></aside>
      <main class="main" id="main"></main>
    </div>
    <div class="spot-bg" id="spot-bg">
      <div class="spot" onclick="event.stopPropagation()">
        <div class="spot-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input class="spot-input" id="spot-input" placeholder="Search apps and items on your pod…" autocomplete="off" />
          <span class="kbd">esc</span>
        </div>
        <div class="spot-results" id="spot-results"></div>
      </div>
    </div>
    <div class="toast" id="toast"></div>
  `;
  document.documentElement.setAttribute("data-theme",
    localStorage.getItem("hubpod-theme") || "light");
}

// Breadcrumb logic moved to nav.js — installCrumbUpdater + renderPathCrumbs
// are shared with standalone hub's app.js entry.

async function boot() {
  injectImportmap();
  injectStyle(shellCss);
  // Mark mashlib mode up-front. Distinct from window.__hubMashlib (which
  // is the data-island context, may be null for 401 / 404 wrappers).
  window.__hubMashlibActive = true;
  // Capture the data island URL + body BEFORE buildShell wipes the DOM.
  window.__hubMashlib = readResourceHint();
  buildShell();
  installCrumbUpdater();
  await loadXlogin();
  // app.js handles Resource-app registration + initial-app selection itself
  // (gated on window.__hubMashlib which we set above). One source path for
  // both mashlib and standalone modes.
  await import("./app.js");
  requestAnimationFrame(renderPathCrumbs);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
