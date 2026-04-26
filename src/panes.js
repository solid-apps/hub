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

import { getPaneDefaults, savePaneDefaults } from "./pod.js";

const registry = [];

// Per-class user preferences: { classIRI: paneId }. Persisted in two places:
//   - localStorage (boot cache, signed-out source of truth)
//   - The user's pod (canonical when signed in), as a urn:solid:PaneDefaults
//     registration in their TypeIndex.
// Pane id matches what `meta.id` returns from listRegistered() — could be a
// built-in id like "hub-pod/tracker" or a URL for externally loaded panes.
let classDefaults = {};
try { classDefaults = JSON.parse(localStorage.getItem("hubpod-pane-defaults") || "{}"); }
catch { classDefaults = {}; }

function writeCache() {
  localStorage.setItem("hubpod-pane-defaults", JSON.stringify(classDefaults));
}

export function getClassDefaults() { return { ...classDefaults }; }

/**
 * Set (or unset, if paneId is falsy) the default pane for a class.
 * If a webid is supplied, write through to the pod as well.
 */
export async function setClassDefault(classIRI, paneId, webid = null) {
  if (!classIRI) return;
  if (paneId) classDefaults[classIRI] = paneId;
  else delete classDefaults[classIRI];
  writeCache();
  if (webid) {
    try { await savePaneDefaults(webid, classDefaults); }
    catch (e) { console.warn("setClassDefault: pod write failed", e); }
  }
}

/**
 * Pull pane defaults from the pod and update the cache. Returns
 * { source, defaults, changed } — same shape as apps.syncFromPod.
 */
export async function syncDefaultsFromPod(webid) {
  if (!webid) return { source: "local", defaults: { ...classDefaults }, changed: false };
  let result;
  try { result = await getPaneDefaults(webid); }
  catch { result = null; }
  if (!result) return { source: "none", defaults: { ...classDefaults }, changed: false };
  const before = JSON.stringify(classDefaults);
  const after = JSON.stringify(result.defaults);
  if (before !== after) {
    classDefaults = { ...result.defaults };
    writeCache();
  }
  return { source: "pod", defaults: { ...classDefaults }, changed: before !== after };
}

/** Push the current localStorage map to the pod. */
export async function syncDefaultsToPod(webid) {
  if (!webid) throw new Error("Need a WebID to sync to pod");
  await savePaneDefaults(webid, classDefaults);
  return { ...classDefaults };
}

export function register(pane) {
  if (!pane || typeof pane.canHandle !== "function" || typeof pane.render !== "function") {
    console.warn("panes.register: ignored — pane must export canHandle + render", pane);
    return;
  }
  registry.push(pane);
}

export function findFor(input) {
  // 1. User pinned a specific pane for this class → honour it (if it
  //    exists in the registry and still claims canHandle).
  const pinnedId = input?.forClass && classDefaults[input.forClass];
  if (pinnedId) {
    const p = registry.find(x => x.meta?.id === pinnedId);
    if (p) {
      try { if (p.canHandle(input)) return p; }
      catch (e) { console.warn("pinned pane canHandle threw:", pinnedId, e); }
    }
  }
  // 2. Fallback: registration order, first match wins.
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

/** Read-only view of currently-cached external panes (loaded via urn:solid:view). */
export function listExternal() {
  return [...loadCache.entries()].map(([url, pane]) => ({
    url,
    loaded: !!pane,
    meta: pane ? { ...(pane.meta || {}) } : null,
  }));
}

/** Programmatically attempt to load + register an external pane URL. */
export async function loadAndRegister(url) {
  const pane = await loadExternal(url);
  if (!pane) throw new Error("Pane URL didn't expose canHandle + render");
  // Add to registry so findFor sees it without needing urn:solid:view
  registry.unshift(pane); // unshift so it wins over later-registered defaults
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
  // LOSOS panes export `label` (e.g. 'Tasks') instead of meta.name. Use it
  // as a fallback so the picker shows a friendly name, not "LOSOS pane (...)".
  const baseMeta = { id: idOrUrl, ...(obj.meta || {}) };
  if (!baseMeta.name && typeof obj.label === "string") baseMeta.name = obj.label;
  if (!losos) {
    return { meta: baseMeta, canHandle: obj.canHandle, render: obj.render };
  }
  return {
    meta: { ...baseMeta, name: baseMeta.name || `LOSOS pane (${idOrUrl})` },
    canHandle(input) {
      const subject = makeSubject(input);
      const store = makeStore(input);
      // 3rd arg (rawData) is a hub extension over SLIP-48's 2-arg canHandle —
      // collection-shape panes need it to match on `items` etc. Other panes
      // ignore the extra arg.
      try { return obj.canHandle(subject, store, input?.doc || null); } catch { return false; }
    },
    async render(input, container, ctx) {
      // Bridge SLIP-48 CustomEvents → hub's input.onChange / input.onDelete /
      // input.onOpen callbacks. Panes that emit pane:change / pane:delete /
      // pane:open on their container get their callbacks wired up automatically.
      const onChange = (e) => input?.onChange?.(e?.detail);
      const onDelete = (e) => input?.onDelete?.(e?.detail);
      const onOpen   = (e) => input?.onOpen?.(e?.detail?.url, e?.detail?.type);
      container.addEventListener("pane:change", onChange);
      container.addEventListener("pane:delete", onDelete);
      container.addEventListener("pane:open",   onOpen);
      const subject = makeSubject(input);
      const store = makeStore(input);
      // ctx is a hub extension over SLIP-48's 4-arg render — collection-shape
      // panes use ctx.resolvePane to recurse into child panes. Other panes
      // ignore the extra arg.
      return obj.render(subject, store, container, input?.doc || null, ctx);
    },
  };
}

/** Build an rdflib-shaped subject from hub's input. */
function makeSubject(input) {
  return { value: input?.url || null, termType: "NamedNode" };
}

/**
 * Build a minimal store that satisfies the two query patterns LOSOS panes
 * commonly use for type-detection: `store.type(subject)` and
 * `store.statementsMatching(subject, undefined, undefined)`. Hub passes
 * `forClass` from the TypeRegistration; the store reflects that as a
 * single rdf:type statement so pane canHandle code that expects either
 * surface works.
 */
const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
function makeStore(input) {
  const cls = input?.forClass || (typeof input?.doc?.["@type"] === "string" ? input.doc["@type"] : null);
  return {
    type: () => cls,
    get: () => null,
    statementsMatching(_subject, predicate, _object) {
      if (!cls) return [];
      if (predicate === undefined || predicate?.value === RDF_TYPE) {
        return [{
          subject:   { value: input?.url || null,  termType: "NamedNode" },
          predicate: { value: RDF_TYPE,            termType: "NamedNode" },
          object:    { value: cls,                 termType: "NamedNode" },
        }];
      }
      return [];
    },
  };
}
