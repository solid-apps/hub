// hub-mashlib — JSS-mashlib bootstrap for hub.
//
// JSS injects this single file into HTML responses on pod URLs. We
// hijack the body, build hub's shell DOM, inject hub's CSS, load
// xlogin, and hand off to the existing app.js entry point.

import shellCss from "../style.css";

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

// Read JSS's mashlib data island BEFORE buildShell wipes the body.
// JSS embeds the current resource URL + JSON-LD on every wrapped page;
// hub uses the URL to focus the right pane/app, and (later) the JSON-LD
// to skip an initial fetch.
function captureMashlibContext() {
  const el = document.getElementById("dataisland");
  if (!el) return null;
  const uri = el.getAttribute("data-uri");
  let data = null;
  try { data = JSON.parse(el.textContent || "null"); } catch {}
  return uri ? { uri, data } : null;
}

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

// URL-context hook: when JSS injects the mashlib on a real pod URL,
// pick an initial app based on what the URL actually points at. Without
// this hub always boots to #home regardless of the resource being
// viewed — defeats the point of being a "data browser".
function pickInitialAppFromUrl() {
  const path = location.pathname || "/";
  // Non-container resource paths always force the resource pane (overrides
  // any stale hash from browser nav cache — the URL is the source of truth).
  if (path !== "/" && path !== "" && !path.endsWith("/")) {
    if (/\/profile/.test(path)) return "profile";
    return "resource";
  }
  // For containers / root, honour an existing hash if set (user nav wins).
  if (location.hash && location.hash.length > 1) return null;
  if (path === "/" || path === "") return "home";
  if (path.endsWith("/")) return "files";
  return null;
}

// Synthetic "resource" app — when JSS injects the mashlib on a non-container
// resource URL, this reads the data island's @type and dispatches to the
// matching pane via hub's pane registry. Note → NotePane, Event → EventPane,
// etc. Registered before app.js boots so the hash router can find it.
function buildResourceApp() {
  return {
    meta: { id: "resource", name: "Resource", icon: "📄", hasSidebar: false },
    async render(container, ctx) {
      const m = window.__hubMashlib;
      if (!m?.uri || !m.data) {
        container.innerHTML = `<div class="content"><div class="page-pad"><h1>No resource loaded</h1><p class="lede">Navigate to a JSON-LD resource URL to render it by @type.</p></div></div>`;
        return;
      }
      const node = (m.data["@graph"] && (Array.isArray(m.data["@graph"]) ? m.data["@graph"][0] : m.data["@graph"])) || m.data;
      const t = node?.["@type"];
      const forClass = Array.isArray(t) ? t[0] : t;
      // Expand schema:Foo → https://schema.org/Foo so canHandle implementations
      // matching on full IRIs still resolve. Panes that match the compact
      // form would also see the prefix via the input.doc @context.
      let expanded = forClass;
      if (typeof expanded === "string" && expanded.startsWith("schema:")) {
        expanded = "https://schema.org/" + expanded.slice(7);
      }
      const input = { url: m.uri, doc: m.data, forClass: expanded };
      let pane = null;
      if (typeof ctx.resolvePane === "function") {
        try { pane = await ctx.resolvePane(input); } catch (e) { console.warn("resolvePane threw:", e); }
      }
      if (!pane && typeof ctx.findPane === "function") {
        try { pane = ctx.findPane(input); } catch (e) { console.warn("findPane threw:", e); }
      }
      if (!pane) {
        const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
        container.innerHTML = `<div class="content"><div class="page-pad">
          <h1>${esc(forClass || "Resource")}</h1>
          <p class="lede">No pane registered for this @type. Raw JSON-LD:</p>
          <pre style="background:#f5f5f5;padding:12px;border-radius:6px;font-size:12px;overflow:auto;white-space:pre-wrap;word-break:break-word">${esc(JSON.stringify(node, null, 2))}</pre>
        </div></div>`;
        return;
      }
      try {
        await Promise.resolve(pane.render(input, container, ctx));
      } catch (e) {
        container.innerHTML = `<div class="content"><div class="page-pad">Pane render failed: ${e.message}</div></div>`;
      }
    }
  };
}

// URL-driven breadcrumb in the topbar — each segment is a clickable
// link to its container, giving users a familiar Finder/Files navigation
// surface that lets them jump up the tree at any level. In mashlib mode
// this replaces hub's "hub-pod / <AppName>" title.
function renderPathCrumbs() {
  const el = document.getElementById("topbar-title");
  if (!el) return;
  const u = new URL(location.href);
  const segments = u.pathname.split("/").filter(Boolean);
  const isResource = !u.pathname.endsWith("/");
  let acc = u.origin + "/";
  let html = `<a class="crumb" href="${acc}" title="${escapeHtml(u.host)}">${escapeHtml(u.host)}</a>`;
  segments.forEach((seg, i) => {
    const isLast = i === segments.length - 1;
    acc += seg + (isLast && isResource ? "" : "/");
    if (isLast && isResource) {
      html += ` <span class="sep">/</span> <span class="crumb cur">${escapeHtml(decodeURIComponent(seg))}</span>`;
    } else {
      html += ` <span class="sep">/</span> <a class="crumb" href="${acc}">${escapeHtml(decodeURIComponent(seg))}</a>`;
    }
  });
  el.innerHTML = html;
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
}

// Patch history pushState/replaceState so anything in the app that changes
// the URL (Files navigation, Resource navigation, etc.) also refreshes the
// breadcrumb. Cheap and centralised.
function installCrumbUpdater() {
  const origPush = history.pushState.bind(history);
  const origReplace = history.replaceState.bind(history);
  history.pushState = function (...args) {
    const r = origPush(...args);
    renderPathCrumbs();
    return r;
  };
  history.replaceState = function (...args) {
    const r = origReplace(...args);
    renderPathCrumbs();
    return r;
  };
  window.addEventListener("popstate", renderPathCrumbs);
}

async function boot() {
  injectImportmap();
  injectStyle(shellCss);
  // Mark mashlib mode up-front. Distinct from window.__hubMashlib (which
  // is the data-island context, may be null for 401 / 404 wrappers).
  window.__hubMashlibActive = true;
  // Capture the data island URL + body BEFORE buildShell wipes the DOM.
  window.__hubMashlib = captureMashlibContext();
  buildShell();
  installCrumbUpdater();
  // Register the resource app BEFORE app.js boots — app.js's hash router
  // looks up registered apps at module-init time, so we must be in the
  // registry first.
  const apps = await import("./apps.js");
  apps.register(buildResourceApp());
  const initialApp = pickInitialAppFromUrl();
  await loadXlogin();
  await import("./app.js");
  // app.js's onAuth listener fires immediately and calls
  // switchApp(state.app="home"). Re-assert the URL-derived app via a rail
  // click — hub's click handler runs switchApp properly, and (since we
  // patched switchApp to skip hash mutation in mashlib mode) the URL stays
  // as the real Solid resource URI without any #app suffix.
  if (initialApp && initialApp !== "home") {
    requestAnimationFrame(() => {
      document.querySelector(`.rail-item[data-app="${initialApp}"]`)?.click();
      // Run after switchApp so we overwrite hub's "hub-pod / Files" title
      renderPathCrumbs();
    });
  } else {
    requestAnimationFrame(renderPathCrumbs);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
