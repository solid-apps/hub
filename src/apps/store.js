/**
 * store.js — the user-facing app manager.
 *
 * Three sections:
 *   1. Add by URL — paste an ES module URL to install.
 *   2. Installed — cards for every registered app, with Remove on
 *      externals; built-ins are shown but greyed.
 *   3. Suggested — fetched from the curated directory (a JSON-LD
 *      schema:ItemList we ship at ./directory/index.json). Click an
 *      entry to install.
 *
 * Settings → Apps stays as the developer-facing surface (raw URLs,
 * pod sync state, push/pull). This is the everyday entrypoint.
 */

import { ICON, escape, $, $$, showToast } from "../ui.js";
import {
  list as listApps,
  loadAndRegister as loadAndRegisterApp,
  getExternalUrls as getAppUrls,
  removeExternal as removeExternalApp,
} from "../apps.js";
import {
  listRegistered as listPanes,
  loadAndRegister as loadAndRegisterPane,
  getExternalUrls as getPaneUrls,
  removeExternal as removeExternalPane,
} from "../panes.js";

export const meta = {
  id:         "store",
  name:       "Apps",
  icon:       ICON.apps,
  hasSidebar: false,
};

// Curated registry (apps + panes), served from solid-apps/registry on
// gh-pages. Submit entries via PR there. Hub's local ./directory/ stays
// as the home of the seed apps' source — the registry just points at them.
const DIRECTORY_URL = "https://solid-apps.github.io/registry/index.json";

// Hosts considered "trusted" — install without confirm. Mirrors Settings.
const TRUSTED_HOSTS = new Set(["solid-apps.github.io", "localhost", "127.0.0.1"]);
function confirmInstall(url) {
  let host;
  try { host = new URL(url).hostname; }
  catch { return confirm(`Install this URL?\n\n${url}\n\nApps get full DOM + xlogin access. Only install URLs you trust.`); }
  if (TRUSTED_HOSTS.has(host)) return true;
  return confirm(
    `Install app from ${host}?\n\n` +
    `Apps have full access to your DOM and to your pod (via xlogin.authFetch).\n` +
    `Only install URLs you trust.`
  );
}

export async function render(container, ctx) {
  injectStyles();
  container.innerHTML = `
    <div class="content"><div class="page-pad">
      <h1 style="margin:0 0 6px">Apps</h1>
      <p class="lede">Install, browse, and remove apps. Built-in apps ship with hub. External apps are ES modules loaded by URL on boot${ctx.auth.type === "solid" ? ' and persisted on your pod' : ''}.</p>

      <div class="store-section">
        <div class="store-section-head"><h2>Install by URL</h2></div>
        <div class="store-add">
          <select id="store-kind" title="App = rail-level UI · Pane = per-subject renderer">
            <option value="app">App</option>
            <option value="pane">Pane</option>
          </select>
          <input id="store-url" placeholder="https://example.org/my-app.js" />
          <button class="btn primary" id="store-install">Install</button>
        </div>
      </div>

      <div class="store-section">
        <div class="store-section-head">
          <h2>Installed</h2>
          <span id="store-count" class="store-meta"></span>
        </div>
        <div class="store-grid" id="store-installed"></div>
      </div>

      <div class="store-section">
        <div class="store-section-head">
          <h2>Suggested</h2>
          <span class="store-meta" id="store-directory-status">Loading directory…</span>
        </div>
        <div class="store-grid" id="store-suggested"></div>
      </div>
    </div></div>
  `;

  drawInstalled(ctx);

  $("#store-install").addEventListener("click", () => installFromInput(ctx));
  $("#store-url").addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); installFromInput(ctx); }
  });

  loadDirectory(ctx);
}

async function installFromInput(ctx) {
  const input = $("#store-url");
  const url = input.value.trim();
  if (!url) return;
  const kind = $("#store-kind")?.value || "app";
  await installUrl(url, ctx, kind);
  input.value = "";
}

