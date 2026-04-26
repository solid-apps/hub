/**
 * Tasks app — discovers wf:Tracker registrations from solid:publicTypeIndex
 * and delegates per-tracker rendering to the registered pane.
 *
 * The app owns the chrome (page header, sidebar, status line); the
 * pane owns the per-subject UI (kanban card, edits, save). See
 * src/panes.js for the pane interface.
 */

import {
  fetchTypeIndex, findRegistrations, TRACKER_CLASS,
  getJsonLd,
} from "../pod.js";
import { findFor } from "../panes.js";
import { ICON, escape, $, $$, requireSolid } from "../ui.js";

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
    </div>`;
    $("#tasks-status").textContent = "TypeIndex not available";
    renderSidebar();
    return;
  }

  const regs = findRegistrations(typeIndex, TRACKER_CLASS).filter(r => r.instance);
  $("#tasks-status").textContent =
    `${regs.length} tracker${regs.length === 1 ? "" : "s"} discovered via TypeIndex (${shortenUrl(typeIndex.typeIndexUrl)})`;

  if (!regs.length) {
    $("#tasks-body").innerHTML = `
      <div class="card" style="color:var(--text-dim)">
        No <code>wf:Tracker</code> registrations in your TypeIndex yet.
        Create one with pilot or solidos — hub will discover and render it next time you visit Tasks.
      </div>
    `;
    renderSidebar();
    return;
  }

  trackers = await Promise.all(regs.map(async r => {
    try {
      const doc = await getJsonLd(r.instance.replace(/#.*$/, ""));
      return { url: r.instance, doc };
    } catch (e) {
      return { url: r.instance, doc: null, error: e.message };
    }
  }));

  // Empty out the body and let panes render each tracker into its own slot.
  const body = $("#tasks-body");
  body.innerHTML = "";
  for (let i = 0; i < trackers.length; i++) {
    const t = trackers[i];
    const slot = document.createElement("div");
    slot.dataset.trackerIdx = i;
    body.appendChild(slot);
    const pane = findFor({ url: t.url, doc: t.doc, forClass: TRACKER_CLASS });
    if (pane) {
      try {
        await pane.render({ url: t.url, doc: t.doc, forClass: TRACKER_CLASS }, slot, ctx);
      } catch (e) {
        slot.innerHTML = `<div class="card" style="color:var(--danger)">Pane error: ${escape(e.message)}</div>`;
      }
    } else {
      slot.innerHTML = `<div class="card" style="color:var(--text-dim)">
        No pane registered for <code>${escape(TRACKER_CLASS)}</code>.
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
