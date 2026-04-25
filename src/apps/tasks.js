/**
 * Tasks — discovers wf:Tracker resources via the user's solid:publicTypeIndex
 * and renders one card per tracker (same convention as pilot / SolidOS
 * tracker-pane). Edits PUT back to the tracker file via xlogin.authFetch.
 *
 * Tracker shape (SolidOS convention #1):
 *   {
 *     "@context": { ..., "wf": "http://www.w3.org/2005/01/wf/flow#",
 *                        "ical": "http://www.w3.org/2002/12/cal/ical#" },
 *     "@id": "#this",
 *     "@type": "Tracker",
 *     "title": "...",
 *     "issue": [
 *       { "@type": "Vtodo", "uid": "...", "summary": "...", "status": "open"|"completed", "created": ISO }
 *     ]
 *   }
 */

import {
  fetchTypeIndex, findRegistrations, TRACKER_CLASS,
  getJsonLd, putJsonLd,
} from "../pod.js";
import { ICON, escape, showToast, renderEmpty, $, $$, debounce, requireSolid } from "../ui.js";

let typeIndex = null;       // { typeIndexUrl, registrations }
let trackers = [];          // [{ url, doc }]
let saveTimers = new Map(); // url → debounced save fn

export function sidebar(ctx) {
  return `
    <div class="sidebar-head"><h2>Tasks</h2></div>
    <div class="sidebar-body" id="tasks-sb">
      <div style="padding:14px;color:var(--text-faint);font-size:13px">Loading…</div>
    </div>
  `;
}

export async function render(container, ctx) {
  if (requireSolid(container, ctx, "Tasks discovers wf:Tracker resources from your solid:publicTypeIndex.")) return;

  container.innerHTML = `<div class="content"><div class="tasks-page" id="tasks-page">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div>
        <h2 style="margin:0;font-size:22px;letter-spacing:-.01em">Tasks</h2>
        <div id="tasks-status" style="color:var(--text-dim);font-size:13px;margin-top:4px">Discovering trackers…</div>
      </div>
    </div>
    <div id="tasks-body"><div class="spinner"></div></div>
  </div></div>`;

  trackers = [];
  try {
    typeIndex = await fetchTypeIndex(ctx.auth.id);
  } catch (e) {
    $("#tasks-body").innerHTML = `<div class="card" style="color:var(--text-dim)">
      <div style="color:var(--danger);margin-bottom:8px"><strong>Couldn't read your TypeIndex.</strong></div>
      <div style="font-size:13px">${escape(e.message)}</div>
      <div style="font-size:13px;margin-top:8px">In Settings you'll see whether your WebID points at a <code>solid:publicTypeIndex</code>. Pilot can create one for you if it's missing.</div>
    </div>`;
    $("#tasks-status").textContent = "TypeIndex not available";
    renderSidebarTrackers();
    return;
  }

  const regs = findRegistrations(typeIndex, TRACKER_CLASS).filter(r => r.instance);
  $("#tasks-status").textContent =
    `${regs.length} tracker${regs.length === 1 ? "" : "s"} discovered via TypeIndex (${shortenUrl(typeIndex.typeIndexUrl)})`;

  if (!regs.length) {
    $("#tasks-body").innerHTML = `
      <div class="card" style="color:var(--text-dim)">
        No <code>wf:Tracker</code> registrations in your TypeIndex yet.
        Create one with pilot or solidos — hub-pod will discover and render it next time you visit Tasks.
      </div>
    `;
    renderSidebarTrackers();
    return;
  }

  // Fetch all trackers in parallel
  trackers = await Promise.all(regs.map(async r => {
    try {
      const doc = await getJsonLd(r.instance.replace(/#.*$/, ""));
      return { url: r.instance, doc };
    } catch (e) {
      return { url: r.instance, doc: null, error: e.message };
    }
  }));

  drawAll();
  renderSidebarTrackers();
}

function drawAll() {
  const body = $("#tasks-body");
  if (!body) return;
  body.innerHTML = trackers.map((t, i) => trackerCardHTML(t, i)).join("");
  trackers.forEach((t, i) => wireTracker(t, i));
}

function trackerCardHTML(t, idx) {
  if (!t.doc) {
    return `<div class="tlist-card" style="border-color:rgba(239,68,68,.3)">
      <div class="tlist-head">
        <h2 style="color:var(--danger)">Failed to load tracker</h2>
      </div>
      <div style="font-size:12px;color:var(--text-faint);font-family:var(--mono);word-break:break-all">${escape(t.url)}</div>
      ${t.error ? `<div style="color:var(--danger);font-size:13px;margin-top:8px">${escape(t.error)}</div>` : ""}
    </div>`;
  }
  const items = t.doc.issue || [];
  const done = items.filter(x => x.status === "completed").length;
  const total = items.length;
  const pct = total ? Math.round(done / total * 100) : 0;
  return `
    <div class="tlist-card" data-tracker-idx="${idx}">
      <div class="tlist-head">
        <h2 contenteditable="true" data-edit-title>${escape(t.doc.title || "Untitled tracker")}</h2>
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
      <div style="margin-top:10px;font-size:11px;color:var(--text-faint);font-family:var(--mono);word-break:break-all">${escape(t.url)}</div>
    </div>
  `;
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

function wireTracker(t, idx) {
  if (!t.doc) return;
  const root = $(`[data-tracker-idx="${idx}"]`);
  if (!root) return;
  const save = scheduleSave(t.url);

  // title
  const titleEl = root.querySelector("[data-edit-title]");
  titleEl?.addEventListener("blur", () => {
    const v = titleEl.textContent.trim();
    if (v && v !== t.doc.title) { t.doc.title = v; save(); }
  });

  // toggle
  root.querySelectorAll("[data-check]").forEach(el => el.addEventListener("click", () => {
    const uid = el.parentNode.dataset.uid;
    const item = (t.doc.issue || []).find(x => x.uid === uid);
    if (!item) return;
    item.status = item.status === "completed" ? "open" : "completed";
    if (item.status === "completed") item.completed = new Date().toISOString();
    save();
    redrawTracker(t, idx);
  }));

  // edit label
  root.querySelectorAll("[data-lbl]").forEach(el => el.addEventListener("dblclick", () => {
    const uid = el.parentNode.dataset.uid;
    const item = (t.doc.issue || []).find(x => x.uid === uid);
    if (!item) return;
    el.innerHTML = `<input type="text" value="${escape(item.summary)}" />`;
    const input = el.querySelector("input");
    input.focus(); input.select();
    const finish = () => {
      const v = input.value.trim();
      if (v) item.summary = v;
      save();
      redrawTracker(t, idx);
    };
    input.addEventListener("blur", finish);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); input.blur(); }
      if (e.key === "Escape") redrawTracker(t, idx);
    });
  }));

  // delete
  root.querySelectorAll("[data-del]").forEach(el => el.addEventListener("click", () => {
    const uid = el.parentNode.dataset.uid;
    t.doc.issue = (t.doc.issue || []).filter(x => x.uid !== uid);
    save();
    redrawTracker(t, idx);
  }));

  // add
  const newInput = root.querySelector("[data-new]");
  const addBtn = root.querySelector("[data-add]");
  const addNew = () => {
    const text = newInput.value.trim();
    if (!text) return;
    const uid = "t-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
    t.doc.issue = t.doc.issue || [];
    t.doc.issue.push({
      "@type": "Vtodo",
      uid,
      summary: text,
      status: "open",
      created: new Date().toISOString(),
    });
    newInput.value = "";
    save();
    redrawTracker(t, idx);
    setTimeout(() => $(`[data-tracker-idx="${idx}"] [data-new]`)?.focus(), 0);
  };
  newInput?.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); addNew(); } });
  addBtn?.addEventListener("click", addNew);
}

