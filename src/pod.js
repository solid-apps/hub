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
      const v = subj["pim:storage"] ?? subj[PIM_NS + "storage"] ?? subj["space:storage"];
      const id = valueOf(v);
      if (id) return id.replace(/\/?$/, "/");
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
  })).filter(r => r.forClass && (r.instance || r.instanceContainer));

  // Resolve any relative instance/instanceContainer URLs against the TypeIndex URL.
  registrations.forEach(r => {
    if (r.instance && !/^https?:/.test(r.instance)) r.instance = new URL(r.instance, tiUrl).href;
    if (r.instanceContainer && !/^https?:/.test(r.instanceContainer)) r.instanceContainer = new URL(r.instanceContainer, tiUrl).href;
  });

  return { typeIndexUrl: tiUrl, registrations };
}

export function findRegistrations(typeIndex, classIri) {
  if (!typeIndex) return [];
  return typeIndex.registrations.filter(r => r.forClass === classIri);
}

/** Convert a fetcher 404 to null at higher level. Internal use. */
export { findSubject, valueOf, normalizeProfile };
