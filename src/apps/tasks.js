/**
 * Tasks — kanban-style tracker, one JSON-LD file with embedded issue array.
 *
 * Shape (SolidOS tracker convention #1, same as pilot's tracker-pane):
 *   {
 *     "@context": { "@vocab": "https://w3id.org/workflow#", "ical": "http://www.w3.org/2002/12/cal/ical#" },
 *     "@id": "...",
 *     "@type": "Tracker",
 *     "title": "...",
 *     "issue": [
 *       { "@type": "Vtodo", "summary": "task text", "status": "open" | "completed", "created": ISO, "uid": "..." }
 *     ]
 *   }
 *
 * Container path: <pod>/hub/tasks/list.jsonld  (single tracker for v1).
 */

import { getJsonLd, putJsonLd, ensureContainer, hubRoot, discoverStorage } from "../pod.js";
import { ICON, escape, fmtRel, showToast, renderSpinner, renderEmpty, $, $$, debounce, requireSolid } from "../ui.js";

let url = null;
let doc = null;
let saveTimer = null;

export function sidebar(ctx) {
  return `
    <div class="sidebar-head"><h2>Tasks</h2></div>
    <div class="sidebar-body">
      <div class="sb-section">
        <button class="sb-item active">${ICON.tasks} <span>This list</span><span class="count" id="task-count">…</span></button>
      </div>
      <div class="sb-section">
        <div class="sb-label">Filters</div>
        <button class="sb-item" data-filter="all">All</button>
        <button class="sb-item" data-filter="open">Open</button>
        <button class="sb-item" data-filter="done">Done</button>
      </div>
    </div>
  `;
}

export async function render(container, ctx) {
  if (requireSolid(container, ctx, "Your task list is stored as JSON-LD at /hub/tasks/list.jsonld on your Solid pod.")) return;
  container.innerHTML = `<div class="content"><div class="tasks-page" id="tasks-page"></div></div>`;
  const page = $("#tasks-page");
  renderSpinner(page);

  const storage = await discoverStorage(ctx.auth.id).catch(() => null);
  if (!storage) { renderEmpty(page, { title: "Couldn't find your pod root" }); return; }
  const dir = hubRoot(storage) + "tasks/";
  url = dir + "list.jsonld";

  await ensureContainer(dir).catch(() => {});

  try {
    doc = await getJsonLd(url);
  } catch (e) {
    if (!String(e.message).includes("404")) {
      renderEmpty(page, { title: "Couldn't load tasks", body: e.message });
      return;
    }
  }
  if (!doc) {
    doc = {
      "@context": { "@vocab": "https://w3id.org/workflow#", "ical": "http://www.w3.org/2002/12/cal/ical#" },
      "@id": url,
      "@type": "Tracker",
      "title": "My tasks",
      "issue": [],
    };
    // Don't write yet — wait for first edit.
  }

  draw();
}

function draw(filter = "all") {
  const page = $("#tasks-page");
  if (!page) return;
  const items = doc.issue || [];
  const visible = items.filter(t => {
    if (filter === "open") return t.status !== "completed";
    if (filter === "done") return t.status === "completed";
    return true;
  });
  const done = items.filter(t => t.status === "completed").length;
  const total = items.length;
  const pct = total ? Math.round(done / total * 100) : 0;

  page.innerHTML = `
    <div class="tlist-card">
      <div class="tlist-head">
        <h2 contenteditable="true" id="tlist-title">${escape(doc.title || "My tasks")}</h2>
        <div class="tlist-progress">${done}/${total} · ${pct}%</div>
      </div>
      <div id="task-rows">
        ${visible.length === 0
          ? `<div style="color:var(--text-faint);padding:14px 8px;font-size:13px">No tasks${filter === "open" ? " open" : filter === "done" ? " done" : ""}.</div>`
          : visible.map(taskRow).join("")}
      </div>
      <div class="task-add">
        <input id="task-new" placeholder="Add a task and press Enter" />
        <button class="btn primary" id="task-add-btn">Add</button>
      </div>
    </div>
  `;

  const sbCount = $("#task-count");
  if (sbCount) sbCount.textContent = total ? `${done}/${total}` : "0";

  $$("[data-filter]").forEach(el => el.addEventListener("click", () => {
    $$("[data-filter]").forEach(b => b.classList.toggle("active", b === el));
    draw(el.dataset.filter);
  }));

  $$(".task-row .check").forEach(el => el.addEventListener("click", () => {
    const uid = el.parentNode.dataset.uid;
    const t = doc.issue.find(x => x.uid === uid);
    if (!t) return;
    t.status = t.status === "completed" ? "open" : "completed";
    if (t.status === "completed") t.completed = new Date().toISOString();
    save();
    draw(filter);
  }));

  $$(".task-row .lbl").forEach(el => el.addEventListener("dblclick", () => {
    const uid = el.parentNode.dataset.uid;
    const t = doc.issue.find(x => x.uid === uid);
    if (!t) return;
    el.innerHTML = `<input type="text" value="${escape(t.summary)}" />`;
    const input = el.querySelector("input");
    input.focus();
    input.select();
    const finish = () => {
      t.summary = input.value.trim() || t.summary;
      save();
      draw(filter);
    };
    input.addEventListener("blur", finish);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); input.blur(); }
      if (e.key === "Escape") { draw(filter); }
    });
  }));

  $$(".task-row .del").forEach(el => el.addEventListener("click", () => {
    const uid = el.parentNode.dataset.uid;
    doc.issue = doc.issue.filter(x => x.uid !== uid);
    save();
    draw(filter);
  }));

  const newInput = $("#task-new");
  newInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); addTask(); }
  });
  $("#task-add-btn")?.addEventListener("click", addTask);

  const titleEl = $("#tlist-title");
  titleEl?.addEventListener("blur", () => {
    const t = titleEl.textContent.trim();
    if (t && t !== doc.title) { doc.title = t; save(); }
  });
}

function taskRow(t) {
  const done = t.status === "completed";
  return `
    <div class="task-row ${done ? "done" : ""}" data-uid="${escape(t.uid)}">
      <span class="check">${ICON.check}</span>
      <span class="lbl">${escape(t.summary)}</span>
      <button class="del" title="Delete">×</button>
    </div>
  `;
}

function addTask() {
  const input = $("#task-new");
  const text = input.value.trim();
  if (!text) return;
  const uid = "t-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
  doc.issue = doc.issue || [];
  doc.issue.push({
    "@type": "Vtodo",
    uid,
    summary: text,
    status: "open",
    created: new Date().toISOString(),
  });
  input.value = "";
  save();
  draw();
  setTimeout(() => $("#task-new")?.focus(), 0);
}

const save = debounce(async () => {
  try {
    await putJsonLd(url, doc);
  } catch (e) {
    showToast("Save failed: " + e.message, "error");
  }
}, 400);

export const meta = { name: "Tasks", icon: ICON.tasks, hasSidebar: true };
