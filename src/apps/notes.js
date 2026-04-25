/**
 * Notes — markdown notes, one JSON-LD resource per note.
 *
 * Container: <pod>/hub/notes/
 * Each note: <pod>/hub/notes/<id>.jsonld with shape:
 *   {
 *     "@context": { "@vocab": "https://schema.org/" },
 *     "@id": "...",
 *     "@type": "TextDocument",
 *     "headline": "...",
 *     "datePublished": "ISO",
 *     "encodingFormat": "text/markdown",
 *     "text": "..."
 *   }
 */

import { listContainer, getJsonLd, putJsonLd, deleteResource, ensureContainer, hubRoot, discoverStorage } from "../pod.js";
import { ICON, escape, fmtRel, showToast, renderSpinner, renderEmpty, $, $$, debounce, requireSolid } from "../ui.js";

let storage = null;
let dir = null;
let cache = new Map(); // url → note doc
let active = null;
let saveTimer = null;

export function sidebar(ctx) {
  return `
    <div class="sidebar-head">
      <h2>Notes</h2>
      <button class="btn primary" id="new-note">${ICON.plus}</button>
    </div>
    <div class="sidebar-body" id="notes-sb-list">
      <div class="spinner"></div>
    </div>
  `;
}

export async function render(container, ctx) {
  if (requireSolid(container, ctx, "Notes are stored as JSON-LD in /hub/notes/ on your Solid pod.")) return;
  container.innerHTML = `<div class="content"><div class="notes-layout">
    <div class="notes-list" id="notes-list"><div class="spinner"></div></div>
    <div class="note-reader" id="note-reader"><div class="empty">Pick a note or create a new one.</div></div>
  </div></div>`;

  storage = await discoverStorage(ctx.auth.id).catch(() => null);
  if (!storage) {
    renderEmpty($("#notes-list"), { title: "Couldn't find your pod root" });
    return;
  }
  dir = hubRoot(storage) + "notes/";

  await ensureContainer(dir).catch(() => {});
  await loadList();

  $("#new-note")?.addEventListener("click", newNote);
  document.getElementById("notes-sb-list")?.addEventListener("click", (e) => {
    const row = e.target.closest("[data-note]");
    if (row) openNote(row.dataset.note);
  });
}

async function loadList() {
  let members;
  try {
    members = await listContainer(dir);
  } catch (e) {
    renderEmpty($("#notes-list"), { title: "Couldn't list notes", body: e.message });
    return;
  }

  // Fetch each note's metadata
  const notes = [];
  await Promise.all(members
    .filter(m => m.type === "resource" && /\.jsonld$/.test(m.url))
    .map(async m => {
      try {
        const doc = await getJsonLd(m.url);
        if (doc) {
          cache.set(m.url, doc);
          notes.push({ url: m.url, doc });
        }
      } catch {}
    }));

  notes.sort((a, b) => (b.doc.datePublished || "").localeCompare(a.doc.datePublished || ""));
  renderList(notes);
  if (!active && notes.length) openNote(notes[0].url);
  else if (!notes.length) renderEmpty($("#notes-list"), { title: "No notes yet", body: "Click + to create your first." });
}

function renderList(notes) {
  const list = $("#notes-list");
  if (!list) return;
  if (!notes.length) {
    list.innerHTML = `<div class="empty"><div>No notes yet</div><div style="margin-top:8px;font-size:13px">Click <b>+</b> in the sidebar to create one.</div></div>`;
  } else {
    list.innerHTML = notes.map(n => `
      <div class="note-item ${n.url === active ? "active" : ""}" data-note="${escape(n.url)}">
        <div class="nt">${escape(n.doc.headline || "(untitled)")}</div>
        <div class="np">${escape((n.doc.text || "").slice(0, 110).replace(/[#*`>\n]/g, " "))}</div>
        <div style="margin-top:6px;font-size:11px;color:var(--text-faint);font-family:var(--mono)">${escape(fmtRel(n.doc.datePublished))}</div>
      </div>
    `).join("");
  }
  $$("[data-note]", list).forEach(el => el.addEventListener("click", () => openNote(el.dataset.note)));

  // Mirror to sidebar
  const sb = $("#notes-sb-list");
  if (sb) {
    if (!notes.length) {
      sb.innerHTML = `<div style="padding:18px;color:var(--text-faint);font-size:13px">No notes yet.</div>`;
    } else {
      sb.innerHTML = notes.map(n => `
        <button class="sb-item ${n.url === active ? "active" : ""}" data-note="${escape(n.url)}">
          ${ICON.notes}
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escape(n.doc.headline || "(untitled)")}</span>
        </button>
      `).join("");
    }
  }
}

async function openNote(url) {
  active = url;
  let doc = cache.get(url);
  if (!doc) {
    try { doc = await getJsonLd(url); cache.set(url, doc); }
    catch (e) { showToast("Failed to load note: " + e.message, "error"); return; }
  }
  // Refresh sidebar/main list to show the active highlight
  const notesArr = [...cache.entries()].map(([u, d]) => ({ url: u, doc: d })).sort((a, b) => (b.doc.datePublished || "").localeCompare(a.doc.datePublished || ""));
  renderList(notesArr);

  const reader = $("#note-reader");
  reader.innerHTML = `
    <div class="meta">
      <span><b style="color:var(--text)">Saved</b> · <span id="save-status" class="saved">in sync</span></span>
      <span style="color:var(--text-faint)">${escape(fmtRel(doc.datePublished))}</span>
      <button class="btn danger" id="del-note" style="margin-left:auto">${ICON.trash} Delete</button>
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
      // Re-render the list (preview + time updates)
      const arr = [...cache.entries()].map(([u, d]) => ({ url: u, doc: d })).sort((a, b) => (b.doc.datePublished || "").localeCompare(a.doc.datePublished || ""));
      renderList(arr);
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
      active = null;
      showToast("Deleted", "success");
      await loadList();
      $("#note-reader").innerHTML = `<div class="empty">Pick a note or create a new one.</div>`;
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
  const id = "note-" + new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const url = dir + id + ".jsonld";
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
    showToast("Note created", "success");
    await loadList();
    openNote(url);
    setTimeout(() => $("#note-title")?.focus(), 50);
  } catch (e) {
    showToast("Create failed: " + e.message, "error");
  }
}

function loginPrompt(msg) {
  return `<div class="content"><div class="page-pad">
    <div class="login-banner">
      <div class="ico">${ICON.user}</div>
      <div class="info"><strong>Sign in to your pod</strong><span>${escape(msg)}</span></div>
    </div>
  </div></div>`;
}

export const meta = { name: "Notes", icon: ICON.notes, hasSidebar: true };
