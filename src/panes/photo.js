/**
 * photo.js — pane for one image (photo tile).
 *
 * subject: rdflib NamedNode whose value is the image URL.
 * rawData (optional): { title?, alt? } — display metadata.
 *
 * Renders the standard hub-pod .photo tile with hover overlay; click
 * opens the image in a new tab.
 */

import { escape } from "../ui.js";

export const label = "Photo";
export const icon  = "🖼";
export const meta = { id: "hub-pod/photo", name: "Photo tile" };

export function canHandle(subject, store) {
  if (subject?.termType && subject.termType !== "NamedNode") return false;
  const v = subject?.value;
  if (!v || !/\.(png|jpe?g|gif|webp|svg|avif)(\?|$)/i.test(v)) return false;
  // Defer to FilePane when the context already labels this as an LDP file/folder.
  const stmts = store?.statementsMatching?.(subject, undefined, undefined) || [];
  const isLdp = stmts.some(s =>
    s.predicate?.value === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" &&
    typeof s.object?.value === "string" && s.object.value.startsWith("http://www.w3.org/ns/ldp#"));
  return !isLdp;
}

export async function render(subject, _store, container, rawData) {
  const src = subject?.value;
  const title = rawData?.title;
  const alt = rawData?.alt;
  container.className = "photo";
  container.dataset.src = src;
  container.innerHTML = `
    <img src="${escape(src)}" loading="lazy" alt="${escape(alt || title || "")}" />
    ${title ? `<div class="fade">${escape(title)}</div>` : ""}
  `;
  container.addEventListener("click", () => window.open(src, "_blank"));
}

export default { label, icon, canHandle, render };
