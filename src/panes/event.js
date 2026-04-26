/**
 * event.js — pane for ical:Vevent / schema:Event detail.
 *
 * Renders one event with editable summary, time, location, and a
 * delete button. Save on edit (debounced PUT). Used by Calendar
 * when a chip on the month grid is clicked.
 */

import { putJsonLd, deleteResource, CALENDAR_CLASSES } from "../pod.js";
import { ICON, escape, debounce, showToast } from "../ui.js";

export const meta = {
  id: "hub-pod/event",
  name: "Event detail",
  forClasses: CALENDAR_CLASSES,
};

export function canHandle(input) {
  if (CALENDAR_CLASSES.includes(input?.forClass)) return true;
  const t = input?.doc?.["@type"];
  const matches = (s) =>
    s === "Vevent" || s === "Event" ||
    (typeof s === "string" && /[#/](Vevent|Event)$/.test(s));
  if (typeof t === "string") return matches(t);
  if (Array.isArray(t)) return t.some(matches);
  return !!input?.doc?.dtstart;
}

export async function render(input, container, _ctx) {
  const { url, doc, onChange, onDelete } = input;
  if (!doc) {
    container.innerHTML = `<div class="empty">Failed to load event</div>`;
    return;
  }

  const save = debounce(async () => {
    doc.summary = container.querySelector("#ev-summary")?.value ?? doc.summary;
    doc.location = container.querySelector("#ev-location")?.value ?? doc.location;
    try {
      await putJsonLd(url.replace(/#.*$/, ""), doc);
      onChange?.();
    } catch (e) {
      showToast("Save failed: " + e.message, "error");
    }
  }, 600);

  const dt = new Date(doc.dtstart);
  const dtLabel = isNaN(dt) ? (doc.dtstart || "") : dt.toLocaleString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
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
      onDelete?.();
    } catch (e) {
      showToast("Delete failed: " + e.message, "error");
    }
  });
}
