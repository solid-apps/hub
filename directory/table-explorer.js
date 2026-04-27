/**
 * table-explorer.js — table-style LDP container browser.
 *
 * Renders an ldp:Container as a four-column table (Name · Type · Size ·
 * Modified) — closer to what a native pod folder UI shows. Self-contained:
 * fetches its own listing via ctx.fetch (or window.fetch), parses JSON-LD
 * directly. No dependency on a particular host's helpers.
 *
 * SLIP-48 / LOSOS shape. Disambiguates via rawData.view: yields to
 * tile/grid panes when the host signals "tile" context (a parent
 * container rendering this folder as a single card).
 *
 * Distributed via solid-apps/registry → installable on any host that
 * implements SLIP-48.
 */

export const label = "Table Explorer";
export const icon  = "📋";
export const meta = {
  id: "solid-apps/table-explorer",
  name: "Table Explorer (LDP container)",
  forClass: "http://www.w3.org/ns/ldp#Container",
};

const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const LDP_CONTAINER = "http://www.w3.org/ns/ldp#Container";

export function canHandle(subject, store, rawData) {
  if (subject?.termType && subject.termType !== "NamedNode") return false;
  if (!subject?.value || !store?.statementsMatching) return false;
  if (rawData?.view === "tile") return false;
  const stmts = store.statementsMatching(subject, undefined, undefined);
  return stmts.some(s =>
    s.predicate?.value === RDF_TYPE && s.object?.value === LDP_CONTAINER
  );
}

export async function render(subject, _store, container, _rawData, ctx) {
  const url = subject?.value;
  injectStyles();
  container.innerHTML = `<div class="te-spinner"><div class="spinner"></div></div>`;

  let items, fetchErr;
  try {
    items = await loadListing(url, ctx);
  } catch (e) {
    fetchErr = e;
  }

  if (fetchErr) {
    container.innerHTML = `<div class="te-empty">
      <div class="te-empty-title" style="color:var(--danger)">Couldn't list this container</div>
      <div class="te-empty-body">${escapeHtml(fetchErr.message)}</div>
      <div class="te-empty-body" style="margin-top:6px;font-family:var(--mono);font-size:11px">${escapeHtml(url)}</div>
    </div>`;
    return;
  }

  const folders = items.filter(it => it.type === "container").length;
  const files = items.length - folders;

  container.innerHTML = `
    <div class="te-card">
      <div class="te-head">
        <div class="te-name">${escapeHtml(decodeURIComponent(url.replace(/\/$/, "").split("/").pop() || url))}</div>
        <div class="te-url">${escapeHtml(url)}</div>
        <div class="te-counts">${folders} folder${folders === 1 ? "" : "s"} · ${files} file${files === 1 ? "" : "s"}</div>
      </div>
      ${items.length ? `
        <table class="te-table">
          <thead>
            <tr>
              <th class="te-col-name">NAME</th>
              <th class="te-col-type">TYPE</th>
              <th class="te-col-size">SIZE</th>
              <th class="te-col-mod">MODIFIED</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(it => row(it)).join("")}
          </tbody>
        </table>
      ` : `<div class="te-empty"><div class="te-empty-title">Empty container</div></div>`}
    </div>
  `;

  container.querySelectorAll("[data-row-url]").forEach(tr => {
    tr.addEventListener("click", () => {
      const u = tr.dataset.rowUrl;
      const t = tr.dataset.rowType;
      if (t === "container") {
        tr.dispatchEvent(new CustomEvent("pane:open", { detail: { url: u, type: t }, bubbles: true }));
      } else {
        window.open(u, "_blank");
      }
    });
  });
}

