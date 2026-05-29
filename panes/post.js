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
async function getJsonLd(url) {
  const res = await authFetch(url, { headers: { Accept: "application/ld+json" } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET ${res.status} ${res.statusText} (${url})`);
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  if (ct.includes("ld+json") || ct.includes("application/json")) {
    return res.json();
  }
  if (ct.includes("text/html")) {
    const html = await res.text();
    const m = html.match(/<script\s+type=["']application\/ld\+json["']\s*>([\s\S]*?)<\/script>/i);
    if (!m) return null;
    return parseLooseJson(m[1].trim());
  }
  throw new Error(`pod returned ${ct || "unknown content type"} (need JSON-LD or HTML+island)`);
}
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
function pickValue(obj, preds) {
  for (const p of preds) {
    if (obj[p] != null) {
      const v = valueOf(obj[p]);
      if (v) return v;
    }
  }
  return null;
}
function normalizeProfile(jsonld) {
  const out = { "@id": jsonld["@id"], "@type": jsonld["@type"], _raw: jsonld };
  for (const [field, preds] of Object.entries(PROFILE_PREDS)) {
    const v = pickValue(jsonld, preds);
    if (v) out[field] = field === "email" ? v.replace(/^mailto:/, "") : v;
  }
  return out;
}
function findSubject(doc, fragmentId) {
  const graph = Array.isArray(doc["@graph"]) ? doc["@graph"] : Array.isArray(doc) ? doc : [doc];
  if (fragmentId) {
    const m = graph.find((n) => (n["@id"] || "").endsWith("#" + fragmentId));
    if (m) return m;
  }
  return graph[0];
}
function parseLooseJson(s) {
  try {
    return JSON.parse(s);
  } catch {
    const cleaned = s.replace(/,(\s*[\}\]])/g, "$1");
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      throw new Error(`JSON-LD parse failed: ${e.message}`);
    }
  }
}
function isHttpUrl(s) {
  if (typeof s !== "string") return false;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
async function fetchWebIdProfile(webid) {
  if (!isHttpUrl(webid)) return null;
  const url = webid.replace(/#.*$/, "");
  const doc = await getJsonLd(url);
  if (!doc) return null;
  const frag = webid.includes("#") ? webid.split("#")[1] : null;
  return normalizeProfile(findSubject(doc, frag));
}
var POST_CLASSES = [
  "https://www.w3.org/ns/activitystreams#Note",
  "http://www.w3.org/ns/activitystreams#Note"
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
function initials(name) {
  if (!name) return "?";
  return name.split(/\s+/).map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";
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
function avatarHTML(meta2, sizeClass = "") {
  const name = meta2?.name || "";
  if (meta2?.img) {
    return `<div class="ava ${sizeClass}"><img src="${escape(meta2.img)}" alt="${escape(name)}" onerror="this.parentNode.textContent='${escape(initials(name))}'"></div>`;
  }
  return `<div class="ava ${sizeClass}">${escape(initials(name))}</div>`;
}

// src/panes/post.js
var RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
var AS_NS = "https://www.w3.org/ns/activitystreams#";
var AS_NS_HTTP = "http://www.w3.org/ns/activitystreams#";
var label = "Post";
var icon = "\u{1F4AC}";
var meta = {
  id: "hub-pod/post",
  name: "ActivityStreams Note",
  forClasses: POST_CLASSES
};
function canHandle(subject, store) {
  if (subject?.termType && subject.termType !== "NamedNode") return false;
  if (!store?.statementsMatching) return false;
  const stmts = store.statementsMatching(subject, void 0, void 0);
  return stmts.some((s) => {
    if (s.predicate?.value !== RDF_TYPE) return false;
    const v = s.object?.value;
    return POST_CLASSES.includes(v) || v === "Note" || v === "as:Note" || typeof v === "string" && /[#/]Note$/.test(v) && /activitystreams/i.test(v);
  });
}
function rd(obj, ...keys) {
  if (!obj) return void 0;
  for (const k of keys) if (obj[k] !== void 0) return obj[k];
  return void 0;
}
var CONTENT_KEYS = ["as:content", "content", AS_NS + "content", AS_NS_HTTP + "content"];
var AUTHOR_KEYS = ["as:attributedTo", "attributedTo", AS_NS + "attributedTo", AS_NS_HTTP + "attributedTo"];
var PUBLISHED_KEYS = ["as:published", "published", AS_NS + "published", AS_NS_HTTP + "published"];
async function render(subject, _store, container, rawData) {
  const url = subject?.value;
  const doc = rawData;
  if (!doc) {
    container.innerHTML = `<div class="empty">Failed to load post</div>`;
    return;
  }
  let content = rd(doc, ...CONTENT_KEYS) || "";
  const author = valueOf(rd(doc, ...AUTHOR_KEYS)) || "";
  const published = rd(doc, ...PUBLISHED_KEYS);
  injectStyles();
  draw({ name: shortHost(author) || "Anonymous", img: null });
  if (author) {
    fetchWebIdProfile(author).then((profile) => {
      if (profile) draw({
        name: profile.name || shortHost(author) || "Anonymous",
        img: profile.img
      });
    }).catch(() => {
    });
  }
  function draw(authorMeta) {
    container.innerHTML = `
      <div class="post-card">
        <div class="post-head">
          ${avatarHTML(authorMeta, "sm")}
          <div class="post-head-info">
            <div class="post-author">${escape(authorMeta.name)}</div>
            ${author ? `<div class="post-author-id">${escape(author)}</div>` : ""}
          </div>
          ${published ? `<div class="post-time">${escape(fmtRel(published))}</div>` : ""}
          <button class="btn danger" id="post-del" title="Delete">${ICON.trash}</button>
        </div>
        <textarea class="post-content" id="post-content" placeholder="Write a note\u2026">${escape(content)}</textarea>
        <div class="post-foot">
          <span id="post-status" class="post-saved">in sync</span>
          <span style="margin-left:auto;color:var(--text-faint);font-family:var(--mono);font-size:11px">${escape(url)}</span>
        </div>
      </div>
    `;
    container.querySelector("#post-content").addEventListener("input", save);
    container.querySelector("#post-del").addEventListener("click", async () => {
      if (!confirm("Delete this post?")) return;
      try {
        await deleteResource(url.replace(/#.*$/, ""));
        showToast("Deleted", "success");
        container.dispatchEvent(new CustomEvent("pane:delete", { detail: { url } }));
      } catch (e) {
        showToast("Delete failed: " + e.message, "error");
      }
    });
  }
  const save = debounce(async () => {
    const newContent = container.querySelector("#post-content")?.value ?? content;
    if (newContent === content) return;
    content = newContent;
    const contentKey = CONTENT_KEYS.find((k) => doc[k] !== void 0) || "as:content";
    doc[contentKey] = newContent;
    setStatus("saving");
    try {
      await putJsonLd(url.replace(/#.*$/, ""), doc);
      setStatus("saved");
      container.dispatchEvent(new CustomEvent("pane:change", { detail: { url, doc } }));
    } catch (e) {
      setStatus("err", e.message);
    }
  }, 600);
  function setStatus(kind, msg) {
    const el = container.querySelector("#post-status");
    if (!el) return;
    if (kind === "saving") {
      el.className = "post-saving";
      el.textContent = "saving\u2026";
    } else if (kind === "saved") {
      el.className = "post-saved";
      el.textContent = "in sync";
    } else if (kind === "err") {
      el.className = "post-err";
      el.textContent = "save error: " + (msg || "");
    }
  }
}
function shortHost(webid) {
  if (!webid) return null;
  try {
    return new URL(webid).hostname;
  } catch {
    return null;
  }
}
function injectStyles() {
  if (document.getElementById("post-pane-css")) return;
  const s = document.createElement("style");
  s.id = "post-pane-css";
  s.textContent = `
.post-card { background: var(--bg-elev); border: 1px solid var(--line); border-radius: 12px; padding: 16px 18px; box-shadow: var(--shadow); }
.post-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.post-head .ava { width: 36px; height: 36px; font-size: 13px; flex-shrink: 0; }
.post-head-info { flex: 1; min-width: 0; }
.post-author { font-weight: 600; font-size: 14px; color: var(--text); }
.post-author-id { font-size: 11px; color: var(--text-faint); font-family: var(--mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.post-time { font-size: 12px; color: var(--text-dim); flex-shrink: 0; }
.post-content { width: 100%; min-height: 96px; background: var(--bg-elev-2); border: 1px solid var(--line); border-radius: 8px; padding: 12px; font: 14px/1.5 var(--sans); color: var(--text); outline: none; resize: vertical; transition: border-color .12s, box-shadow .12s; }
.post-content:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); }
.post-foot { display: flex; align-items: center; gap: 10px; margin-top: 10px; font-size: 12px; }
.post-saved { color: var(--good); }
.post-saving { color: var(--warning); }
.post-err { color: var(--danger); }
`;
  document.head.appendChild(s);
}
var post_default = { label, icon, canHandle, render };
export {
  canHandle,
  post_default as default,
  icon,
  label,
  meta,
  render
};
