/**
 * Notes — markdown notes, discovered via solid:publicTypeIndex.
 *
 * Looks for any TypeRegistration whose forClass is a known note class
 * (schema:TextDocument, schema:Article, schema:CreativeWork). For each
 * registration:
 *   - solid:instanceContainer → a notebook (LDP container of notes)
 *   - solid:instance         → treated as a single notebook holding one note
 *
 * Each note is itself a JSON-LD resource:
 *   {
 *     "@context": { "@vocab": "https://schema.org/" },
 *     "@type": "TextDocument",
 *     "headline": "...",
 *     "datePublished": ISO,
 *     "encodingFormat": "text/markdown",
 *     "text": "..."
 *   }
 *
 * No hardcoded /hub/notes/ — Notes shows what your pod says it has.
 */

import {
  fetchTypeIndex, NOTE_CLASSES,
  listContainer, getJsonLd, putJsonLd, deleteResource,
} from "../pod.js";
import { ICON, escape, fmtRel, showToast, renderEmpty, $, $$, debounce, requireSolid } from "../ui.js";

let typeIndex = null;
let notebooks = [];   // [{ url, label, kind, notes: [{url, doc}] }]
let active = null;    // active note URL
let cache = new Map(); // note url → doc

export function sidebar(ctx) {
  return `
    <div class="sidebar-head">
      <h2>Notes</h2>
      <button class="btn primary" id="new-note" title="New note" disabled>${ICON.plus}</button>
    </div>
    <div class="sidebar-body" id="notes-sb">
      <div style="padding:14px;color:var(--text-faint);font-size:13px">Loading…</div>
    </div>
  `;
}

export async function render(container, ctx) {
  if (requireSolid(container, ctx, "Notes discovers notebooks via solid:publicTypeIndex.")) return;

  container.innerHTML = `<div class="content"><div class="notes-layout">
    <div class="notes-list" id="notes-list"><div class="spinner"></div></div>
    <div class="note-reader" id="note-reader"><div class="empty">Pick a note or create a new one.</div></div>
  </div></div>`;

  notebooks = [];
  cache = new Map();
  active = null;

  try {
    typeIndex = await fetchTypeIndex(ctx.auth.id);
  } catch (e) {
    renderTypeIndexError(e);
    return;
  }

  const regs = typeIndex.registrations.filter(r =>
    NOTE_CLASSES.includes(r.forClass) && (r.instance || r.instanceContainer)
  );

  if (!regs.length) {
    renderNoRegistrations();
    return;
  }

  // Resolve each into a notebook with its notes
  notebooks = await Promise.all(regs.map(resolveNotebook));

  drawList();
  renderSidebar();

  $("#new-note")?.removeAttribute("disabled");
  $("#new-note")?.addEventListener("click", newNote);

  // Open the first available note
  const firstNote = notebooks.flatMap(nb => nb.notes)[0];
  if (firstNote) openNote(firstNote.url);
  else $("#note-reader").innerHTML = `<div class="empty">No notes yet — click + to create one.</div>`;
}

