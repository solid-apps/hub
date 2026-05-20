/**
 * nav.js — resource-hint + navigation helpers shared by mashlib and standalone.
 *
 * Hub has two URL contracts:
 *
 *   Mashlib (JSS --mashlib-module):
 *     URL path IS the Solid resource being viewed.
 *     window.__hubMashlibActive === true.
 *     Hint comes from JSS's data island.
 *
 *   Standalone (e.g. solid-apps.github.io/hub/):
 *     URL is hub's own origin; the viewed resource (if any) sits in ?uri=.
 *     window.__hubMashlibActive is undefined.
 *     Hint comes from the query string.
 *
 * Both modes converge on `window.__hubMashlib = { uri, data }` so downstream
 * code (Files, Resource app, breadcrumb) doesn't care which mode it's in.
 */

// Read the resource hint from either source. Called once at boot by the
// active entry point (mashlib.js or app.js).
export function readResourceHint() {
  // Mashlib mode: JSS injects a data island. We may have already captured it.
  if (window.__hubMashlibActive) {
    const el = document.getElementById("dataisland");
    if (el) {
      const uri = el.getAttribute("data-uri");
      let data = null;
      try { data = JSON.parse(el.textContent || "null"); } catch {}
      if (uri) return { uri, data, source: "mashlib" };
    }
  }
  // Standalone: ?uri=<resource>
  try {
    const q = new URL(location.href).searchParams.get("uri");
    if (q) return { uri: q, data: null, source: "query" };
  } catch {}
  return null;
}

// Navigate to a Solid resource. In mashlib mode, just set location.href so
// JSS re-wraps with the new URL. In standalone mode, keep the hub origin
// and put the resource in ?uri=.
export function gotoResource(url) {
  if (!url) return;
  if (window.__hubMashlibActive) {
    window.location.href = url;
  } else {
    const u = new URL(window.location.href);
    u.search = "?uri=" + encodeURIComponent(url);
    u.hash = "";
    window.location.href = u.toString();
  }
}

// Push a new resource URL onto the history without a full reload. Used by
// in-app navigation (Files browsing into a subcontainer, breadcrumb clicks
// inside a single hub instance, etc.). The address bar reflects the new
// resource URL via the appropriate contract for the current mode.
export function pushResourceUrl(url) {
  if (!url) return;
  if (window.__hubMashlibActive) {
    if (url !== location.href) {
      try { history.pushState(null, "", url); } catch {}
    }
  } else {
    const u = new URL(window.location.href);
    u.search = "?uri=" + encodeURIComponent(url);
    u.hash = "";
    if (u.toString() !== location.href) {
      try { history.pushState(null, "", u.toString()); } catch {}
    }
  }
}

// Derive the breadcrumb root URL — the resource the topbar is showing
// breadcrumbs for. Mashlib: window.location.href is the resource URL.
// Standalone: read from ?uri= (with the hub origin stripped for display).
export function breadcrumbRootUrl() {
  if (window.__hubMashlibActive) return location.href;
  const m = window.__hubMashlib;
  return m?.uri || null;
}

// Given a resource hint, decide which hub app should render it.
//   - container URL (trailing slash) → Files
//   - profile-shaped path             → Profile
//   - any other resource              → Resource (type-aware pane dispatch)
export function pickAppForHint(hint) {
  if (!hint?.uri) return null;
  let path;
  try { path = new URL(hint.uri).pathname; } catch { return null; }
  if (path.endsWith("/")) return "files";
  if (/\/profile/.test(path)) return "profile";
  return "resource";
}

