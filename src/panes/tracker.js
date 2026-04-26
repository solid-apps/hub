/**
 * tracker.js — pane for wf:Tracker (SolidOS shape #1).
 *
 * Renders a single tracker as a hub-style task card with full CRUD:
 * inline-edit title, toggle/edit/delete tasks, add new tasks. Edits
 * PUT back to the tracker URL via putJsonLd, debounced.
 *
 * Visually identical to the inline renderer this replaces — same
 * .tlist-card / .task-row markup so theme + sizing stay consistent
 * across panes.
 */

import { TRACKER_CLASS, putJsonLd } from "../pod.js";
import { ICON, escape, debounce, showToast, $$ } from "../ui.js";

export const meta = {
  id: "hub-pod/tracker",
  name: "Tracker (kanban)",
  forClass: TRACKER_CLASS,
};

export function canHandle(input) {
  if (input?.forClass === TRACKER_CLASS) return true;
  const t = input?.doc?.["@type"];
  if (typeof t === "string") return t === "Tracker" || t.endsWith("#Tracker");
  if (Array.isArray(t)) return t.some(x => x === "Tracker" || (typeof x === "string" && x.endsWith("#Tracker")));
  return false;
}

export async function render({ url, doc }, container, _ctx) {
  if (!doc) {
    container.innerHTML = `<div class="tlist-card" style="border-color:rgba(239,68,68,.3)">
      <div class="tlist-head"><h2 style="color:var(--danger)">Failed to load tracker</h2></div>
      <div style="font-size:12px;color:var(--text-faint);font-family:var(--mono);word-break:break-all">${escape(url)}</div>
    </div>`;
    return;
  }

  const save = debounce(async () => {
    try {
      await putJsonLd(url.replace(/#.*$/, ""), doc);
    } catch (e) {
      showToast("Save failed: " + e.message, "error");
    }
  }, 500);

  draw();

  function draw() {
    const items = doc.issue || [];
    const done = items.filter(x => x.status === "completed").length;
    const total = items.length;
    const pct = total ? Math.round(done / total * 100) : 0;

    container.innerHTML = `
      <div class="tlist-card">
        <div class="tlist-head">
          <h2 contenteditable="true" data-edit-title>${escape(doc.title || "Untitled tracker")}</h2>
          <div class="tlist-progress">${done}/${total} · ${pct}%</div>
        </div>
        <div data-rows>
          ${items.length === 0
            ? `<div style="color:var(--text-faint);padding:14px 8px;font-size:13px">No items.</div>`
            : items.map(taskRow).join("")}
        </div>
        <div class="task-add">
          <input data-new placeholder="Add a task and press Enter" />
          <button class="btn primary" data-add>Add</button>
        </div>
        <div style="margin-top:10px;font-size:11px;color:var(--text-faint);font-family:var(--mono);word-break:break-all">${escape(url)}</div>
      </div>
    `;
    wire();
  }

  function wire() {
    // title
    const titleEl = container.querySelector("[data-edit-title]");
    titleEl?.addEventListener("blur", () => {
      const v = titleEl.textContent.trim();
      if (v && v !== doc.title) { doc.title = v; save(); }
    });

    // toggle
    $$("[data-check]", container).forEach(el => el.addEventListener("click", () => {
      const uid = el.parentNode.dataset.uid;
      const item = (doc.issue || []).find(x => x.uid === uid);
      if (!item) return;
      item.status = item.status === "completed" ? "open" : "completed";
      if (item.status === "completed") item.completed = new Date().toISOString();
      save();
      draw();
    }));

    // edit label
    $$("[data-lbl]", container).forEach(el => el.addEventListener("dblclick", () => {
      const uid = el.parentNode.dataset.uid;
      const item = (doc.issue || []).find(x => x.uid === uid);
      if (!item) return;
      el.innerHTML = `<input type="text" value="${escape(item.summary)}" />`;
      const input = el.querySelector("input");
      input.focus(); input.select();
      const finish = () => {
        const v = input.value.trim();
        if (v) item.summary = v;
        save();
        draw();
      };
      input.addEventListener("blur", finish);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); input.blur(); }
        if (e.key === "Escape") draw();
      });
    }));

    // delete
    $$("[data-del]", container).forEach(el => el.addEventListener("click", () => {
      const uid = el.parentNode.dataset.uid;
      doc.issue = (doc.issue || []).filter(x => x.uid !== uid);
      save();
      draw();
    }));

    // add
    const newInput = container.querySelector("[data-new]");
    const addBtn = container.querySelector("[data-add]");
    const addNew = () => {
      const text = newInput.value.trim();
      if (!text) return;
      const uid = "t-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
      doc.issue = doc.issue || [];
      doc.issue.push({
        "@type": "Vtodo",
        uid,
        summary: text,
        status: "open",
        created: new Date().toISOString(),
      });
      newInput.value = "";
      save();
      draw();
      setTimeout(() => container.querySelector("[data-new]")?.focus(), 0);
    };
    newInput?.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); addNew(); } });
    addBtn?.addEventListener("click", addNew);
  }
}

function taskRow(t) {
  const done = t.status === "completed";
  const uid = t.uid || "";
  return `
    <div class="task-row ${done ? "done" : ""}" data-uid="${escape(uid)}">
      <span class="check" data-check>${ICON.check}</span>
      <span class="lbl" data-lbl>${escape(t.summary || "(untitled)")}</span>
      <button class="del" data-del title="Delete">×</button>
    </div>
  `;
}
