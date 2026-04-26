/**
 * Notes app — discovers notebooks via solid:publicTypeIndex, owns
 * the chrome (sidebar + note list), and delegates per-note rendering
 * to the registered pane (see src/panes/note.js).
 */

import {
  fetchTypeIndex, NOTE_CLASSES,
  listContainer, getJsonLd, putJsonLd,
  createNotebook,
} from "../pod.js";
import { findFor } from "../panes.js";
import { ICON, escape, fmtRel, showToast, $, $$, requireSolid } from "../ui.js";

let typeIndex = null;
let notebooks = [];   // [{ url, label, kind, notes: [{url, doc}] }]
let active = null;
let cache = new Map();

export function sidebar(_ctx) {
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
  lastCtx = ctx;

  container.innerHTML = `<div class="content"><div class="notes-layout">
    <div class="notes-list" id="notes-list"><div class="spinner"></div></div>
    <div class="note-reader" id="note-reader"><div class="empty">Pick a note or create a new one.</div></div>
  </div></div>`;

  notebooks = [];
  cache = new Map();
  active = null;

  try { typeIndex = await fetchTypeIndex(ctx.auth.id); }
  catch (e) { renderTypeIndexError(e); return; }

  const regs = typeIndex.registrations.filter(r =>
    NOTE_CLASSES.includes(r.forClass) && (r.instance || r.instanceContainer)
  );
  if (!regs.length) {
    renderNoRegistrations();
    $("#empty-new-notebook-btn")?.addEventListener("click", () => promptCreateNotebook(ctx));
    return;
  }

  notebooks = await Promise.all(regs.map(resolveNotebook));

  drawList();
  renderSidebar();

  $("#new-note")?.removeAttribute("disabled");
  $("#new-note")?.addEventListener("click", () => newNote(ctx));

  // Open the first available note
  const firstNote = notebooks.flatMap(nb => nb.notes)[0];
  if (firstNote) openNote(firstNote.url, firstNote.doc, regForNote(firstNote.url), ctx);
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
        forClass: reg.forClass,
        notes: notes.sort((a, b) => (b.doc.datePublished || "").localeCompare(a.doc.datePublished || "")),
      };
    } catch (e) {
      return { url: reg.instanceContainer, label: shortLabel(reg.instanceContainer, "container"), kind: "container", forClass: reg.forClass, notes: [], error: e.message };
    }
  }
  try {
    const doc = await getJsonLd(reg.instance.replace(/#.*$/, ""));
    if (doc) cache.set(reg.instance, doc);
    return {
      url: reg.instance,
      label: shortLabel(reg.instance, "instance"),
      kind: "instance",
      forClass: reg.forClass,
      notes: doc ? [{ url: reg.instance, doc }] : [],
    };
  } catch (e) {
    return { url: reg.instance, label: shortLabel(reg.instance, "instance"), kind: "instance", forClass: reg.forClass, notes: [], error: e.message };
  }
}

function regForNote(noteUrl) {
  return notebooks.find(nb => nb.notes.some(n => n.url === noteUrl))?.forClass;
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
  if (notebooks.length === 1) {
    list.innerHTML = notebooks[0].notes.map(noteRow).join("");
  } else {
    list.innerHTML = notebooks.map(nb => `
      <div style="padding:6px 14px 4px;font-size:11px;font-weight:600;color:var(--text-faint);text-transform:uppercase;letter-spacing:.06em;background:var(--bg);position:sticky;top:0">${escape(nb.label)} <span style="font-family:var(--mono);font-weight:400">· ${nb.notes.length}</span></div>
      ${nb.notes.map(noteRow).join("")}
    `).join("");
  }
  $$("[data-note]", list).forEach(el => {
    el.addEventListener("click", () => {
      const url = el.dataset.note;
      const doc = cache.get(url);
      const ctx = lastCtx;
      openNote(url, doc, regForNote(url), ctx);
    });
  });
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
  if (!sb || !typeIndex) return;
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
      <button class="sb-item" id="new-notebook-btn" style="color:var(--accent)">
        ${ICON.plus}
        <span>New notebook</span>
      </button>
    </div>
    <div class="sb-section">
      <div class="sb-label">TypeIndex</div>
      <div style="padding:6px 18px;font-size:11px;font-family:var(--mono);color:var(--text-faint);word-break:break-all">${escape(typeIndex.typeIndexUrl)}</div>
    </div>
  `;
  $("#new-notebook-btn")?.addEventListener("click", () => promptCreateNotebook(lastCtx));
}

let lastCtx = null;

async function openNote(url, doc, forClass, ctx) {
  lastCtx = ctx;
  active = url;
  drawList();

  if (!doc) {
    try { doc = await getJsonLd(url); cache.set(url, doc); }
    catch (e) { showToast("Failed to load note: " + e.message, "error"); return; }
  }

  const reader = $("#note-reader");
  const pane = findFor({ url, doc, forClass });
  if (!pane) {
    reader.innerHTML = `<div class="empty">No pane registered for this note's @type.<div style="margin-top:6px;font-family:var(--mono);font-size:11px;color:var(--text-faint)">${escape(url)}</div></div>`;
    return;
  }

  await pane.render({
    url, doc, forClass,
    onChange: () => {
      // Bubble metadata changes back into the list rows.
      drawList();
    },
    onDelete: () => {
      cache.delete(url);
      for (const nb of notebooks) nb.notes = nb.notes.filter(n => n.url !== url);
      active = null;
      drawList();
      $("#note-reader").innerHTML = `<div class="empty">Pick a note or create a new one.</div>`;
    },
  }, reader, ctx);
}

async function newNote(ctx) {
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
    openNote(url, doc, nb.forClass, ctx);
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
      .replace(/-data\.jsonld$/, "").replace(/\.jsonld$/, "");
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
    <div class="card" style="color:var(--text-dim);max-width:640px;text-align:center;padding:32px 24px">
      <div style="font-size:15px;color:var(--text);margin-bottom:6px">No notebooks yet.</div>
      <div style="font-size:13px;margin-bottom:18px">Hub will create a container under <code>/hub/notes/</code> on your pod and register it as a <code>schema:TextDocument</code> instance container in your TypeIndex.</div>
      <button class="btn primary" id="empty-new-notebook-btn">${ICON.plus} Create your first notebook</button>
      <div style="margin-top:18px;font-size:12px;color:var(--text-faint)">Or add a TypeRegistration manually with one of: ${NOTE_CLASSES.map(c => `<code>${escape(c)}</code>`).join(", ")}</div>
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

async function promptCreateNotebook(ctx) {
  if (!ctx) return;
  const name = prompt("Notebook name (e.g. \"Daily\", \"Ideas\"):");
  if (!name || !name.trim()) return;
  showToast("Creating notebook…");
  try {
    await createNotebook({ webid: ctx.auth.id, name: name.trim() });
    showToast("Notebook created", "success");
    ctx.switchApp("notes");
  } catch (e) {
    showToast("Create failed: " + e.message, "error");
  }
}

export const meta = { name: "Notes", icon: ICON.notes, hasSidebar: true };
