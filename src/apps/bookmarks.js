/**
 * Bookmarks app — discovers bookmark:Bookmark instances via the user's
 * TypeIndex, lists them, and delegates per-bookmark editing to the
 * BookmarkPane. + New flow creates a bookmark resource and registers
 * the container in TypeIndex on first use (mirrors createNotebook etc.).
 *
 * Layout: list view (cards) ↔ detail view (BookmarkPane). Switches in
 * place rather than splitting columns; bookmarks are short, full-width
 * editing reads better.
 */

import {
  fetchTypeIndex, BOOKMARK_CLASSES,
  listContainer, getJsonLd,
  createBookmark,
} from "../pod.js";
import { findFor } from "../panes.js";
import { ICON, escape, fmtRel, showToast, $, $$, requireSolid } from "../ui.js";

let bookmarks = [];

export const meta = {
  id: "bookmarks",
  name: "Bookmarks",
  icon: "🔖",
  hasSidebar: false,
};

export async function render(container, ctx) {
  if (requireSolid(container, ctx, "Bookmarks discovers bookmark:Bookmark instances via your TypeIndex.")) return;

  container.innerHTML = `<div class="content"><div class="page-pad" id="bm-page">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
      <h1 style="margin:0">Bookmarks</h1>
      <span id="bm-count" style="color:var(--text-faint);font:12px var(--mono)"></span>
      <button class="btn primary" id="bm-new" style="margin-left:auto">${ICON.plus} New</button>
    </div>
    <div id="bm-body"><div class="spinner"></div></div>
  </div></div>`;

  $("#bm-new").addEventListener("click", () => promptCreate(ctx));

  await load(ctx);
}

async function load(ctx) {
  const body = $("#bm-body");
  const count = $("#bm-count");
  bookmarks = [];

  let typeIndex;
  try { typeIndex = await fetchTypeIndex(ctx.auth.id); }
  catch (e) {
    body.innerHTML = `<div class="card" style="color:var(--text-dim)">
      <div style="color:var(--danger);margin-bottom:8px"><strong>Couldn't read your TypeIndex.</strong></div>
      <div style="font-size:13px">${escape(e.message)}</div>
    </div>`;
    return;
  }

  const regs = typeIndex.registrations.filter(r =>
    BOOKMARK_CLASSES.includes(r.forClass) && r.instanceContainer
  );
  if (!regs.length) {
    body.innerHTML = `<div class="card" style="color:var(--text-dim);text-align:center;padding:32px 24px;max-width:640px;margin:0 auto">
      <div style="font-size:15px;color:var(--text);margin-bottom:6px">No bookmark collection yet.</div>
      <div style="font-size:13px;margin-bottom:18px">Hub will create <code>/public/bookmark/</code> on your pod and register it as a <code>bookmark:Bookmark</code> instance container in your TypeIndex.</div>
      <button class="btn primary" id="bm-empty-new">${ICON.plus} Create your first bookmark</button>
    </div>`;
    $("#bm-empty-new").addEventListener("click", () => promptCreate(ctx));
    count.textContent = "";
    return;
  }

  // Load all bookmarks across all registered containers in parallel.
  for (const reg of regs) {
    try {
      const items = await listContainer(reg.instanceContainer);
      const docs = await Promise.all(items
        .filter(it => it.type === "resource" && /\.jsonld$/.test(it.url))
        .map(async it => {
          try { const doc = await getJsonLd(it.url); return doc ? { url: it.url + "#this", doc } : null; }
          catch { return null; }
        }));
      for (const d of docs.filter(Boolean)) bookmarks.push(d);
    } catch { /* skip unreachable container */ }
  }

  // Most recent first
  bookmarks.sort((a, b) => {
    const da = a.doc["dcterms:created"] || a.doc["dc:date"] || "";
    const db = b.doc["dcterms:created"] || b.doc["dc:date"] || "";
    return db.localeCompare(da);
  });

  count.textContent = bookmarks.length === 0 ? "" : `${bookmarks.length} saved`;
  drawList(ctx);
}

function drawList(ctx) {
  const body = $("#bm-body");
  if (!bookmarks.length) {
    body.innerHTML = `<div style="padding:32px 24px;text-align:center;color:var(--text-faint);font-size:13px">No bookmarks yet — click + New to add one.</div>`;
    return;
  }
  body.innerHTML = `<div id="bm-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px"></div>`;
  const grid = $("#bm-grid");
  for (const b of bookmarks) {
    const title       = pickKey(b.doc, ["dc:title", "title", "schema:name", "name"]) || "Untitled";
    const recalls     = idOf(pickKey(b.doc, ["bookmark:recalls", "recalls"])) || "";
    const description = pickKey(b.doc, ["dc:description", "description"]) || "";
    const created     = pickKey(b.doc, ["dcterms:created", "dc:date", "created", "schema:dateCreated"]);
    const card = document.createElement("div");
    card.style.cssText = `background:var(--bg-elev);border:1px solid var(--line);border-radius:10px;padding:14px;cursor:pointer;transition:border-color .12s,transform .12s`;
    card.innerHTML = `
      <div style="font-weight:600;font-size:14px;margin-bottom:4px">🔖 ${escape(title)}</div>
      ${recalls ? `<div style="font-size:11px;color:var(--accent);font-family:var(--mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:6px">${escape(recalls)}</div>` : ""}
      ${description ? `<div style="font-size:12px;color:var(--text-dim);line-height:1.4;margin-bottom:6px">${escape(description.slice(0, 140))}${description.length > 140 ? "…" : ""}</div>` : ""}
      ${created ? `<div style="font-size:11px;color:var(--text-faint);font-family:var(--mono)">${escape(fmtRel(created))}</div>` : ""}
    `;
    card.addEventListener("mouseover", () => { card.style.borderColor = "var(--accent)"; card.style.transform = "translateY(-1px)"; });
    card.addEventListener("mouseout",  () => { card.style.borderColor = "var(--line)";   card.style.transform = ""; });
    card.addEventListener("click", () => openDetail(b, ctx));
    grid.appendChild(card);
  }
}

function openDetail(b, ctx) {
  const body = $("#bm-body");
  body.innerHTML = `
    <button class="btn" id="bm-back" style="margin-bottom:12px">← Back to list</button>
    <div id="bm-detail"></div>
  `;
  $("#bm-back").addEventListener("click", () => drawList(ctx));
  const slot = $("#bm-detail");
  const input = { url: b.url, doc: b.doc, forClass: BOOKMARK_CLASSES[0] };
  const pane = findFor(input);
  if (!pane) {
    slot.innerHTML = `<div class="empty">No pane registered for bookmarks.</div>`;
    return;
  }
  // Wire change/delete callbacks so the list refreshes after an edit.
  pane.render({
    ...input,
    onChange: () => load(ctx),
    onDelete: () => { showToast("Bookmark deleted", "success"); load(ctx); },
  }, slot, ctx);
}

async function promptCreate(ctx) {
  const url = prompt("Bookmark URL:");
  if (!url) return;
  let validated;
  try { validated = new URL(url).href; }
  catch { showToast("Not a valid URL", "error"); return; }
  const title = prompt("Title (optional):", "") || "";
  showToast("Creating bookmark…");
  try {
    await createBookmark({ webid: ctx.auth.id, title, url: validated });
    showToast("Bookmark added", "success");
    await load(ctx);
  } catch (e) {
    showToast("Create failed: " + e.message, "error");
  }
}

function pickKey(obj, keys) {
  for (const k of keys) if (obj?.[k] !== undefined) return obj[k];
  return undefined;
}
function idOf(v) {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && v["@id"]) return v["@id"];
  return null;
}
