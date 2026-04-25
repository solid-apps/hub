/**
 * Calendar — read+create events on the pod.
 *
 * Container: <pod>/hub/calendar/
 * Each event: <pod>/hub/calendar/<id>.jsonld
 *   {
 *     "@context": { "@vocab": "http://www.w3.org/2002/12/cal/ical#" },
 *     "@id": "...",
 *     "@type": "Vevent",
 *     "summary": "...",
 *     "dtstart": ISO,
 *     "dtend": ISO (optional),
 *     "location": "..."
 *   }
 */

import { listContainer, getJsonLd, putJsonLd, ensureContainer, hubRoot, discoverStorage } from "../pod.js";
import { ICON, escape, fmtRel, showToast, renderSpinner, renderEmpty, $, $$, requireSolid } from "../ui.js";

let dir = null;
let events = [];
let cursor = new Date();   // anchor month
cursor.setDate(1);

export function sidebar(ctx) {
  return `
    <div class="sidebar-head"><h2>Calendar</h2><button class="btn primary" id="cal-new">${ICON.plus}</button></div>
    <div class="sidebar-body">
      <div class="sb-section">
        <div class="sb-label">Upcoming</div>
        <div id="cal-upcoming" style="padding:0 6px">
          <div style="padding:14px 12px;color:var(--text-faint);font-size:13px">Loading…</div>
        </div>
      </div>
    </div>
  `;
}

export async function render(container, ctx) {
  if (requireSolid(container, ctx, "Events are stored as iCal-vocabulary JSON-LD in /hub/calendar/ on your pod.")) return;
  container.innerHTML = `<div class="content" style="height:100%;display:flex;flex-direction:column">
    <div class="cal-toolbar">
      <div class="cal-title" id="cal-title">Loading…</div>
      <div class="cal-nav">
        <button class="icon-btn" data-nav="-1">${ICON.chevL}</button>
        <button class="icon-btn" data-nav="0" style="font-size:12px;padding:0 12px;width:auto">Today</button>
        <button class="icon-btn" data-nav="+1">${ICON.chevR}</button>
      </div>
    </div>
    <div class="cal-grid" id="cal-grid" style="flex:1"></div>
  </div>`;

  const storage = await discoverStorage(ctx.auth.id).catch(() => null);
  if (!storage) { showToast("Couldn't find pod root", "error"); return; }
  dir = hubRoot(storage) + "calendar/";
  await ensureContainer(dir).catch(() => {});

  await loadEvents();
  drawGrid();

  $$("[data-nav]").forEach(el => el.addEventListener("click", () => {
    const n = parseInt(el.dataset.nav);
    if (n === 0) cursor = new Date();
    else cursor.setMonth(cursor.getMonth() + n);
    cursor.setDate(1);
    drawGrid();
  }));
  $("#cal-new")?.addEventListener("click", newEvent);
}

async function loadEvents() {
  events = [];
  try {
    const members = await listContainer(dir);
    await Promise.all(members
      .filter(m => m.type === "resource" && /\.jsonld$/.test(m.url))
      .map(async m => {
        try {
          const doc = await getJsonLd(m.url);
          if (doc) events.push({ url: m.url, doc });
        } catch {}
      }));
  } catch {}
  updateUpcoming();
}

function updateUpcoming() {
  const list = $("#cal-upcoming");
  if (!list) return;
  const now = new Date();
  const upcoming = events
    .filter(e => new Date(e.doc.dtstart) >= now)
    .sort((a, b) => a.doc.dtstart.localeCompare(b.doc.dtstart))
    .slice(0, 6);
  if (!upcoming.length) {
    list.innerHTML = `<div style="padding:14px 12px;color:var(--text-faint);font-size:13px">No upcoming events.</div>`;
    return;
  }
  list.innerHTML = upcoming.map(e => {
    const d = new Date(e.doc.dtstart);
    return `<div style="padding:8px 12px;border-bottom:1px solid var(--line);font-size:13px">
      <div style="font-weight:500">${escape(e.doc.summary || "(untitled)")}</div>
      <div style="color:var(--text-faint);font-size:11px;font-family:var(--mono);margin-top:2px">${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
    </div>`;
  }).join("");
}

function drawGrid() {
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const grid = $("#cal-grid");
  if (!grid) return;
  $("#cal-title").textContent = `${monthNames[cursor.getMonth()]} ${cursor.getFullYear()}`;

  const daysHtml = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => `<div class="cal-dow">${d}</div>`).join("");

  // 6-week grid starting on Monday
  const first = new Date(cursor);
  const offset = (first.getDay() + 6) % 7; // Mon = 0
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
    const dayEvents = events.filter(e => {
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
    const ev = events.find(x => x.url === el.dataset.url);
    if (ev) showEventModal(ev);
  }));
  $$(".cal-day[data-day]").forEach(el => el.addEventListener("click", () => {
    newEventOnDay(el.dataset.day);
  }));
}

function isoDay(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

async function newEvent() {
  newEventOnDay(isoDay(new Date()));
}

async function newEventOnDay(dayKey) {
  const summary = prompt("Event title:");
  if (!summary) return;
  const time = prompt("Time (HH:MM, 24-hour):", "09:00") || "09:00";
  const dtstart = `${dayKey}T${time}:00`;
  const id = "ev-" + Date.now();
  const url = dir + id + ".jsonld";
  const doc = {
    "@context": { "@vocab": "http://www.w3.org/2002/12/cal/ical#" },
    "@id": url,
    "@type": "Vevent",
    "summary": summary,
    "dtstart": dtstart,
  };
  try {
    await putJsonLd(url, doc);
    events.push({ url, doc });
    showToast("Event created", "success");
    drawGrid();
    updateUpcoming();
  } catch (e) {
    showToast("Failed to create event: " + e.message, "error");
  }
}

function showEventModal(ev) {
  const d = new Date(ev.doc.dtstart);
  showToast(`${ev.doc.summary} · ${d.toLocaleString("en-GB")}`);
}

function loginPrompt() {
  return `<div class="content"><div class="page-pad">
    <div class="login-banner">
      <div class="ico">${ICON.calendar}</div>
      <div class="info"><strong>Sign in to your pod</strong><span>Events are stored as iCal-vocabulary JSON-LD on your pod.</span></div>
    </div>
  </div></div>`;
}

export const meta = { name: "Calendar", icon: ICON.calendar, hasSidebar: true };
