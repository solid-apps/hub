/**
 * Calendar — discovers calendars/events via solid:publicTypeIndex.
 *
 * forClass candidates: ical:Vcalendar, ical:Vevent, schema:Event.
 * Each registration's instanceContainer is treated as a calendar of
 * Vevent JSON-LD files; instance is treated as a single event.
 */

import {
  fetchTypeIndex, CALENDAR_CLASSES,
  listContainer, getJsonLd, putJsonLd, deleteResource,
  createCalendar,
} from "../pod.js";
import { findFor } from "../panes.js";
import { ICON, escape, showToast, renderEmpty, $, $$, requireSolid } from "../ui.js";

let typeIndex = null;
let calendars = [];   // [{ url, label, kind, events: [{url, doc}] }]
let cursor = new Date();
cursor.setDate(1);
let primaryCalendar = null; // for "create event" — the first instanceContainer
let selectedUrl = null;

export function sidebar(ctx) {
  return `
    <div class="sidebar-head">
      <h2>Calendar</h2>
      <button class="btn primary" id="cal-new" disabled>${ICON.plus}</button>
    </div>
    <div class="sidebar-body" id="cal-sb">
      <div style="padding:14px;color:var(--text-faint);font-size:13px">Loading…</div>
    </div>
  `;
}

export async function render(container, ctx) {
  if (requireSolid(container, ctx, "Calendar discovers calendars via solid:publicTypeIndex.")) return;

  container.innerHTML = `<div class="content" style="height:100%;display:flex;flex-direction:column">
    <div class="cal-toolbar">
      <div class="cal-title" id="cal-title">Loading…</div>
      <div class="cal-nav">
        <button class="icon-btn" data-nav="-1">${ICON.chevL}</button>
        <button class="icon-btn" data-nav="0" style="font-size:12px;padding:0 12px;width:auto">Today</button>
        <button class="icon-btn" data-nav="+1">${ICON.chevR}</button>
      </div>
    </div>
    <div id="cal-message" style="padding:0 24px"></div>
    <div class="cal-grid" id="cal-grid" style="flex:0 0 auto"></div>
    <div id="cal-detail" style="flex:1;overflow-y:auto"></div>
  </div>`;

  calendars = [];
  primaryCalendar = null;

  try {
    typeIndex = await fetchTypeIndex(ctx.auth.id);
  } catch (e) {
    renderTypeIndexError(e);
    return;
  }

  const regs = typeIndex.registrations.filter(r =>
    CALENDAR_CLASSES.includes(r.forClass) && (r.instance || r.instanceContainer)
  );

  if (!regs.length) {
    $("#cal-grid").innerHTML = "";
    $("#cal-message").innerHTML = `
      <div class="card" style="color:var(--text-dim);margin:18px 0;text-align:center;padding:32px 24px">
        <div style="font-size:15px;color:var(--text);margin-bottom:6px">No calendar yet.</div>
        <div style="font-size:13px;margin-bottom:18px">Hub will create a container under <code>/hub/calendar/</code> on your pod and register it as an <code>ical:Vcalendar</code> instance container in your TypeIndex.</div>
        <button class="btn primary" id="empty-new-cal-btn">${ICON.plus} Create your first calendar</button>
        <div style="margin-top:18px;font-size:12px;color:var(--text-faint)">Or add a TypeRegistration manually with one of: ${CALENDAR_CLASSES.map(c => `<code>${escape(c)}</code>`).join(", ")}</div>
      </div>
    `;
    $("#empty-new-cal-btn").addEventListener("click", () => promptCreateCalendar(ctx));
    renderSidebar([]);
    return;
  }

  calendars = await Promise.all(regs.map(resolveCalendar));
  primaryCalendar = calendars.find(c => c.kind === "container") || null;

  drawGrid();
  renderSidebar(calendars);

  $$("[data-nav]").forEach(el => el.addEventListener("click", () => {
    const n = parseInt(el.dataset.nav);
    if (n === 0) cursor = new Date();
    else cursor.setMonth(cursor.getMonth() + n);
    cursor.setDate(1);
    drawGrid();
  }));
  if (primaryCalendar) {
    $("#cal-new")?.removeAttribute("disabled");
    $("#cal-new")?.addEventListener("click", () => newEventOnDay(isoDay(new Date())));
  }
}

