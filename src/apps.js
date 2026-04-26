/**
 * apps.js — registry for hub-pod apps (rail entries).
 *
 * Mirrors src/panes.js but for top-level apps. An app is an ES module
 * exposing:
 *   export const meta = { id, name, icon, hasSidebar? }
 *   export async function render(container, ctx)
 *   export function sidebar?(ctx) -> string  // optional, only when hasSidebar
 *
 * Built-in apps are registered statically by app.js. External apps
 * load by URL — their URLs are persisted in two places:
 *   - localStorage (hubpod-apps): boot cache, used for fast first paint
 *     and as the source of truth when the user is signed out.
 *   - The user's pod: a JSON-LD doc registered with forClass urn:solid:App
 *     in their TypeIndex. Canonical when signed in. Sync runs after auth
 *     resolves; user is prompted to reload if the pod list differs from
 *     the cache.
 */

import { getAppsList, saveAppsList } from "./pod.js";

const registry = [];

export function register(app) {
  if (!app || typeof app.render !== "function" || !app.meta?.id) {
    console.warn("apps.register: ignored — app must export render() and meta.id", app);
    return;
  }
  if (registry.some(a => a.meta.id === app.meta.id)) {
    console.warn("apps.register: ignored — duplicate id", app.meta.id);
    return;
  }
  registry.push(app);
}

export function list() {
  return registry.slice();
}

export function find(id) {
  return registry.find(a => a.meta?.id === id) || null;
}

// ---- External apps (localStorage-backed) ----

const EXTERNAL_KEY = "hubpod-apps";

function readExternalUrls() {
  try { return JSON.parse(localStorage.getItem(EXTERNAL_KEY) || "[]"); }
  catch { return []; }
}
function writeExternalUrls(urls) {
  localStorage.setItem(EXTERNAL_KEY, JSON.stringify(urls));
}

export function getExternalUrls() {
  return readExternalUrls();
}

/**
 * Remove an external app URL from the cache (and from the pod if a
 * webid is supplied). Caller should reload the rail to drop the entry.
 */
export async function removeExternal(url, webid = null) {
  const urls = readExternalUrls().filter(u => u !== url);
  writeExternalUrls(urls);
  if (webid) {
    try { await saveAppsList(webid, urls); }
    catch (e) { console.warn("removeExternal: pod write failed", e); }
  }
  const idx = registry.findIndex(a => a.meta?.__externalUrl === url);
  if (idx !== -1) registry.splice(idx, 1);
}

const loadCache = new Map();

/**
 * Import an ES module from a URL and register it as an app. Adds the
 * URL to the localStorage cache and (if a webid is supplied) writes
 * the updated list to the pod.
 */
export async function loadAndRegister(url, webid = null) {
  const app = await loadExternal(url);
  if (!app) throw new Error("App URL didn't expose render() + meta.id");
  const urls = readExternalUrls();
  if (!urls.includes(url)) {
    urls.push(url);
    writeExternalUrls(urls);
    if (webid) {
      try { await saveAppsList(webid, urls); }
      catch (e) { console.warn("loadAndRegister: pod write failed", e); }
    }
  }
  register(app);
  return app;
}

/**
 * After auth resolves, check the user's pod for the apps list. Returns
 * { source, items, changed } — `source` is "pod" | "local" | "none",
 * `items` is the URL list, `changed` is true if the pod list differs
 * from the localStorage cache (caller should prompt reload).
 *
 * Side effect: when source is "pod", localStorage is updated to match
 * so the next boot paints from pod state immediately.
 */
export async function syncFromPod(webid) {
  if (!webid) return { source: "local", items: readExternalUrls(), changed: false };
  let result;
  try { result = await getAppsList(webid); }
  catch { result = null; }
  if (!result) return { source: "none", items: readExternalUrls(), changed: false };
  const cache = readExternalUrls();
  const same = cache.length === result.items.length &&
               cache.every((u, i) => u === result.items[i]);
  if (!same) writeExternalUrls(result.items);
  return { source: "pod", items: result.items, changed: !same };
}

/**
 * Migrate the current localStorage list to the pod (writes the doc
 * and adds the TypeRegistration if missing). Idempotent.
 */
export async function syncToPod(webid) {
  if (!webid) throw new Error("Need a WebID to sync to pod");
  const urls = readExternalUrls();
  await saveAppsList(webid, urls);
  return urls;
}

/**
 * On boot: import every URL in the external list and register
 * what loads. Failures are logged but don't block other apps.
 */
export async function loadAllExternal() {
  const urls = readExternalUrls();
  for (const url of urls) {
    try {
      const app = await loadExternal(url);
      if (app) register(app);
    } catch (e) {
      console.warn("external app failed to load:", url, e);
    }
  }
}

async function loadExternal(url) {
  if (loadCache.has(url)) return loadCache.get(url);
  let app = null;
  try {
    const mod = await import(url);
    app = adapt(mod, url) || adapt(mod.default, url);
  } catch (e) {
    console.warn("external app import failed:", url, e);
  }
  loadCache.set(url, app);
  return app;
}

export function listExternal() {
  return [...loadCache.entries()].map(([url, app]) => ({
    url,
    loaded: !!app,
    meta: app ? { ...(app.meta || {}) } : null,
  }));
}

/**
 * Adapt a module exposing { meta, render, sidebar? } into the
 * registry shape. Returns null if it doesn't expose render() + meta.id.
 * Stamps __externalUrl onto meta so we can later identify which entry
 * came from which URL.
 */
function adapt(obj, url) {
  if (!obj || typeof obj.render !== "function") return null;
  const meta = { ...(obj.meta || {}), __externalUrl: url };
  if (!meta.id) return null;
  return { meta, render: obj.render, sidebar: obj.sidebar };
}
