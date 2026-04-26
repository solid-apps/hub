/**
 * list.js — Pane for schema:ItemList (todo-list shape).
 *
 * Originally inspired by the SolidOS todo-pane.js
 * (https://localhost:4445/todo/todo-pane.js style — a mashlib pane).
 * Hub ships its own copy rewritten to:
 *   - read directly from input.doc (JSON-LD), not an rdflib store
 *   - use hub's CSS variables so it themes correctly in light/dark
 *   - drop mashlib-host-specific features (sibling lists.jsonld
 *     dropdown, move-between-lists) — those depend on a host page that
 *     hub doesn't provide
 *
 * Renders an itemListElement of schema:ListItem objects (name, status,
 * dateCreated, optional description) with checkbox toggle, in-place
 * add, bump-to-top, delete, all/active/done filter, progress bar, and
 * a stats strip. PUTs the whole document back via xlogin.authFetch on
 * any change.
 *
 * AGPL-3.0
 */

import { putJsonLd } from "../pod.js";
import { ICON, escape, debounce, showToast } from "../ui.js";

const ITEMLIST_CLASSES = [
  "http://schema.org/ItemList",
  "https://schema.org/ItemList",
];
const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

export const label = "List";
export const icon  = "✅";
export const meta = {
  id: "hub-pod/list",
  name: "Todo list",
  forClasses: ITEMLIST_CLASSES,
};