// Synthetic "resource" app — reads the data island's @type (or a fetched
// JSON-LD doc) and dispatches to the matching pane via hub's pane registry.
// Registered in both modes (mashlib boot + standalone boot) so type-aware
// rendering works whether the resource came from a URL path or ?uri=.
export function buildResourceApp() {
  return {
    meta: { id: "resource", name: "Resource", icon: "📄", hasSidebar: false },
    async render(container, ctx) {
      const m = window.__hubMashlib;
      if (!m?.uri) {
        container.innerHTML = `<div class="content"><div class="page-pad"><h1>No resource loaded</h1><p class="lede">Open a JSON-LD resource URL to render it by @type.</p></div></div>`;
        return;
      }
      let doc = m.data;
      if (!doc) {
        // Standalone mode: no data island, fetch the resource.
        try {
          const r = await (ctx?.fetch || fetch)(m.uri, { headers: { Accept: "application/ld+json" } });
          if (r.ok) doc = await r.json();
        } catch (e) { /* fall through to no-data path */ }
      }
      if (!doc) {
        container.innerHTML = `<div class="content"><div class="page-pad"><h1>Couldn't load ${escapeHtml(m.uri)}</h1><p class="lede" style="color:var(--danger)">Fetch failed — the resource may require auth or be unreachable.</p></div></div>`;
        return;
      }
      const node = (doc["@graph"] && (Array.isArray(doc["@graph"]) ? doc["@graph"][0] : doc["@graph"])) || doc;
      const t = node?.["@type"];
      const forClass = Array.isArray(t) ? t[0] : t;
      let expanded = forClass;
      if (typeof expanded === "string" && expanded.startsWith("schema:")) {
        expanded = "https://schema.org/" + expanded.slice(7);
      }
      const input = { url: m.uri, doc, forClass: expanded };
      let pane = null;
      if (typeof ctx.resolvePane === "function") {
        try { pane = await ctx.resolvePane(input); } catch (e) { console.warn("resolvePane threw:", e); }
      }
      if (!pane && typeof ctx.findPane === "function") {
        try { pane = ctx.findPane(input); } catch (e) { console.warn("findPane threw:", e); }
      }
      if (!pane) {
        container.innerHTML = `<div class="content"><div class="page-pad">
          <h1>${escapeHtml(forClass || "Resource")}</h1>
          <p class="lede">No pane registered for this @type. Raw JSON-LD:</p>
          <pre style="background:#f5f5f5;padding:12px;border-radius:6px;font-size:12px;overflow:auto;white-space:pre-wrap;word-break:break-word">${escapeHtml(JSON.stringify(node, null, 2))}</pre>
        </div></div>`;
        return;
      }
      try {
        await Promise.resolve(pane.render(input, container, ctx));
      } catch (e) {
        container.innerHTML = `<div class="content"><div class="page-pad">Pane render failed: ${escapeHtml(e.message)}</div></div>`;
      }
    }
  };
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
}

// URL-driven breadcrumb in the topbar. Each segment clickable, routing
// through gotoResource so mashlib (URL path) and standalone (?uri=) both
// work. Called from both entry points when a resource hint is present.
export function renderPathCrumbs() {
  const el = document.getElementById("topbar-title");
  if (!el) return;
  const rootUrl = breadcrumbRootUrl();
  if (!rootUrl) { return; }  // no hint — let hub's normal title rendering own it
  let u;
  try { u = new URL(rootUrl); } catch { return; }
  const segments = u.pathname.split("/").filter(Boolean);
  const isResource = !u.pathname.endsWith("/");
  let acc = u.origin + "/";
  let html = `<a class="crumb" href="#" data-go="${acc}" title="${escapeHtml(u.host)}">${escapeHtml(u.host)}</a>`;
  segments.forEach((seg, i) => {
    const isLast = i === segments.length - 1;
    acc += seg + (isLast && isResource ? "" : "/");
    if (isLast && isResource) {
      html += ` <span class="sep">/</span> <span class="crumb cur">${escapeHtml(decodeURIComponent(seg))}</span>`;
    } else {
      html += ` <span class="sep">/</span> <a class="crumb" href="#" data-go="${acc}">${escapeHtml(decodeURIComponent(seg))}</a>`;
    }
  });
  el.innerHTML = html;
  el.querySelectorAll("[data-go]").forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      gotoResource(a.dataset.go);
    });
  });
}

// Patch history pushState/replaceState so any URL change refreshes the
// breadcrumb. Idempotent — only patches once per page load.
let crumbUpdaterInstalled = false;
export function installCrumbUpdater() {
  if (crumbUpdaterInstalled) return;
  crumbUpdaterInstalled = true;
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