async function installUrl(url, ctx, kind = "app") {
  if (!confirmInstall(url)) return;
  const installedApps = new Set(getAppUrls());
  const installedPanes = new Set(getPaneUrls());
  if (installedApps.has(url) || installedPanes.has(url)) {
    showToast("Already installed", "info");
    return;
  }
  showToast(kind === "pane" ? "Installing pane…" : "Installing app…");
  try {
    if (kind === "pane") {
      const pane = await loadAndRegisterPane(url);
      showToast(`Installed pane ${pane.meta?.name || pane.meta?.id || url}`, "success");
    } else {
      const webid = ctx.auth.type === "solid" ? ctx.auth.id : null;
      const app = await loadAndRegisterApp(url, webid);
      showToast(`Installed ${app.meta?.name || app.meta?.id || url} — reload to see it on the rail`, "success");
    }
    drawInstalled(ctx);
    drawSuggested(ctx);
  } catch (e) {
    showToast("Install failed: " + e.message, "error");
  }
}

const SHOW_BUILTIN_PANES_KEY = "hubpod-store-show-builtin-panes";

function drawInstalled(ctx) {
  const grid = $("#store-installed");
  const count = $("#store-count");
  if (!grid) return;
  const apps = listApps();
  const panes = listPanes();
  const externalAppUrls = new Set(getAppUrls());
  const externalPaneUrls = new Set(getPaneUrls());
  const externalAppCount = apps.filter(a => externalAppUrls.has(a.meta?.__externalUrl)).length;
  const externalPaneCount = panes.filter(p => externalPaneUrls.has(p.__externalUrl)).length;
  const builtInApps = apps.length - externalAppCount;
  const builtInPanes = panes.length - externalPaneCount;
  const showBuiltinPanes = localStorage.getItem(SHOW_BUILTIN_PANES_KEY) === "1";
  count.textContent = `${builtInApps} built-in apps · ${externalAppCount} external apps · ${builtInPanes} built-in panes · ${externalPaneCount} external panes`;

  // App cards first (always shown), then external panes, then built-in panes
  // collapsed behind a toggle (kept around for diagnostics — see Settings →
  // Panes for the dev-oriented surface).
  const appCards = apps.map(a => cardHTML({
    kind: "app",
    name: a.meta?.name || a.meta?.id,
    description: a.meta?.description,
    icon: a.meta?.icon,
    url: a.meta?.__externalUrl,
    isExternal: !!externalAppUrls.has(a.meta?.__externalUrl),
    isInstalled: true,
  }));
  const externalPaneCards = panes
    .filter(p => externalPaneUrls.has(p.__externalUrl))
    .map(p => paneCardHTML(p, true));
  const builtinPaneCards = panes
    .filter(p => !externalPaneUrls.has(p.__externalUrl))
    .map(p => paneCardHTML(p, false));

  grid.innerHTML = `
    ${appCards.concat(externalPaneCards).join("")}
    ${builtinPaneCards.length ? `
      <div class="store-builtin-toggle-row">
        <button class="store-builtin-toggle" id="store-toggle-builtin-panes">
          ${showBuiltinPanes ? "▾" : "▸"} ${showBuiltinPanes ? "Hide" : "Show"} ${builtinPaneCards.length} built-in pane${builtinPaneCards.length === 1 ? "" : "s"}
        </button>
      </div>
      <div class="store-builtin-panes" id="store-builtin-panes" style="${showBuiltinPanes ? "" : "display:none"}">
        ${builtinPaneCards.join("")}
      </div>
    ` : ""}
  `;

  $$("[data-remove-url]", grid).forEach(btn => btn.addEventListener("click", async () => {
    const url = btn.dataset.removeUrl;
    const kind = btn.dataset.removeKind;
    if (!confirm(`Remove this ${kind}?\n\n${url}\n\nIt'll be gone after reload.`)) return;
    try {
      if (kind === "pane") {
        removeExternalPane(url);
      } else {
        const webid = ctx.auth.type === "solid" ? ctx.auth.id : null;
        await removeExternalApp(url, webid);
      }
    } catch (e) { showToast("Remove failed: " + e.message, "error"); }
    drawInstalled(ctx);
    drawSuggested(ctx);
    showToast("Removed — reload to apply", "info");
  }));

  $("#store-toggle-builtin-panes")?.addEventListener("click", () => {
    const next = !(localStorage.getItem(SHOW_BUILTIN_PANES_KEY) === "1");
    localStorage.setItem(SHOW_BUILTIN_PANES_KEY, next ? "1" : "0");
    drawInstalled(ctx);
  });
}

