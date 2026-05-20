/**
 * file.js — pane for an LDP container/resource entry, rendered as a
 * file-card tile. Used by the Files app (and anywhere a directory
 * listing is shown).
 *
 * subject: rdflib NamedNode whose value is the resource URL.
 * rawData: { type: "container" | "resource" }
 *
 * Click on a container fires a `pane:open` CustomEvent — Files uses
 * it to navigate. Click on a resource opens the URL in a new tab.
 */

import { ICON, escape } from "../ui.js";

export const label = "File";
export const icon  = "📁";
export const meta = { id: "hub-pod/file", name: "File / folder card" };

const LDP_CONTAINER = "http://www.w3.org/ns/ldp#Container";
const LDP_RESOURCE  = "http://www.w3.org/ns/ldp#Resource";

export function canHandle(subject, store, rawData) {
  if (subject?.termType && subject.termType !== "NamedNode") return false;
  if (!subject?.value || !store?.statementsMatching) return false;
  // Tile/grid context only — view:"tile" is set by parent panes
  // (CollectionPane via ContainerPane) when they want a card per item.
  // Without the hint, ContainerPane handles ldp:Container subjects in
  // their full navigable form.
  if (rawData?.view !== "tile") return false;
  const stmts = store.statementsMatching(subject, undefined, undefined);
  return stmts.some(s => {
    if (s.predicate?.value !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") return false;
    return s.object?.value === LDP_CONTAINER || s.object?.value === LDP_RESOURCE;
  });
}

export async function render(subject, _store, container, rawData) {
  const url = subject?.value;
  const type = rawData?.type;
  const isDir = type === "container";
  const name = decodeURIComponent(url.replace(/\/$/, "").split("/").pop() || url);
  const cls = isDir ? "dir" : extClass(name);
  const ico = isDir ? ICON.files : extIcon(name);

  container.className = `file-card ${cls}`;
  container.dataset.url = url;
  container.title = url;
  container.innerHTML = `
    <div class="fi">${ico}</div>
    <div class="fn">${escape(name)}</div>
    <div class="fs">${isDir ? "folder" : ""}</div>
  `;
  container.addEventListener("click", () => {
    if (isDir) {
      // bubbles:true so Files's grid-level pane:open handler can catch and navigate.
      container.dispatchEvent(new CustomEvent("pane:open", { detail: { url, type }, bubbles: true }));
    } else {
      // Same-tab nav so JSS's mashlib wrapper takes over for the new URL —
      // hub-mashlib re-bootstraps and the Resource app dispatches to the
      // type-matching pane.
      window.location.href = url;
    }
  });
}

function extClass(name) {
  if (/\.(png|jpe?g|gif|webp|svg|avif)$/i.test(name)) return "img";
  if (/\.(mp3|ogg|wav|flac)$/i.test(name)) return "audio";
  if (/\.(jsonld|json|js|css|ttl|n3|xml|html?)$/i.test(name)) return "code";
  if (/\.(md|txt)$/i.test(name)) return "doc";
  return "other";
}
function extIcon(name) {
  const c = extClass(name);
  if (c === "img") return ICON.img;
  if (c === "code") return ICON.code;
  return ICON.doc;
}

export default { label, icon, canHandle, render };
