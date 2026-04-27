/**
 * container.js — pane for ldp:Container subjects.
 *
 * Fetches the container's listing and renders each member as a tile
 * by handing the items to CollectionPane (which calls back into the
 * host's resolver — FileTilePane wins because items are passed with
 * `view: "tile"`).
 *
 * Tile/grid context disambiguation: ContainerPane and FileTilePane
 * both claim `ldp:Container` subjects, but their canHandle filters
 * on the `view` hint:
 *
 *   - view: "tile" → FileTilePane (one folder card in a parent listing)
 *   - no view hint → ContainerPane (the container itself, navigable view)
 *
 * Hosts that point hub at any LDP container URL — including pods
 * other than the current user's — get a navigable folder view for
 * free. The Files app shrinks to a breadcrumb wrapper.
 */

import { listContainer } from "../pod.js";
import { findFor } from "../panes.js";
import { ICON, escape } from "../ui.js";

export const label = "Container";
export const icon  = "📂";
export const meta = {
  id: "hub-pod/container",
  name: "LDP container (folder view)",
};

const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const LDP_CONTAINER = "http://www.w3.org/ns/ldp#Container";

export function canHandle(subject, store, rawData) {
  if (subject?.termType && subject.termType !== "NamedNode") return false;
  if (!subject?.value || !store?.statementsMatching) return false;
  // FileTilePane handles the tile (in-grid) case via the same forClass.
  // We only want the full-container case.
  if (rawData?.view === "tile") return false;
  const stmts = store.statementsMatching(subject, undefined, undefined);
  return stmts.some(s =>
    s.predicate?.value === RDF_TYPE && s.object?.value === LDP_CONTAINER
  );
}

export async function render(subject, _store, container, _rawData, ctx) {
  const url = subject?.value;
  injectStyles();
  container.innerHTML = `<div class="container-pane-spinner"><div class="spinner"></div></div>`;

  let items;
  try {
    items = await listContainer(url);
  } catch (e) {
    container.innerHTML = `<div class="container-pane-empty">
      <div class="container-pane-empty-title" style="color:var(--danger)">Couldn't list this container</div>
      <div class="container-pane-empty-body">${escape(e.message)}</div>
      <div class="container-pane-empty-body" style="margin-top:6px;font-family:var(--mono);font-size:11px">${escape(url)}</div>
    </div>`;
    return;
  }

  if (!items.length) {
    container.innerHTML = `<div class="container-pane-empty">
      <div class="container-pane-empty-title">Empty container</div>
      <div class="container-pane-empty-body" style="font-family:var(--mono);font-size:11px">${escape(url)}</div>
    </div>`;
    return;
  }

  // Stamp each item with view:"tile" so FileTilePane wins when the
  // CollectionPane resolves a per-item pane via ctx.resolvePane.
  const collItems = items.map(it => ({
    url: it.url,
    doc: { type: it.type, view: "tile" },
    forClass: it.type === "container"
      ? "http://www.w3.org/ns/ldp#Container"
      : "http://www.w3.org/ns/ldp#Resource",
  }));
  const collInput = { doc: { items: collItems, layout: "grid" } };
  const coll = findFor(collInput);
  if (!coll) {
    container.innerHTML = `<div class="container-pane-empty">
      <div class="container-pane-empty-title" style="color:var(--danger)">No CollectionPane registered</div>
    </div>`;
    return;
  }
  container.innerHTML = "";
  await coll.render(collInput, container, ctx);
}

function injectStyles() {
  if (document.getElementById("container-pane-css")) return;
  const s = document.createElement("style");
  s.id = "container-pane-css";
  s.textContent = `
.container-pane-spinner { display: grid; place-items: center; padding: 60px 0; }
.container-pane-empty { padding: 32px 24px; text-align: center; color: var(--text-faint); }
.container-pane-empty-title { font-size: 15px; color: var(--text); margin-bottom: 4px; }
.container-pane-empty-body { font-size: 13px; }
`;
  document.head.appendChild(s);
}

export default { label, icon, canHandle, render };
