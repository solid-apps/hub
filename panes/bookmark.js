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
async function deleteResource(url) {
  const res = await authFetch(url, { method: "DELETE" });
  if (!res.ok && res.status !== 404) throw new Error(`DELETE ${res.status} ${res.statusText} (${url})`);
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
function valueOf(v) {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.length ? valueOf(v[0]) : null;
  return v["@id"] || v["@value"] || null;
}
var BOOKMARK_CLASSES = [
  "http://www.w3.org/2002/01/bookmark#Bookmark"
];

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
function fmtRel(iso) {
  const now = /* @__PURE__ */ new Date();
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const diff = (now - d) / 1e3;
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  const days = Math.floor(diff / 86400);
  if (days < 7) return days + "d ago";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
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

// src/panes/bookmark.js
var RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
var BOOKMARK_NS = "http://www.w3.org/2002/01/bookmark#";
var DC_NS = "http://purl.org/dc/elements/1.1/";
var DCTERMS_NS = "http://purl.org/dc/terms/";
var label = "Bookmark";
var icon = "\u{1F516}";
var meta = {
  id: "hub-pod/bookmark",
  name: "Bookmark",
  forClasses: BOOKMARK_CLASSES
};
function canHandle(subject, store) {
  if (subject?.termType && subject.termType !== "NamedNode") return false;
  if (!store?.statementsMatching) return false;
  const stmts = store.statementsMatching(subject, void 0, void 0);
  return stmts.some((s) => {
    if (s.predicate?.value !== RDF_TYPE) return false;
    const v = s.object?.value;
    return BOOKMARK_CLASSES.includes(v) || v === "Bookmark" || v === "bookmark:Bookmark" || typeof v === "string" && /[#/]Bookmark$/.test(v);
  });
}
function rd(obj, ...keys) {
  if (!obj) return void 0;
  for (const k of keys) if (obj[k] !== void 0) return obj[k];
  return void 0;
}
var TITLE_KEYS = ["dc:title", "title", DC_NS + "title", DCTERMS_NS + "title", "schema:name", "name"];
var DESC_KEYS = ["dc:description", "description", DC_NS + "description", DCTERMS_NS + "description", "schema:description"];
var RECALLS_KEYS = ["bookmark:recalls", "recalls", BOOKMARK_NS + "recalls"];
var CREATED_KEYS = ["dc:created", "dcterms:created", "created", DC_NS + "date", DCTERMS_NS + "created", "schema:dateCreated", "dateCreated"];
async function render(subject, _store, container, rawData) {
  const url = subject?.value;
  const doc = rawData;
  if (!doc) {
    container.innerHTML = `<div class="empty">Failed to load bookmark</div>`;
    return;
  }
  let title = rd(doc, ...TITLE_KEYS) || "";
  let description = rd(doc, ...DESC_KEYS) || "";
  const recallsRaw = rd(doc, ...RECALLS_KEYS);
  const recalls = valueOf(recallsRaw) || "";
  const created = rd(doc, ...CREATED_KEYS);
  const save = debounce(async () => {
    const newTitle = container.querySelector("#bm-title")?.value ?? title;
    const newDesc = container.querySelector("#bm-desc")?.value ?? description;
    title = newTitle;
    description = newDesc;
    const titleKey = TITLE_KEYS.find((k) => doc[k] !== void 0) || "dc:title";
    const descKey = DESC_KEYS.find((k) => doc[k] !== void 0) || "dc:description";
    doc[titleKey] = newTitle;
    doc[descKey] = newDesc;
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
        <span><b style="color:var(--text)">Saved</b> \xB7 <span id="bm-status" class="bm-saved">in sync</span></span>
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
    if (kind === "saving") {
      el.className = "bm-saving";
      el.textContent = "saving\u2026";
    } else if (kind === "saved") {
      el.className = "bm-saved";
      el.textContent = "in sync";
    } else if (kind === "err") {
      el.className = "bm-err";
      el.textContent = "save error: " + (msg || "");
    }
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
var bookmark_default = { label, icon, canHandle, render };
export {
  canHandle,
  bookmark_default as default,
  icon,
  label,
  meta,
  render
};
