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
  await installUrl(url, ctx);
  input.value = "";
}

async function installUrl(url, ctx) {
  if (!confirmInstall(url)) return;
  const installed = new Set(getAppUrls());
  if (installed.has(url)) {
    showToast("Already installed", "info");
    return;
  }
  showToast("Installing…");
  try {
    const webid = ctx.auth.type === "solid" ? ctx.auth.id : null;
    const app = await loadAndRegisterApp(url, webid);
    showToast(`Installed ${app.meta?.name || app.meta?.id || url} — reload to see it on the rail`, "success");
    drawInstalled(ctx);
    drawSuggested(ctx); // refresh "already installed" badges
  } catch (e) {
    showToast("Install failed: " + e.message, "error");
  }
}

function drawInstalled(ctx) {
  const grid = $("#store-installed");
  const count = $("#store-count");
  if (!grid) return;
  const apps = listApps();
  const externalUrls = new Set(getAppUrls());
  const externalCount = apps.filter(a => externalUrls.has(a.meta?.__externalUrl)).length;
  count.textContent = externalCount === 0
    ? `${apps.length} built-in · 0 external`
    : `${apps.length - externalCount} built-in · ${externalCount} external`;

  grid.innerHTML = apps.map(a => cardHTML({
    name: a.meta?.name || a.meta?.id,
    description: a.meta?.description,
    icon: a.meta?.icon,
    url: a.meta?.__externalUrl,
    isExternal: !!externalUrls.has(a.meta?.__externalUrl),
    isInstalled: true,
  })).join("");

  $$("[data-remove-url]", grid).forEach(btn => btn.addEventListener("click", async () => {
    const url = btn.dataset.removeUrl;
    if (!confirm(`Remove this app?\n\n${url}\n\nIt'll disappear from the rail on next reload.`)) return;
    const webid = ctx.auth.type === "solid" ? ctx.auth.id : null;
    try { await removeExternalApp(url, webid); }
    catch (e) { showToast("Remove from pod failed: " + e.message, "error"); }
    drawInstalled(ctx);
    drawSuggested(ctx);
    showToast("Removed — reload to update the rail", "info");
  }));
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
  const installed = new Set(getAppUrls());
  grid.innerHTML = directoryItems.map(it => cardHTML({
    name: it.name,
    description: it.description,
    icon: it.icon,
    url: it.url,
    author: it.author,
    isExternal: true,
    isInstalled: installed.has(it.url),
  })).join("");
  $$("[data-install-url]", grid).forEach(btn => btn.addEventListener("click", () => {
    installUrl(btn.dataset.installUrl, ctx);
  }));
}

function cardHTML(o) {
  const action = o.isInstalled
    ? (o.isExternal && o.url
        ? `<button class="btn danger" data-remove-url="${escape(o.url)}" style="font-size:12px">Remove</button>`
        : `<span class="store-pill">Built-in</span>`)
    : `<button class="btn primary" data-install-url="${escape(o.url)}" style="font-size:12px">Install</button>`;
  return `
    <div class="store-card">
      <div class="store-card-icon">${o.icon || "📦"}</div>
      <div class="store-card-body">
        <div class="store-card-name">${escape(o.name || "(unnamed)")}</div>
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
.store-add { display: flex; gap: 8px; }
.store-add input { flex: 1; background: var(--bg-elev); border: 1px solid var(--line); border-radius: 9px; padding: 9px 12px; font-family: var(--mono); font-size: 13px; color: var(--text); outline: none; transition: border-color .12s, box-shadow .12s; }
.store-add input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); }
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
`;
  document.head.appendChild(s);
}