async function loadListing(url, ctx) {
  const fetcher = ctx?.fetch || window.fetch.bind(window);
  const r = await fetcher(url, {
    headers: { Accept: "application/ld+json, text/turtle;q=0.5" },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const ct = r.headers.get("content-type") || "";
  const body = await r.text();

  if (ct.includes("turtle")) return parseTurtleListing(body, url);
  // JSON-LD path
  let doc;
  try { doc = JSON.parse(body); }
  catch (e) { throw new Error("response wasn't valid JSON-LD: " + e.message); }
  return parseJsonLdListing(doc, url);
}

function parseJsonLdListing(doc, baseUrl) {
  // Walk @graph or use top-level. Find a node whose @id matches the
  // container URL (or the first container we see).
  const nodes = Array.isArray(doc?.["@graph"]) ? doc["@graph"] : [doc];
  const container = nodes.find(n =>
    (n["@id"] === baseUrl || resolveUrl(n["@id"], baseUrl) === baseUrl) ||
    typeAsArray(n["@type"]).some(t => /Container$/.test(t))
  ) || nodes[0];
  if (!container) return [];

  const rawContains = container["contains"]
                   ?? container["ldp:contains"]
                   ?? container["http://www.w3.org/ns/ldp#contains"]
                   ?? [];
  const arr = Array.isArray(rawContains) ? rawContains : [rawContains];
  return arr.map(c => normaliseMember(c, nodes, baseUrl)).filter(Boolean);
}

function normaliseMember(c, nodes, baseUrl) {
  if (!c) return null;
  let url, types = [], size, modified;
  if (typeof c === "string") { url = c; }
  else {
    url = c["@id"];
    types = typeAsArray(c["@type"]);
    size = c["stat:size"] ?? c["http://www.w3.org/ns/posix/stat#size"] ?? c["size"];
    modified = c["dcterms:modified"] ?? c["http://purl.org/dc/terms/modified"] ?? c["dc:modified"] ?? c["modified"];
  }
  if (!url) return null;
  url = resolveUrl(url, baseUrl);

  // If we just have a URL reference, find the matching node in @graph
  // for richer metadata (stat:size, dcterms:modified, full @type list).
  if ((!size || !modified || !types.length) && nodes) {
    const node = nodes.find(n => n["@id"] === url || resolveUrl(n["@id"], baseUrl) === url);
    if (node) {
      types = types.length ? types : typeAsArray(node["@type"]);
      size = size ?? node["stat:size"] ?? node["http://www.w3.org/ns/posix/stat#size"];
      modified = modified ?? node["dcterms:modified"] ?? node["http://purl.org/dc/terms/modified"] ?? node["dc:modified"];
    }
  }

  const isContainer = types.some(t => /(?:#|\/)(?:BasicContainer|Container)$/.test(t)) || url.endsWith("/");
  return { url, type: isContainer ? "container" : "resource", size, modified };
}

function parseTurtleListing(body, baseUrl) {
  // Minimal Turtle line-walker — looks for ldp:contains entries and
  // per-resource stat:size + dc:modified properties. Not a full Turtle
  // parser — relies on the typical "one-statement-per-line" formatting
  // that pod servers emit. JSON-LD path is preferred.
  const lines = body.replace(/\r/g, "").split("\n");
  const containerUrls = new Set();
  for (const line of lines) {
    if (/ldp:contains/.test(line) || /<http:\/\/www\.w3\.org\/ns\/ldp#contains>/.test(line)) {
      const urls = (line.match(/<([^>]+)>/g) || []).map(s => s.slice(1, -1));
      for (const u of urls) if (u !== baseUrl) containerUrls.add(resolveUrl(u, baseUrl));
    }
  }
  const items = [];
  for (const u of containerUrls) {
    let size, modified, type = "resource";
    const re = new RegExp(`<${u.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}>([^.]*)\\.`, "g");
    let m;
    while ((m = re.exec(body))) {
      const block = m[1];
      const sm = block.match(/posix\/stat#size>?\s+(\d+)/);
      if (sm) size = parseInt(sm[1], 10);
      const dm = block.match(/dc(?:terms)?:modified\s+"([^"]+)"/);
      if (dm) modified = dm[1];
      if (/BasicContainer|ldp:Container/.test(block)) type = "container";
    }
    if (u.endsWith("/")) type = "container";
    items.push({ url: u, type, size, modified });
  }
  return items;
}

function row(it) {
  const name = decodeURIComponent(it.url.replace(/\/$/, "").split("/").pop() || it.url);
  const ext = it.type === "container" ? "" : (name.split(".").pop() || "").toUpperCase();
  const icon = it.type === "container" ? "📁" : iconForExt(name);
  const typeLabel = it.type === "container" ? "Folder" : (ext || "—");
  return `
    <tr data-row-url="${escapeHtml(it.url)}" data-row-type="${it.type}">
      <td class="te-col-name">
        <span class="te-icon">${icon}</span>
        <span class="te-name-text">${escapeHtml(name)}</span>
      </td>
      <td class="te-col-type">${escapeHtml(typeLabel)}</td>
      <td class="te-col-size">${it.size != null ? fmtBytes(it.size) : "—"}</td>
      <td class="te-col-mod">${it.modified ? fmtDate(it.modified) : "—"}</td>
    </tr>
  `;
}

function iconForExt(name) {
  if (/\.(png|jpe?g|gif|webp|svg|avif)$/i.test(name)) return "🖼";
  if (/\.(mp3|ogg|wav|flac)$/i.test(name)) return "🎵";
  if (/\.(jsonld|json|ttl|n3)$/i.test(name)) return "🔗";
  if (/\.(js|ts|css|html?)$/i.test(name)) return "📄";
  if (/\.(md|txt)$/i.test(name)) return "📝";
  if (/\.pdf$/i.test(name)) return "📕";
  return "📄";
}

function fmtBytes(n) {
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  if (n < 1024 * 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + " MB";
  return (n / 1024 / 1024 / 1024).toFixed(2) + " GB";
}
function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}
function typeAsArray(t) {
  if (!t) return [];
  return Array.isArray(t) ? t : [t];
}
function resolveUrl(href, base) {
  try { return new URL(href, base).href; } catch { return href; }
}
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
}

function injectStyles() {
  if (document.getElementById("table-explorer-css")) return;
  const s = document.createElement("style");
  s.id = "table-explorer-css";
  s.textContent = `
.te-spinner { display: grid; place-items: center; padding: 60px 0; }
.te-empty { padding: 32px 24px; text-align: center; color: var(--text-faint); }
.te-empty-title { font-size: 15px; color: var(--text); margin-bottom: 4px; }
.te-empty-body { font-size: 13px; }
.te-card { background: var(--bg-elev); border: 1px solid var(--line); border-radius: 12px; margin: 18px 0; overflow: hidden; box-shadow: var(--shadow); }
.te-head { padding: 22px 24px 18px; border-bottom: 1px solid var(--line); }
.te-name { font: 700 22px var(--sans); letter-spacing: -0.01em; color: var(--text); margin-bottom: 4px; }
.te-url { font: 12px var(--mono); color: var(--text-faint); word-break: break-all; margin-bottom: 8px; }
.te-counts { font: 13px var(--sans); color: var(--text-dim); }
.te-table { width: 100%; border-collapse: collapse; }
.te-table thead th { text-align: left; padding: 10px 16px; font: 600 11px var(--mono); color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid var(--line); }
.te-table tbody tr { cursor: pointer; transition: background .12s; }
.te-table tbody tr:hover { background: var(--bg-elev-2); }
.te-table tbody tr + tr td { border-top: 1px solid var(--line); }
.te-table td { padding: 12px 16px; font: 14px var(--sans); color: var(--text); vertical-align: middle; }
.te-col-name { display: flex; align-items: center; gap: 10px; }
.te-icon { font-size: 18px; }
.te-name-text { color: var(--accent); }
.te-col-type, .te-col-size, .te-col-mod { color: var(--text-dim); white-space: nowrap; font: 13px var(--mono); }
.te-col-size { text-align: right; }
.te-col-mod { width: 200px; }
@media (max-width: 760px) {
  .te-col-type, .te-col-size { display: none; }
}
`;
  document.head.appendChild(s);
}

export default { label, icon, canHandle, render };