function redrawTracker(t, idx) {
  const root = $(`[data-tracker-idx="${idx}"]`);
  if (!root) return;
  // Replace just this card to avoid losing focus elsewhere
  const html = trackerCardHTML(t, idx);
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  root.replaceWith(tmp.firstElementChild);
  wireTracker(t, idx);
}

function scheduleSave(url) {
  if (saveTimers.has(url)) return saveTimers.get(url);
  const fn = debounce(async () => {
    const t = trackers.find(x => x.url === url);
    if (!t || !t.doc) return;
    try {
      // Strip the fragment from the PUT URL — we PUT the document, not the subject
      await putJsonLd(url.replace(/#.*$/, ""), t.doc);
    } catch (e) {
      showToast("Save failed: " + e.message, "error");
    }
  }, 500);
  saveTimers.set(url, fn);
  return fn;
}

function renderSidebarTrackers() {
  const sb = $("#tasks-sb");
  if (!sb) return;
  if (!typeIndex) {
    sb.innerHTML = `<div style="padding:14px;color:var(--text-faint);font-size:13px">No TypeIndex.</div>`;
    return;
  }
  const regs = findRegistrations(typeIndex, TRACKER_CLASS);
  sb.innerHTML = `
    <div class="sb-section">
      <div class="sb-label">Discovered</div>
      ${regs.length === 0
        ? `<div style="padding:6px 18px;font-size:13px;color:var(--text-faint)">None</div>`
        : regs.map((r, i) => `
          <button class="sb-item" data-scroll="${i}">
            ${ICON.tasks}
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escape(labelFor(r.instance))}</span>
          </button>
        `).join("")}
    </div>
    <div class="sb-section">
      <div class="sb-label">TypeIndex</div>
      <div style="padding:6px 18px;font-size:11px;font-family:var(--mono);color:var(--text-faint);word-break:break-all">${escape(typeIndex.typeIndexUrl)}</div>
    </div>
  `;
  $$("[data-scroll]", sb).forEach(el => el.addEventListener("click", () => {
    const card = $(`[data-tracker-idx="${el.dataset.scroll}"]`);
    card?.scrollIntoView({ behavior: "smooth", block: "start" });
  }));
}

function labelFor(url) {
  if (!url) return "(no instance)";
  try {
    const stem = url.split("#")[0].split("/").pop().replace(/-data\.jsonld$/, "").replace(/\.jsonld$/, "");
    return stem || url;
  } catch { return url; }
}

function shortenUrl(u) {
  if (!u) return "";
  try {
    const x = new URL(u);
    return x.hostname + x.pathname.replace(/\/$/, "");
  } catch { return u; }
}

export const meta = { name: "Tasks", icon: ICON.tasks, hasSidebar: true };
