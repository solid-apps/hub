// src/auth.js
var listeners = /* @__PURE__ */ new Set();
var auth = {
  type: null,
  // "solid" | "nostr" | null
  id: null,
  // webId (solid) or pubkey (nostr)
  loggedIn: false
};
function fire() {
  listeners.forEach((fn) => {
    try {
      fn(auth);
    } catch (e) {
      console.error(e);
    }
  });
}
function update(detail) {
  auth.type = detail?.type || null;
  auth.id = detail?.id || null;
  auth.loggedIn = !!auth.id;
  fire();
}
document.addEventListener("xlogin", (e) => update(e.detail));
document.addEventListener("xlogout", () => update(null));
var polls = 0;
var poll = setInterval(() => {
  polls++;
  if (window.xlogin && window.xlogin.id && !auth.loggedIn) {
    update({ type: window.xlogin.type, id: window.xlogin.id });
  }
  if (polls > 20) clearInterval(poll);
}, 500);
function authFetch(url, init) {
  const f = window.xlogin && window.xlogin.authFetch || fetch;
  return f(url, init);
}

// src/pod.js
var FOAF_NS = "http://xmlns.com/foaf/0.1/";
var VCARD_NS = "http://www.w3.org/2006/vcard/ns#";
async function putJsonLd(url, body) {
  const res = await authFetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/ld+json" },
    body: JSON.stringify(body, null, 2)
  });
  if (!res.ok) throw new Error(`PUT ${res.status} ${res.statusText} (${url})`);
  return res;
}
var PROFILE_PREDS = {
  name: ["name", "foaf:name", FOAF_NS + "name", "vcard:fn", VCARD_NS + "fn"],
  nick: ["nick", "foaf:nick", FOAF_NS + "nick"],
  email: ["email", "foaf:mbox", FOAF_NS + "mbox", "vcard:hasEmail", VCARD_NS + "hasEmail"],
  homepage: ["homepage", "foaf:homepage", FOAF_NS + "homepage", "vcard:hasURL", VCARD_NS + "hasURL"],
  img: ["img", "foaf:img", FOAF_NS + "img", "foaf:depiction", FOAF_NS + "depiction", "vcard:hasPhoto", VCARD_NS + "hasPhoto"],
  bio: ["description", "schema:description", "vcard:note", VCARD_NS + "note", "bio:olb"]
};

// src/ui.js
var $ = (sel, root = document) => root.querySelector(sel);
function escape(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}
function showToast(msg, kind) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.className = "toast show " + (kind || "");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove("show"), 2400);
}
function debounce(fn, ms = 300) {
  let t;
  return function(...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms);
  };
}
var ICON = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 12 3l9 6.5V20a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  files: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  contacts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  notes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>',
  tasks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  photos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  chevL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
  chevR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  img: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 1 0-7l3-3a5 5 0 0 1 7 7l-1.5 1.5"/><path d="M14 11a5 5 0 0 1 0 7l-3 3a5 5 0 0 1-7-7l1.5-1.5"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  apps: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>'
};