async function resolveCalendar(reg) {
  if (reg.instanceContainer) {
    try {
      const items = await listContainer(reg.instanceContainer);
      const events = (await Promise.all(items
        .filter(it => it.type === "resource" && /\.jsonld$/.test(it.url))
        .map(async it => {
          try { const doc = await getJsonLd(it.url); return doc?.dtstart ? { url: it.url, doc } : null; }
          catch { return null; }
        })
      )).filter(Boolean);
      return {
        url: reg.instanceContainer,
        label: shortLabel(reg.instanceContainer, "container"),
        kind: "container",
        events,
      };
    } catch (e) {
      return { url: reg.instanceContainer, label: shortLabel(reg.instanceContainer, "container"), kind: "container", events: [], error: e.message };
    }
  }
  // instance: single event
  try {
    const doc = await getJsonLd(reg.instance.replace(/#.*$/, ""));
    return {
      url: reg.instance,
      label: shortLabel(reg.instance, "instance"),
      kind: "instance",
      events: doc?.dtstart ? [{ url: reg.instance, doc }] : [],
    };
  } catch (e) {
    return { url: reg.instance, label: shortLabel(reg.instance, "instance"), kind: "instance", events: [], error: e.message };
  }
}

function drawGrid() {
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  $("#cal-title").textContent = `${monthNames[cursor.getMonth()]} ${cursor.getFullYear()}`;

  const grid = $("#cal-grid");
  if (!grid) return;

  const allEvents = calendars.flatMap(c => c.events);

  const daysHtml = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => `<div class="cal-dow">${d}</div>`).join("");
  const first = new Date(cursor);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(start.getDate() - offset);

  const today = new Date();
  const todayKey = isoDay(today);
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dKey = isoDay(d);
    const inMonth = d.getMonth() === cursor.getMonth();
    const dayEvents = allEvents.filter(e => {
      try { return isoDay(new Date(e.doc.dtstart)) === dKey; } catch { return false; }
    });
    cells.push(`
      <div class="cal-day ${inMonth ? "" : "other"} ${dKey === todayKey ? "today" : ""}" data-day="${dKey}">
        <div class="num">${d.getDate()}</div>
        ${dayEvents.slice(0, 3).map(e => `
          <div class="cal-event" data-url="${escape(e.url)}">${escape(e.doc.summary || "(event)")}</div>
        `).join("")}
        ${dayEvents.length > 3 ? `<div style="font-size:10px;color:var(--text-faint)">+${dayEvents.length - 3} more</div>` : ""}
      </div>
    `);
  }
  grid.innerHTML = daysHtml + cells.join("");

  $$(".cal-event[data-url]").forEach(el => el.addEventListener("click", (e) => {
    e.stopPropagation();
    const ev = allEvents.find(x => x.url === el.dataset.url);
    if (ev) showEventDetails(ev);
  }));

  // If a detail was open for an event we still have, re-render it
  if (selectedUrl) {
    const ev = allEvents.find(x => x.url === selectedUrl);
    if (ev) showEventDetails(ev);
    else { selectedUrl = null; $("#cal-detail") && ($("#cal-detail").innerHTML = ""); }
  }
  $$(".cal-day[data-day]").forEach(el => el.addEventListener("click", () => {
    if (primaryCalendar) newEventOnDay(el.dataset.day);
    else showToast("Register an instanceContainer calendar to add events", "error");
  }));
}

function renderSidebar(cals) {
  const sb = $("#cal-sb");
  if (!sb) return;
  if (!typeIndex) return;
  const allEvents = cals.flatMap(c => c.events);
  const upcoming = allEvents
    .filter(e => new Date(e.doc.dtstart) >= new Date())
    .sort((a, b) => a.doc.dtstart.localeCompare(b.doc.dtstart))
    .slice(0, 6);
  sb.innerHTML = `
    <div class="sb-section">
      <div class="sb-label">Calendars</div>
      ${cals.length === 0
        ? `<div style="padding:6px 18px;font-size:13px;color:var(--text-faint)">None registered</div>`
        : cals.map(c => `
          <button class="sb-item" disabled style="opacity:1">
            ${ICON.calendar}
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escape(c.label)}</span>
            <span class="count">${c.events.length}</span>
          </button>
        `).join("")}
    </div>
    ${upcoming.length ? `
      <div class="sb-section">
        <div class="sb-label">Upcoming</div>
        ${upcoming.map(e => {
          const d = new Date(e.doc.dtstart);
          return `<div style="padding:8px 18px;border-bottom:1px solid var(--line);font-size:13px">
            <div style="font-weight:500">${escape(e.doc.summary || "(event)")}</div>
            <div style="color:var(--text-faint);font-size:11px;font-family:var(--mono);margin-top:2px">${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
          </div>`;
        }).join("")}
      </div>
    ` : ""}
    <div class="sb-section">
      <div class="sb-label">TypeIndex</div>
      <div style="padding:6px 18px;font-size:11px;font-family:var(--mono);color:var(--text-faint);word-break:break-all">${escape(typeIndex.typeIndexUrl)}</div>
    </div>
  `;
}

