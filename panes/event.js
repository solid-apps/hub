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
var CALENDAR_CLASSES = [
  "http://www.w3.org/2002/12/cal/ical#Vcalendar",
  "http://www.w3.org/2002/12/cal/ical#Vevent",
  "http://schema.org/Event"
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

// src/panes/event.js
var label = "Event";
var icon = "\u{1F4C5}";
var meta = {
  id: "hub-pod/event",
  name: "Event detail",
  forClasses: CALENDAR_CLASSES
};
var RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
function canHandle(subject, store) {
  if (subject?.termType && subject.termType !== "NamedNode") return false;
  if (!store?.statementsMatching) return false;
  const stmts = store.statementsMatching(subject, void 0, void 0);
  return stmts.some((s) => {
    if (s.predicate?.value !== RDF_TYPE) return false;
    const v = s.object?.value;
    return CALENDAR_CLASSES.includes(v) || v === "Vevent" || v === "Event" || typeof v === "string" && /[#/](Vevent|Event)$/.test(v);
  });
}
async function render(subject, _store, container, rawData) {
  const url = subject?.value;
  const doc = rawData;
  if (!doc) {
    container.innerHTML = `<div class="empty">Failed to load event</div>`;
    return;
  }
  const save = debounce(async () => {
    doc.summary = container.querySelector("#ev-summary")?.value ?? doc.summary;
    doc.location = container.querySelector("#ev-location")?.value ?? doc.location;
    try {
      await putJsonLd(url.replace(/#.*$/, ""), doc);
      container.dispatchEvent(new CustomEvent("pane:change", { detail: { url, doc } }));
    } catch (e) {
      showToast("Save failed: " + e.message, "error");
    }
  }, 600);
  const dt = new Date(doc.dtstart);
  const dtLabel = isNaN(dt) ? doc.dtstart || "" : dt.toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  container.innerHTML = `
    <div class="card" style="margin:18px 24px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:12px">
        <input id="ev-summary" value="${escape(doc.summary || "")}" placeholder="Event title"
               style="font-size:20px;font-weight:600;border:none;outline:none;background:transparent;color:var(--text);flex:1;letter-spacing:-.01em" />
        <button class="btn danger" id="ev-del" title="Delete">${ICON.trash}</button>
      </div>
      <div style="color:var(--text-dim);font-size:14px;margin-bottom:14px">${escape(dtLabel)}</div>
      <div style="display:grid;grid-template-columns:80px 1fr;gap:10px;align-items:center;font-size:14px">
        <div style="color:var(--text-faint);font-size:11px;text-transform:uppercase;letter-spacing:.06em">Location</div>
        <input id="ev-location" value="${escape(doc.location || "")}" placeholder="(none)"
               style="background:var(--bg-elev-2);border:1px solid var(--line);border-radius:6px;padding:6px 10px;color:var(--text);font:inherit;outline:none" />
      </div>
      <div style="margin-top:14px;font-size:11px;color:var(--text-faint);font-family:var(--mono);word-break:break-all">${escape(url)}</div>
    </div>
  `;
  container.querySelector("#ev-summary").addEventListener("input", save);
  container.querySelector("#ev-location").addEventListener("input", save);
  container.querySelector("#ev-del").addEventListener("click", async () => {
    if (!confirm(`Delete "${doc.summary || "this event"}"?`)) return;
    try {
      await deleteResource(url.replace(/#.*$/, ""));
      showToast("Event deleted", "success");
      container.dispatchEvent(new CustomEvent("pane:delete", { detail: { url } }));
    } catch (e) {
      showToast("Delete failed: " + e.message, "error");
    }
  });
}
var event_default = { label, icon, canHandle, render };
export {
  canHandle,
  event_default as default,
  icon,
  label,
  meta,
  render
};
