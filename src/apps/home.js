/**
 * Home — dashboard pulling recent items from across apps.
 *
 * No persistent state of its own. Reads:
 *   - WebID profile (for greeting)
 *   - Recent notes from /hub/notes/
 *   - Open tasks from /hub/tasks/list.jsonld
 *   - Upcoming events from /hub/calendar/
 */

import { fetchWebIdProfile, listContainer, getJsonLd, hubRoot, discoverStorage } from "../pod.js";
import { ICON, escape, fmtRel, $, $$, avatarHTML } from "../ui.js";

export async function render(container, ctx) {
  if (ctx.auth.type !== "solid") {
    const isNostr = ctx.auth.type === "nostr";
    container.innerHTML = `
      <div class="content"><div class="page-pad">
        <h1>Welcome to <span style="background:linear-gradient(135deg,var(--accent),var(--accent-2));-webkit-background-clip:text;background-clip:text;color:transparent">hub-pod</span></h1>
        <p class="lede">A multi-app workspace backed by your Solid pod. Profile, Files, Calendar, Contacts, Notes, Tasks, Photos — all stored as JSON-LD on a pod you own.</p>

        <div class="login-banner">
          <div class="ico">${ICON.user}</div>
          <div class="info">
            <strong>${isNostr ? "Signed in via Nostr — Solid required" : "Sign in to get started."}</strong>
            <span>${isNostr
              ? "hub-pod stores its data on a Solid pod. Click the floating Login button, log out, then sign in again on the Solid tab."
              : "Click the floating Login button (bottom-right). xlogin handles Solid OIDC for you — pick your provider and you're in."}</span>
          </div>
        </div>

        <div class="widgets" style="margin-top:14px">
          ${["profile","files","calendar","contacts","notes","tasks","photos"].map(id => `
            <div class="widget w-4">
              <h3>${appIcon(id)} ${capitalize(id)}</h3>
              <div style="color:var(--text-dim);font-size:13px">${appBlurb(id)}</div>
            </div>
          `).join("")}
        </div>
      </div></div>
    `;
    return;
  }

  container.innerHTML = `<div class="content"><div class="page-pad" id="home-page">
    <div class="spinner"></div>
  </div></div>`;
  const page = $("#home-page");

  let profile = null;
  let storage = null;
  try {
    profile = await fetchWebIdProfile(ctx.auth.id);
    storage = await discoverStorage(ctx.auth.id);
  } catch (e) {
    profile = null;
  }

  const greeting = greetingHour();
  const name = profile?.name?.split(" ")?.[0] || "there";

  page.innerHTML = `
    <h1>${escape(greeting)}, <span style="background:linear-gradient(135deg,var(--accent),var(--accent-2));-webkit-background-clip:text;background-clip:text;color:transparent">${escape(name)}</span></h1>
    <p class="lede">Your pod is at <code style="color:var(--accent)">${escape(storage || "(unknown)")}</code></p>

    <div class="widgets">
      <div class="widget w-6">
        <h3>${ICON.tasks} Open tasks <a class="more" data-go="tasks">All →</a></h3>
        <div id="home-tasks"><div class="spinner"></div></div>
      </div>

      <div class="widget w-6">
        <h3>${ICON.calendar} Upcoming events <a class="more" data-go="calendar">Calendar →</a></h3>
        <div id="home-events"><div class="spinner"></div></div>
      </div>

      <div class="widget w-12">
        <h3>${ICON.notes} Recent notes <a class="more" data-go="notes">All →</a></h3>
        <div id="home-notes"><div class="spinner"></div></div>
      </div>

      <div class="widget w-6">
        <h3>${ICON.user} Profile <a class="more" data-go="profile">Edit →</a></h3>
        <div style="display:flex;gap:14px;align-items:center">
          ${avatarHTML(profile, "")}
          <div>
            <div style="font-weight:500">${escape(profile?.name || "(no name yet)")}</div>
            <div style="color:var(--text-dim);font-size:13px">${escape(profile?.email || profile?.nick || "")}</div>
            <div style="color:var(--text-faint);font-family:var(--mono);font-size:11px;margin-top:4px;word-break:break-all">${escape(ctx.auth.id)}</div>
          </div>
        </div>
      </div>

      <div class="widget w-6">
        <h3>${ICON.files} Pod stats <a class="more" data-go="files">Browse →</a></h3>
        <div id="home-pod" style="display:flex;flex-direction:column;gap:8px">
          <div style="color:var(--text-dim);font-size:13px">Pod root: <code style="color:var(--text)">${escape(storage || "")}</code></div>
          <div id="home-pod-stats" style="color:var(--text-faint);font-size:13px">Counting…</div>
        </div>
      </div>
    </div>
  `;

  $$("[data-go]").forEach(el => el.addEventListener("click", () => ctx.switchApp(el.dataset.go)));

  loadHomeTasks(storage);
  loadHomeEvents(storage);
  loadHomeNotes(storage);
  loadHomeStats(storage);
}

async function loadHomeTasks(storage) {
  if (!storage) return;
  try {
    const url = hubRoot(storage) + "tasks/list.jsonld";
    const doc = await getJsonLd(url);
    const open = (doc?.issue || []).filter(t => t.status !== "completed");
    const list = $("#home-tasks");
    if (!list) return;
    if (!open.length) {
      list.innerHTML = `<div style="color:var(--text-faint);font-size:13px">Inbox zero. 🎯</div>`;
      return;
    }
    list.innerHTML = open.slice(0, 5).map(t => `
      <div style="display:flex;align-items:center;gap:10px;padding:6px 0;font-size:14px">
        <span style="width:14px;height:14px;border:2px solid var(--text-faint);border-radius:4px;flex-shrink:0"></span>
        <span>${escape(t.summary)}</span>
      </div>
    `).join("");
  } catch {
    $("#home-tasks").innerHTML = `<div style="color:var(--text-faint);font-size:13px">No tasks list yet.</div>`;
  }
}