// src/panes/list.js
var ITEMLIST_CLASSES = [
  "http://schema.org/ItemList",
  "https://schema.org/ItemList"
];
var RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
var label = "List";
var icon = "\u2705";
var meta = {
  id: "hub-pod/list",
  name: "Todo list",
  forClasses: ITEMLIST_CLASSES
};
function canHandle(subject, store) {
  if (subject?.termType && subject.termType !== "NamedNode") return false;
  if (!store?.statementsMatching) return false;
  const stmts = store.statementsMatching(subject, void 0, void 0);
  return stmts.some((s) => {
    if (s.predicate?.value !== RDF_TYPE) return false;
    const v = s.object?.value;
    return ITEMLIST_CLASSES.includes(v) || typeof v === "string" && (v === "ItemList" || /[#/:]ItemList$/.test(v) || /(?:^|:)ItemList$/.test(v));
  });
}
function rd(obj, ...keys) {
  if (!obj) return void 0;
  for (const k of keys) if (obj[k] !== void 0) return obj[k];
  return void 0;
}
var NAME_KEYS = ["schema:name", "name", "https://schema.org/name", "http://schema.org/name"];
var DESC_KEYS = ["schema:description", "description", "https://schema.org/description", "http://schema.org/description"];
var POS_KEYS = ["schema:position", "position", "https://schema.org/position", "http://schema.org/position"];
var STATUS_KEYS = ["schema:status", "status", "schema:actionStatus", "actionStatus"];
var DATE_KEYS = ["schema:dateCreated", "dateCreated", "https://schema.org/dateCreated", "http://schema.org/dateCreated"];
var ELEMENTS_KEYS = ["schema:itemListElement", "itemListElement", "https://schema.org/itemListElement", "http://schema.org/itemListElement"];
async function render(subject, _store, container, rawData) {
  const url = subject?.value;
  const doc = rawData;
  if (!doc) {
    container.innerHTML = `<div class="empty">Failed to load list</div>`;
    return;
  }
  injectStyles();
  const rawItems = rd(doc, ...ELEMENTS_KEYS) || [];
  const arr = Array.isArray(rawItems) ? rawItems : [rawItems];
  let items = arr.map((it) => ({
    name: rd(it, ...NAME_KEYS) || "Untitled",
    description: rd(it, ...DESC_KEYS) || null,
    position: parseInt(rd(it, ...POS_KEYS) ?? "0", 10),
    done: (() => {
      const s = rd(it, ...STATUS_KEYS);
      return s ? String(s).toLowerCase().includes("completed") : false;
    })(),
    dateCreated: rd(it, ...DATE_KEYS) || null
  })).sort((a, b) => {
    if (a.dateCreated && !b.dateCreated) return -1;
    if (!a.dateCreated && b.dateCreated) return 1;
    if (a.dateCreated && b.dateCreated) return new Date(b.dateCreated) - new Date(a.dateCreated);
    return b.position - a.position;
  });
  let listName = rd(doc, ...NAME_KEYS) || "Todo List";
  let description = rd(doc, ...DESC_KEYS) || null;
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
        <input class="hl-add-input" id="hl-input" type="text" placeholder="Add a task and press Enter\u2026" />
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
  const save = debounce(async () => {
    const itemKey = ELEMENTS_KEYS.find((k) => doc[k] !== void 0) || "schema:itemListElement";
    const nameKey = NAME_KEYS.find((k) => doc[k] !== void 0) || "schema:name";
    doc[nameKey] = listName;
    doc[itemKey] = items.map((item, i) => {
      const entry = {
        "@type": "schema:ListItem",
        "schema:name": item.name,
        "schema:position": i + 1
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
    const done = items.filter((i) => i.done).length;
    const active = total - done;
    const pct = total ? Math.round(done / total * 100) : 0;
    statsEl.innerHTML = `<span class="hl-stat"><span class="hl-stat-num">${total}</span> total</span><span class="hl-stat"><span class="hl-stat-num">${active}</span> active</span><span class="hl-stat"><span class="hl-stat-num">${done}</span> done</span>`;
    progressFill.style.width = pct + "%";
  }
  function renderItems() {
    listEl.innerHTML = "";
    container.querySelectorAll(".hl-filter").forEach((b) => {
      b.classList.toggle("active", b.dataset.filter === filter);
    });
    const visible = items.filter((i) => {
      if (filter === "active") return !i.done;
      if (filter === "done") return i.done;
      return true;
    });
    if (!visible.length) {
      listEl.innerHTML = `<div class="hl-empty">${filter === "done" ? "No completed tasks yet" : filter === "active" ? "All tasks complete." : "No tasks yet \u2014 add one above."}</div>`;
      return;
    }
    for (const item of visible) {
      const el = document.createElement("div");
      el.className = "hl-item" + (item.done ? " done" : "");
      el.innerHTML = `
        <div class="hl-checkbox ${item.done ? "checked" : ""}" data-act="toggle">${item.done ? "\u2713" : ""}</div>
        <div class="hl-info">
          <div class="hl-name">${escape(item.name)}</div>
          ${item.description ? `<div class="hl-item-desc">${escape(item.description)}</div>` : ""}
          ${item.dateCreated ? `<div class="hl-item-date">${formatDate(item.dateCreated)}</div>` : ""}
        </div>
        <div class="hl-actions">
          <button class="hl-item-btn hl-bump" title="Bump to top" data-act="bump">\u2191</button>
          <button class="hl-item-btn" title="Delete" data-act="delete">\xD7</button>
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
        item.dateCreated = (/* @__PURE__ */ new Date()).toISOString();
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
      dateCreated: (/* @__PURE__ */ new Date()).toISOString()
    });
    inputEl.value = "";
    updateStats();
    renderItems();
    save();
  }
  container.querySelectorAll(".hl-filter").forEach((b) => {
    b.addEventListener("click", () => {
      filter = b.dataset.filter;
      localStorage.setItem("hl-filter:" + (url || "default"), filter);
      renderItems();
    });
  });
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addItem();
  });
  addBtn.addEventListener("click", addItem);
  titleEl.contentEditable = "true";
  titleEl.addEventListener("blur", () => {
    const v = titleEl.textContent.trim();
    if (v && v !== listName) {
      listName = v;
      save();
    }
  });
  titleEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      titleEl.blur();
    }
  });
  updateStats();
  renderItems();
}
function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(void 0, { month: "short", day: "numeric" }) + " \xB7 " + d.toLocaleTimeString(void 0, { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
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
var list_default = { label, icon, canHandle, render };
export {
  canHandle,
  list_default as default,
  icon,
  label,
  meta,
  render
};