async function resolveNotebook(reg) {
  if (reg.instanceContainer) {
    try {
      const items = await listContainer(reg.instanceContainer);
      const candidates = items.filter(it => it.type === "resource" && /\.jsonld$/.test(it.url));
      const notes = (await Promise.all(candidates.map(async it => {
        try { const doc = await getJsonLd(it.url); return doc ? { url: it.url, doc } : null; }
        catch { return null; }
      }))).filter(Boolean);
      notes.forEach(n => cache.set(n.url, n.doc));
      return {
        url: reg.instanceContainer,
        label: shortLabel(reg.instanceContainer, "container"),
        kind: "container",
        notes: notes.sort((a, b) => (b.doc.datePublished || "").localeCompare(a.doc.datePublished || "")),
      };
    } catch (e) {
      return { url: reg.instanceContainer, label: shortLabel(reg.instanceContainer, "container"), kind: "container", notes: [], error: e.message };
    }
  }
  // instance: a single note doc
  try {
    const doc = await getJsonLd(reg.instance.replace(/#.*$/, ""));
    if (doc) cache.set(reg.instance, doc);
    return {
      url: reg.instance,
      label: shortLabel(reg.instance, "instance"),
      kind: "instance",
      notes: doc ? [{ url: reg.instance, doc }] : [],
    };
  } catch (e) {
    return { url: reg.instance, label: shortLabel(reg.instance, "instance"), kind: "instance", notes: [], error: e.message };
  }
}

function drawList() {
  const list = $("#notes-list");
  if (!list) return;
  const total = notebooks.reduce((s, nb) => s + nb.notes.length, 0);
  if (!total) {
    list.innerHTML = `
      <div class="empty">
        <div>${notebooks.length} notebook${notebooks.length === 1 ? "" : "s"} discovered, but no notes yet.</div>
        <div style="margin-top:8px;font-size:13px">Click + to create your first.</div>
      </div>
    `;
    return;
  }
  // Single notebook → flat list. Multiple → grouped.
  if (notebooks.length === 1) {
    const nb = notebooks[0];
    list.innerHTML = nb.notes.map(n => noteRow(n)).join("");
  } else {
    list.innerHTML = notebooks.map(nb => `
      <div style="padding:6px 14px 4px;font-size:11px;font-weight:600;color:var(--text-faint);text-transform:uppercase;letter-spacing:.06em;background:var(--bg);position:sticky;top:0">${escape(nb.label)} <span style="font-family:var(--mono);font-weight:400">· ${nb.notes.length}</span></div>
      ${nb.notes.map(n => noteRow(n)).join("")}
    `).join("");
  }
  $$("[data-note]", list).forEach(el => el.addEventListener("click", () => openNote(el.dataset.note)));
}

function noteRow(n) {
  return `
    <div class="note-item ${n.url === active ? "active" : ""}" data-note="${escape(n.url)}">
      <div class="nt">${escape(n.doc.headline || "(untitled)")}</div>
      <div class="np">${escape((n.doc.text || "").slice(0, 110).replace(/[#*`>\n]/g, " "))}</div>
      <div style="margin-top:6px;font-size:11px;color:var(--text-faint);font-family:var(--mono)">${escape(fmtRel(n.doc.datePublished))}</div>
    </div>
  `;
}

function renderSidebar() {
  const sb = $("#notes-sb");
  if (!sb) return;
  if (!typeIndex) {
    sb.innerHTML = `<div style="padding:14px;color:var(--text-faint);font-size:13px">No TypeIndex.</div>`;
    return;
  }
  if (!notebooks.length) {
    sb.innerHTML = `
      <div class="sb-section">
        <div class="sb-label">Discovered</div>
        <div style="padding:6px 18px;font-size:13px;color:var(--text-faint)">No notebooks</div>
      </div>
      <div class="sb-section">
        <div class="sb-label">TypeIndex</div>
        <div style="padding:6px 18px;font-size:11px;font-family:var(--mono);color:var(--text-faint);word-break:break-all">${escape(typeIndex.typeIndexUrl)}</div>
      </div>
    `;
    return;
  }
  sb.innerHTML = `
    <div class="sb-section">
      <div class="sb-label">Notebooks</div>
      ${notebooks.map(nb => `
        <button class="sb-item" disabled style="opacity:1">
          ${ICON.notes}
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escape(nb.label)}</span>
          <span class="count">${nb.notes.length}</span>
        </button>
      `).join("")}
    </div>
    <div class="sb-section">
      <div class="sb-label">TypeIndex</div>
      <div style="padding:6px 18px;font-size:11px;font-family:var(--mono);color:var(--text-faint);word-break:break-all">${escape(typeIndex.typeIndexUrl)}</div>
    </div>
  `;
}

async function openNote(url) {
  active = url;
  drawList();
  renderSidebar();

  let doc = cache.get(url);
  if (!doc) {
    try { doc = await getJsonLd(url); cache.set(url, doc); }
    catch (e) { showToast("Failed to load note: " + e.message, "error"); return; }
  }

  const reader = $("#note-reader");
  reader.innerHTML = `
    <div class="meta">
      <span><b style="color:var(--text)">Saved</b> · <span id="save-status" class="saved">in sync</span></span>
      <span style="color:var(--text-faint)">${escape(fmtRel(doc.datePublished))}</span>
      <span style="color:var(--text-faint);font-family:var(--mono);font-size:11px;margin-left:auto">${escape(url)}</span>
      <button class="btn danger" id="del-note" title="Delete">${ICON.trash}</button>
    </div>
    <input class="title" id="note-title" value="${escape(doc.headline || "")}" placeholder="Untitled note" />
    <textarea class="body" id="note-body" placeholder="Write in markdown — supports # headers, **bold**, *italic*, [links](url), and images.">${escape(doc.text || "")}</textarea>
  `;

  const title = $("#note-title");
  const body = $("#note-body");
  const save = debounce(async () => {
    doc.headline = title.value;
    doc.text = body.value;
    doc.datePublished = new Date().toISOString();
    cache.set(url, doc);
    setSaveStatus("saving");
    try {
      await putJsonLd(url, doc);
      setSaveStatus("saved");
      // Refresh list metadata for this note
      for (const nb of notebooks) {
        const n = nb.notes.find(x => x.url === url);
        if (n) { n.doc = doc; }
      }
      drawList();
    } catch (e) {
      setSaveStatus("err", e.message);
    }
  }, 600);
  title.addEventListener("input", save);
  body.addEventListener("input", save);

  $("#del-note").addEventListener("click", async () => {
    if (!confirm("Delete this note?")) return;
    try {
      await deleteResource(url);
      cache.delete(url);
      for (const nb of notebooks) nb.notes = nb.notes.filter(n => n.url !== url);
      active = null;
      drawList();
      renderSidebar();
      $("#note-reader").innerHTML = `<div class="empty">Pick a note or create a new one.</div>`;
      showToast("Deleted", "success");
    } catch (e) {
      showToast("Delete failed: " + e.message, "error");
    }
  });
}

function setSaveStatus(kind, msg) {
  const el = $("#save-status");
  if (!el) return;
  if (kind === "saving") { el.className = "saving"; el.textContent = "saving…"; }
  else if (kind === "saved") { el.className = "saved"; el.textContent = "in sync"; }
  else if (kind === "err") { el.className = "err"; el.textContent = "save error: " + (msg || ""); }
}

async function newNote() {
  // Pick the first instanceContainer notebook to create in
  const nb = notebooks.find(n => n.kind === "container");
  if (!nb) {
    showToast("Need a notebook registered with solid:instanceContainer to create new notes", "error");
    return;
  }
  const id = "note-" + new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const url = nb.url.replace(/\/?$/, "/") + id + ".jsonld";
  const doc = {
    "@context": { "@vocab": "https://schema.org/" },
    "@id": url,
    "@type": "TextDocument",
    "headline": "Untitled note",
    "datePublished": new Date().toISOString(),
    "encodingFormat": "text/markdown",
    "text": "",
  };
  try {
    await putJsonLd(url, doc);
    cache.set(url, doc);
    nb.notes.unshift({ url, doc });
    showToast("Note created", "success");
    drawList();
    renderSidebar();
    openNote(url);
    setTimeout(() => $("#note-title")?.focus(), 50);
  } catch (e) {
    showToast("Create failed: " + e.message, "error");
  }
}

function shortLabel(url, kind) {
  if (!url) return "(unknown)";
  try {
    if (kind === "container") {
      const parts = url.replace(/\/$/, "").split("/");
      return decodeURIComponent(parts[parts.length - 1] || url);
    }
    return url.split("#")[0].split("/").pop()
      .replace(/-data\.jsonld$/, "")
      .replace(/\.jsonld$/, "");
  } catch { return url; }
}

function renderTypeIndexError(e) {
  $("#notes-list").innerHTML = `<div class="empty">
    <div style="color:var(--danger)"><strong>Couldn't read TypeIndex</strong></div>
    <div style="margin-top:8px;font-size:13px">${escape(e.message)}</div>
  </div>`;
  const sb = $("#notes-sb");
  if (sb) sb.innerHTML = `<div style="padding:14px;color:var(--text-faint);font-size:13px">${escape(e.message)}</div>`;
}

function renderNoRegistrations() {
  $("#notes-list").innerHTML = "";
  $("#note-reader").innerHTML = `
    <div class="card" style="color:var(--text-dim);max-width:640px">
      <strong>No notebook registered.</strong>
      <p style="margin:8px 0 0;font-size:14px;line-height:1.6">
        To make notes appear here, add a TypeRegistration to your <code>${escape(typeIndex.typeIndexUrl)}</code> pointing at a notebook container or single note. The <code>forClass</code> can be any of:
      </p>
      <ul style="font-family:var(--mono);font-size:12px;color:var(--text-dim);margin:8px 0 0;padding-left:22px">
        ${NOTE_CLASSES.map(c => `<li>${escape(c)}</li>`).join("")}
      </ul>
    </div>
  `;
  const sb = $("#notes-sb");
  if (sb) {
    sb.innerHTML = `
      <div class="sb-section">
        <div class="sb-label">Discovered</div>
        <div style="padding:6px 18px;font-size:13px;color:var(--text-faint)">No notebooks</div>
      </div>
      <div class="sb-section">
        <div class="sb-label">TypeIndex</div>
        <div style="padding:6px 18px;font-size:11px;font-family:var(--mono);color:var(--text-faint);word-break:break-all">${escape(typeIndex.typeIndexUrl)}</div>
      </div>
    `;
  }
}

export const meta = { name: "Notes", icon: ICON.notes, hasSidebar: true };
