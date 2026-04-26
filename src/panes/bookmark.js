/**
 * bookmark.js — pane for SolidOS-style bookmark:Bookmark.
 *
 * Shape (any of these key forms):
 *   { "@type": "bookmark:Bookmark",
 *     "dc:title": "Solid spec",
 *     "bookmark:recalls": { "@id": "https://solidproject.org" },
 *     "dc:description": "..." }
 *
 * Renders the bookmark as a card with editable title + description,
 * a link-out chip for the recalled URL, and a delete button. Saves
 * on edit (debounced PUT). SLIP-48 / LOSOS shape.
 */

import { putJsonLd, deleteResource, BOOKMARK_CLASSES, valueOf } from "../pod.js";
import { ICON, escape, fmtRel, debounce, showToast } from "../ui.js";

const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const BOOKMARK_NS = "http://www.w3.org/2002/01/bookmark#";
const DC_NS = "http://purl.org/dc/elements/1.1/";
const DCTERMS_NS = "http://purl.org/dc/terms/";

export const label = "Bookmark";
export const icon  = "🔖";
export const meta = {
  id: "hub-pod/bookmark",
  name: "Bookmark",
  forClasses: BOOKMARK_CLASSES,
};

export function canHandle(subject, store) {
  if (subject?.termType && subject.termType !== "NamedNode") return false;
  if (!store?.statementsMatching) return false;
  const stmts = store.statementsMatching(subject, undefined, undefined);
  return stmts.some(s => {
    if (s.predicate?.value !== RDF_TYPE) return false;
    const v = s.object?.value;
    return BOOKMARK_CLASSES.includes(v) ||
           v === "Bookmark" || v === "bookmark:Bookmark" ||
           (typeof v === "string" && /[#/]Bookmark$/.test(v));
  });
}

// Read a property by any of its common key forms.
function rd(obj, ...keys) {
  if (!obj) return undefined;
  for (const k of keys) if (obj[k] !== undefined) return obj[k];
  return undefined;
}

const TITLE_KEYS = ["dc:title", "title", DC_NS + "title", DCTERMS_NS + "title", "schema:name", "name"];
const DESC_KEYS  = ["dc:description", "description", DC_NS + "description", DCTERMS_NS + "description", "schema:description"];
const RECALLS_KEYS = ["bookmark:recalls", "recalls", BOOKMARK_NS + "recalls"];
const CREATED_KEYS = ["dc:created", "dcterms:created", "created", DC_NS + "date", DCTERMS_NS + "created", "schema:dateCreated", "dateCreated"];

export async function render(subject, _store, container, rawData) {
  const url = subject?.value;
  const doc = rawData;
  if (!doc) {
    container.innerHTML = `<div class="empty">Failed to load bookmark</div>`;
    return;
  }

  let title       = rd(doc, ...TITLE_KEYS) || "";
  let description = rd(doc, ...DESC_KEYS)  || "";
  const recallsRaw = rd(doc, ...RECALLS_KEYS);
  const recalls   = valueOf(recallsRaw) || "";
  const created   = rd(doc, ...CREATED_KEYS);

  const save = debounce(async () => {
    const newTitle = container.querySelector("#bm-title")?.value ?? title;
    const newDesc  = container.querySelector("#bm-desc")?.value ?? description;
    title = newTitle;
    description = newDesc;
    const titleKey = TITLE_KEYS.find(k => doc[k] !== undefined) || "dc:title";
    const descKey  = DESC_KEYS.find(k => doc[k] !== undefined) || "dc:description";
    doc[titleKey] = newTitle;
    doc[descKey]  = newDesc;
    setStatus("saving");
    try {
      await putJsonLd(url.replace(/#.*$/, ""), doc);
      setStatus("saved");
      container.dispatchEvent(new CustomEvent("pane:change", { detail: { url, doc } }));
    } catch (e) {
      setStatus("err", e.message);
    }
  }, 600);

  injectStyles();

  container.innerHTML = `
    <div class="bm-card">
      <div class="bm-meta">
        <span><b style="color:var(--text)">Saved</b> · <span id="bm-status" class="bm-saved">in sync</span></span>
        ${created ? `<span style="color:var(--text-faint)">${escape(fmtRel(created))}</span>` : ""}
        <span style="color:var(--text-faint);font-family:var(--mono);font-size:11px;margin-left:auto">${escape(url)}</span>
        <button class="btn danger" id="bm-del" title="Delete">${ICON.trash}</button>
      </div>
      <input class="bm-title" id="bm-title" value="${escape(title)}" placeholder="Untitled bookmark" />
      ${recalls ? `
        <a class="bm-link" href="${escape(recalls)}" target="_blank" rel="noopener noreferrer">
          ${ICON.link} <span class="bm-link-url">${escape(recalls)}</span>
        </a>
      ` : ""}
      <textarea class="bm-desc" id="bm-desc" placeholder="Description (optional)">${escape(description)}</textarea>
    </div>
  `;
  container.querySelector("#bm-title").addEventListener("input", save);
  container.querySelector("#bm-desc").addEventListener("input", save);
  container.querySelector("#bm-del").addEventListener("click", async () => {
    if (!confirm(`Delete "${title || "this bookmark"}"?`)) return;
    try {
      await deleteResource(url.replace(/#.*$/, ""));
      showToast("Deleted", "success");
      container.dispatchEvent(new CustomEvent("pane:delete", { detail: { url } }));
    } catch (e) {
      showToast("Delete failed: " + e.message, "error");
    }
  });

  function setStatus(kind, msg) {
    const el = container.querySelector("#bm-status");
    if (!el) return;
    if (kind === "saving") { el.className = "bm-saving"; el.textContent = "saving…"; }
    else if (kind === "saved") { el.className = "bm-saved"; el.textContent = "in sync"; }
    else if (kind === "err") { el.className = "bm-err"; el.textContent = "save error: " + (msg || ""); }
  }
}

function injectStyles() {
  if (document.getElementById("bm-pane-css")) return;
  const s = document.createElement("style");
  s.id = "bm-pane-css";
  s.textContent = `
.bm-card { background: var(--bg-elev); border: 1px solid var(--line); border-radius: 12px; padding: 18px 20px; box-shadow: var(--shadow); }
.bm-meta { display: flex; align-items: center; gap: 12px; font-size: 12px; color: var(--text-dim); margin-bottom: 12px; }
.bm-saved { color: var(--good); }
.bm-saving { color: var(--warning); }
.bm-err { color: var(--danger); }
.bm-title { width: 100%; font: 600 22px/1.2 var(--sans); letter-spacing: -.01em; border: none; outline: none; background: transparent; color: var(--text); padding: 4px 0; margin-bottom: 6px; }
.bm-link { display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--bg-elev-2); border: 1px solid var(--line); border-radius: 8px; color: var(--accent); text-decoration: none; font: 13px var(--mono); margin-bottom: 12px; transition: border-color .12s, background .12s; max-width: 100%; }
.bm-link:hover { border-color: var(--accent); background: var(--accent-soft); }
.bm-link svg { width: 14px; height: 14px; flex-shrink: 0; }
.bm-link-url { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bm-desc { width: 100%; min-height: 80px; background: var(--bg-elev-2); border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px; font: 14px/1.5 var(--sans); color: var(--text); outline: none; resize: vertical; transition: border-color .12s, box-shadow .12s; }
.bm-desc:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); }
`;
  document.head.appendChild(s);
}

export default { label, icon, canHandle, render };
