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
 * load by URL — their URLs live in localStorage (key: hubpod-apps) and
 * are imported on boot. Registration is order-preserving (rail order
 * matches registration order).
 */

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

export function removeExternal(url) {
  const urls = readExternalUrls().filter(u => u !== url);
  writeExternalUrls(urls);
  // Remove from registry if loaded — rail re-renders on next boot or via callback.
  const idx = registry.findIndex(a => a.meta?.__externalUrl === url);
  if (idx !== -1) registry.splice(idx, 1);
}

const loadCache = new Map();

/**
 * Import an ES module from a URL and register it as an app. Adds the
 * URL to the persistent external list so it's loaded again on boot.
 */
export async function loadAndRegister(url) {
  const app = await loadExternal(url);
  if (!app) throw new Error("App URL didn't expose render() + meta.id");
  const urls = readExternalUrls();
  if (!urls.includes(url)) {
    urls.push(url);
    writeExternalUrls(urls);
  }
  register(app);
  return app;
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
