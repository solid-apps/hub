/**
 * note.js — pane for schema:TextDocument and friends.
 *
 * Renders one markdown-style note with click-to-edit title + body
 * (debounced PUT) and a delete button. Emits onChange after a
 * successful save and onDelete after a successful DELETE so the
 * surrounding app can refresh its list.
 *
 * Visually identical to the inline reader this replaces — same
 * .note-reader markup so theme and layout carry over exactly.
 */

import { putJsonLd, deleteResource, NOTE_CLASSES } from "../pod.js";
import { ICON, escape, fmtRel, debounce, showToast, $ } from "../ui.js";

export const meta = {
  id: "hub-pod/note",
  name: "Note (markdown)",
  forClasses: NOTE_CLASSES,
};

export function canHandle(input) {
  if (NOTE_CLASSES.includes(input?.forClass)) return true;
  const t = input?.doc?.["@type"];
  const matches = (s) =>
    s === "TextDocument" ||
    s === "Article" ||
    s === "CreativeWork" ||
    (typeof s === "string" && /[#/](TextDocument|Article|CreativeWork)$/.test(s));
  if (typeof t === "string") return matches(t);
  if (Array.isArray(t)) return t.some(matches);
  return false;
}

export async function render(input, container, _ctx) {
  const { url, doc, onChange, onDelete } = input;
  if (!doc) {
    container.innerHTML = `<div class="empty">Failed to load note: <code>${escape(url)}</code></div>`;
    return;
  }

  const save = debounce(async () => {
    doc.headline = container.querySelector("#note-title")?.value ?? doc.headline;
    doc.text = container.querySelector("#note-body")?.value ?? doc.text;
    doc.datePublished = new Date().toISOString();
    setStatus("saving");
    try {
      await putJsonLd(url, doc);
      setStatus("saved");
      onChange?.();
    } catch (e) {
      setStatus("err", e.message);
    }
  }, 600);

  draw();

  function draw() {
    container.innerHTML = `
      <div class="meta">
        <span><b style="color:var(--text)">Saved</b> · <span id="save-status" class="saved">in sync</span></span>
        <span style="color:var(--text-faint)">${escape(fmtRel(doc.datePublished))}</span>
        <span style="color:var(--text-faint);font-family:var(--mono);font-size:11px;margin-left:auto">${escape(url)}</span>
        <button class="btn danger" id="del-note" title="Delete">${ICON.trash}</button>
      </div>
      <input class="title" id="note-title" value="${escape(doc.headline || "")}" placeholder="Untitled note" />
      <textarea class="body" id="note-body" placeholder="Write in markdown — supports # headers, **bold**, *italic*, [links](url), and images.">${escape(doc.text || "")}</textarea>
    `;
    container.querySelector("#note-title").addEventListener("input", save);
    container.querySelector("#note-body").addEventListener("input", save);
    container.querySelector("#del-note").addEventListener("click", async () => {
      if (!confirm("Delete this note?")) return;
      try {
        await deleteResource(url);
        showToast("Deleted", "success");
        onDelete?.();
      } catch (e) {
        showToast("Delete failed: " + e.message, "error");
      }
    });
  }

  function setStatus(kind, msg) {
    const el = container.querySelector("#save-status");
    if (!el) return;
    if (kind === "saving") { el.className = "saving"; el.textContent = "saving…"; }
    else if (kind === "saved") { el.className = "saved"; el.textContent = "in sync"; }
    else if (kind === "err") { el.className = "err"; el.textContent = "save error: " + (msg || ""); }
  }
}