function isoDay(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

async function newEventOnDay(dayKey) {
  if (!primaryCalendar) {
    showToast("No instanceContainer calendar registered", "error");
    return;
  }
  const summary = prompt("Event title:");
  if (!summary) return;
  const time = prompt("Time (HH:MM, 24-hour):", "09:00") || "09:00";
  const dtstart = `${dayKey}T${time}:00`;
  const id = "ev-" + Date.now();
  const url = primaryCalendar.url.replace(/\/?$/, "/") + id + ".jsonld";
  const doc = {
    "@context": { "@vocab": "http://www.w3.org/2002/12/cal/ical#" },
    "@id": url,
    "@type": "Vevent",
    "summary": summary,
    "dtstart": dtstart,
  };
  try {
    await putJsonLd(url, doc);
    primaryCalendar.events.push({ url, doc });
    showToast("Event created", "success");
    drawGrid();
    renderSidebar(calendars);
  } catch (e) {
    showToast("Failed to create event: " + e.message, "error");
  }
}

function showEventDetails(ev) {
  selectedUrl = ev.url;
  const detail = $("#cal-detail");
  if (!detail) return;
  const pane = findFor({ url: ev.url, doc: ev.doc, forClass: "http://www.w3.org/2002/12/cal/ical#Vevent" });
  if (!pane) {
    const d = new Date(ev.doc.dtstart);
    detail.innerHTML = `<div class="card" style="margin:18px 24px">${escape(ev.doc.summary)} · ${d.toLocaleString("en-GB")}</div>`;
    return;
  }
  pane.render({
    url: ev.url, doc: ev.doc,
    forClass: "http://www.w3.org/2002/12/cal/ical#Vevent",
    onChange: () => { drawGrid(); renderSidebar(calendars); },
    onDelete: () => {
      for (const c of calendars) c.events = c.events.filter(x => x.url !== ev.url);
      selectedUrl = null;
      detail.innerHTML = "";
      drawGrid();
      renderSidebar(calendars);
    },
  }, detail);
}

function shortLabel(url, kind) {
  if (!url) return "(unknown)";
  try {
    if (kind === "container") {
      const parts = url.replace(/\/$/, "").split("/");
      return decodeURIComponent(parts[parts.length - 1] || url);
    }
    return url.split("#")[0].split("/").pop()
      .replace(/-data\.jsonld$/, "")
      .replace(/\.jsonld$/, "");
  } catch { return url; }
}

function renderTypeIndexError(e) {
  $("#cal-message").innerHTML = `<div class="card" style="color:var(--text-dim);margin-top:18px">
    <div style="color:var(--danger)"><strong>Couldn't read TypeIndex</strong></div>
    <div style="margin-top:8px;font-size:13px">${escape(e.message)}</div>
  </div>`;
  $("#cal-grid").innerHTML = "";
  const sb = $("#cal-sb");
  if (sb) sb.innerHTML = `<div style="padding:14px;color:var(--text-faint);font-size:13px">${escape(e.message)}</div>`;
}

async function promptCreateCalendar(ctx) {
  const name = prompt("Calendar name (e.g. \"Personal\", \"Work\"):");
  if (!name || !name.trim()) return;
  showToast("Creating calendar…");
  try {
    await createCalendar({ webid: ctx.auth.id, name: name.trim() });
    showToast("Calendar created", "success");
    ctx.switchApp("calendar");
  } catch (e) {
    showToast("Create failed: " + e.message, "error");
  }
}

export const meta = { id: "calendar", name: "Calendar", icon: ICON.calendar, hasSidebar: true };
