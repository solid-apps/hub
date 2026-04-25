/**
 * Activity — synthesized timeline across apps.
 *
 * Pulls recent items from notes, tasks, events; flattens to a single
 * chronological stream grouped by day.
 */

import { listContainer, getJsonLd, hubRoot, discoverStorage } from "../pod.js";
import { ICON, escape, $, requireSolid } from "../ui.js";

export async function render(container, ctx) {
  if (requireSolid(container, ctx, "Activity is synthesized from changes to your hub-pod data on a Solid pod.")) return;
  container.innerHTML = `<div class="content"><div class="activity-page" id="activity-page">
    <h1>Activity</h1>
    <p class="lede">Recent changes across your hub-pod apps.</p>
    <div id="activity-stream"><div class="spinner"></div></div>
  </div></div>`;

  const storage = await discoverStorage(ctx.auth.id).catch(() => null);
  if (!storage) return;
  const root = hubRoot(storage);
  const items = [];

  // Notes
  try {
    const notes = await listContainer(root + "notes/");
    await Promise.all(notes.filter(m => m.type === "resource" && /\.jsonld$/.test(m.url)).map(async m => {
      const d = await getJsonLd(m.url).catch(() => null);
      if (d?.datePublished) items.push({
        ts: d.datePublished, app: "notes", icon: ICON.notes,
        text: `wrote <a data-go="notes">${escape(d.headline || "(untitled note)")}</a>`,
      });
    }));
  } catch {}

  // Tasks (each completed/created)
  try {
    const tasks = await getJsonLd(root + "tasks/list.jsonld").catch(() => null);
    if (tasks?.issue) {
      tasks.issue.forEach(t => {
        if (t.created) items.push({
          ts: t.created, app: "tasks", icon: ICON.tasks,
          text: `added task <a data-go="tasks">${escape(t.summary)}</a>`,
        });
        if (t.completed) items.push({
          ts: t.completed, app: "tasks", icon: ICON.check,
          text: `completed <a data-go="tasks">${escape(t.summary)}</a>`,
        });
      });
    }
  } catch {}

  // Events (creation isn't separately tracked; use dtstart as a proxy)
  try {
    const events = await listContainer(root + "calendar/");
    await Promise.all(events.filter(m => m.type === "resource" && /\.jsonld$/.test(m.url)).map(async m => {
      const d = await getJsonLd(m.url).catch(() => null);
      if (d?.dtstart) items.push({
        ts: d.dtstart, app: "calendar", icon: ICON.calendar,
        text: `event <a data-go="calendar">${escape(d.summary || "(event)")}</a>`,
      });
    }));
  } catch {}

  items.sort((a, b) => (b.ts || "").localeCompare(a.ts || ""));

  if (!items.length) {
    $("#activity-stream").innerHTML = `<div class="empty"><div>No activity yet.</div><div style="margin-top:8px;font-size:13px">Create some notes, tasks, or events to populate your stream.</div></div>`;
    return;
  }

  // Group by day
  const days = new Map();
  items.forEach(it => {
    const day = dayLabel(it.ts);
    if (!days.has(day)) days.set(day, []);
    days.get(day).push(it);
  });

  $("#activity-stream").innerHTML = [...days.entries()].map(([day, list]) => `
    <div class="activity-day">
      <div class="dlabel">${escape(day)}</div>
      <div class="activity-stream">
        ${list.map(it => `
          <div class="act-item">
            <div class="act-icon">${it.icon}</div>
            <div class="act-body">
              ${it.text}
              <span class="when">${escape(timeOf(it.ts))}</span>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `).join("");

  $("#activity-stream").querySelectorAll("[data-go]").forEach(el => {
    el.addEventListener("click", () => ctx.switchApp(el.dataset.go));
  });
}

function dayLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  if (sameDay(d, today)) return "Today";
  const yest = new Date(today.getTime() - 86400000);
  if (sameDay(d, yest)) return "Yesterday";
  const diff = Math.floor((today - d) / 86400000);
  if (diff > 0 && diff < 7) return `${diff} days ago`;
  if (diff < 0) return d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
}
function timeOf(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export const meta = { name: "Activity", icon: ICON.activity, hasSidebar: false };
