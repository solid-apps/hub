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
