/**
 * pod.js — JSON-LD CRUD helpers for a Solid pod
 *
 * Constraint: pods must serve application/ld+json via content negotiation.
 * Turtle-only pods will fail at GET; that's a separate-issue parser away.
 *
 * Helpers cover:
 *   - GET/PUT/DELETE on JSON-LD resources
 *   - WebID profile fetch + normalize (foaf/vcard predicate variation)
 *   - LDP container listing
 *   - Pod root + storage discovery from a WebID
 */

import { authFetch } from "./auth.js";

const LDP_NS = "http://www.w3.org/ns/ldp#";
const SOLID_NS = "http://www.w3.org/ns/solid/terms#";
const PIM_NS = "http://www.w3.org/ns/pim/space#";
const FOAF_NS = "http://xmlns.com/foaf/0.1/";
const VCARD_NS = "http://www.w3.org/2006/vcard/ns#";

// ---- JSON-LD CRUD ---------------------------------------------------------

/**
 * Get a JSON-LD resource. Handles three cases:
 *   1. application/ld+json (or application/json) → parse JSON
 *   2. text/html → extract the <script type="application/ld+json"> island
 *      (SolidOS-style HTML WebIDs, e.g. melvin.me)
 *   3. anything else → throw
 */
export async function getJsonLd(url) {
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
    if (!m) throw new Error(`HTML WebID without JSON-LD island (${url})`);
    return parseLooseJson(m[1].trim());
  }
  throw new Error(`pod returned ${ct || "unknown content type"} (need JSON-LD or HTML+island)`);
}

export async function putJsonLd(url, body) {
  const res = await authFetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/ld+json" },
    body: JSON.stringify(body, null, 2),
  });
  if (!res.ok) throw new Error(`PUT ${res.status} ${res.statusText} (${url})`);
  return res;
}

/**
 * Safe PUT for resources that may be served as text/html with a JSON-LD
 * island (SolidOS-style WebIDs like melvin.me). GETs the URL first, and:
 *   - if text/html → splices the new doc into the <script type="application/ld+json">
 *     island and PUTs the entire HTML back with Content-Type: text/html,
 *     preserving every byte outside the island
 *   - otherwise → falls through to a normal JSON-LD PUT
 *
 * Costs one extra GET per save. Only worth using on resources that
 * might be HTML (mainly WebID documents) — JSON-LD-native resources
 * we created (hub/notes, public/tracker, etc.) should stick with putJsonLd.
 */
