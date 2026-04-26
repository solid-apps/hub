/**
 * panes.js — minimal LOSOS-style pane registry.
 *
 * A pane is a module that renders one JSON-LD subject. Apps in hub-pod
 * discover subjects (via TypeIndex etc.) and delegate per-subject
 * rendering to whichever pane reports it can handle it.
 *
 * Pane interface
 * --------------
 *   export const meta = { id, name, forClass }   // optional, for debugging
 *   export function canHandle(input): boolean    // input shape below
 *   export async function render(input, container, ctx): void
 *
 * `input` is at least { url, doc, forClass } — apps may add more.
 *   - url:      the resource URL of the subject (with any fragment)
 *   - doc:      the parsed JSON-LD body (the document, not necessarily the subject node)
 *   - forClass: the IRI hub knew about when discovering this subject
 *               (often from the TypeRegistration's solid:forClass).
 *
 * Panes write into the supplied container element. They MAY persist
 * edits via xlogin.authFetch (use putJsonLd from pod.js).
 *
 * This is a deliberately small surface so vanilla panes drop in cleanly
 * and external Preact panes (like pilot/tracker-pane.js) can be wrapped
 * later if we want them.
 */

const registry = [];

export function register(pane) {
  if (!pane || typeof pane.canHandle !== "function" || typeof pane.render !== "function") {
    console.warn("panes.register: ignored — pane must export canHandle + render", pane);
    return;
  }
  registry.push(pane);
}

export function findFor(input) {
  for (const p of registry) {
    try { if (p.canHandle(input)) return p; }
    catch (e) { console.warn("pane.canHandle threw:", p.meta?.id, e); }
  }
  return null;
}

export function listRegistered() {
  return registry.map(p => ({ ...(p.meta || {}) }));
}

/**
 * Async pane resolver. Honours `input.view` first (the urn:solid:view
 * predicate from a TypeRegistration → ES module URL), then falls
 * through to the local registry.
 *
 * External modules are loaded once and cached. The loader accepts both
 * shapes:
 *   - hub-style:  { canHandle(input), render(input, container, ctx) }
 *   - LOSOS-style:{ canHandle(subject, store), render(subject, store, container, rawData) }
 *     (also accepted via `default` export — pilot/tracker-pane.js exports
 *     its LOSOS interface as `default`.)
 *
 * LOSOS-style exports are wrapped so the surrounding app code stays
 * unchanged: every pane the app sees is hub-shaped.
 */
export async function resolveFor(input) {
  if (input?.view) {
    const ext = await loadExternal(input.view);
    if (ext) {
      try { if (ext.canHandle(input)) return ext; }
      catch (e) { console.warn("external pane canHandle threw:", input.view, e); }
    }
  }
  return findFor(input);
}

const loadCache = new Map();
async function loadExternal(url) {
  if (loadCache.has(url)) return loadCache.get(url);
  let pane = null;
  try {
    const mod = await import(url);
    pane = adapt(mod, url) || adapt(mod.default, url);
  } catch (e) {
    console.warn("external pane import failed:", url, e);
  }
  loadCache.set(url, pane);
  return pane;
}

/**
 * Adapt a pane module to hub-pod's pane interface.
 *
 * Hub-style modules (canHandle(input), render(input, container, ctx))
 * pass through unchanged. LOSOS-style modules (canHandle(subject, store)
 * and render(subject, store, container, rawData)) are detected by
 * signature arity and wrapped so the registry sees a hub-shaped pane.
 *
 * Returns null if `obj` doesn't expose canHandle + render at all.
 *
 * Exported so apps can register statically-imported LOSOS modules
 * (e.g. the vendored tracker pane) by adapting at register time.
 */
export function adapt(obj, idOrUrl) {
  if (!obj || typeof obj.canHandle !== "function" || typeof obj.render !== "function") return null;
  const losos = obj.render.length >= 4 || obj.canHandle.length >= 2;
  const baseMeta = { id: idOrUrl, ...(obj.meta || {}) };
  if (!losos) {
    return { meta: baseMeta, canHandle: obj.canHandle, render: obj.render };
  }
  return {
    meta: { ...baseMeta, name: baseMeta.name || `LOSOS pane (${idOrUrl})` },
    canHandle(input) {
      const subject = { value: input?.url };
      const store = {
        type: () => input?.forClass || input?.doc?.["@type"] || null,
        get: () => null,
      };
      try { return obj.canHandle(subject, store); } catch { return false; }
    },
    async render(input, container, _ctx) {
      const subject = { value: input?.url };
      return obj.render(subject, null, container, input?.doc || null);
    },
  };
}