export function canHandle(subject, store) {
  if (subject?.termType && subject.termType !== "NamedNode") return false;
  if (!store?.statementsMatching) return false;
  const stmts = store.statementsMatching(subject, undefined, undefined);
  return stmts.some(s => {
    if (s.predicate?.value !== RDF_TYPE) return false;
    const v = s.object?.value;
    return ITEMLIST_CLASSES.includes(v) ||
           (typeof v === "string" && (v === "ItemList" || /[#/:]ItemList$/.test(v) || /(?:^|:)ItemList$/.test(v)));
  });
}

// Look up a property by any of the common key forms (bare, prefixed, full IRI).
function rd(obj, ...keys) {
  if (!obj) return undefined;
  for (const k of keys) if (obj[k] !== undefined) return obj[k];
  return undefined;
}

const NAME_KEYS = ["schema:name", "name", "https://schema.org/name", "http://schema.org/name"];
const DESC_KEYS = ["schema:description", "description", "https://schema.org/description", "http://schema.org/description"];
const POS_KEYS  = ["schema:position", "position", "https://schema.org/position", "http://schema.org/position"];
const STATUS_KEYS = ["schema:status", "status", "schema:actionStatus", "actionStatus"];
const DATE_KEYS = ["schema:dateCreated", "dateCreated", "https://schema.org/dateCreated", "http://schema.org/dateCreated"];
const ELEMENTS_KEYS = ["schema:itemListElement", "itemListElement", "https://schema.org/itemListElement", "http://schema.org/itemListElement"];

export async function render(subject, _store, container, rawData) {
  const url = subject?.value;
  const doc = rawData;
  if (!doc) {
    container.innerHTML = `<div class="empty">Failed to load list</div>`;
    return;
  }

  injectStyles();

  // Normalise items into a flat working array. Round-tripping back to the
  // original shape happens at save time.
  const rawItems = rd(doc, ...ELEMENTS_KEYS) || [];
  const arr = Array.isArray(rawItems) ? rawItems : [rawItems];
  let items = arr.map(it => ({
    name: rd(it, ...NAME_KEYS) || "Untitled",
    description: rd(it, ...DESC_KEYS) || null,
    position: parseInt(rd(it, ...POS_KEYS) ?? "0", 10),
    done: (() => {
      const s = rd(it, ...STATUS_KEYS);
      return s ? String(s).toLowerCase().includes("completed") : false;
    })(),
    dateCreated: rd(it, ...DATE_KEYS) || null,
  })).sort((a, b) => {
    if (a.dateCreated && !b.dateCreated) return -1;
    if (!a.dateCreated && b.dateCreated) return 1;
    if (a.dateCreated && b.dateCreated) return new Date(b.dateCreated) - new Date(a.dateCreated);
    return b.position - a.position;
  });

  let listName = rd(doc, ...NAME_KEYS) || "Todo List";
  let description = rd(doc, ...DESC_KEYS) || null;

  // Build the DOM scaffold once; renderItems() / updateStats() refresh in place.
  container.innerHTML = `
    <div class="hl">
      <div class="hl-header">
        <div class="hl-title-row">
          <span class="hl-icon">${ICON.tasks}</span>
          <h1 class="hl-title" data-edit-title>${escape(listName)}</h1>
        </div>
        ${description ? `<div class="hl-desc">${escape(description)}</div>` : ""}
        <div class="hl-stats" id="hl-stats"></div>
      </div>
      <div class="hl-progress-wrap"><div class="hl-progress-bar"><div class="hl-progress-fill" id="hl-progress"></div></div></div>
      <div class="hl-add">
        <input class="hl-add-input" id="hl-input" type="text" placeholder="Add a task and press Enter…" />
        <button class="hl-add-btn" id="hl-add-btn">Add</button>
      </div>
      <div class="hl-filters" id="hl-filters">
        <button class="hl-filter" data-filter="all">All</button>
        <button class="hl-filter" data-filter="active">Active</button>
        <button class="hl-filter" data-filter="done">Done</button>
      </div>
      <div class="hl-list" id="hl-list"></div>
      <div class="hl-source" data-url>${escape(url || "")}</div>
    </div>
  `;

  const listEl = container.querySelector("#hl-list");
  const statsEl = container.querySelector("#hl-stats");
  const progressFill = container.querySelector("#hl-progress");
  const inputEl = container.querySelector("#hl-input");
  const addBtn = container.querySelector("#hl-add-btn");
  const titleEl = container.querySelector("[data-edit-title]");

  let filter = localStorage.getItem("hl-filter:" + (url || "default")) || "all";

  // Save: round-trip the working array back into the doc shape and PUT.
  const save = debounce(async () => {
    // Mutate doc in place: keep @context / @id / @type / other top-level fields.
    // Replace the items list under whichever element key exists (or create one).
    const itemKey = ELEMENTS_KEYS.find(k => doc[k] !== undefined) || "schema:itemListElement";
    const nameKey = NAME_KEYS.find(k => doc[k] !== undefined) || "schema:name";
    doc[nameKey] = listName;
    doc[itemKey] = items.map((item, i) => {
      const entry = {
        "@type": "schema:ListItem",
        "schema:name": item.name,
        "schema:position": i + 1,
      };
      if (item.description) entry["schema:description"] = item.description;
      if (item.done) entry["schema:status"] = "completed";
      if (item.dateCreated) entry["schema:dateCreated"] = item.dateCreated;
      return entry;
    });
    try {
      await putJsonLd(url.replace(/#.*$/, ""), doc);
      container.dispatchEvent(new CustomEvent("pane:change", { detail: { url, doc } }));
    } catch (e) {
      showToast("Save failed: " + e.message, "error");
    }
  }, 400);

  function updateStats() {
    const total = items.length;
    const done = items.filter(i => i.done).length;
    const active = total - done;
    const pct = total ? Math.round((done / total) * 100) : 0;
    statsEl.innerHTML =
      `<span class="hl-stat"><span class="hl-stat-num">${total}</span> total</span>` +
      `<span class="hl-stat"><span class="hl-stat-num">${active}</span> active</span>` +
      `<span class="hl-stat"><span class="hl-stat-num">${done}</span> done</span>`;
    progressFill.style.width = pct + "%";
  }

  function renderItems() {
    listEl.innerHTML = "";
    container.querySelectorAll(".hl-filter").forEach(b => {
      b.classList.toggle("active", b.dataset.filter === filter);
    });
    const visible = items.filter(i => {
      if (filter === "active") return !i.done;
      if (filter === "done") return i.done;
      return true;
    });
    if (!visible.length) {
      listEl.innerHTML = `<div class="hl-empty">${
        filter === "done" ? "No completed tasks yet" :
        filter === "active" ? "All tasks complete." :
        "No tasks yet — add one above."
      }</div>`;
      return;
    }
    for (const item of visible) {
      const el = document.createElement("div");
      el.className = "hl-item" + (item.done ? " done" : "");
      el.innerHTML = `
        <div class="hl-checkbox ${item.done ? "checked" : ""}" data-act="toggle">${item.done ? "✓" : ""}</div>
        <div class="hl-info">
          <div class="hl-name">${escape(item.name)}</div>
          ${item.description ? `<div class="hl-item-desc">${escape(item.description)}</div>` : ""}
          ${item.dateCreated ? `<div class="hl-item-date">${formatDate(item.dateCreated)}</div>` : ""}
        </div>
        <div class="hl-actions">
          <button class="hl-item-btn hl-bump" title="Bump to top" data-act="bump">↑</button>
          <button class="hl-item-btn" title="Delete" data-act="delete">×</button>
        </div>
      `;
      el.querySelector('[data-act="toggle"]').addEventListener("click", () => {
        item.done = !item.done;
        updateStats();
        renderItems();
        save();
      });
      el.querySelector('[data-act="bump"]').addEventListener("click", () => {
        const idx = items.indexOf(item);
        if (idx > 0) items.splice(idx, 1);
        item.dateCreated = new Date().toISOString();
        items.unshift(item);
        renderItems();
        save();
      });
      el.querySelector('[data-act="delete"]').addEventListener("click", () => {
        const idx = items.indexOf(item);
        if (idx !== -1) items.splice(idx, 1);
        updateStats();
        renderItems();
        save();
      });
      listEl.appendChild(el);
    }
  }

  function addItem() {
    const text = inputEl.value.trim();
    if (!text) return;
    items.unshift({
      name: text,
      description: null,
      position: items.length + 1,
      done: false,
      dateCreated: new Date().toISOString(),
    });
    inputEl.value = "";
    updateStats();
    renderItems();
    save();
  }

  // Wire filters
  container.querySelectorAll(".hl-filter").forEach(b => {
    b.addEventListener("click", () => {
      filter = b.dataset.filter;
      localStorage.setItem("hl-filter:" + (url || "default"), filter);
      renderItems();
    });
  });

  inputEl.addEventListener("keydown", e => { if (e.key === "Enter") addItem(); });
  addBtn.addEventListener("click", addItem);

  // Inline title rename
  titleEl.contentEditable = "true";
  titleEl.addEventListener("blur", () => {
    const v = titleEl.textContent.trim();
    if (v && v !== listName) { listName = v; save(); }
  });
  titleEl.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); titleEl.blur(); }
  });

  updateStats();
  renderItems();
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " · " +
           d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}

function injectStyles() {
  if (document.getElementById("hl-pane-css")) return;
  const s = document.createElement("style");
  s.id = "hl-pane-css";
  s.textContent = `
.hl { font-family: var(--sans); color: var(--text); background: var(--bg-elev); border: 1px solid var(--line); border-radius: var(--radius, 14px); overflow: hidden; box-shadow: var(--shadow); }

.hl-header { padding: 18px 22px; border-bottom: 1px solid var(--line); }
.hl-title-row { display: flex; align-items: center; gap: 10px; }
.hl-icon { display: inline-grid; place-items: center; width: 24px; height: 24px; color: var(--accent); }
.hl-icon svg { width: 20px; height: 20px; }
.hl-title { margin: 0; font: 700 19px/1.1 var(--sans); letter-spacing: -.01em; outline: none; padding: 1px 4px; margin: -1px -4px; border-radius: 4px; cursor: text; }
.hl-title:focus { background: var(--accent-soft); }
.hl-desc { margin-top: 6px; font-size: 13px; color: var(--text-dim); }
.hl-stats { display: flex; gap: 18px; margin-top: 12px; font-size: 12px; color: var(--text-dim); }
.hl-stat-num { font-weight: 700; color: var(--text); margin-right: 2px; font-family: var(--mono); }

.hl-progress-wrap { padding: 0 22px; margin: 8px 0 14px; }
.hl-progress-bar { height: 4px; background: var(--bg-elev-2); border-radius: 100px; overflow: hidden; }
.hl-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-2, var(--accent))); border-radius: 100px; transition: width .25s var(--easing, cubic-bezier(.2,.8,.2,1)); }

.hl-add { display: flex; gap: 8px; padding: 0 22px 12px; }
.hl-add-input { flex: 1; padding: 9px 12px; background: var(--bg-elev-2); border: 1px solid var(--line); border-radius: 9px; font: 400 14px var(--sans); outline: none; color: var(--text); transition: border-color .12s, background .12s, box-shadow .12s; }
.hl-add-input::placeholder { color: var(--text-faint); }
.hl-add-input:focus { border-color: var(--accent); background: var(--bg-elev); box-shadow: 0 0 0 2px var(--accent-soft); }
.hl-add-btn { padding: 9px 16px; background: linear-gradient(135deg, var(--accent), var(--accent-2, var(--accent))); color: var(--text-on-accent, #fff); border: none; border-radius: 9px; font: 600 13px var(--sans); cursor: pointer; }
.hl-add-btn:hover { transform: translateY(-1px); }

.hl-filters { display: flex; gap: 4px; padding: 0 22px 8px; border-bottom: 1px solid var(--line); }
.hl-filter { padding: 6px 12px; background: transparent; border: none; border-bottom: 2px solid transparent; font: 500 12px var(--sans); color: var(--text-dim); cursor: pointer; transition: color .12s, border-color .12s; }
.hl-filter:hover { color: var(--text); }
.hl-filter.active { color: var(--accent); border-bottom-color: var(--accent); }

.hl-list { padding: 6px 14px 6px; display: flex; flex-direction: column; gap: 2px; }
.hl-item { display: flex; align-items: flex-start; gap: 10px; padding: 8px 8px; border-radius: 8px; transition: background .12s; animation: hl-slidein .22s var(--easing, cubic-bezier(.2,.8,.2,1)); }
.hl-item:hover { background: var(--bg-elev-2); }
.hl-item.done .hl-name { color: var(--text-faint); text-decoration: line-through; }
@keyframes hl-slidein { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: none; } }

.hl-checkbox { width: 20px; height: 20px; border-radius: 5px; border: 2px solid var(--text-faint); display: grid; place-items: center; cursor: pointer; flex-shrink: 0; margin-top: 1px; font-size: 12px; color: transparent; transition: all .15s; }
.hl-checkbox:hover { border-color: var(--accent); }
.hl-checkbox.checked { background: var(--accent); border-color: var(--accent); color: var(--text-on-accent, #fff); animation: hl-pop .26s var(--easing, cubic-bezier(.2,.8,.2,1)); }
@keyframes hl-pop { 0% { transform: scale(.85); } 55% { transform: scale(1.18); } 100% { transform: scale(1); } }

.hl-info { flex: 1; min-width: 0; }
.hl-name { font: 400 14px/1.4 var(--sans); word-break: break-word; }
.hl-item-desc { font-size: 12px; color: var(--text-dim); margin-top: 2px; }
.hl-item-date { font: 400 11px var(--mono); color: var(--text-faint); margin-top: 4px; }

.hl-actions { display: flex; gap: 2px; opacity: 0; transition: opacity .12s; }
.hl-item:hover .hl-actions { opacity: 1; }
.hl-item-btn { width: 26px; height: 26px; border: none; background: transparent; border-radius: 6px; cursor: pointer; color: var(--text-faint); font-size: 16px; line-height: 1; transition: background .12s, color .12s; }
.hl-item-btn:hover { background: var(--bg-elev-3, var(--bg-elev-2)); color: var(--danger); }
.hl-item-btn.hl-bump:hover { color: var(--good); }

.hl-empty { padding: 32px 24px; text-align: center; color: var(--text-faint); font-size: 13px; }

.hl-source { padding: 8px 22px; font: 400 11px var(--mono); color: var(--text-faint); border-top: 1px solid var(--line); word-break: break-all; }
`;
  document.head.appendChild(s);
}

export default { label, icon, canHandle, render };