export async function putJsonLdSmart(url, body) {
  const head = await authFetch(url, { headers: { Accept: "text/html, application/ld+json" } });
  if (!head.ok) throw new Error(`GET (for safe PUT) ${head.status} ${head.statusText} (${url})`);
  const ct = (head.headers.get("content-type") || "").toLowerCase();
  if (ct.includes("text/html")) {
    const html = await head.text();
    const islandRe = /(<script\s+type=["']application\/ld\+json["']\s*>)([\s\S]*?)(<\/script>)/i;
    if (!islandRe.test(html)) throw new Error("HTML response with no JSON-LD island — refusing to overwrite");
    const newJson = "\n" + JSON.stringify(body, null, 2) + "\n";
    const newHtml = html.replace(islandRe, (_, open, _old, close) => open + newJson + close);
    const res = await authFetch(url, {
      method: "PUT",
      headers: { "Content-Type": "text/html" },
      body: newHtml,
    });
    if (!res.ok) throw new Error(`PUT (HTML, island-preserved) ${res.status} ${res.statusText}`);
    return res;
  }
  return putJsonLd(url, body);
}

export async function deleteResource(url) {
  const res = await authFetch(url, { method: "DELETE" });
  if (!res.ok && res.status !== 404) throw new Error(`DELETE ${res.status} ${res.statusText} (${url})`);
  return res;
}

/** Try to fetch any resource (returns text + content-type). Used for arbitrary file types. */
export async function getRaw(url) {
  const res = await authFetch(url, { headers: { Accept: "*/*" } });
  if (!res.ok) throw new Error(`GET ${res.status} ${res.statusText} (${url})`);
  return { ct: res.headers.get("content-type") || "", text: await res.text(), ok: res.ok };
}

// ---- Profile (WebID) normalization ---------------------------------------

const PROFILE_PREDS = {
  name:     ["name", "foaf:name", FOAF_NS + "name", "vcard:fn", VCARD_NS + "fn"],
  nick:     ["nick", "foaf:nick", FOAF_NS + "nick"],
  email:    ["email", "foaf:mbox", FOAF_NS + "mbox", "vcard:hasEmail", VCARD_NS + "hasEmail"],
  homepage: ["homepage", "foaf:homepage", FOAF_NS + "homepage", "vcard:hasURL", VCARD_NS + "hasURL"],
  img:      ["img", "foaf:img", FOAF_NS + "img", "foaf:depiction", FOAF_NS + "depiction", "vcard:hasPhoto", VCARD_NS + "hasPhoto"],
  bio:      ["description", "schema:description", "vcard:note", VCARD_NS + "note", "bio:olb"],
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

/** Find the relevant subject in a JSON-LD doc (handles @graph, fragment id, top-level). */
function findSubject(doc, fragmentId) {
  const graph = Array.isArray(doc["@graph"]) ? doc["@graph"]
              : Array.isArray(doc) ? doc
              : [doc];
  if (fragmentId) {
    const m = graph.find(n => (n["@id"] || "").endsWith("#" + fragmentId));
    if (m) return m;
  }
  return graph[0];
}

/**
 * JSON.parse but tolerant of trailing commas. SolidOS-style HTML WebIDs
 * occasionally have trailing commas in their JSON-LD island — we accept
 * that to be useful. Note: we don't strip JS line comments because they
 * collide with `http://` URLs inside string values.
 */
function parseLooseJson(s) {
  try { return JSON.parse(s); }
  catch {
    const cleaned = s.replace(/,(\s*[\}\]])/g, "$1");
    try { return JSON.parse(cleaned); }
    catch (e) { throw new Error(`JSON-LD parse failed: ${e.message}`); }
  }
}

/** True if `s` parses as an absolute http(s) URL. */
function isHttpUrl(s) {
  if (typeof s !== "string") return false;
  try { const u = new URL(s); return u.protocol === "http:" || u.protocol === "https:"; }
  catch { return false; }
}

export async function fetchWebIdProfile(webid) {
  if (!isHttpUrl(webid)) return null;
  const url = webid.replace(/#.*$/, "");
  const doc = await getJsonLd(url);
  if (!doc) return null;
  const frag = webid.includes("#") ? webid.split("#")[1] : null;
  return normalizeProfile(findSubject(doc, frag));
}

// ---- Pod root + storage discovery ----------------------------------------

/**
 * Best-effort pod storage URL for a given WebID. Tries pim:storage on the
 * WebID document; falls back to the WebID's origin (works for many
 * Solid pod servers where the user's storage is the origin root).
 */
export async function discoverStorage(webid) {
  if (!isHttpUrl(webid)) return null;
  try {
    const url = webid.replace(/#.*$/, "");
    const doc = await getJsonLd(url);
    if (doc) {
      const subj = findSubject(doc, webid.includes("#") ? webid.split("#")[1] : null);
      const v = subj["pim:storage"] ?? subj[PIM_NS + "storage"] ?? subj["space:storage"] ?? subj["storage"];
      const id = valueOf(v);
      if (id) {
        // Resolve relative URLs (e.g. "./") against the WebID document URL.
        try {
          const abs = new URL(id, url).href;
          return abs.replace(/\/?$/, "/");
        } catch { return id.replace(/\/?$/, "/"); }
      }
    }
  } catch {}
  // fallback: webid origin + slash
  try { return new URL(webid).origin + "/"; } catch { return null; }
}

/** Convenience: derive `<storage>/hub/` and ensure trailing slash. */
export function hubRoot(storage) {
  if (!storage) return null;
  return storage.replace(/\/?$/, "/") + "hub/";
}

// ---- LDP container helpers -----------------------------------------------

/**
 * List members of an LDP BasicContainer at a JSON-LD URL.
 * Returns array of { url, type } where type is one of "container" | "resource".
 */
export async function listContainer(url) {
  const doc = await getJsonLd(url);
  if (!doc) return [];
  const subj = findSubject(doc, null);
  const contains = subj["ldp:contains"] ?? subj[LDP_NS + "contains"] ?? subj["contains"];
  if (!contains) return [];
  const arr = Array.isArray(contains) ? contains : [contains];
  return arr.map(item => {
    const id = valueOf(item) || item;
    const type = (typeof item === "object" && item["@type"]) || null;
    const isContainer = id?.endsWith("/") || /Container/i.test(JSON.stringify(type || ""));
    return { url: id, type: isContainer ? "container" : "resource" };
  }).filter(x => x.url);
}

/** Create an LDP container at the given URL (HTTP PUT with link header). */
export async function ensureContainer(url) {
  const u = url.replace(/\/?$/, "/");
  const head = await authFetch(u, { method: "HEAD" }).catch(() => null);
  if (head && head.ok) return; // already exists
  const res = await authFetch(u, {
    method: "PUT",
    headers: {
      "Content-Type": "text/turtle",
      "Link": '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"',
    },
    body: "",
  });
  if (!res.ok && res.status !== 409) throw new Error(`ensureContainer ${res.status} ${res.statusText}`);
}

// ---- Helpers -------------------------------------------------------------

// ---- TypeIndex discovery -------------------------------------------------
// Same shape as pilot's fetchTypeIndex — the canonical Solid pattern for
// discovering where each @type's data lives. We delegate to the user's
// solid:publicTypeIndex; we don't hardcode container paths.

export const TRACKER_CLASS = "http://www.w3.org/2005/01/wf/flow#Tracker";
// Common @type IRIs used to register image collections in a Solid TypeIndex.
// We accept any of these — pods vary in which they use.
export const IMAGE_CLASSES = [
  "http://schema.org/ImageGallery",
  "http://schema.org/Photograph",
  "http://schema.org/Photo",
  "http://schema.org/ImageObject",
  "http://xmlns.com/foaf/0.1/Image",
];

export const NOTE_CLASSES = [
  "http://schema.org/TextDocument",
  "http://schema.org/Article",
  "http://schema.org/CreativeWork",
];

export const CALENDAR_CLASSES = [
  "http://www.w3.org/2002/12/cal/ical#Vcalendar",
  "http://www.w3.org/2002/12/cal/ical#Vevent",
  "http://schema.org/Event",
];

export const LIST_CLASSES = [
  "http://schema.org/ItemList",
  "https://schema.org/ItemList",
];

// SolidOS-style bookmark vocabulary. The `bookmark:recalls` predicate
// links the Bookmark resource to the URL it represents.
export const BOOKMARK_CLASSES = [
  "http://www.w3.org/2002/01/bookmark#Bookmark",
];

// ActivityStreams Note — short text post. Used by ActivityPub feeds and
// any app posting microblog-shaped content to a pod.
export const POST_CLASSES = [
  "https://www.w3.org/ns/activitystreams#Note",
  "http://www.w3.org/ns/activitystreams#Note",
];

// urn:solid:App — provisional class for "an installed app on this pod."
// Each app is a URL to an ES module conforming to hub-pod's app interface
// (meta + render). Used as the forClass on a TypeRegistration whose
// solid:instance points at the apps list doc.
export const APP_CLASS = "urn:solid:App";

// urn:solid:PaneDefaults — provisional class for "this user's chosen
// default pane per RDF class." A single doc on the pod, registered in
// the TypeIndex, mapping classIRI → paneId.
export const PANE_DEFAULTS_CLASS = "urn:solid:PaneDefaults";

const SOLID_TERMS = "http://www.w3.org/ns/solid/terms#";

const idOf = (v) => typeof v === "string" ? v : (v && v["@id"]) || null;

/**
 * Fetch and flatten the user's public TypeIndex. Returns
 *   { typeIndexUrl, registrations: [{ forClass, instance, instanceContainer }] }
 *
 * Robust to:
 *   - JSS/SolidOS profiles that alias the predicate as a bare key
 *   - HTML WebIDs with embedded JSON-LD islands (handled by getJsonLd)
 *   - Registrations nested under @graph or schema:itemListElement
 */
export async function fetchTypeIndex(webid) {
  if (!isHttpUrl(webid)) throw new Error("WebID is not an http(s) URL");
  const webIdDoc = await getJsonLd(webid.replace(/#.*$/, ""));
  if (!webIdDoc) throw new Error("WebID document not found");
  const subj = findSubject(webIdDoc, webid.includes("#") ? webid.split("#")[1] : null);

  const tiRef = subj["solid:publicTypeIndex"]
             ?? subj[SOLID_TERMS + "publicTypeIndex"]
             ?? subj["publicTypeIndex"];
  const tiId = idOf(tiRef);
  if (!tiId) throw new Error("no solid:publicTypeIndex on WebID");
  const tiUrl = new URL(tiId, webid).href;

  const ti = await getJsonLd(tiUrl);
  if (!ti) throw new Error("TypeIndex returned no document");

  // Walk the doc collecting any subject with solid:forClass.
  const nodes = [];
  const collect = (x) => {
    if (!x || typeof x !== "object") return;
    if (Array.isArray(x)) { x.forEach(collect); return; }
    if (x["solid:forClass"] || x[SOLID_TERMS + "forClass"]) nodes.push(x);
    for (const v of Object.values(x)) if (typeof v === "object") collect(v);
  };
  collect(ti);

  const registrations = nodes.map(n => ({
    forClass:          idOf(n["solid:forClass"]          ?? n[SOLID_TERMS + "forClass"]),
    instance:          idOf(n["solid:instance"]          ?? n[SOLID_TERMS + "instance"]),
    instanceContainer: idOf(n["solid:instanceContainer"] ?? n[SOLID_TERMS + "instanceContainer"]),
    // urn:solid:view — the SolidOS pane convention. Per urn-solid.com, links
    // a resource or class to an ES module URL whose default export renders it.
    // Accept the full URN, a bare-key alias, and the w3id solidos sameAs IRI.
    view:              idOf(n["urn:solid:view"] ?? n["view"] ?? n["http://w3id.org/solidos#view"]),
  })).filter(r => r.forClass && (r.instance || r.instanceContainer));

  // Resolve any relative URLs against the TypeIndex URL.
  registrations.forEach(r => {
    if (r.instance && !/^https?:/.test(r.instance)) r.instance = new URL(r.instance, tiUrl).href;
    if (r.instanceContainer && !/^https?:/.test(r.instanceContainer)) r.instanceContainer = new URL(r.instanceContainer, tiUrl).href;
    if (r.view && !/^https?:/.test(r.view)) r.view = new URL(r.view, tiUrl).href;
  });

  return { typeIndexUrl: tiUrl, registrations };
}

export function findRegistrations(typeIndex, classIri) {
  if (!typeIndex) return [];
  return typeIndex.registrations.filter(r => r.forClass === classIri);
}

// ---- Mutating the TypeIndex ----------------------------------------------

/**
 * Add a solid:TypeRegistration to the TypeIndex at `typeIndexUrl`.
 * Tries the common locations: schema:itemListElement (SolidOS shape),
 * @graph (some pods), or top-level (last resort).
 *
 * Returns the new registration's local @id (e.g. "#reg-abcd12").
 */
/**
 * Remove a TypeRegistration entry from the TypeIndex. Matches by either
 * solid:instance or solid:instanceContainer === url. PUTs the updated
 * doc back. No-op if no matching registration is found.
 */
export async function removeTypeRegistration(typeIndexUrl, url) {
  const doc = await getJsonLd(typeIndexUrl);
  if (!doc) throw new Error(`TypeIndex not found at ${typeIndexUrl}`);
  const idOf = (v) => typeof v === "string" ? v : v?.["@id"];
  const matches = (reg) => {
    const inst = idOf(reg["solid:instance"] ?? reg["http://www.w3.org/ns/solid/terms#instance"]);
    const cont = idOf(reg["solid:instanceContainer"] ?? reg["http://www.w3.org/ns/solid/terms#instanceContainer"]);
    return inst === url || cont === url;
  };
  let removed = false;
  for (const key of ["schema:itemListElement", "@graph"]) {
    if (Array.isArray(doc[key])) {
      const before = doc[key].length;
      doc[key] = doc[key].filter(reg => !matches(reg));
      if (doc[key].length < before) removed = true;
    }
  }
  if (!removed) return false;
  await putJsonLd(typeIndexUrl, doc);
  return true;
}

/**
 * Delete a registered resource end-to-end: remove the TypeIndex entry,
 * and (if purgeData) also DELETE the underlying file. Returns whether
 * the registration was found and removed.
 */
export async function deleteRegisteredResource({ webid, url, purgeData }) {
  const ti = await fetchTypeIndex(webid);
  const removed = await removeTypeRegistration(ti.typeIndexUrl, url);
  if (purgeData) {
    const fileUrl = url.replace(/#.*$/, "");
    await deleteResource(fileUrl);
  }
  return removed;
}

export async function addTypeRegistration(typeIndexUrl, { forClass, instance, instanceContainer }) {
  const doc = await getJsonLd(typeIndexUrl);
  if (!doc) throw new Error(`TypeIndex not found at ${typeIndexUrl}`);
  const id = "#reg-" + Math.random().toString(36).slice(2, 9);
  const reg = {
    "@id": id,
    "@type": "solid:TypeRegistration",
    "solid:forClass": { "@id": forClass },
  };
  if (instance) reg["solid:instance"] = { "@id": instance };
  if (instanceContainer) reg["solid:instanceContainer"] = { "@id": instanceContainer };

  if (Array.isArray(doc["schema:itemListElement"])) {
    doc["schema:itemListElement"].push(reg);
  } else if (Array.isArray(doc["@graph"])) {
    doc["@graph"].push(reg);
  } else {
    doc["schema:itemListElement"] = [reg];
  }
  await putJsonLd(typeIndexUrl, doc);
  return id;
}

// ---- Per-app create helpers ----------------------------------------------
// Each one creates the resource on the pod and registers it in the user's
// publicTypeIndex so hub's discovery picks it up next render.

function slugify(s) {
  return String(s || "").toLowerCase()
    .replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")
    .replace(/^-|-$/g, "").slice(0, 60);
}

export async function createTracker({ webid, name }) {
  const slug = slugify(name);
  if (!slug) throw new Error("Invalid name");
  const storage = await discoverStorage(webid);
  if (!storage) throw new Error("Couldn't find your pod root");
  const ti = await fetchTypeIndex(webid);
  await ensureContainer(storage + "public/tracker/").catch(() => {});
  const dataUrl = `${storage}public/tracker/${slug}-data.jsonld`;
  const seed = {
    "@context": { "@vocab": "https://w3id.org/workflow#", ical: "http://www.w3.org/2002/12/cal/ical#" },
    "@id": "#this",
    "@type": "Tracker",
    title: name,
    issue: [],
  };
  await putJsonLd(dataUrl, seed);
  await addTypeRegistration(ti.typeIndexUrl, { forClass: TRACKER_CLASS, instance: dataUrl + "#this" });
  return { url: dataUrl + "#this" };
}

export async function createList({ webid, name }) {
  const slug = slugify(name);
  if (!slug) throw new Error("Invalid name");
  const storage = await discoverStorage(webid);
  if (!storage) throw new Error("Couldn't find your pod root");
  const ti = await fetchTypeIndex(webid);
  await ensureContainer(storage + "public/todo/").catch(() => {});
  const dataUrl = `${storage}public/todo/${slug}.jsonld`;
  const seed = {
    "@context": { schema: "https://schema.org/" },
    "@id": "#this",
    "@type": "schema:ItemList",
    "schema:name": name,
    "schema:itemListElement": [],
  };
  await putJsonLd(dataUrl, seed);
  await addTypeRegistration(ti.typeIndexUrl, {
    forClass: LIST_CLASSES[0],
    instance: dataUrl + "#this",
  });
  return { url: dataUrl + "#this" };
}

export async function createNotebook({ webid, name }) {
  const slug = slugify(name);
  if (!slug) throw new Error("Invalid name");
  const storage = await discoverStorage(webid);
  if (!storage) throw new Error("Couldn't find your pod root");
  const ti = await fetchTypeIndex(webid);
  const containerUrl = `${storage}hub/notes/${slug}/`;
  await ensureContainer(`${storage}hub/`).catch(() => {});
  await ensureContainer(`${storage}hub/notes/`).catch(() => {});
  await ensureContainer(containerUrl);
  await addTypeRegistration(ti.typeIndexUrl, { forClass: NOTE_CLASSES[0], instanceContainer: containerUrl });
  return { url: containerUrl };
}

export async function createCalendar({ webid, name }) {
  const slug = slugify(name);
  if (!slug) throw new Error("Invalid name");
  const storage = await discoverStorage(webid);
  if (!storage) throw new Error("Couldn't find your pod root");
  const ti = await fetchTypeIndex(webid);
  const containerUrl = `${storage}hub/calendar/${slug}/`;
  await ensureContainer(`${storage}hub/`).catch(() => {});
  await ensureContainer(`${storage}hub/calendar/`).catch(() => {});
  await ensureContainer(containerUrl);
  await addTypeRegistration(ti.typeIndexUrl, { forClass: CALENDAR_CLASSES[0], instanceContainer: containerUrl });
  return { url: containerUrl };
}

export async function createGallery({ webid, name }) {
  const slug = slugify(name);
  if (!slug) throw new Error("Invalid name");
  const storage = await discoverStorage(webid);
  if (!storage) throw new Error("Couldn't find your pod root");
  const ti = await fetchTypeIndex(webid);
  const containerUrl = `${storage}hub/photos/${slug}/`;
  await ensureContainer(`${storage}hub/`).catch(() => {});
  await ensureContainer(`${storage}hub/photos/`).catch(() => {});
  await ensureContainer(containerUrl);
  await addTypeRegistration(ti.typeIndexUrl, { forClass: IMAGE_CLASSES[0], instanceContainer: containerUrl });
  return { url: containerUrl };
}

/**
 * Ensure /hub/bookmarks/ exists and is registered in the TypeIndex with
 * forClass: bookmark:Bookmark. Idempotent. Returns the container URL.
 */
export async function ensureBookmarksContainer(webid) {
  const storage = await discoverStorage(webid);
  if (!storage) throw new Error("Couldn't find your pod root");
  const containerUrl = `${storage}hub/bookmarks/`;
  await ensureContainer(`${storage}hub/`).catch(() => {});
  await ensureContainer(containerUrl);
  const ti = await fetchTypeIndex(webid);
  const has = ti.registrations.some(r => r.forClass === BOOKMARK_CLASSES[0] && r.instanceContainer);
  if (!has) {
    await addTypeRegistration(ti.typeIndexUrl, {
      forClass: BOOKMARK_CLASSES[0],
      instanceContainer: containerUrl,
    });
  }
  return containerUrl;
}

/**
 * Create one bookmark resource on the pod. Adds a registration if no
 * Bookmark container is registered yet.
 */
export async function createBookmark({ webid, title, url, description }) {
  const containerUrl = await ensureBookmarksContainer(webid);
  const slug = slugify(title || new URL(url).hostname) || ("bm-" + Date.now());
  const docUrl = containerUrl + slug + ".jsonld";
  const doc = {
    "@context": {
      "bookmark": "http://www.w3.org/2002/01/bookmark#",
      "dc": "http://purl.org/dc/elements/1.1/",
      "dcterms": "http://purl.org/dc/terms/",
    },
    "@id": "#this",
    "@type": "bookmark:Bookmark",
    "dc:title": title || url,
    "bookmark:recalls": { "@id": url },
    "dc:description": description || "",
    "dcterms:created": new Date().toISOString(),
  };
  await putJsonLd(docUrl, doc);
  return { url: docUrl + "#this" };
}

// ---- Pod-stored apps list (urn:solid:App) ----------------------------------
// The user's "installed apps" live in a single JSON-LD doc on the pod,
// registered in their TypeIndex with forClass: urn:solid:App. The doc shape
// is schema:ItemList — each itemListElement is { @id: <module URL> }.
// Rationale: one-doc keeps TypeIndex tidy; sharing a list = sharing one URL.

const APPS_DOC_PATH = "hub/apps/list.jsonld";

function appsDocUrl(storage) {
  return storage + APPS_DOC_PATH;
}

/**
 * Find the apps-list registration in a TypeIndex, fetch the doc, and
 * return the list of app URLs. Returns null if the registration is
 * missing — caller should treat that as "not yet synced to pod" and
 * fall back to localStorage.
 */
export async function getAppsList(webid) {
  const ti = await fetchTypeIndex(webid).catch(() => null);
  if (!ti) return null;
  const reg = ti.registrations.find(r => r.forClass === APP_CLASS && r.instance);
  if (!reg) return null;
  const doc = await getJsonLd(reg.instance.replace(/#.*$/, "")).catch(() => null);
  if (!doc) return { url: reg.instance, items: [] };
  const subj = findSubject(doc, reg.instance.includes("#") ? reg.instance.split("#")[1] : null);
  const elements = subj["schema:itemListElement"]
                ?? subj["http://schema.org/itemListElement"]
                ?? subj["https://schema.org/itemListElement"]
                ?? subj["itemListElement"]
                ?? [];
  const arr = Array.isArray(elements) ? elements : [elements];
  const items = arr.map(e => idOf(e)).filter(Boolean);
  return { url: reg.instance, items };
}

/**
 * Write the apps list to the pod and ensure a TypeRegistration points
 * at it. Idempotent — call any time. Returns the doc URL.
 */
export async function saveAppsList(webid, urls) {
  const storage = await discoverStorage(webid);
  if (!storage) throw new Error("Couldn't find your pod root");
  await ensureContainer(`${storage}hub/`).catch(() => {});
  await ensureContainer(`${storage}hub/apps/`).catch(() => {});
  const dataUrl = appsDocUrl(storage);
  const doc = {
    "@context": { "schema": "https://schema.org/", "urn": "urn:solid:" },
    "@id": "#this",
    "@type": "schema:ItemList",
    "schema:name": "Installed apps",
    "schema:itemListElement": (urls || []).map(u => ({ "@id": u, "@type": "urn:App" })),
  };
  await putJsonLd(dataUrl, doc);

  // Add the registration if not already present.
  const ti = await fetchTypeIndex(webid).catch(() => null);
  const has = ti?.registrations.some(r => r.forClass === APP_CLASS && r.instance);
  if (ti && !has) {
    await addTypeRegistration(ti.typeIndexUrl, {
      forClass: APP_CLASS,
      instance: dataUrl + "#this",
    });
  }
  return dataUrl + "#this";
}

// ---- Pod-stored pane defaults (urn:solid:PaneDefaults) ---------------------
// Same pattern as apps list — single JSON-LD doc on the pod registered with
// forClass: urn:solid:PaneDefaults. Each itemListElement carries
// schema:about (the class IRI) and schema:identifier (the chosen pane id).

const PANE_DEFAULTS_DOC_PATH = "hub/prefs/pane-defaults.jsonld";

function paneDefaultsDocUrl(storage) {
  return storage + PANE_DEFAULTS_DOC_PATH;
}

/**
 * Read the user's pane defaults map from the pod. Returns null when no
 * registration exists (treat as "not synced yet"). Returns
 * { url, defaults: {classIRI: paneId} } when found.
 */
export async function getPaneDefaults(webid) {
  const ti = await fetchTypeIndex(webid).catch(() => null);
  if (!ti) return null;
  const reg = ti.registrations.find(r => r.forClass === PANE_DEFAULTS_CLASS && r.instance);
  if (!reg) return null;
  const doc = await getJsonLd(reg.instance.replace(/#.*$/, "")).catch(() => null);
  if (!doc) return { url: reg.instance, defaults: {} };
  const subj = findSubject(doc, reg.instance.includes("#") ? reg.instance.split("#")[1] : null);
  const elements = subj["schema:itemListElement"]
                ?? subj["http://schema.org/itemListElement"]
                ?? subj["https://schema.org/itemListElement"]
                ?? subj["itemListElement"]
                ?? [];
  const arr = Array.isArray(elements) ? elements : [elements];
  const defaults = {};
  for (const e of arr) {
    if (!e || typeof e !== "object") continue;
    const cls = idOf(e["schema:about"] ?? e["http://schema.org/about"] ?? e["about"]);
    const pid = e["schema:identifier"] ?? e["http://schema.org/identifier"] ?? e["identifier"];
    if (typeof cls === "string" && typeof pid === "string") defaults[cls] = pid;
  }
  return { url: reg.instance, defaults };
}

/**
 * Write the pane defaults map to the pod and ensure a TypeRegistration
 * points at it. Idempotent.
 */
export async function savePaneDefaults(webid, defaults) {
  const storage = await discoverStorage(webid);
  if (!storage) throw new Error("Couldn't find your pod root");
  await ensureContainer(`${storage}hub/`).catch(() => {});
  await ensureContainer(`${storage}hub/prefs/`).catch(() => {});
  const dataUrl = paneDefaultsDocUrl(storage);
  const entries = Object.entries(defaults || {});
  const doc = {
    "@context": { "schema": "https://schema.org/", "urn": "urn:solid:" },
    "@id": "#this",
    "@type": "urn:PaneDefaults",
    "schema:name": "Pane defaults (per-class chosen pane)",
    "schema:itemListElement": entries.map(([cls, pid]) => ({
      "schema:about": { "@id": cls },
      "schema:identifier": pid,
    })),
  };
  await putJsonLd(dataUrl, doc);
  const ti = await fetchTypeIndex(webid).catch(() => null);
  const has = ti?.registrations.some(r => r.forClass === PANE_DEFAULTS_CLASS && r.instance);
  if (ti && !has) {
    await addTypeRegistration(ti.typeIndexUrl, {
      forClass: PANE_DEFAULTS_CLASS,
      instance: dataUrl + "#this",
    });
  }
  return dataUrl + "#this";
}

/** Convert a fetcher 404 to null at higher level. Internal use. */
export { findSubject, valueOf, normalizeProfile };