function paneCardHTML(p, isExternal) {
  return cardHTML({
    kind: "pane",
    name: p.name || p.id,
    description: p.forClass
      ? `Pane for ${p.forClass}`
      : (Array.isArray(p.forClasses) ? `Pane for ${p.forClasses.join(", ")}` : "Pane"),
    icon: "🧩",
    url: p.__externalUrl,
    isExternal,
    isInstalled: true,
  });
}

let directoryItems = null;

async function loadDirectory(ctx) {
  const status = $("#store-directory-status");
  try {
    const r = await fetch(DIRECTORY_URL, { headers: { Accept: "application/ld+json, application/json" } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const doc = await r.json();
    const elements = doc["schema:itemListElement"] ?? doc["itemListElement"] ?? [];
    const arr = Array.isArray(elements) ? elements : [elements];
    directoryItems = arr.map(e => ({
      url: e["@id"] || e["schema:identifier"],
      name: e["schema:name"] || e["name"],
      description: e["schema:description"] || e["description"],
      icon: e["schema:icon"] || e["icon"],
      author: e["schema:author"] || e["author"],
      // urn:Pane vs urn:App vs anything else — default to "app" so an
      // entry without an @type still installs sensibly.
      kind: e["@type"] === "urn:Pane" ? "pane" : "app",
    })).filter(x => x.url);
    if (status) status.textContent = `${directoryItems.length} curated · ${escape(new URL(DIRECTORY_URL).hostname)}`;
  } catch (e) {
    if (status) status.innerHTML = `<span style="color:var(--danger)">Couldn't load directory: ${escape(e.message)}</span>`;
    directoryItems = [];
  }
  drawSuggested(ctx);
}

function drawSuggested(ctx) {
  const grid = $("#store-suggested");
  if (!grid || !directoryItems) return;
  if (!directoryItems.length) {
    grid.innerHTML = `<div class="store-empty">Directory is empty.</div>`;
    return;
  }
  const installedApps = new Set(getAppUrls());
  const installedPanes = new Set(getPaneUrls());
  grid.innerHTML = directoryItems.map(it => cardHTML({
    kind: it.kind,
    name: it.name,
    description: it.description,
    icon: it.icon,
    url: it.url,
    author: it.author,
    isExternal: true,
    isInstalled: it.kind === "pane" ? installedPanes.has(it.url) : installedApps.has(it.url),
  })).join("");
  $$("[data-install-url]", grid).forEach(btn => btn.addEventListener("click", () => {
    installUrl(btn.dataset.installUrl, ctx, btn.dataset.installKind || "app");
  }));
}

function cardHTML(o) {
  const kind = o.kind || "app";
  const kindBadge = kind === "pane"
    ? `<span class="store-kind-pane" title="Per-subject renderer (SLIP-48)">Pane</span>`
    : `<span class="store-kind-app" title="Rail-level UI">App</span>`;
  const action = o.isInstalled
    ? (o.isExternal && o.url
        ? `<button class="btn danger" data-remove-url="${escape(o.url)}" data-remove-kind="${kind}" style="font-size:12px">Remove</button>`
        : `<span class="store-pill">Built-in</span>`)
    : `<button class="btn primary" data-install-url="${escape(o.url)}" data-install-kind="${kind}" style="font-size:12px">Install</button>`;
  return `
    <div class="store-card">
      <div class="store-card-icon">${o.icon || "📦"}</div>
      <div class="store-card-body">
        <div class="store-card-name">${escape(o.name || "(unnamed)")} ${kindBadge}</div>
        ${o.description ? `<div class="store-card-desc">${escape(o.description)}</div>` : ""}
        ${o.author ? `<div class="store-card-author">by ${escape(o.author)}</div>` : ""}
        ${o.url ? `<div class="store-card-url" title="${escape(o.url)}">${escape(o.url)}</div>` : ""}
      </div>
      <div class="store-card-action">${action}</div>
    </div>
  `;
}

function injectStyles() {
  if (document.getElementById("store-app-css")) return;
  const s = document.createElement("style");
  s.id = "store-app-css";
  s.textContent = `
.store-section { margin-top: 28px; }
.store-section-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 12px; }
.store-section-head h2 { margin: 0; font-size: 16px; font-weight: 600; }
.store-meta { font-family: var(--mono); font-size: 12px; color: var(--text-faint); }
.store-add { display: flex; gap: 8px; align-items: stretch; }
.store-add select { background: var(--bg-elev); border: 1px solid var(--line); border-radius: 9px; padding: 0 12px; font: inherit; font-size: 13px; color: var(--text); outline: none; }
.store-add input { flex: 1; background: var(--bg-elev); border: 1px solid var(--line); border-radius: 9px; padding: 9px 12px; font-family: var(--mono); font-size: 13px; color: var(--text); outline: none; transition: border-color .12s, box-shadow .12s; }
.store-add input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); }
.store-kind-app, .store-kind-pane { display: inline-block; padding: 1px 6px; border-radius: 4px; font: 500 10px var(--mono); margin-left: 4px; vertical-align: middle; }
.store-kind-app  { background: var(--accent-soft); color: var(--accent); }
.store-kind-pane { background: rgba(99,102,241,0.12); color: rgb(79,70,229); }
.store-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.store-empty { color: var(--text-faint); font-size: 13px; padding: 24px; text-align: center; }

.store-card { display: flex; gap: 12px; padding: 14px; background: var(--bg-elev); border: 1px solid var(--line); border-radius: 12px; transition: border-color .12s, transform .12s, box-shadow .12s; }
.store-card:hover { border-color: var(--accent); transform: translateY(-1px); box-shadow: var(--shadow); }
.store-card-icon { width: 40px; height: 40px; display: grid; place-items: center; background: var(--bg-elev-2); border-radius: 8px; font-size: 22px; flex-shrink: 0; }
.store-card-icon svg { width: 20px; height: 20px; color: var(--text); }
.store-card-body { flex: 1; min-width: 0; }
.store-card-name { font-weight: 600; font-size: 14px; }
.store-card-desc { font-size: 12px; color: var(--text-dim); margin-top: 2px; line-height: 1.4; }
.store-card-author { font-size: 11px; color: var(--text-faint); margin-top: 4px; font-family: var(--mono); }
.store-card-url { font-size: 11px; color: var(--text-faint); margin-top: 4px; font-family: var(--mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.store-card-action { display: flex; align-items: flex-start; flex-shrink: 0; }
.store-pill { display: inline-block; padding: 3px 8px; background: var(--bg-elev-2); border: 1px solid var(--line); border-radius: 6px; font-size: 11px; color: var(--text-faint); font-family: var(--mono); }
.store-builtin-toggle-row { grid-column: 1 / -1; padding: 4px 0; }
.store-builtin-toggle { background: transparent; border: none; color: var(--text-dim); cursor: pointer; font: 12px var(--mono); padding: 6px 10px; border-radius: 6px; transition: background .12s, color .12s; }
.store-builtin-toggle:hover { background: var(--bg-elev-2); color: var(--text); }
.store-builtin-panes { display: contents; }
`;
  document.head.appendChild(s);
}
