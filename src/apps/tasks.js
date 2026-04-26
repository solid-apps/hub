/**
 * Tasks app — discovers wf:Tracker registrations from solid:publicTypeIndex
 * and delegates per-tracker rendering to the registered pane.
 *
 * The app owns the chrome (page header, sidebar, status line); the
 * pane owns the per-subject UI (kanban card, edits, save). See
 * src/panes.js for the pane interface.
 */

import {
  fetchTypeIndex, findRegistrations, TRACKER_CLASS, LIST_CLASSES,
  getJsonLd, createTracker, createList,
} from "../pod.js";
import { resolveFor } from "../panes.js";
import { ICON, escape, $, $$, requireSolid, showToast } from "../ui.js";

let typeIndex = null;
let trackers = [];   // [{ url, doc, error? }]

export function sidebar(_ctx) {
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
      <div style="display:flex;gap:6px">
        <button class="btn primary" id="new-tracker-btn">${ICON.plus} Tracker</button>
        <button class="btn" id="new-list-btn">${ICON.plus} List</button>
      </div>
    </div>
    <div id="tasks-body"><div class="spinner"></div></div>
  </div></div>`;
  $("#new-tracker-btn").addEventListener("click", () => promptCreate(ctx, "tracker"));
  $("#new-list-btn").addEventListener("click", () => promptCreate(ctx, "list"));

  trackers = [];
  try {
    typeIndex = await fetchTypeIndex(ctx.auth.id);
  } catch (e) {
    $("#tasks-body").innerHTML = `<div class="card" style="color:var(--text-dim)">
      <div style="color:var(--danger);margin-bottom:8px"><strong>Couldn't read your TypeIndex.</strong></div>
      <div style="font-size:13px">${escape(e.message)}</div>
    </div>`;
    $("#tasks-status").textContent = "TypeIndex not available";
    renderSidebar();
    return;
  }

  // Discover both wf:Tracker (issue array shape) and schema:ItemList (todo
  // list shape). Each registration's forClass is preserved so resolveFor
  // picks the right pane for each one.
  const regs = typeIndex.registrations.filter(r => r.instance && (
    r.forClass === TRACKER_CLASS || LIST_CLASSES.includes(r.forClass)
  ));
  const trCount = regs.filter(r => r.forClass === TRACKER_CLASS).length;
  const lsCount = regs.filter(r => LIST_CLASSES.includes(r.forClass)).length;
  $("#tasks-status").textContent =
    `${regs.length} item${regs.length === 1 ? "" : "s"} discovered via TypeIndex` +
    (trCount && lsCount ? ` (${trCount} tracker${trCount === 1 ? "" : "s"}, ${lsCount} list${lsCount === 1 ? "" : "s"})` : "") +
    ` (${shortenUrl(typeIndex.typeIndexUrl)})`;

  if (!regs.length) {
    $("#tasks-body").innerHTML = `
      <div class="card" style="color:var(--text-dim);text-align:center;padding:32px 24px">
        <div style="font-size:15px;color:var(--text);margin-bottom:6px">No trackers or lists yet.</div>
        <div style="font-size:13px;margin-bottom:18px">Hub will create the file on your pod and register it in your TypeIndex.</div>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          <button class="btn primary" id="empty-new-tracker-btn">${ICON.plus} New tracker (kanban)</button>
          <button class="btn" id="empty-new-list-btn">${ICON.plus} New todo list</button>
        </div>
      </div>
    `;
    $("#empty-new-tracker-btn").addEventListener("click", () => promptCreate(ctx, "tracker"));
    $("#empty-new-list-btn").addEventListener("click", () => promptCreate(ctx, "list"));
    renderSidebar();
    return;
  }

  trackers = await Promise.all(regs.map(async r => {
    try {
      const doc = await getJsonLd(r.instance.replace(/#.*$/, ""));
      return { url: r.instance, doc, view: r.view, forClass: r.forClass };
    } catch (e) {
      return { url: r.instance, doc: null, error: e.message, view: r.view, forClass: r.forClass };
    }
  }));

  // Empty out the body and let panes render each tracker into its own slot.
  // Each tracker can opt into a specific external pane via urn:solid:view
  // on its TypeRegistration; otherwise the registered built-in is used.
  const body = $("#tasks-body");
  body.innerHTML = "";
  for (let i = 0; i < trackers.length; i++) {
    const t = trackers[i];
    const slot = document.createElement("div");
    slot.dataset.trackerIdx = i;
    body.appendChild(slot);
    const input = { url: t.url, doc: t.doc, forClass: t.forClass, view: t.view };
    const pane = await resolveFor(input);
    if (pane) {
      try {
        await pane.render(input, slot, ctx);
      } catch (e) {
        slot.innerHTML = `<div class="card" style="color:var(--danger)">Pane error: ${escape(e.message)}</div>`;
      }
    } else {
      slot.innerHTML = `<div class="card" style="color:var(--text-dim)">
        No pane available for <code>${escape(t.forClass || "(unknown class)")}</code>.
        ${t.view ? `<div style="margin-top:6px;font-size:12px">External view URL: <code>${escape(t.view)}</code> failed to load.</div>` : ""}
        <div style="margin-top:6px;font-size:12px;color:var(--text-faint);font-family:var(--mono);word-break:break-all">${escape(t.url)}</div>
      </div>`;
    }
  }

  renderSidebar();
}

function renderSidebar() {
  const sb = $("#tasks-sb");
  if (!sb) return;
  if (!typeIndex) {
    sb.innerHTML = `<div style="padding:14px;color:var(--text-faint);font-size:13px">No TypeIndex.</div>`;
    return;
  }
  const regs = typeIndex.registrations.filter(r => r.instance && (
    r.forClass === TRACKER_CLASS || LIST_CLASSES.includes(r.forClass)
  ));
  sb.innerHTML = `
    <div class="sb-section">
      <div class="sb-label">Discovered</div>
      ${regs.length === 0
        ? `<div style="padding:6px 18px;font-size:13px;color:var(--text-faint)">None</div>`
        : regs.map((r, i) => `
          <button class="sb-item" data-scroll="${i}" title="${escape(r.forClass)}">
            ${ICON.tasks}
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escape(labelFor(r.instance))}</span>
            <span style="margin-left:auto;font:600 9px var(--mono);letter-spacing:.06em;color:var(--text-faint);text-transform:uppercase">${r.forClass === TRACKER_CLASS ? "trk" : "list"}</span>
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

async function promptCreate(ctx, kind = "tracker") {
  const label = kind === "list" ? "Todo list" : "Tracker";
  const name = prompt(`${label} name (e.g. "Work", "Groceries"):`);
  if (!name || !name.trim()) return;
  showToast(`Creating ${label.toLowerCase()}…`);
  try {
    if (kind === "list") {
      await createList({ webid: ctx.auth.id, name: name.trim() });
    } else {
      await createTracker({ webid: ctx.auth.id, name: name.trim() });
    }
    showToast(`${label} created`, "success");
    ctx.switchApp("tasks");
  } catch (e) {
    showToast("Create failed: " + e.message, "error");
  }
}

export const meta = { name: "Tasks", icon: ICON.tasks, hasSidebar: true };