async function loadHomeEvents(storage) {
  if (!storage) return;
  try {
    const dir = hubRoot(storage) + "calendar/";
    const items = await listContainer(dir);
    const docs = await Promise.all(items
      .filter(m => m.type === "resource" && /\.jsonld$/.test(m.url))
      .map(m => getJsonLd(m.url).catch(() => null))
    );
    const now = new Date();
    const upcoming = docs.filter(Boolean)
      .filter(d => d.dtstart && new Date(d.dtstart) >= now)
      .sort((a, b) => a.dtstart.localeCompare(b.dtstart))
      .slice(0, 4);
    const list = $("#home-events");
    if (!list) return;
    if (!upcoming.length) {
      list.innerHTML = `<div style="color:var(--text-faint);font-size:13px">Nothing scheduled.</div>`;
      return;
    }
    list.innerHTML = upcoming.map(d => {
      const dt = new Date(d.dtstart);
      return `<div style="display:flex;gap:10px;padding:6px 0;font-size:14px;align-items:baseline">
        <span style="font-family:var(--mono);font-size:12px;color:var(--text-dim);min-width:88px">${dt.toLocaleDateString("en-GB",{day:"numeric",month:"short"})} ${dt.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</span>
        <span>${escape(d.summary || "(event)")}</span>
      </div>`;
    }).join("");
  } catch {
    $("#home-events").innerHTML = `<div style="color:var(--text-faint);font-size:13px">No events yet.</div>`;
  }
}

async function loadHomeNotes(storage) {
  if (!storage) return;
  try {
    const dir = hubRoot(storage) + "notes/";
    const items = await listContainer(dir);
    const docs = await Promise.all(items
      .filter(m => m.type === "resource" && /\.jsonld$/.test(m.url))
      .map(async m => ({ url: m.url, doc: await getJsonLd(m.url).catch(() => null) }))
    );
    const recent = docs.filter(x => x.doc).sort((a, b) =>
      (b.doc.datePublished || "").localeCompare(a.doc.datePublished || "")
    ).slice(0, 3);
    const list = $("#home-notes");
    if (!list) return;
    if (!recent.length) {
      list.innerHTML = `<div style="color:var(--text-faint);font-size:13px">No notes yet.</div>`;
      return;
    }
    list.innerHTML = recent.map(x => `
      <div style="padding:10px 12px;background:var(--bg-elev-2);border-radius:8px;margin-bottom:6px">
        <div style="font-weight:500;font-size:14px">${escape(x.doc.headline || "(untitled)")}</div>
        <div style="color:var(--text-dim);font-size:12px;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escape((x.doc.text || "").replace(/[\n#*`>]/g, " ").slice(0, 140))}</div>
        <div style="color:var(--text-faint);font-size:11px;font-family:var(--mono);margin-top:6px">${escape(fmtRel(x.doc.datePublished))}</div>
      </div>
    `).join("");
  } catch {
    $("#home-notes").innerHTML = `<div style="color:var(--text-faint);font-size:13px">No notes yet.</div>`;
  }
}

async function loadHomeStats(storage) {
  if (!storage) return;
  try {
    const root = hubRoot(storage);
    const [notes, tasks, events, photos] = await Promise.all([
      listContainer(root + "notes/").then(items => items.filter(i => i.type === "resource").length).catch(() => 0),
      getJsonLd(root + "tasks/list.jsonld").then(d => (d?.issue || []).length).catch(() => 0),
      listContainer(root + "calendar/").then(items => items.filter(i => i.type === "resource").length).catch(() => 0),
      listContainer(root + "photos/").then(items => items.filter(i => i.type === "resource").length).catch(() => 0),
    ]);
    const el = $("#home-pod-stats");
    if (el) el.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
        <div><div style="font-size:18px;font-weight:600;color:var(--text)">${notes}</div><div style="color:var(--text-faint);font-size:11px;text-transform:uppercase;letter-spacing:.06em">notes</div></div>
        <div><div style="font-size:18px;font-weight:600;color:var(--text)">${tasks}</div><div style="color:var(--text-faint);font-size:11px;text-transform:uppercase;letter-spacing:.06em">tasks</div></div>
        <div><div style="font-size:18px;font-weight:600;color:var(--text)">${events}</div><div style="color:var(--text-faint);font-size:11px;text-transform:uppercase;letter-spacing:.06em">events</div></div>
        <div><div style="font-size:18px;font-weight:600;color:var(--text)">${photos}</div><div style="color:var(--text-faint);font-size:11px;text-transform:uppercase;letter-spacing:.06em">photos</div></div>
      </div>`;
  } catch {
    $("#home-pod-stats").innerHTML = `<div style="color:var(--text-faint)">No stats available.</div>`;
  }
}

function greetingHour() {
  const h = new Date().getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function appIcon(id) {
  return ICON[id === "profile" ? "user" : id] || ICON.home;
}
function capitalize(s) { return s[0].toUpperCase() + s.slice(1); }
function appBlurb(id) {
  return ({
    profile: "Read and edit your WebID profile in place.",
    files: "Browse the LDP containers under your pod's storage root.",
    calendar: "iCal-style events stored as JSON-LD.",
    contacts: "FOAF friends, resolved live from their WebIDs.",
    notes: "Markdown notes, one resource per note.",
    tasks: "Kanban tracker — same shape as SolidOS' tracker-pane.",
    photos: "A gallery rendered straight from your pod.",
  })[id] || "";
}

export const meta = { name: "Home", icon: ICON.home, hasSidebar: false };
